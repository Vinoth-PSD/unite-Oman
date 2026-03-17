from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # Allow frontend origin
    ALLOWED_ORIGINS: str = "http://72.61.229.172:5176"

    ENVIRONMENT: str = "development"

    UPLOAD_DIR: str = "uploads"

    # Backend base URL
    BASE_URL: str = "http://72.61.229.172:8090"

    @property
    def origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()