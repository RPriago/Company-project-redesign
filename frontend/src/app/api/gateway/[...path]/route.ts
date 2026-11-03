import { NextRequest, NextResponse } from "next/server.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cookieName = "petronesia_session";
const routes: [RegExp, string[]][] = [
  [/^auth\/login$/, ["POST"]],
  [/^admin\/(me|stats|audit-logs|contacts)$/, ["GET"]],
  [/^admin\/logout$/, ["POST"]],
  [/^admin\/password$/, ["PUT"]],
  [/^admin\/(register|upload|fuel-prices\/sync)$/, ["POST"]],
  [/^admin\/(events|jobs|content)$/, ["GET", "POST", "PUT"]],
  [/^admin\/(events|jobs|content|fuel-prices)\/[^/]+$/, ["PUT", "DELETE"]],
];
function privateJson(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return NextResponse.json(data, { ...init, headers });
}
async function handle(request: NextRequest, context: { params: Promise<{path: string[]}> }) {
  const { path } = await context.params;
  const target = path.join("/");
  if (path.some(p => !p || p === "." || p === ".." || /[\\/%?#]/.test(p)) || !routes.some(([pattern, methods]) => pattern.test(target) && methods.includes(request.method)))
    return privateJson({success:false,message:"Not found"},{status:404});
  if (!["GET", "HEAD"].includes(request.method)) {
    const site = request.headers.get("sec-fetch-site");
    if (request.headers.get("origin") !== request.nextUrl.origin || (site !== null && site !== "same-origin") || request.headers.get("x-csrf-protection") !== "1")
      return privateJson({success:false,message:"Invalid request origin"},{status:403});
  }
  const backend = process.env.BACKEND_API_URL;
  const secret = process.env.ADMIN_GATEWAY_SECRET;
  if (!backend || !/^https?:\/\//.test(backend) || !backend.replace(/\/$/, "").endsWith("/api") || !secret || secret.length < 32)
    return privateJson({success:false,message:"Gateway unavailable"},{status:503});
  const login = target === "auth/login";
  const token = request.cookies.get(cookieName)?.value;
  if (!login && !token) return privateJson({success:false,message:"Sign in required"},{status:401});
  const headers = new Headers({"X-Admin-Gateway-Secret":secret});
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type",contentType);
  if (token && !login) headers.set("Authorization",`Bearer ${token}`);
  // Vercel overwrites this header; never forward arbitrary browser X-Forwarded-For.
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (process.env.VERCEL && ip) headers.set("X-Admin-Client-IP", ip);
  try {
    const upstream = await fetch(`${backend.replace(/\/$/, "")}/${target}${request.nextUrl.search}`, {method:request.method, headers, body:request.method === "GET" ? undefined : await request.arrayBuffer(), cache:"no-store", redirect:"error", signal:AbortSignal.timeout(65000)});
    const data = await upstream.json();
    const sessionToken = login && upstream.ok && typeof data.token === "string" ? data.token : undefined;
    delete data.token;
    const response = privateJson(data,{status:upstream.status,headers:{"Cache-Control":"no-store"}});
    if (sessionToken) response.cookies.set(cookieName,sessionToken,{httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"lax",path:"/",maxAge:Math.max(0, Math.min(86400, Number(JSON.parse(Buffer.from(sessionToken.split(".")[1], "base64url").toString()).exp) - Math.floor(Date.now()/1000)))});
    if (upstream.status === 401 || (upstream.ok && (target === "admin/logout" || target === "admin/password"))) response.cookies.set(cookieName,"",{httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"lax",path:"/",maxAge:0});
    return response;
  } catch { return privateJson({success:false,message:"Gateway unavailable"},{status:502}); }
}
export { handle as GET, handle as POST, handle as PUT, handle as DELETE, handle as PATCH };
