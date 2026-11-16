import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

import { DIRECTOR_MODEL } from "@/lib/copilot-config";

export const runtime = "nodejs";

/** Gemini sometimes answers 429 (rate limit) or 503 (overloaded): retry
 *  briefly before giving up, so a busy moment doesn't break the flight. */
async function withRetry<T>(run: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run();
    } catch (caught) {
      const message = String((caught as Error)?.message ?? caught);
      const busy = /\b(429|503)\b|RESOURCE_EXHAUSTED|UNAVAILABLE|high demand/i.test(message);
      if (!busy || attempt >= attempts) throw caught;
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }
}

// The scene driver's eyes. Two jobs, both from a frame of the live Orbis video:
//   mode "evolve": write the NEXT beat for Orbis so the shot keeps moving
//                  (same world, continuous, something new coming into view);
//   mode "check":  say whether something we asked Orbis for is visible yet,
//                  so nothing is announced before the audience can see it.

const EVOLVE = `You keep a real-time video model's FLIGHT moving. The camera
flies forward continuously through a world; you see the current frame, the
world it is meant to be, and the last scene text sent. Write the scene text
for the next ~9 seconds of the journey.

This is a journey, not a still: the camera has moved further forward since
the last beat. Never re-describe the whole layout or put landmarks back where
they were (re-describing the setting makes the model re-frame the shot,
which reads as flying backward). Instead:
- Start from what is directly ahead in the frame NOW, close and getting
  closer, and what is rushing past beneath.
- Bring ONE new thing into view ahead (a landmark, creature, structure,
  weather or light change) that the camera is flying toward.
- Anything named before as distant should now loom larger and nearer, or be
  passing by. Distances only shrink.
- Describe the SCENE only, not camera motion (motion is added separately).
  Never describe anything receding, shrinking away or the view pulling back.
- Never mention a cockpit, window, ship, aircraft, vehicle or camera.
- 35–55 words, present tense, concrete visual language.
Also return "seen": one short sentence (under 14 words) describing what the
frame actually shows right now.`;

const EDIT = `You apply the captain's live request to a real-time video
model's flight. You get the frame on screen now, the scene text currently
sent, and the captain's request. Return the NEW scene text with the request
clearly and visibly applied, in this same world:
- Effects ("add smoke", "make it rain", "set the buildings on fire", "turn
  it to night"): make the effect prominent and unmistakable in the view
  ahead, spreading across the scene, while keeping the world recognisable.
- Viewpoint ("take us higher", "go lower", "skim the water", "fly through
  the clouds"): describe the scene from that new height or path.
- Turning ("turn left", "head for the mountain"): describe the new heading
  and what now lies ahead.
Never refuse: this is a quantum explorer and reality bends to the captain.
Keep it scene text only (motion is added separately), never mention a
cockpit, window, ship or camera. 40-60 words, present tense, concrete.
Also return "summary": what changed, in under 8 words.`;

const CHECK = `You verify a live video frame. You get a frame and a description
of something that should be appearing. Answer "visible": true only if the frame
clearly shows that thing or its unmistakable start (for a change of world, the
new world must clearly dominate the frame). Also return "seen": one short
sentence (under 14 words) describing what the frame actually shows.`;

const SCHEMAS = {
  evolve: {
    type: Type.OBJECT,
    properties: { prompt: { type: Type.STRING }, seen: { type: Type.STRING } },
    required: ["prompt", "seen"],
  },
  check: {
    type: Type.OBJECT,
    properties: { visible: { type: Type.BOOLEAN }, seen: { type: Type.STRING } },
    required: ["visible", "seen"],
  },
  edit: {
    type: Type.OBJECT,
    properties: { scene: { type: Type.STRING }, summary: { type: Type.STRING } },
    required: ["scene", "summary"],
  },
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as {
    mode?: "evolve" | "check" | "edit";
    frame?: string;
    world?: string;
    lastPrompt?: string;
    expect?: string;
    /** edit: the captain's request. */
    change?: string;
    /** evolve: the captain's standing changes for this world, to keep. */
    keep?: string[];
  } | null;
  const mode = body?.mode;
  const frame = body?.frame;
  if ((mode !== "evolve" && mode !== "check" && mode !== "edit") || typeof frame !== "string") {
    return NextResponse.json({ error: "mode and frame are required" }, { status: 400 });
  }
  if (frame.length > 2_000_000) {
    return NextResponse.json({ error: "Frame too large" }, { status: 413 });
  }

  const keep = (body?.keep ?? []).slice(-6).map((line) => String(line).slice(0, 160));
  const text =
    mode === "evolve"
      ? `World: ${String(body?.world ?? "").slice(0, 600)}\nLast prompt sent: ${String(body?.lastPrompt ?? "").slice(0, 900)}${
          keep.length
            ? `\nThe captain changed this scene; KEEP these changes visible in every beat: ${keep.join("; ")}`
            : ""
        }`
      : mode === "edit"
        ? `Scene text now: ${String(body?.lastPrompt ?? "").slice(0, 900)}\nCaptain's request: ${String(body?.change ?? "").slice(0, 300)}`
        : `Should be appearing: ${String(body?.expect ?? "").slice(0, 600)}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await withRetry(() => ai.models.generateContent({
      model: DIRECTOR_MODEL,
      contents: [
        { text },
        { inlineData: { mimeType: "image/jpeg", data: frame } },
      ],
      config: {
        systemInstruction: mode === "evolve" ? EVOLVE : mode === "edit" ? EDIT : CHECK,
        responseMimeType: "application/json",
        responseSchema: SCHEMAS[mode],
        temperature: mode === "check" ? 0 : mode === "edit" ? 0.6 : 0.9,
        maxOutputTokens: 512,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }));
    return NextResponse.json(JSON.parse(response.text ?? "{}"), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (caught) {
    console.error("Scene vision failed", caught);
    return NextResponse.json({ error: "Scene vision failed" }, { status: 502 });
  }
}
