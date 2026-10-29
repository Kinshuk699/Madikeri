# Step 4 proof: before vs after (29 Oct 2026, IST)

**Before** = live https://landincoorg.in (repo `main` @ 70bae34).
**After** = branch `seo/prerender-facts-forms` @ bb5adea, deployed byte-for-byte to two throwaway Netlify sites in the auditor's account:
- `landincoorg-staging-ab12.netlify.app`: has `X-Robots-Tag: noindex`, used for form tests and crawler checks.
- `landincoorg-rrt-ab12.netlify.app`: no noindex. Needed because Google's testing tools refuse to test noindex pages (seen on the first Rich Results attempt: "No: 'noindex' detected in 'X-Robots-Tag'"). Its served HTML was diffed against staging: identical except the Netlify site-id comment.

Both are canonicalised to https://landincoorg.in/. Delete both sites once the real site is deployed.

## 1. Raw HTML as each crawler (no JS executed): `crawler_check.py`

| | Before `/gaalibeedu` | After `/` |
|---|---|---|
| HTTP | 200 (and `/` is a 426-byte JS/meta-refresh redirect page) | 200; `/gaalibeedu`, `/Gaalibeedu.html` and `/index.html` return **301 → /** |
| Visible body words | **0**, identical for GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Googlebot, Bingbot | **979**, identical for all six |
| JSON-LD blocks | 0 | 1 (WebSite + RealEstateListing/Offer/Place/GeoCoordinates + FAQPage) |
| acre / sq ft / Madikeri / Galibeedu / email / +91 / FAQ | all N | all Y |
| "Gaalibeedu" | in the title only | exactly once in the body |
| Corrected facts in body | — | 12.4964° N · 75.7023° E, ≈1,040 m, 13.1 / 9.7 / 13.7 / 157 / 264 km, Leela Forest Sanctuary, Anantara Zanti 2028, Mysuru–Kushalnagar (PIB) |
| Removed claims (1,525 m, 12.43°, "Expressway", "late 2026", "highest points", "6 hours", "135 km") | present | **all absent** |

## 2. Structured data
- **validator.schema.org** (staging URL): RealEstateListing detected, **0 errors, 0 warnings**. Nested: WebSite, Place + PostalAddress + GeoCoordinates (12.496429, 75.702316, elev 1040), Offer, FAQPage with 6 Questions.
- **Google Rich Results Test** (`landincoorg-rrt-ab12`, Googlebot smartphone): "Crawled successfully on Oct 29, 2026, 7:43:41 PM". HTTP 200, all resources loaded, no JS console messages. Result: **"No items detected"**. That is expected rather than a defect. Google has no rich-result type for RealEstateListing, and since Aug 2023 shows FAQ rich results only for authoritative government and health sites. The markup is still read and used for understanding. *Before:* nothing to detect.
- Before: the live page had **no** structured data.

## 3. PageSpeed Insights (pagespeed.web.dev, Mobile, Lighthouse 13.5.0, Moto G Power, Slow 4G)

| Metric | Before (`landincoorg.in/gaalibeedu`) | After (`landincoorg-rrt-ab12.netlify.app/`) |
|---|---|---|
| Performance | **36** | **98** |
| Accessibility | 93 | 96 |
| Best Practices | 100 | 100 |
| SEO | 90 ("Links are not crawlable") | **100** |
| FCP | 7.7 s | 1.3 s |
| LCP | 8.0 s | 1.7 s |
| TBT | 1,030 ms | 0 ms |
| CLS | 0.002 | 0.006 |
| Speed Index | 7.7 s | 3.8 s |
| Total payload | 12,140 KiB | 3,562 KiB |

Reports: before https://pagespeed.web.dev/analysis/https-landincoorg-in-gaalibeedu/42e0yy037u?form_factor=mobile · after https://pagespeed.web.dev/analysis/https-landincoorg-rrt-ab12-netlify-app/oai140174o?form_factor=mobile
(The PSI REST API returned 429, daily quota exhausted for keyless use, so the web UI was used for both runs.)

## 4. Netlify Forms (staging)
- Deploy-time detection: the `inquiry` form was registered with fields company, name, phone, email, message (form id 6ae35318a3ac7b81469be20f).
- Email notification hook created: `submission_created` → anshujsahni322@gmail.com (hook 6ae35350e0f0f3f3662c8dbc).
- Submissions recorded by Netlify (API):
  - 14:08:39Z: headless Chrome, JS/AJAX path. POST / → 200, inline "Thank you" shown, fields cleared. **Netlify classified it as spam.**
  - 14:08:46Z: headless Chrome, **no-JS** path. Native POST → `/thanks/`. **Spam.**
  - 14:10:27Z: real browser (Hermes preview pane), human-style input. **Verified** (id 6ae353d39191e20aaf0c052d). Spam-verified submissions are the ones that trigger notification emails.
- **Email arrival: NOT verified by me.** I have no access to the anshujsahni322@gmail.com inbox. Check for a Netlify "New form submission" email around 19:40 IST. On the real site, the form notification must be configured by whoever owns that Netlify site.

## 5. Not measured
- The *production* landincoorg.in after the change: the PR is not merged or deployed (rule: never push to main).
- Search Console URL Inspection: needs domain ownership (see checklist).
