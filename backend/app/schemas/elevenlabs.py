from typing import Literal

from pydantic import BaseModel


class ElevenLabsSignedUrlResponse(BaseModel):
    signed_url: str


class ElevenLabsConversationConfig(BaseModel):
    mode: Literal["agent_id", "signed_url"]
    agent_id: str | None = None
    signed_url: str | None = None
