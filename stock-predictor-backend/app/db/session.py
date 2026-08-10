"""
Database session management using SQLAlchemy.
Creates the engine and SessionLocal session factory.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine with PostgreSQL connection
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True
)

# SessionLocal class will instantiate database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
