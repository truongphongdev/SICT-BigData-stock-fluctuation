"""
Entry point for the FastAPI application.
Handles application startup, shutdown, table creation, seed data, and WebSocket broadcaster.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.seed_data import seed_database_if_empty
from app.services.prediction_service import prediction_service
from app.api.v1.endpoints.ws import market_tick_broadcaster

# Initialize logging
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Ensure all database tables are created
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed database with VN30 stocks, historical candles, news, and demo user if empty
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

    # 3. Load the ML prediction model
    prediction_service.load_model()

    # 4. Start background real-time price tick broadcaster for WebSockets
    broadcaster_task = asyncio.create_task(market_tick_broadcaster())

    yield

    # Shutdown event: cancel background task
    broadcaster_task.cancel()
    try:
        await broadcaster_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for VN30 stock analysis, technical indicators, and AI prediction",
    version="1.0.0",
    lifespan=lifespan
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include APIs
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    """Root path redirecting to documentation information."""
    return {
        "app_name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }
