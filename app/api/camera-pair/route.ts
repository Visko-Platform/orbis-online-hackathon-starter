import { randomBytes } from "node:crypto";
import { readBoundedBody } from "@/lib/server/local-request";

export const runtime = "nodejs";

type Pair = { guest: string; host: string; expires: number; offer: string; answer?: string };
const pairs = new Map<string, Pair>();
const token = () => randomBytes(24).toString("base64url");
const reply = (body: object, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  if (!host || ![ `http://${host}`, `https://${host}` ].includes(origin ?? "")) {
    return reply({}, 403);
  }
  const bounded = await readBoundedBody(request, 48 * 1024);
  if ("error" in bounded) return bounded.error;
  const body = await bounded.body.json().catch(() => null);
  if (!body || typeof body !== "object") return reply({}, 400);

  const now = Date.now();
  for (const [id, pair] of pairs) if (pair.expires <= now) pairs.delete(id);
  if (body.action === "create") {
    if (!/^127\.0\.0\.1:[0-9]{1,5}$/.test(host) || origin !== `http://${host}`) return reply({}, 403);
    if (typeof body.sdp !== "string" || !body.sdp) return reply({}, 400);
    if (pairs.size >= 16) return reply({}, 429);
    const id = token();
    const pair = { guest: token(), host: token(), expires: now + 120_000, offer: body.sdp };
    pairs.set(id, pair);
    return reply({ id, guest: pair.guest, host: pair.host });
  }

  const pair = pairs.get(body.id);
  if (!pair) return reply({}, 410);
  if (body.action === "poll" || body.action === "close") {
    if (body.key !== pair.host) return reply({}, 403);
    if (body.action === "close" || pair.answer) pairs.delete(body.id);
    return reply({ sdp: pair.answer });
  }
  if (body.key !== pair.guest || pair.answer) return reply({}, 410);
  if (body.action === "offer") return reply({ sdp: pair.offer });
  if (body.action === "answer" && typeof body.sdp === "string" && body.sdp) {
    pair.answer = body.sdp;
    return reply({});
  }
  return reply({}, 400);
}
