import React from "react";
import { VERIFIED as V, PENDING_OWNER as P } from "./facts.js";

// Marker positions use true bearings from the survey centre (OSM coordinates), at 45 px per km.
// The Leela and Anantara are not placed: no exact coordinates are published for either.
function MiniMap() {
  const d = V.drive;
  // Stylized regional map: hilltop + ringed proximities
  return (
    <svg viewBox="0 0 1400 600" preserveAspectRatio="xMidYMid slice">
      {/* paper texture */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26,26,26,0.04)" strokeWidth="1"/>
        </pattern>
        <radialGradient id="hill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(138,154,123,0.45)" />
          <stop offset="60%" stopColor="rgba(138,154,123,0.18)" />
          <stop offset="100%" stopColor="rgba(138,154,123,0)" />
        </radialGradient>
      </defs>
      <rect width="1400" height="600" fill="url(#grid)" />

      {/* terrain blob (Coorg hills) */}
      <g opacity="0.7">
        <path d="M 100 380 Q 220 280 380 320 Q 540 290 720 360 Q 880 410 1050 380 Q 1220 350 1340 410 L 1340 600 L 100 600 Z"
              fill="rgba(138,154,123,0.12)" stroke="rgba(138,154,123,0.4)" strokeWidth="0.6" />
        <path d="M 100 410 Q 240 330 400 360 Q 560 340 740 400 Q 900 450 1080 420 L 1080 600 L 100 600 Z"
              fill="rgba(138,154,123,0.08)" stroke="rgba(138,154,123,0.3)" strokeWidth="0.6" />
      </g>

      {/* roads */}
      <g stroke="rgba(184,145,90,0.5)" fill="none">
        <path d="M 0 300 Q 300 290 580 310 Q 800 330 1100 300 Q 1280 290 1400 310" strokeWidth="1.2" />
        <path d="M 700 0 Q 690 200 700 310 Q 710 450 720 600" strokeWidth="0.8" strokeDasharray="3 4" />
        <path d="M 700 310 Q 600 380 480 460" strokeWidth="0.6" strokeDasharray="2 3" />
      </g>

      {/* property location (center) */}
      <g transform="translate(700, 150)">
        <circle r="60" fill="url(#hill)" />
        <circle r="6" fill="#B8915A" />
        <circle r="6" fill="none" stroke="#B8915A" strokeWidth="0.5" opacity="0.5">
          <animate attributeName="r" from="6" to="28" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <text x="0" y="-22" fill="#1A1A1A" fontSize="13" fontFamily="Playfair Display, serif" fontStyle="italic" textAnchor="middle">Galibeedu</text>
        <text x="0" y="22" fill="#6F665A" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="2" textAnchor="middle">{P.areaAcres} ACRES · {V.elevationDisplay.replace("≈", "")} M</text>
      </g>

      {/* surrounding markers */}
      {[
        { x: 619, y: 402, label: "Taj Madikeri", dist: `${d.taj.km} KM BY ROAD` },
        { x: 769, y: 424, label: "Club Mahindra", dist: `${d.clubMahindra.km} KM BY ROAD` },
        { x: 878, y: 523, label: "Madikeri Town", dist: `${d.madikeri.km} KM BY ROAD` },
      ].map((m, i) => (
        <g key={i} transform={`translate(${m.x}, ${m.y})`}>
          <circle r="3" fill={m.soon ? "rgba(184,145,90,0.7)" : "rgba(26,26,26,0.6)"} />
          <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(26,26,26,0.2)" strokeWidth="0.5" />
          <text x="8" y="4" fill="#1A1A1A" fontSize="11" fontFamily="Playfair Display, serif">{m.label}</text>
          <text x="8" y="18" fill="#6F665A" fontSize="8" fontFamily="ui-monospace, monospace" letterSpacing="1.5">{m.dist}</text>
        </g>
      ))}

      {/* bangalore arrow */}
      <g transform="translate(1180, 120)">
        <text fill="#6F665A" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="2">BENGALURU</text>
        <text y="14" fill="#6F665A" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="2">{d.bengaluru.km} KM · ENE →</text>
      </g>

      {/* compass */}
      <g transform="translate(1320, 60)">
        <circle r="20" fill="none" stroke="rgba(26,26,26,0.2)" />
        <path d="M 0 -16 L 4 6 L 0 2 L -4 6 Z" fill="#1A1A1A" opacity="0.6" />
        <text y="-24" fill="#6F665A" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle" letterSpacing="2">N</text>
      </g>
    </svg>
  );
}

export default MiniMap;
