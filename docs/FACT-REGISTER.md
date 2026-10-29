# Fact register: landincoorg.in (Galibeedu parcel)

Compiled 29 Oct 2026 (IST). Owner decisions applied 30 Oct 2026; see OWNER-DECISIONS.md. Only primary sources count. "Site" means the live `/gaalibeedu` build = repo `main` @ `70bae34`.

## Primary documents found on the owner's machine (`~/Downloads`)

| Doc | What it is | Area statement |
|---|---|---|
| **D1** `Revised MADIKERI Layout.pdf` | AutoCAD plot by **Shashikiran Surveyors**, #16 Water Tank Road, N.R. Mohalla, Mysore. Title block: "Baribellachchu, Madikeri". Grid E 576250–576375 / N 1381425–1381675. Benchmarks TBM1–4. PDF created 2025-02-10. It also draws houses, internal roads, a park and a gazebo (a proposed layout). | "TOTAL SURVEYED AREA = **1 ACRES 34.80 GUNTAS**"; 7,572.389 m²; 81,508.438 sq ft |
| **D2** `MADIKERI Area Calculation.pdf` | "TOPOGRAPHICAL SURVEY OF … GALIBIDU, MADIKERI" by **Heritage Surveys**, Hootagalli, Mysore. Surveyed and drawn by Girish, dated 27/02/2025, client "Shashi Kiran". Local grid (E 4960–5060, BM 100.00), so it cannot be georeferenced. | "**1 ACRE, 93.02 CENTS**"; 7,811.70 m²; 84,084.00 sq ft. A second table of six parts totals 19,180.34 sq ft = 44.03 cents, with no label saying what it is. |
| D3 `GALIBIDU MADIKERI-Model.pdf` | Earlier contour plot, same local grid as D2, dated 23/01/2024 | no area statement |
| — | Polaris Infra brochure (PDF, Apr 2025) | says "1.6-acre". It is marketing material, not a primary source. |
| — | **RTC / pahani, EC, mutation** | **NOT FOUND anywhere on this machine** |

> ⚠️ **Open discrepancy, being checked with the surveyor by the owner.** The site uses D1, worded "as per survey". **The two survey drawings disagree:** 1.87 ac / 81,508 sq ft (D1) against 1.93 ac / 84,084 sq ft (D2). The site's 1.7 ac / 74,052 sq ft matches neither, and the brochure's 1.6 ac matches nothing. Only the RTC can settle it.

## Register

