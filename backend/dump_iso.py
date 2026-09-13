import sqlite3
import datetime

def dump_inserts():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_cf_KV' AND name != 'd1_migrations';")
    tables = [r[0] for r in cursor.fetchall()]
    
    with open('seed_data_iso.sql', 'w', encoding='utf-8') as f:
        # First, delete existing data to avoid unique constraint violations
        for table in reversed(tables): # Reverse order to avoid foreign key conflicts, though D1 might not enforce them immediately
            f.write(f'DELETE FROM "{table}";\n')
            
        for table in tables:
            cursor.execute(f'SELECT * FROM "{table}"')
            rows = cursor.fetchall()
            if not rows: continue
            
            col_names = [description[0] for description in cursor.description]
            cols = ', '.join([f'"{c}"' for c in col_names])
            
            for row in rows:
                vals = []
                for val in row:
                    if val is None:
                        vals.append('NULL')
                    elif isinstance(val, (int, float)):
                        # If it's a large integer, it's likely a timestamp in milliseconds
                        if isinstance(val, int) and val > 1000000000000:
                            dt = datetime.datetime.fromtimestamp(val / 1000.0, datetime.timezone.utc)
                            iso_str = dt.isoformat().replace("+00:00", "Z")
                            vals.append(f"'{iso_str}'")
                        else:
                            vals.append(str(val))
                    else:
                        escaped = str(val).replace("'", "''")
                        vals.append(f"'{escaped}'")
                
                v_str = ', '.join(vals)
                f.write(f'INSERT INTO "{table}" ({cols}) VALUES ({v_str});\n')
    
    print('Dumped seed_data_iso.sql')

dump_inserts()
