// IndexNow ping, shared by the Netlify post-deploy plugin and the manual CLI.
// Protocol: https://www.indexnow.org/documentation. The key is public by design: it is served at /<key>.txt.
export const INDEXNOW_KEY = "855c7e9944ffa43349baf16d26676c25";
export const HOST = "landincoorg.in";

export function changedUrls(prev, next) {
  const before = new Map((prev?.urls || []).map((u) => [u.loc, u.lastmod]));
  return (next?.urls || []).filter((u) => before.get(u.loc) !== u.lastmod).map((u) => u.loc);
}

export async function pingIndexNow(urls, { log = console.log } = {}) {
  if (!urls.length) { log("IndexNow: nothing changed, no ping"); return { status: "skipped" }; }
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`, urlList: urls }),
  });
  log(`IndexNow: HTTP ${res.status} for ${urls.length} URL(s): ${urls.join(", ")}`);
  return { status: res.status };
}
