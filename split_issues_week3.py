import subprocess

issues = {
    12: """## Tasks
- [ ] Develop Python/Node.js scripts to programmatically generate realistic company profiles
- [ ] Define realistic schemas for company data (Name, Industry, CreatedAt)
- [ ] Generate thousands of synthetic vendor records associated with companies
- [ ] Create synthetic payment history timelines for each vendor
- [ ] Apply statistical distributions (e.g., normal distribution for payment dates, Pareto for amounts) to mimic real-world financial data
- [ ] Inject realistic payment anomalies (e.g., late payments, partial payments, missed payments)
- [ ] Write integration scripts to inject all generated data directly into the Supabase database
- [ ] Validate data insertion success and error handling during batch uploads
- [ ] Verify foreign key relationships and data integrity within the Supabase dashboard

## Notes
- Data should mimic real-world payment anomalies perfectly as the ML model depends on this
- Use statistical distributions for realistic patterns
- Ensure proper foreign key relationships between companies and vendors in Supabase

**Week:** 3 (Oct 12 - Oct 18)""",

    13: """## Tasks
- [ ] Build the structural "Create Company & Vendor" page layout
- [ ] Create a "Create Company" form component with UI validation
- [ ] Create an "Add Vendor" form component (manual entry)
- [ ] Implement an Excel/CSV file upload dropzone component for bulk vendor import
- [ ] Add client-side parsing and validation for the Excel upload feature
- [ ] Display success notifications (toast messages) upon successful company/vendor creation or upload
- [ ] Build an expandable/collapsible list component to display companies and their nested vendors
- [ ] Add functional "Delete" buttons for companies and vendors, linked to Supabase delete operations
- [ ] Add a "Show Cashflow" action button next to companies linking to the future predictions page
- [ ] Build the "Profile" page displaying the user's First Name, Last Name, and Email (fetched from Auth session)

## Notes
- Use a robust state management approach (e.g., React Context or Zustand) for nested lists
- Handle complex state for expandable/collapsible company-vendor lists efficiently
- Excel upload should parse and validate data formats before attempting database insertion

**Week:** 3 (Oct 12 - Oct 18)"""
}

for issue_num, new_body in issues.items():
    print(f"Updating issue #{issue_num}...")
    subprocess.run(['gh', 'issue', 'edit', str(issue_num), '--body', new_body])

print("Week 3 issues updated successfully.")
