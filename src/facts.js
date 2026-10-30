/*
 * facts.js: the ONLY place property facts live.
 *
 * Every value in VERIFIED has a primary source recorded in docs/FACT-REGISTER.md.
 * VERIFIED values may appear anywhere: visible copy, <title>, meta, JSON-LD, llms.txt and FAQ.
 *
 * OWNER_STATED values come from explicit owner statements (docs/OWNER-DECISIONS.md, answered
 * 29 Oct 2026). They are not independently verified and are labelled that way in the register.
 * PENDING_OWNER must stay empty; the build fails if anything is added to it without a decision.
 */

export const SITE = {
  origin: "https://landincoorg.in",
  path: "/",
  get url() { return this.origin + this.path; },
  updated: "2026-10-29",
  updatedHuman: "October 2026",
  ogImage: "/media/og-1200x630.jpg",
};

export const VERIFIED = {
  // Survey grid (Shashikiran Surveyors layout, Feb 2025) E 576250–576375 / N 1381425–1381675,
  // converted with pyproj from EPSG:32643 (UTM 43N, WGS84). The UTM zone is an assumption,
  // backed by the Copernicus DEM matching the survey levels.
  geo: { lat: 12.496429, lng: 75.702316, display: "12.4964° N · 75.7023° E" },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=12.496429,75.702316",

  // Survey benchmarks TBM1 1,040.438 · TBM2 1,038.506 · TBM3 1,044.294 · TBM4 1,044.073 m.
  // Spot levels 1,037.4–1,056.0 m. Copernicus GLO-30 DEM 1,025–1,055 m.
  elevationM: 1040,
  elevationDisplay: "≈1,040",
  elevationRange: "1,037–1,056 m",
  benchmarks: "TBM1 1,040.438 m · TBM2 1,038.506 m · TBM3 1,044.294 m · TBM4 1,044.073 m",

  aspect: "East", // survey spot levels + DEM: the ground falls from west to east

  // D1 = Shashikiran Surveyors layout (Mysore, Feb 2025): "TOTAL SURVEYED AREA = 1 ACRES 34.80 GUNTAS",
  // area statement 7,572.389 sq m / 81,508.438 sq ft. ALWAYS shown as "as per survey". This is NOT the
  // RTC figure. D2 (Heritage Surveys, 1 ac 93.02 cents = 7,811.70 sq m) is an open discrepancy in the register.
  area: {
    acres: "1.87",
    acresGuntas: "1 acre 34.8 guntas",
    sqm: "7,572.389",
    sqmNum: 7572.389,
    sqft: "81,508",
    qualifier: "as per survey",
  },

  // Google Maps driving routes from geo, queried 29 Oct 2026 (OSRM cross-check in the register)
  drive: {
    taj:          { km: "13.1", min: 36, label: "Taj Madikeri Resort & Spa" },
    clubMahindra: { km: "9.7",  min: 25, label: "Club Mahindra Madikeri" },
    madikeri:     { km: "13.7", min: 36, label: "Madikeri KSRTC bus stand" },
    leela:        { km: "21.3", min: 49, label: "The Leela Coorg Forest Sanctuary" },
    mangaluruAirport: { km: "157", time: "about 3 h 50 min" },
    bengaluru:        { km: "264", time: "about 5 h 30 min" },
    via: "Kalooru Road",
    source: "Google Maps driving directions, 29 October 2026",
  },

  // District-level climate, NOT site-specific
  rainfallMm: "≈3,100", // kodagu.nic.in/en/tourism: "about 310 cm"
  tempRange: "11–28",   // kodagu.nic.in/en/about-district; Census DCHB Kodagu p.24

  sources: {
    leelaAcq: "https://theleela.com/press-room/the-leela-palaces-hotels-and-resorts-acquires-ultra-luxury-resort-coorg-karnataka",
    leelaUnveil: "https://theleela.com/press-room/the-leela-unveils-the-leela-coorg-forest-sanctuary",
    anantara: "https://media.minorhotels.com/en-GLO/264031-minor-hotels-signs-anantara-s-first-resort-and-urban-hotel-in-india/",
    pibHighway: "https://pib.gov.in/PressReleasePage.aspx?PRID=1906087",
    kodaguTourism: "https://kodagu.nic.in/en/tourism",
    kodaguAbout: "https://kodagu.nic.in/en/about-district",
    taj: "https://www.tajhotels.com/en-in/hotels/taj-madikeri-coorg",
  },
};

