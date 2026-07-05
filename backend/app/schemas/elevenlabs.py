from pydantic import BaseModel


class ElevenLabsSignedUrlResponse(BaseModel):
    signed_url: str
