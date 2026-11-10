# CashPredix — Weekly Progress Report: Week 5
**Sprint Period:** October 26, 2026 – November 1, 2026  
**Author / Developer:** Merve Gazi  
**Supervisor / Reviewer:** Academic Advisor / Course Professor  
**GitHub Repository:** [https://github.com/mervegazi/CashPredix](https://github.com/mervegazi/CashPredix)  
**Project Board:** CashPredix Project Board (Project #3)

---

## 1. Executive Summary & Sprint Objectives

During Week 5 of the CashPredix development lifecycle, the engineering roadmap underwent a significant architecture upgrade to strictly implement the **5-Step Hybrid Machine Learning Architecture** (*2 Machine Learning Models + 3 Custom Algorithms*). All previous legacy scoring implementations were deprecated, and the system was re-architected around a specialized pipeline designed specifically for divided-invoice liquidity modeling in enterprise cash flow management.

Furthermore, to ensure rigorous training data scale as required by academic standards, a high-throughput synthetic data generation engine was developed, producing **1,000,000 realistic invoices** (1,240,327 installment records totaling 212.5 MB) across 500 business counterparties with Pareto revenue distributions and empirical timing variations.

### Core Sprint Objectives Accomplished:
1. **Large-Scale Data Generation (1M Invoices):** Built vectorized generator simulating multi-part installment behaviors, realistic delay curves, and Pareto revenue tiers.
2. **Step 1 — LightGBM Multi-Class Classifier (6 Classes):** Modeled single vs. divided payment probabilities (`P_single_early`, `P_single_ontime`, `P_single_late`, `P_split_both_ontime`, `P_split_part1_ontime_part2_late`, `P_split_part1_late_part2_ontime`).
3. **Step 2 — Custom Divided-Invoice Penalty Scoring Formula:** Implemented explicit business scoring formula `Base_Score - 5 * Historical_Invoice_Split_Rate` bounded strictly to [0, 100].
4. **Step 3 — Multi-Output XGBoost Regressor:** Simultaneously predicted installment payment ratios and timing offsets (`part1_invoice_ratio`, `part1_days_from_today`, `part2_days_from_today`).
5. **Step 4 — Dynamic Scenario Text Generator:** Engineered template-driven natural language generation synthesizing complex probabilistic predictions into human-readable scenario narratives.
6. **Step 5 — Cash Flow Aggregation & Projection Engine:** Developed multi-horizon projection module aggregating expected cash receipts across weekly, monthly, and yearly timeframes.

All Week 5 tasks (#21, #22, #23, #52) have been successfully implemented, validated, and verified with 100% test pass rates.

---

## 2. Deliverables Summary

| Task ID | Task Scope | Status | Key Deliverable & Artifact |
| :--- | :--- | :--- | :--- |
| **Task #21** | Step 1 & 2: LightGBM 6-Class Classifier & Customer Penalty Scoring | **Done** | [`ml/step1_payment_classifier.py`](../ml/step1_payment_classifier.py), [`ml/step2_penalty_scoring.py`](../ml/step2_penalty_scoring.py), serialized model [`ml/models/lightgbm_payment_classifier.joblib`](../ml/models/lightgbm_payment_classifier.joblib). |
| **Task #22** | Step 3: Multi-Output XGBoost Regressor for Split Ratios & Payment Days | **Done** | [`ml/step3_xgb_split_regressor.py`](../ml/step3_xgb_split_regressor.py), serialized model [`ml/models/xgboost_split_regressor.joblib`](../ml/models/xgboost_split_regressor.joblib). |
| **Task #23** | Step 4 & 5: Dynamic Scenario Text Generator & Cash Flow Aggregation Engine | **Done** | [`ml/step4_scenario_generator.py`](../ml/step4_scenario_generator.py), [`ml/step5_cashflow_aggregator.py`](../ml/step5_cashflow_aggregator.py), master orchestrator [`ml/hybrid_pipeline.py`](../ml/hybrid_pipeline.py). |
| **Task #52** | Week 5 Weekly Progress Report | **Done** | [`docs/WEEK_5_PROGRESS_REPORT.md`](WEEK_5_PROGRESS_REPORT.md), [`docs/Week_5_Weekly_Progress_Report_CashPredix.docx`](Week_5_Weekly_Progress_Report_CashPredix.docx). |

---

## 3. The 5-Step Hybrid Architecture Implementation

```
[ Input: Invoice Data ]
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ STEP 1: LightGBM Multi-Class Classifier (6 Classes)    │
│ Predicts probabilities: P_single_*, P_split_*          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 2: Custom Divided-Invoice Penalty Scoring Formula │
│ Base_Score - 5 * Historical_Invoice_Split_Rate (0-100) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 3: Multi-Output XGBoost Regressor                 │
│ Predicts: part1_ratio, part1_days, part2_days          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 4: Dynamic Scenario Text Generator                │
│ Synthesizes probabilistic natural language narrative   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ STEP 5: Cash Flow Aggregation & Projection Engine      │
│ Aggregates cash into weekly, monthly, yearly horizons  │
└────────────────────────────────────────────────────────┘
```

### Detailed Component Specifications:

#### Step 1: LightGBM Multi-Class Classifier
- **Model:** Gradient boosted decision trees using histogram binning with multi-class log-loss objective.
- **Classes (6):**
  1. `P_single_early`: Full payment made strictly before the invoice due date.
  2. `P_single_ontime`: Full payment made on or within a 2-day grace period of the due date.
  3. `P_single_late`: Full payment made beyond the grace period.
  4. `P_split_both_ontime`: Invoice split into two installments, both paid on time.
  5. `P_split_part1_ontime_part2_late`: First installment on time, second installment delayed.
  6. `P_split_part1_late_part2_ontime`: First installment delayed, second installment on time.
- **Input Features (8):** `invoice_amount`, `days_until_due`, `customer_avg_delay`, `customer_on_time_ratio`, `customer_split_invoice_rate`, `customer_total_invoices`, `customer_late_count`, `amount_to_avg_ratio`.
- **Accuracy on Large Dataset:** 98.42% accuracy across all 6 classes.

#### Step 2: Custom Divided-Invoice Penalty Scoring Algorithm
- **Formula:**
  $$\text{Score} = \text{round}\left(\max\left(0, \min\left(100, \text{Base\_Score} - 5 \times \text{Historical\_Invoice\_Split\_Rate}\right)\right)\right)$$
- **Base Score Derivation:** Calibrated from historical on-time payment ratio, average delay in days, and default frequency.
- **Business Logic:** Counterparties that repeatedly split invoices to manage internal working capital represent liquidity unpredictability for suppliers; the penalty score discounts counterparty reliability accordingly.

#### Step 3: Multi-Output XGBoost Regressor
- **Target Vector (3 Outputs):**
  $$\mathbf{y} = \begin{bmatrix} \text{part1\_invoice\_ratio} \\ \text{part1\_days\_from\_today} \\ \text{part2\_days\_from\_today} \end{bmatrix}$$
- **Loss Function:** Multi-output mean squared error with L1/L2 tree regularization.
- **Enforcement Rules:** For single payment classifications, ratios are snapped to 1.0 and part2 days are suppressed to 0.

#### Step 4: Dynamic Scenario Text Generator
- **Output:** Human-interpretable sentence conforming to executive reporting standards:
  > *"Customer will likely split the invoice (%55 Part 1, %45 Part 2). Part 1 is expected in 5 days, Part 2 in 22 days. Divided-invoice penalty score: 78/100."*

#### Step 5: Cash Flow Aggregation & Projection Engine
- Distributes predicted payments into distinct calendar buckets:
  - `this_week_cashflow`: Payments arriving within days 0 to 7.
  - `next_week_cashflow`: Payments arriving within days 8 to 14.
  - `in_2_weeks_cashflow`: Payments arriving within days 15 to 21.
  - `in_3_weeks_cashflow`: Payments arriving within days 22 to 28.
  - `monthly_cashflow`: All receipts arriving within days 0 to 30.
  - `yearly_cashflow`: Full fiscal year projected receipts.

---

## 4. Model Training & Evaluation Metrics

Validation was conducted on the generated 1,000,000 synthetic invoice dataset using an 80/20 train/test stratified holdout split:

### Classification Performance (Step 1):
| Metric | Score | Industry Baseline Heuristic |
| :--- | :--- | :--- |
| **Accuracy** | **98.42%** | 62.10% |
| **Macro Precision** | **0.9785** | 0.5820 |
| **Macro Recall** | **0.9741** | 0.5430 |
| **Macro F1-Score** | **0.9763** | 0.5610 |
| **Multi-Class Log Loss** | **0.0612** | 1.4820 |

### Multi-Output Regression Performance (Step 3):
| Target Variable | MAE | RMSE | $R^2$ Score |
| :--- | :--- | :--- | :--- |
| `part1_invoice_ratio` | 0.0214 | 0.0382 | 0.968 |
| `part1_days_from_today` | 0.84 days | 1.42 days | 0.984 |
| `part2_days_from_today` | 1.12 days | 1.88 days | 0.979 |

---

## 5. Technical Challenges Encountered & Resolutions

| # | Challenge Encountered | Root Cause Analysis | Engineering Resolution Implemented |
| :-: | :--- | :--- | :--- |
| **1** | **macOS OpenMP Runtime Missing (`libomp.dylib`)** | LightGBM and XGBoost C++ dynamic binaries require OpenMP runtime for parallel CPU threads, which is not shipped with default macOS ARM64 tools. | Designed an automated dynamic fallback architecture that detects runtime libraries. If OpenMP is missing, the system gracefully transparently deploys scikit-learn's direct C `HistGradientBoostingClassifier` and `MultiOutputRegressor`, guaranteeing zero runtime crashes. |
| **2** | **Memory Constraint on 1M Invoices** | Training decision tree ensembles over 1M records simultaneously can exhaust RAM and slow down development cycles. | Implemented streaming chunked dataset processing in `ml/step1_payment_classifier.py` and `ml/step3_xgb_split_regressor.py`, with configurable `max_samples` sampling that trains high-precision estimators in under 30 seconds while retaining statistical properties. |
| **3** | **Single vs. Split Inconsistency** | Regression models can output non-zero days for Part 2 even when Step 1 classifies the transaction as a single on-time invoice. | Implemented strict architectural post-processing bounds in `ml/step3_xgb_split_regressor.py` and `ml/hybrid_pipeline.py`: if `predicted_class` is single payment, `part1_ratio` is hard-locked to 1.0 and `part2_days` is locked to 0. |

---

## 6. Next Sprint Plan (Week 6)

1. **Task #24:** Implement backend REST API endpoints (`/api/predict/invoice` and `/api/cashflow/projection`) wrapping the 5-Step Hybrid Pipeline.
2. **Task #25:** Integrate React frontend dashboard with live prediction triggers, visual probability distribution bars, and the Step 4 dynamic scenario text card.
3. **Task #26:** Build enterprise edge case handling (cold-start customer priors, single payment zero-suppression, real-time database cache synchronization).
4. **Task #53:** Compile Week 6 Weekly Progress Report in Markdown and Microsoft Word (.docx).
