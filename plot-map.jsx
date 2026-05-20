/* global React, ReactDOM */
const { useState, useEffect, useRef, useCallback } = React;

/* ============ Plot Map (interactive overhead) ============ */
function PlotMap({ active, onSelect }) {
  // 3 plot polygons over a stylized overhead. Plots arrayed across the hilltop.
  const plots = [
    { id: "A", label: "Plot A", points: "60,120 240,90 260,300 80,330", area: "24,684 sq ft", desc: "The northern parcel, valley-facing" },
    { id: "B", label: "Plot B", points: "240,90 420,80 440,290 260,300", area: "24,684 sq ft", desc: "The central crown, highest elevation" },
    { id: "C", label: "Plot C", points: "420,80 600,100 620,310 440,290", area: "24,684 sq ft", desc: "The southern parcel, ridge access" }
  ];
  const colors = {
    A: { fill: "rgba(138, 154, 123, 0.25)", stroke: "rgba(138, 154, 123, 0.7)" },
    B: { fill: "rgba(184, 145, 90, 0.25)", stroke: "rgba(184, 145, 90, 0.7)" },
    C: { fill: "rgba(200, 180, 150, 0.22)", stroke: "rgba(200, 180, 150, 0.65)" }
  };
  const activePlot = plots.find(p => p.id === active);
  return (
    <svg className="plot-map-svg" viewBox="0 0 680 600" preserveAspectRatio="xMidYMid slice">
      {/* terrain contour lines */}
      <g opacity="0.35" stroke="rgba(245,240,232,0.18)" fill="none" strokeWidth="0.5">
        <path d="M 0 220 Q 200 180 340 200 T 680 240" />
        <path d="M 0 250 Q 180 215 340 230 T 680 270" />
        <path d="M 0 285 Q 200 250 340 265 T 680 305" />
        <path d="M 0 325 Q 200 295 340 305 T 680 345" />
        <path d="M 0 370 Q 200 345 340 350 T 680 390" />
        <path d="M 0 420 Q 200 400 340 400 T 680 440" />
        <path d="M 0 475 Q 200 460 340 455 T 680 495" />
      </g>

      {/* tree dots scattered */}
      <g fill="rgba(138, 154, 123, 0.35)">
        {Array.from({length: 28}).map((_, i) => {
          const x = 30 + ((i * 37) % 620);
          const y = 360 + ((i * 23) % 220);
          return <circle key={i} cx={x} cy={y} r="2" />;
        })}
        {Array.from({length: 12}).map((_, i) => {
          const x = 40 + ((i * 53) % 600);
          const y = 30 + ((i * 17) % 60);
          return <circle key={"n"+i} cx={x} cy={y} r="1.8" />;
        })}
      </g>

      {/* approach road */}
      <path
        d="M 680 540 Q 500 520 360 480 Q 230 450 60 470"
        stroke="rgba(184, 145, 90, 0.45)"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
      />
      <text x="640" y="535" fill="rgba(184,145,90,0.7)" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="2" textAnchor="end">PRIVATE ROAD · 40FT</text>

      {/* plot polygons */}
      {plots.map(p => {
        const isActive = active === p.id;
        const c = colors[p.id];
        return (
          <g key={p.id}
             onMouseEnter={() => onSelect(p.id)}
             onClick={() => onSelect(p.id)}
             style={{ cursor: "pointer" }}>
            <polygon
              points={p.points}
              fill={isActive ? c.fill.replace("0.2", "0.4").replace("0.22", "0.4").replace("0.25", "0.4") : c.fill}
              stroke={c.stroke}
              strokeWidth={isActive ? "1.5" : "1"}
              style={{ transition: "all 0.3s ease" }}
            />
            {/* plot letter */}
            <text
              x={getCenter(p.points).x}
              y={getCenter(p.points).y + 8}
              fill={isActive ? "#F5F0E8" : "rgba(245,240,232,0.55)"}
              fontSize="36"
              fontFamily="Playfair Display, serif"
              fontStyle="italic"
              textAnchor="middle"
              style={{ transition: "fill 0.3s" }}
            >
              {p.id}
            </text>
          </g>
        );
      })}

      {/* north arrow */}
      <g transform="translate(620, 50)">
        <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(245,240,232,0.25)" />
        <path d="M 0 -14 L 4 6 L 0 2 L -4 6 Z" fill="rgba(245,240,232,0.6)" />
        <text x="0" y="-22" fill="rgba(245,240,232,0.5)" fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle" letterSpacing="2">N</text>
      </g>

      {/* scale bar */}
      <g transform="translate(40, 560)">
        <line x1="0" y1="0" x2="80" y2="0" stroke="rgba(245,240,232,0.4)" strokeWidth="1" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(245,240,232,0.4)" strokeWidth="1" />
        <line x1="40" y1="-3" x2="40" y2="3" stroke="rgba(245,240,232,0.4)" strokeWidth="1" />
        <line x1="80" y1="-3" x2="80" y2="3" stroke="rgba(245,240,232,0.4)" strokeWidth="1" />
        <text x="0" y="-8" fill="rgba(245,240,232,0.45)" fontSize="8" fontFamily="ui-monospace, monospace" letterSpacing="1.5">0</text>
        <text x="80" y="-8" fill="rgba(245,240,232,0.45)" fontSize="8" fontFamily="ui-monospace, monospace" letterSpacing="1.5">100FT</text>
      </g>
    </svg>
  );
}

function getCenter(pointsStr) {
  const pts = pointsStr.split(" ").map(p => p.split(",").map(Number));
  const x = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const y = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  return { x, y };
}

window.PlotMap = PlotMap;
