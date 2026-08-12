"""
Endpoints for managing and querying VN30 stocks and historical chart data.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.stock import StockOut, CandlePoint, IndicatorData
from app.services.stock_service import stock_service

router = APIRouter()

@router.get("/", response_model=List[StockOut], summary="Lấy danh sách mã VN30")
def read_stocks(
    sector: Optional[str] = Query(None, description="Lọc theo nhóm ngành (ví dụ: 'Ngân Hàng', 'Công Nghệ')"),
    sort_by: Optional[str] = Query("default", description="Sắp xếp: 'change_desc', 'change_asc', 'ai_score_desc', 'price_desc'"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo mã, tên hoặc ngành"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[StockOut]:
    """Retrieves list of VN30 stocks with optional sector filtering and sorting."""
    stocks = stock_service.get_stocks(db, sector=sector, sort_by=sort_by, search=search, skip=skip, limit=limit)
    return [StockOut.model_validate(s) for s in stocks]

@router.get("/{symbol}", response_model=StockOut, summary="Lấy chi tiết cổ phiếu theo mã")
def read_stock(symbol: str, db: Session = Depends(get_db)) -> StockOut:
    """Retrieves a single stock by its ticker symbol."""
    stock = stock_service.get_stock_by_symbol(db, symbol=symbol)
    if not stock:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy mã cổ phiếu '{symbol.upper()}'.")
    return StockOut.model_validate(stock)

@router.get("/{symbol}/history", response_model=List[CandlePoint], summary="Lấy dữ liệu nến lịch sử OHLCV cho biểu đồ TradingView")
def get_stock_history(
    symbol: str,
    timeframe: str = Query("1D", description="Khung thời gian nến: '15M', '1H', '1D', '1W'"),
    db: Session = Depends(get_db)
) -> List[CandlePoint]:
    """Returns chronological candlestick data for Lightweight Charts."""
    candles = stock_service.get_stock_history(db, symbol=symbol, timeframe=timeframe)
    if not candles:
        # Fallback dynamic candle generator if DB history is empty
        stock = stock_service.get_stock_by_symbol(db, symbol)
        base_p = stock.price if stock else 100.0
        from app.db.seed_data import generate_synthetic_candles
        num_bars = 90 if timeframe == "1D" else (140 if timeframe == "15M" else (110 if timeframe == "1H" else 60))
        raw = generate_synthetic_candles(base_p, num_bars, timeframe)
        candles = [CandlePoint(**c) for c in raw]
    return candles

@router.get("/{symbol}/indicators", response_model=IndicatorData, summary="Lấy các chỉ báo kỹ thuật RSI, MACD, Bollinger Bands, Kháng cự/Hỗ trợ")
def get_stock_indicators(symbol: str, db: Session = Depends(get_db)) -> IndicatorData:
    """Returns calculated technical indicators for a given stock."""
    return stock_service.get_stock_indicators(db, symbol=symbol)
