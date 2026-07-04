from fastapi import APIRouter, Query

from app.models.user import UserRole
from app.schemas.user import UserCreate, UserProfileCreate, UserProfileRead, UserProfileUpdate, UserRead
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=201)
async def register_user(data: UserCreate):
    return await user_service.create_user(data)


@router.get("", response_model=list[UserRead])
async def list_users(role: UserRole | None = Query(default=None)):
    return await user_service.list_users(role=role)


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int):
    return await user_service.get_user(user_id)


@router.post("/{user_id}/profile", response_model=UserProfileRead, status_code=201)
async def create_profile(user_id: int, data: UserProfileCreate):
    return await user_service.create_user_profile(user_id, data)


@router.get("/{user_id}/profile", response_model=UserProfileRead)
async def get_profile(user_id: int):
    return await user_service.get_user_profile(user_id)


@router.patch("/{user_id}/profile", response_model=UserProfileRead)
async def update_profile(user_id: int, data: UserProfileUpdate):
    return await user_service.update_user_profile(user_id, data)
