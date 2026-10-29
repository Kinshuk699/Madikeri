// scripts/build.mjs: prerender the property page to static HTML for crawlers.
//
//   npm run build   ->  dist/  (Netlify publish dir)
//
// 1. esbuild bundles the client (production React, no in-browser Babel) and a server renderer.
// 2. react-dom/server renders <App/> into dist/index.html, so every word, spec, contact detail
//    and FAQ is in the raw HTML. The client bundle then hydrates it.
// 3. Emits robots.txt, sitemap.xml, llms.txt, /thanks/, a static Netlify form, and JSON-LD.
//    JSON-LD/llms.txt use only VERIFIED facts (see src/facts.js and docs/FACT-REGISTER.md).
import { build } from "esbuild";
import { mkdirSync, rmSync, cpSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIST = path.join(ROOT, "dist");
const TMP = path.join(ROOT, ".build");
rmSync(DIST, { recursive: true, force: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
mkdirSync(TMP, { recursive: true });

const define = { "process.env.NODE_ENV": '"production"' };

// ---- 1. bundles
await build({
  entryPoints: [path.join(ROOT, "src/client.jsx")],
  bundle: true, minify: true, format: "esm", target: "es2019",
  jsx: "automatic", define, outfile: path.join(TMP, "app.js"), logLevel: "warning",
});
await build({
  entryPoints: [path.join(ROOT, "src/styles.css")],
  bundle: true, minify: true, outfile: path.join(TMP, "styles.css"), logLevel: "warning",
});
await build({
  stdin: {
    contents: `import React from "react"; import { renderToString } from "react-dom/server";
      import App from "./App.jsx"; export * from "./facts.js";
      export const render = () => renderToString(React.createElement(App));`,
    resolveDir: path.join(ROOT, "src"), loader: "jsx",
  },
  bundle: true, platform: "node", format: "esm", jsx: "automatic", define,
  packages: "external", // react/react-dom load from node_modules (avoids CJS dynamic-require issues)
  outfile: path.join(TMP, "ssr.mjs"), logLevel: "warning",
});

const ssr = await import(pathToFileURL(path.join(TMP, "ssr.mjs")).href + "?" + Date.now());
const { render, SITE, VERIFIED: V, PENDING_OWNER: P, FAQ, TITLE, DESCRIPTION } = ssr;

// ---- 2. hashed assets
const hashed = (src, name, ext) => {
  const buf = readFileSync(src);
  const h = createHash("sha256").update(buf).digest("hex").slice(0, 10);
  const out = `assets/${name}.${h}.${ext}`;
  mkdirSync(path.join(DIST, "assets"), { recursive: true });
  writeFileSync(path.join(DIST, out), buf);
  return "/" + out;
};
const jsUrl = hashed(path.join(TMP, "app.js"), "app", "js");
const cssUrl = hashed(path.join(TMP, "styles.css"), "styles", "css");
cpSync(path.join(ROOT, "public"), DIST, { recursive: true });

// ---- 3. structured data (VERIFIED + owner-confirmed only)
const abs = (p) => SITE.origin + p;
const plainFaq = FAQ.map((f) => ({
  "@type": "Question",
  name: f.q,
  acceptedAnswer: { "@type": "Answer", text: f.a },
}));
const place = {
  "@type": "Place",
  "@id": abs("/#place"),
  name: "Galibeedu, Madikeri, Kodagu (Coorg)",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Madikeri",
    addressRegion: "Karnataka",
    postalCode: "571201",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: V.geo.lat, longitude: V.geo.lng, elevation: V.elevationM },
  hasMap: V.mapsUrl,
};
const offer = {
  "@type": "Offer",
  availability: "https://schema.org/InStock",
  businessFunction: "http://purl.org/goodrelations/v1#Sell",
  url: abs("/#contact"),
  areaServed: { "@id": abs("/#place") },
  // price / priceCurrency intentionally omitted: owner decision 3 (no public price yet)
  ...(P.price ? { price: P.price, priceCurrency: "INR" } : {}),
};
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite", "@id": abs("/#website"), url: SITE.url, name: "landincoorg.in",
      inLanguage: "en-IN",
    },
    {
      "@type": "RealEstateListing",
      "@id": abs("/#listing"),
      url: SITE.url,
      name: TITLE,
      description: DESCRIPTION,
      datePosted: "2026-05-22",
      dateModified: SITE.updated,
      inLanguage: "en-IN",
      image: [abs(SITE.ogImage), abs("/media/hero-poster.jpg"), abs("/media/view-poster.jpg")],
      isPartOf: { "@id": abs("/#website") },
      contentLocation: place,
      offers: offer,
      mainEntity: { "@id": abs("/#faq") },
    },
    { "@type": "FAQPage", "@id": abs("/#faq"), url: SITE.url, mainEntity: plainFaq },
  ],
};
// Seller/contact are deliberately NOT in JSON-LD until owner decisions 5 and 6 are confirmed.

