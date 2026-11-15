import { NextResponse } from "next/server";

import { generateJson } from "@/lib/server/gemini";
import { profile } from "@/lib/server/profile";

export const runtime = "nodejs";

const SYSTEM = `You direct a LIVE real-time video model that is streaming right now. The shopper just navigated from one shopping page to the next.
Write the steering directions that carry the live video from the CURRENT scene to the NEXT scene, as one continuous shot (no cuts).
Rules:
- Exactly 3 directions, in order. Each is ONE visible change phrased as a state transition, present tense, 12-28 words.
- Keep the same person ("the person"), keep what they wear unless the next page is new clothing (then they change into it on screen).
- Travel between places (walk, ride, drive, glide) instead of jumping; the light/weather can shift gradually.
- Direction 3 must arrive at the NEXT scene as described (it will be followed by a hard cut to that exact image).
- No negation, no vague words like "cinematic". Concrete visuals and camera only.
Also give a 2-5 word "label" for the transition (e.g. "Down to the village").
Return JSON: {"label": "", "prompts": ["", "", ""]}`;

export async function POST(request: Request) {
  const done = profile("api.omni.transition");
  const body = (await request.json().catch(() => ({}))) as {
    from?: { title?: string; vertical?: string; scene?: string; setting?: string };
    to?: { title?: string; vertical?: string; siteName?: string; description?: string; heroScene?: string; setting?: string };
  };
  const from = body.from ?? {};
  const to = body.to ?? {};
  try {
    const out = await generateJson<{ label?: string; prompts?: string[] }>(
      SYSTEM,
      [
        {
          text:
            `CURRENT live scene (${from.vertical ?? "?"}: ${from.title ?? ""}): ${from.scene || from.setting || "the shopper in the current scene"}\n` +
            `NEXT page (${to.vertical ?? "?"} on ${to.siteName ?? ""}): ${to.title ?? ""}. ${(to.description ?? "").slice(0, 300)}\n` +
            `NEXT scene to arrive at: ${to.heroScene || to.setting || "the product/place on the next page, with the person"}`,
        },
      ],
      1200,
    );
    const prompts = (out.prompts ?? []).filter((p) => typeof p === "string" && p.trim()).slice(0, 4).map((p) => p.trim());
    if (prompts.length < 2) throw new Error("too few transition prompts");
    done({ n: prompts.length });
    return NextResponse.json({ label: (out.label ?? "Next scene").slice(0, 40), prompts }, { headers: { "Cache-Control": "no-store" } });
  } catch (caught) {
    done({ ok: false });
    return NextResponse.json({ error: caught instanceof Error ? caught.message : "transition failed" }, { status: 502 });
  }
}
