import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { CACHE_DIR } from "@/lib/server/cache";
import { startWarm, warmStatus } from "@/lib/server/warm";

export const runtime = "nodejs";

// POST {userPhoto?: dataUrl, stories?: string[]} -> start warming; GET -> progress.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { userPhoto?: string; stories?: string[] };
  const photo =
    typeof body.userPhoto === "string" && body.userPhoto.startsWith("data:image/")
      ? body.userPhoto
      : await readFile(path.join(CACHE_DIR, "presenter-photo.txt"), "utf8").catch(() => null);
  return NextResponse.json(startWarm(photo, body.stories), { status: 202 });
}

export async function GET() {
  return NextResponse.json(warmStatus(), { headers: { "Cache-Control": "no-store" } });
}
