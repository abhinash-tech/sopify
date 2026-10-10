export const templates = {
  onboarding: {
    key: "onboarding",
    name: "Employee Onboarding Procedure",
    department: "Human Resources",
    objective: "Establish a standardized, high-touch onboarding experience from offer acceptance through the initial 90 days.",
    purpose: "This procedure establishes a consistent onboarding experience from offer acceptance through the employee's initial 90 days. This procedure ensures regulatory compliance, timely IT provisioning, and structured team orientation.",
    scope: "Applies to all full-time, part-time, and contract hires across all operating departments.",
    id: "SOP-HR-101",
    industry: "Corporate / Technology",
    audience: "HR Specialists, Hiring Managers, IT Support",
    complexity: "Medium",
    prerequisites: ["Signed offer letter on file", "Completed background verification", "Confirmed start date and reporting location"],
    tools_and_materials: ["HR Information System (HRIS)", "Identity & Access Management portal", "Hardware inventory catalog", "Digital welcome packet"],
    roles: ["HR Coordinator", "IT Administrator", "Hiring Manager", "People Operations"],
    steps: [
      {
        id: "step-1",
        step_number: 1,
        title: "Pre-boarding administrative setup",
        detail: "Collect emergency contact details, tax compliance forms, and direct deposit information. Create the employee record in the HRIS.",
        owner: "HR Coordinator",
        expected_outcome: "Complete employee profile generated with verified compliance documentation.",
        verification: "Check HRIS profile completeness indicator at 100%."
      },
      {
        id: "step-2",
        step_number: 2,
        title: "Hardware and digital access provisioning",
        detail: "Configure laptop with standard security profiles, multi-factor authentication, email account, and role-based software licenses.",
        owner: "IT Administrator",
        expected_outcome: "Equipment dispatched or placed at workstation with functional single sign-on credentials.",
        verification: "Test login authentication and verify device management enrollment."
      },
      {
        id: "step-3",
        step_number: 3,
        title: "Day-one orientation and company overview",
        detail: "Conduct introduction session covering company values, safety policies, operational hours, and benefits enrollment timelines.",
        owner: "HR Coordinator",
        expected_outcome: "New hire completes orientation checklist and gains access to corporate communications.",
        verification: "Collect signed employee handbook acknowledgment."
      },
      {
        id: "step-4",
        step_number: 4,
        title: "Team immersion and 30-day objective alignment",
        detail: "Introduce team members, designate an onboarding mentor, and review key responsibilities and deliverables for the first month.",
        owner: "Hiring Manager",
        expected_outcome: "Mutually agreed 30-day success milestones recorded in writing.",
        verification: "Document initial 1-on-1 discussion notes in the performance portal."
      },
      {
        id: "step-5",
        step_number: 5,
        title: "Initial 30-day review and feedback check-in",
        detail: "Schedule formal progress review to address early friction points, assess workload balance, and confirm benefit enrollment status.",
        owner: "People Operations",
        expected_outcome: "Structured feedback captured and retention milestones reinforced.",
        verification: "Completed 30-day check-in survey archived in employee record."
      }
    ],
    checklist: [
      "Signed offer letter and identity documents verified",
      "HRIS record created and direct deposit details linked",
      "Hardware configured, encrypted, and delivered",
      "Single sign-on accounts and role permissions provisioned",
      "Welcome email and first-day agenda sent to employee",
      "Employee handbook acknowledgment received",
      "30-day milestone review scheduled with manager"
    ],
    checklistDone: [true, false, false, false, false, false, false],
    required_records: ["Signed employment agreement", "Government tax withholding certificates", "Asset handover receipt", "Handbook acknowledgment form"],
    risk_and_safety: "Protect employee Personally Identifiable Information (PII) during transfer. Ensure full disk encryption on provisioned hardware.",
    exception_handling: "If identity verification documents are delayed, restrict sensitive operational system access until verified by HR leadership.",
    escalation: "Escalate provisioning blockers to IT Support Lead if credentials are not ready 24 hours prior to the start date.",
    review_frequency: "Every 6 months",
    approval_workflow: {
      reviewer_role: "HR Operations Lead",
      approver_role: "Head of People",
      stage: "Active Standard",
      status: "Approved",
      review_notes: "Annual revision incorporating remote onboarding hardware workflow."
    }
  },
  refund: {
    key: "refund",
    name: "Customer Refund Processing",
    department: "Customer Support",
    objective: "Standardize the intake, verification, approval, and settlement of customer refund requests to ensure equitable resolution.",
    purpose: "Standardize the intake, verification, approval, and settlement of customer refund requests to ensure equitable resolution, prevent revenue leakage, and preserve brand loyalty.",
    scope: "Covers all digital and physical product refund claims submitted within or outside standard policy windows.",
    id: "SOP-CS-102",
    industry: "E-Commerce / Consumer Tech",
    audience: "Support Representatives, Billing Specialists, Finance Leads",
    complexity: "Medium",
    prerequisites: ["Active customer order ID", "Written refund request or dispute ticket", "Proof of payment or transaction ID"],
    tools_and_materials: ["CRM / Ticketing platform (Zendesk / Intercom)", "Payment Gateway / Merchant processor", "Order Management System", "Customer Ledger"],
    roles: ["Support Specialist", "Billing Specialist", "Finance Lead", "Support Manager"],
    steps: [
      {
        id: "step-1",
        step_number: 1,
        title: "Inbound intake and ticket logging",
        detail: "Acknowledge customer communication within 4 hours, verify purchase receipt, and record order ID, transaction amount, and refund rationale.",
        owner: "Support Specialist",
        expected_outcome: "Ticket categorized under 'Billing / Refund' with all relevant metadata populated.",
        verification: "Confirm customer account and order match in the payment gateway."
      },
      {
        id: "step-2",
        step_number: 2,
        title: "Eligibility and warranty validation",
        detail: "Evaluate request against standard 30-day satisfaction policy, return shipment receipt, or verified service outage logs.",
        owner: "Support Specialist",
        expected_outcome: "Initial eligibility decision documented with policy citation.",
        verification: "Ensure return tracking number indicates warehouse receipt if physical return."
      },
      {
        id: "step-3",
        step_number: 3,
        title: "Financial authorization and gateway processing",
        detail: "For eligible claims under $250, initiate gateway reversal directly; route claims exceeding $250 to Finance Lead for secondary sign-off.",
        owner: "Billing Specialist",
        expected_outcome: "Gateway transaction status changed to 'Refund Initiated' or 'Credited'.",
        verification: "Capture settlement transaction reference and timestamp in ticket."
      },
      {
        id: "step-4",
        step_number: 4,
        title: "Customer confirmation and ticket closure",
        detail: "Issue formal notification email detailing refund amount, last 4 digits of destination payment card, and standard bank settlement timeline (3-5 business days).",
        owner: "Support Specialist",
        expected_outcome: "Customer notified with clear expectations regarding card issuer posting time.",
        verification: "Customer acknowledgment received or ticket auto-resolved following delivery."
      }
    ],
    checklist: [
      "Order ID and transaction proof verified in merchant gateway",
      "Refund rationale categorized (defect, delay, unauthorized, satisfaction)",
      "Return tracking validated if physical goods involved",
      "Tiered authorization approved (Tier 1 vs Tier 2 approval threshold)",
      "Payment processor refund ID recorded in CRM",
      "Confirmation email dispatched with banking timeline"
    ],
    checklistDone: [true, false, false, false, false, false],
    required_records: ["Merchant transaction receipt", "Support ticket interaction history", "Return merchandise authorization (RMA) slip", "Finance refund batch log"],
    risk_and_safety: "Mitigate chargeback disputes by processing legitimate claims swiftly. Prevent payment card fraud by only refunding to original payment method.",
    exception_handling: "If original payment method is canceled or expired, coordinate with Finance Lead to issue store credit or verified bank wire.",
    escalation: "Escalate disputed charges exceeding $500 or active chargeback threats to Support Manager immediately.",
    review_frequency: "Quarterly",
    approval_workflow: {
      reviewer_role: "Customer Experience Supervisor",
      approver_role: "Finance Controller",
      stage: "Standard Operating Procedure",
      status: "Approved",
      review_notes: "Updated for payment gateway chargeback mitigation protocols."
    }
  },
  incident: {
    key: "incident",
    name: "Severity 1 & 2 Incident Response Procedure",
    department: "Engineering & IT",
    objective: "Rapid detection, triage, containment, and resolution of critical service degradations or security incidents.",
    purpose: "Guide engineering, operations, and support teams through rapid detection, triage, containment, and resolution of critical service degradations or security incidents.",
    scope: "Applies to critical production outages, data security events, and tier-1 vendor infrastructure disruptions.",
    id: "SOP-ENG-103",
    industry: "Cloud Infrastructure / Software Engineering",
    audience: "On-call Engineers, Incident Commanders, Engineering Leadership",
    complexity: "High",
    prerequisites: ["Automated monitoring alert or customer outage report", "Incident severity matrix", "On-call rotation schedule"],
    tools_and_materials: ["Incident management portal", "Dedicated incident conference bridge", "System observability dashboards (Datadog/Grafana)", "Public Statuspage"],
    roles: ["Incident Commander", "Technical Response Lead", "Communications Officer", "Postmortem Facilitator"],
    steps: [
      {
        id: "step-1",
        step_number: 1,
        title: "Incident declaration and role assignment",
        detail: "Declare incident state in collaboration channel, appoint Incident Commander, establish war room bridge, and define severity level (SEV-1 / SEV-2).",
        owner: "Incident Commander",
        expected_outcome: "Clear leadership established and responders gathered on designated channel.",
        verification: "Incident log entry created and on-call engineers joined bridge."
      },
      {
        id: "step-2",
        step_number: 2,
        title: "Customer and internal stakeholder communication",
        detail: "Publish initial notification on public status page within 15 minutes of declaration and send executive summary to operational leadership.",
        owner: "Communications Officer",
        expected_outcome: "Consistent messaging disseminated without disclosing confidential vulnerabilities.",
        verification: "Public status page updated with investigation status."
      },
      {
        id: "step-3",
        step_number: 3,
        title: "Diagnostic investigation and containment",
        detail: "Analyze telemetry, inspect recent deployment commits, and execute containment actions (e.g. rollback, traffic reroute, feature flag disable).",
        owner: "Technical Response Lead",
        expected_outcome: "Immediate mitigation implemented to stop bleeding and restore customer access.",
        verification: "Error rates and latency return within operational SLA thresholds."
      },
      {
        id: "step-4",
        step_number: 4,
        title: "Verification of service recovery",
        detail: "Validate end-to-end user transactions across synthetic test suites and confirm error rate stabilization for minimum 30 consecutive minutes.",
        owner: "Technical Response Lead",
        expected_outcome: "Service functionality confirmed stable under active production load.",
        verification: "Monitoring metrics confirm 99.9% success rate on synthetic health checks."
      },
      {
        id: "step-5",
        step_number: 5,
        title: "Resolution announcement and blameless postmortem",
        detail: "Close incident bridge, issue resolution notice on status page, and schedule blameless postmortem within 48 hours to document root cause.",
        owner: "Postmortem Facilitator",
        expected_outcome: "Action items assigned to Jira and permanent safeguards integrated into sprint backlog.",
        verification: "Completed root cause analysis document published to engineering wiki."
      }
    ],
    checklist: [
      "Incident Commander appointed and active bridge established",
      "Initial status page broadcast published within 15 minutes",
      "Recent production rollouts and configuration changes audited",
      "Mitigation strategy deployed (rollback, rate-limit, failover)",
      "System metrics observed stable for 30 consecutive minutes",
      "Resolution notification communicated to stakeholders",
      "Blameless retrospective scheduled with engineering owners"
    ],
    checklistDone: [true, false, false, false, false, false, false],
    required_records: ["Incident war room chat transcript", "Observability telemetry snapshots", "System changelog diff", "Formal postmortem root-cause document"],
    risk_and_safety: "Prevent cascading failures during remediation by enforcing staged rollout of emergency patches.",
    exception_handling: "If primary failover cluster is unreachable, activate cold disaster recovery site under Incident Commander authorization.",
    escalation: "Escalate to Chief Technology Officer if customer-impacting outage exceeds 45 minutes without identified mitigation path.",
    review_frequency: "Quarterly",
    approval_workflow: {
      reviewer_role: "Director of Infrastructure",
      approver_role: "VP of Engineering",
      stage: "Production Standard",
      status: "Approved",
      review_notes: "Annual update with automated cloud failover and telemetry benchmarks."
    }
  },
  escalation: {
    key: "escalation",
    name: "Customer Support Escalation Procedure",
    department: "Customer Support",
    objective: "Provide a streamlined pathway for escalating unresolved customer issues, complex technical bugs, and high-value account disputes.",
    purpose: "Provide a streamlined pathway for escalating unresolved customer issues, complex technical bugs, and high-value account disputes to specialized resolving teams.",
    scope: "Applies to tickets exceeding Tier 1 resolution authority or technical troubleshooting thresholds.",
    id: "SOP-CS-104",
    industry: "SaaS / Customer Experience",
    audience: "Tier 1 Support, Tier 2 Specialists, Support Supervisors",
    complexity: "Medium",
    prerequisites: ["Unresolved frontline ticket with diagnostic history", "Reproduction steps or error logs", "Customer impact tier assessment"],
    tools_and_materials: ["Ticketing system with SLA tracking", "Knowledge base documentation", "Internal bug tracking board", "Internal communication hub"],
    roles: ["Tier 1 Representative", "Tier 2 Technical Specialist", "Support Escalation Manager", "Product Lead"],
    steps: [
      {
        id: "step-1",
        step_number: 1,
        title: "Frontline diagnostic synthesis and triage",
        detail: "Document browser version, device info, exact error codes, network headers, and customer impact level in internal ticket notes.",
        owner: "Tier 1 Representative",
        expected_outcome: "Comprehensive escalation package created with all tier 1 steps attempted.",
        verification: "Review that required escalation fields are completed before transfer."
      },
      {
        id: "step-2",
        step_number: 2,
        title: "Ticket handoff and customer expectation setting",
        detail: "Assign ticket to Tier 2 queue, notify customer that technical specialist is investigating, and state next update window within 4 hours.",
        owner: "Tier 1 Representative",
        expected_outcome: "Customer reassured and ticket accurately routed without delay.",
        verification: "Automated SLA timer updated to reflection escalation tier."
      },
      {
        id: "step-3",
        step_number: 3,
        title: "Deep diagnostic analysis and engineering liaison",
        detail: "Replicate issue in staging environment, inspect backend application logs, and link or file engineering defect if root cause is software bug.",
        owner: "Tier 2 Technical Specialist",
        expected_outcome: "Actionable bug ticket created or operational workaround provided.",
        verification: "Jira issue linked to customer support ticket with reproduction video/logs."
      },
      {
        id: "step-4",
        step_number: 4,
        title: "Solution delivery and closed-loop validation",
        detail: "Deliver verified resolution or clear workaround to customer, test customer confirmation, and log root-cause category in support analytics.",
        owner: "Tier 2 Technical Specialist",
        expected_outcome: "Customer problem verified resolved and satisfaction confirmed.",
        verification: "Customer explicit confirmation received in ticket thread."
      }
    ],
    checklist: [
      "Customer identity and account tier verified",
      "Troubleshooting steps and browser logs documented internally",
      "Customer informed of transfer with realistic update window",
      "Tier 2 queue assignment confirmed within SLA threshold",
      "Defect ticket linked with engineering if platform bug",
      "Customer confirmation received prior to resolution marking"
    ],
    checklistDone: [true, false, false, false, false, false],
    required_records: ["Diagnostic screenshots and session replay links", "Network console logs", "Engineering defect reference number", "Customer CSAT rating"],
    risk_and_safety: "Never expose internal engineering dialogue or raw API tokens to external customer tickets.",
    exception_handling: "If issue affects enterprise accounts with strict SLAs, notify Escalation Manager to initiate direct customer conference bridge.",
    escalation: "Escalate to Support Director if ticket remains unresolved across 2 consecutive business days.",
    review_frequency: "Every 6 months",
    approval_workflow: {
      reviewer_role: "Support Operations Manager",
      approver_role: "Head of Customer Experience",
      stage: "Standard Operating Procedure",
      status: "Approved",
      review_notes: "Synchronized with current enterprise account SLAs."
    }
  },
  deployment: {
    key: "deployment",
    name: "Production Software Deployment & Release Procedure",
    department: "Engineering & DevOps",
    objective: "Define the structured pipeline for testing, approving, and deploying software updates to production environments with zero downtime.",
    purpose: "Define the structured pipeline for testing, approving, and deploying software updates to production environments with zero downtime and automated rollback safeguards.",
    scope: "Encompasses all planned releases, security hotfixes, and cloud infrastructure modifications.",
    id: "SOP-ENG-105",
    industry: "DevOps & Cloud Engineering",
    audience: "Release Engineers, DevOps, QA Engineers",
    complexity: "High",
    prerequisites: ["Passed automated CI test suite", "QA sign-off in staging environment", "Approved change management request"],
    tools_and_materials: ["CI/CD Pipeline (GitHub Actions / GitLab)", "Kubernetes / Container Orchestrator", "Database Migration Tool", "Release Telemetry Dashboard"],
    roles: ["Release Engineer", "QA Lead", "DevOps Engineer", "Engineering Manager"],
    steps: [
      {
        id: "step-1",
        step_number: 1,
        title: "Release candidate freeze and qualification",
        detail: "Create release branch, freeze code changes, run full integration regression suite, and verify security dependency vulnerability scans.",
        owner: "Release Engineer",
        expected_outcome: "Validated release tag created with green CI status.",
        verification: "Security scan report shows 0 critical or high vulnerabilities."
      },
      {
        id: "step-2",
        step_number: 2,
        title: "Pre-deployment staging smoke validation",
        detail: "Deploy candidate build to staging, execute end-to-end critical user journeys, and verify database schema migration backward compatibility.",
        owner: "QA Lead",
        expected_outcome: "Formal QA sign-off granted with zero blocking defects.",
        verification: "Automated Playwright/Cypress smoke tests pass at 100%."
      },
      {
        id: "step-3",
        step_number: 3,
        title: "Canary rollout and telemetry monitoring",
        detail: "Deploy release to 10% canary traffic pool in production. Monitor error rates, response latency, and database query load for 15 minutes.",
        owner: "DevOps Engineer",
        expected_outcome: "Canary instance operates normally without statistical error elevation.",
        verification: "Compare Datadog canary metrics against baseline cluster."
      },
      {
        id: "step-4",
        step_number: 4,
        title: "Full fleet rollout and traffic migration",
        detail: "Promote release to 100% of production fleet using blue-green or rolling container updates without terminating in-flight requests.",
        owner: "DevOps Engineer",
        expected_outcome: "Complete application fleet running new release artifact.",
        verification: "Zero HTTP 5xx spikes during transition and health check endpoints green."
      },
      {
        id: "step-5",
        step_number: 5,
        title: "Post-deployment audit and changelog publication",
        detail: "Verify production telemetry for 30 minutes, publish internal release notes to product and customer support teams, and close release ticket.",
        owner: "Release Engineer",
        expected_outcome: "Stakeholders informed of new capabilities and live monitoring confirmed normal.",
        verification: "Release tag signed and documented in release catalog."
      }
    ],
    checklist: [
      "All automated pull request tests passing",
      "Security vulnerability analysis reviewed and clear",
      "Staging environment smoke tests signed off by QA",
      "Database migrations tested for forward/backward compatibility",
      "Automated rollback plan documented and tested",
      "Canary traffic stable for minimum 15 minutes",
      "Internal release notification published to operational channels"
    ],
    checklistDone: [true, false, false, false, false, false, false],
    required_records: ["Git commit SHA and release tag", "Automated pipeline build logs", "Security vulnerability scan manifest", "QA verification sign-off ticket"],
    risk_and_safety: "Never execute production deployments during peak transaction hours or on Friday afternoons unless resolving active high-severity incident.",
    exception_handling: "If canary error rate exceeds 0.5%, pipeline automatically halts and triggers immediate rollback to previous stable tag.",
    escalation: "Escalate unexpected database lock contention or rollback failure to Engineering Manager and Database Administrator immediately.",
    review_frequency: "Quarterly",
    approval_workflow: {
      reviewer_role: "Principal DevOps Architect",
      approver_role: "Director of Engineering",
      stage: "Active Pipeline Standard",
      status: "Approved",
      review_notes: "Updated with automated canary deployment protocols."
    }
  },
  purchase: {
    key: "purchase",
    name: "Purchase Requisition & Procurement Approval",
    department: "Finance & Procurement",
    objective: "Govern corporate expenditure by providing an unambiguous authorization path for software subscriptions, physical equipment, and services.",
    purpose: "Govern corporate expenditure by providing an unambiguous authorization path for software subscriptions, physical equipment, and professional services.",
    scope: "Applies to all external vendor purchase commitments exceeding $500.",
    id: "SOP-FIN-106",
    industry: "Corporate Finance / Procurement",
    audience: "Department Requesters, Managers, Finance Directors",
    complexity: "Medium",
    prerequisites: ["Vendor itemized quote or proposal", "Approved departmental budget allocation", "Vendor tax & banking documentation"],
    tools_and_materials: ["Procurement / ERP system (Coupa / NetSuite)", "Corporate Contract Repository", "Vendor risk assessment database"],
    roles: ["Department Requester", "Department Manager", "Procurement Specialist", "Finance Director"],
    steps: [
      {
        id: "step-1",
        step_number: 1,
        title: "Purchase requisition creation",
        detail: "Submit purchase requisition with detailed business justification, expected ROI, budget category code, and attached vendor proposal.",
        owner: "Department Requester",
        expected_outcome: "Requisition submitted in procurement portal with attached documentation.",
        verification: "Confirm budget allocation code is active and valid."
      },
      {
        id: "step-2",
        step_number: 2,
        title: "Departmental budgetary review",
        detail: "Verify necessity of purchase against current quarterly budget headroom and approve or reject requisition within 2 business days.",
        owner: "Department Manager",
        expected_outcome: "Manager electronic approval recorded in ERP workflow.",
        verification: "System audit trail logs manager sign-off timestamp."
      },
      {
        id: "step-3",
        step_number: 3,
        title: "Vendor commercial and security assessment",
        detail: "Review commercial pricing terms, negotiate payment terms (minimum Net 30), and verify vendor data security compliance if SaaS product.",
        owner: "Procurement Specialist",
        expected_outcome: "Vendor master agreement verified and payment terms optimized.",
        verification: "Security compliance review badge marked satisfactory."
      },
      {
        id: "step-4",
        step_number: 4,
        title: "Purchase order issuance and accounting commitment",
        detail: "Generate legal Purchase Order (PO), transmit copy to vendor, and encumber funds in the accounting system ledger.",
        owner: "Finance Director",
        expected_outcome: "Official PO number delivered to vendor and goods/services ordered.",
        verification: "PO status set to 'Dispatched' in ERP system."
      }
    ],
    checklist: [
      "Itemized vendor quote attached with valid pricing validity window",
      "Business justification and target delivery date stated",
      "Departmental budget approval confirmed by hiring manager",
      "Vendor security review completed for cloud software tools",
      "Payment terms negotiated to Net 30 or better",
      "Official PO dispatched to vendor prior to service delivery"
    ],
    checklistDone: [true, false, false, false, false, false],
    required_records: ["Vendor quote and Statement of Work (SOW)", "Departmental approval log", "Vendor W-9 / banking information", "Executed Purchase Order (PO) document"],
    risk_and_safety: "Never commit company expenditure verbally or sign vendor agreements without procurement and legal authority.",
    exception_handling: "Emergency operational purchases under $2,500 may be approved post-facto with retroactive Director approval within 48 hours.",
    escalation: "Escalate non-standard contractual indemnification terms to Corporate Legal Counsel.",
    review_frequency: "Annual",
    approval_workflow: {
      reviewer_role: "Head of Strategic Procurement",
      approver_role: "Chief Financial Officer",
      stage: "Corporate Financial Standard",
      status: "Approved",
      review_notes: "Updated for digital SaaS subscription governance thresholds."
    }
  }
};

