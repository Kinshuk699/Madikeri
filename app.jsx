/* global React, ReactDOM, PlotMap, MiniMap, TweaksPanel, TweakSection, TweakRadio, TweakColor, useTweaks */
const { useState, useEffect, useRef, useCallback, useMemo } = React;

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
      <div className="mark">Gaalibeedu</div>
      <nav>
        <a onClick={go("story")}>Story</a>
        <a onClick={go("property")}>Property</a>
        <a onClick={go("view")}>The View</a>
        <a onClick={go("location")}>Location</a>
        <a onClick={go("contact")}>Inquire</a>
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

  return (
    <section className={"hero" + (variant === "split" ? " split" : "")} ref={heroRef} id="hero">
      <video
        ref={videoRef}
        className="hero-bg"
        src={(typeof window !== "undefined" && window.__resources && window.__resources.heroVideo) || "hero.mp4"}
        muted
        playsInline
        autoPlay
        preload="auto"
        aria-hidden="true"
      />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-meta-top">
          <span>Madikeri · Coorg · Karnataka</span>
          <span className="kannada">ಗಾಳಿಬೀಡು</span>
          <span>Est. Land Parcel · 1.7 Acres</span>
        </div>

        <div className="hero-title-block">
          <h1 className="hero-title">
            Gaali<span className="ita">beedu</span>
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
            <span className="v">1,525 m</span>
          </div>
          <div className="scroll-indicator">
            <span>Scroll</span>
            <span className="scroll-line" />
          </div>
          <div className="col right">
            North 12.43°  ·  East 75.74°
            <span className="v">Three plots, one ridge</span>
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
            <span className="drop">G</span>aalibeedu — <span className="serif-italic">ಗಾಳಿಬೀಡು</span> — translates, gently, to <em>the place where the wind dwells</em>. In Kodava country, names are not given lightly; this one was earned by a ridge that the breeze has been crossing for a thousand seasons.
          </p>
        </div>
        <div className="reveal d2">
          <p>
            The land rests at one of the highest points in Madikeri, where the monsoon arrives first and the dry months keep their cool. Coffee estates fall away on every side. The valley opens to the south, the ridges rise to the north, and the sound — most evenings — is wind through silver oak and the slow movement of mist.
          </p>
          <p>
            This is not a development. It is a hilltop being offered, quietly, to three families who understand that the most enduring luxury is a piece of weather you can return to.
          </p>
        </div>
      </div>

      <div className="story-meta">
        <div className="item reveal">
          <div className="k">Elevation</div>
          <div className="v">1,525<span className="u">m ASL</span></div>
        </div>
        <div className="item reveal d1">
          <div className="k">Annual Rainfall</div>
          <div className="v">2,800<span className="u">mm</span></div>
        </div>
        <div className="item reveal d2">
          <div className="k">Avg. Temperature</div>
          <div className="v">15–24<span className="u">°C</span></div>
        </div>
        <div className="item reveal d3">
          <div className="k">Aspect</div>
          <div className="v">South<span className="u">facing</span></div>
        </div>
      </div>
    </section>
  );
}

