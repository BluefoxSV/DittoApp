from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.service import ServiceRequestStatus


class ServiceRequestCreate(BaseModel):
    description: str
    worker_id: int | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class ServiceRequestUpdate(BaseModel):
    status: ServiceRequestStatus | None = None
    worker_id: int | None = None
    republish: bool = False


class ServiceRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    worker_id: int | None = None
    description: str
    latitude: float | None = None
    longitude: float | None = None
    status: ServiceRequestStatus
    created_at: datetime


class ServiceRequestWithDistance(ServiceRequestRead):
    distance_km: float | None = None
