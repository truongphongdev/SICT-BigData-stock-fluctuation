"""
Module to execute incremental / continual model training and evaluation with MLflow tracking.
Reuses the pre-trained base model (AI/xgboost_stock_model_v2.pkl with 300 trees and 12 features)
and applies XGBoost Warm Start to train new trees incrementally from newly streamed market data.
"""
import os
import pickle
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
import xgboost as xgb

import mlflow
import mlflow.xgboost
import mlflow.data
from mlflow.models.signature import infer_signature

from app.db.session import SessionLocal
from app.models.stock_history import StockHistory
from app.models.stock_day import StockDay
from app.core.config import settings
from app.ml.training.evaluate import evaluate_model, compare_models
from app.ml.training.dataset import time_based_train_test_split

logger = logging.getLogger(__name__)

# 12 standard features synchronized with the pre-trained base model (xgboost_stock_model_v2.pkl)
FEATURE_COLS = [
    'Open', 'High', 'Low', 'Close', 'Volume',
    'RSI_14', 'EMA_20', 'EMA_50',
    'MACD_12_26_9', 'MACDh_12_26_9', 'MACDs_12_26_9',
    'Return'
]

BASE_MODEL_CANDIDATE_PATHS = [
    os.path.join(os.path.abspath("."), "app", "ml", "models", "best_model.json"),
    os.path.join(os.path.abspath(".."), "AI", "xgboost_stock_model_v2.pkl"),
    os.path.join(os.path.abspath("."), "AI", "xgboost_stock_model_v2.pkl"),
    os.path.join(os.path.abspath("."), "app", "ml", "models", "xgboost_stock_model_v2.pkl"),
]


