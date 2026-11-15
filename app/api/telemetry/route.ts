import { NextResponse } from "next/server";

import { type ProfileEvent, writeEvents } from "@/lib/server/profile";

export const runtime = "nodejs";

// Browser-side timings (Orbis connect/take/steer, client fetch round-trips).
export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > 200_000) return NextResponse.json({ error: "too large" }, { status: 413 });
  let body: { client?: string; events?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const events = Array.isArray(body.events) ? body.events.slice(0, 500) : [];
  const clean = events
    .filter((e): e is ProfileEvent => !!e && typeof e === "object" && typeof (e as ProfileEvent).op === "string")
    .map((e) => ({ ...e, op: String(e.op).slice(0, 64), client: String(body.client ?? "").slice(0, 40) }));
  await writeEvents("client.jsonl", clean);
  return new Response(null, { status: 204 });
}
