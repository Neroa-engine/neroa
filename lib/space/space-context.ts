export type RoomId = "project" | "strategy" | "command" | "build" | "library";

export type SpaceCompatibilityMode =
  | "workspace_project_compat"
  | "separate_project_identity";

export type RoomClassification =
  | "dashboard_control_panel"
  | "planning_room"
  | "customer_operations_room"
  | "execution_room"
  | "evidence_room";

export type RoomContract = {
  roomId: RoomId;
  classification: RoomClassification;
  label: string;
  purpose: string;
  canView: boolean;
  canEditLocalState: boolean;
  canWriteProjectMetadata: boolean;
  allowedActions: string[];
  blockedActions: string[];
  requiredNeroaOneActions: string[];
  truthInputs: string[];
  truthOutputs: string[];
};

type StoredProjectMetadataLike = {
  archived?: boolean;
  strategyState?: {
    revisionRecords?: unknown[];
    planningThreadState?: {
      messages?: unknown[];
    } | null;
  } | null;
  governanceState?: {
    scopeApprovalRecord?: unknown;
    roadmapRevisionRecords?: unknown[];
  } | null;
  executionState?: {
    pendingExecutions?: unknown[];
    executionPackets?: unknown[];
  } | null;
  billingState?: {
    engineCreditsRemaining?: number | null;
    creditsRemaining?: number | null;
    selectedPlanId?: string | null;
  } | null;
  assets?: unknown[];
  commandCenterDecisions?: unknown[];
  commandCenterChangeReviews?: unknown[];
  commandCenterTasks?: unknown[];
  commandCenterPreviewState?: {
    state?: string | null;
  } | null;
  commandCenterApprovedDesignPackage?: {
    status?: string | null;
  } | null;
  buildSession?: {
    scope?: {
      summary?: string | null;
      projectDefinitionSummary?: string | null;
      mvpSummary?: string | null;
      businessGoal?: string | null;
      problem?: string | null;
      targetUsers?: string | null;
      audience?: string | null;
      firstBuild?: string[];
      keyFeatures?: string[];
      keyModules?: string[];
      coreFeatures?: string[];
      integrationNeeds?: string[];
      frameworkLabel?: string | null;
    } | null;
  } | null;
  saasIntake?: {
    projectSummary?: string | null;
    answers?: {
      customer?: string | null;
      problem?: string | null;
    } | null;
  } | null;
  mobileAppIntake?: {
    projectSummary?: string | null;
    answers?: {
      audience?: string | null;
      proofOutcome?: string | null;
    } | null;
  } | null;
} | null;

export type PrecomputedSpaceContextInput = {
  projectTruthSummary?: string | null;
  currentPhase?: string | null;
  currentFocus?: string | string[] | null;
  nextRecommendedAction?: string | null;
};

export type BuildSpaceContextArgs = {
  workspaceId: string;
  projectId?: string | null;
  projectTitle?: string | null;
  projectDescription?: string | null;
  projectMetadata?: StoredProjectMetadataLike;
  precomputed?: PrecomputedSpaceContextInput | null;
};

export type SpaceContext = {
  spaceId: string;
  projectId: string;
  workspaceId: string;
  compatibilityMode: SpaceCompatibilityMode;
  isCompatibilityMode: boolean;
  projectTitle: string;
  projectDescription: string | null;
  projectState: string;
  projectTruthSummary: string;
  currentPhase: string;
  currentFocus: string[];
  nextRecommendedAction: string;
  strategyState: {
    status: string;
    revisionCount: number;
    planningThreadMessageCount: number;
    scopeApprovalPresent: boolean;
  };
  commandState: {
    decisionCount: number;
    changeReviewCount: number;
    taskCount: number;
    previewState: string | null;
    approvedPackageState: string | null;
  };
  buildState: {
    pendingExecutionCount: number;
    executionPacketCount: number;
    status: string;
  };
  libraryEvidenceState: {
    assetCount: number;
    status: string;
  };
  usageCreditState: {
    status: "placeholder";
    availableCredits: number | null;
    activePlanId: string | null;
    note: string;
  };
  roomContracts: RoomContract[];
};

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

