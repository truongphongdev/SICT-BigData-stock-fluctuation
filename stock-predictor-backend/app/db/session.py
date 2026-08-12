"""
Database session management using SQLAlchemy.
Creates the engine and SessionLocal session factory with PostgreSQL/SQLite support.
"""
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

db_url = settings.sync_database_url

# Configure engine kwargs according to DB dialect
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        db_url,
        pool_pre_ping=True if not db_url.startswith("sqlite") else False,
        connect_args=connect_args
    )
except Exception as e:
    logger.warning(f"Failed to connect using {db_url}. Falling back to SQLite local database. Error: {e}")
    engine = create_engine(
        "sqlite:///./stock_predictor.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
