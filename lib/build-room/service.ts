import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type BuildRoomRelayMode,
  type BuildRoomTaskInput,
  type BuildRoomTaskPatch,
  type BuildRoomWorkerResultAttach
} from "@/lib/build-room/contracts";
import { getBuildRoomCodexRelayMode, relayBuildRoomTaskToCodex } from "@/lib/build-room/codex-relay";
import {
  BuildRoomStorageUnavailableError,
  createBuildRoomArtifactRecord,
  createBuildRoomMessageRecord,
  createBuildRoomRunRecord,
  createBuildRoomTaskRecord,
  getBuildRoomRun,
  getBuildRoomTask,
  getBuildRoomTaskDetail,
  updateBuildRoomRunRecord,
  updateBuildRoomTaskRecord
} from "@/lib/build-room/data";
import { loadBuildRoomProjectContext } from "@/lib/build-room/project-context";
import { createBuildRoomTaskPacket } from "@/lib/build-room/task-packet";
import {
  buildBuildRoomWorkerCallbackUrl,
  getBuildRoomWorkerCallbackSecret,
  getBuildRoomWorkerTriggerMode,
  triggerBuildRoomWorker
} from "@/lib/build-room/worker-trigger";
import {
  loadPlatformContext,
  resolvePlatformExecutionGateState
} from "@/lib/intelligence/platform-context";
import { buildWorkspaceProjectIntelligence } from "@/lib/intelligence/project-brief-generator";
import { buildTaskBillingProtectionContext } from "@/lib/intelligence/billing";
import { type ServerSupabaseClient } from "@/lib/platform/foundation";
import type { BuildRoomTaskDetail } from "@/lib/build-room/types";
import { buildCommandCenterSummary } from "@/lib/workspace/command-center-summary";
import {
  encodeWorkspaceProjectDescription,
  mergeStoredProjectMetadata,
  parseWorkspaceProjectDescription
} from "@/lib/workspace/project-metadata";

type BuildRoomWriteClient = SupabaseClient | ServerSupabaseClient;

async function requireBuildRoomTaskDetail(args: {
  supabase: BuildRoomWriteClient;
  taskId: string;
}) {
  const detail = await getBuildRoomTaskDetail({
    supabase: args.supabase,
    taskId: args.taskId
  });

  if (!detail) {
    throw new Error("Build Room task not found.");
  }

  return detail;
}

function buildLogExcerpt(logs: string[]) {
  return logs.filter(Boolean).slice(0, 3).join(" | ") || null;
}

function buildCodexRunProvider(mode: BuildRoomRelayMode) {
  return mode === "real" ? "codex-cloud" : "codex-cloud-mock";
}

function buildWorkerRunProvider(mode: BuildRoomRelayMode) {
  return mode === "real" ? "droplet-worker" : "droplet-worker-mock";
}

async function syncBuildRoomTaskBillingProtectionState(args: {
  supabase: BuildRoomWriteClient;
  taskId: string;
}) {
  const detail = await requireBuildRoomTaskDetail({
    supabase: args.supabase,
    taskId: args.taskId
  });
  const { data: workspace, error } = await args.supabase
    .from("workspaces")
    .select("id, name, description")
    .eq("id", detail.task.workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!workspace) {
    throw new Error("Build Room workspace not found for billing protection sync.");
  }

  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const projectIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: workspace.id,
    projectId: detail.task.projectId,
    projectTitle: workspace.name,
    projectDescription: parsed.visibleDescription,
    projectMetadata: parsed.metadata
  });
  const billingContext = buildTaskBillingProtectionContext({
    workspaceId: workspace.id,
    projectId: detail.task.projectId,
    projectName: workspace.name,
    executionState: projectIntelligence.executionState,
    billingState: projectIntelligence.billingState,
    taskDetail: detail,
    projectBrief: projectIntelligence.projectBrief,
    architectureBlueprint: projectIntelligence.architectureBlueprint,
    roadmapPlan: projectIntelligence.roadmapPlan,
    governancePolicy: projectIntelligence.governancePolicy
  });
  const nextMetadata = mergeStoredProjectMetadata({
    existing: parsed.metadata,
    title: workspace.name,
    description: parsed.visibleDescription,
    billingState: billingContext.billingState
  });
  const encodedDescription = encodeWorkspaceProjectDescription(
    parsed.visibleDescription,
    nextMetadata
  );
  const updateResult = await args.supabase
    .from("workspaces")
    .update({
      description: encodedDescription
    })
    .eq("id", workspace.id)
    .select("id")
    .maybeSingle();

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  if (!updateResult.data) {
    throw new Error(
      "Build Room billing protection sync could not be confirmed."
    );
  }

  return detail;
}

