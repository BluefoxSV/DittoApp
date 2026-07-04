from fastapi import HTTPException, status

from app.models.user import UserRole
from app.models.worker import WorkerProfile
from app.schemas.worker import WorkerProfileCreate, WorkerProfileUpdate
from app.services.user_service import get_user


async def create_worker_profile(user_id: int, data: WorkerProfileCreate) -> WorkerProfile:
    user = await get_user(user_id)
    if user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo usuarios con rol trabajador pueden crear perfil de trabajador",
        )
    if await WorkerProfile.filter(user_id=user.id).exists():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El trabajador ya tiene perfil",
        )

    return await WorkerProfile.create(user=user, **data.model_dump())


async def get_worker_profile(worker_id: int) -> WorkerProfile:
    profile = await WorkerProfile.get_or_none(id=worker_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trabajador no encontrado")
    return profile


async def list_worker_profiles(verified_only: bool = False) -> list[WorkerProfile]:
    query = WorkerProfile.all()
    if verified_only:
        query = query.filter(is_verified=True)
    return await query


async def update_worker_profile(worker_id: int, data: WorkerProfileUpdate) -> WorkerProfile:
    profile = await get_worker_profile(worker_id)
    await profile.update_from_dict(data.model_dump(exclude_unset=True))
    await profile.save()
    return profile
