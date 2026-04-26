import type {
  BuildRoomArtifact,
  BuildRoomRun,
  BuildRoomTaskDetail
} from "@/lib/build-room/types";
import type { ArchitectureBlueprint } from "../architecture/types.ts";
import {
  findExecutionPacketSummaryForTask,
  generateExecutionPacket,
  type ExecutionPacket,
  type ExecutionPacketSummary,
  type ExecutionState
} from "../execution/index.ts";
import type { GovernancePolicy } from "../governance/types.ts";
import type { ProjectBrief } from "../project-brief.ts";
import type { RoadmapPlan } from "../roadmap/types.ts";
import { buildArtifactRequirements } from "./artifact-requirements.ts";
import { buildCompletionReadiness } from "./completion-readiness.ts";
import {
  acceptanceArtifactSchema,
  acceptanceCriterionResultSchema,
  qaReviewRecordSchema,
  qaValidationResultSchema,
  remediationRequirementSchema,
  type AcceptanceArtifact,
  type ArtifactRequirement,
  type QAValidationResult
} from "./types.ts";

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value: string) {
  return normalizeSpace(value).toLowerCase();
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

function toRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function recordBoolean(
  record: Record<string, unknown> | null,
  keys: readonly string[]
) {
  if (!record) {
    return false;
  }

  return keys.some((key) => record[key] === true);
}

function recordString(
  record: Record<string, unknown> | null,
  keys: readonly string[]
) {
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function recordStringList(
  record: Record<string, unknown> | null,
  keys: readonly string[]
) {
  if (!record) {
    return [] as string[];
  }

  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return uniqueStrings(
        value
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      );
    }

    if (typeof value === "string" && value.trim()) {
      return uniqueStrings(
        value
          .split(/\s*(?:,|\n|\r\n)\s*/)
          .map((item) => item.trim())
          .filter(Boolean)
      );
    }
  }

  return [] as string[];
}

