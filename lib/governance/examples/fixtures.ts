import { runGovernanceAnalysis } from "../runner/run-governance-analysis";
import type { GovernanceRunnerInput } from "../runner/types";

export const GOVERNANCE_RUNNER_EXAMPLE_INPUTS: Record<string, GovernanceRunnerInput> = {
  localAdditive: {
    preparedBy: "Governance Runner Example",
    request: {
      requestId: "example-local-additive",
      requestedChange:
        "Add a governance-only clarification note to the Execution Gate Decision operating assets.",
      summary: "Documentation-only governance clarification.",
      why: "The team wants clearer reusable guidance without changing runtime execution.",
      desiredOutcome:
        "A small, contained governance-doc improvement inside the current foundation phase.",
      requestOrigin: "User request",
      primaryBranch: "SaaS / Workflow Platform",
      primaryUsers: ["Internal product and engineering operators"],
      primaryAdminsOrOperators: ["Governance maintainers"],
      coreWorkflow:
        "Review governance assets and add a narrow clarification to the existing pack.",
      systemsTouched: ["Governance"],
      inScopeNow: ["Governance asset clarification"],
      outOfScopeNow: ["Runtime product behavior"],
      coreSuccessCriteria: ["Governance rules stay explicit and consistent."]
    },
    providedContext: {
      currentApprovedPhase: 0,
      currentOwningSystem: "Governance",
      currentRoadmapAssumption:
        "Phase 0 governs docs, durable instructions, and non-runtime scaffolding only."
    }
  },
  mediumPhaseMismatch: {
    preparedBy: "Governance Runner Example",
    request: {
      requestId: "example-medium-phase-mismatch",
      requestedChange:
        "Expose extracted product-truth summaries inside workspace/project surfaces during an active truth-capture phase.",
      summary: "Cross-phase request from intake into execution surfaces.",
      why: "Stakeholders want extraction summaries visible earlier in the delivery chain.",
      desiredOutcome: "Structured extraction output is available later in the workspace flow.",
      requestOrigin: "Roadmap follow-up",
      primaryBranch: "SaaS / Workflow Platform",
      primaryUsers: ["Founders"],
      primaryAdminsOrOperators: ["Workspace operators"],
      coreWorkflow:
        "Capture product truth first, then later expose approved truth artifacts inside execution surfaces.",
      systemsTouched: ["Planning intelligence", "Workspace / project surfaces"],
      inScopeNow: ["Truth capture analysis"],
      outOfScopeNow: ["Immediate execution-surface rollout"],
      coreSuccessCriteria: ["Phase ownership stays explicit."]
    },
    providedContext: {
      currentApprovedPhase: 1,
      currentOwningSystem: "Planning intelligence",
      currentRoadmapAssumption:
        "Product truth capture is approved before workspace execution surfaces consume it."
    }
  },
  highRoadmapRevision: {
    preparedBy: "Governance Runner Example",
    request: {
      requestId: "example-high-roadmap-revision",
      requestedChange:
        "Expand the approved governance change pack to include protected routing and billing-account entitlement review.",
      summary: "High-impact supporting-phase governance expansion.",
      why: "A new request needs trust-layer dependency review before execution planning can stay coherent.",
      desiredOutcome:
        "Trust-layer implications are accounted for in the roadmap before any execution work begins.",
      requestOrigin: "Internal architecture change",
      primaryBranch: "SaaS / Workflow Platform",
      primaryUsers: ["Workspace users"],
      primaryBuyers: ["Account owners"],
      primaryAdminsOrOperators: ["Platform operators"],
      coreWorkflow:
        "Run governance analysis, revise roadmap sequencing, then route any approved trust-layer work through the proper phase.",
      systemsTouched: ["Billing / account", "Protected routing", "Backend governance"],
      inScopeNow: ["Roadmap revision for trust-layer work"],
      outOfScopeNow: ["Direct runtime trust mutation"],
      coreSuccessCriteria: ["Trust-layer dependencies are reviewed before execution."],
      knownRisks: ["Entitlement changes can widen regression exposure."]
    },
    providedContext: {
      currentApprovedPhase: 4,
      currentOwningSystem: "Backend governance",
      currentRoadmapAssumption:
        "Phase 4 changes are maintenance-only and require deliberate roadmap sequencing."
    }
  },
  architecturalConflict: {
    preparedBy: "Governance Runner Example",
    request: {
      requestId: "example-architectural-conflict",
      requestedChange:
        "Allow workspace/project surfaces to write billing entitlements directly without backend-governance review.",
      summary: "Direct trust-boundary bypass request.",
      why: "A shortcut is being requested to speed up delivery.",
      desiredOutcome: "Billing changes would be applied directly from the workspace surface.",
      requestOrigin: "User request",
      primaryBranch: "SaaS / Workflow Platform",
      primaryUsers: ["Workspace users"],
      primaryAdminsOrOperators: ["Workspace operators"],
      coreWorkflow:
        "Workspace actions would change billing entitlements without the approved trust-layer control path.",
      systemsTouched: ["Workspace / project surfaces", "Billing / account"],
      inScopeNow: ["Workspace-triggered entitlement updates"],
      outOfScopeNow: ["Governed backend trust sequencing"],
      coreSuccessCriteria: ["Shortcut path is evaluated against governance rules."]
    },
    providedContext: {
      currentApprovedPhase: 3,
      currentOwningSystem: "Workspace / project surfaces",
      currentRoadmapAssumption:
        "Workspace execution surfaces must not directly mutate trust-layer systems."
    }
  }
};

export const GOVERNANCE_RUNNER_EXAMPLE_OUTPUTS = Object.fromEntries(
  Object.entries(GOVERNANCE_RUNNER_EXAMPLE_INPUTS).map(([key, input]) => {
    return [key, runGovernanceAnalysis(input)];
  })
);
