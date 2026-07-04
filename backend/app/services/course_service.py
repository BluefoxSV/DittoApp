from fastapi import HTTPException, status

from app.models.course import Course, CourseEnrollment, CourseLesson
from app.schemas.course import CourseCreate, CourseEnrollmentCreate, CourseLessonCreate
from app.services.worker_service import get_worker_profile


async def create_course(data: CourseCreate) -> Course:
    return await Course.create(**data.model_dump())


async def list_courses(active_only: bool = True) -> list[Course]:
    query = Course.all()
    if active_only:
        query = query.filter(is_active=True)
    return await query


async def get_course(course_id: int) -> Course:
    course = await Course.get_or_none(id=course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curso no encontrado")
    return course


async def add_lesson(course_id: int, data: CourseLessonCreate) -> CourseLesson:
    course = await get_course(course_id)
    return await CourseLesson.create(course=course, **data.model_dump())


async def list_lessons(course_id: int) -> list[CourseLesson]:
    await get_course(course_id)
    return await CourseLesson.filter(course_id=course_id).order_by("order")


async def enroll_worker(worker_id: int, data: CourseEnrollmentCreate) -> CourseEnrollment:
    worker = await get_worker_profile(worker_id)
    course = await get_course(data.course_id)

    exists = await CourseEnrollment.filter(worker_id=worker.id, course_id=course.id).exists()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El trabajador ya está inscrito en este curso",
        )

    return await CourseEnrollment.create(worker=worker, course=course)


async def list_worker_enrollments(worker_id: int) -> list[CourseEnrollment]:
    await get_worker_profile(worker_id)
    return await CourseEnrollment.filter(worker_id=worker_id).prefetch_related("course")