function normalizeStringList(value: string | string[] | null | undefined) {
  if (typeof value === "string") {
    const normalized = normalizeText(value);
    return normalized ? [normalized] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeText(item)).filter(Boolean);
}

function countItems(value: unknown[] | undefined | null) {
  return Array.isArray(value) ? value.length : 0;
}

function deriveProjectState(projectMetadata: StoredProjectMetadataLike) {
  if (projectMetadata?.archived) {
    return "archived";
  }

  if (countItems(projectMetadata?.executionState?.executionPackets) > 0) {
    return "execution_ready";
  }

  if (countItems(projectMetadata?.strategyState?.revisionRecords) > 0) {
    return "planning_active";
  }

  return "draft";
}

function deriveCurrentPhase(args: {
  projectMetadata: StoredProjectMetadataLike;
  precomputed: PrecomputedSpaceContextInput | null | undefined;
}) {
  const providedPhase = normalizeText(args.precomputed?.currentPhase);

  if (providedPhase) {
    return providedPhase;
  }

  if (
    countItems(args.projectMetadata?.executionState?.executionPackets) > 0 ||
    countItems(args.projectMetadata?.executionState?.pendingExecutions) > 0
  ) {
    return "build";
  }

  if (
    args.projectMetadata?.buildSession?.scope?.frameworkLabel ||
    countItems(args.projectMetadata?.buildSession?.scope?.firstBuild) > 0 ||
    countItems(args.projectMetadata?.buildSession?.scope?.keyFeatures) > 0 ||
    countItems(args.projectMetadata?.buildSession?.scope?.integrationNeeds) > 0 ||
    args.projectMetadata?.saasIntake ||
    args.projectMetadata?.mobileAppIntake
  ) {
    return "scope";
  }

  return "strategy";
}

function deriveProjectTruthSummary(args: {
  projectTitle: string;
  projectDescription: string | null;
  projectMetadata: StoredProjectMetadataLike;
  precomputed: PrecomputedSpaceContextInput | null | undefined;
}) {
  const precomputedSummary = clipText(args.precomputed?.projectTruthSummary);

  if (precomputedSummary) {
    return precomputedSummary;
  }

  return (
    clipText(args.projectMetadata?.buildSession?.scope?.summary) ||
    clipText(args.projectMetadata?.buildSession?.scope?.projectDefinitionSummary) ||
    clipText(args.projectMetadata?.buildSession?.scope?.mvpSummary) ||
    clipText(args.projectMetadata?.saasIntake?.projectSummary) ||
    clipText(args.projectMetadata?.mobileAppIntake?.projectSummary) ||
    clipText(args.projectDescription) ||
    `${args.projectTitle} is using the current workspace-compatible project record.`
  );
}

function deriveCurrentFocus(args: {
  projectMetadata: StoredProjectMetadataLike;
  precomputed: PrecomputedSpaceContextInput | null | undefined;
}) {
  const precomputedFocus = normalizeStringList(args.precomputed?.currentFocus);

  if (precomputedFocus.length > 0) {
    return precomputedFocus;
  }

  const fromMetadata = normalizeStringList([
    ...(args.projectMetadata?.buildSession?.scope?.firstBuild ?? []).slice(0, 1),
    ...(args.projectMetadata?.buildSession?.scope?.keyFeatures ?? []).slice(0, 1),
    normalizeText(args.projectMetadata?.buildSession?.scope?.businessGoal),
    normalizeText(args.projectMetadata?.buildSession?.scope?.problem),
    normalizeText(args.projectMetadata?.saasIntake?.answers?.problem),
    normalizeText(args.projectMetadata?.mobileAppIntake?.answers?.proofOutcome)
  ]);

  if (fromMetadata.length > 0) {
    return fromMetadata.slice(0, 3);
  }

  return ["Maintain one shared project truth across rooms."];
}

