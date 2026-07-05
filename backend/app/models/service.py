from enum import Enum

from tortoise import fields, models


class ServiceRequestStatus(str, Enum):
    PENDING = "pending"
    REJECTED = "rejected"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ServiceRequest(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="service_requests", on_delete=fields.CASCADE)
    worker = fields.ForeignKeyField(
        "models.WorkerProfile",
        related_name="service_requests",
        on_delete=fields.CASCADE,
        null=True,
    )
    description = fields.TextField()
    latitude = fields.FloatField(null=True)
    longitude = fields.FloatField(null=True)
    status = fields.CharEnumField(ServiceRequestStatus, default=ServiceRequestStatus.PENDING)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    completed_at = fields.DatetimeField(null=True)

    class Meta:
        table = "service_requests"
