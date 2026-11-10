#!/usr/bin/env python3
"""
CashPredix - Step 2: Divided-Invoice Penalty Scoring Formula
5-Step Hybrid Architecture: Step 2 (Custom Algorithm)

Calculates the Customer Reliability Score (0–100) with a penalty for dividing invoices:
- A customer who divides an invoice into 2 parts creates extra tracking work and splits cash inflow.
- Even if both parts are on time, a divided-invoice payer receives weight 0.88 (instead of 1.00),
  plus a split-frequency penalty.

Formula from Plan:
    Base_Score = 100 * (
        1.00 * (P_single_early + P_single_ontime)
        + 0.88 * P_split_both_ontime
        + 0.65 * P_split_part1_late_part2_ontime
        + 0.50 * P_split_part1_ontime_part2_late
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
        probabilities: Dictionary containing 6 float probabilities:
            - P_single_early
            - P_single_ontime
            - P_single_late
            - P_split_both_ontime
            - P_split_part1_ontime_part2_late
            - P_split_part1_late_part2_ontime
        historical_invoice_split_rate: Float (0.0 to 1.0) of customer's historical split rate.

    Returns:
        Dictionary with:
            - customer_score: Integer (0 to 100)
            - base_score: Float
            - split_penalty: Float
            - tier: String tier description
            - badge_color: Hex or CSS color
    """
    p_early = float(probabilities.get("P_single_early", 0.0))
    p_ontime = float(probabilities.get("P_single_ontime", 0.0))
    p_late = float(probabilities.get("P_single_late", 0.0))
    p_split_both_on = float(probabilities.get("P_split_both_ontime", 0.0))
    p_split_p1_late_p2_on = float(probabilities.get("P_split_part1_late_part2_ontime", 0.0))
    p_split_p1_on_p2_late = float(probabilities.get("P_split_part1_ontime_part2_late", 0.0))

    split_rate = max(0.0, min(1.0, float(historical_invoice_split_rate)))

    # Exact Formula from Document:
    base_score = 100.0 * (
        1.00 * (p_early + p_ontime)
        + 0.88 * p_split_both_on
        + 0.65 * p_split_p1_late_p2_on
        + 0.50 * p_split_p1_on_p2_late
        + 0.00 * p_late
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
    # Test case from PDF Example:
    # A customer with high split probability (P_split_both_ontime = 0.84)
    example_probs = {
        "P_single_early": 0.02,
        "P_single_ontime": 0.06,
        "P_single_late": 0.01,
        "P_split_both_ontime": 0.84,
        "P_split_part1_ontime_part2_late": 0.04,
        "P_split_part1_late_part2_ontime": 0.03
    }
    # With historical split rate ~ 0.20
    res = calculate_customer_score(example_probs, historical_invoice_split_rate=0.20)
    print("\n" + "=" * 65)
    print(" STEP 2: DIVIDED-INVOICE PENALTY SCORING ALGORITHM")
    print("=" * 65)
    print(f" Calculated Customer Score:    {res['customer_score']} / 100")
    print(f" Base Score (Probabilities):   {res['base_score']}")
    print(f" Split Penalty:                -{res['invoice_split_penalty']} pts")
    print(f" Corporate Tier:               {res['tier']} ({res['risk_level']} Risk)")
    print("=" * 65)