// ---- 4. HTML shell
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const appHtml = render();
const head = `
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(TITLE)}</title>
  <meta name="description" content="${esc(DESCRIPTION)}" />
  <link rel="canonical" href="${SITE.url}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="geo.region" content="IN-KA" />
  <meta name="geo.placename" content="Galibeedu, Madikeri, Kodagu" />
  <meta name="geo.position" content="${V.geo.lat};${V.geo.lng}" />
  <meta name="ICBM" content="${V.geo.lat}, ${V.geo.lng}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="landincoorg.in" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:url" content="${SITE.url}" />
  <meta property="og:title" content="${esc(TITLE)}" />
  <meta property="og:description" content="${esc(DESCRIPTION)}" />
  <meta property="og:image" content="${abs(SITE.ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="East-facing valley view from the Galibeedu ridge, Madikeri, Coorg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(TITLE)}" />
  <meta name="twitter:description" content="${esc(DESCRIPTION)}" />
  <meta name="twitter:image" content="${abs(SITE.ogImage)}" />
  <meta name="theme-color" content="#F5F0E8" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM summary" />
  <link rel="preload" as="image" href="/media/hero-poster.jpg" fetchpriority="high" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600&family=Noto+Sans+Kannada:wght@400;500&family=JetBrains+Mono:wght@400&display=swap" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600&family=Noto+Sans+Kannada:wght@400;500&family=JetBrains+Mono:wght@400&display=swap" /></noscript>
  <link rel="stylesheet" href="${cssUrl}" />
  <style>.kannada,[lang="kn"]{font-family:"Noto Sans Kannada","Playfair Display",serif}</style>
  <script>document.documentElement.classList.add("js")</script>
  <script type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>`;

const page = `<!doctype html>
<html lang="en-IN">
<head>${head}
</head>
<body>
  <div id="root">${appHtml}</div>
  <script type="module" src="${jsUrl}"></script>
</body>
</html>
`;
writeFileSync(path.join(DIST, "index.html"), page);

// Thanks page: the no-JS target of the form POST
mkdirSync(path.join(DIST, "thanks"), { recursive: true });
writeFileSync(path.join(DIST, "thanks/index.html"), `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Thank you · Galibeedu land, Madikeri</title><meta name="robots" content="noindex" />
<link rel="canonical" href="${SITE.url}" /><link rel="icon" href="/favicon.svg" type="image/svg+xml" /><link rel="stylesheet" href="${cssUrl}" /></head>
<body><main class="thanks"><div><h1>Thank you.</h1>
<p>Your enquiry about the Galibeedu land has been received. We will be in touch within two working days.</p>
<p><a href="/">Back to the property</a></p></div></main></body></html>
`);