| # | Claim on site | Value shown | Primary source | Verified value | Status |
|---|---|---|---|---|---|
| 1 | Total area | 1.7 acres | **D1** (Shashikiran Surveyors layout): "TOTAL SURVEYED AREA = 1 ACRES 34.80 GUNTAS". RTC not available. | **1.87 ac (1 acre 34.8 guntas), always worded "as per survey"**. Never presented as the RTC figure. **Open discrepancy:** D2 (Heritage Surveys) says 1 ac 93.02 cents = 1.93 ac; owner is checking with the surveyor. | **corrected** (owner decision 2, 29 Oct 2026) |
| 2 | Area in sq ft | 74,052 | **D1** area statement: 7,572.389 sq m / 81,508.438 sq ft | **81,508 sq ft / 7,572.389 sq m, as per survey** (D2's 84,084 sq ft is an open discrepancy) | **corrected** (decision 2) |
| 3 | Three equal plots, 24,684 sq ft each, "available individually" | 3 × 24,684 | Owner statement (decision 1, 29 Oct 2026): sold as ONE parcel only | One parcel. "Room for two homes" is permitted wording (owner). No part is sold separately. | **removed** (plot map, plot list, footer, hero line, "held apart", "held individually") |
| 4 | Title / revenue village | "Gaalibeedu" | D1 title block "Baribellachchu, Madikeri"; D2 "Galibidu, Madikeri". RTC not available. | Unresolved: the RTC shows the revenue village and survey number | **needs owner** |
| 5 | Coordinates | N 12.43° E 75.74° | D1 grid converted with pyproj, **assuming UTM 43N / WGS84 (EPSG:32643)** | Survey-extent centre **12.49643° N, 75.70232° E**. Corners 12.49530–12.49756 N, 75.70174–75.70289 E. The site's point is **8.4 km away** (south-east, near Madikeri town). | **corrected** |
| 5a | Check on the UTM assumption | — | Copernicus GLO-30 DEM sampled on the D1 grid | DEM 1,025–1,055 m (mean 1,043.7) against D1 levels 1,037.4–1,056.0. Matches. The drawing's "To Mukkodlu" (NE) and "To Kalakeri Nidugane" (S) labels are also on the correct sides of this point (OSM). | supports #5 |
| 6 | Elevation | 1,525 m ASL | D1 benchmarks TBM1 1,040.438 · TBM2 1,038.506 · TBM3 1,044.294 · TBM4 1,044.073; spot levels 1,037.4–1,056.0 | **≈1,040 m (1,037–1,056 m across the parcel)**. Copernicus 30 m DEM agrees (1,025–1,055 m). | **corrected** |
| 7 | "one of the highest points in Madikeri" | — | Copernicus DEM | Madikeri town centre sits at ~1,160 m, about 120 m higher than the parcel | **removed** (confirmed absent from the built HTML and llms.txt, 29 Oct 2026) |
| 8 | Distance to Taj Madikeri | 12 km (site) / 7 km (brochure) | Google Maps driving from 12.496429, 75.702316, 29 Oct 2026. OSRM as a check. | **13.1 km, ~36 min** via Kalooru Rd (OSRM 14.8 km to the OSM "Vivanta by Taj" node) | **corrected** |
| 9 | Distance to Club Mahindra Madikeri | 10 km / 8 km | Google Maps; OSRM | **9.7 km, ~25 min** (OSRM 10.9 km) | **corrected** |
| 10 | Distance to Madikeri town | 8 km (mini-map); brochure "15 minutes" | Google Maps to KSRTC Madikeri bus stand; OSRM to the town node | **13.7 km, ~36 min** (OSRM 15.5 km) | **corrected** |
| 11 | Mangaluru airport | 3 h · 135 km | Google Maps; OSRM | **157 km, ~3 h 50 min** via NH 275 (OSRM 153 km, free-flow 2 h 27 min) | **corrected** |
| 12 | From Bangalore | 6 hours | Google Maps to "Bengaluru" | **264 km, ~5 h 34 min** at time of query | **corrected** |
| 13 | Map directions | Taj "W", Club Mahindra "E" | OSM nodes | Taj ≈ 6 km south-southwest and Club Mahindra ≈ 6 km south, both in a straight line | **corrected** |
| 14 | The Leela Coorg | "Opening late 2026" / "Hilltop palace property" | The Leela press releases [17 Mar 2026](https://theleela.com/press-room/the-leela-palaces-hotels-and-resorts-acquires-ultra-luxury-resort-coorg-karnataka) and [9 Jul 2026](https://theleela.com/press-room/the-leela-unveils-the-leela-coorg-forest-sanctuary), plus the factsheet | An **existing** 71-villa resort on 76 acres that The Leela **acquired** (Mar 2026) and **unveiled** as *The Leela Coorg Forest Sanctuary* (Jul 2026). Address: Kedakal Post, Modur, Madikeri 571237. Google Maps: 21.3 km, ~49 min. | **corrected** (name, status, distance) |
| 15 | Anantara Coorg | "Opening 2028" / "Forest-front resort, southern hills" | [Minor Hotels press release, 8 Apr 2026](https://media.minorhotels.com/en-GLO/264031-minor-hotels-signs-anantara-s-first-resort-and-urban-hotel-in-india/) | "Anantara Zanti Coorg Resort", "scheduled to open in 2028", 69 keys, greenfield, "near Madikeri". No exact location is published, so no distance can be given and "southern hills" is unsourced. | **verified** (2028); location detail **remove** |
| 16 | "Mysuru–Madikeri Expressway" making the trip "considerably less" | — | [PIB release 1906087, 12 Mar 2023](https://pib.gov.in/PressReleasePage.aspx?PRID=1906087) | Foundation stone laid for the **Mysuru–Kushalnagar 4-lane highway**, 92 km, ~₹4,130 cr. I found no NHAI or PIB source for a completion date or time saving. | **corrected** (name and facts); "faster by Expressway" **removed** |
| 17 | Annual rainfall | 2,800 mm | [kodagu.nic.in/en/tourism](https://kodagu.nic.in/en/tourism) | "about 310 cm" (district average, not site-specific) | **corrected** (labelled district-level) |
| 18 | Avg. temperature | 15–24 °C | [kodagu.nic.in/en/about-district](https://kodagu.nic.in/en/about-district); Census DCHB Kodagu p.24 | Average 15 °C, range 11–28 °C (district) | **corrected** (labelled district-level) |
| 19 | Aspect | East-facing | D1 levels plus DEM | DEM falls from ~1,050 m (west columns) to ~1,025–1,040 m (east columns), so the slope runs down to the east | **verified** |
| 20 | 40 ft private road to the gate | 40 ft | **Owner statement** (decision 7). D1 shows a ROAD on the boundary but no width. | "40 ft approach road". The word "private" is removed. | **owner-stated, not surveyed** |
| 21 | Contact details | polarisinfra322@gmail.com · +91 90001 59792 · +91 99633 72244 | Owner statement (decision 6) | Unchanged on display. Form notifications go to anshujsahni322@gmail.com (Netlify setting, not shown). | **owner-confirmed** |
| 22 | "Marketed by Polaris Infra" | — | Owner statement (decision 5) | Footer line kept. Added to the contact section: "Offered directly by the owners. No brokerage." | **owner-confirmed** |
| 23 | Price | none on site | Owner statement (decision 3) | **₹2.5 Crore total, negotiable**. Shown in specs, meta description and JSON-LD Offer (price 25000000, INR). No per-sq-ft or per-acre figure is shown. | **owner-stated** |
| 24 | Elevation change "17 m" (old draft only) | — | D1 levels | 1,037.4–1,056.0 m gives ≈18.6 m | not on the live site; if used, cite as ≈19 m |

### What I could NOT verify
- **RTC / pahani, EC, mutation, survey number, khata:** not on this machine. The site area is the D1 *survey* figure, not an RTC figure. Revenue village (row 4) is still unresolved.
- **D1 vs D2 area:** unresolved (1.87 vs 1.93 ac). The owner is checking with the surveyor.
- **Price, one-parcel sale, room for two homes, 40 ft road:** owner statements, not independently verified.
- **The basis of the UTM assumption:** D1 doesn't say which projection it uses. EPSG:32643 is inferred from the grid values and is backed up by the DEM match and the place-name check, but the surveyor (Shashikiran Surveyors, Ph. 9986932559) should confirm it.
- **Mysuru–Kushalnagar completion date:** I found no NHAI or PIB source, so no date is claimed.
- **Anantara Zanti Coorg exact site:** not published.
- **Road width, mobile signal, water and power connection:** no primary source.
