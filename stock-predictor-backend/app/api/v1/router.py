"""
Aggregates all API endpoint routers into a single root router for v1 version.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import predict, stocks, health

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(stocks.router, prefix="/stocks", tags=["stocks"])
api_router.include_router(predict.router, prefix="/predict", tags=["prediction"])
