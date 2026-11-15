import { readFile } from "node:fs/promises";
import path from "node:path";

import { DEMOS } from "@/lib/demos";
import { type OmniInput, planOmni } from "@/lib/server/omni";
import { comboId, readManifest, startPrerender } from "@/lib/server/prerender";
import { CARS, HOMES, PRODUCTS, SITE, STAYS, STORIES } from "@/lib/shop";

// Server-side warm-up: replay every directed story exactly as the extension + web app would
// (same URLs, history, wardrobe, and the presenter's exact photo) so plans + stills are cached.

type Step = { story: string; label: string; planId?: string; status: string };
let state: { running: boolean; startedAt?: string; steps: Step[] } = { running: false, steps: [] };

const dataUrl = async (src: string) =>
  `data:image/jpeg;base64,${(await readFile(path.join(process.cwd(), "public", src))).toString("base64")}`;

function pageFor(href: string) {
  const url = SITE + href;
  const id = href.split("/").pop()!;
  const p = PRODUCTS.find((x) => href === `/shop/p/${x.id}`);
  if (p) return { url, title: `${p.name} | ${p.brand}`, siteName: p.brand, price: `${p.price} USD`, jsonLdTypes: ["Product", "Brand", "Offer"], vertical: "apparel", text: p.description, image: p.image };
  const t = STAYS.find((x) => href === `/shop/stay/${x.id}`);
  if (t) return { url, title: `${t.name} | ${t.brand}`, siteName: t.brand, price: null, jsonLdTypes: [t.id === "powder-peak" ? "SkiResort" : "TouristDestination"], vertical: "travel", text: t.description, image: t.image };
  const h = HOMES.find((x) => href === `/shop/homes/${x.id}`);
  if (h) return { url, title: `${h.name} | ${h.brand}`, siteName: h.brand, price: `${h.price} USD`, jsonLdTypes: ["RealEstateListing", "Apartment"], vertical: "real_estate", text: h.description, image: h.image };
  const c = CARS.find((x) => x.id === id);
  if (c) return { url, title: `${c.name} | Northline Motors`, siteName: "Northline Motors", price: `${c.price} USD`, jsonLdTypes: ["Car", "Brand", "Offer"], vertical: "auto", text: `${c.description} ${c.specs.join(", ")}.`, image: c.image };
  return { url, title: "New SUVs, Trucks & EVs | Northline Motors", siteName: "Northline Motors", price: null, jsonLdTypes: ["ItemList"], vertical: "auto", text: "", image: CARS[0].image };
}

export const warmStatus = () => state;

/** Every preset (subject x single option) of every static demo. */
function presetCombos() {
  return DEMOS.flatMap((d) =>
    d.subjects.flatMap((subj) =>
      (d.options.length ? d.options.map((o) => [o.id]) : [[]]).map((optionIds) => ({
        demo: d,
        id: comboId(d.id, subj.id, optionIds),
        label: `${subj.label} · ${optionIds.map((o) => d.options.find((x) => x.id === o)?.label ?? o).join(" + ") || "as-is"}`,
        sel: { subjectId: subj.id, optionIds },
      })),
    ),
  );
}

export function startWarm(userPhoto: string | null, storyIds?: string[]) {
  if (state.running) return state;
  const stories = STORIES.filter((s) => !storyIds?.length || storyIds.includes(s.id));
  state = {
    running: true,
    startedAt: new Date().toISOString(),
    steps: [
      ...presetCombos().map((c) => ({ story: c.demo.id, label: c.label, planId: c.id, status: "queued" })),
      ...stories.flatMap((s) => s.steps.map((x) => ({ story: s.id, label: x.label, status: "queued" }))),
    ],
  };
  void (async () => {
    // static demos: every preset combination (queued behind the image-generation concurrency cap)
    for (const c of presetCombos()) {
      startPrerender(c.id, c.demo, c.sel);
      state.steps.find((x) => x.planId === c.id)!.status = "rendering";
    }
    // stories, one stop at a time (each plan depends on the previous stops)
    await Promise.all(
      stories.map(async (story) => {
        const history: OmniInput["history"] = [];
        const historyImages: (OmniInput["historyImages"][number] & { vertical: string })[] = [];
        let wardrobe: OmniInput["wardrobe"] = [];
        for (const [i, stepDef] of story.steps.entries()) {
          const pg = pageFor(stepDef.href);
          const url = `${pg.url}?story=${story.id}`;
          const page = { url, title: pg.title, siteName: pg.siteName, price: pg.price, jsonLdTypes: pg.jsonLdTypes, keywords: [], vertical: pg.vertical, text: pg.text };
          {
            // Follow mode sends EVERY page (not just "Try" stops), so warm them all.
            const step = state.steps.find((x) => x.story === story.id && x.label === stepDef.label)!;
            step.status = "planning";
            try {
              const newest = (v: string, n: number) => historyImages.filter((h) => h.vertical === v && h.url !== url).slice(0, n);
              const r = await planOmni({
                page,
                images: [{ dataUrl: await dataUrl(pg.image) }],
                history: [...history],
                historyImages: [...newest("apparel", 2), ...newest("travel", 1), ...newest("real_estate", 1)],
                wardrobe,
                userPhoto,
              });
              step.planId = r.id;
              step.status = "rendering";
              startPrerender(r.id, r.demo);
              if (r.summary.vertical === "apparel") {
                wardrobe = [{ dataUrl: await dataUrl(pg.image), label: r.summary.productName.slice(0, 40), description: r.demo.options[0]?.text }, ...wardrobe].slice(0, 4);
              }
            } catch (err) {
              step.status = `error: ${err instanceof Error ? err.message.slice(0, 120) : String(err)}`;
            }
          }
          history.unshift({ url, title: pg.title, vertical: pg.vertical, keywords: [], price: pg.price, ts: i });
          historyImages.unshift({ dataUrl: await dataUrl(pg.image), title: pg.title, url, vertical: pg.vertical });
        }
      }),
    );
    // wait for renders to finish (poll manifests)
    for (let i = 0; i < 480; i++) {
      for (const st of state.steps) {
        if (!st.planId || st.status.startsWith("error")) continue;
        const m = await readManifest(st.planId);
        if (m) st.status = m.status === "done" ? "done" : m.status === "running" ? `rendering ${Object.keys(m.shots).length}/${m.total}` : m.status;
      }
      if (state.steps.every((s) => s.status === "done" || s.status.startsWith("error") || s.status === "needs-photo")) break;
      await new Promise((r) => setTimeout(r, 5000));
    }
    state.running = false;
  })();
  return state;
}
