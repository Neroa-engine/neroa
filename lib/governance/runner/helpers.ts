import {
  ARCHITECTURE_CONFIDENCE_THRESHOLDS,
  OVERLAY_TYPES,
  type ArchitecturalPhaseId,
  type BranchFamily,
  type BranchStabilityState,
  type ChangeType,
  type ConfidenceDimension,
  type ContradictionSeverity,
  type ExecutionGateOutcome,
  type FieldStatus,
  type GovernanceSystem,
  type ImpactCategory,
  type OverlayType,
  type RiskLevel
} from "../constants";
import type {
  AssumptionReference,
  ContradictionReference,
  ExtractionField
} from "../types";
import type {
  GovernanceRunnerAssumptionInput,
  GovernanceRunnerContradictionInput,
  GovernanceRunnerResolvedContext,
  GovernanceRunnerStructuredRequest
} from "./types";
import { TRUST_CRITICAL_SYSTEMS } from "./context";

const BRANCH_KEYWORDS: Array<{
  branch: BranchFamily;
  keywords: string[];
}> = [
  {
    branch: "Commerce / Ecommerce",
    keywords: ["commerce", "ecommerce", "store", "checkout", "cart", "catalog", "payment"]
  },
  {
    branch: "SaaS / Workflow Platform",
    keywords: ["saas", "workflow", "workspace", "project", "task", "collaboration", "planning"]
  },
  {
    branch: "Marketplace / Multi-Sided Platform",
    keywords: ["marketplace", "vendor", "seller", "buyer", "host", "provider", "two-sided"]
  },
  {
    branch: "Internal Operations / Backoffice Tool",
    keywords: ["internal", "backoffice", "ops", "operator", "admin", "operations"]
  },
  {
    branch: "Content / Community / Membership",
    keywords: ["content", "community", "membership", "course", "forum", "creator", "media"]
  },
  {
    branch: "Booking / Scheduling / Service Delivery",
    keywords: ["booking", "schedule", "appointment", "calendar", "reservation", "service"]
  },
  {
    branch: "Developer Platform / API / Infrastructure",
    keywords: ["developer", "api", "sdk", "infrastructure", "platform", "cli", "integration"]
  },
  {
    branch: "Data / Analytics / Intelligence Platform",
    keywords: ["data", "analytics", "intelligence", "reporting", "insight", "dashboard", "metric"]
  }
];

const SYSTEM_KEYWORDS: Array<{
  system: GovernanceSystem;
  keywords: string[];
}> = [
  {
    system: "Governance",
    keywords: ["governance", "roadmap", "phase map", "scope boundary", "execution gate"]
  },
  {
    system: "Planning intelligence",
    keywords: ["planning", "strategy", "roadmap intelligence", "product truth"]
  },
  {
    system: "Delta-Analyzer / Rebuild Impact Report",
    keywords: ["delta-analyzer", "impact report", "rebuild impact", "change analysis"]
  },
  {
    system: "Auth",
    keywords: ["auth", "login", "signup", "identity", "session", "authentication"]
  },
  {
    system: "Billing / account",
    keywords: ["billing", "account", "subscription", "entitlement", "plan", "payment", "invoice"]
  },
  {
    system: "Routing",
    keywords: ["route", "routing", "navigation", "redirect", "path"]
  },
  {
    system: "Protected routing",
    keywords: ["protected route", "guard", "access gate", "entitlement gate"]
  },
  {
    system: "Backend governance",
    keywords: ["backend governance", "policy", "gate logic", "execution policy"]
  },
  {
    system: "Workspace / project surfaces",
    keywords: ["workspace", "project", "builder", "execution surface", "project surface"]
  },
  {
    system: "Browser / live-view",
    keywords: ["browser", "live-view", "preview", "live rebuild", "preview surface"]
  },
  {
    system: "Future visual editor",
    keywords: ["visual editor", "editor", "drag-and-drop", "canvas"]
  },
  {
    system: "Future orchestration layer",
    keywords: ["orchestration", "autonomous", "agent coordination", "multi-system"]
  },
  {
    system: "Product",
    keywords: ["product", "feature", "capability", "experience"]
  },
  {
    system: "Backend",
    keywords: ["backend", "server", "service", "api handler"]
  },
  {
    system: "Strategy Room",
    keywords: ["strategy room", "support request", "guidance request"]
  },
  {
    system: "Extraction engine",
    keywords: ["extraction", "snapshot", "capture truth", "extract"]
  },
  {
    system: "Question engine",
    keywords: ["question engine", "next question", "clarify", "follow-up question"]
  }
];

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasMeaningfulValue(value: string | number | boolean | undefined | null) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

