import urllib.request
import re

url = 'https://kisaanbuddy.com/marketplace'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

scripts = re.findall(r'/_next/static/[^"]+', html)
print(f"Total Next.js static files in HTML: {len(scripts)}")
for s in scripts:
    print(" ", s)

# Let's inspect the page JS bundle for marketplace
marketplace_js = [s for s in scripts if 'marketplace' in s or 'app/marketplace' in s]
print(f"Marketplace JS files: {marketplace_js}")

if marketplace_js:
    js_url = 'https://kisaanbuddy.com' + marketplace_js[0]
    print(f"Fetching {js_url}...")
    req_js = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_js, timeout=15) as js_resp:
        js_content = js_resp.read().decode('utf-8', errors='ignore')
        print(f"JS length: {len(js_content)}")
        for term in ['Compare Prices', 'dealers', 'inquiry_type', 'tel:', 'wa.me', 'Request Callback', 'Best Value']:
            print(f"  '{term}' in JS: {term in js_content}")
