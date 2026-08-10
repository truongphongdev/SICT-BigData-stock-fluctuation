"""
Pydantic schemas for Stock objects.
"""
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class StockBase(BaseModel):
    ticker: str
    name: str
    price: float

class StockCreate(StockBase):
    pass

class StockUpdate(StockBase):
    price: float

class StockInDBBase(StockBase):
    id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Stock(StockInDBBase):
    pass
