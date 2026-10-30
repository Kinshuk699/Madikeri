// scripts/guides.mjs: build /guides/<slug>/ pages from content/guides/*.md
//
// Each guide is Markdown with a small front-matter block:
//   ---
//   title: <title tag>            description: <meta description>
//   h1: <page heading>            slug: <url slug>
//   published: YYYY-MM-DD         updated: YYYY-MM-DD
//   status: draft | approved      (drafts render only on deploy previews / local builds)
//   pillar: true                  (exactly one guide: "How to buy land in Coorg")
//   related: slug-a, slug-b
//   ---
// Body rules enforced at build time (the build FAILS on a violation):
//   - no em dashes anywhere in title, description or body
//   - an "## FAQs" section with 4-6 "### Question" entries (feeds visible FAQ + FAQPage JSON-LD)
//   - the property page (https://landincoorg.in/ or "/") linked exactly once in the body
//   - every /guides/<slug>/ link points at a guide that exists (links to drafts are
//     unlinked to plain text in production builds)
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";

const AUTHOR_LINE = "Written by Ansh, who owns and is selling land in Galibeedu.";
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const human = (iso) => { const [y, m] = iso.split("-"); return `${MONTHS[Number(m) - 1]} ${y}`; };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stripMd = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();

function parse(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const k of ["title", "description", "h1", "slug", "published", "updated", "status"]) {
    if (!fm[k]) throw new Error(`${file}: front matter is missing "${k}"`);
  }
  fm.related = (fm.related || "").split(",").map((s) => s.trim()).filter(Boolean);
  fm.pillar = fm.pillar === "true";
  return { ...fm, body: m[2].trim(), file };
}

