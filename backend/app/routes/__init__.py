from fastapi import APIRouter

from app.routes import chat, courses, service_requests, users, workers

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(users.router)
api_router.include_router(workers.router)
api_router.include_router(courses.router)
api_router.include_router(service_requests.router)
api_router.include_router(chat.router)
