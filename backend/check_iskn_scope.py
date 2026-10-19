import os, re

errors = []
for root, _, files in os.walk('frontend-next/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'isKn' in content and not re.search(r'\b(const|let|var)\s+isKn\b', content) and not re.search(r'\bisKn\s*[:=]', content) and not re.search(r'function[^(]*\([^)]*\bisKn\b', content):
                errors.append(f"{path}: 'isKn' used but not declared")
            if 'isHi' in content and not re.search(r'\b(const|let|var)\s+isHi\b', content) and not re.search(r'\bisHi\s*[:=]', content) and not re.search(r'function[^(]*\([^)]*\bisHi\b', content):
                errors.append(f"{path}: 'isHi' used but not declared")

print("isKn / isHi Audit finished. Issues found:", len(errors))
for err in errors:
    print(" -", err)
