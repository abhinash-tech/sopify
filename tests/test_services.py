from unittest.mock import MagicMock
from app.services import ai_service


def test_all_six_templates_generate_valid_sops(monkeypatch):
    # Ensure offline deterministic test without consuming live API tokens
    monkeypatch.setattr(ai_service, "GEMINI_API_KEY", "")
    templates = ["onboarding", "refund", "incident", "escalation", "deployment", "purchase"]
    for tpl in templates:
        result = ai_service.generate_sop(
            process_name=f"Standard {tpl.title()} Workflow",
            department="Operations",
            objective="Ensure standard operational compliance.",
            template_key=tpl
        )
        assert result["source"] == "sample"
        assert len(result["steps"]) >= 3
        assert len(result["checklist"]) >= 3
        assert len(result["roles"]) >= 2
        assert result["purpose"]
        assert result["scope"]
        assert result["id"].startswith("SOP-")
        assert "steps" in result
        assert all("expected_outcome" in s for s in result["steps"])


def test_custom_process_generation(monkeypatch):
    monkeypatch.setattr(ai_service, "GEMINI_API_KEY", "")
    result = ai_service.generate_sop(
        process_name="Warehouse Inventory Cycle Count",
        department="Supply Chain",
        objective="Perform weekly physical inventory verification without stopping fulfillment.",
        template_key="custom_inventory_key",
        industry="Logistics",
        complexity="High"
    )
    assert result["name"] == "Warehouse Inventory Cycle Count"
    assert result["department"] == "Supply Chain"
    assert len(result["steps"]) >= 4
    assert len(result["checklist"]) >= 4
    assert result["complexity"] == "High"
    assert result["industry"] == "Logistics"


def test_clean_identifier_logic():
    assert ai_service._clean_identifier("Human Resources") == "HR"
    assert ai_service._clean_identifier("Information Technology") == "IT"
    assert ai_service._clean_identifier("Finance") == "FIN"
    assert ai_service._clean_identifier("") == "OPS"


def test_gemini_generation_handling_mocked(monkeypatch):
    mock_payload = (
        '{\n'
        '  "name": "Automated Security Patching",\n'
        '  "department": "IT Operations",\n'
        '  "objective": "Apply critical patches within 24 hours.",\n'
        '  "purpose": "Ensure enterprise servers are patched against vulnerabilities.",\n'
        '  "scope": "All production Linux virtual machines.",\n'
        '  "id": "SOP-ITO-999",\n'
        '  "steps": [{"title": "Scan vulnerabilities", "detail": "Run automated scanner.", "owner": "SecOps", "expected_outcome": "Report generated.", "verification": "Review log."}],\n'
        '  "checklist": ["Scan completed", "Patch staged", "Reboot confirmed"]\n'
        '}'
    )

    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = mock_payload
    mock_client.models.generate_content.return_value = mock_response

    monkeypatch.setattr("google.genai.Client", lambda api_key: mock_client)
    monkeypatch.setattr(ai_service, "GEMINI_API_KEY", "mock-key")

    result = ai_service._gemini_sop(
        process_name="Automated Security Patching",
        department="IT Operations",
        objective="Apply critical patches within 24 hours.",
        template_key="incident"
    )

    assert result["name"] == "Automated Security Patching"
    assert result["source"] == "gemini"
    assert len(result["steps"]) == 1
    assert result["steps"][0]["title"] == "Scan vulnerabilities"
    assert len(result["checklist"]) == 3
