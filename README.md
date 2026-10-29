# landincoorg.in

A prerendered single-property listing for land in Galibeedu, Madikeri, Coorg.

```bash
npm ci
npm run build      # -> dist/  (static HTML with all content, JSON-LD, robots, sitemap, llms.txt)
npm run preview    # serve dist/ on :4173
```

- **Facts live in one file:** `src/facts.js`. `VERIFIED` values have primary sources in `docs/FACT-REGISTER.md`. `PENDING_OWNER` values wait on `docs/OWNER-DECISIONS.md` and are never emitted into JSON-LD or llms.txt.
- **Netlify:** `netlify.toml` builds with `npm ci && npm run build` and publishes `dist/`. For manual deploys, deploy **`dist/`**, not the repo root.
- **Forms:** the enquiry form is a Netlify Form named `inquiry`. Enable form detection and add an email notification in Netlify → Forms.
- **Source video:** the 4K originals are in `media-src/` (not deployed). The web renditions in `public/media/` were made with ffmpeg (H.264, 1080p/720p, faststart, no audio).
