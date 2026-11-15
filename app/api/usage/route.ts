import { NextResponse } from "next/server";

import { readUsage } from "@/lib/gemini-usage";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await readUsage(), {
    headers: { "Cache-Control": "no-store" },
  });
}
