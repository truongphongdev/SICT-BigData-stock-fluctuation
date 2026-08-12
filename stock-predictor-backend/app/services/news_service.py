"""
Service layer for financial news and AI sentiment overview.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.news import NewsArticle
from app.schemas.news import NewsArticleOut, SentimentOverviewOut

class NewsService:
    """Handles financial news retrieval and market sentiment aggregation."""

    def get_news_articles(
        self,
        db: Session,
        symbol: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[NewsArticleOut]:
        """Retrieves and filters news articles."""
        query = db.query(NewsArticle)

        if symbol:
            query = query.filter(NewsArticle.symbol == symbol.upper())
        if category and category != "Tất cả":
            query = query.filter(NewsArticle.category.ilike(f"%{category}%"))
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    NewsArticle.title.ilike(search_pattern),
                    NewsArticle.summary.ilike(search_pattern),
                    NewsArticle.tags.ilike(search_pattern)
                )
            )

        records = query.order_by(NewsArticle.published_at.desc()).offset(skip).limit(limit).all()

        results = []
        for r in records:
            tags_list = [t.strip() for t in (r.tags or "").split(",") if t.strip()]
            
            # Formatting badges
            if r.sentiment == "MUA MẠNH":
                badge_bg = "bg-primary-container/30 text-primary border-primary/40 ai-glow"
                impact_color = "text-primary"
            elif r.sentiment == "TÍCH CỰC":
                badge_bg = "bg-market-up/15 text-market-up border-market-up/30"
                impact_color = "text-market-up"
            elif r.sentiment == "TIÊU CỰC":
                badge_bg = "bg-market-down/15 text-market-down border-market-down/30"
                impact_color = "text-market-down"
            else:
                badge_bg = "bg-surface-variant text-on-surface-variant"
                impact_color = "text-amber-400"

            results.append(
                NewsArticleOut(
                    id=r.id,
                    title=r.title,
                    summary=r.summary,
                    content=r.content,
                    category=r.category,
                    symbol=r.symbol,
                    source=r.source,
                    sentiment=r.sentiment,
                    sentiment_score=r.sentiment_score,
                    impact_color=impact_color,
                    badge_bg=badge_bg,
                    tags=tags_list,
                    url=r.url,
                    time="Hôm nay",
                    published_at=r.published_at
                )
            )

        return results

    def get_sentiment_overview(self, db: Session) -> SentimentOverviewOut:
        """Calculates macro market sentiment index and mentions radar."""
        articles = db.query(NewsArticle).all()
        pos_count = sum(1 for a in articles if a.sentiment in ("TÍCH CỰC", "MUA MẠNH"))
        neg_count = sum(1 for a in articles if a.sentiment == "TIÊU CỰC")
        neu_count = len(articles) - pos_count - neg_count

        total = max(len(articles), 1)
        sentiment_idx = int(round((pos_count / total) * 100))

        if sentiment_idx >= 75:
            overall = "Lạc quan (Bullish)"
            mood = "Dòng tiền lớn và tâm lý nhà đầu tư tổ chức đang rất hưng phấn trước triển vọng kết quả kinh doanh quý và nâng hạng thị trường."
        elif sentiment_idx >= 50:
            overall = "Trung tính (Neutral)"
            mood = "Thị trường ở trạng thái phân hóa theo nhóm ngành, nhà đầu tư ưu tiên chọn lọc cổ phiếu có câu chuyện tăng trưởng riêng."
        else:
            overall = "Thận trọng (Cautious)"
            mood = "Tâm lý thận trọng trước áp lực tỷ giá và động thái bán ròng của khối ngoại."

        top_stocks = [
            {"symbol": "FPT", "mentions": 12, "sentiment": "96% Tích cực"},
            {"symbol": "HPG", "mentions": 10, "sentiment": "92% Tích cực"},
            {"symbol": "SSI", "mentions": 9, "sentiment": "94% Tích cực"},
            {"symbol": "VCB", "mentions": 8, "sentiment": "88% Tích cực"},
            {"symbol": "MWG", "mentions": 7, "sentiment": "85% Tích cực"}
        ]

        return SentimentOverviewOut(
            overall_sentiment=overall,
            sentiment_index=sentiment_idx,
            positive_news_count=pos_count,
            neutral_news_count=neu_count,
            negative_news_count=neg_count,
            top_mentioned_stocks=top_stocks,
            market_mood_summary=mood
        )

news_service = NewsService()
