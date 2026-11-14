import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

import { DIRECTOR_MODEL } from "@/lib/copilot-config";

export const runtime = "nodejs";

// The story director: given where the ship is and where it has been, invents
// three onward destinations and (sometimes) an unexpected event at this world.
// Everything it writes is constrained to what Orbis renders well: a view
// straight ahead, drifting forward, with no cockpit, window or vehicle in it.

const SYSTEM = `You are the procedural story director for a live demo in which
a time-travelling starship drifts through worlds rendered by a real-time video
model. You never speak to the audience; you only return JSON.

Given the current world and the voyage so far, return:
1. "options": exactly three onward destinations that feel connected to the
   current world: a thread pulled from it (its past, its future, a rumour, a
   signal, a strange neighbour). Mix eras and scales: at least one surprising
   leap. Never repeat a world already visited.
2. "event": an unexpected thing that happens AT the current world a little
   after arrival (a storm, a creature surfacing, a signal flare, an eclipse,
   a time ripple). It must change the view without leaving the place. Return
   it about two times in three; otherwise return null.

Every "view" is a description of what is straight ahead while drifting slowly
forward through it: landscape, sky, light, motion, one or two striking details.
40 words max. Never mention a cockpit, window, ship, aircraft, vehicle, camera,
or people looking at the camera. Names under 26 characters. Eras like
"66,000,000 BC", "1350 AD", "2471 AD", "Year 40,000". Logs are one terse ship's
log line in a dry, competent voice (under 16 words). Teasers are 6 words max.`;

const VIEW = {
  type: Type.STRING,
  description: "What is straight ahead, drifting forward. 40 words max.",
};

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    options: {
      type: Type.ARRAY,
      minItems: "3",
      maxItems: "3",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          era: { type: Type.STRING },
          teaser: { type: Type.STRING },
          view: VIEW,
          log: { type: Type.STRING },
        },
        required: ["name", "era", "teaser", "view", "log"],
      },
    },
    event: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        title: { type: Type.STRING, description: "2–4 words, alert style" },
        view: VIEW,
        log: { type: Type.STRING },
      },
      required: ["title", "view", "log"],
    },
  },
  required: ["options"],
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as {
    world?: { name?: string; era?: string; view?: string };
    visited?: string[];
  } | null;
  const world = body?.world;
  if (!world?.name || !world.view) {
    return NextResponse.json({ error: "The current world is required" }, { status: 400 });
  }
  const visited = (body?.visited ?? []).slice(-12).map((name) => String(name).slice(0, 60));

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: DIRECTOR_MODEL,
      contents: [
        {
          text: [
            `Current world: ${world.name} (${world.era ?? "unknown era"})`,
            `What it looks like: ${String(world.view).slice(0, 600)}`,
            `Visited so far: ${visited.join("; ") || "nothing yet"}`,
          ].join("\n"),
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 1.1,
        maxOutputTokens: 2_048,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    const plan = JSON.parse(response.text ?? "{}") as {
      options?: unknown[];
      event?: unknown;
    };
    if (!Array.isArray(plan.options) || plan.options.length < 3) {
      throw new Error("director returned too few options");
    }
    return NextResponse.json(plan, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (caught) {
    console.error("Director failed", caught);
    return NextResponse.json({ error: "The director could not plan ahead" }, { status: 502 });
  }
}
