import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('backend'))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("--- Testing /api/marketplace/product-categories ---")
r1 = client.get("/api/marketplace/product-categories")
assert r1.status_code == 200, f"Failed {r1.status_code}: {r1.text}"
cats = r1.json()
print(f"Categories count: {len(cats)}")
for c in cats[:3]:
    print(f"  - {c['name_en']} ({c['name_hi']}): {c['product_count']} products")

print("\n--- Testing /api/marketplace/products?category=fungicides ---")
r2 = client.get("/api/marketplace/products?category=fungicides")
assert r2.status_code == 200, f"Failed {r2.status_code}: {r2.text}"
prods = r2.json()
print(f"Fungicides found: {prods['total']}")
for p in prods['items'][:2]:
    print(f"  - {p['name']} | Rs. {p['selling_price']} | Seller: {p['seller_name']}")

print("\n--- Testing /api/marketplace/products?crop=Wheat&disease=Yellow%20Rust ---")
r3 = client.get("/api/marketplace/products?crop=Wheat&disease=Yellow%20Rust")
assert r3.status_code == 200, f"Failed {r3.status_code}: {r3.text}"
rust_prods = r3.json()
print(f"Wheat Yellow Rust products found: {rust_prods['total']}")
for p in rust_prods['items'][:3]:
    print(f"  - {p['name']} ({p['brand']}) | {p['active_ingredient']}")

print("\n--- Testing /api/marketplace/product-compare-prices?product_id=fungi-1 ---")
r4 = client.get("/api/marketplace/product-compare-prices?product_id=fungi-1")
assert r4.status_code == 200, f"Failed {r4.status_code}: {r4.text}"
cmp_res = r4.json()
print(f"Comparison Target: {cmp_res.get('target_product', {}).get('name')}")
if cmp_res.get('lowest_price'):
    print(f"  Lowest: {cmp_res['lowest_price']['product']['name']} at Rs. {cmp_res['lowest_price']['product']['selling_price']}")
if cmp_res.get('best_value'):
    print(f"  Best Value: {cmp_res['best_value']['product']['name']} at Rs. {cmp_res['best_value']['product']['selling_price']}")
print(f"  Alternatives: {len(cmp_res.get('alternatives', []))}")

print("\n--- Testing /api/marketplace/products?deficiency=nitrogen,phosphorus ---")
r5 = client.get("/api/marketplace/products?deficiency=nitrogen,phosphorus")
assert r5.status_code == 200, f"Failed {r5.status_code}: {r5.text}"
soil_prods = r5.json()
print(f"Fertilizers for Nitrogen/Phosphorus: {soil_prods['total']}")

print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
