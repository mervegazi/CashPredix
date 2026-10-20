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


def simulate_customer_payment_history(
    customer: dict,
    start_date: datetime,
    end_date: datetime,
    invoices_per_year: int = 12
) -> list:
    """
    Generate realistic payment timeline for a single customer from customer creation date to end_date.
    Applies Gaussian timing, Pareto amounts, and realistic anomaly states.
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
        invoice_id = str(uuid.uuid4())
        
        base_scale = random.choice([250.0, 500.0, 850.0, 1200.0, 2500.0])
        amount = sample_pareto_amount(base_amount=base_scale, alpha=1.55)

        due_dt = current_invoice_dt + timedelta(days=term_days)
        due_date_str = due_dt.strftime("%Y-%m-%d")

        if due_dt > today_dt:
            # Future invoice (Receivable pending collection)
            records.append({
                "id": invoice_id,
                "customer_id": customer_id,
                "vendor_id": customer_id,  # compatibility dual-key
                "amount": amount,
                "due_date": due_date_str,
                "payment_date": None,
                "status": "PENDING"
            })
        else:
            r = random.random()

            if r < profile["missed_prob"] and (today_dt - due_dt).days > 45:
                # ANOMALY: Missed / Defaulted receivable
                records.append({
                    "id": invoice_id,
                    "customer_id": customer_id,
                    "vendor_id": customer_id,
                    "amount": amount,
                    "due_date": due_date_str,
                    "payment_date": None,
                    "status": "MISSED"
                })
            elif r < (profile["missed_prob"] + profile["partial_prob"]):
                # ANOMALY: Partial payment settlement
                delay_days = round(random.gauss(profile["mean_delay"] + 5.0, profile["std_delay"]))
                pay_dt = max(current_invoice_dt + timedelta(days=1), due_dt + timedelta(days=delay_days))
                pay_dt = min(pay_dt, today_dt)
                records.append({
                    "id": invoice_id,
                    "customer_id": customer_id,
                    "vendor_id": customer_id,
                    "amount": amount,
                    "due_date": due_date_str,
                    "payment_date": pay_dt.strftime("%Y-%m-%d"),
                    "status": "PARTIAL"
                })
            else:
                delay_days = round(random.gauss(profile["mean_delay"], profile["std_delay"]))
                pay_dt = due_dt + timedelta(days=delay_days)
                pay_dt = max(current_invoice_dt + timedelta(days=1), pay_dt)
                pay_dt = min(pay_dt, today_dt)

                if pay_dt > due_dt + timedelta(days=3):
                    status = "LATE"
                else:
                    status = "PAID"

                records.append({
                    "id": invoice_id,
                    "customer_id": customer_id,
                    "vendor_id": customer_id,
                    "amount": amount,
                    "due_date": due_date_str,
                    "payment_date": pay_dt.strftime("%Y-%m-%d"),
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
        keys = ["id", "customer_id", "vendor_id", "amount", "due_date", "payment_date", "status"]
        with open(out_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
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
