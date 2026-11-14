import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET(_: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  const bundle = asset === "vision_bundle.mjs";
  if (!bundle && !/^vision_wasm_(?:nosimd_)?internal\.(?:js|wasm)$/.test(asset)) {
    return new Response(null, { status: 404 });
  }
  const bytes = await readFile(join(process.cwd(), "node_modules", "@mediapipe", "tasks-vision", bundle ? "" : "wasm", asset));
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": asset.endsWith(".wasm") ? "application/wasm" : "text/javascript",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
