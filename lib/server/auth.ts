import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "orbis_auth";
export const AUTH_MAX_AGE = 7 * 24 * 60 * 60;

/** Cookie value derived from the password: changing SITE_PASSWORD logs everyone out. */
export function authToken(password = process.env.SITE_PASSWORD ?? "") {
  return createHmac("sha256", password).update("orbis-auth-v1").digest("hex");
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Set-Cookie value; Partitioned so it also works inside the extension's side-panel iframe. */
export function authCookie(value: string, maxAge = AUTH_MAX_AGE) {
  return `${AUTH_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=None; Partitioned`;
}
