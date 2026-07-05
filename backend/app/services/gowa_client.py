import httpx
from fastapi import HTTPException, status

from app.config import settings


def _normalize_phone(phone: str) -> str:
    if "@" in phone:
        return phone
    return f"{phone}@s.whatsapp.net"


def _build_headers() -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if settings.gowa_device_id:
        headers["X-Device-Id"] = settings.gowa_device_id
    return headers


async def send_text_message(
    *,
    phone: str,
    message: str,
    reply_message_id: str | None = None,
    mentions: list[str] | None = None,
) -> dict:
    body: dict = {
        "phone": _normalize_phone(phone),
        "message": message,
    }
    if reply_message_id:
        body["reply_message_id"] = reply_message_id
    if mentions:
        body["mentions"] = mentions

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{settings.gowa_base_url}/send/message",
            headers=_build_headers(),
            json=body,
        )

    data = response.json() if response.content else {}

    if not response.is_success:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=data.get("message", f"GoWA respondió con {response.status_code}"),
        )

    return data
