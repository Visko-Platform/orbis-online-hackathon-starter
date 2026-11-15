import { GoogleGenAI } from "@google/genai";
import { NANO_BANANA_STUDIO_MODEL } from "@/lib/nano-banana";
import { PHOTOREAL_DIRECTION } from "@/lib/orbis-prompt";
import { headViews } from "@/lib/camera/head-views";
import { accessoryPlacements } from "@/lib/camera/accessory";
import { readBoundedBody, requireLocalRequest } from "@/lib/server/local-request";

const isPhoto = (file: unknown): file is File => file instanceof File && file.type === "image/jpeg" && file.size > 0;
const isBackground = (file: unknown): file is File => file instanceof File && file.size > 0 &&
  ["image/jpeg", "image/png", "image/webp"].includes(file.type);

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "wardrobe-reference", 6);
  if (blocked) return blocked;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "Configure GEMINI_API_KEY to prepare a look." }, { status: 503 });
  const payload = await readBoundedBody(request, 4 * 1024 * 1024);
  if ("error" in payload) return payload.error;
  const form = await payload.body.formData().catch(() => null);
  const frame = form?.get("frame");
  const sheets = form?.getAll("sheet") ?? [];
  const hat = form?.get("hat") ?? null;
  const head = headViews.flatMap(({ id, label }) =>
    (form?.getAll(id) ?? []).map((file) => ({ file, label })));
  const direction = form?.get("direction");
  const environment = form?.get("environment");
  const background = form?.get("background") ?? null;
  const source = form?.get("source") ?? null;
  const replaceClothing = form?.get("replaceClothing") ?? null;
  const sketch = source === "sketch";
  if ((source !== null && !sketch) || (replaceClothing !== null && replaceClothing !== "true") ||
      (replaceClothing === "true" && !sheets.length) || !isPhoto(frame) ||
      (!sketch && !environment && !background && !sheets.length && !hat && !head.length) ||
      (background !== null && !isBackground(background)) || sheets.length > Object.keys(accessoryPlacements).length || !sheets.every(isPhoto) ||
      (hat !== null && !isPhoto(hat)) || head.length > headViews.length ||
      new Set(head.map(({ label }) => label)).size !== head.length || !head.every(({ file }) => isPhoto(file)) ||
      typeof direction !== "string" || direction.length > 5000 ||
      (environment !== null && typeof environment !== "string")) {
    return Response.json({ error: "Provide a camera frame and valid JPEG references." }, { status: 400 });
  }
  try {
    const ai = new GoogleGenAI({ apiKey: key, httpOptions: { timeout: 60_000 } });
    const images = await Promise.all([frame, ...(background ? [background] : []), ...head.map(({ file }) => file as File), ...(hat ? [hat] : []), ...sheets].map(async (file) => ({
      type: "image" as const, mime_type: file.type, data: Buffer.from(await file.arrayBuffer()).toString("base64"),
    })));
    const result = await ai.interactions.create({
      model: NANO_BANANA_STUDIO_MODEL,
      input: [{
        type: "text",
        text: [
          "Make one 16:9 opening video frame.",
          PHOTOREAL_DIRECTION,
          sketch
            ? "Use the sketch as a guide to the subjects, colors, shapes, and framing. Recreate the design as a camera photograph, turning strokes into physical forms or surface details."
            : "Use the first image for the camera composition. Preserve the person's identity, framing, and lighting.",
          background ? "Use the second image as the background reference. Keep its setting, layout, time of day and atmosphere. Place the foreground from the first image into that setting and match its lighting and perspective." :
            environment ? `Use this environment: ${environment}.` : sketch ? "Use a believable setting consistent with the sketch." : "Preserve the original background.",
          head.length && `The next ${head.length} photos show the same person's head, in this order: ${head.map(({ label }) => label).join(", ")}. Use them to preserve face shape, ears and hair. Use the first image for the opening pose and framing.`,
          hat && "The next image shows the same drawn hat from the front, left, right and back, in that order. Fit that design to the head as a realistic hat. Preserve the crown, brim, colors and the location of every painted stroke. Use the drawings on the side and back only where those surfaces are visible.",
          sheets.length && `The final ${sheets.length} images are turnaround sheets for the worn pieces. Use their angles and inside views for construction and fit. Center both lenses over the eyes and fit the temple arms to the ears. Preserve the lens tint shown in the sheet: opaque dark sunglasses cover the eyes, while clear lenses leave them visible. For handheld props, use a natural grip and realistic finger occlusion.`,
          replaceClothing && "The full-body garment in the turnaround sheets replaces the person's original outfit. The first image may contain a rough garment overlay or uncovered old clothing. Dress the person in the new garment as real clothing from neckline to hem, removing the original jacket, shirt, and lower-body clothing wherever covered. Do not show the old outfit through or over it. If the frame crops the legs, show the correct visible part of the full garment and maintain the complete outfit in subsequent video frames.",
          "Treat any colored lines drawn over the first image as design guides. Turn them into physical features at their drawn size, silhouette, and location; do not render the guide lines themselves or shrink exaggerated features into small costume accessories.",
          "Render one clean scene. Preserve the composition and designed details.",
          direction,
        ].filter(Boolean).join("\n"),
      }, ...images],
      response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: "16:9", image_size: "1K" },
      store: false,
    }, { signal: request.signal });
    const image = result.output_image;
    if (image?.data) {
      return new Response(new Uint8Array(Buffer.from(image.data, "base64")), {
        headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" },
      });
    }
  } catch {
    // Keep the capture and its wardrobe details out of request logs.
  }
  return Response.json({ error: "Nano Banana couldn’t prepare this Orbis reference. Try again." }, { status: 502 });
}
