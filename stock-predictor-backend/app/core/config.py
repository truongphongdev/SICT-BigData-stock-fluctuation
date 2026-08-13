"""
Configuration settings for the FastAPI application.
Uses Pydantic BaseSettings to load environment variables.
"""
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "VN30 Alpha Stock Predictor API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # Security & Auth
    SECRET_KEY: str = "vn30_alpha_super_secret_jwt_key_2026_change_in_prod_at_least_32_chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: Optional[str] = None
    USE_SQLITE: bool = False
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "stock_predictor"
    POSTGRES_PORT: int = 5432

    # Model paths
    MODEL_PATH: str = "app/ml/models/best_model.json"

    # MLflow Tracking & Registry
    MLFLOW_TRACKING_URI: str = "sqlite:///mlflow.db"
    MLFLOW_EXPERIMENT_NAME: str = "stock-predictor-vn30"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        if self.USE_SQLITE:
            return "sqlite:///./stock_predictor.db"
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
