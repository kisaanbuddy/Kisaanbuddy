import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

app_dir = '../frontend-next/src/app'
components_dir = '../frontend-next/src/components'

routes = []
for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f == 'page.tsx':
            rel = os.path.relpath(os.path.join(root, f), app_dir)
            route = '/' + os.path.dirname(rel).replace('\\', '/')
            if route == '/.':
                route = '/'
            routes.append((route, os.path.join(root, f)))

print(f"Total routes discovered: {len(routes)}")
for r, p in sorted(routes):
    print(f"  {r}")
