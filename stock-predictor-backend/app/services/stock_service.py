"""
Service layer for database operations on Stock entities and Market Overview.
"""
from typing import List, Optional, Dict, Any
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.stock import Stock
from app.models.stock_history import StockHistory
from app.schemas.stock import StockOut, CandlePoint, IndicatorData, MarketOverviewOut
from app.ml.indicators import extract_all_indicators

class StockService:
    """Handles business logic and DB queries for Stocks and Market aggregates."""

    def get_stock_by_symbol(self, db: Session, symbol: str) -> Optional[Stock]:
        """Fetches a single stock record from the database by its ticker symbol."""
        return db.query(Stock).filter(Stock.symbol == symbol.upper()).first()

    def get_stocks(
        self,
        db: Session,
        sector: Optional[str] = None,
        sort_by: Optional[str] = "default",
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Stock]:
        """Retrieves and filters the list of VN30 stock records."""
        query = db.query(Stock)

        # Search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Stock.symbol.ilike(search_pattern),
                    Stock.name.ilike(search_pattern),
                    Stock.sector.ilike(search_pattern)
                )
            )

        # Sector filter
        if sector and sector != "Tất cả":
            if sector == "Ngân Hàng":
                query = query.filter(or_(Stock.sector == "Ngân Hàng", Stock.sector.ilike("%Tài Chính%")))
            elif sector == "Công Nghệ":
                query = query.filter(Stock.sector.ilike("%Công Nghệ%"))
            elif sector in ("Thép & BĐS", "BĐS"):
                query = query.filter(or_(Stock.sector.ilike("%Thép%"), Stock.sector.ilike("%BĐS%"), Stock.sector.ilike("%Bất Động Sản%")))
            elif sector in ("Bán Lẻ & Hàng Tiêu Dùng", "Bán Lẻ"):
                query = query.filter(or_(Stock.sector.ilike("%Bán Lẻ%"), Stock.sector.ilike("%Tiêu Dùng%"), Stock.sector.ilike("%Thực Phẩm%")))
            else:
                query = query.filter(Stock.sector.ilike(f"%{sector}%"))

        stocks = query.all()

        # Sorting logic
        if sort_by == "change_desc":
            stocks.sort(key=lambda s: s.change_percent, reverse=True)
        elif sort_by == "change_asc":
            stocks.sort(key=lambda s: s.change_percent)
        elif sort_by == "ai_score_desc":
            stocks.sort(key=lambda s: s.ai_score, reverse=True)
        elif sort_by == "price_desc":
            stocks.sort(key=lambda s: s.price, reverse=True)

        return stocks[skip:skip + limit]

    def get_stock_history(self, db: Session, symbol: str, timeframe: str = "1D") -> List[CandlePoint]:
        """Retrieves candlestick OHLCV bars for TradingView charts."""
        records = db.query(StockHistory).filter(
            StockHistory.symbol == symbol.upper(),
            StockHistory.timeframe == timeframe
        ).order_by(StockHistory.time.asc()).all()

        return [
            CandlePoint(
                time=r.time,
                open=r.open,
                high=r.high,
                low=r.low,
                close=r.close,
                volume=r.volume
            )
            for r in records
        ]

    def get_stock_indicators(self, db: Session, symbol: str) -> IndicatorData:
        """Computes technical indicator summary for a given symbol."""
        candles = self.get_stock_history(db, symbol, timeframe="1D")
        stock = self.get_stock_by_symbol(db, symbol)
        last_price = stock.price if stock else 100.0

        if candles:
            df = pd.DataFrame([c.model_dump() for c in candles])
            ind = extract_all_indicators(df)
        else:
            ind = {
                "price": last_price,
                "rsi": stock.rsi if stock else 55.0,
                "rsi_status": "Trung tính (Neutral)",
                "macd_val": 0.5,
                "macd_signal": 0.3,
                "macd_hist": 0.2,
                "macd_desc": stock.macd if stock else "+0.50 (Bullish)",
                "ema_20": last_price * 0.98,
                "ema_50": last_price * 0.95,
                "bb_upper": last_price * 1.05,
                "bb_middle": last_price,
                "bb_lower": last_price * 0.95,
                "support": stock.support if stock else last_price * 0.95,
                "resistance": stock.resistance if stock else last_price * 1.05
            }

        return IndicatorData(
            symbol=symbol.upper(),
            price=ind.get("price", last_price),
            rsi=ind.get("rsi", 50.0),
            rsi_status=ind.get("rsi_status", "Trung tính (Neutral)"),
            macd_val=ind.get("macd_val", 0.0),
            macd_signal=ind.get("macd_signal", 0.0),
            macd_hist=ind.get("macd_hist", 0.0),
            macd_desc=ind.get("macd_desc", "+0.00 (Neutral)"),
            ema_20=ind.get("ema_20", last_price),
            ema_50=ind.get("ema_50", last_price),
            bb_upper=ind.get("bb_upper", last_price * 1.05),
            bb_middle=ind.get("bb_middle", last_price),
            bb_lower=ind.get("bb_lower", last_price * 0.95),
            support=ind.get("support", last_price * 0.95),
            resistance=ind.get("resistance", last_price * 1.05)
        )

    def get_market_overview(self, db: Session) -> MarketOverviewOut:
        """Calculates aggregate VN30 Index stats and market breadth."""
        stocks = db.query(Stock).all()
        up_count = 0
        down_count = 0
        ref_count = 0
        index_change = 0.0

        for s in stocks:
            if s.change > 0:
                up_count += 1
            elif s.change < 0:
                down_count += 1
            else:
                ref_count += 1
            index_change += (s.change * 0.4)

        base_index = 1272.05
        current_index = round(base_index + index_change, 2)
        percent_index = round((index_change / base_index) * 100, 2) if base_index > 0 else 0.0

        return MarketOverviewOut(
            vn30Index=current_index,
            indexChange=round(index_change, 2),
            percentIndex=percent_index,
            upCount=up_count,
            downCount=down_count,
            refCount=ref_count,
            totalVolume="248.5M",
            totalValue="8,450.2B",
            isUp=(index_change >= 0)
        )

stock_service = StockService()
