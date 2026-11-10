#!/usr/bin/env python3
"""
CashPredix - Week 6 ML Pipeline FastAPI Backend
Serves the 5-Step Hybrid Machine Learning Architecture:
- Step 1: LightGBM Multi-Class Classifier (6 Classes)
- Step 2: Divided-Invoice Penalty Scoring Formula (0-100)
- Step 3: Multi-Output XGBoost Regressor (Ratio, Day 1, Day 2)
- Step 4: Dynamic Scenario Text Generator
- Step 5: Cash Flow Aggregation & Projection Engine
"""

import os
import sys
import json
import logging
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import pandas as pd
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ml.hybrid_pipeline import CashPredixHybridPipeline
from ml.step2_penalty_scoring import calculate_customer_score
from ml.step5_cashflow_aggregator import aggregate_cash_flow

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CashPredix.API")

app = FastAPI(
    title="CashPredix 5-Step Hybrid ML API",
    description="Machine Learning & Cash Flow Prediction Engine for Enterprise Counterparties",
    version="1.0.0",
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pipeline Singleton
pipeline = CashPredixHybridPipeline()
try:
    pipeline.initialize_models(force_retrain=False)
except Exception as _e:
    logger.warning("Eager model loading deferred: %s", _e)


@app.on_event("startup")
def startup_event():
    """Ensure ML models are loaded on server startup."""
    if pipeline.step1_model is None or pipeline.step3_model is None:
        logger.info("Initializing 5-Step Hybrid Machine Learning Pipeline on startup...")
        pipeline.initialize_models(force_retrain=False)
    logger.info("CashPredix API initialized successfully.")


# ---------------------------------------------------------------------------
# Request & Response Models (Pydantic)
# ---------------------------------------------------------------------------
class InvoicePredictionRequest(BaseModel):
    customer_id: str = Field(..., description="Unique customer ID (e.g. cust_001 or UUID)")
    invoice_amount: float = Field(..., gt=0, description="Gross invoice amount in USD")
    days_until_due: Optional[int] = Field(30, description="Days from today until invoice due date")
    invoice_number: Optional[str] = Field(None, description="Optional invoice reference number")
    issue_date: Optional[str] = Field(None, description="Invoice issue date (YYYY-MM-DD)")
    due_date: Optional[str] = Field(None, description="Invoice maturity due date (YYYY-MM-DD)")


class Step1Probabilities(BaseModel):
    P_single_early: float
    P_single_ontime: float
    P_single_late: float
    P_split_both_ontime: float
    P_split_part1_ontime_part2_late: float
    P_split_part1_late_part2_ontime: float


class Step2ScoreDetails(BaseModel):
    base_score: float
    invoice_split_penalty: float
    historical_split_rate: float
    customer_score: int
    tier: str


class Step3Schedule(BaseModel):
    is_divided_invoice: bool
    part1_invoice_ratio: float
    part1_amount: float
    part1_days_from_today: int
    part2_invoice_ratio: float
    part2_amount: float
    part2_days_from_today: int
    part1_week_status: Optional[str] = None
    part2_week_status: Optional[str] = None


class InvoicePredictionResponse(BaseModel):
    status: str
    customer_id: str
    invoice_number: Optional[str]
    invoice_amount: float
    days_until_due: int
    is_cold_start: bool
    step1_probabilities: Step1Probabilities
    predicted_class: str
    is_divided_invoice: bool
    step2_customer_score: int
    step2_score_details: Step2ScoreDetails
    step3_schedule: Step3Schedule
    step4_scenario_text: str
    predicted_installments: List[Dict[str, Any]]


class PortfolioCashflowResponse(BaseModel):
    status: str
    generated_at: str
    total_invoices: int
    summary: Dict[str, float]
    weekly_breakdown: List[Dict[str, Any]]


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health_check():
    """Health check endpoint confirming ML models are loaded."""
    return {
        "status": "healthy",
        "service": "CashPredix 5-Step ML Architecture",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "models_loaded": {
            "step1_lightgbm_classifier": pipeline.step1_model is not None,
            "step3_xgboost_regressor": pipeline.step3_model is not None,
            "cached_customer_profiles": len(pipeline.cust_profiles)
        }
    }


@app.post("/api/predict/invoice", response_model=InvoicePredictionResponse)
def predict_invoice(payload: InvoicePredictionRequest):
    """
    Run Steps 1 through 4 of the Hybrid ML Architecture for an invoice.
    Handles cold-start priors and clean single-payment zero suppression.
    """
    try:
        # Check cold-start customer
        cid = str(payload.customer_id)
        is_cold_start = cid not in pipeline.cust_profiles

        # Run pipeline prediction
        res = pipeline.predict_invoice(
            customer_id=cid,
            invoice_amount=payload.invoice_amount,
            days_until_due=payload.days_until_due or 30,
            invoice_number=payload.invoice_number
        )

        schedule = res["step3_schedule"]
        today = date.today()

        is_split = schedule.get("is_divided_invoice", False)
        ratio1 = schedule.get("part1_invoice_ratio", 1.0)
        amt1 = schedule.get("part1_amount", payload.invoice_amount)
        days1 = schedule.get("part1_days_from_today", 30)

        # Build installment breakdown with calendar dates
        installments = [
            {
                "installment_number": 1,
                "ratio": ratio1,
                "amount": amt1,
                "days_from_today": days1,
                "estimated_payment_date": (today + timedelta(days=days1)).isoformat()
            }
        ]

        ratio2 = schedule.get("part2_invoice_ratio", 0.0)
        amt2 = schedule.get("part2_amount", 0.0)
        days2 = schedule.get("part2_days_from_today", 0)

        if is_split and amt2 > 0:
            installments.append({
                "installment_number": 2,
                "ratio": ratio2,
                "amount": amt2,
                "days_from_today": days2,
                "estimated_payment_date": (today + timedelta(days=days2)).isoformat()
            })

        return InvoicePredictionResponse(
            status="success",
            customer_id=res["customer_id"],
            invoice_number=res.get("invoice_number"),
            invoice_amount=res["invoice_amount"],
            days_until_due=res["days_until_due"],
            is_cold_start=is_cold_start,
            step1_probabilities=Step1Probabilities(**res["step1_probabilities"]),
            predicted_class=res["predicted_class"],
            is_divided_invoice=res["is_divided_invoice"],
            step2_customer_score=res["step2_customer_score"],
            step2_score_details=Step2ScoreDetails(**res["step2_score_details"]),
            step3_schedule=Step3Schedule(**schedule),
            step4_scenario_text=res["step4_scenario_text"],
            predicted_installments=installments
        )
    except Exception as e:
        logger.exception("Error executing invoice prediction: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )


@app.get("/api/cashflow/projection", response_model=PortfolioCashflowResponse)
def get_cashflow_projection(
    include_demo_data: bool = Query(True, description="Include active portfolio invoices if database empty")
):
    """
    Step 5: Cash Flow Aggregation & Projection Engine across active open invoices.
    Returns weekly, monthly, and yearly cash flow totals.
    """
    try:
        active_invoices = []

        # Load active open invoices from synthetic payments or local seed data
        payments_path = BASE_DIR / "data" / "synthetic" / "payment_history.csv"
        if payments_path.exists():
            df_pay = pd.read_csv(payments_path)
            # Sample realistic open pending invoices
            sampled_df = df_pay.sample(n=min(50, len(df_pay)), random_state=42)
            for _, row in sampled_df.iterrows():
                active_invoices.append({
                    "customer_id": str(row.get("customer_id", "cust_001")),
                    "invoice_amount": float(row.get("amount", 5000.0)),
                    "days_until_due": max(1, int(row.get("payment_term_days", 30))),
                    "invoice_number": str(row.get("invoice_id", "INV-2026-X"))
                })
        elif include_demo_data:
            # Fallback realistic portfolio
            base_amounts = [2500.0, 8400.0, 15000.0, 32000.0, 48000.0, 12000.0, 6500.0]
            for i, amt in enumerate(base_amounts):
                active_invoices.append({
                    "customer_id": f"cust_{i+1:03d}",
                    "invoice_amount": amt,
                    "days_until_due": (i + 1) * 6,
                    "invoice_number": f"INV-2026-00{i+1}"
                })

        # Run portfolio cash flow aggregation
        portfolio_res = pipeline.predict_portfolio_cashflow(active_invoices)
        step5_totals = portfolio_res["step5_cashflow_totals"]

        # Build detailed weekly bucket breakdown
        weekly_breakdown = [
            {"week": "This Week (Days 0-7)", "range_days": [0, 7], "projected_amount": step5_totals.get("this_week_cashflow", 0.0)},
            {"week": "Next Week (Days 8-14)", "range_days": [8, 14], "projected_amount": step5_totals.get("next_week_cashflow", 0.0)},
            {"week": "In 2 Weeks (Days 15-21)", "range_days": [15, 21], "projected_amount": step5_totals.get("in_2_weeks_cashflow", 0.0)},
            {"week": "In 3 Weeks (Days 22-28)", "range_days": [22, 28], "projected_amount": step5_totals.get("in_3_weeks_cashflow", 0.0)},
            {"week": "Month Total (Days 0-30)", "range_days": [0, 30], "projected_amount": step5_totals.get("monthly_cashflow", 0.0)},
            {"week": "Full Year Total", "range_days": [0, 365], "projected_amount": step5_totals.get("yearly_cashflow", 0.0)}
        ]

        return PortfolioCashflowResponse(
            status="success",
            generated_at=datetime.utcnow().isoformat() + "Z",
            total_invoices=len(active_invoices),
            summary=step5_totals,
            weekly_breakdown=weekly_breakdown
        )
    except Exception as e:
        logger.exception("Error projecting cashflow: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cashflow aggregation error: {str(e)}"
        )


@app.get("/api/customers/scores")
def get_customer_scores():
    """
    Return all customer behavioral penalty scores (0-100), split rates, and risk tiers.
    """
    scores_list = []
    for cid, profile in pipeline.cust_profiles.items():
        split_rate = profile.get("historical_split_rate", 0.0)
        avg_delay = profile.get("avg_past_delay", 0.0)

        # Baseline probability estimation for Step 2
        mock_probs = {
            "P_single_early": 0.15 if avg_delay < 0 else 0.05,
            "P_single_ontime": 0.65 if avg_delay <= 2 else 0.35,
            "P_single_late": 0.20 if avg_delay > 2 else 0.05,
            "P_split_both_ontime": 0.5 * split_rate,
            "P_split_part1_ontime_part2_late": 0.3 * split_rate,
            "P_split_part1_late_part2_ontime": 0.2 * split_rate,
        }
        total = sum(mock_probs.values())
        norm_probs = {k: v / total for k, v in mock_probs.items()}

        score_res = calculate_customer_score(norm_probs, split_rate)

        scores_list.append({
            "customer_id": cid,
            "divided_invoice_penalty_score": score_res["customer_score"],
            "base_score": score_res["base_score"],
            "invoice_split_penalty": score_res["invoice_split_penalty"],
            "historical_split_rate": round(split_rate, 4),
            "avg_past_delay_days": round(avg_delay, 2),
            "tier": score_res["tier"]
        })

    scores_list.sort(key=lambda x: x["divided_invoice_penalty_score"], reverse=True)

    return {
        "status": "success",
        "total_customers": len(scores_list),
        "customers": scores_list[:100]  # Return top 100
    }


@app.post("/api/sync/supabase")
def sync_scores_to_supabase():
    """
    Synchronize customer behavioral scores and split penalties to Supabase database.
    """
    try:
        from ml.data_pipeline import get_supabase_client
        supabase = get_supabase_client()
        if not supabase:
            return {
                "status": "offline_mode",
                "message": "Supabase credentials not configured or unreachable; scores preserved locally in pipeline."
            }

        synced_count = 0
        for cid, profile in pipeline.cust_profiles.items():
            split_rate = profile.get("historical_split_rate", 0.0)
            base_score = int(max(0, min(100, 85 - int(profile.get("avg_past_delay", 0) * 1.5))))
            penalty_score = int(max(0, min(100, base_score - 5 * split_rate)))

            # Attempt update in Supabase
            try:
                supabase.table("customers").update({
                    "behavior_score": penalty_score
                }).eq("id", cid).execute()
                synced_count += 1
            except Exception:
                continue

        return {
            "status": "success",
            "synced_customers": synced_count,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        logger.error("Supabase sync failed: %s", e)
        return {
            "status": "partial_success",
            "message": f"Local scores cached; database sync bypassed: {str(e)}"
        }


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting CashPredix 5-Step ML FastAPI server on http://127.0.0.1:8000...")
    uvicorn.run("server.app:app", host="127.0.0.1", port=8000, reload=True)
