import sqlite3
import urllib.request
import urllib.error
import ssl

conn = sqlite3.connect('krishiai.db')
c = conn.cursor()

c.execute("SELECT id, brand, model_name, official_source_url FROM equipment_catalog WHERE official_source_url IS NOT NULL")
rows = c.fetchall()

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sample = rows[:25] # check the non-machinepoint ones and some machinepoint
print(f"Testing {len(sample)} sample URLs...")
for item_id, brand, model, url in sample:
    try:
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            print(f"[{item_id}] {brand} {model} -> HTTP {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"[{item_id}] {brand} {model} -> HTTP Error: {e.code} ({url})")
    except urllib.error.URLError as e:
        print(f"[{item_id}] {brand} {model} -> URL Error: {e.reason} ({url})")
    except Exception as e:
        print(f"[{item_id}] {brand} {model} -> Error: {e} ({url})")
