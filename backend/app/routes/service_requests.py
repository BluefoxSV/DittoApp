from fastapi import APIRouter

from app.schemas.service import ServiceRequestCreate, ServiceRequestRead, ServiceRequestUpdate
from app.services import service_request_service

router = APIRouter(prefix="/service-requests", tags=["service-requests"])


@router.post("/users/{user_id}", response_model=ServiceRequestRead, status_code=201)
async def create_request(user_id: int, data: ServiceRequestCreate):
    return await service_request_service.create_service_request(user_id, data)


@router.get("/users/{user_id}", response_model=list[ServiceRequestRead])
async def list_user_requests(user_id: int):
    return await service_request_service.list_user_requests(user_id)


@router.get("/workers/{worker_id}", response_model=list[ServiceRequestRead])
async def list_worker_requests(worker_id: int):
    return await service_request_service.list_worker_requests(worker_id)


@router.patch("/{request_id}", response_model=ServiceRequestRead)
async def update_request(request_id: int, data: ServiceRequestUpdate):
    return await service_request_service.update_service_request(request_id, data)
