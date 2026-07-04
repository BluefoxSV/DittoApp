from fastapi import APIRouter, Query

from app.schemas.worker import WorkerProfileCreate, WorkerProfileRead, WorkerProfileUpdate
from app.services import worker_service

router = APIRouter(prefix="/workers", tags=["workers"])


@router.post("/{user_id}/profile", response_model=WorkerProfileRead, status_code=201)
async def create_worker_profile(user_id: int, data: WorkerProfileCreate):
    return await worker_service.create_worker_profile(user_id, data)


@router.get("", response_model=list[WorkerProfileRead])
async def list_workers(verified_only: bool = Query(default=False)):
    return await worker_service.list_worker_profiles(verified_only=verified_only)


@router.get("/{worker_id}", response_model=WorkerProfileRead)
async def get_worker(worker_id: int):
    return await worker_service.get_worker_profile(worker_id)


@router.patch("/{worker_id}", response_model=WorkerProfileRead)
async def update_worker(worker_id: int, data: WorkerProfileUpdate):
    return await worker_service.update_worker_profile(worker_id, data)
