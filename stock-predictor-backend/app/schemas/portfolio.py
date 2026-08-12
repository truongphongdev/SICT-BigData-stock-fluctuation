"""
Pydantic schemas for Portfolio management.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.stock import StockOut

class PortfolioItemCreate(BaseModel):
    symbol: str
    quantity: float = 0.0
    purchase_price: float = 0.0
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    notes: Optional[str] = None

class PortfolioItemOut(BaseModel):
    id: int
    symbol: str
    quantity: float
    purchase_price: float
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    notes: Optional[str] = None
    stock_info: Optional[StockOut] = None
    current_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_percent: Optional[float] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PortfolioOverview(BaseModel):
    total_symbols: int
    symbols: List[str]
    items: List[PortfolioItemOut]
    total_valuation: str
    up_count: int
    down_count: int
    buy_signals_count: int
    portfolio_health_score: int
    ai_recommendation: str
