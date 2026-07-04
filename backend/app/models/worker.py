from tortoise import fields, models


class WorkerProfile(models.Model):
    id = fields.IntField(pk=True)
    user = fields.OneToOneField("models.User", related_name="worker_profile", on_delete=fields.CASCADE)
    bio = fields.TextField(null=True)
    experience = fields.TextField(null=True)
    academic_history = fields.TextField(null=True)
    contact_info = fields.TextField(null=True)
    is_verified = fields.BooleanField(default=False)
    classification_level = fields.IntField(default=0)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    enrollments: fields.ReverseRelation["CourseEnrollment"]

    class Meta:
        table = "worker_profiles"
