from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "OptiHealth API"
    API_V1_STR: str = "/api/v1"
    
    # Database (Automatically reads DATABASE_URL from .env)
    # Default is SQLite only as a fallback if .env is missing
    DATABASE_URL: str = "sqlite:///./optihealth.db"

    # Security
    SECRET_KEY: str = "supersecretkey123"
    
    # CORS Configuration
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()