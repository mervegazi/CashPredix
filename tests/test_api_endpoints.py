#!/usr/bin/env python3
"""
CashPredix - Week 6 ML API Endpoints Test Suite
Validates:
- GET /api/health
- POST /api/predict/invoice (Steps 1-4 output structure)
- GET /api/cashflow/projection (Step 5 aggregation output)
- GET /api/customers/scores (Step 2 counterparty scores)
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi.testclient import TestClient
from server.app import app, pipeline

client = TestClient(app)


def test_health_endpoint():
    """Verify health endpoint returns status healthy and models loaded."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "models_loaded" in data
    assert data["models_loaded"]["step1_lightgbm_classifier"] is True
    assert data["models_loaded"]["step3_xgboost_regressor"] is True
    print("✓ test_health_endpoint passed")


def test_predict_invoice_endpoint_single():
    """Verify single payment invoice prediction returns 5-step attributes."""
    payload = {
        "customer_id": "cust_001",
        "invoice_amount": 10000.0,
        "days_until_due": 30,
        "invoice_number": "INV-2026-TEST1"
    }
    response = client.post("/api/predict/invoice", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["customer_id"] == "cust_001"
    assert data["invoice_amount"] == 10000.0
    assert "step1_probabilities" in data
    probs = data["step1_probabilities"]
    assert len(probs) == 12
    assert abs(sum(probs.values()) - 1.0) < 1e-4

    # Step 2 verification
    assert 0 <= data["step2_customer_score"] <= 100
    assert "base_score" in data["step2_score_details"]

    # Step 3 verification
    schedule = data["step3_schedule"]
    assert "part1_invoice_ratio" in schedule
    assert "part1_amount" in schedule
    assert schedule["part1_amount"] > 0

    # Step 4 verification
    assert isinstance(data["step4_scenario_text"], str)
    assert len(data["step4_scenario_text"]) > 10

    # Step 6 verification
    assert "step6_risk_action" in data
    risk_action = data["step6_risk_action"]
    assert "action_flag" in risk_action
    assert "estimated_working_capital_carry_cost" in risk_action

    # Installment breakdown verification
    assert len(data["predicted_installments"]) >= 1
    print("✓ test_predict_invoice_endpoint_single passed")


def test_predict_invoice_cold_start():
    """Verify cold start customer triggers graceful fallback priors."""
    payload = {
        "customer_id": "brand_new_unseen_customer_9999",
        "invoice_amount": 25000.0,
        "days_until_due": 45,
        "invoice_number": "INV-COLD-START"
    }
    response = client.post("/api/predict/invoice", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["is_cold_start"] is True
    assert 0 <= data["step2_customer_score"] <= 100
    assert len(data["step4_scenario_text"]) > 0
    print("✓ test_predict_invoice_cold_start passed")


def test_cashflow_projection_endpoint():
    """Verify Step 5 cash flow projection returns weekly/monthly/yearly horizons."""
    response = client.get("/api/cashflow/projection")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["total_invoices"] > 0
    summary = data["summary"]

    # All required PDF fields must exist
    required_keys = [
        "this_week_cashflow",
        "next_week_cashflow",
        "in_2_weeks_cashflow",
        "in_3_weeks_cashflow",
        "monthly_cashflow",
        "yearly_cashflow"
    ]
    for key in required_keys:
        assert key in summary
        assert summary[key] >= 0.0

    assert len(data["weekly_breakdown"]) >= 5
    print("✓ test_cashflow_projection_endpoint passed")


def test_customer_scores_endpoint():
    """Verify customer scores endpoint lists counterparty reliability and split rates."""
    response = client.get("/api/customers/scores")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert "customers" in data
    assert len(data["customers"]) > 0

    first_cust = data["customers"][0]
    assert "divided_invoice_penalty_score" in first_cust
    assert "historical_split_rate" in first_cust
    assert "tier" in first_cust
    print("✓ test_customer_scores_endpoint passed")


if __name__ == "__main__":
    print("\nRunning CashPredix Week 6 API Test Suite...")
    test_health_endpoint()
    test_predict_invoice_endpoint_single()
    test_predict_invoice_cold_start()
    test_cashflow_projection_endpoint()
    test_customer_scores_endpoint()
    print("\nAll 5 API tests PASSED successfully!\n")
