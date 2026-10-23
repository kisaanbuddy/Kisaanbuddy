import os
import json

svg_templates = {
    'tractors': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_{id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ecfdf5" />
      <stop offset="100%" stop-color="#d1fae5" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" rx="16" fill="url(#bg_{id})" />
  <g transform="translate(50, 40)">
    <circle cx="70" cy="150" r="45" fill="#1e293b" stroke="#475569" stroke-width="6" />
    <circle cx="70" cy="150" r="20" fill="#94a3b8" />
    <circle cx="230" cy="165" r="30" fill="#1e293b" stroke="#475569" stroke-width="5" />
    <circle cx="230" cy="165" r="12" fill="#94a3b8" />
    <path d="M70,120 L130,120 L140,70 L190,70 L200,120 L250,130 L250,170 L70,170 Z" fill="#059669" />
    <path d="M135,115 L185,115 L180,75 L145,75 Z" fill="#bae6fd" opacity="0.8" />
    <rect x="225" y="90" width="8" height="35" fill="#334155" rx="2" />
    <circle cx="250" cy="140" r="6" fill="#fef08a" />
  </g>
  <text x="200" y="245" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" fill="#065f46">{brand}</text>
  <text x="200" y="265" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#475569">{model}</text>
</svg>''',

    'harvesters': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_{id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7" />
      <stop offset="100%" stop-color="#fde68a" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" rx="16" fill="url(#bg_{id})" />
  <g transform="translate(50, 40)">
    <circle cx="90" cy="155" r="40" fill="#1e293b" stroke="#475569" stroke-width="6" />
    <circle cx="220" cy="165" r="28" fill="#1e293b" stroke="#475569" stroke-width="5" />
    <path d="M60,130 L240,130 L250,90 L180,70 L110,70 L60,110 Z" fill="#d97706" />
    <path d="M240,140 L280,180 L290,170 L250,130 Z" fill="#78350f" />
    <rect x="120" y="75" width="40" height="35" fill="#bae6fd" opacity="0.8" rx="2" />
  </g>
  <text x="200" y="245" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" fill="#92400e">{brand}</text>
  <text x="200" y="265" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#475569">{model}</text>
</svg>''',

    'implements': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_{id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0fdf4" />
      <stop offset="100%" stop-color="#dcfce7" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" rx="16" fill="url(#bg_{id})" />
  <g transform="translate(80, 50)">
    <rect x="20" y="80" width="200" height="30" rx="6" fill="#0284c7" />
    <path d="M50,110 L40,160 L60,160 L70,110 Z" fill="#334155" />
    <path d="M110,110 L100,160 L120,160 L130,110 Z" fill="#334155" />
    <path d="M170,110 L160,160 L180,160 L190,110 Z" fill="#334155" />
    <circle cx="120" cy="55" r="22" fill="#059669" />
    <path d="M110,55 L130,55 M120,45 L120,65" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
  </g>
  <text x="200" y="245" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" fill="#0369a1">{brand}</text>
  <text x="200" y="265" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#475569">{model}</text>
</svg>'''
}

with open('frontend-next/src/lib/data/marketplace-data.json', encoding='utf-8') as f:
    d = json.load(f)

count = 0
for item in d['equipment_catalog']:
    u = item.get('image_url')
    if u and not u.startswith('http'):
        clean_path = u.lstrip('/')
        full_path = os.path.join('frontend-next', 'public', clean_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        cat = item['category']
        tmpl_key = 'tractors' if cat == 'tractors' else ('harvesters' if cat == 'harvesters' else 'implements')
        content = svg_templates[tmpl_key].format(
            id=item['id'],
            brand=item['brand'],
            model=item['model_name']
        )
        with open(full_path, 'w', encoding='utf-8') as out:
            out.write(content)
        count += 1

print(f"Successfully generated {count} SVG implements and machinery files!")
