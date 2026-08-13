"""
Endpoints for Machine Learning model lifecycle management (Retraining, MLflow Evaluation, Hot-Reload, History).
"""
import os
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, BackgroundTasks, Query, status

from app.ml.training.train import train_model
from app.ml.registry import model_registry
from app.services.prediction_service import prediction_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


def execute_background_retraining():
    """Background task to run model training, MLflow evaluation, and selective hot-reload."""
    logger.info("=== [ML PIPELINE] Starting background model retraining & evaluation ===")
    try:
        result = train_model()
        logger.info(f"=== [ML PIPELINE] Retraining finished. Decision: {result.get('promotion_reason')} ===")
        if result.get("success"):
            if result.get("promoted"):
                prediction_service.load_model()
                logger.info("=== [ML PIPELINE] Challenger model promoted & hot-reloaded into memory ===")
            else:
                logger.info("=== [ML PIPELINE] Challenger rejected. Existing Champion model retained in memory ===")
        else:
            logger.error(f"=== [ML PIPELINE] Retraining failed: {result.get('error')} ===")
    except Exception as e:
        logger.exception(f"=== [ML PIPELINE] Unexpected error during background retraining: {e} ===")


@router.post("/retrain", status_code=status.HTTP_202_ACCEPTED, summary="Kích hoạt luồng huấn luyện & đánh giá mô hình với MLflow (Bất đồng bộ)")
def trigger_retraining(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Triggers the model retraining and MLflow Champion/Challenger evaluation pipeline as an asynchronous background task.
    Returns immediately to avoid webhook / client timeouts.
    """
    background_tasks.add_task(execute_background_retraining)
    return {
        "status": "accepted",
        "message": "Model retraining and MLflow evaluation pipeline has been initiated in background.",
        "triggered_at": datetime.now(timezone.utc).isoformat()
    }


@router.post("/retrain-sync", summary="Kích hoạt huấn luyện, đánh giá mô hình MLflow và chờ kết quả (Đồng bộ)")
def trigger_retraining_sync() -> Dict[str, Any]:
    """
    Executes the retraining & Champion/Challenger evaluation pipeline synchronously.
    Returns full metrics, MLflow run ID, and promotion outcome.
    """
    result = train_model()
    if result.get("success") and result.get("promoted"):
        prediction_service.load_model()

    return {
        "status": "completed" if result.get("success") else "failed",
        "result": result,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }


@router.get("/evaluation-history", summary="Lấy lịch sử các lần huấn luyện và đánh giá mô hình từ MLflow")
def get_evaluation_history(limit: int = Query(default=20, ge=1, le=100)) -> Dict[str, Any]:
    """
    Returns historical model evaluations tracked by MLflow (runs, metrics, parameters, promotion decisions).
    """
    history = model_registry.get_evaluation_history(limit=limit)
    return {
        "count": len(history),
        "experiment_name": settings.MLFLOW_EXPERIMENT_NAME,
        "tracking_uri": settings.MLFLOW_TRACKING_URI,
        "history": history
    }


@router.get("/status", summary="Kiểm tra trạng thái mô hình ML và MLflow đang hoạt động")
def get_ml_status() -> Dict[str, Any]:
    """
    Returns current active model status, MLflow tracking configuration, and hot-reload state.
    """
    model_path = settings.MODEL_PATH
    exists = os.path.exists(model_path)
    last_modified = None
    if exists:
        mtime = os.path.getmtime(model_path)
        last_modified = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()

    is_loaded = getattr(prediction_service.predictor, "is_loaded", False)
    model_type = type(prediction_service.predictor.model).__name__ if prediction_service.predictor.model else "None"

    return {
        "model_loaded": is_loaded,
        "model_type": model_type,
        "model_path": model_path,
        "weights_exist": exists,
        "last_trained_at": last_modified,
        "mlflow_tracking_uri": settings.MLFLOW_TRACKING_URI,
        "mlflow_experiment_name": settings.MLFLOW_EXPERIMENT_NAME,
        "version": "v3.4-XGBoost Alpha"
    }
