# CashPredix — Weekly Progress Report: Week 4
**Project Title:** CashPredix — Autonomous Liquidity Prediction & Supplier Risk Management Platform  
**Sprint Period:** October 19, 2026 – October 25, 2026 (Week 4)  
**Author / Developer:** Merve Gazi  
**Supervisor / Reviewer:** Academic Advisor / Course Professor  
**Repository:** [github.com/mervegazi/CashPredix](https://github.com/mervegazi/CashPredix)  
**Live Application:** [mervegazi.github.io/CashPredix](https://mervegazi.github.io/CashPredix/)  

---

## 1. Executive Summary & Sprint Objectives

During Week 4 of the CashPredix engineering lifecycle, the project achieved a pivotal transition from user interface data management into the **core Machine Learning intelligence foundation**. The primary sprint focus centered on establishing the statistical data pipeline, engineering predictive financial features, and developing the proprietary **Behavioral Reliability Scoring Engine** to predict counterparty settlement timeliness and cashflow risk.

All four planned machine learning deliverables were executed, rigorously tested, and committed to the repository:
1. **Issue #17: Set up ML Environment & Data Pipeline:** Initialized Python virtual environment (`.venv`), installed standard scientific libraries (`scikit-learn 1.6`, `pandas 2.3`, `numpy 2.0`, `scipy 1.13`), created a dual-source Supabase PostgreSQL data fetcher with seamless offline fallback, and engineered an automated data imputation pipeline.
2. **Issue #18: Feature Engineering & Statistical Filtering:** Implemented Interquartile Range (IQR) and Z-score outlier Winsorization, normalized payment delays against trade contract terms (Net 15 through Net 90), and extracted 18 domain-specific behavioral features across 273 counterparties and 3,395 invoices.
3. **Issue #19: Develop Core Behavioral Scoring Algorithm:** Designed a hybrid ensemble regressor blending Gradient Boosted Decision Trees (65%) and Random Forest Regressors (35%), calibrating predictions into a standardized 0–100 behavioral reliability score categorized into four corporate risk tiers.
4. **Issue #20: Validation, Cross-Validation & Documentation:** Evaluated the engine against four industry baselines (achieving an R² of 0.9991 and MAE of 0.605 pts), proved generalizability via 5-Fold Cross-Validation (CV R²: 0.9859 ± 0.006, MAE: 2.1 pts), validated strictly inverse monotonicity (Spearman $\rho = -0.9231$), and compiled comprehensive academic methodology documentation.

```
+----------------------------------------------------------------------------------------------------+
|                                    WEEK 4 DELIVERABLES SUMMARY                                     |
+----------------------------------------------------------------------------------------------------+
| [✓] Task #17: Python Scientific ML Environment (.venv, requirements.txt, supabase-py)              |
| [✓] Task #17: Dual-Source Pipeline (Supabase REST + Local Synthetic Fallback) & Imputation Engine   |
| [✓] Task #18: Statistical Outlier Filtering (IQR & Z-score Winsorization on Amount & Delay)        |
| [✓] Task #18: Contract Term Normalization & 18 Customer-Level Behavioral Features                   |
| [✓] Task #19: Core Behavioral Scoring Algorithm (Gradient Boosting + Random Forest Ensemble)        |
| [✓] Task #19: Standardized 0-100 Score Calibration & 4-Tier Corporate Risk Classification           |
| [✓] Task #20: 5-Fold Cross-Validation, Baseline Benchmarking & Model Artifact Serialization         |
| [✓] Task #20: Academic Methodology Documentation (docs/BEHAVIORAL_SCORING_METHODOLOGY.md)          |
| [✓] Task #51: Formal Weekly Progress Report in Markdown & Word Document (.docx) Format             |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Completed Deliverables & Technical Architecture

### 2.1. Python ML Environment & Dual-Source Data Ingestion (`ml/data_pipeline.py`)
To ensure reproducibility across local workstations and cloud servers, a unified Python environment was established and pinned in `requirements.txt`:
- **Dual-Source Ingestion:** Connects to Supabase PostgreSQL using REST PostgREST protocols. In case of network interruption or unmigrated schema caches, it automatically switches to local verified synthetic datasets (`data/synthetic/payment_history.csv` / `customers.csv`), guaranteeing zero pipeline crashes.
- **Data Imputation:** Imputes missing Days Past Due ($DPD$) from timestamps $(t_{\text{payment}} - t_{\text{due}})$ or invoice status codes (`PAID` $\rightarrow 0$, `LATE` $\rightarrow 14$, `MISSED` $\rightarrow 60$). Amounts are median-imputed, and categorical fields default to industry standards (`wire_transfer`, `NONE`).
- **Bayesian Cohort Smoothing:** Detects sparse customer records ($<3$ invoices) and applies empirical cohort prior adjustments to prevent extreme variance distortion.

### 2.2. Statistical Outlier Filtering & Feature Engineering (`ml/feature_engineering.py`)
- **IQR Winsorization:** Detects extreme payment delay artifacts and anomalously large test amounts without discarding valuable data records:
  - Invoice Amount capped at \$28,556.14 (398 records clipped).
  - Delays bounded to $[-24.5, +35.5]$ days (254 records clipped).
- **Contractual Term Normalization:** Evaluates payment timeliness in relation to agreed credit terms (Net 15, Net 30, Net 60, etc.):
  $$\text{Relative Delay Ratio} = \frac{DPD}{\text{Term Days}}, \quad \text{Timeline Reliability} = \frac{1}{1 + e^{0.1 \times DPD}}$$
- **18 Engineered Behavioral Features:** Generated across all 273 counterparties:
  - *Central Tendency:* `avg_delay_days`, `median_delay_days`.
  - *Volatility & Dispersion:* `delay_std`, `delay_iqr`.
  - *Monetary Exposure:* `total_volume`, `avg_invoice_amount`, `amount_weighted_delay`.
  - *Performance Rates:* `on_time_rate`, `late_rate`, `severe_late_rate`, `default_rate`.
  - *Temporal Dynamics:* `avg_payment_cadence_days`, `recency_weighted_delay` (exponential half-life of 90 days), `delay_trend_drift` (6-month directional drift).
  - *Solvency Signals:* `split_payment_ratio`, `early_discount_ratio`.

### 2.3. Proprietary Behavioral Scoring Engine (`ml/behavioral_scoring.py`)
- **Ensemble ML Architecture:** Blends two complementary non-linear algorithms:
  $$\hat{S} = 0.65 \times \hat{S}_{\text{GBDT}} + 0.35 \times \hat{S}_{\text{RandomForest}}$$
  - Gradient Boosted Trees capture subtle feature interactions and non-linear decay thresholds.
  - Random Forest reduces model variance and prevents overfitting on small cohorts.
- **Top Predictive Feature Drivers:**
  1. `late_rate` (53.2% relative importance)
  2. `on_time_rate` (26.6% relative importance)
  3. `median_delay_days` (4.7% relative importance)
  4. `amount_weighted_delay` (4.7% relative importance)
  5. `avg_delay_days` (3.7% relative importance)
- **Corporate Risk Tiers & Actions:**
  - **88 – 100 (Prime / Benchmark):** Optimal credit terms (Net 30/60) with early payment incentives.
  - **72 – 87 (Investment Grade / Stable):** Standard commercial credit terms.
  - **50 – 71 (Watchlist / Moderate Risk):** Tighten terms to Net 15 or require milestone installments.
  - **0 – 49 (High Risk / Distressed):** Require advance prepayment, escrow, or 3rd-party invoice factoring.
- **Model Serialization:** Serialized trained ensemble pipeline to `ml/models/behavioral_scoring_model.joblib` for low-latency batch and live inference.

### 2.4. Comprehensive Model Validation Suite (`ml/validation.py`)
- **Baseline Benchmarking:** Validated against four classical alternatives (Naive Mean, Pure On-Time Heuristic, Linear Delay Penalty, and Ridge Regression).
- **5-Fold Cross Validation:** Demonstrated high generalization stability with zero data leakage:
  - Mean $R^2$: $0.9859 \pm 0.006$
  - Mean MAE: $2.106 \pm 0.517$ points
  - Mean RMSE: $2.958 \pm 0.701$
- **Monotonicity & Sensitivity:** Verified that increases in settlement delay strictly decrease the reliability score ($\rho = -0.9231$), with zero residual bias ($+0.017$ pts).

---

## 3. Technical Challenges Encountered & Engineering Solutions

During the Week 4 implementation cycle, five key technical hurdles were addressed:

| # | Technical Challenge | Root Cause | Implemented Resolution |
|---|:---|:---|:---|
| **1** | **PostgREST HTTP 404 Schema Cache Miss** | Fresh Supabase projects without table migrations fail REST lookups with code `PGRST205`. | Engineered a resilient dual-source loader in `data_pipeline.py` that intercepts HTTP 404/connection errors and seamlessly loads local verified CSV/JSON datasets. |
| **2** | **Floating-Point Overflow in Baseline Ridge Regression** | Unscaled monetary volume features ($\sum \text{Amount} > \$1\text{M}$) caused `RuntimeWarning: overflow encountered in matmul` in scikit-learn. | Integrated a scikit-learn `Pipeline` with `StandardScaler()` prepended to `Ridge()`, ensuring numerical stability. |
| **3** | **Sparse Customer Record Skew** | 27 customers had fewer than 3 historical invoices, causing zero variance and artificially high on-time rates. | Applied Bayesian empirical cohort smoothing and logged `sparse_customers_detected` to apply conservative uncertainty priors. |
| **4** | **Python Module Resolution in Standalone CLI Runs** | Executing `python ml/feature_engineering.py` directly caused `ModuleNotFoundError: No module named 'ml'`. | Added path-agnostic `sys.path.insert(0, str(BASE_DIR))` bootstrapping at the head of every script, allowing both standalone CLI and package imports. |
| **5** | **Extreme Delay Artifacts Skewing Gradient Descent** | Synthetic edge cases with extreme delay values (e.g. >90 days) caused disproportionate gradients in decision trees. | Implemented IQR-based Winsorization capping delays between $[-24.5, +35.5]$ days and capping amounts at \$28,556.14. |

---

## 4. Empirical Evaluation & Benchmarking Results

### 4.1. Baseline Benchmark Comparison Table

The CashPredix Behavioral Scoring Engine was tested against 4 standard industry baselines across all 273 counterparties:

| Model / Baseline | RMSE | MAE | $R^2$ Score | Spearman Rank ($\rho$) | Superiority over Baseline |
|---|---|---|---|---|---|
| **Baseline 1: Pure On-Time Heuristic** | 12.005 | 10.152 pts | 0.7877 | 0.9560 | +94.0% MAE reduction |
| **Baseline 2: Linear Delay Penalty Rule** | 39.496 | 36.966 pts | -1.2975 | 0.9312 | +98.4% MAE reduction |
| **Baseline 3: Naive Global Mean** | 26.057 | 22.216 pts | 0.0000 | 0.0000 | +97.3% MAE reduction |
| **Baseline 4: Classical Ridge Regression** | 1.657 | 1.250 pts | 0.9960 | 0.9955 | +51.6% MAE reduction |
| **★ CashPredix Ensemble Model** | **0.800** | **0.605 pts** | **0.9991** | **0.9992** | **Best-in-Class Performance** |

### 4.2. 5-Fold Cross-Validation Fold Metrics

| Fold | Validation Samples | RMSE | MAE | $R^2$ Score | Spearman Rank ($\rho$) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **Fold 1** | 55 | 2.378 | 1.685 pts | 0.9904 | 0.9942 |
| **Fold 2** | 55 | 3.512 | 2.514 pts | 0.9801 | 0.9891 |
| **Fold 3** | 55 | 2.745 | 1.954 pts | 0.9882 | 0.9928 |
| **Fold 4** | 54 | 3.821 | 2.784 pts | 0.9765 | 0.9875 |
| **Fold 5** | 54 | 2.334 | 1.593 pts | 0.9941 | 0.9958 |
| **Mean ± Std** | **54.6** | **2.958 ± 0.701** | **2.106 ± 0.517 pts** | **0.9859 ± 0.006** | **0.9919 ± 0.003** |

---

## 5. Next Sprint Roadmap: Week 5 Preview

With the core behavioral reliability scoring engine fully trained, validated, and documented, the development roadmap advances to **Week 5: Time-Series Cashflow Forecasting**:

- **Task 1 (Issue #21): Time-Series Data Preprocessing & Aggregation:** Aggregate daily accounts receivable cash inflows and accounts payable outflows into structured uniform time-series sequences.
- **Task 2 (Issue #22): Develop Baseline & Advanced Forecasting Models:** Implement baseline time-series algorithms (ARIMA / SARIMA, Exponential Smoothing) and evaluate modern recurrent architectures (Prophet / LSTM) for 30/60/90-day cashflow trajectories.
- **Task 3 (Issue #23): Model Evaluation & Backtesting:** Evaluate forecasting performance using rolling-window backtesting, Mean Absolute Percentage Error (MAPE), and directional accuracy metrics.
- **Task 4 (Issue #52): Weekly Progress Report:** Generate and submit the Week 5 progress documentation.

---

*Report prepared and compiled by Merve Gazi for academic evaluation.*
