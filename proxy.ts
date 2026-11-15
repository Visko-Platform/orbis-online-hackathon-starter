import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE, authToken, safeEqual } from "@/lib/server/auth";

// Password gate for the whole site (pages, APIs, assets). Off when SITE_PASSWORD is unset.
const OPEN = ["/login", "/api/login", "/favicon.ico"];

export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  // Sample images are public so the extension's background worker (no cookies) can fetch og:images.
  if (OPEN.includes(pathname) || pathname.startsWith("/assets/")) return NextResponse.next();

  const cookie = request.cookies.get(AUTH_COOKIE)?.value ?? "";
  const header = request.headers.get("x-orbis-key") ?? ""; // scripts / curl
  if ((cookie && safeEqual(cookie, authToken(password))) || (header && safeEqual(header, password))) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
