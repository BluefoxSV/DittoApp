import hashlib
import hmac

from fastapi import Header, HTTPException, Request, status

from app.config import settings


def _verify_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    if not signature:
        return False

    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    received = signature.removeprefix("sha256=")

    try:
        return hmac.compare_digest(expected, received)
    except ValueError:
        return expected == received


async def verify_gowa_webhook(request: Request) -> bytes:
    raw_body = await request.body()
    signature = (
        request.headers.get("x-webhook-signature")
        or request.headers.get("x-hub-signature-256")
        or ""
    )

    if not _verify_signature(raw_body, signature, settings.gowa_webhook_secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firma de webhook inválida",
        )

    return raw_body


async def require_whatsapp_api_key(
    x_api_key: str | None = Header(None, alias="X-Api-Key"),
) -> None:
    if settings.whatsapp_api_key and x_api_key != settings.whatsapp_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key inválida",
        )
