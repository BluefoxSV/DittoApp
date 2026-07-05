from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WorkerProfileCreate(BaseModel):
    bio: str | None = None
    experience: str | None = None
    academic_history: str | None = None
    contact_info: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class WorkerProfileUpdate(BaseModel):
    bio: str | None = None
    experience: str | None = None
    academic_history: str | None = None
    contact_info: str | None = None
    classification_level: int | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class WorkerProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    bio: str | None
    experience: str | None
    academic_history: str | None
    contact_info: str | None
    is_verified: bool
    classification_level: int
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime


class WorkerProfileWithDistance(WorkerProfileRead):
    distance_km: float | None = None
