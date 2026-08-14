"""
Model Versioning and Lifecycle Management module.
Manages sequential versioned model checkpoints (v1, v2, v3...),
maintains the versions manifest, and facilitates atomic rollbacks.
"""
import os
import json
import shutil
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import xgboost as xgb

logger = logging.getLogger(__name__)

MODELS_DIR = os.path.join(os.path.abspath("."), "app", "ml", "models")
VERSIONS_DIR = os.path.join(MODELS_DIR, "versions")
MANIFEST_PATH = os.path.join(MODELS_DIR, "versions_manifest.json")
ACTIVE_MODEL_PATH = os.path.join(MODELS_DIR, "best_model.json")


def init_versioning_storage():
    """Ensures version directories and manifest exist."""
    os.makedirs(VERSIONS_DIR, exist_ok=True)
    if not os.path.exists(MANIFEST_PATH):
        default_manifest = {
            "model_name": "stock-predictor-vn30",
            "active_version": 0,
            "total_versions": 0,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "versions": []
        }
        with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(default_manifest, f, indent=2, ensure_ascii=False)


def get_manifest() -> Dict[str, Any]:
    """Reads and returns the versions manifest."""
    init_versioning_storage()
    try:
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading versions manifest: {e}")
        return {"model_name": "stock-predictor-vn30", "active_version": 0, "versions": []}


def save_new_model_version(
    model: xgb.XGBClassifier,
    metrics: Dict[str, Any],
    learning_mode: str,
    trees: int,
    promoted: bool,
    mlflow_run_id: str,
    promotion_reason: str
) -> Dict[str, Any]:
    """
    Saves a new incremental model version (e.g. model_v1.json, model_v2.json)
    and updates the version manifest.
    """
    init_versioning_storage()
    manifest = get_manifest()

    next_version = manifest.get("total_versions", len(manifest.get("versions", []))) + 1
    version_filename = f"model_v{next_version}.json"
    version_filepath = os.path.join(VERSIONS_DIR, version_filename)

    # Save versioned json file
    model.save_model(version_filepath)
    logger.info(f"Saved versioned model checkpoint: {version_filepath}")

    # Build version record
    version_record = {
        "version": next_version,
        "filename": version_filename,
        "filepath": version_filepath,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "trees": trees,
        "learning_mode": learning_mode,
        "accuracy": metrics.get("accuracy", 0.0),
        "f1_score": metrics.get("f1_score", 0.0),
        "precision": metrics.get("precision", 0.0),
        "recall": metrics.get("recall", 0.0),
        "promoted": promoted,
        "promotion_reason": promotion_reason,
        "mlflow_run_id": mlflow_run_id
    }

    manifest["versions"].append(version_record)
    manifest["total_versions"] = next_version
    manifest["last_updated"] = datetime.now(timezone.utc).isoformat()

    # If promoted, set as active production model
    if promoted or not os.path.exists(ACTIVE_MODEL_PATH):
        shutil.copyfile(version_filepath, ACTIVE_MODEL_PATH)
        manifest["active_version"] = next_version
        logger.info(f"Promoted Version {next_version} to active production model ({ACTIVE_MODEL_PATH})")

    # Save manifest
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    return version_record


def rollback_to_version(version: int) -> Dict[str, Any]:
    """
    Rolls back the active production model to a specific past version.
    """
    manifest = get_manifest()
    target_record = None
    for rec in manifest.get("versions", []):
        if rec.get("version") == version:
            target_record = rec
            break

    if not target_record:
        return {"success": False, "error": f"Version {version} not found in manifest."}

    version_filepath = target_record.get("filepath")
    if not version_filepath or not os.path.exists(version_filepath):
        version_filepath = os.path.join(VERSIONS_DIR, target_record.get("filename", f"model_v{version}.json"))

    if not os.path.exists(version_filepath):
        return {"success": False, "error": f"Model file for version {version} not found at {version_filepath}"}

    # Atomically overwrite active model
    shutil.copyfile(version_filepath, ACTIVE_MODEL_PATH)
    manifest["active_version"] = version
    manifest["last_updated"] = datetime.now(timezone.utc).isoformat()

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    logger.info(f"Successfully rolled back active production model to Version {version}")
    return {
        "success": True,
        "message": f"Successfully activated Version {version}",
        "active_version": version,
        "version_details": target_record
    }
