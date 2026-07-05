from pydantic import BaseModel, Field


class WhatsAppSendMessage(BaseModel):
    phone: str
    message: str
    reply_message_id: str | None = Field(None, alias="replyMessageId")
    mentions: list[str] | None = None

    model_config = {"populate_by_name": True}


class WhatsAppSendResponse(BaseModel):
    ok: bool = True
    result: dict
