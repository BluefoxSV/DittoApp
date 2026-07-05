from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ChatMessageCreate(BaseModel):
    receiver_id: int
    content: str
    service_request_id: int | None = None


class ServiceRequestChatMessageCreate(BaseModel):
    content: str


class ChatMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    receiver_id: int
    service_request_id: int | None = None
    content: str
    is_read: bool
    created_at: datetime
