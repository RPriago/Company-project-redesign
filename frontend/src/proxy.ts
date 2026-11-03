import { NextResponse } from "next/server.js";
import type { NextRequest } from "next/server.js";

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").origin;
  const csp = ["default-src 'self'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`, "style-src 'self' 'unsafe-inline'", "img-src 'self' data: https: blob:", "font-src 'self' data:", "frame-src 'none'", `connect-src 'self' ${apiOrigin}${process.env.NODE_ENV === "development" ? " ws://localhost:3000 ws://127.0.0.1:3000" : ""}`, "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'"].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  // Next.js reads CSP on the request to nonce its framework scripts.
  headers.set("Content-Security-Policy", csp);
  let response = NextResponse.next({request:{headers}});
  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login") {
    const token = request.cookies.get("petronesia_session")?.value;
    let valid = false;
    if (token) {
      try {
        const session = await fetch(new URL("/api/gateway/admin/me", request.url), {headers:{cookie:`petronesia_session=${token}`},cache:"no-store",signal:AbortSignal.timeout(10000)});
        valid = session.ok;
      } catch { /* Fail closed when session validation is unavailable. */ }
    }
    if (!valid) response = NextResponse.redirect(new URL("/admin/login",request.url));
  }
  if (request.nextUrl.pathname.startsWith("/admin")) response.headers.set("Cache-Control", "no-store");
  response.headers.set(process.env.CSP_MODE === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",csp);
  response.headers.set("X-Frame-Options","DENY");
  response.headers.set("X-Content-Type-Options","nosniff");
  response.headers.set("Referrer-Policy","strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=(), browsing-topics=()");
  response.headers.set("Strict-Transport-Security","max-age=31536000; includeSubDomains");
  return response;
}
export const config = {matcher:["/((?!api|_next/static|_next/image|favicon.ico|images).*)"]};
