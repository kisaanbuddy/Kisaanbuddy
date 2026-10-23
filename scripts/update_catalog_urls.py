import sqlite3
import json

url_updates = {
    'Tipping Trailer 5 Ton Hydraulic': 'https://www.fieldking.com/product-portfolio/trailer/',
    'Regular Multi Speed 7 Feet': 'https://www.fieldking.com/product-portfolio/rotary-tiller/',
    'Spring Loaded Cultivator 11 Tyne': 'https://www.fieldking.com/product-portfolio/cultivator/',
    'Disc Plough 3 Bottom': 'https://www.fieldking.com/product-portfolio/plough/',
    'Laser Land Leveller with Dual Mast Transmitter': 'https://www.fieldking.com/product-portfolio/laser-land-leveller/',
    'DI 745 III Sikander': 'https://www.sonalika.com/tractors.html',
    '5310 GearPro 4WD': 'https://www.deere.co.in/en/tractors/',
    '987 Self-Propelled Multi-Crop': 'https://preet.co/combine-harvesters/',
    'Multi-Crop Thresher (Tractor Operated)': 'https://preet.co/threshers/',
    'Sugarcane Harvester 3737-Tejas': 'https://www.shaktimanagro.com',
    'Champion Semi Champion 165': 'https://www.shaktimanagro.com',
    'Round Straw Baler (SRB 60)': 'https://www.shaktimanagro.com',
    '9100 Maize & Paddy Combine': 'https://dasmesh.com',
    '641 Paddy Thresher': 'https://dasmesh.com',
    'Zero Till Seed Cum Fertilizer Drill (9 Tyne)': 'https://nationalagro.org',
    '9 Tyne Rigid Cultivator': 'https://www.mahindratractor.com',
    'Non-Tipping Farm Trailer 3 Ton': 'https://www.mahindratractor.com',
    'Opal 090 Hydraulic Reversible MB Plough': 'https://lemken.com/en-in/',
    'HTP Tractor Mounted Boom Sprayer 400L': 'https://www.aspee.com',
    'Bullet Orchard Sprayer 600L': 'https://mitraagro.com',
    'Precision Drip Irrigation Kit 1 Acre': 'https://www.jains.com',
    '5 HP Diesel Monoblock Water Pump Set (KDI-525)': 'https://www.kirloskarpumps.com',
    'Straw Reaper 54 inch': 'https://kartaragro.com',
}

conn = sqlite3.connect('krishiai.db')
c = conn.cursor()
for name, url in url_updates.items():
    c.execute('UPDATE equipment_catalog SET official_source_url = ? WHERE model_name = ?', (url, name))
conn.commit()
conn.close()
print('Updated URLs in SQLite!')

with open('frontend-next/src/lib/data/marketplace-data.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for item in d['equipment_catalog']:
    if item['model_name'] in url_updates:
        item['official_source_url'] = url_updates[item['model_name']]

with open('frontend-next/src/lib/data/marketplace-data.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=2, ensure_ascii=False)

print('Updated URLs in marketplace-data.json!')
