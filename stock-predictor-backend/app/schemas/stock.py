"""
Pydantic schemas for Stock objects, Candle history, and Market metrics.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class StockBase(BaseModel):
    symbol: str
    name: str
    sector: str
    price: float
    change: float = 0.0
    changePercent: float = Field(0.0, alias="change_percent")
    volume: str = "0"
    marketCap: str = Field("0 Tỷ", alias="market_cap")
    pe: str = "15.0"
    eps: str = "2,000 VNĐ"
    roe: Optional[str] = "18.5%"
    high52w: Optional[float] = Field(None, alias="high_52w")
    low52w: Optional[float] = Field(None, alias="low_52w")
    foreignBuy: Optional[str] = Field("0", alias="foreign_buy")
    foreignSell: Optional[str] = Field("0", alias="foreign_sell")
    resistance: Optional[float] = None
    support: Optional[float] = None
    rsi: Optional[float] = 50.0
    macd: Optional[str] = "+0.0 (Neutral)"
    aiSignal: Optional[str] = Field("NẮM GIỮ", alias="ai_signal")
    aiSignalColor: Optional[str] = "text-primary"
    aiScore: Optional[int] = Field(75, alias="ai_score")
    aiSummary: Optional[str] = Field(None, alias="ai_summary")
    flash: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class StockCreate(BaseModel):
    symbol: str
    name: str
    sector: str
    price: float
    change: float = 0.0
    change_percent: float = 0.0
    volume: str = "0"
    market_cap: str = "0 Tỷ"
    pe: str = "15.0"
    eps: str = "2,000 VNĐ"
    roe: Optional[str] = "18.5%"
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None
    foreign_buy: Optional[str] = "0"
    foreign_sell: Optional[str] = "0"
    resistance: Optional[float] = None
    support: Optional[float] = None
    rsi: Optional[float] = 50.0
    macd: Optional[str] = "+0.0 (Neutral)"
    ai_signal: Optional[str] = "NẮM GIỮ"
    ai_score: Optional[int] = 75
    ai_summary: Optional[str] = None

class StockUpdate(BaseModel):
    price: Optional[float] = None
    change: Optional[float] = None
    change_percent: Optional[float] = None
    volume: Optional[str] = None

class StockOut(StockBase):
    id: int
    updated_at: Optional[datetime] = None

class CandlePoint(BaseModel):
    time: str  # YYYY-MM-DD
    open: float
    high: float
    low: float
    close: float
    volume: float

    model_config = ConfigDict(from_attributes=True)

class IndicatorData(BaseModel):
    symbol: str
    price: float
    rsi: float
    rsi_status: str  # 'Quá mua (Overbought)', 'Quá bán (Oversold)', 'Trung tính (Neutral)'
    macd_val: float
    macd_signal: float
    macd_hist: float
    macd_desc: str  # '+1.45 (Bullish)'
    ema_20: float
    ema_50: float
    bb_upper: float
    bb_middle: float
    bb_lower: float
    support: float
    resistance: float

class MarketOverviewOut(BaseModel):
    vn30Index: float
    indexChange: float
    percentIndex: float
    upCount: int
    downCount: int
    refCount: int
    totalVolume: str
    totalValue: str
    isUp: bool
