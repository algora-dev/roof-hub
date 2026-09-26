import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isCanonicalHost, isIndexingEnabled, SITE_HOST } from "@/lib/site";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");

  // Vercel already redirects roofhub.co.nz -> www, but this keeps the
  // application itself consistent if DNS/platform configuration changes.
  if (host?.split(":")[0] === "roofhub.co.nz" && SITE_HOST === "www.roofhub.co.nz") {
    const target = request.nextUrl.clone();
    target.protocol = "https";
    target.host = SITE_HOST;
    return NextResponse.redirect(target, 308);
  }

  const response = NextResponse.next();
  const canonical = isCanonicalHost(host);

  // Preview/vercel.app hosts must never become duplicate indexable copies.
  if (!isIndexingEnabled() || !canonical) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
