import sqlite3
from collections import defaultdict

conn = sqlite3.connect('krishiai.db')
c = conn.cursor()

# Get all equipment listings
c.execute("""
    SELECT id, title, brand, model_name, category, hp_rating, condition, price, price_unit, 
           owner_name, state, district, includes_operator, availability_status
    FROM equipment_listings
""")
eq_listings = c.fetchall()

# Get all catalog items with price
c.execute("""
    SELECT id, brand, model_name, category, hp_rating, indicative_price, supplier_name, is_verified
    FROM equipment_catalog
""")
cat_items = c.fetchall()

print(f"Total equipment listings: {len(eq_listings)}")
print(f"Total catalog items: {len(cat_items)}")

# Check matching models between listings and catalog
listing_models = defaultdict(list)
for l in eq_listings:
    key = (l[2].strip().lower(), (l[3] or l[1]).strip().lower())
    listing_models[key].append(l)

cat_models = defaultdict(list)
for cat in cat_items:
    key = (cat[1].strip().lower(), cat[2].strip().lower())
    cat_models[key].append(cat)

print(f"\nUnique listing (brand, model) keys: {len(listing_models)}")
print(f"Unique catalog (brand, model) keys: {len(cat_models)}")

# How many listing keys appear in catalog or multiple listings?
matches = set(listing_models.keys()) & set(cat_models.keys())
print(f"Direct (brand, model) overlaps between listings and catalog: {len(matches)}")
for m in sorted(matches):
    print(f"  Match: {m}")

# Check category and HP distribution
print("\nChecking by category & similar HP rating:")
for cat_name in set(l[4] for l in eq_listings):
    cat_eq = [l for l in eq_listings if l[4] == cat_name]
    cat_c = [c for c in cat_items if c[3] == cat_name]
    print(f"  Category '{cat_name}': {len(cat_eq)} listings, {len(cat_c)} catalog items")
