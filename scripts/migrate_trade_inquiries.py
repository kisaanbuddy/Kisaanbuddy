import sqlite3

for db_path in ['krishiai.db', 'backend/krishiai.db']:
    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("PRAGMA table_info(trade_inquiries)")
        cols = [col[1] for col in c.fetchall()]
        print(f"{db_path} trade_inquiries cols: {cols}")
        
        if 'inquiry_type' not in cols:
            c.execute("ALTER TABLE trade_inquiries ADD COLUMN inquiry_type VARCHAR(50) DEFAULT 'quotation'")
            print(f"Added inquiry_type to {db_path}")
            
        if 'preferred_callback_time' not in cols:
            c.execute("ALTER TABLE trade_inquiries ADD COLUMN preferred_callback_time VARCHAR(100)")
            print(f"Added preferred_callback_time to {db_path}")
            
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error on {db_path}: {e}")
