import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

const SESSION_COOKIE = "barberhub_session";

function resolveLocaleFromCountry(country: string | undefined): Locale {
  return country === "LT" ? "lt" : "az";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const response = NextResponse.next();

  // Re-derive the locale from geolocation on every request instead of only
  // once — otherwise a single bad IP-to-country lookup (VPN, mobile carrier
  // routing, a stale Vercel geo entry) pins the visitor to the wrong
  // language for a full year with no way to self-correct.
  const { country } = geolocation(request);
  response.cookies.set(LOCALE_COOKIE, resolveLocaleFromCountry(country), {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|images|sw\\.js|.*\\.(?:ico|png|jpg|jpeg|svg|webmanifest)).*)",
  ],
};
