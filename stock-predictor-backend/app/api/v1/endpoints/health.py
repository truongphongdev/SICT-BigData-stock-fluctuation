"""
Endpoint for checking the status and health of the backend API.
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def health_check():
    """Simple health check endpoint returning API status."""
    return {
        "status": "healthy",
        "service": "Stock Predictor Backend API"
    }
