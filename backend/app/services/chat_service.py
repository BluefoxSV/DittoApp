from tortoise.expressions import Q

from app.models.chat import ChatMessage
from app.schemas.chat import ChatMessageCreate
from app.services.user_service import get_user_by_id


async def send_message(sender_id: int, data: ChatMessageCreate) -> ChatMessage:
    sender = await get_user_by_id(sender_id)
    receiver = await get_user_by_id(data.receiver_id)

    return await ChatMessage.create(
        sender=sender,
        receiver=receiver,
        content=data.content,
    )


async def get_conversation(user_id: int, other_user_id: int) -> list[ChatMessage]:
    await get_user_by_id(user_id)
    await get_user_by_id(other_user_id)

    return await ChatMessage.filter(
        Q(sender_id=user_id, receiver_id=other_user_id)
        | Q(sender_id=other_user_id, receiver_id=user_id)
    ).order_by("created_at")