/* ============ Property + Plot map ============ */
function Property() {
  const [active, setActive] = useState("B");
  const plots = {
    A: { name: "Plot A", area: "24,684 sq ft", desc: "Northern parcel — valley-facing, terraced approach." },
    B: { name: "Plot B", area: "24,684 sq ft", desc: "Central crown — highest elevation, widest aspect." },
    C: { name: "Plot C", area: "24,684 sq ft", desc: "Southern parcel — ridge-line access, secluded." }
  };
  const current = plots[active];
  return (
    <section id="property" className="block property">
      <div className="section-head reveal">
        <div className="label"><span className="num">II.</span>The Property</div>
        <h2>1.7 acres, divided <span className="ita">thoughtfully</span> — held together, or held apart.</h2>
      </div>

      <div className="property-grid">
        <div className="plot-map-wrap reveal" onMouseLeave={() => setActive("B")}>
          <div className="plot-map-bg" />
          <PlotMap active={active} onSelect={setActive} />
          <div className="plot-label-overlay">
            <span>Overhead · Gaalibeedu Ridge</span>
            <span className="compass">N ↑</span>
          </div>
          <div className="plot-readout">
            <div className="name">
              {current.name.split(" ")[0]} <span className="ita">{current.name.split(" ")[1]}</span>
            </div>
            <div className="meta">
              Area
              <span className="v">{current.area}</span>
            </div>
          </div>
        </div>

        <div className="plot-list reveal d1">
          <h3>Three equal plots.</h3>
          <p className="sub">Each 24,684 square feet — generously proportioned, each with its own approach and orientation. Hover or tap to see each plot on the map.</p>

          {["A", "B", "C"].map(id => (
            <div
              key={id}
              className={"plot-row" + (active === id ? " active" : "")}
              onMouseEnter={() => setActive(id)}
              onClick={() => setActive(id)}
            >
              <div className="letter">{id}</div>
              <div className="name">
                Plot {id}
                <span className="desc">{plots[id].desc}</span>
              </div>
              <div className="size">24,684<span className="u">sq ft</span></div>
            </div>
          ))}

          <div className="property-stats">
            <div className="stat">
              <div className="k">Total Area</div>
              <div className="v">1.7 acres</div>
            </div>
            <div className="stat">
              <div className="k">Sq Feet</div>
              <div className="v">74,052</div>
            </div>
            <div className="stat">
              <div className="k">Plots</div>
              <div className="v">3 equal</div>
            </div>
          </div>
        </div>

        <div className="together reveal d2">
          <div className="lhs">Available together. Or held individually.</div>
          <div className="rhs">By private inquiry only</div>
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

  return (
    <section id="view" className="view full" ref={sectionRef}>
      <div className="view-video-wrap">
        <video
          ref={videoRef}
          className="view-bg"
          src={(() => {
            if (!inView) return undefined;
            const r = (typeof window !== "undefined" && window.__resources) || {};
            return r.viewVideo || "view.mp4";
          })()}
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
        />
        <div className="view-overlay" aria-hidden="true" />
        <div className="view-label">
          <span>Panorama · South Aspect</span>
          <br />
          <span className="mono">SHOT FROM GAALIBEEDU RIDGE</span>
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
  const prox = [
    { d: "12", u: "km", name: "Taj Madikeri Resort & Spa", desc: "Western approach via Madikeri town", tag: "Operating", state: "now" },
    { d: "10", u: "km", name: "Club Mahindra Madikeri", desc: "Eastern ridge, coffee-estate setting", tag: "Operating", state: "now" },
    { d: "—", u: "", name: "The Leela Coorg", desc: "Hilltop palace property, valley-facing", tag: "Opening late 2026", state: "soon" },
    { d: "—", u: "", name: "Anantara Coorg", desc: "Forest-front resort, southern hills", tag: "Opening 2028", state: "soon" },
  ];
  return (
    <section id="location" className="block location">
      <div className="section-head reveal">
        <div className="label"><span className="num">III.</span>The Location</div>
        <h2>Close to <span className="ita">arrival.</span> Far from interruption.</h2>
      </div>

      <div className="location-grid">
        <div className="location-prose reveal">
          <p>Six hours from Bangalore by road today — and considerably less when the <span className="ita">Mysuru–Madikeri Expressway</span> opens.</p>
          <p>The neighbours, if one calls them that, are the country's most considered resorts: two already in residence, two arriving by 2028.</p>
          <p>A forty-foot private road delivers you to the gate.</p>
        </div>

        <div className="proximity reveal d1">
          {prox.map((p, i) => (
            <div key={i} className="prox-row">
              <div className="dist">{p.d}<span className="u">{p.u}</span></div>
              <div className="name">{p.name}<span className="desc">{p.desc}</span></div>
              <div className={"tag " + p.state}>{p.tag}</div>
            </div>
          ))}
        </div>

        <div className="location-meta">
          <div className="item reveal">
            <div className="k">From Bangalore</div>
            <div className="v">6 hours by road, faster by Expressway</div>
          </div>
          <div className="item reveal d1">
            <div className="k">From Mangaluru Airport</div>
            <div className="v">3 hours · 135 km</div>
          </div>
          <div className="item reveal d2">
            <div className="k">Private Access</div>
            <div className="v">40 ft road to the property gate</div>
          </div>
        </div>

        <div className="mini-map reveal">
          <MiniMap />
        </div>
      </div>
    </section>
  );
}

/* ============ Contact ============ */
function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) return;
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({ name: "", phone: "", email: "", message: "" });
  };
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

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
              <div className="v"><a href="mailto:polarisinfra322@gmail.com">polarisinfra322@gmail.com</a></div>
            </div>
            <div className="row">
              <div className="k">Direct Line</div>
              <div className="v">
                <a href="tel:+919000159792">+91 90001 59792</a><br/>
                <a href="tel:+919963372244">+91 99633 72244</a>
              </div>
            </div>
            <div className="row">
              <div className="k">Viewings</div>
              <div className="v serif-italic">By appointment, on the land itself.</div>
            </div>
          </div>
        </div>

        <form className="form reveal d1" onSubmit={onSubmit}>
          <div className="field">
            <label>Name</label>
            <input type="text" value={form.name} onChange={set("name")} placeholder="Your full name" required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 ·····" required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea value={form.message} onChange={set("message")} placeholder="A few words on what you're looking for." />
          </div>

          <button type="submit" className="btn">
            Reach out <span className="arrow" />
          </button>
          <div className={"sent-note" + (sent ? " show" : "")}>
            Thank you. We will be in touch within two working days.
          </div>
        </form>
      </div>

      <div className="footer">
        <div>
          <div className="mark">Gaalibeedu</div>
          <div style={{marginTop: 8}} className="kannada">ಗಾಳಿಬೀಡು · The Valley of Wind</div>
        </div>
        <div className="center">
          Marketed by Polaris Infra · Madikeri<br/>
          <span style={{opacity: 0.6}}>© 2026 · All enquiries private</span>
        </div>
        <div className="right">
          A 1.7-acre hilltop · Coorg, Karnataka<br/>
          <span style={{opacity: 0.6}}>Three plots · 24,684 sq ft each</span>
        </div>
      </div>
    </section>
  );
}

