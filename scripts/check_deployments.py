import urllib.request
import json

for sha in ['12836f6', '0f96579']:
    # Check commit status
    url = f'https://api.github.com/repos/kisaanbuddy/Kisaanbuddy/commits/{sha}/status'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"Commit {sha}: State={data.get('state')}, Total={data.get('total_count')}")
            for s in data.get('statuses', []):
                print(f"  {s.get('context')}: {s.get('state')} -> {s.get('target_url')}")
    except Exception as e:
        print(f"Commit {sha} status error: {e}")

    # Check check-runs
    check_url = f'https://api.github.com/repos/kisaanbuddy/Kisaanbuddy/commits/{sha}/check-runs'
    try:
        req = urllib.request.Request(check_url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/vnd.github.v3+json'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            check_data = json.loads(resp.read().decode('utf-8'))
            runs = check_data.get('check_runs', [])
            print(f"  Check runs ({len(runs)}):")
            for r in runs:
                print(f"    Name: {r.get('name')}, Status: {r.get('status')}, Conclusion: {r.get('conclusion')}, Details: {r.get('html_url')}")
    except Exception as e:
        print(f"Commit {sha} check-runs error: {e}")
