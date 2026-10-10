from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.routes import sops as sop_routes
from app.db.database import Base, get_db
from app.main import app

TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=TEST_ENGINE, autoflush=False, autocommit=False)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def sample_document(**overrides):
    data = {
        "name": "Customer Support Escalation",
        "department": "Customer Support",
        "objective": "Resolve escalated customer tickets within 4 hours.",
        "purpose": "Standardize how tier-1 agents escalate complex issues to tier-2.",
        "scope": "Applies to all inbound support channels.",
        "id": "SOP-CS-101",
        "prerequisites": ["Active ticket with diagnostic logs"],
        "tools_and_materials": ["CRM / Ticketing tool"],
        "roles": ["Tier 1 Agent", "Tier 2 Specialist", "Support Manager"],
        "steps": [
            {
                "id": "step-1",
                "step_number": 1,
                "title": "Triage and compile logs",
                "detail": "Gather user account information and error screenshots.",
                "owner": "Tier 1 Agent",
                "expected_outcome": "Complete diagnostic package attached to ticket.",
                "verification": "Check required fields populated."
            },
            {
                "id": "step-2",
                "step_number": 2,
                "title": "Transfer to Tier 2 queue",
                "detail": "Assign ticket to Tier 2 and send customer confirmation.",
                "owner": "Tier 2 Specialist",
                "expected_outcome": "Ticket accepted by specialist.",
                "verification": "Verify ticket status is In Progress."
            }
        ],
        "checklist": ["Collect diagnostic info", "Assign to Tier 2", "Notify customer"],
        "checklistDone": [True, False, False],
        "checklist_items": [
            {"id": "chk-1", "label": "Collect diagnostic info", "is_completed": True},
            {"id": "chk-2", "label": "Assign to Tier 2", "is_completed": False},
            {"id": "chk-3", "label": "Notify customer", "is_completed": False}
        ],
        "required_records": ["Ticket audit trail"],
        "risk_and_safety": "Do not share customer PII in unsecured channels.",
        "exception_handling": "If customer is VIP, notify Support Manager immediately.",
        "escalation": "Escalate to Director if blocked over 24 hours.",
        "review_frequency": "Every 6 months",
        "approval_workflow": {
            "reviewer_role": "Support Supervisor",
            "approver_role": "Head of Support",
            "stage": "Active Standard",
            "status": "Approved",
            "review_notes": "Reviewed and verified."
        },
        "industry": "Software",
        "audience": "Customer Support Team",
        "complexity": "Medium",
        "version": "1.0",
        "status": "draft",
        "source": "sample"
    }
    data.update(overrides)
    return data


def test_api_health():
    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "sopify-api"
    assert payload["database"] == "connected"


