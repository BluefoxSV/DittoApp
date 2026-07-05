import logging
from pathlib import Path

from aerich import Command
from tortoise import Tortoise

from app.database import TORTOISE_ORM

logger = logging.getLogger(__name__)

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


async def run_migrations() -> None:
    command = Command(
        tortoise_config=TORTOISE_ORM,
        app="models",
        location=str(MIGRATIONS_DIR),
    )
    try:
        await command.init()
        await command.upgrade()
        logger.info("Migraciones de base de datos aplicadas correctamente")
    finally:
        await Tortoise.close_connections()
