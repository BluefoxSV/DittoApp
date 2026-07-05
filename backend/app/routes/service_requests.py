from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import get_user
from app.models.service import ServiceRequest, ServiceRequestStatus
from app.models.user import User, UserRole
from app.schemas.service import (
    ServiceRequestCreate,
    ServiceRequestRead,
    ServiceRequestUpdate,
    ServiceRequestWithDistance,
)
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


@router.get("/workers/{worker_id}", response_model=list[ServiceRequestWithDistance])
async def list_worker_requests(
    worker_id: int,
    lat: float | None = Query(default=None, ge=-90, le=90),
    lng: float | None = Query(default=None, ge=-180, le=180),
    current_user: User = Depends(get_user),
):
    worker = await worker_service.get_worker_profile(worker_id)
    if worker.user_id != current_user.id and current_user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await service_request_service.list_worker_requests(worker_id, latitude=lat, longitude=lng)


@router.get("/feed", response_model=list[ServiceRequestWithDistance])
async def list_feed_requests(
    lat: float | None = Query(default=None, ge=-90, le=90),
    lng: float | None = Query(default=None, ge=-180, le=180),
    radius_km: float = Query(default=50.0, gt=0, le=500),
    current_user: User = Depends(get_user),
):
    if current_user.role not in {UserRole.WORKER, UserRole.SUPPORT}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    if lat is None or lng is None:
        return await service_request_service.list_open_requests()
    return await service_request_service.list_nearby_open_requests(lat, lng, radius_km=radius_km)


@router.get("/nearby", response_model=list[ServiceRequestWithDistance])
async def list_nearby_requests(
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
    radius_km: float = Query(default=50.0, gt=0, le=500),
    current_user: User = Depends(get_user),
):
    if current_user.role not in {UserRole.WORKER, UserRole.SUPPORT}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await service_request_service.list_nearby_open_requests(lat, lng, radius_km=radius_km)


@router.patch("/{request_id}", response_model=ServiceRequestRead)
async def update_request(
    request_id: int,
    data: ServiceRequestUpdate,
    current_user: User = Depends(get_user),
):
    request = await service_request_service.get_service_request(request_id)

    is_owner = request.user_id == current_user.id
    is_support = current_user.role == UserRole.SUPPORT
    is_assigned_worker = False
    claiming_worker_id = None

    if request.worker_id:
        worker = await worker_service.get_worker_profile(request.worker_id)
        is_assigned_worker = worker.user_id == current_user.id
        if is_assigned_worker:
            claiming_worker_id = request.worker_id
    elif current_user.role == UserRole.WORKER and request.status == ServiceRequestStatus.PENDING:
        worker_profile = await worker_service.get_worker_profile_by_user_id(current_user.id)
        claiming_worker_id = worker_profile.id

    can_claim_open = (
        claiming_worker_id is not None
        and request.worker_id is None
        and request.status == ServiceRequestStatus.PENDING
    )

    if not (is_owner or is_assigned_worker or can_claim_open or is_support):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")

    return await service_request_service.update_service_request(
        request_id,
        data,
        current_user_id=current_user.id,
        is_worker=is_assigned_worker or can_claim_open,
        is_owner=is_owner,
        is_support=is_support,
        claiming_worker_id=claiming_worker_id,
    )
