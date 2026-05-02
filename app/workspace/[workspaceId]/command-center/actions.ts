"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getOrCreateProjectLiveViewSession } from "@/lib/live-view/store";
import { resolveBrowserRuntimeRequestOrigin } from "@/lib/browser-runtime-v2/runtime-target";
import { isLocalRuntimeStorageEnabled } from "@/lib/runtime/local-runtime-storage";
import {
  createBuildRoomTask,
  submitBuildRoomTaskToCodex,
  updateBuildRoomTask
} from "@/lib/build-room/service";
import { getBuildRoomTask } from "@/lib/build-room/data";
import { loadBuildRoomProjectContext } from "@/lib/build-room/project-context";
import type {
  BuildRoomOutputMode,
  BuildRoomRiskLevel,
  BuildRoomTaskType
} from "@/lib/build-room/contracts";
import type { BuildRoomTaskDetail } from "@/lib/build-room/types";
import {
  buildPendingExecutionCaptureRecord,
  loadPlatformContext,
  resolvePlatformExecutionGateState
} from "@/lib/intelligence/platform-context";
import { buildWorkspaceProjectIntelligence } from "@/lib/intelligence/project-brief-generator";
import {
  applyPendingExecutionHold,
  applyPendingExecutionRelease,
  buildExecutionPacketSummary,
  buildPendingExecutionItem,
  findPendingExecutionByBuildRoomTaskId,
  findPendingExecutionById,
  generateExecutionPacket,
  listActivePendingExecutions,
  normalizeExecutionState,
  upsertExecutionPacketSummary,
  type ExecutionState,
  type PendingExecutionItem,
  type PendingExecutionReleaseResult
} from "@/lib/intelligence/execution";
import { generateBillingProtectionState } from "@/lib/intelligence/billing";
import {
  normalizeCommandCenterDecisionStatus,
  type StoredCommandCenterDecision
} from "@/lib/workspace/command-center-decisions";
import {
  normalizeCommandCenterChangeReviewStatus,
  type StoredCommandCenterChangeReview
} from "@/lib/workspace/command-center-change-impact";
import {
  applyCommandCenterApprovedDesignPackageMutation,
  applyCommandCenterPreviewStateMutation,
  createCommandCenterApprovedDesignPackageFromPreview,
  defaultCommandCenterDesignControls,
  normalizeCommandCenterPreviewSurfaceTarget,
  normalizeStoredCommandCenterDesignControls,
  type CommandCenterApprovedDesignPackageMutation,
  type CommandCenterPreviewStateMutation,
  type StoredCommandCenterApprovedDesignPackage,
  type StoredCommandCenterPreviewState
} from "@/lib/workspace/command-center-design-preview";
import {
  buildCommandCenterTaskIntelligenceMetadata,
  inferCommandCenterCustomerRequestType,
  normalizeCommandCenterCustomerRequestType,
  normalizeCommandCenterRequestText,
  normalizeCommandCenterTaskSourceType,
  normalizeCommandCenterTaskStatus,
  normalizeCommandCenterWorkflowLane,
  type CommandCenterTaskSourceType,
  type StoredCommandCenterTask
} from "@/lib/workspace/command-center-tasks";
import {
  normalizeStoredCommandCenterBrandSystem,
  parseWorkspaceProjectDescription,
  type StoredCommandCenterBrandSystem,
  type StoredProjectAsset
} from "@/lib/workspace/project-metadata";
import { buildCommandCenterSummary } from "@/lib/workspace/command-center-summary";
import { classifyCommandCenterTaskIntake } from "@/lib/workspace/command-center-intake";
import {
  buildDescriptionWithMetadata,
  getOwnedWorkspace,
  getReturnTo,
  redirectWithError,
  safeString,
  uniqueAssets
} from "@/app/workspace/workspace-action-helpers";

function resolveActionOrigin() {
  return resolveBrowserRuntimeRequestOrigin(headers());
}

function normalizeDecisionFlag(value: FormDataEntryValue | null) {
  return value === "true";
}

function normalizeRequestTypeSource(value: FormDataEntryValue | null) {
  if (value === "manual" || value === "inferred" || value === "system") {
    return value;
  }

  return null;
}

function workflowLaneFromSourceType(sourceType: CommandCenterTaskSourceType) {
  if (sourceType === "roadmap_follow_up") {
    return "roadmap_updates" as const;
  }

  if (sourceType === "change_review_follow_up") {
    return "execution_review" as const;
  }

  if (sourceType === "decision_follow_up") {
    return "decisions" as const;
  }

  if (sourceType === "signal_cleanup") {
    return "qc_evidence" as const;
  }

  return "requests" as const;
}

function parsePreviewSurfaceTargets(formData: FormData) {
  const targets = formData
    .getAll("surfaceTargets")
    .map((value) =>
      normalizeCommandCenterPreviewSurfaceTarget(typeof value === "string" ? value : null)
    )
    .filter(
      (
        value
      ): value is Exclude<
        ReturnType<typeof normalizeCommandCenterPreviewSurfaceTarget>,
        null
      > => Boolean(value)
    );

  return targets.length > 0 ? targets : ["command_center"];
}

function parseStringArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [] as string[];
    }

    return Array.from(
      new Set(
        parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  } catch {
    return [];
  }
}

function parseTextareaLines(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    )
  );
}

function parsePreviewControls(formData: FormData) {
  return normalizeStoredCommandCenterDesignControls({
    designMode: safeString(formData.get("designMode")) || null,
    colorway: safeString(formData.get("colorway")) || null,
    buttonStyle: safeString(formData.get("buttonStyle")) || null,
    typographyStyle: safeString(formData.get("typographyStyle")) || null,
    densityMode: safeString(formData.get("densityMode")) || null,
    layoutPreset: safeString(formData.get("layoutPreset")) || null,
    roomPreset: safeString(formData.get("roomPreset")) || null,
    surfaceTargets: parsePreviewSurfaceTargets(formData)
  });
}

