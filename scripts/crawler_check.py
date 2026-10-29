#!/usr/bin/env python3
"""Fetch a URL as each search/AI crawler user agent and report which key facts appear in the RAW served HTML
(no JS execution). Usage: crawler_check.py <base_url> <outdir> [path ...]"""
import sys, re, os, json, urllib.request

UAS = {
    "GPTBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
    "OAI-SearchBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
    "PerplexityBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    "ClaudeBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "Googlebot": "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Bingbot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/130.0 Safari/537.36",
}
FACTS = os.environ.get("FACTS", "acre|sq ft|Madikeri|Galibeedu|Gaalibeedu|polarisinfra322@gmail.com|+91|FAQ").split("|")

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None

def visible_text(html):
    body = html[html.lower().find("<body"):] if "<body" in html.lower() else html
    body = re.sub(r"<(script|style|template|noscript)[^>]*>.*?</\1>", " ", body, flags=re.S | re.I)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body)).strip()

def main():
    base, out, *paths = sys.argv[1:]
    paths = paths or ["/"]
    os.makedirs(out, exist_ok=True)
    opener = urllib.request.build_opener(NoRedirect)
    rows = []
    print(f"{'UA':14} {'path':14} {'code':>4} {'bytes':>7} {'bodywords':>9} {'ld+json':>7}  facts-in-body")
    for ua, s in UAS.items():
        for p in paths:
            req = urllib.request.Request(base + p, headers={"User-Agent": s})
            try:
                r = opener.open(req, timeout=30); code = r.status; html = r.read().decode("utf8", "ignore")
            except urllib.error.HTTPError as e:
                code = e.code; html = e.read().decode("utf8", "ignore")
            fn = os.path.join(out, f"{ua}{p.replace('/', '_') or '_'}.html")
            open(fn, "w").write(html)
            txt = visible_text(html)
            ld = len(re.findall(r'application/ld\+json', html))
            hits = {f: (f.lower() in txt.lower()) for f in FACTS}
            rows.append(dict(ua=ua, path=p, code=code, bytes=len(html), body_words=len(txt.split()), ldjson=ld, **hits))
            print(f"{ua:14} {p:14} {code:>4} {len(html):>7} {len(txt.split()):>9} {ld:>7}  " +
                  " ".join(f"{f}:{'Y' if v else 'N'}" for f, v in hits.items()))
    json.dump(rows, open(os.path.join(out, "crawler_check.json"), "w"), indent=1)

if __name__ == "__main__":
    main()
