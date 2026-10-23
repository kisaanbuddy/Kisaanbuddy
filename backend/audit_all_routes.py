import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

app_dir = '../frontend-next/src/app'

routes = {}
for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            rel = os.path.relpath(os.path.join(root, f), app_dir)
            parts = rel.split(os.sep)
            if len(parts) == 1:
                route = '/'
            else:
                route = '/' + parts[0]
            if route not in routes:
                routes[route] = []
            routes[route].append((f, os.path.join(root, f)))

for r in sorted(routes.keys()):
    files = routes[r]
    uses_lang = False
    file_names = [f[0] for f in files]
    for fn, fp in files:
        with open(fp, encoding='utf-8', errors='ignore') as f_obj:
            content = f_obj.read()
            if 'useLanguage' in content or 'useTranslation' in content:
                uses_lang = True
    print(f"Route: {r:20} Files: {', '.join(file_names):35} Uses useLanguage: {uses_lang}")
