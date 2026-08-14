"""
SQLAlchemy database model for stock_day table.
Stores historical daily candlestick bars (OHLCV) specifically used for ML training datasets.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Index, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base import Base

class StockDay(Base):
    """Stores raw daily candlestick data scraped from Vietstock for ML training."""
    __tablename__ = "stock_day"

    symbol = Column(String(10), primary_key=True, index=True, nullable=False)
    time = Column(String(20), primary_key=True, index=True, nullable=False)  # Format 'YYYY-MM-DD'
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=func.now())
