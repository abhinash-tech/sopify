from pathlib import Path
import os

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()

# Always ensure data directory exists and SQLite database path is resolved
DATA_DIR = (BASE_DIR / "data").resolve()
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_FILE = (DATA_DIR / "sopify.db").resolve()

raw_db_url = os.getenv("DATABASE_URL", "").strip()
if raw_db_url and not raw_db_url.startswith("sqlite:///."):
    DATABASE_URL = raw_db_url
else:
    DATABASE_URL = f"sqlite:///{DB_FILE.as_posix()}"

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]
