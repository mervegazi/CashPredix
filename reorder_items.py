import json
import subprocess
import time

print("Fetching items from CashPredix Project Board (Project #3)...")
items_json = subprocess.check_output(['gh', 'project', 'item-list', '3', '--owner', 'mervegazi', '--limit', '100', '--format', 'json'])
items_data = json.loads(items_json)['items']

items = []
for item in items_data:
    title = item.get('title', '')
    if not title:
        content = item.get('content', {})
        title = content.get('title', '')
    if not title:
        continue
    
    number = 0
    if 'content' in item and isinstance(item['content'], dict):
        number = item['content'].get('number', 0)
    
    week_val = item.get('week')
    if week_val is not None:
        try:
            week = int(week_val)
        except:
            week = 99
    else:
        try:
            week = int(title.split(' ')[1].split(':')[0])
        except:
            week = 99

    is_report = 1 if "Weekly Progress Report" in title else 0
    items.append({
        "id": item['id'],
        "title": title,
        "week": week,
        "is_report": is_report,
        "number": number
    })

# Sort items: by week, non-reports first then report at the end of each week, then by issue number
items.sort(key=lambda x: (x['week'], x['is_report'], x['number'], x['title']))

project_id = "PVT_kwHOAzypyc4BlwzW"

if not items:
    print("No items found.")
    exit(0)

print(f"Total items to order: {len(items)}")

# Move first item to top
first_item = items[0]
query = f'''
mutation {{
  updateProjectV2ItemPosition(input: {{projectId: "{project_id}", itemId: "{first_item['id']}"}}) {{
    clientMutationId
  }}
}}
'''
res = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={query}'], capture_output=True, text=True)
if res.returncode != 0:
    print(f"Error on first item: {res.stderr}")
else:
    print(f"1. [Week {first_item['week']}] {first_item['title']} -> Top of board")

previous_id = first_item['id']
for idx, item in enumerate(items[1:], start=2):
    query = f'''
    mutation {{
      updateProjectV2ItemPosition(input: {{projectId: "{project_id}", itemId: "{item['id']}", afterId: "{previous_id}"}}) {{
        clientMutationId
      }}
    }}
    '''
    res = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={query}'], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Warning: Failed to position item {item['title']}: {res.stderr}")
    else:
        print(f"{idx}. [Week {item['week']}] {item['title']}")
    previous_id = item['id']
    time.sleep(0.3)  # Prevent GraphQL secondary rate limiting

print("\nAll project items successfully ordered by Week on CashPredix Project Board!")

