import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { CACHE_DIR } from "@/lib/server/cache";

export const runtime = "nodejs";

// The last shopper photo sent with a plan (exact data URL), for warming the cache with the presenter's photo.
export async function GET() {
  const userPhoto = await readFile(path.join(CACHE_DIR, "presenter-photo.txt"), "utf8").catch(() => null);
  return NextResponse.json({ userPhoto }, { headers: { "Cache-Control": "no-store" } });
}
