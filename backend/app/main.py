from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise

from app.config import settings
from app.database import TORTOISE_ORM
from app.routes import api_router

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.include_router(api_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=False,
    add_exception_handlers=True,
)
