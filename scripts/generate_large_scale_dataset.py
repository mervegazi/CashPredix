#!/usr/bin/env python3
"""
CashPredix - High-Scale Vectorized Synthetic Data Generator (3,000,000 Invoices)
Generates large-scale synthetic B2B invoice and payment histories covering ALL 12 payment/split combinations:

Single Invoices (3 classes):
1. P_single_early: Full payment at least 3 days before due date.
2. P_single_ontime: Full payment on due date (+/- 2 days).
3. P_single_late: Full payment after due date.

Divided Invoices (9 combinations: Part 1 Early/On-Time/Late x Part 2 Early/On-Time/Late):
4. P_split_both_early: Both parts paid early.
5. P_split_part1_early_part2_ontime: Part 1 early, Part 2 on-time.
6. P_split_part1_early_part2_late: Part 1 early, Part 2 late.
7. P_split_part1_ontime_part2_early: Part 1 on-time, Part 2 early.
8. P_split_both_ontime: Both parts on-time.
9. P_split_part1_ontime_part2_late: Part 1 on-time, Part 2 late.
10. P_split_part1_late_part2_early: Part 1 late, Part 2 early.
11. P_split_part1_late_part2_ontime: Part 1 late, Part 2 on-time.
12. P_split_both_late: Both parts late.
"""

import os
import sys
import uuid
import time
import json
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "data" / "synthetic"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PAYMENT_CLASSES_12 = [
    "P_single_early",
    "P_single_ontime",
    "P_single_late",
    "P_split_both_early",
    "P_split_part1_early_part2_ontime",
    "P_split_part1_early_part2_late",
    "P_split_part1_ontime_part2_early",
    "P_split_both_ontime",
    "P_split_part1_ontime_part2_late",
    "P_split_part1_late_part2_early",
    "P_split_part1_late_part2_ontime",
    "P_split_both_late",
]


