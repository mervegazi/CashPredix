import json
import subprocess

# We fetched the items. Let's reorder them using the updateProjectV2ItemPosition mutation.
# The desired order is: Week 1, Week 2, ..., Week 11.
# Actually, since they are all in Todo, we can just sort the IDs based on the week number in the title and then call updateProjectV2ItemPosition to place each item after the previous one.

items = [
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mKwc", "title": "Week 7: Build Dashboard Home Screen"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mK20", "title": "Week 8: Build Cashflow Predicts Page with Date Range Filtering"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mK8k", "title": "Week 9: End-to-End System Testing"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mLD0", "title": "Week 10: Final Documentation Consolidation"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mLNY", "title": "Week 11: Final Demo Preparation"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mL8w", "title": "Week 1: Initialize GitHub Repository and Kanban Board"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mMGI", "title": "Week 1: Connect Supabase Database"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mML0", "title": "Week 1: Deploy Initial Website Skeleton"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mMT8", "title": "Week 1: Develop Introductory Landing Page"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mMaI", "title": "Week 2: Develop Authentication UI (Login, Sign Up, Logout, Change Password)"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mMhg", "title": "Week 2: Create Dashboard Side Menu Navigation"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mMno", "title": "Week 3: Generate Synthetic Data (Companies & Vendors)"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mMu8", "title": "Week 3: Build Company & Vendor Management UI"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mM1A", "title": "Week 4: ML - Vendor Behavioral Scoring Algorithm"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mM7I", "title": "Week 5: ML - Cash Flow Prediction Model"},
    {"id": "PVTI_lAHOAzypyc4BlwzWzg-mNCg", "title": "Week 6: Integrate ML Models with Web Application"}
]

def get_week(title):
    return int(title.split(' ')[1].split(':')[0])

items.sort(key=lambda x: get_week(x['title']))

project_id = "PVT_kwHOAzypyc4BlwzW"

# Move the first item to the very top (we don't pass afterId)
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

# Move subsequent items sequentially after the previous one
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
