"""
Database base model configuration.
All SQLAlchemy models will inherit from this Base class.
"""
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """Declarative base class for SQLAlchemy models."""
    pass
