"""
Endpoints for managing stock records.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.stock import Stock, StockCreate
from app.services.stock_service import stock_service

router = APIRouter()

@router.get("/", response_model=List[Stock])
def read_stocks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[Stock]:
    """Retrieves all stock records."""
    return stock_service.get_stocks(db, skip=skip, limit=limit)

@router.post("/", response_model=Stock)
def create_stock(stock_in: StockCreate, db: Session = Depends(get_db)) -> Stock:
    """Creates a new stock record in the database."""
    db_stock = stock_service.get_stock_by_ticker(db, ticker=stock_in.ticker)
    if db_stock:
        raise HTTPException(status_code=400, detail="Stock with this ticker already exists.")
    return stock_service.create_stock(db, stock_in)

@router.get("/{ticker}", response_model=Stock)
def read_stock(ticker: str, db: Session = Depends(get_db)) -> Stock:
    """Retrieves a single stock by its ticker."""
    db_stock = stock_service.get_stock_by_ticker(db, ticker=ticker)
    if not db_stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return db_stock
