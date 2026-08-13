"""
Module to execute the model training and evaluation pipeline with MLflow tracking.
Integrates time-based train/test splitting, Champion vs Challenger model comparison,
and automated model promotion to production.
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

import mlflow
import mlflow.xgboost

from app.db.session import SessionLocal
from app.models.stock_history import StockHistory
from app.core.config import settings
from app.ml.training.evaluate import evaluate_model, compare_models
from app.ml.training.dataset import time_based_train_test_split

logger = logging.getLogger(__name__)


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes technical features and binary target for training.
    Target: 1 if next day's close price is higher than current day, 0 otherwise.
    """
    if len(df) < 15:
        return pd.DataFrame()

    df = df.sort_values(by="time").copy()
    
    # Price and Return features
    df["return_1d"] = df["close"].pct_change(1)
    df["return_5d"] = df["close"].pct_change(5)
    
    # Moving Averages
    df["sma_5"] = df["close"].rolling(window=5).mean()
    df["sma_20"] = df["close"].rolling(window=20).mean()
    df["sma_ratio"] = df["sma_5"] / (df["sma_20"] + 1e-9)
    
    # Volatility
    df["volatility_5d"] = df["return_1d"].rolling(window=5).std()
    
    # Volume momentum
    df["volume_change"] = df["volume"].pct_change(1)
    df["volume_ma5"] = df["volume"].rolling(window=5).mean()
    df["volume_ratio"] = df["volume"] / (df["volume_ma5"] + 1e-9)
    
    # Relative Strength Index (RSI 14)
    delta = df["close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / (loss + 1e-9)
    df["rsi_14"] = 100 - (100 / (1 + rs))
    
    # Target: Next period price direction (1: Up, 0: Down/Flat)
    df["target"] = (df["close"].shift(-1) > df["close"]).astype(int)
    
    # Drop records with NaN due to rolling computations & last row without target
    df = df.dropna().iloc[:-1].copy()
    return df


def train_model(model_save_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Trains and evaluates XGBoost model with MLflow experiment tracking.
    Compares Challenger against active Champion model.
    Promotes Challenger to model_save_path only if it improves or matches Champion metrics.
    """
    if not model_save_path:
        model_save_path = settings.MODEL_PATH

    logger.info("=== [ML PIPELINE] Starting Model Retraining & Evaluation Pipeline ===")
    
    # 1. Fetch historical data from DB
    db: Session = SessionLocal()
    try:
        records = db.query(StockHistory).order_by(StockHistory.symbol, StockHistory.time.asc()).all()
        
        if records:
            raw_data = [{
                'symbol': r.symbol,
                'time': r.time,
                'open': r.open,
                'high': r.high,
                'low': r.low,
                'close': r.close,
                'volume': r.volume
            } for r in records]
            df_all = pd.DataFrame(raw_data)
        else:
            logger.warning("No data found in stock_history table. Generating synthetic dataset for training.")
            from app.db.seed_data import generate_synthetic_candles, VN30_STOCKS
            synth_records = []
            for s in VN30_STOCKS[:10]:
                candles = generate_synthetic_candles(s["price"], 60)
                for c in candles:
                    c['symbol'] = s['symbol']
                    synth_records.append(c)
            df_all = pd.DataFrame(synth_records)
    finally:
        db.close()

    # 2. Extract features per symbol
    feature_dfs = []
    for symbol, group in df_all.groupby("symbol"):
        feats = prepare_features(group)
        if not feats.empty:
            feature_dfs.append(feats)

    if not feature_dfs:
        error_msg = "Insufficient data to compute features for model training."
        logger.error(error_msg)
        return {"success": False, "error": error_msg}

    dataset = pd.concat(feature_dfs, ignore_index=True)
    
    feature_cols = [
        "return_1d", "return_5d", "sma_ratio",
        "volatility_5d", "volume_change", "volume_ratio", "rsi_14"
    ]
    
    # 3. Time-based Chronological Train/Test Split (80/20)
    X_train, X_test, y_train, y_test, train_df, test_df = time_based_train_test_split(
        dataset, feature_cols=feature_cols, target_col="target", test_size=0.2
    )

    logger.info(f"Dataset split: Train = {len(X_train)} samples, Test = {len(X_test)} samples.")

    # 4. Configure MLflow Tracking
    try:
        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        mlflow.set_experiment(settings.MLFLOW_EXPERIMENT_NAME)
    except Exception as e:
        logger.warning(f"MLflow tracking URI setup warning: {e}")

    params = {
        "n_estimators": 100,
        "max_depth": 4,
        "learning_rate": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "random_state": 42,
        "eval_metric": "logloss"
    }

    run_name = f"retrain_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

    with mlflow.start_run(run_name=run_name) as run:
        run_id = run.info.run_id
        experiment_id = run.info.experiment_id
        
        # Log Parameters and metadata
        mlflow.log_params(params)
        mlflow.log_param("train_samples", len(X_train))
        mlflow.log_param("test_samples", len(X_test))
        mlflow.log_param("feature_count", len(feature_cols))
        mlflow.log_param("feature_names", ",".join(feature_cols))

        # 5. Train Challenger XGBoost Model
        import xgboost as xgb
        challenger_model = xgb.XGBClassifier(**params)
        challenger_model.fit(X_train, y_train)

        # 6. Evaluate Challenger Model on Train & Test Sets
        chall_train_metrics = evaluate_model(challenger_model, X_train, y_train)
        chall_test_metrics = evaluate_model(challenger_model, X_test, y_test)

        logger.info(f"Challenger Test Metrics: {chall_test_metrics}")

        # Log Challenger Metrics
        mlflow.log_metrics({
            "challenger_train_accuracy": chall_train_metrics["accuracy"],
            "challenger_test_accuracy": chall_test_metrics["accuracy"],
            "challenger_precision": chall_test_metrics["precision"],
            "challenger_recall": chall_test_metrics["recall"],
            "challenger_f1_score": chall_test_metrics["f1_score"]
        })

        # 7. Load & Evaluate active Champion Model on the SAME Test Set
        champion_metrics = None
        if os.path.exists(model_save_path):
            try:
                champion_model = xgb.XGBClassifier()
                champion_model.load_model(model_save_path)
                champion_metrics = evaluate_model(champion_model, X_test, y_test)
                logger.info(f"Champion Test Metrics: {champion_metrics}")
                mlflow.log_metrics({
                    "champion_accuracy": champion_metrics["accuracy"],
                    "champion_precision": champion_metrics["precision"],
                    "champion_recall": champion_metrics["recall"],
                    "champion_f1_score": champion_metrics["f1_score"]
                })
            except Exception as e:
                logger.warning(f"Could not evaluate existing champion model from {model_save_path}: {e}")

        # 8. Champion vs Challenger Decision
        promoted, reason = compare_models(
            champion_metrics=champion_metrics,
            challenger_metrics=chall_test_metrics,
            primary_metric="f1_score"
        )

        logger.info(f"Decision -> Promoted: {promoted} | Reason: {reason}")

        mlflow.log_metric("promoted", 1 if promoted else 0)
        mlflow.set_tag("promotion_decision", "PROMOTED" if promoted else "REJECTED")
        mlflow.set_tag("promotion_reason", reason)

        # 9. Model Artifact Persistence
        os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
        if promoted:
            challenger_model.save_model(model_save_path)
            mlflow.xgboost.log_model(challenger_model, artifact_path="champion_model")
            logger.info(f"Successfully promoted Challenger to production at {model_save_path}")
        else:
            mlflow.xgboost.log_model(challenger_model, artifact_path="rejected_challenger")
            logger.info("Challenger did not outperform Champion. Active production model preserved.")

        return {
            "success": True,
            "promoted": promoted,
            "promotion_reason": reason,
            "mlflow_run_id": run_id,
            "mlflow_experiment_id": experiment_id,
            "samples": {
                "total": len(dataset),
                "train": len(X_train),
                "test": len(X_test)
            },
            "challenger_metrics": chall_test_metrics,
            "champion_metrics": champion_metrics,
            "model_path": model_save_path
        }
