import React, { useState, useEffect, useRef } from "react";
import MiniMap from "./MiniMap.jsx";
import { VERIFIED, OWNER_STATED, FAQ, SITE, WHATSAPP_URL } from "./facts.js";

const V = VERIFIED;
const A = VERIFIED.area;
const O = OWNER_STATED;

/* Pick a video rendition after hydration so the server HTML stays identical to the first client render. */
function useVideoSrc(base) {
  const [src, setSrc] = useState(undefined);
  useEffect(() => {
    const small = window.matchMedia("(max-width: 900px)").matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    setSrc(saveData ? undefined : `/media/${base}-${small ? 720 : 1080}.mp4`);
  }, [base]);
  return src;
}

/* ============ Reveal-on-scroll hook ============ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    // Reveal anything already in (or above) the viewport immediately so deep links / refreshes don't land on hidden content.
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("in");
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => { if (!el.classList.contains("in")) io.observe(el); });
    return () => io.disconnect();
  }, []);
}

/* ============ Ping-pong video hook ============ */
// Reverse-seeking H.264 is decoder-expensive — we throttle the reverse path to
// ~30fps with proportional steps so a 4K source doesn't thrash the GPU.
function usePingPong(videoRef, { active = true } = {}) {
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!active) { try { v.pause(); } catch (e) {} return; }
    let raf = null;
    let lastSeek = 0;
    let reversing = false;
    const STEP_MS = 90;          // ~11fps reverse — H.264 decoder can keep up at 4K
    const STEP_SEC = STEP_MS / 1000;

    const reverseTick = (ts) => {
      if (!reversing || !v) return;
      if (ts - lastSeek >= STEP_MS) {
        const next = v.currentTime - STEP_SEC;
        if (next <= 0) {
          v.currentTime = 0;
          reversing = false;
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
          return;
        }
        v.currentTime = next;
        lastSeek = ts;
      }
      raf = requestAnimationFrame(reverseTick);
    };

    const onEnded = () => {
      reversing = true;
      lastSeek = 0;
      try { v.pause(); } catch (e) {}
      raf = requestAnimationFrame(reverseTick);
    };

    const startForward = () => {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };

    v.addEventListener("ended", onEnded);
    if (v.readyState >= 2) startForward();
    else v.addEventListener("loadeddata", startForward, { once: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      reversing = false;
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("loadeddata", startForward);
    };
  }, [videoRef, active]);
}

/* ============ in-view hook ============ */
function useInView(ref, { rootMargin = "200px" } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => setInView(e.isIntersecting));
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/* ============ TopBar ============ */
function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const go = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <header className={"topbar" + (scrolled ? " scrolled" : "")}>
      <div className="mark">Galibeedu</div>
      <nav>
        <a href="#story" onClick={go("story")}>Story</a>
        <a href="#property" onClick={go("property")}>Property</a>
        <a href="#view" onClick={go("view")}>The View</a>
        <a href="#location" onClick={go("location")}>Location</a>
        <a href="#faq" onClick={go("faq")}>FAQ</a>
        <a href="#contact" onClick={go("contact")}>Inquire</a>
      </nav>
      <div className="lang">ಗಾಳಿಬೀಡು</div>
    </header>
  );
}

