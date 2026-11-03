import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ignore = require("ignore");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (["node_modules", ".next", ".git", ".vercel"].includes(entry.name)) return [];
    const path = resolve(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
for (const [service, config] of [["backend", ".dockerignore"], ["frontend", ".dockerignore"], ["frontend", ".vercelignore"]]) {
  const dir = resolve(root, service);
  const rules = ignore().add(readFileSync(resolve(dir, config), "utf8"));
  for (const sample of ["AGENTS.md", "nested/RTK.md", "DEPLOYMENT_PLAN.md", ".agents/skills/private.md", "code_test.go", "tests/deployment.test.ts", "nested/testdata/sample.json", "nested/migrations/001.sql", "nested/local.db-wal", "nested/local.sqlite3-shm", ".env.production"]) {
    assert.ok(rules.ignores(sample), `${service}/${config} leaks ${sample}`);
  }
  if (service === "backend") {
    for (const sample of ["cmd/migrate/main.go", "cmd/migrate/petronesia.db", "cmd/bootstrap-admin/main.go", "uploads/image.png"]) assert.ok(rules.ignores(sample), `backend leaks ${sample}`);
  }
  for (const sample of service === "backend" ? ["main.go", "models/admin.go", "go.mod", "go.sum"] : ["src/app/page.tsx", "package.json", "package-lock.json", "public/images/example.jpg"]) {
    assert.ok(!rules.ignores(sample), `${service}/${config} excludes required ${sample}`);
  }
  const shipped = files(dir).map(path => relative(dir, path)).filter(path => !rules.ignores(path));
  assert.ok(!shipped.some(path => /\.md$|_test\.go$|\.(test|spec)\.|\.db(?:-|$)|^cmd\//.test(path)), `${service}/${config} leaks development files`);
  console.log(`${service}/${config}: ${shipped.length} project input files; development exclusions verified`);
}