function deriveNextRecommendedAction(args: {
  phase: string;
  projectMetadata: StoredProjectMetadataLike;
  precomputed: PrecomputedSpaceContextInput | null | undefined;
}) {
  const precomputedAction = normalizeText(args.precomputed?.nextRecommendedAction);

  if (precomputedAction) {
    return precomputedAction;
  }

  if (args.phase === "build") {
    return "Review the next governed execution packet before release.";
  }

  if (
    countItems(args.projectMetadata?.strategyState?.revisionRecords) > 0 ||
    countItems(args.projectMetadata?.governanceState?.roadmapRevisionRecords) > 0
  ) {
    return "Review the latest planning revision before widening execution.";
  }

  return "Continue shaping the shared project plan from existing metadata.";
}

export function buildRoomContracts(): RoomContract[] {
  return [
    {
      roomId: "project",
      classification: "dashboard_control_panel",
      label: "Project Room",
      purpose: "Show shared status, phase, focus, and next-step truth without generating new project intelligence.",
      canView: true,
      canEditLocalState: true,
      canWriteProjectMetadata: false,
      allowedActions: ["view_status", "view_phase", "open_related_rooms", "view_library_entry"],
      blockedActions: ["generate_project_truth", "rewrite_roadmap", "submit_execution_handoff"],
      requiredNeroaOneActions: [],
      truthInputs: ["project metadata", "shared read model", "precomputed summaries"],
      truthOutputs: ["status display", "navigation context"]
    },
    {
      roomId: "strategy",
      classification: "planning_room",
      label: "Strategy Room",
      purpose: "Collect planning answers, scope revisions, and approval requests against the shared project truth.",
      canView: true,
      canEditLocalState: true,
      canWriteProjectMetadata: true,
      allowedActions: ["collect_answers", "save_revision", "request_scope_approval", "view_shared_truth"],
      blockedActions: ["own_execution_intake", "own_build_release", "own_library_routing"],
      requiredNeroaOneActions: ["brief_generation", "roadmap_generation", "governance_generation"],
      truthInputs: ["project metadata", "shared read model", "planning thread state"],
      truthOutputs: ["strategy revisions", "approval requests"]
    },
    {
      roomId: "command",
      classification: "customer_operations_room",
      label: "Command Center",
      purpose: "Handle customer operations, task intake, decisions, and governed handoff preparation.",
      canView: true,
      canEditLocalState: true,
      canWriteProjectMetadata: true,
      allowedActions: ["view_decisions", "manage_task_intake", "review_change_impact", "prepare_handoff"],
      blockedActions: ["replace_strategy_truth", "execute_build_work", "own_library_history"],
      requiredNeroaOneActions: ["intent_classification", "task_handoff"],
      truthInputs: ["project metadata", "shared read model", "decision records", "task records"],
      truthOutputs: ["decision updates", "governed task intake"]
    },
    {
      roomId: "build",
      classification: "execution_room",
      label: "Build Room",
      purpose: "Manage execution detail against already-governed project truth and handoff context.",
      canView: true,
      canEditLocalState: true,
      canWriteProjectMetadata: true,
      allowedActions: ["view_execution_packets", "review_build_tasks", "track_runs", "record_execution_state"],
      blockedActions: ["own_customer_intake", "rewrite_project_truth", "own_library_routing"],
      requiredNeroaOneActions: ["typed_handoff", "execution_package_generation"],
      truthInputs: ["project metadata", "shared read model", "execution packets", "build task state"],
      truthOutputs: ["execution status", "task results"]
    },
    {
      roomId: "library",
      classification: "evidence_room",
      label: "Library",
      purpose: "Present evidence, reports, recordings, and other project artifacts without owning routing or intelligence decisions.",
      canView: true,
      canEditLocalState: true,
      canWriteProjectMetadata: true,
      allowedActions: ["view_reports", "view_recordings", "view_artifacts", "register_evidence"],
      blockedActions: ["own_project_truth", "own_navigation_decisions", "generate_execution_handoff"],
      requiredNeroaOneActions: [],
      truthInputs: ["project metadata", "shared read model", "evidence records"],
      truthOutputs: ["evidence history", "artifact visibility"]
    }
  ];
}

