# CashPredix — Machine Learning & Cash Flow Architecture

**6-Step Hybrid Architecture: 2 Machine Learning Models + 4 Custom Algorithms & Output Data Flow**

This directory implements the complete Machine Learning and algorithmic pipeline for CashPredix, strictly adhering to the **CashPredix 6-Step Hybrid Pipeline Specification** trained on 3,000,000 synthetic invoices.

---

## 1. 6-Step Architecture Overview

| Step | Module Task (What This Step Does) | Model / Algorithm Used | Key Inputs | Generated Output |
|---|---|---|---|---|
| **Step 1** | Predict How the Customer Will Pay the Invoice (Single vs. Divided, and Timing) | **1st ML Model:** LightGBM Multi-Class Classifier (12 Classes) | Past delays, split rate, invoice amount, counterparty history | 12 Numeric Probabilities (0.00 to 1.00) adding to 1.00 |
| **Step 2** | Calculate Customer Reliability Score (0–100) with Divided-Invoice Penalty | **Custom Algorithm:** Divided-Invoice Penalty Scoring Formula | 12 numeric probabilities from Step 1 + historical split rate | 1 Numeric Customer Score (0 to 100) + Credit Tier |
| **Step 3** | Predict Divided Invoice Payment Percentages and Exact Payment Days | **2nd ML Model:** Multi-Output XGBoost Regressor | Customer Score (Step 2), invoice amount, days until due | 3 Numeric Values: `part1_invoice_ratio`, `part1_days_from_today`, `part2_days_from_today` |
| **Step 4** | Convert Numeric ML Outputs into Written Customer Scenario Text | **Custom Algorithm:** Dynamic Scenario Text Generator | Score (Step 2) + Split % & Payment Days (Step 3) + Due Date | 1 Text String explaining customer score, division, and payment timing |
| **Step 5** | Calculate Total Weekly, Monthly, and Yearly Company Cash Flow | **Custom Algorithm:** Cash Flow Aggregation & Projection Engine | Dollar amounts and predicted payment dates across all invoices | Cash Flow Totals ($) grouped by this week, next week, in 2w, in 3w, monthly, yearly |
| **Step 6** | Real-Time Counterparty Risk Alert & Working Capital Optimizer | **Custom Algorithm:** Risk Action Optimizer | Score (Step 2) + Class (Step 1) + Installment schedule (Step 3) | Action flag (`UPFRONT_RETAINER`, `FACTORING_ALERT`, etc.) + 8% APR Carry Cost ($) |

---

## 2. Directory Structure

```
ml/
├── __init__.py
├── step1_payment_classifier.py    # LightGBM 12-Class Payment Classifier
├── step2_penalty_scoring.py       # Divided-Invoice Penalty Scoring Formula (12 Classes)
├── step3_xgb_split_regressor.py    # Multi-Output XGBoost Regressor
├── step4_scenario_generator.py    # Dynamic Scenario Text Generator
├── step5_cashflow_aggregator.py    # Weekly, Monthly, Yearly Cash Flow Engine
├── step6_risk_action_optimizer.py # Credit Risk Alert & Working Capital Carry Cost (8% APR)
├── hybrid_pipeline.py             # Master End-to-End 6-Step Orchestrator
├── validation.py                  # Evaluation & Audit Suite (6 Steps)
└── models/
    ├── lightgbm_payment_classifier.joblib
    └── xgboost_split_regressor.joblib
```

---

## 3. Quick Start & Execution

```bash
# 1. Activate virtual environment
source .venv/bin/activate

# 2. Run the complete 6-Step Hybrid Pipeline
python ml/hybrid_pipeline.py

# 3. Run validation and verification report
python ml/validation.py
```

---

## 4. Key Formulas & Specifications

### Divided-Invoice Penalty Scoring Formula (Step 2)
```python
Base_Score = 100 * (
    1.00 * (P_single_early + P_single_ontime)
    + 0.88 * P_split_both_ontime
    + 0.65 * P_split_part1_late_part2_ontime
    + 0.50 * P_split_part1_ontime_part2_late
    + 0.00 * P_single_late
)
Invoice_Split_Penalty = 5 * Historical_Invoice_Split_Rate
Customer_Score = round(Base_Score - Invoice_Split_Penalty)
```

### Scenario Text Example (Step 4)
> *"This customer's score is 87. They will likely divide this $10,000 invoice into 2 parts: Part 1 ($5,000) will be paid this week (On-Time), and Part 2 ($5,000) will be paid in 2 weeks (On-Time)."*

### Cash Flow Totals Example (Step 5)
```json
{
  "this_week_cashflow": 45700.00,
  "next_week_cashflow": 73600.00,
  "in_2_weeks_cashflow": 45100.00,
  "in_3_weeks_cashflow": 55800.00,
  "monthly_cashflow": 220200.00,
  "yearly_cashflow": 2750000.00
}
```
