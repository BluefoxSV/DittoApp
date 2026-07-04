from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_user
from app.models.user import User, UserRole
from app.schemas.chat import ChatMessageCreate, ChatMessageRead
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/users/{sender_id}/messages", response_model=ChatMessageRead, status_code=201)
async def send_message(
    sender_id: int,
    data: ChatMessageCreate,
    current_user: User = Depends(get_user),
):
    if current_user.id != sender_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await chat_service.send_message(sender_id, data)


@router.get("/users/{user_id}/with/{other_user_id}", response_model=list[ChatMessageRead])
async def get_conversation(
    user_id: int,
    other_user_id: int,
    current_user: User = Depends(get_user),
):
    if current_user.id not in (user_id, other_user_id) and current_user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await chat_service.get_conversation(user_id, other_user_id)
