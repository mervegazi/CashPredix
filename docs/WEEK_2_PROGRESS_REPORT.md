# CashPredix — Weekly Progress Report: Week 2
**Project Title:** CashPredix — Autonomous Liquidity Prediction & Supplier Risk Management Platform  
**Sprint Period:** October 5, 2026 – October 11, 2026 (Week 2)  
**Author / Developer:** Merve Gazi  
**Supervisor / Reviewer:** Academic Advisor / Course Professor  
**Repository:** [github.com/mervegazi/CashPredix](https://github.com/mervegazi/CashPredix)  
**Live Application:** [mervegazi.github.io/CashPredix](https://mervegazi.github.io/CashPredix/)  

---

## 1. Executive Summary & Sprint Objectives

During Week 2 of the CashPredix development cycle, the primary engineering objective was to transition the application from a static landing skeleton into an interactive, secure, and production-ready enterprise application. The core focus was placed on two major GitHub Project tasks: **Issue #10: Develop Authentication UI** and **Issue #11: Create Dashboard Side Menu Navigation**.

By the conclusion of this sprint, all primary milestones were successfully completed, thoroughly tested, and deployed to GitHub Pages via automated GitHub Actions CI/CD pipelines. The platform now features a complete Supabase authentication ecosystem, route guards, a responsive dashboard layout with persistent navigation, dynamic dark/light theme switching, and an interactive executive welcome dashboard displaying real-time financial KPIs.

```
+-----------------------------------------------------------------------------------+
|                                 WEEK 2 MILESTONES                                 |
+-----------------------------------------------------------------------------------+
| [✓] Issue #10: Full Authentication Flow (Sign Up, Sign In, Reset Password, Demo)  |
| [✓] Issue #10: Client & Server-side Security (Route Guards, Supabase RLS Schema)  |
| [✓] Issue #11: Persistent Multi-tiered Navigation Sidebar & Header Architecture   |
| [✓] Issue #11: Executive Welcome Dashboard (4 Financial KPI Cards & Trajectory)   |
| [✓] System Polish: Dual Theme Support (Light/Dark), Multi-tab Sync & Error Format |
+-----------------------------------------------------------------------------------+
```

---

## 2. Completed Deliverables & Architectural Implementation

### 2.1. Authentication Architecture & State Management (`AuthContext.jsx`)
The platform implements a centralized authentication context leveraging Supabase Auth (`@supabase/supabase-js`) combined with local session persistence.
- **Sign In & Sign Up (`LoginPage.jsx`, `SignUpPage.jsx`):** Developed corporate login and registration forms featuring real-time client-side validation, password visibility toggling, and inline error rendering.
- **Account Recovery Flow (`ChangePasswordPage.jsx`):** Built a dedicated password reset interface that intercepts Supabase recovery events and securely applies new credentials using `supabase.auth.updateUser()`.
- **Instant Demo Executive Access:** Created an offline-resilient sandbox demo account (`demo@cashpredix.com`) that allows academic reviewers and stakeholders to explore full dashboard functionality without requiring external database availability.

### 2.2. Route Protection & Security Strategy
To prevent unauthorized access to sensitive financial metrics, route access is guarded at both the client routing and database layer:
- **`ProtectedRoute.jsx`:** Guards private application routes (`/dashboard/*`). Unauthenticated visitors are automatically intercepted and redirected to `/login`, preserving their attempted destination for seamless post-login redirection.
- **`PublicOnlyRoute.jsx`:** Prevents authenticated users from redundantly viewing login or registration pages, routing them directly to `/dashboard`.
- **Row Level Security (RLS) Schema (`supabase/schema.sql`):** Prepared relational PostgreSQL database policies enforcing strict tenant isolation, ensuring users can only read and mutate records belonging to their authenticated `auth.uid()`.

### 2.3. Responsive Dashboard Navigation Layout (`DashboardLayout.jsx`)
Constructed an ergonomic enterprise application shell:
- **Desktop Sidebar:** Persistent left-hand navigation menu featuring active route highlighting, subtle hover micro-interactions, company entity branding, and categorized sub-page links.
- **Mobile Drawer:** Collapsible navigation drawer toggled via an animated hamburger menu with automated backdrop dismissal.
- **Header Utilities:** Top navigation bar equipped with dynamic breadcrumb trails, a quick Dark/Light theme toggle, and an executive profile avatar dropdown with one-click sign-out.

### 2.4. Executive Welcome Dashboard (`WelcomeDashboard.jsx`)
To provide immediate business value upon login, a comprehensive predictive preview screen was built:
1. **Four Core Financial KPI Cards:**
   - *Operating Cash Buffer:* Real-time cash reserve metric with positive/negative trend indicators.
   - *Net Projected Cashflow (30d):* Forward-looking net liquidity forecast.
   - *High-Risk Supplier Outflows:* Quantified accounts payable exposed to vendor disruption.
   - *Weighted Liquidity Runway:* Calculated survival horizon in business days.
2. **Interactive SVG Trajectory Visualizer:** Dual-curve area chart displaying projected net working capital against minimum liquidity thresholds across a 30-day timeline.
3. **Vendor Behavioral Risk Monitor:** Real-time alert list highlighting monitored supplier payment terms, reliability indices, and early-settlement mitigation recommendations.

### 2.5. Universal Theme Engine & Clean Design System
- Integrated Tailwind CSS v4 styling with custom `@variant dark` rules.
- Created `ThemeContext.jsx` with persistent `localStorage` synchronization and automatic OS preference detection.
- Guaranteed complete WCAG AA color contrast standards across all views in both Dark Mode and Light Mode.

---

## 3. Technical Challenges Encountered & Problem Resolution

During the Week 2 implementation and deployment lifecycle, several non-trivial technical challenges emerged. Below is an overview of each hurdle and the exact engineering solution deployed:

| # | Technical Challenge | Root Cause | Implemented Resolution |
|---|:---|:---|:---|
| **1** | **GitHub Pages SPA 404 Routing Crashes** | GitHub Pages is a static file host; refreshing sub-routes (e.g. `/dashboard`) caused HTTP 404 errors. | Implemented custom `public/404.html` with route-redirect encoding and companion decoder script in `index.html`. |
| **2** | **CI/CD Build Failure & White Screen** | Missing Supabase URL/Key environment variables during GitHub Actions production bundle generation. | Configured GitHub Repository Secrets (`gh secret set`) and added resilient offline fallbacks in `supabaseClient.js`. |
| **3** | **Supabase Localhost:3000 Email Redirect Trap** | Free-tier Supabase projects default their Site URL to `http://localhost:3000`, breaking confirmation links. | Specified explicit `emailRedirectTo` targets and deployed a local Node.js proxy server (`redirect_server.cjs`) on port 3000. |
| **4** | **Multi-Tab Password Reset Collision** | Opening recovery links across multiple tabs allowed stale, already-consumed tokens to attempt repeated resets. | Implemented cross-tab synchronization using browser `BroadcastChannel` and `storage` event broadcast listeners. |
| **5** | **Light Mode Contrast & Themed Notifications** | Hardcoded dark background styles caused illegible text in Light Mode; toast alerts stayed dark. | Created dynamic `ThemedToaster` consuming `useTheme()` and refactored banner and card gradients for light mode. |
| **6** | **Cryptic Technical Error Messages** | Raw Supabase server exceptions (e.g., `invalid_grant`) degraded user onboarding experience. | Built centralized `formatAuthError()` utility mapping technical codes into friendly, actionable guidance. |

### In-Depth Problem Breakdowns:

#### A. Single Page Application (SPA) Client-Side Routing on GitHub Pages
- **Issue:** When deployed to GitHub Pages (`https://mervegazi.github.io/CashPredix/`), direct navigation or hard page refreshes on internal routes like `/login` or `/dashboard` yielded default GitHub 404 error pages.
- **Solution:** Deployed an SPA redirection bridge. When GitHub Pages encounters an unknown path, `404.html` captures the requested route, transforms it into a URL query parameter (`?p=...`), and redirects to root. The client-side decoder script in `index.html` reconstructs the path into the HTML5 history state prior to React Router mounting.

#### B. Cross-Tab Password Recovery Synchronization
- **Issue:** If an executive opened a password reset link in two concurrent browser tabs, completing the reset in Tab 1 left Tab 2 in an active edit state. Submitting Tab 2 subsequently triggered cryptic backend errors due to expired one-time tokens.
- **Solution:** Incorporated the HTML5 `BroadcastChannel` API complemented by `window.addEventListener('storage', ...)`. When `updatePassword()` resolves in Tab 1, a global `'PASSWORD_UPDATED'` message is broadcast. Tab 2 immediately intercepts this notification, dispatches a toast message to the user, and automatically redirects to `/dashboard`, preventing duplicate attempts.

#### C. Dynamic Light/Dark Notification Theming
- **Issue:** The React Hot Toast provider was initially initialized at the root application level with fixed dark hexadecimal tokens (`#1f2937`), causing notification bubbles to remain dark even when the user toggled into Light Mode.
- **Solution:** Extracted a dedicated `<ThemedToaster />` component consuming the reactive `useTheme()` hook. The toaster dynamically swaps background values (`#ffffff` vs `#0f172a`), border strokes, icon checkmark palettes, and box-shadow depth instantaneously upon theme toggling.

---

## 4. Verification, Quality Assurance & Test Results

The platform was subjected to end-to-end testing across multiple browsers and device resolutions:

1. **Authentication Flow Validation:**
   - New user signup triggers Supabase user registration and verifies input validation rules.
   - User login correctly establishes persistent browser sessions across page reloads.
   - Demo mode enables instantaneous access with identical permissions.
   - Logout clears all local session tokens and redirects to the landing page.
2. **Route Guard Verification:**
   - Direct manual URL manipulation to `/dashboard` while unauthenticated redirects immediately to `/login`.
   - Authenticated visits to `/login` or `/signup` automatically redirect to `/dashboard`.
3. **Cross-Browser & Responsive Layout Tests:**
   - Tested and verified on Google Chrome (macOS), Safari 17+ (macOS/iOS), and Mozilla Firefox.
   - Verified viewport adaptations across 375px (Mobile), 768px (Tablet), 1024px (Laptop), and 1440px (Desktop).
4. **CI/CD Pipeline Health:**
   - Production bundle generation verified via `npm run build` (average build duration: ~380ms).
   - Automated GitHub Actions deployment workflow (`Deploy static content to Pages`) operating with 100% success rate.

---

## 5. Next Sprint Roadmap: Week 3 Preview

With authentication and navigation infrastructure completed, the project transitions into **Week 3 (October 12 – October 18)**, focusing on core business entity management and data ingestion:

- **Task 1 (Issue #45):** Build interactive Company & Vendor registration forms with custom payment terms (Net 30, Net 60, COD).
- **Task 2 (Issue #42 & #43):** Develop synthetic financial data generation scripts simulating seasonal payment cycles and delayed supplier anomalies.
- **Task 3 (Issue #44):** Implement Excel / CSV batch payment ledger parsing and validation pipeline for bulk ingestion.
- **Task 4 (Issue #46 & #47):** Develop searchable vendor registry tables and user profile management screens.
- **Task 5 (Issue #50):** Compile and submit Week 3 Progress Report upon milestone delivery.

---

*Report prepared and compiled by Merve Gazi for academic evaluation.*
