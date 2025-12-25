from fastapi import APIRouter
from typing import List
from app.schemas.support import SystemService, ChatMessage, ChatResponse, TicketCreate
from app.services.support_engine import support_engine

router = APIRouter()

@router.get("/status", response_model=List[SystemService])
def get_system_status():
    return support_engine.get_system_status()

@router.post("/chat", response_model=ChatResponse)
def chat_with_bot(message: ChatMessage):
    response = support_engine.get_chatbot_response(message.text)
    return {"reply": response}

@router.post("/tickets")
def create_ticket(ticket: TicketCreate):
    return {"status": "success", "ticket_id": f"INC-{random.randint(1000,9999)}"}