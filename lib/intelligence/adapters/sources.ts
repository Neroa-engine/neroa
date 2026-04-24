import type {
  PlanningLaneId,
  PlanningMessage,
  PlanningThreadState
} from "@/lib/start/planning-thread";
import type { NaruaMessage } from "@/lib/narua/planning";
import type { StrategyLaneSnapshot } from "@/lib/workspace/strategy-lane";
import { createAdapterRecordId, mapExternalRoleToArtifactRole } from "./helpers";
import type {
  ConversationArtifact,
  ConversationMessageArtifact,
  ConversationPlanningNoteArtifact,
  ConversationSourceSurface,
  ImportedThreadSnapshotArtifact
} from "./types";

const DETERMINISTIC_FALLBACK_TIMESTAMP = "1970-01-01T00:00:00.000Z";

function resolveArtifactTimestamp(
  createdAt?: string | null,
  threadUpdatedAt?: string | null
) {
  return createdAt ?? threadUpdatedAt ?? DETERMINISTIC_FALLBACK_TIMESTAMP;
}

function buildMessageArtifact(args: {
  threadId: string;
  sourceSurface: ConversationSourceSurface;
  role: ConversationMessageArtifact["role"];
  artifactId?: string | null;
  createdAt?: string | null;
  rawContent: string;
  metadata?: ConversationArtifact["metadata"];
  preparedBy?: string;
}) {
  const artifactId =
    args.artifactId && args.artifactId.trim().length > 0
      ? args.artifactId
      : createAdapterRecordId(
          "conversation-artifact",
          `${args.threadId}-${args.sourceSurface}-${args.role}-${args.rawContent}`
        );

  const createdAt = resolveArtifactTimestamp(
    args.createdAt,
    args.metadata?.threadUpdatedAt
  );

  return {
    id: artifactId,
    date: createdAt,
    preparedBy: args.preparedBy,
    artifactId,
    threadId: args.threadId,
    sourceSurface: args.sourceSurface,
    kind: "message",
    role: args.role,
    rawContent: args.rawContent,
    createdAt,
    metadata: args.metadata
  } satisfies ConversationMessageArtifact;
}

export function createArtifactFromPlanningMessage(args: {
  threadId: string;
  message: PlanningMessage;
  lane: PlanningLaneId;
  messageIndex: number;
  threadUpdatedAt?: string;
  preparedBy?: string;
}) {
  return buildMessageArtifact({
    threadId: args.threadId,
    sourceSurface: "start_planning",
    role: args.message.role,
    artifactId: args.message.id,
    createdAt: args.message.createdAt,
    rawContent: args.message.content,
    metadata: {
      laneId: args.lane,
      laneLabel: args.lane.toUpperCase(),
      messageIndex: args.messageIndex,
      threadUpdatedAt: args.threadUpdatedAt
    },
    preparedBy: args.preparedBy
  });
}

export function createArtifactsFromPlanningThreadState(
  threadState: PlanningThreadState,
  preparedBy?: string
) {
  return threadState.messages.map((message, index) =>
    createArtifactFromPlanningMessage({
      threadId: threadState.threadId,
      message,
      lane: threadState.lane,
      messageIndex: index,
      threadUpdatedAt: threadState.updatedAt,
      preparedBy
    })
  );
}

export function createArtifactFromNaruaMessage(args: {
  threadId: string;
  sourceSurface: ConversationSourceSurface;
  message: NaruaMessage;
  messageIndex: number;
  metadata?: ConversationArtifact["metadata"];
  preparedBy?: string;
}) {
  return buildMessageArtifact({
    threadId: args.threadId,
    sourceSurface: args.sourceSurface,
    role: mapExternalRoleToArtifactRole(args.message.role) as ConversationMessageArtifact["role"],
    artifactId: args.message.id,
    createdAt: args.metadata?.threadUpdatedAt,
    rawContent: args.message.content,
    metadata: {
      ...args.metadata,
      messageIndex: args.messageIndex
    },
    preparedBy: args.preparedBy
  });
}

