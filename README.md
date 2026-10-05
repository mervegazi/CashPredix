# CashPredix 💰📊

**Autonomous Liquidity Prediction and Behavioral Scoring Web Platform**

🔗 **Live Website:** [https://mervegazi.github.io/CashPredix](https://mervegazi.github.io/CashPredix)
📄 **Project Document:** [Google Doc](https://docs.google.com/document/d/12zZ7CwuSc9LT1miTMwkaNCyaasFeuesjaXJgL3taLSc/edit?tab=t.0#heading=h.egvdssihcvzi)

---

## About the Project

CashPredix is a machine learning-driven web application focusing on **Autonomous Liquidity Prediction and Behavioral Scoring**. The system predicts company cash flows and scores vendor reliability using realistic synthetic financial data.

### Key Features

- 🏠 **Landing Page** — Introductory page explaining the platform's purpose
- 🔐 **Authentication** — Login, Sign Up, Logout, and Change Password via Supabase Auth
- 🏢 **Company & Vendor Management** — Create companies, add vendors (manual + Excel upload), and manage them
- 🤖 **ML-Powered Vendor Scoring** — Analyze vendor payment histories and assign behavioral reliability scores
- 📈 **Cash Flow Prediction** — Forecast company cash flows using time-series ML models
- 📊 **Dashboard** — View active companies with weekly cash flow summaries
- 📅 **Cashflow Predicts** — Filter predictions by date range with detailed vendor breakdowns

## Tech Stack

| Layer        | Technology         |
|-------------|-------------------|
| Frontend    | React (Vite)      |
| Database    | Supabase (PostgreSQL) |
| Auth        | Supabase Auth     |
| ML          | Python (scikit-learn / TensorFlow) |
| Hosting     | GitHub Pages      |
| Project Mgmt| GitHub Projects (Kanban) |

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/mervegazi/CashPredix.git
cd CashPredix

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
CashPredix/
├── public/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── lib/             # Supabase client & utilities
│   ├── hooks/           # Custom React hooks
│   ├── assets/          # Images & static files
│   ├── App.jsx          # Main app with routing
│   └── main.jsx         # Entry point
├── .env.example
├── package.json
└── vite.config.js
```

## Project Management

This project uses **Kanban** methodology managed through [GitHub Projects](https://github.com/mervegazi/CashPredix/projects). All weekly tasks and milestones are tracked on the Kanban board.

## Weekly Plan (11 Weeks)

| Week | Focus Area |
|------|-----------|
| 1 | Project Setup & Landing Page |
| 2 | Auth & Base Navigation |
| 3 | Synthetic Data Generation & Management UI |
| 4 | ML - Vendor Scoring |
| 5 | ML - Cash Flow Prediction |
| 6 | ML Integration & Backend Logic |
| 7 | Dashboard UI (Home Screen) |
| 8 | Dashboard UI (Cashflow Predicts) |
| 9 | End-to-End System Testing |
| 10 | Final Documentation |
| 11 | Final Demo Preparation |

## Author

**Merve Gazi**
Advisor: Prof. Sarah Zelikovitz

## License

This project is licensed under the MIT License.
