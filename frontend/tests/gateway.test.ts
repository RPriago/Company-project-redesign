import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server.js";
import { POST, GET } from "../src/app/api/gateway/[...path]/route.ts";

const context = (path: string) => ({ params: Promise.resolve({ path: path.split("/") }) });
const origin = "https://company.example";
const mutationHeaders = { origin, "sec-fetch-site": "same-origin", "x-csrf-protection": "1" };

test("gateway blocks cross-origin mutations and missing CSRF markers before fetching", async () => {
  const stub = mock.method(globalThis, "fetch", async () => { throw new Error("unexpected upstream"); });
  try {
    for (const headers of [{}, { ...mutationHeaders, origin: "https://attacker.example" }, { ...mutationHeaders, "sec-fetch-site": "cross-site" }]) {
      const response = await POST(new NextRequest(`${origin}/api/gateway/auth/login`, { method: "POST", headers }), context("auth/login"));
      assert.equal(response.status, 403);
      assert.equal(response.headers.get("cache-control"), "no-store");
    }
    assert.equal(stub.mock.callCount(), 0);
  } finally { stub.mock.restore(); }
});

test("gateway puts login token only in HttpOnly cookie and forwards session server-side", async () => {
  process.env.BACKEND_API_URL = "https://backend.example/api";
  process.env.ADMIN_GATEWAY_SECRET = "x".repeat(32);
  const token = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now()/1000)+3600 })).toString("base64url")}.signature`;
  const calls: RequestInit[] = [];
  const stub = mock.method(globalThis, "fetch", async (_url: unknown, init: RequestInit) => {
    calls.push(init);
    return Response.json(calls.length === 1 ? { success: true, token } : { success: true, data: [] });
  });
  try {
    const login = await POST(new NextRequest(`${origin}/api/gateway/auth/login`, { method: "POST", headers: mutationHeaders, body: "{}" }), context("auth/login"));
    assert.equal(login.status, 200);
    assert.equal((await login.json()).token, undefined);
    assert.match(login.headers.get("set-cookie") || "", /HttpOnly/i);
    assert.match(login.headers.get("set-cookie") || "", /SameSite=lax/i);
    assert.equal(login.headers.get("cache-control"), "no-store");
    const response = await GET(new NextRequest(`${origin}/api/gateway/admin/contacts?page=2&limit=20`, { headers: { cookie: `petronesia_session=${token}`, authorization: "Bearer attacker" } }), context("admin/contacts"));
    assert.equal(response.status, 200);
    assert.equal(new Headers(calls[1].headers).get("Authorization"), `Bearer ${token}`);
    assert.equal(new Headers(calls[1].headers).get("X-Admin-Gateway-Secret"), "x".repeat(32));
  } finally { stub.mock.restore(); delete process.env.BACKEND_API_URL; delete process.env.ADMIN_GATEWAY_SECRET; }
});

test("gateway rejects unauthenticated reads and paths outside its allowlist", async () => {
  process.env.BACKEND_API_URL = "https://backend.example/api";
  process.env.ADMIN_GATEWAY_SECRET = "x".repeat(32);
  try {
    assert.equal((await GET(new NextRequest(`${origin}/api/gateway/admin/me`), context("admin/me"))).status, 401);
    assert.equal((await GET(new NextRequest(`${origin}/api/gateway/other`), context("other"))).status, 404);
  } finally { delete process.env.BACKEND_API_URL; delete process.env.ADMIN_GATEWAY_SECRET; }
});
