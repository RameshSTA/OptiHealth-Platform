from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.db.base import Base
from datetime import datetime

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, index=True) # INC-1001
    subject = Column(String)
    status = Column(String, default="Open") # Open, In Progress, Resolved
    priority = Column(String, default="Medium")
    requester_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    description = Column(String)