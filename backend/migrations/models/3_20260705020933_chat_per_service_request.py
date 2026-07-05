from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "chat_messages" ADD "service_request_id" INT;
        ALTER TABLE "chat_messages" ADD CONSTRAINT "fk_chat_mes_service__6321f17e" FOREIGN KEY ("service_request_id") REFERENCES "service_requests" ("id") ON DELETE CASCADE;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "chat_messages" DROP CONSTRAINT IF EXISTS "fk_chat_mes_service__6321f17e";
        ALTER TABLE "chat_messages" DROP COLUMN "service_request_id";"""


MODELS_STATE = (
    "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"
)
