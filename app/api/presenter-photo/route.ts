import { readFile } from "node:fs/promises";
import path from "node:path";

import { CACHE_DIR } from "@/lib/server/cache";

export const runtime = "nodejs";

// The presenter's default "You" photo (password-gated like the rest of the site).
// Put your own 16:9-friendly portrait at CACHE_DIR/presenter.jpg; until then a fictional stand-in is used.
export async function GET() {
  const buf =
    (await readFile(path.join(CACHE_DIR, "presenter.jpg")).catch(() => null)) ??
    (await readFile(path.join(process.cwd(), "public/assets/street-model.jpg")).catch(() => null));
  if (!buf) return new Response("No presenter photo", { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=600" } });
}
