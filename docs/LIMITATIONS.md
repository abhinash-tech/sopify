# SOPify Project Limitations & Future Roadmap

This document outlines the current known constraints, design trade-offs, and recommended enhancements for future versions beyond the Hackathon MVP.

---

## 1. Current Architecture Constraints

### Single-Tenant / No User Authentication
- **Current State**: User authentication (OAuth2 / JWT / SSO) is intentionally omitted from the MVP scope in accordance with project requirements. All sessions interact with a shared local SQLite database.
- **Impact**: Any user who runs or accesses the local port can view, edit, or delete stored SOPs.
- **Recommendation**: Integrate FastAPI OAuth2 with JWT tokens, role-based access control (RBAC: Author, Reviewer, Approver, Admin), and per-tenant SQLite / PostgreSQL row isolation.

### Demonstrative Approval Workflow
- **Current State**: The approval workflow presents proposed reviewer/approver roles, stages, and status badges. Changing the status from "draft" to "review" or "approved" updates the database record. However, it does not send external emails, Slack webhooks, or cryptographic digital signatures.
- **Impact**: Suitable for demonstration, procedure alignment, and internal tracking, but not a legal e-signature audit solution.
- **Recommendation**: Add integration hooks with DocuSign, HelloSign, or internal corporate email dispatch (SMTP / SendGrid) with verification audit trails.

### Database Engine (SQLite)
- **Current State**: SOPs are stored in a local SQLite file (`backend/data/sopify.db`).
- **Impact**: High-frequency concurrent write operations across multiple threads can occasionally experience database locks.
- **Workaround**: SQLAlchemy connection arguments are configured with `check_same_thread: False` and transactional context managers.
- **Recommendation**: For multi-user cloud production deployments, switch connection string to PostgreSQL without changing models or schemas.

### PDF Generation Strategy
- **Current State**: Primary PDF export relies on the browser's native print engine (`window.print()`) configured with custom `@page` and `@media print` CSS rules.
- **Impact**: Relies on browser-level PDF rendering. Fonts and pagination headers depend on user browser print dialog settings.
- **Workaround**: Downloadable `.txt` and structured `.json` export options are implemented directly in the UI.
- **Recommendation**: Add a backend headless Chromium (Playwright) or WeasyPrint endpoint for automated server-side PDF generation.

---

## 2. AI Model & Rate Limiting

### Live Gemini Model Quotas
- **Current State**: Gemini calls use the configured model (`gemini-3.8-flash` or custom override) via the official Python SDK.
- **Failover Behavior**: If an API key is missing, invalid, or hits quota limits (HTTP 429), the backend automatically and silently falls back to rich, domain-specific deterministic templates.
- **Recommendation**: Implement exponential backoff retry policies and persistent caching for identical generation requests.

---

## 3. Hackathon Readiness Checklist
- [x] UI design integrity preserved (HITIT corporate editorial style).
- [x] Full React component hierarchy.
- [x] Complete REST API endpoints implemented and verified.
- [x] SQLite database persistence across restarts.
- [x] Google Gemini AI integration with deterministic failover.
- [x] In-place editing of all sections.
- [x] Procedure step reordering and deletion.
- [x] Checklist item creation, toggling, and removal.
- [x] Persistent SOP library with search, filtering, duplication, and confirmed deletion.
- [x] Accurate live dashboard derived from real SQL aggregates.
- [x] Export to PDF (print), `.txt`, and `.json`.
- [x] Windows PowerShell installation & execution support.
- [x] 100% automated test pass rate.
