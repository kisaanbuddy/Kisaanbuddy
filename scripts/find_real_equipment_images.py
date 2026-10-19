import urllib.request
import re

endpoints = {
    'fieldking-rotavator': 'https://www.fieldking.com/product-portfolio/rotary-tiller/',
    'spring-cultivator': 'https://www.fieldking.com/product-portfolio/cultivator/',
    'disc-plough': 'https://www.fieldking.com/product-portfolio/plough/',
    'laser-leveller': 'https://www.fieldking.com/product-portfolio/laser-land-leveller/',
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for key, url in endpoints.items():
    try:
        content = urllib.request.urlopen(urllib.request.Request(url, headers=headers)).read().decode('utf-8', errors='ignore')
        imgs = [x for x in re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content) if 'images/' in x and ('sm/' in x or 'product' in x)]
        print(key, '->', imgs[:2])
    except Exception as e:
        print(key, '-> error:', e)
