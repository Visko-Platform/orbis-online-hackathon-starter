import { GoogleGenAI } from "@google/genai";
import { ACCESSORY_PROMPT_LIMIT, ACCESSORY_REFERENCE_LIMIT, accessoryPlacements, isAccessoryPlacement, resolveAccessoryPlacement, validAccessoryReference } from "@/lib/camera/accessory";
import { NANO_BANANA_STUDIO_MODEL } from "@/lib/nano-banana";
import { readBoundedBody, requireLocalRequest } from "@/lib/server/local-request";

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "camera-accessory", 6);
  if (blocked) return blocked;

  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "Configure GEMINI_API_KEY to generate accessories." }, { status: 503 });

  const payload = await readBoundedBody(request, ACCESSORY_REFERENCE_LIMIT + 8 * 1024);
  if ("error" in payload) return payload.error;
  const form = await payload.body.formData().catch(() => null);
  const description = form?.get("prompt");
  const prompt = typeof description === "string" ? description.trim() : "";
  const requestedPlacement = form?.get("placement");
  const reference = form?.get("reference") ?? null;
  if (reference !== null && (!(reference instanceof File) || !validAccessoryReference(reference))) {
    return Response.json({ error: "Choose a JPEG, PNG or WebP photo up to 3 MB." }, { status: 400 });
  }
  if ((!prompt && !reference) || prompt.length > ACCESSORY_PROMPT_LIMIT || !isAccessoryPlacement(requestedPlacement)) {
    return Response.json({ error: "Add a description or photo and choose where to wear it." }, { status: 400 });
  }

  const placement = resolveAccessoryPlacement(prompt, requestedPlacement);
  try {
    const ai = new GoogleGenAI({ apiKey: key, httpOptions: { timeout: 60_000 } });
    const result = await ai.interactions.create({
      model: NANO_BANANA_STUDIO_MODEL,
      input: [{ type: "text", text: [
        prompt ? `Requested accessory: ${prompt}` : `Identify ${accessoryPlacements[placement].view} in the attached photo.`,
        `Make a product turnaround sheet for that accessory. Its placement on a wearer is the ${accessoryPlacements[placement].label.toLowerCase()}.`,
        "Show exactly the requested accessory in every view. The placement describes where the object is worn or held and must never add another item.",
        placement === "upperLip" ? "Isolate the upper-lip piece by itself. For a mustache, render only the mustache, with no glasses, nose, lips, face, beard, or other attachments, even if those appear in the reference." : "",
        "Exactly three equal columns and two equal rows on a landscape canvas. One complete, centered cutout in each cell, with generous empty padding and no dividers or labels.",
        "Top row left to right: front, turned 45 degrees pointing toward the left edge, turned 45 degrees pointing toward the right edge.",
        "Bottom row left to right: full profile pointing toward the left edge, full profile pointing toward the right edge, interior or underside showing construction and attachment.",
        "Show the same design, colors and proportions in all six views. Show only the object without a person, mannequin, head, body or extra props.",
        placement === "eyes" ? "For sunglasses, render both full lens surfaces in the requested or pictured tint. Dark sunglasses must have solid dark lenses that hide the eyes; never put chroma green inside tinted lenses. For clear prescription eyewear, use chroma green inside the clear lenses. In the straight-on view show the front frame, lenses and hinges only. In other views show the open temples." : "",
        placement === "shoulders" ? "Design a complete outer layer from neckline to waist. Use broad shoulder panels that cover the shoulder caps and a continuous front over the chest and upper stomach, with coverage consistent across views. Preserve open space above the neckline and outside the garment silhouette." : "",
        "Use a perfectly flat, bright chroma green (#00FF00) background, including in every hole and gap.",
        "Avoid bright green on the object, shadows outside its silhouette, gradients and reflections on the backdrop.",
        "Keep every part of each object within its own cell.",
        reference && "Use the attached photo as the product reference. Isolate the requested accessory and preserve its shape, colors and materials across all angles. Ignore the photo background and any person wearing it. Apply any requested edits in the description.",
      ].filter(Boolean).join("\n") }, ...(reference ? [{
        type: "image" as const,
        mime_type: reference.type,
        data: Buffer.from(await reference.arrayBuffer()).toString("base64"),
      }] : [])],
      response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: "3:2", image_size: "2K" },
      store: false,
    }, { signal: request.signal });
    const image = result.output_image;
    if (image?.data) {
      return new Response(new Uint8Array(Buffer.from(image.data, "base64")), {
        headers: { "Content-Type": image.mime_type || "image/jpeg", "Cache-Control": "no-store" },
      });
    }
    return Response.json({ error: "Nano Banana returned no accessory. Try another description." }, { status: 502 });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? error.status : undefined;
    if (status === 429) {
      return Response.json({ error: "Gemini’s quota was reached. Check billing or try again shortly." }, { status: 429 });
    }
    if (status === 401 || status === 403) {
      return Response.json({ error: "Gemini denied access. Check the API key and project access." }, { status: 502 });
    }
    return Response.json({ error: "Nano Banana couldn’t generate the accessory. Try again." }, { status: 502 });
  }
}