async function syncBuildRoomTaskBillingProtectionStateSafely(args: {
  supabase: BuildRoomWriteClient;
  taskId: string;
}) {
  await syncBuildRoomTaskBillingProtectionState(args).catch(() => {
    // Preserve the existing relay flow even if billing metadata cannot be refreshed yet.
  });
}

export async function createBuildRoomTask(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  taskInput: BuildRoomTaskInput;
}) {
  const projectContext = await loadBuildRoomProjectContext({
    supabase: args.supabase,
    userId: args.userId,
    workspaceId: args.taskInput.workspaceId,
    projectId: args.taskInput.projectId
  });
  const taskId = await createBuildRoomTaskRecord({
    supabase: args.supabase,
    taskInput: args.taskInput,
    ownerId: projectContext.workspace.ownerId,
    createdByUserId: args.userId
  });

  await createBuildRoomMessageRecord({
    supabase: args.supabase,
    taskId,
    ownerId: projectContext.workspace.ownerId,
    authorUserId: args.userId,
    role: "user",
    messageKind: "task_created",
    content: args.taskInput.userRequest,
    payload: {
      title: args.taskInput.title,
      taskType: args.taskInput.taskType,
      riskLevel: args.taskInput.riskLevel,
      acceptanceCriteria: args.taskInput.acceptanceCriteria,
      requestedOutputMode: args.taskInput.requestedOutputMode
    }
  });

  return requireBuildRoomTaskDetail({
    supabase: args.supabase,
    taskId
  });
}

export async function updateBuildRoomTask(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  taskId: string;
  patch: BuildRoomTaskPatch;
}) {
  const existingTask = await getBuildRoomTask({
    supabase: args.supabase,
    taskId: args.taskId
  });

  if (!existingTask) {
    throw new Error("Build Room task not found.");
  }

  await loadBuildRoomProjectContext({
    supabase: args.supabase,
    userId: args.userId,
    workspaceId: existingTask.workspaceId,
    projectId: existingTask.projectId
  });

  await updateBuildRoomTaskRecord({
    supabase: args.supabase,
    taskId: args.taskId,
    patch: args.patch
  });

  if (args.patch.status === "needs_revision") {
    await createBuildRoomMessageRecord({
      supabase: args.supabase,
      taskId: args.taskId,
      ownerId: existingTask.ownerId,
      authorUserId: args.userId,
      role: "system",
      messageKind: "needs_revision",
      content:
        args.patch.revisionNotes ??
        "Marked for revision. Update the request or acceptance criteria before sending it back through the relay.",
      payload: {
        status: "needs_revision"
      }
    });
  }

  return requireBuildRoomTaskDetail({
    supabase: args.supabase,
    taskId: args.taskId
  });
}

