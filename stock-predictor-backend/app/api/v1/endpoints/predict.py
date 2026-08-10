"""
Endpoint for executing stock predictions.
"""
from fastapi import APIRouter, HTTPException
from app.schemas.prediction import PredictionRequest, PredictionResult
from app.services.prediction_service import prediction_service

router = APIRouter()

@router.post("/", response_model=PredictionResult)
def predict(request: PredictionRequest) -> PredictionResult:
    """
    Accepts stock historical features, executes the model prediction, and returns the results.
    """
    try:
        result = prediction_service.predict_stock_price(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
