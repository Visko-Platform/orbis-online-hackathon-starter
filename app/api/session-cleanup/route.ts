import { NextResponse } from "next/server";

import { readBoundedBody, requireLocalRequest } from "@/lib/server/local-request";

export const runtime = "nodejs";

const REACTOR_API_URL = "https://api.reactor.inc";

type CleanupRequest = {
  sessionId?: unknown;
  jwt?: unknown;
};

export async function POST(request: Request) {
  const blocked = requireLocalRequest(request, "session-cleanup", 30);
  if (blocked) return blocked;

  const payload = await readBoundedBody(request, 32 * 1024);
  if ("error" in payload) return payload.error;
  let body: CleanupRequest | null;
  try {
    body = (await payload.body.json()) as CleanupRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sessionId, jwt } = body ?? {};
  if (
    typeof sessionId !== "string" ||
    !sessionId ||
    sessionId === "." ||
    sessionId === ".." ||
    sessionId.length > 200 ||
    typeof jwt !== "string" ||
    !jwt ||
    jwt.length > 16_384
  ) {
    return NextResponse.json(
      { error: "A valid sessionId and JWT are required" },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `${REACTOR_API_URL}/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not reach Reactor for session cleanup" },
      { status: 502 },
    );
  }

  // Cleanup is idempotent: a missing session has already been terminated.
  if (response.ok || response.status === 404) {
    return new Response(null, { status: 204 });
  }

  return NextResponse.json(
    { error: "Reactor session cleanup failed" },
    { status: response.status },
  );
}
