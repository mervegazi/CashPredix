import subprocess
import json
import time

issues_to_delete = [1, 2, 3, 4, 5, 12, 13, 14, 15, 16]

new_issues = [
    # WEEK 3 - Data
    {
        "title": "Week 3: Synthetic Data Generation Scripts",
        "body": "## Tasks\n- [ ] Develop Python/Node.js scripts to programmatically generate realistic company profiles\n- [ ] Define realistic schemas for company data (Name, Industry, CreatedAt)\n- [ ] Generate thousands of synthetic vendor records associated with companies",
        "labels": ["week-3", "data", "backend"]
    },
    {
        "title": "Week 3: Simulate Payment Anomalies & Distributions",
        "body": "## Tasks\n- [ ] Create synthetic payment history timelines for each vendor\n- [ ] Apply statistical distributions (normal distribution for payment dates, Pareto for amounts)\n- [ ] Inject realistic payment anomalies (late, partial, missed payments)",
        "labels": ["week-3", "data", "backend"]
    },
    {
        "title": "Week 3: Database Insertion & Integrity Validation",
        "body": "## Tasks\n- [ ] Write integration scripts to inject all generated data directly into the Supabase database\n- [ ] Validate data insertion success and error handling during batch uploads\n- [ ] Verify foreign key relationships and data integrity within the Supabase dashboard",
        "labels": ["week-3", "data", "backend"]
    },
    
    # WEEK 3 - UI
    {
        "title": "Week 3: Company & Vendor Creation Forms",
        "body": "## Tasks\n- [ ] Build the \"Create Company & Vendor\" page layout\n- [ ] Create company creation and manual vendor addition forms\n- [ ] Implement an Excel/CSV file upload dropzone component",
        "labels": ["week-3", "frontend", "crud"]
    },
    {
        "title": "Week 3: List View & UI Polish (Loaders/Modals)",
        "body": "## Tasks\n- [ ] Display expandable list of companies with nested vendors\n- [ ] Add Skeleton Loaders (shimmer effect) while fetching the companies/vendors from database\n- [ ] Add warning Confirmation Modals before any deletion action\n- [ ] Add informative Tooltips for vendor scores",
        "labels": ["week-3", "frontend", "crud"]
    },
    {
        "title": "Week 3: User Profile Page",
        "body": "## Tasks\n- [ ] Build the \"Profile\" page displaying the user's First Name, Last Name, and Email",
        "labels": ["week-3", "frontend"]
    }
]

# 1. Delete old issues entirely
for issue_id in issues_to_delete:
    print(f"Deleting old issue #{issue_id}")
    subprocess.run(['gh', 'issue', 'delete', str(issue_id), '--yes'])
    time.sleep(1)

# 2. Create new issues and add them to project
created_issue_urls = []
for issue in new_issues:
    print(f"Creating issue: {issue['title']}")
    result = subprocess.run([
        'gh', 'issue', 'create',
        '--title', issue['title'],
        '--body', issue['body'],
        '--label', ','.join(issue['labels'])
    ], capture_output=True, text=True)
    
    url = result.stdout.strip()
    created_issue_urls.append(url)
    print(f"Created: {url}")
    
    # Add to project
    subprocess.run(['gh', 'project', 'item-add', '3', '--owner', 'mervegazi', '--url', url])
    time.sleep(1)

print("Created Week 3 issues, added them to project, and deleted old issues.")