// Static copy of the form so Netlify's deploy-time parser registers it, independent of the SSR markup.
writeFileSync(path.join(DIST, "netlify-forms.html"), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>forms</title></head><body>
<form name="inquiry" method="POST" data-netlify="true" netlify-honeypot="company" hidden>
  <input type="hidden" name="form-name" value="inquiry" />
  <input name="company" /><input name="name" /><input name="phone" /><input name="email" /><textarea name="message"></textarea>
</form></body></html>
`);

// robots.txt
const bots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-SearchBot",
  "Claude-User", "Google-Extended", "Googlebot", "Bingbot", "Applebot", "Applebot-Extended", "DuckDuckBot"];
writeFileSync(path.join(DIST, "robots.txt"),
  bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join("\n") +
  `\nUser-agent: *\nAllow: /\nDisallow: /thanks/\nDisallow: /netlify-forms.html\n\nSitemap: ${abs("/sitemap.xml")}\n`);

// sitemap.xml
writeFileSync(path.join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE.url}</loc>
    <lastmod>${SITE.updated}</lastmod>
    <image:image><image:loc>${abs(SITE.ogImage)}</image:loc></image:image>
    <image:image><image:loc>${abs("/media/hero-poster.jpg")}</image:loc></image:image>
  </url>
</urlset>
`);

// llms.txt (VERIFIED only; area/plots/price are pending owner decisions, so they're excluded)
const d = V.drive;
writeFileSync(path.join(DIST, "llms.txt"), `# landincoorg.in

> Single-property listing: valley-view land for sale in Galibeedu, Madikeri taluk, Kodagu (Coorg), Karnataka, India. Updated ${SITE.updatedHuman}.

## Verified facts (sources: owner's site survey drawing, Google Maps, official press releases)
- Location: Galibeedu area, Madikeri, Kodagu, Karnataka. Survey-boundary centre ${V.geo.lat}, ${V.geo.lng} (WGS84): ${V.mapsUrl}
- Elevation: about ${V.elevationM} m above sea level (survey benchmarks ${V.benchmarks}; spot levels ${V.elevationRange})
- Aspect: ${V.aspect}-facing; the ground falls towards the east
- By road (${d.source}): Club Mahindra Madikeri ${d.clubMahindra.km} km; Taj Madikeri Resort & Spa ${d.taj.km} km; Madikeri KSRTC bus stand ${d.madikeri.km} km; The Leela Coorg Forest Sanctuary ${d.leela.km} km; Mangaluru International Airport ${d.mangaluruAirport.km} km; Bengaluru ${d.bengaluru.km} km
- Nearby hospitality: The Leela Coorg Forest Sanctuary (acquired Mar 2026, unveiled Jul 2026, ${V.sources.leelaUnveil}); Anantara Zanti Coorg Resort, scheduled to open 2028 (${V.sources.anantara})
- Highway: foundation stone for the 92 km Mysuru–Kushalnagar 4-lane highway laid 12 Mar 2023 (${V.sources.pibHighway}). No official completion date is quoted.
- Climate (Kodagu district, not site-specific): annual rainfall about 310 cm; temperature 11–28 °C (${V.sources.kodaguTourism}, ${V.sources.kodaguAbout})

## Not yet confirmed (do not quote)
- Exact land area per the RTC/pahani, whether it is sold as one parcel or as plots, and asking price. These are pending owner confirmation.

## Contact
- Enquiry form and direct contact details: ${abs("/#contact")}

## Pages
- [Property page](${SITE.url}): full listing, location, FAQ, enquiry form
`);

// ---- 5. report
const pending = Object.entries(P).filter(([, v]) => v !== null);
console.log(`built dist/ · index.html ${(statSync(path.join(DIST, "index.html")).size / 1024).toFixed(1)} KiB · js ${(statSync(path.join(DIST, jsUrl)).size / 1024).toFixed(1)} KiB · css ${(statSync(path.join(DIST, cssUrl)).size / 1024).toFixed(1)} KiB`);
console.warn(`⚠ ${pending.length} values still PENDING_OWNER (visible copy unchanged, excluded from JSON-LD/llms.txt): ${pending.map(([k]) => k).join(", ")}`);
rmSync(TMP, { recursive: true, force: true });
