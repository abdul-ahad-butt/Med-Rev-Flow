import sqlite3

def dump_inserts():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_cf_KV' AND name != 'd1_migrations';")
    tables = [r[0] for r in cursor.fetchall()]
    
    with open('seed_data.sql', 'w', encoding='utf-8') as f:
        for table in tables:
            cursor.execute(f'SELECT * FROM "{table}"')
            rows = cursor.fetchall()
            if not rows: continue
            
            # get column names
            col_names = [description[0] for description in cursor.description]
            cols = ', '.join([f'"{c}"' for c in col_names])
            
            for row in rows:
                vals = []
                for val in row:
                    if val is None:
                        vals.append('NULL')
                    elif isinstance(val, (int, float)):
                        vals.append(str(val))
                    else:
                        escaped = str(val).replace("'", "''")
                        vals.append(f"'{escaped}'")
                
                v_str = ', '.join(vals)
                f.write(f'INSERT INTO "{table}" ({cols}) VALUES ({v_str});\n')
    
    print('Dumped seed_data.sql')

dump_inserts()
