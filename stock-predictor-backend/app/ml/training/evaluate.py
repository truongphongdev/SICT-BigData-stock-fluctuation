"""
Model evaluation module.
Calculates classification metrics (Accuracy, Precision, Recall, F1-Score)
and provides Champion vs Challenger model comparison logic.
"""
from typing import Dict, Any, Optional, Tuple
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, log_loss

import logging

logger = logging.getLogger(__name__)


def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray, y_prob: Optional[np.ndarray] = None) -> Dict[str, float]:
    """Calculates classification evaluation metrics."""
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    metrics = {
        "accuracy": float(np.round(acc, 4)),
        "precision": float(np.round(prec, 4)),
        "recall": float(np.round(rec, 4)),
        "f1_score": float(np.round(f1, 4))
    }

    if y_prob is not None:
        try:
            loss = float(log_loss(y_true, y_prob))
            metrics["log_loss"] = float(np.round(loss, 4))
        except Exception:
            pass

    return metrics


def evaluate_model(model: Any, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
    """
    Evaluates a trained model (or rule engine) on a test dataset.
    """
    if len(X_test) == 0 or len(y_test) == 0:
        return {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0
        }

    try:
        if hasattr(model, "predict"):
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test) if hasattr(model, "predict_proba") else None
            return evaluate_predictions(y_test, y_pred, y_prob)
        else:
            # Fallback for non-scikit models / rule engines
            return {
                "accuracy": 0.5,
                "precision": 0.5,
                "recall": 0.5,
                "f1_score": 0.5
            }
    except Exception as e:
        logger.error(f"Failed to evaluate model: {e}")
        return {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "error": str(e)
        }


def compare_models(
    champion_metrics: Optional[Dict[str, float]],
    challenger_metrics: Dict[str, float],
    primary_metric: str = "f1_score"
) -> Tuple[bool, str]:
    """
    Compares the Challenger model against the Champion model using a primary metric.
    Returns (promoted: bool, reason: str).
    """
    if not champion_metrics or champion_metrics.get("f1_score") is None:
        return True, f"No previous champion metrics found. Promoting challenger as the new baseline champion ({primary_metric}: {challenger_metrics.get(primary_metric, 0):.4f})."

    champ_score = champion_metrics.get(primary_metric, 0.0)
    chall_score = challenger_metrics.get(primary_metric, 0.0)

    # Threshold delta: Challenger must be strictly greater than or equal to champion
    if chall_score >= champ_score:
        return True, (
            f"Challenger outperformed or equaled Champion on {primary_metric}: "
            f"Challenger ({chall_score:.4f}) >= Champion ({champ_score:.4f}). Promoted to production."
        )
    else:
        return False, (
            f"Champion maintained superior performance on {primary_metric}: "
            f"Champion ({champ_score:.4f}) > Challenger ({chall_score:.4f}). Challenger rejected."
        )
