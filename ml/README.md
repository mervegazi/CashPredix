# CashPredix — Machine Learning Module

This directory contains the core machine learning pipeline, feature engineering, behavioral reliability scoring engine, and validation suites for CashPredix.

## Structure
- `data_pipeline.py`: Supabase database fetcher, offline synthetic fallback, and missing/sparse data imputation.
- `feature_engineering.py`: Statistical outlier clipping (IQR & Z-score), contractual timeline normalization, and 18-variable customer feature generation.
- `behavioral_scoring.py`: Supervised ensemble Gradient Boosting + Random Forest regressor, risk tier mapping (0-100), and joblib serialization.
- `validation.py`: 5-Fold Cross-Validation, benchmarking against 4 industry baselines, monotonicity verification, and validation reporting.
- `models/`: Serialized model artifacts (`behavioral_scoring_model.joblib`).

## Quick Start
```bash
# Setup dependencies
pip install -r requirements.txt

# Run complete pipeline
python ml/data_pipeline.py
python ml/feature_engineering.py
python ml/behavioral_scoring.py
python ml/validation.py
```

Detailed technical documentation: [docs/BEHAVIORAL_SCORING_METHODOLOGY.md](../docs/BEHAVIORAL_SCORING_METHODOLOGY.md).