export async function submitBuildRoomTaskToCodex(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  taskId: string;
}) {
  const task = await getBuildRoomTask({
    supabase: args.supabase,
    taskId: args.taskId
  });

  if (!task) {
    throw new Error("Build Room task not found.");
  }

  const projectContext = await loadBuildRoomProjectContext({
    supabase: args.supabase,
    userId: args.userId,
    workspaceId: task.workspaceId,
    projectId: task.projectId
  });
  const platformContext = loadPlatformContext(projectContext.projectMetadata?.platformContext);
  const commandCenter = buildCommandCenterSummary({
    project: projectContext.project,
    projectMetadata: projectContext.projectMetadata
  });
  const executionGate = resolvePlatformExecutionGateState({
    platformContext,
    workspaceId: task.workspaceId,
    signals: {
      roomStateDataState: commandCenter.roomState.dataState,
      blockingOpenCount: commandCenter.decisionInbox.blockingOpenCount,
      activePhaseLabel: commandCenter.activePhase.label
    }
  });

  if (executionGate.approvalRequired && !executionGate.shouldExecute) {
    throw new Error(
      `${executionGate.blockedPanel.title}. ${executionGate.blockedPanel.body}`
    );
  }

  const packet = createBuildRoomTaskPacket({
    task,
    projectContext
  });
  const queuedAt = new Date().toISOString();
  const codexRelayMode = getBuildRoomCodexRelayMode();

  await updateBuildRoomTaskRecord({
    supabase: args.supabase,
    taskId: task.id,
    patch: {
      status: "queued_for_codex",
      approvedForExecution: false,
      workerRunStatus: "idle",
      codexRequestPayload: packet,
      codexResponsePayload: null
    }
  });
  await createBuildRoomMessageRecord({
    supabase: args.supabase,
    taskId: task.id,
    ownerId: task.ownerId,
    authorUserId: args.userId,
    role: "user",
    messageKind: "submitted_to_codex",
    content: `Sent "${task.title}" to the Build Room Codex relay.`,
    payload: packet
  });

  const runId = await createBuildRoomRunRecord({
    supabase: args.supabase,
    taskId: task.id,
    workspaceId: task.workspaceId,
    projectId: task.projectId,
    ownerId: task.ownerId,
    triggeredByUserId: args.userId,
    runType: "codex",
    status: "queued",
    provider: buildCodexRunProvider(codexRelayMode),
    requestPayload: packet,
    startedAt: queuedAt
  });
  await createBuildRoomArtifactRecord({
    supabase: args.supabase,
    taskId: task.id,
    runId,
    ownerId: task.ownerId,
    createdByUserId: args.userId,
    artifactType: "task_packet",
    title: `${task.title} task packet`,
    payload: packet
  });
  await updateBuildRoomTaskRecord({
    supabase: args.supabase,
    taskId: task.id,
    patch: {
      status: "codex_running"
    }
  });
  await updateBuildRoomRunRecord({
    supabase: args.supabase,
    runId,
    status: "running",
    startedAt: queuedAt
  });
  await syncBuildRoomTaskBillingProtectionStateSafely({
    supabase: args.supabase,
    taskId: task.id
  });

  try {
    const codexResult = await relayBuildRoomTaskToCodex({
      taskTitle: task.title,
      taskType: task.taskType,
      packet
    });
    const completedAt = new Date().toISOString();

    await updateBuildRoomRunRecord({
      supabase: args.supabase,
      runId,
      status: "complete",
      responsePayload: codexResult,
      logExcerpt: buildLogExcerpt([
        codexResult.summary,
        ...codexResult.warnings,
        ...codexResult.blockers
      ]),
      completedAt
    });
    await updateBuildRoomTaskRecord({
      supabase: args.supabase,
      taskId: task.id,
      patch: {
        status: "codex_complete",
        approvedForExecution: false,
        workerRunStatus: "idle",
        codexResponsePayload: codexResult
      }
    });
    await createBuildRoomMessageRecord({
      supabase: args.supabase,
      taskId: task.id,
      ownerId: task.ownerId,
      authorUserId: args.userId,
      role: "codex",
      messageKind: "codex_complete",
      content: codexResult.summary,
      payload: codexResult
    });
    await createBuildRoomArtifactRecord({
      supabase: args.supabase,
      taskId: task.id,
      runId,
      ownerId: task.ownerId,
      createdByUserId: args.userId,
      artifactType: "codex_result",
      title: `${task.title} Codex result`,
      textContent: codexResult.patchText,
      payload: codexResult
    });
    const detail = await requireBuildRoomTaskDetail({
      supabase: args.supabase,
      taskId: task.id
    });
    await syncBuildRoomTaskBillingProtectionStateSafely({
      supabase: args.supabase,
      taskId: task.id
    });

    return detail;
  } catch (error) {
    const completedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : "Codex relay failed.";

    await updateBuildRoomRunRecord({
      supabase: args.supabase,
      runId,
      status: "failed",
      responsePayload: {
        error: message
      },
      logExcerpt: message,
      completedAt
    });
    await updateBuildRoomTaskRecord({
      supabase: args.supabase,
      taskId: task.id,
      patch: {
        status: "needs_revision",
        approvedForExecution: false,
        workerRunStatus: "idle"
      }
    });
    await createBuildRoomMessageRecord({
      supabase: args.supabase,
      taskId: task.id,
      ownerId: task.ownerId,
      authorUserId: args.userId,
      role: "system",
      messageKind: "codex_failed",
      content: message,
      payload: {
        status: "failed"
      }
    });
    await syncBuildRoomTaskBillingProtectionStateSafely({
      supabase: args.supabase,
      taskId: task.id
    });

    throw error;
  }
}

