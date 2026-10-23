import os
import urllib.request
import json
import sqlite3

# Curated high-resolution real agricultural photography from Unsplash (Permitted commercial reuse)
REAL_PHOTOS = {
    # Agricultural Trailers (Card 1: Tipping Trailer 5 Ton)
    'tipping-trailer': 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80',
    'farm-trailer': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    
    # Tractors
    'mahindra-575': 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    'swaraj-744': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    'sonalika-745': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    'tafe-241': 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
    'john-deere-5310': 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    
    # Combine Harvesters
    'dasmesh-9100': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    'preet-987': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    'shaktiman-sugarcane': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
    
    # Rotavators / Rotary Tillers
    'fieldking-rotavator': 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    'shaktiman-rotavator': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    'maschio-virat': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    
    # Cultivators & Ploughs
    'cultivator': 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80',
    'spring-cultivator': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    'disc-plough': 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
    'lemken-plough': 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    
    # Seed Drills
    'zero-till-drill': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
    'roto-seed-drill': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    
    # Sprayers
    'boom-sprayer': 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    'orchard-sprayer': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    
    # Threshers & Balers
    'thresher': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    'paddy-thresher': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    'round-baler': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    'laser-leveller': 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80',
    'straw-reaper': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    'drip-irrigation': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    'diesel-pump': 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
}

base_dir = os.path.join('frontend-next', 'public', 'images', 'marketplace')

# Load marketplace data
data_path = os.path.join('frontend-next', 'src', 'lib', 'data', 'marketplace-data.json')
with open(data_path, 'r', encoding='utf-8') as f:
    d = json.load(f)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

downloaded = {}

for item in d['equipment_catalog']:
    old_url = item.get('image_url')
    if old_url and old_url.endswith('.svg'):
        # extract slug
        slug = os.path.splitext(os.path.basename(old_url))[0]
        photo_url = REAL_PHOTOS.get(slug, REAL_PHOTOS['tipping-trailer'])
        
        # Target local file
        subfolder = 'tractors' if item['category'] == 'tractors' else ('harvesters' if item['category'] == 'harvesters' else 'implements')
        local_rel = f"/images/marketplace/{subfolder}/{slug}.jpg"
        local_full = os.path.join('frontend-next', 'public', 'images', 'marketplace', subfolder, f"{slug}.jpg")
        os.makedirs(os.path.dirname(local_full), exist_ok=True)
        
        # Download if not yet downloaded
        if slug not in downloaded:
            try:
                req = urllib.request.Request(photo_url, headers=headers)
                with urllib.request.urlopen(req, timeout=15) as res:
                    data = res.read()
                    with open(local_full, 'wb') as out:
                        out.write(data)
                downloaded[slug] = local_rel
                print(f"Downloaded real photo for {slug} ({len(data)} bytes)")
            except Exception as e:
                print(f"Failed to download {slug}: {e}")
        
        item['image_url'] = local_rel

# Save updated marketplace-data.json
with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=2, ensure_ascii=False)

print(f"Updated marketplace-data.json with real photos for {len(downloaded)} machines!")

# Also update sqlite db
conn = sqlite3.connect('krishiai.db')
c = conn.cursor()
for item in d['equipment_catalog']:
    c.execute('UPDATE equipment_catalog SET image_url = ? WHERE id = ?', (item['image_url'], item['id']))
conn.commit()
conn.close()
print("Updated sqlite database!")
