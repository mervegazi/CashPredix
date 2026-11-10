#!/usr/bin/env python3
"""
CashPredix - 5-Step Hybrid Machine Learning & Cash Flow Pipeline
Complete End-to-End Orchestrator

2 Machine Learning Models + 3 Custom Algorithms:
- Step 1: LightGBM Multi-Class Classifier (6 Classes)
- Step 2: Custom Algorithm: Divided-Invoice Penalty Scoring Formula (0-100)
- Step 3: Multi-Output XGBoost Regressor (Ratio, Day 1, Day 2)
- Step 4: Custom Algorithm: Dynamic Scenario Text Generator
- Step 5: Custom Algorithm: Cash Flow Aggregation & Projection Engine
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import pandas as pd
from ml.step1_payment_classifier import (
    LightGBMPaymentClassifier,
    train_step1_model,
    extract_customer_history,
    PAYMENT_CLASSES
)
from ml.step2_penalty_scoring import calculate_customer_score
from ml.step3_xgb_split_regressor import (
    XGBoostSplitRegressor,
    train_step3_model
)
from ml.step4_scenario_generator import generate_scenario_text
from ml.step5_cashflow_aggregator import aggregate_cash_flow
from ml.step6_risk_action_optimizer import evaluate_counterparty_risk_and_action

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CashPredix.HybridPipeline")

MODEL_DIR = BASE_DIR / "ml" / "models"


class CashPredixHybridPipeline:
    """Master orchestrator for the 5-Step Hybrid Architecture."""

    def __init__(self, step1_model: Optional[LightGBMPaymentClassifier] = None, step3_model: Optional[XGBoostSplitRegressor] = None):
        self.step1_model = step1_model
        self.step3_model = step3_model
        self.cust_profiles = {}

    def initialize_models(self, force_retrain: bool = False):
        """Load trained models or train them if not already saved."""
        step1_path = MODEL_DIR / "lightgbm_payment_classifier.joblib"
        step3_path = MODEL_DIR / "xgboost_split_regressor.joblib"

        if not force_retrain and step1_path.exists():
            logger.info("Loading Step 1 LightGBM classifier from %s", step1_path)
            self.step1_model = LightGBMPaymentClassifier.load(step1_path)
        else:
            logger.info("Training Step 1 LightGBM classifier...")
            self.step1_model, _ = train_step1_model()

        if not force_retrain and step3_path.exists():
            logger.info("Loading Step 3 XGBoost regressor from %s", step3_path)
            self.step3_model = XGBoostSplitRegressor.load(step3_path)
        else:
            logger.info("Training Step 3 XGBoost regressor...")
            self.step3_model, _ = train_step3_model()

        # Cache customer profiles
        csv_path = BASE_DIR / "data" / "synthetic" / "payment_history.csv"
        if csv_path.exists():
            df_payments = pd.read_csv(csv_path)
            self.cust_profiles = extract_customer_history(df_payments)

    def predict_invoice(
        self,
        customer_id: str,
        invoice_amount: float,
        days_until_due: int = 30,
        invoice_number: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute Steps 1 through 4 for an individual customer invoice.

        Returns:
            Dictionary matching the Data Flow Table in PDF Pages 3 & 4.
        """
        if self.step1_model is None or self.step3_model is None:
            self.initialize_models()

        cust_profile = self.cust_profiles.get(str(customer_id), {
            "historical_split_rate": 0.20,
            "avg_past_delay": 0.0,
            "median_past_delay": 0.0,
            "delay_std": 3.0,
            "cust_avg_amount": invoice_amount,
            "historical_part_gap": 14.0
        })

        # -------------------------------------------------------------
        # STEP 1: LightGBM Multi-Class Classifier (6 Classes)
        # -------------------------------------------------------------
        probabilities = self.step1_model.predict_probabilities(
            invoice_amount=invoice_amount,
            customer_id=str(customer_id),
            cust_profile=cust_profile
        )

        # Determine most likely class
        predicted_class = max(probabilities, key=probabilities.get)
        is_split = "split" in predicted_class

        # -------------------------------------------------------------
        # STEP 2: Divided-Invoice Penalty Scoring Formula (0-100)
        # -------------------------------------------------------------
        score_data = calculate_customer_score(
            probabilities=probabilities,
            historical_invoice_split_rate=cust_profile.get("historical_split_rate", 0.0)
        )
        customer_score = score_data["customer_score"]

        # -------------------------------------------------------------
        # STEP 3: Multi-Output XGBoost Regressor (Ratio, Day 1, Day 2)
        # -------------------------------------------------------------
        schedule = self.step3_model.predict_schedule(
            customer_score=customer_score,
            invoice_amount=invoice_amount,
            days_until_due=days_until_due,
            historical_part_gap=cust_profile.get("historical_part_gap", 14.0),
            is_split=is_split
        )

        # -------------------------------------------------------------
        # STEP 4: Dynamic Scenario Text Generator
        # -------------------------------------------------------------
        scenario_text = generate_scenario_text(
            customer_score=customer_score,
            invoice_amount=invoice_amount,
            schedule_data=schedule,
            days_until_due=days_until_due
        )

        # -------------------------------------------------------------
        # STEP 6: Counterparty Risk Alert & Working Capital Optimizer
        # -------------------------------------------------------------
        risk_action = evaluate_counterparty_risk_and_action(
            customer_score=customer_score,
            predicted_class=predicted_class,
            invoice_amount=invoice_amount,
            schedule_data=schedule,
            probabilities=probabilities
        )

        return {
            "invoice_number": invoice_number,
            "customer_id": str(customer_id),
            "invoice_amount": float(invoice_amount),
            "days_until_due": int(days_until_due),
            "step1_probabilities": probabilities,
            "predicted_class": predicted_class,
            "is_divided_invoice": is_split,
            "step2_customer_score": customer_score,
            "step2_score_details": score_data,
            "step3_schedule": schedule,
            "step4_scenario_text": scenario_text,
            "step6_risk_action": risk_action
        }

    def predict_portfolio_cashflow(
        self,
        invoices: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Execute Steps 1 through 5 across an entire invoice portfolio.
        """
        predictions = []
        schedule_items = []

        for inv in invoices:
            pred = self.predict_invoice(
                customer_id=inv["customer_id"],
                invoice_amount=inv["invoice_amount"],
                days_until_due=inv.get("days_until_due", 30),
                invoice_number=inv.get("invoice_number")
            )
            predictions.append(pred)
            schedule_items.append(pred["step3_schedule"])

        # -------------------------------------------------------------
        # STEP 5: Cash Flow Aggregation & Projection Engine
        # -------------------------------------------------------------
        cash_flow_totals = aggregate_cash_flow(schedule_items)

        return {
            "total_invoices": len(invoices),
            "predictions": predictions,
            "step5_cashflow_totals": cash_flow_totals
        }


if __name__ == "__main__":
    pipeline = CashPredixHybridPipeline()
    pipeline.initialize_models(force_retrain=True)

    print("\n" + "=" * 70)
    print(" CASHPredix 5-STEP HYBRID ARCHITECTURE TEST RUN")
    print("=" * 70)

    # Test single invoice: $10,000 for customer
    test_cid = list(pipeline.cust_profiles.keys())[0] if pipeline.cust_profiles else "cust_001"
    single_res = pipeline.predict_invoice(
        customer_id=test_cid,
        invoice_amount=10000.0,
        days_until_due=30,
        invoice_number="INV-2026-DEMO"
    )

    print("\n--- STEP 1: 6 PAYMENT PROBABILITIES (LightGBM) ---")
    print(json.dumps(single_res["step1_probabilities"], indent=2))
    print(f" Predicted Class: {single_res['predicted_class']}")

    print("\n--- STEP 2: CUSTOMER RELIABILITY SCORE (0-100) ---")
    print(f" Customer Score: {single_res['step2_customer_score']} ({single_res['step2_score_details']['tier']})")
    print(f" Base Score:     {single_res['step2_score_details']['base_score']}")
    print(f" Split Penalty: -{single_res['step2_score_details']['invoice_split_penalty']}")

    print("\n--- STEP 3: SCHEDULE & PAYMENT DAYS (Multi-Output XGBoost) ---")
    print(json.dumps(single_res["step3_schedule"], indent=2))

    print("\n--- STEP 4: DYNAMIC SCENARIO TEXT SENTENCE ---")
    print(single_res["step4_scenario_text"])

    # Batch test for Step 5
    batch_invs = [
        {"customer_id": test_cid, "invoice_amount": 10000.0, "days_until_due": 30, "invoice_number": "INV-001"},
        {"customer_id": test_cid, "invoice_amount": 45000.0, "days_until_due": 14, "invoice_number": "INV-002"},
        {"customer_id": test_cid, "invoice_amount": 25000.0, "days_until_due": 60, "invoice_number": "INV-003"}
    ]
    portfolio_res = pipeline.predict_portfolio_cashflow(batch_invs)

    print("\n--- STEP 5: CASH FLOW AGGREGATION & PROJECTION ENGINE ---")
    print(json.dumps(portfolio_res["step5_cashflow_totals"], indent=2))
    print("=" * 70)
