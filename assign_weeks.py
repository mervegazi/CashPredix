import json
import subprocess
import time

items_json = subprocess.check_output(['gh', 'project', 'item-list', '3', '--owner', 'mervegazi', '--format', 'json'])
items = json.loads(items_json)['items']

for item in items:
    title = item['title']
    item_id = item['id']
    
    # Extract week number from title (e.g. "Week 1: ...")
    if title.startswith('Week '):
        try:
            week_num = int(title.split(' ')[1].split(':')[0])
            print(f"Setting {title} to Week {week_num} (ID: {item_id})")
            
            subprocess.run([
                'gh', 'project', 'item-edit', 
                '--id', item_id,
                '--project-id', 'PVT_kwHOAzypyc4BlwzW',
                '--field-id', 'PVTF_lAHOAzypyc4BlwzWzhkcsCE',
                '--number', str(week_num)
            ])
            time.sleep(1) # Prevent rate limiting
        except Exception as e:
            print(f"Error parsing week from {title}: {e}")

print("Done assigning weeks.")
