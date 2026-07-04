from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WorkerProfileCreate(BaseModel):
    bio: str | None = None
    experience: str | None = None
    academic_history: str | None = None
    contact_info: str | None = None


class WorkerProfileUpdate(BaseModel):
    bio: str | None = None
    experience: str | None = None
    academic_history: str | None = None
    contact_info: str | None = None
    classification_level: int | None = None


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
    created_at: datetime
