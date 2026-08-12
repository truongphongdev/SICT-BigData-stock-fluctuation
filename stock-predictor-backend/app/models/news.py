"""
SQLAlchemy model for financial news and AI sentiment analysis.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class NewsArticle(Base):
    """Stores financial news items with AI sentiment tagging."""
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=True)
    category = Column(String, nullable=False)  # e.g., '💻 Công Nghệ & Bán Lẻ'
    symbol = Column(String, index=True, nullable=True)  # e.g., 'FPT'
    source = Column(String, default="VN30 Alpha Research")
    sentiment = Column(String, default="TÍCH CỰC")  # 'TÍCH CỰC', 'MUA MẠNH', 'TRUNG TÍNH', 'TIÊU CỰC'
    sentiment_score = Column(Integer, default=85)
    tags = Column(String, default="")  # Comma separated
    url = Column(String, nullable=True)
    published_at = Column(DateTime(timezone=True), default=func.now())