function normalizeBrandText(
  value: FormDataEntryValue | null,
  maxLength = 160
) {
  const normalized = safeString(value);
  return normalized ? normalized.slice(0, maxLength) : null;
}

function normalizeBrandColorValue(value: FormDataEntryValue | null) {
  const normalized = safeString(value);

  if (!normalized) {
    return null;
  }

  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return normalized.toUpperCase();
  }

  return normalized.slice(0, 64);
}

function resolveBrandColor(formData: FormData, key: "primary" | "secondary" | "accent" | "background" | "text") {
  return (
    normalizeBrandColorValue(formData.get(`${key}ColorValue`)) ??
    normalizeBrandColorValue(formData.get(`${key}ColorPicker`))
  );
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File &&
    typeof value.name === "string" &&
    value.size > 0
  );
}

function formatUploadedFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return null;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildBrandAssetUpload(
  value: FormDataEntryValue | null,
  kind: "brand_logo" | "brand_icon" | "brand_reference",
  now: string
): StoredProjectAsset | null {
  if (!isUploadFile(value)) {
    return null;
  }

  const name = value.name.trim();

  if (!name) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    name,
    kind,
    sizeLabel: formatUploadedFileSize(value.size),
    addedAt: now
  };
}

function buildBrandSystemUpdate(formData: FormData, now: string): StoredCommandCenterBrandSystem | null {
  return normalizeStoredCommandCenterBrandSystem({
    identityMode: normalizeBrandText(formData.get("identityMode"), 80),
    motto: normalizeBrandText(formData.get("motto"), 180),
    typographyPreference: normalizeBrandText(formData.get("typographyPreference"), 80),
    visualMood: normalizeBrandText(formData.get("visualMood"), 120),
    buttonStylePreference: normalizeBrandText(formData.get("buttonStylePreference"), 80),
    colors: {
      primary: resolveBrandColor(formData, "primary"),
      secondary: resolveBrandColor(formData, "secondary"),
      accent: resolveBrandColor(formData, "accent"),
      background: resolveBrandColor(formData, "background"),
      text: resolveBrandColor(formData, "text")
    },
    updatedAt: now
  });
}

function revalidateCommandCenterPaths(workspaceId: string) {
  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath(`/workspace/${workspaceId}/command-center`);
  revalidatePath(`/workspace/${workspaceId}/build-room`);
}

function normalizeRoadmapArea(value: FormDataEntryValue | null) {
  return safeString(value) || "General coordination";
}

function buildTaskTitle(title: string, request: string) {
  const directTitle = title.trim();

  if (directTitle) {
    return directTitle.slice(0, 96);
  }

  const normalizedRequest = request.replace(/\s+/g, " ").trim();
  const sentence = normalizedRequest.split(/[.!?]/)[0]?.trim() || normalizedRequest;
  const cleaned = sentence
    .replace(/^please\s+/i, "")
    .replace(/^can you\s+/i, "")
    .replace(/^could you\s+/i, "")
    .trim();

  if (!cleaned) {
    return "New operator task";
  }

  return cleaned.length > 96 ? `${cleaned.slice(0, 93).trimEnd()}...` : cleaned;
}

