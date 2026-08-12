"""
Endpoints for user Portfolio management and AI health diagnostics.
"""
from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.portfolio import PortfolioItemCreate, PortfolioOverview, PortfolioItemOut
from app.services.portfolio_service import portfolio_service

router = APIRouter()

@router.get("/", response_model=PortfolioOverview, summary="Lấy danh mục theo dõi và phân tích danh mục cá nhân")
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> PortfolioOverview:
    """Returns all positions and AI health analysis for the authenticated user."""
    return portfolio_service.get_portfolio_overview(db, user_id=current_user.id)

@router.post("/toggle/{symbol}", summary="Bật/Tắt theo dõi mã cổ phiếu trong danh mục")
def toggle_portfolio_symbol(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Toggles watchlist status of a symbol."""
    return portfolio_service.toggle_watchlist_symbol(db, user_id=current_user.id, symbol=symbol)

@router.post("/items", response_model=PortfolioItemOut, summary="Thêm hoặc cập nhật vị thế giao dịch trong danh mục")
def add_or_update_item(
    item_in: PortfolioItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> PortfolioItemOut:
    """Creates or updates a tracked stock position."""
    item = portfolio_service.add_or_update_item(db, user_id=current_user.id, item_in=item_in)
    return PortfolioItemOut.model_validate(item)

@router.delete("/items/{item_id}", summary="Xóa vị thế khỏi danh mục")
def delete_portfolio_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, bool]:
    """Deletes a portfolio position by ID."""
    success = portfolio_service.delete_item(db, user_id=current_user.id, item_id=item_id)
    return {"success": success}
