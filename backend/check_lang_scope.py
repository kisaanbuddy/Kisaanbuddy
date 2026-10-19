import os, re

errors = []
for root, _, files in os.walk('frontend-next/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if re.search(r'\blang\b', content):
                # Check if lang is defined
                has_lang_decl = bool(
                    re.search(r'const\s+{[^}]*\blang\b[^}]*}\s*=\s*useLanguage', content) or
                    re.search(r'\blang\s*[:=]', content) or
                    re.search(r'function[^(]*\([^)]*\blang\b', content) or
                    re.search(r'\(\s*{[^}]*\blang\b', content) or
                    re.search(r'\(\s*lang\s*[:,\)]', content) or
                    'lang: Lang' in content or
                    'type Lang' in content
                )
                if not has_lang_decl:
                    errors.append(f"{path}: 'lang' used but no declaration found")

print("Audit finished. Issues found:", len(errors))
for err in errors:
    print(" -", err)
