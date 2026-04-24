import {
  createArtifactsFromPlanningThreadState,
  rebuildIntelligenceStateFromArtifacts,
  type HiddenIntelligenceBundle
} from "@/lib/intelligence/adapters";
import { createAdapterRecordId, dedupe, stableHash } from "@/lib/intelligence/adapters/helpers";
import { detectBranchShift } from "@/lib/intelligence/branching";
import type { ExtractionFieldKey } from "@/lib/intelligence/extraction";
import { compareLiveAndHiddenQuestionTargets } from "./comparison";
import { isStartPlanningShadowEnabled } from "./guards";
import { buildStartShadowSessionReport } from "./report";
import { getStartPlanningShadowSession, setStartPlanningShadowSession } from "./store";
import type {
  ShadowBranchChangeSummary,
  ShadowExtractionChangeSummary,
  StartPlanningShadowInput,
  StartPlanningShadowResult,
  StartShadowTrace
} from "./types";

const PREPARED_BY = "Read-Only Strategy Room Intelligence Shadow Integration v1";

function summarizeFieldValue(
  bundle: HiddenIntelligenceBundle | null,
  fieldKey: ExtractionFieldKey
) {
  if (!bundle) {
    return null;
  }

  return bundle.extractionState.fields[fieldKey].value?.summary ?? null;
}

function buildArtifactSignature(
  bundle: ReturnType<typeof createArtifactsFromPlanningThreadState>
) {
  return stableHash(
    bundle
      .map(
        (artifact) =>
          `${artifact.artifactId}|${artifact.createdAt}|${artifact.role}|${artifact.rawContent}`
      )
      .join("||")
  );
}

function buildExtractionChangeSummary(
  previousBundle: HiddenIntelligenceBundle | null,
  nextBundle: HiddenIntelligenceBundle
) {
  const fieldKeys = Object.keys(nextBundle.extractionState.fields) as ExtractionFieldKey[];
  const fieldTransitions = fieldKeys.flatMap((fieldKey) => {
    const nextField = nextBundle.extractionState.fields[fieldKey];
    const previousField = previousBundle?.extractionState.fields[fieldKey];
    const previousStatus = previousField?.status ?? "unanswered";
    const previousSummary = summarizeFieldValue(previousBundle, fieldKey);
    const nextSummary = nextField.value?.summary ?? null;
    const changed =
      previousStatus !== nextField.status || (previousSummary ?? "") !== (nextSummary ?? "");

    if (!changed) {
      return [];
    }

    return [
      {
        fieldKey,
        previousStatus,
        nextStatus: nextField.status,
        previousSummary,
        nextSummary
      }
    ];
  });
  const previousAssumptions = new Map(
    (previousBundle?.extractionState.assumptions ?? []).map((assumption) => [
      assumption.assumptionId,
      assumption.status
    ])
  );
  const previousContradictions = new Map(
    (previousBundle?.extractionState.contradictions ?? []).map((contradiction) => [
      contradiction.contradictionId,
      contradiction.status
    ])
  );
  const previousUnknowns = new Map(
    (previousBundle?.extractionState.unknowns ?? []).map((unknown) => [
      unknown.unknownId,
      unknown.resolved
    ])
  );

  return {
    changedFieldKeys: fieldTransitions.map((transition) => transition.fieldKey),
    fieldTransitions,
    newAssumptionIds: nextBundle.extractionState.assumptions
      .filter((assumption) => !previousAssumptions.has(assumption.assumptionId))
      .map((assumption) => assumption.assumptionId),
    updatedAssumptionIds: nextBundle.extractionState.assumptions
      .filter(
        (assumption) =>
          previousAssumptions.has(assumption.assumptionId) &&
          previousAssumptions.get(assumption.assumptionId) !== assumption.status
      )
      .map((assumption) => assumption.assumptionId),
    newContradictionIds: nextBundle.extractionState.contradictions
      .filter((contradiction) => !previousContradictions.has(contradiction.contradictionId))
      .map((contradiction) => contradiction.contradictionId),
    resolvedContradictionIds: nextBundle.extractionState.contradictions
      .filter(
        (contradiction) =>
          previousContradictions.get(contradiction.contradictionId) === "open" &&
          contradiction.status === "resolved"
      )
      .map((contradiction) => contradiction.contradictionId),
    newUnknownIds: nextBundle.extractionState.unknowns
      .filter((unknown) => !previousUnknowns.has(unknown.unknownId))
      .map((unknown) => unknown.unknownId),
    resolvedUnknownIds: nextBundle.extractionState.unknowns
      .filter(
        (unknown) =>
          previousUnknowns.get(unknown.unknownId) === false && unknown.resolved
      )
      .map((unknown) => unknown.unknownId),
    previousRoadmapState: previousBundle?.extractionState.roadmapReadiness.state ?? "not_ready",
    nextRoadmapState: nextBundle.extractionState.roadmapReadiness.state,
    roadmapStateChanged:
      (previousBundle?.extractionState.roadmapReadiness.state ?? "not_ready") !==
      nextBundle.extractionState.roadmapReadiness.state,
    previousExecutionState:
      previousBundle?.extractionState.executionReadiness.state ?? "not_ready",
    nextExecutionState: nextBundle.extractionState.executionReadiness.state,
    executionStateChanged:
      (previousBundle?.extractionState.executionReadiness.state ?? "not_ready") !==
      nextBundle.extractionState.executionReadiness.state
  } satisfies ShadowExtractionChangeSummary;
}

