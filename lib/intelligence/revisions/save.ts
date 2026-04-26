import type {
  StoredGovernanceState,
  StoredProjectMetadata,
  StoredStrategyState
} from "@/lib/workspace/project-metadata";
import { createRoadmapRevisionRecordFromDelta } from "../governance/delta-analyzer.ts";
import { roadmapRevisionRecordSchema } from "../governance/types.ts";
import type { ArchitectureBlueprint } from "../architecture/types.ts";
import type { ProjectBrief } from "../project-brief.ts";
import type { RoadmapPlan } from "../roadmap/types.ts";
import type { GovernancePolicy } from "../governance/types.ts";
import { applyStrategyOverrideStateToLayers } from "./apply.ts";
import {
  buildStrategyChangedAreas,
  buildStrategyRevisionSummary,
  classifyStrategyRevisionMateriality,
  determineApprovalInvalidation
} from "./materiality.ts";
import {
  revisionApplicationResultSchema,
  strategyOverrideStateSchema,
  strategyRevisionRecordSchema,
  type RevisionApplicationResult,
  type StrategyOverrideState,
  type StrategyRevisionPatch,
  type StrategyRevisionRecord
} from "./types.ts";

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function mergeRecordValues(
  current: Record<string, string> | undefined,
  patch: Record<string, string> | undefined
) {
  if (!patch || Object.keys(patch).length === 0) {
    return current;
  }

  return {
    ...(current ?? {}),
    ...patch
  };
}

function mergeOverrideSection<T extends Record<string, unknown>>(
  current: T | null | undefined,
  patch: T | undefined
) {
  if (!patch || Object.keys(patch).length === 0) {
    return current ?? null;
  }

  return {
    ...(current ?? {}),
    ...patch
  } as T;
}

function mergeStrategyOverrideState(args: {
  currentOverrideState?: StrategyOverrideState | null;
  patch: StrategyRevisionPatch;
  revisionId: string;
  updatedAt: string;
}) {
  const currentAnsweredInputs = new Map(
    (args.currentOverrideState?.answeredInputs ?? []).map((item) => [item.inputId, item])
  );

  for (const answer of args.patch.answeredInputs ?? []) {
    currentAnsweredInputs.set(answer.inputId, answer);
  }

  const currentRoadmap = args.currentOverrideState?.roadmap ?? null;
  const currentGovernance = args.currentOverrideState?.governance ?? null;

  return strategyOverrideStateSchema.parse({
    projectBrief: mergeOverrideSection(args.currentOverrideState?.projectBrief, args.patch.projectBrief),
    architecture: mergeOverrideSection(args.currentOverrideState?.architecture, args.patch.architecture),
    roadmap:
      args.patch.roadmap && Object.keys(args.patch.roadmap).length > 0
        ? {
            ...(currentRoadmap ?? {}),
            ...args.patch.roadmap,
            phaseNotesById: mergeRecordValues(
              currentRoadmap?.phaseNotesById,
              args.patch.roadmap.phaseNotesById
            )
          }
        : currentRoadmap,
    governance:
      args.patch.governance && Object.keys(args.patch.governance).length > 0
        ? {
            ...(currentGovernance ?? {}),
            ...args.patch.governance,
            approvalEvidenceByChecklistId: mergeRecordValues(
              currentGovernance?.approvalEvidenceByChecklistId,
              args.patch.governance.approvalEvidenceByChecklistId
            )
          }
        : currentGovernance,
    answeredInputs: Array.from(currentAnsweredInputs.values()),
    lastAppliedRevisionId: args.revisionId,
    updatedAt: args.updatedAt
  });
}

function supersedeActiveRoadmapRevisions(
  records: ReadonlyArray<NonNullable<StoredGovernanceState["roadmapRevisionRecords"]>[number]>,
  nextRevisionId: string
) {
  return records.map((record) =>
    record.status === "resolved" || record.status === "superseded" || record.revisionId === nextRevisionId
      ? record
      : {
          ...record,
          status: "superseded" as const
        }
  );
}

function buildFallbackRoadmapRevisionRecord(args: {
  governancePolicy: GovernancePolicy;
  projectId: string;
  summary: string;
  triggeredBy: string;
}) {
  return roadmapRevisionRecordSchema.parse({
    revisionId: `${args.projectId}:revision:${slugify(args.summary) || "pending"}`,
    reason: args.summary,
    requestClass: "scope_expansion",
    triggeredBy: args.triggeredBy,
    sourceRoadmapPlanId: args.governancePolicy.sourceRoadmapPlanRef,
    sourceGovernancePolicyId: args.governancePolicy.governanceId,
    requiresArchitectureRefresh: false,
    requiresRoadmapRefresh: true,
    requiresApprovalReset: args.governancePolicy.currentApprovalState.roadmapScopeApproved,
    status: "pending_review"
  });
}

