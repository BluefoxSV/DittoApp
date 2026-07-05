from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "service_requests" ALTER COLUMN "worker_id" DROP NOT NULL;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "service_requests" ALTER COLUMN "worker_id" SET NOT NULL;"""


MODELS_STATE = (
    "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"
)
