from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "DittoApp API"
    debug: bool = False
    database_url: str = "postgres://postgres:postgres@localhost:5432/dittoapp"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    gowa_base_url: str = "http://localhost:3000"
    gowa_device_id: str | None = None
    gowa_webhook_secret: str = "secret"
    whatsapp_api_key: str | None = None
    n8n_webhook_url: str | None = None
    elevenlabs_api_key: str | None = None
    elevenlabs_agent_id: str | None = None
    elevenlabs_use_signed_url: bool = False
    elevenlabs_intake_prompt: str | None = None
    elevenlabs_first_message: str | None = None
    elevenlabs_use_prompt_override: bool = False
    elevenlabs_min_follow_up_questions: int = 3


settings = Settings()
