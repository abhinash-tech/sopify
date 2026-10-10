import json
from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.sop import SOPRecord
from app.schemas.sop import SOPDocument


def serialize_record(record: SOPRecord) -> dict:
    content = json.loads(record.sop_content)
    content["record_id"] = record.id
    content["status"] = record.status
    content["version"] = record.version
    content["industry"] = record.industry
    content["audience"] = record.audience
    content["complexity"] = record.complexity
    content["created_at"] = record.created_at.isoformat() if record.created_at else None
    content["updated_at"] = record.updated_at.isoformat() if record.updated_at else None

    # Maintain checklistDone sync
    if "checklist_items" in content and content["checklist_items"]:
        content["checklistDone"] = [item.get("is_completed", False) for item in content["checklist_items"]]
    elif "checklist" in content and "checklistDone" not in content:
        content["checklistDone"] = [False for _ in content["checklist"]]

    return content


def save_record(
    db: Session,
    sop_data: dict,
    status: str = "draft",
    record: SOPRecord | None = None
) -> SOPRecord:
    data = dict(sop_data)
    data.pop("record_id", None)
    data.pop("created_at", None)
    data.pop("updated_at", None)

    title = data.get("name", "Untitled SOP")
    process_name = data.get("process_name", title)
    department = data.get("department", "Operations")
    objective = data.get("objective", "")
    industry = data.get("industry")
    audience = data.get("audience")
    complexity = data.get("complexity", "Medium")
    version = data.get("version", "1.0")

    content = json.dumps(data, ensure_ascii=False)

    if record is None:
        record = SOPRecord(
            title=title,
            process_name=process_name,
            department=department,
            objective=objective,
            industry=industry,
            audience=audience,
            complexity=complexity,
            sop_content=content,
            status=status,
            version=version,
        )
        db.add(record)
    else:
        record.title = title
        record.process_name = process_name
        record.department = department
        record.objective = objective
        record.industry = industry
        record.audience = audience
        record.complexity = complexity
        record.sop_content = content
        record.status = status
        record.version = version
        record.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(record)
    return record


def duplicate_record(db: Session, original_record: SOPRecord) -> SOPRecord:
    content = json.loads(original_record.sop_content)
    new_name = f"{original_record.title} (Copy)"
    content["name"] = new_name
    content["id"] = f"{content.get('id', 'SOP')}-COPY"
    content["version"] = "1.0"
    content["status"] = "draft"

    new_content = json.dumps(content, ensure_ascii=False)
    new_record = SOPRecord(
        title=new_name,
        process_name=original_record.process_name,
        department=original_record.department,
        objective=original_record.objective,
        industry=original_record.industry,
        audience=original_record.audience,
        complexity=original_record.complexity,
        sop_content=new_content,
        status="draft",
        version="1.0"
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


def get_dashboard_stats(db: Session) -> dict:
    total_sops = db.query(SOPRecord).count()
    draft_count = db.query(SOPRecord).filter(SOPRecord.status == "draft").count()
    review_count = db.query(SOPRecord).filter(SOPRecord.status == "review").count()
    approved_count = db.query(SOPRecord).filter(SOPRecord.status == "approved").count()

    dept_query = (
        db.query(SOPRecord.department, func.count(SOPRecord.id))
        .group_by(SOPRecord.department)
        .all()
    )
    by_department = {dept: count for dept, count in dept_query}

    recent_records = (
        db.query(SOPRecord)
        .order_by(SOPRecord.updated_at.desc())
        .limit(5)
        .all()
    )
    recent_activity = [
        {
            "id": r.id,
            "title": r.title,
            "department": r.department,
            "status": r.status,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }
        for r in recent_records
    ]

    return {
        "total_sops": total_sops,
        "draft_count": draft_count,
        "review_count": review_count,
        "approved_count": approved_count,
        "by_department": by_department,
        "recent_activity": recent_activity
    }


def model_payload(sop: SOPDocument) -> dict:
    return sop.model_dump(exclude={"record_id", "created_at", "updated_at"})
