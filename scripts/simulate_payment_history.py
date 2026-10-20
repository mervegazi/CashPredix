#!/usr/bin/env python3
"""
CashPredix - Payment Anomalies & Statistical Distributions Simulation Script (Python)
Week 3: Task #43 - Generate synthetic payment history timelines for customer accounts receivable
with realistic statistical distributions and anomaly injection.

Schema Compatibility:
  payment_history (id, customer_id, vendor_id, amount, due_date, payment_date, status)

Statistical Characteristics:
  1. Amount Distribution: Pareto distribution (Power-law) reflecting corporate B2B cash flows
     (many routine subscription/service invoices, few large enterprise deployments).
  2. Payment Timing: Gaussian (Normal) distribution modeling payment settlement relative to due dates.
  3. Realistic Anomalies:
     - LATE payments (settlement delays beyond agreed terms)
     - PARTIAL payments (fractional invoice settlements)
     - MISSED payments (defaulted or uncollected receivables)
     - PAID (settled on-time or early for discounts)
     - PENDING (open future/near-term invoices)

Usage:
  python3 scripts/simulate_payment_history.py --customers-file data/synthetic/customers.json --output-dir data/synthetic --format both
  python3 scripts/simulate_payment_history.py --help
"""

import os
import sys
import uuid
import json
import csv
import math
import random
import argparse
from datetime import datetime, timedelta, timezone, date
from pathlib import Path

DEFAULT_SEED = 42

# Parse payment terms string into days
TERMS_MAP = {
    "Due on Receipt": 0,
    "Net 15": 15,
    "Net 30": 30,
    "Net 45": 45,
    "Net 60": 60,
    "Net 90": 90,
    "2/10 Net 30": 30
}

# Customer payment reliability profiles (Cash Inflow Timing)
CUSTOMER_PROFILES = {
    "PRIME": {  # ~60% of clients: Disciplined, early or strictly on-time settlement
        "weight": 0.60,
        "mean_delay": -2.0,   # Pays 2 days before due date on average
        "std_delay": 2.5,
        "missed_prob": 0.01,
        "partial_prob": 0.02,
        "late_prob": 0.05
    },
    "STANDARD": {  # ~25% of clients: Generally reliable with periodic minor delays within grace
        "weight": 0.25,
        "mean_delay": 3.0,    # Pays 3 days late on average
        "std_delay": 5.0,
        "missed_prob": 0.04,
        "partial_prob": 0.08,
        "late_prob": 0.20
    },
    "VOLATILE": {  # ~15% of clients: Chronic delinquency, substantial credit risk
        "weight": 0.15,
        "mean_delay": 18.0,   # Pays 18 days late on average
        "std_delay": 12.0,
        "missed_prob": 0.12,
        "partial_prob": 0.22,
        "late_prob": 0.55
    }
}


def sample_pareto_amount(base_amount: float = 350.0, alpha: float = 1.6, max_amount: float = 250000.0) -> float:
    """
    Sample transaction amounts from a Pareto (Type I) power-law distribution.
    Reflects realistic B2B enterprise expenditures: dense concentration around routine operations
    ($500 - $10,000) with a heavy right tail for major enterprise customer contracts.
    """
    u = max(1e-9, 1.0 - random.random())
    val = base_amount / (u ** (1.0 / alpha))
    clamped = min(val, max_amount)
    return round(clamped, 2)


def assign_customer_profile() -> str:
    """Randomly assign a customer behavioral risk profile based on defined weights."""
    r = random.random()
    cumulative = 0.0
    for profile_name, conf in CUSTOMER_PROFILES.items():
        cumulative += conf["weight"]
        if r <= cumulative:
            return profile_name
    return "STANDARD"


def sample_payment_method() -> str:
    """Sample enterprise B2B payment instrument based on market distributions."""
    r = random.random()
    if r < 0.45:
        return "wire_transfer"
    elif r < 0.75:
        return "ach"
    elif r < 0.90:
        return "check"
    elif r < 0.95:
        return "credit_card"
    else:
        return "cash"


