import subprocess

new_body = """## Tasks
- [ ] Build the Dashboard layout with a persistent side menu
- [ ] Add navigation links: Home, Create Company & Vendor, Cashflow Predicts, Profile
- [ ] Set up React Router for all dashboard routes
- [ ] **Frontend Detail:** Implement a Dark Mode / Light Mode toggle in the navigation bar using Tailwind's dark mode feature.
- [ ] **Frontend Detail:** Add a user avatar dropdown menu (Profile/Logout) in the top header.
- [ ] **Frontend Detail:** Build a static "Welcome Dashboard" placeholder screen. Instead of a blank page, show a welcome message (e.g., "Welcome back!") and a nice static illustration or placeholder metric cards so the user feels they successfully logged in.
- [ ] Create placeholder pages with breadcrumbs for the other menu items.
- [ ] Implement active link highlighting and responsive sidebar (collapsible on mobile)

## Notes
- UI only for this week — functional dynamic data pages will be built in later weeks
- Ensure the theme preference (Dark/Light) is saved in `localStorage`
- The Welcome screen should make the application look "alive" immediately after login

**Week:** 2 (Oct 5 - Oct 11)"""

subprocess.run(['gh', 'issue', 'edit', '11', '--body', new_body])
print("Week 2 issue updated successfully.")
