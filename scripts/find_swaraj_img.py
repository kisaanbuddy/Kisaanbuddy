import urllib.request
import re

url = 'https://www.swarajtractors.com/swaraj-744-fe-tractor'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    all_imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content)
    for x in all_imgs:
        if any(w in x.lower() for w in ['744', 'tractor', 'product', 'upload', 'files']):
            print(' ', x)
except Exception as e:
    print('Error:', e)
