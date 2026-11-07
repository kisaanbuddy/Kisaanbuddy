import sqlite3

conn = sqlite3.connect('krishiai.db')
c = conn.cursor()

c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]

for t in tables:
    c.execute(f"PRAGMA table_info({t})")
    cols = [col[1] for col in c.fetchall()]
    url_cols = [col for col in cols if any(k in col.lower() for k in ['url', 'website', 'link'])]
    if url_cols:
        print(f"Table {t} has URL columns: {url_cols}")
        for col in url_cols:
            c.execute(f"SELECT count(*) FROM {t} WHERE {col} IS NOT NULL AND trim({col}) != ''")
            cnt = c.fetchone()[0]
            print(f"   {col}: {cnt} populated")
