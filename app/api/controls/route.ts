import { NextResponse } from "next/server";

import { sceneControls } from "@/lib/server/controls";
import { profile } from "@/lib/server/profile";

export const runtime = "nodejs";

// POST {scene, hint} -> {controls: [{key, arrow, label, prompt} x5]} for the scene on screen.
export async function POST(request: Request) {
  const done = profile("api.controls");
  const { scene, hint } = (await request.json().catch(() => ({}))) as { scene?: string; hint?: string };
  if (!scene || typeof scene !== "string") return NextResponse.json({ error: "scene required" }, { status: 400 });
  try {
    const controls = await sceneControls(scene, typeof hint === "string" ? hint : "");
    done();
    return NextResponse.json({ controls }, { headers: { "Cache-Control": "no-store" } });
  } catch (caught) {
    done({ ok: false });
    return NextResponse.json({ error: caught instanceof Error ? caught.message : "controls failed" }, { status: 502 });
  }
}
