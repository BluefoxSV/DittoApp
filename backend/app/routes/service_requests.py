from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_user, require_roles
from app.models.user import User, UserRole
from app.schemas.service import ServiceRequestCreate, ServiceRequestRead, ServiceRequestUpdate
from app.services import service_request_service, worker_service

router = APIRouter(prefix="/service-requests", tags=["service-requests"])


@router.post("/users/{user_id}", response_model=ServiceRequestRead, status_code=201)
async def create_request(
    user_id: int,
    data: ServiceRequestCreate,
    current_user: User = Depends(get_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await service_request_service.create_service_request(user_id, data)


@router.get("/users/{user_id}", response_model=list[ServiceRequestRead])
async def list_user_requests(user_id: int, current_user: User = Depends(get_user)):
    if current_user.id != user_id and current_user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await service_request_service.list_user_requests(user_id)


@router.get("/workers/{worker_id}", response_model=list[ServiceRequestRead])
async def list_worker_requests(worker_id: int, current_user: User = Depends(get_user)):
    worker = await worker_service.get_worker_profile(worker_id)
    if worker.user_id != current_user.id and current_user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await service_request_service.list_worker_requests(worker_id)


@router.patch("/{request_id}", response_model=ServiceRequestRead)
async def update_request(
    request_id: int,
    data: ServiceRequestUpdate,
    current_user: User = Depends(get_user),
):
    request = await service_request_service.get_service_request(request_id)
    worker = await worker_service.get_worker_profile(request.worker_id)

    is_owner = request.user_id == current_user.id
    is_assigned_worker = worker.user_id == current_user.id
    is_support = current_user.role == UserRole.SUPPORT

    if not (is_owner or is_assigned_worker or is_support):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")

    return await service_request_service.update_service_request(request_id, data)
