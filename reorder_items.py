import json
import subprocess

items_json = subprocess.check_output(['gh', 'project', 'item-list', '3', '--owner', 'mervegazi', '--limit', '100', '--format', 'json'])
items_data = json.loads(items_json)['items']

items = []
for item in items_data:
    title = item.get('title', '')
    if not title: continue
    items.append({"id": item['id'], "title": title})

def get_week(title):
    try:
        return int(title.split(' ')[1].split(':')[0])
    except:
        return 99

items.sort(key=lambda x: get_week(x['title']))

project_id = "PVT_kwHOAzypyc4BlwzW"

if not items:
    print("No items found.")
    exit(0)

first_item = items[0]
query = f'''
mutation {{
  updateProjectV2ItemPosition(input: {{projectId: "{project_id}", itemId: "{first_item['id']}"}}) {{
    items {{
      nodes {{ id }}
    }}
  }}
}}
'''
subprocess.run(['gh', 'api', 'graphql', '-f', f'query={query}'], capture_output=True)
print(f"Moved {first_item['title']} to top")

previous_id = first_item['id']
for item in items[1:]:
    query = f'''
    mutation {{
      updateProjectV2ItemPosition(input: {{projectId: "{project_id}", itemId: "{item['id']}", afterId: "{previous_id}"}}) {{
        items {{
          nodes {{ id }}
        }}
      }}
    }}
    '''
    subprocess.run(['gh', 'api', 'graphql', '-f', f'query={query}'], capture_output=True)
    print(f"Moved {item['title']} after previous")
    previous_id = item['id']

print("Reordering complete.")
