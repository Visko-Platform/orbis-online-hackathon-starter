import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Part } from "@google/genai";

import {
  type Demo,
  type DemoChip,
  type DemoOption,
  type DemoScenario,
  type DemoShot,
  describe,
  getDemo,
  REAL_SNOW,
} from "@/lib/demos";
import { CACHE_DIR } from "@/lib/server/cache";
import { generateJson } from "@/lib/server/gemini";

// ---------------------------------------------------------------------------
// Omni: turn "what the shopper is browsing" (+ their recent interests, saved
// wardrobe, and photo) into a dynamic demo config for the live studio.
// Plans and their images live in server memory for a couple of hours.
// ---------------------------------------------------------------------------

export type OmniImage = { dataUrl: string; sourceUrl?: string; title?: string; url?: string; vertical?: string };
export type OmniInput = {
  page: {
    url?: string;
    title?: string;
    description?: string;
    siteName?: string;
    price?: string | number | null;
    jsonLdTypes?: string[];
    keywords?: string[];
    vertical?: string;
    text?: string;
  };
  images: OmniImage[];
  history: { url?: string; title?: string; vertical?: string; keywords?: string[]; ts?: number; price?: string | number | null }[];
  historyImages: OmniImage[];
  wardrobe: { dataUrl: string; label: string; description?: string }[];
  userPhoto?: string | null;
  note?: string;
};

type Vertical = "apparel" | "real_estate" | "auto" | "travel";

type Plan = {
  vertical: Vertical;
  title: string;
  tagline: string;
  productName: string;
  productVisual: string;
  primaryImage: number;
  includeUser: boolean;
  wardrobeToUse: number[];
  setting: string;
  heroScene: string;
  trendNotes: string[];
  openingMotion: string;
  chips: DemoChip[];
  shots: DemoShot[];
  scenario?: DemoScenario;
  journey: boolean;
  destinationName: string;
  destinationVisual: string;
};

type Asset = { buf: Buffer; mime: string };
type Ref = { label: string; asset: Asset };
type Entry = { demo: Demo; assets: Asset[]; refs: Ref[]; summary: OmniSummary; createdAt: number };
export type OmniSummary = {
  vertical: Vertical;
  productName: string;
  setting: string;
  trendNotes: string[];
  includeUser: boolean;
  wardrobeUsed: string[];
  productImageIndex: number;
  journey: boolean;
  destinationName: string;
  heroScene: string;
  inventory: { id: string; name: string; kind: string; price?: number; imageUrl?: string }[];
};

const TTL_MS = 2 * 60 * 60 * 1000;
const MAX_PLANS = 100;
const store = new Map<string, Entry>();

function prune() {
  const now = Date.now();
  for (const [id, e] of store) if (now - e.createdAt > TTL_MS) store.delete(id);
  while (store.size > MAX_PLANS) store.delete(store.keys().next().value!);
}

export const getOmniDemo = (id: string) => store.get(id)?.demo;
export const getOmniAsset = (id: string, index: number) => store.get(id)?.assets[index];
/** Identity/product/destination references for shot generation (keeps the person recognizable across shots). */
export const getOmniShotRefs = (id: string): { label: string; part: Part }[] =>
  (store.get(id)?.refs ?? []).map((r) => ({ label: r.label, part: part(r.asset) }));

const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
export function decodeDataUrl(dataUrl: string, maxBytes = 8 * 1024 * 1024): Asset | null {
  const m = DATA_URL.exec(dataUrl ?? "");
  if (!m) return null;
  const buf = Buffer.from(m[2], "base64");
  if (buf.length < 2_000 || buf.length > maxBytes) return null;
  return { buf, mime: m[1] };
}

const part = (a: Asset): Part => ({ inlineData: { mimeType: a.mime, data: a.buf.toString("base64") } });

