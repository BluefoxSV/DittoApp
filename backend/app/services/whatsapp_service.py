import logging

import httpx

from app.config import settings
from app.services import gowa_client

logger = logging.getLogger(__name__)


async def forward_to_n8n(*, phone: str, text: str, sender: str, message_id: str | None, device_id: str) -> None:
    if not settings.n8n_webhook_url:
        return

    payload = {
        "phone": phone,
        "text": text,
        "sender": sender,
        "messageId": message_id,
        "deviceId": device_id,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(settings.n8n_webhook_url, json=payload)
        response.raise_for_status()


async def handle_incoming_message(event: dict) -> None:
    device_id = event.get("device_id", "")
    payload = event.get("payload") or {}

    if payload.get("is_from_me") or payload.get("from_me"):
        return

    text = payload.get("body") or (payload.get("message") or {}).get("text")
    if not text:
        logger.debug("Mensaje sin texto, ignorado: event=%s", event.get("event"))
        return

    phone = payload.get("from") or payload.get("chat_jid") or payload.get("chat_id") or ""
    sender = payload.get("from_name") or payload.get("pushname") or phone
    message_id = payload.get("id") or (payload.get("message") or {}).get("id")

    logger.info("[%s] %s: %s", device_id, sender, text)

    if settings.n8n_webhook_url:
        try:
            await forward_to_n8n(
                phone=phone,
                text=text,
                sender=sender,
                message_id=message_id,
                device_id=device_id,
            )
        except Exception:
            logger.exception("Error al reenviar mensaje a n8n")
        return

    if text.strip().lower() == "ping":
        await gowa_client.send_text_message(
            phone=phone,
            message="pong",
            reply_message_id=message_id,
        )
