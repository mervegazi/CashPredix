#!/usr/bin/env python3
"""
CashPredix - Step 5: Cash Flow Aggregation & Projection Engine
5-Step Hybrid Architecture: Step 5 (Custom Algorithm)

Calculates total weekly, monthly, and yearly company cash flow
from all predicted customer invoice payments.

Output Format (from Plan):
{
  "this_week_cashflow": 45700.00,
  "next_week_cashflow": 73600.00,
  "in_2_weeks_cashflow": 45100.00,
  "in_3_weeks_cashflow": 55800.00,
  "monthly_cashflow": 220200.00,
  "yearly_cashflow": 2750000.00
}
"""

from typing import List, Dict, Any


def aggregate_cash_flow(predicted_invoice_schedules: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Sum predicted payments into weekly, monthly, and yearly cash flow buckets.

    Args:
        predicted_invoice_schedules: List of dictionaries, each containing:
            - part1_amount: float
            - part1_days_from_today: int
            - part2_amount: float (optional, 0.0 if single)
            - part2_days_from_today: int (optional, 0 if single)

    Returns:
        JSON object with currency totals grouped by Week, Month, and Year.
    """
    this_week = 0.0
    next_week = 0.0
    in_2_weeks = 0.0
    in_3_weeks = 0.0
    monthly = 0.0
    yearly = 0.0

    for sched in predicted_invoice_schedules:
        # Part 1
        p1_amt = float(sched.get("part1_amount", 0.0))
        p1_days = int(sched.get("part1_days_from_today", 0))

        if p1_amt > 0 and p1_days >= 0:
            if p1_days <= 7:
                this_week += p1_amt
            elif p1_days <= 14:
                next_week += p1_amt
            elif p1_days <= 21:
                in_2_weeks += p1_amt
            elif p1_days <= 28:
                in_3_weeks += p1_amt

            if p1_days <= 30:
                monthly += p1_amt
            if p1_days <= 365:
                yearly += p1_amt

        # Part 2
        p2_amt = float(sched.get("part2_amount", 0.0))
        p2_days = int(sched.get("part2_days_from_today", 0))

        if p2_amt > 0 and p2_days > 0:
            if p2_days <= 7:
                this_week += p2_amt
            elif p2_days <= 14:
                next_week += p2_amt
            elif p2_days <= 21:
                in_2_weeks += p2_amt
            elif p2_days <= 28:
                in_3_weeks += p2_amt

            if p2_days <= 30:
                monthly += p2_amt
            if p2_days <= 365:
                yearly += p2_amt

    # If yearly cash flow is 0 (e.g. mock short horizon), extrapolate or keep accurate
    if yearly < monthly:
        yearly = monthly

    return {
        "this_week_cashflow": round(this_week, 2),
        "next_week_cashflow": round(next_week, 2),
        "in_2_weeks_cashflow": round(in_2_weeks, 2),
        "in_3_weeks_cashflow": round(in_3_weeks, 2),
        "monthly_cashflow": round(monthly, 2),
        "yearly_cashflow": round(yearly, 2)
    }


if __name__ == "__main__":
    import json

    # Test with sample items
    mock_items = [
        {"part1_amount": 5000.0, "part1_days_from_today": 3, "part2_amount": 5000.0, "part2_days_from_today": 17},
        {"part1_amount": 12000.0, "part1_days_from_today": 10, "part2_amount": 0.0, "part2_days_from_today": 0},
        {"part1_amount": 8000.0, "part1_days_from_today": 24, "part2_amount": 8000.0, "part2_days_from_today": 45}
    ]

    totals = aggregate_cash_flow(mock_items)
    print("\n" + "=" * 65)
    print(" STEP 5: CASH FLOW AGGREGATION & PROJECTION ENGINE")
    print("=" * 65)
    print(json.dumps(totals, indent=2))
    print("=" * 65)
