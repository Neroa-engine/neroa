import type { ArchitectureBlueprint } from "../intelligence/architecture";
import type { GovernancePolicy } from "../intelligence/governance";
import type { ProjectBrief } from "../intelligence/project-brief";
import type { RoadmapPlan } from "../intelligence/roadmap";
import type { StoredProjectMetadata } from "../workspace/project-metadata";
import {
  buildBlockerQuestionState,
  getBlockerDefinition
} from "./blockers.ts";
import { buildBlockerQueue } from "./blocker-queue.ts";
import { buildNextQuestionPlan, buildRuntimeQuestionContext } from "./question-planner.ts";
import { getBlockerSchemaDefinition } from "./schemas.ts";
import type { BlockerId } from "./types.ts";
import {
  activeBlockerDecisionSchema,
  blockerQueueEntrySchema,
  blockerRuntimeStateSchema,
  strategyPlanningRuntimeSummarySchema,
  type ActiveBlockerDecision,
  type BlockerClarificationPlan,
  type BlockerQueue,
  type BlockerQueueEntry,
  type BlockerRuntimeState,
  type BlockerTransitionResult,
  type StrategyPlanningRuntimeSummary
} from "./runtime-types.ts";

type RuntimeBuildArgs = {
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  previousRuntimeState?: BlockerRuntimeState | null;
  forceActiveBlockerId?: BlockerId | null;
  clarificationPlan?: BlockerClarificationPlan | null;
  lastAnsweredBlockerId?: BlockerId | null;
  lastTransition?: BlockerTransitionResult | null;
};

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function cloneQueueEntry(entry: BlockerQueueEntry, status: BlockerQueueEntry["status"]) {
  return blockerQueueEntrySchema.parse({
    ...entry,
    status
  });
}

function findAskableEntry(queue: BlockerQueue) {
  return (
    queue.entries.find(
      (entry) =>
        entry.canAskNow &&
        (entry.status === "unresolved" || entry.status === "partially_resolved")
    ) ?? null
  );
}

function findEntryByBlockerId(queue: BlockerQueue, blockerId?: BlockerId | null) {
  if (!blockerId) {
    return null;
  }

  return queue.entries.find((entry) => entry.blockerId === blockerId) ?? null;
}

function resolveClarificationBlockerId(args: {
  queue: BlockerQueue;
  forceActiveBlockerId?: BlockerId | null;
  clarificationPlan?: BlockerClarificationPlan | null;
  previousRuntimeState?: BlockerRuntimeState | null;
}) {
  const forced = findEntryByBlockerId(args.queue, args.forceActiveBlockerId);

  if (forced && forced.canAskNow && forced.status !== "resolved") {
    return forced.blockerId;
  }

  const clarificationBlockerId =
    args.clarificationPlan?.blockerId ??
    args.previousRuntimeState?.currentClarificationState?.blockerId ??
    null;
  const clarificationEntry = findEntryByBlockerId(args.queue, clarificationBlockerId);

  if (
    clarificationEntry &&
    clarificationEntry.canAskNow &&
    clarificationEntry.status !== "resolved"
  ) {
    return clarificationEntry.blockerId;
  }

  return null;
}

function pickActiveEntry(args: {
  queue: BlockerQueue;
  forceActiveBlockerId?: BlockerId | null;
  clarificationPlan?: BlockerClarificationPlan | null;
  previousRuntimeState?: BlockerRuntimeState | null;
}) {
  const clarificationBlockerId = resolveClarificationBlockerId(args);

  if (clarificationBlockerId) {
    const entry = findEntryByBlockerId(args.queue, clarificationBlockerId);

    if (entry) {
      return {
        entry,
        reason:
          args.forceActiveBlockerId != null
            ? "The runtime kept the same blocker active because the latest answer still needs blocker-specific clarification."
            : "The runtime resumed the existing blocker clarification thread."
      };
    }
  }

  const askable = findAskableEntry(args.queue);

  const previousActiveEntry = findEntryByBlockerId(
    args.queue,
    args.previousRuntimeState?.activeBlockerId ?? null
  );

  if (
    previousActiveEntry &&
    previousActiveEntry.canAskNow &&
    previousActiveEntry.status !== "resolved" &&
    (!askable || askable.blockerId === previousActiveEntry.blockerId)
  ) {
    return {
      entry: previousActiveEntry,
      reason: "The runtime resumed the current active blocker from the existing planning state."
    };
  }

  if (askable) {
    return {
      entry: askable,
      reason: askable.requiredForApproval
        ? "This is the highest-priority approval-critical blocker that can be asked right now."
        : "This is the next highest-priority blocker that can be asked right now."
    };
  }

  return {
    entry: null,
    reason:
      args.queue.unresolvedCount > 0
        ? "Unresolved blockers remain, but they are deferred until earlier dependencies are resolved."
        : "No unresolved blockers remain right now."
  };
}

