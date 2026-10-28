#!/usr/bin/env python3
"""
CashPredix - Feature Engineering & Statistical Filtering Module
Week 4: Issue #18

Key Responsibilities:
1. Statistical outlier filtering and Winsorization (Z-score and IQR methods)
2. Normalization of customer payment timelines relative to contract terms
3. Rich customer-level behavioral feature extraction:
   - Central tendency (mean, median delay)
   - Dispersion & volatility (std, variance, IQR)
   - Performance ratios (on-time rate, severe late rate, default rate)
   - Volume-weighted metrics (amount-weighted delay)
   - Behavioral signals (early discount utilization, split payment ratio, payment frequency)
   - Recency-weighted delay trend (exponential decay and 6-month drift)
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List

# Ensure repository root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import numpy as np
import pandas as pd
from scipy import stats


logger = logging.getLogger("CashPredix.FeatureEngineering")


def parse_payment_terms_to_days(term_str: Any) -> int:
    """Extract nominal credit period in calendar days from term strings."""
    if not isinstance(term_str, str) or not term_str.strip():
        return 30
    term = term_str.strip().lower()
    if "receipt" in term:
        return 0
    if "net" in term:
        # e.g., 'net 30', 'net 60', '2/10 net 30'
        parts = term.split("net")
        if len(parts) > 1:
            digits = "".join(filter(str.isdigit, parts[1]))
            if digits:
                return int(digits)
    # Default fallback
    return 30


def apply_statistical_filtering(
    df: pd.DataFrame,
    method: str = "iqr",
    target_columns: Optional[List[str]] = None,
    iqr_multiplier: float = 1.5,
    z_threshold: float = 3.5,
    action: str = "clip"
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Apply statistical outlier detection and handling (clipping/Winsorization or dropping).

    Args:
        df: Input DataFrame containing payments
        method: 'iqr' or 'zscore' or 'both'
        target_columns: Columns to inspect (default: ['amount', 'days_past_due'])
        iqr_multiplier: Multiplier for IQR threshold (typical 1.5 to 3.0)
        z_threshold: Z-score cutoff (typical 3.0 to 4.0)
        action: 'clip' (Winsorize to bounds) or 'drop' (remove outlier records)

    Returns:
        Filtered DataFrame and statistical audit metadata dictionary.
    """
    df_clean = df.copy()
    if target_columns is None:
        target_columns = ["amount", "days_past_due"]

    audit = {
        "method": method,
        "action": action,
        "outliers_detected": {},
        "bounds_applied": {},
        "records_dropped": 0
    }

    drop_mask = pd.Series(False, index=df_clean.index)

    for col in target_columns:
        if col not in df_clean.columns:
            continue

        series = pd.to_numeric(df_clean[col], errors="coerce").fillna(0)
        outlier_indices = pd.Series(False, index=df_clean.index)
        lower_bound = float("-inf")
        upper_bound = float("inf")

        if method in ("iqr", "both"):
            q25 = series.quantile(0.25)
            q75 = series.quantile(0.75)
            iqr = q75 - q25
            iqr_lower = q25 - (iqr_multiplier * iqr)
            iqr_upper = q75 + (iqr_multiplier * iqr)

            # Amounts cannot be negative
            if col == "amount":
                iqr_lower = max(0.0, iqr_lower)

            lower_bound = iqr_lower
            upper_bound = iqr_upper
            outlier_indices = (series < iqr_lower) | (series > iqr_upper)

        if method in ("zscore", "both"):
            mean = series.mean()
            std = series.std(ddof=0)
            if std > 0:
                z_scores = np.abs((series - mean) / std)
                z_outliers = z_scores > z_threshold
                if method == "zscore":
                    outlier_indices = z_outliers
                    lower_bound = max(0.0 if col == "amount" else -9999, mean - (z_threshold * std))
                    upper_bound = mean + (z_threshold * std)
                else:
                    # 'both' method combines intersection for conservative extreme detection
                    outlier_indices = outlier_indices & z_outliers

        outlier_count = int(outlier_indices.sum())
        audit["outliers_detected"][col] = outlier_count
        audit["bounds_applied"][col] = {
            "lower_bound": round(float(lower_bound), 2),
            "upper_bound": round(float(upper_bound), 2)
        }

        if action == "clip":
            df_clean[col] = df_clean[col].clip(lower=lower_bound, upper=upper_bound)
        elif action == "drop":
            drop_mask = drop_mask | outlier_indices

    if action == "drop":
        audit["records_dropped"] = int(drop_mask.sum())
        df_clean = df_clean[~drop_mask].reset_index(drop=True)

    logger.info("Statistical filtering completed: %s", audit)
    return df_clean, audit


