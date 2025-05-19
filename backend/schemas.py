# backend/schemas.py
from pydantic import BaseModel
from typing import Optional
import time

class TrainingMetric(BaseModel):
    epoch: int
    loss: float
    accuracy: float
    timestamp: float = time.time()
    note: Optional[str] = None
