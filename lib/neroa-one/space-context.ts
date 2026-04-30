import type { StoredProjectMetadata } from "../workspace/project-metadata.ts";
import {
  neroaOneRoomContextSchema,
  spaceContextInputSchema,
  spaceContextSchema,
  type NeroaOneRoomContext,
  type SpaceContext,
  type SpaceContextInput
} from "./schemas.ts";

const defaultRoomContexts = [
  {
    roomId: "project_room",
    classification: "dashboard_control_panel",
    localStateAllowed: true,
    metadataWritesAllowed: false
  },
  {
    roomId: "strategy_room",
    classification: "planning_room",
    localStateAllowed: true,
    metadataWritesAllowed: true
  },
  {
    roomId: "command_center",
    classification: "customer_operations_room",
    localStateAllowed: true,
    metadataWritesAllowed: true
  },
  {
    roomId: "build_room",
    classification: "execution_room",
    localStateAllowed: true,
    metadataWritesAllowed: true
  },
  {
    roomId: "library",
    classification: "evidence_room",
    localStateAllowed: true,
    metadataWritesAllowed: true
  }
] as const satisfies readonly NeroaOneRoomContext[];

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function clipText(value: string | null | undefined, maxLength = 220) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clipped = normalized.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return clipped || normalized;
}

function normalizeStringList(value: string | readonly string[] | null | undefined) {
  if (typeof value === "string") {
    const normalized = normalizeText(value);
    return normalized ? [normalized] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeText(item)).filter(Boolean);
}

function deriveProjectState(projectMetadata: StoredProjectMetadata | null | undefined) {
  if (projectMetadata?.archived) {
    return "archived";
  }

  if ((projectMetadata?.executionState?.executionPackets?.length ?? 0) > 0) {
    return "execution_ready";
  }

  if ((projectMetadata?.strategyState?.revisionRecords?.length ?? 0) > 0) {
    return "planning_in_review";
  }

  return "draft";
}

function deriveCurrentPhase(args: {
  projectMetadata: StoredProjectMetadata | null | undefined;
  providedPhase: string | null | undefined;
}) {
  const providedPhase = normalizeText(args.providedPhase);

  if (providedPhase) {
    return providedPhase;
  }

  if (
    (args.projectMetadata?.executionState?.pendingExecutions?.length ?? 0) > 0 ||
    (args.projectMetadata?.executionState?.executionPackets?.length ?? 0) > 0
  ) {
    return "build";
  }

  if (
    args.projectMetadata?.buildSession ||
    args.projectMetadata?.saasIntake ||
    args.projectMetadata?.mobileAppIntake
  ) {
    return "scope";
  }

  return "strategy";
}

function deriveCurrentFocus(args: {
  providedFocus: string | readonly string[] | null | undefined;
  projectMetadata: StoredProjectMetadata | null | undefined;
}) {
  const providedFocus = normalizeStringList(args.providedFocus);

  if (providedFocus.length > 0) {
    return providedFocus;
  }

  if ((args.projectMetadata?.executionState?.pendingExecutions?.length ?? 0) > 0) {
    return ["Prepare the next approved execution packet"];
  }

  if (args.projectMetadata?.buildSession || args.projectMetadata?.saasIntake) {
    return ["Tighten the first-build scope"];
  }

  return ["Clarify the first customer request"];
}

function deriveNextRecommendedAction(args: {
  providedAction: string | null | undefined;
  phase: string;
}) {
  const providedAction = normalizeText(args.providedAction);

  if (providedAction) {
    return providedAction;
  }

  if (args.phase === "build") {
    return "Review the next execution handoff before release.";
  }

  if (args.phase === "scope") {
    return "Confirm version-one scope before widening execution.";
  }

  return "Capture the next missing product truth.";
}

function deriveTruthSummary(args: {
  providedSummary: string | null | undefined;
  projectTitle: string;
  projectDescription: string | null | undefined;
  phase: string;
}) {
  const providedSummary = clipText(args.providedSummary);

  if (providedSummary) {
    return providedSummary;
  }

  const description = clipText(args.projectDescription);

  if (description) {
    return description;
  }

  return `${args.projectTitle} is currently centered on the ${args.phase} phase.`;
}

function normalizeRoomContexts(roomContexts: readonly NeroaOneRoomContext[] | null | undefined) {
  if (!roomContexts?.length) {
    return defaultRoomContexts.map((roomContext) => neroaOneRoomContextSchema.parse(roomContext));
  }

  return roomContexts.map((roomContext) => neroaOneRoomContextSchema.parse(roomContext));
}

export function buildSpaceContext(input: SpaceContextInput): SpaceContext {
  const args = spaceContextInputSchema.parse(input);
  const projectMetadata = (args.projectMetadata ?? null) as StoredProjectMetadata | null;
  const projectId = normalizeText(args.projectId) || args.workspaceId;
  const compatibilityMode = projectId === args.workspaceId;
  const currentPhase = deriveCurrentPhase({
    projectMetadata,
    providedPhase: args.currentPhase
  });
  const currentFocus = deriveCurrentFocus({
    providedFocus: args.currentFocus,
    projectMetadata
  });
  const nextRecommendedAction = deriveNextRecommendedAction({
    providedAction: args.nextRecommendedAction,
    phase: currentPhase
  });

  return spaceContextSchema.parse({
    spaceId: projectId,
    workspaceId: args.workspaceId,
    projectId,
    compatibilityMode,
    project: {
      title: args.projectTitle,
      description: normalizeText(args.projectDescription) || null,
      state: deriveProjectState(projectMetadata),
      truthSummary: deriveTruthSummary({
        providedSummary: args.projectTruthSummary,
        projectTitle: args.projectTitle,
        projectDescription: args.projectDescription,
        phase: currentPhase
      }),
      currentPhase,
      currentFocus,
      nextRecommendedAction
    },
    strategyState: {
      status:
        (projectMetadata?.strategyState?.revisionRecords?.length ?? 0) > 0
          ? "active"
          : "idle",
      revisionCount: projectMetadata?.strategyState?.revisionRecords?.length ?? 0,
      planningThreadMessageCount:
        projectMetadata?.strategyState?.planningThreadState?.messages?.length ?? 0
    },
    commandState: {
      decisionCount: projectMetadata?.commandCenterDecisions?.length ?? 0,
      changeReviewCount: projectMetadata?.commandCenterChangeReviews?.length ?? 0,
      taskCount: projectMetadata?.commandCenterTasks?.length ?? 0,
      previewStatus: normalizeText(projectMetadata?.commandCenterPreviewState?.state) || null,
      approvedPackageStatus:
        normalizeText(projectMetadata?.commandCenterApprovedDesignPackage?.status) || null
    },
    buildState: {
      pendingExecutionCount: projectMetadata?.executionState?.pendingExecutions?.length ?? 0,
      executionPacketCount: projectMetadata?.executionState?.executionPackets?.length ?? 0
    },
    libraryEvidenceState: {
      assetCount: projectMetadata?.assets?.length ?? 0
    },
    usageCreditState: {
      status: "placeholder",
      note: "Usage and credit policy remains a future backend concern."
    },
    roomContexts: normalizeRoomContexts(args.roomContexts)
  });
}
