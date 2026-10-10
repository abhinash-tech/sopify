export function formatDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatDateTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function buildSopText(sop) {
  if (!sop) return "";
  const lines = [
    "============================================================",
    "SOPIFY / ENTERPRISE STANDARD OPERATING PROCEDURE",
    "============================================================",
    `TITLE: ${sop.name || "Untitled Procedure"}`,
    `DOCUMENT ID: ${sop.id || "N/A"}`,
    `DEPARTMENT: ${sop.department || "Operations"}`,
    `STATUS: ${(sop.status || "draft").toUpperCase()}  |  VERSION: ${sop.version || "1.0"}`,
    sop.created_at ? `CREATED: ${formatDate(sop.created_at)}` : "",
    sop.updated_at ? `LAST MODIFIED: ${formatDateTime(sop.updated_at)}` : "",
    "",
    "--- OBJECTIVE ---",
    sop.objective || "Ensure standardized, repeatable execution.",
    "",
    "--- 01. PURPOSE & SCOPE ---",
    `PURPOSE: ${sop.purpose || "N/A"}`,
    sop.scope ? `SCOPE: ${sop.scope}` : "",
    "",
    ...(sop.prerequisites && sop.prerequisites.length > 0 ? [
      "--- PREREQUISITES ---",
      ...sop.prerequisites.map((p, idx) => `  ${idx + 1}. ${p}`),
      ""
    ] : []),
    ...(sop.tools_and_materials && sop.tools_and_materials.length > 0 ? [
      "--- REQUIRED TOOLS & MATERIALS ---",
      ...sop.tools_and_materials.map((t, idx) => `  ${idx + 1}. ${t}`),
      ""
    ] : []),
    ...(sop.roles && sop.roles.length > 0 ? [
      `--- KEY ROLES: ${sop.roles.join(", ")} ---`,
      ""
    ] : []),
    "--- 02. STEP-BY-STEP PROCEDURE ---",
    ...(sop.steps || []).flatMap((step, index) => [
      `STEP ${String(index + 1).padStart(2, "0")}: ${step.title} [Owner: ${step.owner || "Responsible Team"}]`,
      `  Instructions: ${step.detail}`,
      step.expected_outcome ? `  Expected Outcome: ${step.expected_outcome}` : "",
      step.verification ? `  Verification: ${step.verification}` : "",
      ""
    ]),
    "--- 03. COMPLETION CHECKLIST ---",
    ...(sop.checklist || []).map((item, index) => {
      const isDone = Array.isArray(sop.checklistDone) ? Boolean(sop.checklistDone[index]) : false;
      return `  [${isDone ? "X" : " "}] ${item}`;
    }),
    "",
    ...(sop.required_records && sop.required_records.length > 0 ? [
      "--- REQUIRED RECORDS & EVIDENCE ---",
      ...sop.required_records.map((r, idx) => `  ${idx + 1}. ${r}`),
      ""
    ] : []),
    ...(sop.risk_and_safety ? [
      "--- RISK & SAFETY CONSIDERATIONS ---",
      sop.risk_and_safety,
      ""
    ] : []),
    ...(sop.exception_handling ? [
      "--- EXCEPTION HANDLING ---",
      sop.exception_handling,
      ""
    ] : []),
    ...(sop.escalation ? [
      "--- ESCALATION PATH ---",
      sop.escalation,
      ""
    ] : []),
    "--- 04. PROPOSED APPROVAL WORKFLOW ---",
    `Reviewer Role: ${sop.approval_workflow?.reviewer_role || "Operations Reviewer"}`,
    `Approver Role: ${sop.approval_workflow?.approver_role || "Department Head"}`,
    `Workflow Stage: ${sop.approval_workflow?.stage || "Proposed Draft"}`,
    `Approval Status: ${sop.approval_workflow?.status || "Pending Review"}`,
    `Review Notes: ${sop.approval_workflow?.review_notes || "Subject to departmental sign-off."}`,
    `Review Frequency: ${sop.review_frequency || "Every 6 months"}`,
    "",
    "============================================================",
    "CONFIDENTIAL · INTERNAL USE ONLY · GENERATED WITH SOPIFY",
    "============================================================"
  ];
  return lines.filter((line) => line !== null && line !== undefined).join("\n");
}

export function downloadFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
