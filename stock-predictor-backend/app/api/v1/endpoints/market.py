"""
Market Overview and VN30 Index Aggregate statistics endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.stock import MarketOverviewOut
from app.services.stock_service import stock_service

router = APIRouter()

@router.get("/overview", response_model=MarketOverviewOut, summary="Lấy thông tin tổng quan chỉ số VN30 Index và độ rộng thị trường")
def get_market_overview(db: Session = Depends(get_db)) -> MarketOverviewOut:
    """Returns VN30 index value, point change, gainers/losers/neutral breadth, and volume."""
    return stock_service.get_market_overview(db)
