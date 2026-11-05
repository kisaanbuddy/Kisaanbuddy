import sqlite3

conn = sqlite3.connect('krishiai.db')
c = conn.cursor()

c.execute("SELECT count(*) FROM equipment_listings")
eq_list_count = c.fetchone()[0]

c.execute("SELECT count(*) FROM equipment_listings WHERE owner_phone IS NOT NULL AND trim(owner_phone) != ''")
with_phone = c.fetchone()[0]

print(f"Equipment listings: {eq_list_count} total, {with_phone} with phone, {eq_list_count - with_phone} without phone")

c.execute("SELECT id, title, owner_name, owner_phone, state, district FROM equipment_listings WHERE owner_phone IS NULL OR trim(owner_phone) = ''")
no_phones = c.fetchall()
print(f"Equipment listings with NO phone ({len(no_phones)}):")
for r in no_phones:
    print(r)

c.execute("SELECT count(*) FROM produce_listings")
prod_count = c.fetchone()[0]
c.execute("SELECT count(*) FROM produce_listings WHERE farmer_phone IS NOT NULL AND trim(farmer_phone) != ''")
prod_phone = c.fetchone()[0]
print(f"Produce listings: {prod_count} total, {prod_phone} with phone, {prod_count - prod_phone} without phone")

c.execute("SELECT id, commodity, farmer_name, farmer_phone FROM produce_listings WHERE farmer_phone IS NULL OR trim(farmer_phone) = ''")
prod_no_phone = c.fetchall()
print(f"Produce listings with NO phone ({len(prod_no_phone)}):")
for r in prod_no_phone:
    print(r)

# Check columns of equipment_catalog
c.execute("PRAGMA table_info(equipment_catalog)")
print("equipment_catalog columns:", [col[1] for col in c.fetchall()])

# Check columns of equipment_listings
c.execute("PRAGMA table_info(equipment_listings)")
print("equipment_listings columns:", [col[1] for col in c.fetchall()])

# Check columns of trade_inquiries
c.execute("PRAGMA table_info(trade_inquiries)")
print("trade_inquiries columns:", [col[1] for col in c.fetchall()])
