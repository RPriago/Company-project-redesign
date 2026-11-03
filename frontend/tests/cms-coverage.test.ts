import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function publicSources(dir: string): string {
  return readdirSync(dir, { withFileTypes: true }).map(entry => {
    if (entry.name === "admin") return "";
    const path = join(dir, entry.name);
    return entry.isDirectory() ? publicSources(path) : path.endsWith(".tsx") ? readFileSync(path, "utf8") : "";
  }).join("\n");
}

test("every built-in CMS field has a public consumer", () => {
  const config = readFileSync("src/app/admin/content/page.tsx", "utf8").split("export default")[0];
  const keys = [...config.matchAll(/key: "([^"]+)"/g)].map(match => match[1]);
  const sources = publicSources("src");
  const consumers = new Set(keys.filter(key => sources.includes(`content.${key}`) || sources.includes(`content["${key}"]`)));
  // These templates are rendered using bounded arrays on the public pages.
  assert.ok(sources.includes('content[`subholding_${key}_title`]'));
  assert.ok(sources.includes('content[`subholding_${key}_desc`]'));
  assert.ok(sources.includes('content[`subholding_${key}_img`]'));
  for (const slug of ["phe", "kpi", "patraniaga", "pge", "pis", "pgn"]) {
    for (const field of ["title", "desc", "img"]) consumers.add(`subholding_${slug}_${field}`);
  }
  for (const field of ["val", "lbl"]) {
    assert.ok(sources.includes('content[`nze_stat_${i}_' + field + '`]'));
    for (const i of [1, 2, 3]) consumers.add(`nze_stat_${i}_${field}`);
  }
  assert.ok(keys.length >= 106);
  assert.deepEqual(keys.filter(key => !consumers.has(key)), []);
});
