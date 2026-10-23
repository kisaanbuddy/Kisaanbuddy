import urllib.request
import re

url = 'https://www.fieldking.com/product-portfolio/trailer/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
print('Found images on fieldking trailer page:')
for img in imgs:
    print(' ', img)
