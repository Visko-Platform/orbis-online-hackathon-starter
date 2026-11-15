"use client";

// Batches browser timing events and ships them to /api/telemetry.
type Event = { op: string; ms: number; ok?: boolean; at?: number; [key: string]: unknown };

const CLIENT_ID =
  typeof window === "undefined" ? "ssr" : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
let queue: Event[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function flush(beacon = false) {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!queue.length) return;
  const body = JSON.stringify({ client: CLIENT_ID, events: queue });
  queue = [];
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/telemetry", new Blob([body], { type: "application/json" }));
  } else {
    void fetch("/api/telemetry", { method: "POST", body, keepalive: true }).catch(() => undefined);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => flush(true));
}

export function track(op: string, ms: number, meta: Record<string, unknown> = {}) {
  queue.push({ op, ms: Math.round(ms), at: Date.now(), ...meta });
  if (process.env.NODE_ENV !== "production") console.debug(`[profile] ${op} ${Math.round(ms)}ms`, meta);
  timer ??= setTimeout(() => flush(), 3000);
}

/** Time an async function and record it (ok=false on throw). */
export async function timed<T>(op: string, fn: () => Promise<T>, meta: Record<string, unknown> = {}): Promise<T> {
  const t0 = performance.now();
  try {
    const result = await fn();
    track(op, performance.now() - t0, { ok: true, ...meta });
    return result;
  } catch (error) {
    track(op, performance.now() - t0, { ok: false, error: String(error).slice(0, 200), ...meta });
    throw error;
  }
}
