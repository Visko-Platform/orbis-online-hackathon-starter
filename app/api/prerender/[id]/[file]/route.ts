import { readFile } from "node:fs/promises";
import path from "node:path";

import { prerenderDir } from "@/lib/server/prerender";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  const { id, file } = await params;
  if (!/^[a-zA-Z0-9-]+\.jpg$/.test(file)) return new Response("Bad name", { status: 400 });
  const buf = await readFile(path.join(prerenderDir(id), file)).catch(() => null);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" } });
}
