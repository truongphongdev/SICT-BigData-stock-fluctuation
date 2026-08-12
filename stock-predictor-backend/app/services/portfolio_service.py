"""
Service layer for managing user Portfolio watchlists and trading simulations.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.portfolio import PortfolioItem
from app.models.stock import Stock
from app.schemas.portfolio import PortfolioItemCreate, PortfolioItemOut, PortfolioOverview
from app.schemas.stock import StockOut

class PortfolioService:
    """Handles Portfolio queries, item creation, and AI health check."""

    def get_portfolio_overview(self, db: Session, user_id: int) -> PortfolioOverview:
        """Retrieves complete portfolio items and aggregate health diagnostics."""
        items = db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()
        
        # If user has no portfolio, seed default symbols
        if not items:
            default_symbols = ["FPT", "HPG", "VCB", "SSI"]
            for sym in default_symbols:
                s = db.query(Stock).filter(Stock.symbol == sym).first()
                p_val = s.price if s else 100.0
                new_item = PortfolioItem(
                    user_id=user_id,
                    symbol=sym,
                    quantity=1000.0,
                    purchase_price=round(p_val * 0.95, 2),
                    target_price=round(p_val * 1.12, 2),
                    stop_loss=round(p_val * 0.90, 2),
                    notes="Vị thế chiến lược rổ VN30 theo tín hiệu AI Alpha"
                )
                db.add(new_item)
            db.commit()
            items = db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()

        output_items = []
        symbols = []
        up_count = 0
        down_count = 0
        buy_signals_count = 0
        total_val = 0.0

        for item in items:
            stock = db.query(Stock).filter(Stock.symbol == item.symbol).first()
            symbols.append(item.symbol)
            
            stock_info = StockOut.model_validate(stock) if stock else None
            curr_price = stock.price if stock else item.purchase_price
            qty = max(item.quantity, 1000.0)
            
            val = curr_price * qty
            total_val += val
            
            diff = curr_price - item.purchase_price
            pnl = diff * qty
            pnl_percent = (diff / item.purchase_price * 100) if item.purchase_price > 0 else 0.0

            if stock:
                if stock.change >= 0:
                    up_count += 1
                else:
                    down_count += 1
                if "MUA" in (stock.ai_signal or ""):
                    buy_signals_count += 1

            output_items.append(
                PortfolioItemOut(
                    id=item.id,
                    symbol=item.symbol,
                    quantity=item.quantity,
                    purchase_price=item.purchase_price,
                    target_price=item.target_price,
                    stop_loss=item.stop_loss,
                    notes=item.notes,
                    stock_info=stock_info,
                    current_value=round(val, 2),
                    profit_loss=round(pnl, 2),
                    profit_loss_percent=round(pnl_percent, 2),
                    created_at=item.created_at
                )
            )

        # Health score calculation
        total_len = max(len(symbols), 1)
        up_ratio = up_count / total_len
        health_score = int(min(98, max(50, 60 + (up_ratio * 30) + (buy_signals_count * 2))))

        if health_score >= 85:
            rec = "Danh mục đang ở trạng thái TĂNG TRƯỞNG MẠNH. Đa số các mã đều giữ trên MA20 và có dòng tiền tích cực."
        elif health_score >= 70:
            rec = "Danh mục đang ở trạng thái CÂN BẰNG TỐT. Tiếp tục nắm giữ và chốt lời từng phần khi chạm cản trên."
        else:
            rec = "Danh mục chịu áp lực điều chỉnh. Khuyến nghị cơ cấu lại các mã có tín hiệu BÁN để giảm thiểu rủi ro."

        return PortfolioOverview(
            total_symbols=len(symbols),
            symbols=symbols,
            items=output_items,
            total_valuation=f"{round(total_val / 1000, 2)} Triệu VNĐ",
            up_count=up_count,
            down_count=down_count,
            buy_signals_count=buy_signals_count,
            portfolio_health_score=health_score,
            ai_recommendation=rec
        )

    def toggle_watchlist_symbol(self, db: Session, user_id: int, symbol: str) -> Dict[str, Any]:
        """Toggles a stock in user's watchlist."""
        symbol = symbol.upper()
        existing = db.query(PortfolioItem).filter(
            PortfolioItem.user_id == user_id,
            PortfolioItem.symbol == symbol
        ).first()

        if existing:
            db.delete(existing)
            db.commit()
            in_portfolio = False
        else:
            stock = db.query(Stock).filter(Stock.symbol == symbol).first()
            p_price = stock.price if stock else 100.0
            new_item = PortfolioItem(
                user_id=user_id,
                symbol=symbol,
                quantity=1000.0,
                purchase_price=round(p_price, 2),
                target_price=round(p_price * 1.10, 2),
                stop_loss=round(p_price * 0.93, 2),
                notes="Theo dõi tín hiệu AI"
            )
            db.add(new_item)
            db.commit()
            in_portfolio = True

        all_items = db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()
        return {
            "symbol": symbol,
            "in_portfolio": in_portfolio,
            "portfolio_symbols": [item.symbol for item in all_items]
        }

    def add_or_update_item(self, db: Session, user_id: int, item_in: PortfolioItemCreate) -> PortfolioItem:
        """Adds or updates a portfolio position."""
        symbol = item_in.symbol.upper()
        item = db.query(PortfolioItem).filter(
            PortfolioItem.user_id == user_id,
            PortfolioItem.symbol == symbol
        ).first()

        if item:
            item.quantity = item_in.quantity
            item.purchase_price = item_in.purchase_price
            item.target_price = item_in.target_price
            item.stop_loss = item_in.stop_loss
            item.notes = item_in.notes
        else:
            item = PortfolioItem(
                user_id=user_id,
                symbol=symbol,
                quantity=item_in.quantity,
                purchase_price=item_in.purchase_price,
                target_price=item_in.target_price,
                stop_loss=item_in.stop_loss,
                notes=item_in.notes
            )
            db.add(item)

        db.commit()
        db.refresh(item)
        return item

    def delete_item(self, db: Session, user_id: int, item_id: int) -> bool:
        """Removes a position by ID."""
        item = db.query(PortfolioItem).filter(
            PortfolioItem.id == item_id,
            PortfolioItem.user_id == user_id
        ).first()
        if not item:
            raise HTTPException(status_code=404, detail="Không tìm thấy mục trong danh mục.")
        db.delete(item)
        db.commit()
        return True

portfolio_service = PortfolioService()
