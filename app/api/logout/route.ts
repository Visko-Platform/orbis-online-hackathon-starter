import { authCookie } from "@/lib/server/auth";

export async function POST() {
  return new Response(null, { status: 204, headers: { "Set-Cookie": authCookie("", 0) } });
}