function buildStrategyRevisionRecord(args: {
  revisionId: string;
  projectId: string;
  createdAt: string;
  createdBy?: string | null;
  changedAreas: ReturnType<typeof buildStrategyChangedAreas>;
  patch: StrategyRevisionPatch;
  materiality: ReturnType<typeof classifyStrategyRevisionMateriality>["materiality"];
  requiresApprovalReset: boolean;
  relatedApprovalRecordId?: string | null;
  summary: string;
}) {
  return strategyRevisionRecordSchema.parse({
    revisionId: args.revisionId,
    projectId: args.projectId,
    createdAt: args.createdAt,
    createdBy: args.createdBy ?? null,
    changedAreas: args.changedAreas,
    patchPayload: args.patch,
    materiality: args.materiality,
    requiresApprovalReset: args.requiresApprovalReset,
    relatedApprovalRecordId: args.relatedApprovalRecordId ?? null,
    summary: normalizeSpace(args.summary),
    status: "applied"
  });
}

function buildRevisionId(args: {
  projectId: string;
  createdAt: string;
  summary: string;
}) {
  const timestamp = args.createdAt.replace(/[^0-9]/g, "").slice(0, 14) || Date.now().toString();
  return `${args.projectId}:strategy-revision:${timestamp}-${slugify(args.summary) || "update"}`;
}

function buildApplicationSummary(args: {
  baseGovernancePolicy: GovernancePolicy;
  revisedGovernancePolicy: GovernancePolicy;
  baseSummary: string;
  approvalInvalidated: boolean;
  requiresApprovalReset: boolean;
}) {
  let summary = normalizeSpace(args.baseSummary);
  const blockerDelta =
    args.revisedGovernancePolicy.approvalReadiness.blockers.length -
    args.baseGovernancePolicy.approvalReadiness.blockers.length;

  if (args.requiresApprovalReset) {
    return `${summary} Approval reset is now required before execution can widen.`.trim();
  }

  if (args.approvalInvalidated) {
    return `${summary} Strategy Room review is required again before approval can be restored.`.trim();
  }

  if (blockerDelta < 0) {
    return `${summary} Approval blockers were reduced.`.trim();
  }

  if (blockerDelta > 0) {
    return `${summary} Additional approval blockers are now visible.`.trim();
  }

  return summary;
}

function buildGovernanceState(args: {
  currentGovernanceState?: StoredGovernanceState | null;
  nextRoadmapRevisionRecord: ReturnType<typeof createRoadmapRevisionRecordFromDelta> | null;
  requiresApprovalReset: boolean;
}) {
  const currentState = args.currentGovernanceState ?? null;
  const currentRoadmapRevisionRecords = currentState?.roadmapRevisionRecords ?? [];
  const roadmapRevisionRecords = args.nextRoadmapRevisionRecord
    ? [
        ...supersedeActiveRoadmapRevisions(
          currentRoadmapRevisionRecords,
          args.nextRoadmapRevisionRecord.revisionId
        ),
        args.nextRoadmapRevisionRecord
      ]
    : [...currentRoadmapRevisionRecords];
  const scopeApprovalRecord =
    args.requiresApprovalReset &&
    currentState?.scopeApprovalRecord?.status === "approved" &&
    args.nextRoadmapRevisionRecord
      ? {
          ...currentState.scopeApprovalRecord,
          status: "superseded" as const,
          supersededByRevisionId: args.nextRoadmapRevisionRecord.revisionId
        }
      : currentState?.scopeApprovalRecord ?? null;

  if (!scopeApprovalRecord && roadmapRevisionRecords.length === 0) {
    return null;
  }

  return {
    scopeApprovalRecord,
    roadmapRevisionRecords
  } satisfies StoredGovernanceState;
}

function buildStrategyState(args: {
  currentStrategyState?: StoredStrategyState | null;
  overrideState: StrategyOverrideState;
  revisionRecord: StrategyRevisionRecord;
}) {
  return {
    overrideState: args.overrideState,
    revisionRecords: [
      ...(args.currentStrategyState?.revisionRecords ?? []),
      args.revisionRecord
    ]
  } satisfies StoredStrategyState;
}

export function hasStrategyRevisionPatchContent(patch: StrategyRevisionPatch) {
  return buildStrategyChangedAreas(patch).length > 0;
}

