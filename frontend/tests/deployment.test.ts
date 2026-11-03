import { test, mock } from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import {
  changedContent, fetchEvents, fetchEventBySlug, fetchJobs, fetchSiteContent,
  fetchFuelPrices, fetchFuelRegions, FUEL_REFERENCE_DATE, DEFAULT_SITE_CONTENT,
} from "../src/lib/api.ts";

test("empty API data never becomes sample records or CMS defaults", async () => {
  const calls: string[] = [];
  const stub = mock.method(axios, "get", async (url: string) => {
    calls.push(url);
    return { data: { success: true, data: [], map: {}, meta: { total: 0, page: 1, limit: 6, last_page: 1 } } };
  });
  try {
    assert.deepEqual((await fetchEvents()).data, []);
    assert.deepEqual((await fetchJobs()).data, []);
    assert.deepEqual(await fetchSiteContent("home"), { data: [], map: {} });
    assert.ok(calls.at(-1)?.endsWith("/content/home"));
  } finally { stub.mock.restore(); }
});

test("API failures stay failures, while a real article 404 returns null", async () => {
  const stub = mock.method(axios, "get", async () => { throw new Error("offline"); });
  try {
    await assert.rejects(fetchEvents(), /offline/);
    await assert.rejects(fetchJobs(), /offline/);
    await assert.rejects(fetchSiteContent(), /offline/);
    await assert.rejects(fetchEventBySlug("missing"), /offline/);
  } finally { stub.mock.restore(); }
  const missing = mock.method(axios, "get", async () => { throw { isAxiosError: true, response: { status: 404 } }; });
  try { assert.equal(await fetchEventBySlug("missing"), null); } finally { missing.mock.restore(); }
});

test("CMS diff sends one changed field and never the static defaults", () => {
  const baseline = { ...DEFAULT_SITE_CONTENT };
  assert.deepEqual(changedContent(baseline, baseline), {});
  assert.deepEqual(changedContent({ ...baseline, hero_headline: "Owner content" }, baseline), { hero_headline: "Owner content" });
  assert.deepEqual(changedContent({ ...baseline, hero_headline: "" }, baseline), { hero_headline: "" });
});

test("fuel reference filters work without HTTP or database access", async () => {
  const stub = mock.method(axios, "get", async () => { throw new Error("must not request API"); });
  try {
    const regions = await fetchFuelRegions();
    assert.equal(regions.total_provinces, 40);
    const prices = await fetchFuelPrices({ province: "DKI Jakarta", category: "diesel" });
    assert.ok(prices.data.length > 0);
    assert.ok(prices.data.every(item => item.category === "diesel" && item.effectiveDate === FUEL_REFERENCE_DATE));
    assert.equal(prices.meta.status, "reference");
    assert.deepEqual((await fetchFuelPrices({ province: "unknown" })).data, []);
    assert.deepEqual((await fetchFuelPrices({ province: "DKI Jakarta", zone: "wrong zone" })).data, []);
    assert.equal(stub.mock.callCount(), 0);
  } finally { stub.mock.restore(); }
});
