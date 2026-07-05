from typing import Literal

from pydantic import BaseModel


class ElevenLabsSignedUrlResponse(BaseModel):
    signed_url: str


class ElevenLabsConversationConfig(BaseModel):
    mode: Literal["agent_id", "signed_url"]
    agent_id: str | None = None
    signed_url: str | None = None
    prompt_override: str | None = None
    first_message_override: str | None = None
    use_prompt_override: bool = True
    min_follow_up_questions: int = 3
