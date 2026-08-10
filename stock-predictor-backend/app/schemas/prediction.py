"""
Pydantic schemas for Prediction requests and responses.
"""
from datetime import datetime
from typing import List, Dict, Any
from pydantic import BaseModel

class PredictionRequest(BaseModel):
    ticker: str
    features: List[float]
    days_to_predict: int = 5

class PredictionResult(BaseModel):
    ticker: str
    prediction_date: datetime
    predicted_prices: List[float]
    confidence_intervals: Dict[str, Any] = {}
