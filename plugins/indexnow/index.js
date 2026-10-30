// Netlify build plugin: after a successful PRODUCTION deploy, ping IndexNow (Bing, Yandex, etc.)
// with only the URLs whose lastmod changed since the previous production build.
//   onPreBuild: fetch the currently live /indexnow-manifest.json (the previous build).
//   onSuccess:  compare it with dist/indexnow-manifest.json and ping the difference.
// A failed ping never fails the deploy.
import { readFileSync } from "node:fs";
import path from "node:path";
import { changedUrls, pingIndexNow, HOST } from "../../scripts/indexnow-lib.mjs";

let previous = null;

export const onPreBuild = async () => {
  if (process.env.CONTEXT !== "production") return;
  try {
    const r = await fetch(`https://${HOST}/indexnow-manifest.json`, { cache: "no-store" });
    previous = r.ok ? await r.json() : { urls: [] };
  } catch { previous = { urls: [] }; }
  console.log(`IndexNow: previous manifest has ${previous.urls.length} URL(s)`);
};

export const onSuccess = async ({ constants }) => {
  if (process.env.CONTEXT !== "production") { console.log("IndexNow: not production, skipped"); return; }
  try {
    const next = JSON.parse(readFileSync(path.join(constants.PUBLISH_DIR, "indexnow-manifest.json"), "utf8"));
    await pingIndexNow(changedUrls(previous || { urls: [] }, next));
  } catch (e) {
    console.log(`IndexNow: ping failed (${e.message}); deploy unaffected`);
  }
};