function buildQueueWithActiveEntry(args: {
  queue: BlockerQueue;
  activeBlockerId?: BlockerId | null;
  clarificationBlockerId?: BlockerId | null;
}) {
  return args.queue.entries.map((entry) => {
    if (!args.activeBlockerId || entry.blockerId !== args.activeBlockerId) {
      return entry;
    }

    if (!entry.canAskNow || entry.status === "resolved") {
      return entry;
    }

    return cloneQueueEntry(
      entry,
      args.clarificationBlockerId === entry.blockerId
        ? "partially_resolved"
        : "active"
    );
  });
}

function buildReadinessImpactSummary(queue: BlockerQueue) {
  if (queue.approvalCriticalCount > 0) {
    return `${queue.approvalCriticalCount} approval-critical blocker${
      queue.approvalCriticalCount === 1 ? "" : "s"
    } still need to be resolved.`;
  }

  if (queue.unresolvedCount > 0) {
    return `${queue.unresolvedCount} planning blocker${
      queue.unresolvedCount === 1 ? "" : "s"
    } still need to be tightened.`;
  }

  return "The critical planning blockers are currently covered.";
}

function mapSourceLayerToQuestionSource(
  sourceLayer: BlockerQueueEntry["sourceLayer"]
) {
  if (sourceLayer === "architecture") {
    return "architecture" as const;
  }

  if (sourceLayer === "roadmap") {
    return "roadmap" as const;
  }

  if (sourceLayer === "governance") {
    return "governance" as const;
  }

  if (sourceLayer === "revision") {
    return "revision" as const;
  }

  if (sourceLayer === "runtime") {
    return "runtime" as const;
  }

  return "project_brief" as const;
}

function inferInputId(entry: BlockerQueueEntry) {
  if (cleanText(entry.inputId)) {
    return cleanText(entry.inputId);
  }

  const definition = getBlockerDefinition(entry.blockerId);
  const fallbackInputId =
    definition?.activeWhen.inputIds[0] ?? definition?.activeWhen.slotIds[0] ?? entry.blockerId;

  return fallbackInputId;
}

function inferSlotId(entry: BlockerQueueEntry) {
  const definition = getBlockerDefinition(entry.blockerId);
  return definition?.activeWhen.slotIds[0] ?? null;
}

export function buildActiveBlockerDecision(args: RuntimeBuildArgs): ActiveBlockerDecision {
  const queue = buildBlockerQueue(args);
  const clarificationBlockerId = resolveClarificationBlockerId({
    queue,
    forceActiveBlockerId: args.forceActiveBlockerId ?? null,
    clarificationPlan: args.clarificationPlan ?? null,
    previousRuntimeState: args.previousRuntimeState ?? null
  });
  const selected = pickActiveEntry({
    queue,
    forceActiveBlockerId: args.forceActiveBlockerId ?? null,
    clarificationPlan: args.clarificationPlan ?? null,
    previousRuntimeState: args.previousRuntimeState ?? null
  });
  const questionContext = selected.entry
    ? buildRuntimeQuestionContext({
        entry: selected.entry,
        clarificationPlan:
          clarificationBlockerId === selected.entry.blockerId
            ? args.clarificationPlan ??
              args.previousRuntimeState?.currentClarificationState ??
              null
            : null
      })
    : null;

  return activeBlockerDecisionSchema.parse({
    blockerId: selected.entry?.blockerId ?? null,
    reason: selected.reason,
    sourceLayer: selected.entry?.sourceLayer ?? null,
    priority: selected.entry?.priority ?? null,
    questionContext
  });
}

