from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.sop import DashboardStats
from app.services.sop_service import get_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def fetch_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns live statistics computed directly from the SQLite database:
    total SOPs, draft counts, review counts, approved counts, department breakdown,
    and recent activity records.
    """
    return get_dashboard_stats(db)