export function buildLocalSop({
  process_name,
  department,
  objective,
  template_key = "onboarding",
  industry,
  audience,
  complexity = "Medium",
  description
}) {
  const base = structuredClone(templates[template_key] || templates.onboarding);
  const name = String(process_name || base.name).trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
  const dept = String(department || base.department).trim();
  const goal = String(objective || base.objective).trim();
  const idPrefix = dept.split(/[^A-Za-z]/).filter(Boolean).map((word) => word[0]).join("").slice(0, 3).toUpperCase() || "OPS";

  const checklist = base.checklist || ["Complete initialization check", "Execute core procedural steps", "Verify output quality"];
  const checklist_items = checklist.map((item, idx) => ({
    id: `chk-${idx + 1}-${Math.random().toString(36).substring(2, 8)}`,
    label: item,
    is_completed: idx === 0
  }));

  return {
    ...base,
    name,
    department: dept,
    objective: goal,
    industry: industry || base.industry || "General Operations",
    audience: audience || base.audience || "Operations Team",
    complexity: complexity || base.complexity || "Medium",
    id: `SOP-${idPrefix}-${String(Math.floor(100 + Math.random() * 899))}`,
    purpose: description
      ? `This procedure defines a repeatable approach for ${name.toLowerCase()}. ${description}`
      : base.purpose,
    steps: base.steps.map((step, idx) => ({
      ...step,
      id: step.id || `step-${idx + 1}`,
      step_number: idx + 1
    })),
    checklist,
    checklistDone: checklist.map((_, idx) => idx === 0),
    checklist_items,
    status: "draft",
    version: "1.0",
    source: "local-demo"
  };
}
