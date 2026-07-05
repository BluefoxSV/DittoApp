from fastapi import HTTPException, status

from app.models.user import UserRole
from app.models.worker import WorkerProfile
from app.schemas.worker import WorkerProfileCreate, WorkerProfileUpdate, WorkerProfileWithDistance
from app.services.user_service import get_user_by_id
from app.utils.geo import haversine_km


def _worker_full_name(worker: WorkerProfile) -> str | None:
    user = getattr(worker, "user", None)
    if user is None:
        return None
    profile = getattr(user, "profile", None)
    return profile.full_name if profile else None


def _serialize_worker(
    worker: WorkerProfile,
    *,
    distance_km: float | None = None,
) -> WorkerProfileWithDistance:
    return WorkerProfileWithDistance.model_validate(worker).model_copy(
        update={
            "full_name": _worker_full_name(worker),
            "distance_km": distance_km,
        }
    )


async def create_worker_profile(user_id: int, data: WorkerProfileCreate) -> WorkerProfile:
    user = await get_user_by_id(user_id)
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


async def get_worker_profile_by_user_id(user_id: int) -> WorkerProfile:
    profile = await WorkerProfile.get_or_none(user_id=user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de trabajador no encontrado",
        )
    return profile


async def list_worker_profiles(
    verified_only: bool = False,
    *,
    latitude: float | None = None,
    longitude: float | None = None,
    radius_km: float = 100.0,
) -> list[WorkerProfileWithDistance]:
    query = WorkerProfile.all()
    if verified_only:
        query = query.filter(is_verified=True)
    workers = await query.prefetch_related("user__profile")

    if latitude is None or longitude is None:
        return [_serialize_worker(worker) for worker in workers]

    with_distance: list[WorkerProfileWithDistance] = []
    without_location: list[WorkerProfileWithDistance] = []
    for worker in workers:
        if worker.latitude is None or worker.longitude is None:
            without_location.append(_serialize_worker(worker))
            continue
        distance = haversine_km(latitude, longitude, worker.latitude, worker.longitude)
        if distance <= radius_km:
            with_distance.append(_serialize_worker(worker, distance_km=round(distance, 2)))

    with_distance.sort(key=lambda item: item.distance_km or float("inf"))
    return with_distance + without_location


async def update_worker_profile(worker_id: int, data: WorkerProfileUpdate) -> WorkerProfile:
    profile = await get_worker_profile(worker_id)
    await profile.update_from_dict(data.model_dump(exclude_unset=True))
    await profile.save()
    return profile


async def update_worker_location(worker_id: int, latitude: float, longitude: float) -> WorkerProfile:
    profile = await get_worker_profile(worker_id)
    profile.latitude = latitude
    profile.longitude = longitude
    await profile.save()
    return profile
