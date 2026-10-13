import subprocess
import json
import time

old_issues = [1, 2, 3, 4, 5, 14, 15, 16]

new_issues = [
    # WEEK 4
    {
        "title": "Week 4: Set up ML Environment & Data Pipeline",
        "body": "## Tasks\n- [ ] Set up Python ML environment (scikit-learn, pandas, numpy)\n- [ ] Fetch generated/uploaded vendor payment records from Supabase\n- [ ] Implement data imputation pipeline for missing/sparse records",
        "labels": ["week-4", "machine-learning"]
    },
    {
        "title": "Week 4: Feature Engineering & Statistical Filtering",
        "body": "## Tasks\n- [ ] Apply statistical filtering (e.g., Z-score, IQR) to handle extreme outliers\n- [ ] Normalize vendor payment timelines\n- [ ] Engineer features from raw payment data (e.g., average delay, payment frequency, variance)",
        "labels": ["week-4", "machine-learning"]
    },
    {
        "title": "Week 4: Develop Core Behavioral Scoring Algorithm",
        "body": "## Tasks\n- [ ] Develop the core ML behavioral scoring algorithm\n- [ ] Assign behavioral reliability scores (0-100)\n- [ ] Test the algorithm using synthetic hold-out datasets",
        "labels": ["week-4", "machine-learning"]
    },
    {
        "title": "Week 4: Validation & Documentation",
        "body": "## Tasks\n- [ ] Validate behavioral reliability scores against known baselines\n- [ ] Validate scoring accuracy\n- [ ] Document the scoring methodology, features used, and algorithm design",
        "labels": ["week-4", "machine-learning", "documentation"]
    },
    
    # WEEK 5
    {
        "title": "Week 5: Time-Series Data Preprocessing",
        "body": "## Tasks\n- [ ] Fetch historical cash flow data from Supabase for all active companies\n- [ ] Aggregate vendor payment histories and calculated behavioral scores\n- [ ] Preprocess data for time-series forecasting (handling dates, filling gaps)",
        "labels": ["week-5", "machine-learning"]
    },
    {
        "title": "Week 5: Develop Baseline & Advanced Predictive Models",
        "body": "## Tasks\n- [ ] Develop baseline time-series predictive model (e.g., ARIMA or Prophet)\n- [ ] Develop advanced predictive model (e.g., LSTM or XGBoost) to forecast future timelines\n- [ ] Perform hyperparameter tuning to optimize prediction accuracy",
        "labels": ["week-5", "machine-learning"]
    },
    {
        "title": "Week 5: Model Evaluation & Validation",
        "body": "## Tasks\n- [ ] Evaluate models (RMSE, MAE) and select the best performing one\n- [ ] Ensure the model accurately captures seasonal and irregular trends\n- [ ] Document model architecture, feature engineering, and evaluation metrics",
        "labels": ["week-5", "machine-learning", "documentation"]
    },

    # WEEK 6
    {
        "title": "Week 6: Create ML API & Backend Integration",
        "body": "## Tasks\n- [ ] Containerize or create API endpoints (e.g., FastAPI/Flask) for the ML models\n- [ ] Format prediction outputs and store them back into Supabase tables\n- [ ] Implement Supabase database triggers/webhooks for vendor updates",
        "labels": ["week-6", "backend", "integration"]
    },
    {
        "title": "Week 6: Frontend Integration & Async Task Queue",
        "body": "## Tasks\n- [ ] Integrate React frontend to trigger predictions via API calls\n- [ ] Handle UI loading states while waiting for ML model responses\n- [ ] Implement background task queue (e.g., Celery) to handle asynchronous recalculations",
        "labels": ["week-6", "backend", "frontend", "integration"]
    },
    {
        "title": "Week 6: Edge Cases & Deletion Synchronization",
        "body": "## Tasks\n- [ ] Synchronize deletion actions: invalidate ML predictions when vendor/company is deleted\n- [ ] Test end-to-end integration from React to ML backend and back to Supabase",
        "labels": ["week-6", "backend", "integration", "testing"]
    },

    # WEEK 7
    {
        "title": "Week 7: Dashboard UI Layout & Data Fetching",
        "body": "## Tasks\n- [ ] Develop the UI layout for the functional \"Home\" page\n- [ ] Create a comprehensive dashboard view grid\n- [ ] Fetch user's active companies from Supabase",
        "labels": ["week-7", "frontend", "dashboard"]
    },
    {
        "title": "Week 7: Render Summary Cards & Visual Indicators",
        "body": "## Tasks\n- [ ] Display summary cards for each company's current weekly cash flow\n- [ ] Add visual indicators (green/red arrows) for positive/negative cash flow trends\n- [ ] Implement error handling for failed data fetches",
        "labels": ["week-7", "frontend", "dashboard"]
    },
    {
        "title": "Week 7: Pagination & Query Optimization",
        "body": "## Tasks\n- [ ] Implement robust pagination (or infinite scroll) for the company list\n- [ ] Optimize database queries (using Supabase RPC or Views) to fetch only summarized data\n- [ ] Ensure the dashboard is fully responsive on mobile and desktop",
        "labels": ["week-7", "frontend", "dashboard"]
    },

    # WEEK 8
    {
        "title": "Week 8: Cashflow UI & Date Selectors",
        "body": "## Tasks\n- [ ] Develop the UI for the \"Cashflow Predicts\" page\n- [ ] Implement custom weekly date range pickers/selectors\n- [ ] Fetch prediction data from Supabase based on the selected date range",
        "labels": ["week-8", "frontend", "dashboard"]
    },
    {
        "title": "Week 8: Data Visualizations (Charts)",
        "body": "## Tasks\n- [ ] Build interactive charts (e.g., Recharts/Chart.js) to visualize cash flow trends\n- [ ] Display total predicted liquidity metrics for the selected time window\n- [ ] Test chart responsiveness and rendering performance",
        "labels": ["week-8", "frontend", "dashboard"]
    },
    {
        "title": "Week 8: Score Tables & State Optimization",
        "body": "## Tasks\n- [ ] Create a detailed, sortable table showing vendor reliability scores vs predicted payments\n- [ ] Optimize React state using `useMemo` and `useCallback` for instant filter changes\n- [ ] Handle empty states when no predictions exist for the selected dates",
        "labels": ["week-8", "frontend", "dashboard"]
    },

    # WEEK 9
    {
        "title": "Week 9: Core Application Flow Testing",
        "body": "## Tasks\n- [ ] Write integration test scenarios for the entire user flow\n- [ ] Test Auth flow: Signup → Login → Session persistence\n- [ ] Test CRUD flow: Create Company → Manual Vendor Add → Excel Upload",
        "labels": ["week-9", "testing"]
    },
    {
        "title": "Week 9: ML Integration & Edge Cases Testing",
        "body": "## Tasks\n- [ ] Test ML flow: Upload data → Trigger predictions → Verify Dashboard updates\n- [ ] Test Deletion flow: Delete vendor → Verify cascading prediction updates\n- [ ] Identify and fix UI breaking points due to missing or malformed data",
        "labels": ["week-9", "testing"]
    },
    {
        "title": "Week 9: Error Boundaries & Fallback UI",
        "body": "## Tasks\n- [ ] Implement global React Error Boundaries to catch unhandled exceptions\n- [ ] Design and implement graceful fallback UI states for failed ML calls\n- [ ] Conduct rigorous user testing scenarios with edge-case data\n- [ ] Document all identified bugs and commit fixes",
        "labels": ["week-9", "testing", "frontend"]
    },

    # WEEK 10
    {
        "title": "Week 10: Outline & Technical Content Synthesis",
        "body": "## Tasks\n- [ ] Gather all 9 weekly progress reports and task logs\n- [ ] Consolidate technical notes regarding ML algorithms and Supabase integration\n- [ ] Outline the final academic paper structure",
        "labels": ["week-10", "documentation"]
    },
    {
        "title": "Week 10: Draft Methodology & Implementation Sections",
        "body": "## Tasks\n- [ ] Write the Methodology section detailing synthetic data generation and ML algorithms\n- [ ] Write the Implementation section detailing React and Supabase architecture\n- [ ] Review and synthesize reports into a unified, scientific narrative",
        "labels": ["week-10", "documentation"]
    },
    {
        "title": "Week 10: Formatting, Diagrams & Citations",
        "body": "## Tasks\n- [ ] Create system architecture diagrams and flowcharts for the paper\n- [ ] Format the document according to academic standards\n- [ ] Compile and insert all academic references and citations",
        "labels": ["week-10", "documentation"]
    },

    # WEEK 11
    {
        "title": "Week 11: Code Freeze & Presentation Slides",
        "body": "## Tasks\n- [ ] Freeze the codebase: Do not merge any new feature branches\n- [ ] Prepare the final presentation slides (Problem, Solution, Architecture, ML Results)",
        "labels": ["week-11", "demo"]
    },
    {
        "title": "Week 11: Demo Environment & Data Setup",
        "body": "## Tasks\n- [ ] Clean up the database and prepare a pristine environment for the demo\n- [ ] Create a pre-configured \"golden\" Excel dataset for live upload demonstration\n- [ ] Verify all dynamic links, routing, and ML prediction endpoints are stable",
        "labels": ["week-11", "demo"]
    },
    {
        "title": "Week 11: Dry Run, Timing & Contingency",
        "body": "## Tasks\n- [ ] Conduct a full end-to-end dry run of the presentation\n- [ ] Rehearse timing to ensure the demo fits within the allotted schedule\n- [ ] Prepare contingency plans (e.g., pre-recorded video of the ML prediction phase)\n- [ ] Polish the UI: Fix any minor CSS/alignment issues",
        "labels": ["week-11", "demo"]
    }
]

# 1. Close old issues
for issue_id in old_issues:
    print(f"Closing old issue #{issue_id}")
    subprocess.run(['gh', 'issue', 'close', str(issue_id), '--reason', 'not planned'])

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

print("Created all issues and added them to project 3.")
