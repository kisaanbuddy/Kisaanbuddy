import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('../frontend-next/src/lib/locales/en.json', encoding='utf-8') as f:
    en = json.load(f)
with open('../frontend-next/src/lib/locales/hi.json', encoding='utf-8') as f:
    hi = json.load(f)
with open('../frontend-next/src/lib/locales/kn.json', encoding='utf-8') as f:
    kn = json.load(f)

def get_keys(d, prefix=''):
    keys = {}
    for k, v in d.items():
        full = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            keys.update(get_keys(v, full))
        else:
            keys[full] = v
    return keys

en_keys = get_keys(en)
hi_keys = get_keys(hi)
kn_keys = get_keys(kn)

missing_in_kn = sorted(list(set(en_keys.keys()) - set(kn_keys.keys())))
print(f'=== MISSING IN KANNADA ({len(missing_in_kn)}) ===')
for k in missing_in_kn:
    print(f"{k} -> EN: {repr(en_keys[k])} | HI: {repr(hi_keys.get(k, 'N/A'))}")

print('\n=== MISSING IN HINDI ===')
missing_in_hi = sorted(list(set(en_keys.keys()) - set(hi_keys.keys())))
for k in missing_in_hi:
    print(f"{k} -> EN: {repr(en_keys[k])}")

# Check for values in kn that are identical to en (potential untranslated strings)
untranslated = []
for k, v in kn_keys.items():
    if k in en_keys and v == en_keys[k] and len(str(v)) > 3 and not str(v).isdigit() and not str(v).startswith('http') and not str(v).startswith('/'):
        # ignore proper nouns/brands or tech terms if any
        if v not in ['KisaanBuddy', 'APMC', 'ICAR', 'eNAM', 'PM-Kisan', 'SMS', 'OTP']:
            untranslated.append((k, v))

print(f'\n=== IDENTICAL TO EN IN KANNADA ({len(untranslated)}) ===')
for k, v in untranslated[:30]:
    print(f"{k}: {v}")
