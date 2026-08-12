"""
Pydantic schemas for Financial News & Market Sentiment.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class NewsArticleOut(BaseModel):
    id: int
    title: str
    summary: str
    content: Optional[str] = None
    category: str
    symbol: Optional[str] = None
    source: str
    sentiment: str
    sentiment_score: int
    impact_color: Optional[str] = "text-market-up"
    badge_bg: Optional[str] = "bg-market-up/15 text-market-up border-market-up/30"
    tags: List[str] = []
    url: Optional[str] = None
    time: Optional[str] = None
    published_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SentimentOverviewOut(BaseModel):
    overall_sentiment: str  # 'Lạc quan (Bullish)', 'Trung tính', 'Thận trọng'
    sentiment_index: int  # 0 - 100
    positive_news_count: int
    neutral_news_count: int
    negative_news_count: int
    top_mentioned_stocks: List[dict]
    market_mood_summary: str
