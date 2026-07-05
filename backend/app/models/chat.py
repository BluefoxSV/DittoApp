from tortoise import fields, models


class ChatMessage(models.Model):
    id = fields.IntField(pk=True)
    sender = fields.ForeignKeyField("models.User", related_name="sent_messages", on_delete=fields.CASCADE)
    receiver = fields.ForeignKeyField("models.User", related_name="received_messages", on_delete=fields.CASCADE)
    service_request = fields.ForeignKeyField(
        "models.ServiceRequest",
        related_name="chat_messages",
        on_delete=fields.CASCADE,
        null=True,
    )
    content = fields.TextField()
    is_read = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "chat_messages"
