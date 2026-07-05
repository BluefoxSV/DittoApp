import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.schemas.elevenlabs import ElevenLabsConversationConfig
from app.services.elevenlabs_intake_prompt import (
    DITTOAPP_FIRST_MESSAGE,
    DITTOAPP_INTAKE_PROMPT,
)

ELEVENLABS_SIGNED_URL = (
    "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"
)


def _extract_error_detail(response: httpx.Response, fallback: str) -> str:
    try:
        body = response.json()
        detail = body.get("detail")
        if isinstance(detail, str):
            return detail
        if isinstance(detail, dict) and detail.get("message"):
            return detail["message"]
    except Exception:
        pass
    return fallback


async def get_signed_url() -> str:
    if not settings.elevenlabs_api_key or not settings.elevenlabs_agent_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ElevenLabs no está configurado en el servidor.",
        )

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            ELEVENLABS_SIGNED_URL,
            params={"agent_id": settings.elevenlabs_agent_id},
            headers={"xi-api-key": settings.elevenlabs_api_key},
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=_extract_error_detail(
                response,
                "No se pudo obtener la URL firmada de ElevenLabs.",
            ),
        )

    signed_url = response.json().get("signed_url")
    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Respuesta inválida de ElevenLabs.",
        )

    return signed_url


async def get_conversation_config() -> ElevenLabsConversationConfig:
    if not settings.elevenlabs_agent_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ELEVENLABS_AGENT_ID no está configurado en el servidor.",
        )

    prompt_override = settings.elevenlabs_intake_prompt or DITTOAPP_INTAKE_PROMPT
    first_message_override = settings.elevenlabs_first_message or DITTOAPP_FIRST_MESSAGE
    shared = {
        "prompt_override": prompt_override,
        "first_message_override": first_message_override,
        "min_follow_up_questions": settings.elevenlabs_min_follow_up_questions,
    }

    if settings.elevenlabs_use_signed_url:
        signed_url = await get_signed_url()
        return ElevenLabsConversationConfig(
            mode="signed_url",
            signed_url=signed_url,
            **shared,
        )

    return ElevenLabsConversationConfig(
        mode="agent_id",
        agent_id=settings.elevenlabs_agent_id,
        **shared,
    )
