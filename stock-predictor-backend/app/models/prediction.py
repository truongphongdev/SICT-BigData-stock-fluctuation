"""
SQLAlchemy model for AI stock predictions and forecasts.
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class AIPrediction(Base):
    """Stores AI forecast outputs and deep analysis results."""
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)
    prediction_date = Column(DateTime(timezone=True), default=func.now())
    target_date = Column(String, nullable=True)
    signal = Column(String, nullable=False)  # 'MUA MẠNH', 'MUA', 'NẮM GIỮ', 'BÁN'
    confidence_score = Column(Integer, default=85)
    current_price = Column(Float, nullable=False)
    predicted_price = Column(Float, nullable=False)
    expected_change_percent = Column(Float, nullable=False)
    rationale = Column(Text, nullable=True)
    risk_level = Column(String, default="Trung bình")  # 'Thấp', 'Trung bình', 'Cao'
    model_version = Column(String, default="v3.4-XGBoost")
    created_at = Column(DateTime(timezone=True), default=func.now())
