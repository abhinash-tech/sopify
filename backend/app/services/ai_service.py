import json
import logging
import re
from copy import deepcopy
from random import randint
from uuid import uuid4

from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.schemas.sop import ApprovalWorkflow, SOPChecklistItem, SOPDocument, SOPStep

logger = logging.getLogger(__name__)

TEMPLATES_CATALOG = {
    "onboarding": {
        "title": "Employee Onboarding Procedure",
        "department": "Human Resources",
        "roles": ["HR Coordinator", "IT Administrator", "Hiring Manager", "People Operations"],
        "purpose": "Establish a standardized, high-touch onboarding experience from offer acceptance through the employee's initial 90 days. This procedure ensures regulatory compliance, timely IT provisioning, and structured team orientation.",
        "scope": "Applies to all full-time, part-time, and contract hires across all operating departments.",
        "prerequisites": ["Signed offer letter on file", "Completed background verification", "Confirmed start date and reporting location"],
        "tools_and_materials": ["HR Information System (HRIS)", "Identity & Access Management portal", "Hardware inventory catalog", "Digital welcome packet"],
        "steps": [
            {
                "title": "Pre-boarding administrative setup",
                "detail": "Collect emergency contact details, tax compliance forms, and direct deposit information. Create the employee record in the HRIS.",
                "owner": "HR Coordinator",
                "expected_outcome": "Complete employee profile generated with verified compliance documentation.",
                "verification": "Check HRIS profile completeness indicator at 100%."
            },
            {
                "title": "Hardware and digital access provisioning",
                "detail": "Configure laptop with standard security profiles, multi-factor authentication, email account, and role-based software licenses.",
                "owner": "IT Administrator",
                "expected_outcome": "Equipment dispatched or placed at workstation with functional single sign-on credentials.",
                "verification": "Test login authentication and verify device management enrollment."
            },
            {
                "title": "Day-one orientation and company overview",
                "detail": "Conduct introduction session covering company values, safety policies, operational hours, and benefits enrollment timelines.",
                "owner": "HR Coordinator",
                "expected_outcome": "New hire completes orientation checklist and gains access to corporate communications.",
                "verification": "Collect signed employee handbook acknowledgment."
            },
            {
                "title": "Team immersion and 30-day objective alignment",
                "detail": "Introduce team members, designate an onboarding mentor, and review key responsibilities and deliverables for the first month.",
                "owner": "Hiring Manager",
                "expected_outcome": "Mutually agreed 30-day success milestones recorded in writing.",
                "verification": "Document initial 1-on-1 discussion notes in the performance portal."
            },
            {
                "title": "Initial 30-day review and feedback check-in",
                "detail": "Schedule formal progress review to address early friction points, assess workload balance, and confirm benefit enrollment status.",
                "owner": "People Operations",
                "expected_outcome": "Structured feedback captured and retention milestones reinforced.",
                "verification": "Completed 30-day check-in survey archived in employee record."
            }
        ],
        "checklist": [
            "Signed offer letter and identity documents verified",
            "HRIS record created and direct deposit details linked",
            "Hardware configured, encrypted, and delivered",
            "Single sign-on accounts and role permissions provisioned",
            "Welcome email and first-day agenda sent to employee",
            "Employee handbook acknowledgment received",
            "30-day milestone review scheduled with manager"
        ],
        "required_records": ["Signed employment agreement", "Government tax withholding certificates", "Asset handover receipt", "Handbook acknowledgment form"],
        "risk_and_safety": "Protect employee Personally Identifiable Information (PII) during transfer. Ensure full disk encryption on provisioned hardware.",
        "exception_handling": "If identity verification documents are delayed, restrict sensitive operational system access until verified by HR leadership.",
        "escalation": "Escalate provisioning blockers to IT Support Lead if credentials are not ready 24 hours prior to the start date.",
        "review_frequency": "Every 6 months",
        "approval_workflow": {
            "reviewer_role": "HR Operations Lead",
            "approver_role": "Head of People",
            "stage": "Active Standard",
            "status": "Approved",
            "review_notes": "Annual revision incorporating remote onboarding hardware workflow."
        }
    },
    "refund": {
        "title": "Customer Refund Processing",
        "department": "Customer Support",
        "roles": ["Support Specialist", "Billing Specialist", "Finance Lead", "Support Manager"],
        "purpose": "Standardize the intake, verification, approval, and settlement of customer refund requests to ensure equitable resolution, prevent revenue leakage, and preserve brand loyalty.",
        "scope": "Covers all digital and physical product refund claims submitted within or outside standard policy windows.",
        "prerequisites": ["Active customer order ID", "Written refund request or dispute ticket", "Proof of payment or transaction ID"],
        "tools_and_materials": ["CRM / Ticketing platform (Zendesk / Intercom)", "Payment Gateway / Merchant processor", "Order Management System", "Customer Ledger"],
        "steps": [
            {
                "title": "Inbound intake and ticket logging",
                "detail": "Acknowledge customer communication within 4 hours, verify purchase receipt, and record order ID, transaction amount, and refund rationale.",
                "owner": "Support Specialist",
                "expected_outcome": "Ticket categorized under 'Billing / Refund' with all relevant metadata populated.",
                "verification": "Confirm customer account and order match in the payment gateway."
            },
            {
                "title": "Eligibility and warranty validation",
                "detail": "Evaluate request against standard 30-day satisfaction policy, return shipment receipt, or verified service outage logs.",
                "owner": "Support Specialist",
                "expected_outcome": "Initial eligibility decision documented with policy citation.",
                "verification": "Ensure return tracking number indicates warehouse receipt if physical return."
            },
            {
                "title": "Financial authorization and gateway processing",
                "detail": "For eligible claims under $250, initiate gateway reversal directly; route claims exceeding $250 to Finance Lead for secondary sign-off.",
                "owner": "Billing Specialist",
                "expected_outcome": "Gateway transaction status changed to 'Refund Initiated' or 'Credited'.",
                "verification": "Capture settlement transaction reference and timestamp in ticket."
            },
            {
                "title": "Customer confirmation and ticket closure",
                "detail": "Issue formal notification email detailing refund amount, last 4 digits of destination payment card, and standard bank settlement timeline (3-5 business days).",
                "owner": "Support Specialist",
                "expected_outcome": "Customer notified with clear expectations regarding card issuer posting time.",
                "verification": "Customer acknowledgment received or ticket auto-resolved following delivery."
            }
        ],
        "checklist": [
            "Order ID and transaction proof verified in merchant gateway",
            "Refund rationale categorized (defect, delay, unauthorized, satisfaction)",
            "Return tracking validated if physical goods involved",
            "Tiered authorization approved (Tier 1 vs Tier 2 approval threshold)",
            "Payment processor refund ID recorded in CRM",
            "Confirmation email dispatched with banking timeline"
        ],
        "required_records": ["Merchant transaction receipt", "Support ticket interaction history", "Return merchandise authorization (RMA) slip", "Finance refund batch log"],
        "risk_and_safety": "Mitigate chargeback disputes by processing legitimate claims swiftly. Prevent payment card fraud by only refunding to original payment method.",
        "exception_handling": "If original payment method is canceled or expired, coordinate with Finance Lead to issue store credit or verified bank wire.",
        "escalation": "Escalate disputed charges exceeding $500 or active chargeback threats to Support Manager immediately.",
        "review_frequency": "Quarterly",
        "approval_workflow": {
            "reviewer_role": "Customer Experience Supervisor",
            "approver_role": "Finance Controller",
            "stage": "Standard Operating Procedure",
            "status": "Approved",
            "review_notes": "Updated for payment gateway chargeback mitigation protocols."
        }
    },
    "incident": {
        "title": "Severity 1 & 2 Incident Response Procedure",
        "department": "Engineering & IT",
        "roles": ["Incident Commander", "Technical Response Lead", "Communications Officer", "Postmortem Facilitator"],
        "purpose": "Guide engineering, operations, and support teams through rapid detection, triage, containment, and resolution of critical service degradations or security incidents.",
        "scope": "Applies to critical production outages, data security events, and tier-1 vendor infrastructure disruptions.",
        "prerequisites": ["Automated monitoring alert or customer outage report", "Incident severity matrix", "On-call rotation schedule"],
        "tools_and_materials": ["Incident management portal", "Dedicated incident conference bridge", "System observability dashboards (Datadog/Grafana)", "Public Statuspage"],
        "steps": [
            {
                "title": "Incident declaration and role assignment",
                "detail": "Declare incident state in collaboration channel, appoint Incident Commander, establish war room bridge, and define severity level (SEV-1 / SEV-2).",
                "owner": "Incident Commander",
                "expected_outcome": "Clear leadership established and responders gathered on designated channel.",
                "verification": "Incident log entry created and on-call engineers joined bridge."
            },
            {
                "title": "Customer and internal stakeholder communication",
                "detail": "Publish initial notification on public status page within 15 minutes of declaration and send executive summary to operational leadership.",
                "owner": "Communications Officer",
                "expected_outcome": "Consistent messaging disseminated without disclosing confidential vulnerabilities.",
                "verification": "Public status page updated with investigation status."
            },
            {
                "title": "Diagnostic investigation and containment",
                "detail": "Analyze telemetry, inspect recent deployment commits, and execute containment actions (e.g. rollback, traffic reroute, feature flag disable).",
                "owner": "Technical Response Lead",
                "expected_outcome": "Immediate mitigation implemented to stop bleeding and restore customer access.",
                "verification": "Error rates and latency return within operational SLA thresholds."
            },
            {
                "title": "Verification of service recovery",
                "detail": "Validate end-to-end user transactions across synthetic test suites and confirm error rate stabilization for minimum 30 consecutive minutes.",
                "owner": "Technical Response Lead",
                "expected_outcome": "Service functionality confirmed stable under active production load.",
                "verification": "Monitoring metrics confirm 99.9% success rate on synthetic health checks."
            },
            {
                "title": "Resolution announcement and blameless postmortem",
                "detail": "Close incident bridge, issue resolution notice on status page, and schedule blameless postmortem within 48 hours to document root cause.",
                "owner": "Postmortem Facilitator",
                "expected_outcome": "Action items assigned to Jira and permanent safeguards integrated into sprint backlog.",
                "verification": "Completed root cause analysis document published to engineering wiki."
            }
        ],
        "checklist": [
            "Incident Commander appointed and active bridge established",
            "Initial status page broadcast published within 15 minutes",
            "Recent production rollouts and configuration changes audited",
            "Mitigation strategy deployed (rollback, rate-limit, failover)",
            "System metrics observed stable for 30 consecutive minutes",
            "Resolution notification communicated to stakeholders",
            "Blameless retrospective scheduled with engineering owners"
        ],
        "required_records": ["Incident war room chat transcript", "Observability telemetry snapshots", "System changelog diff", "Formal postmortem root-cause document"],
        "risk_and_safety": "Prevent cascading failures during remediation by enforcing staged rollout of emergency patches.",
        "exception_handling": "If primary failover cluster is unreachable, activate cold disaster recovery site under Incident Commander authorization.",
        "escalation": "Escalate to Chief Technology Officer if customer-impacting outage exceeds 45 minutes without identified mitigation path.",
        "review_frequency": "Quarterly",
        "approval_workflow": {
            "reviewer_role": "Director of Infrastructure",
            "approver_role": "VP of Engineering",
            "stage": "Production Standard",
            "status": "Approved",
            "review_notes": "Annual update with automated cloud failover and telemetry benchmarks."
        }
    },
    "escalation": {
        "title": "Customer Support Escalation Procedure",
        "department": "Customer Support",
        "roles": ["Tier 1 Representative", "Tier 2 Technical Specialist", "Support Escalation Manager", "Product Lead"],
        "purpose": "Provide a streamlined pathway for escalating unresolved customer issues, complex technical bugs, and high-value account disputes to specialized resolving teams.",
        "scope": "Applies to tickets exceeding Tier 1 resolution authority or technical troubleshooting thresholds.",
        "prerequisites": ["Unresolved frontline ticket with diagnostic history", "Reproduction steps or error logs", "Customer impact tier assessment"],
        "tools_and_materials": ["Ticketing system with SLA tracking", "Knowledge base documentation", "Internal bug tracking board", "Internal communication hub"],
        "steps": [
            {
                "title": "Frontline diagnostic synthesis and triage",
                "detail": "Document browser version, device info, exact error codes, network headers, and customer impact level in internal ticket notes.",
                "owner": "Tier 1 Representative",
                "expected_outcome": "Comprehensive escalation package created with all tier 1 steps attempted.",
                "verification": "Review that required escalation fields are completed before transfer."
            },
            {
                "title": "Ticket handoff and customer expectation setting",
                "detail": "Assign ticket to Tier 2 queue, notify customer that technical specialist is investigating, and state next update window within 4 hours.",
                "owner": "Tier 1 Representative",
                "expected_outcome": "Customer reassured and ticket accurately routed without delay.",
                "verification": "Automated SLA timer updated to reflection escalation tier."
            },
            {
                "title": "Deep diagnostic analysis and engineering liaison",
                "detail": "Replicate issue in staging environment, inspect backend application logs, and link or file engineering defect if root cause is software bug.",
                "owner": "Tier 2 Technical Specialist",
                "expected_outcome": "Actionable bug ticket created or operational workaround provided.",
                "verification": "Jira issue linked to customer support ticket with reproduction video/logs."
            },
            {
                "title": "Solution delivery and closed-loop validation",
                "detail": "Deliver verified resolution or clear workaround to customer, test customer confirmation, and log root-cause category in support analytics.",
                "owner": "Tier 2 Technical Specialist",
                "expected_outcome": "Customer problem verified resolved and satisfaction confirmed.",
                "verification": "Customer explicit confirmation received in ticket thread."
            }
        ],
        "checklist": [
            "Customer identity and account tier verified",
            "Troubleshooting steps and browser logs documented internally",
            "Customer informed of transfer with realistic update window",
            "Tier 2 queue assignment confirmed within SLA threshold",
            "Defect ticket linked with engineering if platform bug",
            "Customer confirmation received prior to resolution marking"
        ],
        "required_records": ["Diagnostic screenshots and session replay links", "Network console logs", "Engineering defect reference number", "Customer CSAT rating"],
        "risk_and_safety": "Never expose internal engineering dialogue or raw API tokens to external customer tickets.",
        "exception_handling": "If issue affects enterprise accounts with strict SLAs, notify Escalation Manager to initiate direct customer conference bridge.",
        "escalation": "Escalate to Support Director if ticket remains unresolved across 2 consecutive business days.",
        "review_frequency": "Every 6 months",
        "approval_workflow": {
            "reviewer_role": "Support Operations Manager",
            "approver_role": "Head of Customer Experience",
            "stage": "Standard Operating Procedure",
            "status": "Approved",
            "review_notes": "Synchronized with current enterprise account SLAs."
        }
    },
    "deployment": {
        "title": "Production Software Deployment & Release Procedure",
        "department": "Engineering & DevOps",
        "roles": ["Release Engineer", "QA Lead", "DevOps Engineer", "Engineering Manager"],
        "purpose": "Define the structured pipeline for testing, approving, and deploying software updates to production environments with zero downtime and automated rollback safeguards.",
        "scope": "Encompasses all planned releases, security hotfixes, and cloud infrastructure modifications.",
        "prerequisites": ["Passed automated CI test suite", "QA sign-off in staging environment", "Approved change management request"],
        "tools_and_materials": ["CI/CD Pipeline (GitHub Actions / GitLab)", "Kubernetes / Container Orchestrator", "Database Migration Tool", "Release Telemetry Dashboard"],
        "steps": [
            {
                "title": "Release candidate freeze and qualification",
                "detail": "Create release branch, freeze code changes, run full integration regression suite, and verify security dependency vulnerability scans.",
                "owner": "Release Engineer",
                "expected_outcome": "Validated release tag created with green CI status.",
                "verification": "Security scan report shows 0 critical or high vulnerabilities."
            },
            {
                "title": "Pre-deployment staging smoke validation",
                "detail": "Deploy candidate build to staging, execute end-to-end critical user journeys, and verify database schema migration backward compatibility.",
                "owner": "QA Lead",
                "expected_outcome": "Formal QA sign-off granted with zero blocking defects.",
                "verification": "Automated Playwright/Cypress smoke tests pass at 100%."
            },
            {
                "title": "Canary rollout and telemetry monitoring",
                "detail": "Deploy release to 10% canary traffic pool in production. Monitor error rates, response latency, and database query load for 15 minutes.",
                "owner": "DevOps Engineer",
                "expected_outcome": "Canary instance operates normally without statistical error elevation.",
                "verification": "Compare Datadog canary metrics against baseline cluster."
            },
            {
                "title": "Full fleet rollout and traffic migration",
                "detail": "Promote release to 100% of production fleet using blue-green or rolling container updates without terminating in-flight requests.",
                "owner": "DevOps Engineer",
                "expected_outcome": "Complete application fleet running new release artifact.",
                "verification": "Zero HTTP 5xx spikes during transition and health check endpoints green."
            },
            {
                "title": "Post-deployment audit and changelog publication",
                "detail": "Verify production telemetry for 30 minutes, publish internal release notes to product and customer support teams, and close release ticket.",
                "owner": "Release Engineer",
                "expected_outcome": "Stakeholders informed of new capabilities and live monitoring confirmed normal.",
                "verification": "Release tag signed and documented in release catalog."
            }
        ],
        "checklist": [
            "All automated pull request tests passing",
            "Security vulnerability analysis reviewed and clear",
            "Staging environment smoke tests signed off by QA",
            "Database migrations tested for forward/backward compatibility",
            "Automated rollback plan documented and tested",
            "Canary traffic stable for minimum 15 minutes",
            "Internal release notification published to operational channels"
        ],
        "required_records": ["Git commit SHA and release tag", "Automated pipeline build logs", "Security vulnerability scan manifest", "QA verification sign-off ticket"],
        "risk_and_safety": "Never execute production deployments during peak transaction hours or on Friday afternoons unless resolving active high-severity incident.",
        "exception_handling": "If canary error rate exceeds 0.5%, pipeline automatically halts and triggers immediate rollback to previous stable tag.",
        "escalation": "Escalate unexpected database lock contention or rollback failure to Engineering Manager and Database Administrator immediately.",
        "review_frequency": "Quarterly",
        "approval_workflow": {
            "reviewer_role": "Principal DevOps Architect",
            "approver_role": "Director of Engineering",
            "stage": "Active Pipeline Standard",
            "status": "Approved",
            "review_notes": "Updated with automated canary deployment protocols."
        }
    },
    "purchase": {
        "title": "Purchase Requisition and Procurement Approval",
        "department": "Finance & Procurement",
        "roles": ["Department Requester", "Department Manager", "Procurement Specialist", "Finance Director"],
        "purpose": "Govern corporate expenditure by providing an unambiguous authorization path for software subscriptions, physical equipment, and professional services.",
        "scope": "Applies to all external vendor purchase commitments exceeding $500.",
        "prerequisites": ["Vendor itemized quote or proposal", "Approved departmental budget allocation", "Vendor tax & banking documentation"],
        "tools_and_materials": ["Procurement / ERP system (Coupa / NetSuite)", "Corporate Contract Repository", "Vendor risk assessment database"],
        "steps": [
            {
                "title": "Purchase requisition creation",
                "detail": "Submit purchase requisition with detailed business justification, expected ROI, budget category code, and attached vendor proposal.",
                "owner": "Department Requester",
                "expected_outcome": "Requisition submitted in procurement portal with attached documentation.",
                "verification": "Confirm budget allocation code is active and valid."
            },
            {
                "title": "Departmental budgetary review",
                "detail": "Verify necessity of purchase against current quarterly budget headroom and approve or reject requisition within 2 business days.",
                "owner": "Department Manager",
                "expected_outcome": "Manager electronic approval recorded in ERP workflow.",
                "verification": "System audit trail logs manager sign-off timestamp."
            },
            {
                "title": "Vendor commercial and security assessment",
                "detail": "Review commercial pricing terms, negotiate payment terms (minimum Net 30), and verify vendor data security compliance if SaaS product.",
                "owner": "Procurement Specialist",
                "expected_outcome": "Vendor master agreement verified and payment terms optimized.",
                "verification": "Security compliance review badge marked satisfactory."
            },
            {
                "title": "Purchase order issuance and accounting commitment",
                "detail": "Generate legal Purchase Order (PO), transmit copy to vendor, and encumber funds in the accounting system ledger.",
                "owner": "Finance Director",
                "expected_outcome": "Official PO number delivered to vendor and goods/services ordered.",
                "verification": "PO status set to 'Dispatched' in ERP system."
            }
        ],
        "checklist": [
            "Itemized vendor quote attached with valid pricing validity window",
            "Business justification and target delivery date stated",
            "Departmental budget approval confirmed by hiring manager",
            "Vendor security review completed for cloud software tools",
            "Payment terms negotiated to Net 30 or better",
            "Official PO dispatched to vendor prior to service delivery"
        ],
        "required_records": ["Vendor quote and Statement of Work (SOW)", "Departmental approval log", "Vendor W-9 / banking information", "Executed Purchase Order (PO) document"],
        "risk_and_safety": "Never commit company expenditure verbally or sign vendor agreements without procurement and legal authority.",
        "exception_handling": "Emergency operational purchases under $2,500 may be approved post-facto with retroactive Director approval within 48 hours.",
        "escalation": "Escalate non-standard contractual indemnification terms to Corporate Legal Counsel.",
        "review_frequency": "Annual",
        "approval_workflow": {
            "reviewer_role": "Head of Strategic Procurement",
            "approver_role": "Chief Financial Officer",
            "stage": "Corporate Financial Standard",
            "status": "Approved",
            "review_notes": "Updated for digital SaaS subscription governance thresholds."
        }
    }
}


