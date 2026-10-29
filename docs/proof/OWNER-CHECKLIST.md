# Owner checklist: after the PR is merged and deployed

## 0. Deploy (whoever owns the landincoorg.in Netlify site)
- [ ] Site settings → Build & deploy: **Base dir** blank · **Build command** `npm ci && npm run build` · **Publish dir** `dist` (netlify.toml sets these, but the UI can override them).
- [ ] If you deploy by drag-and-drop or CLI: run `npm ci && npm run build` locally and deploy the **`dist/`** folder. Deploying the repo root would publish raw source.
- [ ] Forms → enable form detection → check that a form named **`inquiry`** appears after the deploy.
- [ ] Forms → Form notifications → add an email notification to the inbox you want leads to reach (owner decision 6).
- [ ] Submit one real enquiry from your phone. Confirm it shows in Netlify → Forms (check the **Spam** tab too) **and** that the email arrives.
- [ ] Spot-check: `curl -sI https://landincoorg.in/gaalibeedu` → `301` to `/`. `https://landincoorg.in/robots.txt`, `/sitemap.xml` and `/llms.txt` → 200. `/_reset.html` and `/uploads/DJI_0008.mp4` → 404.

## 1. Google Search Console
- [ ] Add a **Domain property** `landincoorg.in` (DNS TXT record at your registrar). This covers http/https and www.
- [ ] Sitemaps → submit `https://landincoorg.in/sitemap.xml` → status "Success".
- [ ] URL Inspection → `https://landincoorg.in/` → **Test live URL** → **View tested page → HTML**. Confirm it contains: "Where exactly is this land in Coorg?", "12.4964", "1,040", "polarisinfra322@gmail.com". Then **Request indexing**.
- [ ] URL Inspection → `https://landincoorg.in/gaalibeedu` → should report the redirect to `/`.
- [ ] After 3–7 days: Pages report → `/` "Indexed". Enhancements: nothing expected (see PROOF §2).

## 2. Bing Webmaster Tools (feeds ChatGPT search and Copilot)
- [ ] Add the site. "Import from Google Search Console" is the quickest way to verify.
- [ ] Sitemaps → submit `https://landincoorg.in/sitemap.xml`.
- [ ] URL Inspection → `https://landincoorg.in/` → **Live URL** → check the fetched HTML contains the same four strings → **Request indexing**.
- [ ] Optional: enable IndexNow (Netlify has an integration) so future edits are pushed to Bing immediately.

## 3. Consistency (once owner decisions 1–6 are answered)
- [ ] Update `src/facts.js` (move the confirmed values into VERIFIED), run `npm run build`, open a PR.
- [ ] Use the **same** area, spelling (Galibeedu), price and contact details on 1acre, 99acres, Reddit and YouTube.
- [ ] Delete the auditor's throwaway Netlify sites `landincoorg-staging-ab12` and `landincoorg-rrt-ab12`.
