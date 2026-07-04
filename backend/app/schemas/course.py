from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.course import EnrollmentStatus, LessonContentType


class CourseCreate(BaseModel):
    title: str
    description: str | None = None
    summary: str | None = None
    thumbnail_url: str | None = None


class CourseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    summary: str | None
    thumbnail_url: str | None
    is_active: bool
    created_at: datetime


class CourseLessonCreate(BaseModel):
    title: str
    content_type: LessonContentType
    content_url: str
    order: int = 0


class CourseLessonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    title: str
    content_type: LessonContentType
    content_url: str
    order: int


class CourseEnrollmentCreate(BaseModel):
    course_id: int


class CourseEnrollmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    worker_id: int
    course_id: int
    status: EnrollmentStatus
    progress: int
    enrolled_at: datetime
