import os
import re

for root, _, files in os.walk('src/controllers'):
    for f in files:
        if f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Use regex to find lines that start with spaces followed by c.json(
            # and don't have return before them.
            # But wait, it's easier to just do simple replacement for the specific pattern.
            # Wait, `    c.json({` -> `    return c.json({`
            # Let's replace `^\s*c\.json\(` with `    return c.json(` safely.
            new_content = re.sub(r'^(\s*)c\.json\(', r'\1return c.json(', content, flags=re.MULTILINE)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Fixed {path}")