export const OWNER_STATED = {
  saleUnit: "one parcel",        // decision 1: sold as ONE parcel only; no part sold separately
  roomForHomes: "two",           // decision 1: owner permits "room for two homes"
  price: { amount: 25000000, display: "₹2.5 Crore", short: "₹2.5 Cr", terms: "negotiable" }, // decision 3
  road: "40 ft approach road",   // decision 7: owner-stated, NOT surveyed (D1 shows a road without width)
  roadWidth: "40 ft",
  marketedBy: "Polaris Infra",   // decision 5
  direct: "Offered directly by the owners. No brokerage.", // decision 5
  contact: {                     // decision 6: displayed contact unchanged
    email: "polarisinfra322@gmail.com",
    phones: [ { tel: "+919000159792", display: "+91 90001 59792" },
              { tel: "+919963372244", display: "+91 99633 72244" } ],
    // owner instruction 30 Oct 2026: WhatsApp click-to-chat on +91 90001 59792 with this prefilled text
    whatsapp: { number: "919000159792", display: "+91 90001 59792",
                text: "Hi, I'm interested in the 1.87-acre land in Galibeedu" },
  },
};
export const WHATSAPP_URL =
  `https://wa.me/${OWNER_STATED.contact.whatsapp.number}?text=${encodeURIComponent(OWNER_STATED.contact.whatsapp.text)}`;

export const PENDING_OWNER = {};

const A = VERIFIED.area;
const O = OWNER_STATED;
export const TITLE = `${A.acres} Acre Valley-View Land for Sale in Galibeedu, Madikeri, Coorg`;
export const DESCRIPTION =
  `${A.acres} acres (as per survey) of east-facing, valley-view land for sale as one parcel in Galibeedu, Madikeri, Coorg. ` +
  `${O.price.display}, ${O.price.terms}. About ${VERIFIED.elevationM.toLocaleString("en-IN")} m above sea level, ` +
  `${VERIFIED.drive.clubMahindra.km} km from Club Mahindra and ${VERIFIED.drive.taj.km} km from Taj Madikeri by road.`;

/* FAQ uses VERIFIED facts and explicit owner statements only. The same array feeds the visible FAQ section AND the FAQPage JSON-LD,
   so the two can never drift apart. Answers are plain text plus optional links. */
const d = VERIFIED.drive;
export const FAQ = [
  {
    q: "How big is the land and what is the asking price?",
    a: `${A.acresGuntas} as per survey: ${A.sqm} sq m, about ${A.sqft} sq ft (${A.acres} acres). ` +
       `The asking price is ${O.price.display} for the whole parcel, ${O.price.terms}.`,
  },
  {
    q: "Can I buy part of the land?",
    a: `No. It is sold as ${O.saleUnit} only. There is room for ${O.roomForHomes} homes on it. Access is by a ${O.road}. ` +
       `${O.direct}`,
  },
  {
    q: "Where exactly is this land in Coorg?",
    a: `In the Galibeedu area of Madikeri taluk, Kodagu (Coorg), Karnataka, at ${VERIFIED.geo.display} (centre of the surveyed boundary). ` +
       `It is ${d.madikeri.km} km by road from the Madikeri KSRTC bus stand, via ${d.via}.`,
    links: [{ href: VERIFIED.mapsUrl, text: "Open the coordinates in Google Maps" }],
  },
  {
    q: "What is the elevation of the land?",
    a: `About ${VERIFIED.elevationM.toLocaleString("en-IN")} m above sea level. The site survey's benchmarks read ${VERIFIED.benchmarks}, ` +
       `and spot levels across the land range from ${VERIFIED.elevationRange}. The ground falls towards the east.`,
  },
  {
    q: "How far is it from Taj Madikeri and Club Mahindra?",
    a: `${d.taj.km} km (about ${d.taj.min} minutes) to ${d.taj.label} and ${d.clubMahindra.km} km (about ${d.clubMahindra.min} minutes) ` +
       `to ${d.clubMahindra.label}, both by road via ${d.via} (${d.source}).`,
  },
  {
    q: "How far is it from Bengaluru and Mangaluru airport?",
    a: `${d.bengaluru.km} km from Bengaluru (${d.bengaluru.time} by road via NH 275) and ${d.mangaluruAirport.km} km from ` +
       `Mangaluru International Airport (${d.mangaluruAirport.time}). Times vary with traffic (${d.source}).`,
  },
  {
    q: "Which new luxury resorts are coming up near Madikeri?",
    a: `The Leela acquired a 71-villa resort on 76 acres near Madikeri in March 2026 and unveiled it as The Leela Coorg Forest Sanctuary in July 2026. ` +
       `It is ${d.leela.km} km from the land by road. Minor Hotels has announced Anantara Zanti Coorg Resort, a 69-key resort near Madikeri scheduled to open in 2028.`,
    links: [
      { href: VERIFIED.sources.leelaAcq, text: "The Leela press release, 17 Mar 2026" },
      { href: VERIFIED.sources.leelaUnveil, text: "The Leela press release, 9 Jul 2026" },
      { href: VERIFIED.sources.anantara, text: "Minor Hotels press release, 8 Apr 2026" },
    ],
  },
  {
    q: "What is the status of the Mysuru–Kushalnagar highway?",
    a: "The Prime Minister laid the foundation stone for the 92 km Mysuru–Kushalnagar four-lane highway on 12 March 2023, at a cost of around ₹4,130 crore. " +
       "We have not found an official completion date, so we do not quote one.",
    links: [{ href: VERIFIED.sources.pibHighway, text: "PIB release, 12 Mar 2023" }],
  },
];
