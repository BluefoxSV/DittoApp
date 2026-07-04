from enum import Enum

from tortoise import fields, models


class LessonContentType(str, Enum):
    VIDEO = "video"
    SLIDE = "slide"


class EnrollmentStatus(str, Enum):
    ENROLLED = "enrolled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Course(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    summary = fields.TextField(null=True)
    thumbnail_url = fields.CharField(max_length=500, null=True)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    lessons: fields.ReverseRelation["CourseLesson"]
    enrollments: fields.ReverseRelation["CourseEnrollment"]

    class Meta:
        table = "courses"


class CourseLesson(models.Model):
    id = fields.IntField(pk=True)
    course = fields.ForeignKeyField("models.Course", related_name="lessons", on_delete=fields.CASCADE)
    title = fields.CharField(max_length=255)
    content_type = fields.CharEnumField(LessonContentType)
    content_url = fields.CharField(max_length=500)
    order = fields.IntField(default=0)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "course_lessons"


class CourseEnrollment(models.Model):
    id = fields.IntField(pk=True)
    worker = fields.ForeignKeyField("models.WorkerProfile", related_name="enrollments", on_delete=fields.CASCADE)
    course = fields.ForeignKeyField("models.Course", related_name="enrollments", on_delete=fields.CASCADE)
    status = fields.CharEnumField(EnrollmentStatus, default=EnrollmentStatus.ENROLLED)
    progress = fields.IntField(default=0)
    enrolled_at = fields.DatetimeField(auto_now_add=True)
    completed_at = fields.DatetimeField(null=True)

    class Meta:
        table = "course_enrollments"
        unique_together = (("worker", "course"),)
