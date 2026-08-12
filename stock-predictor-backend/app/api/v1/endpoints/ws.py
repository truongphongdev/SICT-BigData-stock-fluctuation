"""
WebSocket endpoint for real-time live stock exchange price streaming.
"""
import asyncio
import json
import logging
import random
from typing import List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.db.session import SessionLocal
from app.models.stock import Stock

logger = logging.getLogger(__name__)
router = APIRouter()

class ConnectionManager:
    """Manages active WebSocket connections and broadcasts price ticks."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            self.active_connections.discard(dead)

manager = ConnectionManager()

@router.websocket("/market")
async def websocket_market_endpoint(websocket: WebSocket):
    """WebSocket connection handler for live market tick feeds."""
    await manager.connect(websocket)
    try:
        while True:
            # Receive client ping or filter commands
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("action") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def market_tick_broadcaster():
    """Background task that periodically simulates live price fluctuations and broadcasts to clients."""
    while True:
        await asyncio.sleep(3.2)
        if not manager.active_connections:
            continue

        db = SessionLocal()
        try:
            stocks = db.query(Stock).all()
            if not stocks:
                continue

            num_changes = random.randint(1, min(3, len(stocks)))
            chosen_stocks = random.sample(stocks, num_changes)
            ticks = []

            for s in chosen_stocks:
                step = random.choice([0.05, 0.1, 0.15])
                is_up = random.random() >= 0.45
                price_delta = step if is_up else -step
                
                new_price = round(max(0.5, s.price + price_delta), 2)
                new_change = round(s.change + price_delta, 2)
                base_p = round(s.price - s.change, 2)
                new_change_pct = round((new_change / base_p) * 100, 2) if base_p > 0 else 0.0

                s.price = new_price
                s.change = new_change
                s.change_percent = new_change_pct

                ticks.append({
                    "symbol": s.symbol,
                    "price": new_price,
                    "change": new_change,
                    "changePercent": new_change_pct,
                    "flash": "up" if is_up else "down"
                })

            db.commit()

            # Broadcast update payload
            await manager.broadcast({
                "type": "TICK_UPDATE",
                "ticks": ticks
            })
        except Exception as e:
            logger.error(f"Error in market tick broadcaster: {e}")
        finally:
            db.close()
