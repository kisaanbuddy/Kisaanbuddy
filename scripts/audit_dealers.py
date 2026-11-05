import sqlite3
from collections import defaultdict

conn = sqlite3.connect('krishiai.db')
c = conn.cursor()

c.execute("SELECT owner_name, owner_phone, state, district, count(*), group_concat(title, ' || ') FROM equipment_listings GROUP BY owner_name, state, district")
sellers = c.fetchall()
print(f"Total distinct equipment sellers/CHCs in equipment_listings: {len(sellers)}")
for s in sellers:
    print(f"Seller: {s[0]} | Phone: {s[1]} | Loc: {s[3]}, {s[2]} | Listings: {s[4]}")

c.execute("SELECT supplier_name, count(*) FROM equipment_catalog WHERE supplier_name IS NOT NULL GROUP BY supplier_name")
suppliers = c.fetchall()
print(f"\nDistinct suppliers in equipment_catalog: {len(suppliers)}")
for sup in suppliers:
    print(f"Supplier: {sup[0]} | Catalog items: {sup[1]}")