def _clean_identifier(department: str) -> str:
    words = re.findall(r"[A-Za-z]+", department)
    if not words:
        return "OPS"
    if len(words) == 1:
        return words[0][:3].upper()
    return "".join(word[0] for word in words)[:3].upper()


def _build_checklist_items(checklist_strings: list[str]) -> list[dict]:
    return [
        {
            "id": f"chk-{idx + 1}-{uuid4().hex[:6]}",
            "label": item,
            "is_completed": idx == 0
        }
        for idx, item in enumerate(checklist_strings)
    ]


def _build_steps_objects(steps_data: list[dict]) -> list[dict]:
    normalized = []
    for idx, s in enumerate(steps_data):
        normalized.append({
            "id": f"step-{idx + 1}",
            "step_number": idx + 1,
            "title": s.get("title", f"Step {idx + 1}"),
            "detail": s.get("detail", ""),
            "owner": s.get("owner", "Process Owner"),
            "expected_outcome": s.get("expected_outcome", "Step completed successfully according to standard."),
            "verification": s.get("verification", "Inspect and verify output.")
        })
    return normalized


def _sample_sop(
    process_name: str,
    department: str,
    objective: str,
    template_key: str,
    industry: str | None = None,
    audience: str | None = None,
    complexity: str | None = "Medium",
    description: str | None = None
) -> dict:
    key = template_key.lower() if template_key else "onboarding"
    template = TEMPLATES_CATALOG.get(key)

    name = re.sub(r"\s+", " ", process_name).strip().rstrip(".!?")
    if not name:
        name = template["title"] if template else "Standard Operating Procedure"

    dep = department.strip() if department and department.strip() else (template["department"] if template else "Operations")

    obj = objective.strip() if objective and objective.strip() else (
        description.strip() if description and description.strip() else f"Execute {name.lower()} consistently, efficiently, and with full operational accountability."
    )

    if template:
        tpl_copy = deepcopy(template)
        steps_data = tpl_copy["steps"]
        checklist_data = tpl_copy["checklist"]
        purpose = (
            f"This Standard Operating Procedure formalizes the operational requirements for {name.lower()}. "
            f"It provides a clear, repeatable guide for {dep} to achieve the stated outcome: {obj.rstrip('.')}. "
            f"Compliance with this standard ensures high quality, reduced cycle times, and operational resilience."
        )
        scope = tpl_copy.get("scope", f"Applies to all members of {dep} responsible for executing or reviewing {name.lower()}.")
        roles = tpl_copy.get("roles", ["Process Owner", "Reviewer", "Department Head"])
        prereqs = tpl_copy.get("prerequisites", ["Review operational inputs", "Verify system credentials"])
        tools = tpl_copy.get("tools_and_materials", ["Internal enterprise portal", "Standard operating checklist"])
        records = tpl_copy.get("required_records", ["Execution audit log", "Signed sign-off sheet"])
        safety = tpl_copy.get("risk_and_safety", "Adhere to company data security guidelines and standard workplace practices.")
        exceptions = tpl_copy.get("exception_handling", "Document any procedural deviation and notify supervisor immediately.")
        escalation = tpl_copy.get("escalation", f"Escalate unresolved operational blockers to {roles[-1]} if not resolved within standard SLA.")
        rev_freq = tpl_copy.get("review_frequency", "Every 6 months")
        wf = tpl_copy.get("approval_workflow", {
            "reviewer_role": roles[1] if len(roles) > 1 else "Operations Lead",
            "approver_role": roles[-1] if roles else "Department Head",
            "stage": "Active Standard",
            "status": "Draft",
            "review_notes": "Proposed workflow for team review and sign-off."
        })
    else:
        # Custom Process Synthesis
        steps_data = [
            {
                "title": "Initiation and input verification",
                "detail": f"Gather and validate all prerequisite documentation, customer requests, or project requirements needed to start {name.lower()}.",
                "owner": f"{dep} Specialist",
                "expected_outcome": "Complete and verified input package assembled.",
                "verification": "Check inputs against standard verification criteria."
            },
            {
                "title": "Primary execution and processing",
                "detail": f"Perform the core activities of {name.lower()} in accordance with organizational policies and quality benchmarks.",
                "owner": f"{dep} Specialist",
                "expected_outcome": f"{name} executed without defects or delay.",
                "verification": "Perform secondary validation of operational results."
            },
            {
                "title": "Quality review and compliance check",
                "detail": "Inspect deliverables, cross-reference against regulatory guidelines, and confirm all checklist items have been addressed.",
                "owner": "Quality Reviewer",
                "expected_outcome": "Zero errors or compliance variances detected.",
                "verification": "Log review sign-off in the departmental registry."
            },
            {
                "title": "Handover and stakeholder notification",
                "detail": "Deliver the final output to downstream stakeholders, update tracking dashboards, and notify affected departments.",
                "owner": f"{dep} Lead",
                "expected_outcome": "Downstream teams successfully receive verified deliverables.",
                "verification": "Collect formal delivery acknowledgment receipt."
            },
            {
                "title": "Archival and process recording",
                "detail": "File all records, correspondence, and evidence in the centralized departmental repository for traceability and audit readiness.",
                "owner": f"{dep} Specialist",
                "expected_outcome": "All audit artifacts securely archived.",
                "verification": "Ensure file references are logged in the master ledger."
            }
        ]
        checklist_data = [
            f"Verify all initial requirements for {name.lower()} are present",
            "Confirm authorized stakeholder approval before execution",
            "Complete primary operational steps according to protocol",
            "Conduct quality audit and log inspection outcome",
            "Dispatch deliverables to designated recipients",
            "Archive supporting documentation in corporate records"
        ]
        purpose = f"This Standard Operating Procedure formalizes the execution of {name.lower()} within {dep}. The core objective is: {obj.rstrip('.')}."
        scope = f"Applies across all teams in {dep} involved in planning, executing, or verifying {name.lower()}."
        roles = [f"{dep} Specialist", "Quality Reviewer", f"{dep} Lead"]
        prereqs = ["Active system credentials", "Approved process request form"]
        tools = ["Enterprise software suite", "Departmental communication channel"]
        records = ["Operational activity log", "Verification sign-off sheet"]
        safety = "Follow workplace safety protocols and enforce least-privilege information security."
        exceptions = "If inputs are incomplete or corrupted, pause execution and request corrected data."
        escalation = f"Escalate persistent bottlenecks to {dep} Lead immediately."
        rev_freq = "Every 6 months"
        wf = {
            "reviewer_role": "Quality Reviewer",
            "approver_role": f"{dep} Lead",
            "stage": "Initial Draft",
            "status": "Draft",
            "review_notes": "Proposed workflow generated for departmental alignment."
        }

    steps_objs = _build_steps_objects(steps_data)
    checklist_objs = _build_checklist_items(checklist_data)

    sop_id = f"SOP-{_clean_identifier(dep)}-{randint(100, 999)}"

    return {
        "name": name,
        "department": dep,
        "objective": obj,
        "purpose": purpose,
        "scope": scope,
        "id": sop_id,
        "prerequisites": prereqs,
        "tools_and_materials": tools,
        "roles": roles,
        "steps": steps_objs,
        "checklist": checklist_data,
        "checklistDone": [idx == 0 for idx in range(len(checklist_data))],
        "checklist_items": checklist_objs,
        "required_records": records,
        "risk_and_safety": safety,
        "exception_handling": exceptions,
        "escalation": escalation,
        "review_frequency": rev_freq,
        "approval_workflow": wf,
        "industry": industry,
        "audience": audience,
        "complexity": complexity or "Medium",
        "version": "1.0",
        "status": "draft",
        "source": "sample"
    }


