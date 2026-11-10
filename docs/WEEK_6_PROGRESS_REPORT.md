# CashPredix — Weekly Progress Report: Week 6
**Sprint Period:** November 2, 2026 – November 8, 2026  
**Author / Developer:** Merve Gazi  
**Supervisor / Reviewer:** Academic Advisor / Course Professor  
**GitHub Repository:** [https://github.com/mervegazi/CashPredix](https://github.com/mervegazi/CashPredix)  
**Project Board:** CashPredix Project Board (Project #3)

---

## 1. Executive Summary & Sprint Objectives

During Week 6 of the CashPredix engineering lifecycle, the team successfully bridged the machine learning intelligence layer developed in Week 5 with the full-stack web application. The primary sprint focus was the end-to-end operationalization of the **5-Step Hybrid Architecture** (*2 Machine Learning Models + 3 Custom Algorithms*), exposing it through a high-performance REST API backend and integrating live interactive prediction triggers into the React dashboard.

### Core Sprint Objectives Accomplished:
1. **REST API Endpoints for 5-Step Architecture (Task #24):** Built a FastAPI backend service (`server/app.py`) providing `/api/predict/invoice`, `/api/cashflow/projection`, `/api/customers/scores`, and `/api/sync/supabase` with standardized Pydantic schemas.
2. **Frontend Integration & Live Prediction Triggers (Task #25):** Created a client-side prediction service (`src/lib/mlPredictionService.js`) with resilient offline fallback computation, a glassmorphic visualization component (`src/components/ScenarioPredictionCard.jsx`), an upgraded cash flow projection view (`src/pages/dashboard/CashflowPredictsPlaceholder.jsx`), and interactive ledger integration (`src/components/CustomerLedgerModal.jsx`).
3. **Edge Cases, Single vs. Split Invoices & Database Sync (Task #26):** Implemented Bayesian fallback priors for cold-start counterparties with zero invoice history, strict zero suppression for single payment invoices (`part2 = 0`, `ratio = 1.0`), and database synchronization protocols.
4. **Verification & Testing (Tasks #24, #25, #26):** Created comprehensive test suites (`tests/test_api_endpoints.py` and `tests/test_edge_cases.py`), verifying 100% test pass rates across all edge cases and API contracts.

All Week 6 tasks (#24, #25, #26, #53) have been completed and verified.

---

## 2. Deliverables Summary

| Task ID | Task Scope | Status | Key Deliverable & Artifact |
| :--- | :--- | :--- | :--- |
| **Task #24** | ML Pipeline API Endpoints (FastAPI Backend) | **Done** | [`server/app.py`](../server/app.py), [`requirements.txt`](../requirements.txt), [`tests/test_api_endpoints.py`](../tests/test_api_endpoints.py). |
| **Task #25** | Frontend Integration & Live Prediction Triggers | **Done** | [`src/lib/mlPredictionService.js`](../src/lib/mlPredictionService.js), [`src/components/ScenarioPredictionCard.jsx`](../src/components/ScenarioPredictionCard.jsx), [`src/components/CustomerLedgerModal.jsx`](../src/components/CustomerLedgerModal.jsx), [`src/pages/dashboard/CashflowPredictsPlaceholder.jsx`](../src/pages/dashboard/CashflowPredictsPlaceholder.jsx). |
| **Task #26** | Edge Cases, Single vs Split Invoices & Database Sync | **Done** | [`tests/test_edge_cases.py`](../tests/test_edge_cases.py), cold-start fallback priors in [`ml/hybrid_pipeline.py`](../ml/hybrid_pipeline.py), database sync in [`server/app.py`](../server/app.py). |
| **Task #53** | Week 6 Weekly Progress Report | **Done** | [`docs/WEEK_6_PROGRESS_REPORT.md`](WEEK_6_PROGRESS_REPORT.md), [`docs/Week_6_Weekly_Progress_Report_CashPredix.docx`](Week_6_Weekly_Progress_Report_CashPredix.docx). |

---

## 3. System Architecture & End-to-End Data Flow

```
[ User Interaction: Invoice Selection / Sandbox ]
                       │
                       ▼
       ┌───────────────────────────────┐
       │ React Dashboard (Vite + React)│
       │ src/lib/mlPredictionService.js │
       └───────────────┬───────────────┘
                       │ HTTP POST /api/predict/invoice
                       ▼
       ┌───────────────────────────────┐
       │ FastAPI Backend (server/app.py│
       └───────────────┬───────────────┘
                       │ Calls Hybrid Orchestrator
                       ▼
┌────────────────────────────────────────────────────────┐
│ STEP 1: LightGBM Multi-Class Classifier (6 Classes)    │
│ Predicts probabilities: P_single_*, P_split_*          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 2: Divided-Invoice Penalty Scoring Formula (0-100)│
│ Base_Score - 5 * Historical_Invoice_Split_Rate         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 3: Multi-Output XGBoost Regressor                 │
│ Predicts: part1_ratio, part1_days, part2_days          │
│ (Zero suppression enforced if single payment)          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 4: Dynamic Scenario Text Generator                │
│ Synthesizes human-readable scenario narrative          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 5: Cash Flow Aggregation Engine                   │
│ Aggregates liquidity into weekly & monthly horizons    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
       ┌───────────────────────────────┐
       │ UI Rendering & Visualization  │
       │ ScenarioPredictionCard.jsx    │
       │ - Scenario Narrative Box      │
       │ - Reliability Score Badge     │
       │ - 6 Probability Bars          │
       │ - Installment Schedule        │
       └───────────────────────────────┘
```

---

## 4. API Endpoints Specification

### 1. `POST /api/predict/invoice`
- **Description:** Runs Steps 1 through 4 for an individual invoice.
- **Request Payload:**
```json
{
  "customer_id": "cust-enterprise-01",
  "invoice_amount": 25000.00,
  "days_until_due": 30,
  "invoice_number": "INV-2026-8492"
}
```
- **Response Payload:**
```json
{
  "status": "success",
  "customer_id": "cust-enterprise-01",
  "invoice_number": "INV-2026-8492",
  "invoice_amount": 25000.0,
  "days_until_due": 30,
  "is_cold_start": false,
  "step1_probabilities": {
    "P_single_early": 0.05,
    "P_single_ontime": 0.25,
    "P_single_late": 0.10,
    "P_split_both_ontime": 0.35,
    "P_split_part1_ontime_part2_late": 0.18,
    "P_split_part1_late_part2_ontime": 0.07
  },
  "predicted_class": "P_split_both_ontime",
  "is_divided_invoice": true,
  "step2_customer_score": 79,
  "step2_score_details": {
    "base_score": 85.0,
    "invoice_split_penalty": 1.1,
    "historical_split_rate": 0.22,
    "customer_score": 79,
    "tier": "Standard Operational"
  },
  "step3_schedule": {
    "is_divided_invoice": true,
    "part1_invoice_ratio": 0.55,
    "part1_amount": 13750.0,
    "part1_days_from_today": 14,
    "part2_invoice_ratio": 0.45,
    "part2_amount": 11250.0,
    "part2_days_from_today": 30,
    "part1_week_status": "Day 14",
    "part2_week_status": "Day 30"
  },
  "step4_scenario_text": "Customer will likely split the invoice (%55 Part 1, %45 Part 2). Part 1 is expected in 14 days, Part 2 in 30 days. Divided-invoice penalty score: 79/100.",
  "predicted_installments": [
    {
      "installment_number": 1,
      "ratio": 0.55,
      "amount": 13750.0,
      "days_from_today": 14,
      "estimated_payment_date": "2026-11-23"
    },
    {
      "installment_number": 2,
      "ratio": 0.45,
      "amount": 11250.0,
      "days_from_today": 30,
      "estimated_payment_date": "2026-12-09"
    }
  ]
}
```

### 2. `GET /api/cashflow/projection`
- **Description:** Runs Step 5 across all active open invoices in the portfolio.
- **Response Summary Fields:**
  - `this_week_cashflow` (Days 0–7)
  - `next_week_cashflow` (Days 8–14)
  - `in_2_weeks_cashflow` (Days 15–21)
  - `in_3_weeks_cashflow` (Days 22–28)
  - `monthly_cashflow` (Days 0–30)
  - `yearly_cashflow` (Days 0–365)

---

## 5. Edge Cases & Resilience Engineering (Task #26)

| Scenario / Edge Case | Engineering Challenge | Resolution Implemented |
| :--- | :--- | :--- |
| **Cold Start Customers** | New counterparties without transaction history risk causing KeyError or null division in feature extractors. | Injected Bayesian cohort priors (`historical_split_rate = 0.15`, `avg_past_delay = 0.0`, `base_score = 75`, `penalty_score = 74`), flagged with `is_cold_start = True`. |
| **Single Payment Zero Suppression** | Regressors may output tiny non-zero values for Part 2 even on single payments. | Hard zero suppression rule: if `predicted_class` is single payment, `part1_ratio = 1.0`, `part1_amount = invoice_amount`, `part2_amount = 0.0`, and `part2_days = 0`. |
| **Split Ratio Sum Rule** | Floating point approximation can cause Part 1 + Part 2 to sum to 0.999 or 1.001. | Enforced mathematical closure: `part2_amount = invoice_amount - part1_amount`, ensuring zero rounding leakage. |
| **Offline Fallback Client** | If FastAPI backend is unreachable or local dev server is offline, React UI should never freeze. | Built isomorphic client fallback in `src/lib/mlPredictionService.js` that evaluates identical mathematical formulas client-side with 0 network latency. |

---

## 6. Next Sprint Plan (Week 7)

For Week 7, the project will expand into advanced dynamic scenario simulation:
1. **Task #27:** Scenario Modeling Engine (Stress-test, Optimistic, and Delay sensitivity simulations).
2. **Task #28:** Interactive parameter sliders on the forecast dashboard.
3. **Task #29:** Model explainability with SHAP / feature importance visualizers.
4. **Task #54:** Week 7 Weekly Progress Report compilation.