def test_sop_full_crud_and_duplication(monkeypatch):
    Base.metadata.create_all(bind=TEST_ENGINE)
    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(sop_routes, "generate_sop", lambda **kwargs: sample_document())
    client = TestClient(app)

    try:
        # 1. Generate & persist
        generated = client.post(
            "/api/sops/generate",
            json={
                "process_name": "Customer Support Escalation",
                "department": "Customer Support",
                "objective": "Resolve escalated customer tickets within 4 hours.",
                "template_key": "escalation",
                "complexity": "Medium"
            },
        )
        assert generated.status_code == 201, generated.text
        doc = generated.json()
        record_id = doc["record_id"]
        assert doc["name"] == "Customer Support Escalation"
        assert len(doc["steps"]) >= 2
        assert len(doc["checklist"]) >= 3

        # 2. List all
        listed = client.get("/api/sops")
        assert listed.status_code == 200
        assert len(listed.json()) == 1

        # 3. Search and filter
        search_res = client.get("/api/sops?q=Escalation")
        assert search_res.status_code == 200
        assert len(search_res.json()) == 1

        search_empty = client.get("/api/sops?q=NonExistentProcess")
        assert search_empty.status_code == 200
        assert len(search_empty.json()) == 0

        dept_res = client.get("/api/sops?department=Customer Support")
        assert dept_res.status_code == 200
        assert len(dept_res.json()) == 1

        # 4. Get by ID
        loaded = client.get(f"/api/sops/{record_id}")
        assert loaded.status_code == 200
        assert loaded.json()["record_id"] == record_id

        # 5. Update
        updated_payload = sample_document(
            objective="Updated SLA to 2 hours.",
            status="review"
        )
        updated = client.put(
            f"/api/sops/{record_id}",
            json={"sop": updated_payload, "status": "review"},
        )
        assert updated.status_code == 200
        assert updated.json()["objective"] == "Updated SLA to 2 hours."
        assert updated.json()["status"] == "review"

        # 6. Duplicate
        duplicated = client.post(f"/api/sops/{record_id}/duplicate")
        assert duplicated.status_code == 201
        dup_doc = duplicated.json()
        dup_id = dup_doc["record_id"]
        assert dup_id != record_id
        assert "(Copy)" in dup_doc["name"]
        assert dup_doc["status"] == "draft"

        # 7. Dashboard stats
        stats = client.get("/api/dashboard/stats")
        assert stats.status_code == 200
        stats_data = stats.json()
        assert stats_data["total_sops"] == 2
        assert stats_data["draft_count"] == 1
        assert stats_data["review_count"] == 1
        assert "Customer Support" in stats_data["by_department"]
        assert len(stats_data["recent_activity"]) == 2

        # 8. Delete
        del_res = client.delete(f"/api/sops/{record_id}")
        assert del_res.status_code == 204
        assert client.get(f"/api/sops/{record_id}").status_code == 404

        del_dup = client.delete(f"/api/sops/{dup_id}")
        assert del_dup.status_code == 204
        assert client.get(f"/api/sops/{dup_id}").status_code == 404
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=TEST_ENGINE)
        TEST_ENGINE.dispose()


def test_404_for_missing_sop():
    Base.metadata.create_all(bind=TEST_ENGINE)
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    try:
        assert client.get("/api/sops/99999").status_code == 404
        assert client.put("/api/sops/99999", json={"sop": sample_document(), "status": "draft"}).status_code == 404
        assert client.post("/api/sops/99999/duplicate").status_code == 404
        assert client.delete("/api/sops/99999").status_code == 404
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=TEST_ENGINE)
        TEST_ENGINE.dispose()


def test_invalid_generation_payload_returns_422():
    client = TestClient(app)
    # process_name must have at least 2 chars
    res = client.post("/api/sops/generate", json={"process_name": "A"})
    assert res.status_code == 422

    # missing process_name entirely
    res2 = client.post("/api/sops/generate", json={"department": "Finance"})
    assert res2.status_code == 422


def test_update_preserves_inner_sop_status_when_status_omitted(monkeypatch):
    Base.metadata.create_all(bind=TEST_ENGINE)
    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(sop_routes, "generate_sop", lambda **kwargs: sample_document())
    client = TestClient(app)
    try:
        # Generate initial record
        generated = client.post(
            "/api/sops/generate",
            json={
                "process_name": "Approval Workflow Test",
                "department": "Operations",
                "objective": "Test workflow.",
                "template_key": "purchase"
            }
        )
        assert generated.status_code == 201
        rec_id = generated.json()["record_id"]

        # Update without top-level 'status' field, but with inner sop.status = 'approved'
        inner = sample_document(name="Approval Workflow Test", status="approved")
        update_res = client.put(f"/api/sops/{rec_id}", json={"sop": inner})
        assert update_res.status_code == 200
        assert update_res.json()["status"] == "approved"
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=TEST_ENGINE)
        TEST_ENGINE.dispose()


def test_empty_dashboard_stats():
    Base.metadata.create_all(bind=TEST_ENGINE)
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    try:
        stats = client.get("/api/dashboard/stats")
        assert stats.status_code == 200
        data = stats.json()
        assert data["total_sops"] == 0
        assert data["draft_count"] == 0
        assert data["review_count"] == 0
        assert data["approved_count"] == 0
        assert data["by_department"] == {}
        assert data["recent_activity"] == []
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=TEST_ENGINE)
        TEST_ENGINE.dispose()
