import { NextResponse } from "next/server";

import { requireLocalRequest } from "@/lib/server/local-request";

const REACTOR_API_URL = "https://api.reactor.inc";
const MODEL_NAME = "reactor/visko-orbis-stable";

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "token", 10);
  if (blocked) return blocked;

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
          resources: { models: { match: [MODEL_NAME] } },
          constraints: { max_sessions: 1, max_session_duration_seconds: 300 },
        },
      ],
    }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!response?.ok) {
    return NextResponse.json(
      { error: "Reactor token request failed" },
      { status: 502 },
    );
  }

  const result = (await response.json().catch(() => null)) as { jwt?: unknown } | null;
  if (typeof result?.jwt !== "string" || !result.jwt) {
    return NextResponse.json({ error: "Reactor returned no JWT" }, { status: 502 });
  }

  return NextResponse.json(
    { jwt: result.jwt },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
