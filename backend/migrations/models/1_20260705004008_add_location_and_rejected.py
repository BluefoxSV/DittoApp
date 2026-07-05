from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "service_requests" ADD "latitude" DOUBLE PRECISION;
        ALTER TABLE "service_requests" ADD "longitude" DOUBLE PRECISION;
        COMMENT ON COLUMN "service_requests"."status" IS 'PENDING: pending
REJECTED: rejected
IN_PROGRESS: in_progress
COMPLETED: completed
CANCELLED: cancelled';
        ALTER TABLE "user_profiles" ADD "latitude" DOUBLE PRECISION;
        ALTER TABLE "user_profiles" ADD "longitude" DOUBLE PRECISION;
        ALTER TABLE "worker_profiles" ADD "latitude" DOUBLE PRECISION;
        ALTER TABLE "worker_profiles" ADD "longitude" DOUBLE PRECISION;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "service_requests" DROP COLUMN "latitude";
        ALTER TABLE "service_requests" DROP COLUMN "longitude";
        COMMENT ON COLUMN "service_requests"."status" IS 'PENDING: pending
IN_PROGRESS: in_progress
COMPLETED: completed
CANCELLED: cancelled';
        ALTER TABLE "user_profiles" DROP COLUMN "latitude";
        ALTER TABLE "user_profiles" DROP COLUMN "longitude";
        ALTER TABLE "worker_profiles" DROP COLUMN "latitude";
        ALTER TABLE "worker_profiles" DROP COLUMN "longitude";"""


MODELS_STATE = (
    "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"
)
