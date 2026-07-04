from fastapi import APIRouter

from app.schemas.chat import ChatMessageCreate, ChatMessageRead
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/users/{sender_id}/messages", response_model=ChatMessageRead, status_code=201)
async def send_message(sender_id: int, data: ChatMessageCreate):
    return await chat_service.send_message(sender_id, data)


@router.get("/users/{user_id}/with/{other_user_id}", response_model=list[ChatMessageRead])
async def get_conversation(user_id: int, other_user_id: int):
    return await chat_service.get_conversation(user_id, other_user_id)
