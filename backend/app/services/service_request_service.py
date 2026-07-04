from fastapi import HTTPException, status

from app.models.service import ServiceRequest
from app.schemas.service import ServiceRequestCreate, ServiceRequestUpdate
from app.services.user_service import get_user_by_id
from app.services.worker_service import get_worker_profile


async def create_service_request(user_id: int, data: ServiceRequestCreate) -> ServiceRequest:
    user = await get_user_by_id(user_id)
    worker = await get_worker_profile(data.worker_id)

    return await ServiceRequest.create(
        user=user,
        worker=worker,
        description=data.description,
    )


async def get_service_request(request_id: int) -> ServiceRequest:
    request = await ServiceRequest.get_or_none(id=request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    return request


async def list_user_requests(user_id: int) -> list[ServiceRequest]:
    await get_user_by_id(user_id)
    return await ServiceRequest.filter(user_id=user_id)


async def list_worker_requests(worker_id: int) -> list[ServiceRequest]:
    await get_worker_profile(worker_id)
    return await ServiceRequest.filter(worker_id=worker_id)


async def update_service_request(request_id: int, data: ServiceRequestUpdate) -> ServiceRequest:
    request = await get_service_request(request_id)
    request.status = data.status
    await request.save()
    return request
