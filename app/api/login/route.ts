import { NextResponse } from "next/server";

import { authCookie, authToken, safeEqual } from "@/lib/server/auth";

export const runtime = "nodejs";

const attempts = new Map<string, { n: number; at: number }>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "?";
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && now - a.at < 60_000 && a.n >= 8) {
    return NextResponse.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });
  }
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  const expected = process.env.SITE_PASSWORD ?? "";
  if (!expected || typeof password !== "string" || !safeEqual(password.trim(), expected)) {
    attempts.set(ip, { n: a && now - a.at < 60_000 ? a.n + 1 : 1, at: a && now - a.at < 60_000 ? a.at : now });
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  attempts.delete(ip);
  return new NextResponse(null, { status: 204, headers: { "Set-Cookie": authCookie(authToken(expected)) } });
}
