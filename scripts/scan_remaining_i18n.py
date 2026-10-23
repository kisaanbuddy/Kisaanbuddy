import os
import re

root = r"frontend-next/src"
patterns = [
    ("isKn", re.compile(r"\bisKn\b")),
    ("lang==kn", re.compile(r"lang\s*===\s*['\"]kn['\"]")),
    ("hi_or_kn", re.compile(r"\(lang\s*===\s*['\"]hi['\"]\s*\|\|\s*lang\s*===\s*['\"]kn['\"]")),
    ("activeAlertLang", re.compile(r"\bactiveAlertLang\b")),
    ("activeLang==kn", re.compile(r"activeLang\s*===\s*['\"]kn['\"]")),
]

results = {}
for dirpath, _, filenames in os.walk(root):
    for fn in filenames:
        if fn.endswith((".tsx", ".ts")):
            p = os.path.join(dirpath, fn).replace("\\", "/")
            try:
                with open(p, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                found = []
                for label, pat in patterns:
                    matches = pat.findall(content)
                    if matches:
                        found.append(f"{label}:{len(matches)}")
                if found:
                    results[p] = found
            except Exception as e:
                pass

print(f"Total matching files: {len(results)}")
for path, matches in sorted(results.items()):
    print(f"{path}: {', '.join(matches)}")
