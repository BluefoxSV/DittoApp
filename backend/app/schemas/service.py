from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.service import ServiceRequestStatus


class ServiceRequestCreate(BaseModel):
    worker_id: int
    description: str


class ServiceRequestUpdate(BaseModel):
    status: ServiceRequestStatus


class ServiceRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    worker_id: int
    description: str
    status: ServiceRequestStatus
    created_at: datetime
