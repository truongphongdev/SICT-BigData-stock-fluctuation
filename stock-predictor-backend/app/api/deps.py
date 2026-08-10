"""
API dependencies including the database session generator.
"""
from typing import Generator
from app.db.session import SessionLocal

def get_db() -> Generator:
    """Generates database sessions for requests."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
