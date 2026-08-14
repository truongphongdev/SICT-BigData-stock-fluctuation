"""
SQLAlchemy database model for historical stock candlestick OHLCV data.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Index, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base import Base

class StockHistory(Base):
    """Stores historical candlestick bars (OHLCV) for trading charts."""
    __tablename__ = "stock_history"

    symbol = Column(String(10), primary_key=True, index=True, nullable=False)
    time = Column(String(20), primary_key=True, index=True, nullable=False)  # ISO Date 'YYYY-MM-DD'
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, default=0.0)
    timeframe = Column(String(10), default="1D", index=True)  # '15M', '1H', '1D', '1W'
    created_at = Column(DateTime(timezone=True), default=func.now())
