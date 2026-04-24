import type {
  ArchitecturalPhaseId,
  ArchitecturalPhaseStatus,
  GovernanceSystem,
  GovernanceWorkstream,
  RoadmapRevisionStatus
} from "../constants";
import type { GovernanceRecordMetadata } from "./core";

export interface ArchitecturalPhase {
  id: ArchitecturalPhaseId;
  name: string;
  status: ArchitecturalPhaseStatus;
  purpose: string;
  dependsOn: ArchitecturalPhaseId[];
  allowedTouches: string[];
  notAllowedTouches: string[];
  boundary: string;
}

export interface PhaseBoundary {
  phaseId: ArchitecturalPhaseId;
  allowedTouches: string[];
  notAllowedTouches: string[];
  boundary: string;
}

export interface PhaseMapEntry {
  workstream: GovernanceWorkstream;
  primaryPhase: ArchitecturalPhaseId;
  status: ArchitecturalPhaseStatus;
  dependsOn: ArchitecturalPhaseId[];
  notes?: string;
  secondaryPhases?: ArchitecturalPhaseId[];
  owningSystems?: GovernanceSystem[];
}

export interface DependencyMapEdge {
  fromSystem: GovernanceSystem;
  toSystem: GovernanceSystem;
  rationale: string;
  approvedDirection: boolean;
  prohibitedDirection?: boolean;
  notes?: string;
}

export interface RoadmapRevisionRecord extends GovernanceRecordMetadata {
  linkedRequestId?: string;
  linkedDeltaAnalyzerWorksheetId?: string;
  linkedRebuildImpactReportId?: string;
  revisionTitle: string;
  triggeringRequest: string;
  whyRequestForcesRoadmapReview: string;
  originalRoadmapAssumption: string;
  revisedRoadmapAssumption: string;
  whyOriginalAssumptionNoLongerHolds: string;
  phasesAdded: ArchitecturalPhaseId[];
  phasesChanged: ArchitecturalPhaseId[];
  phasesDeferred: ArchitecturalPhaseId[];
  newCurrentPhaseImplication?: string;
  dependencyChanges: DependencyMapEdge[];
  dependencyDirectionConcerns?: string[];
  risksIntroduced?: string[];
  risksReduced?: string[];
  whyRevisionIsJustified: string;
  approvalStatus: RoadmapRevisionStatus;
  approver?: string;
  decisionDate?: string;
  notes?: string;
}

export interface PhaseMappingDecision extends GovernanceRecordMetadata {
  linkedRequestId?: string;
  linkedRebuildImpactReportId?: string;
  requestSummary: string;
  currentWorkstream?: GovernanceWorkstream;
  owningSystem?: GovernanceSystem;
  currentPhaseCandidate?: ArchitecturalPhaseId | null;
  futurePhaseCandidate?: ArchitecturalPhaseId | null;
  secondaryPhasesTouched: ArchitecturalPhaseId[];
  rationale: string;
  dependencyRationale?: string;
  conflictsWithCurrentApprovedArchitecture: boolean;
  conflictExplanation?: string;
  primaryPhaseAssignment?: ArchitecturalPhaseId | null;
  secondaryPhaseAssignments: ArchitecturalPhaseId[];
  outcome: "Approved now" | "Defer to later phase" | "Block";
  why: string;
}

