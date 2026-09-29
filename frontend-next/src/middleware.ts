import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/profile", "/soil-health", "/khet-diary", "/settings"];

function backendUrl() {
  return process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production" ? "https://krishiai-api.onrender.com" : "http://127.0.0.1:8000");
}

function loginRedirect(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoute = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (!protectedRoute) return NextResponse.next();

  const cookie = request.headers.get("cookie");
  if (!cookie) return loginRedirect(request);

  try {
    // Validate against the same database-backed session dependency used by all
    // protected API endpoints. Cookie presence alone is never authorization.
    const me = await fetch(`${backendUrl()}/api/auth/me`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (me.ok) return NextResponse.next();

    if (me.status !== 401 || !request.cookies.has("krishiai_refresh_session")) {
      return loginRedirect(request);
    }

    // A valid persistent refresh cookie means the short-lived access token has
    // merely expired. Renew it before allowing the protected page to render.
    const refresh = await fetch(`${backendUrl()}/api/auth/refresh-session`, {
      method: "POST",
      headers: { cookie },
      cache: "no-store",
    });
    if (!refresh.ok) return loginRedirect(request);

    const response = NextResponse.next();
    // Forward ALL Set-Cookie headers from the refresh response.
    // response.headers.get() returns only the first value; we need every
    // cookie the backend sets (krishiai_session + krishiai_refresh_session).
    const rawSetCookie = refresh.headers.getSetCookie
      ? refresh.headers.getSetCookie()           // Node 18+ / Undici
      : (refresh.headers.get("set-cookie") ?? "").split(/,(?=[^ ])/); // fallback
    for (const cookie of rawSetCookie) {
      if (cookie) response.headers.append("set-cookie", cookie);
    }
    return response;
  } catch {
    // A route cannot be trusted if its authoritative session service is
    // unreachable, so fail closed rather than rendering protected UI.
    return loginRedirect(request);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/soil-health/:path*", "/khet-diary/:path*", "/settings/:path*"],
};