export function buildSpaceContext(args: BuildSpaceContextArgs): SpaceContext {
  const workspaceId = normalizeText(args.workspaceId);
  const projectId = normalizeText(args.projectId) || workspaceId;
  const projectTitle = normalizeText(args.projectTitle) || "Untitled Project";
  const projectDescription = normalizeText(args.projectDescription) || null;
  const compatibilityMode: SpaceCompatibilityMode =
    projectId === workspaceId ? "workspace_project_compat" : "separate_project_identity";
  const currentPhase = deriveCurrentPhase({
    projectMetadata: args.projectMetadata ?? null,
    precomputed: args.precomputed
  });

  return {
    spaceId: projectId,
    projectId,
    workspaceId,
    compatibilityMode,
    isCompatibilityMode: compatibilityMode === "workspace_project_compat",
    projectTitle,
    projectDescription,
    projectState: deriveProjectState(args.projectMetadata ?? null),
    projectTruthSummary: deriveProjectTruthSummary({
      projectTitle,
      projectDescription,
      projectMetadata: args.projectMetadata ?? null,
      precomputed: args.precomputed
    }),
    currentPhase,
    currentFocus: deriveCurrentFocus({
      projectMetadata: args.projectMetadata ?? null,
      precomputed: args.precomputed
    }),
    nextRecommendedAction: deriveNextRecommendedAction({
      phase: currentPhase,
      projectMetadata: args.projectMetadata ?? null,
      precomputed: args.precomputed
    }),
    strategyState: {
      status:
        countItems(args.projectMetadata?.strategyState?.revisionRecords) > 0 ? "active" : "idle",
      revisionCount: countItems(args.projectMetadata?.strategyState?.revisionRecords),
      planningThreadMessageCount: countItems(
        args.projectMetadata?.strategyState?.planningThreadState?.messages
      ),
      scopeApprovalPresent: Boolean(args.projectMetadata?.governanceState?.scopeApprovalRecord)
    },
    commandState: {
      decisionCount: countItems(args.projectMetadata?.commandCenterDecisions),
      changeReviewCount: countItems(args.projectMetadata?.commandCenterChangeReviews),
      taskCount: countItems(args.projectMetadata?.commandCenterTasks),
      previewState: normalizeText(args.projectMetadata?.commandCenterPreviewState?.state) || null,
      approvedPackageState:
        normalizeText(args.projectMetadata?.commandCenterApprovedDesignPackage?.status) || null
    },
    buildState: {
      pendingExecutionCount: countItems(args.projectMetadata?.executionState?.pendingExecutions),
      executionPacketCount: countItems(args.projectMetadata?.executionState?.executionPackets),
      status:
        countItems(args.projectMetadata?.executionState?.executionPackets) > 0
          ? "execution_ready"
          : countItems(args.projectMetadata?.executionState?.pendingExecutions) > 0
            ? "pending_release"
            : "idle"
    },
    libraryEvidenceState: {
      assetCount: countItems(args.projectMetadata?.assets),
      status: countItems(args.projectMetadata?.assets) > 0 ? "has_evidence" : "empty"
    },
    usageCreditState: {
      status: "placeholder",
      availableCredits:
        args.projectMetadata?.billingState?.engineCreditsRemaining ??
        args.projectMetadata?.billingState?.creditsRemaining ??
        null,
      activePlanId: normalizeText(args.projectMetadata?.billingState?.selectedPlanId) || null,
      note: "Usage and credits stay as a placeholder in the shared read model for now."
    },
    roomContracts: buildRoomContracts()
  };
}
