import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Renders a 16:9 opening frame for a destination the director invented, so a
// jump can cut straight to it (image-anchored) instead of morphing. Fast
// model on purpose: it has to be ready before the captain picks a route.
// Charted worlds use the higher-quality frames pre-rendered in public/worlds.
const MODEL = "gemini-3.1-flash-image";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }
  const body = (await request.json().catch(() => null)) as { view?: string } | null;
  const view = typeof body?.view === "string" ? body.view.trim().slice(0, 700) : "";
  if (!view) return NextResponse.json({ error: "A view is required" }, { status: 400 });

  const prompt = [
    "A cinematic, photorealistic 16:9 film frame from a camera flying low and straight ahead.",
    view,
    "Wide-angle, rich detail in the foreground, midground and far background, natural atmospheric depth. Full frame, no letterbox bars.",
    "No aircraft, spaceships, vehicles, cockpit, window frames, text, logos, or people looking at the camera.",
  ].join(" ");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } },
        }),
      },
    );
    const json = (await response.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { data: string; mimeType: string } }[] } }[];
    };
    const part = json.candidates?.[0]?.content?.parts?.find((item) => item.inlineData);
    if (!response.ok || !part?.inlineData) throw new Error(`image model ${response.status}`);
    return new NextResponse(Buffer.from(part.inlineData.data, "base64"), {
      headers: {
        "Content-Type": part.inlineData.mimeType || "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (caught) {
    console.error("World image failed", caught);
    return NextResponse.json({ error: "Could not render this world" }, { status: 502 });
  }
}
