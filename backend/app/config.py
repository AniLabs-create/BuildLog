import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    """
    Application Settings loaded from environment variables or .env file.
    Pydantic guarantees types and validates configuration on startup.
    """
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "BuildLog API"
    DEBUG: bool = True

    # Database connection string
    # Defaults to local SQLite file for zero-friction setup.
    # Set to postgresql://user:pass@host/dbname for PostgreSQL / Neon.
    DATABASE_URL: str = "sqlite:///./buildlog.db"

    # Authentication settings (for Milestone 4)
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS configuration: comma-separated list of allowed origins
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # GitHub OAuth (leave CLIENT_ID empty to disable "Continue with GitHub")
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    # Full callback URL registered on the GitHub OAuth app.
    # Leave empty to derive it from the incoming request (works locally).
    GITHUB_REDIRECT_URI: str = ""
    # Where the OAuth callback sends the browser afterwards (the React app)
    FRONTEND_URL: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        """Convert comma-separated origin string into a list of strings."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def normalized_database_url(self) -> str:
        """
        Render and older cloud providers use 'postgres://' which SQLAlchemy 2.0 deprecated
        in favor of 'postgresql://'. This automatically normalizes the prefix.
        """
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        return self.DATABASE_URL

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache
def get_settings() -> Settings:
    """Cached settings instance to avoid re-reading files on every call."""
    return Settings()

settings = get_settings()
