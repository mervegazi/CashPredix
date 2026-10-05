import subprocess

issues = {
    10: """## Tasks
- [ ] Create Login page with email/password form
- [ ] Create Sign Up page with registration form
- [ ] Implement Logout functionality and Change Password page
- [ ] Integrate all auth forms with Supabase Auth
- [ ] Implement secure route guards (protected routes)
- [ ] **Frontend Detail:** Add a global Toast Notification system (e.g., React Hot Toast) for success/error messages during auth.
- [ ] **Backend Detail:** Enable and configure Supabase RLS (Row Level Security) policies so users can only read/write their own data.
- [ ] Add form validation (e.g., React Hook Form + Zod) with inline error messages.

## Notes
- Use Supabase Auth for all authentication operations
- Implement reactive session listeners in the frontend
- Do not let unauthorized users see the dashboard

**Week:** 2 (Oct 5 - Oct 11)""",

    11: """## Tasks
- [ ] Build the Dashboard layout with a persistent side menu
- [ ] Add navigation links: Home, Create Company & Vendor, Cashflow Predicts, Profile
- [ ] Set up React Router for all dashboard routes
- [ ] **Frontend Detail:** Implement a Dark Mode / Light Mode toggle in the navigation bar using Tailwind's dark mode feature.
- [ ] **Frontend Detail:** Add a user avatar dropdown menu (Profile/Logout) in the top header.
- [ ] Create placeholder pages with breadcrumbs for each menu item
- [ ] Implement active link highlighting and responsive sidebar (collapsible on mobile)

## Notes
- UI only for this week — functional pages will be built in later weeks
- Ensure the theme preference (Dark/Light) is saved in `localStorage`

**Week:** 2 (Oct 5 - Oct 11)""",

    13: """## Tasks
- [ ] Build the "Create Company & Vendor" page layout
- [ ] Create company creation and manual vendor addition forms
- [ ] Implement an Excel/CSV file upload dropzone component
- [ ] **Frontend Detail:** Add Skeleton Loaders (shimmer effect) while fetching the companies/vendors from the database.
- [ ] **Frontend Detail:** Add warning Confirmation Modals (e.g., "Are you sure you want to delete?") before any deletion action.
- [ ] Display expandable list of companies with nested vendors
- [ ] **Frontend Detail:** Add informative Tooltips (e.g., hovering over a vendor score explains how it's calculated).
- [ ] Build the "Profile" page displaying the user's First Name, Last Name, and Email

## Notes
- Use a robust state management approach for nested lists
- Excel upload should parse and validate data formats before attempting database insertion

**Week:** 3 (Oct 12 - Oct 18)""",

    15: """## Tasks
- [ ] Fetch historical synthetic cash flow data from Supabase
- [ ] Preprocess data specifically for time-series forecasting 
- [ ] Develop baseline predictive model (ARIMA/Prophet) and advanced model (LSTM/XGBoost)
- [ ] **Backend Detail:** Implement Model Versioning (log which version of the ML model produced which prediction).
- [ ] **Backend Detail:** Ensure proper Database Indexing in Supabase on `date` and `company_id` columns to prevent ML fetch queries from timing out.
- [ ] Evaluate models (RMSE, MAE) and select the best performing one
- [ ] Generate a 30/60/90-day predictive timeline

## Notes
- Cash flows fluctuate wildly; ensure the model accounts for vendor reliability
- Document all assumptions made during feature engineering

**Week:** 5 (Oct 26 - Nov 1)""",

    16: """## Tasks
- [ ] Create API endpoints (FastAPI/Supabase Edge Functions) to serve the ML models
- [ ] Integrate React frontend to trigger predictions
- [ ] **Backend Detail:** Implement Rate Limiting on the ML API to prevent abuse or accidental infinite loops from the frontend.
- [ ] **Frontend & Backend Detail:** Use Supabase Realtime (WebSockets) to listen for database changes, so the UI updates automatically when background ML calculations finish.
- [ ] Synchronize deletion actions: automatically invalidate predictions when a vendor is deleted
- [ ] Implement background processing logic (Task Queues) for recalculations

## Notes
- Never block the main React UI thread during ML calculations
- Ensure strict data consistency between ML outputs and database records

**Week:** 6 (Nov 2 - Nov 8)""",

    1: """## Tasks
- [ ] Develop the UI layout for the functional "Home" page
- [ ] Fetch user's active companies securely from Supabase
- [ ] Display summary cards for each company showing current weekly cash flows
- [ ] **Frontend Detail:** Add "Empty State" illustrations and friendly text when the user has not created any companies yet.
- [ ] Implement robust pagination or infinite scroll
- [ ] Add visual UI indicators (green/red arrows) for trends
- [ ] **Backend Detail:** Use Supabase RPC (Stored Procedures) to calculate dashboard summaries directly in the database, reducing frontend payload.

## Notes
- Avoid N+1 query problems by joining data efficiently
- Ensure the home screen provides a clear financial overview at a glance

**Week:** 7 (Nov 9 - Nov 15)""",

    2: """## Tasks
- [ ] Develop the UI structure for the "Cashflow Predicts" page
- [ ] Implement custom weekly date range pickers in React
- [ ] Integrate a charting library (Recharts/Chart.js)
- [ ] **Frontend Detail:** Implement interactive chart tooltips that show the exact monetary value and top contributing vendors when hovering over a chart data point.
- [ ] **Frontend Detail:** Add an "Export to CSV / PDF" button so users can download their prediction reports.
- [ ] Create a detailed, sortable data table showing vendor scores vs predicted payments
- [ ] Handle empty UI states gracefully when no predictions exist for selected dates

## Notes
- Ensure chart libraries handle dynamic dataset updates smoothly without memory leaks
- Visualizations are key here; make them clean, accessible, and professional

**Week:** 8 (Nov 16 - Nov 22)"""
}

for issue_num, new_body in issues.items():
    print(f"Enhancing issue #{issue_num} with UX/UI/Backend details...")
    subprocess.run(['gh', 'issue', 'edit', str(issue_num), '--body', new_body])

print("Enhancements applied successfully.")
