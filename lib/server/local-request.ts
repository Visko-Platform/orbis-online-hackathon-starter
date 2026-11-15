const requestWindows = new Map<string, { count: number; resetsAt: number }>();

export function requireLocalRequest(
  request: Request,
  route: string,
  requestsPerMinute: number,
): Response | undefined {
  const host = request.headers.get("host");
  if (
    !host ||
    !/^127\.0\.0\.1(?::[0-9]{1,5})?$/.test(host) ||
    request.headers.get("origin") !== `http://${host}` ||
    request.headers.get("sec-fetch-site") !== "same-origin"
  ) {
    return Response.json({ error: "Open the app at its local address" }, { status: 403 });
  }

  const now = Date.now();
  let window = requestWindows.get(route);
  if (!window || window.resetsAt <= now) {
    window = { count: 0, resetsAt: now + 60_000 };
    requestWindows.set(route, window);
  }
  if (window.count >= requestsPerMinute) {
    return Response.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((window.resetsAt - now) / 1_000)) } },
    );
  }
  window.count += 1;
}

export async function readBoundedBody(
  request: Request,
  maxBytes: number,
): Promise<{ body: Response } | { error: Response }> {
  const reader = request.body?.getReader();
  const headers = { "Content-Type": request.headers.get("content-type") ?? "" };
  const tooLarge = () => Response.json({ error: "Request body is too large" }, { status: 413 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    if (Number(request.headers.get("content-length")) > maxBytes) {
      void reader?.cancel().catch(() => undefined);
      return { error: tooLarge() };
    }
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          void reader.cancel().catch(() => undefined);
          return { error: tooLarge() };
        }
        chunks.push(value);
      }
    }
    return { body: new Response(new Uint8Array(Buffer.concat(chunks, size)), { headers }) };
  } catch {
    return { error: Response.json({ error: "Could not read request body" }, { status: 400 }) };
  } finally {
    reader?.releaseLock();
  }
}
