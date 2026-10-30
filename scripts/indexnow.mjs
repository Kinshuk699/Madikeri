// Manual IndexNow ping. Run AFTER a deploy is live.
//   node scripts/indexnow.mjs <url> [<url> ...]   -> ping just these URLs (normal monthly use)
//   node scripts/indexnow.mjs --all               -> ping every URL in the live /indexnow-manifest.json
import { pingIndexNow, HOST } from "./indexnow-lib.mjs";

const args = process.argv.slice(2);
if (!args.length) {
  console.error("Usage: node scripts/indexnow.mjs <url> [...]   or   node scripts/indexnow.mjs --all");
  process.exit(2);
}
let urls = args;
if (args[0] === "--all") {
  const live = await (await fetch(`https://${HOST}/indexnow-manifest.json`, { cache: "no-store" })).json();
  urls = live.urls.map((u) => u.loc);
}
for (const u of urls) if (!u.startsWith(`https://${HOST}/`)) { console.error(`Not a ${HOST} URL: ${u}`); process.exit(2); }
const r = await pingIndexNow(urls);
process.exit(r.status === 200 || r.status === 202 ? 0 : 1);
