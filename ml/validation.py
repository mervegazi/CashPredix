#!/usr/bin/env python3
"""
CashPredix - 5-Step Hybrid Architecture Validation & Evaluation Suite
Validates:
- Step 1: LightGBM Multi-Class Classifier (6 Classes)
- Step 2: Divided-Invoice Penalty Scoring Formula (0-100)
- Step 3: Multi-Output XGBoost Regressor (Ratio, Day 1, Day 2)
- Step 4: Dynamic Scenario Text Generator (Syntax & Formatting)
- Step 5: Cash Flow Aggregation & Projection Engine (Weekly, Monthly, Yearly)
"""

import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import pandas as pd
from ml.step1_payment_classifier import train_step1_model, PAYMENT_CLASSES
from ml.step2_penalty_scoring import calculate_customer_score
from ml.step3_xgb_split_regressor import train_step3_model
from ml.step4_scenario_generator import generate_scenario_text
from ml.step5_cashflow_aggregator import aggregate_cash_flow
from ml.hybrid_pipeline import CashPredixHybridPipeline

logger = logging.getLogger("CashPredix.Validation")


def run_hybrid_pipeline_validation() -> Dict[str, Any]:
    """Execute complete validation suite across all 5 steps."""
    logger.info("Validating Step 1: LightGBM Multi-Class Classifier...")
    clf, step1_metrics = train_step1_model()

    logger.info("Validating Step 3: Multi-Output XGBoost Regressor...")
    reg, step3_metrics = train_step3_model()

    pipeline = CashPredixHybridPipeline(step1_model=clf, step3_model=reg)
    csv_path = BASE_DIR / "data" / "synthetic" / "payment_history.csv"
    df = pd.read_csv(csv_path)

    # Validate across customer profiles for Step 2
    from ml.step1_payment_classifier import extract_customer_history
    cust_profiles = extract_customer_history(df)
    pipeline.cust_profiles = cust_profiles

    scores = []
    tiers = {}
    for cid, prof in list(cust_profiles.items()):
        probs = clf.predict_probabilities(10000.0, cid, prof)
        s_res = calculate_customer_score(probs, prof.get("historical_split_rate", 0.0))
        sc = s_res["customer_score"]
        scores.append(sc)
        tiers[s_res["tier"]] = tiers.get(s_res["tier"], 0) + 1

    df_scores = pd.Series(scores)
    step2_metrics = {
        "total_customers_scored": len(scores),
        "mean_score": round(float(df_scores.mean()), 1),
        "median_score": round(float(df_scores.median()), 1),
        "min_score": int(df_scores.min()),
        "max_score": int(df_scores.max()),
        "tier_distribution": tiers
    }

    # Step 4: Scenario test
    sample_cid = list(cust_profiles.keys())[0]
    sample_res = pipeline.predict_invoice(sample_cid, invoice_amount=10000.0, days_until_due=30)
    sample_text = sample_res["step4_scenario_text"]

    # Step 5: Cashflow test across top 20 active invoices
    batch_invs = []
    for inv, g in list(df.groupby("invoice_number"))[:20]:
        batch_invs.append({
            "customer_id": str(g["customer_id"].iloc[0]),
            "invoice_amount": float(g["invoice_amount"].iloc[0]),
            "days_until_due": 30,
            "invoice_number": inv
        })
    portfolio_res = pipeline.predict_portfolio_cashflow(batch_invs)
    step5_totals = portfolio_res["step5_cashflow_totals"]

    report = {
        "architecture": "5-Step Hybrid Architecture (2 ML Models + 3 Custom Algorithms)",
        "step1_lightgbm_classifier": {
            "test_accuracy": step1_metrics["test_accuracy"],
            "total_invoices_trained": step1_metrics["total_invoices"],
            "classes": PAYMENT_CLASSES
        },
        "step2_penalty_scoring": step2_metrics,
        "step3_xgboost_regressor": step3_metrics,
        "step4_scenario_generator_sample": sample_text,
        "step5_cashflow_totals_sample": step5_totals
    }

    out_file = BASE_DIR / "data" / "synthetic" / "ml_model_validation_report.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logger.info("Validation report exported to %s", out_file)
    return report


if __name__ == "__main__":
    rep = run_hybrid_pipeline_validation()
    print("\n" + "=" * 70)
    print(" 5-STEP HYBRID ARCHITECTURE VALIDATION REPORT")
    print("=" * 70)
    print(f" Step 1: LightGBM Multi-Class Test Accuracy: {rep['step1_lightgbm_classifier']['test_accuracy'] * 100:.2f}%")
    print(f" Step 2: Mean Customer Score (0-100):         {rep['step2_penalty_scoring']['mean_score']} / 100")
    print(f" Step 3: XGBoost Ratio & Days Prediction:     MAE: {rep['step3_xgboost_regressor']['part1_invoice_ratio']['test_mae']}")
    print(f" Step 4: Dynamic Scenario Generator Sample:   {rep['step4_scenario_generator_sample']}")
    print(f" Step 5: Cash Flow Projection Sample:         {rep['step5_cashflow_totals_sample']}")
    print("=" * 70)