function splitFaq(g) {
  const lines = g.body.split("\n");
  const start = lines.findIndex((l) => /^## FAQs\s*$/.test(l));
  if (start < 0) throw new Error(`${g.file}: needs an "## FAQs" section`);
  let end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  if (end < 0) end = lines.length;
  const faq = [];
  let cur = null;
  for (const l of lines.slice(start + 1, end)) {
    if (/^### /.test(l)) { cur = { q: l.slice(4).trim(), a: [] }; faq.push(cur); }
    else if (cur && l.trim()) cur.a.push(l.trim());
  }
  if (faq.length < 4 || faq.length > 6) throw new Error(`${g.file}: FAQ needs 4-6 questions, found ${faq.length}`);
  for (const f of faq) { f.aMd = f.a.join(" "); f.aText = stripMd(f.aMd); }
  return faq;
}

export function loadGuides(root, { includeDrafts }) {
  const dir = path.join(root, "content/guides");
  if (!existsSync(dir)) return { live: [], skipped: [] };
  const all = readdirSync(dir).filter((f) => f.endsWith(".md")).sort().map((f) => parse(path.join(dir, f)));
  const slugs = new Set();
  for (const g of all) {
    if (slugs.has(g.slug)) throw new Error(`duplicate guide slug ${g.slug}`);
    slugs.add(g.slug);
    for (const [k, v] of [["title", g.title], ["description", g.description], ["h1", g.h1], ["body", g.body]]) {
      if (v.includes("\u2014")) throw new Error(`${g.file}: em dash in ${k} (house style: none)`);
    }
    g.faq = splitFaq(g);
    const propLinks = (g.body.match(/\]\((https:\/\/landincoorg\.in\/?|\/)(#[^)]*)?\)/g) || []).length;
    if (propLinks !== 1) throw new Error(`${g.file}: link the property page exactly once (found ${propLinks})`);
  }
  if (all.filter((g) => g.pillar).length > 1) throw new Error("more than one pillar guide");
  const plannedFile = path.join(dir, "_planned.txt");
  const planned = existsSync(plannedFile)
    ? readFileSync(plannedFile, "utf8").split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#")) : [];
  for (const p of planned) if (!slugs.has(p)) slugs.add(p); // known, but not built: links render as plain text
  const live = all.filter((g) => includeDrafts || g.status === "approved");
  const skipped = all.filter((g) => !live.includes(g)).map((g) => g.slug);
  return { live, skipped, allSlugs: slugs };
}

export function buildGuides({ root, dist, site, cssUrl, includeDrafts }) {
  const { live, skipped, allSlugs } = loadGuides(root, { includeDrafts });
  const abs = (p) => site.origin + p;
  const liveSlugs = new Set(live.map((g) => g.slug));
  const pillar = live.find((g) => g.pillar);
  const bySlug = Object.fromEntries(live.map((g) => [g.slug, g]));

  // Links to guides: must exist; links to guides not in this build become plain text.
  const fixLinks = (md, file) => md.replace(/\[([^\]]+)\]\(\/guides\/([a-z0-9-]+)\/?(#[^)]*)?\)/g, (all, text, slug, hash) => {
    if (!allSlugs.has(slug)) throw new Error(`${file}: link to unknown guide /guides/${slug}/`);
    return liveSlugs.has(slug) ? `[${text}](/guides/${slug}/${hash || ""})` : text;
  });

  marked.use({ gfm: true, breaks: false });
  const renderer = new marked.Renderer();
  renderer.link = ({ href, title, tokens }) => {
    const text = marked.Parser.parseInline(tokens);
    const ext = /^https?:\/\//.test(href) && !href.startsWith(site.origin);
    return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}${ext ? ' rel="noopener"' : ""}>${text}</a>`;
  };
  renderer.table = (token) => `<div class="g-table">${marked.Renderer.prototype.table.call(renderer, token)}</div>`;

  const topbar = `<header class="topbar scrolled g-topbar">
  <a class="mark" href="/">Galibeedu</a>
  <nav><a href="/">Property</a><a href="/guides/">Guides</a><a href="/#contact">Inquire</a></nav>
  <div class="lang" lang="kn">ಗಾಳಿಬೀಡು</div>
</header>`;
  const footer = `<footer class="footer g-footer">
  <div><a class="mark" href="/">Galibeedu</a><div style="margin-top:8px" class="kannada">ಗಾಳಿಬೀಡು · The Valley of Wind</div></div>
  <div class="center"><a href="/guides/">Guides to buying land in Coorg</a><br/><span style="opacity:.6">© 2026 · landincoorg.in</span></div>
  <div class="right"><a href="/">1.87-acre land for sale in Galibeedu</a><br/><span style="opacity:.6">Offered directly by the owners</span></div>
</footer>`;
  const shell = ({ title, description, canonical, jsonld, body, ogType = "article", noindex = false }) => `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="${includeDrafts || noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="landincoorg.in" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${abs(site.ogImage)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#F5F0E8" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM summary" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Manrope:wght@400;500;600&family=Noto+Sans+Kannada:wght@400&display=swap" media="print" onload="this.media='all'" />
  <link rel="stylesheet" href="${cssUrl}" />
  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>
</head>
<body class="g-page">
${topbar}
${body}
${footer}
</body>
</html>
`;

  const author = { "@type": "Person", name: "Ansh", description: "Owns and is selling land in Galibeedu, Madikeri" };
  const website = { "@type": "WebSite", "@id": abs("/#website"), url: abs("/"), name: "landincoorg.in" };

  for (const g of live) {
    const url = abs(`/guides/${g.slug}/`);
    const crumbs = [{ name: "Home", url: abs("/") }, { name: "Guides", url: abs("/guides/") }, { name: g.h1, url }];
    const md = fixLinks(g.body, g.file);
    // FAQ section is rendered from the parsed questions so markup and JSON-LD match exactly
    const [beforeFaq, afterFaqStart] = md.split(/^## FAQs\s*$/m);
    const afterFaq = afterFaqStart.split("\n").reduce((acc, l) => {
      if (acc.done || /^## /.test(l)) { acc.done = true; acc.rest.push(l); } return acc;
    }, { done: false, rest: [] }).rest.join("\n");
    const faqHtml = `<section class="g-faq" id="faqs"><h2>FAQs</h2>${g.faq.map((f) =>
      `<details open><summary><h3>${esc(f.q)}</h3></summary>${marked.parse(fixLinks(f.aMd, g.file), { renderer })}</details>`).join("")}</section>`;
    const related = g.related.filter((s) => liveSlugs.has(s) && s !== g.slug).map((s) => bySlug[s]);
    const relatedHtml = related.length ? `<aside class="g-related"><h2>Related guides</h2><ul>${related.map((r) =>
      `<li><a href="/guides/${r.slug}/">${esc(r.h1)}</a></li>`).join("")}</ul></aside>` : "";
    const pillarHtml = pillar && !g.pillar
      ? `<p class="g-pillar">Part of <a href="/guides/${pillar.slug}/">${esc(pillar.h1)}</a>, a step-by-step guide.</p>` : "";
    const body = `<main class="g-main">
  <nav class="g-crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) =>
      i < crumbs.length - 1 ? `<li><a href="${c.url.replace(site.origin, "")}">${esc(c.name)}</a></li>` : `<li aria-current="page">${esc(c.name)}</li>`).join("")}</ol></nav>
  <article class="g-article">
    <header>
      <p class="g-updated">Updated <time datetime="${g.updated}">${human(g.updated)}</time></p>
      <h1>${esc(g.h1)}</h1>
      <p class="g-author">${esc(AUTHOR_LINE)}</p>
      ${pillarHtml}
    </header>
    ${marked.parse(beforeFaq, { renderer })}
    ${faqHtml}
    ${marked.parse(afterFaq, { renderer })}
    ${relatedHtml}
  </article>
</main>`;
    const jsonld = { "@context": "https://schema.org", "@graph": [
      website,
      { "@type": "Article", "@id": url + "#article", headline: g.h1, description: g.description, inLanguage: "en-IN",
        datePublished: g.published, dateModified: g.updated, author, publisher: author,
        mainEntityOfPage: url, isPartOf: { "@id": abs("/#website") }, image: abs(site.ogImage) },
      { "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })) },
      { "@type": "FAQPage", "@id": url + "#faqs", url, mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.aText } })) },
    ] };
    mkdirSync(path.join(dist, "guides", g.slug), { recursive: true });
    writeFileSync(path.join(dist, "guides", g.slug, "index.html"), shell({ title: g.title, description: g.description, canonical: url, jsonld, body }));
  }

  // /guides/ index
  const ordered = [...live].sort((a, b) => (b.pillar - a.pillar) || a.h1.localeCompare(b.h1));
  const idxUrl = abs("/guides/");
  const idxUpdated = live.map((g) => g.updated).sort().pop() || site.updated;
  const idxBody = `<main class="g-main">
  <nav class="g-crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Guides</li></ol></nav>
  <article class="g-article">
    <header><p class="g-updated">Updated <time datetime="${idxUpdated}">${human(idxUpdated)}</time></p>
    <h1>Guides to buying land in Coorg</h1>
    <p class="g-author">${esc(AUTHOR_LINE)}</p></header>
    <p>Plain-English guides to buying land in Kodagu (Coorg), with links to the Acts, government portals and listings each one relies on. Where something could not be verified, the guide says so.</p>
    ${live.length ? "" : "<p>The first guides are being reviewed and will appear here soon.</p>"}
    <ul class="g-index">${ordered.map((g) => `<li><a href="/guides/${g.slug}/">${esc(g.h1)}</a><p>${esc(g.description)}</p><span class="g-updated">Updated ${human(g.updated)}</span></li>`).join("")}</ul>
  </article>
</main>`;
  const idxJson = { "@context": "https://schema.org", "@graph": [website,
    { "@type": "CollectionPage", "@id": idxUrl, url: idxUrl, name: "Guides to buying land in Coorg", inLanguage: "en-IN", isPartOf: { "@id": abs("/#website") },
      hasPart: ordered.map((g) => ({ "@type": "Article", headline: g.h1, url: abs(`/guides/${g.slug}/`) })) },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: idxUrl }] },
  ] };
  mkdirSync(path.join(dist, "guides"), { recursive: true });
  writeFileSync(path.join(dist, "guides/index.html"), shell({ title: "Guides to Buying Land in Coorg (Kodagu) | landincoorg.in",
    description: "Plain-English guides to buying land in Coorg: eligibility, land records, conversion, stamp duty, prices and the Galibeedu area, with official sources.",
    canonical: idxUrl, jsonld: idxJson, body: idxBody, ogType: "website", noindex: live.length === 0 }));

  return {
    live, skipped,
    sitemapEntries: live.length
      ? [{ loc: idxUrl, lastmod: idxUpdated }, ...live.map((g) => ({ loc: abs(`/guides/${g.slug}/`), lastmod: g.updated }))] : [],
    llms: live.length ? `\n## Guides (written by the owner; each cites its primary sources)\n- [Guides index](${idxUrl})\n` +
      ordered.map((g) => `- [${g.h1}](${abs(`/guides/${g.slug}/`)}): ${g.description} (updated ${human(g.updated)})`).join("\n") + "\n" : "",
  };
}
