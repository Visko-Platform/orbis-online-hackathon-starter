import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

import { DIRECTOR_MODEL } from "@/lib/copilot-config";

export const runtime = "nodejs";

// The scene driver's eyes. Two jobs, both from a frame of the live Orbis video:
//   mode "evolve": write the NEXT beat for Orbis so the shot keeps moving
//                  (same world, continuous, something new coming into view);
//   mode "check":  say whether something we asked Orbis for is visible yet,
//                  so nothing is announced before the audience can see it.

const EVOLVE = `You keep a real-time video model's shot alive. You see the
current frame of a continuous forward-drifting shot, the world it is meant to
be, and the last prompt sent. Write the scene text for the next ~6 seconds.

Write it the way the video model's own curated presets are written:
- Open by re-establishing continuity explicitly: "The same <world>, the same
  <key feature>…", describing what is visible now.
- Then ONE new development coming into view ahead: a landmark, creature,
  weather or light change, a structure. Keep it plausible for this world.
- Layer the detail: foreground close below, midground, far background.
- Describe the SCENE only, not camera motion (motion is added separately).
- Never mention a cockpit, window, ship, aircraft, vehicle or camera.
- 40–60 words, present tense, concrete visual language.
Also return "seen": one short sentence (under 14 words) describing what the
frame actually shows right now.`;

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
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as {
    mode?: "evolve" | "check";
    frame?: string;
    world?: string;
    lastPrompt?: string;
    expect?: string;
  } | null;
  const mode = body?.mode;
  const frame = body?.frame;
  if ((mode !== "evolve" && mode !== "check") || typeof frame !== "string") {
    return NextResponse.json({ error: "mode and frame are required" }, { status: 400 });
  }
  if (frame.length > 2_000_000) {
    return NextResponse.json({ error: "Frame too large" }, { status: 413 });
  }

  const text =
    mode === "evolve"
      ? `World: ${String(body?.world ?? "").slice(0, 600)}\nLast prompt sent: ${String(body?.lastPrompt ?? "").slice(0, 900)}`
      : `Should be appearing: ${String(body?.expect ?? "").slice(0, 600)}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: DIRECTOR_MODEL,
      contents: [
        { text },
        { inlineData: { mimeType: "image/jpeg", data: frame } },
      ],
      config: {
        systemInstruction: mode === "evolve" ? EVOLVE : CHECK,
        responseMimeType: "application/json",
        responseSchema: SCHEMAS[mode],
        temperature: mode === "evolve" ? 0.9 : 0,
        maxOutputTokens: 512,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return NextResponse.json(JSON.parse(response.text ?? "{}"), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (caught) {
    console.error("Scene vision failed", caught);
    return NextResponse.json({ error: "Scene vision failed" }, { status: 502 });
  }
}