async function applyBuildRoomWorkerResult(args: {
  supabase: BuildRoomWriteClient;
  runId: string;
  result: BuildRoomWorkerResultAttach;
  messageRole: "system" | "worker";
  authorUserId: string | null;
}) {
  const run = await getBuildRoomRun({
    supabase: args.supabase,
    runId: args.runId
  });

  if (!run) {
    throw new Error("Build Room run not found.");
  }

  const task = await getBuildRoomTask({
    supabase: args.supabase,
    taskId: run.taskId
  });

  if (!task) {
    throw new Error("Build Room task not found.");
  }

  const completedAt = args.result.status === "running" ? null : new Date().toISOString();
  const runStatus =
    args.result.status === "complete"
      ? "complete"
      : args.result.status === "failed"
        ? "failed"
        : "running";

  await updateBuildRoomRunRecord({
    supabase: args.supabase,
    runId: args.runId,
    status: runStatus,
    externalJobId: args.result.externalJobId ?? run.externalJobId,
    responsePayload: args.result.resultPayload ?? args.result.metadata,
    logExcerpt: buildLogExcerpt(args.result.logs),
    completedAt
  });
  await updateBuildRoomTaskRecord({
    supabase: args.supabase,
    taskId: task.id,
    patch: {
      approvedForExecution: true,
      status:
        args.result.status === "complete"
          ? "worker_complete"
          : args.result.status === "failed"
            ? "worker_failed"
            : "worker_running",
      workerRunStatus:
        args.result.status === "complete"
          ? "complete"
          : args.result.status === "failed"
            ? "failed"
            : "running"
    }
  });
  await createBuildRoomMessageRecord({
    supabase: args.supabase,
    taskId: task.id,
    ownerId: task.ownerId,
    authorUserId: args.authorUserId,
    role: args.messageRole,
    messageKind:
      args.result.status === "complete"
        ? "worker_complete"
        : args.result.status === "failed"
          ? "worker_failed"
          : "worker_running",
    content:
      args.result.summary ??
      (args.result.status === "running"
        ? "Worker is processing the approved job."
        : args.result.status === "complete"
          ? "Worker completed the approved job."
          : "Worker failed the approved job."),
    payload: {
      logs: args.result.logs,
      metadata: args.result.metadata,
      externalJobId: args.result.externalJobId
    }
  });
  await createBuildRoomArtifactRecord({
    supabase: args.supabase,
    taskId: task.id,
    runId: run.id,
    ownerId: task.ownerId,
    createdByUserId: args.authorUserId,
    artifactType: args.result.status === "complete" ? "worker_result" : "worker_log",
    title:
      args.result.artifactTitle ??
      (args.result.status === "complete" ? `${task.title} worker result` : `${task.title} worker log`),
    textContent: args.result.textContent ?? (args.result.logs.length > 0 ? args.result.logs.join("\n") : null),
    payload: args.result.resultPayload ?? args.result.metadata
  });
  const detail = await requireBuildRoomTaskDetail({
    supabase: args.supabase,
    taskId: task.id
  });
  await syncBuildRoomTaskBillingProtectionStateSafely({
    supabase: args.supabase,
    taskId: task.id
  });

  return detail;
}

