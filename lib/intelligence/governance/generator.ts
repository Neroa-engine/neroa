import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import type { ArchitectureBlueprint } from "../architecture/types.ts";
import type { ProjectBrief } from "../project-brief.ts";
import type { RoadmapPlan } from "../roadmap/types.ts";
import { getGovernanceDomainDefaults } from "./defaults.ts";
import { buildGovernanceApprovalReadiness } from "./approval-readiness.ts";
import {
  billingProtectionSchema,
  currentApprovalStateSchema,
  deltaAnalyzerPolicySchema,
  governanceAssumptionSchema,
  governancePolicySchema,
  governanceRiskSchema,
  hardGuardsSchema,
  laneRulesSchema,
  qaRulesSchema,
  scopeApprovalRecordSchema,
  type GovernancePolicy,
  type ScopeApprovalRecord
} from "./types.ts";

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: readonly string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const value of values) {
    const normalized = normalizeSpace(value).toLowerCase();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(normalizeSpace(value));
  }

  return items;
}

function buildGovernanceRef(args: {
  workspaceId?: string | null;
  projectId: string;
}) {
  return `${cleanText(args.workspaceId) || "workspace"}:${args.projectId}:governance-policy`;
}

function buildHardGuards(args: {
  defaults: ReturnType<typeof getGovernanceDomainDefaults>;
}) {
  return hardGuardsSchema.parse({
    noExecutionBeforeApproval: true,
    noSilentScopeExpansion: true,
    noArchitectureExpansionWithoutRefresh: true,
    blockedRequestsStayPendingExecution: true,
    strategyRoomApprovalAuthorityRequired: true,
    approvalAuthoritySurface: "strategy_room",
    notes: uniqueStrings([
      ...args.defaults.hardGuardNotes,
      "Requests outside the approved roadmap must stay pending execution until Strategy Room resolves them."
    ])
  });
}

function buildBillingProtection(args: {
  domainPack: ProjectBrief["domainPack"];
}) {
  const domainFailureClasses =
    args.domainPack === "crypto_analytics"
      ? ["provider_ingestion_failure", "score_generation_failure"]
      : args.domainPack === "restaurant_sales"
        ? ["connector_sync_failure", "reporting_refresh_failure"]
        : ["integration_failure"];

  return billingProtectionSchema.parse({
    nonBillableFailureClasses: uniqueStrings([
      "planner_loop",
      "classification_failure",
      "storage_unavailable",
      "relay_failure",
      "worker_trigger_failure",
      "retry_exhausted",
      ...domainFailureClasses
    ]),
    maxSystemRetriesPerStep: 2,
    architectureApprovalRequiredBeforeExecution: true,
    deltaAnalysisRequiredForScopeChange: true,
    systemFailuresDoNotAdvanceBilling: true,
    plannerLoopProtection: true
  });
}

function buildLaneRules(architectureBlueprint: ArchitectureBlueprint) {
  return laneRulesSchema.parse({
    noCrossLaneChangesWithoutApproval: true,
    worktreePerLaneRequired: true,
    protectedPathsByLane: Object.fromEntries(
      architectureBlueprint.lanes.map((lane) => [lane.id, lane.protectedPaths])
    ),
    mergePolicyByLane: Object.fromEntries(
      architectureBlueprint.lanes.map((lane) => [lane.id, lane.mergePolicy])
    )
  });
}

function buildQaRules(architectureBlueprint: ArchitectureBlueprint) {
  const hasHighRiskModule = architectureBlueprint.modules.some(
    (module) => module.riskLevel === "high"
  );

  return qaRulesSchema.parse({
    qaRequiredBeforeMerge: true,
    acceptanceArtifactsRequired: true,
    rollbackPlanRequiredForRiskyChanges: hasHighRiskModule,
    approvalEvidenceRequiredBeforeScopeApproval: true,
    requiredArtifactClasses: uniqueStrings([
      "acceptance evidence",
      "qa notes",
      ...(hasHighRiskModule ? ["rollback plan for high-risk changes"] : [])
    ])
  });
}

function buildDeltaAnalyzerPolicy(args: {
  defaults: ReturnType<typeof getGovernanceDomainDefaults>;
}) {
  return deltaAnalyzerPolicySchema.parse({
    sameScopeOutcome: "execution_ready_after_gate",
    preApprovalOutcome: "pending_execution",
    scopeExpansionOutcome: "roadmap_revision_required",
    architectureExpansionOutcome: "architecture_revision_required",
    governanceConflictOutcome: "governance_blocked",
    roadmapExpansionSignals: [...args.defaults.roadmapExpansionSignals],
    architectureExpansionSignals: [...args.defaults.architectureExpansionSignals],
    governanceConflictSignals: [...args.defaults.governanceConflictSignals]
  });
}

