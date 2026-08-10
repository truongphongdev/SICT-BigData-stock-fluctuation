"""
Entry point for the FastAPI application.
Handles application startup, shutdown, routing, and middleware config.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.services.prediction_service import prediction_service

# Initialize logging
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: Load the ML model
    prediction_service.load_model()
    yield
    # Shutdown event
    pass

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for predicting stock prices using ML models",
    version="1.0.0",
    lifespan=lifespan
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "message": f"Welcome to the {settings.APP_NAME}",
        "docs_url": "/docs"
    }
