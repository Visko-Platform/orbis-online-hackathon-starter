import type { Part } from "@google/genai";

import type { Demo } from "@/lib/demos";
import { generateImage, generateText, IMAGE_MODELS, OPENING_SYSTEM } from "@/lib/server/gemini";
import { getOmniShotRefs } from "@/lib/server/omni";

// Shared generation core used by the API routes and the background pre-renderer.

export type Asset = { buf: Buffer; mime: string };
export const assetPart = (a: Asset): Part => ({ inlineData: { mimeType: a.mime, data: a.buf.toString("base64") } });

export function heroInstruction(
  demo: Demo,
  o: { hasSubject: boolean; subjectKind?: string; subjectText?: string; optionIds: string[]; custom?: string },
) {
  const options = demo.options.filter((x) => o.optionIds.includes(x.id));
  const extra = o.custom ? ` Also: ${o.custom}` : "";
  if (!o.hasSubject) return demo.subjectFromText!.prompt(o.subjectText ?? "", options) + extra;
  if (o.subjectKind === "upload" && demo.uploadInstruction) return demo.uploadInstruction(options) + extra;
  if (options.length) return demo.composeInstruction(options) + extra;
  return `Enhance this photo into a crisp, high-resolution, photorealistic 16:9 image. Keep every subject, product, and the setting exactly the same.${extra}`;
}

export async function renderHero(
  demo: Demo,
  o: { subject?: Asset; subjectKind?: string; subjectText?: string; optionIds: string[]; optionImages: Asset[]; custom?: string; fast?: boolean },
) {
  const text = heroInstruction(demo, { ...o, hasSubject: Boolean(o.subject) });
  const parts: Part[] = [{ text }, ...(o.subject ? [assetPart(o.subject)] : []), ...o.optionImages.map(assetPart)];
  return generateImage(parts, o.fast ? IMAGE_MODELS.fast : IMAGE_MODELS.hero, "2K");
}

export async function renderShot(demo: Demo, hero: Asset, instruction: string, fast?: boolean) {
  const text =
    "This is the reference image. Create a NEW photograph for a shot list, following the change below. " +
    "Keep the same subject identity, the same products and furniture pieces (their colors, materials, graphics, and design), and the same lighting style. " +
    "The requested change to camera position, layout, action, or setting MUST be clearly visible: do not return a near copy of the reference. " +
    `Change: ${instruction} Photorealistic, 16:9 landscape composition, no text, no watermarks.` +
    (demo.directorRules ? ` Rules: ${demo.directorRules}` : "");
  return generateImage(
    [
      { text },
      assetPart(hero),
      // Lifecast plans: references keep the person/outfit/destination consistent across shots.
      ...getOmniShotRefs(demo.id).flatMap((r) => [{ text: `Reference image: ${r.label}.` }, r.part]),
    ],
    fast ? IMAGE_MODELS.fast : IMAGE_MODELS.shot,
    "1K",
  );
}

export const withRules = (demo: Demo, system: string) =>
  demo.directorRules ? `${system}\nScene rules for this demo (always follow): ${demo.directorRules}` : system;

/** Opening prompt for starting Orbis from an image (used for heroes and pre-written cut prompts). */
export function writeOpening(demo: Demo, image: Asset, motion?: string) {
  return generateText(withRules(demo, OPENING_SYSTEM), [{ text: `Requested motion: ${motion || demo.openingMotion}` }, assetPart(image)]);
}
