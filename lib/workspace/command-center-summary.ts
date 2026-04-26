import {
  buildProjectContextSnapshot,
  pickFirstProjectContextText,
  type WorkspacePhaseId
} from "@/lib/workspace/project-context-summary";
import {
  isOpenDecisionStatus,
  type CommandCenterDecisionRelatedArea,
  type CommandCenterDecisionSeverity,
  type CommandCenterDecisionSourceType,
  type CommandCenterDecisionStatus,
  type StoredCommandCenterDecision
} from "@/lib/workspace/command-center-decisions";
import {
  isActiveChangeReviewStatus,
  needsFollowUpChangeReviewStatus,
  type CommandCenterChangeReviewStatus,
  type CommandCenterChangeSourceType,
  type CommandCenterChangeType,
  type CommandCenterDecisionEffect,
  type CommandCenterImpactConfidence,
  type CommandCenterImpactLevel,
  type CommandCenterReadinessEffect,
  type StoredCommandCenterChangeReview
} from "@/lib/workspace/command-center-change-impact";
import {
  COMMAND_CENTER_DESIGN_CONTROL_AREAS,
  COMMAND_CENTER_DESIGN_LIBRARY_TOTAL_MODES,
  COMMAND_CENTER_DESIGN_MODE_HIGHLIGHTS,
  COMMAND_CENTER_PREVIEW_BOUNDARY_RULES,
  COMMAND_CENTER_PREVIEW_WORKFLOW_STEPS,
  defaultCommandCenterDesignControls,
  defaultStoredCommandCenterPreviewState,
  formatCommandCenterApprovedDesignPackageStatusLabel,
  formatCommandCenterDesignModeLabel,
  formatCommandCenterPreviewApprovalStatusLabel,
  formatCommandCenterPreviewSourceLabel,
  formatCommandCenterPreviewStateLabel,
  formatCommandCenterPreviewSurfaceTarget,
  normalizeStoredCommandCenterApprovedDesignPackage,
  normalizeStoredCommandCenterPreviewState,
  type CommandCenterPreviewSource,
  type CommandCenterPreviewSurfaceTarget,
  type StoredCommandCenterDesignControls,
  type CommandCenterApprovedDesignPackageStatus,
  type CommandCenterDesignModeHighlight,
  type CommandCenterPreviewStateStatus,
  type StoredCommandCenterApprovedDesignPackage,
  type StoredCommandCenterPreviewState
} from "@/lib/workspace/command-center-design-preview";
import {
  getOrderedProjectLanes,
  getProjectLanePhaseForLane,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";
import type { LiveViewSession } from "@/lib/live-view/types";
import type {
  StoredCommandCenterBrandColors,
  StoredProjectMetadata
} from "@/lib/workspace/project-metadata";
import {
  buildBrowserRuntimeBridgeSnapshot,
  buildDesignLibraryRuntimeTarget,
  isBrowserRuntimeReadyForPreview,
  type BrowserRuntimeBridgeState
} from "@/lib/workspace/browser-runtime-bridge";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import {
  isOpenCommandCenterTaskStatus,
  type CommandCenterTaskSourceType,
  type CommandCenterTaskStatus,
  type StoredCommandCenterTask
} from "@/lib/workspace/command-center-tasks";

export type CommandCenterTruthSource =
  | "real-project-truth"
  | "derived-planning-truth"
  | "future-system"
  | "preview-control-truth";

export type CommandCenterDataState = "stable" | "partial" | "degraded";

export type CommandCenterWorkStreamStatus =
  | "Leading Now"
  | "Ready Next"
  | "Waiting"
  | "Needs Decision"
  | "Framed";

export type CommandCenterWorkStream = {
  slotLabel: string;
  worktreeLabel: string;
  segmentLabel: string;
  name: string;
  covers: string;
  status: CommandCenterWorkStreamStatus;
  relatedFocus: string;
  note: string | null;
  source: "derived-planning-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterStateBand = {
  title: string;
  label: string;
  detail: string;
  source: CommandCenterTruthSource;
  dataState: Exclude<CommandCenterDataState, "stable"> | "stable";
};

export type CommandCenterListPanel = {
  title: string;
  description: string;
  items: string[];
  emptyState: string;
  source: CommandCenterTruthSource;
  dataState: CommandCenterDataState;
};

export type CommandCenterFutureSurface = {
  title: string;
  body: string;
  source: "future-system";
};

export type CommandCenterDecisionItem = {
  id: string;
  title: string;
  prompt: string;
  rationale: string;
  category: string;
  severity: CommandCenterDecisionSeverity;
  status: CommandCenterDecisionStatus;
  blocking: boolean;
  sourceType: CommandCenterDecisionSourceType;
  relatedArea: CommandCenterDecisionRelatedArea;
  answerPreview: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  dataState: CommandCenterDataState;
};

export type CommandCenterDecisionInbox = {
  title: string;
  description: string;
  openCount: number;
  blockingOpenCount: number;
  items: CommandCenterDecisionItem[];
  emptyState: string;
  source: "derived-planning-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterChangeImpactItem = {
  id: string;
  title: string;
  summary: string;
  changeType: CommandCenterChangeType;
  impactLevel: CommandCenterImpactLevel;
  confidence: CommandCenterImpactConfidence;
  affectedAreas: string[];
  readinessEffect: CommandCenterReadinessEffect;
  decisionEffect: CommandCenterDecisionEffect;
  followUpRequired: boolean;
  sourceType: CommandCenterChangeSourceType;
  relatedDecisionIds: string[];
  relatedDecisionTitles: string[];
  reviewStatus: CommandCenterChangeReviewStatus;
  reviewNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  dataState: CommandCenterDataState;
};

export type CommandCenterChangeImpactReview = {
  title: string;
  description: string;
  activeCount: number;
  highestImpactLevel: CommandCenterImpactLevel | null;
  items: CommandCenterChangeImpactItem[];
  emptyState: string;
  source: "derived-planning-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterAnalyzerPanel = {
  title: string;
  statusLabel: string;
  currentAnalysis: string;
  watching: string[];
  recommendation: string;
  intakeTitle: string;
  intakeDescription: string;
  flowSummary: string;
  source: "derived-planning-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterPromptQueueState = "next" | "queued" | "waiting";

export type CommandCenterPromptExecutionLevel = "Low" | "Medium" | "High" | "Very High";

export type CommandCenterPromptQueueItem = {
  runId: string;
  label: string;
  taskTitle: string;
  roadmapArea: string;
  queueState: CommandCenterPromptQueueState;
  executionLevel: CommandCenterPromptExecutionLevel;
};

export type CommandCenterPromptRunnerPanel = {
  title: string;
  runId: string | null;
  currentExecutionLevel: CommandCenterPromptExecutionLevel | null;
  upcomingRunId: string | null;
  statusLabel: string;
  statusPills: string[];
  scopeLabel: string;
  detail: string;
  queuedNext: string | null;
  queue: CommandCenterPromptQueueItem[];
  bridgeLabel: string;
  namingGuide: {
    prefixLabel: string;
    trackLabels: Array<{
      code: string;
      meaning: string;
    }>;
    sequenceHint: string;
  };
  source: "future-system";
  dataState: CommandCenterDataState;
};

export type CommandCenterTaskItem = {
  id: string;
  title: string;
  request: string;
  status: CommandCenterTaskStatus;
  roadmapArea: string;
  sourceType: CommandCenterTaskSourceType;
  promptRunId: string;
  dataState: CommandCenterDataState;
};

export type CommandCenterTaskQueuePanel = {
  title: string;
  description: string;
  flowSummary: string;
  currentTask: CommandCenterTaskItem | null;
  nextTasks: CommandCenterTaskItem[];
  waitingOnDecision: CommandCenterTaskItem[];
  recentlyCleared: CommandCenterTaskItem[];
  currentRoadmapArea: string | null;
  nextRoadmapAreas: string[];
  availableRoadmapAreas: string[];
  source: "derived-planning-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterProductionStatusPanel = {
  title: string;
  label: string;
  detail: string;
  source: "derived-planning-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterDesignPreviewArchitecture = {
  savedTruth: {
    label: string;
    detail: string;
    activeModeLabel: string;
    packageId: string | null;
  };
  previewState: {
    state: CommandCenterPreviewStateStatus;
    label: string;
    detail: string;
    approvalStatus: "not_requested" | "approved" | "superseded";
    approvalStatusLabel: string;
    previewSessionId: string | null;
    source: CommandCenterPreviewSource;
    sourceLabel: string;
    selectedControls: StoredCommandCenterDesignControls;
    notes: string | null;
    targetedSurfaceTargets: CommandCenterPreviewSurfaceTarget[];
    targetedSurfaces: string[];
    activeModeLabel: string;
    controlSummary: string[];
    lastUpdatedAt: string | null;
  };
  approvedPackage: {
    packageId: string | null;
    status: CommandCenterApprovedDesignPackageStatus | "none";
    label: string;
    detail: string;
    affectedSurfaceTargets: CommandCenterPreviewSurfaceTarget[];
    affectedSurfaces: string[];
    affectedZones: string[];
    selectedControls: StoredCommandCenterDesignControls | null;
    implementationIntent: string | null;
    cautionNotes: string[];
    approvedAt: string | null;
  };
  controlAreas: string[];
  highlightedModes: CommandCenterDesignModeHighlight[];
  totalModes: number;
  workflowSteps: string[];
  boundaryRules: string[];
};

export type CommandCenterBrowserPanel = {
  title: string;
  runtimeState: BrowserRuntimeBridgeState;
  statusLabel: string;
  detail: string;
  liveSessionId: string | null;
  lastHeartbeatAt: string | null;
  lastSeenOrigin: string | null;
  connectionState: string;
  inspectionState: string;
  previewState: CommandCenterPreviewStateStatus;
  previewStateLabel: string;
  previewSessionId: string | null;
  approvedPackageStatus: CommandCenterApprovedDesignPackageStatus | "none";
  approvedPackageLabel: string;
  qcState: string;
  ctaLabel: string;
  source: "preview-control-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterDesignLibraryPanel = {
  title: string;
  statusLabel: string;
  detail: string;
  runtimeState: BrowserRuntimeBridgeState;
  runtimeReady: boolean;
  runtimeTargetLabel: string;
  runtimeTargetDetail: string;
  currentTruthLabel: string;
  currentTruthDetail: string;
  activeModeLabel: string;
  previewState: CommandCenterPreviewStateStatus;
  previewStateLabel: string;
  previewNotes: string | null;
  selectedControls: StoredCommandCenterDesignControls;
  targetedSurfaceTargets: CommandCenterPreviewSurfaceTarget[];
  targetedSurfaces: string[];
  approvedPackageStatus: CommandCenterApprovedDesignPackageStatus | "none";
  approvedPackageLabel: string;
  approvedPackageId: string | null;
  implementationIntent: string | null;
  cautionNotes: string[];
  affectedZones: string[];
  controlAreas: string[];
  highlightedModes: CommandCenterDesignModeHighlight[];
  totalModes: number;
  workflowSteps: string[];
  boundaryRules: string[];
  ctaLabel: string;
  approvalCtaLabel: string;
  source: "preview-control-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterBrandSystemPanel = {
  title: string;
  statusLabel: string;
  detail: string;
  currentIdentity: string;
  currentColorway: string;
  assetState: string;
  motto: string | null;
  typographyPreference: string | null;
  visualMood: string | null;
  buttonStylePreference: string | null;
  colors: StoredCommandCenterBrandColors;
  assets: Array<{
    id: string;
    name: string;
    kind: string;
    kindLabel: string;
    sizeLabel: string | null;
  }>;
  ctaLabel: string;
  source: "preview-control-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterRoomState = {
  title: string;
  body: string;
  issues: string[];
  source: "derived-planning-truth";
  dataState: CommandCenterDataState;
};

export type CommandCenterBuildRoomHandoff = {
  title: string;
  body: string;
  source: "future-system";
  ctaLabel: string;
  dataState: CommandCenterDataState;
};

export type CommandCenterSummary = {
  roomState: CommandCenterRoomState;
  activePhase: CommandCenterStateBand;
  executionReadiness: CommandCenterStateBand;
  currentFocus: CommandCenterListPanel;
  analyzer: CommandCenterAnalyzerPanel;
  promptRunner: CommandCenterPromptRunnerPanel;
  taskQueue: CommandCenterTaskQueuePanel;
  productionStatus: CommandCenterProductionStatusPanel;
  designPreviewArchitecture: CommandCenterDesignPreviewArchitecture;
  browserStatus: CommandCenterBrowserPanel;
  designLibrary: CommandCenterDesignLibraryPanel;
  brandSystem: CommandCenterBrandSystemPanel;
  decisionInbox: CommandCenterDecisionInbox;
  changeImpactReview: CommandCenterChangeImpactReview;
  blockers: CommandCenterListPanel;
  watchouts: CommandCenterListPanel;
  nextMilestone: CommandCenterStateBand;
  activeWorkStreams: number;
  workStreams: CommandCenterWorkStream[];
  buildRoomHandoff: CommandCenterBuildRoomHandoff;
  futureSystems: CommandCenterFutureSurface[];
};

const phaseLabelMap: Record<WorkspacePhaseId, string> = {
  strategy: "Strategy",
  scope: "Scope Definition",
  mvp: "MVP Build Plan",
  build: "Development Readiness"
};

const workStreamNameOverrides: Record<string, string> = {
  Strategy: "Product Direction",
  Scope: "Scope Definition",
  MVP: "MVP Definition",
  Build: "Build Preparation",
  Test: "Validation",
  Requirements: "Product Requirements",
  Architecture: "Project Structure",
  Coding: "Build Delivery",
  Testing: "Quality Review",
  Deployment: "Release Readiness",
  Documentation: "Documentation",
  Budget: "Budget Planning",
  Launch: "Launch Readiness",
  Operate: "Operating Readiness",
  Operations: "Operating Readiness",
  "Brand Strategy": "Brand Direction",
  "Business Plan": "Business Structure",
  Website: "Launch Website",
  Marketing: "Go-to-Market",
  "Product Catalog": "Product Lineup",
  Storefront: "Storefront Experience",
  "Domain Search": "Naming & Domain",
  Branding: "Brand System"
};

const commandCenterHiddenWorkStreamNames = new Set([
  "Product Direction",
  "Brand Direction",
  "Business Structure",
  "Budget Planning",
  "Naming & Domain",
  "Product Lineup",
  "Go-to-Market",
  "Launch Website"
]);

function buildPromptRunId(track: "TA" | "RV" | "SG", index = 1) {
  return `NC-${track}-${String(index).padStart(3, "0")}`;
}

function resolvePromptTrack(args: {
  label: string;
  roomState: CommandCenterRoomState;
}): "TA" | "RV" | "SG" {
  const text = args.label.toLowerCase();

  if (
    args.roomState.dataState !== "stable" &&
    (text.includes("signal") ||
      text.includes("clarif") ||
      text.includes("project picture") ||
      text.includes("tighten"))
  ) {
    return "SG";
  }

  if (
    text.includes("review") ||
    text.includes("impact") ||
    text.includes("decision") ||
    text.includes("follow-up")
  ) {
    return "RV";
  }

  return "TA";
}

function commandCenterTaskStatusRank(status: CommandCenterTaskStatus) {
  if (status === "active") return 0;
  if (status === "in_review") return 1;
  if (status === "waiting_on_decision") return 2;
  if (status === "ready") return 3;
  if (status === "queued") return 4;
  return 5;
}

function taskSourceRank(sourceType: CommandCenterTaskSourceType) {
  if (sourceType === "customer_request") return 0;
  if (sourceType === "change_review_follow_up") return 1;
  if (sourceType === "decision_follow_up") return 2;
  if (sourceType === "roadmap_follow_up") return 3;
  return 4;
}

function slugifyCommandCenterValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function defaultRoadmapAreaFromPhase(activePhase: WorkspacePhaseId) {
  if (activePhase === "strategy") return "Product direction";
  if (activePhase === "scope") return "Version-one scope";
  if (activePhase === "mvp") return "Build sequence";
  return "Active delivery lane";
}

function clipText(value: string | null | undefined, maxLength = 160) {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clipped = normalized.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return clipped ? `${clipped}...` : normalized;
}

function sanitizeCustomerText(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  return value
    .replace(/\b[Ee]ngine\b/g, (match) => (match === "Engine" ? "Project" : "project"))
    .replace(/orchestration/gi, "coordination")
    .replace(/technical/gi, "build")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeListItems(items: Array<string | null | undefined>, limit = 4) {
  return Array.from(
    new Set(
      items
        .map((item) => sanitizeCustomerText(item) ?? item?.trim() ?? null)
        .filter((item): item is string => Boolean(item))
    )
  ).slice(0, limit);
}

function getPhaseLeadIndex(activePhase: WorkspacePhaseId, streamCount: number) {
  const indexByPhase: Record<WorkspacePhaseId, number> = {
    strategy: 0,
    scope: 1,
    mvp: 2,
    build: 2
  };

  return Math.min(indexByPhase[activePhase], Math.max(0, streamCount - 1));
}

function countStableProjectSignals(args: {
  projectMetadata?: StoredProjectMetadata | null;
  buildingSummary: string | null;
  audienceSummary: string | null;
  primaryGoal: string | null;
  laneCount: number;
}) {
  let score = 0;

  if (args.buildingSummary) score += 1;
  if (args.audienceSummary) score += 1;
  if (args.primaryGoal) score += 1;
  if (args.laneCount > 0) score += 1;
  if (
    args.projectMetadata?.buildSession ||
    args.projectMetadata?.guidedEntryContext ||
    args.projectMetadata?.saasIntake ||
    args.projectMetadata?.mobileAppIntake
  ) {
    score += 1;
  }

  return score;
}

function buildRoomState(args: {
  projectMetadata?: StoredProjectMetadata | null;
  buildingSummary: string | null;
  audienceSummary: string | null;
  primaryGoal: string | null;
  laneCount: number;
}) {
  const issues = normalizeListItems([
    !args.projectMetadata ? "Core project metadata is missing." : null,
    !args.buildingSummary ? "The product summary is still thin." : null,
    !args.audienceSummary ? "The primary user is still unclear." : null,
    !args.primaryGoal ? "The first outcome is still unclear." : null,
    args.laneCount === 0 ? "The current operator streams are not framed yet." : null
  ]);
  const signalCount = countStableProjectSignals(args);

  if (signalCount <= 2) {
    return {
      title: "Planning still needs a few core details.",
      body:
        "Command Center can still show the safest next operator moves, but readiness, queue order, and handoff signals should be treated as provisional until the project picture is stronger.",
      issues,
      source: "derived-planning-truth" as const,
      dataState: "degraded" as const
    };
  }

  if (issues.length > 0) {
    return {
      title: "Project picture is still sharpening.",
      body:
        "The room has enough project truth to stay useful, but some readiness, prompt, and handoff signals may still move as the picture sharpens.",
      issues,
      source: "derived-planning-truth" as const,
      dataState: "partial" as const
    };
  }

  return {
    title: "Project picture is clear enough to operate from.",
    body:
      "Command Center is still a coordination surface, but the current phase, readiness, queue, and operator streams are now anchored to a stable enough project picture.",
    issues: [],
    source: "derived-planning-truth" as const,
    dataState: "stable" as const
  };
}

function buildExecutionReadiness(args: {
  activePhase: WorkspacePhaseId;
  blockerCount: number;
  readinessEffect: CommandCenterReadinessEffect;
  roomState: CommandCenterRoomState;
}): CommandCenterStateBand {
  if (args.roomState.dataState === "degraded") {
    return {
      title: "Execution readiness",
      label: "Planning still needs work",
      detail:
        "There is not enough stable project truth yet to show how safely Neroa can move into deeper execution. Tighten the project picture first.",
      source: "derived-planning-truth",
      dataState: "degraded"
    };
  }

  if (args.readinessEffect === "more_blocked") {
    return {
      title: "Execution readiness",
      label: "Needs follow-up before progress widens",
      detail:
        "Open review items are still affecting the current execution picture. Resolve or review those items before treating the handoff as safely widened.",
      source: "derived-planning-truth",
      dataState: args.roomState.dataState
    };
  }

  if (args.readinessEffect === "review_needed" && args.blockerCount === 0) {
    return {
      title: "Execution readiness",
      label: "Execution needs another review pass",
      detail:
        "The project is not fully blocked, but recent changes still need review before Neroa should treat the handoff as settled.",
      source: "derived-planning-truth",
      dataState: args.roomState.dataState
    };
  }

  if (args.activePhase === "strategy") {
    return {
      title: "Execution readiness",
      label: args.blockerCount > 0 ? "Waiting on a few key decisions" : "Turning plan into operator work",
      detail:
        args.blockerCount > 0
          ? "A few core answers still need to land before scope and handoff signals can safely widen."
          : "The project direction is being turned into a cleaner operator picture, but this room is still organizing readiness rather than showing live delivery.",
      source: "derived-planning-truth",
      dataState: args.roomState.dataState
    };
  }

  if (args.activePhase === "scope") {
    return {
      title: "Execution readiness",
      label: args.blockerCount > 0 ? "Scope still depends on open answers" : "Version-one scope is locking in",
      detail:
        args.blockerCount > 0
          ? "Version-one scope is close enough to organize, but a few open decisions still need to settle before the handoff gets stronger."
          : "The project now has enough direction to organize operator streams around version one, while deeper delivery remains gated behind later rooms.",
      source: "derived-planning-truth",
      dataState: args.roomState.dataState
    };
  }

  if (args.activePhase === "mvp") {
    return {
      title: "Execution readiness",
      label: args.blockerCount > 0 ? "Build plan is waiting on answers" : "Build plan is taking shape",
      detail:
        args.blockerCount > 0
          ? "The first build sequence is visible, but key decisions still need to close before the handoff into deeper delivery should widen."
          : "The project picture is strong enough to organize the first build sequence, even though this room is still showing a derived readiness view.",
      source: "derived-planning-truth",
      dataState: args.roomState.dataState
    };
  }

  return {
    title: "Execution readiness",
    label:
      args.readinessEffect === "less_blocked"
        ? "Execution pressure is easing"
        : args.blockerCount > 0
          ? "Execution is waiting on answers"
          : "Ready for a controlled handoff",
    detail:
      args.readinessEffect === "less_blocked"
        ? "Recent review and decision changes have reduced the amount of coordination pressure standing between this room and a stronger build handoff."
        : args.blockerCount > 0
        ? "The project is far enough along for deeper delivery, but the remaining open decisions still need to settle before execution should widen."
        : "The project is far enough along to hand off toward protected build execution, while Command Center stays focused on coordination instead of live delivery control.",
    source: "derived-planning-truth",
    dataState: args.roomState.dataState
  };
}

function buildCurrentFocusPanel(args: {
  activePhase: WorkspacePhaseId;
  currentFocus: string[];
  roomState: CommandCenterRoomState;
}): CommandCenterListPanel {
  if (args.roomState.dataState === "degraded") {
    return {
      title: "Current operator focus",
      description:
        "There is not enough stable project truth yet to show a confident operator focus map. Tighten the project picture first.",
      items: [],
      emptyState: "Current operator focus will appear once the project picture is stronger.",
      source: "derived-planning-truth",
      dataState: "degraded"
    };
  }

  const description =
    args.roomState.dataState === "partial"
      ? "These are the strongest current signals shaping operator readiness, but some project detail is still missing."
      : args.activePhase === "strategy"
        ? "These are the signals currently shaping the project before scope and handoff widen."
        : "These are the highest-leverage signals currently shaping execution readiness.";

  return {
    title: "Current operator focus",
    description,
    items: normalizeListItems(args.currentFocus, 4),
    emptyState: "No current focus items are available yet.",
    source: "derived-planning-truth",
    dataState: args.roomState.dataState
  };
}

function buildPhaseBand(args: {
  activePhase: WorkspacePhaseId;
  roomState: CommandCenterRoomState;
}): CommandCenterStateBand {
  if (args.roomState.dataState === "degraded") {
    return {
      title: "Current phase",
      label: "Planning still incomplete",
      detail:
        "Command Center cannot confidently label the current project phase yet because the project picture is still too thin or partially missing.",
      source: "derived-planning-truth",
      dataState: "degraded"
    };
  }

  const detailByPhase: Record<WorkspacePhaseId, string> = {
    strategy:
      "The project is still tightening the core product picture before scope and operator work should widen.",
    scope:
      "The direction is clear enough to lock version-one scope, core flows, and handoff detail.",
    mvp:
      "The project has enough clarity to organize the first build plan and operator sequencing.",
    build:
      "The project is in a delivery-oriented phase, but Command Center still reflects coordination rather than live execution control."
  };

  return {
    title: "Current phase",
    label: phaseLabelMap[args.activePhase],
    detail: detailByPhase[args.activePhase],
    source: "derived-planning-truth",
    dataState: args.roomState.dataState
  };
}

function buildBlockers(args: {
  decisionInbox: CommandCenterDecisionInbox;
  roomState: CommandCenterRoomState;
}) {
  return args.decisionInbox.items
    .filter((item) => item.blocking && isOpenDecisionStatus(item.status))
    .map((item) => item.title)
    .slice(0, 4);
}

function buildWatchouts(args: {
  activePhase: WorkspacePhaseId;
  projectMetadata?: StoredProjectMetadata | null;
  decisionInbox: CommandCenterDecisionInbox;
  roomState: CommandCenterRoomState;
}) {
  const watchouts = normalizeListItems([
    args.decisionInbox.items.some(
      (item) => item.relatedArea === "integrations" && isOpenDecisionStatus(item.status)
    )
      ? "Integration detail is still light, so later sequencing may need another review."
      : null,
    args.decisionInbox.items.some(
      (item) => item.relatedArea === "build_handoff" && isOpenDecisionStatus(item.status)
    )
      ? "The first build sequence is still thin, which could slow the handoff into deeper delivery."
      : null,
    args.roomState.dataState === "partial"
      ? "The current project picture is still sharpening, so this coordination view may shift after the next update."
      : null
  ]);

  if (args.decisionInbox.blockingOpenCount === 0 && watchouts.length === 0) {
    watchouts.push(
      "No major watchouts are standing out yet. The current project phase is organizing cleanly."
    );
  }

  return watchouts.slice(0, 4);
}

function toCustomerWorkStreamName(title: string) {
  return workStreamNameOverrides[title] ?? title;
}

function shouldShowCommandCenterWorkStream(name: string) {
  return !commandCenterHiddenWorkStreamNames.has(name);
}

function buildWorkStreamStatus(args: {
  index: number;
  phaseLeadIndex: number;
  blockerCount: number;
  roomState: CommandCenterRoomState;
}): CommandCenterWorkStreamStatus {
  if (args.roomState.dataState === "degraded") {
    return args.index === 0 ? "Needs Decision" : "Waiting";
  }

  if (args.blockerCount > 0 && args.index === args.phaseLeadIndex) {
    return "Needs Decision";
  }

  if (args.index < args.phaseLeadIndex) {
    return "Framed";
  }

  if (args.index === args.phaseLeadIndex) {
    return "Leading Now";
  }

  if (args.index === args.phaseLeadIndex + 1) {
    return "Ready Next";
  }

  return "Waiting";
}

function buildWorkStreamNote(args: {
  status: CommandCenterWorkStreamStatus;
  blockers: string[];
  roomState: CommandCenterRoomState;
}) {
  if (args.roomState.dataState === "degraded") {
    return "This stream is provisional until the project picture is strong enough to support a firmer coordination view.";
  }

  if (args.roomState.dataState === "partial" && args.status === "Leading Now") {
    return "This stream is leading the current picture, but the plan is still missing some details.";
  }

  if (args.status === "Needs Decision") {
    return args.blockers[0] ?? "This stream is waiting on an open decision.";
  }

  if (args.status === "Ready Next") {
    return "This stream is positioned to move once the current milestone is locked.";
  }

  if (args.status === "Waiting") {
    return "This stream stays intentionally behind the current phase until readiness improves.";
  }

  if (args.status === "Framed") {
    return "This stream already has enough direction for the current project phase.";
  }

  return "This stream is leading the current execution picture right now.";
}

function buildWorkStreams(args: {
  project: ProjectRecord;
  activePhase: WorkspacePhaseId;
  currentFocus: string[];
  blockers: string[];
  roomState: CommandCenterRoomState;
}) {
  const orderedLanes = getOrderedProjectLanes(args.project)
    .filter((lane) => Boolean(lane.slug && lane.title))
    .map((lane) => ({
      ...lane,
      customerFacingName: toCustomerWorkStreamName(lane.title)
    }))
    .filter((lane) => shouldShowCommandCenterWorkStream(lane.customerFacingName))
    .slice(0, 4);
  const phaseLeadIndex = getPhaseLeadIndex(args.activePhase, orderedLanes.length);

  return orderedLanes.map((lane, index) => {
    const lanePhase = getProjectLanePhaseForLane(lane);
    const status = buildWorkStreamStatus({
      index,
      phaseLeadIndex,
      blockerCount: args.blockers.length,
      roomState: args.roomState
    });
    const relatedFocus =
      args.currentFocus[index] ??
      clipText(sanitizeCustomerText(lane.focusLabel), 80) ??
      "Keeping this stream aligned with the current project phase.";
    const covers =
      clipText(sanitizeCustomerText(lane.description), 150) ??
      "This stream carries part of the current project phase forward.";

    return {
      slotLabel: `Lane ${index + 1}`,
      worktreeLabel: `Worktree L${index + 1}`,
      segmentLabel: lanePhase.label,
      name: lane.customerFacingName,
      covers,
      status,
      relatedFocus,
      note: buildWorkStreamNote({
        status,
        blockers: args.blockers,
        roomState: args.roomState
      }),
      source: "derived-planning-truth",
      dataState: args.roomState.dataState
    } satisfies CommandCenterWorkStream;
  });
}

function buildNextMilestoneBand(args: {
  title: string;
  body: string;
  roomState: CommandCenterRoomState;
}) {
  if (args.roomState.dataState === "degraded") {
    return {
      title: "Next milestone",
      label: "Stabilize the project picture",
      detail:
        "Before Command Center can show a stronger milestone, the project still needs a clearer product picture and delivery boundary.",
      source: "derived-planning-truth",
      dataState: "degraded"
    } satisfies CommandCenterStateBand;
  }

  return {
    title: "Next milestone",
    label: args.title,
    detail:
      args.roomState.dataState === "partial"
        ? `${args.body} This milestone is still based on a partial project picture and may tighten after the next update.`
        : args.body,
    source: "derived-planning-truth",
    dataState: args.roomState.dataState
  } satisfies CommandCenterStateBand;
}

function buildBuildRoomHandoff(args: {
  activePhase: WorkspacePhaseId;
  blockers: string[];
  roomState: CommandCenterRoomState;
}) {
  if (args.roomState.dataState === "degraded") {
    return {
      title: "Build Room stays on hold for now.",
      body:
        "This project still needs a stronger picture before Build Room becomes a meaningful next step.",
      source: "future-system" as const,
      ctaLabel: "Review Build Room Gate",
      dataState: "degraded" as const
    };
  }

  if (args.blockers.length > 0) {
    return {
      title: "Build Room waits while key answers are still open.",
      body:
        "This room can point toward Build Room, but it should not imply deeper execution control while key answers are still unresolved.",
      source: "future-system" as const,
      ctaLabel: "Review Build Room Gate",
      dataState: args.roomState.dataState
    };
  }

  if (args.activePhase === "strategy" || args.activePhase === "scope") {
    return {
      title: "Build Room is visible, but it is still staged.",
      body:
        "Use Command Center to understand readiness. Build Room should stay a controlled handoff, not the default next step while planning is still tightening.",
      source: "future-system" as const,
      ctaLabel: "View Build Room",
      dataState: args.roomState.dataState
    };
  }

  return {
    title: "Build Room is ready once this handoff settles.",
    body:
      "Command Center should coordinate readiness and open questions first. Build Room remains the deeper, protected execution environment behind that handoff.",
    source: "future-system" as const,
    ctaLabel: "View Build Room",
    dataState: args.roomState.dataState
  };
}

function buildFutureSystems(): CommandCenterFutureSurface[] {
  return [];
}

function buildDecisionSeed(args: {
  id: string;
  title: string;
  prompt: string;
  rationale: string;
  category: string;
  severity: CommandCenterDecisionSeverity;
  blocking: boolean;
  sourceType: CommandCenterDecisionSourceType;
  relatedArea: CommandCenterDecisionRelatedArea;
  roomState: CommandCenterRoomState;
}): CommandCenterDecisionItem {
  return {
    id: args.id,
    title: args.title,
    prompt: args.prompt,
    rationale: args.rationale,
    category: args.category,
    severity: args.severity,
    status: "unanswered",
    blocking: args.blocking,
    sourceType: args.sourceType,
    relatedArea: args.relatedArea,
    answerPreview: null,
    createdAt: null,
    updatedAt: null,
    dataState: args.roomState.dataState
  };
}

function relatedAreaLabel(area: CommandCenterDecisionRelatedArea) {
  if (area === "first_user") return "First user";
  if (area === "product_scope") return "Product scope";
  if (area === "naming") return "Naming";
  if (area === "branding") return "Branding";
  if (area === "roadmap") return "Roadmap";
  if (area === "integrations") return "Integrations";
  if (area === "build_handoff") return "Build handoff";
  if (area === "execution_logic") return "Execution logic";
  if (area === "pricing") return "Pricing";
  if (area === "compliance") return "Compliance";
  return "Project truth";
}

function buildChangeImpactSeed(args: {
  id: string;
  title: string;
  summary: string;
  changeType: CommandCenterChangeType;
  impactLevel: CommandCenterImpactLevel;
  confidence: CommandCenterImpactConfidence;
  affectedAreas: string[];
  readinessEffect: CommandCenterReadinessEffect;
  decisionEffect: CommandCenterDecisionEffect;
  followUpRequired: boolean;
  sourceType: CommandCenterChangeSourceType;
  relatedDecisionIds?: string[];
  roomState: CommandCenterRoomState;
}): CommandCenterChangeImpactItem {
  return {
    id: args.id,
    title: args.title,
    summary: args.summary,
    changeType: args.changeType,
    impactLevel: args.impactLevel,
    confidence: args.confidence,
    affectedAreas: args.affectedAreas,
    readinessEffect: args.readinessEffect,
    decisionEffect: args.decisionEffect,
    followUpRequired: args.followUpRequired,
    sourceType: args.sourceType,
    relatedDecisionIds: args.relatedDecisionIds ?? [],
    relatedDecisionTitles: [],
    reviewStatus: "active",
    reviewNote: null,
    createdAt: null,
    updatedAt: null,
    dataState: args.roomState.dataState
  };
}

function severityRank(severity: CommandCenterDecisionSeverity) {
  if (severity === "critical") return 0;
  if (severity === "important") return 1;
  return 2;
}

function impactLevelRank(level: CommandCenterImpactLevel) {
  if (level === "significant") return 0;
  if (level === "moderate") return 1;
  return 2;
}

function statusRank(status: CommandCenterDecisionStatus) {
  if (status === "unanswered") return 0;
  if (status === "awaiting_review") return 1;
  if (status === "deferred") return 2;
  return 3;
}

function changeReviewStatusRank(status: CommandCenterChangeReviewStatus) {
  if (status === "follow_up_needed") return 0;
  if (status === "active") return 1;
  if (status === "acknowledged") return 2;
  return 3;
}

function buildInitialDecisionSeeds(args: {
  projectMetadata?: StoredProjectMetadata | null;
  activePhase: WorkspacePhaseId;
  buildingSummary: string | null;
  audienceSummary: string | null;
  primaryGoal: string | null;
  roomState: CommandCenterRoomState;
}) {
  const buildSession = args.projectMetadata?.buildSession ?? null;
  const seeds: CommandCenterDecisionItem[] = [];
  const missingProjectSignals = normalizeListItems([
    !args.buildingSummary ? "product summary" : null,
    !args.audienceSummary ? "primary user" : null,
    !args.primaryGoal ? "first outcome" : null
  ]);

  if (missingProjectSignals.length > 0) {
    seeds.push(
      buildDecisionSeed({
        id: "tighten-project-signal",
        title: "Tighten the project picture",
        prompt:
          "Which missing project details should Neroa lock next before execution, preview approvals, or build handoff widen further?",
        rationale:
          missingProjectSignals.length === 1
            ? `Command Center still needs a clearer ${missingProjectSignals[0]} before execution readiness can be trusted.`
            : `Command Center still needs a clearer ${missingProjectSignals.join(", ")} before execution readiness can be trusted.`,
        category: "Execution readiness",
        severity: "critical",
        blocking: true,
        sourceType: "derived_planning_gap",
        relatedArea: "product_scope",
        roomState: args.roomState
      })
    );
  }

  if (
    args.activePhase !== "strategy" &&
    !pickFirstProjectContextText(buildSession?.scope.coreWorkflow, buildSession?.scope.mvpSummary)
  ) {
    seeds.push(
      buildDecisionSeed({
        id: "define-first-user-flow",
        title: "Define the first user flow",
        prompt: "What should the first user be able to do from entry to success in the first build?",
        rationale:
          "The current phase is far enough along that Command Center needs a clearer first flow before the build handoff gets stronger.",
        category: "Execution handoff",
        severity: "important",
        blocking: true,
        sourceType: "execution_precondition",
        relatedArea: "build_handoff",
        roomState: args.roomState
      })
    );
  }

  if (
    args.activePhase === "scope" &&
    !(buildSession?.scope.coreFeatures?.length || buildSession?.scope.keyFeatures?.length)
  ) {
    seeds.push(
      buildDecisionSeed({
        id: "lock-version-one-scope",
        title: "Lock version-one scope",
        prompt: "Which features absolutely belong in version one, and which should wait?",
        rationale:
          "The current scope is still too loose to support a confident milestone and handoff.",
        category: "Product scope",
        severity: "important",
        blocking: false,
        sourceType: "derived_planning_gap",
        relatedArea: "product_scope",
        roomState: args.roomState
      })
    );
  }

  if (args.activePhase !== "strategy" && !buildSession?.scope.integrationNeeds?.length) {
    seeds.push(
      buildDecisionSeed({
        id: "confirm-integration-needs",
        title: "Confirm integration needs",
        prompt: "Which external systems, data sources, or internal tools must this first build connect to?",
        rationale:
          "Integration needs are still underspecified, which makes the downstream build picture less trustworthy.",
        category: "Integrations",
        severity: "normal",
        blocking: false,
        sourceType: "derived_planning_gap",
        relatedArea: "integrations",
        roomState: args.roomState
      })
    );
  }

  if (args.activePhase === "mvp" && !buildSession?.scope.firstBuild?.length) {
    seeds.push(
      buildDecisionSeed({
        id: "sequence-first-build",
        title: "Sequence the first build",
        prompt: "Which part of the product should be built first, second, and third?",
        rationale:
          "Command Center can see the MVP framing, but the first build sequence is still too thin to support a stronger handoff.",
        category: "Build handoff",
        severity: "important",
        blocking: false,
        sourceType: "execution_precondition",
        relatedArea: "build_handoff",
        roomState: args.roomState
      })
    );
  }

  return seeds;
}

function mergeDecisionItems(args: {
  seeds: CommandCenterDecisionItem[];
  stored: StoredCommandCenterDecision[];
  roomState: CommandCenterRoomState;
}) {
  const storedById = new Map(args.stored.map((item) => [item.id, item]));
  const seedIds = new Set(args.seeds.map((item) => item.id));

  const merged = args.seeds.map((seed) => {
    const persisted = storedById.get(seed.id);

    if (!persisted) {
      return seed;
    }

    return {
      ...seed,
      title: persisted.title || seed.title,
      prompt: persisted.prompt || seed.prompt,
      rationale: persisted.rationale || seed.rationale,
      category: persisted.category || seed.category,
      severity: persisted.severity,
      status: persisted.status,
      blocking: persisted.blocking,
      sourceType: persisted.sourceType,
      relatedArea: persisted.relatedArea,
      answerPreview: persisted.answerPreview,
      createdAt: persisted.createdAt,
      updatedAt: persisted.updatedAt,
      dataState: args.roomState.dataState
    } satisfies CommandCenterDecisionItem;
  });

  for (const persisted of args.stored) {
    if (seedIds.has(persisted.id)) {
      continue;
    }

    if (persisted.status === "resolved" || persisted.status === "deferred" || persisted.status === "awaiting_review") {
      merged.push({
        ...persisted,
        dataState: args.roomState.dataState
      });
    }
  }

  return merged.sort((left, right) => {
    const openDelta = Number(isOpenDecisionStatus(left.status)) - Number(isOpenDecisionStatus(right.status));

    if (openDelta !== 0) {
      return openDelta < 0 ? 1 : -1;
    }

    const blockingDelta = Number(left.blocking) - Number(right.blocking);
    if (blockingDelta !== 0) {
      return blockingDelta < 0 ? 1 : -1;
    }

    const severityDelta = severityRank(left.severity) - severityRank(right.severity);
    if (severityDelta !== 0) {
      return severityDelta;
    }

    const statusDelta = statusRank(left.status) - statusRank(right.status);
    if (statusDelta !== 0) {
      return statusDelta;
    }

    return left.title.localeCompare(right.title);
  });
}

function buildDecisionInbox(args: {
  projectMetadata?: StoredProjectMetadata | null;
  activePhase: WorkspacePhaseId;
  buildingSummary: string | null;
  audienceSummary: string | null;
  primaryGoal: string | null;
  roomState: CommandCenterRoomState;
}) {
  const seeds = buildInitialDecisionSeeds(args);
  const items = mergeDecisionItems({
    seeds,
    stored: args.projectMetadata?.commandCenterDecisions ?? [],
    roomState: args.roomState
  });
  const openItems = items.filter((item) => isOpenDecisionStatus(item.status));
  const blockingOpenCount = openItems.filter((item) => item.blocking).length;

  return {
    title: "Decision inbox",
    description:
      args.roomState.dataState === "degraded"
        ? "These questions are being derived from an incomplete project picture. Treat them as the safest next coordination actions before deeper execution."
        : "These are the questions Neroa still needs answered before deeper execution can move forward with confidence.",
    openCount: openItems.length,
    blockingOpenCount,
    items,
    emptyState:
      "No open execution questions are standing out right now. The current plan is stable enough for Command Center to stay in monitoring mode.",
    source: "derived-planning-truth" as const,
    dataState: args.roomState.dataState
  };
}

function buildInitialChangeImpactSeeds(args: {
  activePhase: WorkspacePhaseId;
  roomState: CommandCenterRoomState;
  decisionInbox: CommandCenterDecisionInbox;
  buildRoomHandoff: CommandCenterBuildRoomHandoff;
}) {
  const openDecisions = args.decisionInbox.items.filter((item) => isOpenDecisionStatus(item.status));
  const blockingOpenDecisions = openDecisions.filter((item) => item.blocking);
  const awaitingReviewDecisions = args.decisionInbox.items.filter(
    (item) => item.status === "awaiting_review"
  );
  const recentlyClearedBlockingDecisions = args.decisionInbox.items.filter(
    (item) =>
      item.blocking && (item.status === "resolved" || item.status === "deferred")
  );
  const buildHandoffDecisions = args.decisionInbox.items.filter(
    (item) =>
      item.relatedArea === "build_handoff" || item.relatedArea === "execution_logic"
  );
  const openBuildHandoffDecisions = buildHandoffDecisions.filter((item) =>
    isOpenDecisionStatus(item.status)
  );
  const seeds: CommandCenterChangeImpactItem[] = [];

  if (args.roomState.dataState !== "stable") {
    seeds.push(
      buildChangeImpactSeed({
        id: "project-truth-review",
        title:
          args.roomState.dataState === "degraded"
            ? "Project truth is incomplete enough to affect execution readiness"
            : "Project truth still needs a review before deeper execution widens",
        summary:
          args.roomState.dataState === "degraded"
            ? "The current project brief is still incomplete, so Command Center is treating phase, readiness, and operator streams as provisional. Review the open coordination questions before leaning on this room for deeper execution decisions."
            : "The current plan is usable, but part of the project picture is still incomplete. Review the open coordination questions before treating the build handoff as settled.",
        changeType: "project_truth_gap",
        impactLevel: args.roomState.dataState === "degraded" ? "significant" : "moderate",
        confidence: "high",
        affectedAreas: Array.from(
          new Set(
            openDecisions
              .slice(0, 4)
              .map((item) => relatedAreaLabel(item.relatedArea))
              .filter(Boolean)
          )
        ),
        readinessEffect:
          args.roomState.dataState === "degraded" ? "more_blocked" : "review_needed",
        decisionEffect: openDecisions.length > 0 ? "review_existing" : "create_new",
        followUpRequired: true,
        sourceType: "project_metadata_signal",
        relatedDecisionIds: openDecisions.map((item) => item.id),
        roomState: args.roomState
      })
    );
  }

  if (blockingOpenDecisions.length > 0) {
    seeds.push(
      buildChangeImpactSeed({
        id: "blocking-decisions-impact-readiness",
        title: "Blocking decisions are still shaping execution readiness",
        summary:
          blockingOpenDecisions.length === 1
            ? "One blocking decision is still unresolved, so the current handoff and sequencing picture should be reviewed before deeper execution moves forward."
            : `${blockingOpenDecisions.length} blocking decisions are still unresolved, so the current handoff and sequencing picture should be reviewed before deeper execution moves forward.`,
        changeType: "decision_state_change",
        impactLevel: blockingOpenDecisions.some((item) => item.severity === "critical")
          ? "significant"
          : "moderate",
        confidence: "high",
        affectedAreas: Array.from(
          new Set(blockingOpenDecisions.map((item) => relatedAreaLabel(item.relatedArea)))
        ),
        readinessEffect: "more_blocked",
        decisionEffect: "review_existing",
        followUpRequired: true,
        sourceType: "decision_inbox_signal",
        relatedDecisionIds: blockingOpenDecisions.map((item) => item.id),
        roomState: args.roomState
      })
    );
  }

  if (awaitingReviewDecisions.length > 0) {
    seeds.push(
      buildChangeImpactSeed({
        id: "decision-review-needed",
        title: "Recent answers still need follow-up review",
        summary:
          awaitingReviewDecisions.length === 1
            ? "A recent answer is waiting on review before Neroa can treat the current project picture as settled."
            : `${awaitingReviewDecisions.length} recent answers are waiting on review before Neroa can treat the current project picture as settled.`,
        changeType: "decision_state_change",
        impactLevel: awaitingReviewDecisions.some((item) => item.blocking) ? "moderate" : "light",
        confidence: "high",
        affectedAreas: Array.from(
          new Set(awaitingReviewDecisions.map((item) => relatedAreaLabel(item.relatedArea)))
        ),
        readinessEffect: awaitingReviewDecisions.some((item) => item.blocking)
          ? "review_needed"
          : "no_change",
        decisionEffect: "review_existing",
        followUpRequired: true,
        sourceType: "decision_inbox_signal",
        relatedDecisionIds: awaitingReviewDecisions.map((item) => item.id),
        roomState: args.roomState
      })
    );
  }

  if (
    (args.activePhase === "mvp" || args.activePhase === "build") &&
    (openBuildHandoffDecisions.length > 0 ||
      (buildHandoffDecisions.some(
        (item) => item.status === "resolved" || item.status === "deferred"
      ) &&
        args.buildRoomHandoff.dataState !== "stable"))
  ) {
    const needsReopen =
      openBuildHandoffDecisions.length === 0 &&
      buildHandoffDecisions.some(
        (item) => item.status === "resolved" || item.status === "deferred"
      ) &&
      args.buildRoomHandoff.dataState !== "stable";

    seeds.push(
      buildChangeImpactSeed({
        id: "build-handoff-review",
        title: "Build handoff assumptions still need review",
        summary: needsReopen
          ? "Earlier build-handoff decisions look less settled now that the current execution picture is still partial. Review whether those earlier answers should be reopened before treating Build Room as the next stable step."
          : "Build Room is visible, but the handoff assumptions are still moving. Review the current build sequence and handoff decisions before treating deeper execution as safely framed.",
        changeType: "build_handoff_change",
        impactLevel: openBuildHandoffDecisions.some((item) => item.blocking)
          ? "significant"
          : "moderate",
        confidence: args.roomState.dataState === "stable" ? "medium" : "high",
        affectedAreas: ["Build handoff", "Execution logic"],
        readinessEffect: openBuildHandoffDecisions.some((item) => item.blocking)
          ? "more_blocked"
          : "review_needed",
        decisionEffect: needsReopen ? "reopen_existing" : "review_existing",
        followUpRequired: true,
        sourceType: needsReopen ? "project_metadata_signal" : "derived_review",
        relatedDecisionIds: buildHandoffDecisions.map((item) => item.id),
        roomState: args.roomState
      })
    );
  }

  if (
    blockingOpenDecisions.length === 0 &&
    recentlyClearedBlockingDecisions.length > 0 &&
    args.roomState.dataState !== "degraded"
  ) {
    seeds.push(
      buildChangeImpactSeed({
        id: "blocking-pressure-reduced",
        title: "Recent decision closures reduced coordination pressure",
        summary:
          "Recent resolved or deferred blocking decisions have reduced the amount of review standing between this room and a stronger execution handoff. Neroa still keeps the handoff controlled, but the pressure is lighter than it was before.",
        changeType: "decision_state_change",
        impactLevel: "light",
        confidence: "medium",
        affectedAreas: Array.from(
          new Set(recentlyClearedBlockingDecisions.map((item) => relatedAreaLabel(item.relatedArea)))
        ),
        readinessEffect: "less_blocked",
        decisionEffect: "none",
        followUpRequired: false,
        sourceType: "decision_inbox_signal",
        relatedDecisionIds: recentlyClearedBlockingDecisions.map((item) => item.id),
        roomState: args.roomState
      })
    );
  }

  return seeds;
}

function mergeChangeImpactItems(args: {
  seeds: CommandCenterChangeImpactItem[];
  stored: StoredCommandCenterChangeReview[];
  decisionInbox: CommandCenterDecisionInbox;
  roomState: CommandCenterRoomState;
}) {
  const storedById = new Map(args.stored.map((item) => [item.id, item]));
  const decisionTitleById = new Map(
    args.decisionInbox.items.map((item) => [item.id, item.title] as const)
  );
  const seedIds = new Set(args.seeds.map((item) => item.id));

  const merged = args.seeds.map((seed) => {
    const persisted = storedById.get(seed.id);
    const relatedDecisionIds = persisted?.relatedDecisionIds?.length
      ? persisted.relatedDecisionIds
      : seed.relatedDecisionIds;

    if (!persisted) {
      return {
        ...seed,
        relatedDecisionTitles: relatedDecisionIds
          .map((decisionId) => decisionTitleById.get(decisionId))
          .filter((title): title is string => Boolean(title))
      } satisfies CommandCenterChangeImpactItem;
    }

    return {
      ...seed,
      title: persisted.title || seed.title,
      summary: persisted.summary || seed.summary,
      changeType: persisted.changeType,
      impactLevel: persisted.impactLevel,
      confidence: persisted.confidence,
      affectedAreas:
        persisted.affectedAreas.length > 0 ? persisted.affectedAreas : seed.affectedAreas,
      readinessEffect: persisted.readinessEffect,
      decisionEffect: persisted.decisionEffect,
      followUpRequired: persisted.followUpRequired,
      sourceType: persisted.sourceType,
      relatedDecisionIds,
      relatedDecisionTitles: relatedDecisionIds
        .map((decisionId) => decisionTitleById.get(decisionId))
        .filter((title): title is string => Boolean(title)),
      reviewStatus: persisted.reviewStatus,
      reviewNote: persisted.reviewNote,
      createdAt: persisted.createdAt,
      updatedAt: persisted.updatedAt,
      dataState: args.roomState.dataState
    } satisfies CommandCenterChangeImpactItem;
  });

  for (const persisted of args.stored) {
    if (seedIds.has(persisted.id)) {
      continue;
    }

    if (persisted.reviewStatus === "follow_up_needed") {
      merged.push({
        ...persisted,
        relatedDecisionTitles: persisted.relatedDecisionIds
          .map((decisionId) => decisionTitleById.get(decisionId))
          .filter((title): title is string => Boolean(title)),
        dataState: args.roomState.dataState
      });
    }
  }

  return merged.sort((left, right) => {
    const activeDelta = Number(isActiveChangeReviewStatus(left.reviewStatus)) -
      Number(isActiveChangeReviewStatus(right.reviewStatus));

    if (activeDelta !== 0) {
      return activeDelta < 0 ? 1 : -1;
    }

    const followUpDelta = Number(needsFollowUpChangeReviewStatus(left.reviewStatus)) -
      Number(needsFollowUpChangeReviewStatus(right.reviewStatus));

    if (followUpDelta !== 0) {
      return followUpDelta < 0 ? 1 : -1;
    }

    const impactDelta = impactLevelRank(left.impactLevel) - impactLevelRank(right.impactLevel);
    if (impactDelta !== 0) {
      return impactDelta;
    }

    const statusDelta =
      changeReviewStatusRank(left.reviewStatus) - changeReviewStatusRank(right.reviewStatus);
    if (statusDelta !== 0) {
      return statusDelta;
    }

    return left.title.localeCompare(right.title);
  });
}

function buildChangeImpactReview(args: {
  activePhase: WorkspacePhaseId;
  roomState: CommandCenterRoomState;
  decisionInbox: CommandCenterDecisionInbox;
  buildRoomHandoff: CommandCenterBuildRoomHandoff;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  const seeds = buildInitialChangeImpactSeeds(args);
  const items = mergeChangeImpactItems({
    seeds,
    stored: args.projectMetadata?.commandCenterChangeReviews ?? [],
    decisionInbox: args.decisionInbox,
    roomState: args.roomState
  });
  const activeItems = items.filter((item) => isActiveChangeReviewStatus(item.reviewStatus));
  const highestImpactLevel =
    activeItems.length > 0
      ? activeItems
          .slice()
          .sort((left, right) => impactLevelRank(left.impactLevel) - impactLevelRank(right.impactLevel))[0]
          ?.impactLevel ?? null
      : null;

  return {
    title: "Change impact review",
    description:
      args.roomState.dataState === "degraded"
        ? "This review is being derived from incomplete project truth, so treat it as a safe follow-up layer rather than precise change analysis."
        : "This review explains what the current project picture affects, whether follow-up is needed, and how readiness should be interpreted right now.",
    activeCount: activeItems.length,
    highestImpactLevel,
    items,
    emptyState:
      "No active change-impact review items are standing out right now. The current project picture is not signaling extra review pressure beyond the existing decision inbox.",
    source: "derived-planning-truth" as const,
    dataState: args.roomState.dataState
  };
}

function resolveReadinessEffect(items: CommandCenterChangeImpactItem[]) {
  const activeItems = items.filter((item) => needsFollowUpChangeReviewStatus(item.reviewStatus));

  if (activeItems.some((item) => item.readinessEffect === "more_blocked")) {
    return "more_blocked" as const;
  }

  if (activeItems.some((item) => item.readinessEffect === "review_needed")) {
    return "review_needed" as const;
  }

  if (
    items.some(
      (item) =>
        isActiveChangeReviewStatus(item.reviewStatus) && item.readinessEffect === "less_blocked"
    )
  ) {
    return "less_blocked" as const;
  }

  return "no_change" as const;
}

function currentRoadmapAreaFromStreams(args: {
  workStreams: CommandCenterWorkStream[];
  activePhase: WorkspacePhaseId;
}) {
  return (
    args.workStreams.find((stream) => stream.status === "Leading Now")?.name ??
    args.workStreams.find((stream) => stream.status === "Ready Next")?.name ??
    args.workStreams[0]?.name ??
    defaultRoadmapAreaFromPhase(args.activePhase)
  );
}

function roadmapAreaFromDecision(args: {
  decision: CommandCenterDecisionItem;
  workStreams: CommandCenterWorkStream[];
  activePhase: WorkspacePhaseId;
}) {
  if (args.decision.relatedArea === "branding" || args.decision.relatedArea === "naming") {
    return "Brand System";
  }

  if (args.decision.relatedArea === "integrations") {
    return "Integrations";
  }

  if (
    args.decision.relatedArea === "build_handoff" ||
    args.decision.relatedArea === "execution_logic"
  ) {
    return "Build handoff";
  }

  return currentRoadmapAreaFromStreams(args);
}

function buildTaskSeed(args: {
  id: string;
  title: string;
  request: string;
  status: CommandCenterTaskStatus;
  roadmapArea: string;
  sourceType: CommandCenterTaskSourceType;
}): StoredCommandCenterTask {
  return {
    id: args.id,
    title: args.title,
    request: args.request,
    status: args.status,
    roadmapArea: args.roadmapArea,
    sourceType: args.sourceType,
    createdAt: null,
    updatedAt: null
  };
}

function buildInitialTaskSeeds(args: {
  roomState: CommandCenterRoomState;
  activePhase: WorkspacePhaseId;
  decisionInbox: CommandCenterDecisionInbox;
  changeImpactReview: CommandCenterChangeImpactReview;
  nextMilestone: CommandCenterStateBand;
  workStreams: CommandCenterWorkStream[];
}) {
  const seeds: StoredCommandCenterTask[] = [];
  const currentRoadmapArea = currentRoadmapAreaFromStreams(args);
  const openBlockingDecision = args.decisionInbox.items.find(
    (item) => item.blocking && isOpenDecisionStatus(item.status)
  );
  const awaitingDecisionReview = args.decisionInbox.items.find(
    (item) => item.status === "awaiting_review"
  );
  const activeReview = args.changeImpactReview.items.find((item) =>
    needsFollowUpChangeReviewStatus(item.reviewStatus)
  );

  if (args.roomState.dataState !== "stable") {
    seeds.push(
      buildTaskSeed({
        id: "signal-cleanup",
        title:
          args.roomState.dataState === "degraded"
            ? "Tighten the project picture"
            : "Tighten the project picture before execution widens",
        request:
          args.roomState.dataState === "degraded"
            ? "Clarify the missing project details so readiness, tasks, and prompts can be trusted more confidently."
            : "Confirm the remaining planning details so task sequencing, previews, and handoff timing stop shifting.",
        status: args.roomState.dataState === "degraded" ? "in_review" : "ready",
        roadmapArea: currentRoadmapArea,
        sourceType: "signal_cleanup"
      })
    );
  }

  if (openBlockingDecision) {
    seeds.push(
      buildTaskSeed({
        id: `decision-${openBlockingDecision.id}`,
        title: openBlockingDecision.title,
        request: openBlockingDecision.prompt,
        status: "waiting_on_decision",
        roadmapArea: roadmapAreaFromDecision({
          decision: openBlockingDecision,
          workStreams: args.workStreams,
          activePhase: args.activePhase
        }),
        sourceType: "decision_follow_up"
      })
    );
  }

  if (awaitingDecisionReview) {
    seeds.push(
      buildTaskSeed({
        id: `decision-review-${awaitingDecisionReview.id}`,
        title: `Review ${awaitingDecisionReview.title}`,
        request: awaitingDecisionReview.prompt,
        status: "in_review",
        roadmapArea: roadmapAreaFromDecision({
          decision: awaitingDecisionReview,
          workStreams: args.workStreams,
          activePhase: args.activePhase
        }),
        sourceType: "decision_follow_up"
      })
    );
  }

  if (activeReview) {
    seeds.push(
      buildTaskSeed({
        id: `change-review-${activeReview.id}`,
        title: activeReview.title,
        request: activeReview.summary,
        status:
          activeReview.readinessEffect === "more_blocked"
            ? "waiting_on_decision"
            : "in_review",
        roadmapArea: activeReview.affectedAreas[0] ?? currentRoadmapArea,
        sourceType: "change_review_follow_up"
      })
    );
  }

  args.workStreams.slice(0, 4).forEach((stream) => {
    const title =
      clipText(stream.relatedFocus, 84) ??
      (stream.status === "Leading Now" ? `Advance ${stream.name}` : `Prepare ${stream.name}`);
    const request =
      stream.note ??
      stream.covers ??
      `Move ${stream.name} forward inside ${stream.segmentLabel}.`;

    seeds.push(
      buildTaskSeed({
        id: `roadmap-${slugifyCommandCenterValue(stream.name)}`,
        title,
        request,
        status:
          stream.status === "Leading Now"
            ? "active"
            : stream.status === "Ready Next"
              ? "ready"
              : stream.status === "Needs Decision"
                ? "waiting_on_decision"
                : "queued",
        roadmapArea: stream.name,
        sourceType: "roadmap_follow_up"
      })
    );
  });

  if (
    args.nextMilestone.label &&
    !seeds.some((item) => item.title.toLowerCase() === args.nextMilestone.label.toLowerCase())
  ) {
    seeds.push(
      buildTaskSeed({
        id: `milestone-${slugifyCommandCenterValue(args.nextMilestone.label)}`,
        title: args.nextMilestone.label,
        request: args.nextMilestone.detail,
        status: args.roomState.dataState === "stable" ? "ready" : "queued",
        roadmapArea: currentRoadmapArea,
        sourceType: "roadmap_follow_up"
      })
    );
  }

  return seeds;
}

function mergeTaskItems(args: {
  seeds: StoredCommandCenterTask[];
  stored: StoredCommandCenterTask[];
  roomState: CommandCenterRoomState;
}) {
  const storedById = new Map(args.stored.map((item) => [item.id, item]));
  const seedIds = new Set(args.seeds.map((item) => item.id));
  const merged = args.seeds.map((seed) => {
    const persisted = storedById.get(seed.id);

    if (!persisted) {
      return seed;
    }

    return {
      ...seed,
      title: persisted.title || seed.title,
      request: persisted.request || seed.request,
      status: persisted.status,
      roadmapArea: persisted.roadmapArea || seed.roadmapArea,
      sourceType: persisted.sourceType,
      createdAt: persisted.createdAt,
      updatedAt: persisted.updatedAt
    } satisfies StoredCommandCenterTask;
  });

  for (const persisted of args.stored) {
    if (seedIds.has(persisted.id)) {
      continue;
    }

    if (persisted.sourceType === "customer_request" || persisted.status === "completed") {
      merged.push(persisted);
    }
  }

  return merged.sort((left, right) => {
    const openDelta = Number(isOpenCommandCenterTaskStatus(left.status)) -
      Number(isOpenCommandCenterTaskStatus(right.status));

    if (openDelta !== 0) {
      return openDelta < 0 ? 1 : -1;
    }

    const statusDelta = commandCenterTaskStatusRank(left.status) -
      commandCenterTaskStatusRank(right.status);

    if (statusDelta !== 0) {
      return statusDelta;
    }

    const sourceDelta = taskSourceRank(left.sourceType) - taskSourceRank(right.sourceType);

    if (sourceDelta !== 0) {
      return sourceDelta;
    }

    const updatedAtLeft = left.updatedAt ?? left.createdAt ?? "";
    const updatedAtRight = right.updatedAt ?? right.createdAt ?? "";

    if (updatedAtLeft !== updatedAtRight) {
      return updatedAtLeft < updatedAtRight ? 1 : -1;
    }

    return left.title.localeCompare(right.title);
  });
}

function taskTrackForItem(args: {
  task: Pick<StoredCommandCenterTask, "sourceType" | "status">;
  roomState: CommandCenterRoomState;
}) {
  if (args.task.sourceType === "signal_cleanup") {
    return "SG" as const;
  }

  if (
    args.task.sourceType === "decision_follow_up" ||
    args.task.sourceType === "change_review_follow_up" ||
    args.task.status === "in_review" ||
    args.task.status === "waiting_on_decision"
  ) {
    return "RV" as const;
  }

  return "TA" as const;
}

function resolvePromptExecutionLevel(args: {
  task: Pick<StoredCommandCenterTask, "sourceType" | "status">;
  roomState: CommandCenterRoomState;
  isCurrent?: boolean;
}): CommandCenterPromptExecutionLevel {
  if (args.task.sourceType === "roadmap_follow_up") {
    return "Very High";
  }

  if (
    args.task.sourceType === "decision_follow_up" ||
    args.task.sourceType === "change_review_follow_up" ||
    args.task.status === "in_review" ||
    args.task.status === "waiting_on_decision"
  ) {
    return "High";
  }

  if (args.task.sourceType === "signal_cleanup" || args.roomState.dataState === "degraded") {
    return "Low";
  }

  if (args.task.status === "active" || args.isCurrent) {
    return "High";
  }

  return "Medium";
}

function toCommandCenterTaskItem(args: {
  task: StoredCommandCenterTask;
  index: number;
  roomState: CommandCenterRoomState;
}) {
  return {
    id: args.task.id,
    title: args.task.title,
    request: args.task.request,
    status: args.task.status,
    roadmapArea: args.task.roadmapArea,
    sourceType: args.task.sourceType,
    promptRunId: buildPromptRunId(taskTrackForItem(args), args.index + 1),
    dataState: args.roomState.dataState
  } satisfies CommandCenterTaskItem;
}

function buildTaskQueuePanel(args: {
  roomState: CommandCenterRoomState;
  activePhase: WorkspacePhaseId;
  decisionInbox: CommandCenterDecisionInbox;
  changeImpactReview: CommandCenterChangeImpactReview;
  nextMilestone: CommandCenterStateBand;
  workStreams: CommandCenterWorkStream[];
  projectMetadata?: StoredProjectMetadata | null;
}) {
  const currentRoadmapArea = currentRoadmapAreaFromStreams({
    workStreams: args.workStreams,
    activePhase: args.activePhase
  });
  const mergedTasks = mergeTaskItems({
    seeds: buildInitialTaskSeeds({
      roomState: args.roomState,
      activePhase: args.activePhase,
      decisionInbox: args.decisionInbox,
      changeImpactReview: args.changeImpactReview,
      nextMilestone: args.nextMilestone,
      workStreams: args.workStreams
    }),
    stored: args.projectMetadata?.commandCenterTasks ?? [],
    roomState: args.roomState
  });

  const openTasks = mergedTasks.filter((item) => isOpenCommandCenterTaskStatus(item.status));
  const completedTasks = mergedTasks.filter((item) => item.status === "completed");
  const currentTaskRecord = openTasks[0] ?? null;
  const nextTaskRecords = openTasks.slice(currentTaskRecord ? 1 : 0, currentTaskRecord ? 6 : 5);
  const waitingTaskRecords = openTasks.filter((item) => item.status === "waiting_on_decision");
  const recentlyClearedRecords = completedTasks.slice(0, 3);
  const currentTask =
    currentTaskRecord
      ? toCommandCenterTaskItem({
          task: currentTaskRecord,
          index: 0,
          roomState: args.roomState
        })
      : null;
  const nextTasks = nextTaskRecords.map((task, index) =>
    toCommandCenterTaskItem({
      task,
      index: index + 1,
      roomState: args.roomState
    })
  );
  const waitingOnDecision = waitingTaskRecords.map((task, index) =>
    toCommandCenterTaskItem({
      task,
      index,
      roomState: args.roomState
    })
  );
  const recentlyCleared = recentlyClearedRecords.map((task, index) =>
    toCommandCenterTaskItem({
      task,
      index,
      roomState: args.roomState
    })
  );
  const nextRoadmapAreas = normalizeListItems(
    [
      ...nextTasks.map((item) => item.roadmapArea),
      ...args.workStreams
        .filter((stream) => stream.status === "Ready Next" || stream.status === "Waiting")
        .map((stream) => stream.name)
    ],
    5
  ).filter((item) => item !== (currentTask?.roadmapArea ?? currentRoadmapArea));
  const availableRoadmapAreas = normalizeListItems(
    [
      currentTask?.roadmapArea ?? currentRoadmapArea,
      ...nextRoadmapAreas,
      ...args.workStreams.map((stream) => stream.name),
      defaultRoadmapAreaFromPhase(args.activePhase)
    ],
    8
  );

  return {
    title: "Customer Tasks",
    description:
      args.roomState.dataState === "degraded"
        ? "Tasks are still being staged from an incomplete project picture, so treat this queue as the safest current order rather than a live execution engine."
        : "This queue shows the customer-facing work Neroa is tracking right now, mapped to roadmap sections and the prompt flow behind it.",
    flowSummary: "Request -> Task -> Prompt -> Controlled execution path",
    currentTask,
    nextTasks,
    waitingOnDecision,
    recentlyCleared,
    currentRoadmapArea: currentTask?.roadmapArea ?? currentRoadmapArea,
    nextRoadmapAreas,
    availableRoadmapAreas,
    source: "derived-planning-truth" as const,
    dataState: args.roomState.dataState
  };
}

function buildAnalyzerPanel(args: {
  roomState: CommandCenterRoomState;
  executionReadiness: CommandCenterStateBand;
  decisionInbox: CommandCenterDecisionInbox;
  changeImpactReview: CommandCenterChangeImpactReview;
  taskQueue: CommandCenterTaskQueuePanel;
  watchouts: string[];
}) {
  const openBlockingDecision = args.decisionInbox.items.find(
    (item) => item.blocking && isOpenDecisionStatus(item.status)
  );
  const activeReview = args.changeImpactReview.items.find((item) =>
    isActiveChangeReviewStatus(item.reviewStatus)
  );

  let statusLabel = "Ready for the next request";
  let currentAnalysis =
    args.taskQueue.currentTask?.title ?? "No active task is leading the room right now.";
  let recommendation =
    "Use this panel to request changes, create tasks, and keep the room moving from customer request to roadmap work and prompt support.";

  if (args.roomState.dataState === "degraded") {
    statusLabel = "Planning still incomplete";
    currentAnalysis = "Neroa is holding broader operator moves until the missing project picture is tightened.";
    recommendation =
      "Start with the missing planning details first, then turn the next request into a tighter task and prompt sequence.";
  } else if (openBlockingDecision) {
    statusLabel = "Waiting on key answers";
    currentAnalysis = openBlockingDecision.title;
    recommendation =
      "Answer the blocking questions first so the active task queue, prompt flow, and preview approvals stop drifting.";
  } else if (activeReview) {
    statusLabel = "Reviewing a recent change";
    currentAnalysis = activeReview.title;
    recommendation =
      "Settle the current change review before widening prompt flow or treating the next handoff as stable.";
  } else if (args.roomState.dataState === "partial") {
    statusLabel = "Project picture still sharpening";
    currentAnalysis =
      args.taskQueue.currentTask?.title ??
      "The room is usable, but a few planning details still need another pass before operator work widens.";
    recommendation =
      "Keep the task queue moving, but treat preview approvals and deeper handoff timing as provisional until the picture sharpens.";
  }

  return {
    title: "Smart Operator",
    statusLabel,
    currentAnalysis,
    watching: normalizeListItems(
      [
        `Readiness: ${args.executionReadiness.label}`,
        args.taskQueue.currentRoadmapArea
          ? `Current section: ${args.taskQueue.currentRoadmapArea}`
          : null,
        args.taskQueue.currentTask ? `Active task: ${args.taskQueue.currentTask.title}` : null,
        openBlockingDecision ? `Waiting on: ${openBlockingDecision.title}` : null,
        activeReview ? `Review in progress: ${activeReview.title}` : null,
        args.watchouts[0] ?? null
      ],
      4
    ),
    recommendation,
    intakeTitle: "Request intake",
    intakeDescription:
      "Type what you want changed, added, reviewed, or clarified here. Neroa turns that request into a tracked task, maps it to the roadmap, and stages prompts behind it.",
    flowSummary: args.taskQueue.flowSummary,
    source: "derived-planning-truth" as const,
    dataState: args.roomState.dataState
  };
}

function buildPromptRunnerPanel(args: {
  roomState: CommandCenterRoomState;
  taskQueue: CommandCenterTaskQueuePanel;
}) {
  const currentTask = args.taskQueue.currentTask;
  const queuedTasks = [
    ...args.taskQueue.nextTasks,
    ...args.taskQueue.waitingOnDecision.filter(
      (item) => !args.taskQueue.nextTasks.some((nextTask) => nextTask.id === item.id)
    )
  ].slice(0, 5);

  let runId: string | null = currentTask?.promptRunId ?? null;
  let upcomingRunId: string | null = queuedTasks[0]?.promptRunId ?? null;
  let statusLabel = currentTask ? "Task prompt staged" : "No prompt staged yet";
  let statusPills = ["Queued", "Task-linked"];
  let scopeLabel = currentTask
    ? `${currentTask.title} · ${currentTask.roadmapArea}`
    : "Prompts will appear once a task is staged in this room.";
  let detail =
    currentTask
      ? "Prompt runs support customer tasks in this room. Live runner telemetry still comes later."
      : "Prompt Runner is ready to stage task-linked runs once the first task is queued in this room.";
  let queuedNext: string | null = queuedTasks[0]?.title ?? null;
  let currentExecutionLevel: CommandCenterPromptExecutionLevel | null = currentTask
    ? resolvePromptExecutionLevel({
        task: currentTask,
        roomState: args.roomState,
        isCurrent: true
      })
    : null;
  scopeLabel = scopeLabel.replace("Â·", "-");

  if (currentTask?.status === "in_review" || currentTask?.status === "waiting_on_decision") {
    statusLabel =
      currentTask.status === "in_review" ? "Review prompt staged" : "Waiting on a task decision";
    statusPills = ["Review", currentTask.status === "waiting_on_decision" ? "Waiting" : "Queued"];
    detail =
      currentTask.status === "in_review"
        ? "This prompt supports review work around the current task without pretending live runner telemetry exists yet."
        : "A task is waiting on an answer, so Prompt Runner is holding the next active run behind that decision.";
  } else if (currentTask?.sourceType === "signal_cleanup" || args.roomState.dataState === "degraded") {
    runId = currentTask?.promptRunId ?? buildPromptRunId("SG");
    statusLabel = "Signal cleanup staged";
    statusPills = ["Held", "Signal first"];
    detail =
      "Prompt Runner is intentionally staging signal cleanup first while the project picture is still incomplete.";
  } else if (currentTask?.status === "active") {
    statusLabel = "Current prompt supporting active work";
    statusPills = ["Active", "Task-linked"];
  }

  const queue = queuedTasks.map((task, index) => ({
    runId: task.promptRunId || buildPromptRunId(taskTrackForItem({ task, roomState: args.roomState }), index + 2),
    label: task.title,
    taskTitle: task.title,
    roadmapArea: task.roadmapArea,
    executionLevel: resolvePromptExecutionLevel({
      task,
      roomState: args.roomState
    }),
    queueState:
      task.status === "waiting_on_decision"
        ? "waiting"
        : index === 0
          ? "next"
          : index <= 2
            ? "queued"
            : "waiting"
  })) satisfies CommandCenterPromptQueueItem[];

  return {
    title: "Prompt Runner",
    runId,
    currentExecutionLevel,
    upcomingRunId,
    statusLabel,
    statusPills,
    scopeLabel,
    detail,
    queuedNext,
    queue,
    bridgeLabel: "Customer requests shape tasks, and prompts stage the operator path behind those tasks.",
    namingGuide: {
      prefixLabel: "NC = Neroa Command",
      trackLabels: [
        { code: "TA", meaning: "Task action" },
        { code: "RV", meaning: "Review run" },
        { code: "SG", meaning: "Signal cleanup" }
      ],
      sequenceHint: "The number marks queue order inside this active project room."
    },
    source: "future-system" as const,
    dataState: args.roomState.dataState
  };
}

function buildProductionStatusPanel(args: {
  activePhase: WorkspacePhaseId;
  roomState: CommandCenterRoomState;
  blockerCount: number;
  changeImpactReview: CommandCenterChangeImpactReview;
}) {
  if (args.roomState.dataState === "degraded") {
    return {
      title: "Production status",
      label: "Planning only",
      detail:
        "The project is still too incomplete for Command Center to present a stronger controlled-production picture.",
      source: "derived-planning-truth" as const,
      dataState: "degraded" as const
    };
  }

  const activeReviewItems = args.changeImpactReview.items.filter((item) =>
    needsFollowUpChangeReviewStatus(item.reviewStatus)
  );

  if (args.blockerCount > 0 || activeReviewItems.some((item) => item.readinessEffect === "more_blocked")) {
    return {
      title: "Production status",
      label: "Review before wider progress",
      detail:
        "Command Center is still holding the project in a review-heavy state while blocking decisions or significant follow-up items remain open.",
      source: "derived-planning-truth" as const,
      dataState: args.roomState.dataState
    };
  }

  if (activeReviewItems.some((item) => item.readinessEffect === "review_needed")) {
    return {
      title: "Production status",
      label: "Preparing",
      detail:
        "The project is close to a stronger handoff, but current review items still need attention before Neroa should treat it as fully settled.",
      source: "derived-planning-truth" as const,
      dataState: args.roomState.dataState
    };
  }

  if (args.activePhase === "mvp" || args.activePhase === "build") {
    return {
      title: "Production status",
      label: "In controlled execution",
      detail:
        "The project is far enough along for controlled build handoff, while Command Center still reflects coordination state instead of live execution telemetry.",
      source: "derived-planning-truth" as const,
      dataState: args.roomState.dataState
    };
  }

  return {
    title: "Production status",
    label: "Planning only",
    detail:
      "The project is still in planning-led coordination mode. Build execution remains intentionally controlled behind deeper rooms.",
    source: "derived-planning-truth" as const,
    dataState: args.roomState.dataState
  };
}

function buildDesignPreviewArchitecture(args: {
  projectMetadata?: StoredProjectMetadata | null;
  roomState: CommandCenterRoomState;
  liveViewSession?: LiveViewSession | null;
}): CommandCenterDesignPreviewArchitecture {
  const previewState: StoredCommandCenterPreviewState =
    normalizeStoredCommandCenterPreviewState(args.projectMetadata?.commandCenterPreviewState) ??
    defaultStoredCommandCenterPreviewState();
  const approvedPackage: StoredCommandCenterApprovedDesignPackage | null =
    normalizeStoredCommandCenterApprovedDesignPackage(
      args.projectMetadata?.commandCenterApprovedDesignPackage
    );
  const previewSelectedControls = previewState.selectedControls ?? defaultCommandCenterDesignControls();
  const effectiveActiveMode =
    previewSelectedControls.designMode ??
    previewSelectedControls.roomPreset ??
    approvedPackage?.approvedDesignMode ??
    approvedPackage?.selectedControls.designMode ??
    approvedPackage?.selectedControls.roomPreset ??
    null;
  const targetedSurfaces = (
    previewSelectedControls.surfaceTargets.length > 0
      ? previewSelectedControls.surfaceTargets
      : approvedPackage?.affectedSurfaces ?? ["command_center"]
  ).map((surface) => formatCommandCenterPreviewSurfaceTarget(surface));
  const controlSummary = normalizeListItems([
    previewSelectedControls.colorway
      ? `Colorway: ${sanitizeCustomerText(previewSelectedControls.colorway)}`
      : null,
    previewSelectedControls.buttonStyle
      ? `Buttons: ${sanitizeCustomerText(previewSelectedControls.buttonStyle)}`
      : null,
    previewSelectedControls.typographyStyle
      ? `Typography: ${sanitizeCustomerText(previewSelectedControls.typographyStyle)}`
      : null,
    previewSelectedControls.densityMode
      ? `Density: ${previewSelectedControls.densityMode}`
      : null,
    previewSelectedControls.layoutPreset
      ? `Layout: ${sanitizeCustomerText(previewSelectedControls.layoutPreset)}`
      : null,
    previewSelectedControls.roomPreset
      ? `Room preset: ${sanitizeCustomerText(previewSelectedControls.roomPreset)}`
      : null
  ]);

  let previewDetail =
    "No preview session is active yet. The control model is ready, and the next staged preview will attach to a real Live View session instead of a separate preview runtime.";

  if (previewState.state === "previewing") {
    previewDetail =
      previewState.previewSessionId && args.liveViewSession?.id === previewState.previewSessionId
        ? "A staged preview is attached to the current Live View session. The visual layer is still temporary until an approved package is implemented in source code."
        : "A staged preview exists, but it is not currently attached to an available Live View session. Re-open Browser to refresh the runtime target.";
  } else if (previewState.state === "approved_pending_implementation") {
    previewDetail =
      previewState.previewSessionId && args.liveViewSession?.id === previewState.previewSessionId
        ? "A preview choice has been approved from the active Live View session and is waiting to become a structured implementation package or source-code change."
        : "A preview choice has been approved, but the runtime session it came from is not currently attached.";
  } else if (previewState.state === "implemented") {
    previewDetail =
      "The latest approved design package is marked implemented. Source code, not the preview session, is now the styling truth.";
  } else if (previewState.state === "stale_after_code_change") {
    previewDetail =
      "The last preview session no longer cleanly matches the current code picture and should be reviewed before reuse.";
  }

  if (args.roomState.dataState !== "stable") {
    previewDetail +=
      " Project picture is still incomplete, so preview approvals should be treated as provisional until the room stabilizes.";
  }

  const approvedPackageStatus = approvedPackage?.status ?? "none";
  const approvedPackageLabel =
    approvedPackageStatus === "none"
      ? "No approved package pending"
      : formatCommandCenterApprovedDesignPackageStatusLabel(approvedPackageStatus);
  const approvedPackageDetail =
    approvedPackageStatus === "none"
      ? "Once a preview state is approved, Neroa will turn it into a structured implementation package for Codex instead of mutating source code in the browser."
      : approvedPackageStatus === "implemented"
        ? "The approved package is marked implemented. Later QC can compare expected preview intent against the rendered source code result."
        : approvedPackageStatus === "failed"
          ? "The package was not implemented successfully and should be reviewed before it is sent again."
          : approvedPackageStatus === "superseded"
            ? "A newer preview package replaced this one, so it should no longer be treated as the active implementation target."
            : "This approved package is tracked separately from preview state so Codex can implement it without letting browser preview become hidden source of truth.";

  return {
    savedTruth: {
      label:
        approvedPackageStatus === "implemented"
          ? "Source code reflects the latest approved package"
          : "Source code remains the styling truth",
      detail:
        approvedPackageStatus === "implemented"
          ? `The latest implemented styling package${approvedPackage?.packageId ? ` (${approvedPackage.packageId})` : ""} now represents the expected product styling until a newer preview package is approved.`
          : "Preview state is temporary until approved, and approval still requires Codex to change source code before the product styling truth actually changes.",
      activeModeLabel: formatCommandCenterDesignModeLabel(effectiveActiveMode),
      packageId: approvedPackageStatus === "implemented" ? approvedPackage?.packageId ?? null : null
    },
    previewState: {
      state: previewState.state,
      label: formatCommandCenterPreviewStateLabel(previewState.state),
      detail: previewDetail,
      approvalStatus: previewState.approvalStatus,
      approvalStatusLabel: formatCommandCenterPreviewApprovalStatusLabel(
        previewState.approvalStatus
      ),
      previewSessionId: previewState.previewSessionId,
      source: previewState.source,
      sourceLabel: formatCommandCenterPreviewSourceLabel(previewState.source),
      selectedControls: previewSelectedControls,
      notes: previewState.notes,
      targetedSurfaceTargets:
        previewSelectedControls.surfaceTargets.length > 0
          ? previewSelectedControls.surfaceTargets
          : ["command_center"],
      targetedSurfaces,
      activeModeLabel: formatCommandCenterDesignModeLabel(effectiveActiveMode),
      controlSummary,
      lastUpdatedAt: previewState.lastUpdatedAt
    },
    approvedPackage: {
      packageId: approvedPackage?.packageId ?? null,
      status: approvedPackageStatus,
      label: approvedPackageLabel,
      detail: approvedPackageDetail,
      affectedSurfaceTargets: approvedPackage?.affectedSurfaces ?? [],
      affectedSurfaces:
        approvedPackage?.affectedSurfaces.map((surface) =>
          formatCommandCenterPreviewSurfaceTarget(surface)
        ) ?? [],
      affectedZones: approvedPackage?.affectedZones ?? [],
      selectedControls: approvedPackage?.selectedControls ?? null,
      implementationIntent: approvedPackage?.implementationIntent ?? null,
      cautionNotes: approvedPackage?.cautionNotes ?? [],
      approvedAt: approvedPackage?.approvedAt ?? null
    },
    controlAreas: [...COMMAND_CENTER_DESIGN_CONTROL_AREAS],
    highlightedModes: COMMAND_CENTER_DESIGN_MODE_HIGHLIGHTS,
    totalModes: COMMAND_CENTER_DESIGN_LIBRARY_TOTAL_MODES,
    workflowSteps: [...COMMAND_CENTER_PREVIEW_WORKFLOW_STEPS],
    boundaryRules: [...COMMAND_CENTER_PREVIEW_BOUNDARY_RULES]
  };
}

function buildBrowserPanel(args: {
  roomState: CommandCenterRoomState;
  designPreviewArchitecture: CommandCenterDesignPreviewArchitecture;
  liveViewSession?: LiveViewSession | null;
  browserRuntimeSupported?: boolean;
}) {
  const previewState = args.designPreviewArchitecture.previewState;
  const approvedPackage = args.designPreviewArchitecture.approvedPackage;
  const runtimeBridge = buildBrowserRuntimeBridgeSnapshot({
    liveSession: args.liveViewSession ?? null,
    previewState: previewState.state,
    previewSessionId: previewState.previewSessionId,
    approvedPackageStatus: approvedPackage.status,
    roomDataState: args.roomState.dataState,
    runtimeSupported: args.browserRuntimeSupported ?? true
  });

  return {
    title: "Browser",
    runtimeState: runtimeBridge.state,
    statusLabel: runtimeBridge.statusLabel,
    detail: runtimeBridge.detail,
    liveSessionId: runtimeBridge.liveSessionId,
    lastHeartbeatAt: runtimeBridge.lastHeartbeatAt,
    lastSeenOrigin: runtimeBridge.lastSeenOrigin,
    connectionState: runtimeBridge.connectionState,
    inspectionState: runtimeBridge.inspectionState,
    previewState: previewState.state,
    previewStateLabel: previewState.label,
    previewSessionId: previewState.previewSessionId,
    approvedPackageStatus: approvedPackage.status,
    approvedPackageLabel: approvedPackage.label,
    qcState: runtimeBridge.qcState,
    ctaLabel: runtimeBridge.ctaLabel,
    source: "preview-control-truth" as const,
    dataState: args.roomState.dataState
  };
}

function buildDesignLibraryPanel(args: {
  roomState: CommandCenterRoomState;
  designPreviewArchitecture: CommandCenterDesignPreviewArchitecture;
  liveViewSession?: LiveViewSession | null;
  browserRuntimeSupported?: boolean;
}) {
  const previewState = args.designPreviewArchitecture.previewState;
  const approvedPackage = args.designPreviewArchitecture.approvedPackage;
  const runtimeBridge = buildBrowserRuntimeBridgeSnapshot({
    liveSession: args.liveViewSession ?? null,
    previewState: previewState.state,
    previewSessionId: previewState.previewSessionId,
    approvedPackageStatus: approvedPackage.status,
    roomDataState: args.roomState.dataState,
    runtimeSupported: args.browserRuntimeSupported ?? true
  });
  const runtimeReady = isBrowserRuntimeReadyForPreview(runtimeBridge.state);
  const runtimeTarget = buildDesignLibraryRuntimeTarget({
    liveSession: args.liveViewSession ?? null,
    previewState: previewState.state,
    previewSessionId: previewState.previewSessionId,
    approvedPackageStatus: approvedPackage.status,
    roomDataState: args.roomState.dataState,
    runtimeSupported: args.browserRuntimeSupported ?? true
  });
  const statusLabel =
    !runtimeReady
      ? runtimeBridge.state === "unsupported"
        ? "Localhost runtime only"
        : runtimeBridge.state === "awaiting_bind"
        ? "Blocked pending browser bind"
        : runtimeBridge.state === "session_stale"
          ? "Refresh live session"
          : runtimeBridge.state === "reconnect_needed"
            ? "Previously bound / reconnect browser"
            : runtimeBridge.state === "error"
              ? "Live session error"
              : "Browser session required"
      : approvedPackage.status === "approved_for_implementation" ||
          approvedPackage.status === "sent_to_codex"
        ? "Package waiting on implementation"
        : previewState.state === "previewing"
          ? "Preview session active"
          : previewState.state === "implemented"
            ? "Latest package implemented"
            : "Live session ready";
  const detail =
    !runtimeReady && runtimeBridge.state === "unsupported"
      ? "Design Library preview and package staging stay local-only because this deployed environment does not keep Browser Runtime session storage or QC artifact storage on disk."
      : args.roomState.dataState === "degraded"
      ? "Design controls are ready to stage, but approvals should wait until the project picture is stronger."
      : !runtimeReady
        ? runtimeBridge.state === "awaiting_bind"
          ? "The Design Library is staged behind the same Browser Runtime path, but it stays blocked until the extension heartbeat lands on the live session."
          : runtimeBridge.state === "session_stale"
            ? "The last preview session is stale, so Design Library actions stay blocked until Browser refreshes the live session."
            : runtimeBridge.state === "reconnect_needed"
              ? "The Design Library still has prior preview context, but the extension is currently disconnected. Reconnect Browser before trusting or changing preview/package state."
              : runtimeBridge.state === "error"
                ? "A browser/runtime error is blocking trustworthy preview work right now. Resolve the browser connection first."
                : "Open Browser first. The Design Library only stages preview and package work against a real connected live session."
        : "Use this entry point to stage design controls, review preview state, and keep approved packages separate from source code while targeting the same live session as Browser.";
  const ctaLabel = runtimeReady ? "Open library" : runtimeBridge.ctaLabel;

  return {
    title: "Design Library",
    statusLabel,
    detail,
    runtimeState: runtimeBridge.state,
    runtimeReady,
    runtimeTargetLabel: runtimeTarget.runtimeTargetLabel,
    runtimeTargetDetail: runtimeTarget.runtimeTargetDetail,
    currentTruthLabel: args.designPreviewArchitecture.savedTruth.activeModeLabel,
    currentTruthDetail: args.designPreviewArchitecture.savedTruth.detail,
    activeModeLabel: previewState.activeModeLabel,
    previewState: previewState.state,
    previewStateLabel: `${previewState.label} / ${previewState.approvalStatusLabel}`,
    previewNotes: previewState.notes,
    selectedControls: previewState.selectedControls,
    targetedSurfaceTargets: previewState.targetedSurfaceTargets,
    targetedSurfaces: previewState.targetedSurfaces,
    approvedPackageStatus: approvedPackage.status,
    approvedPackageLabel: approvedPackage.label,
    approvedPackageId: approvedPackage.packageId,
    implementationIntent: approvedPackage.implementationIntent,
    cautionNotes: approvedPackage.cautionNotes,
    affectedZones: approvedPackage.affectedZones,
    controlAreas: args.designPreviewArchitecture.controlAreas,
    highlightedModes: args.designPreviewArchitecture.highlightedModes,
    totalModes: args.designPreviewArchitecture.totalModes,
    workflowSteps: args.designPreviewArchitecture.workflowSteps,
    boundaryRules: args.designPreviewArchitecture.boundaryRules,
    ctaLabel,
    approvalCtaLabel:
      runtimeReady
        ? "Approve package"
        : runtimeBridge.state === "unsupported"
          ? "Localhost runtime required"
          : "Preview needs live session",
    source: "preview-control-truth" as const,
    dataState: args.roomState.dataState
  };
}

function isBrandAssetKind(kind: string) {
  return kind === "brand_logo" || kind === "brand_icon" || kind === "brand_reference";
}

function formatBrandAssetKindLabel(kind: string) {
  if (kind === "brand_logo") {
    return "Logo";
  }

  if (kind === "brand_icon") {
    return "Icon";
  }

  if (kind === "brand_reference") {
    return "Reference";
  }

  return "Asset";
}

function hasBrandPalette(colors: StoredCommandCenterBrandColors | null | undefined) {
  if (!colors) {
    return false;
  }

  return Boolean(
    colors.primary ||
      colors.secondary ||
      colors.accent ||
      colors.background ||
      colors.text
  );
}

function buildBrandSystemPanel(args: {
  roomState: CommandCenterRoomState;
  designPreviewArchitecture: CommandCenterDesignPreviewArchitecture;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  const previewState = args.designPreviewArchitecture.previewState;
  const approvedPackage = args.designPreviewArchitecture.approvedPackage;
  const savedBrandSystem = args.projectMetadata?.commandCenterBrandSystem ?? null;
  const brandAssets = (args.projectMetadata?.assets ?? [])
    .filter((asset) => isBrandAssetKind(asset.kind))
    .map((asset) => ({
      id: asset.id,
      name: asset.name,
      kind: asset.kind,
      kindLabel: formatBrandAssetKindLabel(asset.kind),
      sizeLabel: asset.sizeLabel
    }));
  const assetCount = brandAssets.length;
  const currentColorway = hasBrandPalette(savedBrandSystem?.colors)
    ? "Custom palette"
    : previewState.selectedControls.colorway?.trim() ||
      args.designPreviewArchitecture.savedTruth.activeModeLabel;
  const currentIdentity =
    savedBrandSystem?.identityMode?.trim() || previewState.activeModeLabel;

  const statusLabel =
    approvedPackage.status === "approved_for_implementation" ||
    approvedPackage.status === "sent_to_codex"
      ? "Identity package pending"
      : previewState.state === "previewing"
        ? "Identity staged in preview"
        : savedBrandSystem || assetCount > 0
          ? "Brand controls saved"
        : args.roomState.dataState === "degraded"
          ? "Brand picture still sharpening"
          : "Brand controls ready";

  return {
    title: "Brand System",
    statusLabel,
    detail:
      assetCount > 0
        ? "Brand assets and identity choices are attached here so preview and implementation packages can point back to the same visual system."
        : "Use this entry for brand colors, logo references, motto, and identity choices before browser preview and implementation wiring deepen.",
    currentIdentity: currentIdentity,
    currentColorway: currentColorway || "Using current saved styling",
    assetState:
      assetCount > 0
        ? `${assetCount} brand asset${assetCount === 1 ? "" : "s"} attached`
        : "Logo, icon, and reference uploads are still open",
    motto: savedBrandSystem?.motto ?? null,
    typographyPreference: savedBrandSystem?.typographyPreference ?? null,
    visualMood: savedBrandSystem?.visualMood ?? null,
    buttonStylePreference: savedBrandSystem?.buttonStylePreference ?? null,
    colors: savedBrandSystem?.colors ?? {
      primary: null,
      secondary: null,
      accent: null,
      background: null,
      text: null
    },
    assets: brandAssets,
    ctaLabel: "Open brand controls",
    source: "preview-control-truth" as const,
    dataState: args.roomState.dataState
  };
}

export function buildCommandCenterSummary(args: {
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief?: ProjectBrief | null;
  liveViewSession?: LiveViewSession | null;
  browserRuntimeSupported?: boolean;
}): CommandCenterSummary {
  const laneCount = getOrderedProjectLanes(args.project).length;
  const projectContext = buildProjectContextSnapshot({
    project: args.project,
    projectMetadata: args.projectMetadata,
    projectBrief: args.projectBrief
  });
  const roomState = buildRoomState({
    projectMetadata: args.projectMetadata,
    buildingSummary: projectContext.buildingSummary,
    audienceSummary: projectContext.audienceSummary,
    primaryGoal: projectContext.primaryGoal,
    laneCount
  });
  const decisionInbox = buildDecisionInbox({
    projectMetadata: args.projectMetadata,
    activePhase: projectContext.activePhase,
    buildingSummary: projectContext.buildingSummary,
    audienceSummary: projectContext.audienceSummary,
    primaryGoal: projectContext.primaryGoal,
    roomState
  });
  const blockers = buildBlockers({
    decisionInbox,
    roomState
  });
  const buildRoomHandoff = buildBuildRoomHandoff({
    activePhase: projectContext.activePhase,
    blockers,
    roomState
  });
  const changeImpactReview = buildChangeImpactReview({
    activePhase: projectContext.activePhase,
    roomState,
    decisionInbox,
    buildRoomHandoff,
    projectMetadata: args.projectMetadata
  });
  const readinessEffect = resolveReadinessEffect(changeImpactReview.items);
  const watchouts = buildWatchouts({
    activePhase: projectContext.activePhase,
    projectMetadata: args.projectMetadata,
    decisionInbox,
    roomState
  });
  const workStreams = buildWorkStreams({
    project: args.project,
    activePhase: projectContext.activePhase,
    currentFocus: projectContext.currentFocus,
    blockers,
    roomState
  });
  const activeWorkStreams = workStreams.filter(
    (stream) => stream.status === "Leading Now" || stream.status === "Ready Next"
  ).length;
  const activePhase = buildPhaseBand({
    activePhase: projectContext.activePhase,
    roomState
  });
  const nextMilestone = buildNextMilestoneBand({
    title: projectContext.nextStepTitle,
    body: projectContext.nextStepBody,
    roomState
  });
  const currentFocus = buildCurrentFocusPanel({
    activePhase: projectContext.activePhase,
    currentFocus: projectContext.currentFocus,
    roomState
  });
  const executionReadiness = buildExecutionReadiness({
    activePhase: projectContext.activePhase,
    blockerCount: decisionInbox.blockingOpenCount,
    readinessEffect,
    roomState
  });
  const taskQueue = buildTaskQueuePanel({
    roomState,
    decisionInbox,
    changeImpactReview,
    activePhase: projectContext.activePhase,
    nextMilestone,
    workStreams,
    projectMetadata: args.projectMetadata
  });
  const analyzer = buildAnalyzerPanel({
    roomState,
    executionReadiness,
    decisionInbox,
    changeImpactReview,
    taskQueue,
    watchouts
  });
  const promptRunner = buildPromptRunnerPanel({
    roomState,
    taskQueue
  });
  const productionStatus = buildProductionStatusPanel({
    activePhase: projectContext.activePhase,
    roomState,
    blockerCount: decisionInbox.blockingOpenCount,
    changeImpactReview
  });
  const designPreviewArchitecture = buildDesignPreviewArchitecture({
    projectMetadata: args.projectMetadata,
    roomState,
    liveViewSession: args.liveViewSession ?? null
  });
  const browserStatus = buildBrowserPanel({
    roomState,
    designPreviewArchitecture,
    liveViewSession: args.liveViewSession ?? null,
    browserRuntimeSupported: args.browserRuntimeSupported ?? true
  });
  const designLibrary = buildDesignLibraryPanel({
    roomState,
    designPreviewArchitecture,
    liveViewSession: args.liveViewSession ?? null,
    browserRuntimeSupported: args.browserRuntimeSupported ?? true
  });
  const brandSystem = buildBrandSystemPanel({
    roomState,
    designPreviewArchitecture,
    projectMetadata: args.projectMetadata
  });

  return {
    roomState,
    activePhase,
    executionReadiness,
    currentFocus,
    analyzer,
    promptRunner,
    taskQueue,
    productionStatus,
    designPreviewArchitecture,
    browserStatus,
    designLibrary,
    brandSystem,
    decisionInbox,
    changeImpactReview,
    blockers: {
      title: "Blocking decisions",
      description:
        roomState.dataState === "degraded"
          ? "These decisions are being inferred from incomplete project truth. Treat them as safe coordination prompts, not a live blocker system."
          : "This is the summary view of unresolved blocking decisions. Use the Decision Inbox below to review and update them.",
      items: blockers,
      emptyState: "No blocking decisions are standing out in the current project phase.",
      source: "derived-planning-truth",
      dataState: roomState.dataState
    },
    watchouts: {
      title: "Things to monitor",
      description:
        "These are softer risks and project-signal gaps that could affect the handoff later if they stay unresolved.",
      items: watchouts,
      emptyState: "No major watchouts are standing out yet.",
      source: "derived-planning-truth",
      dataState: roomState.dataState
    },
    nextMilestone,
    activeWorkStreams,
    workStreams,
    buildRoomHandoff,
    futureSystems: buildFutureSystems()
  };
}
