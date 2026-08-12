"""
SQLAlchemy model for user portfolio & watchlists.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from app.db.base import Base

class PortfolioItem(Base):
    """Stores a stock tracked or held by a user."""
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    symbol = Column(String, index=True, nullable=False)
    quantity = Column(Float, default=0.0)  # 0 means watchlist only
    purchase_price = Column(Float, default=0.0)
    target_price = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())

    __table_args__ = (
        Index('idx_user_symbol', 'user_id', 'symbol', unique=True),
    )
