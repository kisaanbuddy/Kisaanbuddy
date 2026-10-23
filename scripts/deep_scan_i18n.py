import os
import re

root = r"frontend-next/src"

# Regex to find ternaries involving lang
ternary_pat = re.compile(r'lang\s*===\s*["\']([a-z_]+)["\']\s*\?')
binary_or = re.compile(r'lang\s*===\s*["\']([a-z_]+)["\']\s*\|\|\s*lang\s*===\s*["\']([a-z_]+)["\']')
is_pat = re.compile(r'\bis(Kn|Hi|En|Te|Ta|Mr|Gu|Bn|Pa|Ml)\b')

found = {}
for dirpath, _, filenames in os.walk(root):
    for fn in filenames:
        if fn.endswith((".tsx", ".ts")):
            p = os.path.join(dirpath, fn).replace("\\", "/")
            # ignore test or generated files if any
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
            file_hits = []
            for idx, line in enumerate(lines):
                # skip comments
                stripped = line.strip()
                if stripped.startswith("//") or stripped.startswith("/*"):
                    continue
                if ternary_pat.search(line):
                    file_hits.append((idx + 1, "ternary", stripped[:100]))
                elif binary_or.search(line):
                    file_hits.append((idx + 1, "binary_or", stripped[:100]))
                elif is_pat.search(line):
                    file_hits.append((idx + 1, "isLang", stripped[:100]))
            if file_hits:
                found[p] = file_hits

print(f"Total files with language conditionals: {len(found)}")
for p, hits in sorted(found.items()):
    print(f"\n{p} ({len(hits)} hits):")
    for line_no, kind, text in hits[:8]:
        print(f"  L{line_no} [{kind}]: {text}")
    if len(hits) > 8:
        print(f"  ... and {len(hits) - 8} more")
