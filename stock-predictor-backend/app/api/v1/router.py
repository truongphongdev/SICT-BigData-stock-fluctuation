"""
Aggregates all API endpoint routers into a single root router for v1 version.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    stocks,
    market,
    predict,
    portfolio,
    news,
    ws,
    ml
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(stocks.router, prefix="/stocks", tags=["stocks"])
api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(predict.router, prefix="/predict", tags=["prediction"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(ws.router, prefix="/ws", tags=["websocket"])
api_router.include_router(ml.router, prefix="/ml", tags=["machine learning"])

