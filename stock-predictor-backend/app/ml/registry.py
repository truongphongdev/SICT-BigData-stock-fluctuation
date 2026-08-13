"""
Model Registry module backed by MLflow.
Manages versioning, tracking, and evaluation history of ML models.
"""
import logging
from typing import Dict, Any, List, Optional
import mlflow
from app.core.config import settings

logger = logging.getLogger(__name__)


class ModelRegistry:
    """Manages model tracking and evaluation history using MLflow."""
    
    def __init__(self):
        self.tracking_uri = settings.MLFLOW_TRACKING_URI
        self.experiment_name = settings.MLFLOW_EXPERIMENT_NAME

    def get_latest_model(self) -> Dict[str, Any]:
        """Retrieves details of the latest active production model."""
        return {
            "path": settings.MODEL_PATH,
            "experiment_name": self.experiment_name,
            "tracking_uri": self.tracking_uri
        }

    def get_evaluation_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Queries MLflow runs to return a structured history of model trainings and evaluations.
        """
        try:
            mlflow.set_tracking_uri(self.tracking_uri)
            experiment = mlflow.get_experiment_by_name(self.experiment_name)
            if not experiment:
                return []

            runs_df = mlflow.search_runs(
                experiment_ids=[experiment.experiment_id],
                max_results=limit,
                order_by=["start_time DESC"]
            )

            if runs_df.empty:
                return []

            history = []
            for _, row in runs_df.iterrows():
                run_id = row.get("run_id")
                start_time = str(row.get("start_time", ""))
                status = row.get("status", "FINISHED")
                
                # Extract logged metrics
                challenger_f1 = row.get("metrics.challenger_f1_score", None)
                challenger_acc = row.get("metrics.challenger_test_accuracy", None)
                champion_f1 = row.get("metrics.champion_f1_score", None)
                champion_acc = row.get("metrics.champion_accuracy", None)
                promoted = bool(row.get("metrics.promoted", 0) == 1)
                
                # Extract tags
                decision = row.get("tags.promotion_decision", "PROMOTED" if promoted else "REJECTED")
                reason = row.get("tags.promotion_reason", "")

                history.append({
                    "run_id": run_id,
                    "start_time": start_time,
                    "status": status,
                    "promoted": promoted,
                    "decision": decision,
                    "reason": reason,
                    "challenger_metrics": {
                        "f1_score": challenger_f1,
                        "accuracy": challenger_acc,
                        "precision": row.get("metrics.challenger_precision", None),
                        "recall": row.get("metrics.challenger_recall", None)
                    },
                    "champion_metrics": {
                        "f1_score": champion_f1,
                        "accuracy": champion_acc
                    } if champion_f1 is not None else None,
                    "params": {
                        "n_estimators": row.get("params.n_estimators", None),
                        "max_depth": row.get("params.max_depth", None),
                        "learning_rate": row.get("params.learning_rate", None)
                    }
                })

            return history
        except Exception as e:
            logger.error(f"Error querying evaluation history from MLflow: {e}")
            return []


model_registry = ModelRegistry()
