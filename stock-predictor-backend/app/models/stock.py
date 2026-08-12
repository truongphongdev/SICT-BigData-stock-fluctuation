"""
SQLAlchemy database models for stocks.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.db.base import Base

class Stock(Base):
    """SQLAlchemy model representing a stock."""
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    change = Column(Float, default=0.0)
    change_percent = Column(Float, default=0.0)
    volume = Column(String, default="0")
    market_cap = Column(String, default="0 Tỷ")
    pe = Column(String, default="15.0")
    eps = Column(String, default="2,000 VNĐ")
    roe = Column(String, default="18.5%")
    high_52w = Column(Float, nullable=True)
    low_52w = Column(Float, nullable=True)
    foreign_buy = Column(String, default="0")
    foreign_sell = Column(String, default="0")
    resistance = Column(Float, nullable=True)
    support = Column(Float, nullable=True)
    rsi = Column(Float, default=50.0)
    macd = Column(String, default="+0.0 (Neutral)")
    ai_signal = Column(String, default="NẮM GIỮ")
    ai_score = Column(Integer, default=75)
    ai_summary = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())