export const ARCHITECTURAL_PHASE_DEFINITIONS: readonly ArchitecturalPhase[] = [
  {
    id: 0,
    name: "Governance Foundation",
    status: "Current",
    purpose: "Establish architecture rules, decision models, confidence thresholds, and durable operating guidance.",
    dependsOn: [],
    allowedTouches: [
      "docs/architecture/*",
      "docs/governance/*",
      "AGENTS.md",
      "future non-runtime governance scaffolding"
    ],
    notAllowedTouches: [
      "runtime product behavior",
      "routing, auth, billing, workspace execution, or backend logic"
    ],
    boundary: "This phase defines the rules for later phases but does not claim runtime enforcement."
  },
  {
    id: 1,
    name: "Product Truth Capture",
    status: "Current",
    purpose: "Capture product truth from Strategy Room and related intake systems before roadmap or execution.",
    dependsOn: [0],
    allowedTouches: [
      "Strategy Room intake behavior",
      "extraction engine logic",
      "question selection engine logic",
      "product truth capture formats"
    ],
    notAllowedTouches: [
      "billing/account behavior",
      "protected routing behavior",
      "execution surfaces beyond approved intake contracts"
    ],
    boundary: "Phase 1 can collect truth and raise contradictions, but it cannot approve execution on its own."
  },
  {
    id: 2,
    name: "Roadmap and Change Control",
    status: "Current",
    purpose: "Analyze change impact, update roadmap when needed, map work to phases, and gate execution.",
    dependsOn: [0, 1],
    allowedTouches: [
      "Delta-Analyzer",
      "Rebuild Impact Report generation",
      "roadmap artifacts",
      "phase mapping logic",
      "contradiction handling",
      "assumption invalidation and rebuild classification"
    ],
    notAllowedTouches: [
      "feature execution without a passed gate",
      "direct UI/runtime shortcuts around governance"
    ],
    boundary: "This phase decides whether work is allowed, revised, deferred, or blocked."
  },
  {
    id: 3,
    name: "Core Execution Surfaces",
    status: "Current",
    purpose: "Deliver approved work inside workspace and project execution surfaces without bypassing governance.",
    dependsOn: [0, 1, 2],
    allowedTouches: [
      "workspace surfaces",
      "project surfaces",
      "stable backend execution paths already mapped by roadmap",
      "planning-to-execution handoff interfaces"
    ],
    notAllowedTouches: [
      "unapproved new branches",
      "out-of-phase capability insertion",
      "billing/auth/platform trust changes unless Phase 4 is explicitly engaged"
    ],
    boundary: "Execution must remain inside the approved phase and approved systems list."
  },
  {
    id: 4,
    name: "Platform Trust and Commerce Control",
    status: "Current-supporting",
    purpose: "Govern auth, billing, account, entitlement, protected routing, and high-risk backend trust boundaries.",
    dependsOn: [0, 1, 2, 3],
    allowedTouches: [
      "auth",
      "billing/account",
      "entitlements",
      "protected routing",
      "backend governance enforcement paths"
    ],
    notAllowedTouches: [
      "opportunistic feature additions through billing/auth work",
      "workspace or UI feature stacking hidden inside trust-layer changes"
    ],
    boundary: "Changes here are high-impact by default and usually require roadmap review first."
  },
  {
    id: 5,
    name: "Browser Visual Editor and Live Rebuild",
    status: "Future",
    purpose: "Add safe browser-based editing, live rebuild previews, and controlled visual mutation tooling.",
    dependsOn: [0, 1, 2, 3, 4],
    allowedTouches: [
      "browser visual editor",
      "live-view mutation surfaces",
      "preview and controlled rebuild orchestration"
    ],
    notAllowedTouches: [
      "direct platform trust mutation",
      "ungoverned cross-system rewrites"
    ],
    boundary: "Editor work remains future-phase until explicitly promoted."
  },
  {
    id: 6,
    name: "System Orchestration and Autonomous Delivery",
    status: "Future",
    purpose: "Coordinate future orchestration layers, autonomous rebuild flows, and multi-system execution.",
    dependsOn: [0, 1, 2, 3, 4, 5],
    allowedTouches: [
      "orchestration layer",
      "autonomous delivery policies",
      "future system-wide coordination"
    ],
    notAllowedTouches: [
      "governance bypasses",
      "implicit phase promotion"
    ],
    boundary: "Orchestration is blocked until earlier phases have durable controls."
  }
] as const;

export const DEFAULT_PHASE_BOUNDARIES: readonly PhaseBoundary[] =
  ARCHITECTURAL_PHASE_DEFINITIONS.map((phase) => ({
    phaseId: phase.id,
    allowedTouches: [...phase.allowedTouches],
    notAllowedTouches: [...phase.notAllowedTouches],
    boundary: phase.boundary
  }));

