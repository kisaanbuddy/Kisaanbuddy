import urllib.request
import json
import time

sha = 'c5b4e8e'
headers = {'User-Agent': 'Python-Check'}

print(f"Monitoring commit {sha} on GitHub & Vercel...")
for i in range(10):
    # Check commit status
    status_url = f'https://api.github.com/repos/kisaanbuddy/Kisaanbuddy/commits/{sha}/status'
    try:
        req = urllib.request.Request(status_url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            state = data.get('state')
            statuses = data.get('statuses', [])
            print(f"[{i+1}/10] Overall State: {state}")
            for s in statuses:
                print(f"   Context: {s.get('context')}, State: {s.get('state')}, Desc: {s.get('description')}, Target: {s.get('target_url')}")
            if state in ('success', 'failure'):
                break
    except Exception as e:
        print(f"Error checking status: {e}")
    time.sleep(6)
