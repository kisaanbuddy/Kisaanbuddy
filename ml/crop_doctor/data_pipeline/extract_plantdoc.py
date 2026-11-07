import os
import subprocess
import sys

def extract_plantdoc():
    repo_dir = 'ml/crop_doctor/data/raw/plantdoc'
    output_dir = 'ml/crop_doctor/data/extracted/plantdoc'
    os.makedirs(output_dir, exist_ok=True)

    print("Reading git tree from", repo_dir)
    p = subprocess.run(['git', '-C', repo_dir, 'ls-tree', '-r', 'HEAD'], capture_output=True, text=True, check=True)
    lines = p.stdout.strip().split('\n')
    print(f"Total git tree objects: {len(lines)}")

    count = 0
    forbidden_chars = ['?', ':', '"', '*', '<', '>', '|']
    for line in lines:
        if not line:
            continue
        parts = line.split(maxsplit=3)
        if len(parts) < 4:
            continue
        mode, obj_type, sha, raw_path = parts
        if obj_type != 'blob':
            continue

        # Sanitize path components for Windows
        clean_parts = []
        for comp in raw_path.split('/'):
            clean = comp
            for fc in forbidden_chars:
                clean = clean.replace(fc, '_')
            clean_parts.append(clean)
            
        safe_rel_path = os.path.join(*clean_parts)
        full_path = os.path.join(output_dir, safe_rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        res = subprocess.run(['git', '-C', repo_dir, 'cat-file', '-p', sha], capture_output=True, check=True)
        with open(full_path, 'wb') as f:
            f.write(res.stdout)
        count += 1
        if count % 500 == 0:
            print(f"Extracted {count} files...")

    print(f"Successfully extracted {count} files to {output_dir}")

if __name__ == '__main__':
    extract_plantdoc()