function activeOverlayKeys(bundle: HiddenIntelligenceBundle | null) {
  if (!bundle) {
    return [];
  }

  return Object.values(bundle.branchState.overlays)
    .filter(
      (overlay) =>
        overlay.state === "active" || overlay.state === "high-confidence active"
    )
    .map((overlay) => overlay.overlayKey);
}

function buildBranchChangeSummary(
  previousBundle: HiddenIntelligenceBundle | null,
  nextBundle: HiddenIntelligenceBundle
) {
  const previousActiveOverlays = activeOverlayKeys(previousBundle);
  const nextActiveOverlays = activeOverlayKeys(nextBundle);
  const shift = previousBundle
    ? detectBranchShift(previousBundle.branchState, nextBundle.branchState)
    : null;
  const previousPrimaryBranch = previousBundle?.branchState.primaryBranch?.branch ?? null;
  const nextPrimaryBranch = nextBundle.branchState.primaryBranch?.branch ?? null;
  const notes = [];

  if (!previousBundle) {
    notes.push("Initial shadow branch snapshot captured from the live planning thread.");
  } else if (previousPrimaryBranch !== nextPrimaryBranch) {
    notes.push(
      `Primary branch changed from ${previousPrimaryBranch ?? "none"} to ${nextPrimaryBranch ?? "none"}.`
    );
  } else if (
    previousBundle.branchState.ambiguity.severity !==
    nextBundle.branchState.ambiguity.severity
  ) {
    notes.push(
      `Branch ambiguity moved from ${previousBundle.branchState.ambiguity.severity} to ${nextBundle.branchState.ambiguity.severity}.`
    );
  }

  return {
    previousPrimaryBranch,
    nextPrimaryBranch,
    previousAmbiguitySeverity: previousBundle?.branchState.ambiguity.severity ?? null,
    nextAmbiguitySeverity: nextBundle.branchState.ambiguity.severity,
    overlaysAdded: nextActiveOverlays.filter(
      (overlayKey) => !previousActiveOverlays.includes(overlayKey)
    ),
    overlaysRemoved: previousActiveOverlays.filter(
      (overlayKey) => !nextActiveOverlays.includes(overlayKey)
    ),
    branchResolutionRequiredChanged:
      (previousBundle?.branchState.branchResolutionRequired ?? false) !==
      nextBundle.branchState.branchResolutionRequired,
    shiftLevel: shift?.level ?? null,
    notes
  } satisfies ShadowBranchChangeSummary;
}

