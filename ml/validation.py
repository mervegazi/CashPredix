#!/usr/bin/env python3
"""
CashPredix - Model Validation & Baseline Benchmarking
Week 4: Issue #20

Key Responsibilities:
1. Benchmark ML behavioral scoring against 4 industry baselines:
   - Baseline 1: Pure On-Time Rate Heuristic (Linear)
   - Baseline 2: Fixed Delay Penalty Rule (Heuristic)
   - Baseline 3: Global Mean Baseline (Naive)
   - Baseline 4: Ridge Linear Regression (Classical Parametric)
2. 5-Fold Cross-Validation (CV) for model generalization and stability
3. Spearman & Kendall Rank Correlation analysis (ranking monotonicity)
4. Residual distribution and sensitivity testing
5. Export formal JSON validation audit report
"""

import os
import sys
import json
import logging
import warnings
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List

warnings.filterwarnings("ignore", category=RuntimeWarning)


BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.model_selection import KFold
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from ml.data_pipeline import run_pipeline
from ml.feature_engineering import engineer_features_pipeline
from ml.behavioral_scoring import (
    BehavioralScoringEngine,
    construct_ground_truth_target,
    FEATURE_COLUMNS
)

logger = logging.getLogger("CashPredix.Validation")


def evaluate_baselines(
    X: pd.DataFrame,
    y_true: pd.Series
) -> Dict[str, Dict[str, float]]:
    """
    Compare CashPredix ML Model against 4 established financial baselines.
    """
    results = {}

    # 1. Baseline 1: Pure On-Time Heuristic (On-time % scaled to 100)
    pred_ontime = np.clip(X["on_time_rate"] * 100.0, 0.0, 100.0)
    results["Baseline_1_OnTime_Heuristic"] = {
        "rmse": round(float(np.sqrt(mean_squared_error(y_true, pred_ontime))), 3),
        "mae": round(float(mean_absolute_error(y_true, pred_ontime)), 3),
        "r2": round(float(r2_score(y_true, pred_ontime)), 4),
        "spearman_corr": round(float(stats.spearmanr(pred_ontime, y_true).correlation), 4)
    }

    # 2. Baseline 2: Fixed Linear Delay Rule (100 - 2.5 * avg_delay)
    pred_delay_rule = np.clip(100.0 - (X["avg_delay_days"] * 2.5), 0.0, 100.0)
    results["Baseline_2_Delay_Penalty_Rule"] = {
        "rmse": round(float(np.sqrt(mean_squared_error(y_true, pred_delay_rule))), 3),
        "mae": round(float(mean_absolute_error(y_true, pred_delay_rule)), 3),
        "r2": round(float(r2_score(y_true, pred_delay_rule)), 4),
        "spearman_corr": round(float(stats.spearmanr(pred_delay_rule, y_true).correlation), 4)
    }

    # 3. Baseline 3: Naive Global Mean
    pred_mean = np.full_like(y_true, fill_value=y_true.mean(), dtype=float)
    results["Baseline_3_Naive_Global_Mean"] = {
        "rmse": round(float(np.sqrt(mean_squared_error(y_true, pred_mean))), 3),
        "mae": round(float(mean_absolute_error(y_true, pred_mean)), 3),
        "r2": round(float(r2_score(y_true, pred_mean)), 4),
        "spearman_corr": 0.0
    }

    # 4. Baseline 4: Classical Ridge Linear Regression with Feature Standardization
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import make_pipeline
    ridge = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
    X_clean = X[FEATURE_COLUMNS].fillna(0)
    ridge.fit(X_clean, y_true)
    pred_ridge = np.clip(ridge.predict(X_clean), 0.0, 100.0)
    results["Baseline_4_Ridge_Regression"] = {
        "rmse": round(float(np.sqrt(mean_squared_error(y_true, pred_ridge))), 3),
        "mae": round(float(mean_absolute_error(y_true, pred_ridge)), 3),
        "r2": round(float(r2_score(y_true, pred_ridge)), 4),
        "spearman_corr": round(float(stats.spearmanr(pred_ridge, y_true).correlation), 4)
    }


    return results


