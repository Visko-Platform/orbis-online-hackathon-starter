import { NextResponse } from "next/server";

import { toView } from "@/lib/demos";
import { type OmniInput, planOmni } from "@/lib/server/omni";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { CACHE_DIR } from "@/lib/server/cache";
import { startPrerender } from "@/lib/server/prerender";
import { profile } from "@/lib/server/profile";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BODY = 30 * 1024 * 1024;

// POST JSON: the extension's omni:context payload (+ wardrobe, userPhoto, note from the web app).
export async function POST(request: Request) {
  const done = profile("api.omni.plan");
  const text = await request.text();
  if (text.length > MAX_BODY) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  let body: Partial<OmniInput>;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const arr = <T,>(x: unknown, n: number) => (Array.isArray(x) ? (x.slice(0, n) as T[]) : []);
  const input: OmniInput = {
    page: body.page && typeof body.page === "object" ? body.page : {},
    images: arr(body.images, 4),
    history: arr(body.history, 30),
    historyImages: arr(body.historyImages, 3),
    wardrobe: arr(body.wardrobe, 4),
    userPhoto: typeof body.userPhoto === "string" ? body.userPhoto : null,
    note: typeof body.note === "string" ? body.note.slice(0, 400) : undefined,
  };
  if (!input.images.length && !input.page.title && !input.note) {
    return NextResponse.json({ error: "Nothing to plan from: add a product photo or describe what you're shopping for." }, { status: 400 });
  }
  try {
    const { id, demo, summary, cached } = await planOmni(input);
    done({ vertical: summary.vertical, cached, images: input.images.length, wardrobe: input.wardrobe.length + input.historyImages.length, user: Boolean(input.userPhoto) });
    // Render the hero + every shot on the server right away (cached on disk for replays).
    startPrerender(id, demo);
    // Remember the presenter's exact photo so the warm-up can replay stories with it.
    if (input.userPhoto) {
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(path.join(CACHE_DIR, "presenter-photo.txt"), input.userPhoto).catch(() => undefined);
    }
    return NextResponse.json({ planId: id, view: toView(demo), summary }, { headers: { "Cache-Control": "no-store" } });
  } catch (caught) {
    console.error("omni plan failed", caught);
    done({ ok: false });
    return NextResponse.json({ error: caught instanceof Error ? caught.message : "Planning failed" }, { status: 502 });
  }
}
