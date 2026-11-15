import { GoogleGenAI } from "@google/genai";
import { GARMENT_VARIANTS, PROMPT_LIMIT } from "@/lib/looks/intent";
import { NANO_BANANA_STUDIO_MODEL } from "@/lib/nano-banana";
import { PHOTOREAL_DIRECTION } from "@/lib/orbis-prompt";
import { readBoundedBody, requireLocalRequest } from "@/lib/server/local-request";

const imageLimit = 4 * 1024 * 1024;
const isImage = (file: unknown): file is File =>
  file instanceof File && file.size > 0 && file.size <= imageLimit &&
  ["image/jpeg", "image/png", "image/webp"].includes(file.type);

async function imagePart(file: File) {
  return { type: "image" as const, mime_type: file.type,
    data: Buffer.from(await file.arrayBuffer()).toString("base64") };
}

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "looks-image", 18);
  if (blocked) return blocked;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "Configure GEMINI_API_KEY to generate looks." }, { status: 503 });
  const payload = await readBoundedBody(request, 2 * imageLimit + 16_384);
  if ("error" in payload) return payload.error;
  const data = await payload.body.formData().catch(() => null);
  const prompt = data?.get("prompt");
  const base = data?.get("base");
  const guide = data?.get("guide");
  const slot = data?.get("slot");
  const kind = data?.get("kind") ?? null;
  const environment = kind === "environment";
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > PROMPT_LIMIT) {
    return Response.json({ error: "Enter a description within the prompt limit." }, { status: 400 });
  }

  let direction: string;
  let references: File[];
  let aspectRatio = "16:9";
  if (kind === "overlay") {
    const sketch = data?.get("sketch");
    if (!isImage(sketch)) return Response.json({ error: "Provide a valid overlay sketch." }, { status: 400 });
    aspectRatio = "1:1";
    references = [sketch];
    direction = [
      "Render one isolated visual effect described by the user. Use the sketch as a loose shape guide.",
      "Fit the complete effect in the center with clear margins on a perfectly flat bright chroma green (#00FF00) background, including holes and gaps. No ground plane, shadows, frame, text, or surroundings unless text is explicitly requested.",
      `Effect: ${prompt.trim()}`,
    ].join("\n");
  } else if (environment) {
    const sketch = data?.get("sketch") ?? null;
    const panoramic = data?.get("panoramic");
    if ((sketch !== null && !isImage(sketch)) || (panoramic !== "true" && panoramic !== "false")) {
      return Response.json({ error: "Provide a valid sketch or generate from the description alone." }, { status: 400 });
    }
    aspectRatio = panoramic === "true" ? "21:9" : "16:9";
    references = sketch ? [sketch] : [];
    direction = [
      "Create one photorealistic background plate for a video opening frame. Show the setting at eye level. Keep the foreground clear for a subject. Avoid foreground people, overlays, and borders.",
      panoramic === "true" && "Compose an ultra-wide panorama with a level horizon and scenery extending to both sides for camera panning.",
      sketch && "Use the attached sketch as a loose guide to the scene layout and framing. Turn its strokes into real scenery.",
      `Environment: ${prompt.trim()}`,
    ].filter(Boolean).join("\n");
  } else if (kind === null && isImage(base) && isImage(guide) && typeof slot === "string" && /^[0-2]$/.test(slot)) {
    direction = `${prompt.trim()}\n\n${GARMENT_VARIANTS[Number(slot)]}`;
    references = [base, guide];
  } else {
    return Response.json({ error: "Provide a clean base, garment outline, and approved prompt." }, { status: 400 });
  }
  try {
    const ai = new GoogleGenAI({ apiKey: key, httpOptions: { timeout: 60_000 } });
    const result = await ai.interactions.create({
      model: NANO_BANANA_STUDIO_MODEL,
      input: [{ type: "text", text: `${PHOTOREAL_DIRECTION}\n\n${direction}` }, ...await Promise.all(references.map(imagePart))],
      response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: aspectRatio, image_size: "1K" },
      store: false,
    }, { signal: request.signal });
    const image = result.output_image;
    if (!image?.data) return Response.json({ error: "Gemini returned no image." }, { status: 502 });
    return new Response(new Uint8Array(Buffer.from(image.data, "base64")), {
      headers: { "Content-Type": image.mime_type || "image/jpeg", "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (environment && typeof error === "object" && error && "status" in error && error.status === 429) {
      return Response.json({ error: "Gemini’s quota was reached. Check billing or try again shortly." }, { status: 429 });
    }
    return Response.json({ error: kind === "overlay" ? "Gemini couldn’t generate this overlay. Try again." : environment ? "Gemini couldn’t generate this environment. Try again." :
      "Gemini couldn’t generate this garment. Try again." }, { status: 502 });
  }
}