def normalize_payment_timelines(
    df: pd.DataFrame,
    df_customers: Optional[pd.DataFrame] = None
) -> pd.DataFrame:
    """
    Normalize payment timelines relative to customer payment terms.
    Calculates:
    - payment_term_days: nominal agreement window
    - relative_delay_ratio: delay / term_days
    - normalized_timeline_score: bounded index 0 (extreme delay) to 1 (early/on-time)
    """
    df_norm = df.copy()

    # Join customer payment terms if available
    if df_customers is not None and not df_customers.empty and "payment_terms" in df_customers.columns:
        cust_terms = dict(zip(df_customers["id"].astype(str), df_customers["payment_terms"]))
        df_norm["contract_terms"] = df_norm["customer_id"].astype(str).map(cust_terms).fillna("Net 30")
    elif "payment_terms" in df_norm.columns:
        df_norm["contract_terms"] = df_norm["payment_terms"].fillna("Net 30")
    else:
        df_norm["contract_terms"] = "Net 30"

    df_norm["term_days"] = df_norm["contract_terms"].apply(parse_payment_terms_to_days).clip(lower=1)

    # Relative delay ratio: 0.0 means paid exactly on due date; 1.0 means delay was as long as full term
    df_norm["relative_delay_ratio"] = df_norm["days_past_due"] / df_norm["term_days"]

    # Normalized timeline score (Sigmoid-like bounded transform [0, 1])
    # 0 delay => ~0.85, early => close to 1.0, severe delay => close to 0.0
    k = 0.1
    df_norm["timeline_reliability_norm"] = 1.0 / (1.0 + np.exp(k * df_norm["days_past_due"]))

    return df_norm


def compute_customer_features(
    df_payments: pd.DataFrame,
    reference_date: Optional[pd.Timestamp] = None
) -> pd.DataFrame:
    """
    Aggregate raw invoice and payment records into structured customer-level ML features.

    Features generated per counterparty:
    - total_invoices: Total count of historical invoices
    - total_volume: Total invoiced amount ($)
    - avg_invoice_amount: Average invoice size
    - avg_delay_days: Mean days past due
    - median_delay_days: Robust median delay
    - delay_std: Delay standard deviation (volatility)
    - delay_iqr: Interquartile range of delay
    - amount_weighted_delay: Exposure-weighted average delay
    - on_time_rate: Share of invoices paid on or before due date
    - late_rate: Share of invoices paid late
    - severe_late_rate: Share of invoices delayed > 30 days
    - missed_default_rate: Invoices completely defaulted / missed
    - avg_payment_cadence_days: Regularity interval between invoices
    - split_payment_ratio: Share of invoices settled via installments
    - early_discount_ratio: Share capturing early settlement discount
    - recent_delay_trend: Weighted slope/drift in delay over recent timeline
    """
    df = df_payments.copy()
    if "customer_id" not in df.columns:
        raise ValueError("DataFrame must contain 'customer_id' column")

    # Determine reference date
    if reference_date is None:
        if "invoice_date" in df.columns and df["invoice_date"].notna().any():
            reference_date = df["invoice_date"].max()
        else:
            reference_date = pd.Timestamp.now()

    customer_records = []

    for cust_id, group in df.groupby("customer_id"):
        n_invoices = len(group)
        amounts = group["amount"].astype(float)
        total_vol = float(amounts.sum())
        avg_amt = float(amounts.mean()) if n_invoices > 0 else 0.0

        delays = group["days_past_due"].astype(float)
        mean_delay = float(delays.mean())
        median_delay = float(delays.median())
        delay_std = float(delays.std(ddof=0)) if n_invoices > 1 else 0.0
        q75, q25 = np.percentile(delays, [75, 25]) if n_invoices >= 2 else (mean_delay, mean_delay)
        delay_iqr = float(q75 - q25)

        # Amount-weighted delay
        if total_vol > 0:
            weighted_delay = float((delays * amounts).sum() / total_vol)
        else:
            weighted_delay = mean_delay

        # Ratios
        on_time_count = (delays <= 0).sum()
        late_count = (delays > 0).sum()
        severe_late_count = (delays > 30).sum()
        missed_count = (group["status"].str.upper() == "MISSED").sum()

        on_time_rate = float(on_time_count / n_invoices)
        late_rate = float(late_count / n_invoices)
        severe_late_rate = float(severe_late_count / n_invoices)
        default_rate = float(missed_count / n_invoices)

        # Split payments & discounts
        split_count = group["is_split_payment"].astype(bool).sum() if "is_split_payment" in group.columns else 0
        discount_count = group["early_discount_applied"].astype(bool).sum() if "early_discount_applied" in group.columns else 0

        split_ratio = float(split_count / n_invoices)
        discount_ratio = float(discount_count / n_invoices)

        # Cadence (average interval between invoice dates)
        cadence_days = 30.0
        if "invoice_date" in group.columns and group["invoice_date"].notna().sum() >= 2:
            sorted_dates = group["invoice_date"].dropna().sort_values()
            diffs = (sorted_dates - sorted_dates.shift(1)).dt.days.dropna()
            if len(diffs) > 0 and diffs.mean() > 0:
                cadence_days = float(diffs.mean())

        # Recency-weighted delay trend (exponential decay: recent events have higher weights)
        recency_weighted_delay = mean_delay
        trend_drift = 0.0
        if "invoice_date" in group.columns and group["invoice_date"].notna().sum() >= 2:
            sorted_group = group.sort_values("invoice_date")
            days_ago = (reference_date - sorted_group["invoice_date"]).dt.days.clip(lower=0)
            # Half life = 90 days
            weights = np.exp(-days_ago / 90.0)
            if weights.sum() > 0:
                recency_weighted_delay = float((sorted_group["days_past_due"] * weights).sum() / weights.sum())

            # Trend drift: difference between last 3 invoices vs first 3 invoices
            if len(sorted_group) >= 6:
                recent_avg = float(sorted_group.tail(3)["days_past_due"].mean())
                older_avg = float(sorted_group.head(3)["days_past_due"].mean())
                trend_drift = float(recent_avg - older_avg)

        customer_records.append({
            "customer_id": str(cust_id),
            "total_invoices": n_invoices,
            "total_volume": round(total_vol, 2),
            "avg_invoice_amount": round(avg_amt, 2),
            "avg_delay_days": round(mean_delay, 2),
            "median_delay_days": round(median_delay, 2),
            "delay_std": round(delay_std, 2),
            "delay_iqr": round(delay_iqr, 2),
            "amount_weighted_delay": round(weighted_delay, 2),
            "recency_weighted_delay": round(recency_weighted_delay, 2),
            "delay_trend_drift": round(trend_drift, 2),
            "on_time_rate": round(on_time_rate, 4),
            "late_rate": round(late_rate, 4),
            "severe_late_rate": round(severe_late_rate, 4),
            "default_rate": round(default_rate, 4),
            "avg_payment_cadence_days": round(cadence_days, 1),
            "split_payment_ratio": round(split_ratio, 4),
            "early_discount_ratio": round(discount_ratio, 4)
        })

    features_df = pd.DataFrame(customer_records)
    logger.info("Engineered %d features for %d customers", len(features_df.columns) - 1, len(features_df))
    return features_df


