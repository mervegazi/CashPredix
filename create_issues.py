import subprocess
import json

issues = [
    {
        "title": "Week 1: Initialize GitHub Repository and Kanban Board",
        "body": """## Tasks
- [x] Create the GitHub repository for CashPredix
- [x] Set up the Kanban project board on GitHub Projects
- [x] Initialize the React (Vite) project structure
- [x] Configure `.gitignore`, `README.md`, and `.env.example`
- [ ] Push initial commit to main branch

## Notes
- Use Vite as the build tool for React
- Follow framework-specific deployment guides
- Ensure proper project structure (components, pages, lib, hooks, assets)

**Week:** 1 (Sep 28 - Oct 4)
**Label:** setup""",
        "labels": ["week-1", "setup"]
    },
    {
        "title": "Week 1: Connect Supabase Database",
        "body": """## Tasks
- [ ] Create a Supabase project
- [ ] Configure Supabase API keys in `.env`
- [ ] Set up the Supabase client (`src/lib/supabaseClient.js`)
- [ ] Verify database connection from the React app
- [ ] Design initial database schema (users, companies, vendors tables)

## Notes
- Store credentials in `.env` (never commit to Git)
- Use `@supabase/supabase-js` client library
- Strictly verify Supabase API keys before proceeding

**Week:** 1 (Sep 28 - Oct 4)""",
        "labels": ["week-1", "database"]
    },
    {
        "title": "Week 1: Deploy Initial Website Skeleton",
        "body": """## Tasks
- [ ] Configure GitHub Pages deployment
- [ ] Set up Vite build configuration for production
- [ ] Deploy the initial skeleton to GitHub Pages
- [ ] Verify the live site is accessible at mervegazi.github.io/CashPredix

## Notes
- Follow Vite deployment guide for GitHub Pages
- Ensure `base` path is set correctly in `vite.config.js`

**Week:** 1 (Sep 28 - Oct 4)""",
        "labels": ["week-1", "deployment"]
    },
    {
        "title": "Week 1: Develop Introductory Landing Page",
        "body": """## Tasks
- [ ] Design and build the landing page component
- [ ] Explain the platform's purpose (Autonomous Liquidity Prediction)
- [ ] Add hero section with project title and description
- [ ] Add feature highlights section (Vendor Scoring, Cash Flow Prediction, Dashboard)
- [ ] Add a call-to-action button linking to Sign Up / Login
- [ ] Ensure responsive design for mobile and desktop

## Notes
- Landing page should clearly communicate what CashPredix does
- Use clean, modern UI design
- Include navigation to Auth pages

**Week:** 1 (Sep 28 - Oct 4)""",
        "labels": ["week-1", "frontend"]
    },
    {
        "title": "Week 2: Develop Authentication UI (Login, Sign Up, Logout, Change Password)",
        "body": """## Tasks
- [ ] Create Login page with email/password form
- [ ] Create Sign Up page with registration form
- [ ] Implement Logout functionality
- [ ] Create Change Password page
- [ ] Integrate all auth forms with Supabase Auth
- [ ] Add form validation and error handling
- [ ] Implement secure route guards (protected routes)

## Notes
- Use Supabase Auth for all authentication operations
- Implement reactive session listeners in the frontend
- Handle state management to prevent UI desync from user session

**Week:** 2 (Oct 5 - Oct 11)""",
        "labels": ["week-2", "auth", "frontend"]
    },
    {
        "title": "Week 2: Create Dashboard Side Menu Navigation",
        "body": """## Tasks
- [ ] Build the Dashboard layout with a persistent side menu
- [ ] Add navigation links: Home, Create Company & Vendor, Cashflow Predicts, Profile
- [ ] Set up React Router for all dashboard routes
- [ ] Create placeholder pages for each menu item
- [ ] Implement active link highlighting
- [ ] Ensure responsive sidebar (collapsible on mobile)

## Notes
- UI only for this week — functional pages will be built in later weeks
- Use `react-router-dom` for routing

**Week:** 2 (Oct 5 - Oct 11)""",
        "labels": ["week-2", "frontend", "navigation"]
    },
    {
        "title": "Week 3: Generate Synthetic Data (Companies & Vendors)",
        "body": """## Tasks
- [ ] Develop scripts to programmatically generate realistic company data
- [ ] Generate thousands of synthetic vendor records with payment histories
- [ ] Apply statistical distributions to create realistic payment patterns (including anomalies)
- [ ] Inject all generated data directly into the Supabase database
- [ ] Verify data integrity and relationships in the database

## Notes
- Data should mimic real-world payment anomalies (late payments, partial payments, etc.)
- Use statistical distributions for realistic patterns
- Ensure proper foreign key relationships between companies and vendors

**Week:** 3 (Oct 12 - Oct 18)""",
        "labels": ["week-3", "data", "backend"]
    },
    {
        "title": "Week 3: Build Company & Vendor Management UI",
        "body": """## Tasks
- [ ] Build the "Create Company & Vendor" page
- [ ] Create company creation form with UI
- [ ] Implement Excel upload option for bulk vendor import with success notification
- [ ] Display expandable list of companies with nested vendors
- [ ] Add "Delete" buttons for companies and vendors
- [ ] Add "Show Cashflow" button linking to predictions page
- [ ] Build the "Profile" page showing First/Last Name and Email

## Notes
- Use a robust state management approach for nested lists
- Handle complex state for expandable/collapsible company-vendor lists
- Excel upload should parse and validate data before inserting

**Week:** 3 (Oct 12 - Oct 18)""",
        "labels": ["week-3", "frontend", "crud"]
    },
    {
        "title": "Week 4: ML - Vendor Behavioral Scoring Algorithm",
        "body": """## Tasks
- [ ] Prepare programmatically generated and user-uploaded synthetic payment records for ML processing
- [ ] Apply data imputation for missing/sparse records
- [ ] Apply statistical filtering to handle extreme outliers
- [ ] Develop the core ML algorithm to analyze vendor payment histories
- [ ] Assign behavioral reliability scores to each vendor
- [ ] Validate scoring accuracy against known payment patterns

## Notes
- Handle sparse, inconsistent, or extreme outlier payment records
- Normalize vendor data before calculating scores
- Document the scoring methodology and algorithm design

**Week:** 4 (Oct 19 - Oct 25)""",
        "labels": ["week-4", "machine-learning"]
    },
    {
        "title": "Week 5: ML - Cash Flow Prediction Model",
        "body": """## Tasks
- [ ] Develop the predictive model for forecasting company cash flows
- [ ] Aggregate vendor payment histories, scores, and historical data
- [ ] Generate future cash flow timelines
- [ ] Implement time-series forecasting techniques
- [ ] Perform hyperparameter tuning for prediction accuracy
- [ ] Validate predictions against known data patterns

## Notes
- Ensure the model captures seasonal and irregular cash flow trends
- Use time-series forecasting techniques (e.g., ARIMA, Prophet, LSTM)
- Document model architecture, training process, and evaluation metrics

**Week:** 5 (Oct 26 - Nov 1)""",
        "labels": ["week-5", "machine-learning"]
    },
    {
        "title": "Week 6: Integrate ML Models with Web Application",
        "body": """## Tasks
- [ ] Connect ML vendor scoring model to the web application
- [ ] Connect ML cash flow prediction model to the web application
- [ ] Store all predictions in Supabase database
- [ ] Synchronize deletion actions: when a vendor/company is deleted, dynamically update or invalidate associated ML predictions
- [ ] Build background processing logic for asynchronous recalculation

## Notes
- Address high latency concerns when recalculating after deletions
- Use background/async processing to avoid blocking the UI
- Ensure data consistency between ML outputs and database records

**Week:** 6 (Nov 2 - Nov 8)""",
        "labels": ["week-6", "integration", "backend"]
    }
]

results = []

for idx, issue in enumerate(issues, start=1):
    print(f"Creating issue {idx}: {issue['title']}...")
    cmd = [
        "gh", "issue", "create",
        "--repo", "mervegazi/CashPredix",
        "--title", issue["title"],
        "--body", issue["body"]
    ]
    for lbl in issue["labels"]:
        cmd.extend(["--label", lbl])
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error creating issue {idx}: {res.stderr}")
        continue
    
    issue_url = res.stdout.strip()
    print(f"Created: {issue_url}")
    
    # Add to project board 3
    proj_cmd = [
        "gh", "project", "item-add", "3",
        "--owner", "mervegazi",
        "--url", issue_url
    ]
    p_res = subprocess.run(proj_cmd, capture_output=True, text=True)
    if p_res.returncode != 0:
        print(f"Error adding to project: {p_res.stderr}")
    else:
        print(f"Added to project board #3: {p_res.stdout.strip()}")
    
    results.append({
        "number": issue_url.split("/")[-1],
        "title": issue["title"],
        "url": issue_url
    })

print("\n--- Summary ---")
print(json.dumps(results, indent=2))
