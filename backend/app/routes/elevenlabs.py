from fastapi import APIRouter, Depends

from app.dependencies.auth import get_user
from app.models.user import User
from app.schemas.elevenlabs import ElevenLabsSignedUrlResponse
from app.services import elevenlabs_service

router = APIRouter(prefix="/elevenlabs", tags=["elevenlabs"])


@router.get("/signed-url", response_model=ElevenLabsSignedUrlResponse)
async def get_signed_url(_current_user: User = Depends(get_user)) -> ElevenLabsSignedUrlResponse:
    signed_url = await elevenlabs_service.get_signed_url()
    return ElevenLabsSignedUrlResponse(signed_url=signed_url)
