from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.sop import SOPRecord
from app.schemas.sop import SOPDocument, SOPGenerateRequest, SOPUpdateRequest
from app.services.ai_service import generate_sop
from app.services.sop_service import duplicate_record, model_payload, save_record, serialize_record

router = APIRouter(prefix="/sops", tags=["SOPs"])


@router.post("/generate", response_model=SOPDocument, status_code=status.HTTP_201_CREATED)
def generate_and_save_sop(payload: SOPGenerateRequest, db: Session = Depends(get_db)):
    sop_data = generate_sop(
        process_name=payload.process_name,
        department=payload.department,
        objective=payload.objective,
        template_key=payload.template_key,
        industry=payload.industry,
        audience=payload.audience,
        complexity=payload.complexity,
        description=payload.description,
        frequency=payload.frequency,
        policies=payload.policies,
        additional_instructions=payload.additional_instructions,
    )
    record = save_record(db, sop_data, status="draft")
    return serialize_record(record)


@router.get("", response_model=list[SOPDocument])
def list_sops(
    q: str | None = Query(default=None, description="Search term for title or process name"),
    department: str | None = Query(default=None, description="Filter by department"),
    status: str | None = Query(default=None, description="Filter by status (draft, review, approved)"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(SOPRecord)
    if q:
        search_filter = f"%{q.strip()}%"
        query = query.filter(
            (SOPRecord.title.ilike(search_filter)) | (SOPRecord.process_name.ilike(search_filter))
        )
    if department and department != "All":
        query = query.filter(SOPRecord.department.ilike(department.strip()))
    if status and status != "All":
        query = query.filter(SOPRecord.status.ilike(status.strip()))

    records = query.order_by(SOPRecord.updated_at.desc()).offset(offset).limit(limit).all()
    return [serialize_record(record) for record in records]


@router.get("/{record_id}", response_model=SOPDocument)
def get_sop(record_id: int, db: Session = Depends(get_db)):
    record = db.get(SOPRecord, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="SOP not found")
    return serialize_record(record)


@router.put("/{record_id}", response_model=SOPDocument)
def update_sop(record_id: int, payload: SOPUpdateRequest, db: Session = Depends(get_db)):
    record = db.get(SOPRecord, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="SOP not found")
    data = model_payload(payload.sop)
    effective_status = payload.status or payload.sop.status or "draft"
    updated = save_record(db, data, status=effective_status, record=record)
    return serialize_record(updated)


@router.post("/{record_id}/duplicate", response_model=SOPDocument, status_code=status.HTTP_201_CREATED)
def duplicate_sop(record_id: int, db: Session = Depends(get_db)):
    record = db.get(SOPRecord, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="SOP not found")
    new_record = duplicate_record(db, record)
    return serialize_record(new_record)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sop(record_id: int, db: Session = Depends(get_db)):
    record = db.get(SOPRecord, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="SOP not found")
    db.delete(record)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