def _gemini_sop(
    process_name: str,
    department: str,
    objective: str,
    template_key: str,
    industry: str | None = None,
    audience: str | None = None,
    complexity: str | None = "Medium",
    description: str | None = None,
    frequency: str | None = None,
    policies: str | None = None,
    additional_instructions: str | None = None
) -> dict:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = f"""You are a senior operations engineer and enterprise standard operating procedure (SOP) architect.
Generate a comprehensive, actionable, and professionally structured Standard Operating Procedure based strictly on the following parameters:

Process Name: {process_name}
Department: {department}
Primary Objective: {objective or 'Synthesize an operational objective based on the process name'}
Additional Context/Description: {description or 'None provided'}
Industry: {industry or 'General Business / Operations'}
Target Audience: {audience or 'Operational staff and supervisors'}
Complexity Level: {complexity or 'Medium'}
Execution Frequency: {frequency or 'As needed / recurring'}
Governing Policies: {policies or 'Company code of conduct and standard internal compliance'}
Special Instructions: {additional_instructions or 'None'}

Generate a fully developed, detailed JSON document matching this exact schema:
{{
  "name": "{process_name}",
  "department": "{department}",
  "objective": "A sharp, clear 1-2 sentence description of what success looks like.",
  "purpose": "A thorough paragraph (3-5 sentences) explaining why this procedure exists, its organizational significance, and what risks it mitigates.",
  "scope": "Clear boundaries specifying which departments, roles, and operational conditions this SOP applies to, and any explicit exclusions.",
  "id": "SOP-{_clean_identifier(department)}-{randint(100, 999)}",
  "prerequisites": ["List of 3-5 necessary conditions or items required before starting"],
  "tools_and_materials": ["List of 3-5 software tools, hardware, or documentation required"],
  "roles": ["List of 3-4 distinct responsible organizational roles"],
  "steps": [
    {{
      "title": "Clear action verb + direct object",
      "detail": "Comprehensive instructions with specific criteria, operational logic, and expected standards.",
      "owner": "Specific responsible role from the roles list",
      "expected_outcome": "Concrete measurable outcome of this specific step.",
      "verification": "How the supervisor or peer verifies that this step was executed properly."
    }}
  ],
  "checklist": ["List of 5-8 verifiable completion checklist items"],
  "required_records": ["List of 3-5 auditable logs, receipts, or documentation that must be retained"],
  "risk_and_safety": "Specific operational, data security, or physical safety warnings relevant to this procedure (omit if not applicable).",
  "exception_handling": "Concrete guidance for what to do when normal conditions fail or errors occur.",
  "escalation": "Clear escalation threshold detailing who to contact and under what timeframe if blocked.",
  "review_frequency": "Standard review period (e.g., 'Quarterly' or 'Every 6 months')",
  "approval_workflow": {{
    "reviewer_role": "Operational reviewer role",
    "approver_role": "Department leadership role",
    "stage": "Proposed Standard",
    "status": "Pending Review",
    "review_notes": "Proposed workflow ready for departmental sign-off."
  }},
  "industry": "{industry or 'General'}",
  "audience": "{audience or 'Team members'}",
  "complexity": "{complexity or 'Medium'}",
  "version": "1.0",
  "status": "draft",
  "source": "gemini"
}}

IMPORTANT REQUIREMENTS:
- Provide 5 to 7 sequentially logical steps. Each step MUST have title, detail, owner, expected_outcome, and verification.
- Provide 5 to 8 concrete checklist items.
- Avoid vague placeholders like 'Lorem ipsum' or 'Do something'.
- Output MUST be valid JSON only with no preamble or explanation.
"""

    target_models = [GEMINI_MODEL, "gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-flash-latest"]
    seen = set()
    model_queue = [m for m in target_models if m and not (m in seen or seen.add(m))]

    response = None
    last_err = None
    for mdl in model_queue:
        try:
            logger.info("Attempting Gemini generation with model: %s", mdl)
            response = client.models.generate_content(
                model=mdl,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                ),
            )
            if response and response.text:
                break
        except Exception as e:
            logger.warning("Model %s failed: %s; trying fallback model...", mdl, e)
            last_err = e

    if not response or not response.text:
        raise last_err or RuntimeError("No response text returned from Gemini API models.")

    raw_text = response.text or "{}"
    data = json.loads(raw_text)

    # Normalize fields
    data.setdefault("name", process_name)
    data.setdefault("department", department or "Operations")
    data.setdefault("objective", objective or f"Execute {process_name} consistently.")
    data.setdefault("purpose", f"Standard operating procedure for {process_name}.")
    data.setdefault("scope", f"Applies to {data['department']}.")
    data.setdefault("id", f"SOP-{_clean_identifier(data['department'])}-{randint(100, 999)}")
    data.setdefault("roles", ["Process Owner", "Reviewer"])
    data.setdefault("prerequisites", ["Prerequisites verified"])
    data.setdefault("tools_and_materials", ["Standard software tools"])
    data.setdefault("required_records", ["Execution record"])
    data.setdefault("review_frequency", "Every 6 months")
    data.setdefault("version", "1.0")
    data.setdefault("status", "draft")
    data["source"] = "gemini"

    raw_steps = data.get("steps") or []
    data["steps"] = _build_steps_objects(raw_steps)

    raw_checklist = data.get("checklist") or [f"Verify {process_name} completed"]
    data["checklist"] = raw_checklist
    data["checklistDone"] = [False for _ in raw_checklist]
    data["checklist_items"] = _build_checklist_items(raw_checklist)

    if not data.get("approval_workflow"):
        data["approval_workflow"] = {
            "reviewer_role": data["roles"][1] if len(data["roles"]) > 1 else "Reviewer",
            "approver_role": data["roles"][0] if data["roles"] else "Manager",
            "stage": "Initial Draft",
            "status": "Pending Review",
            "review_notes": "Generated by AI; ready for human review."
        }

    return SOPDocument.model_validate(data).model_dump()


