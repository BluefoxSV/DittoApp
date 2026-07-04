from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import get_user, require_roles
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.schemas.course import (
    CourseCreate,
    CourseEnrollmentCreate,
    CourseEnrollmentRead,
    CourseLessonCreate,
    CourseLessonRead,
    CourseRead,
)
from app.services import course_service, worker_service

router = APIRouter(prefix="/courses", tags=["courses"])


async def _get_owned_worker(worker_id: int, current_user: User) -> WorkerProfile:
    worker = await worker_service.get_worker_profile(worker_id)
    if worker.user_id != current_user.id and current_user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return worker


@router.post("", response_model=CourseRead, status_code=201)
async def create_course(
    data: CourseCreate,
    _: User = Depends(require_roles(UserRole.SUPPORT)),
):
    return await course_service.create_course(data)


@router.get("", response_model=list[CourseRead])
async def list_courses(active_only: bool = Query(default=True)):
    return await course_service.list_courses(active_only=active_only)


@router.get("/{course_id}", response_model=CourseRead)
async def get_course(course_id: int):
    return await course_service.get_course(course_id)


@router.post("/{course_id}/lessons", response_model=CourseLessonRead, status_code=201)
async def add_lesson(
    course_id: int,
    data: CourseLessonCreate,
    _: User = Depends(require_roles(UserRole.SUPPORT)),
):
    return await course_service.add_lesson(course_id, data)


@router.get("/{course_id}/lessons", response_model=list[CourseLessonRead])
async def list_lessons(course_id: int):
    return await course_service.list_lessons(course_id)


@router.post("/workers/{worker_id}/enrollments", response_model=CourseEnrollmentRead, status_code=201)
async def enroll_worker(
    worker_id: int,
    data: CourseEnrollmentCreate,
    current_user: User = Depends(get_user),
):
    await _get_owned_worker(worker_id, current_user)
    return await course_service.enroll_worker(worker_id, data)


@router.get("/workers/{worker_id}/enrollments", response_model=list[CourseEnrollmentRead])
async def list_enrollments(worker_id: int, current_user: User = Depends(get_user)):
    await _get_owned_worker(worker_id, current_user)
    return await course_service.list_worker_enrollments(worker_id)
