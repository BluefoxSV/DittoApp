import asyncio
import json

from fastapi import APIRouter, BackgroundTasks, Depends, Response

from app.dependencies.whatsapp import require_whatsapp_api_key, verify_gowa_webhook
from app.schemas.whatsapp import WhatsAppSendMessage, WhatsAppSendResponse
from app.services import gowa_client, whatsapp_service

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


@router.post("/webhook", status_code=200)
async def gowa_webhook(
    background_tasks: BackgroundTasks,
    raw_body: bytes = Depends(verify_gowa_webhook),
) -> Response:
    event = json.loads(raw_body)
    background_tasks.add_task(whatsapp_service.handle_incoming_message, event)
    return Response(status_code=200)


@router.post(
    "/messages/send",
    response_model=WhatsAppSendResponse,
    dependencies=[Depends(require_whatsapp_api_key)],
)
async def send_whatsapp_message(data: WhatsAppSendMessage) -> WhatsAppSendResponse:
    result = await gowa_client.send_text_message(
        phone=data.phone,
        message=data.message,
        reply_message_id=data.reply_message_id,
        mentions=data.mentions,
    )
    return WhatsAppSendResponse(result=result)
