import { NextResponse } from "next/server";

import { ORBIS_MODELS } from "@/lib/orbis";

const REACTOR_API_URL = "https://api.reactor.inc";

// A backstop behind the browser's own limit: whatever a page does, this
// server will not ask Reactor for more than this many session tokens a
// minute with the account's API key. Reactor allows 10 new sessions a minute.
const MAX_TOKENS_PER_MINUTE = 8;
const recentTokens: number[] = [];

export async function POST() {
  const now = Date.now();
  while (recentTokens.length && now - recentTokens[0] > 60_000) {
    recentTokens.shift();
  }
  if (recentTokens.length >= MAX_TOKENS_PER_MINUTE) {
    const retryAfter = Math.ceil((recentTokens[0] + 60_000 - now) / 1_000);
    return NextResponse.json(
      {
        error: `Too many scenes started in the last minute. Wait ${retryAfter} seconds and begin again.`,
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }
  recentTokens.push(now);

  const apiKey = process.env.REACTOR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "REACTOR_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const response = await fetch(`${REACTOR_API_URL}/tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Reactor-API-Key": apiKey,
    },
    body: JSON.stringify({
      expires_after: 3600,
      authorization_details: [
        {
          type: "session",
          // Films may run on either Orbis model.
          resources: { models: { match: ORBIS_MODELS } },
          constraints: { max_sessions: 1, max_session_duration_seconds: 300 },
        },
      ],
    }),
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    return NextResponse.json(
      { error: `Reactor token request failed (${response.status}): ${text}` },
      { status: response.status },
    );
  }

  const result = JSON.parse(text) as { jwt?: string };
  if (!result.jwt) {
    return NextResponse.json({ error: "Reactor returned no JWT" }, { status: 502 });
  }

  return NextResponse.json(
    { jwt: result.jwt },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