export function createDeterministicRecordId(prefix: string, seed: string) {
  const normalized = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return normalized ? `${prefix}-${normalized}` : `${prefix}-record`;
}

export function toPercentageConfidence(
  score: number,
  minimum?: number,
  notes?: string
) {
  const boundedScore = clampPercentage(score);
  const boundedMinimum = minimum === undefined ? undefined : clampPercentage(minimum);

  return {
    score: boundedScore,
    scale: "percentage" as const,
    minimum: boundedMinimum,
    passed: boundedMinimum === undefined ? undefined : boundedScore >= boundedMinimum,
    notes
  };
}

export function averageConfidence(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return clampPercentage(total / values.length);
}

export function dedupeStrings<T extends string>(values: T[]) {
  return [...new Set(values)];
}

export function dedupeNumbers<T extends number>(values: T[]) {
  return [...new Set(values)];
}

export function buildRequestSearchText(request: GovernanceRunnerStructuredRequest) {
  return [
    request.requestedChange,
    request.summary,
    request.why,
    request.desiredOutcome,
    request.currentContext,
    request.coreWorkflow,
    request.productType,
    request.businessModel,
    request.brandOrExperienceDirection,
    ...(request.inScopeNow ?? []),
    ...(request.outOfScopeNow ?? []),
    ...(request.futurePhaseCapabilitiesMentioned ?? []),
    ...(request.coreSuccessCriteria ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchScore(text: string, keywords: string[]) {
  return keywords.reduce((score, keyword) => {
    return text.includes(keyword.toLowerCase()) ? score + 1 : score;
  }, 0);
}

export function inferBranchFamily(request: GovernanceRunnerStructuredRequest) {
  if (request.primaryBranch) {
    return {
      primary: request.primaryBranch,
      secondary: dedupeStrings(request.secondaryBranches ?? []),
      confidence: 95,
      stability: request.branchStability ?? "Stable"
    };
  }

  const text = buildRequestSearchText(request);
  const matches = BRANCH_KEYWORDS.map((entry) => ({
    branch: entry.branch,
    score: matchScore(text, entry.keywords)
  })).filter((entry) => entry.score > 0);

  if (matches.length === 0) {
    return {
      primary: "SaaS / Workflow Platform" as const,
      secondary: [] as BranchFamily[],
      confidence: 60,
      stability: "Stable" as const
    };
  }

  matches.sort((left, right) => right.score - left.score);
  const strongest = matches[0];
  const secondary = matches
    .slice(1)
    .filter((entry) => entry.score >= strongest.score - 1)
    .map((entry) => entry.branch);
  const isHybrid = secondary.length >= 2;

  return {
    primary: isHybrid ? ("Hybrid / Composite System" as const) : strongest.branch,
    secondary: isHybrid
      ? dedupeStrings([strongest.branch, ...secondary])
      : dedupeStrings(secondary),
    confidence: clampPercentage(70 + Math.min(strongest.score * 8, 18)),
    stability: isHybrid ? ("Unstable" as const) : ("Stable" as const)
  };
}

export function inferSystemsTouched(
  request: GovernanceRunnerStructuredRequest,
  context: GovernanceRunnerResolvedContext
) {
  const provided = dedupeStrings(request.systemsTouched ?? []);

  if (provided.length > 0) {
    return context.currentOwningSystem
      ? dedupeStrings([context.currentOwningSystem, ...provided])
      : provided;
  }

  const text = buildRequestSearchText(request);
  const inferred = SYSTEM_KEYWORDS.filter((entry) => {
    return entry.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
  }).map((entry) => entry.system);

  if (context.currentOwningSystem) {
    inferred.unshift(context.currentOwningSystem);
  }

  return dedupeStrings(inferred.length > 0 ? inferred : ["Product"]);
}

export function inferOverlayTypes(
  request: GovernanceRunnerStructuredRequest,
  systemsTouched: GovernanceSystem[],
  primaryBranch: BranchFamily
) {
  const active = new Set<OverlayType>(request.overlays ?? []);
  const text = buildRequestSearchText(request);

  if (request.overlays === undefined) {
    if (
      primaryBranch === "Commerce / Ecommerce" ||
      text.includes("commerce") ||
      systemsTouched.includes("Billing / account")
    ) {
      active.add("commerce");
    }

    if (
      systemsTouched.some((system) =>
        [
          "Planning intelligence",
          "Strategy Room",
          "Extraction engine",
          "Question engine"
        ].includes(system)
      ) ||
      text.includes("ai") ||
      text.includes("assistant")
    ) {
      active.add("automation-ai");
    }

    if (
      primaryBranch === "Content / Community / Membership" ||
      text.includes("community") ||
      text.includes("membership")
    ) {
      active.add("content-community");
    }

    if (
      primaryBranch === "Internal Operations / Backoffice Tool" ||
      text.includes("admin") ||
      text.includes("backoffice")
    ) {
      active.add("admin-backoffice");
    }

    if (
      systemsTouched.includes("Browser / live-view") ||
      systemsTouched.includes("Future visual editor")
    ) {
      active.add("browser-live-view");
    }

    if (text.includes("tenant") || text.includes("team") || text.includes("collaboration")) {
      active.add("multi-tenant-collaboration");
    }

    if (
      primaryBranch === "Data / Analytics / Intelligence Platform" ||
      text.includes("analytics") ||
      text.includes("intelligence")
    ) {
      active.add("data-intelligence");
    }
  }

  return OVERLAY_TYPES.map((overlayType) => ({
    overlayType,
    active: active.has(overlayType),
    rationale: active.has(overlayType)
      ? "Activated by explicit input or deterministic inference."
      : "No signal for this overlay appears in the current request."
  }));
}

export function inferChangeType(request: GovernanceRunnerStructuredRequest): ChangeType {
  if (request.changeType) {
    return request.changeType;
  }

  const text = buildRequestSearchText(request);

  if (
    text.includes("remove") ||
    text.includes("delete") ||
    text.includes("replace") ||
    text.includes("rewrite") ||
    text.includes("deprecate")
  ) {
    return "destructive";
  }

  if (
    text.includes("update") ||
    text.includes("change") ||
    text.includes("modify") ||
    text.includes("refactor")
  ) {
    return "modifying";
  }

  return "additive";
}

export function getPhaseForSystem(
  system: GovernanceSystem,
  context: GovernanceRunnerResolvedContext
) {
  return context.systemPhaseMap[system];
}

export function systemsTouchTrustLayer(systems: GovernanceSystem[]) {
  return systems.some((system) =>
    TRUST_CRITICAL_SYSTEMS.includes(system as (typeof TRUST_CRITICAL_SYSTEMS)[number])
  );
}

export function mapAssumptionsToReferences(
  assumptions: GovernanceRunnerAssumptionInput[] | undefined,
  fallbackBranch: BranchFamily,
  fallbackSystems: GovernanceSystem[],
  fallbackPhase: ArchitecturalPhaseId | null
): AssumptionReference[] {
  return (assumptions ?? []).map((assumption, index) => ({
    assumptionId:
      assumption.assumptionId ??
      createDeterministicRecordId("assumption", `${assumption.statement}-${index}`),
    statement: assumption.statement,
    whyInferred: assumption.whyInferred,
    confidence: toPercentageConfidence(assumption.confidenceScore),
    confirmationRequired: assumption.confirmationRequired ?? false,
    sourceEvidence: assumption.sourceEvidence,
    affectedBranches: assumption.affectedBranches ?? [fallbackBranch],
    affectedSystems: assumption.affectedSystems ?? fallbackSystems,
    affectedPhases:
      assumption.affectedPhases ??
      (fallbackPhase === null ? [] : [fallbackPhase]),
    status: assumption.status ?? "open"
  }));
}

export function mapContradictionsToReferences(
  contradictions: GovernanceRunnerContradictionInput[] | undefined
): ContradictionReference[] {
  return (contradictions ?? []).map((contradiction, index) => ({
    contradictionId:
      contradiction.contradictionId ??
      createDeterministicRecordId("contradiction", `${contradiction.title}-${index}`),
    title: contradiction.title,
    contradictionClass: contradiction.contradictionClass,
    severity: contradiction.severity,
    status: contradiction.status ?? "open",
    blocked: contradiction.blocked ?? contradiction.severity === "critical"
  }));
}

export function createField(
  field: Omit<ExtractionField, "confidence"> & {
    score: number;
    minimum?: number;
  }
): ExtractionField {
  return {
    category: field.category,
    status: field.status,
    confidence: toPercentageConfidence(field.score, field.minimum, field.notes),
    notes: field.notes,
    valueSummary: field.valueSummary
  };
}

export function statusFromPresence(
  values: Array<string | number | boolean | undefined | null>
): FieldStatus {
  const present = values.filter((value) => hasMeaningfulValue(value)).length;

  if (present === 0) {
    return "unanswered";
  }

  if (present === values.length) {
    return "answered";
  }

  return "partial";
}

export function summarizeImpactCategory(impactCategory: ImpactCategory) {
  switch (impactCategory) {
    case "architectural":
      return "Architectural" as const;
    case "high":
      return "High" as const;
    case "medium":
      return "Medium" as const;
    default:
      return "Local" as const;
  }
}

export function riskLevelFromImpact(
  impactCategory: ImpactCategory,
  changeType: ChangeType
): RiskLevel {
  if (impactCategory === "architectural") {
    return "critical";
  }

  if (impactCategory === "high") {
    return changeType === "destructive" ? "critical" : "high";
  }

  if (impactCategory === "medium") {
    return changeType === "destructive" ? "high" : "moderate";
  }

  return changeType === "destructive" ? "moderate" : "low";
}

export function buildConfidenceDimensionScores(args: {
  truthCompleteness: number;
  consistency: number;
  branchCertainty: number;
  dependencyClarity: number;
  phaseClarity: number;
  deliveryFeasibility: number;
}) {
  return [
    {
      dimension: "Truth completeness" as ConfidenceDimension,
      score: clampPercentage(args.truthCompleteness)
    },
    {
      dimension: "Consistency" as ConfidenceDimension,
      score: clampPercentage(args.consistency)
    },
    {
      dimension: "Branch certainty" as ConfidenceDimension,
      score: clampPercentage(args.branchCertainty)
    },
    {
      dimension: "Dependency clarity" as ConfidenceDimension,
      score: clampPercentage(args.dependencyClarity)
    },
    {
      dimension: "Phase clarity" as ConfidenceDimension,
      score: clampPercentage(args.phaseClarity)
    },
    {
      dimension: "Delivery feasibility" as ConfidenceDimension,
      score: clampPercentage(args.deliveryFeasibility)
    }
  ];
}

export function evaluateGateOutcome(args: {
  impactCategory: ImpactCategory;
  roadmapRevisionRequired: boolean;
  confidencePassed: boolean;
  futurePhaseTouched: boolean;
  outOfPhase: boolean;
  prohibitedDependencyDetected: boolean;
  blockedContradictionDetected: boolean;
}): ExecutionGateOutcome {
  if (
    args.impactCategory === "architectural" ||
    args.prohibitedDependencyDetected ||
    args.blockedContradictionDetected ||
    !args.confidencePassed
  ) {
    return "Blocked because it causes architectural conflict";
  }

  if (args.futurePhaseTouched || args.outOfPhase) {
    return "Deferred to later phase";
  }

  if (args.roadmapRevisionRequired || args.impactCategory === "high") {
    return "Approved but roadmap must be updated first";
  }

  return "Approved as-is";
}

export function contradictionSeverityRank(severity: ContradictionSeverity) {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "moderate":
      return 2;
    default:
      return 1;
  }
}

export function executionConfidenceMinimum() {
  return ARCHITECTURE_CONFIDENCE_THRESHOLDS.executionCriticalDimensionMinimum;
}

export function roadmapDraftingMinimum() {
  return ARCHITECTURE_CONFIDENCE_THRESHOLDS.roadmapDrafting;
}
