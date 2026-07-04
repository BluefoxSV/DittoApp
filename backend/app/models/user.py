from enum import Enum

from tortoise import fields, models


class UserRole(str, Enum):
    USER = "user"
    WORKER = "worker"
    SUPPORT = "support"


class User(models.Model):
    id = fields.IntField(pk=True)
    email = fields.CharField(max_length=255, unique=True)
    password_hash = fields.CharField(max_length=255)
    role = fields.CharEnumField(UserRole, default=UserRole.USER)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    profile: fields.ReverseRelation["UserProfile"]
    worker_profile: fields.ReverseRelation["WorkerProfile"]

    class Meta:
        table = "users"


class UserProfile(models.Model):
    id = fields.IntField(pk=True)
    user = fields.OneToOneField("models.User", related_name="profile", on_delete=fields.CASCADE)
    full_name = fields.CharField(max_length=255)
    phone = fields.CharField(max_length=50, null=True)
    address = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "user_profiles"
