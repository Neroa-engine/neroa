export const BRANCH_FAMILIES = [
  "Commerce / Ecommerce",
  "SaaS / Workflow Platform",
  "Marketplace / Multi-Sided Platform",
  "Internal Operations / Backoffice Tool",
  "Content / Community / Membership",
  "Booking / Scheduling / Service Delivery",
  "Hybrid / Composite System",
  "Developer Platform / API / Infrastructure",
  "Data / Analytics / Intelligence Platform"
] as const;

export type BranchFamily = (typeof BRANCH_FAMILIES)[number];

export const OVERLAY_TYPES = [
  "automation-ai",
  "commerce",
  "multi-tenant-collaboration",
  "content-community",
  "admin-backoffice",
  "browser-live-view",
  "data-intelligence"
] as const;

export type OverlayType = (typeof OVERLAY_TYPES)[number];

export const FIELD_STATUSES = [
  "unanswered",
  "partial",
  "answered",
  "inferred",
  "conflicting",
  "validated"
] as const;

export type FieldStatus = (typeof FIELD_STATUSES)[number];

export const READINESS_STATES = [
  "not_ready",
  "provisional",
  "ready",
  "blocked"
] as const;

export type ReadinessState = (typeof READINESS_STATES)[number];

export const CONTRADICTION_CLASSES = [
  "Scope contradiction",
  "Architecture contradiction",
  "Budget / timeline contradiction",
  "MVP contradiction",
  "Other"
] as const;

export type ContradictionClass = (typeof CONTRADICTION_CLASSES)[number];

export const CONTRADICTION_SEVERITIES = [
  "minor",
  "moderate",
  "high",
  "critical"
] as const;

export type ContradictionSeverity = (typeof CONTRADICTION_SEVERITIES)[number];

export const CONTRADICTION_STATUSES = [
  "open",
  "resolved"
] as const;

export type ContradictionStatus = (typeof CONTRADICTION_STATUSES)[number];

export const RISK_LEVELS = [
  "low",
  "moderate",
  "high",
  "critical"
] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];

export const CHANGE_TYPES = [
  "additive",
  "modifying",
  "destructive"
] as const;

export type ChangeType = (typeof CHANGE_TYPES)[number];

export const IMPACT_CATEGORIES = [
  "local",
  "medium",
  "high",
  "architectural"
] as const;

export type ImpactCategory = (typeof IMPACT_CATEGORIES)[number];

export const EXECUTION_GATE_OUTCOMES = [
  "Approved as-is",
  "Approved but roadmap must be updated first",
  "Deferred to later phase",
  "Blocked because it causes architectural conflict"
] as const;

export type ExecutionGateOutcome = (typeof EXECUTION_GATE_OUTCOMES)[number];

export const EXTRACTION_CATEGORIES = [
  "Request identity",
  "Primary branch classification",
  "User / buyer / operator",
  "Core outcome",
  "MVP scope",
  "Workflow truth",
  "Systems touched",
  "Data / integrations",
  "Constraints",
  "Success criteria",
  "Assumptions",
  "Unknowns"
] as const;

export type ExtractionCategory = (typeof EXTRACTION_CATEGORIES)[number];

export const ARCHITECTURAL_PHASE_IDS = [
  0,
  1,
  2,
  3,
  4,
  5,
  6
] as const;

export type ArchitecturalPhaseId = (typeof ARCHITECTURAL_PHASE_IDS)[number];

export const ARCHITECTURAL_PHASE_STATUSES = [
  "Current",
  "Current-supporting",
  "Future"
] as const;

export type ArchitecturalPhaseStatus = (typeof ARCHITECTURAL_PHASE_STATUSES)[number];

export const GOVERNANCE_SYSTEMS = [
  "Governance",
  "Planning intelligence",
  "Delta-Analyzer / Rebuild Impact Report",
  "Auth",
  "Billing / account",
  "Routing",
  "Protected routing",
  "Backend governance",
  "Workspace / project surfaces",
  "Browser / live-view",
  "Future visual editor",
  "Future orchestration layer",
  "Product",
  "Backend",
  "Strategy Room",
  "Extraction engine",
  "Question engine"
] as const;

export type GovernanceSystem = (typeof GOVERNANCE_SYSTEMS)[number];

export const WORKSTREAMS = [
  "Strategy Room",
  "Extraction engine",
  "Question engine",
  "Delta-Analyzer",
  "Rebuild Impact Report",
  "Backend governance",
  "Workspace / project surfaces",
  "Billing / account",
  "Browser visual editor",
  "Future system / orchestration layer"
] as const;

export type GovernanceWorkstream = (typeof WORKSTREAMS)[number];

export const REQUEST_ORIGINS = [
  "User request",
  "Bug / regression",
  "Roadmap follow-up",
  "Internal architecture change",
  "Other"
] as const;

export type RequestOrigin = (typeof REQUEST_ORIGINS)[number];

export const BRANCH_STABILITY_STATES = [
  "Stable",
  "Unstable"
] as const;

export type BranchStabilityState = (typeof BRANCH_STABILITY_STATES)[number];

export const ASSUMPTION_STATUSES = [
  "open",
  "validated",
  "invalidated",
  "replaced"
] as const;

export type AssumptionStatus = (typeof ASSUMPTION_STATUSES)[number];

export const ROADMAP_REVISION_STATUSES = [
  "draft",
  "proposed",
  "approved",
  "rejected"
] as const;

export type RoadmapRevisionStatus = (typeof ROADMAP_REVISION_STATUSES)[number];

export const CONFIDENCE_DIMENSIONS = [
  "Truth completeness",
  "Consistency",
  "Branch certainty",
  "Dependency clarity",
  "Phase clarity",
  "Delivery feasibility"
] as const;

export type ConfidenceDimension = (typeof CONFIDENCE_DIMENSIONS)[number];

export const GOVERNANCE_WORKFLOW_STEPS = [
  "Extraction Snapshot",
  "Delta-Analyzer Worksheet",
  "Rebuild Impact Report",
  "Roadmap Revision Record",
  "Phase Mapping Decision",
  "Execution Gate Decision"
] as const;

export type GovernanceWorkflowStep = (typeof GOVERNANCE_WORKFLOW_STEPS)[number];

export const EXECUTION_PRECONDITIONS = [
  "Extraction sufficiency",
  "Branch classification stable",
  "Delta-Analyzer complete",
  "Rebuild Impact Report complete",
  "Phase mapping complete",
  "Roadmap revision complete if required"
] as const;

export type ExecutionPrecondition = (typeof EXECUTION_PRECONDITIONS)[number];

export const ARCHITECTURE_CONFIDENCE_THRESHOLDS = {
  extractionSufficiency: 65,
  roadmapDrafting: 72,
  phaseMapping: 78,
  executionEligibility: 85,
  executionCriticalDimensionMinimum: 80,
  extractionCriticalCategoryMinimum: 60,
  roadmapBranchCertaintyMinimum: 70,
  phaseMappingDependencyClarityMinimum: 75
} as const;

export const CONFIDENCE_SCORE_RANGES = {
  unitIntervalMin: 0,
  unitIntervalMax: 1,
  percentageMin: 0,
  percentageMax: 100
} as const;
