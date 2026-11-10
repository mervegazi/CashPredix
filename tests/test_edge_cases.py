#!/usr/bin/env python3
"""
CashPredix - Week 6 Edge Cases & Single vs. Split Invoices Test Suite (Task #26)
Validates:
1. Cold-start customer handling (unseen counterparty fallback priors).
2. Clean zero suppression for single payment invoices (part2 = 0, ratio = 1.0).
3. Split invoice constraints (part1 + part2 ratio == 1.0, part2_days >= part1_days + 1).
4. Extreme monetary values ($10.00 to $5,000,000.00).
5. Overdue and zero days until due.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from ml.hybrid_pipeline import CashPredixHybridPipeline

pipeline = CashPredixHybridPipeline()
pipeline.initialize_models()


def test_cold_start_unseen_customer():
    """Verify unseen counterparties receive calibrated Bayesian priors without crashing."""
    res = pipeline.predict_invoice(
        customer_id="unseen_cold_start_enterprise_corp",
        invoice_amount=50000.0,
        days_until_due=30,
        invoice_number="INV-COLD-01"
    )

    assert "step1_probabilities" in res
    assert 0 <= res["step2_customer_score"] <= 100
    assert "divided_invoice_penalty_score" in res["step2_score_details"] or "customer_score" in res["step2_score_details"]
    assert res["step3_schedule"]["part1_amount"] > 0
    assert len(res["step4_scenario_text"]) > 0
    print("✓ test_cold_start_unseen_customer passed")


def test_single_payment_zero_suppression():
    """Verify single payment prediction completely suppresses part 2."""
    # Force single payment evaluation via step3
    schedule = pipeline.step3_model.predict_schedule(
        customer_score=92,
        invoice_amount=12500.0,
        days_until_due=20,
        is_split=False
    )

    assert schedule["is_divided_invoice"] is False
    assert schedule["part1_invoice_ratio"] == 1.00
    assert schedule["part2_invoice_ratio"] == 0.00
    assert schedule["part1_amount"] == 12500.0
    assert schedule["part2_amount"] == 0.00
    assert schedule["part2_days_from_today"] == 0
    print("✓ test_single_payment_zero_suppression passed")


def test_split_invoice_bounds():
    """Verify split invoice ratios sum strictly to 1.0 and part2 days are strictly later than part1."""
    schedule = pipeline.step3_model.predict_schedule(
        customer_score=68,
        invoice_amount=40000.0,
        days_until_due=30,
        is_split=True
    )

    assert schedule["is_divided_invoice"] is True
    assert round(schedule["part1_invoice_ratio"] + schedule["part2_invoice_ratio"], 2) == 1.00
    assert round(schedule["part1_amount"] + schedule["part2_amount"], 2) == 40000.0
    assert schedule["part2_days_from_today"] > schedule["part1_days_from_today"]
    print("✓ test_split_invoice_bounds passed")


def test_extreme_amounts():
    """Verify micro-invoice ($15) and mega-invoice ($2.5M) stability."""
    # Micro invoice
    res_micro = pipeline.predict_invoice(
        customer_id="cust_001",
        invoice_amount=15.0,
        days_until_due=15
    )
    assert res_micro["invoice_amount"] == 15.0
    assert 0 <= res_micro["step2_customer_score"] <= 100

    # Mega invoice
    res_mega = pipeline.predict_invoice(
        customer_id="cust_001",
        invoice_amount=2_500_000.0,
        days_until_due=60
    )
    assert res_mega["invoice_amount"] == 2_500_000.0
    assert 0 <= res_mega["step2_customer_score"] <= 100
    print("✓ test_extreme_amounts passed")


def test_overdue_due_days():
    """Verify handling of already overdue invoices (days_until_due <= 0)."""
    res_overdue = pipeline.predict_invoice(
        customer_id="cust_001",
        invoice_amount=18000.0,
        days_until_due=-5
    )
    assert res_overdue["days_until_due"] == -5
    assert res_overdue["step3_schedule"]["part1_days_from_today"] >= 1
    print("✓ test_overdue_due_days passed")


if __name__ == "__main__":
    print("\nRunning CashPredix Week 6 Edge Cases Test Suite...")
    test_cold_start_unseen_customer()
    test_single_payment_zero_suppression()
    test_split_invoice_bounds()
    test_extreme_amounts()
    test_overdue_due_days()
    print("\nAll 5 Edge Case tests PASSED successfully!\n")
