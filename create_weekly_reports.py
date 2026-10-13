import json
import subprocess
import time

PROJECT_NUMBER = "3"
PROJECT_ID = "PVT_kwHOAzypyc4BlwzW"
WEEK_FIELD_ID = "PVTF_lAHOAzypyc4BlwzWzhkcsCE"
STATUS_FIELD_ID = "PVTSSF_lAHOAzypyc4BlwzWzhkcVro"
STATUS_TODO_ID = "f75ad846"
STATUS_DONE_ID = "98236657"

reports = [
    {
        "week": 1,
        "title": "Week 1: Weekly Progress Report",
        "dates": "Sep 28 - Oct 4",
        "focus": "Project repository initialization, Vite/React structure setup, Supabase database configuration, introduction landing page, and GitHub Actions CI/CD deployment to GitHub Pages.",
        "status": STATUS_DONE_ID,
    },
    {
        "week": 2,
        "title": "Week 2: Weekly Progress Report",
        "dates": "Oct 5 - Oct 11",
        "focus": "Supabase Authentication (Login, Sign Up, Password Reset), ThemeContext with Dark/Light mode support, persistent Dashboard navigation, Welcome Dashboard with financial KPI cards, and cross-tab session synchronization.",
        "status": STATUS_DONE_ID,
    },
    {
        "week": 3,
        "title": "Week 3: Weekly Progress Report",
        "dates": "Oct 12 - Oct 18",
        "focus": "Company & Vendor entity CRUD management, relational database insertions, synthetic dataset generation, and Excel/CSV batch payment ledger ingestion.",
        "status": STATUS_TODO_ID,
    },
    {
        "week": 4,
        "title": "Week 4: Weekly Progress Report",
        "dates": "Oct 19 - Oct 25",
        "focus": "Machine Learning development environment setup, feature engineering pipeline, behavioral delay scoring model baseline, and validation methodology.",
        "status": STATUS_TODO_ID,
    },
    {
        "week": 5,
        "title": "Week 5: Weekly Progress Report",
        "dates": "Oct 26 - Nov 1",
        "focus": "Time-series payment data modeling, training baseline predictive models, hyperparameter evaluation, and ROC/PR metric documentation.",
        "status": STATUS_TODO_ID,
    },
    {
        "week": 6,
        "title": "Week 6: Weekly Progress Report",
        "dates": "Nov 2 - Nov 8",
        "focus": "ML inference REST API integration, frontend API communication hooks, background async task queue execution, and vendor deletion synchronization.",
        "status": STATUS_TODO_ID,
    },
    {
        "week": 7,
        "title": "Week 7: Weekly Progress Report",
        "dates": "Nov 9 - Nov 15",
        "focus": "Interactive Home Dashboard layout, company weekly cashflow metric cards, visual trend indicators, and query pagination optimizations.",
        "status": STATUS_TODO_ID,
    },
    {
        "week": 8,
        "title": "Week 8: Weekly Progress Report",
        "dates": "Nov 16 - Nov 22",
        "focus": "Cashflow prediction visualizer canvas, dynamic date range pickers, Recharts interactive data visualization, and supplier risk scoring tables.",
        "status": STATUS_TODO_ID,
    },
    {
        "week": 9,
        "title": "Week 9: Weekly Progress Report",
        "dates": "Nov 23 - Nov 29",
        "focus": "End-to-end integration and user journey testing, ML inference edge cases, error boundary resilience, and automated test scenarios.",
        "status": STATUS_TODO_ID,
    },
    {
        "week": 10,
        "title": "Week 10: Weekly Progress Report",
        "dates": "Nov 30 - Dec 6",
        "focus": "Comprehensive project documentation, system architecture flowcharts, methodology writeup, and empirical experimental results compilation.",
        "status": STATUS_TODO_ID,
    },
    {
        "week": 11,
        "title": "Week 11: Weekly Progress Report",
        "dates": "Dec 7 - Dec 13",
        "focus": "Final presentation rehearsal, live demo environment preparation, code freeze, final GitHub release tagging, and project deliverables submission.",
        "status": STATUS_TODO_ID,
    },
]

for rep in reports:
    w = rep["week"]
    title = rep["title"]
    dates = rep["dates"]
    focus = rep["focus"]
    status_id = rep["status"]
    
    body = f"""## Overview
A comprehensive weekly progress report will be generated summarizing all deliverables accomplished during **Week {w}**, the technical challenges and blockers encountered, and the exact engineering methodologies applied to resolve them. 

> **Submission Format:** The report will be compiled as a Microsoft Word document (`.docx`) and shared with the professor / academic advisor for progress review.

---

### Sprint Focus
{focus}

---

## Tasks & Deliverables
- [ ] Summarize the primary technical objectives and features implemented during Week {w}
- [ ] Document unexpected issues, bugs, and technical blockers encountered throughout the sprint
- [ ] Detail the debugging steps, workarounds, and architectural solutions implemented to solve each issue
- [ ] Assemble all sections, screenshots, and diagrams into a structured Microsoft Word document (`.docx`)
- [ ] Submit and share the Word report document (`.docx`) with the supervising professor / advisor

---
**Week:** {w} ({dates})
**Format:** Microsoft Word Document (.docx)
**Reviewer:** Academic Advisor / Professor"""

    labels = f"week-{w},documentation,report"
    
    print(f"\n==========================================")
    print(f"Creating Issue for Week {w}: {title}")
    
    # 1. Create Issue
    cmd_issue = [
        "gh", "issue", "create",
        "--repo", "mervegazi/CashPredix",
        "--title", title,
        "--body", body,
        "--label", f"week-{w}",
        "--label", "documentation",
        "--label", "report",
    ]
    res_issue = subprocess.run(cmd_issue, capture_output=True, text=True, check=True)
    issue_url = res_issue.stdout.strip()
    print(f"Created Issue: {issue_url}")
    
    # 2. Add Issue to Project #3
    print(f"Adding to Project #{PROJECT_NUMBER}...")
    cmd_add = [
        "gh", "project", "item-add", PROJECT_NUMBER,
        "--owner", "mervegazi",
        "--url", issue_url,
        "--format", "json"
    ]
    res_add = subprocess.run(cmd_add, capture_output=True, text=True, check=True)
    item_data = json.loads(res_add.stdout)
    item_id = item_data["id"]
    print(f"Project Item ID: {item_id}")
    
    # 3. Edit Week field
    print(f"Setting Week field to {w}...")
    cmd_week = [
        "gh", "project", "item-edit",
        "--id", item_id,
        "--project-id", PROJECT_ID,
        "--field-id", WEEK_FIELD_ID,
        "--number", str(w)
    ]
    subprocess.run(cmd_week, capture_output=True, text=True, check=True)
    
    # 4. Edit Status field
    print(f"Setting Status field...")
    cmd_status = [
        "gh", "project", "item-edit",
        "--id", item_id,
        "--project-id", PROJECT_ID,
        "--field-id", STATUS_FIELD_ID,
        "--single-select-option-id", status_id
    ]
    subprocess.run(cmd_status, capture_output=True, text=True, check=True)
    
    time.sleep(1.5)  # Avoid GitHub API rate limits

print("\nAll 11 weekly report tasks created and linked to the project board successfully!")
