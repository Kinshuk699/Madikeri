// Monthly price table for /guides/land-prices-madikeri/.
//   node scripts/price-summary.mjs content/data/prices-YYYY-MM.csv
// Prints the summary numbers and a Markdown table (paste into content/guides/05-land-prices-madikeri.md).
// Per-acre figures are COMPUTED from the asking price and are labelled that way. Never edit listing figures.
import { readFileSync } from "node:fs";

function parseCsv(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

export const inr = (n) => n >= 1e7 ? `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")} crore` : `₹${Math.round(n / 1e5)} lakh`;
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const day = (iso) => { const [y, m, d] = iso.split("-"); return `${Number(d)} ${MONTHS[m - 1]} ${y}`; };

export function summarise(file) {
  const rows = parseCsv(readFileSync(file, "utf8")).map((r) => {
    const v = Number(r.total_or_per_acre_inr), a = Number(r.acres);
    if (!v || !a) throw new Error(`bad row: ${JSON.stringify(r)}`);
    return { ...r, perAcre: r.price_basis === "per acre" ? v : v / a };
  });
  const pa = rows.map((r) => r.perAcre);
  return { rows, n: rows.length, min: Math.min(...pa), med: median(pa), max: Math.max(...pa),
    byLocality: (loc) => { const p = rows.filter((r) => r.locality === loc).map((r) => r.perAcre);
      return p.length ? { n: p.length, min: Math.min(...p), med: median(p), max: Math.max(...p) } : null; } };
}

if (process.argv[1] && process.argv[1].endsWith("price-summary.mjs")) {
  const s = summarise(process.argv[2]);
  const g = s.byLocality("Galibeedu");
  console.log(`Listings: ${s.n} · per acre (computed): lowest ${inr(s.min)} · median ${inr(s.med)} · highest ${inr(s.max)}`);
  if (g) console.log(`Galibeedu only: ${g.n} · lowest ${inr(g.min)} · median ${inr(g.med)} · highest ${inr(g.max)}`);
  console.log("\n| Locality (as listed) | Type (as listed) | Area (as listed) | Asking price (as listed) | Per acre (computed) | Source | Checked |\n|---|---|---|---|---|---|---|");
  for (const r of [...s.rows].sort((a, b) => a.perAcre - b.perAcre)) {
    const host = r.source.replace(/^www\./, "");
    console.log(`| ${r.locality} | ${r.land_type_as_listed} | ${r.area_as_listed} | ${r.asking_price_as_listed} | ${inr(r.perAcre)} | [${host}](${r.url}) | ${day(r.date_checked)} |`);
  }
}
