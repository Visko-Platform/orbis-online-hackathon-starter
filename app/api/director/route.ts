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
2. "event": an EMERGENCY that hits AT the current world a little after
   arrival and forces the captain to decide (a storm front, a creature
   surfacing beneath the ship, a collapsing structure, hostile signal lock, a
   time rip opening ahead). It must change the view without leaving the place.
   Always return one. Give it exactly two "choices", which the captain picks
   by clicking a button:
     - choices[0]: the CAUTIOUS response (e.g. "Pull up", "Shields up").
     - choices[1]: the BOLD response (e.g. "Dive through", "Follow it").
   Each choice: "label" (2–3 words, imperative, fits on a button), "outcome"
   (the new view after acting, same rules as every view), "log" (terse ship's
   log line of what happened), "points" (cautious 100–200, bold 250–400).

Every "view" describes the world straight ahead in LAYERS, as complete
sentences: what is close below in the foreground, what fills the midground,
and one named, striking landmark on the far horizon, plus sky and light.
Rich, concrete, specific. 45 words max. Describe the scene only, never camera
motion (that is added separately). Never mention a cockpit, window, ship,
aircraft, vehicle, camera, or people looking at the camera.

MISSION: the voyage has a goal (given below) and a stage. Exactly one of the
three options must carry the mission forward ("mission": true), with "clue":
what the crew hopes to find there (under 14 words). The other two are
detours ("mission": false, "clue": ""). If this is the final stage, the
mission option is the FINALE ("finale": true): the place where the goal is
resolved, spectacular and emotionally satisfying. Names under 26 characters. Eras like
"66,000,000 BC", "1350 AD", "2471 AD", "Year 40,000". Logs are one terse ship's
log line in a dry, competent voice (under 16 words). Teasers are 6 words max.`;

const VIEW = {
  type: Type.STRING,
  description: "The world ahead in layers: foreground, midground, a landmark on the horizon. 45 words max.",
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
          mission: { type: Type.BOOLEAN },
          clue: { type: Type.STRING },
          finale: { type: Type.BOOLEAN },
        },
        required: ["name", "era", "teaser", "view", "log", "mission", "clue", "finale"],
      },
    },
    event: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "2–4 words, alert style" },
        view: VIEW,
        log: { type: Type.STRING },
        choices: {
          type: Type.ARRAY,
          minItems: "2",
          maxItems: "2",
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              outcome: VIEW,
              log: { type: Type.STRING },
              points: { type: Type.INTEGER },
            },
            required: ["label", "outcome", "log", "points"],
          },
        },
      },
      required: ["title", "view", "log", "choices"],
    },
  },
  required: ["options", "event"],
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as {
    world?: { name?: string; era?: string; view?: string };
    visited?: string[];
    mission?: { title?: string; goal?: string; stage?: number; stages?: number };
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
            body?.mission?.goal
              ? `Mission: ${String(body.mission.title ?? "").slice(0, 80)}: ${String(body.mission.goal).slice(0, 300)}\nMission stage: ${Number(body.mission.stage ?? 1)} of ${Number(body.mission.stages ?? 4)}${Number(body.mission.stage) >= Number(body.mission.stages ?? 4) ? " (FINAL STAGE: the mission option must be the finale)" : ""}`
              : "Mission: none",
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