def simulate_customer_payment_history(
    customer: dict,
    start_date: datetime,
    end_date: datetime,
    invoices_per_year: int = 12
) -> list:
    """
    Generate realistic Accounts Receivable (AR) payment timeline for a customer:
      - Realistic Invoice numbers, issue dates, and contract due dates
      - Multi-installment Split Payments (e.g. 50/50 partial settlements)
      - Payment Methods: Wire Transfer, ACH, Post-Dated Checks & Cash
      - Post-Dated Check maturity dates & Early Check Factoring (Discounting)
      - Cash Discounts under prompt payment terms (e.g. 2/10 Net 30)
      - Delinquency analytics (Days Past Due - DPD)
    """
    customer_id = customer["id"]
    payment_terms_str = customer.get("payment_terms", "Net 30")
    term_days = TERMS_MAP.get(payment_terms_str, 30)

    profile_type = assign_customer_profile()
    profile = CUSTOMER_PROFILES[profile_type]

    records = []
    interval_days = max(14, int(365.25 / invoices_per_year))
    current_invoice_dt = start_date + timedelta(days=random.randint(5, 25))

    today_dt = end_date

    while current_invoice_dt < today_dt:
        inv_seq = random.randint(10000, 99999)
        invoice_number = f"INV-{current_invoice_dt.year}-{inv_seq}"
        invoice_date_str = current_invoice_dt.strftime("%Y-%m-%d")

        base_scale = random.choice([350.0, 750.0, 1500.0, 3200.0, 8500.0, 24000.0])
        invoice_amount = sample_pareto_amount(base_amount=base_scale, alpha=1.55)

        due_dt = current_invoice_dt + timedelta(days=term_days)
        due_date_str = due_dt.strftime("%Y-%m-%d")

        # Future Invoice (Pending collection)
        if due_dt > today_dt:
            records.append({
                "id": str(uuid.uuid4()),
                "customer_id": customer_id,
                "vendor_id": customer_id,  # backward compatibility alias
                "invoice_number": invoice_number,
                "invoice_date": invoice_date_str,
                "due_date": due_date_str,
                "invoice_amount": invoice_amount,
                "amount": invoice_amount,
                "amount_paid": 0.0,
                "remaining_balance": invoice_amount,
                "payment_date": None,
                "payment_method": None,
                "installment_number": 1,
                "total_installments": 1,
                "is_split_payment": False,
                "check_number": None,
                "check_issue_date": None,
                "check_maturity_date": None,
                "check_clearing_date": None,
                "check_status": None,
                "is_factored": False,
                "factoring_date": None,
                "factoring_fee": 0.0,
                "net_cash_received": 0.0,
                "early_discount_applied": False,
                "discount_amount": 0.0,
                "days_past_due": 0,
                "status": "PENDING"
            })
        else:
            r = random.random()

            # Case A: Defaulted / Uncollectible receivable
            if r < profile["missed_prob"] and (today_dt - due_dt).days > 45:
                records.append({
                    "id": str(uuid.uuid4()),
                    "customer_id": customer_id,
                    "vendor_id": customer_id,
                    "invoice_number": invoice_number,
                    "invoice_date": invoice_date_str,
                    "due_date": due_date_str,
                    "invoice_amount": invoice_amount,
                    "amount": invoice_amount,
                    "amount_paid": 0.0,
                    "remaining_balance": invoice_amount,
                    "payment_date": None,
                    "payment_method": None,
                    "installment_number": 1,
                    "total_installments": 1,
                    "is_split_payment": False,
                    "check_number": None,
                    "check_issue_date": None,
                    "check_maturity_date": None,
                    "check_clearing_date": None,
                    "check_status": None,
                    "is_factored": False,
                    "factoring_date": None,
                    "factoring_fee": 0.0,
                    "net_cash_received": 0.0,
                    "early_discount_applied": False,
                    "discount_amount": 0.0,
                    "days_past_due": (today_dt - due_dt).days,
                    "status": "MISSED"
                })

            # Case B: Split Payment (2-part installment settlement, ~20% of settled invoices)
            elif (r < (profile["missed_prob"] + profile["partial_prob"])) or (random.random() < 0.18):
                split_ratio = random.choice([0.40, 0.50, 0.60])
                amount_part1 = round(invoice_amount * split_ratio, 2)
                amount_part2 = round(invoice_amount - amount_part1, 2)

                delay1 = round(random.gauss(profile["mean_delay"], profile["std_delay"]))
                pay_dt1 = max(current_invoice_dt + timedelta(days=2), due_dt + timedelta(days=delay1))
                pay_dt1 = min(pay_dt1, today_dt)

                pay_dt2 = pay_dt1 + timedelta(days=random.randint(14, 35))

                method1 = sample_payment_method()
                method2 = sample_payment_method()

                # Installment 1 row
                records.append({
                    "id": str(uuid.uuid4()),
                    "customer_id": customer_id,
                    "vendor_id": customer_id,
                    "invoice_number": invoice_number,
                    "invoice_date": invoice_date_str,
                    "due_date": due_date_str,
                    "invoice_amount": invoice_amount,
                    "amount": amount_part1,
                    "amount_paid": amount_part1,
                    "remaining_balance": amount_part2,
                    "payment_date": pay_dt1.strftime("%Y-%m-%d"),
                    "payment_method": method1,
                    "installment_number": 1,
                    "total_installments": 2,
                    "is_split_payment": True,
                    "check_number": None,
                    "check_issue_date": None,
                    "check_maturity_date": None,
                    "check_clearing_date": None,
                    "check_status": None,
                    "is_factored": False,
                    "factoring_date": None,
                    "factoring_fee": 0.0,
                    "net_cash_received": amount_part1,
                    "early_discount_applied": False,
                    "discount_amount": 0.0,
                    "days_past_due": (pay_dt1 - due_dt).days,
                    "status": "PARTIAL"
                })

                # Installment 2 row
                if pay_dt2 <= today_dt:
                    dpd2 = (pay_dt2 - due_dt).days
                    records.append({
                        "id": str(uuid.uuid4()),
                        "customer_id": customer_id,
                        "vendor_id": customer_id,
                        "invoice_number": invoice_number,
                        "invoice_date": invoice_date_str,
                        "due_date": due_date_str,
                        "invoice_amount": invoice_amount,
                        "amount": amount_part2,
                        "amount_paid": amount_part2,
                        "remaining_balance": 0.0,
                        "payment_date": pay_dt2.strftime("%Y-%m-%d"),
                        "payment_method": method2,
                        "installment_number": 2,
                        "total_installments": 2,
                        "is_split_payment": True,
                        "check_number": None,
                        "check_issue_date": None,
                        "check_maturity_date": None,
                        "check_clearing_date": None,
                        "check_status": None,
                        "is_factored": False,
                        "factoring_date": None,
                        "factoring_fee": 0.0,
                        "net_cash_received": amount_part2,
                        "early_discount_applied": False,
                        "discount_amount": 0.0,
                        "days_past_due": dpd2,
                        "status": "PAID" if dpd2 <= 3 else "LATE"
                    })
                else:
                    # Second part is pending future collection
                    records.append({
                        "id": str(uuid.uuid4()),
                        "customer_id": customer_id,
                        "vendor_id": customer_id,
                        "invoice_number": invoice_number,
                        "invoice_date": invoice_date_str,
                        "due_date": due_date_str,
                        "invoice_amount": invoice_amount,
                        "amount": amount_part2,
                        "amount_paid": 0.0,
                        "remaining_balance": amount_part2,
                        "payment_date": None,
                        "payment_method": method2,
                        "installment_number": 2,
                        "total_installments": 2,
                        "is_split_payment": True,
                        "check_number": None,
                        "check_issue_date": None,
                        "check_maturity_date": None,
                        "check_clearing_date": None,
                        "check_status": None,
                        "is_factored": False,
                        "factoring_date": None,
                        "factoring_fee": 0.0,
                        "net_cash_received": 0.0,
                        "early_discount_applied": False,
                        "discount_amount": 0.0,
                        "days_past_due": 0,
                        "status": "PENDING"
                    })

            # Case C: Full Single-Payment Settlement (Wire, ACH, Check, or Factoring)
            else:
                delay_days = round(random.gauss(profile["mean_delay"], profile["std_delay"]))
                pay_dt = due_dt + timedelta(days=delay_days)
                pay_dt = max(current_invoice_dt + timedelta(days=1), pay_dt)
                pay_dt = min(pay_dt, today_dt)

                payment_method = sample_payment_method()

                # Check / Post-Dated Check Specifics
                check_number = None
                check_issue_date = None
                check_maturity_date = None
                check_clearing_date = None
                check_status = None
                is_factored = False
                factoring_date = None
                factoring_fee = 0.0
                net_cash_received = invoice_amount

                if payment_method == "check":
                    check_number = f"CHK-{random.randint(100000, 999999)}"
                    check_issue_dt = current_invoice_dt + timedelta(days=random.randint(2, 10))
                    check_issue_date = check_issue_dt.strftime("%Y-%m-%d")
                    check_maturity_dt = due_dt + timedelta(days=random.randint(-3, 20))
                    check_maturity_date = check_maturity_dt.strftime("%Y-%m-%d")

                    # Check factoring / discounting (~20% of checks factored early for liquidity)
                    if random.random() < 0.20 and check_maturity_dt > current_invoice_dt + timedelta(days=15):
                        is_factored = True
                        factoring_dt = min(today_dt, check_issue_dt + timedelta(days=random.randint(2, 6)))
                        factoring_date = factoring_dt.strftime("%Y-%m-%d")
                        fee_rate = round(random.uniform(0.025, 0.045), 4)  # 2.5% to 4.5% discount fee
                        factoring_fee = round(invoice_amount * fee_rate, 2)
                        net_cash_received = round(invoice_amount - factoring_fee, 2)
                        check_status = "discounted_factored"
                        check_clearing_date = factoring_date
                        pay_dt = factoring_dt
                    else:
                        is_factored = False
                        check_status = "cleared"
                        check_clearing_date = check_maturity_date
                        net_cash_received = invoice_amount

                # Prompt Payment Discount (2/10 Net 30)
                early_discount_applied = False
                discount_amount = 0.0
                amount_paid = invoice_amount

                if payment_terms_str == "2/10 Net 30" and (pay_dt - current_invoice_dt).days <= 10:
                    early_discount_applied = True
                    discount_amount = round(invoice_amount * 0.02, 2)
                    amount_paid = round(invoice_amount - discount_amount, 2)
                    net_cash_received = amount_paid

                dpd = (pay_dt - due_dt).days
                status = "PAID" if dpd <= 3 else "LATE"

                records.append({
                    "id": str(uuid.uuid4()),
                    "customer_id": customer_id,
                    "vendor_id": customer_id,
                    "invoice_number": invoice_number,
                    "invoice_date": invoice_date_str,
                    "due_date": due_date_str,
                    "invoice_amount": invoice_amount,
                    "amount": amount_paid,
                    "amount_paid": amount_paid,
                    "remaining_balance": 0.0,
                    "payment_date": pay_dt.strftime("%Y-%m-%d"),
                    "payment_method": payment_method,
                    "installment_number": 1,
                    "total_installments": 1,
                    "is_split_payment": False,
                    "check_number": check_number,
                    "check_issue_date": check_issue_date,
                    "check_maturity_date": check_maturity_date,
                    "check_clearing_date": check_clearing_date,
                    "check_status": check_status,
                    "is_factored": is_factored,
                    "factoring_date": factoring_date,
                    "factoring_fee": factoring_fee,
                    "net_cash_received": net_cash_received,
                    "early_discount_applied": early_discount_applied,
                    "discount_amount": discount_amount,
                    "days_past_due": dpd,
                    "status": status
                })

        jitter = random.randint(-4, 5)
        current_invoice_dt += timedelta(days=interval_days + jitter)

    return records