const PLANNER = `You are the creative director of "Lifecast", a browser extension that turns what a shopper is browsing into a LIVE, steerable, photorealistic AI video starring them.
A real-time video model (one continuous shot that morphs at each new prompt) will animate a hero still you design.

Decide the vertical:
- "apparel": clothing, outerwear, shoes, snowboards, skis, gear the person wears or holds.
- "real_estate": a home/apartment listing; the video is an interior walkthrough where furniture can move. Interior only: never go outside, onto balconies, or show exteriors.
- "auto": a car/truck/SUV listing; the video is a drive.
- (journey destinations can also be a HOME the shopper browsed: then the story ends arriving at that home and walking inside;
  once inside, stay in the interior - furniture, rooms, light in the windows - and never show the home's exterior beyond the entrance.
  The vehicle always stays outside: on the street, at the curb, or in a garage. Only the person walks into the home.)
- "travel": a destination page (ski resort, trip, lodging); the video shows the shopper AT that destination, wearing their wardrobe, doing the activity.
Anything else: pick the closest vertical.

JOURNEY MODE (journey=true): when the current page is a vehicle AND the shopper recently browsed a DESTINATION (a trip/resort/beach OR a home listing; see DESTINATIONS / D images) - and especially apparel too -
build an ordered road-trip story that ends with the activity at that destination (snowboarding, surfing, or walking into the new home...).
Adapt the stage labels to the destination, e.g. surf: "1 · Load up", "2 · Coast road", "3 · Arrive", "4 · Paddle out", "5 · Surf"; home: "1 · Drive", "2 · City night", "3 · Arrive home", "4 · Walk in", "5 · Home".
The template below is for a ski resort:
- heroScene: the shopper WEARING the wardrobe apparel, opening the door and getting into this exact vehicle (e.g. a snowy driveway or street on a winter morning; snowboard on the roof rack).
- shots, IN THIS ORDER, labels numbered: "1 · Drive" (the vehicle on the way, e.g. climbing a snowy mountain road), "2 · Arrive" (pulling into the destination - match the D image: its lodges, gondola, etc. - and unloading the board),
  "3 · Lift" (riding the gondola/chairlift up, wearing the apparel), "4 · Ride" (snowboarding down a run at the destination, powder spraying), optionally "5 · Après".
- scenario: the same journey as 5-6 continuous directions (getting in -> driving -> arriving -> lift -> riding).
- "Where to go" chips: the journey stages ("Head to <destination>", "Pull into the lot", "Ride the gondola", "Drop into the run").
Name the destination (destinationName) and describe how it looks (destinationVisual) from the D image.

MERGE TRENDS from the shopper's recent interests (history + wardrobe). Examples:
- Browsing an SUV after snowboard gear -> set it on snowy mountain roads, a snowboard on the roof rack, and (if wardrobe/user photo exists) the shopper WEARING that snowboard apparel, opening the door and stepping into the car.
- Browsing a jacket after a cabin listing -> wear it at a snowy cabin.
- Browsing a house after beach gear -> sunny coastal light in the interior.
Only merge trends that make sense; say why in trendNotes ("Because you browsed X -> Y"). Keep each note under 14 words.

includeUser: true for apparel and travel. For auto, true when there is a user photo OR apparel in the wardrobe/history images (feature the shopper wearing it, entering/driving the car). For real_estate, false.
wardrobeToUse: indexes into the WARDROBE list (W0, W1, ...) the person should wear (auto: the most relevant apparel; apparel: items that pair with the new product, usually empty).

Write for the video model: concrete, visual, present tense, no negation, no vague words like "cinematic"/"epic". Keep identities consistent ("the person", "the rider", "the SUV").
- heroScene: the single opening frame (who, wearing what, doing what, where, camera). 1-2 sentences.
- openingMotion: what happens once it starts moving. 1 sentence.
- chips: 10-12 one-click directions, each ONE visible change as a state transition (<= 25 words). Groups: "Where to go" (4 destinations reached by travelling, e.g. "The rider carves down toward the tree line"), "Action" (3), "Conditions" (3: weather/light), "Camera" (2). Labels <= 3 words.
- shots: 4-5 still images to generate FROM the hero (same person/product/vehicle/room), each a new angle or scenario. instruction = image-edit instruction (1-2 sentences); motion = what moves once that still is animated (1 sentence). ids are short slugs.
- scenario: a 5-step story told in 5 consecutive directions (each one visible change).
For real_estate, every chip/shot/scenario stays inside the home (rooms, furniture moving, light changing in the windows).
If snow is involved, describe it as real alpine snow with fine powder texture and natural light.

Return ONLY JSON with exactly these keys:
{"vertical":"apparel|real_estate|auto|travel","journey":false,"destinationName":"","destinationVisual":"","title":"<= 5 words","tagline":"<= 14 words","productName":"","productVisual":"concise visual description of the product from the images (colors, materials, details)","primaryImage":0,"includeUser":true,"wardrobeToUse":[0],"setting":"","heroScene":"","trendNotes":[""],"openingMotion":"","chips":[{"group":"","label":"","prompt":""}],"shots":[{"id":"","label":"","instruction":"","motion":""}],"scenario":{"id":"story","label":"","steps":["","","","",""]}}`;

