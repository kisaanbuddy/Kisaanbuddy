import sqlite3
import urllib.parse
import re

conn = sqlite3.connect('krishiai.db')
c = conn.cursor()

c.execute("SELECT id, brand, model_name, official_source_url, supplier_name FROM equipment_catalog WHERE official_source_url IS NOT NULL")
rows = c.fetchall()

print(f"Total catalog entries with URL: {len(rows)}")

issues = []
for r in rows:
    item_id, brand, model, url, supplier = r
    url = url.strip() if url else ""
    if not url:
        issues.append((item_id, brand, model, url, "Empty URL"))
        continue
    parsed = urllib.parse.urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        issues.append((item_id, brand, model, url, "Missing scheme or netloc"))
    elif parsed.scheme not in ("http", "https"):
        issues.append((item_id, brand, model, url, f"Unsupported scheme: {parsed.scheme}"))
    elif " " in url:
        issues.append((item_id, brand, model, url, "Contains whitespace"))
    
print(f"Syntactic issues found: {len(issues)}")
for iss in issues[:20]:
    print(" ", iss)
