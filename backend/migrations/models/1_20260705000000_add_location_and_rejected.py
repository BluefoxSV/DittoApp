from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
        ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
        ALTER TABLE "worker_profiles" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
        ALTER TABLE "worker_profiles" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
        ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
        ALTER TABLE "service_requests" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
        COMMENT ON COLUMN "service_requests"."status" IS 'PENDING: pending\nREJECTED: rejected\nIN_PROGRESS: in_progress\nCOMPLETED: completed\nCANCELLED: cancelled';
        """


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "latitude";
        ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "longitude";
        ALTER TABLE "worker_profiles" DROP COLUMN IF EXISTS "latitude";
        ALTER TABLE "worker_profiles" DROP COLUMN IF EXISTS "longitude";
        ALTER TABLE "service_requests" DROP COLUMN IF EXISTS "latitude";
        ALTER TABLE "service_requests" DROP COLUMN IF EXISTS "longitude";
        """
