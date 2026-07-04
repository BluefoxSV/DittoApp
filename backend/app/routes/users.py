from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import get_user, require_roles
from app.models.user import User, UserRole
from app.schemas.user import UserProfileCreate, UserProfileRead, UserProfileUpdate, UserRead
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_user)):
    return current_user


@router.get("", response_model=list[UserRead])
async def list_users(
    role: UserRole | None = Query(default=None),
    _: User = Depends(require_roles(UserRole.SUPPORT)),
):
    return await user_service.list_users(role=role)


@router.get("/{user_id}", response_model=UserRead)
async def get_user_detail(user_id: int, current_user: User = Depends(get_user)):
    if current_user.id != user_id and current_user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await user_service.get_user_by_id(user_id)


@router.post("/{user_id}/profile", response_model=UserProfileRead, status_code=201)
async def create_profile(
    user_id: int,
    data: UserProfileCreate,
    current_user: User = Depends(get_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await user_service.create_user_profile(user_id, data)


@router.get("/{user_id}/profile", response_model=UserProfileRead)
async def get_profile(user_id: int, current_user: User = Depends(get_user)):
    if current_user.id != user_id and current_user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await user_service.get_user_profile(user_id)


@router.patch("/{user_id}/profile", response_model=UserProfileRead)
async def update_profile(
    user_id: int,
    data: UserProfileUpdate,
    current_user: User = Depends(get_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    return await user_service.update_user_profile(user_id, data)
