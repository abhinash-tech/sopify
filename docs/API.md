# SOPify REST API Reference

The backend exposes a standardized RESTful API via FastAPI with automatic interactive documentation available at `http://127.0.0.1:8000/docs` (Swagger UI) and `http://127.0.0.1:8000/redoc` (ReDoc).

All endpoints accept and return `application/json`. Timestamps use ISO 8601 UTC format.

---

## 1. Health & Status

### `GET /api/health`
Returns system status, database connectivity, and AI provider availability.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "sopify-api",
  "database": "connected",
  "ai_enabled": true,
  "model": "gemini-3.8-flash"
}
```

---

## 2. SOP Generation

### `POST /api/sops/generate`
Generates a structured SOP using Google Gemini (or deterministic sample engine) and persists the record to SQLite.

**Request Body:**
```json
{
  "process_name": "Customer Support Escalation",
  "department": "Customer Support",
  "objective": "Resolve escalated issues within 4 hours.",
  "description": "Standardize handoff between Tier 1 and Tier 2.",
  "template_key": "escalation",
  "industry": "SaaS / Cloud Software",
  "audience": "Tier 1 & Tier 2 Representatives",
  "complexity": "Medium",
  "frequency": "Daily / Recurring",
  "policies": "Tier 1 SLA policy",
  "additional_instructions": "Include customer expectation notification"
}
```

**Response (201 Created):**
```json
{
  "name": "Customer Support Escalation",
  "department": "Customer Support",
  "objective": "Resolve escalated issues within 4 hours.",
  "purpose": "Comprehensive operational rationale...",
  "scope": "Applies to customer support operations...",
  "id": "SOP-CS-412",
  "prerequisites": ["Unresolved frontline ticket with diagnostic logs"],
  "tools_and_materials": ["Ticketing system with SLA tracking"],
  "roles": ["Tier 1 Representative", "Tier 2 Specialist"],
  "steps": [
    {
      "id": "step-1",
      "step_number": 1,
      "title": "Frontline diagnostic synthesis",
      "detail": "Document device info, error logs, and customer impact level.",
      "owner": "Tier 1 Representative",
      "expected_outcome": "Complete diagnostic package attached to ticket.",
      "verification": "Check required escalation fields populated."
    }
  ],
  "checklist": ["Verify customer tier", "Document reproduction steps"],
  "checklistDone": [true, false],
  "checklist_items": [
    { "id": "chk-1-a83f12", "label": "Verify customer tier", "is_completed": true }
  ],
  "required_records": ["Diagnostic screenshots", "Ticket interaction log"],
  "risk_and_safety": "Do not expose customer PII in unsecured channels.",
  "exception_handling": "If VIP account, notify Support Manager immediately.",
  "escalation": "Escalate to Director if blocked over 24 hours.",
  "review_frequency": "Every 6 months",
  "approval_workflow": {
    "reviewer_role": "Support Operations Manager",
    "approver_role": "Head of Support",
    "stage": "Standard Operating Procedure",
    "status": "Approved",
    "review_notes": "Synchronized with current enterprise SLAs."
  },
  "industry": "SaaS / Cloud Software",
  "audience": "Tier 1 & Tier 2 Representatives",
  "complexity": "Medium",
  "version": "1.0",
  "status": "draft",
  "source": "gemini",
  "record_id": 1,
  "created_at": "2026-10-10T08:56:34.353813",
  "updated_at": "2026-10-10T08:56:34.353819"
}
```

---

## 3. SOP Management (CRUD)

### `GET /api/sops`
Retrieves a paginated list of saved SOP records, ordered by most recently modified.

**Query Parameters:**
- `q` (string, optional): Search query matching title or process name.
- `department` (string, optional): Filter by department (e.g. `Human Resources`).
- `status` (string, optional): Filter by status (`draft`, `review`, `approved`, `archived`).
- `limit` (integer, optional, default: 50, max: 100): Page size.
- `offset` (integer, optional, default: 0): Pagination offset.

**Response (200 OK):**
Array of `SOPDocument` objects.

### `GET /api/sops/{record_id}`
Retrieves a single complete SOP by its database integer ID.

**Response (200 OK):**
`SOPDocument` object. Returns `404 Not Found` if missing.

### `PUT /api/sops/{record_id}`
Updates an existing SOP document, its sections, checklist state, or status.

**Request Body:**
```json
{
  "sop": { ... },
  "status": "review"
}
```

**Response (200 OK):**
Updated `SOPDocument` object. Returns `404 Not Found` if missing.

### `POST /api/sops/{record_id}/duplicate`
Clones an existing SOP into a new record with title suffix `(Copy)`, new identifier `...-COPY`, and `draft` status.

**Response (201 Created):**
New `SOPDocument` object.

### `DELETE /api/sops/{record_id}`
Deletes the specified SOP record from the database.

**Response (204 No Content):**
Empty response body. Returns `404 Not Found` if missing.

---

## 4. Dashboard Metrics

### `GET /api/dashboard/stats`
Computes live aggregates directly from SQLite.

**Response (200 OK):**
```json
{
  "total_sops": 4,
  "draft_count": 2,
  "review_count": 1,
  "approved_count": 1,
  "by_department": {
    "Customer Support": 2,
    "Human Resources": 1,
    "Engineering & IT": 1
  },
  "recent_activity": [
    {
      "id": 4,
      "title": "Incident Response Procedure",
      "department": "Engineering & IT",
      "status": "approved",
      "updated_at": "2026-10-10T08:58:12.194201"
    }
  ]
}
```
