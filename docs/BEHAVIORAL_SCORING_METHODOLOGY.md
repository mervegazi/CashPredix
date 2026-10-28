# CashPredix — Machine Learning Behavioral Scoring Methodology & Architectural Design
**Document Version:** 1.0.0  
**Project:** CashPredix — Autonomous Liquidity Prediction & Supplier Risk Management Platform  
**Sprint Deliverable:** Week 4: Machine Learning Pipeline, Feature Engineering & Validation (Tasks #17 - #20)  
**Author:** Merve Gazi  

---

## 1. Executive Summary & Problem Formulation

In corporate treasury and accounts receivable (AR) management, traditional static credit ratings (such as Dun & Bradstreet PAYDEX® or FICO) fail to provide real-time, high-fidelity signals regarding counterparty cashflow volatility. They rely on lagging quarterly filings, omit payment cadence variance, and ignore invoice amount weightings.

**CashPredix Behavioral Scoring** formulates counterparty reliability as an empirical, continuous predictive score $S \in [0, 100]$. The model evaluates the true probabilistic risk of cash settlement delays, penalizing volatility, default rates, and payment term stretch while rewarding consistency, early discount capture, and positive recency trends.

```
+----------------------------------------------------------------------------------------------------+
|                               CASHPredix ML ARCHITECTURE FLOW                                      |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ Supabase PostgreSQL ]   or   [ Local Synthetic Bundle ]                                         |
|  (companies, customers, payment_history)                                                          |
|             │                                                                                      |
|             ▼                                                                                      |
|  ┌────────────────────────────────────────────────────────┐                                        |
|  │ 1. Data Ingestion & Imputation Pipeline (Issue #17)    │                                        |
|  │    - Missing date & DPD computation                     │                                        |
|  │    - Numeric amount median imputation                   │                                        |
|  │    - Sparse record Bayesian cohort smoothing            │                                        |
|  └──────────────────────────┬─────────────────────────────┘                                        |
|                             ▼                                                                      |
|  ┌────────────────────────────────────────────────────────┐                                        |
|  │ 2. Feature Engineering & Statistical Filter (Issue #18)│                                        |
|  │    - IQR & Z-score Winsorization / Outlier Clipping     │                                        |
|  │    - Contractual term timeline normalization            │                                        |
|  │    - 18 behavioral, cadence & exposure features         │                                        |
|  └──────────────────────────┬─────────────────────────────┘                                        |
|                             ▼                                                                      |
|  ┌────────────────────────────────────────────────────────┐                                        |
|  │ 3. Core Behavioral Scoring Engine (Issue #19)          │                                        |
|  │    - Gradient Boosting Regressor (65% weight)           │                                        |
|  │    - Random Forest Regressor (35% weight)               │                                        |
|  │    - Standardized 0 - 100 Reliability Calibration       │                                        |
|  └──────────────────────────┬─────────────────────────────┘                                        |
|                             ▼                                                                      |
|  ┌────────────────────────────────────────────────────────┐                                        |
|  │ 4. Validation, Benchmarking & Tiers (Issue #20)        │                                        |
|  │    - 5-Fold Cross Validation (R²: 0.9859, MAE: 2.1 pts) │                                        |
|  │    - Baseline Benchmarking against 4 industry rules    │                                        |
|  │    - Tier Assignment & Liquidity Recommendations       │                                        |
|  └────────────────────────────────────────────────────────┘                                        |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Data Ingestion & Imputation Pipeline (`ml/data_pipeline.py`)

### 2.1. Dual-Source Connectivity
The data ingestion engine connects directly to Supabase via `@supabase/supabase-js` / PostgREST REST endpoints using service-role or anon keys. If the remote database is unreachable or table schema caching is incomplete, it transparently falls back to local verified datasets in `data/synthetic/` with zero application crashes.

### 2.2. Missing Value Imputation Strategy
- **Days Past Due ($DPD$):**
  $$DPD = \begin{cases} (t_{\text{payment}} - t_{\text{due}})_{\text{days}}, & \text{if payment date is recorded} \\ 0, & \text{if status is PAID} \\ 14, & \text{if status is LATE and dates missing} \\ 60, & \text{if status is MISSED} \end{cases}$$
- **Invoice Amounts:** Bounded to positive numbers; missing records are imputed using global median.
- **Categorical Defaults:** Mode imputation for `payment_method` (`wire_transfer`), `check_status` (`NONE`), and boolean flags (`is_split_payment = False`, `is_factored = False`, `early_discount_applied = False`).
- **Sparse Customer Handling:** Counterparties with fewer than 3 historical invoices are flagged (`sparse_customers_detected`) and smoothed using global cohort priors to prevent overfitting.

---

## 3. Feature Engineering & Statistical Filtering (`ml/feature_engineering.py`)

### 3.1. Outlier Filtering (IQR & Z-score Winsorization)
To prevent rogue data or transmission glitches from corrupting model training, extreme values are bounded using Interquartile Range (IQR) Winsorization:
$$\text{Lower Bound} = \max(0, Q_{25} - 1.5 \times IQR), \quad \text{Upper Bound} = Q_{75} + 1.5 \times IQR$$
Across the 3,395 evaluated payment records:
- **Invoice Amount:** Upper bound capped at \$28,556.14 (398 extreme records clipped).
- **Days Past Due:** Bounds set to $[-24.5, +35.5]$ days (254 extreme delays bounded).

### 3.2. Contract Term Normalization
Different customers operate under varied trade terms (e.g., *Due on Receipt*, *Net 15*, *Net 30*, *Net 60*, *Net 90*, *2/10 Net 30*). Delays are normalized relative to the agreed term window:
$$\text{Relative Delay Ratio} = \frac{DPD}{\text{Term Days}}$$
$$\text{Normalized Timeline Reliability} = \frac{1}{1 + e^{0.1 \times DPD}}$$

### 3.3. Engineered Feature Glossary (18 Variables)

| # | Feature Name | Description & Formula | Business Rationale |
|---|---|---|---|
| 1 | `total_invoices` | Total historical invoice count | Credibility sample size |
| 2 | `total_volume` | $\sum \text{Amount}$ | Monetary exposure |
| 3 | `avg_invoice_amount` | $\frac{1}{N}\sum \text{Amount}_i$ | Average ticket size |
| 4 | `avg_delay_days` | $\bar{D} = \frac{1}{N}\sum DPD_i$ | Central tendency of delay |
| 5 | `median_delay_days` | $\text{Median}(DPD)$ | Robust typical delay |
| 6 | `delay_std` | $\sqrt{\frac{1}{N}\sum (DPD_i - \bar{D})^2}$ | Delay volatility / consistency |
| 7 | `delay_iqr` | $Q_{75}(DPD) - Q_{25}(DPD)$ | Non-parametric delay spread |
| 8 | `amount_weighted_delay` | $\frac{\sum (DPD_i \times \text{Amount}_i)}{\sum \text{Amount}_i}$ | Exposure-weighted delay impact |
| 9 | `recency_weighted_delay` | $\frac{\sum DPD_i \cdot e^{-\Delta t_i / 90}}{\sum e^{-\Delta t_i / 90}}$ | Decay prioritizing recent 90 days |
| 10 | `delay_trend_drift` | $\bar{D}_{\text{recent 3}} - \bar{D}_{\text{earliest 3}}$ | Deterioration or improvement drift |
| 11 | `on_time_rate` | $\frac{N(DPD \le 0)}{N}$ | Punctuality ratio |
| 12 | `late_rate` | $\frac{N(DPD > 0)}{N}$ | Delinquency frequency |
| 13 | `severe_late_rate` | $\frac{N(DPD > 30)}{N}$ | Extreme delinquency frequency |
| 14 | `default_rate` | $\frac{N(\text{MISSED})}{N}$ | Default ratio |
| 15 | `avg_payment_cadence_days` | $\text{Mean}(\Delta t_{\text{invoices}})$ | Invoicing periodicity |
| 16 | `split_payment_ratio` | $\frac{N(\text{Split})}{N}$ | Liquidity strain indicator |
| 17 | `early_discount_ratio` | $\frac{N(\text{Early Discount})}{N}$ | Financial health indicator |
| 18 | `customer_id` | Unique UUID | Entity identifier |

---

## 4. Behavioral Scoring Algorithm & Calibration (`ml/behavioral_scoring.py`)

### 4.1. Ensemble Architecture
The core engine employs a dual-ensemble blending Gradient Boosted Decision Trees (GBDT) and Random Forest Regressors:
$$\hat{S} = 0.65 \times \hat{S}_{\text{GradientBoosting}} + 0.35 \times \hat{S}_{\text{RandomForest}}$$
- **Gradient Boosting:** 120 estimators, learning rate = 0.08, max depth = 4, subsample = 0.85.
- **Random Forest:** 100 estimators, max depth = 5.
- **Output:** Calibrated strictly to $[0.0, 100.0]$.

### 4.2. Top Predictive Feature Importances
From the trained ensemble, the top predictive signals contributing to counterparty reliability are:
1. **`late_rate`:** 53.2% contribution (primary discriminator of repayment habit)
2. **`on_time_rate`:** 26.6% contribution (reward for strict punctuality)
3. **`median_delay_days`:** 4.7% contribution (baseline delay offset)
4. **`amount_weighted_delay`:** 4.7% contribution (exposure risk weighting)
5. **`avg_delay_days`:** 3.7% contribution (overall arithmetic delay)

### 4.3. Corporate Risk Tier Classification

| Score Range | Corporate Tier | Risk Level | Actionable Liquidity Mitigation |
|---|---|---|---|
| **88 – 100** | **Prime / Benchmark** | Minimal | Maintain optimal credit terms (Net 30/60) with early payment discount incentives. |
| **72 – 87** | **Investment Grade / Stable** | Low | Standard commercial credit terms. Periodic working capital monitoring. |
| **50 – 71** | **Watchlist / Moderate Risk** | Moderate | Tighten terms to Net 15 or require milestone installments before milestone releases. |
| **0 – 49** | **High Risk / Distressed** | High | Immediate safeguard: Advance prepayment, Escrow, or 3rd-party Invoice Factoring. |

---

## 5. Model Validation & Baseline Benchmarking (`ml/validation.py`)

### 5.1. Baseline Benchmark Comparison

| Model / Baseline | RMSE | MAE | $R^2$ Score | Spearman Rank Correlation |
|---|---|---|---|---|
| **Baseline 1: Pure On-Time Heuristic** | 12.005 | 10.152 pts | 0.7877 | 0.9560 |
| **Baseline 2: Linear Delay Penalty Rule** | 39.496 | 36.966 pts | -1.2975 | 0.9312 |
| **Baseline 3: Naive Global Mean** | 26.057 | 22.216 pts | 0.0000 | 0.0000 |
| **Baseline 4: Classical Ridge Regression** | 1.657 | 1.250 pts | 0.9960 | 0.9955 |
| **★ CashPredix Ensemble Model** | **0.800** | **0.605 pts** | **0.9991** | **0.9992** |

*Key Finding:* While Baseline 1 (On-Time Heuristic) correlates with performance, it has a high mean absolute error (10.15 points) because it ignores severe defaults and payment volatility. The CashPredix Ensemble reduces error by over **94%** compared to standard heuristics.

### 5.2. 5-Fold Cross-Validation Generalization
To guarantee zero data leakage and confirm generalizability:
- **CV Mean $R^2$:** $0.9859 \pm 0.006$
- **CV Mean MAE:** $2.106 \pm 0.517$ points
- **CV Mean RMSE:** $2.958 \pm 0.701$
- **CV Mean Rank Correlation:** $0.9919$

### 5.3. Monotonicity & Sensitivity Sanity Checks
- **Delay-to-Score Correlation:** $\rho = -0.9231$ (Strictly inverse: an increase in payment delay monotonically depresses the reliability score).
- **Residual Bias:** $+0.017$ points (effectively zero mean error across all tiers).
- **Residual Volatility:** $\sigma = 0.801$ points.

---

## 6. Execution Guide

```bash
# Activate environment
source .venv/bin/activate

# 1. Run Data Ingestion & Imputation
python ml/data_pipeline.py --export-clean

# 2. Run Feature Engineering & Statistical Filtering
python ml/feature_engineering.py

# 3. Train & Evaluate Behavioral Scoring Model
python ml/behavioral_scoring.py

# 4. Run Full Validation Suite & Generate Audit Report
python ml/validation.py
```
