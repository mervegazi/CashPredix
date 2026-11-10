#!/usr/bin/env python3
"""
CashPredix - Step 3: Multi-Output XGBoost Regressor for Divided Invoices
5-Step Hybrid Architecture: Step 3 (2nd ML Model)

Predicts:
1. part1_invoice_ratio (float, e.g., 0.50): Percentage of invoice paid in Part 1
   (Part 2 is automatically 1.00 - part1_invoice_ratio, or 0.00 if single payment)
2. part1_days_from_today (int, e.g., 3): Days from today Part 1 will be paid
3. part2_days_from_today (int, e.g., 17): Days from today Part 2 will be paid (0 if single)

Key Inputs:
- Numeric Customer Score from Step 2 (0-100)
- Invoice total amount
- Days until due date
- Historical gap between invoice parts
- Likely split payment indicator from Step 1
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
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib

logger = logging.getLogger("CashPredix.Step3Regressor")

try:
    import xgboost as xgb
    HAS_XGBOOST = True
except (ImportError, Exception) as e:
    HAS_XGBOOST = False
    logger.warning("XGBoost dynamic library (libomp) not found (%s). Using GradientBoostingRegressor as fallback.", e)
    from sklearn.ensemble import GradientBoostingRegressor


from ml.step1_payment_classifier import extract_customer_history

MODEL_DIR = BASE_DIR / "ml" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


FEATURE_COLUMNS_STEP3 = [
    "customer_score",
    "invoice_amount",
    "days_until_due",
    "historical_part_gap",
    "is_split_candidate"
]

TARGET_COLUMNS_STEP3 = [
    "part1_invoice_ratio",
    "part1_days_from_today",
    "part2_days_from_today"
]


def map_days_to_week_status(days: int, days_until_due: int) -> str:
    """Helper to convert day offsets into calendar week names and status."""
    if days <= 7:
        week_str = "This Week"
    elif days <= 14:
        week_str = "Next Week"
    elif days <= 21:
        week_str = "In 2 Weeks"
    elif days <= 28:
        week_str = "In 3 Weeks"
    else:
        week_str = f"In {days // 7} Weeks"

    status_str = "On-Time" if days <= (days_until_due + 2) else "Late"
    return f"{week_str} ({status_str})"


def prepare_regression_dataset(df_payments: pd.DataFrame) -> pd.DataFrame:
    """Build multi-output regression dataset from historical invoices."""
    df = df_payments.copy()
    df["invoice_date"] = pd.to_datetime(df["invoice_date"], errors="coerce")
    df["due_date"] = pd.to_datetime(df["due_date"], errors="coerce")
    df["payment_date"] = pd.to_datetime(df["payment_date"], errors="coerce")

    cust_stats = extract_customer_history(df)
    records = []

    for inv_num, g in df.groupby("invoice_number"):
        cid = str(g["customer_id"].iloc[0])
        c_prof = cust_stats.get(cid, {
            "historical_split_rate": 0.0,
            "avg_past_delay": 0.0,
            "historical_part_gap": 14.0
        })

        inv_amt = float(g["invoice_amount"].iloc[0])
        due_d = g["due_date"].iloc[0]
        inv_d = g["invoice_date"].iloc[0]

        # Days until due (nominal invoice term)
        days_until_due = int((due_d - inv_d).days) if pd.notna(due_d) and pd.notna(inv_d) else 30
        days_until_due = max(0, days_until_due)

        # Baseline heuristic customer score estimation for training
        split_rate = c_prof.get("historical_split_rate", 0.0)
        past_delay = c_prof.get("avg_past_delay", 0.0)
        approx_score = int(round(max(0, min(100, 95 - (past_delay * 2.0) - (split_rate * 5.0)))))

        is_split = bool(g["is_split_payment"].any() or len(g) > 1)

        if not is_split:
            ratio1 = 1.0
            p_date = g["payment_date"].iloc[0]
            dpd1 = int((p_date - inv_d).days) if pd.notna(p_date) and pd.notna(inv_d) else days_until_due
            days1 = max(1, dpd1)
            days2 = 0
            is_split_cand = 0
        else:
            g_s = g.sort_values("installment_number")
            amt1 = float(g_s.iloc[0]["amount"])
            ratio1 = amt1 / inv_amt if inv_amt > 0 else 0.50
            ratio1 = max(0.1, min(0.9, ratio1))

            p1_date = g_s.iloc[0]["payment_date"]
            p2_date = g_s.iloc[1]["payment_date"] if len(g_s) > 1 else p1_date

            dpd1 = int((p1_date - inv_d).days) if pd.notna(p1_date) and pd.notna(inv_d) else 3
            dpd2 = int((p2_date - inv_d).days) if pd.notna(p2_date) and pd.notna(inv_d) else 17

            days1 = max(1, dpd1)
            days2 = max(days1 + 1, dpd2)
            is_split_cand = 1

        records.append({
            "invoice_number": inv_num,
            "customer_score": approx_score,
            "invoice_amount": inv_amt,
            "days_until_due": days_until_due,
            "historical_part_gap": c_prof.get("historical_part_gap", 14.0),
            "is_split_candidate": is_split_cand,
            "part1_invoice_ratio": float(ratio1),
            "part1_days_from_today": int(days1),
            "part2_days_from_today": int(days2)
        })

    return pd.DataFrame(records)


class XGBoostSplitRegressor:
    """Multi-Output XGBoost Regressor predicting split ratios and payment days."""

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        if HAS_XGBOOST:
            base_estimator = xgb.XGBRegressor(
                n_estimators=100,
                learning_rate=0.08,
                max_depth=4,
                subsample=0.85,
                random_state=random_state,
                n_jobs=-1
            )
        else:
            base_estimator = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.08,
                max_depth=4,
                subsample=0.85,
                random_state=random_state
            )
        self.model = MultiOutputRegressor(base_estimator)
        self.is_trained = False


    def fit(self, X: pd.DataFrame, y: pd.DataFrame) -> Dict[str, Any]:
        """Fit multi-output regressor on 3 continuous targets."""
        logger.info("Training Multi-Output XGBoost Regressor on %d invoice schedules...", len(X))
        X_clean = X[FEATURE_COLUMNS_STEP3].fillna(0)
        self.model.fit(X_clean, y)
        self.is_trained = True

        preds = self.model.predict(X_clean)
        metrics = {}
        for idx, col in enumerate(TARGET_COLUMNS_STEP3):
            mae = float(mean_absolute_error(y[col], preds[:, idx]))
            r2 = float(r2_score(y[col], preds[:, idx]))
            metrics[col] = {"mae": round(mae, 3), "r2": round(r2, 4)}

        logger.info("XGBoost Regressor Training Metrics: %s", metrics)
        return metrics

    def predict_schedule(
        self,
        customer_score: int,
        invoice_amount: float,
        days_until_due: int = 30,
        historical_part_gap: float = 14.0,
        is_split: bool = True
    ) -> Dict[str, Any]:
        """
        Generate 3 numeric prediction outputs:
        - part1_invoice_ratio (float)
        - part1_days_from_today (int)
        - part2_days_from_today (int)
        """
        if not self.is_trained:
            raise RuntimeError("Model must be trained before inference.")

        # Single payment rule
        if not is_split:
            # Predict single payment timing
            feat_row = pd.DataFrame([{
                "customer_score": float(customer_score),
                "invoice_amount": float(invoice_amount),
                "days_until_due": float(days_until_due),
                "historical_part_gap": float(historical_part_gap),
                "is_split_candidate": 0
            }])[FEATURE_COLUMNS_STEP3]
            preds = self.model.predict(feat_row)[0]
            days1 = max(1, int(round(preds[1])))

            return {
                "is_divided_invoice": False,
                "part1_invoice_ratio": 1.00,
                "part2_invoice_ratio": 0.00,
                "part1_days_from_today": days1,
                "part2_days_from_today": 0,
                "part1_amount": round(float(invoice_amount), 2),
                "part2_amount": 0.00,
                "part1_week_status": map_days_to_week_status(days1, days_until_due),
                "part2_week_status": "N/A (Single Payment)"
            }

        # Divided invoice prediction
        feat_row = pd.DataFrame([{
            "customer_score": float(customer_score),
            "invoice_amount": float(invoice_amount),
            "days_until_due": float(days_until_due),
            "historical_part_gap": float(historical_part_gap),
            "is_split_candidate": 1
        }])[FEATURE_COLUMNS_STEP3]

        preds = self.model.predict(feat_row)[0]

        # Constrain ratio between 0.10 and 0.90 (typical 0.50)
        ratio1 = round(float(np.clip(preds[0], 0.20, 0.80)), 2)
        ratio2 = round(1.00 - ratio1, 2)

        days1 = max(1, int(round(preds[1])))
        days2 = max(days1 + 3, int(round(preds[2])))

        amt1 = round(float(invoice_amount * ratio1), 2)
        amt2 = round(float(invoice_amount - amt1), 2)

        return {
            "is_divided_invoice": True,
            "part1_invoice_ratio": ratio1,
            "part2_invoice_ratio": ratio2,
            "part1_days_from_today": days1,
            "part2_days_from_today": days2,
            "part1_amount": amt1,
            "part2_amount": amt2,
            "part1_week_status": map_days_to_week_status(days1, days_until_due),
            "part2_week_status": map_days_to_week_status(days2, days_until_due)
        }

    def save(self, filepath: Optional[Path] = None) -> Path:
        target = filepath or (MODEL_DIR / "xgboost_split_regressor.joblib")
        payload = {
            "model": self.model,
            "feature_columns": FEATURE_COLUMNS_STEP3,
            "target_columns": TARGET_COLUMNS_STEP3
        }
        joblib.dump(payload, target)
        logger.info("Saved XGBoost regressor to %s", target)
        return target

    @classmethod
    def load(cls, filepath: Optional[Path] = None) -> "XGBoostSplitRegressor":
        target = filepath or (MODEL_DIR / "xgboost_split_regressor.joblib")
        payload = joblib.load(target)
        reg = cls()
        reg.model = payload["model"]
        reg.is_trained = True
        return reg


def train_step3_model(csv_path: Optional[Path] = None, max_samples: Optional[int] = 50_000) -> Tuple[XGBoostSplitRegressor, Dict[str, Any]]:
    """Train Multi-Output XGBoost regressor on dataset."""
    large_csv = BASE_DIR / "data" / "synthetic" / "payment_history_large.csv"
    default_csv = BASE_DIR / "data" / "synthetic" / "payment_history.csv"
    target_csv = csv_path or (large_csv if large_csv.exists() else default_csv)

    logger.info("Loading regression training data from %s...", target_csv)
    if max_samples and target_csv == large_csv:
        df = pd.read_csv(target_csv, nrows=max_samples * 2)
    else:
        df = pd.read_csv(target_csv)

    dataset = prepare_regression_dataset(df)
    if max_samples and len(dataset) > max_samples:
        dataset = dataset.sample(n=max_samples, random_state=42)

    X = dataset[FEATURE_COLUMNS_STEP3]
    y = dataset[TARGET_COLUMNS_STEP3]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )


    reg = XGBoostSplitRegressor(random_state=42)
    reg.fit(X_train, y_train)

    test_preds = reg.model.predict(X_test)
    eval_metrics = {}
    for idx, col in enumerate(TARGET_COLUMNS_STEP3):
        mae = float(mean_absolute_error(y_test[col], test_preds[:, idx]))
        r2 = float(r2_score(y_test[col], test_preds[:, idx]))
        eval_metrics[col] = {"test_mae": round(mae, 3), "test_r2": round(r2, 4)}

    reg.save()
    return reg, eval_metrics


if __name__ == "__main__":
    reg, metrics = train_step3_model()
    print("\n" + "=" * 65)
    print(" STEP 3: MULTI-OUTPUT XGBOOST REGRESSOR")
    print("=" * 65)
    for col, m in metrics.items():
        print(f"  - {col:<24}: MAE = {m['test_mae']}, R² = {m['test_r2']}")

    # Example test from PDF: $10,000 invoice with score 87
    example_schedule = reg.predict_schedule(
        customer_score=87,
        invoice_amount=10000.0,
        days_until_due=30,
        is_split=True
    )
    print("\n Example Prediction for $10,000 Invoice (Customer Score = 87):")
    import json
    print(json.dumps(example_schedule, indent=2))
    print("=" * 65)
