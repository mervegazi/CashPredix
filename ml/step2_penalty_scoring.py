#!/usr/bin/env python3
"""
CashPredix - Step 2: Divided-Invoice Penalty Scoring Formula
6-Step Hybrid Architecture: Step 2 (Custom Algorithm)

Calculates the Customer Reliability Score (0–100) with a penalty for dividing invoices:
- A customer who divides an invoice into 2 parts creates extra tracking work and splits cash inflow.
- Each permutation of payment timing (Early, On-Time, Late) across both single and split invoices
  is weighted based on corporate counterparty risk.
- Even if both parts are on time, a divided-invoice payer receives weight 0.88 (instead of 1.00),
  plus a split-frequency penalty.

Formula from Plan (Expanded 12-Class Behavioral Permutations):
    Base_Score = 100 * (
        1.00 * (P_single_early + P_single_ontime)
        + 0.95 * P_split_both_early
        + 0.90 * P_split_part1_early_part2_ontime
        + 0.88 * (P_split_both_ontime + P_split_part1_ontime_part2_early)
        + 0.65 * (P_split_part1_late_part2_ontime + P_split_part1_late_part2_early)
        + 0.55 * P_split_part1_early_part2_late
        + 0.50 * P_split_part1_ontime_part2_late
        + 0.10 * P_split_both_late
        + 0.00 * P_single_late
    )
    Invoice_Split_Penalty = 5 * Historical_Invoice_Split_Rate
    Customer_Score = round(Base_Score - Invoice_Split_Penalty)
"""

from typing import Dict, Any, Optional


def calculate_customer_score(
    probabilities: Dict[str, float],
    historical_invoice_split_rate: float = 0.0
) -> Dict[str, Any]:
    """
    Calculate Customer Reliability Score (0-100) from Step 1 probabilities
    and historical split rate using the Divided-Invoice Penalty Scoring Formula.

    Args:
        probabilities: Dictionary containing 12 float probabilities:
            - P_single_early: Single payment paid early (Weight: 1.00)
            - P_single_ontime: Single payment paid on time (Weight: 1.00)
            - P_single_late: Single payment paid late (Weight: 0.00)
            - P_split_both_early: Both installments paid early (Weight: 0.95)
            - P_split_part1_early_part2_ontime: Part 1 early, Part 2 on-time (Weight: 0.90)
            - P_split_part1_early_part2_late: Part 1 early, Part 2 late (Weight: 0.55)
            - P_split_part1_ontime_part2_early: Part 1 on-time, Part 2 early (Weight: 0.88)
            - P_split_both_ontime: Both installments paid on-time (Weight: 0.88)
            - P_split_part1_ontime_part2_late: Part 1 on-time, Part 2 late (Weight: 0.50)
            - P_split_part1_late_part2_early: Part 1 late, Part 2 early (Weight: 0.65)
            - P_split_part1_late_part2_ontime: Part 1 late, Part 2 on-time (Weight: 0.65)
            - P_split_both_late: Both installments paid late (Weight: 0.10)
        historical_invoice_split_rate: Float (0.0 to 1.0) of customer's historical split rate.

    Returns:
        Dictionary with:
            - customer_score: Integer (0 to 100)
            - base_score: Float
            - invoice_split_penalty: Float
            - historical_split_rate: Float
            - tier: String tier description
            - risk_level: String risk level
            - badge_color: Hex or CSS color
    """
    p_single_early = float(probabilities.get("P_single_early", 0.0))
    p_single_ontime = float(probabilities.get("P_single_ontime", 0.0))
    p_single_late = float(probabilities.get("P_single_late", 0.0))

    p_split_both_early = float(probabilities.get("P_split_both_early", 0.0))
    p_split_p1_early_p2_ontime = float(probabilities.get("P_split_part1_early_part2_ontime", 0.0))
    p_split_p1_early_p2_late = float(probabilities.get("P_split_part1_early_part2_late", 0.0))
    p_split_p1_ontime_p2_early = float(probabilities.get("P_split_part1_ontime_part2_early", 0.0))
    p_split_both_ontime = float(probabilities.get("P_split_both_ontime", 0.0))
    p_split_p1_ontime_part2_late = float(probabilities.get("P_split_part1_ontime_part2_late", 0.0))
    p_split_p1_late_p2_early = float(probabilities.get("P_split_part1_late_part2_early", 0.0))
    p_split_p1_late_part2_ontime = float(probabilities.get("P_split_part1_late_part2_ontime", 0.0))
    p_split_both_late = float(probabilities.get("P_split_both_late", 0.0))

    split_rate = max(0.0, min(1.0, float(historical_invoice_split_rate)))

    # Comprehensive Formula covering all 12 payment/split outcomes:
    base_score = 100.0 * (
        1.00 * (p_single_early + p_single_ontime)
        + 0.95 * p_split_both_early
        + 0.90 * p_split_p1_early_p2_ontime
        + 0.88 * (p_split_both_ontime + p_split_p1_ontime_p2_early)
        + 0.65 * (p_split_p1_late_part2_ontime + p_split_p1_late_p2_early)
        + 0.55 * p_split_p1_early_p2_late
        + 0.50 * p_split_p1_ontime_part2_late
        + 0.10 * p_split_both_late
        + 0.00 * p_single_late
    )

    invoice_split_penalty = 5.0 * split_rate
    raw_score = base_score - invoice_split_penalty
    customer_score = int(round(raw_score))

    # Clamp strictly between 0 and 100
    customer_score = max(0, min(100, customer_score))

    # Tier mapping
    if customer_score >= 88:
        tier = "Prime / Benchmark"
        risk_level = "Minimal"
        badge_color = "emerald"
    elif customer_score >= 72:
        tier = "Investment Grade / Stable"
        risk_level = "Low"
        badge_color = "blue"
    elif customer_score >= 50:
        tier = "Watchlist / Moderate Risk"
        risk_level = "Moderate"
        badge_color = "amber"
    else:
        tier = "High Risk / Distressed"
        risk_level = "High"
        badge_color = "rose"

    return {
        "customer_score": customer_score,
        "base_score": round(base_score, 2),
        "invoice_split_penalty": round(invoice_split_penalty, 2),
        "historical_split_rate": round(split_rate, 4),
        "tier": tier,
        "risk_level": risk_level,
        "badge_color": badge_color
    }


if __name__ == "__main__":
    # Test case demonstrating 12-Class probability distribution:
    example_probs = {
        "P_single_early": 0.05,
        "P_single_ontime": 0.10,
        "P_single_late": 0.02,
        "P_split_both_early": 0.15,
        "P_split_part1_early_part2_ontime": 0.10,
        "P_split_part1_early_part2_late": 0.03,
        "P_split_part1_ontime_part2_early": 0.05,
        "P_split_both_ontime": 0.40,
        "P_split_part1_ontime_part2_late": 0.04,
        "P_split_part1_late_part2_early": 0.02,
        "P_split_part1_late_part2_ontime": 0.03,
        "P_split_both_late": 0.01
    }
    # With historical split rate ~ 0.20
    res = calculate_customer_score(example_probs, historical_invoice_split_rate=0.20)
    print("\n" + "=" * 65)
    print(" STEP 2: DIVIDED-INVOICE PENALTY SCORING ALGORITHM (12 CLASSES)")
    print("=" * 65)
    print(f" Calculated Customer Score:    {res['customer_score']} / 100")
    print(f" Base Score (Probabilities):   {res['base_score']}")
    print(f" Split Penalty:                -{res['invoice_split_penalty']} pts")
    print(f" Corporate Tier:               {res['tier']} ({res['risk_level']} Risk)")
    print("=" * 65)
