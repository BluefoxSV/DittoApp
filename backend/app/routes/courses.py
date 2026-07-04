from fastapi import APIRouter, Query

from app.schemas.course import (
    CourseCreate,
    CourseEnrollmentCreate,
    CourseEnrollmentRead,
    CourseLessonCreate,
    CourseLessonRead,
    CourseRead,
)
from app.services import course_service

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("", response_model=CourseRead, status_code=201)
async def create_course(data: CourseCreate):
    return await course_service.create_course(data)


@router.get("", response_model=list[CourseRead])
async def list_courses(active_only: bool = Query(default=True)):
    return await course_service.list_courses(active_only=active_only)


@router.get("/{course_id}", response_model=CourseRead)
async def get_course(course_id: int):
    return await course_service.get_course(course_id)


@router.post("/{course_id}/lessons", response_model=CourseLessonRead, status_code=201)
async def add_lesson(course_id: int, data: CourseLessonCreate):
    return await course_service.add_lesson(course_id, data)


@router.get("/{course_id}/lessons", response_model=list[CourseLessonRead])
async def list_lessons(course_id: int):
    return await course_service.list_lessons(course_id)


@router.post("/workers/{worker_id}/enrollments", response_model=CourseEnrollmentRead, status_code=201)
async def enroll_worker(worker_id: int, data: CourseEnrollmentCreate):
    return await course_service.enroll_worker(worker_id, data)


@router.get("/workers/{worker_id}/enrollments", response_model=list[CourseEnrollmentRead])
async def list_enrollments(worker_id: int):
    return await course_service.list_worker_enrollments(worker_id)