def generate_all_payment_histories(
    customers: list,
    now: datetime = None,
    seed: int = None
) -> dict:
    """Simulate payment history for all provided customer records."""
    if seed is not None:
        random.seed(seed)

    if now is None:
        now = datetime.now(timezone.utc)

    all_payments = []
    status_counts = {"PAID": 0, "LATE": 0, "PARTIAL": 0, "MISSED": 0, "PENDING": 0}
    amounts = []

    for c in customers:
        created_raw = c.get("created_at")
        if created_raw:
            try:
                start_dt = datetime.fromisoformat(created_raw.replace("Z", "+00:00"))
            except Exception:
                start_dt = now - timedelta(days=365)
        else:
            start_dt = now - timedelta(days=365)

        customer_payments = simulate_customer_payment_history(
            customer=c,
            start_date=start_dt,
            end_date=now
        )

        for p in customer_payments:
            status = p["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
            amounts.append(p["amount"])
            all_payments.append(p)

    total = len(all_payments)
    avg_amount = round(sum(amounts) / max(1, total), 2)
    max_amount = max(amounts) if amounts else 0.0
    min_amount = min(amounts) if amounts else 0.0

    return {
        "payments": all_payments,
        "metrics": {
            "total_payments": total,
            "status_breakdown": status_counts,
            "anomaly_rate_percent": round(
                ((status_counts.get("LATE", 0) + status_counts.get("PARTIAL", 0) + status_counts.get("MISSED", 0)) / max(1, total)) * 100, 2
            ),
            "amount_stats": {
                "min": min_amount,
                "average": avg_amount,
                "max": max_amount,
                "total_volume": round(sum(amounts), 2)
            },
            "generated_at": now.isoformat()
        }
    }


def save_payments_to_json(data: dict, output_dir: Path):
    """Write payment histories to JSON format."""
    output_dir.mkdir(parents=True, exist_ok=True)
    out_file = output_dir / "payment_history.json"
    metrics_file = output_dir / "payment_simulation_metrics.json"

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data["payments"], f, indent=2)

    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(data["metrics"], f, indent=2)

    print(f"[✓] Saved JSON payment history to: {out_file} ({len(data['payments'])} records)")
    print(f"[✓] Saved simulation metrics to:     {metrics_file}")


