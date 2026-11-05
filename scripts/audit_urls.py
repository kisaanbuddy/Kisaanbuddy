import sqlite3
import urllib.parse

conn = sqlite3.connect('krishiai.db')
c = conn.cursor()

c.execute("SELECT id, brand, model_name, official_source_url, supplier_name FROM equipment_catalog")
rows = c.fetchall()

print(f"Total catalog rows: {len(rows)}")
domains = {}
urls = []
for r in rows:
    url = r[3]
    if url:
        parsed = urllib.parse.urlparse(url)
        domains[parsed.netloc] = domains.get(parsed.netloc, 0) + 1
        urls.append((r[0], r[1], r[2], url))

print("\nDomains in equipment_catalog:")
for d, count in sorted(domains.items(), key=lambda x: x[1], reverse=True):
    print(f"  {d}: {count}")

print(f"\nSample of URLs:")
for u in urls[:15]:
    print(f"  [{u[0]}] {u[1]} {u[2]}: {u[3]}")
