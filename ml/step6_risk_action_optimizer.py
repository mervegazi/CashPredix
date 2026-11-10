#!/usr/bin/env python3
"""
CashPredix - Step 6: Counterparty Risk Alert & Working Capital Optimizer
6-Step Hybrid Architecture: Step 6 (Custom Algorithm)

Transforms the probabilistic predictions (Steps 1-3) and cash flow projections (Step 5)
into actionable B2B corporate credit recommendations:
- Detects split installment delay drag (Part 1 vs Part 2 timing friction)
- Generates proactive credit control alerts (Upfront retainers, factoring triggers, terms adjustment)
- Calculates working capital carry cost at 8% cost of capital
"""

from typing import Dict, Any, Optional, List


def evaluate_counterparty_risk_and_action(
    customer_score: int,
    predicted_class: str,
    invoice_amount: float,
    schedule_data: Dict[str, Any],
    probabilities: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Execute Step 6: Risk Alert & Working Capital Optimization.

    Args:
        customer_score: Integer (0-100) from Step 2
        predicted_class: Predicted class from Step 1 (12 classes)
        invoice_amount: Total gross invoice amount in USD
        schedule_data: Schedule dictionary from Step 3
        probabilities: Full probability distribution from Step 1

    Returns:
        Dictionary containing risk level, action recommendation, and working capital impact.
    """
    is_split = schedule_data.get("is_divided_invoice", False)
    p1_days = schedule_data.get("part1_days_from_today", 30)
    p2_days = schedule_data.get("part2_days_from_today", 0)
    p2_amt = schedule_data.get("part2_amount", 0.0)

    # Calculate weighted delay from base terms (assuming 30d baseline)
    base_due_days = 30
    weighted_delay = (
        (p1_days - base_due_days) if not is_split
        else (((p1_days - 14) + (p2_days - base_due_days)) / 2.0)
    )

    # Cost of carry: 8% annual cost of working capital
    annual_cost_rate = 0.08
    carry_cost = max(0.0, round(float(invoice_amount * annual_cost_rate * (max(0, weighted_delay) / 365.0)), 2))

    # Evaluate specific risk categories based on all timing combinations
    if predicted_class in ["P_split_both_late", "P_single_late"] or customer_score < 55:
        risk_level = "High / Critical Default Risk"
        action_flag = "UPFRONT_RETAINER_REQUIRED"
        color_code = "rose"
        recommendation = (
            f"High Default Friction: Counterparty has high probability of delayed settlement on all installments. "
            f"Enforce 50% upfront retainer prior to delivery and shorten balance terms to Net 7 or Due on Receipt."
        )
        mitigation_strategy = "Require deposit or collateral; halt discretionary credit line expansion."

    elif predicted_class in ["P_split_part1_ontime_part2_late", "P_split_part1_early_part2_late"]:
        risk_level = "Divided Installment Drag"
        action_flag = "FACTORING_ALERT"
        color_code = "amber"
        recommendation = (
            f"Installment Delay Drag: Part 1 is paid reliably, but Part 2 (${p2_amt:,.2f}) faces late collection friction ({p2_days} days). "
            f"Recommend securing Part 2 with a post-dated promissory check or utilizing invoice factoring at a 2.5% fee to accelerate liquidity."
        )
        mitigation_strategy = "Proactive Day 15 milestone check; offer small early settlement concession for Part 2."

    elif predicted_class in ["P_split_part1_late_part2_early", "P_split_part1_late_part2_ontime"]:
        risk_level = "Initial Milestone Delay"
        action_flag = "PROACTIVE_REMINDER"
        color_code = "amber"
        recommendation = (
            f"Milestone Friction: Part 1 is likely delayed, though final settlement completes on-time. "
            f"Automate automated SMS/Email ledger reminder on Day 7 to keep counterparty on schedule."
        )
        mitigation_strategy = "Issue automated milestone reminder; confirm bank transfer clearance early."

    elif predicted_class in ["P_split_both_early", "P_split_part1_early_part2_ontime"]:
        risk_level = "Minimal / Accelerated Liquidity"
        action_flag = "CREDIT_EXPANSION_ELIGIBLE"
        color_code = "emerald"
        recommendation = (
            f"Prime Cash Inflow: Counterparty accelerates installment payments ahead of scheduled maturity. "
            f"Eligible for credit line expansion and preferred supplier tier."
        )
        mitigation_strategy = "Standard automated processing; maintain preferred relationship."

    elif customer_score >= 85:
        risk_level = "Prime / Benchmark"
        action_flag = "EARLY_DISCOUNT_OFFER"
        color_code = "emerald"
        recommendation = (
            f"Exceptional Settlement Record: Payer consistently honors single or multi-part terms. "
            f"Recommend offering standard 2/10 Net 30 terms to capture early cash inflow."
        )
        mitigation_strategy = "Standard receivables monitoring; zero risk mitigation required."

    else:
        risk_level = "Standard Operational"
        action_flag = "STANDARD_MONITORING"
        color_code = "blue"
        recommendation = (
            f"Standard Working Capital Flow: Payments align with commercial contract norms. "
            f"Continue standard Net 30 accounts receivable schedule."
        )
        mitigation_strategy = "Routine AR ledger tracking."

    return {
        "step6_risk_level": risk_level,
        "action_flag": action_flag,
        "color_code": color_code,
        "recommendation": recommendation,
        "mitigation_strategy": mitigation_strategy,
        "estimated_working_capital_carry_cost": carry_cost,
        "projected_liquidity_delay_days": int(round(max(0, weighted_delay)))
    }


if __name__ == "__main__":
    # Test sample
    mock_sched = {
        "is_divided_invoice": True,
        "part1_amount": 5000.0,
        "part2_amount": 5000.0,
        "part1_days_from_today": 12,
        "part2_days_from_today": 38
    }
    res = evaluate_counterparty_risk_and_action(
        customer_score=68,
        predicted_class="P_split_part1_ontime_part2_late",
        invoice_amount=10000.0,
        schedule_data=mock_sched
    )
    import json
    print(json.dumps(res, indent=2))