export function createStrategyRevisionPersistenceUpdate(args: {
  workspaceId?: string | null;
  projectId: string;
  projectName?: string | null;
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  patch: StrategyRevisionPatch;
  createdAt: string;
  createdBy?: string | null;
}) {
  const classification = classifyStrategyRevisionMateriality({
    patch: args.patch,
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan,
    governancePolicy: args.governancePolicy
  });
  const baseSummary =
    classification.summary ||
    buildStrategyRevisionSummary({
      patch: args.patch
    });
  const revisionId = buildRevisionId({
    projectId: args.projectId,
    createdAt: args.createdAt,
    summary: baseSummary
  });
  const overrideState = mergeStrategyOverrideState({
    currentOverrideState: args.projectMetadata?.strategyState?.overrideState ?? null,
    patch: args.patch,
    revisionId,
    updatedAt: args.createdAt
  });
  const approvalInvalidation = determineApprovalInvalidation({
    governancePolicy: args.governancePolicy,
    materiality: classification.materiality,
    deltaAnalysis: classification.deltaAnalysis
  });
  const roadmapRevisionRecord =
    createRoadmapRevisionRecordFromDelta({
      governancePolicy: args.governancePolicy,
      deltaAnalysis:
        classification.deltaAnalysis ?? {
          requestClass: "scope_expansion",
          outcome: "roadmap_revision_required",
          reason: baseSummary,
          affectedLaneIds: [],
          affectedModuleIds: [],
          affectedPhaseIds: [],
          requiresRoadmapRevision: classification.materiality === "material",
          requiresArchitectureRevision: false,
          requiresGovernanceReview: classification.materiality === "material",
          shouldSaveAsPendingExecution: true,
          requiresApprovalReset: approvalInvalidation.requiresApprovalReset,
          suggestedNextSurface: "strategy_room",
          suggestedNextAction:
            "Review the roadmap and approval state in Strategy Room before widening execution."
        },
      triggeredBy: args.createdBy ?? "strategy_room"
    }) ??
    (classification.materiality === "material"
      ? buildFallbackRoadmapRevisionRecord({
          governancePolicy: args.governancePolicy,
          projectId: args.projectId,
          summary: baseSummary,
          triggeredBy: args.createdBy ?? "strategy_room"
        })
      : null);
  const governanceState = buildGovernanceState({
    currentGovernanceState: args.projectMetadata?.governanceState ?? null,
    nextRoadmapRevisionRecord: roadmapRevisionRecord,
    requiresApprovalReset: approvalInvalidation.requiresApprovalReset
  });
  const revisedLayers = applyStrategyOverrideStateToLayers({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectName: args.projectName,
    projectMetadata: args.projectMetadata,
    governanceStateOverride: governanceState,
    projectBrief: args.projectBrief,
    overrideState
  });
  const applicationSummary = buildApplicationSummary({
    baseGovernancePolicy: args.governancePolicy,
    revisedGovernancePolicy: revisedLayers.governancePolicy,
    baseSummary,
    approvalInvalidated: approvalInvalidation.approvalInvalidated,
    requiresApprovalReset: approvalInvalidation.requiresApprovalReset
  });
  const revisionRecord = buildStrategyRevisionRecord({
    revisionId,
    projectId: args.projectId,
    createdAt: args.createdAt,
    createdBy: args.createdBy ?? null,
    changedAreas: classification.changedAreas,
    patch: args.patch,
    materiality: classification.materiality,
    requiresApprovalReset: approvalInvalidation.requiresApprovalReset,
    relatedApprovalRecordId: args.governancePolicy.scopeApprovalRecord?.approvalRecordId ?? null,
    summary: applicationSummary
  });
  const strategyState = buildStrategyState({
    currentStrategyState: args.projectMetadata?.strategyState ?? null,
    overrideState,
    revisionRecord
  });
  const applicationResult = revisionApplicationResultSchema.parse({
    applied: true,
    changedAreas: classification.changedAreas,
    materiality: classification.materiality,
    updatedLayerIds: [
      revisedLayers.architectureBlueprint.sourceProjectBriefRef,
      revisedLayers.roadmapPlan.roadmapId,
      revisedLayers.governancePolicy.governanceId
    ],
    approvalInvalidated: approvalInvalidation.approvalInvalidated,
    blockersChanged:
      args.governancePolicy.approvalReadiness.blockers.length !==
      revisedLayers.governancePolicy.approvalReadiness.blockers.length,
    summary: applicationSummary
  });

  return {
    strategyState,
    governanceState,
    revisedLayers,
    revisionRecord,
    roadmapRevisionRecord,
    applicationResult,
    approvalInvalidation
  } satisfies {
    strategyState: StoredStrategyState;
    governanceState: StoredGovernanceState | null;
    revisedLayers: ReturnType<typeof applyStrategyOverrideStateToLayers>;
    revisionRecord: StrategyRevisionRecord;
    roadmapRevisionRecord: ReturnType<typeof createRoadmapRevisionRecordFromDelta> | null;
    applicationResult: RevisionApplicationResult;
    approvalInvalidation: ReturnType<typeof determineApprovalInvalidation>;
  };
}
