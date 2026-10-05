import json
import subprocess

issues_to_update = {
    # Week 4
    "PVTI_lAHOAzypyc4BlwzWzg-mM1A": {
        "title": "Week 4: ML - Vendor Behavioral Scoring Algorithm",
        "body": """## Tasks
- [ ] Set up Python ML environment (scikit-learn, pandas, numpy)
- [ ] Fetch generated/uploaded vendor payment records from Supabase
- [ ] Implement data imputation pipeline for missing/sparse records
- [ ] Apply statistical filtering (e.g., Z-score, IQR) to handle extreme outliers
- [ ] Normalize vendor payment timelines
- [ ] Develop ML scoring algorithm based on payment timeliness and frequency
- [ ] Test the algorithm using synthetic hold-out datasets
- [ ] Validate behavioral reliability scores against known baselines
- [ ] Document the scoring methodology, features used, and algorithm design

## Notes
- Handle sparse, inconsistent, or extreme outlier payment records effectively
- Start with a baseline model and iteratively improve it
- Ensure scoring ranges from 0-100 or an interpretable metric

**Week:** 4 (Oct 19 - Oct 25)"""
    },
    # Week 5
    "PVTI_lAHOAzypyc4BlwzWzg-mM7I": {
        "title": "Week 5: ML - Cash Flow Prediction Model",
        "body": """## Tasks
- [ ] Fetch historical cash flow data from Supabase for all active companies
- [ ] Aggregate vendor payment histories and calculated behavioral scores
- [ ] Preprocess data for time-series forecasting (handling dates, filling gaps)
- [ ] Develop baseline time-series predictive model (e.g., ARIMA or Prophet)
- [ ] Develop advanced predictive model (e.g., LSTM or XGBoost) to forecast future timelines
- [ ] Perform hyperparameter tuning to optimize prediction accuracy
- [ ] Evaluate models (RMSE, MAE) and select the best performing one
- [ ] Ensure the model accurately captures seasonal and irregular trends
- [ ] Document model architecture, feature engineering, and evaluation metrics

## Notes
- Cash flows fluctuate wildly; ensure the model accounts for vendor reliability
- Time-series modeling requires stationary data checks
- Document all assumptions made during feature engineering

**Week:** 5 (Oct 26 - Nov 1)"""
    },
    # Week 6
    "PVTI_lAHOAzypyc4BlwzWzg-mNCg": {
        "title": "Week 6: Integrate ML Models with Web Application",
        "body": """## Tasks
- [ ] Containerize or create API endpoints (e.g., FastAPI/Flask) for the ML models
- [ ] Integrate React frontend to trigger predictions via API calls
- [ ] Format prediction outputs and store them back into Supabase tables
- [ ] Implement Supabase database triggers/webhooks for vendor updates
- [ ] Synchronize deletion actions: invalidate or update ML predictions when a vendor/company is deleted
- [ ] Implement background task queue (e.g., Celery or Edge Functions) to handle asynchronous recalculations
- [ ] Handle UI loading states while waiting for ML model responses
- [ ] Test end-to-end integration from React to ML backend and back to Supabase

## Notes
- Address high latency concerns when recalculating after deletions
- Never block the main UI thread during ML calculations
- Ensure strict data consistency between ML outputs and database records

**Week:** 6 (Nov 2 - Nov 8)"""
    },
    # Week 7
    "PVTI_lAHOAzypyc4BlwzWzg-mKwc": {
        "title": "Week 7: Build Dashboard Home Screen",
        "body": """## Tasks
- [ ] Develop the UI layout for the functional "Home" page
- [ ] Create a comprehensive dashboard view grid
- [ ] Fetch user's active companies from Supabase
- [ ] Display summary cards for each company's current weekly cash flow
- [ ] Implement robust pagination (or infinite scroll) for the company list
- [ ] Add visual indicators (green/red arrows) for positive/negative cash flow trends
- [ ] Optimize database queries (using Supabase RPC or Views) to fetch only summarized data
- [ ] Implement error handling for failed data fetches
- [ ] Ensure the dashboard is fully responsive on mobile and desktop

## Notes
- Address UI performance bottlenecks when rendering multiple summaries
- Avoid N+1 query problems by joining data in the backend
- Ensure the home screen provides a clear overview at a glance

**Week:** 7 (Nov 9 - Nov 15)"""
    },
    # Week 8
    "PVTI_lAHOAzypyc4BlwzWzg-mK20": {
        "title": "Week 8: Build Cashflow Predicts Page with Date Range Filtering",
        "body": """## Tasks
- [ ] Develop the UI for the "Cashflow Predicts" page
- [ ] Implement custom weekly date range pickers/selectors
- [ ] Fetch prediction data from Supabase based on the selected date range
- [ ] Build interactive charts (e.g., Recharts/Chart.js) to visualize cash flow trends
- [ ] Display total predicted liquidity metrics for the selected time window
- [ ] Create a detailed, sortable table showing vendor reliability scores vs predicted payments
- [ ] Optimize React state using `useMemo` and `useCallback` for instant filter changes
- [ ] Handle empty states when no predictions exist for the selected dates
- [ ] Test chart responsiveness and rendering performance

## Notes
- Ensure chart libraries handle dynamic dataset updates smoothly without memory leaks
- Tables should clearly show vendor scores alongside predicted payments
- Visualizations are key here; make them clean and professional

**Week:** 8 (Nov 16 - Nov 22)"""
    },
    # Week 9
    "PVTI_lAHOAzypyc4BlwzWzg-mK8k": {
        "title": "Week 9: End-to-End System Testing",
        "body": """## Tasks
- [ ] Write integration test scenarios for the entire user flow
- [ ] Test Auth flow: Signup → Login → Session persistence
- [ ] Test CRUD flow: Create Company → Manual Vendor Add → Excel Upload
- [ ] Test ML flow: Upload data → Trigger predictions → Verify Dashboard updates
- [ ] Test Deletion flow: Delete vendor → Verify cascading prediction updates
- [ ] Identify and fix UI breaking points due to missing or malformed data
- [ ] Implement global React Error Boundaries to catch unhandled exceptions
- [ ] Design and implement graceful fallback UI states for failed ML calls
- [ ] Conduct rigorous user testing scenarios with edge-case data
- [ ] Document all identified bugs and commit fixes

## Notes
- Pay special attention to deletion cascading effects and orphaned data
- Ensure graceful error handling throughout the application
- System must not crash under heavy synthetic data loads

**Week:** 9 (Nov 23 - Nov 29)"""
    },
    # Week 10
    "PVTI_lAHOAzypyc4BlwzWzg-mLD0": {
        "title": "Week 10: Final Documentation Consolidation",
        "body": """## Tasks
- [ ] Gather all 9 weekly progress reports and task logs
- [ ] Consolidate technical notes regarding ML algorithms and Supabase integration
- [ ] Outline the final academic paper structure (Abstract, Intro, Methodology, Results, Conclusion)
- [ ] Write the Methodology section detailing synthetic data generation and ML algorithms
- [ ] Write the Implementation section detailing React and Supabase architecture
- [ ] Review and synthesize reports into a unified, scientific narrative
- [ ] Create system architecture diagrams and flowcharts for the paper
- [ ] Format the document according to academic standards
- [ ] Compile and insert all academic references and citations

## Notes
- Ensure cohesiveness across individually logged weekly reports
- Create a unified, scientifically structured narrative
- Diagrams should clearly explain the integration between React, Supabase, and ML

**Week:** 10 (Nov 30 - Dec 6)"""
    },
    # Week 11
    "PVTI_lAHOAzypyc4BlwzWzg-mLNY": {
        "title": "Week 11: Final Demo Preparation",
        "body": """## Tasks
- [ ] Freeze the codebase: Do not merge any new feature branches
- [ ] Prepare the final presentation slides (Problem, Solution, Architecture, ML Results)
- [ ] Clean up the database and prepare a pristine environment for the demo
- [ ] Create a pre-configured "golden" Excel dataset for live upload demonstration
- [ ] Verify all dynamic links, routing, and ML prediction endpoints are stable
- [ ] Conduct a full end-to-end dry run of the presentation
- [ ] Rehearse timing to ensure the demo fits within the allotted schedule
- [ ] Prepare contingency plans (e.g., pre-recorded video of the ML prediction phase)
- [ ] Polish the UI: Fix any minor CSS/alignment issues

## Notes
- Prevent live demo failures by using pre-tested demo data exclusively
- Ensure all features are stable and presentable
- Have backup plans for potential demo issues (network failure, API timeout)

**Week:** 11 (Dec 7 - Dec 13)"""
    }
}

for item_id, data in issues_to_update.items():
    query = f'''
    mutation {{
      updateProjectV2ItemFieldValue(
        input: {{
          projectId: "PVT_kwHOAzypyc4BlwzW"
          itemId: "{item_id}"
          fieldId: "PVTF_lAHOAzypyc4BlwzWzhkcVrg" # Title field
          value: {{ text: "{data['title']}" }}
        }}
      ) {{
        projectV2Item {{ id }}
      }}
    }}
    '''
    # We can't update issue body directly through project item mutation, we need to update the Issue itself
    # To do that, we get the issue number from gh issue list or from our previous run
    pass

