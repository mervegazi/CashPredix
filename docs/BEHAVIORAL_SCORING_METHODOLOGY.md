# CashPredix — 5-Step Hybrid Machine Learning & Cash Flow Architecture

**Architecture Version:** 2.0.0 (Strictly Aligned with Official 5-Step Hybrid Plan)  
**Author:** Merve Gazi  
**Project:** CashPredix — Autonomous Liquidity Prediction & Supplier Risk Management Platform  

---

## 1. Architecture Overview: 2 ML Models + 3 Custom Algorithms

```
+----------------------------------------------------------------------------------------------------+
|                         CASHPredix 5-STEP HYBRID ARCHITECTURE                                      |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ Customer Payment Records & Historical Invoices ]                                               |
|                           │                                                                        |
|                           ▼                                                                        |
|  ┌────────────────────────────────────────────────────────────────────────┐                        |
|  │ STEP 1 (1st ML Model): LightGBM Multi-Class Classifier                 │                        |
|  │ Inputs: Past delays, historical split rate, amount vs customer average  │                        |
|  │ Output: 6 Numeric Probabilities (P_single_early, P_single_ontime,      │                        |
|  │         P_single_late, P_split_both_ontime,                            │                        |
|  │         P_split_part1_ontime_part2_late,                               │                        |
|  │         P_split_part1_late_part2_ontime)                               │                        |
|  └────────────────────────────────────┬───────────────────────────────────┘                        |
|                                       │                                                            |
|                                       ▼                                                            |
|  ┌────────────────────────────────────────────────────────────────────────┐                        |
|  │ STEP 2 (Custom Algorithm): Divided-Invoice Penalty Scoring Formula     │                        |
|  │ Formula: Base_Score - 5 * Historical_Invoice_Split_Rate                │                        |
|  │ Output: Single Numeric Customer Score (0–100)                          │                        |
|  └────────────────────────────────────┬───────────────────────────────────┘                        |
|                                       │                                                            |
|                                       ▼                                                            |
|  ┌────────────────────────────────────────────────────────────────────────┐                        |
|  │ STEP 3 (2nd ML Model): Multi-Output XGBoost Regressor                  │                        |
|  │ Inputs: Customer Score, invoice amount, due date, part gap             │                        |
|  │ Output: part1_invoice_ratio, part1_days_from_today,                     │                        |
|  │         part2_days_from_today                                          │                        |
|  └────────────────────────────────────┬───────────────────────────────────┘                        |
|                                       │                                                            |
|                     ┌─────────────────┴─────────────────┐                                          |
|                     ▼                                   ▼                                          |
|  ┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐                  |
|  │ STEP 4 (Custom Algorithm):          │  │ STEP 5 (Custom Algorithm):          │                  |
|  │ Dynamic Scenario Text Generator     │  │ Cash Flow Aggregation Engine        │                  |
|  │ Output: Human-readable sentence     │  │ Output: Weekly, Monthly, and        │                  |
|  │         for Customer Card & Rows    │  │         12-Month Cash Flow Totals    │                  |
|  └─────────────────────────────────────┘  └─────────────────────────────────────┘                  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Detailed Technical Breakdown

### Step 1: LightGBM Multi-Class Classifier (6 Classes)
When a new invoice is created for a customer, this LightGBM Multi-Class Classifier analyzes past invoice payment delays, historical invoice split rates, and current invoice amount vs customer average to predict how this invoice will be settled.

Outputs 6 numeric probabilities adding up to 1.00:
1. `P_single_early`: Customer pays 100% of the invoice in 1 payment, at least 3 days before the due date.
2. `P_single_ontime`: Customer pays 100% of the invoice in 1 payment, on the due date (within +/- 2 days).
3. `P_single_late`: Customer pays 100% of the invoice in 1 payment, but after the due date.
4. `P_split_both_ontime`: Customer divides the invoice into 2 parts, paying both Part 1 and Part 2 on or before due date.
5. `P_split_part1_ontime_part2_late`: Customer divides invoice into 2 parts, pays Part 1 on time, and Part 2 late (after due date).
6. `P_split_part1_late_part2_ontime`: Customer divides invoice into 2 parts; Part 1 is delayed past first installment milestone, while Part 2 is paid on time before final settlement deadline.

### Step 2: Divided-Invoice Penalty Scoring Formula
A customer who divides an invoice into 2 parts creates extra tracking work and splits cash inflow. Even if both parts are paid on time, a divided-invoice payer receives a lower weight (0.88 instead of 1.00) plus a split-frequency penalty:

$$\text{Base\_Score} = 100 \times \Big( 1.00 \times (P_{\text{single\_early}} + P_{\text{single\_ontime}}) + 0.88 \times P_{\text{split\_both\_ontime}} + 0.65 \times P_{\text{split\_p1\_late\_p2\_on}} + 0.50 \times P_{\text{split\_p1\_on\_p2\_late}} + 0.00 \times P_{\text{single\_late}} \Big)$$

$$\text{Invoice\_Split\_Penalty} = 5 \times \text{Historical\_Invoice\_Split\_Rate}$$

$$\text{Customer\_Score} = \text{round}(\text{Base\_Score} - \text{Invoice\_Split\_Penalty})$$

### Step 3: Multi-Output XGBoost Regressor
Predicts the exact numeric split percentages and arrival days from today:
- `part1_invoice_ratio`: Percentage paid in Part 1 (Part 2 percentage = $1.00 - \text{part1\_invoice\_ratio}$, or 0.00 if single).
- `part1_days_from_today`: Days from today Part 1 of the invoice will be paid.
- `part2_days_from_today`: Days from today Part 2 of the invoice will be paid (0 if single).

### Step 4: Dynamic Scenario Text Generator
Translates numeric predictions into natural, executive-ready explanation text:
> *"This customer's score is 87. They will likely divide this $10,000 invoice into 2 parts: Part 1 ($5,000) will be paid this week (On-Time), and Part 2 ($5,000) will be paid in 2 weeks (On-Time)."*

### Step 5: Cash Flow Aggregation & Projection Engine
Aggregates predicted installment amounts into corporate treasury liquidity horizons:
- `this_week_cashflow`: Payments due in days 0–7
- `next_week_cashflow`: Payments due in days 8–14
- `in_2_weeks_cashflow`: Payments due in days 15–21
- `in_3_weeks_cashflow`: Payments due in days 22–28
- `monthly_cashflow`: Payments due in days 0–30
- `yearly_cashflow`: Cumulative 12-month projected liquidity
