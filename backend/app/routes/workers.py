from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import get_user
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.schemas.worker import WorkerProfileCreate, WorkerProfileRead, WorkerProfileUpdate, WorkerProfileWithDistance
from app.schemas.user import LocationUpdate
from app.services import worker_service

router = APIRouter(prefix="/workers", tags=["workers"])


async def _get_owned_worker(worker_id: int, current_user: User) -> WorkerProfile:
    worker = await worker_service.get_worker_profile(worker_id)
    if worker.user_id != current_user.id and current_user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return worker


@router.post("/{user_id}/profile", response_model=WorkerProfileRead, status_code=201)
async def create_worker_profile(
    user_id: int,
    data: WorkerProfileCreate,
    current_user: User = Depends(get_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await worker_service.create_worker_profile(user_id, data)


@router.get("/user/{user_id}/profile", response_model=WorkerProfileRead)
async def get_worker_profile_by_user(user_id: int, current_user: User = Depends(get_user)):
    if current_user.id != user_id and current_user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await worker_service.get_worker_profile_by_user_id(user_id)


@router.get("", response_model=list[WorkerProfileWithDistance])
async def list_workers(
    verified_only: bool = Query(default=False),
    lat: float | None = Query(default=None, ge=-90, le=90),
    lng: float | None = Query(default=None, ge=-180, le=180),
    radius_km: float = Query(default=100.0, gt=0, le=500),
):
    return await worker_service.list_worker_profiles(
        verified_only=verified_only,
        latitude=lat,
        longitude=lng,
        radius_km=radius_km,
    )


@router.get("/{worker_id}", response_model=WorkerProfileRead)
async def get_worker(worker_id: int):
    return await worker_service.get_worker_profile(worker_id)


@router.patch("/{worker_id}", response_model=WorkerProfileRead)
async def update_worker(
    worker_id: int,
    data: WorkerProfileUpdate,
    current_user: User = Depends(get_user),
):
    await _get_owned_worker(worker_id, current_user)
    return await worker_service.update_worker_profile(worker_id, data)


@router.patch("/{worker_id}/location", response_model=WorkerProfileRead)
async def update_worker_location(
    worker_id: int,
    data: LocationUpdate,
    current_user: User = Depends(get_user),
):
    await _get_owned_worker(worker_id, current_user)
    return await worker_service.update_worker_location(worker_id, data.latitude, data.longitude)
