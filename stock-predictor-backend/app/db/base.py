"""
Database base model configuration.
All SQLAlchemy models inherit from this Base class.
"""
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """Declarative base class for SQLAlchemy models."""
    pass

# Import all models here so that Base.metadata has all entities registered
from app.models.user import User  # noqa
from app.models.stock import Stock  # noqa
from app.models.stock_history import StockHistory  # noqa
from app.models.portfolio import PortfolioItem  # noqa
from app.models.news import NewsArticle  # noqa
from app.models.prediction import AIPrediction  # noqa