function buildTrace(args: {
  input: StartPlanningShadowInput;
  artifactSignature: string;
  artifactIds: string[];
  previousBundle: HiddenIntelligenceBundle | null;
  nextBundle: HiddenIntelligenceBundle;
}) {
  const comparison = compareLiveAndHiddenQuestionTargets({
    assistantReply: args.input.assistantMessage.content,
    questionSelection: args.nextBundle.questionSelection,
    branchState: args.nextBundle.branchState,
    strategyFramework: args.nextBundle.strategyFramework,
    visibleStrategist: args.input.visibleStrategist ?? null,
    previousTrace: getStartPlanningShadowSession(args.input.threadState.threadId)?.latestTrace
  });
  const extractionChanges = buildExtractionChangeSummary(
    args.previousBundle,
    args.nextBundle
  );
  const branchChanges = buildBranchChangeSummary(args.previousBundle, args.nextBundle);
  const decisionNotes = dedupe([
    comparison.summary,
    ...args.nextBundle.recompute.decisionNotes,
    `Strategy phase: ${args.nextBundle.strategyFramework.progressModel.currentPhaseId}.`,
    ...branchChanges.notes,
    ...extractionChanges.fieldTransitions
      .slice(0, 4)
      .map(
        (transition) =>
          `${transition.fieldKey}: ${transition.previousStatus} -> ${transition.nextStatus}`
      )
  ]);

  return {
    id: createAdapterRecordId(
      "start-shadow-trace",
      `${args.input.threadState.threadId}-${args.input.assistantMessage.id}`
    ),
    date: args.input.threadState.updatedAt,
    preparedBy: args.input.preparedBy ?? PREPARED_BY,
    traceId: createAdapterRecordId(
      "start-shadow-trace",
      `${args.input.threadState.threadId}-${args.artifactSignature}`
    ),
    threadId: args.input.threadState.threadId,
    lane: args.input.threadState.lane,
    artifactSignature: args.artifactSignature,
    mirroredArtifactIds: args.artifactIds,
    liveQuestionAnalysis: comparison.live,
    hiddenQuestionSelection: comparison.hidden,
    visibleStrategist: args.input.visibleStrategist ?? null,
    strategyFramework: {
      currentPhaseId: args.nextBundle.strategyFramework.progressModel.currentPhaseId,
      nextBestPhaseId: args.nextBundle.strategyFramework.progressModel.nextBestPhaseId,
      activeBranchIds: args.nextBundle.strategyFramework.activeBranchIds,
      activeOverlayIds: args.nextBundle.strategyFramework.activeOverlays
        .filter((overlay) => overlay.active)
        .map((overlay) => overlay.overlayId),
      currentPhaseCompletionState:
        args.nextBundle.strategyFramework.phaseProgress[
          args.nextBundle.strategyFramework.progressModel.currentPhaseId
        ].completionState,
      currentPhaseMissingRequiredTruthKeys:
        args.nextBundle.strategyFramework.phaseProgress[
          args.nextBundle.strategyFramework.progressModel.currentPhaseId
        ].missingRequiredTruthKeys,
      minimumDataGateReady: args.nextBundle.strategyFramework.minimumDataGate.ready,
      minimumDataGateState: args.nextBundle.strategyFramework.minimumDataGate.state,
      workspaceHandoffReady:
        args.nextBundle.strategyFramework.workspaceHandoffReadiness.ready,
      workspaceHandoffState:
        args.nextBundle.strategyFramework.workspaceHandoffReadiness.state,
      readinessConfidence:
        args.nextBundle.strategyFramework.progressModel.readinessConfidence,
      unresolvedBlockers:
        args.nextBundle.strategyFramework.progressModel.unresolvedBlockers,
      summarySafeFields: args.nextBundle.strategyFramework.summarySafeFields
    },
    comparison,
    extractionChanges,
    branchChanges,
    warnings: dedupe(args.nextBundle.warnings),
    decisionNotes,
    createdAt: args.input.threadState.updatedAt
  } satisfies StartShadowTrace;
}

export function mirrorStartPlanningThreadShadow(
  input: StartPlanningShadowInput
): StartPlanningShadowResult {
  const preparedBy = input.preparedBy ?? PREPARED_BY;
  const artifacts = createArtifactsFromPlanningThreadState(input.threadState, preparedBy);
  const artifactSignature = buildArtifactSignature(artifacts);
  const previousSession = getStartPlanningShadowSession(input.threadState.threadId);

  if (
    !input.forceRebuild &&
    previousSession?.latestArtifactSignature === artifactSignature
  ) {
    return {
      enabled: true,
      skipped: true,
      reason: "The current /start thread snapshot was already mirrored into the hidden shadow store.",
      bundle: previousSession.latestBundle,
      trace: previousSession.latestTrace,
      comparison: previousSession.latestComparison,
      report: previousSession.latestReport,
      session: previousSession
    };
  }

  const nextBundle = rebuildIntelligenceStateFromArtifacts(artifacts, {
    preparedBy,
    currentStage: "extraction"
  });
  const trace = buildTrace({
    input: {
      ...input,
      preparedBy
    },
    artifactSignature,
    artifactIds: artifacts.map((artifact) => artifact.artifactId),
    previousBundle: previousSession?.latestBundle ?? null,
    nextBundle
  });
  const session = setStartPlanningShadowSession({
    id:
      previousSession?.id ??
      createAdapterRecordId("start-shadow-session", input.threadState.threadId),
    date: input.threadState.updatedAt,
    preparedBy,
    threadId: input.threadState.threadId,
    lane: input.threadState.lane,
    latestArtifactSignature: artifactSignature,
    latestBundle: nextBundle,
    latestTrace: trace,
    latestComparison: trace.comparison,
    latestReport: null,
    latestMirroredAt: input.threadState.updatedAt,
    traces: [...(previousSession?.traces ?? []), trace],
    warnings: dedupe([...(previousSession?.warnings ?? []), ...nextBundle.warnings])
  });
  const report = buildStartShadowSessionReport(session);
  const sessionWithReport = setStartPlanningShadowSession({
    ...session,
    latestReport: report
  });

  return {
    enabled: true,
    skipped: false,
    reason: null,
    bundle: nextBundle,
    trace,
    comparison: trace.comparison,
    report,
    session: sessionWithReport
  };
}

export function mirrorStartPlanningThreadShadowIfEnabled(
  input: StartPlanningShadowInput
): StartPlanningShadowResult {
  if (!isStartPlanningShadowEnabled()) {
    return {
      enabled: false,
      skipped: true,
      reason:
        "Start planning shadow intelligence is disabled. Set NEROA_ENABLE_START_SHADOW_INTELLIGENCE=1 to enable read-only mirroring.",
      bundle: null,
      trace: null,
      comparison: null,
      report: null,
      session: null
    };
  }

  return mirrorStartPlanningThreadShadow(input);
}
