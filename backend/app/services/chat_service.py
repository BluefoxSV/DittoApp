from fastapi import HTTPException, status
from tortoise.expressions import Q

from app.models.chat import ChatMessage
from app.models.service import ServiceRequest, ServiceRequestStatus
from app.models.user import UserRole
from app.models.worker import WorkerProfile
from app.schemas.chat import ChatMessageCreate
from app.services.service_request_service import get_service_request
from app.services.user_service import get_user_by_id
from app.services.worker_service import get_worker_profile


async def _is_assigned_worker(request: ServiceRequest, user_id: int) -> bool:
    if not request.worker_id:
        return False
    worker = await get_worker_profile(request.worker_id)
    return worker.user_id == user_id


async def _is_feed_worker(user_id: int) -> bool:
    user = await get_user_by_id(user_id)
    return user.role == UserRole.WORKER and await WorkerProfile.filter(user_id=user_id).exists()


async def _ensure_request_participant(request: ServiceRequest, user_id: int) -> None:
    is_owner = request.user_id == user_id
    is_assigned = await _is_assigned_worker(request, user_id)
    is_open_feed_worker = (
        not request.worker_id
        and request.status == ServiceRequestStatus.PENDING
        and await _is_feed_worker(user_id)
    )
    if not (is_owner or is_assigned or is_open_feed_worker):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")


async def _resolve_receiver_id(request: ServiceRequest, sender_id: int) -> int:
    if request.user_id == sender_id:
        if not request.worker_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aún no hay trabajador asignado para chatear",
            )
        worker = await get_worker_profile(request.worker_id)
        return worker.user_id
    if await _is_assigned_worker(request, sender_id):
        return request.user_id
    if (
        not request.worker_id
        and request.status == ServiceRequestStatus.PENDING
        and await _is_feed_worker(sender_id)
    ):
        return request.user_id
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")


async def send_message(sender_id: int, data: ChatMessageCreate) -> ChatMessage:
    sender = await get_user_by_id(sender_id)
    receiver = await get_user_by_id(data.receiver_id)

    service_request = None
    if data.service_request_id is not None:
        service_request = await get_service_request(data.service_request_id)
        await _ensure_request_participant(service_request, sender_id)
        expected_receiver = await _resolve_receiver_id(service_request, sender_id)
        if expected_receiver != data.receiver_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El destinatario no corresponde a esta solicitud",
            )

    return await ChatMessage.create(
        sender=sender,
        receiver=receiver,
        service_request=service_request,
        content=data.content,
    )


async def send_request_message(request_id: int, sender_id: int, content: str) -> ChatMessage:
    request = await get_service_request(request_id)
    await _ensure_request_participant(request, sender_id)
    receiver_id = await _resolve_receiver_id(request, sender_id)
    sender = await get_user_by_id(sender_id)
    receiver = await get_user_by_id(receiver_id)

    return await ChatMessage.create(
        sender=sender,
        receiver=receiver,
        service_request=request,
        content=content,
    )


async def get_conversation(user_id: int, other_user_id: int) -> list[ChatMessage]:
    await get_user_by_id(user_id)
    await get_user_by_id(other_user_id)

    return await ChatMessage.filter(
        Q(sender_id=user_id, receiver_id=other_user_id)
        | Q(sender_id=other_user_id, receiver_id=user_id),
        service_request_id__isnull=True,
    ).order_by("created_at")


async def get_request_conversation(request_id: int, user_id: int) -> list[ChatMessage]:
    request = await get_service_request(request_id)
    await _ensure_request_participant(request, user_id)
    return await ChatMessage.filter(service_request_id=request_id).order_by("created_at")