function sanitizePlan(raw: Partial<Plan>, input: OmniInput, pageCount: number, wardrobeCount: number): Plan {
  const v: Vertical =
    raw.vertical === "real_estate" || raw.vertical === "auto" || raw.vertical === "travel" ? raw.vertical : "apparel";
  const str = (x: unknown, d = "") => (typeof x === "string" && x.trim() ? x.trim() : d);
  const chips = (Array.isArray(raw.chips) ? raw.chips : [])
    .filter((c) => c && str(c.label) && str(c.prompt))
    .slice(0, 14)
    .map((c) => ({ group: str(c.group, "Direct").slice(0, 16), label: str(c.label).slice(0, 24), prompt: str(c.prompt).slice(0, 300) }));
  const shots = (Array.isArray(raw.shots) ? raw.shots : [])
    .filter((x) => x && str(x.instruction))
    .slice(0, 6)
    .map((x, i) => ({
      id: (str(x.id, `s${i}`).toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 24) || `s${i}`) + `-${i}`,
      label: str(x.label, `Shot ${i + 1}`).slice(0, 24),
      instruction: str(x.instruction).slice(0, 500),
      motion: str(x.motion, "Natural continuous motion; the camera moves smoothly.").slice(0, 300),
    }));
  const steps = Array.isArray(raw.scenario?.steps) ? raw.scenario!.steps.filter((s) => str(s)).slice(0, 6) : [];
  return {
    vertical: v,
    title: str(raw.title, "Try It On").slice(0, 40),
    tagline: str(raw.tagline, "See it live before you buy.").slice(0, 120),
    productName: str(raw.productName, input.page.title ?? "This product").slice(0, 80),
    productVisual: str(raw.productVisual, input.page.title ?? "").slice(0, 400),
    primaryImage: Number.isInteger(raw.primaryImage) && raw.primaryImage! >= 0 && raw.primaryImage! < pageCount ? raw.primaryImage! : 0,
    includeUser: v === "apparel" || v === "travel" ? true : v === "auto" ? Boolean(raw.includeUser) || Boolean(raw.journey) : false,
    journey: v === "auto" && Boolean(raw.journey),
    destinationName: str(raw.destinationName).slice(0, 60),
    destinationVisual: str(raw.destinationVisual).slice(0, 300),
    wardrobeToUse: (Array.isArray(raw.wardrobeToUse) ? raw.wardrobeToUse : []).filter((i) => Number.isInteger(i) && i >= 0 && i < wardrobeCount).slice(0, 3),
    setting: str(raw.setting).slice(0, 300),
    heroScene: str(raw.heroScene).slice(0, 500),
    trendNotes: (Array.isArray(raw.trendNotes) ? raw.trendNotes : []).filter((t) => str(t)).slice(0, 4).map((t) => String(t).slice(0, 120)),
    openingMotion: str(raw.openingMotion, "Natural continuous motion; the camera tracks smoothly.").slice(0, 400),
    chips,
    shots,
    scenario: steps.length >= 2 ? { id: "story", label: str(raw.scenario?.label, "Story").slice(0, 24), steps } : undefined,
  };
}

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const noQuery = (u?: string) => (u ?? "").split(/[?#]/)[0];

/**
 * Cache key = what the scene really depends on, robust to browsing noise:
 *  - every page: the page URL (no query) + the shopper photo;
 *  - vehicle pages (journeys): + the most recent apparel page and the most recent destination (trip or home).
 * History length, revisits, and the saved wardrobe don't change it (they made live demos miss the cache).
 */
export function planKey(input: OmniInput) {
  const isAuto = (input.page.vertical ?? "") === "auto" || (input.page.jsonLdTypes ?? []).some((t) => /car|vehicle/i.test(t));
  const newest = (v: string[]) => noQuery(input.historyImages.find((h) => v.includes(h.vertical ?? "") && noQuery(h.url) !== noQuery(input.page.url))?.url);
  return sha(
    JSON.stringify({
      v: 3,
      page: noQuery(input.page.url) || input.page.title || "",
      images: input.page.url ? [] : input.images.map((i) => sha(i.dataUrl).slice(0, 16)),
      apparel: isAuto ? newest(["apparel"]) : "",
      destination: isAuto ? newest(["travel", "real_estate"]) : "",
      user: input.userPhoto ? sha(input.userPhoto).slice(0, 16) : null,
      note: input.note ?? "",
    }),
  ).slice(0, 12);
}

const planFile = (key: string) => path.join(CACHE_DIR, "plans", `${key}.json`);

export async function planOmni(input: OmniInput): Promise<{ id: string; demo: Demo; summary: OmniSummary; cached: boolean }> {
  prune();
  const key = planKey(input);
  const id = `omni-${key}`;
  const live = store.get(id);
  if (live) return { id, demo: live.demo, summary: live.summary, cached: true };
  // ---- decode images ----
  const pageAssets = input.images.map((i) => decodeDataUrl(i.dataUrl)).filter((a): a is Asset => !!a).slice(0, 4);
  const wardrobeSrc = [
    ...input.wardrobe.map((w) => ({ asset: decodeDataUrl(w.dataUrl), label: w.label, description: w.description ?? "" })),
    ...input.historyImages
      .filter((h) => (h.vertical ?? "apparel") === "apparel")
      .map((h) => ({ asset: decodeDataUrl(h.dataUrl), label: h.title ?? "Earlier item", description: "" })),
  ]
    .filter((w): w is { asset: Asset; label: string; description: string } => !!w.asset)
    .slice(0, 4);
  const userAsset = input.userPhoto ? decodeDataUrl(input.userPhoto) : null;
  const destinations = input.historyImages
    .filter((h) => h.vertical === "travel" || h.vertical === "real_estate")
    .map((h) => ({ asset: decodeDataUrl(h.dataUrl), label: `${h.vertical === "real_estate" ? "home listing" : "trip"}: ${h.title ?? "Destination"}` }))
    .filter((d): d is { asset: Asset; label: string } => !!d.asset)
    .slice(0, 2);

  // ---- ask Gemini for a plan ----
  const history = input.history
    .slice(0, 15)
    .map((h) => `- [${h.vertical ?? "?"}] ${h.title ?? h.url ?? ""}${h.keywords?.length ? ` (${h.keywords.slice(0, 6).join(", ")})` : ""}`)
    .join("\n");
  const parts: Part[] = [
    {
      text:
        `CURRENT PAGE\nsite: ${input.page.siteName ?? ""}\nurl: ${input.page.url ?? ""}\ntitle: ${input.page.title ?? ""}\n` +
        `description: ${(input.page.description ?? "").slice(0, 400)}\nprice: ${input.page.price ?? ""}\n` +
        `structured types: ${(input.page.jsonLdTypes ?? []).join(", ")}\nkeywords: ${(input.page.keywords ?? []).join(", ")}\n` +
        `extension guess: ${input.page.vertical ?? ""}\npage text: ${(input.page.text ?? "").slice(0, 1200)}\n` +
        (input.note ? `shopper note: ${input.note}\n` : "") +
        `\nRECENT SHOPPING INTERESTS (newest first):\n${history || "(none)"}\n` +
        `\nWARDROBE (apparel the shopper browsed or tried before):\n${wardrobeSrc.map((w, i) => `W${i}: ${w.label}${w.description ? ` - ${w.description}` : ""}`).join("\n") || "(none)"}\n` +
        `\nDESTINATIONS (recently browsed trips/resorts):\n${destinations.map((d, i) => `D${i}: ${d.label}`).join("\n") || "(none)"}\n` +
        `\nUSER PHOTO: ${userAsset ? "yes" : "no"}\n` +
        `\nAttached images, in order: ${pageAssets.map((_, i) => `P${i} (current page)`).concat(wardrobeSrc.map((_, i) => `W${i} (wardrobe)`)).concat(destinations.map((_, i) => `D${i} (destination)`)).join(", ") || "none"}. primaryImage is the index of the P image that best shows the product.`,
    },
    ...pageAssets.slice(0, 3).map(part),
    ...wardrobeSrc.map((w) => part(w.asset)),
    ...destinations.map((d) => part(d.asset)),
  ];
  let plan: Plan;
  let cached = false;
  try {
    plan = JSON.parse(await readFile(planFile(key), "utf8")) as Plan;
    cached = true;
  } catch {
    const raw = await generateJson<Partial<Plan>>(PLANNER, parts);
    plan = sanitizePlan(raw, input, pageAssets.length, wardrobeSrc.length);
    await mkdir(path.dirname(planFile(key)), { recursive: true });
    await writeFile(planFile(key), JSON.stringify(plan, null, 1)).catch(() => undefined);
  }

  // ---- assets: served at /api/omni/asset/<id>/<n> ----
  const assets: Asset[] = [];
  const add = (a: Asset) => `/api/omni/asset/${id}/${assets.push(a) - 1}`;
  const ordered = pageAssets.length
    ? [pageAssets[plan.primaryImage], ...pageAssets.filter((_, i) => i !== plan.primaryImage)]
    : [];
  const pageUrls = ordered.map(add);
  const userUrl = userAsset ? add(userAsset) : null;
  const wardrobeUsed = plan.wardrobeToUse.map((i) => wardrobeSrc[i]);
  const wardrobeUrls = wardrobeUsed.map((w) => add(w.asset));
  // The planner names the destination; pick the matching image (else the newest).
  const destination =
    destinations.find((d) => plan.destinationName && d.label.toLowerCase().includes(plan.destinationName.toLowerCase().split(" ")[0])) ??
    destinations[0] ??
    null;
  const destinationUrl = destination ? add(destination.asset) : null;
  // References attached to every shot render (identity, outfit, destination look).
  const refs: Ref[] = [
    ...(userAsset && plan.includeUser ? [{ label: "the person (keep this exact face, hair, skin tone, body type)", asset: userAsset }] : []),
    ...(plan.includeUser ? wardrobeUsed.map((w) => ({ label: `apparel the person wears: ${w.label}`, asset: w.asset })) : []),
    ...(destination && (plan.journey || plan.vertical === "travel")
      ? [{
          label: destination.label.startsWith("home")
            ? `the new home's INTERIOR (${plan.destinationName || destination.label}); use it only for shots inside the home - vehicles always stay outside on the street or in a garage, never indoors`
            : `the destination, ${plan.destinationName || destination.label}`,
          asset: destination.asset,
        }]
      : []),
  ];

  const demo = buildDemo(id, plan, {
    pageUrls,
    userUrl,
    wardrobe: wardrobeUsed.map((w, i) => ({ ...w, url: wardrobeUrls[i] })),
    destinationUrl,
  });
  const summary: OmniSummary = {
    vertical: plan.vertical,
    productName: plan.productName,
    setting: plan.setting,
    trendNotes: plan.trendNotes,
    includeUser: plan.includeUser,
    wardrobeUsed: wardrobeUsed.map((w) => w.label),
    productImageIndex: input.images.indexOf(input.images.filter((i) => decodeDataUrl(i.dataUrl))[plan.primaryImage]),
    journey: plan.journey,
    destinationName: plan.destinationName,
    heroScene: plan.heroScene,
    inventory: buildInventory(input, plan, pageUrls[0], wardrobeUsed.map((w, i) => ({ label: w.label, url: wardrobeUrls[i] })), destination ? { label: destination.label, url: destinationUrl! } : null),
  };
  store.set(id, { demo, assets, refs, summary, createdAt: Date.now() });
  return { id, demo, summary, cached };
}

const parsePrice = (p: unknown): number | undefined => {
  const n = Number(String(p ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const cleanTitle = (t: string) => t.split(/\s[|·–-]\s/)[0].trim().slice(0, 48);

/** Game inventory: the current item + things browsed recently (with prices when the page had them). */
function buildInventory(
  input: OmniInput,
  plan: Plan,
  pageImage: string | undefined,
  wardrobe: { label: string; url: string }[],
  destination: { label: string; url: string } | null,
) {
  const items: OmniSummary["inventory"] = [
    { id: "page", name: plan.productName, kind: plan.vertical, price: parsePrice(input.page.price), imageUrl: pageImage },
  ];
  const seen = new Set([cleanTitle(plan.productName).toLowerCase(), cleanTitle(input.page.title ?? "").toLowerCase()]);
  input.history.slice(0, 12).forEach((h, i) => {
    const name = cleanTitle(h.title ?? "");
    if (!name || seen.has(name.toLowerCase()) || h.url === input.page.url) return;
    if (/inventory|find your next|new suvs/i.test(name)) return; // listing pages aren't items
    seen.add(name.toLowerCase());
    const img =
      wardrobe.find((w) => name.toLowerCase().includes(cleanTitle(w.label).toLowerCase().slice(0, 16)))?.url ??
      (destination && destination.label.toLowerCase().includes(name.toLowerCase().slice(0, 12)) ? destination.url : undefined);
    items.push({ id: `h${i}`, name, kind: h.vertical ?? "other", price: parsePrice(h.price), imageUrl: img });
  });
  return items.slice(0, 8);
}

function buildDemo(
  id: string,
  plan: Plan,
  a: {
    pageUrls: string[];
    userUrl: string | null;
    wardrobe: { label: string; description: string; url: string }[];
    destinationUrl: string | null;
  },
): Demo {
  const snowy = /snow|ski|powder|winter|alpine/i.test(`${plan.setting} ${plan.heroScene}`);
  const snowNote = snowy ? ` Render any snow as ${REAL_SNOW}.` : "";
  const scene = `Scene: ${plan.heroScene} Setting: ${plan.setting}.${snowNote}`;
  const identityRule =
    "Keep the person's face, hair, skin tone, and body type exactly as in their photo, and keep every product's colors, graphics, and details exactly.";
  const base =
    plan.vertical === "real_estate" ? getDemo("staging")! : plan.vertical === "auto" ? getDemo("drive")! : getDemo("tryon")!;
  const productOption = (url: string, i: number): DemoOption => ({
    id: `p${i}`,
    label: i === 0 ? plan.productName.slice(0, 22) : `View ${i + 1}`,
    src: url,
    text: plan.productVisual,
  });
  const wardrobeOptions: DemoOption[] = a.wardrobe.map((w, i) => ({
    id: `w${i}`,
    label: w.label.slice(0, 22),
    src: w.url,
    text: w.description || w.label,
  }));
  const youOption: DemoOption[] = a.userUrl
    ? [{ id: "you", label: "You", src: a.userUrl, text: "the shopper: the person to feature in the scene" }]
    : [];
  const baseCamera = base.chips.filter((c) => c.group === "Camera").slice(0, 2);
  const common = {
    id,
    title: plan.title,
    industry: `Lifecast · ${plan.vertical.replace("_", " ")}`,
    tagline: plan.tagline,
    pitch: plan.trendNotes,
    accent: base.accent,
    swapGuidance: base.swapGuidance,
    openingMotion: `${plan.openingMotion}${snowy ? " Fine powder snow glitters in the sunlight." : ""}`,
    shots: plan.shots,
    scenarios: plan.scenario ? [plan.scenario] : [],
  };

  if (plan.vertical === "travel") {
    const destinationOption: DemoOption[] = a.pageUrls[0]
      ? [{ id: "dest", label: (plan.destinationName || plan.productName).slice(0, 22), src: a.pageUrls[0], text: `the destination to use as the setting: ${plan.destinationVisual || plan.productVisual}` }]
      : [];
    const options = [...destinationOption, ...wardrobeOptions];
    const instruction = (opts: DemoOption[]) =>
      `Image 1 is a photo of the shopper. The later images show, in order: ${opts.filter((o) => o.src).map((o) => `${o.label} (${o.text})`).join("; ")}. ` +
      `Create a new full-body photograph of this SAME person at that destination${wardrobeOptions.length ? ", wearing the apparel shown" : ""}. ${identityRule} ${scene} Photorealistic, 16:9 landscape composition.`;
    return {
      ...common,
      subjectLabel: "You",
      subjects: a.userUrl ? [{ id: "you", label: "You", src: a.userUrl }] : [],
      uploadLabel: "📷 Your photo",
      uploadInstruction: instruction,
      composeInstruction: instruction,
      subjectFromText: {
        placeholder: "No photo? Describe a model, e.g. 'a snowboarder in their 20s'",
        prompt: (text, opts) =>
          `Create a full-body photograph of ${text} at the destination shown, wearing the apparel shown (${describe(opts)}). ${scene} Photorealistic, 16:9 landscape composition.`,
      },
      optionLabel: "Destination & outfit",
      options,
      defaultOptionIds: options.map((o) => o.id),
      multiOption: true,
      directorRules: `${identityRule}${snowNote}`,
      chips: [...plan.chips, ...baseCamera.filter((c) => !plan.chips.some((p) => p.group === "Camera"))],
    };
  }

  if (plan.vertical === "apparel") {
    const options = [...a.pageUrls.slice(0, 3).map(productOption), ...wardrobeOptions];
    const instruction = (opts: DemoOption[]) =>
      `Image 1 is a photo of the shopper. The later images show products. Create a new full-body photograph of this SAME person wearing or holding: ${describe(opts)}. ` +
      `${identityRule} ${scene} Photorealistic, natural light, 16:9 landscape composition, full body visible.`;
    return {
      ...common,
      subjectLabel: "You",
      subjects: a.userUrl ? [{ id: "you", label: "You", src: a.userUrl }] : [],
      uploadLabel: "📷 Your photo",
      uploadInstruction: instruction,
      composeInstruction: instruction,
      subjectFromText: {
        placeholder: "No photo? Describe a model, e.g. 'a woman in her 30s'",
        prompt: (text, opts) =>
          `Create a full-body photograph of ${text} wearing or holding: ${describe(opts)} (shown in the attached images; reproduce them exactly). ${scene} Photorealistic, 16:9 landscape composition.`,
      },
      optionLabel: "Products",
      options,
      defaultOptionIds: ["p0", ...wardrobeOptions.map((o) => o.id)],
      multiOption: true,
      directorRules: `${identityRule}${snowNote}`,
      chips: [...plan.chips, ...baseCamera.filter((c) => !plan.chips.some((p) => p.group === "Camera"))],
    };
  }

  if (plan.vertical === "auto") {
    const people = plan.includeUser ? [...youOption, ...wardrobeOptions] : [];
    const instruction = (opts: DemoOption[]) => {
      const withImages = opts.filter((o) => o.src);
      const you = withImages.find((o) => o.id === "you");
      const clothes = withImages.filter((o) => o.id.startsWith("w"));
      const person = plan.includeUser
        ? `Feature ${you ? "the person from the 'You' image" : "a person"}${clothes.length ? ` wearing ${clothes.map((c) => c.text).join(" and ")}` : ""} with the vehicle, as described in the scene. ${you ? identityRule : ""} `
        : "";
      return (
        `Image 1 shows the exact vehicle; keep its body shape, color, wheels, and design exactly the same. ` +
        (withImages.length ? `The other images show, in order: ${withImages.map((o) => `${o.label} (${o.text})`).join("; ")}. ` : "") +
        `${person}${scene} Photorealistic automotive advertising photography, 16:9 landscape composition.`
      );
    };
    return {
      ...common,
      subjectLabel: "Vehicle (from the page)",
      subjects: a.pageUrls.map((u, i) => ({ id: `car${i}`, label: i === 0 ? plan.productName.slice(0, 22) : `View ${i + 1}`, src: u })),
      uploadLabel: "Upload car photos",
      composeInstruction: instruction,
      uploadInstruction: instruction,
      optionLabel: plan.includeUser ? "Who's driving" : "Look",
      options: people.length ? people : base.options,
      defaultOptionIds: people.length ? people.map((o) => o.id) : [base.options[0].id],
      multiOption: true,
      directorRules: `Keep the vehicle's identity exact.${plan.includeUser ? ` ${identityRule}` : ""}${snowNote}`,
      chips: [...plan.chips, ...baseCamera.filter((c) => !plan.chips.some((p) => p.group === "Camera"))],
    };
  }

  // real estate
  return {
    ...common,
    subjectLabel: "Listing photos (from the page)",
    subjects: a.pageUrls.map((u, i) => ({ id: `room${i}`, label: `Photo ${i + 1}`, src: u })),
    uploadLabel: "Upload rooms",
    multiSubject: true,
    boardRendersSubjects: true,
    composeInstruction: (opts) => `${base.composeInstruction(opts)} Mood and season: ${plan.setting}.`,
    optionLabel: base.optionLabel,
    options: base.options,
    multiOption: false,
    directorRules: base.directorRules,
    chips: [...plan.chips.slice(0, 8), ...base.chips.filter((c) => c.group === "Move")],
  };
}
