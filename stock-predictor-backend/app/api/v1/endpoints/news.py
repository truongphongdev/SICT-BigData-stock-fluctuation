"""
Endpoints for financial news and AI sentiment radar.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.news import NewsArticleOut, SentimentOverviewOut
from app.services.news_service import news_service

router = APIRouter()

@router.get("/", response_model=List[NewsArticleOut], summary="Lấy danh sách tin tức tài chính & sắc thái AI")
def get_news(
    symbol: Optional[str] = Query(None, description="Lọc tin theo mã cổ phiếu (FPT, HPG...)"),
    category: Optional[str] = Query(None, description="Lọc tin theo nhóm ngành"),
    search: Optional[str] = Query(None, description="Tìm kiếm nội dung tin tức"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
) -> List[NewsArticleOut]:
    """Returns curated financial news with AI sentiment scores."""
    return news_service.get_news_articles(db, symbol=symbol, category=category, search=search, skip=skip, limit=limit)

@router.get("/sentiment-overview", response_model=SentimentOverviewOut, summary="Lấy tổng quan chỉ số tâm lý thị trường (Market Sentiment Radar)")
def get_sentiment_overview(db: Session = Depends(get_db)) -> SentimentOverviewOut:
    """Returns overall bullish/bearish ratio and top mentioned stocks."""
    return news_service.get_sentiment_overview(db)
