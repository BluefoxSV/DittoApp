import httpx
from fastapi import HTTPException, status

from app.config import settings

ELEVENLABS_SIGNED_URL = (
    "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"
)


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
        detail = "No se pudo obtener la URL firmada de ElevenLabs."
        try:
            body = response.json()
            if isinstance(body.get("detail"), str):
                detail = body["detail"]
            elif isinstance(body.get("detail"), dict) and body["detail"].get("message"):
                detail = body["detail"]["message"]
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail,
        )

    signed_url = response.json().get("signed_url")
    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Respuesta inválida de ElevenLabs.",
        )

    return signed_url
