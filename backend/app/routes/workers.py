from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import get_user
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.schemas.worker import WorkerProfileCreate, WorkerProfileRead, WorkerProfileUpdate
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


@router.get("", response_model=list[WorkerProfileRead])
async def list_workers(verified_only: bool = Query(default=False)):
    return await worker_service.list_worker_profiles(verified_only=verified_only)


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
