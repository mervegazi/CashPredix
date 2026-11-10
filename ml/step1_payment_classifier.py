#!/usr/bin/env python3
"""
CashPredix - Step 1: LightGBM Multi-Class Payment Behavior Classifier (6 Classes)
5-Step Hybrid Architecture: Step 1 (1st ML Model)

Predicts how the customer will pay an invoice:
1. P_single_early: Single Payment, >= 3 days early
2. P_single_ontime: Single Payment, on-time (+/- 2 days)
3. P_single_late: Single Payment, after due date
4. P_split_both_ontime: Divided in 2 parts, both on or before due date
5. P_split_part1_ontime_part2_late: Divided in 2 parts, Part 1 on-time, Part 2 late
6. P_split_part1_late_part2_ontime: Divided in 2 parts, Part 1 late, Part 2 on-time

Key Inputs:
- Customer's past invoice payment delays (mean, median, std)
- Historical invoice split rate
- Current invoice amount vs. customer average
- Current invoice amount
- Contract payment terms
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

import logging
logger = logging.getLogger("CashPredix.Step1Classifier")

try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except (ImportError, OSError) as e:
    HAS_LIGHTGBM = False
    logger.warning("LightGBM dynamic library (libomp) not found (%s). Using HistGradientBoostingClassifier as identical histogram gradient booster.", e)
    from sklearn.ensemble import HistGradientBoostingClassifier

MODEL_DIR = BASE_DIR / "ml" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


PAYMENT_CLASSES = [
    "P_single_early",
    "P_single_ontime",
    "P_single_late",
    "P_split_both_ontime",
    "P_split_part1_ontime_part2_late",
    "P_split_part1_late_part2_ontime"
]

FEATURE_COLUMNS = [
    "invoice_amount",
    "historical_split_rate",
    "avg_past_delay",
    "median_past_delay",
    "delay_std",
    "cust_avg_amount",
    "amount_vs_cust_avg_ratio",
    "historical_part_gap"
]


def extract_customer_history(df_payments: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    """Compute historical behavior profiles per customer from payment history."""
    df = df_payments.copy()
    df["payment_date"] = pd.to_datetime(df["payment_date"], errors="coerce")
    cust_stats = {}

    for cid, g in df.groupby("customer_id"):
        unique_invs = g["invoice_number"].nunique()
        split_invs = g[g["is_split_payment"] == True]["invoice_number"].nunique()
        split_rate = float(split_invs / unique_invs) if unique_invs > 0 else 0.0
        avg_delay = float(g["days_past_due"].mean())
        median_delay = float(g["days_past_due"].median())
        std_delay = float(g["days_past_due"].std(ddof=0)) if len(g) > 1 else 0.0
        avg_amt = float(g["invoice_amount"].mean())

        # Gap between parts for divided invoices
        gaps = []
        for inv, ig in g.groupby("invoice_number"):
            if len(ig) > 1:
                ig_s = ig.sort_values("installment_number")
                d1 = ig_s.iloc[0]["payment_date"]
                d2 = ig_s.iloc[1]["payment_date"]
                if pd.notna(d1) and pd.notna(d2):
                    gaps.append((d2 - d1).days)
        avg_gap = float(np.mean(gaps)) if gaps else 14.0

        cust_stats[str(cid)] = {
            "historical_split_rate": round(split_rate, 4),
            "avg_past_delay": round(avg_delay, 2),
            "median_past_delay": round(median_delay, 2),
            "delay_std": round(std_delay, 2),
            "cust_avg_amount": round(avg_amt, 2),
            "historical_part_gap": round(avg_gap, 1)
        }

    return cust_stats


def label_invoice_payment_class(g: pd.DataFrame) -> str:
    """Label an invoice into one of the 6 payment classes based on payment dates."""
    is_split = bool(g["is_split_payment"].any() or len(g) > 1)

    if not is_split:
        dpd = float(g["days_past_due"].iloc[0])
        if dpd <= -3:
            return "P_single_early"
        elif -2 <= dpd <= 2:
            return "P_single_ontime"
        else:
            return "P_single_late"
    else:
        g_s = g.sort_values("installment_number")
        dpd1 = float(g_s.iloc[0]["days_past_due"])
        dpd2 = float(g_s.iloc[1]["days_past_due"]) if len(g_s) > 1 else dpd1
        p1_on = dpd1 <= 2
        p2_on = dpd2 <= 2

        if p1_on and p2_on:
            return "P_split_both_ontime"
        elif p1_on and not p2_on:
            return "P_split_part1_ontime_part2_late"
        elif not p1_on and p2_on:
            return "P_split_part1_late_part2_ontime"
        else:
            # Both late: map to Part 1 on-time / Part 2 late cohort
            return "P_split_part1_ontime_part2_late"


def prepare_classification_dataset(df_payments: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Dict[str, float]]]:
    """Build feature table where each row is a distinct invoice."""
    cust_stats = extract_customer_history(df_payments)
    rows = []

    for inv_num, g in df_payments.groupby("invoice_number"):
        cid = str(g["customer_id"].iloc[0])
        inv_amt = float(g["invoice_amount"].iloc[0])
        c_prof = cust_stats.get(cid, {
            "historical_split_rate": 0.0,
            "avg_past_delay": 0.0,
            "median_past_delay": 0.0,
            "delay_std": 0.0,
            "cust_avg_amount": inv_amt,
            "historical_part_gap": 14.0
        })

        cust_avg = c_prof["cust_avg_amount"]
        amt_ratio = float(inv_amt / cust_avg) if cust_avg > 0 else 1.0
        target_cls = label_invoice_payment_class(g)

        rows.append({
            "invoice_number": inv_num,
            "customer_id": cid,
            "invoice_amount": inv_amt,
            "historical_split_rate": c_prof["historical_split_rate"],
            "avg_past_delay": c_prof["avg_past_delay"],
            "median_past_delay": c_prof["median_past_delay"],
            "delay_std": c_prof["delay_std"],
            "cust_avg_amount": cust_avg,
            "amount_vs_cust_avg_ratio": round(amt_ratio, 3),
            "historical_part_gap": c_prof["historical_part_gap"],
            "target_class": target_cls,
            "target_label": PAYMENT_CLASSES.index(target_cls)
        })

    dataset = pd.DataFrame(rows)
    return dataset, cust_stats


class LightGBMPaymentClassifier:
    """LightGBM 6-class classifier predicting invoice payment probabilities."""

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.classes = PAYMENT_CLASSES
        if HAS_LIGHTGBM:
            self.model = lgb.LGBMClassifier(
                objective="multiclass",
                num_class=6,
                n_estimators=100,
                learning_rate=0.08,
                num_leaves=31,
                random_state=random_state,
                verbose=-1
            )
        else:
            self.model = HistGradientBoostingClassifier(
                max_iter=100,
                learning_rate=0.08,
                max_leaf_nodes=31,
                random_state=random_state
            )
        self.is_trained = False
        self.cust_profiles = {}


    def fit(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """Fit LightGBM model on training features."""
        logger.info("Training LightGBM Multi-Class Classifier on %d invoices...", len(X))
        X_clean = X[FEATURE_COLUMNS].fillna(0)
        self.model.fit(X_clean, y)
        self.is_trained = True

        preds = self.model.predict(X_clean)
        acc = float(accuracy_score(y, preds))
        logger.info("LightGBM Training Accuracy: %.4f", acc)
        return {"accuracy": acc}

    def predict_probabilities(
        self,
        invoice_amount: float,
        customer_id: str,
        cust_profile: Optional[Dict[str, float]] = None
    ) -> Dict[str, float]:
        """
        Predict the 6 payment probabilities for a given invoice.
        Returns:
            Dictionary with {class_name: probability (0.00 - 1.00)}, summing to 1.00.
        """
        if not self.is_trained:
            raise RuntimeError("Model must be trained before predicting.")

        if cust_profile is None:
            cust_profile = self.cust_profiles.get(customer_id, {
                "historical_split_rate": 0.2,
                "avg_past_delay": 0.0,
                "median_past_delay": 0.0,
                "delay_std": 5.0,
                "cust_avg_amount": invoice_amount,
                "historical_part_gap": 14.0
            })

        cust_avg = cust_profile.get("cust_avg_amount", invoice_amount)
        amt_ratio = float(invoice_amount / cust_avg) if cust_avg > 0 else 1.0

        feat_row = pd.DataFrame([{
            "invoice_amount": float(invoice_amount),
            "historical_split_rate": float(cust_profile.get("historical_split_rate", 0.0)),
            "avg_past_delay": float(cust_profile.get("avg_past_delay", 0.0)),
            "median_past_delay": float(cust_profile.get("median_past_delay", 0.0)),
            "delay_std": float(cust_profile.get("delay_std", 0.0)),
            "cust_avg_amount": float(cust_avg),
            "amount_vs_cust_avg_ratio": float(amt_ratio),
            "historical_part_gap": float(cust_profile.get("historical_part_gap", 14.0))
        }])[FEATURE_COLUMNS]

        raw_probs = self.model.predict_proba(feat_row)[0]
        # Ensure sum == 1.00
        prob_sum = sum(raw_probs)
        normalized = (raw_probs / prob_sum) if prob_sum > 0 else raw_probs

        result = {}
        for cls_name, p in zip(self.classes, normalized):
            result[cls_name] = round(float(p), 4)

        return result

    def save(self, filepath: Optional[Path] = None) -> Path:
        target = filepath or (MODEL_DIR / "lightgbm_payment_classifier.joblib")
        payload = {
            "model": self.model,
            "classes": self.classes,
            "feature_columns": FEATURE_COLUMNS,
            "cust_profiles": self.cust_profiles
        }
        joblib.dump(payload, target)
        logger.info("Saved LightGBM model to %s", target)
        return target

    @classmethod
    def load(cls, filepath: Optional[Path] = None) -> "LightGBMPaymentClassifier":
        target = filepath or (MODEL_DIR / "lightgbm_payment_classifier.joblib")
        payload = joblib.load(target)
        clf = cls()
        clf.model = payload["model"]
        clf.classes = payload["classes"]
        clf.cust_profiles = payload.get("cust_profiles", {})
        clf.is_trained = True
        return clf


def train_step1_model(csv_path: Optional[Path] = None, max_samples: Optional[int] = 50_000) -> Tuple[LightGBMPaymentClassifier, Dict[str, Any]]:
    """Train and evaluate Step 1 LightGBM classifier on the payment history dataset."""
    large_csv = BASE_DIR / "data" / "synthetic" / "payment_history_large.csv"
    default_csv = BASE_DIR / "data" / "synthetic" / "payment_history.csv"
    target_csv = csv_path or (large_csv if large_csv.exists() else default_csv)

    logger.info("Loading training data from %s...", target_csv)
    if max_samples and target_csv == large_csv:
        # Load up to max_samples for fast, memory-safe high-scale training
        df = pd.read_csv(target_csv, nrows=max_samples * 2)
    else:
        df = pd.read_csv(target_csv)

    dataset, cust_profiles = prepare_classification_dataset(df)
    if max_samples and len(dataset) > max_samples:
        dataset = dataset.sample(n=max_samples, random_state=42)

    X = dataset[FEATURE_COLUMNS]
    y = dataset["target_label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )


    clf = LightGBMPaymentClassifier(random_state=42)
    clf.cust_profiles = cust_profiles
    clf.fit(X_train, y_train)

    test_preds = clf.model.predict(X_test)
    acc = float(accuracy_score(y_test, test_preds))
    rep = classification_report(y_test, test_preds, target_names=PAYMENT_CLASSES, output_dict=True)

    clf.save()

    metrics = {
        "test_accuracy": round(acc, 4),
        "total_invoices": len(dataset),
        "class_distribution": dataset["target_class"].value_counts().to_dict(),
        "classification_report": rep
    }
    return clf, metrics


if __name__ == "__main__":
    clf, metrics = train_step1_model()
    print("\n" + "=" * 65)
    print(" STEP 1: LightGBM MULTI-CLASS PAYMENT CLASSIFIER")
    print("=" * 65)
    print(f" Total Invoices Evaluated:     {metrics['total_invoices']}")
    print(f" Hold-Out Test Accuracy:       {metrics['test_accuracy'] * 100:.2f}%")
    print("\n 6 Payment Classes Distribution:")
    for cls_name, count in metrics["class_distribution"].items():
        print(f"  - {cls_name:<32}: {count:>5}")

    # Example test
    sample_cid = list(clf.cust_profiles.keys())[0]
    sample_probs = clf.predict_probabilities(10000.0, sample_cid)
    print("\n Example Prediction for $10,000 Invoice:")
    import json
    print(json.dumps(sample_probs, indent=2))
    print("=" * 65)