def engineer_features_pipeline(
    df_payments: pd.DataFrame,
    df_customers: Optional[pd.DataFrame] = None
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Complete end-to-end feature engineering and statistical filtering pipeline.
    """
    # 1. Statistical filtering
    filtered_payments, audit = apply_statistical_filtering(
        df_payments,
        method="iqr",
        target_columns=["amount", "days_past_due"],
        action="clip"
    )

    # 2. Timeline normalization
    norm_payments = normalize_payment_timelines(filtered_payments, df_customers)

    # 3. Customer feature aggregation
    cust_features = compute_customer_features(norm_payments)

    return norm_payments, cust_features, audit


if __name__ == "__main__":
    from ml.data_pipeline import run_pipeline

    print("Running CashPredix Feature Engineering Pipeline...")
    data = run_pipeline(source_preference="auto")
    payments_clean = data["payments"]
    customers = data.get("customers")

    norm_payments, cust_features, audit = engineer_features_pipeline(payments_clean, customers)

    print("\n" + "=" * 65)
    print(" FEATURE ENGINEERING & STATISTICAL FILTERING REPORT")
    print("=" * 65)
    print(f" Total Invoices Filtered:      {len(norm_payments)}")
    print(f" Outliers Bounded (Amount):    {audit['outliers_detected'].get('amount', 0)}")
    print(f" Outliers Bounded (Delay):     {audit['outliers_detected'].get('days_past_due', 0)}")
    print(f" Unique Customers Feature-Set: {len(cust_features)}")
    print(f" Feature Columns Extracted:    {len(cust_features.columns)}")
    print("\n Sample Engineered Customer Features (Top 3):")
    cols_to_show = ["customer_id", "total_invoices", "avg_delay_days", "on_time_rate", "amount_weighted_delay", "delay_std"]
    print(cust_features[cols_to_show].head(3).to_string(index=False))
    print("=" * 65)