function artifactTextCorpus(artifact: BuildRoomArtifact) {
  return normalizeSearchText(
    [
      artifact.title,
      artifact.textContent,
      JSON.stringify(artifact.payload ?? {})
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function artifactHasMeaningfulEvidence(artifact: BuildRoomArtifact) {
  return (
    cleanText(artifact.textContent).length > 0 ||
    Object.keys(artifact.payload ?? {}).length > 0
  );
}

function taskStatusRunFinished(task: BuildRoomTaskDetail["task"]) {
  return (
    task.status === "codex_complete" ||
    task.status === "worker_complete" ||
    task.status === "worker_failed" ||
    task.status === "needs_revision"
  );
}

function sortRuns(runs: readonly BuildRoomRun[]) {
  return [...runs].sort((left, right) => {
    const leftTime = left.completedAt ?? left.updatedAt ?? left.createdAt;
    const rightTime = right.completedAt ?? right.updatedAt ?? right.createdAt;
    return rightTime.localeCompare(leftTime);
  });
}

function latestRun(runs: readonly BuildRoomRun[]) {
  return sortRuns(runs)[0] ?? null;
}

function latestCompletedRun(runs: readonly BuildRoomRun[]) {
  return (
    sortRuns(runs).find(
      (run) => run.status === "complete" || run.status === "failed"
    ) ?? null
  );
}

function buildBaseArtifact(artifact: BuildRoomArtifact) {
  return acceptanceArtifactSchema.parse({
    artifactId: artifact.id,
    kind: artifact.artifactType,
    label: artifact.title,
    source: "build_room_artifact",
    reference: `build-room-artifact:${artifact.id}`,
    status: "available",
    notes: cleanText(artifact.textContent) ? "Stored Build Room artifact." : null,
    generatedAt: artifact.createdAt,
    generatedBy: null
  });
}

function buildDerivedArtifact(args: {
  artifact: BuildRoomArtifact;
  kind: AcceptanceArtifact["kind"];
  label: string;
  notes?: string | null;
  status?: AcceptanceArtifact["status"];
}) {
  return acceptanceArtifactSchema.parse({
    artifactId: `${args.artifact.id}:${args.kind}`,
    kind: args.kind,
    label: args.label,
    source: "derived_build_room_artifact",
    reference: `build-room-artifact:${args.artifact.id}`,
    status: args.status ?? "accepted",
    notes: cleanText(args.notes) || null,
    generatedAt: args.artifact.createdAt,
    generatedBy: null
  });
}

function artifactSignalsExplicitReview(artifact: BuildRoomArtifact) {
  const record = toRecord(artifact.payload);
  const status =
    recordString(record, ["reviewStatus", "qaStatus", "acceptanceStatus"]) ??
    (recordBoolean(record, ["humanReviewApproved", "reviewApproved", "qaApproved"])
      ? "approved"
      : recordBoolean(record, ["humanReviewRejected", "reviewRejected", "qaRejected"])
        ? "rejected"
        : null);

  return {
    approved:
      status === "approved" ||
      status === "accepted" ||
      status === "release_ready",
    rejected: status === "rejected" || status === "failed",
    reviewer: recordString(record, ["approvedBy", "reviewedBy", "qaReviewer"]),
    notes:
      recordString(record, ["reviewNotes", "qaNotes", "acceptanceNotes"]) ??
      null
  };
}

function artifactSignalsLogicReview(artifact: BuildRoomArtifact) {
  const record = toRecord(artifact.payload);
  const corpus = artifactTextCorpus(artifact);

  return (
    recordBoolean(record, [
      "methodologyReviewed",
      "scoringReviewed",
      "logicValidated",
      "riskReviewed"
    ]) ||
    recordStringList(record, [
      "qaEvidenceKinds",
      "evidenceKinds",
      "artifactKinds"
    ]).includes("logic_review_evidence") ||
    /methodology|scoring|risk reviewed|rules validated/.test(corpus)
  );
}

function artifactSignalsPermissionsEvidence(artifact: BuildRoomArtifact) {
  const record = toRecord(artifact.payload);
  const corpus = artifactTextCorpus(artifact);

  return (
    recordBoolean(record, [
      "permissionsValidated",
      "visibilityValidated",
      "locationScopeValidated",
      "roleAccessValidated"
    ]) ||
    recordStringList(record, [
      "qaEvidenceKinds",
      "evidenceKinds",
      "artifactKinds"
    ]).includes("permissions_evidence") ||
    /permission|role access|location visibility|scope validated/.test(corpus)
  );
}

function artifactSignalsRollbackPlan(artifact: BuildRoomArtifact) {
  const record = toRecord(artifact.payload);

  return (
    recordBoolean(record, ["hasRollbackPlan", "rollbackReady"]) ||
    Boolean(
      recordString(record, ["rollbackPlan", "rollbackNotes", "recoveryPlan"])
    ) ||
    recordStringList(record, [
      "qaEvidenceKinds",
      "evidenceKinds",
      "artifactKinds"
    ]).includes("rollback_plan")
  );
}

function artifactSignalsAcceptedCriteria(artifact: BuildRoomArtifact) {
  const record = toRecord(artifact.payload);
  return recordStringList(record, [
    "acceptedCriteria",
    "criteriaSatisfied",
    "validatedCriteria"
  ]).map((item) => normalizeSearchText(item));
}

function artifactQualifiesAsCodexTerminal(packet: ExecutionPacket) {
  return (
    packet.requestClass !== "execution_oriented" ||
    packet.buildRoomTaskPayload.taskType === "research" ||
    packet.buildRoomTaskPayload.taskType === "qa"
  );
}

function buildAcceptanceArtifacts(args: {
  taskDetail: BuildRoomTaskDetail;
  executionPacket: ExecutionPacket;
  profile: ReturnType<typeof buildArtifactRequirements>["profile"];
}) {
  const artifacts = new Map<string, AcceptanceArtifact>();

  const addArtifact = (artifact: AcceptanceArtifact) => {
    artifacts.set(artifact.artifactId, artifact);
  };

  for (const artifact of args.taskDetail.artifacts) {
    addArtifact(buildBaseArtifact(artifact));
    const hasEvidence = artifactHasMeaningfulEvidence(artifact);
    const reviewSignals = artifactSignalsExplicitReview(artifact);

    if (
      artifact.artifactType === "worker_result" ||
      (artifact.artifactType === "codex_result" &&
        artifactQualifiesAsCodexTerminal(args.executionPacket))
    ) {
      addArtifact(
        buildDerivedArtifact({
          artifact,
          kind: "execution_result",
          label: "Execution result evidence",
          notes:
            artifact.artifactType === "worker_result"
              ? "Derived from the stored worker result."
              : "Derived from the stored Codex result."
        })
      );
    }

    if (
      args.profile.touchesUserFacingSurface &&
      hasEvidence &&
      (artifact.artifactType === "worker_result" ||
        (artifact.artifactType === "codex_result" &&
          artifactQualifiesAsCodexTerminal(args.executionPacket)))
    ) {
      addArtifact(
        buildDerivedArtifact({
          artifact,
          kind: "surface_evidence",
          label: "Surface evidence",
          notes: "Derived from a stored result artifact with presentable output."
        })
      );
    }

    if (
      args.profile.touchesConnectorOrDataFlow &&
      hasEvidence &&
      (artifact.artifactType === "worker_result" ||
        artifact.artifactType === "worker_log")
    ) {
      addArtifact(
        buildDerivedArtifact({
          artifact,
          kind: "connector_evidence",
          label: "Connector or reporting evidence",
          notes: "Derived from a stored connector/reporting result or log."
        })
      );
    }

    if (artifactSignalsLogicReview(artifact)) {
      addArtifact(
        buildDerivedArtifact({
          artifact,
          kind: "logic_review_evidence",
          label: "Methodology or logic review evidence",
          notes: "Derived from explicit methodology-review markers in the stored artifact."
        })
      );
    }

    if (artifactSignalsPermissionsEvidence(artifact)) {
      addArtifact(
        buildDerivedArtifact({
          artifact,
          kind: "permissions_evidence",
          label: "Permissions or scope evidence",
          notes: "Derived from explicit permissions or visibility validation markers."
        })
      );
    }

    if (artifactSignalsRollbackPlan(artifact)) {
      addArtifact(
        buildDerivedArtifact({
          artifact,
          kind: "rollback_plan",
          label: "Rollback plan evidence",
          notes: "Derived from rollback or recovery notes attached to the artifact."
        })
      );
    }

    if (reviewSignals.approved || reviewSignals.rejected) {
      addArtifact(
        buildDerivedArtifact({
          artifact,
          kind: "review_evidence",
          label: "Review evidence",
          notes:
            reviewSignals.notes ??
            (reviewSignals.approved
              ? "Derived from explicit review approval."
              : "Derived from explicit review rejection."),
          status: reviewSignals.approved ? "accepted" : "warning"
        })
      );
    }
  }

  return [...artifacts.values()];
}

function buildRequirementEvidenceMap(args: {
  artifactRequirements: readonly ArtifactRequirement[];
  artifacts: readonly AcceptanceArtifact[];
}) {
  const evidenceByRequirementId = new Map<string, string[]>();

  for (const requirement of args.artifactRequirements) {
    const evidenceIds = args.artifacts
      .filter((artifact) => artifact.kind === requirement.kind)
      .map((artifact) => artifact.artifactId);

    evidenceByRequirementId.set(requirement.id, evidenceIds);
  }

  return evidenceByRequirementId;
}

function buildCriterionResults(args: {
  executionPacket: ExecutionPacket;
  taskDetail: BuildRoomTaskDetail;
  artifacts: readonly AcceptanceArtifact[];
  runFinished: boolean;
  hasExecutionFailure: boolean;
}) {
  const evidenceArtifactIds = args.artifacts
    .filter((artifact) =>
      [
        "execution_result",
        "surface_evidence",
        "connector_evidence",
        "logic_review_evidence",
        "permissions_evidence",
        "review_evidence"
      ].includes(artifact.kind)
    )
    .map((artifact) => artifact.artifactId);
  const acceptedCriteriaSignals = uniqueStrings(
    args.taskDetail.artifacts.flatMap((artifact) =>
      artifactSignalsAcceptedCriteria(artifact)
    )
  );
  const failureReason =
    args.taskDetail.task.status === "worker_failed"
      ? latestRun(args.taskDetail.runs)?.logExcerpt ??
        "The worker run failed."
      : args.taskDetail.task.codexResponsePayload?.blockers[0] ??
        "The task still has unresolved execution blockers.";

  return args.executionPacket.acceptanceCriteria.map((criterionLabel, index) =>
    acceptanceCriterionResultSchema.parse({
      criterionId: `${args.executionPacket.executionPacketId}:criterion:${index + 1}`,
      label: criterionLabel,
      status: !args.runFinished
        ? "pending"
        : args.hasExecutionFailure
          ? "failed"
          : acceptedCriteriaSignals.includes(normalizeSearchText(criterionLabel)) ||
              evidenceArtifactIds.length > 0
            ? "satisfied"
            : "blocked",
      evidenceArtifactIds:
        args.runFinished && !args.hasExecutionFailure ? evidenceArtifactIds : [],
      reason: !args.runFinished
        ? "The run has not reached a completed state yet."
        : args.hasExecutionFailure
          ? failureReason
          : acceptedCriteriaSignals.includes(normalizeSearchText(criterionLabel))
            ? "The stored artifacts explicitly marked this criterion as satisfied."
            : evidenceArtifactIds.length > 0
              ? "Validated from the finished run and stored execution artifacts."
              : "No acceptance evidence is attached to this finished run yet.",
      relatedPhaseId: args.executionPacket.phaseIds[0] ?? null,
      relatedLaneIds: args.executionPacket.laneIds
    })
  );
}

function buildReviewRecord(args: {
  executionPacket: ExecutionPacket;
  taskDetail: BuildRoomTaskDetail;
  reviewRequired: boolean;
  runFinished: boolean;
}) {
  const reviewArtifacts = args.taskDetail.artifacts.flatMap((artifact) => {
    const signals = artifactSignalsExplicitReview(artifact);

    if (!signals.approved && !signals.rejected) {
      return [] as Array<{
        artifactId: string;
        approved: boolean;
        rejected: boolean;
        reviewer: string | null;
        notes: string | null;
      }>;
    }

    return [
      {
        artifactId: artifact.id,
        approved: signals.approved,
        rejected: signals.rejected,
        reviewer: signals.reviewer,
        notes: signals.notes
      }
    ];
  });
  const approvedArtifact = reviewArtifacts.find((item) => item.approved) ?? null;
  const rejectedArtifact = reviewArtifacts.find((item) => item.rejected) ?? null;
  const latestCompleted = latestCompletedRun(args.taskDetail.runs);

  if (!args.reviewRequired) {
    return qaReviewRecordSchema.parse({
      reviewRecordId: `${args.executionPacket.executionPacketId}:qa-review`,
      sourceExecutionPacketId: args.executionPacket.executionPacketId,
      sourceTaskId: args.taskDetail.task.id,
      sourceRunId: latestCompleted?.id ?? null,
      reviewKind: "automated",
      status: args.runFinished ? "approved" : "not_requested",
      reviewer: null,
      notes: args.runFinished
        ? "No additional human review rule was triggered for this task."
        : "Review remains automated until the run finishes.",
      evidenceArtifactIds: [],
      createdAt: latestCompleted?.completedAt ?? args.taskDetail.task.updatedAt,
      updatedAt: args.taskDetail.task.updatedAt
    });
  }

  return qaReviewRecordSchema.parse({
    reviewRecordId: `${args.executionPacket.executionPacketId}:qa-review`,
    sourceExecutionPacketId: args.executionPacket.executionPacketId,
    sourceTaskId: args.taskDetail.task.id,
    sourceRunId: latestCompleted?.id ?? null,
    reviewKind:
      approvedArtifact || rejectedArtifact ? "human_recorded" : "human_required",
    status: rejectedArtifact
      ? "rejected"
      : approvedArtifact
        ? "approved"
        : args.runFinished
          ? "pending_human_review"
          : "not_requested",
    reviewer:
      approvedArtifact?.reviewer ?? rejectedArtifact?.reviewer ?? null,
    notes:
      approvedArtifact?.notes ??
      rejectedArtifact?.notes ??
      (args.runFinished
        ? "A completed run exists, but the explicit human-review evidence is still missing."
        : "Human review will be needed after the run finishes."),
    evidenceArtifactIds: uniqueStrings(
      reviewArtifacts.map((item) => `build-room-artifact:${item.artifactId}`)
    ),
    createdAt: latestCompleted?.completedAt ?? args.taskDetail.task.updatedAt,
    updatedAt: args.taskDetail.task.updatedAt
  });
}

function buildRemediationRequirements(args: {
  artifactRequirements: readonly ArtifactRequirement[];
  evidenceByRequirementId: Map<string, string[]>;
  criterionResults: ReturnType<typeof buildCriterionResults>;
  reviewRecord: ReturnType<typeof buildReviewRecord>;
}) {
  const items = args.artifactRequirements
    .filter((requirement) =>
      (args.evidenceByRequirementId.get(requirement.id) ?? []).length === 0
    )
    .map((requirement) =>
      remediationRequirementSchema.parse({
        id: `${requirement.id}:remediation`,
        label: `Collect ${requirement.label.toLowerCase()}`,
        reason: requirement.reason,
        relatedCriterionIds: [],
        relatedArtifactRequirementIds: [requirement.id],
        nextAction:
          "Attach the missing evidence through the existing Build Room output flow before trying to mark the task complete."
      })
    );
  const criterionItems = args.criterionResults
    .filter((criterion) =>
      criterion.status === "failed" || criterion.status === "blocked"
    )
    .map((criterion) =>
      remediationRequirementSchema.parse({
        id: `${criterion.criterionId}:remediation`,
        label: `Remediate ${criterion.label.toLowerCase()}`,
        reason: criterion.reason,
        relatedCriterionIds: [criterion.criterionId],
        relatedArtifactRequirementIds: [],
        nextAction:
          "Route remediation back through the existing execution path and attach updated acceptance evidence afterward."
      })
    );
  const reviewItem =
    args.reviewRecord.status === "rejected" ||
    args.reviewRecord.status === "pending_human_review"
      ? [
          remediationRequirementSchema.parse({
            id: `${args.reviewRecord.reviewRecordId}:remediation`,
            label: "Resolve QA review",
            reason:
              args.reviewRecord.notes ??
              "Human review evidence is still required before release.",
            relatedCriterionIds: [],
            relatedArtifactRequirementIds: ["review_evidence"],
            nextAction:
              "Attach explicit review approval evidence before presenting this task as complete."
          })
        ]
      : [];

  return [...items, ...criterionItems, ...reviewItem];
}

export type TaskQAValidationContext = {
  executionPacket: ExecutionPacket;
  packetSummary: ExecutionPacketSummary | null;
  qaValidation: QAValidationResult;
};

export function buildTaskQAValidationContext(args: {
  workspaceId?: string | null;
  projectId: string;
  projectName?: string | null;
  executionState: ExecutionState | null | undefined;
  taskDetail: BuildRoomTaskDetail;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
}) {
  const packetSummary = findExecutionPacketSummaryForTask({
    executionState: args.executionState,
    buildRoomTaskId: args.taskDetail.task.id
  });
  const executionPacket = generateExecutionPacket({
    workspaceId: args.workspaceId ?? args.taskDetail.task.workspaceId,
    projectId: args.projectId,
    projectName: args.projectName ?? args.projectBrief.projectName,
    sourceRequestId:
      packetSummary?.sourceRequestId ?? args.taskDetail.task.id,
    title: args.taskDetail.task.title,
    userRequest:
      packetSummary?.requestSummary ?? args.taskDetail.task.userRequest,
    acceptanceCriteriaText: args.taskDetail.task.acceptanceCriteria,
    taskType: args.taskDetail.task.taskType,
    requestedOutputMode: args.taskDetail.task.requestedOutputMode,
    riskLevel: args.taskDetail.task.riskLevel,
    selectedBuildLaneSlug: args.taskDetail.task.laneSlug,
    existingBuildRoomTaskId: args.taskDetail.task.id,
    originatingSurface: "build_room",
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan,
    governancePolicy: args.governancePolicy
  });
  const qaValidation = generateQAValidationResult({
    executionPacket,
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan,
    governancePolicy: args.governancePolicy,
    taskDetail: args.taskDetail
  });

  return {
    executionPacket,
    packetSummary,
    qaValidation
  } satisfies TaskQAValidationContext;
}

export function generateQAValidationResult(args: {
  executionPacket: ExecutionPacket;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  taskDetail: BuildRoomTaskDetail;
}) {
  const { profile, artifactRequirements } = buildArtifactRequirements({
    executionPacket: args.executionPacket,
    projectBrief: args.projectBrief,
    architectureBlueprint: args.architectureBlueprint,
    roadmapPlan: args.roadmapPlan,
    governancePolicy: args.governancePolicy
  });
  const artifacts = buildAcceptanceArtifacts({
    taskDetail: args.taskDetail,
    executionPacket: args.executionPacket,
    profile
  });
  const evidenceByRequirementId = buildRequirementEvidenceMap({
    artifactRequirements,
    artifacts
  });
  const latestTaskRun = latestRun(args.taskDetail.runs);
  const runFinished = taskStatusRunFinished(args.taskDetail.task);
  const hasExecutionFailure =
    args.taskDetail.task.status === "worker_failed" ||
    (args.taskDetail.task.status !== "worker_complete" &&
      (args.taskDetail.task.codexResponsePayload?.blockers.length ?? 0) > 0);
  const reviewRecord = buildReviewRecord({
    executionPacket: args.executionPacket,
    taskDetail: args.taskDetail,
    reviewRequired: profile.requiresHumanReview,
    runFinished
  });
  const criterionResults = buildCriterionResults({
    executionPacket: args.executionPacket,
    taskDetail: args.taskDetail,
    artifacts,
    runFinished,
    hasExecutionFailure
  });
  const artifactsSatisfied = artifactRequirements.every(
    (requirement) => (evidenceByRequirementId.get(requirement.id) ?? []).length > 0
  );
  const acceptanceSatisfied = criterionResults.every(
    (criterion) => criterion.status === "satisfied"
  );
  const scopeStillApproved =
    args.executionPacket.scopeDecision.withinApprovedScope &&
    args.executionPacket.readiness.approvalAllowed;
  const blockers = uniqueStrings([
    ...(!scopeStillApproved
      ? [
          "Approval or approved scope is no longer valid for this execution packet."
        ]
      : []),
    ...(!runFinished ? ["The current run has not finished yet."] : []),
    ...artifactRequirements
      .filter((requirement) =>
        (evidenceByRequirementId.get(requirement.id) ?? []).length === 0
      )
      .map(
        (requirement) =>
          `${requirement.label} is still missing. ${requirement.reason}`
      ),
    ...criterionResults
      .filter((criterion) => criterion.status === "failed" || criterion.status === "blocked")
      .map((criterion) => `${criterion.label}: ${criterion.reason}`),
    ...(reviewRecord.status === "pending_human_review"
      ? ["Explicit human review evidence is still required."]
      : reviewRecord.status === "rejected"
        ? ["The latest human review rejected this task."]
        : []),
    ...(args.taskDetail.task.status === "worker_failed"
      ? [
          latestTaskRun?.logExcerpt ??
            "The latest worker run failed and needs remediation."
        ]
      : []),
    ...(args.taskDetail.task.codexResponsePayload?.blockers ?? [])
  ]);
  const warnings = uniqueStrings([
    ...args.executionPacket.notInScopeWarnings,
    ...(args.taskDetail.task.codexResponsePayload?.warnings ?? [])
  ]);
  const governanceQASatisfied =
    scopeStillApproved &&
    (!profile.requiresHumanReview || reviewRecord.status === "approved");
  const { completionReadiness, releaseDecision } = buildCompletionReadiness({
    runFinished,
    artifactsSatisfied,
    acceptanceSatisfied,
    governanceQASatisfied,
    reviewRecord,
    blockers,
    scopeStillApproved,
    hasExecutionFailure
  });
  const remediationRequirements = buildRemediationRequirements({
    artifactRequirements,
    evidenceByRequirementId,
    criterionResults,
    reviewRecord
  });
  const assumptionsMade = uniqueStrings([
    ...(args.executionPacket.buildRoomTaskPayload.taskType === "implementation" &&
    !artifacts.some((artifact) => artifact.kind === "worker_result")
      ? [
          "Implementation work is still waiting on a worker result artifact before it can be treated as accepted."
        ]
      : []),
    ...(criterionResults.some(
      (criterion) =>
        criterion.status === "satisfied" &&
        criterion.reason ===
          "Validated from the finished run and stored execution artifacts."
      )
      ? [
          "Acceptance criteria were validated from the finished run and stored artifacts because no per-criterion evidence map was attached."
        ]
      : []),
    ...(!profile.requiresHumanReview
      ? [
          "No extra human review rule was triggered because the current packet stays inside the lower-risk QA profile."
        ]
      : [])
  ]);

  return qaValidationResultSchema.parse({
    qaValidationId: `${args.executionPacket.executionPacketId}:qa-validation`,
    projectId: args.executionPacket.projectId,
    sourceExecutionPacketId: args.executionPacket.executionPacketId,
    sourceGovernancePolicyId: args.executionPacket.sourceGovernancePolicyRef,
    sourceRoadmapPlanId: args.executionPacket.sourceRoadmapPlanRef,
    sourceTaskId: args.taskDetail.task.id,
    sourceRunId: latestCompletedRun(args.taskDetail.runs)?.id ?? null,
    artifactRequirements,
    artifacts,
    criterionResults,
    blockers,
    warnings,
    status: completionReadiness.status,
    needsHumanReview: profile.requiresHumanReview,
    completionReadiness,
    releaseDecision,
    reviewRecord,
    remediationRequirements,
    assumptionsMade
  }) satisfies QAValidationResult;
}
