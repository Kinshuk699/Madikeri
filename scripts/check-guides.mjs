// Checks a built dist/ guides section: JSON-LD parses and has the right types, FAQ markup == FAQPage JSON-LD,
// breadcrumbs, author + updated lines, single property link, no em dashes, internal links resolve,
// pillar link present, sitemap/llms/indexnow entries. Usage: node scripts/check-guides.mjs [dist]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
const DIST = path.resolve(process.argv[2] || "dist");
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
const gdir = path.join(DIST, "guides");
const slugs = readdirSync(gdir).filter((d) => existsSync(path.join(gdir, d, "index.html")));
const sitemap = readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
const llms = readFileSync(path.join(DIST, "llms.txt"), "utf8");
const manifest = JSON.parse(readFileSync(path.join(DIST, "indexnow-manifest.json"), "utf8"));
const html = (p) => readFileSync(p, "utf8");
const pillar = slugs.find((s) => html(path.join(gdir, s, "index.html")).includes('"isPillar"')) ; // not used
for (const s of slugs) {
  const h = html(path.join(gdir, s, "index.html"));
  const tag = `[${s}]`;
  const ld = JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const types = ld["@graph"].map((n) => n["@type"]);
  for (const t of ["Article", "BreadcrumbList", "FAQPage"]) ok(types.includes(t), `${tag} JSON-LD missing ${t}`);
  const faq = ld["@graph"].find((n) => n["@type"] === "FAQPage");
  const visibleQs = [...h.matchAll(/<summary><h3>([\s\S]*?)<\/h3><\/summary>/g)].map((m) => m[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
  ok(faq.mainEntity.length >= 4 && faq.mainEntity.length <= 6, `${tag} FAQ count ${faq.mainEntity.length}`);
  ok(JSON.stringify(visibleQs) === JSON.stringify(faq.mainEntity.map((q) => q.name)), `${tag} visible FAQ != JSON-LD FAQ`);
  ok(/<p class="g-updated">Updated <time datetime="\d{4}-\d{2}-\d{2}">[A-Z][a-z]+ \d{4}<\/time><\/p>/.test(h), `${tag} no Updated line`);
  ok(h.includes("Written by Ansh, who owns and is selling land in Galibeedu."), `${tag} no author line`);
  ok(h.includes(`<link rel="canonical" href="https://landincoorg.in/guides/${s}/" />`), `${tag} canonical`);
  ok(/<nav class="g-crumbs"/.test(h), `${tag} no breadcrumb`);
  const art = h.slice(h.indexOf('<article'), h.indexOf('</article>'));
  const prop = (art.match(/href="(https:\/\/landincoorg\.in\/?|\/)(#[^"]*)?"/g) || []).length;
  ok(prop === 1, `${tag} property links in article: ${prop}`);
  ok(!h.includes("\u2014"), `${tag} em dash present`);
  for (const m of h.matchAll(/href="\/guides\/([a-z0-9-]+)\/"/g)) ok(slugs.includes(m[1]), `${tag} broken guide link /guides/${m[1]}/`);
  ok(sitemap.includes(`https://landincoorg.in/guides/${s}/`) || /noindex/.test(h), `${tag} not in sitemap`);
  ok(llms.includes(`https://landincoorg.in/guides/${s}/`) || /noindex/.test(h), `${tag} not in llms.txt`);
  ok(manifest.urls.some((u) => u.loc.endsWith(`/guides/${s}/`)) || /noindex/.test(h), `${tag} not in IndexNow manifest`);
  const words = art.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  console.log(`${s}: ${words} words · FAQ ${faq.mainEntity.length} · types ${types.join(",")} · robots ${(h.match(/name="robots" content="([^"]+)"/) || [])[1]}`);
}
const nonPillar = slugs.filter((s) => s !== "how-to-buy-land-in-coorg");
if (slugs.includes("how-to-buy-land-in-coorg")) for (const s of nonPillar)
  ok(html(path.join(gdir, s, "index.html")).includes('href="/guides/how-to-buy-land-in-coorg/"'), `[${s}] no link to pillar`);
ok(existsSync(path.join(gdir, "index.html")), "no /guides/ index");
const home = html(path.join(DIST, "index.html"));
ok(home.includes('href="/guides/"'), "property page has no Guides link");
ok(existsSync(path.join(DIST, "855c7e9944ffa43349baf16d26676c25.txt")), "IndexNow key file missing");
console.log(fail.length ? "FAIL\n- " + fail.join("\n- ") : `OK: ${slugs.length} guide page(s) pass every check`);
process.exit(fail.length ? 1 : 0);