function normalizeSerializedString(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeExecutionStringList(values: readonly string[]) {
  return Array.from(
    new Set(
      values
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function normalizeAcceptanceCriteriaInput(
  value?: string | readonly string[] | null
) {
  if (Array.isArray(value)) {
    return normalizeExecutionStringList(value);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [] as string[];
  }

  return normalizeExecutionStringList(
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

function mergeCommandCenterTasks(
  existingTasks: StoredCommandCenterTask[],
  nextTask: StoredCommandCenterTask
) {
  return [
    nextTask,
    ...existingTasks.filter((item) => item.id !== nextTask.id)
  ];
}

function upsertPendingCommandCenterTask(args: {
  existingTasks: StoredCommandCenterTask[];
  platformContext: ReturnType<typeof loadPlatformContext>;
  existingTaskId?: string | null;
  title: string;
  request: string;
  roadmapArea: string;
  now: string;
}) {
  const existingTask =
    args.existingTaskId
      ? args.existingTasks.find((item) => item.id === args.existingTaskId) ?? null
      : null;
  const capture = buildPendingExecutionCaptureRecord({
    platformContext: args.platformContext,
    id: existingTask?.id ?? crypto.randomUUID(),
    title: args.title,
    request: args.request,
    roadmapArea: args.roadmapArea,
    createdAt: existingTask?.createdAt ?? args.now,
    updatedAt: args.now
  });
  const nextTask: StoredCommandCenterTask = {
    ...capture.commandCenterTask,
    createdAt: existingTask?.createdAt ?? capture.commandCenterTask.createdAt,
    updatedAt: args.now
  };

  return {
    task: nextTask,
    tasks: mergeCommandCenterTasks(args.existingTasks, nextTask)
  };
}

function markCommandCenterTaskReleased(args: {
  existingTasks: StoredCommandCenterTask[];
  taskId?: string | null;
  now: string;
}) {
  if (!args.taskId) {
    return args.existingTasks;
  }

  const existingTask = args.existingTasks.find((item) => item.id === args.taskId) ?? null;

  if (!existingTask) {
    return args.existingTasks;
  }

  const releasedTask: StoredCommandCenterTask = {
    ...existingTask,
    status: "active",
    updatedAt: args.now
  };

  return mergeCommandCenterTasks(args.existingTasks, releasedTask);
}

async function buildCommandCenterExecutionContext(workspaceId: string) {
  const { supabase, user, workspace } = await getOwnedWorkspace(workspaceId);
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId,
    projectId: workspaceId,
    projectTitle: workspace.name,
    projectDescription: parsed.visibleDescription,
    projectMetadata: parsed.metadata
  });
  const projectContext = await loadBuildRoomProjectContext({
    supabase,
    userId: user.id,
    workspaceId,
    projectId: workspaceId
  });
  const commandCenter = buildCommandCenterSummary({
    project: projectContext.project,
    projectMetadata: parsed.metadata,
    projectBrief: projectIntelligence.projectBrief,
    roadmapPlan: projectIntelligence.roadmapPlan,
    governancePolicy: projectIntelligence.governancePolicy
  });
  const executionGate = resolvePlatformExecutionGateState({
    platformContext: projectIntelligence.platformContext,
    workspaceId,
    signals: {
      roomStateDataState: commandCenter.roomState.dataState,
      blockingOpenCount: commandCenter.decisionInbox.blockingOpenCount,
      activePhaseLabel: commandCenter.activePhase.label
    }
  });

  return {
    supabase,
    user,
    workspace,
    parsed,
    projectContext,
    projectIntelligence,
    commandCenter,
    executionGate
  };
}

type CommandCenterExecutionRequestInput = {
  workspaceId: string;
  taskId?: string | null;
  title?: string | null;
  laneSlug?: string | null;
  taskType: BuildRoomTaskType;
  requestedOutputMode: BuildRoomOutputMode;
  userRequest: string;
  acceptanceCriteria?: string | readonly string[] | null;
  riskLevel: BuildRoomRiskLevel;
  roadmapArea?: string | null;
};

type CommandCenterExecutionRequestResult = {
  outcome: "released" | "pending";
  detail: BuildRoomTaskDetail;
  executionState: ExecutionState;
  pendingExecution: PendingExecutionItem | null;
  releaseResult: PendingExecutionReleaseResult | null;
  message: string;
};

type ReleaseEligiblePendingExecutionResult = {
  releasedCount: number;
  keptPendingCount: number;
  results: PendingExecutionReleaseResult[];
  executionState: ExecutionState;
  message: string;
};

async function upsertBuildRoomDraftTask(args: {
  supabase: Awaited<ReturnType<typeof getOwnedWorkspace>>["supabase"];
  userId: string;
  workspaceId: string;
  projectId: string;
  taskId?: string | null;
  title: string;
  laneSlug?: string | null;
  taskType: BuildRoomTaskType;
  requestedOutputMode: BuildRoomOutputMode;
  userRequest: string;
  acceptanceCriteria: readonly string[];
  riskLevel: BuildRoomRiskLevel;
}) {
  const normalizedAcceptance = args.acceptanceCriteria.join("\n") || null;
  const existingTask =
    args.taskId
      ? await getBuildRoomTask({
          supabase: args.supabase,
          taskId: args.taskId
        })
      : null;

  if (!existingTask) {
    return {
      detail: await createBuildRoomTask({
        supabase: args.supabase,
        userId: args.userId,
        taskInput: {
          workspaceId: args.workspaceId,
          projectId: args.projectId,
          laneSlug: args.laneSlug ?? null,
          title: args.title,
          taskType: args.taskType,
          requestedOutputMode: args.requestedOutputMode,
          userRequest: args.userRequest,
          acceptanceCriteria: normalizedAcceptance,
          riskLevel: args.riskLevel
        }
      }),
      created: true
    };
  }

  return {
    detail: await updateBuildRoomTask({
      supabase: args.supabase,
      userId: args.userId,
      taskId: existingTask.id,
      patch: {
        laneSlug: args.laneSlug ?? null,
        title: args.title,
        taskType: args.taskType,
        requestedOutputMode: args.requestedOutputMode,
        userRequest: args.userRequest,
        acceptanceCriteria: normalizedAcceptance,
        riskLevel: args.riskLevel,
        status: "draft",
        approvedForExecution: false,
        workerRunStatus: "idle"
      }
    }),
    created: false
  };
}

async function syncBuildRoomTaskFromExecutionPacket(args: {
  supabase: Awaited<ReturnType<typeof getOwnedWorkspace>>["supabase"];
  userId: string;
  taskId: string;
  packet: ReturnType<typeof generateExecutionPacket>;
}) {
  return updateBuildRoomTask({
    supabase: args.supabase,
    userId: args.userId,
    taskId: args.taskId,
    patch: {
      laneSlug: args.packet.buildRoomTaskPayload.laneSlug ?? null,
      title: args.packet.buildRoomTaskPayload.title,
      taskType: args.packet.buildRoomTaskPayload.taskType,
      requestedOutputMode: args.packet.buildRoomTaskPayload.requestedOutputMode,
      userRequest: args.packet.buildRoomTaskPayload.userRequest,
      acceptanceCriteria:
        args.packet.buildRoomTaskPayload.acceptanceCriteria.join("\n") || null,
      riskLevel: args.packet.buildRoomTaskPayload.riskLevel,
      status: "draft",
      approvedForExecution: false,
      workerRunStatus: "idle"
    }
  });
}

type PendingExecutionCaptureInput = {
  workspaceId: string;
  title?: string | null;
  request: string;
  roadmapArea?: string | null;
};

export async function captureCommandCenterPendingExecutionRequest(
  input: PendingExecutionCaptureInput
) {
  const workspaceId = normalizeSerializedString(input.workspaceId);
  const request = normalizeSerializedString(input.request);
  const titleInput = normalizeSerializedString(input.title) ?? "";
  const roadmapArea = normalizeSerializedString(input.roadmapArea) ?? "Build handoff";

  if (!workspaceId || !request) {
    throw new Error("Pending execution request could not be captured.");
  }

  const { supabase, workspace } = await getOwnedWorkspace(workspaceId);
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const platformContext = loadPlatformContext(parsed.metadata?.platformContext);
  const existingTasks = parsed.metadata?.commandCenterTasks ?? [];
  const now = new Date().toISOString();
  const pendingExecutionCapture = buildPendingExecutionCaptureRecord({
    platformContext,
    id: crypto.randomUUID(),
    title: buildTaskTitle(titleInput, request),
    request,
    roadmapArea,
    createdAt: now,
    updatedAt: now
  });
  const nextTask: StoredCommandCenterTask = pendingExecutionCapture.commandCenterTask;

  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        commandCenterTasks: [nextTask, ...existingTasks]
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "Pending execution request could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateCommandCenterPaths(workspaceId);

  return nextTask;
}

export async function submitCommandCenterExecutionRequest(
  input: CommandCenterExecutionRequestInput
): Promise<CommandCenterExecutionRequestResult> {
  const workspaceId = normalizeSerializedString(input.workspaceId);
  const request = normalizeSerializedString(input.userRequest);
  const titleInput = normalizeSerializedString(input.title) ?? "";
  const roadmapArea = normalizeSerializedString(input.roadmapArea) ?? "Build handoff";
  const acceptanceCriteria = normalizeAcceptanceCriteriaInput(input.acceptanceCriteria);

  if (!workspaceId || !request) {
    throw new Error("Execution request could not be prepared.");
  }

  const context = await buildCommandCenterExecutionContext(workspaceId);
  const draftTitle = buildTaskTitle(titleInput, request);
  const draftedTask = await upsertBuildRoomDraftTask({
    supabase: context.supabase,
    userId: context.user.id,
    workspaceId,
    projectId: workspaceId,
    taskId: normalizeSerializedString(input.taskId),
    title: draftTitle,
    laneSlug: normalizeSerializedString(input.laneSlug) ?? null,
    taskType: input.taskType,
    requestedOutputMode: input.requestedOutputMode,
    userRequest: request,
    acceptanceCriteria,
    riskLevel: input.riskLevel
  });
  const existingExecutionState = normalizeExecutionState(
    context.parsed.metadata?.executionState
  );
  const existingBillingState = context.projectIntelligence.billingState;
  const existingPendingExecution =
    findPendingExecutionByBuildRoomTaskId(
      existingExecutionState,
      draftedTask.detail.task.id
    ) ?? null;
  const packet = generateExecutionPacket({
    workspaceId,
    projectId: workspaceId,
    projectName: context.workspace.name,
    sourceRequestId:
      existingPendingExecution?.pendingExecutionId ?? draftedTask.detail.task.id,
    title: draftTitle,
    userRequest: request,
    acceptanceCriteriaText: acceptanceCriteria.join("\n"),
    taskType: input.taskType,
    requestedOutputMode: input.requestedOutputMode,
    riskLevel: input.riskLevel,
    selectedBuildLaneSlug: normalizeSerializedString(input.laneSlug) ?? null,
    existingBuildRoomTaskId: draftedTask.detail.task.id,
    originatingSurface: "command_center",
    projectBrief: context.projectIntelligence.projectBrief,
    architectureBlueprint: context.projectIntelligence.architectureBlueprint,
    roadmapPlan: context.projectIntelligence.roadmapPlan,
    governancePolicy: context.projectIntelligence.governancePolicy,
    platformGate: context.executionGate
  });
  const syncedTask = await syncBuildRoomTaskFromExecutionPacket({
    supabase: context.supabase,
    userId: context.user.id,
    taskId: draftedTask.detail.task.id,
    packet
  });
  const now = new Date().toISOString();

  if (!packet.readiness.relayAllowed) {
    const pendingTaskUpdate = upsertPendingCommandCenterTask({
      existingTasks: context.parsed.metadata?.commandCenterTasks ?? [],
      platformContext: context.projectIntelligence.platformContext,
      existingTaskId: existingPendingExecution?.commandCenterTaskId ?? null,
      title: draftTitle,
      request,
      roadmapArea,
      now
    });
    const pendingItem = buildPendingExecutionItem({
      pendingExecutionId:
        existingPendingExecution?.pendingExecutionId ??
        `${workspaceId}:pending-execution:${syncedTask.task.id}`,
      commandCenterTaskId: pendingTaskUpdate.task.id,
      buildRoomTaskId: syncedTask.task.id,
      title: draftTitle,
      request,
      roadmapArea,
      laneSlug: normalizeSerializedString(input.laneSlug) ?? null,
      taskType: input.taskType,
      requestedOutputMode: input.requestedOutputMode,
      acceptanceCriteria,
      riskLevel: input.riskLevel,
      createdAt: existingPendingExecution?.createdAt ?? now,
      updatedAt: now
    });
    const held = applyPendingExecutionHold({
      executionState: existingExecutionState,
      pendingItem,
      packet,
      now
    });
    const billingState = generateBillingProtectionState({
      projectId: workspaceId,
      governancePolicy: context.projectIntelligence.governancePolicy,
      executionPacket: packet,
      taskDetail: syncedTask,
      priorState: existingBillingState,
      now
    });

    const { data, error } = await context.supabase
      .from("workspaces")
      .update({
        description: buildDescriptionWithMetadata({
          workspace: context.workspace,
          commandCenterTasks: pendingTaskUpdate.tasks,
          executionState: held.executionState,
          billingState
        })
      })
      .eq("id", workspaceId)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(
        "Pending execution request could not be confirmed. Workspace write verification is still pending."
      );
    }

    revalidateCommandCenterPaths(workspaceId);

    return {
      outcome: "pending",
      detail: syncedTask,
      executionState: held.executionState,
      pendingExecution: held.pendingItem,
      releaseResult: held.result,
      message: held.result.summary
    };
  }

  const releasedTask = await submitBuildRoomTaskToCodex({
    supabase: context.supabase,
    userId: context.user.id,
    taskId: syncedTask.task.id
  });
  let nextExecutionState: ExecutionState = existingExecutionState;
  let nextPendingExecution: PendingExecutionItem | null = null;
  let releaseResult: PendingExecutionReleaseResult | null = null;
  let nextCommandCenterTasks = context.parsed.metadata?.commandCenterTasks ?? [];

  if (existingPendingExecution) {
    const released = applyPendingExecutionRelease({
      executionState: existingExecutionState,
      pendingItem: existingPendingExecution,
      packet,
      buildRoomTaskId: releasedTask.task.id,
      now,
      buildRoomTaskCreated: draftedTask.created
    });

    nextExecutionState = released.executionState;
    nextPendingExecution = released.pendingItem;
    releaseResult = released.result;
    nextCommandCenterTasks = markCommandCenterTaskReleased({
      existingTasks: nextCommandCenterTasks,
      taskId: existingPendingExecution.commandCenterTaskId,
      now
    });
  } else {
    nextExecutionState = upsertExecutionPacketSummary({
      executionState: existingExecutionState,
      summary: buildExecutionPacketSummary({
        packet,
        buildRoomTaskId: releasedTask.task.id,
        updatedAt: now,
        status: "released_to_build_room"
      })
    });
  }
  const billingState = generateBillingProtectionState({
    projectId: workspaceId,
    governancePolicy: context.projectIntelligence.governancePolicy,
    executionPacket: packet,
    taskDetail: releasedTask,
    priorState: existingBillingState,
    now
  });

  const { data, error } = await context.supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace: context.workspace,
        commandCenterTasks: nextCommandCenterTasks,
        executionState: nextExecutionState,
        billingState
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "Execution request could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateCommandCenterPaths(workspaceId);

  return {
    outcome: "released",
    detail: releasedTask,
    executionState: nextExecutionState,
    pendingExecution: nextPendingExecution,
    releaseResult,
    message:
      releaseResult?.summary ??
      "Command Center classified the request, created the ExecutionPacket, and released the task into the existing Build Room relay."
  };
}

export async function releaseEligiblePendingExecutionRequests(input: {
  workspaceId: string;
  pendingExecutionId?: string | null;
}): Promise<ReleaseEligiblePendingExecutionResult> {
  const workspaceId = normalizeSerializedString(input.workspaceId);
  const targetPendingExecutionId = normalizeSerializedString(input.pendingExecutionId);

  if (!workspaceId) {
    throw new Error("Pending execution release requires a workspace id.");
  }

  const context = await buildCommandCenterExecutionContext(workspaceId);
  const existingExecutionState = normalizeExecutionState(
    context.parsed.metadata?.executionState
  );
  const pendingExecutions = targetPendingExecutionId
    ? [
        findPendingExecutionById(existingExecutionState, targetPendingExecutionId)
      ].filter((item): item is PendingExecutionItem => Boolean(item))
    : listActivePendingExecutions(existingExecutionState);

  if (pendingExecutions.length === 0) {
    return {
      releasedCount: 0,
      keptPendingCount: 0,
      results: [],
      executionState: existingExecutionState,
      message: "No pending execution requests are eligible for release right now."
    };
  }

  let executionState = existingExecutionState;
  let billingState = context.projectIntelligence.billingState;
  let commandCenterTasks = context.parsed.metadata?.commandCenterTasks ?? [];
  const results: PendingExecutionReleaseResult[] = [];
  const now = new Date().toISOString();

  for (const pendingItem of pendingExecutions) {
    const packet = generateExecutionPacket({
      workspaceId,
      projectId: workspaceId,
      projectName: context.workspace.name,
      sourceRequestId: pendingItem.pendingExecutionId,
      title: pendingItem.title,
      userRequest: pendingItem.request,
      acceptanceCriteriaText: pendingItem.acceptanceCriteria.join("\n"),
      taskType: pendingItem.taskType,
      requestedOutputMode: pendingItem.requestedOutputMode,
      riskLevel: pendingItem.riskLevel,
      selectedBuildLaneSlug: pendingItem.laneSlug ?? null,
      existingBuildRoomTaskId: pendingItem.buildRoomTaskId ?? null,
      originatingSurface: "command_center",
      projectBrief: context.projectIntelligence.projectBrief,
      architectureBlueprint: context.projectIntelligence.architectureBlueprint,
      roadmapPlan: context.projectIntelligence.roadmapPlan,
      governancePolicy: context.projectIntelligence.governancePolicy,
      platformGate: context.executionGate
    });

    if (!packet.readiness.relayAllowed) {
      const held = applyPendingExecutionHold({
        executionState,
        pendingItem,
        packet,
        now
      });

      executionState = held.executionState;
      billingState = generateBillingProtectionState({
        projectId: workspaceId,
        governancePolicy: context.projectIntelligence.governancePolicy,
        executionPacket: packet,
        priorState: billingState,
        now
      });
      results.push(held.result);
      continue;
    }

    const draft = await upsertBuildRoomDraftTask({
      supabase: context.supabase,
      userId: context.user.id,
      workspaceId,
      projectId: workspaceId,
      taskId: pendingItem.buildRoomTaskId ?? null,
      title: packet.buildRoomTaskPayload.title,
      laneSlug: packet.buildRoomTaskPayload.laneSlug ?? null,
      taskType: packet.buildRoomTaskPayload.taskType,
      requestedOutputMode: packet.buildRoomTaskPayload.requestedOutputMode,
      userRequest: packet.buildRoomTaskPayload.userRequest,
      acceptanceCriteria: packet.buildRoomTaskPayload.acceptanceCriteria,
      riskLevel: packet.buildRoomTaskPayload.riskLevel
    });
    const releasedTask = await submitBuildRoomTaskToCodex({
      supabase: context.supabase,
      userId: context.user.id,
      taskId: draft.detail.task.id
    });
    const released = applyPendingExecutionRelease({
      executionState,
      pendingItem,
      packet,
      buildRoomTaskId: releasedTask.task.id,
      now,
      buildRoomTaskCreated: draft.created
    });

    executionState = released.executionState;
    billingState = generateBillingProtectionState({
      projectId: workspaceId,
      governancePolicy: context.projectIntelligence.governancePolicy,
      executionPacket: packet,
      taskDetail: releasedTask,
      priorState: billingState,
      now
    });
    commandCenterTasks = markCommandCenterTaskReleased({
      existingTasks: commandCenterTasks,
      taskId: pendingItem.commandCenterTaskId,
      now
    });
    results.push(released.result);
  }

  const { data, error } = await context.supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace: context.workspace,
        commandCenterTasks,
        executionState,
        billingState
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "Pending execution release could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateCommandCenterPaths(workspaceId);

  const releasedCount = results.filter((item) => item.pendingExecutionReleased).length;
  const keptPendingCount = results.length - releasedCount;

  return {
    releasedCount,
    keptPendingCount,
    results,
    executionState,
    message:
      releasedCount > 0
        ? `Released ${releasedCount} pending execution request${releasedCount === 1 ? "" : "s"} into the existing Build Room relay.${keptPendingCount > 0 ? ` ${keptPendingCount} request${keptPendingCount === 1 ? "" : "s"} stayed pending.` : ""}`
        : "Pending execution requests were re-evaluated, but none are ready to release yet."
  };
}

export async function updateCommandCenterTask(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, `/workspace/${workspaceId}/command-center`);
  const mutation = safeString(formData.get("mutation"));
  const taskId = safeString(formData.get("taskId"));
  const titleInput = safeString(formData.get("title"));
  const request = safeString(formData.get("request"));
  const roadmapArea = normalizeRoadmapArea(formData.get("roadmapArea"));
  const nextStatus = normalizeCommandCenterTaskStatus(formData.get("nextStatus"));
  const sourceType =
    normalizeCommandCenterTaskSourceType(formData.get("sourceType")) ?? "customer_request";
  const requestType =
    normalizeCommandCenterCustomerRequestType(formData.get("requestType")) ??
    inferCommandCenterCustomerRequestType(request);
  const requestTypeSource =
    normalizeRequestTypeSource(formData.get("requestTypeSource")) ??
    (request ? "inferred" : "system");
  const workflowLane =
    normalizeCommandCenterWorkflowLane(formData.get("workflowLane")) ??
    workflowLaneFromSourceType(sourceType);
  const normalizedRequest = normalizeCommandCenterRequestText(request);

  if (!workspaceId || (mutation !== "create_task" && mutation !== "set_status")) {
    redirectWithError(returnTo, "Task update could not be applied.");
  }

  if (mutation === "create_task" && !request) {
    redirectWithError(returnTo, "Add the request Neroa should turn into a task first.");
  }

  if (mutation === "set_status" && (!taskId || !nextStatus || !request)) {
    redirectWithError(returnTo, "Task status could not be updated because the item was incomplete.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(returnTo, error instanceof Error ? error.message : "Project not found.")
  );

  const { supabase, workspace } = ownedWorkspace;
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const existingTasks = parsed.metadata?.commandCenterTasks ?? [];
  const now = new Date().toISOString();

  let mergedTasks: StoredCommandCenterTask[] = existingTasks;

  if (mutation === "create_task") {
    const nextTaskId = crypto.randomUUID();
    const nextTaskTitle = buildTaskTitle(titleInput, request);
    const analyzerResponse = await classifyCommandCenterTaskIntake({
      workspaceId,
      workspaceName: workspace.name,
      visibleDescription: parsed.visibleDescription,
      projectMetadata: parsed.metadata,
      taskId: nextTaskId,
      title: nextTaskTitle,
      request,
      normalizedRequest,
      roadmapArea,
      requestType,
      workflowLane,
      sourceType,
      createdAt: now,
      updatedAt: now
    });
    const nextTask: StoredCommandCenterTask = {
      id: nextTaskId,
      title: nextTaskTitle,
      request,
      normalizedRequest,
      status: "queued",
      roadmapArea,
      sourceType,
      workflowLane,
      intelligenceMetadata: buildCommandCenterTaskIntelligenceMetadata({
        request,
        requestType,
        requestTypeSource,
        workflowLane,
        roadmapArea,
        projectMetadata: parsed.metadata,
        analyzerResponse
      }),
      createdAt: now,
      updatedAt: now
    };

    mergedTasks = mergeCommandCenterTasks(existingTasks, nextTask);
  } else {
    const existingTask = existingTasks.find((item) => item.id === taskId) ?? null;

    if (!existingTask) {
      redirectWithError(returnTo, "Task status could not be updated because the task no longer exists.");
    }

    const resolvedNextStatus = nextStatus ?? existingTask.status;

    const nextTask: StoredCommandCenterTask = {
      id: taskId,
      title: buildTaskTitle(titleInput || existingTask.title, request),
      request,
      normalizedRequest: normalizedRequest ?? existingTask.normalizedRequest ?? null,
      status: resolvedNextStatus,
      roadmapArea,
      sourceType: sourceType as CommandCenterTaskSourceType,
      workflowLane: existingTask.workflowLane ?? workflowLane,
      intelligenceMetadata:
        existingTask.intelligenceMetadata ??
        buildCommandCenterTaskIntelligenceMetadata({
          request,
          requestType,
          requestTypeSource,
          workflowLane: existingTask.workflowLane ?? workflowLane,
          roadmapArea,
          projectMetadata: parsed.metadata
        }),
      roadmapDeviation: existingTask.roadmapDeviation ?? null,
      createdAt: existingTask.createdAt ?? now,
      updatedAt: now
    };

      mergedTasks = mergeCommandCenterTasks(existingTasks, nextTask);
  }

  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        commandCenterTasks: mergedTasks
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(
      returnTo,
      "Task update could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateCommandCenterPaths(workspaceId);
}

export async function updateCommandCenterBrandSystem(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, `/workspace/${workspaceId}/command-center`);

  if (!workspaceId) {
    redirectWithError(returnTo, "Brand controls could not be updated.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(returnTo, error instanceof Error ? error.message : "Project not found.")
  );

  const { supabase, workspace } = ownedWorkspace;
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const now = new Date().toISOString();
  const nextBrandSystem = buildBrandSystemUpdate(formData, now);
  const uploadedAssets = [
    buildBrandAssetUpload(formData.get("logoFile"), "brand_logo", now),
    buildBrandAssetUpload(formData.get("iconFile"), "brand_icon", now),
    buildBrandAssetUpload(formData.get("referenceImageFile"), "brand_reference", now)
  ].filter((asset): asset is StoredProjectAsset => Boolean(asset));
  const mergedAssets = uniqueAssets([...(parsed.metadata?.assets ?? []), ...uploadedAssets]);

  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        assets: mergedAssets,
        commandCenterBrandSystem: nextBrandSystem
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(
      returnTo,
      "Brand controls could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateCommandCenterPaths(workspaceId);
}

export async function updateCommandCenterDecision(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const decisionId = safeString(formData.get("decisionId"));
  const returnTo = getReturnTo(formData, `/workspace/${workspaceId}/command-center`);
  const nextStatus = normalizeCommandCenterDecisionStatus(formData.get("nextStatus"));
  const title = safeString(formData.get("title"));
  const prompt = safeString(formData.get("prompt"));
  const rationale = safeString(formData.get("rationale"));
  const category = safeString(formData.get("category"));
  const severity = safeString(formData.get("severity"));
  const sourceType = safeString(formData.get("sourceType"));
  const relatedArea = safeString(formData.get("relatedArea"));
  const answerPreview = safeString(formData.get("answerPreview")) || null;
  const blocking = normalizeDecisionFlag(formData.get("blocking"));

  if (
    !workspaceId ||
    !decisionId ||
    !nextStatus ||
    !title ||
    !prompt ||
    !rationale ||
    !category ||
    !severity ||
    !sourceType ||
    !relatedArea
  ) {
    redirectWithError(returnTo, "Decision update could not be applied because the item was incomplete.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Project not found."
    )
  );

  const { supabase, workspace } = ownedWorkspace;
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const existing = parsed.metadata?.commandCenterDecisions ?? [];
  const now = new Date().toISOString();
  const existingRecord = existing.find((item) => item.id === decisionId) ?? null;

  const nextRecord: StoredCommandCenterDecision = {
    id: decisionId,
    title,
    prompt,
    rationale,
    category,
    severity: severity as StoredCommandCenterDecision["severity"],
    status: nextStatus,
    blocking,
    sourceType: sourceType as StoredCommandCenterDecision["sourceType"],
    relatedArea: relatedArea as StoredCommandCenterDecision["relatedArea"],
    answerPreview,
    createdAt: existingRecord?.createdAt ?? now,
    updatedAt: now
  };

  const mergedDecisions = [
    nextRecord,
    ...existing.filter((item) => item.id !== decisionId)
  ];

  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        commandCenterDecisions: mergedDecisions
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(
      returnTo,
      "Decision update could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateCommandCenterPaths(workspaceId);
}

export async function updateCommandCenterChangeReview(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const reviewId = safeString(formData.get("reviewId"));
  const returnTo = getReturnTo(formData, `/workspace/${workspaceId}/command-center`);
  const nextStatus = normalizeCommandCenterChangeReviewStatus(formData.get("nextStatus"));
  const title = safeString(formData.get("title"));
  const summary = safeString(formData.get("summary"));
  const changeType = safeString(formData.get("changeType"));
  const impactLevel = safeString(formData.get("impactLevel"));
  const confidence = safeString(formData.get("confidence"));
  const readinessEffect = safeString(formData.get("readinessEffect"));
  const decisionEffect = safeString(formData.get("decisionEffect"));
  const sourceType = safeString(formData.get("sourceType"));
  const followUpRequired = normalizeDecisionFlag(formData.get("followUpRequired"));
  const affectedAreas = parseStringArray(formData.get("affectedAreas"));
  const relatedDecisionIds = parseStringArray(formData.get("relatedDecisionIds"));
  const reviewNote = safeString(formData.get("reviewNote")) || null;
  const decisionAction = safeString(formData.get("decisionAction"));

  if (
    !workspaceId ||
    !reviewId ||
    !nextStatus ||
    !title ||
    !summary ||
    !changeType ||
    !impactLevel ||
    !confidence ||
    !readinessEffect ||
    !decisionEffect ||
    !sourceType
  ) {
    redirectWithError(
      returnTo,
      "Change-impact review could not be updated because the item was incomplete."
    );
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Project not found."
    )
  );

  const { supabase, workspace } = ownedWorkspace;
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const existingReviews = parsed.metadata?.commandCenterChangeReviews ?? [];
  const existingDecisions = parsed.metadata?.commandCenterDecisions ?? [];
  const now = new Date().toISOString();
  const existingReview = existingReviews.find((item) => item.id === reviewId) ?? null;

  const nextReview: StoredCommandCenterChangeReview = {
    id: reviewId,
    title,
    summary,
    changeType: changeType as StoredCommandCenterChangeReview["changeType"],
    impactLevel: impactLevel as StoredCommandCenterChangeReview["impactLevel"],
    confidence: confidence as StoredCommandCenterChangeReview["confidence"],
    affectedAreas,
    readinessEffect: readinessEffect as StoredCommandCenterChangeReview["readinessEffect"],
    decisionEffect: decisionEffect as StoredCommandCenterChangeReview["decisionEffect"],
    followUpRequired,
    sourceType: sourceType as StoredCommandCenterChangeReview["sourceType"],
    relatedDecisionIds,
    reviewStatus: nextStatus,
    reviewNote,
    createdAt: existingReview?.createdAt ?? now,
    updatedAt: now
  };

  const mergedReviews = [
    nextReview,
    ...existingReviews.filter((item) => item.id !== reviewId)
  ];

  const mergedDecisions =
    decisionAction === "reopen_related"
      ? existingDecisions.map((item) =>
          relatedDecisionIds.includes(item.id)
            ? {
                ...item,
                status: "unanswered" as const,
                updatedAt: now
              }
            : item
        )
      : existingDecisions;

  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        commandCenterDecisions: mergedDecisions,
        commandCenterChangeReviews: mergedReviews
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(
      returnTo,
      "Change-impact review could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateCommandCenterPaths(workspaceId);
}

export async function updateCommandCenterPreviewState(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, `/workspace/${workspaceId}/command-center`);
  const mutation = safeString(formData.get("mutation")) as CommandCenterPreviewStateMutation;
  const notes = safeString(formData.get("notes")) || null;
  const source = safeString(formData.get("source"));

  if (
    !workspaceId ||
    ![
      "start_preview",
      "update_preview",
      "mark_preview_stale",
      "reset_preview",
      "mark_preview_implemented"
    ].includes(mutation)
  ) {
    redirectWithError(returnTo, "Preview-state update could not be applied.");
  }

  if (
    (mutation === "start_preview" || mutation === "update_preview") &&
    !isLocalRuntimeStorageEnabled()
  ) {
    redirectWithError(
      returnTo,
      "Browser preview and Live View session storage are disabled in this deployed environment. Use localhost to stage a real preview session."
    );
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(returnTo, error instanceof Error ? error.message : "Project not found.")
  );

  const { supabase, workspace } = ownedWorkspace;
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const existingPreviewState = parsed.metadata?.commandCenterPreviewState ?? null;
  const existingApprovedPackage = parsed.metadata?.commandCenterApprovedDesignPackage ?? null;
  const liveSession =
    mutation === "start_preview" || mutation === "update_preview"
      ? await getOrCreateProjectLiveViewSession({
          workspaceId,
          projectId: workspaceId,
          projectTitle: workspace.name,
          bridgeOrigin: resolveActionOrigin()
        }).catch((error) =>
          redirectWithError(
            returnTo,
            error instanceof Error
              ? error.message
              : "Live session could not be prepared for design preview."
          )
        )
      : null;

  if (
    (mutation === "start_preview" || mutation === "update_preview") &&
    (!liveSession ||
      liveSession.status !== "active" ||
      liveSession.extensionConnection.status !== "connected")
  ) {
    redirectWithError(
      returnTo,
      "Open Browser and wait for the Live View extension to bind before using Design Library preview controls."
    );
  }

  let nextPreviewState: StoredCommandCenterPreviewState | null;

  try {
    nextPreviewState = applyCommandCenterPreviewStateMutation({
      existing: existingPreviewState,
      mutation,
      selectedControls:
        mutation === "start_preview" || mutation === "update_preview"
          ? parsePreviewControls(formData)
          : undefined,
      notes:
        mutation === "start_preview" || mutation === "update_preview" ? notes : undefined,
      previewSessionId:
        mutation === "start_preview" || mutation === "update_preview"
          ? liveSession?.id ?? existingPreviewState?.previewSessionId ?? null
          : undefined,
      source:
        source === "browser_preview_panel" ||
        source === "future_browser_extension" ||
        source === "unknown"
          ? source
          : "command_center_design_library"
    });
  } catch (error) {
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Preview-state update could not be applied."
    );
  }

  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        commandCenterPreviewState: nextPreviewState,
        commandCenterApprovedDesignPackage:
          mutation === "reset_preview" ? null : existingApprovedPackage
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(
      returnTo,
      "Preview-state update could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateCommandCenterPaths(workspaceId);
}

export async function updateCommandCenterApprovedDesignPackage(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, `/workspace/${workspaceId}/command-center`);
  const mutation = safeString(formData.get("mutation")) as CommandCenterApprovedDesignPackageMutation;
  const implementationIntent = safeString(formData.get("implementationIntent")) || null;
  const cautionNotes = parseTextareaLines(formData.get("cautionNotes"));
  const affectedZones = parseTextareaLines(formData.get("affectedZones"));

  if (
    !workspaceId ||
    ![
      "create_from_preview",
      "update_package",
      "mark_approved_for_implementation",
      "mark_sent_to_codex",
      "mark_implemented",
      "mark_failed",
      "mark_superseded",
      "clear_package"
    ].includes(mutation)
  ) {
    redirectWithError(returnTo, "Design package update could not be applied.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(returnTo, error instanceof Error ? error.message : "Project not found.")
  );

  const { supabase, workspace } = ownedWorkspace;
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const existingPreviewState = parsed.metadata?.commandCenterPreviewState ?? null;
  const existingApprovedPackage = parsed.metadata?.commandCenterApprovedDesignPackage ?? null;

  let nextPreviewState = existingPreviewState;
  let nextApprovedPackage: StoredCommandCenterApprovedDesignPackage | null = existingApprovedPackage;

  try {
    if (mutation === "create_from_preview") {
      const created = createCommandCenterApprovedDesignPackageFromPreview({
        previewState: existingPreviewState,
        existingPackage: existingApprovedPackage,
        implementationIntent,
        cautionNotes,
        affectedZones
      });
      nextPreviewState = created.previewState;
      nextApprovedPackage = created.approvedPackage;
    } else {
      nextApprovedPackage = applyCommandCenterApprovedDesignPackageMutation({
        existing: existingApprovedPackage,
        mutation,
        implementationIntent,
        cautionNotes,
        affectedZones
      });

      if (mutation === "mark_implemented" && nextPreviewState) {
        nextPreviewState = applyCommandCenterPreviewStateMutation({
          existing: nextPreviewState,
          mutation: "mark_preview_implemented"
        });
      } else if (mutation === "mark_superseded" && nextPreviewState) {
        nextPreviewState = applyCommandCenterPreviewStateMutation({
          existing: nextPreviewState,
          mutation: "mark_preview_stale"
        });
      } else if (mutation === "clear_package" && nextPreviewState?.state === "approved_pending_implementation") {
        nextPreviewState = applyCommandCenterPreviewStateMutation({
          existing: nextPreviewState,
          mutation: "update_preview",
          selectedControls:
            nextPreviewState.selectedControls ?? defaultCommandCenterDesignControls(),
          notes: nextPreviewState.notes,
          source: nextPreviewState.source
        });
      }
    }
  } catch (error) {
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Design package update could not be applied."
    );
  }

  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        commandCenterPreviewState: nextPreviewState,
        commandCenterApprovedDesignPackage: nextApprovedPackage
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(
      returnTo,
      "Design package update could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateCommandCenterPaths(workspaceId);
}