/* ============ Hero ============ */
function Hero({ variant }) {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const inView = useInView(heroRef, { rootMargin: "100px" });

  // Parallax on hero background (rAF-throttled to avoid layout thrash with 4K video)
  useEffect(() => {
    let raf = null;
    const update = () => {
      raf = null;
      const bg = heroRef.current?.querySelector(".hero-bg");
      if (!bg) return;
      const y = window.scrollY;
      if (y > window.innerHeight + 200) return; // bail once hero is far off-screen
      bg.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(${1 + y * 0.0003})`;
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Ping-pong playback: forward → reverse → forward forever, no visible cut.
  usePingPong(videoRef, { active: inView });
  const src = useVideoSrc("hero");

  return (
    <section className={"hero" + (variant === "split" ? " split" : "")} ref={heroRef} id="hero">
      <video
        ref={videoRef}
        className="hero-bg"
        src={src}
        poster="/media/hero-poster.jpg"
        muted
        playsInline
        autoPlay
        preload="metadata"
        aria-hidden="true"
      />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-meta-top">
          <span>Madikeri · Coorg · Karnataka</span>
          <span className="kannada">ಗಾಳಿಬೀಡು</span>
          <span>Est. Land Parcel · {A.acres} Acres</span>
        </div>

        <div className="hero-title-block">
          <h1 className="hero-title">
            Gali<span className="ita">beedu</span>
            <span className="sr-only"> — valley-view land for sale in Madikeri, Coorg</span>
          </h1>
          <div className="hero-sub">
            <span>The Valley of Wind</span>
            <span className="bullet" />
            <span>Madikeri, Coorg</span>
          </div>
        </div>

        <div className="hero-foot">
          <div className="col">
            Elevation
            <span className="v">{V.elevationDisplay} m</span>
          </div>
          <div className="scroll-indicator">
            <span>Scroll</span>
            <span className="scroll-line" />
          </div>
          <div className="col right">
            <a href={V.mapsUrl} target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "none" }}>{V.geo.display}</a>
            <span className="v">One parcel, one ridge</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ Story ============ */
function Story() {
  return (
    <section id="story" className="block story">
      <div className="section-head reveal">
        <div className="label"><span className="num">I.</span>The Story</div>
        <h2>A hilltop named for the <span className="ita">wind</span> that crosses it.</h2>
      </div>

      <div className="story-body">
        <div className="col-spacer" />
        <div className="reveal d1">
          <p className="lede">
            <span className="drop">G</span>alibeedu — also written Gaalibeedu, <span className="serif-italic" lang="kn">ಗಾಳಿಬೀಡು</span> — translates, gently, to <em>the place where the wind dwells</em>. In Kodava country, names are not given lightly; this one was earned by a ridge that the breeze has been crossing for a thousand seasons.
          </p>
        </div>
        <div className="reveal d2">
          <p>
            The land sits on a ridge at about {V.elevationM.toLocaleString("en-IN")} metres. Coffee estates fall away on every side. The valley opens to the east, the ridges rise to the north, and the sound — most evenings — is wind through silver oak and the slow movement of mist.
          </p>
          <p>
            This is not a development. It is a hilltop being offered, quietly, to one family who understands that the most enduring luxury is a piece of weather you can return to.
          </p>
        </div>
      </div>

      <div className="story-meta">
        <div className="item reveal">
          <div className="k">Elevation</div>
          <div className="v">{V.elevationDisplay}<span className="u">m ASL</span></div>
        </div>
        <div className="item reveal d1">
          <div className="k">Annual Rainfall · Kodagu</div>
          <div className="v">{V.rainfallMm}<span className="u">mm</span></div>
        </div>
        <div className="item reveal d2">
          <div className="k">Temperature · Kodagu</div>
          <div className="v">{V.tempRange}<span className="u">°C</span></div>
        </div>
        <div className="item reveal d3">
          <div className="k">Aspect</div>
          <div className="v">{V.aspect}<span className="u">facing</span></div>
        </div>
      </div>
    </section>
  );
}

/* ============ Property (single parcel) ============ */
function Property() {
  const specs = [
    { mark: "i", name: "Area", desc: `${A.acresGuntas} · ${A.sqm} sq m · ${A.qualifier}`, size: A.sqft, u: "sq ft" },
    { mark: "ii", name: "Elevation", desc: `Survey benchmarks · the ground falls to the ${V.aspect.toLowerCase()}`, size: V.elevationDisplay, u: "m" },
    { mark: "iii", name: "Access", desc: `${O.road[0].toUpperCase()}${O.road.slice(1)}`, size: O.roadWidth.replace(" ft", ""), u: "ft" },
  ];
  return (
    <section id="property" className="block property">
      <div className="section-head reveal">
        <div className="label"><span className="num">II.</span>The Property</div>
        <h2>{A.acres} acres, held <span className="ita">whole</span> — one parcel, one ridge.</h2>
      </div>

      <div className="property-grid">
        <div className="plot-map-wrap reveal">
          <div className="plot-map-bg" />
          <img className="parcel-still" src="/media/parcel-still.jpg" width="960" height="1200" loading="lazy" decoding="async"
               alt="Drone view over the Galibeedu land, Madikeri, Coorg" />
          <div className="plot-label-overlay">
            <span>Overhead · Galibeedu Ridge</span>
            <span className="compass">Drone still</span>
          </div>
          <div className="plot-readout">
            <div className="name">
              One <span className="ita">parcel</span>
            </div>
            <div className="meta">
              Area · {A.qualifier}
              <span className="v">{A.sqft} sq ft</span>
            </div>
          </div>
        </div>

        <div className="plot-list reveal d1">
          <h3>One parcel, with room for {O.roomForHomes} homes.</h3>
          <p className="sub">{A.acresGuntas} as per survey — about {A.sqft} square feet of east-facing ridge, sold as a single parcel.</p>

          {specs.map((r) => (
            <div key={r.mark} className="plot-row">
              <div className="letter">{r.mark}</div>
              <div className="name">
                {r.name}
                <span className="desc">{r.desc}</span>
              </div>
              <div className="size">{r.size}<span className="u">{r.u}</span></div>
            </div>
          ))}

          <div className="property-stats">
            <div className="stat">
              <div className="k">Total Area</div>
              <div className="v">{A.acres} acres</div>
            </div>
            <div className="stat">
              <div className="k">Sq Feet</div>
              <div className="v">{A.sqft}</div>
            </div>
            <div className="stat">
              <div className="k">Asking Price</div>
              <div className="v">{O.price.short}</div>
            </div>
          </div>
        </div>

        <div className="together reveal d2">
          <div className="lhs">Offered as one parcel. Room for {O.roomForHomes} homes.</div>
          <div className="rhs">{O.price.display} · {O.price.terms}</div>
        </div>
      </div>
    </section>
  );
}

/* ============ The View ============ */
function View() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const inView = useInView(sectionRef, { rootMargin: "300px" });
  usePingPong(videoRef, { active: inView });
  const rendition = useVideoSrc("view");

  return (
    <section id="view" className="view full" ref={sectionRef}>
      <div className="view-video-wrap">
        <video
          ref={videoRef}
          className="view-bg"
          src={inView ? rendition : undefined}
          poster="/media/view-poster.jpg"
          muted
          playsInline
          autoPlay
          preload="none"
          aria-hidden="true"
        />
        <div className="view-overlay" aria-hidden="true" />
        <div className="view-label">
          <span>Panorama · East Aspect</span>
          <br />
          <span className="mono">SHOT FROM GALIBEEDU RIDGE</span>
        </div>
        <div className="view-quote-overlay">
          <div className="eyebrow"><span className="dot" />The View<span className="dot" /></div>
          <h2>
            This is what you wake <span className="ita">up to.</span>
          </h2>
        </div>
      </div>
    </section>
  );
}

/* ============ Location ============ */
function Location() {
  const d = V.drive;
  const prox = [
    { d: d.clubMahindra.km, u: "km", name: d.clubMahindra.label, desc: `About ${d.clubMahindra.min} min by road via ${d.via}`, tag: "Operating", state: "now" },
    { d: d.taj.km, u: "km", name: d.taj.label, desc: `About ${d.taj.min} min by road via ${d.via}`, tag: "Operating", state: "now", href: V.sources.taj },
    { d: d.leela.km, u: "km", name: d.leela.label, desc: "71 villas on 76 acres; acquired and rebranded by The Leela in 2026", tag: "Unveiled Jul 2026", state: "now", href: V.sources.leelaUnveil },
    { d: "—", u: "", name: "Anantara Zanti Coorg Resort", desc: "69-key greenfield resort near Madikeri (Minor Hotels)", tag: "Scheduled 2028", state: "soon", href: V.sources.anantara },
  ];
  return (
    <section id="location" className="block location">
      <div className="section-head reveal">
        <div className="label"><span className="num">III.</span>The Location</div>
        <h2>Close to <span className="ita">arrival.</span> Far from interruption.</h2>
      </div>

      <div className="location-grid">
        <div className="location-prose reveal">
          <p>About {d.bengaluru.time.replace("about ", "")} from Bengaluru by road ({d.bengaluru.km} km via NH 275). The 92 km <a className="ita" href={V.sources.pibHighway} target="_blank" rel="noopener" style={{ color: "inherit" }}>Mysuru–Kushalnagar four-lane highway</a> had its foundation stone laid in March 2023.</p>
          <p>The neighbours, if one calls them that, are the country's most considered resorts: Taj, Club Mahindra and The Leela are already here, and Anantara is scheduled for 2028.</p>
          <p>A {O.roadWidth.replace(" ft", "-foot")} approach road delivers you to the gate.</p>
        </div>

        <div className="proximity reveal d1">
          {prox.map((p, i) => (
            <div key={i} className="prox-row">
              <div className="dist">{p.d}<span className="u">{p.u}</span></div>
              <div className="name">{p.href ? <a href={p.href} target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "none" }}>{p.name}</a> : p.name}<span className="desc">{p.desc}</span></div>
              <div className={"tag " + p.state}>{p.tag}</div>
            </div>
          ))}
        </div>

        <div className="location-meta">
          <div className="item reveal">
            <div className="k">From Bengaluru</div>
            <div className="v">{d.bengaluru.km} km · {d.bengaluru.time}</div>
          </div>
          <div className="item reveal d1">
            <div className="k">From Mangaluru Airport</div>
            <div className="v">{d.mangaluruAirport.km} km · {d.mangaluruAirport.time}</div>
          </div>
          <div className="item reveal d2">
            <div className="k">From Madikeri</div>
            <div className="v">{d.madikeri.km} km · about {d.madikeri.min} min</div>
          </div>
        </div>

        <div className="mini-map reveal">
          <MiniMap />
        </div>
        <p className="map-note">Distances: {d.source}, from {V.geo.display}. <a href={V.mapsUrl} target="_blank" rel="noopener">Open in Google Maps</a>.</p>
      </div>
    </section>
  );
}

/* ============ FAQ (same array feeds the FAQPage JSON-LD) ============ */
function Faq() {
  return (
    <section id="faq" className="block faq">
      <div className="section-head reveal">
        <div className="label"><span className="num">IV.</span>Questions</div>
        <h2>Before you <span className="ita">visit.</span></h2>
      </div>
      <div className="faq-list">
        {FAQ.map((f, i) => (
          <details key={i} className="faq-item" open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
            {f.links && (
              <p className="faq-links">
                {f.links.map((l, j) => (
                  <span key={j}>{j > 0 && " · "}<a href={l.href} target="_blank" rel="noopener">{l.text}</a></span>
                ))}
              </p>
            )}
          </details>
        ))}
      </div>
      <p className="faq-updated">Updated {SITE.updatedHuman}.</p>
    </section>
  );
}

/* ============ Contact ============ */
function Contact() {
  // Netlify Forms. The static form in the served HTML (form-name="inquiry") is what Netlify detects at deploy.
  // With JS: AJAX post to "/" and an inline status. Without JS: native POST to /thanks/.
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const onSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    try {
      const body = new URLSearchParams(new FormData(formEl)).toString();
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error("HTTP " + res.status);
      formEl.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  };
  const c = O.contact;

  return (
    <section id="contact" className="block contact">
      <div className="contact-grid">
        <div className="reveal">
          <div className="eyebrow"><span className="dot" />Inquire</div>
          <h2 style={{marginTop: 24}}>A conversation, <span className="ita">first.</span></h2>
          <p className="lede">No brochures, no follow-ups. A single private inquiry, answered personally.</p>

          <div className="contact-info">
            <div className="row">
              <div className="k">Correspondence</div>
              <div className="v"><a href={`mailto:${c.email}`}>{c.email}</a></div>
            </div>
            <div className="row">
              <div className="k">Direct Line</div>
              <div className="v">
                {c.phones.map((ph, i) => (
                  <React.Fragment key={ph.tel}>{i > 0 && <br />}<a href={`tel:${ph.tel}`}>{ph.display}</a></React.Fragment>
                ))}
                <a className="wa-btn" href={WHATSAPP_URL} target="_blank" rel="noopener"
                   aria-label={`Chat on WhatsApp with ${c.whatsapp.display}`}>
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.25 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
            <div className="row">
              <div className="k">Terms</div>
              <div className="v">{O.direct}</div>
            </div>
            <div className="row">
              <div className="k">Viewings</div>
              <div className="v serif-italic">By appointment, on the land itself.</div>
            </div>
          </div>
        </div>

        <form className="form reveal d1" name="inquiry" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="company" onSubmit={onSubmit}>
          <input type="hidden" name="form-name" value="inquiry" />
          <p className="hp" aria-hidden="true"><label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label></p>
          <div className="field">
            <label htmlFor="f-name">Name</label>
            <input id="f-name" name="name" type="text" autoComplete="name" placeholder="Your full name" required />
          </div>
          <div className="field">
            <label htmlFor="f-phone">Phone</label>
            <input id="f-phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 ·····" required />
          </div>
          <div className="field">
            <label htmlFor="f-email">Email</label>
            <input id="f-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label htmlFor="f-message">Message</label>
            <textarea id="f-message" name="message" placeholder="A few words on what you're looking for." />
          </div>

          <button type="submit" className="btn" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Reach out"} <span className="arrow" />
          </button>
          <div className={"sent-note" + (status === "sent" || status === "error" ? " show" : "")} role="status" aria-live="polite">
            {status === "error"
              ? <>That didn't go through. Please email <a href={`mailto:${c.email}`}>{c.email}</a>.</>
              : "Thank you. We will be in touch within two working days."}
          </div>
        </form>
      </div>

      <div className="footer">
        <div>
          <div className="mark">Galibeedu</div>
          <div style={{marginTop: 8}} className="kannada">ಗಾಳಿಬೀಡು · The Valley of Wind</div>
        </div>
        <div className="center">
          Marketed by {O.marketedBy} · Madikeri<br/>
          <span style={{opacity: 0.6}}>© 2026 · All enquiries private · Updated {SITE.updatedHuman}</span>
        </div>
        <div className="right">
          A {A.acres}-acre hilltop · Coorg, Karnataka<br/>
          <span style={{opacity: 0.6}}>One parcel · {A.sqft} sq ft as per survey</span>
        </div>
      </div>
    </section>
  );
}

/* ============ App ============ */
// The design-tool "Tweaks" panel was removed for production. Its defaults (Playfair/Manrope, gold accent,
// cream background, stacked hero) are exactly the :root values in styles.css, so the look is unchanged.
export default function App() {
  useReveal();
  return (
    <>
      <TopBar />
      <main>
        <Hero variant="stacked" />
        <Story />
        <Property />
        <View />
        <Location />
        <Faq />
        <Contact />
      </main>
    </>
  );
}
