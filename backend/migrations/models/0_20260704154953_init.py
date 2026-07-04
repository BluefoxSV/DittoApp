from tortoise import BaseDBAsyncClient

RUN_IN_TRANSACTION = True


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "courses" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "summary" TEXT,
    "thumbnail_url" VARCHAR(500),
    "is_active" BOOL NOT NULL DEFAULT True,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "course_lessons" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "content_type" VARCHAR(5) NOT NULL,
    "content_url" VARCHAR(500) NOT NULL,
    "order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_id" INT NOT NULL REFERENCES "courses" ("id") ON DELETE CASCADE
);
COMMENT ON COLUMN "course_lessons"."content_type" IS 'VIDEO: video\nSLIDE: slide';
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(7) NOT NULL DEFAULT 'user',
    "is_active" BOOL NOT NULL DEFAULT True,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN "users"."role" IS 'USER: user\nWORKER: worker\nSUPPORT: support';
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "is_read" BOOL NOT NULL DEFAULT False,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiver_id" INT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "sender_id" INT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "address" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INT NOT NULL UNIQUE REFERENCES "users" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "worker_profiles" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "bio" TEXT,
    "experience" TEXT,
    "academic_history" TEXT,
    "contact_info" TEXT,
    "is_verified" BOOL NOT NULL DEFAULT False,
    "classification_level" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INT NOT NULL UNIQUE REFERENCES "users" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "course_enrollments" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "status" VARCHAR(11) NOT NULL DEFAULT 'enrolled',
    "progress" INT NOT NULL DEFAULT 0,
    "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "course_id" INT NOT NULL REFERENCES "courses" ("id") ON DELETE CASCADE,
    "worker_id" INT NOT NULL REFERENCES "worker_profiles" ("id") ON DELETE CASCADE,
    CONSTRAINT "uid_course_enro_worker__d7d8f1" UNIQUE ("worker_id", "course_id")
);
COMMENT ON COLUMN "course_enrollments"."status" IS 'ENROLLED: enrolled\nIN_PROGRESS: in_progress\nCOMPLETED: completed';
CREATE TABLE IF NOT EXISTS "service_requests" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "status" VARCHAR(11) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "user_id" INT NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "worker_id" INT NOT NULL REFERENCES "worker_profiles" ("id") ON DELETE CASCADE
);
COMMENT ON COLUMN "service_requests"."status" IS 'PENDING: pending\nIN_PROGRESS: in_progress\nCOMPLETED: completed\nCANCELLED: cancelled';
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """


MODELS_STATE = (
    "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"
    "G8Vb"
)
