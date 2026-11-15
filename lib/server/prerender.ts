import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Demo } from "@/lib/demos";
import { CACHE_DIR } from "@/lib/server/cache";
import { getOmniAsset } from "@/lib/server/omni";
import { profile } from "@/lib/server/profile";
import { sceneControls } from "@/lib/server/controls";
import { type Asset, renderHero, renderShot, writeOpening } from "@/lib/server/render";

// Background pre-rendering of a demo's hero still + every shot (and their Orbis opening prompts),
// persisted under CACHE_DIR/prerender/<id>/ so the studio can show them instantly.

export type Manifest = {
  id: string;
  status: "running" | "done" | "error" | "needs-photo";
  startedAt: string;
  finishedAt?: string;
  subjectId?: string;
  optionIds: string[];
  hero?: { file: string; model: string; prompt?: string };
  shots: Record<string, { file: string; model: string; cutPrompt?: string }>;
  total: number;
  errors: string[];
};

const jobs = new Map<string, Promise<void>>();
const safe = (id: string) => id.replace(/[^a-zA-Z0-9~+_-]/g, "").slice(0, 160);

/** Prerender id for a static demo selection: "<demo>~<subject>~<opt+opt>" (Lifecast plans use the plan id). */
export const comboId = (demoId: string, subjectId: string, optionIds: string[]) => `${demoId}~${subjectId}~${[...optionIds].sort().join("+")}`;
export function parseCombo(id: string) {
  const [demoId, subjectId, opts] = id.split("~");
  return opts === undefined ? null : { demoId, subjectId, optionIds: opts ? opts.split("+") : [] };
}
export const prerenderDir = (id: string) => path.join(CACHE_DIR, "prerender", safe(id));

export async function readManifest(id: string): Promise<Manifest | null> {
  try {
    return JSON.parse(await readFile(path.join(prerenderDir(id), "manifest.json"), "utf8")) as Manifest;
  } catch {
    return null;
  }
}

async function writeManifest(m: Manifest) {
  const dir = prerenderDir(m.id);
  await mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `manifest.${process.pid}.tmp`);
  await writeFile(tmp, JSON.stringify(m, null, 1));
  await rename(tmp, path.join(dir, "manifest.json"));
}

/** Load an image referenced by a demo src: static /assets/* or Lifecast plan assets. */
async function loadSrc(src: string): Promise<Asset | null> {
  const m = /^\/api\/omni\/asset\/([^/]+)\/(\d+)$/.exec(src);
  if (m) return getOmniAsset(m[1], Number(m[2])) ?? null;
  if (src === "/api/presenter-photo") {
    const buf = await readFile(path.join(CACHE_DIR, "presenter.jpg")).catch(() => null);
    return buf ? { buf, mime: "image/jpeg" } : null;
  }
  if (src.startsWith("/assets/") && !src.includes("..")) {
    const buf = await readFile(path.join(process.cwd(), "public", src)).catch(() => null);
    return buf ? { buf, mime: src.endsWith(".png") ? "image/png" : "image/jpeg" } : null;
  }
  return null;
}

export const isRunning = (id: string) => jobs.has(id);

/** Start (or resume) pre-rendering; no-op if already running or done. */
export function startPrerender(id: string, demo: Demo, sel?: { subjectId: string; optionIds: string[] }) {
  if (jobs.has(id)) return;
  const job = run(id, demo, sel)
    .catch((err) => console.error(`prerender ${id} failed`, err))
    .finally(() => jobs.delete(id));
  jobs.set(id, job);
}

/** Pre-generate context controls for every prompt in a manifest (fast, cached by scene text). */
async function warmControls(m: Manifest, demo: Demo) {
  const hint = demo.industry;
  const prompts = [m.hero?.prompt, ...Object.values(m.shots).map((x) => x.cutPrompt)].filter((p): p is string => !!p);
  for (const p of prompts) await sceneControls(p, hint).catch(() => undefined);
}

async function run(id: string, demo: Demo, sel?: { subjectId: string; optionIds: string[] }) {
  const existing = await readManifest(id);
  if (existing?.status === "done") {
    await warmControls(existing, demo);
    return;
  }
  const done = profile("prerender.total", { id });
  const subject = sel ? demo.subjects.find((x) => x.id === sel.subjectId) : demo.subjects[0];
  const optionIds = sel?.optionIds ?? demo.defaultOptionIds ?? (demo.options[0] ? [demo.options[0].id] : []);
  const m: Manifest = existing ?? {
    id, status: "running", startedAt: new Date().toISOString(), subjectId: subject?.id, optionIds, shots: {}, total: demo.shots.length, errors: [],
  };
  m.status = "running";
  m.errors = [];
  if (!subject) {
    m.status = "needs-photo"; // e.g. apparel plan without the shopper's photo
    await writeManifest(m);
    return;
  }
  await writeManifest(m);
  const dir = prerenderDir(id);

  // 1) hero + its opening prompt
  let hero: Asset | null = null;
  if (m.hero) {
    hero = { buf: await readFile(path.join(dir, m.hero.file)), mime: "image/jpeg" };
  } else {
    try {
      const subj = await loadSrc(subject.src);
      if (!subj) throw new Error(`cannot load subject ${subject.src}`);
      const optionImages = (
        await Promise.all(demo.options.filter((o) => optionIds.includes(o.id) && o.src).map((o) => loadSrc(o.src!)))
      ).filter((a): a is Asset => !!a);
      const out = await renderHero(demo, { subject: subj, subjectKind: subject.person ? "upload" : "asset", optionIds, optionImages });
      hero = { buf: out.data, mime: out.mimeType };
      await writeFile(path.join(dir, "hero.jpg"), out.data);
      m.hero = { file: "hero.jpg", model: out.model };
      await writeManifest(m);
      m.hero.prompt = await writeOpening(demo, hero).catch(() => undefined);
      await writeManifest(m);
    } catch (err) {
      m.status = "error";
      m.errors.push(`hero: ${err instanceof Error ? err.message.slice(0, 200) : String(err)}`);
      await writeManifest(m);
      done({ ok: false });
      return;
    }
  }

  // 2) every shot in parallel (+ pre-written cut prompt)
  await Promise.all(
    demo.shots
      .filter((s) => !m.shots[s.id])
      .map(async (s) => {
        try {
          const out = await renderShot(demo, hero!, s.instruction);
          const file = `shot-${safe(s.id)}.jpg`;
          await writeFile(path.join(dir, file), out.data);
          const cutPrompt = await writeOpening(demo, { buf: out.data, mime: out.mimeType }, s.motion).catch(() => undefined);
          m.shots[s.id] = { file, model: out.model, cutPrompt };
          await writeManifest(m);
        } catch (err) {
          m.errors.push(`${s.id}: ${err instanceof Error ? err.message.slice(0, 160) : String(err)}`);
        }
      }),
  );
  await warmControls(m, demo);
  m.status = Object.keys(m.shots).length === demo.shots.length ? "done" : "error";
  m.finishedAt = new Date().toISOString();
  await writeManifest(m);
  done({ shots: Object.keys(m.shots).length, status: m.status });
}
