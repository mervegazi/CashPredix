#!/usr/bin/env python3
"""
CashPredix - Step 4: Dynamic Scenario Text Generator
5-Step Hybrid Architecture: Step 4 (Custom Algorithm)

Converts numeric ML outputs and customer score into a written customer invoice payment scenario text.

Example Outputs:
- Divided Invoice:
  "This customer's score is 87. They will likely divide this $10,000 invoice into 2 parts:
   Part 1 ($5,000) will be paid this week (On-Time), and Part 2 ($5,000) will be paid in 2 weeks (On-Time)."
- Single Payment:
  "This customer's score is 98. They will likely pay this $10,000 invoice in a single payment:
   100% ($10,000) will be paid this week (On-Time)."
"""

from typing import Dict, Any


def format_days_to_calendar_week(days: int) -> str:
    """Format day offset into standard business week phrase."""
    if days <= 7:
        return "this week"
    elif days <= 14:
        return "next week"
    elif days <= 21:
        return "in 2 weeks"
    elif days <= 28:
        return "in 3 weeks"
    else:
        return f"in {days // 7} weeks"


def generate_scenario_text(
    customer_score: int,
    invoice_amount: float,
    schedule_data: Dict[str, Any],
    days_until_due: int = 30
) -> str:
    """
    Generate human-readable customer scenario prediction sentence matching the PDF standard.

    Args:
        customer_score: Integer (0-100) from Step 2
        invoice_amount: Float total invoice dollar amount
        schedule_data: Dictionary from Step 3 containing:
            - is_divided_invoice: bool
            - part1_amount: float
            - part2_amount: float
            - part1_days_from_today: int
            - part2_days_from_today: int
        days_until_due: Integer days until invoice due date

    Returns:
        1 text string explaining customer score, division, and payment timing.
    """
    amt_formatted = f"${int(round(invoice_amount)):,}" if invoice_amount == round(invoice_amount) else f"${invoice_amount:,.2f}"
    is_divided = schedule_data.get("is_divided_invoice", False)

    if is_divided:
        p1_amt = schedule_data.get("part1_amount", invoice_amount * 0.5)
        p2_amt = schedule_data.get("part2_amount", invoice_amount * 0.5)
        p1_days = schedule_data.get("part1_days_from_today", 3)
        p2_days = schedule_data.get("part2_days_from_today", 17)

        p1_str = f"${int(round(p1_amt)):,}" if p1_amt == round(p1_amt) else f"${p1_amt:,.2f}"
        p2_str = f"${int(round(p2_amt)):,}" if p2_amt == round(p2_amt) else f"${p2_amt:,.2f}"

        p1_week = format_days_to_calendar_week(p1_days)
        p2_week = format_days_to_calendar_week(p2_days)

        p1_status = "On-Time" if p1_days <= (days_until_due + 2) else "Late"
        p2_status = "On-Time" if p2_days <= (days_until_due + 2) else "Late"

        sentence = (
            f"This customer's score is {customer_score}. They will likely divide this {amt_formatted} "
            f"invoice into 2 parts: Part 1 ({p1_str}) will be paid {p1_week} ({p1_status}), "
            f"and Part 2 ({p2_str}) will be paid {p2_week} ({p2_status})."
        )
    else:
        p1_days = schedule_data.get("part1_days_from_today", 5)
        p1_week = format_days_to_calendar_week(p1_days)
        p1_status = "On-Time" if p1_days <= (days_until_due + 2) else "Late"

        sentence = (
            f"This customer's score is {customer_score}. They will likely pay this {amt_formatted} "
            f"invoice in a single payment: 100% ({amt_formatted}) will be paid {p1_week} ({p1_status})."
        )

    return sentence


if __name__ == "__main__":
    # Test case matching Page 4 of PDF exactly
    mock_schedule = {
        "is_divided_invoice": True,
        "part1_amount": 5000.0,
        "part2_amount": 5000.0,
        "part1_days_from_today": 3,
        "part2_days_from_today": 17
    }

    text = generate_scenario_text(
        customer_score=87,
        invoice_amount=10000.0,
        schedule_data=mock_schedule,
        days_until_due=30
    )
    print("\n" + "=" * 65)
    print(" STEP 4: DYNAMIC SCENARIO TEXT GENERATOR")
    print("=" * 65)
    print(text)
    print("=" * 65)
