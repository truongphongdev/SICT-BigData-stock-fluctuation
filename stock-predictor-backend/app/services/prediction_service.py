"""
Service layer for handling prediction business logic and invoking ML predictor.
"""
from datetime import datetime, timezone
from app.ml.inference.predictor import Predictor
from app.schemas.prediction import PredictionRequest, PredictionResult
from app.core.config import settings

class PredictionService:
    """Service to handle stock prediction business logic."""
    
    def __init__(self):
        self.predictor = Predictor(model_path=settings.MODEL_PATH)

    def load_model(self) -> None:
        """Loads the underlying ML model during application startup."""
        self.predictor.load()

    def predict_stock_price(self, request: PredictionRequest) -> PredictionResult:
        """Generates predictions using the loaded ML model."""
        predicted_prices = self.predictor.predict(request.features)
        
        return PredictionResult(
            ticker=request.ticker,
            prediction_date=datetime.now(timezone.utc),
            predicted_prices=predicted_prices,
            confidence_intervals={
                "lower": [price * 0.95 for price in predicted_prices],
                "upper": [price * 1.05 for price in predicted_prices]
            }
        )

prediction_service = PredictionService()
