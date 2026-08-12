"""
Pydantic schemas for AI Prediction requests, responses, and deep analysis.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict

class PredictionRequest(BaseModel):
    ticker: Optional[str] = None
    symbol: Optional[str] = None
    features: Optional[List[float]] = None
    days_to_predict: int = 5

class PredictionResult(BaseModel):
    symbol: str
    prediction_date: datetime
    signal: str
    signal_color: str
    ai_score: int
    current_price: float
    target_price: float
    forecast_delta: float
    forecast_percent: float
    ai_summary: str
    predicted_prices: List[float]
    confidence_intervals: Dict[str, Any] = {}
    model_version: str = "v3.4-XGBoost"

    model_config = ConfigDict(from_attributes=True)

class DeepAnalysisResponse(BaseModel):
    symbol: str
    name: str
    sector: str
    current_price: float
    ai_signal: str
    ai_score: int
    target_price: float
    stop_loss: float
    expected_return: str
    risk_level: str
    ai_summary: str
    technical_summary: Dict[str, Any]
    fundamental_summary: Dict[str, Any]
    sentiment_summary: Dict[str, Any]
    price_scenarios: Dict[str, float]
    key_drivers: List[str]
    model_version: str = "v3.4-XGBoost Alpha"