export const DEFAULT_PHASE_MAP_ENTRIES: readonly PhaseMapEntry[] = [
  {
    workstream: "Strategy Room",
    primaryPhase: 1,
    status: "Current",
    dependsOn: [0],
    notes: "Primary truth-capture conversation layer.",
    owningSystems: ["Strategy Room", "Planning intelligence"]
  },
  {
    workstream: "Extraction engine",
    primaryPhase: 1,
    status: "Current",
    dependsOn: [0],
    notes: "Turns user input into structured product truth.",
    owningSystems: ["Extraction engine", "Planning intelligence"]
  },
  {
    workstream: "Question engine",
    primaryPhase: 1,
    status: "Current",
    dependsOn: [0],
    notes: "Chooses the next question needed to increase truth confidence.",
    owningSystems: ["Question engine", "Planning intelligence"]
  },
  {
    workstream: "Delta-Analyzer",
    primaryPhase: 2,
    status: "Current",
    dependsOn: [0, 1],
    notes: "Mandatory first analysis step for requested changes.",
    owningSystems: ["Delta-Analyzer / Rebuild Impact Report", "Governance"]
  },
  {
    workstream: "Rebuild Impact Report",
    primaryPhase: 2,
    status: "Current",
    dependsOn: [0, 1, 2],
    notes: "Formal report emitted after Delta-Analyzer.",
    owningSystems: ["Delta-Analyzer / Rebuild Impact Report", "Governance"]
  },
  {
    workstream: "Backend governance",
    primaryPhase: 2,
    status: "Current",
    dependsOn: [0, 1],
    notes: "Governs change classification, phase mapping, confidence, and blocking decisions.",
    owningSystems: ["Backend governance", "Governance"]
  },
  {
    workstream: "Workspace / project surfaces",
    primaryPhase: 3,
    status: "Current",
    dependsOn: [0, 1, 2],
    notes: "Runtime execution surfaces for approved work only.",
    owningSystems: ["Workspace / project surfaces", "Product"]
  },
  {
    workstream: "Billing / account",
    primaryPhase: 4,
    status: "Current-supporting",
    dependsOn: [0, 2, 3],
    notes: "High-impact trust surface; maintenance only unless roadmap promoted.",
    owningSystems: ["Billing / account", "Auth"]
  },
  {
    workstream: "Browser visual editor",
    primaryPhase: 5,
    status: "Future",
    dependsOn: [0, 1, 2, 3, 4],
    notes: "Future controlled editing layer.",
    owningSystems: ["Future visual editor", "Browser / live-view"]
  },
  {
    workstream: "Future system / orchestration layer",
    primaryPhase: 6,
    status: "Future",
    dependsOn: [0, 1, 2, 3, 4, 5],
    notes: "Future multi-system delivery coordinator.",
    owningSystems: ["Future orchestration layer", "Governance"]
  }
] as const;

export const DEFAULT_DEPENDENCY_MAP_EDGES: readonly DependencyMapEdge[] = [
  {
    fromSystem: "Governance",
    toSystem: "Planning intelligence",
    rationale: "Questioning and extraction must follow approved branch and confidence rules.",
    approvedDirection: true
  },
  {
    fromSystem: "Planning intelligence",
    toSystem: "Delta-Analyzer / Rebuild Impact Report",
    rationale: "Change analysis needs extracted truth, assumptions, and contradictions.",
    approvedDirection: true
  },
  {
    fromSystem: "Governance",
    toSystem: "Auth",
    rationale: "Identity changes are governed trust-layer work.",
    approvedDirection: true
  },
  {
    fromSystem: "Auth",
    toSystem: "Billing / account",
    rationale: "Entitlements depend on identity and approved platform rules.",
    approvedDirection: true
  },
  {
    fromSystem: "Billing / account",
    toSystem: "Routing",
    rationale: "Capability access must honor trust decisions.",
    approvedDirection: true
  },
  {
    fromSystem: "Governance",
    toSystem: "Backend governance",
    rationale: "Backend gate logic relies on approved rules.",
    approvedDirection: true
  },
  {
    fromSystem: "Backend governance",
    toSystem: "Workspace / project surfaces",
    rationale: "Execution surfaces should only expose approved work to approved users.",
    approvedDirection: true
  },
  {
    fromSystem: "Routing",
    toSystem: "Browser / live-view",
    rationale: "Live-view must respect access and execution boundaries.",
    approvedDirection: true
  },
  {
    fromSystem: "Browser / live-view",
    toSystem: "Future visual editor",
    rationale: "Editor changes require safe previews and impact awareness.",
    approvedDirection: true
  },
  {
    fromSystem: "Future visual editor",
    toSystem: "Future orchestration layer",
    rationale: "Orchestration is downstream of governed editor and execution layers.",
    approvedDirection: true
  },
  {
    fromSystem: "Workspace / project surfaces",
    toSystem: "Billing / account",
    rationale: "Workspace UI must not directly change billing rules.",
    approvedDirection: false,
    prohibitedDirection: true,
    notes: "Prohibited dependency direction from the dependency map."
  },
  {
    fromSystem: "Workspace / project surfaces",
    toSystem: "Auth",
    rationale: "Workspace UI must not directly change auth rules.",
    approvedDirection: false,
    prohibitedDirection: true,
    notes: "Prohibited dependency direction from the dependency map."
  },
  {
    fromSystem: "Browser / live-view",
    toSystem: "Routing",
    rationale: "Browser/live-view must not introduce hidden routing rewrites.",
    approvedDirection: false,
    prohibitedDirection: true,
    notes: "Prohibited dependency direction from the dependency map."
  }
] as const;
