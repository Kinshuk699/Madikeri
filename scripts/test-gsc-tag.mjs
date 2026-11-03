// Test the Search Console tag slot without touching src/: builds the head with a fake code in a temp copy.
// Usage: node scripts/test-gsc-tag.mjs
import { execSync } from "node:child_process";
import { mkdtempSync, cpSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const run = (dir) => execSync("node scripts/build.mjs", { cwd: dir, env: { ...process.env, CONTEXT: "production" }, stdio: "pipe" });
const count = (dir, f) => (readFileSync(path.join(dir, "dist", f), "utf8").match(/google-site-verification/g) || []).length;

const t = mkdtempSync(path.join(tmpdir(), "gsc-"));
cpSync(root, t, { recursive: true, filter: (s) => !s.includes(`${path.sep}dist`) && !s.includes(`${path.sep}.git`) });
run(t);
console.log(`empty value  -> tags on /: ${count(t, "index.html")}`);
const f = path.join(t, "src/facts.js");
writeFileSync(f, readFileSync(f, "utf8").replace('googleSiteVerification: ""', 'googleSiteVerification: "TEST_abc-123_XYZ"'));
run(t);
const tag = readFileSync(path.join(t, "dist/index.html"), "utf8").match(/<meta name="google-site-verification"[^>]*>/);
console.log(`test value   -> tags on /: ${count(t, "index.html")} · ${tag && tag[0]}`);
console.log(`(temp copy ${t}; the real src/ was not modified)`);
