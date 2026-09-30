import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/profile", "/soil-health", "/khet-diary", "/settings"];

function backendUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://krishiai-api.onrender.com"
      : "http://127.0.0.1:8000")
  );
}

function loginRedirect(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

/** fetch with an explicit timeout so a cold-starting Render instance
 *  never hangs the Vercel Edge function until it times out. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  ms = 8000
): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoute = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (!protectedRoute) return NextResponse.next();

  const cookie = request.headers.get("cookie");
  const hasSession = request.cookies.has("krishiai_session");
  const hasRefresh = request.cookies.has("krishiai_refresh_session");

  // No auth cookies at all → definitely not logged in.
  if (!cookie || (!hasSession && !hasRefresh)) return loginRedirect(request);

  try {
    const me = await fetchWithTimeout(`${backendUrl()}/api/auth/me`, {
      headers: { cookie },
      cache: "no-store",
    });

    if (me.ok) return NextResponse.next();

    // Anything other than 401, or no refresh cookie → force re-login.
    if (me.status !== 401 || !hasRefresh) return loginRedirect(request);

    // Access token expired but refresh cookie exists — renew silently.
    const refresh = await fetchWithTimeout(
      `${backendUrl()}/api/auth/refresh-session`,
      { method: "POST", headers: { cookie }, cache: "no-store" }
    );
    if (!refresh.ok) return loginRedirect(request);

    const response = NextResponse.next();
    // Forward ALL Set-Cookie headers (get() returns only the first one).
    const setCookies: string[] = (refresh.headers as any).getSetCookie?.() ??
      (refresh.headers.get("set-cookie") ?? "").split(/,(?=[^ ])/);
    for (const c of setCookies) {
      if (c) response.headers.append("set-cookie", c);
    }
    return response;
  } catch {
    // Backend unreachable or timed out (Render cold start).
    // Cookies are present but we can't verify right now — let the page
    // load and allow the client-side AuthGate to validate once the
    // backend finishes starting up. This is far better than false-
    // logging the user out on every cold start.
    if (hasSession || hasRefresh) return NextResponse.next();
    return loginRedirect(request);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/soil-health/:path*",
    "/khet-diary/:path*",
    "/settings/:path*",
  ],
};
