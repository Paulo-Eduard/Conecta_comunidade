import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Conecta Comunidade")
    DEBUG: bool   = os.getenv("DEBUG", "False") == "True"

    SECRET_KEY: str  = os.getenv("SECRET_KEY", "conecta_comunidade_secret_key_2024")
    ALGORITHM: str   = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./banco.db")

settings = Settings()
