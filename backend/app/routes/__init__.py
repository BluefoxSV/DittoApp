from fastapi import APIRouter

from app.routes import auth, chat, courses, service_requests, users, workers

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(workers.router)
api_router.include_router(courses.router)
api_router.include_router(service_requests.router)
api_router.include_router(chat.router)
