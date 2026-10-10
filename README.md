# SOPify — AI-Powered Standard Operating Procedure Generator

**SOPify** converts simple business process descriptions into professional, structured, editable, and auditable Standard Operating Procedures (SOPs).

Built with an enterprise editorial visual design inspired by HITIT's corporate brand identity, SOPify bridges high-level process needs with standardized team execution, role-based responsibilities, quality checklist controls, and audit logs.

---

## 1. Key Features

- **Enterprise Editorial UI**: Preserves the custom red, black, and warm cream corporate aesthetic with typography-driven hierarchy and generous section whitespace.
- **6 Domain-Specific Predefined Processes**:
  1. *Employee Onboarding* (HR)
  2. *Customer Refund Processing* (Customer Support & Billing)
  3. *Severity 1 & 2 Incident Response* (Engineering & IT)
  4. *Customer Support Escalation* (Customer Experience)
  5. *Production Software Deployment* (DevOps & Engineering)
  6. *Purchase Requisition & Procurement Approval* (Finance & Procurement)
- **Custom Process Synthesizer**: Input any custom company process, department, objective, and constraints.
- **Real AI Generation & Deterministic Failover**:
  - Connects to Google Gemini (`gemini-3.8-flash`) via the official `google-genai` Python SDK.
  - Automatically falls back to deterministic high-fidelity templates if no API key is provided or if network/quota errors occur, guaranteeing 100% demo uptime.
- **In-Place Interactive Editor**:
  - Direct content editing for Title, Objective, Purpose, Scope, Steps, and Checklist.
  - **Procedure Controls**: Reorder steps (Move Up / Down), Add new steps, Delete steps.
  - **Checklist Controls**: Toggle completion states, edit item text, Add new items, Remove items.
  - **Status Transitions**: Draft → In Review → Approved → Archived.
  - Revert uncommitted edits with the Cancel button.
- **Enterprise Library & Document Management**:
  - Full-text search by title, process name, or department.
  - Department and Status filtering.
  - One-click Document Duplication (`(Copy)`).
  - Safe deletion with inline confirmation banner.
- **Live Metrics Dashboard**:
  - Real SQL aggregates calculated directly from SQLite: Total SOPs, Drafts, In Review, Approved.
  - Visual departmental breakdown bars.
  - Recent activity feed with direct "Open in Editor" shortcut.
- **Multi-Format Exporting**:
  - Print-to-PDF (`window.print()`) formatted for A4 margins with all UI controls hidden.
  - Downloadable formatted `.txt` files.
  - Downloadable raw structured `.json` files.
  - Copy complete document or section summaries to clipboard.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18+
- **Build Tool & Bundler**: Vite
- **Styling**: Custom CSS design system + Tailwind CSS utilities
- **State & Networking**: Native React Hooks + Centralized Fetch API Client

### Backend
- **Framework**: Python FastAPI
- **Server**: Uvicorn ASGI
- **Validation**: Pydantic v2
- **ORM & Database**: SQLAlchemy ORM + SQLite (persisted to `backend/data/sopify.db`)
- **AI Integration**: Google Gemini API via official SDK `google-genai`

### Testing
- **Backend**: Pytest + FastAPI TestClient + HTTPX (In-memory SQLite isolation)

---

## 3. Project Structure

```
SOPify/
├── sopify-react/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── routes/
│   │   │   │       ├── dashboard.py     # Live SQL statistics endpoint
│   │   │   │       └── sops.py          # SOP CRUD, generation, and duplication
│   │   │   ├── core/
│   │   │   │   └── config.py        # Environment variables & database path
│   │   │   ├── db/
│   │   │   │   └── database.py      # SQLAlchemy engine & session factory
│   │   │   ├── models/
│   │   │   │   └── sop.py           # SOPRecord SQLAlchemy model
│   │   │   ├── schemas/
│   │   │   │   └── sop.py           # Pydantic validation schemas
│   │   │   ├── services/
│   │   │   │   ├── ai_service.py    # Gemini client & deterministic sample catalog
│   │   │   │   └── sop_service.py   # Database query & aggregation service
│   │   │   └── main.py              # FastAPI application & lifecycle migrations
│   │   ├── data/
│   │   │   └── sopify.db            # Persistent SQLite database file
│   │   ├── .env                     # Local environment settings
│   │   ├── .env.example             # Example environment template
│   │   └── requirements.txt         # Python dependencies
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClosingSection.jsx   # Editorial call-to-action
│   │   │   ├── DashboardDialog.jsx  # Live metrics and department breakdown modal
│   │   │   ├── FeaturesSection.jsx  # Feature showcase cards
│   │   │   ├── Header.jsx           # Sticky navigation with Library & Dashboard buttons
│   │   │   ├── HeroSection.jsx      # Hero landing banner
│   │   │   ├── LibraryDialog.jsx    # Search, filter, duplicate, and delete modal
│   │   │   ├── ManifestoSection.jsx # Corporate values section
│   │   │   ├── SiteFooter.jsx       # Footer links and copyright
│   │   │   ├── StudioWorkspace.jsx  # Generator form, in-place editor, and preview
│   │   │   └── ValueStrip.jsx       # Value proposition metric strip
│   │   ├── data/
│   │   │   └── templates.js         # 6 predefined SOP templates and local builder
│   │   ├── services/
│   │   │   └── api.js               # Centralized frontend API client
│   │   ├── utils/
│   │   │   └── formatters.js        # Text compiler, dates, and file downloader
│   │   ├── App.jsx                  # Application state orchestrator
│   │   ├── main.jsx                 # React root mount
│   │   └── styles.css               # Design system stylesheet & print rules
│   ├── tests/
│   │   ├── test_api.py              # Comprehensive API, CRUD, and error tests
│   │   └── test_services.py         # AI service & template catalog unit tests
│   ├── docs/
│   │   ├── ARCHITECTURE.md          # Technical architecture & data flows
│   │   ├── API.md                   # REST API documentation
│   │   └── LIMITATIONS.md           # Constraints and roadmap
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Node.js dependencies & scripts
│   ├── vite.config.js               # Vite config with backend proxy
│   └── README.md
```

