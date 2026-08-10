"""
Service layer for database operations on Stock entities.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.stock import Stock
from app.schemas.stock import StockCreate

class StockService:
    """Handles business logic and DB operations for Stocks."""
    
    def get_stock_by_ticker(self, db: Session, ticker: str) -> Optional[Stock]:
        """Fetches a single stock record from the database by its ticker."""
        return db.query(Stock).filter(Stock.ticker == ticker).first()

    def get_stocks(self, db: Session, skip: int = 0, limit: int = 100) -> List[Stock]:
        """Retrieves a list of stock records from the database."""
        return db.query(Stock).offset(skip).limit(limit).all()

    def create_stock(self, db: Session, stock_in: StockCreate) -> Stock:
        """Inserts a new stock record into the database."""
        db_stock = Stock(
            ticker=stock_in.ticker,
            name=stock_in.name,
            price=stock_in.price
        )
        db.add(db_stock)
        db.commit()
        db.refresh(db_stock)
        return db_stock

    def update_stock_price(self, db: Session, db_stock: Stock, price: float) -> Stock:
        """Updates the price of an existing stock record."""
        db_stock.price = price
        db.commit()
        db.refresh(db_stock)
        return db_stock

stock_service = StockService()