export async function approveBuildRoomTaskForWorker(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  taskId: string;
}) {
  const task = await getBuildRoomTask({
    supabase: args.supabase,
    taskId: args.taskId
  });

  if (!task) {
    throw new Error("Build Room task not found.");
  }

  const projectContext = await loadBuildRoomProjectContext({
    supabase: args.supabase,
    userId: args.userId,
    workspaceId: task.workspaceId,
    projectId: task.projectId
  });

  if (projectContext.workspace.accessMode !== "owner") {
    throw new Error("Only the workspace owner can approve a worker run.");
  }

  if (!task.codexResponsePayload) {
    throw new Error("Generate a Codex response before approving the worker.");
  }

  if (task.codexResponsePayload.blockers.length > 0) {
    throw new Error("Resolve or revise the Codex blockers before approving the worker.");
  }

  const packet = task.codexRequestPayload ?? createBuildRoomTaskPacket({ task, projectContext });
  const queuedAt = new Date().toISOString();
  const workerTriggerMode = getBuildRoomWorkerTriggerMode();

  await updateBuildRoomTaskRecord({
    supabase: args.supabase,
    taskId: task.id,
    patch: {
      approvedForExecution: true,
      status: "approved_for_worker",
      workerRunStatus: "queued",
      codexRequestPayload: packet
    }
  });
  await createBuildRoomMessageRecord({
    supabase: args.supabase,
    taskId: task.id,
    ownerId: task.ownerId,
    authorUserId: args.userId,
    role: "system",
    messageKind: "worker_approved",
    content:
      workerTriggerMode === "mock"
        ? "Worker approval granted. Build Room will record a governed mock dry run before any real execution is enabled."
        : "Worker approval granted. Build Room is preparing the governed execution packet.",
    payload: {
      approvedByUserId: args.userId,
      triggerMode: workerTriggerMode
    }
  });

  const runId = await createBuildRoomRunRecord({
    supabase: args.supabase,
    taskId: task.id,
    workspaceId: task.workspaceId,
    projectId: task.projectId,
    ownerId: task.ownerId,
    triggeredByUserId: args.userId,
    runType: "worker",
    status: "queued",
    provider: buildWorkerRunProvider(workerTriggerMode),
    startedAt: queuedAt
  });
  const workerResult = await triggerBuildRoomWorker({
    runId,
    task,
    packet,
    codexResult: task.codexResponsePayload,
    approvedByUserId: args.userId,
    callbackUrl: buildBuildRoomWorkerCallbackUrl(runId),
    callbackSecret: getBuildRoomWorkerCallbackSecret()
  });

  await createBuildRoomArtifactRecord({
    supabase: args.supabase,
    taskId: task.id,
    runId,
    ownerId: task.ownerId,
    createdByUserId: args.userId,
    artifactType: "worker_packet",
    title: `${task.title} worker packet`,
    payload: {
      triggerMode: workerTriggerMode,
      taskId: task.id,
      requestedOutputMode: task.requestedOutputMode,
      codexSummary: task.codexResponsePayload.summary,
      implementationPlan: task.codexResponsePayload.implementationPlan,
      warnings: task.codexResponsePayload.warnings
    }
  });

  if (workerResult.runStatus === "complete" || workerResult.runStatus === "failed") {
    return applyBuildRoomWorkerResult({
      supabase: args.supabase,
      runId,
      result: {
        status: workerResult.runStatus === "complete" ? "complete" : "failed",
        externalJobId: workerResult.externalJobId,
        summary: workerResult.summary,
        logs: workerResult.logs,
        metadata: {
          triggerMode: workerResult.triggerMode,
          ...(workerResult.resultPayload ?? {})
        },
        artifactTitle: null,
        resultPayload: workerResult.resultPayload,
        textContent: workerResult.textContent
      },
      messageRole: "worker",
      authorUserId: null
    });
  }

  await updateBuildRoomRunRecord({
    supabase: args.supabase,
    runId,
    status: workerResult.runStatus === "running" ? "running" : "queued",
    externalJobId: workerResult.externalJobId,
    responsePayload: workerResult.resultPayload,
    logExcerpt: buildLogExcerpt(workerResult.logs)
  });
  await updateBuildRoomTaskRecord({
    supabase: args.supabase,
    taskId: task.id,
    patch: {
      approvedForExecution: true,
      status: "worker_running",
      workerRunStatus: workerResult.runStatus === "running" ? "running" : "queued"
    }
  });
  await createBuildRoomMessageRecord({
    supabase: args.supabase,
    taskId: task.id,
    ownerId: task.ownerId,
    authorUserId: args.userId,
    role: "worker",
    messageKind: "worker_running",
    content: workerResult.summary,
    payload: {
      externalJobId: workerResult.externalJobId,
      logs: workerResult.logs,
      triggerMode: workerResult.triggerMode
    }
  });
  const detail = await requireBuildRoomTaskDetail({
    supabase: args.supabase,
    taskId: task.id
  });
  await syncBuildRoomTaskBillingProtectionStateSafely({
    supabase: args.supabase,
    taskId: task.id
  });

  return detail;
}

export async function attachBuildRoomWorkerRunResult(args: {
  supabase: BuildRoomWriteClient;
  runId: string;
  result: BuildRoomWorkerResultAttach;
  actorUserId?: string | null;
}) {
  return applyBuildRoomWorkerResult({
    supabase: args.supabase,
    runId: args.runId,
    result: args.result,
    messageRole: "worker",
    authorUserId: args.actorUserId ?? null
  });
}

export function isBuildRoomStorageUnavailableError(error: unknown) {
  return error instanceof BuildRoomStorageUnavailableError;
}

export async function loadBuildRoomTaskDetailOrThrow(args: {
  supabase: BuildRoomWriteClient;
  taskId: string;
}): Promise<BuildRoomTaskDetail> {
  return requireBuildRoomTaskDetail(args);
}
