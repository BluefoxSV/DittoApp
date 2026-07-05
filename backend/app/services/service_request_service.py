from datetime import UTC, datetime

from fastapi import HTTPException, status

from app.models.service import ServiceRequest, ServiceRequestStatus
from app.schemas.service import ServiceRequestCreate, ServiceRequestUpdate, ServiceRequestWithDistance
from app.services.user_service import get_user_by_id
from app.services.worker_service import get_worker_profile
from app.utils.geo import haversine_km


async def create_service_request(user_id: int, data: ServiceRequestCreate) -> ServiceRequest:
    user = await get_user_by_id(user_id)
    worker = None
    if data.worker_id is not None:
        worker = await get_worker_profile(data.worker_id)

    latitude = data.latitude
    longitude = data.longitude
    if latitude is None or longitude is None:
        profile = await user.profile.first()
        if profile and profile.latitude is not None and profile.longitude is not None:
            latitude = profile.latitude
            longitude = profile.longitude

    return await ServiceRequest.create(
        user=user,
        worker=worker,
        description=data.description,
        latitude=latitude,
        longitude=longitude,
    )


async def get_service_request(request_id: int) -> ServiceRequest:
    request = await ServiceRequest.get_or_none(id=request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    return request


async def list_user_requests(user_id: int) -> list[ServiceRequest]:
    await get_user_by_id(user_id)
    return await ServiceRequest.filter(user_id=user_id)


async def list_worker_requests(
    worker_id: int,
    *,
    latitude: float | None = None,
    longitude: float | None = None,
) -> list[ServiceRequestWithDistance]:
    await get_worker_profile(worker_id)
    requests = await ServiceRequest.filter(worker_id=worker_id)

    if latitude is None or longitude is None:
        return [ServiceRequestWithDistance.model_validate(request) for request in requests]

    with_distance: list[ServiceRequestWithDistance] = []
    without_location: list[ServiceRequestWithDistance] = []
    for request in requests:
        item = ServiceRequestWithDistance.model_validate(request)
        if request.latitude is None or request.longitude is None:
            without_location.append(item)
            continue
        distance = round(haversine_km(latitude, longitude, request.latitude, request.longitude), 2)
        with_distance.append(item.model_copy(update={"distance_km": distance}))

    with_distance.sort(
        key=lambda item: (
            item.distance_km if item.distance_km is not None else float("inf"),
            -item.created_at.timestamp(),
        )
    )
    return with_distance + without_location


async def list_nearby_open_requests(
    latitude: float,
    longitude: float,
    *,
    radius_km: float = 50.0,
) -> list[ServiceRequestWithDistance]:
    requests = await ServiceRequest.filter(
        status=ServiceRequestStatus.PENDING,
        worker_id__isnull=True,
    )
    nearby: list[ServiceRequestWithDistance] = []
    without_location: list[ServiceRequestWithDistance] = []

    for request in requests:
        item = ServiceRequestWithDistance.model_validate(request)
        if request.latitude is None or request.longitude is None:
            without_location.append(item)
            continue
        distance = haversine_km(latitude, longitude, request.latitude, request.longitude)
        if distance <= radius_km:
            nearby.append(item.model_copy(update={"distance_km": round(distance, 2)}))

    nearby.sort(key=lambda item: item.distance_km or float("inf"))
    without_location.sort(key=lambda item: -item.created_at.timestamp())
    return nearby + without_location


async def update_service_request(
    request_id: int,
    data: ServiceRequestUpdate,
    *,
    current_user_id: int,
    is_worker: bool,
    is_owner: bool,
    is_support: bool,
    claiming_worker_id: int | None = None,
) -> ServiceRequest:
    request = await get_service_request(request_id)

    if data.republish:
        if not is_owner and not is_support:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
        if request.status != ServiceRequestStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solo puedes republicar una solicitud rechazada",
            )
        request.worker_id = None
        request.status = ServiceRequestStatus.PENDING

    if data.worker_id is not None:
        if not is_owner and not is_support:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
        if request.status != ServiceRequestStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solo puedes reasignar una solicitud rechazada",
            )
        worker = await get_worker_profile(data.worker_id)
        request.worker_id = worker.id
        request.status = ServiceRequestStatus.PENDING

    if data.status is not None:
        new_status = data.status
        current_status = request.status

        if is_support:
            request.status = new_status
            if new_status == ServiceRequestStatus.COMPLETED:
                request.completed_at = datetime.now(UTC)
        elif is_worker and not is_owner:
            if new_status == ServiceRequestStatus.IN_PROGRESS and current_status == ServiceRequestStatus.PENDING:
                if request.worker_id is None:
                    if claiming_worker_id is None:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="No se pudo identificar al trabajador",
                        )
                    claimed = await ServiceRequest.filter(
                        id=request_id,
                        worker_id__isnull=True,
                        status=ServiceRequestStatus.PENDING,
                    ).update(worker_id=claiming_worker_id, status=ServiceRequestStatus.IN_PROGRESS)
                    if claimed == 0:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="La solicitud ya fue tomada por otro trabajador",
                        )
                    return await get_service_request(request_id)
                if request.worker_id != claiming_worker_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Esta solicitud está asignada a otro trabajador",
                    )
                request.status = ServiceRequestStatus.IN_PROGRESS
            elif new_status == ServiceRequestStatus.REJECTED and current_status == ServiceRequestStatus.PENDING:
                if request.worker_id is None or request.worker_id != claiming_worker_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="No puedes rechazar una solicitud que no te corresponde",
                    )
                request.status = ServiceRequestStatus.REJECTED
            elif new_status == ServiceRequestStatus.COMPLETED and current_status == ServiceRequestStatus.IN_PROGRESS:
                if request.worker_id != claiming_worker_id:
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
                request.status = ServiceRequestStatus.COMPLETED
                request.completed_at = datetime.now(UTC)
            elif new_status == ServiceRequestStatus.CANCELLED and current_status == ServiceRequestStatus.IN_PROGRESS:
                if request.worker_id != claiming_worker_id:
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
                request.status = ServiceRequestStatus.CANCELLED
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Transición de estado no permitida para el trabajador",
                )
        elif is_owner or is_support:
            if new_status == ServiceRequestStatus.CANCELLED and current_status in {
                ServiceRequestStatus.PENDING,
                ServiceRequestStatus.REJECTED,
                ServiceRequestStatus.IN_PROGRESS,
            }:
                request.status = ServiceRequestStatus.CANCELLED
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Transición de estado no permitida",
                )
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")

    await request.save()
    return request