function buildGovernanceRisks(args: {
  defaults: ReturnType<typeof getGovernanceDomainDefaults>;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
}) {
  const risks = [
    ...args.defaults.riskTemplates,
    ...args.architectureBlueprint.architectureRisks.map((risk) =>
      governanceRiskSchema.parse({
        id: `architecture-${risk.id}`,
        title: risk.title,
        severity: risk.severity,
        area: risk.area,
        description: risk.description,
        mitigation: risk.mitigation,
        relatedPhaseIds: uniqueStrings(
          args.roadmapPlan.phases
            .filter((phase) =>
              phase.moduleIds.some((moduleId) => risk.relatedModuleIds.includes(moduleId))
            )
            .map((phase) => phase.phaseId)
        ),
        relatedModuleIds: [...risk.relatedModuleIds],
        relatedInputIds: [...risk.relatedInputIds]
      })
    ),
    ...args.roadmapPlan.roadmapRisks.map((risk) =>
      governanceRiskSchema.parse({
        id: `roadmap-${risk.id}`,
        title: risk.title,
        severity: risk.severity,
        area: risk.area,
        description: risk.description,
        mitigation: risk.mitigation,
        relatedPhaseIds: [...risk.relatedPhaseIds],
        relatedModuleIds: [...risk.relatedModuleIds],
        relatedInputIds: []
      })
    )
  ];
  const seen = new Set<string>();

  return risks.filter((risk) => {
    const key = `${risk.title.toLowerCase()}::${risk.area.toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildAssumptions(args: {
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
}) {
  const statements = uniqueStrings([
    ...args.projectBrief.assumptionsMade,
    ...args.architectureBlueprint.assumptionsMade,
    ...args.roadmapPlan.assumptionsMade.map((assumption) => assumption.statement),
    "Governance is being derived from the shared roadmap and architecture layers instead of a separate editor."
  ]);

  return statements.map((statement, index) =>
    governanceAssumptionSchema.parse({
      id: `governance-assumption-${index + 1}`,
      statement
    })
  );
}

function buildScopeApprovalRecord(args: {
  governanceId: string;
  roadmapPlan: RoadmapPlan;
  approvalReadiness: GovernancePolicy["approvalReadiness"];
  currentRevisionId: string | null;
  storedScopeApprovalRecord?: ScopeApprovalRecord | null;
}) {
  const existing = args.storedScopeApprovalRecord ?? null;
  const existingWasApproved = existing?.status === "approved";
  const status =
    existingWasApproved && args.currentRevisionId
      ? "superseded"
      : existing?.status ??
        (args.approvalReadiness.approvalAllowed ? "pending_approval" : "draft");

  return scopeApprovalRecordSchema.parse({
    approvalRecordId:
      existing?.approvalRecordId ??
      `${args.governanceId}:scope-approval-record`,
    sourceRoadmapPlanId: args.roadmapPlan.roadmapId,
    sourceGovernancePolicyId: args.governanceId,
    status,
    approvedAt: existing?.approvedAt ?? null,
    approvedBy: existing?.approvedBy ?? null,
    unresolvedBlockerIds: [...args.approvalReadiness.unresolvedChecklistItemIds],
    supersededByRevisionId:
      args.currentRevisionId ?? existing?.supersededByRevisionId ?? null
  });
}

function buildCurrentApprovalState(args: {
  approvalReadiness: GovernancePolicy["approvalReadiness"];
  scopeApprovalRecord: NonNullable<GovernancePolicy["scopeApprovalRecord"]>;
  activeRevisionId: string | null;
}) {
  const roadmapScopeApproved =
    args.scopeApprovalRecord.status === "approved" && !args.activeRevisionId;
  const status = args.activeRevisionId
    ? "revision_required"
    : roadmapScopeApproved
      ? "approved"
      : args.approvalReadiness.approvalAllowed
        ? "approval_ready"
        : args.approvalReadiness.reviewReady
          ? "review_ready"
          : "draft";

  return currentApprovalStateSchema.parse({
    status,
    roadmapScopeApproved,
    approvalRecordId: args.scopeApprovalRecord.approvalRecordId,
    activeRevisionId: args.activeRevisionId
  });
}

export type GovernancePolicyGeneratorInput = {
  workspaceId?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  projectMetadata?: StoredProjectMetadata | null;
};

export function generateGovernancePolicy(
  args: GovernancePolicyGeneratorInput
): GovernancePolicy {
  const defaults = getGovernanceDomainDefaults(args.projectBrief.domainPack);
  const workspaceId = cleanText(args.workspaceId) || args.roadmapPlan.workspaceId || null;
  const projectId = cleanText(args.projectId) || args.roadmapPlan.projectId;
  const projectName = cleanText(args.projectName) || args.roadmapPlan.projectName || null;
  const storedRevisionRecords =
    args.projectMetadata?.governanceState?.roadmapRevisionRecords ?? [];
  const readinessBuild = buildGovernanceApprovalReadiness({
    defaults,
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan,
    roadmapRevisionRecords: storedRevisionRecords
  });
  const governanceId = buildGovernanceRef({
    workspaceId,
    projectId
  });
  const scopeApprovalRecord = buildScopeApprovalRecord({
    governanceId,
    roadmapPlan: args.roadmapPlan,
    approvalReadiness: readinessBuild.approvalReadiness,
    currentRevisionId: readinessBuild.activeRevision?.revisionId ?? null,
    storedScopeApprovalRecord:
      args.projectMetadata?.governanceState?.scopeApprovalRecord ?? null
  });
  const currentApprovalState = buildCurrentApprovalState({
    approvalReadiness: readinessBuild.approvalReadiness,
    scopeApprovalRecord,
    activeRevisionId: readinessBuild.activeRevision?.revisionId ?? null
  });

  return governancePolicySchema.parse({
    governanceId,
    workspaceId,
    projectId,
    projectName,
    sourceProjectBriefRef: args.roadmapPlan.sourceProjectBriefRef,
    sourceArchitectureBlueprintRef: args.roadmapPlan.sourceArchitectureBlueprintRef,
    sourceRoadmapPlanRef: args.roadmapPlan.roadmapId,
    domainPack: args.projectBrief.domainPack,
    hardGuards: buildHardGuards({ defaults }),
    billingProtection: buildBillingProtection({
      domainPack: args.projectBrief.domainPack
    }),
    laneRules: buildLaneRules(args.architectureBlueprint),
    qaRules: buildQaRules(args.architectureBlueprint),
    deltaAnalyzerPolicy: buildDeltaAnalyzerPolicy({ defaults }),
    approvalChecklist: readinessBuild.approvalChecklist,
    approvalReadiness: readinessBuild.approvalReadiness,
    currentApprovalState,
    scopeApprovalRecord,
    roadmapRevisionRecords: [...storedRevisionRecords],
    assumptionsMade: buildAssumptions({
      projectBrief: args.projectBrief,
      architectureBlueprint: args.architectureBlueprint,
      roadmapPlan: args.roadmapPlan
    }),
    governanceRisks: buildGovernanceRisks({
      defaults,
      architectureBlueprint: args.architectureBlueprint,
      roadmapPlan: args.roadmapPlan
    })
  });
}

export function validateGovernancePolicyReferences(args: {
  governancePolicy: GovernancePolicy;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
}) {
  const laneIds = new Set(args.architectureBlueprint.lanes.map((lane) => lane.id));
  const moduleIds = new Set(args.architectureBlueprint.modules.map((module) => module.id));
  const phaseIds = new Set(args.roadmapPlan.phases.map((phase) => phase.phaseId));
  const checklistItemIds = new Set(
    args.governancePolicy.approvalChecklist.map((item) => item.id)
  );

  return {
    unknownLaneRuleLaneIds: uniqueStrings([
      ...Object.keys(args.governancePolicy.laneRules.protectedPathsByLane).filter(
        (laneId) => !laneIds.has(laneId)
      ),
      ...Object.keys(args.governancePolicy.laneRules.mergePolicyByLane).filter(
        (laneId) => !laneIds.has(laneId)
      )
    ]),
    unknownChecklistPhaseIds: uniqueStrings(
      args.governancePolicy.approvalChecklist.flatMap((item) =>
        item.relatedPhaseId && !phaseIds.has(item.relatedPhaseId)
          ? [item.relatedPhaseId]
          : []
      )
    ),
    unknownRiskPhaseIds: uniqueStrings(
      args.governancePolicy.governanceRisks.flatMap((risk) =>
        risk.relatedPhaseIds.filter((phaseId) => !phaseIds.has(phaseId))
      )
    ),
    unknownRiskModuleIds: uniqueStrings(
      args.governancePolicy.governanceRisks.flatMap((risk) =>
        risk.relatedModuleIds.filter((moduleId) => !moduleIds.has(moduleId))
      )
    ),
    unknownApprovalBlockerIds: uniqueStrings(
      (args.governancePolicy.scopeApprovalRecord?.unresolvedBlockerIds ?? []).filter(
        (checklistId) => !checklistItemIds.has(checklistId)
      )
    )
  };
}
