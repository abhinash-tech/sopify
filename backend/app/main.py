from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.sops import router as sops_router
from app.core.config import BASE_DIR, CORS_ORIGINS, GEMINI_API_KEY, GEMINI_MODEL
from app.db.database import Base, engine
from app.models.sop import SOPRecord  # noqa: F401 - register model metadata
from app.schemas.sop import HealthResponse


def run_sqlite_migrations(eng):
    """
    Safely adds any missing columns to existing SQLite database table
    without wiping existing records.
    """
    with eng.begin() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(sops)")).fetchall()
            existing_cols = {row[1] for row in result}
            if existing_cols:
                if "industry" not in existing_cols:
                    conn.execute(text("ALTER TABLE sops ADD COLUMN industry VARCHAR(120)"))
                if "audience" not in existing_cols:
                    conn.execute(text("ALTER TABLE sops ADD COLUMN audience VARCHAR(120)"))
                if "complexity" not in existing_cols:
                    conn.execute(text("ALTER TABLE sops ADD COLUMN complexity VARCHAR(50) DEFAULT 'Medium'"))
                if "version" not in existing_cols:
                    conn.execute(text("ALTER TABLE sops ADD COLUMN version VARCHAR(20) DEFAULT '1.0'"))
        except Exception:
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_sqlite_migrations(engine)
    yield


app = FastAPI(
    title="SOPify API",
    description="Generate, edit, and manage standard operating procedures.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    db_status = "connected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "service": "sopify-api",
        "database": db_status,
        "ai_enabled": bool(GEMINI_API_KEY),
        "model": GEMINI_MODEL if GEMINI_API_KEY else "deterministic-sample-engine"
    }


app.include_router(sops_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

# Serve built frontend Single Page Application (SPA) if dist directory exists
DIST_DIR = (BASE_DIR.parent / "dist").resolve()
if not DIST_DIR.exists():
    DIST_DIR = (BASE_DIR / "dist").resolve()

if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    from fastapi import HTTPException

    if (DIST_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        target = DIST_DIR / full_path
        if target.is_file():
            return FileResponse(target)
        return FileResponse(DIST_DIR / "index.html")
