from fastapi import HTTPException, status

from app.models.user import User, UserProfile, UserRole
from app.schemas.auth import UserRegister
from app.schemas.user import UserProfileCreate, UserProfileUpdate
from app.services.auth_service import hash_password


async def create_user(data: UserRegister) -> User:
    exists = await User.filter(email=data.email).exists()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo ya está registrado",
        )

    return await User.create(
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )


async def get_user_by_id(user_id: int) -> User:
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user


async def list_users(role: UserRole | None = None) -> list[User]:
    query = User.all()
    if role:
        query = query.filter(role=role)
    return await query


async def create_user_profile(user_id: int, data: UserProfileCreate) -> UserProfile:
    user = await get_user_by_id(user_id)
    if await UserProfile.filter(user_id=user.id).exists():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El usuario ya tiene perfil",
        )

    return await UserProfile.create(user=user, **data.model_dump())


async def get_user_profile(user_id: int) -> UserProfile:
    profile = await UserProfile.get_or_none(user_id=user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado")
    return profile


async def update_user_profile(user_id: int, data: UserProfileUpdate) -> UserProfile:
    profile = await get_user_profile(user_id)
    await profile.update_from_dict(data.model_dump(exclude_unset=True))
    await profile.save()
    return profile


async def update_user_location(user_id: int, latitude: float, longitude: float) -> UserProfile:
    profile = await UserProfile.get_or_none(user_id=user_id)
    if not profile:
        user = await get_user_by_id(user_id)
        return await UserProfile.create(
            user=user,
            full_name=user.email.split("@")[0],
            latitude=latitude,
            longitude=longitude,
        )
    profile.latitude = latitude
    profile.longitude = longitude
    await profile.save()
    return profile