def save_payments_to_csv(data: dict, output_dir: Path):
    """Write payment histories to CSV format for direct PostgreSQL import."""
    output_dir.mkdir(parents=True, exist_ok=True)
    out_file = output_dir / "payment_history.csv"

    if data["payments"]:
        keys = [
            "id",
            "customer_id",
            "vendor_id",
            "invoice_number",
            "invoice_date",
            "due_date",
            "invoice_amount",
            "amount",
            "amount_paid",
            "remaining_balance",
            "payment_date",
            "payment_method",
            "installment_number",
            "total_installments",
            "is_split_payment",
            "check_number",
            "check_issue_date",
            "check_maturity_date",
            "check_clearing_date",
            "check_status",
            "is_factored",
            "factoring_date",
            "factoring_fee",
            "net_cash_received",
            "early_discount_applied",
            "discount_amount",
            "days_past_due",
            "status",
        ]
        with open(out_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(data["payments"])

    print(f"[✓] Saved CSV payment history to:  {out_file} ({len(data['payments'])} rows)")


def main():
    parser = argparse.ArgumentParser(
        description="CashPredix Week 3 Task #43: Simulate Accounts Receivable Inflow Payment Timelines."
    )
    parser.add_argument(
        "--customers-file",
        "--vendors-file",
        type=str,
        default=None,
        dest="customers_file",
        help="Path to customers.json input file (default: data/synthetic/customers.json)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="data/synthetic",
        help="Output directory (default: data/synthetic)"
    )
    parser.add_argument(
        "--format",
        type=str,
        choices=["json", "csv", "both"],
        default="both",
        help="Output format (json, csv, both; default: both)"
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=DEFAULT_SEED,
        help="Random seed for reproducible results (default: 42)"
    )

    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    target_file = args.customers_file
    if not target_file:
        cust_candidate = output_dir / "customers.json"
        vend_candidate = output_dir / "vendors.json"
        target_file = cust_candidate if cust_candidate.exists() else vend_candidate

    customers_path = Path(target_file)
    if not customers_path.exists():
        print(f"[ERROR] Customers input file not found at: {customers_path}")
        print("Run `python3 scripts/generate_synthetic_data.py` first to generate customers.")
        sys.exit(1)

    with open(customers_path, "r", encoding="utf-8") as f:
        customers = json.load(f)

    print("=" * 65)
    print(" CashPredix - Accounts Receivable Payment Simulation Engine (#43)")
    print("=" * 65)
    print(f" Loaded Customers:          {len(customers)}")
    print(f" Pareto Amount Distribution: Alpha = 1.55 (Heavy tail)")
    print(f" Gaussian Payment Timing:    Normalized by Customer Risk Tiers")
    print(f" Anomaly Injection:          Late, Partial, and Missed Settlements")
    print(f" Output Directory:           {args.output_dir}")
    print("=" * 65)

    result = generate_all_payment_histories(customers, seed=args.seed)
    metrics = result["metrics"]

    out_dir = Path(args.output_dir)
    if args.format in ("json", "both"):
        save_payments_to_json(result, out_dir)
    if args.format in ("csv", "both"):
        save_payments_to_csv(result, out_dir)

    print("=" * 65)
    print(" SIMULATION SUMMARY:")
    print(f"  Total Invoices Generated:   {metrics['total_payments']:,}")
    print(f"  Total Transaction Volume:   ${metrics['amount_stats']['total_volume']:,.2f}")
    print(f"  Average Invoice Amount:     ${metrics['amount_stats']['average']:,.2f}")
    print(f"  Max Invoice Amount:         ${metrics['amount_stats']['max']:,.2f}")
    print(f"  Anomaly Rate:               {metrics['anomaly_rate_percent']}%")
    print("  Status Breakdown:")
    for status, count in metrics["status_breakdown"].items():
        pct = (count / max(1, metrics['total_payments'])) * 100
        print(f"    - {status:8s}: {count:6d} ({pct:5.1f}%)")
    print("=" * 65)
    print("[SUCCESS] Customer payment anomalies & distributions simulated successfully!")


if __name__ == "__main__":
    main()
