from pydantic import BaseModel
from typing import List, Optional

class LatencyPoint(BaseModel):
    time: str
    latency: int

class SystemService(BaseModel):
    id: str
    name: str
    status: str # operational, degraded, outage
    uptime: str
    latency: int
    description: str
    dependencies: List[str]
    history: List[LatencyPoint]

class ChatMessage(BaseModel):
    text: str

class ChatResponse(BaseModel):
    reply: str

class TicketCreate(BaseModel):
    subject: str
    priority: str
    asset: str
    description: str