export function buildBlockerRuntimeState(args: RuntimeBuildArgs): BlockerRuntimeState {
  const queue = buildBlockerQueue(args);
  const clarificationBlockerId = resolveClarificationBlockerId({
    queue,
    forceActiveBlockerId: args.forceActiveBlockerId ?? null,
    clarificationPlan: args.clarificationPlan ?? null,
    previousRuntimeState: args.previousRuntimeState ?? null
  });
  const activeSelection = pickActiveEntry({
    queue,
    forceActiveBlockerId: args.forceActiveBlockerId ?? null,
    clarificationPlan: args.clarificationPlan ?? null,
    previousRuntimeState: args.previousRuntimeState ?? null
  });
  const activeEntry = activeSelection.entry;
  const queueEntries = buildQueueWithActiveEntry({
    queue,
    activeBlockerId: activeEntry?.blockerId ?? null,
    clarificationBlockerId
  });
  const activeQuestionPlan = activeEntry
    ? buildNextQuestionPlan({
        entry: activeEntry,
        clarificationPlan:
          clarificationBlockerId === activeEntry.blockerId
            ? args.clarificationPlan ??
              args.previousRuntimeState?.currentClarificationState ??
              null
            : null
      })
    : null;
  const activeDefinition =
    activeEntry != null ? getBlockerDefinition(activeEntry.blockerId) : null;
  const activeSchema =
    activeDefinition != null ? getBlockerSchemaDefinition(activeDefinition.schemaId) : null;

  return blockerRuntimeStateSchema.parse({
    queue: {
      entries: queueEntries,
      unresolvedCount: queue.unresolvedCount,
      approvalCriticalCount: queue.approvalCriticalCount
    },
    activeBlockerId: activeEntry?.blockerId ?? null,
    currentQuestion: activeQuestionPlan?.questionText ?? null,
    currentHelperText: activeQuestionPlan?.helperText ?? null,
    currentAllowedSchemaId: activeSchema?.id ?? null,
    currentAllowedWriteTargets: activeDefinition?.allowedWriteTargets ?? [],
    currentClarificationState:
      clarificationBlockerId && activeEntry?.blockerId === clarificationBlockerId
        ? args.clarificationPlan ??
          args.previousRuntimeState?.currentClarificationState ??
          null
        : null,
    currentQuestionPlan: activeQuestionPlan,
    lastAnsweredBlockerId:
      args.lastAnsweredBlockerId ??
      args.previousRuntimeState?.lastAnsweredBlockerId ??
      null,
    lastTransition: args.lastTransition ?? args.previousRuntimeState?.lastTransition ?? null,
    readinessImpactSummary: buildReadinessImpactSummary(queue),
    unresolvedCount: queue.unresolvedCount,
    approvalCriticalCount: queue.approvalCriticalCount
  });
}

export function getActiveBlockerEntry(runtimeState: BlockerRuntimeState) {
  return findEntryByBlockerId(runtimeState.queue, runtimeState.activeBlockerId);
}

export function buildBlockerQuestionStateFromRuntime(runtimeState: BlockerRuntimeState) {
  const activeEntry = getActiveBlockerEntry(runtimeState);

  if (!activeEntry) {
    return null;
  }

  return buildBlockerQuestionState({
    blockerId: activeEntry.blockerId,
    inputId: inferInputId(activeEntry),
    slotId: inferSlotId(activeEntry),
    label: activeEntry.label,
    question: runtimeState.currentQuestion ?? activeEntry.currentQuestionText,
    source: mapSourceLayerToQuestionSource(activeEntry.sourceLayer),
    currentValue: activeEntry.currentValue
  });
}

export function buildStrategyPlanningRuntimeSummary(
  runtimeState: BlockerRuntimeState
): StrategyPlanningRuntimeSummary {
  const activeEntry = getActiveBlockerEntry(runtimeState);
  const activeDefinition =
    activeEntry != null ? getBlockerDefinition(activeEntry.blockerId) : null;

  return strategyPlanningRuntimeSummarySchema.parse({
    headline:
      runtimeState.unresolvedCount > 0
        ? `${runtimeState.unresolvedCount} planning blocker${
            runtimeState.unresolvedCount === 1 ? "" : "s"
          } still need attention`
        : "Planning blockers are currently covered",
    activeBlockerLabel: activeDefinition?.label ?? activeEntry?.label ?? null,
    activeQuestion: runtimeState.currentQuestion ?? null,
    unresolvedCount: runtimeState.unresolvedCount,
    approvalCriticalCount: runtimeState.approvalCriticalCount,
    currentFocus:
      runtimeState.currentHelperText ??
      runtimeState.readinessImpactSummary,
    statusLabel:
      runtimeState.approvalCriticalCount > 0
        ? "Approval blockers active"
        : runtimeState.unresolvedCount > 0
          ? "Planning blockers active"
          : "Ready for approval review"
  });
}