def load_base_champion_model() -> Tuple[Optional[xgb.XGBClassifier], Optional[Dict[str, Any]], str]:
    """
    Attempts to load the active champion model from best_model.json or initial base model pkl.
    Returns (model, metadata_dict, source_path).
    """
    # 1. Check production best_model.json first
    json_model_path = os.path.join(os.path.abspath("."), "app", "ml", "models", "best_model.json")
    if os.path.exists(json_model_path):
        try:
            model = xgb.XGBClassifier()
            model.load_model(json_model_path)
            num_feats = model.get_booster().num_features()
            if num_feats == len(FEATURE_COLS):
                logger.info(f"Loaded active production Champion model from {json_model_path} ({num_feats} features)")
                return model, None, json_model_path
            else:
                logger.warning(f"Existing model in {json_model_path} has {num_feats} features (expected {len(FEATURE_COLS)}). Falling back to base 12-feature model.")
        except Exception as e:
            logger.warning(f"Failed to load existing json model from {json_model_path}: {e}")

    # 2. Check initial base model pkl
    for path in BASE_MODEL_CANDIDATE_PATHS:
        if path.endswith(".pkl") and os.path.exists(path):
            try:
                with open(path, "rb") as f:
                    loaded = pickle.load(f)
                if isinstance(loaded, dict) and "model" in loaded:
                    model = loaded["model"]
                    meta = {
                        "accuracy": loaded.get("accuracy", 0.6211),
                        "features": loaded.get("features", FEATURE_COLS)
                    }
                    logger.info(f"Loaded initial pre-trained base Champion model from {path} (Base Acc: {meta['accuracy']})")
                    return model, meta, path
                elif isinstance(loaded, xgb.XGBClassifier):
                    logger.info(f"Loaded base Champion model from {path}")
                    return loaded, None, path
            except Exception as e:
                logger.warning(f"Failed to load pkl model from {path}: {e}")

    return None, None, ""


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes standard 12 technical features and binary target for training.
    Features: Open, High, Low, Close, Volume, RSI_14, EMA_20, EMA_50, MACD_12_26_9, MACDh_12_26_9, MACDs_12_26_9, Return.
    Target: 1 if next day's close price is higher than current day, 0 otherwise.
    """
    if len(df) < 5:
        return pd.DataFrame()

    df = df.sort_values(by="time").copy()
    
    # Ensure column casing
    df = df.rename(columns={
        'open': 'Open',
        'high': 'High',
        'low': 'Low',
        'close': 'Close',
        'volume': 'Volume'
    })

    for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # 1. RSI (14 periods)
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=min(14, len(df)), min_periods=1).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=min(14, len(df)), min_periods=1).mean()
    rs = gain / (loss + 1e-9)
    df['RSI_14'] = (100 - (100 / (1 + rs))).fillna(50)

    # 2. Exponential Moving Averages (EMA 20 & EMA 50)
    df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()
    df['EMA_50'] = df['Close'].ewm(span=50, adjust=False).mean()

    # 3. MACD (12, 26, 9)
    ema_12 = df['Close'].ewm(span=12, adjust=False).mean()
    ema_26 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD_12_26_9'] = ema_12 - ema_26
    df['MACDs_12_26_9'] = df['MACD_12_26_9'].ewm(span=9, adjust=False).mean()
    df['MACDh_12_26_9'] = df['MACD_12_26_9'] - df['MACDs_12_26_9']

    # 4. Return (pct_change)
    df['Return'] = df['Close'].pct_change().fillna(0)

    # 5. Target (Trend T+1: 1 if Next Close > Current Close, 0 otherwise)
    df['Next_Close'] = df['Close'].shift(-1)
    df['target'] = (df['Next_Close'] > df['Close']).astype(int)

    # Drop the very last row because its target cannot look into the future
    if len(df) > 1:
        df = df.iloc[:-1].copy()

    df = df.fillna(0)
    return df


def train_model(model_save_path: Optional[str] = None, max_window_per_symbol: int = 250, incremental_trees: int = 20) -> Dict[str, Any]:
    """
    Executes continual incremental model training with XGBoost Warm Start and MLflow tracking.
    1. Loads active Champion (or initial 300-tree base model).
    2. Trains incremental trees (e.g. +20 trees) using warm-start on recent market dataset.
    3. Evaluates both models on the chronological Test set.
    4. Promotes Challenger and persists rich MLflow artifacts.
    """
    if not model_save_path:
        model_save_path = settings.MODEL_PATH

    logger.info("=== [ML PIPELINE] Starting Continual (Warm-Start) Retraining Pipeline ===")

    # 1. Fetch historical data from DB (stock_day prioritized, fallback to stock_history)
    db: Session = SessionLocal()
    try:
        records = db.query(StockDay).order_by(StockDay.symbol, StockDay.time.asc()).all()
        source_table = "stock_day"

        if not records:
            records = db.query(StockHistory).order_by(StockHistory.symbol, StockHistory.time.asc()).all()
            source_table = "stock_history"

        if records:
            logger.info(f"Loaded {len(records)} records from '{source_table}' for training dataset.")
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

            if max_window_per_symbol and max_window_per_symbol > 0:
                df_all = df_all.sort_values(by=["symbol", "time"]).groupby("symbol", as_index=False).tail(max_window_per_symbol).reset_index(drop=True)
                logger.info(f"Applied rolling window ({max_window_per_symbol} bars/symbol): {len(df_all)} records retained.")
        else:
            logger.warning("No database records found. Generating synthetic dataset.")
            from app.db.seed_data import generate_synthetic_candles, VN30_STOCKS
            synth_records = []
            for s in VN30_STOCKS[:15]:
                candles = generate_synthetic_candles(s["price"], 60)
                for c in candles:
                    c['symbol'] = s['symbol']
                    synth_records.append(c)
            df_all = pd.DataFrame(synth_records)
    finally:
        db.close()

    # 2. Extract standard 12 features per symbol
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
    logger.info(f"Constructed feature dataset with {len(dataset)} samples and {len(FEATURE_COLS)} features.")

    # 3. Time-based Chronological Train/Test Split (80/20)
    X_train, X_test, y_train, y_test, train_df, test_df = time_based_train_test_split(
        dataset, feature_cols=FEATURE_COLS, target_col="target", test_size=0.2
    )

    logger.info(f"Dataset split: Train = {len(X_train)} samples, Test = {len(X_test)} samples.")

    # 4. Load Base Champion Model for Warm-Start Continual Learning
    champion_model, champ_meta, source_model_path = load_base_champion_model()
    
    base_trees = 0
    champion_booster = None
    if champion_model is not None:
        try:
            champion_booster = champion_model.get_booster()
            base_trees = champion_booster.num_boosted_rounds()
            logger.info(f"Champion model booster loaded successfully ({base_trees} existing trees).")
        except Exception as e:
            logger.warning(f"Could not extract booster from champion model: {e}")

    total_trees = base_trees + incremental_trees if base_trees > 0 else 100

    # 5. Configure MLflow Tracking
    try:
        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        mlflow.set_experiment(settings.MLFLOW_EXPERIMENT_NAME)
    except Exception as e:
        logger.warning(f"MLflow tracking URI setup warning: {e}")

    params = {
        "n_estimators": total_trees,
        "max_depth": 6,
        "learning_rate": 0.03,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "scale_pos_weight": 1.057,
        "random_state": 42,
        "eval_metric": "logloss"
    }

    run_name = f"continual_train_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

    with mlflow.start_run(run_name=run_name) as run:
        run_id = run.info.run_id
        experiment_id = run.info.experiment_id

        # Log Parameters & Continual Metadata
        mlflow.log_params(params)
        mlflow.log_param("learning_mode", "WARM_START_CONTINUAL" if base_trees > 0 else "FROM_SCRATCH")
        mlflow.log_param("base_trees", base_trees)
        mlflow.log_param("incremental_trees", incremental_trees if base_trees > 0 else total_trees)
        mlflow.log_param("total_trees", total_trees)
        mlflow.log_param("train_samples", len(X_train))
        mlflow.log_param("test_samples", len(X_test))
        mlflow.log_param("feature_count", len(FEATURE_COLS))
        mlflow.log_param("feature_names", ",".join(FEATURE_COLS))

        # Log Dataset object to MLflow
        try:
            mlflow_dataset = mlflow.data.from_pandas(
                dataset[FEATURE_COLS + ["target"]],
                targets="target",
                name="vn30_daily_dataset",
                source=f"database_{source_table}"
            )
            mlflow.log_input(mlflow_dataset, context="training")
        except Exception as e:
            logger.warning(f"Could not log dataset input to MLflow: {e}")

        # 6. Train Challenger Model with Warm Start
        challenger_model = xgb.XGBClassifier(**params)
        if champion_booster is not None and base_trees > 0:
            logger.info(f"Applying Warm Start: Training {incremental_trees} incremental trees on top of {base_trees} base trees...")
            challenger_model.fit(X_train, y_train, xgb_model=champion_booster)
        else:
            logger.info(f"Training {total_trees} trees from baseline...")
            challenger_model.fit(X_train, y_train)

        # 7. Evaluate Challenger Model on Train & Test Sets
        chall_train_metrics = evaluate_model(challenger_model, X_train, y_train)
        chall_test_metrics = evaluate_model(challenger_model, X_test, y_test)

        logger.info(f"Challenger Test Metrics: {chall_test_metrics}")

        mlflow.log_metrics({
            "challenger_train_accuracy": chall_train_metrics["accuracy"],
            "challenger_test_accuracy": chall_test_metrics["accuracy"],
            "challenger_precision": chall_test_metrics["precision"],
            "challenger_recall": chall_test_metrics["recall"],
            "challenger_f1_score": chall_test_metrics["f1_score"]
        })

        # 8. Evaluate Champion Model on the SAME Test Set
        champion_metrics = None
        if champion_model is not None:
            try:
                champion_metrics = evaluate_model(champion_model, X_test, y_test)
                logger.info(f"Champion Test Metrics: {champion_metrics}")
                mlflow.log_metrics({
                    "champion_accuracy": champion_metrics["accuracy"],
                    "champion_precision": champion_metrics["precision"],
                    "champion_recall": champion_metrics["recall"],
                    "champion_f1_score": champion_metrics["f1_score"]
                })
            except Exception as e:
                logger.warning(f"Could not evaluate champion model on test set: {e}")

        # 9. Champion vs Challenger Decision
        promoted, reason = compare_models(
            champion_metrics=champion_metrics,
            challenger_metrics=chall_test_metrics,
            primary_metric="f1_score"
        )

        logger.info(f"Decision -> Promoted: {promoted} | Reason: {reason}")

        mlflow.log_metric("promoted", 1 if promoted else 0)
        mlflow.set_tag("promotion_decision", "PROMOTED" if promoted else "REJECTED")
        mlflow.set_tag("promotion_reason", reason)
        mlflow.set_tag("learning_mode", "WARM_START_CONTINUAL" if base_trees > 0 else "FROM_SCRATCH")

        # 10. Persist Versioned Model & MLflow Model Registry
        from app.ml.versioning import save_new_model_version
        version_record = save_new_model_version(
            model=challenger_model,
            metrics=chall_test_metrics,
            learning_mode="WARM_START_CONTINUAL" if base_trees > 0 else "FROM_SCRATCH",
            trees=total_trees,
            promoted=promoted,
            mlflow_run_id=run_id,
            promotion_reason=reason
        )
        version_num = version_record["version"]
        mlflow.set_tag("model_version", f"v{version_num}")

        try:
            signature = infer_signature(X_train, challenger_model.predict(X_train))

            # 1. Log & Register in MLflow Model Registry
            model_info = mlflow.xgboost.log_model(
                xgb_model=challenger_model,
                artifact_path="model",
                signature=signature,
                input_example=X_train[:5],
                registered_model_name="stock-predictor-vn30"
            )

            # 2. Set alias in Model Registry
            if model_info.registered_model_version is not None:
                try:
                    from mlflow.tracking import MlflowClient
                    client = MlflowClient()
                    alias_name = "champion" if promoted else "challenger"
                    client.set_registered_model_alias(
                        name="stock-predictor-vn30",
                        alias=alias_name,
                        version=str(model_info.registered_model_version)
                    )
                    logger.info(f"Registered model version {model_info.registered_model_version} with alias @{alias_name}")
                except Exception as e:
                    logger.warning(f"Could not set model alias: {e}")

            # 3. Log Model weights file
            if os.path.exists(version_record["filepath"]):
                mlflow.log_artifact(version_record["filepath"], artifact_path="model_weights")

            # 4. Log Feature Importances JSON
            importance_dict = dict(zip(FEATURE_COLS, [float(x) for x in challenger_model.feature_importances_]))
            mlflow.log_dict(importance_dict, "feature_importances.json")

            # 5. Log Evaluation Summary Report
            eval_report = {
                "version": f"v{version_num}",
                "decision": "PROMOTED" if promoted else "REJECTED",
                "reason": reason,
                "learning_mode": "WARM_START_CONTINUAL" if base_trees > 0 else "FROM_SCRATCH",
                "base_trees": base_trees,
                "total_trees": total_trees,
                "challenger_test_metrics": chall_test_metrics,
                "champion_metrics": champion_metrics,
                "feature_names": FEATURE_COLS,
                "train_samples": len(X_train),
                "test_samples": len(X_test)
            }
            mlflow.log_dict(eval_report, "evaluation_report.json")
            logger.info("Successfully recorded all rich artifacts (model, weights, importances, report) to MLflow.")
        except Exception as e:
            logger.warning(f"Could not log full model artifacts to MLflow: {e}")

        return {
            "success": True,
            "version": f"v{version_num}",
            "promoted": promoted,
            "promotion_reason": reason,
            "learning_mode": "WARM_START_CONTINUAL" if base_trees > 0 else "FROM_SCRATCH",
            "base_trees": base_trees,
            "total_trees": total_trees,
            "mlflow_run_id": run_id,
            "mlflow_experiment_id": experiment_id,
            "samples": {
                "total": len(dataset),
                "train": len(X_train),
                "test": len(X_test)
            },
            "challenger_metrics": chall_test_metrics,
            "champion_metrics": champion_metrics,
            "version_record": version_record
        }
