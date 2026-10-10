import { Fragment, useEffect, useRef, useState } from "react";
import { templates } from "../data/templates.js";
import { buildSopText, downloadFile, formatDate, formatDateTime } from "../utils/formatters.js";

export default function StudioWorkspace({
  currentSop,
  setCurrentSop,
  activeTemplate,
  setActiveTemplate,
  processName,
  setProcessName,
  department,
  setDepartment,
  objective,
  setObjective,
  description,
  setDescription,
  industry,
  setIndustry,
  audience,
  setAudience,
  complexity,
  setComplexity,
  frequency,
  setFrequency,
  policies,
  setPolicies,
  additionalInstructions,
  setAdditionalInstructions,
  onToast,
  onSaveSop,
  onGenerateSop,
  isGenerating,
  generationMode
}) {
  const [editMode, setEditMode] = useState(false);
  const [docScale, setDocScale] = useState("normal");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [backupSop, setBackupSop] = useState(null);
  const exportRef = useRef(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDone = (sop, index) =>
    Array.isArray(sop.checklistDone) ? Boolean(sop.checklistDone[index]) : index === 0;

  const updateField = (field, value) =>
    setCurrentSop((prev) => ({ ...prev, [field]: value }));

  const updateStep = (index, field, value) => {
    setCurrentSop((prev) => ({
      ...prev,
      steps: (prev.steps || []).map((step, i) => (i === index ? { ...step, [field]: value } : step))
    }));
  };

  const addStep = () => {
    const newStep = {
      id: `step-${(currentSop.steps || []).length + 1}`,
      step_number: (currentSop.steps || []).length + 1,
      title: "New procedural action",
      detail: "Describe specific instructions, operational logic, and expectations for this step.",
      owner: currentSop.roles?.[0] || "Process Owner",
      expected_outcome: "Specific measurable milestone achieved.",
      verification: "Verification check passed."
    };
    setCurrentSop((prev) => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
    onToast("New step added to procedure.");
  };

  const removeStep = (index) => {
    if ((currentSop.steps || []).length <= 1) {
      onToast("An SOP must contain at least one step.");
      return;
    }
    setCurrentSop((prev) => {
      const filtered = (prev.steps || []).filter((_, i) => i !== index);
      const renumbered = filtered.map((s, i) => ({ ...s, step_number: i + 1 }));
      return { ...prev, steps: renumbered };
    });
    onToast("Step removed.");
  };

  const moveStep = (index, direction) => {
    const steps = [...(currentSop.steps || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const temp = steps[index];
    steps[index] = steps[targetIndex];
    steps[targetIndex] = temp;
    const renumbered = steps.map((s, i) => ({ ...s, step_number: i + 1 }));
    setCurrentSop((prev) => ({ ...prev, steps: renumbered }));
  };

  const toggleChecklist = (index, checked) => {
    setCurrentSop((prev) => {
      const currentList = prev.checklist || [];
      const updatedDone = currentList.map((_, i) => (i === index ? checked : getDone(prev, i)));
      const updatedItems = (prev.checklist_items || []).map((item, i) =>
        i === index ? { ...item, is_completed: checked } : item
      );
      return {
        ...prev,
        checklistDone: updatedDone,
        checklist_items: updatedItems
      };
    });
  };

  const updateChecklistLabel = (index, newLabel) => {
    setCurrentSop((prev) => {
      const updatedChecklist = [...(prev.checklist || [])];
      updatedChecklist[index] = newLabel;
      const updatedItems = (prev.checklist_items || []).map((item, i) =>
        i === index ? { ...item, label: newLabel } : item
      );
      return {
        ...prev,
        checklist: updatedChecklist,
        checklist_items: updatedItems
      };
    });
  };

  const addChecklistItem = () => {
    const label = "New checklist verification item";
    setCurrentSop((prev) => ({
      ...prev,
      checklist: [...(prev.checklist || []), label],
      checklistDone: [...(prev.checklistDone || []), false],
      checklist_items: [
        ...(prev.checklist_items || []),
        { id: `chk-${Date.now()}`, label, is_completed: false }
      ]
    }));
    onToast("Checklist item added.");
  };

  const removeChecklistItem = (index) => {
    if ((currentSop.checklist || []).length <= 1) {
      onToast("Keep at least one checklist item.");
      return;
    }
    setCurrentSop((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).filter((_, i) => i !== index),
      checklistDone: (prev.checklistDone || []).filter((_, i) => i !== index),
      checklist_items: (prev.checklist_items || []).filter((_, i) => i !== index)
    }));
    onToast("Checklist item removed.");
  };

  const chooseTemplate = (key) => {
    const tpl = templates[key];
    if (!tpl) return;
    setActiveTemplate(key);
    setProcessName(tpl.name);
    setDepartment(tpl.department);
    setObjective(tpl.objective);
    setDescription(tpl.purpose);
    if (tpl.industry && setIndustry) setIndustry(tpl.industry);
    if (tpl.audience && setAudience) setAudience(tpl.audience);
    if (tpl.complexity && setComplexity) setComplexity(tpl.complexity);
    onToast(`${tpl.name} template loaded.`);
  };

  const handleStartEdit = () => {
    setBackupSop(structuredClone(currentSop));
    setEditMode(true);
    onToast("Edit mode active — click any text to modify.");
  };

  const handleFinishEdit = () => {
    setEditMode(false);
    setBackupSop(null);
    onToast("Edits applied to the document draft.");
  };

  const handleCancelEdit = () => {
    if (backupSop) {
      setCurrentSop(backupSop);
      setBackupSop(null);
    }
    setEditMode(false);
    onToast("Changes discarded.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!processName.trim()) {
      onToast("Please enter a process name.");
      return;
    }
    await onGenerateSop({
      process_name: processName.trim(),
      department: department.trim(),
      objective: objective.trim(),
      description: description.trim(),
      template_key: activeTemplate,
      industry: industry?.trim() || null,
      audience: audience?.trim() || null,
      complexity: complexity || "Medium",
      frequency: frequency?.trim() || null,
      policies: policies?.trim() || null,
      additional_instructions: additionalInstructions?.trim() || null
    });
  };

  const handleCopyFullText = async () => {
    const text = buildSopText(currentSop);
    try {
      await navigator.clipboard.writeText(text);
      onToast("Complete SOP text copied to clipboard.");
    } catch {
      onToast("Clipboard write permission unavailable.");
    }
    setExportOpen(false);
  };

  const handleDownloadTxt = () => {
    const text = buildSopText(currentSop);
    const filename = `${(currentSop.name || "sop").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    downloadFile(filename, text, "text/plain;charset=utf-8");
    onToast("Downloaded .txt document.");
    setExportOpen(false);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(currentSop, null, 2);
    const filename = `${(currentSop.name || "sop").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    downloadFile(filename, jsonStr, "application/json");
    onToast("Downloaded .json document.");
    setExportOpen(false);
  };

  const handlePrintPdf = () => {
    setExportOpen(false);
    onToast("Opening browser print dialog (select ‘Save as PDF’).");
    window.setTimeout(() => window.print(), 250);
  };

  const lastSavedText = currentSop.updated_at
    ? `UPDATED ${formatDateTime(currentSop.updated_at).toUpperCase()}`
    : currentSop.created_at
    ? `CREATED ${formatDateTime(currentSop.created_at).toUpperCase()}`
    : `DRAFT · ${formatDate().toUpperCase()}`;

  return (
    <section className="studio-section" id="studio">
      <div className="section-shell">
        <div className="studio-intro">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> SOPIFY WORKSPACE
            </div>
            <h2>
              Let's make it
              <br />
              <span className="headline-accent">repeatable.</span>
            </h2>
          </div>
          <div className="studio-intro-aside">
            <p>
              Describe any business procedure. SOPify structures it into an enterprise standard complete
              with steps, role responsibilities, checklist controls, and audit records.
            </p>
            <div className="prototype-note">
              <span className="prototype-dot" /> {generationMode}
            </div>
          </div>
        </div>

        <div className="workspace-layout">
          {/* STEP 01: FORM PANEL */}
          <aside className="workspace-form-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-step">STEP 01</span>
                <h3>Configure Procedure</h3>
              </div>
              <span className="panel-heading-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M4 19.5h16M6.5 16V5.5h11V16M9 9h6M9 12h6" />
                </svg>
              </span>
            </div>
            <p className="panel-description">
              Select an industry template or enter your own custom process details below.
            </p>

            <div className="template-picker" id="templates">
              <span className="field-label">PREDEFINED TEMPLATES (6)</span>
              <div className="template-chips">
                <button
                  className={`template-chip${activeTemplate === "onboarding" ? " active" : ""}`}
                  type="button"
                  onClick={() => chooseTemplate("onboarding")}
                >
                  <span>＋</span> Onboarding
                </button>
                <button
                  className={`template-chip${activeTemplate === "refund" ? " active" : ""}`}
                  type="button"
                  onClick={() => chooseTemplate("refund")}
                >
                  <span>＋</span> Refund
                </button>
                <button
                  className={`template-chip${activeTemplate === "incident" ? " active" : ""}`}
                  type="button"
                  onClick={() => chooseTemplate("incident")}
                >
                  <span>＋</span> Incident
                </button>
                <button
                  className={`template-chip${activeTemplate === "escalation" ? " active" : ""}`}
                  type="button"
                  onClick={() => chooseTemplate("escalation")}
                >
                  <span>＋</span> Escalation
                </button>
                <button
                  className={`template-chip${activeTemplate === "deployment" ? " active" : ""}`}
                  type="button"
                  onClick={() => chooseTemplate("deployment")}
                >
                  <span>＋</span> Deployment
                </button>
                <button
                  className={`template-chip${activeTemplate === "purchase" ? " active" : ""}`}
                  type="button"
                  onClick={() => chooseTemplate("purchase")}
                >
                  <span>＋</span> Procurement
                </button>
              </div>
            </div>

            <form id="sopForm" className="sop-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span className="field-label">
                  PROCESS NAME <em>*</em>
                </span>
                <input
                  id="processName"
                  name="processName"
                  value={processName}
                  required
                  maxLength={120}
                  placeholder="e.g. Employee Onboarding Procedure"
                  onChange={(e) => setProcessName(e.target.value)}
                />
              </label>

              <div className="form-row">
                <label className="form-field">
                  <span className="field-label">
                    DEPARTMENT / TEAM <em>*</em>
                  </span>
                  <select
                    id="department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option>Human Resources</option>
                    <option>Customer Support</option>
                    <option>Operations</option>
                    <option>Engineering & IT</option>
                    <option>Engineering & DevOps</option>
                    <option>Finance & Procurement</option>
                    <option>Sales & Marketing</option>
                    <option>Quality Assurance</option>
                    <option>Legal & Compliance</option>
                  </select>
                </label>
              </div>

              <label className="form-field">
                <span className="field-label">
                  PRIMARY OBJECTIVE <em>*</em>
                </span>
                <textarea
                  id="objective"
                  name="objective"
                  rows="2"
                  maxLength={350}
                  placeholder="What is the clear goal or definition of success?"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                />
              </label>

              <label className="form-field">
                <span className="field-label">BUSINESS CONTEXT / DESCRIPTION</span>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  maxLength={500}
                  placeholder="Provide background context, trigger events, or scope boundaries."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              {/* Advanced Parameters Accordion */}
              <button
                type="button"
                className="advanced-options-toggle"
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                <span>{showAdvanced ? "▾ Hide generation options" : "▸ Advanced options & constraints"}</span>
                <span style={{ fontSize: "11px", color: "var(--red)" }}>
                  {showAdvanced ? "Collapse" : "Industry, Audience, Detail"}
                </span>
              </button>

              {showAdvanced && (
                <div className="advanced-options-panel">
                  <div className="form-row-2">
                    <label className="form-field">
                      <span className="field-label">INDUSTRY</span>
                      <input
                        placeholder="e.g. SaaS, Fintech, Healthcare"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </label>
                    <label className="form-field">
                      <span className="field-label">TARGET AUDIENCE</span>
                      <input
                        placeholder="e.g. On-call Engineers, Team Leads"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="form-row-2">
                    <label className="form-field">
                      <span className="field-label">DETAIL COMPLEXITY</span>
                      <select
                        value={complexity}
                        onChange={(e) => setComplexity(e.target.value)}
                      >
                        <option value="Low">Low (Simple)</option>
                        <option value="Medium">Medium (Standard)</option>
                        <option value="High">High (Comprehensive)</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="field-label">FREQUENCY</span>
                      <input
                        placeholder="e.g. Weekly, Per Incident, Daily"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      />
                    </label>
                  </div>

                  <label className="form-field">
                    <span className="field-label">GOVERNING POLICIES / CONSTRAINTS</span>
                    <input
                      placeholder="e.g. SOC2, ISO27001, internal Net-30 payment rule"
                      value={policies}
                      onChange={(e) => setPolicies(e.target.value)}
                    />
                  </label>

                  <label className="form-field">
                    <span className="field-label">SPECIAL INSTRUCTIONS</span>
                    <textarea
                      rows="2"
                      placeholder="e.g. Include emergency contact escalation if SLAs breached"
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                    />
                  </label>
                </div>
              )}

              <div className="form-footer">
                <span className="required-hint">
                  <span className="required-star">*</span> Required fields
                </span>
                <button
                  className="button button-primary generate-button"
                  type="submit"
                  id="generateButton"
                  disabled={isGenerating}
                >
                  <span className="generate-icon">✦</span>{" "}
                  {isGenerating ? "Structuring with AI…" : "Generate SOP"}{" "}
                  <span className="button-arrow">{isGenerating ? "···" : "↗"}</span>
                </button>
              </div>
            </form>
          </aside>

          {/* STEP 02: PREVIEW PANEL */}
          <section className="workspace-preview-panel" aria-label="Generated SOP preview">
            <div className="preview-toolbar">
              <div className="preview-toolbar-title">
                <span className="live-dot" />
                <span>PROCEDURE DOCUMENT</span>
                <span className={`badge-status badge-${currentSop.status || "draft"}`}>
                  {currentSop.status || "draft"}
                </span>
              </div>

              <div className="preview-actions">
                {/* Font Scaling */}
                <div className="font-scale-control" aria-label="Adjust font size">
                  <span className="font-scale-label">Text</span>
                  <button
                    type="button"
                    className={`font-scale-btn${docScale === "normal" ? " active" : ""}`}
                    title="Normal font size"
                    onClick={() => setDocScale("normal")}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    className={`font-scale-btn${docScale === "large" ? " active" : ""}`}
                    title="Large font size"
                    onClick={() => setDocScale("large")}
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    className={`font-scale-btn${docScale === "xlarge" ? " active" : ""}`}
                    title="Extra large font size"
                    onClick={() => setDocScale("xlarge")}
                  >
                    A++
                  </button>
                </div>

                {/* Edit Mode Buttons */}
                {!editMode ? (
                  <button
                    className="icon-action"
                    id="editSopButton"
                    type="button"
                    title="Edit SOP content"
                    onClick={handleStartEdit}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="m14.5 5.5 4 4M4 20l4.5-1 10-10a2.12 2.12 0 0 0-3-3l-10 10L4 20Z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                ) : (
                  <>
                    <button
                      className="icon-action active"
                      type="button"
                      title="Apply changes"
                      onClick={handleFinishEdit}
                    >
                      <span>✓ Done</span>
                    </button>
                    <button
                      className="icon-action"
                      type="button"
                      title="Discard edits"
                      onClick={handleCancelEdit}
                      style={{ color: "#a4343a" }}
                    >
                      <span>Cancel</span>
                    </button>
                  </>
                )}

                {/* Copy Text */}
                <button
                  className="icon-action"
                  id="copySopButton"
                  type="button"
                  title="Copy formatted text"
                  onClick={handleCopyFullText}
                >
                  <svg viewBox="0 0 24 24">
                    <rect x="8" y="8" width="11" height="12" rx="1.5" />
                    <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v10A1.5 1.5 0 0 0 5.5 17H8" />
                  </svg>
                  <span>Copy</span>
                </button>

                {/* Export Dropdown */}
                <div className="export-dropdown" ref={exportRef}>
                  <button
                    className="icon-action"
                    id="exportButton"
                    type="button"
                    title="Export options"
                    onClick={() => setExportOpen((prev) => !prev)}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 3v11m-4-4 4 4 4-4M5 17v3h14v-3" />
                    </svg>
                    <span>Export ▾</span>
                  </button>

                  {exportOpen && (
                    <div className="export-menu no-print">
                      <button
                        type="button"
                        className="export-menu-item"
                        onClick={handlePrintPdf}
                      >
                        🖨 Print / Save as PDF
                      </button>
                      <button
                        type="button"
                        className="export-menu-item"
                        onClick={handleDownloadTxt}
                      >
                        📄 Download .TXT
                      </button>
                      <button
                        type="button"
                        className="export-menu-item"
                        onClick={handleDownloadJson}
                      >
                        { } Download .JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DOCUMENT BODY */}
            <div className="sop-document" id="sopDocument" data-scale={docScale}>
              {/* Header block */}
              <div className="sop-document-header">
                <div className="sop-document-brand">
                  <span className="tiny-brand-mark">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span>
                    SOPIFY <i>/ {currentSop.department?.toUpperCase() || "ENTERPRISE"}</i>
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <select
                    className="status-select no-print"
                    value={currentSop.status || "draft"}
                    onChange={(e) => updateField("status", e.target.value)}
                    title="Update workflow status"
                  >
                    <option value="draft">Status: Draft</option>
                    <option value="review">Status: In Review</option>
                    <option value="approved">Status: Approved</option>
                    <option value="archived">Status: Archived</option>
                  </select>
                  <span className="sop-version">
                    V{currentSop.version || "1.0"} <span>•</span> {lastSavedText}
                  </span>
                </div>
              </div>

              {/* Title Block */}
              <div className="sop-document-title-block">
                <div className="document-eyebrow">STANDARD OPERATING PROCEDURE</div>
                <h3
                  id="sopTitle"
                  className="editable-title"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) => updateField("name", e.currentTarget.innerText.trim())}
                  spellCheck={editMode}
                >
                  {currentSop.name}
                </h3>
                <p
                  id="sopObjective"
                  className="editable-copy"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) => updateField("objective", e.currentTarget.innerText.trim())}
                  spellCheck={editMode}
                >
                  {currentSop.objective}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="sop-meta-grid">
                <div>
                  <span>PROCESS OWNER</span>
                  <b
                    id="sopOwner"
                    className="editable-copy"
                    contentEditable={editMode}
                    suppressContentEditableWarning
                    onBlur={(e) => updateField("department", e.currentTarget.innerText.trim())}
                  >
                    {currentSop.department}
                  </b>
                </div>
                <div>
                  <span>DOCUMENT ID</span>
                  <b id="sopId">{currentSop.id}</b>
                </div>
                <div>
                  <span>REVIEW CYCLE</span>
                  <b
                    className="editable-copy"
                    contentEditable={editMode}
                    suppressContentEditableWarning
                    onBlur={(e) => updateField("review_frequency", e.currentTarget.innerText.trim())}
                  >
                    {currentSop.review_frequency || "Every 6 months"}
                  </b>
                </div>
              </div>

              {/* SECTION 01: Purpose & Scope */}
              <div className="sop-content-section">
                <div className="sop-section-heading">
                  <span>01</span>
                  <h4>Purpose &amp; Scope</h4>
                </div>
                <p
                  id="sopPurpose"
                  className="editable-copy"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  onBlur={(e) => updateField("purpose", e.currentTarget.innerText.trim())}
                  spellCheck={editMode}
                >
                  {currentSop.purpose}
                </p>
                {currentSop.scope && (
                  <p
                    style={{ marginTop: "10px", fontSize: "14px", color: "#6e645e" }}
                    className="editable-copy"
                    contentEditable={editMode}
                    suppressContentEditableWarning
                    onBlur={(e) => updateField("scope", e.currentTarget.innerText.trim())}
                    spellCheck={editMode}
                  >
                    <strong>Scope:</strong> {currentSop.scope}
                  </p>
                )}
              </div>

              {/* SECTION 02: Prerequisites & Tools */}
              {(Boolean(currentSop.prerequisites?.length) || Boolean(currentSop.tools_and_materials?.length)) && (
                <div className="sop-content-section">
                  <div className="sop-section-heading">
                    <span>02</span>
                    <h4>Prerequisites &amp; Required Tools</h4>
                  </div>
                  <div className="prereq-tools-grid">
                    <div>
                      <b style={{ fontSize: "12px", color: "#8a7e78", letterSpacing: ".06em" }}>
                        PREREQUISITE CONDITIONS
                      </b>
                      <div className="tag-list">
                        {(currentSop.prerequisites || []).map((req, idx) => (
                          <span className="tag-chip" key={idx}>
                            • {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <b style={{ fontSize: "12px", color: "#8a7e78", letterSpacing: ".06em" }}>
                        SYSTEMS &amp; MATERIALS
                      </b>
                      <div className="tag-list">
                        {(currentSop.tools_and_materials || []).map((tool, idx) => (
                          <span className="tag-chip" key={idx}>
                            ⚙ {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 03: Roles */}
              {Boolean(currentSop.roles?.length) && (
                <div className="sop-content-section">
                  <div className="sop-section-heading">
                    <span>03</span>
                    <h4>Roles &amp; Responsibilities</h4>
                  </div>
                  <div className="tag-list">
                    {(currentSop.roles || []).map((role, idx) => (
                      <span
                        key={idx}
                        className="tag-chip"
                        style={{ background: "#fbf3f1", borderColor: "#e4cec9", color: "#8b2e34", fontWeight: "650" }}
                      >
                        👤 {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 04: Step-by-Step Procedure */}
              <div className="sop-content-section">
                <div className="sop-section-heading" style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>04</span>
                    <h4>Step-by-Step Procedure</h4>
                  </div>
                  {editMode && (
                    <button
                      type="button"
                      className="btn-add-row no-print"
                      onClick={addStep}
                    >
                      ＋ Add Step
                    </button>
                  )}
                </div>

                <div className="procedure-container" id="procedureList">
                  {(currentSop.steps || []).map((step, index) => (
                    <div className="step-item-card" key={step.id || `step-${index}`}>
                      <div className="step-header-row">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span className="procedure-num">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <b
                            className="editable-copy"
                            contentEditable={editMode}
                            suppressContentEditableWarning
                            onBlur={(e) => updateStep(index, "title", e.currentTarget.innerText.trim())}
                            spellCheck={editMode}
                            style={{ fontSize: "15px", color: "#282320" }}
                          >
                            {step.title}
                          </b>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            className="procedure-owner editable-copy"
                            contentEditable={editMode}
                            suppressContentEditableWarning
                            onBlur={(e) => updateStep(index, "owner", e.currentTarget.innerText.trim())}
                          >
                            {step.owner || "Process Owner"}
                          </span>

                          {editMode && (
                            <div className="step-controls no-print">
                              <button
                                type="button"
                                className="step-control-btn"
                                onClick={() => moveStep(index, -1)}
                                title="Move up"
                                disabled={index === 0}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="step-control-btn"
                                onClick={() => moveStep(index, 1)}
                                title="Move down"
                                disabled={index === (currentSop.steps || []).length - 1}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className="step-control-btn btn-danger"
                                onClick={() => removeStep(index)}
                                title="Delete step"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p
                        className="editable-copy"
                        contentEditable={editMode}
                        suppressContentEditableWarning
                        onBlur={(e) => updateStep(index, "detail", e.currentTarget.innerText.trim())}
                        spellCheck={editMode}
                        style={{ margin: "6px 0 0", color: "#564e49", fontSize: "14px", lineHeight: "1.65" }}
                      >
                        {step.detail}
                      </p>

                      {(step.expected_outcome || step.verification || editMode) && (
                        <div className="step-meta-row">
                          <div className="step-meta-item">
                            <span className="step-meta-label">EXPECTED OUTCOME</span>
                            <span
                              className="editable-copy"
                              contentEditable={editMode}
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                updateStep(index, "expected_outcome", e.currentTarget.innerText.trim())
                              }
                            >
                              {step.expected_outcome || "Execution confirmed."}
                            </span>
                          </div>
                          <div className="step-meta-item">
                            <span className="step-meta-label">VERIFICATION METHOD</span>
                            <span
                              className="editable-copy"
                              contentEditable={editMode}
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                updateStep(index, "verification", e.currentTarget.innerText.trim())
                              }
                            >
                              {step.verification || "Inspect output metrics."}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 05: Checklist & Approvals Grid */}
              <div className="sop-bottom-grid">
                {/* Checklist */}
                <div className="sop-content-section checklist-section">
                  <div className="sop-section-heading" style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span>05</span>
                      <h4>Completion Checklist</h4>
                    </div>
                    {editMode && (
                      <button
                        type="button"
                        className="btn-add-row no-print"
                        onClick={addChecklistItem}
                        style={{ fontSize: "11px", padding: "4px 8px" }}
                      >
                        ＋ Add Item
                      </button>
                    )}
                  </div>

                  <div className="checklist-items" id="checklistItems">
                    {(currentSop.checklist || []).map((item, index) => (
                      <div className="checklist-item-row" key={index}>
                        <label className="check-item" style={{ flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={getDone(currentSop, index)}
                            onChange={(e) => toggleChecklist(index, e.target.checked)}
                          />
                          <span className="custom-check">✓</span>
                          <span
                            className="editable-copy"
                            contentEditable={editMode}
                            suppressContentEditableWarning
                            onBlur={(e) => updateChecklistLabel(index, e.currentTarget.innerText.trim())}
                          >
                            {item}
                          </span>
                        </label>
                        {editMode && (
                          <button
                            type="button"
                            className="btn-del-check no-print"
                            onClick={() => removeChecklistItem(index)}
                            title="Remove item"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approval Flow Proposal */}
                <div className="sop-content-section approval-section">
                  <div className="sop-section-heading">
                    <span>06</span>
                    <h4>Proposed Approval Flow</h4>
                  </div>
                  <div className="approval-flow">
                    {(currentSop.roles || []).map((role, index) => (
                      <Fragment key={index}>
                        {index > 0 && <i>→</i>}
                        <span>{role}</span>
                      </Fragment>
                    ))}
                  </div>

                  <div className="approval-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <b style={{ fontSize: "13px", color: "#362e2a" }}>
                        Governance Protocol
                      </b>
                      <span className="badge-status badge-draft" style={{ fontSize: "10px" }}>
                        {currentSop.approval_workflow?.status || "Pending Sign-off"}
                      </span>
                    </div>

                    <div className="approval-grid-details">
                      <div>
                        <span>REVIEWER ROLE</span>
                        <b>{currentSop.approval_workflow?.reviewer_role || "Department Lead"}</b>
                      </div>
                      <div>
                        <span>APPROVER ROLE</span>
                        <b>{currentSop.approval_workflow?.approver_role || "Operations Head"}</b>
                      </div>
                      <div>
                        <span>STAGE</span>
                        <b>{currentSop.approval_workflow?.stage || "Standardization"}</b>
                      </div>
                    </div>

                    {currentSop.approval_workflow?.review_notes && (
                      <p style={{ margin: "10px 0 0", fontSize: "12.5px", color: "#746964", fontStyle: "italic" }}>
                        Note: {currentSop.approval_workflow.review_notes}
                      </p>
                    )}
                  </div>
                  <p className="approval-disclaimer">
                    Demonstrative approval proposal for hackathon demonstration. Real organizational compliance requires formal operational sign-off.
                  </p>
                </div>
              </div>

              {/* SECTION 07: Required Records & Audit Evidence */}
              {Boolean(currentSop.required_records?.length) && (
                <div className="sop-content-section">
                  <div className="sop-section-heading">
                    <span>07</span>
                    <h4>Required Records &amp; Audit Evidence</h4>
                  </div>
                  <div className="records-list">
                    {currentSop.required_records.map((rec, idx) => (
                      <div className="record-item" key={idx}>
                        <span className="record-item-icon">🗂</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 08: Risks, Exceptions & Escalation */}
              {(currentSop.risk_and_safety || currentSop.exception_handling || currentSop.escalation) && (
                <div className="sop-content-section">
                  <div className="sop-section-heading">
                    <span>08</span>
                    <h4>Risks, Exceptions &amp; Escalation</h4>
                  </div>
                  <div className="risk-exception-grid">
                    {currentSop.risk_and_safety && (
                      <div className="callout-box risk-box">
                        <b>⚠️ RISK &amp; SAFETY SAFEGUARDS</b>
                        <p>{currentSop.risk_and_safety}</p>
                      </div>
                    )}
                    {currentSop.exception_handling && (
                      <div className="callout-box">
                        <b>⚡ EXCEPTION HANDLING</b>
                        <p>{currentSop.exception_handling}</p>
                      </div>
                    )}
                    {currentSop.escalation && (
                      <div className="callout-box escalation-box" style={{ gridColumn: "1 / -1" }}>
                        <b>🚨 ESCALATION PROTOCOL</b>
                        <p>{currentSop.escalation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Footer */}
              <div className="sop-document-footer">
                <span>CONFIDENTIAL · INTERNAL ENTERPRISE USE ONLY</span>
                <span>
                  CREATED WITH SOPIFY <b>↗</b>
                </span>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="preview-bottom no-print">
              <span>
                <span className="preview-bottom-dot" /> Your draft is saved in active session
              </span>
              <button
                id="saveSopButton"
                className="save-button"
                type="button"
                onClick={onSaveSop}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M5 4h12l2 2v14H5z" />
                  <path d="M8 4v5h8V4M8 20v-7h8v7" />
                </svg>{" "}
                Save to Database
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