export function createArtifactsFromStrategyLaneSnapshot(args: {
  threadId: string;
  snapshot: StrategyLaneSnapshot;
  workspaceId?: string | null;
  projectId?: string | null;
  preparedBy?: string;
}) {
  const promptFieldHint =
    args.snapshot.activeQuestionField === "concept"
      ? "core_concept"
      : args.snapshot.activeQuestionField === "target"
      ? "primary_users"
      : args.snapshot.activeQuestionField === "offer"
      ? "mvp_in_scope"
      : args.snapshot.activeQuestionField === "launch"
      ? "desired_outcome"
      : args.snapshot.activeQuestionField === "budget"
      ? "budget_constraints"
      : args.snapshot.activeQuestionField === "needs"
      ? "systems_touched"
      : null;

  return args.snapshot.messages.map((message, index) =>
    createArtifactFromNaruaMessage({
      threadId: args.threadId,
      sourceSurface: "workspace_strategy_lane",
      message,
      messageIndex: index,
      metadata: {
        workspaceId: args.workspaceId,
        projectId: args.projectId,
        contextTitle: args.snapshot.contextTitle,
        promptFieldHint,
        questionTargetIdHint: promptFieldHint ? `field:${promptFieldHint}` : null,
        questionSelectionStageHint: "extraction",
        threadUpdatedAt: args.snapshot.updatedAt
      },
      preparedBy: args.preparedBy
    })
  );
}

export function createImportedThreadSnapshotArtifact(args: {
  threadId: string;
  sourceSurface: ConversationSourceSurface;
  rawContent: string;
  childArtifacts: ConversationArtifact[];
  createdAt?: string | null;
  metadata?: ConversationArtifact["metadata"];
  preparedBy?: string;
}) {
  const artifactId = createAdapterRecordId(
    "thread-snapshot",
    `${args.threadId}-${args.sourceSurface}-${args.rawContent}`
  );

  const createdAt = resolveArtifactTimestamp(
    args.createdAt,
    args.metadata?.threadUpdatedAt
  );

  return {
    id: artifactId,
    date: createdAt,
    preparedBy: args.preparedBy,
    artifactId,
    threadId: args.threadId,
    sourceSurface: args.sourceSurface,
    kind: "thread_snapshot",
    role: "system",
    rawContent: args.rawContent,
    createdAt,
    childArtifactIds: args.childArtifacts.map((artifact) => artifact.artifactId),
    metadata: args.metadata
  } satisfies ImportedThreadSnapshotArtifact;
}

export function createPlanningNoteArtifact(args: {
  threadId: string;
  sourceSurface: ConversationSourceSurface;
  rawContent: string;
  createdAt?: string | null;
  metadata?: ConversationArtifact["metadata"];
  preparedBy?: string;
}) {
  const artifactId = createAdapterRecordId(
    "planning-note",
    `${args.threadId}-${args.sourceSurface}-${args.rawContent}`
  );

  const createdAt = resolveArtifactTimestamp(
    args.createdAt,
    args.metadata?.threadUpdatedAt
  );

  return {
    id: artifactId,
    date: createdAt,
    preparedBy: args.preparedBy,
    artifactId,
    threadId: args.threadId,
    sourceSurface: args.sourceSurface,
    kind: "planning_note",
    role: "planner_note",
    rawContent: args.rawContent,
    createdAt,
    metadata: args.metadata
  } satisfies ConversationPlanningNoteArtifact;
}

export function sortConversationArtifactsDeterministically(
  artifacts: ConversationArtifact[]
) {
  return [...artifacts].sort((left, right) => {
    if (left.createdAt !== right.createdAt) {
      return left.createdAt.localeCompare(right.createdAt);
    }

    const leftIndex = left.metadata?.messageIndex ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = right.metadata?.messageIndex ?? Number.MAX_SAFE_INTEGER;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.artifactId.localeCompare(right.artifactId);
  });
}