def generate_large_scale_invoices(
    total_invoices: int = 3_000_000,
    num_customers: int = 500,
    output_file: Optional[Path] = None,
    chunk_size: int = 500_000,
    random_seed: int = 42
) -> Path:
    """
    Generate 3 Million synthetic B2B invoices with all 12 timing/split possibilities
    using vectorized array chunking for blazing speed.
    """
    rng = np.random.default_rng(random_seed)
    target_path = output_file or (OUTPUT_DIR / "payment_history_large.csv")

    print(f"\n[DATA-GEN] Starting high-speed generation of {total_invoices:,} invoices across {num_customers} counterparties...")
    print(f"[DATA-GEN] Target output file: {target_path}")
    start_time = time.time()

    # Generate persistent customer pool
    customer_ids = np.array([f"cust_{i+1:04d}" for i in range(num_customers)])
    
    # Counterparty baseline behavior distributions:
    # Split tendencies and base revenue tiers
    cust_split_rates = rng.beta(a=2.0, b=5.0, size=num_customers)  # ~28% avg split rate
    cust_avg_amounts = rng.pareto(a=2.5, size=num_customers) * 8500.0 + 1200.0

    # 12-Class Probability Weights (Empirical B2B distribution covering all combinations)
    weights = np.array([
        0.14,  # P_single_early
        0.38,  # P_single_ontime
        0.16,  # P_single_late
        0.03,  # P_split_both_early
        0.04,  # P_split_part1_early_part2_ontime
        0.03,  # P_split_part1_early_part2_late (first early, second late)
        0.02,  # P_split_part1_ontime_part2_early
        0.07,  # P_split_both_ontime
        0.05,  # P_split_part1_ontime_part2_late (first on-time, second late)
        0.02,  # P_split_part1_late_part2_early (first late, second early)
        0.03,  # P_split_part1_late_part2_ontime (first late, second on-time)
        0.03,  # P_split_both_late (both late)
    ])
    weights = weights / weights.sum()

    base_date = np.datetime64("2024-01-01")
    total_installment_rows = 0

    if target_path.exists():
        target_path.unlink()

    first_chunk = True
    invoices_done = 0

    while invoices_done < total_invoices:
        n = min(chunk_size, total_invoices - invoices_done)
        chunk_start = time.time()

        # Vectorized sampling
        c_idx = rng.integers(0, num_customers, size=n)
        assigned_cids = customer_ids[c_idx]
        
        # Amounts
        assigned_amounts = np.round(cust_avg_amounts[c_idx] * rng.uniform(0.75, 1.35, size=n), 2)
        
        # Issue date & terms
        day_offsets = rng.integers(0, 720, size=n)
        terms = rng.choice(np.array([15, 30, 45, 60]), size=n, p=[0.15, 0.60, 0.15, 0.10])
        
        # Class assignments
        assigned_classes = rng.choice(PAYMENT_CLASSES_12, size=n, p=weights)
        is_split_mask = np.char.startswith(assigned_classes, "P_split")

        # Invoice IDs
        inv_ids = np.array([f"INV-3M-{invoices_done + i + 1:08d}" for i in range(n)])

        # Split ratios: default 1.0 for single, ~0.50 for split
        split_ratios = np.ones(n, dtype=np.float32)
        split_ratios[is_split_mask] = np.round(rng.uniform(0.35, 0.65, size=np.sum(is_split_mask)), 2)

        # Dates calculation
        inv_dates = base_date + day_offsets.astype("timedelta64[D]")
        due_dates = inv_dates + terms.astype("timedelta64[D]")

        # Delays calculation per class
        # Part 1 delays
        delay1 = np.zeros(n, dtype=np.int32)
        delay2 = np.zeros(n, dtype=np.int32)

        for idx, cls_name in enumerate(assigned_classes):
            if cls_name == "P_single_early":
                delay1[idx] = rng.integers(-10, -3)
            elif cls_name == "P_single_ontime":
                delay1[idx] = rng.integers(-2, 3)
            elif cls_name == "P_single_late":
                delay1[idx] = rng.integers(4, 35)
            elif cls_name == "P_split_both_early":
                delay1[idx] = rng.integers(-14, -5)
                delay2[idx] = rng.integers(-6, -2)
            elif cls_name == "P_split_part1_early_part2_ontime":
                delay1[idx] = rng.integers(-12, -4)
                delay2[idx] = rng.integers(-2, 3)
            elif cls_name == "P_split_part1_early_part2_late":
                delay1[idx] = rng.integers(-12, -3)
                delay2[idx] = rng.integers(5, 30)
            elif cls_name == "P_split_part1_ontime_part2_early":
                delay1[idx] = rng.integers(-2, 3)
                delay2[idx] = rng.integers(-6, -2)
            elif cls_name == "P_split_both_ontime":
                delay1[idx] = rng.integers(-3, 2)
                delay2[idx] = rng.integers(0, 3)
            elif cls_name == "P_split_part1_ontime_part2_late":
                delay1[idx] = rng.integers(-2, 2)
                delay2[idx] = rng.integers(6, 28)
            elif cls_name == "P_split_part1_late_part2_early":
                delay1[idx] = rng.integers(4, 15)
                delay2[idx] = rng.integers(-4, -1)
            elif cls_name == "P_split_part1_late_part2_ontime":
                delay1[idx] = rng.integers(4, 16)
                delay2[idx] = rng.integers(-1, 3)
            elif cls_name == "P_split_both_late":
                delay1[idx] = rng.integers(5, 20)
                delay2[idx] = rng.integers( delay1[idx] + 5, delay1[idx] + 35)

        # Build installment 1 records
        amt1 = np.where(is_split_mask, np.round(assigned_amounts * split_ratios, 2), assigned_amounts)
        pay_date1 = due_dates + delay1.astype("timedelta64[D]")

        part1_df = pd.DataFrame({
            "invoice_id": inv_ids,
            "customer_id": assigned_cids,
            "invoice_amount": assigned_amounts,
            "installment_number": 1,
            "total_installments": np.where(is_split_mask, 2, 1),
            "installment_amount": amt1,
            "installment_ratio": split_ratios,
            "invoice_date": pd.to_datetime(inv_dates).strftime("%Y-%m-%d"),
            "due_date": pd.to_datetime(due_dates).strftime("%Y-%m-%d"),
            "payment_date": pd.to_datetime(pay_date1).strftime("%Y-%m-%d"),
            "days_past_due": delay1,
            "payment_term_days": terms,
            "is_split_payment": is_split_mask,
            "target_class": assigned_classes
        })

        # Build installment 2 records for split invoices
        split_indices = np.where(is_split_mask)[0]
        amt2 = np.round(assigned_amounts[split_indices] - amt1[split_indices], 2)
        pay_date2 = due_dates[split_indices] + delay2[split_indices].astype("timedelta64[D]")

        part2_df = pd.DataFrame({
            "invoice_id": inv_ids[split_indices],
            "customer_id": assigned_cids[split_indices],
            "invoice_amount": assigned_amounts[split_indices],
            "installment_number": 2,
            "total_installments": 2,
            "installment_amount": amt2,
            "installment_ratio": np.round(1.0 - split_ratios[split_indices], 2),
            "invoice_date": pd.to_datetime(inv_dates[split_indices]).strftime("%Y-%m-%d"),
            "due_date": pd.to_datetime(due_dates[split_indices]).strftime("%Y-%m-%d"),
            "payment_date": pd.to_datetime(pay_date2).strftime("%Y-%m-%d"),
            "days_past_due": delay2[split_indices],
            "payment_term_days": terms[split_indices],
            "is_split_payment": True,
            "target_class": assigned_classes[split_indices]
        })

        # Combine and interleave chunk
        chunk_combined = pd.concat([part1_df, part2_df], ignore_index=True)
        chunk_combined.sort_values(by=["invoice_id", "installment_number"], inplace=True)

        # Append to CSV
        chunk_combined.to_csv(target_path, mode="w" if first_chunk else "a", header=first_chunk, index=False)
        first_chunk = False

        total_installment_rows += len(chunk_combined)
        invoices_done += n
        chunk_elapsed = time.time() - chunk_start
        print(f"  -> Generated {invoices_done:,} / {total_invoices:,} invoices ({total_installment_rows:,} installment rows) [Chunk: {chunk_elapsed:.2f}s]")

    elapsed = time.time() - start_time
    file_size_mb = target_path.stat().st_size / (1024 * 1024)

    print(f"\n[DATA-GEN] SUCCESS: 3 Million Dataset Generation Completed!")
    print(f"[DATA-GEN] Total Invoices:         {total_invoices:,}")
    print(f"[DATA-GEN] Total Installment Rows: {total_installment_rows:,}")
    print(f"[DATA-GEN] File Size:              {file_size_mb:.2f} MB")
    print(f"[DATA-GEN] Total Generation Time:  {elapsed:.2f} seconds ({total_invoices / elapsed:,.0f} inv/sec)")

    # Save metrics JSON
    metrics = {
        "dataset_name": "CashPredix 3 Million Synthetic B2B Payment History",
        "total_invoices": total_invoices,
        "total_installment_rows": total_installment_rows,
        "num_counterparties": num_customers,
        "total_classes": 12,
        "classes": PAYMENT_CLASSES_12,
        "file_size_mb": round(file_size_mb, 2),
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "generation_time_seconds": round(elapsed, 2)
    }
    with open(OUTPUT_DIR / "large_scale_dataset_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    return target_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CashPredix 3 Million Dataset Generator")
    parser.add_argument("--count", type=int, default=3_000_000, help="Total invoices to generate (default: 3,000,000)")
    parser.add_argument("--customers", type=int, default=500, help="Number of distinct customers")
    args = parser.parse_args()

    generate_large_scale_invoices(total_invoices=args.count, num_customers=args.customers)
