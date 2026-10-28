#!/usr/bin/env python3
"""
CashPredix - Core Behavioral Scoring Algorithm
Week 4: Issue #19

Key Responsibilities:
1. Supervised Machine Learning scoring model using Gradient Boosting & Random Forest
2. Calibration of behavioral reliability score to a standardized 0-100 scale
3. Explainability: extraction of feature contributions and risk drivers
4. Train / Hold-Out test evaluation on synthetic enterprise customer data
5. Tier classification and liquidity mitigation recommendations
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib

logger = logging.getLogger("CashPredix.BehavioralScoring")

MODEL_DIR = BASE_DIR / "ml" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


FEATURE_COLUMNS = [
    "total_invoices",
    "total_volume",
    "avg_invoice_amount",
    "avg_delay_days",
    "median_delay_days",
    "delay_std",
    "delay_iqr",
    "amount_weighted_delay",
    "recency_weighted_delay",
    "delay_trend_drift",
    "on_time_rate",
    "late_rate",
    "severe_late_rate",
    "default_rate",
    "avg_payment_cadence_days",
    "split_payment_ratio",
    "early_discount_ratio"
]


def construct_ground_truth_target(df_features: pd.DataFrame) -> pd.Series:
    """
    Construct continuous ground-truth behavioral reliability target (0 to 100)
    for model training based on empirical cash-flow health metrics:
    - On-time payment rate (+50 pts max)
    - Delay severity penalty (-40 pts max)
    - Volatility & unpredictability penalty (-15 pts max)
    - Default / missed payment penalty (-25 pts max)
    - Early discount bonus (+10 pts max)
    - Positive trend bonus / negative drift penalty (+/- 5 pts)
    """
    # 1. Base on-time component (0 to 50)
    on_time_score = df_features["on_time_rate"] * 50.0

    # 2. Delay component (scaled: delay <= 0 => 35 pts, delay = 30 => 10 pts, delay >= 60 => 0 pts)
    # Exponential decay function of delay
    delay_score = 35.0 * np.exp(-np.maximum(0, df_features["amount_weighted_delay"]) / 18.0)

    # 3. Volatility penalty: high variance in payments lowers predictability
    volatility_penalty = np.minimum(15.0, df_features["delay_std"] * 0.75)

    # 4. Default / severe delinquency penalty
    severe_penalty = (df_features["severe_late_rate"] * 20.0) + (df_features["default_rate"] * 30.0)

    # 5. Incentives & trend
    early_bonus = df_features["early_discount_ratio"] * 8.0
    drift_impact = -np.clip(df_features["delay_trend_drift"] * 0.5, -5.0, 5.0)

    raw_target = on_time_score + delay_score - volatility_penalty - severe_penalty + early_bonus + drift_impact
    calibrated_target = np.clip(raw_target, 0.0, 100.0)
    return pd.Series(calibrated_target, index=df_features.index, name="target_reliability_score")


def get_risk_tier(score: float) -> Dict[str, str]:
    """Map numeric score (0-100) to corporate risk tier and recommendation."""
    if score >= 88.0:
        return {
            "tier": "Prime / Benchmark",
            "risk_level": "Minimal",
            "color": "emerald",
            "action": "Maintain optimal commercial credit terms (e.g., Net 30/60) with early payment discounts."
        }
    elif score >= 72.0:
        return {
            "tier": "Investment Grade / Stable",
            "risk_level": "Low",
            "color": "blue",
            "action": "Standard credit terms. Periodic working capital monitoring recommended."
        }
    elif score >= 50.0:
        return {
            "tier": "Watchlist / Moderate Risk",
            "risk_level": "Moderate",
            "color": "amber",
            "action": "Tighten payment terms to Net 15 or require milestone-based installment schedule."
        }
    else:
        return {
            "tier": "High Risk / Distressed",
            "risk_level": "High",
            "color": "rose",
            "action": "Immediate liquidity safeguard: Advance payment / Escrow / Invoice Factoring recommended."
        }


class BehavioralScoringEngine:
    """
    Supervised Machine Learning Behavioral Scoring Model with
    dual Gradient Boosting and Random Forest regression.
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.model = GradientBoostingRegressor(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=4,
            subsample=0.85,
            random_state=random_state
        )
        self.rf_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=5,
            random_state=random_state
        )
        self.feature_names = FEATURE_COLUMNS
        self.is_trained = False
        self.feature_importances_ = {}
        self.metrics_ = {}

    def fit(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: Optional[pd.DataFrame] = None,
        y_val: Optional[pd.Series] = None
    ) -> Dict[str, Any]:
        """Train the ensemble scoring model."""
        logger.info("Training Behavioral Scoring Engine on %d customer records...", len(X_train))

        X_train_clean = X_train[self.feature_names].fillna(0)
        self.model.fit(X_train_clean, y_train)
        self.rf_model.fit(X_train_clean, y_train)
        self.is_trained = True

        # Compute feature importances
        gb_imp = self.model.feature_importances_
        rf_imp = self.rf_model.feature_importances_
        avg_imp = (gb_imp + rf_imp) / 2.0
        self.feature_importances_ = {
            feat: round(float(imp), 4)
            for feat, imp in sorted(zip(self.feature_names, avg_imp), key=lambda x: x[1], reverse=True)
        }

        # Training metrics
        train_pred = self.predict(X_train_clean)
        self.metrics_["train_rmse"] = round(float(np.sqrt(mean_squared_error(y_train, train_pred))), 3)
        self.metrics_["train_mae"] = round(float(mean_absolute_error(y_train, train_pred)), 3)
        self.metrics_["train_r2"] = round(float(r2_score(y_train, train_pred)), 4)

        if X_val is not None and y_val is not None:
            val_pred = self.predict(X_val)
            self.metrics_["val_rmse"] = round(float(np.sqrt(mean_squared_error(y_val, val_pred))), 3)
            self.metrics_["val_mae"] = round(float(mean_absolute_error(y_val, val_pred)), 3)
            self.metrics_["val_r2"] = round(float(r2_score(y_val, val_pred)), 4)

        logger.info("Training complete. Metrics: %s", self.metrics_)
        return self.metrics_

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Predict continuous reliability score [0, 100]."""
        if not self.is_trained:
            raise RuntimeError("Model has not been trained yet.")
        X_clean = X[self.feature_names].fillna(0)
        # Weighted ensemble (65% Gradient Boosting + 35% Random Forest)
        gb_preds = self.model.predict(X_clean)
        rf_preds = self.rf_model.predict(X_clean)
        ensemble_preds = (0.65 * gb_preds) + (0.35 * rf_preds)
        return np.clip(ensemble_preds, 0.0, 100.0)

    def score_customers(self, df_features: pd.DataFrame) -> pd.DataFrame:
        """
        Produce comprehensive scoring report with risk tier, confidence,
        and action items for each counterparty.
        """
        predictions = self.predict(df_features)
        results = []

        for idx, (original_idx, row) in enumerate(df_features.iterrows()):
            score = round(float(predictions[idx]), 1)
            tier_info = get_risk_tier(score)

            results.append({
                "customer_id": str(row["customer_id"]),
                "behavioral_score": score,
                "tier": tier_info["tier"],
                "risk_level": tier_info["risk_level"],
                "on_time_rate": round(float(row.get("on_time_rate", 0)) * 100, 1),
                "avg_delay_days": round(float(row.get("avg_delay_days", 0)), 1),
                "amount_weighted_delay": round(float(row.get("amount_weighted_delay", 0)), 1),
                "delay_volatility": round(float(row.get("delay_std", 0)), 1),
                "total_invoices": int(row.get("total_invoices", 0)),
                "total_volume": round(float(row.get("total_volume", 0)), 2),
                "recommended_action": tier_info["action"]
            })

        return pd.DataFrame(results).sort_values("behavioral_score", ascending=False).reset_index(drop=True)

    def save(self, filepath: Optional[Path] = None) -> Path:
        """Serialize trained model to disk."""
        target = filepath or (MODEL_DIR / "behavioral_scoring_model.joblib")
        payload = {
            "gb_model": self.model,
            "rf_model": self.rf_model,
            "feature_names": self.feature_names,
            "feature_importances": self.feature_importances_,
            "metrics": self.metrics_
        }
        joblib.dump(payload, target)
        logger.info("Saved scoring engine artifacts to %s", target)
        return target

    @classmethod
    def load(cls, filepath: Optional[Path] = None) -> "BehavioralScoringEngine":
        """Load trained engine from disk."""
        target = filepath or (MODEL_DIR / "behavioral_scoring_model.joblib")
        if not target.exists():
            raise FileNotFoundError(f"Model file not found at {target}")
        payload = joblib.load(target)
        engine = cls()
        engine.model = payload["gb_model"]
        engine.rf_model = payload["rf_model"]
        engine.feature_names = payload["feature_names"]
        engine.feature_importances_ = payload["feature_importances"]
        engine.metrics_ = payload["metrics"]
        engine.is_trained = True
        return engine


def train_and_evaluate_scoring_engine(
    cust_features: pd.DataFrame,
    test_size: float = 0.20,
    random_state: int = 42
) -> Tuple[BehavioralScoringEngine, pd.DataFrame, Dict[str, Any]]:
    """
    Split dataset into 80% train and 20% hold-out test set,
    train model, and evaluate performance.
    """
    # 1. Generate calibrated ground-truth target
    target = construct_ground_truth_target(cust_features)

    # 2. Train-test holdout split
    X_train, X_test, y_train, y_test = train_test_split(
        cust_features,
        target,
        test_size=test_size,
        random_state=random_state
    )

    # 3. Fit scoring engine
    engine = BehavioralScoringEngine(random_state=random_state)
    metrics = engine.fit(X_train, y_train, X_val=X_test, y_val=y_test)

    # 4. Score holdout set
    scored_holdout = engine.score_customers(X_test)
    scored_holdout["actual_ground_truth"] = y_test.values.round(1)
    scored_holdout["residual_error"] = (scored_holdout["behavioral_score"] - scored_holdout["actual_ground_truth"]).round(2)

    # 5. Score all customers
    all_scored = engine.score_customers(cust_features)

    # Save trained model
    engine.save()

    evaluation_summary = {
        "dataset_size": len(cust_features),
        "train_samples": len(X_train),
        "holdout_samples": len(X_test),
        "metrics": metrics,
        "feature_importances": engine.feature_importances_,
        "tier_distribution": all_scored["tier"].value_counts().to_dict(),
        "score_percentiles": {
            "p10": float(all_scored["behavioral_score"].quantile(0.10)),
            "p25": float(all_scored["behavioral_score"].quantile(0.25)),
            "median": float(all_scored["behavioral_score"].median()),
            "p75": float(all_scored["behavioral_score"].quantile(0.75)),
            "p90": float(all_scored["behavioral_score"].quantile(0.90))
        }
    }

    return engine, all_scored, evaluation_summary


if __name__ == "__main__":
    from ml.data_pipeline import run_pipeline
    from ml.feature_engineering import engineer_features_pipeline

    print("Running CashPredix Behavioral Scoring Pipeline...")
    data = run_pipeline(source_preference="auto")
    _, cust_features, _ = engineer_features_pipeline(data["payments"], data.get("customers"))

    engine, all_scored, summary = train_and_evaluate_scoring_engine(cust_features)

    print("\n" + "=" * 65)
    print(" BEHAVIORAL SCORING ENGINE EVALUATION REPORT")
    print("=" * 65)
    print(f" Total Customers Scored:       {summary['dataset_size']}")
    print(f" Train Samples:                {summary['train_samples']}")
    print(f" Hold-Out Test Samples:        {summary['holdout_samples']}")
    print(f" Hold-Out RMSE:                {summary['metrics']['val_rmse']}")
    print(f" Hold-Out MAE:                 {summary['metrics']['val_mae']} pts")
    print(f" Hold-Out R² Score:            {summary['metrics']['val_r2']}")
    print("\n Top 5 Predictive Features by Importance:")
    for feat, imp in list(summary["feature_importances"].items())[:5]:
        print(f"  - {feat.padEnd(25) if hasattr(feat, 'padEnd') else feat:<25}: {imp * 100:.1f}%")

    print("\n Counterparty Tier Breakdown:")
    for tier, count in summary["tier_distribution"].items():
        pct = (count / summary['dataset_size']) * 100
        print(f"  - {tier:<26}: {count:>3} ({pct:.1f}%)")

    print("\n Top 3 Benchmark / Prime Customers:")
    print(all_scored[["customer_id", "behavioral_score", "tier", "on_time_rate", "avg_delay_days"]].head(3).to_string(index=False))

    print("\n Bottom 3 High Risk / Distressed Customers:")
    print(all_scored[["customer_id", "behavioral_score", "tier", "on_time_rate", "avg_delay_days"]].tail(3).to_string(index=False))
    print("=" * 65)

    # Save output to synthetic directory
    out_path = BASE_DIR / "data" / "synthetic" / "customer_behavioral_scores.json"
    all_scored.to_json(out_path, orient="records", indent=2)
    print(f"[✓] Scored customer dataset saved to: {out_path}")
