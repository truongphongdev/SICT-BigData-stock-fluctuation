"""
Endpoints for AI predictions, trend forecasting, and deep analysis reports.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.prediction import PredictionRequest, PredictionResult, DeepAnalysisResponse
from app.services.prediction_service import prediction_service
from app.models.stock import Stock

router = APIRouter()

@router.post("/", response_model=PredictionResult, summary="Dự đoán xu hướng giá theo danh sách đặc trưng")
def predict_raw(request: PredictionRequest, db: Session = Depends(get_db)) -> PredictionResult:
    """Accepts stock symbol or features and returns prediction result."""
    target_symbol = request.symbol or request.ticker or "FPT"
    return prediction_service.predict_for_symbol(db, symbol=target_symbol)

@router.get("/{symbol}", response_model=PredictionResult, summary="Lấy dự báo AI & mục tiêu giá phiên tiếp theo cho mã cổ phiếu")
def get_prediction_for_symbol(symbol: str, db: Session = Depends(get_db)) -> PredictionResult:
    """Generates AI signal, next-session target price, and confidence score."""
    return prediction_service.predict_for_symbol(db, symbol=symbol)

@router.get("/all/signals", response_model=List[PredictionResult], summary="Lấy dự báo và tín hiệu AI cho toàn bộ 30 mã VN30")
def get_all_predictions(db: Session = Depends(get_db)) -> List[PredictionResult]:
    """Returns AI recommendations across the entire VN30 basket."""
    stocks = db.query(Stock).all()
    results = []
    for s in stocks:
        pred = prediction_service.predict_for_symbol(db, symbol=s.symbol)
        results.append(pred)
    return results

@router.post("/deep-analysis/{symbol}", response_model=DeepAnalysisResponse, summary="Tạo báo cáo Phân Tích AI Sâu (Deep Analysis)")
def get_deep_analysis(symbol: str, db: Session = Depends(get_db)) -> DeepAnalysisResponse:
    """Generates multi-scenario probabilistic breakdown and key drivers for AI Modal."""
    return prediction_service.get_deep_analysis(db, symbol=symbol)