/* ============ Tweaks ============ */
function GaalibeeduTweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Typography" />
      <TweakRadio
        label="Type pairing"
        value={tweaks.type}
        onChange={(v) => setTweak("type", v)}
        options={[
          { value: "playfair", label: "Playfair" },
          { value: "cormorant", label: "Cormorant" },
          { value: "garamond", label: "Garamond" },
        ]}
      />

      <TweakSection label="Palette" />
      <TweakColor
        label="Accent"
        value={tweaks.accent}
        onChange={(v) => setTweak("accent", v)}
        options={["#B8915A", "#8A9A7B", "#7B6A55", "#A03F2A"]}
      />
      <TweakRadio
        label="Background"
        value={tweaks.bg}
        onChange={(v) => setTweak("bg", v)}
        options={[
          { value: "cream", label: "Cream" },
          { value: "stone", label: "Stone" },
        ]}
      />

      <TweakSection label="Layout" />
      <TweakRadio
        label="Hero"
        value={tweaks.hero}
        onChange={(v) => setTweak("hero", v)}
        options={[
          { value: "stacked", label: "Stacked" },
          { value: "split", label: "Centered" },
        ]}
      />
    </TweaksPanel>
  );
}

/* ============ App ============ */
function App() {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "type": "playfair",
    "accent": "#B8915A",
    "hero": "stacked",
    "bg": "cream"
  }/*EDITMODE-END*/);

  useReveal();

  // apply tweaks to CSS vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", tweaks.accent);

    if (tweaks.type === "cormorant") {
      root.style.setProperty("--serif", '"Cormorant Garamond", "EB Garamond", Garamond, serif');
      root.style.setProperty("--sans", '"Inter", "Helvetica Neue", Arial, sans-serif');
    } else if (tweaks.type === "garamond") {
      root.style.setProperty("--serif", '"EB Garamond", "Apple Garamond", Garamond, serif');
      root.style.setProperty("--sans", '"Jost", "Helvetica Neue", Arial, sans-serif');
    } else {
      root.style.setProperty("--serif", '"Playfair Display", "EB Garamond", Garamond, serif');
      root.style.setProperty("--sans", '"Manrope", "Söhne", "Helvetica Neue", Arial, sans-serif');
    }

    if (tweaks.bg === "stone") {
      root.style.setProperty("--cream", "#1A1A1A");
      root.style.setProperty("--cream-deep", "#221E1A");
      root.style.setProperty("--stone", "#F5F0E8");
      root.style.setProperty("--charcoal", "#ECE5D7");
      root.style.setProperty("--muted", "#9A8F7E");
      root.style.setProperty("--hairline", "rgba(245, 240, 232, 0.18)");
    } else {
      root.style.setProperty("--cream", "#F5F0E8");
      root.style.setProperty("--cream-deep", "#ECE5D7");
      root.style.setProperty("--stone", "#1A1A1A");
      root.style.setProperty("--charcoal", "#2A2520");
      root.style.setProperty("--muted", "#6F665A");
      root.style.setProperty("--hairline", "rgba(26, 26, 26, 0.12)");
    }
  }, [tweaks]);

  return (
    <>
      <TopBar />
      <Hero variant={tweaks.hero} />
      <Story />
      <Property />
      <View />
      <Location />
      <Contact />
      <GaalibeeduTweaks tweaks={tweaks} setTweak={setTweak} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
