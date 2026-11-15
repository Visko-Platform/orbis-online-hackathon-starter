import { getOmniAsset } from "@/lib/server/omni";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ plan: string; idx: string }> }) {
  const { plan, idx } = await params;
  const asset = getOmniAsset(plan, Number(idx));
  if (!asset) return new Response("Not found (plans expire after 2 hours)", { status: 404 });
  return new Response(new Uint8Array(asset.buf), {
    headers: { "Content-Type": asset.mime, "Cache-Control": "private, max-age=7200" },
  });
}
