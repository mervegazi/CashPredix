#!/usr/bin/env python3
"""
CashPredix - High-Scale Vectorized Synthetic Data Generator (1M - 3M Invoices)
Generates large-scale synthetic B2B invoice and payment histories covering:
- Single payment scenarios (Early, On-Time, Late)
- Divided invoice scenarios (Both On-Time, Part 1 On-Time/Part 2 Late, Part 1 Late/Part 2 On-Time)
- Pareto invoice amounts ($500 to $100,000)
- Realistic payment cadence, split ratios, and installment milestones
"""

import os
import sys
import uuid
import time
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "data" / "synthetic"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def generate_large_scale_invoices(
    total_invoices: int = 1_000_000,
    num_customers: int = 500,
    output_file: Optional[Path] = None,
    chunk_size: int = 250_000,
    random_seed: int = 42
) -> Path:
    """
    Generate high-scale synthetic B2B payment history in efficient chunks.
    """
    rng = np.random.default_rng(random_seed)
    target_path = output_file or (OUTPUT_DIR / "payment_history_large.csv")

    print(f"[DATA-GEN] Starting high-scale generation of {total_invoices:,} invoices across {num_customers} customers...")
    start_time = time.time()

    # Generate customer IDs and profile weights
    customer_ids = [str(uuid.uuid4()) for _ in range(num_customers)]
    
    # Customer baseline habits:
    # 55% Disciplined, 30% Moderate Splitters, 15% Chronic Delay/Splitters
    cust_split_tendencies = rng.beta(a=2, b=5, size=num_customers)  # Avg split rate ~28%
    cust_avg_amounts = rng.pareto(a=2.5, size=num_customers) * 8000.0 + 1500.0

    classes = [
        "P_single_early",
        "P_single_ontime",
        "P_single_late",
        "P_split_both_ontime",
        "P_split_part1_ontime_part2_late",
        "P_split_part1_late_part2_ontime"
    ]
    # Class probability weights
    class_probs = np.array([0.16, 0.42, 0.18, 0.08, 0.12, 0.04])
    class_probs = class_probs / class_probs.sum()

    base_date = datetime(2025, 1, 1)
    written_rows = 0

    # If file exists, remove to start fresh
    if target_path.exists():
        target_path.unlink()

    first_chunk = True
    invoices_generated = 0

    while invoices_generated < total_invoices:
        current_chunk_size = min(chunk_size, total_invoices - invoices_generated)
        
        # Sample customers for this chunk
        cust_indices = rng.integers(0, num_customers, size=current_chunk_size)
        assigned_cids = [customer_ids[i] for i in cust_indices]
        
        # Sample invoice amounts (Pareto-distributed)
        base_amts = cust_avg_amounts[cust_indices]
        inv_amts = np.round(base_amts * rng.uniform(0.7, 1.4, size=current_chunk_size), 2)
        
        # Sample invoice dates across a 2-year period (730 days)
        day_offsets = rng.integers(0, 700, size=current_chunk_size)
        term_days = rng.choice([15, 30, 45, 60], size=current_chunk_size, p=[0.15, 0.60, 0.15, 0.10])
        
        # Assign payment behavior class
        assigned_classes = rng.choice(classes, size=current_chunk_size, p=class_probs)
        
        rows = []
        for i in range(current_chunk_size):
            inv_id = f"INV-GEN-{invoices_generated + i + 1:07d}"
            cid = assigned_cids[i]
            total_amt = float(inv_amts[i])
            inv_date = base_date + timedelta(days=int(day_offsets[i]))
            term = int(term_days[i])
            due_date = inv_date + timedelta(days=term)
            
            p_class = assigned_classes[i]
            
            if p_class.startswith("P_single"):
                # Single Payment (1 Part)
                if p_class == "P_single_early":
                    dpd = int(rng.integers(-10, -2))
                elif p_class == "P_single_ontime":
                    dpd = int(rng.integers(-2, 3))
                else:  # P_single_late
                    dpd = int(rng.integers(3, 35))
                    
                pay_date = due_date + timedelta(days=dpd)
                status = "PAID" if dpd <= 2 else "LATE"
                
                rows.append({
                    "id": str(uuid.uuid4()),
                    "customer_id": cid,
                    "invoice_number": inv_id,
                    "invoice_date": inv_date.strftime("%Y-%m-%d"),
                    "due_date": due_date.strftime("%Y-%m-%d"),
                    "invoice_amount": total_amt,
                    "amount": total_amt,
                    "amount_paid": total_amt,
                    "remaining_balance": 0.0,
                    "payment_date": pay_date.strftime("%Y-%m-%d"),
                    "payment_method": "wire_transfer",
                    "installment_number": 1,
                    "total_installments": 1,
                    "is_split_payment": False,
                    "days_past_due": dpd,
                    "status": status
                })
            else:
                # Divided Invoice (2 Parts)
                # Split ratio typically 40/60, 50/50, or 60/40
                p1_ratio = float(rng.choice([0.40, 0.50, 0.60]))
                p1_amt = round(total_amt * p1_ratio, 2)
                p2_amt = round(total_amt - p1_amt, 2)
                
                if p_class == "P_split_both_ontime":
                    dpd1 = int(rng.integers(-14, 0))
                    dpd2 = int(rng.integers(0, 3))
                elif p_class == "P_split_part1_ontime_part2_late":
                    dpd1 = int(rng.integers(-5, 2))
                    dpd2 = int(rng.integers(5, 40))
                else:  # P_split_part1_late_part2_ontime
                    dpd1 = int(rng.integers(3, 15))
                    dpd2 = int(rng.integers(-2, 2))
                    
                p1_date = due_date + timedelta(days=dpd1)
                p2_date = due_date + timedelta(days=dpd2)
                
                # Part 1
                rows.append({
                    "id": str(uuid.uuid4()),
                    "customer_id": cid,
                    "invoice_number": inv_id,
                    "invoice_date": inv_date.strftime("%Y-%m-%d"),
                    "due_date": due_date.strftime("%Y-%m-%d"),
                    "invoice_amount": total_amt,
                    "amount": p1_amt,
                    "amount_paid": p1_amt,
                    "remaining_balance": p2_amt,
                    "payment_date": p1_date.strftime("%Y-%m-%d"),
                    "payment_method": "ach",
                    "installment_number": 1,
                    "total_installments": 2,
                    "is_split_payment": True,
                    "days_past_due": dpd1,
                    "status": "PARTIAL" if dpd1 <= 2 else "LATE"
                })
                # Part 2
                rows.append({
                    "id": str(uuid.uuid4()),
                    "customer_id": cid,
                    "invoice_number": inv_id,
                    "invoice_date": inv_date.strftime("%Y-%m-%d"),
                    "due_date": due_date.strftime("%Y-%m-%d"),
                    "invoice_amount": total_amt,
                    "amount": p2_amt,
                    "amount_paid": p2_amt,
                    "remaining_balance": 0.0,
                    "payment_date": p2_date.strftime("%Y-%m-%d"),
                    "payment_method": "ach",
                    "installment_number": 2,
                    "total_installments": 2,
                    "is_split_payment": True,
                    "days_past_due": dpd2,
                    "status": "PAID" if dpd2 <= 2 else "LATE"
                })

        chunk_df = pd.DataFrame(rows)
        chunk_df.to_csv(target_path, mode="a", index=False, header=first_chunk)
        first_chunk = False
        
        invoices_generated += current_chunk_size
        written_rows += len(chunk_df)
        print(f"[DATA-GEN] Progress: {invoices_generated:,} / {total_invoices:,} invoices ({written_rows:,} rows written)...")

    elapsed = time.time() - start_time
    file_size_mb = target_path.stat().st_size / (1024 * 1024)
    print(f"\n[✓] High-scale dataset generation complete!")
    print(f"    - Invoices:   {total_invoices:,}")
    print(f"    - Total Rows: {written_rows:,}")
    print(f"    - File Size:  {file_size_mb:.2f} MB")
    print(f"    - Time Taken: {elapsed:.2f} seconds")
    print(f"    - File Path:  {target_path}")

    # Generate companion metadata JSON
    meta_path = OUTPUT_DIR / "large_scale_dataset_metrics.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        import json
        json.dump({
            "total_invoices": total_invoices,
            "total_rows": written_rows,
            "num_customers": num_customers,
            "file_size_mb": round(file_size_mb, 2),
            "generation_time_sec": round(elapsed, 2),
            "class_distribution": {
                c: float(p) for c, p in zip(classes, class_probs)
            }
        }, f, indent=2)

    return target_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate large-scale synthetic B2B payment history")
    parser.add_argument("--count", type=int, default=100_000, help="Number of invoices to generate (e.g. 100000, 1000000)")
    args = parser.parse_args()

    generate_large_scale_invoices(total_invoices=args.count)
