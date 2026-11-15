import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Append-only JSONL profiling log. One line per timed operation.
//   server ops: api.*, gemini.*, reactor.*      -> server.jsonl
//   browser ops (via /api/telemetry): orbis.*, client.* -> client.jsonl
const DIR = process.env.PROFILE_DIR || path.join(process.cwd(), "logs");
let ready: Promise<unknown> | null = null;

export type ProfileEvent = { op: string; ms: number; ok?: boolean; [key: string]: unknown };

export async function writeEvents(file: "server.jsonl" | "client.jsonl", events: ProfileEvent[]) {
  if (!events.length) return;
  ready ??= mkdir(DIR, { recursive: true });
  await ready;
  const now = new Date().toISOString();
  const lines = events.map((e) => JSON.stringify({ ts: now, ...e })).join("\n") + "\n";
  await appendFile(path.join(DIR, file), lines).catch((err) => console.error("profile log write failed", err));
}

/** Start a timer; call the returned function with extra fields when done. */
export function profile(op: string, meta: Record<string, unknown> = {}) {
  const t0 = performance.now();
  return (extra: Record<string, unknown> = {}) => {
    const ms = Math.round(performance.now() - t0);
    const event = { op, ms, ok: true, ...meta, ...extra };
    console.log(`[profile] ${op} ${ms}ms ${JSON.stringify({ ...meta, ...extra })}`);
    void writeEvents("server.jsonl", [event]);
    return ms;
  };
}
