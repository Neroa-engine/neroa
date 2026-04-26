import { runGovernanceAnalysis } from "../../governance/runner/run-governance-analysis.ts";
import type { ArchitectureBlueprint } from "../architecture/types.ts";
import type { ProjectBrief } from "../project-brief.ts";
import type { RoadmapPlan } from "../roadmap/types.ts";
import type { GovernanceDomainDefaults } from "./defaults.ts";
import {
  deltaAnalysisResultSchema,
  roadmapRevisionRecordSchema,
  type DeltaAnalysisResult,
  type GovernancePolicy,
  type RoadmapRevisionRecord
} from "./types.ts";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "into",
  "from",
  "that",
  "this",
  "your",
  "their",
  "phase",
  "lane",
  "module"
]);

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value: string) {
  return normalizeSpace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = normalizeSearchText(value);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(normalizeSpace(value));
  }

  return items;
}

function tokenize(value: string) {
  return normalizeSearchText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function phraseMatches(requestText: string, candidate: string) {
  const normalizedRequest = normalizeSearchText(requestText);
  const normalizedCandidate = normalizeSearchText(candidate);

  if (!normalizedCandidate) {
    return false;
  }

  if (normalizedRequest.includes(normalizedCandidate)) {
    return true;
  }

  const requestTokens = new Set(tokenize(normalizedRequest));
  const candidateTokens = tokenize(normalizedCandidate);

  if (candidateTokens.length === 0) {
    return false;
  }

  const overlap = candidateTokens.filter((token) => requestTokens.has(token)).length;
  return overlap >= Math.min(2, candidateTokens.length);
}

function anyPhraseMatches(requestText: string, values: readonly string[]) {
  return values.some((value) => phraseMatches(requestText, value));
}

function collectAffectedReferences(args: {
  request: string;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
}) {
  const matchedModuleIds = uniqueStrings(
    args.architectureBlueprint.modules.flatMap((module) => {
      const phrases = [
        module.id.replace(/_/g, " "),
        module.name,
        module.purpose,
        module.ownedSurface ?? ""
      ];

      return anyPhraseMatches(args.request, phrases) ? [module.id] : [];
    })
  );
  const matchedLaneIds = uniqueStrings(
    args.architectureBlueprint.lanes.flatMap((lane) => {
      const phrases = [
        lane.id.replace(/_/g, " "),
        lane.name,
        lane.purpose
      ];

      return anyPhraseMatches(args.request, phrases) ? [lane.id] : [];
    })
  );
  const integrationBackedModuleIds = uniqueStrings(
    args.architectureBlueprint.integrations.flatMap((integration) => {
      const phrases = [
        integration.id.replace(/_/g, " "),
        integration.name,
        integration.purpose,
        integration.notes ?? ""
      ];

      return anyPhraseMatches(args.request, phrases) ? integration.moduleIds : [];
    })
  );
  const notInScopePhaseIds = uniqueStrings(
    args.roadmapPlan.phases.flatMap((phase) =>
      phase.notInScope.some((item) =>
        anyPhraseMatches(args.request, [item.label, item.reason])
      )
        ? [phase.phaseId]
        : []
    )
  );
  const matchedPhaseIds = uniqueStrings(
    args.roadmapPlan.phases.flatMap((phase) => {
      const phrases = [
        phase.phaseId.replace(/_/g, " "),
        phase.name,
        phase.goal,
        phase.targetOutcome,
        ...phase.deliverables,
        ...phase.notInScope.map((item) => item.label),
        ...phase.acceptanceCriteria.map((criterion) => criterion.label)
      ];

      return anyPhraseMatches(args.request, phrases) ? [phase.phaseId] : [];
    })
  );
  const affectedModuleIds = uniqueStrings([
    ...matchedModuleIds,
    ...integrationBackedModuleIds,
    ...args.architectureBlueprint.modules
      .filter((module) => matchedLaneIds.includes(module.laneId))
      .map((module) => module.id)
  ]);
  const affectedLaneIds = uniqueStrings([
    ...matchedLaneIds,
    ...args.architectureBlueprint.modules
      .filter((module) => affectedModuleIds.includes(module.id))
      .map((module) => module.laneId)
  ]);
  const affectedPhaseIds = uniqueStrings([
    ...matchedPhaseIds,
    ...notInScopePhaseIds,
    ...args.roadmapPlan.phases
      .filter(
        (phase) =>
          phase.moduleIds.some((moduleId) => affectedModuleIds.includes(moduleId)) ||
          phase.laneIds.some((laneId) => affectedLaneIds.includes(laneId))
      )
      .map((phase) => phase.phaseId)
  ]);

  return {
    affectedModuleIds,
    affectedLaneIds,
    affectedPhaseIds
  };
}

function runSupportingGovernanceAnalysis(args: {
  request: string;
  projectBrief: ProjectBrief;
  governancePolicy: GovernancePolicy;
  roadmapPlan: RoadmapPlan;
}) {
  try {
    return runGovernanceAnalysis({
      preparedBy: "Governance Intelligence Delta Layer",
      request: {
        requestId: `governance-delta-${slugify(args.request) || "request"}`,
        requestedChange: args.request,
        summary: args.request,
        why:
          args.projectBrief.problemStatement ??
          args.roadmapPlan.mvpDefinition.summary,
        desiredOutcome:
          args.projectBrief.outcomePromise ??
          args.roadmapPlan.mvpDefinition.summary,
        requestOrigin: "User request",
        primaryUsers: uniqueStrings([
          ...args.projectBrief.buyerPersonas,
          ...args.projectBrief.operatorPersonas
        ]),
        primaryBuyers: [...args.projectBrief.buyerPersonas],
        primaryAdminsOrOperators: uniqueStrings([
          ...args.projectBrief.operatorPersonas,
          ...args.projectBrief.adminPersonas
        ]),
        coreWorkflow: args.roadmapPlan.mvpDefinition.summary,
        productType: args.projectBrief.productCategory ?? undefined
      },
      providedContext: {
        currentApprovedPhase: 3,
        currentOwningSystem: "Workspace / project surfaces",
        currentRoadmapAssumption: args.governancePolicy.currentApprovalState
          .roadmapScopeApproved
          ? "Roadmap scope is currently approved."
          : "Roadmap scope is not yet approved."
      }
    });
  } catch {
    return null;
  }
}

function buildReason(args: {
  requestClass: DeltaAnalysisResult["requestClass"];
  request: string;
  notInScopeLabels: readonly string[];
  defaults: GovernanceDomainDefaults;
  runnerGateOutcome: string | null;
}) {
  if (args.requestClass === "governance_conflict") {
    return "The request tries to bypass an explicit governance guardrail, so it cannot be treated as normal scope work.";
  }

  if (args.requestClass === "architecture_expansion") {
    return args.runnerGateOutcome === "Blocked because it causes architectural conflict"
      ? "The supporting governance runner flagged an architectural contradiction, so architecture must refresh before the roadmap can stay trustworthy."
      : "The request adds system footprint beyond the current architecture draft, so architecture must refresh before the roadmap can stay trustworthy.";
  }

  if (args.requestClass === "scope_expansion") {
    return args.notInScopeLabels.length > 0
      ? `The request touches roadmap items that are currently outside the approved MVP boundary: ${args.notInScopeLabels.join(
          ", "
        )}.`
      : "The request widens the current MVP boundary, so the roadmap must be revised before execution can continue.";
  }

  if (args.requestClass === "pre_approval_request") {
    return "The request stays close to the current roadmap, but roadmap and scope approval are not complete yet.";
  }

  return "The request maps cleanly to the current approved roadmap and architecture boundaries.";
}

function buildSuggestedNextAction(args: {
  requestClass: DeltaAnalysisResult["requestClass"];
  defaults: GovernanceDomainDefaults;
}) {
  if (args.requestClass === "governance_conflict") {
    return args.defaults.deltaNextActions.governanceConflict;
  }

  if (args.requestClass === "architecture_expansion") {
    return args.defaults.deltaNextActions.architectureExpansion;
  }

  if (args.requestClass === "scope_expansion") {
    return args.defaults.deltaNextActions.scopeExpansion;
  }

  if (args.requestClass === "pre_approval_request") {
    return args.defaults.deltaNextActions.preApproval;
  }

  return args.defaults.deltaNextActions.withinScope;
}

export function analyzeGovernanceDelta(args: {
  request: string;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  defaults: GovernanceDomainDefaults;
}): DeltaAnalysisResult {
  const request = cleanText(args.request);
  const references = collectAffectedReferences({
    request,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan
  });
  const notInScopeLabels = uniqueStrings(
    args.roadmapPlan.phases.flatMap((phase) =>
      phase.notInScope
        .filter((item) => anyPhraseMatches(request, [item.label, item.reason]))
        .map((item) => item.label)
    )
  );
  const scopeExpansionDetected =
    notInScopeLabels.length > 0 ||
    anyPhraseMatches(request, [
      ...args.defaults.roadmapExpansionSignals,
      ...args.roadmapPlan.phases.flatMap((phase) =>
        phase.notInScope.map((item) => item.label)
      ),
      ...args.roadmapPlan.mvpDefinition.deferredItems,
      ...args.projectBrief.excludedFeatures
    ]);
  const supportingGovernanceAnalysis = runSupportingGovernanceAnalysis({
    request,
    projectBrief: args.projectBrief,
    governancePolicy: args.governancePolicy,
    roadmapPlan: args.roadmapPlan
  });
  const runnerGateOutcome =
    supportingGovernanceAnalysis?.deltaAnalyzerResult.recommendedGateOutcome ?? null;
  const runnerScopeExpansion =
    runnerGateOutcome === "Approved but roadmap must be updated first" ||
    runnerGateOutcome === "Deferred to later phase" ||
    Boolean(supportingGovernanceAnalysis?.deltaAnalyzerResult.roadmapRevisionRequired);
  const governanceConflictDetected =
    anyPhraseMatches(request, args.defaults.governanceConflictSignals);
  const architectureExpansionDetected =
    anyPhraseMatches(request, [
      ...args.defaults.architectureExpansionSignals,
      ...args.architectureBlueprint.openQuestions.map((question) => question.label),
      ...args.architectureBlueprint.openQuestions.map((question) => question.question)
    ]) ||
    args.architectureBlueprint.integrations.some(
      (integration) =>
        integration.requiredForMvp === false &&
        anyPhraseMatches(request, [integration.name, integration.id.replace(/_/g, " ")])
    );

  const requestClass = governanceConflictDetected
    ? "governance_conflict"
    : scopeExpansionDetected
        ? "scope_expansion"
        : architectureExpansionDetected
          ? "architecture_expansion"
          : runnerScopeExpansion
            ? "scope_expansion"
        : args.governancePolicy.currentApprovalState.roadmapScopeApproved
          ? "within_approved_scope"
          : "pre_approval_request";
  const outcome =
    requestClass === "governance_conflict"
      ? "governance_blocked"
      : requestClass === "architecture_expansion"
        ? "architecture_revision_required"
        : requestClass === "scope_expansion"
          ? "roadmap_revision_required"
          : requestClass === "pre_approval_request"
            ? "pending_execution"
            : "execution_ready_after_gate";
  const requiresRoadmapRevision =
    outcome === "roadmap_revision_required" ||
    outcome === "architecture_revision_required";
  const requiresArchitectureRevision =
    outcome === "architecture_revision_required";
  const requiresGovernanceReview =
    requestClass !== "within_approved_scope" ||
    Boolean(
      supportingGovernanceAnalysis &&
        supportingGovernanceAnalysis.deltaAnalyzerResult.recommendedGateOutcome !==
          "Approved as-is"
    );
  const requiresApprovalReset =
    args.governancePolicy.currentApprovalState.roadmapScopeApproved &&
    (requiresRoadmapRevision ||
      requiresArchitectureRevision ||
      requestClass === "governance_conflict");

  return deltaAnalysisResultSchema.parse({
    requestClass,
    outcome,
    reason: buildReason({
      requestClass,
      request,
      notInScopeLabels,
      defaults: args.defaults,
      runnerGateOutcome
    }),
    affectedLaneIds: references.affectedLaneIds,
    affectedModuleIds: references.affectedModuleIds,
    affectedPhaseIds: references.affectedPhaseIds,
    requiresRoadmapRevision,
    requiresArchitectureRevision,
    requiresGovernanceReview,
    shouldSaveAsPendingExecution:
      outcome !== "execution_ready_after_gate" ||
      !args.governancePolicy.currentApprovalState.roadmapScopeApproved,
    requiresApprovalReset,
    suggestedNextSurface:
      outcome === "execution_ready_after_gate" ? "build_room" : "strategy_room",
    suggestedNextAction: buildSuggestedNextAction({
      requestClass,
      defaults: args.defaults
    })
  });
}

export function createRoadmapRevisionRecordFromDelta(args: {
  governancePolicy: GovernancePolicy;
  deltaAnalysis: DeltaAnalysisResult;
  triggeredBy: string;
}) {
  if (
    !args.deltaAnalysis.requiresRoadmapRevision &&
    !args.deltaAnalysis.requiresArchitectureRevision &&
    !args.deltaAnalysis.requiresApprovalReset
  ) {
    return null;
  }

  return roadmapRevisionRecordSchema.parse({
    revisionId: `${args.governancePolicy.projectId}:revision:${slugify(
      args.deltaAnalysis.reason
    ) || "pending"}`,
    reason: args.deltaAnalysis.reason,
    requestClass: args.deltaAnalysis.requestClass,
    triggeredBy: args.triggeredBy,
    sourceRoadmapPlanId: args.governancePolicy.sourceRoadmapPlanRef,
    sourceGovernancePolicyId: args.governancePolicy.governanceId,
    requiresArchitectureRefresh: args.deltaAnalysis.requiresArchitectureRevision,
    requiresRoadmapRefresh:
      args.deltaAnalysis.requiresRoadmapRevision ||
      args.deltaAnalysis.requiresArchitectureRevision,
    requiresApprovalReset: args.deltaAnalysis.requiresApprovalReset,
    status: "pending_review"
  });
}

export function validateGovernanceDeltaReferences(args: {
  deltaAnalysis: DeltaAnalysisResult;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
}) {
  const laneIds = new Set(args.architectureBlueprint.lanes.map((lane) => lane.id));
  const moduleIds = new Set(args.architectureBlueprint.modules.map((module) => module.id));
  const phaseIds = new Set(args.roadmapPlan.phases.map((phase) => phase.phaseId));

  return {
    unknownLaneIds: args.deltaAnalysis.affectedLaneIds.filter((laneId) => !laneIds.has(laneId)),
    unknownModuleIds: args.deltaAnalysis.affectedModuleIds.filter(
      (moduleId) => !moduleIds.has(moduleId)
    ),
    unknownPhaseIds: args.deltaAnalysis.affectedPhaseIds.filter((phaseId) => !phaseIds.has(phaseId))
  };
}
