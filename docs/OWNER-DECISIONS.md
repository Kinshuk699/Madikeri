# Owner decisions: ANSWERED 30 Oct 2026

| # | Answer | Applied as |
|---|---|---|
| 1 | One parcel only; "room for two homes" allowed | Plot map and all plot copy removed; single-parcel section with a drone still |
| 2 | Area per D1: 1 ac 34.8 gu = 7,572.389 sq m = 81,508 sq ft = 1.87 ac, "as per survey"; D2 open | `VERIFIED.area`; title "1.87 Acre…" |
| 3 | ₹2.5 Crore total, negotiable; no per-unit figure | Specs, meta description, JSON-LD Offer 25000000 INR |
| 4 | "Galibeedu" in title and headings, "Gaalibeedu" once in the body | unchanged (already applied) |
| 5 | Offered directly by the owners, marketed by Polaris Infra | Footer kept; "Offered directly by the owners. No brokerage." in contact |
| 6 | Notifications → anshujsahni322@gmail.com; displayed contact unchanged | Netlify setting (see handoff) |
| 7 | "40 ft approach road", owner-stated; drop "private" | `OWNER_STATED.road` |
| 8 | (Netlify ownership): Kinshuk deploys | see handoff |

Still open: D1 vs D2 area (surveyor), RTC revenue village / survey no.

---

## Original questions (29 Oct 2026)

Each item is copy I will not change until it is answered. The fix is one edit in `src/facts.js`, then `npm run build`.

| # | Decision | Why it's blocking | Options / what I need |
|---|---|---|---|
| 1 | **One parcel, or individual plots?** | The site sells "three equal plots of 24,684 sq ft, available individually". You've said the land can't be partitioned. Neither survey drawing shows three equal plots. | (a) Single parcel only: I remove the plot map, the "3 equal" stat and "held apart". (b) Plots are legally possible: send the sanctioned layout or partition document. |
| 2 | **Which area does the RTC/pahani show?** | D1 (Shashikiran Surveyors) says 1 ac 34.80 guntas = 7,572.389 m² = 81,508 sq ft (1.87 ac). D2 (Heritage Surveys) says 1 ac 93.02 cents = 7,811.70 m² = 84,084 sq ft (1.93 ac). The site says 1.7 ac / 74,052 sq ft. | Send the RTC (survey no., hissa, acres-guntas, revenue village, khata holder). The title tag "**X** Acre Valley-View Land…" uses this figure. |
| 3 | **Show a price? If so, what figure?** | The site shows no price ("private inquiry"). Your older draft had ₹2.10 Cr. AI tools and the planned prices article cite pages that show numbers. `Offer.price` in the JSON-LD stays empty until you decide. | Exact figure in ₹ and its basis (total or per acre, negotiable or fixed), or "no public price". |
| 4 | **Revenue village spelling and name** | D1's title block says "Baribellachchu, Madikeri". D2 says "Galibidu". The site uses "Gaalibeedu". Your plan says "Galibeedu". The Taj's official address is "Galibeedu Post". | Confirm the RTC village name. I'll use "Galibeedu" in title and headings and "Gaalibeedu" once in the body as the brief says, unless the RTC says otherwise. |
| 5 | **Who is the seller of record?** | The footer says "Marketed by Polaris Infra". Your plan's author line is "Ansh, who owns and is selling". | Owner name to display, and whether to keep the Polaris Infra line. |
| 6 | **Contact details to publish everywhere** | polarisinfra322@gmail.com · +91 90001 59792 · +91 99633 72244. These must be identical on the site, 1acre, 99acres and Reddit. | Confirm or replace. Also: which inbox should get Netlify Forms notifications? |
| 7 | **Approach road width** | The site says "40 ft private road". D1 shows a road on the boundary but gives no width. | Source (survey, layout approval or deed), or I drop the figure. |
| 8 | **Netlify ownership** | The live site isn't in your Netlify account (only atelier-index and two others are). GitHub shows no Netlify deploy statuses, so it's probably deployed by hand. | Who deploys, and are they willing to switch publish dir to `dist/`, enable form detection, and add a form notification email? |