def generate_sop(
    process_name: str,
    department: str = "Operations",
    objective: str = "",
    template_key: str = "onboarding",
    industry: str | None = None,
    audience: str | None = None,
    complexity: str | None = "Medium",
    description: str | None = None,
    frequency: str | None = None,
    policies: str | None = None,
    additional_instructions: str | None = None
) -> dict:
    """
    Generates a structured SOP. If GEMINI_API_KEY is configured and live API is reachable,
    calls Google Gemini. If not configured or if the live call fails, seamlessly falls back
    to high-quality deterministic sample templates to keep the application 100% demoable.
    """
    if not GEMINI_API_KEY:
        logger.info("No GEMINI_API_KEY set; using high-fidelity sample template generator.")
        sample = _sample_sop(
            process_name=process_name,
            department=department,
            objective=objective,
            template_key=template_key,
            industry=industry,
            audience=audience,
            complexity=complexity,
            description=description
        )
        return SOPDocument.model_validate(sample).model_dump()

    try:
        logger.info("Calling Gemini model: %s", GEMINI_MODEL)
        return _gemini_sop(
            process_name=process_name,
            department=department,
            objective=objective,
            template_key=template_key,
            industry=industry,
            audience=audience,
            complexity=complexity,
            description=description,
            frequency=frequency,
            policies=policies,
            additional_instructions=additional_instructions
        )
    except Exception as exc:
        logger.warning("Live Gemini generation failed (%s); returning rich sample fallback.", exc)
        fallback = _sample_sop(
            process_name=process_name,
            department=department,
            objective=objective,
            template_key=template_key,
            industry=industry,
            audience=audience,
            complexity=complexity,
            description=description
        )
        fallback["source"] = "sample"
        return SOPDocument.model_validate(fallback).model_dump()