def run_kfold_cross_validation(
    X: pd.DataFrame,
    y: pd.Series,
    n_splits: int = 5,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Perform 5-Fold Cross-Validation on the CashPredix Behavioral Scoring Engine.
    """
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    fold_metrics = []

    logger.info("Executing %d-Fold Cross-Validation across %d records...", n_splits, len(X))

    for fold, (train_idx, val_idx) in enumerate(kf.split(X), 1):
        X_tr, y_tr = X.iloc[train_idx], y.iloc[train_idx]
        X_va, y_va = X.iloc[val_idx], y.iloc[val_idx]

        engine = BehavioralScoringEngine(random_state=random_state + fold)
        engine.fit(X_tr, y_tr)
        preds = engine.predict(X_va)

        rmse = float(np.sqrt(mean_squared_error(y_va, preds)))
        mae = float(mean_absolute_error(y_va, preds))
        r2 = float(r2_score(y_va, preds))
        spearman = float(stats.spearmanr(preds, y_va).correlation)

        fold_metrics.append({
            "fold": fold,
            "val_samples": len(val_idx),
            "rmse": round(rmse, 3),
            "mae": round(mae, 3),
            "r2": round(r2, 4),
            "spearman_corr": round(spearman, 4)
        })

    rmses = [m["rmse"] for m in fold_metrics]
    maes = [m["mae"] for m in fold_metrics]
    r2s = [m["r2"] for m in fold_metrics]
    spearmans = [m["spearman_corr"] for m in fold_metrics]

    cv_summary = {
        "n_splits": n_splits,
        "fold_details": fold_metrics,
        "mean_rmse": round(float(np.mean(rmses)), 3),
        "std_rmse": round(float(np.std(rmses)), 3),
        "mean_mae": round(float(np.mean(maes)), 3),
        "std_mae": round(float(np.std(maes)), 3),
        "mean_r2": round(float(np.mean(r2s)), 4),
        "std_r2": round(float(np.std(r2s)), 4),
        "mean_spearman_corr": round(float(np.mean(spearmans)), 4)
    }
    return cv_summary


def run_full_validation_suite() -> Dict[str, Any]:
    """Execute complete validation suite and generate audit report."""
    # 1. Ingest & Feature Engineer
    data = run_pipeline(source_preference="auto")
    _, cust_features, _ = engineer_features_pipeline(data["payments"], data.get("customers"))
    y_true = construct_ground_truth_target(cust_features)

    # 2. Baseline comparison
    baseline_benchmarks = evaluate_baselines(cust_features, y_true)

    # 3. 5-Fold Cross-Validation
    cv_results = run_kfold_cross_validation(cust_features, y_true, n_splits=5)

    # 4. Final ensemble performance on full set
    engine = BehavioralScoringEngine(random_state=42)
    engine.fit(cust_features, y_true)
    final_preds = engine.predict(cust_features)

    cashpredix_metrics = {
        "rmse": round(float(np.sqrt(mean_squared_error(y_true, final_preds))), 3),
        "mae": round(float(mean_absolute_error(y_true, final_preds)), 3),
        "r2": round(float(r2_score(y_true, final_preds)), 4),
        "spearman_corr": round(float(stats.spearmanr(final_preds, y_true).correlation), 4)
    }

    # 5. Residuals & Monotonicity
    residuals = final_preds - y_true
    monotone_test = stats.spearmanr(cust_features["avg_delay_days"], final_preds).correlation

    validation_report = {
        "dataset_counterparties": len(cust_features),
        "total_invoices_analyzed": len(data["payments"]),
        "cashpredix_model_metrics": cashpredix_metrics,
        "baseline_comparison": baseline_benchmarks,
        "cross_validation_5fold": cv_results,
        "monotonicity_check": {
            "delay_vs_score_spearman": round(float(monotone_test), 4),
            "is_strictly_inverse": bool(monotone_test < -0.70)
        },
        "residual_stats": {
            "mean_residual": round(float(residuals.mean()), 3),
            "std_residual": round(float(residuals.std()), 3),
            "max_abs_error": round(float(np.abs(residuals).max()), 3)
        }
    }

    # Save validation report
    out_file = BASE_DIR / "data" / "synthetic" / "ml_model_validation_report.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(validation_report, f, indent=2)

    logger.info("Validation report generated and saved to %s", out_file)
    return validation_report


if __name__ == "__main__":
    report = run_full_validation_suite()

    print("\n" + "=" * 70)
    print(" CASHPredix MODEL ACCURACY & BASELINE BENCHMARKING REPORT")
    print("=" * 70)
    print(f" Total Counterparties:        {report['dataset_counterparties']}")
    print(f" Total Invoices Evaluated:    {report['total_invoices_analyzed']}")

    print("\n 1. BASELINE BENCHMARK COMPARISON TABLE:")
    print("-" * 70)
    print(f" {'Model / Baseline':<32} | {'RMSE':<8} | {'MAE':<8} | {'R²':<8} | {'Spearman'}")
    print("-" * 70)
    for model_name, m in report["baseline_comparison"].items():
        print(f" {model_name:<32} | {m['rmse']:<8} | {m['mae']:<8} | {m['r2']:<8} | {m['spearman_corr']}")
    cp = report["cashpredix_model_metrics"]
    print(f" {'★ CashPredix Ensemble Model':<32} | {cp['rmse']:<8} | {cp['mae']:<8} | {cp['r2']:<8} | {cp['spearman_corr']}")
    print("-" * 70)

    print("\n 2. 5-FOLD CROSS-VALIDATION SUMMARY:")
    print("-" * 70)
    cv = report["cross_validation_5fold"]
    print(f" CV Mean R²:                  {cv['mean_r2']} ± {cv['std_r2']}")
    print(f" CV Mean MAE:                 {cv['mean_mae']} ± {cv['std_mae']} pts")
    print(f" CV Mean RMSE:                {cv['mean_rmse']} ± {cv['std_rmse']}")
    print(f" CV Mean Rank Correlation:    {cv['mean_spearman_corr']}")

    print("\n 3. SANITY & SENSITIVITY CHECKS:")
    print("-" * 70)
    mono = report["monotonicity_check"]
    print(f" Delay-to-Score Inverse Correlation: {mono['delay_vs_score_spearman']} (Valid: {mono['is_strictly_inverse']})")
    res = report["residual_stats"]
    print(f" Residual Bias (Mean Error):          {res['mean_residual']} pts")
    print(f" Residual Volatility (Std Dev):       {res['std_residual']} pts")
    print("=" * 70)