---

## 4. Getting Started on Windows 11 (PowerShell)

### Prerequisites
- **Node.js**: v20+ recommended
- **Python**: v3.11+ (Python 3.14 verified)
- **PowerShell**: Standard Windows terminal

---

### Step 1: Install & Start Backend

Open PowerShell and navigate to the backend directory:

```powershell
cd C:\SOPify\sopify-react\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### Optional: Configure Google Gemini API Key
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Open `.env` in any text editor and paste your API key:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
DATABASE_URL=sqlite:///./data/sopify.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
*(If no API key is set, the application operates seamlessly using its built-in enterprise sample generation engine).*

#### Start the FastAPI Server
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health: `http://127.0.0.1:8000/api/health`
- Interactive API Docs: `http://127.0.0.1:8000/docs`

---

### Step 2: Install & Start Frontend

Open a second PowerShell window:

```powershell
cd C:\SOPify\sopify-react
npm install
npm run dev
```

Open your browser to:
👉 `http://localhost:5173`

The frontend automatically proxies `/api/*` calls to `http://127.0.0.1:8000`.

---

## 5. Verification & Testing

### Run Backend Automated Tests
From `sopify-react`:

```powershell
$env:PYTHONPATH="backend"
.\backend\.venv\Scripts\python.exe -m pytest -v tests
```

**Results:**
- `tests/test_api.py::test_api_health` PASSED
- `tests/test_api.py::test_sop_full_crud_and_duplication` PASSED
- `tests/test_api.py::test_404_for_missing_sop` PASSED
- `tests/test_api.py::test_invalid_generation_payload_returns_422` PASSED
- `tests/test_api.py::test_update_preserves_inner_sop_status_when_status_omitted` PASSED
- `tests/test_api.py::test_empty_dashboard_stats` PASSED
- `tests/test_services.py::test_all_six_templates_generate_valid_sops` PASSED
- `tests/test_services.py::test_custom_process_generation` PASSED
- `tests/test_services.py::test_clean_identifier_logic` PASSED
- **100% Pass Rate (9/9 passed)**

### Production Build Check
```powershell
npm run build
```
Builds cleanly with zero errors to `dist/`.

---

## 6. End-to-End Demonstration Checklist

1. **Explore Landing Page**: Observe the editorial hero, value proposition strip, manifesto section, and feature cards.
2. **Select a Template**: Click one of the 6 templates (e.g. *Incident Response* or *Customer Refund*).
3. **Customize Fields**: Adjust process name, department, objective, and expand *Advanced options* to set industry and complexity.
4. **Generate SOP**: Click **Generate SOP ✦**. The procedure structures dynamically and persists to SQLite.
5. **In-Place Editing**: Click **Edit**. Modify step text, use **↑ / ↓** to reorder steps, add a step, or delete a step.
6. **Checklist Interaction**: Check/uncheck completion checklist items.
7. **Change Workflow Status**: Use the status selector in the document header to change from **Draft** to **In Review** or **Approved**.
8. **Save to Database**: Click **Save to Database**. The updated document is synced with UTC timestamps.
9. **Open Dashboard**: Click **Dashboard** in the header. View live metrics, department percentage bars, and recent activity.
10. **Manage Library**: Click **Library**. Search by keyword, filter by department or status, duplicate an SOP, or delete with confirmation.
11. **Export**: Click **Export ▾** to test:
    - **Print / Save as PDF** (clean A4 format without toolbar elements).
    - **Download .TXT**.
    - **Download .JSON**.
