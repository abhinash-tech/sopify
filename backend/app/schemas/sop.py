from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SOPStep(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str | None = None
    step_number: int | None = None
    title: str = Field(min_length=1, max_length=180)
    detail: str = Field(min_length=1, max_length=2000)
    owner: str = Field(default="Process Owner", max_length=100)
    expected_outcome: str | None = Field(default=None, max_length=500)
    verification: str | None = Field(default=None, max_length=500)


class SOPChecklistItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    label: str
    is_completed: bool = False


class ApprovalWorkflow(BaseModel):
    model_config = ConfigDict(extra="ignore")

    reviewer_role: str = "Operations Lead"
    approver_role: str = "Department Head"
    stage: str = "Initial Draft"
    status: str = "Pending Review"
    review_notes: str = "Review and sign-off after procedural verification."


class SOPDocument(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(min_length=1, max_length=180)
    department: str = Field(min_length=1, max_length=120)
    objective: str = Field(default="", max_length=1500)
    purpose: str = Field(min_length=1, max_length=4000)
    scope: str = Field(default="", max_length=2000)
    id: str = Field(min_length=1, max_length=80)
    prerequisites: list[str] = Field(default_factory=list)
    tools_and_materials: list[str] = Field(default_factory=list)
    roles: list[str] = Field(default_factory=list, max_length=12)
    steps: list[SOPStep] = Field(min_length=1, max_length=30)
    checklist: list[str] = Field(default_factory=list, max_length=40)
    checklistDone: list[bool] = Field(default_factory=list)
    checklist_items: list[SOPChecklistItem] = Field(default_factory=list)
    required_records: list[str] = Field(default_factory=list)
    risk_and_safety: str | None = None
    exception_handling: str | None = None
    escalation: str | None = None
    review_frequency: str = "Every 6 months"
    approval_workflow: ApprovalWorkflow | None = None
    industry: str | None = None
    audience: str | None = None
    complexity: str | None = "Medium"
    version: str = "1.0"
    status: Literal["draft", "review", "approved", "archived"] = "draft"
    source: Literal["gemini", "sample", "local-demo"] = "sample"
    record_id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class SOPGenerateRequest(BaseModel):
    process_name: str = Field(min_length=2, max_length=180)
    department: str = Field(default="Operations", min_length=1, max_length=120)
    objective: str = Field(default="", max_length=1000)
    description: str = Field(default="", max_length=2000)
    template_key: str = Field(default="onboarding", max_length=50)
    industry: str | None = Field(default=None, max_length=100)
    audience: str | None = Field(default=None, max_length=100)
    complexity: Literal["Low", "Medium", "High"] | None = "Medium"
    frequency: str | None = Field(default=None, max_length=100)
    policies: str | None = Field(default=None, max_length=500)
    additional_instructions: str | None = Field(default=None, max_length=1000)


class SOPUpdateRequest(BaseModel):
    sop: SOPDocument
    status: Literal["draft", "review", "approved", "archived"] | None = None


class DashboardStats(BaseModel):
    total_sops: int
    draft_count: int
    review_count: int
    approved_count: int
    by_department: dict[str, int]
    recent_activity: list[dict]


class HealthResponse(BaseModel):
    status: str
    service: str
    database: str
    ai_enabled: bool
    model: str
