"""
Model Registry module. Manages multiple model versions.
"""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ModelRegistry:
    """Manages versioning and tracking of ML model files."""
    
    def __init__(self):
        self.registry: Dict[str, Any] = {}

    def register_model(self, model_id: str, model_meta: Dict[str, Any]) -> None:
        """Registers a trained model version with metadata."""
        logger.info(f"Registering model version: {model_id}")
        self.registry[model_id] = model_meta

    def get_latest_model(self) -> Dict[str, Any]:
        """Retrieves details of the latest registered model."""
        return self.registry.get("latest", {"path": "app/ml/models/best_model.pt"})
