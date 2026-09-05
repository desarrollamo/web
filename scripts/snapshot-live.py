from collections import deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, urldefrag
from urllib.request import Request, urlopen
import json, mimetypes, re

BASE = "https://desarrollamo.com.ar/"
HOST = urlparse(BASE).netloc
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public"
MAX_URLS = 300

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.urls = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        for key in ("href", "src"):
            if data.get(key): self.urls.append(data[key])

def normalize(raw, parent):
    if not raw or raw.startswith(("mailto:", "tel:", "javascript:", "data:")): return None
    absolute = urldefrag(urljoin(parent, raw))[0]
    parsed = urlparse(absolute)
    if parsed.scheme not in ("http", "https") or parsed.netloc != HOST: return None
    return parsed._replace(query="").geturl()

def target_for(url, content_type):
    path = urlparse(url).path or "/"
    rel = path.lstrip("/")
    if path.endswith("/"):
        rel += "index.html"
    elif not Path(rel).suffix and "text/html" in content_type:
        rel = str(Path(rel) / "index.html")
    elif not rel:
        rel = "index.html"
    return OUT / rel

def fetch(url):
    req = Request(url, headers={"User-Agent": "DesarrollAMO-Web-Snapshot/1.0"})
    with urlopen(req, timeout=20) as response:
        return response.status, response.headers.get("Content-Type", "").split(";")[0], response.read()

OUT.mkdir(parents=True, exist_ok=True)
queue, seen, saved = deque([BASE]), set(), []
while queue and len(seen) < MAX_URLS:
    url = queue.popleft()
    if url in seen: continue
    seen.add(url)
    try:
        status, ctype, body = fetch(url)
    except Exception as exc:
        print(f"WARN {url} {exc}"); continue
    if status != 200: continue
    target = target_for(url, ctype)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(body); saved.append({"url": url, "path": str(target.relative_to(ROOT)).replace("\\", "/"), "type": ctype, "bytes": len(body)})
    text = None
    if ctype.startswith("text/") or ctype in ("application/javascript", "application/json"):
        try: text = body.decode("utf-8")
        except UnicodeDecodeError: text = body.decode("latin-1", errors="ignore")
    if ctype == "text/html" and text is not None:
        parser = Links(); parser.feed(text)
        for raw in parser.urls:
            normalized = normalize(raw, url)
            if normalized and normalized not in seen: queue.append(normalized)
    elif ctype == "text/css" and text is not None:
        for raw in re.findall(r"url\((?:['\"])?([^)'\"]+)", text):
            normalized = normalize(raw.strip(), url)
            if normalized and normalized not in seen: queue.append(normalized)

manifest = {
    "source": BASE,
    "captured": len(saved),
    "files": sorted(saved, key=lambda item: item["path"])
}
(ROOT / "snapshot-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Snapshot PASS: {len(saved)} archivos públicos capturados")
