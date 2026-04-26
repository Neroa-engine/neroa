import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildRoomCodexResultSchema,
  buildRoomOutputModeSchema,
  buildRoomRiskLevelSchema,
  buildRoomRunStatusSchema,
  buildRoomRunTypeSchema,
  buildRoomTaskPacketSchema,
  buildRoomTaskStatusSchema,
  buildRoomTaskTypeSchema,
  buildRoomWorkerRunStatusSchema,
  type BuildRoomArtifactType,
  type BuildRoomMessageRole,
  type BuildRoomRunStatus,
  type BuildRoomRunType,
  type BuildRoomTaskInput,
  type BuildRoomTaskPatch
} from "@/lib/build-room/contracts";
import type {
  BuildRoomArtifact,
  BuildRoomRun,
  BuildRoomTask,
  BuildRoomTaskDetail,
  BuildRoomTaskMessage
} from "@/lib/build-room/types";
import { isMissingPlatformTableError } from "@/lib/platform/foundation";

type BuildRoomSupabaseClient = SupabaseClient;

const buildRoomStorageUnavailableMessage =
  "Build Room storage is not available until the latest Supabase schema is applied.";

export class BuildRoomStorageUnavailableError extends Error {
  constructor(message = buildRoomStorageUnavailableMessage) {
    super(message);
    this.name = "BuildRoomStorageUnavailableError";
  }
}

function handleQueryError(error: { message?: string } | null, fallbackMessage: string) {
  if (!error) {
    return;
  }

  if (isMissingPlatformTableError(error)) {
    throw new BuildRoomStorageUnavailableError();
  }

  throw new Error(error.message || fallbackMessage);
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeTask(row: Record<string, unknown>): BuildRoomTask {
  return {
    id: asString(row.id),
    workspaceId: asString(row.workspace_id),
    projectId: asString(row.project_id),
    ownerId: asString(row.owner_id),
    createdByUserId: asString(row.created_by_user_id),
    laneSlug: asNullableString(row.lane_slug),
    title: asString(row.title),
    taskType: buildRoomTaskTypeSchema.catch("implementation").parse(row.task_type),
    requestedOutputMode: buildRoomOutputModeSchema.catch("patch_proposal").parse(row.requested_output_mode),
    userRequest: asString(row.user_request),
    acceptanceCriteria: asNullableString(row.acceptance_criteria),
    riskLevel: buildRoomRiskLevelSchema.catch("medium").parse(row.risk_level),
    status: buildRoomTaskStatusSchema.catch("draft").parse(row.status),
    codexRequestPayload: buildRoomTaskPacketSchema.safeParse(row.codex_request_payload).success
      ? buildRoomTaskPacketSchema.parse(row.codex_request_payload)
      : null,
    codexResponsePayload: buildRoomCodexResultSchema.safeParse(row.codex_response_payload).success
      ? buildRoomCodexResultSchema.parse(row.codex_response_payload)
      : null,
    approvedForExecution: asBoolean(row.approved_for_execution),
    workerRunStatus: buildRoomWorkerRunStatusSchema.catch("idle").parse(row.worker_run_status),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at)
  };
}

function normalizeMessage(row: Record<string, unknown>): BuildRoomTaskMessage {
  return {
    id: asString(row.id),
    taskId: asString(row.task_id),
    ownerId: asString(row.owner_id),
    authorUserId: asNullableString(row.author_user_id),
    role:
      row.role === "codex" || row.role === "worker" || row.role === "system" || row.role === "user"
        ? row.role
        : "system",
    messageKind: asString(row.message_kind),
    content: asString(row.content),
    payload: asRecord(row.payload),
    createdAt: asString(row.created_at)
  };
}

function normalizeRun(row: Record<string, unknown>): BuildRoomRun {
  return {
    id: asString(row.id),
    taskId: asString(row.task_id),
    workspaceId: asString(row.workspace_id),
    projectId: asString(row.project_id),
    ownerId: asString(row.owner_id),
    triggeredByUserId: asNullableString(row.triggered_by_user_id),
    runType: buildRoomRunTypeSchema.catch("worker").parse(row.run_type),
    status: buildRoomRunStatusSchema.catch("queued").parse(row.status),
    provider: asString(row.provider),
    externalJobId: asNullableString(row.external_job_id),
    requestPayload: asRecord(row.request_payload),
    responsePayload: asRecord(row.response_payload),
    logExcerpt: asNullableString(row.log_excerpt),
    startedAt: asNullableString(row.started_at),
    completedAt: asNullableString(row.completed_at),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at)
  };
}

function normalizeArtifact(row: Record<string, unknown>): BuildRoomArtifact {
  return {
    id: asString(row.id),
    taskId: asString(row.task_id),
    runId: asNullableString(row.run_id),
    ownerId: asString(row.owner_id),
    artifactType:
      row.artifact_type === "task_packet" ||
      row.artifact_type === "codex_result" ||
      row.artifact_type === "worker_packet" ||
      row.artifact_type === "worker_result" ||
      row.artifact_type === "worker_log"
        ? row.artifact_type
        : "task_packet",
    title: asString(row.title),
    textContent: asNullableString(row.text_content),
    payload: asRecord(row.payload),
    createdAt: asString(row.created_at)
  };
}

export async function listBuildRoomTasks(args: {
  supabase: BuildRoomSupabaseClient;
  workspaceId: string;
  projectId: string;
}) {
  const { data, error } = await args.supabase
    .from("build_room_tasks")
    .select(
      "id, workspace_id, project_id, owner_id, created_by_user_id, lane_slug, title, task_type, requested_output_mode, user_request, acceptance_criteria, risk_level, status, codex_request_payload, codex_response_payload, approved_for_execution, worker_run_status, created_at, updated_at"
    )
    .eq("workspace_id", args.workspaceId)
    .eq("project_id", args.projectId)
    .order("updated_at", { ascending: false });

  handleQueryError(error, "Unable to load Build Room tasks.");

  return (data ?? []).map((row) => normalizeTask(row as Record<string, unknown>));
}

export async function getBuildRoomTask(args: {
  supabase: BuildRoomSupabaseClient;
  taskId: string;
}) {
  const { data, error } = await args.supabase
    .from("build_room_tasks")
    .select(
      "id, workspace_id, project_id, owner_id, created_by_user_id, lane_slug, title, task_type, requested_output_mode, user_request, acceptance_criteria, risk_level, status, codex_request_payload, codex_response_payload, approved_for_execution, worker_run_status, created_at, updated_at"
    )
    .eq("id", args.taskId)
    .maybeSingle();

  handleQueryError(error, "Unable to load the Build Room task.");

  return data ? normalizeTask(data as Record<string, unknown>) : null;
}

export async function getBuildRoomRun(args: {
  supabase: BuildRoomSupabaseClient;
  runId: string;
}) {
  const { data, error } = await args.supabase
    .from("build_room_runs")
    .select(
      "id, task_id, workspace_id, project_id, owner_id, triggered_by_user_id, run_type, status, provider, external_job_id, request_payload, response_payload, log_excerpt, started_at, completed_at, created_at, updated_at"
    )
    .eq("id", args.runId)
    .maybeSingle();

  handleQueryError(error, "Unable to load the Build Room run.");

  return data ? normalizeRun(data as Record<string, unknown>) : null;
}

export async function getBuildRoomTaskDetail(args: {
  supabase: BuildRoomSupabaseClient;
  taskId: string;
}): Promise<BuildRoomTaskDetail | null> {
  const [taskResult, messagesResult, runsResult, artifactsResult] = await Promise.all([
    args.supabase
      .from("build_room_tasks")
      .select(
        "id, workspace_id, project_id, owner_id, created_by_user_id, lane_slug, title, task_type, requested_output_mode, user_request, acceptance_criteria, risk_level, status, codex_request_payload, codex_response_payload, approved_for_execution, worker_run_status, created_at, updated_at"
      )
      .eq("id", args.taskId)
      .maybeSingle(),
    args.supabase
      .from("build_room_task_messages")
      .select("id, task_id, owner_id, author_user_id, role, message_kind, content, payload, created_at")
      .eq("task_id", args.taskId)
      .order("created_at", { ascending: true }),
    args.supabase
      .from("build_room_runs")
      .select(
        "id, task_id, workspace_id, project_id, owner_id, triggered_by_user_id, run_type, status, provider, external_job_id, request_payload, response_payload, log_excerpt, started_at, completed_at, created_at, updated_at"
      )
      .eq("task_id", args.taskId)
      .order("created_at", { ascending: false }),
    args.supabase
      .from("build_room_artifacts")
      .select("id, task_id, run_id, owner_id, artifact_type, title, text_content, payload, created_at")
      .eq("task_id", args.taskId)
      .order("created_at", { ascending: false })
  ]);

  handleQueryError(taskResult.error, "Unable to load the Build Room task.");
  handleQueryError(messagesResult.error, "Unable to load Build Room messages.");
  handleQueryError(runsResult.error, "Unable to load Build Room runs.");
  handleQueryError(artifactsResult.error, "Unable to load Build Room artifacts.");

  if (!taskResult.data) {
    return null;
  }

  return {
    task: normalizeTask(taskResult.data as Record<string, unknown>),
    messages: (messagesResult.data ?? []).map((row) => normalizeMessage(row as Record<string, unknown>)),
    runs: (runsResult.data ?? []).map((row) => normalizeRun(row as Record<string, unknown>)),
    artifacts: (artifactsResult.data ?? []).map((row) =>
      normalizeArtifact(row as Record<string, unknown>)
    )
  };
}

export async function createBuildRoomTaskRecord(args: {
  supabase: BuildRoomSupabaseClient;
  taskInput: BuildRoomTaskInput;
  ownerId: string;
  createdByUserId: string;
}) {
  const now = new Date().toISOString();
  const { data, error } = await args.supabase
    .from("build_room_tasks")
    .insert({
      workspace_id: args.taskInput.workspaceId,
      project_id: args.taskInput.projectId,
      owner_id: args.ownerId,
      created_by_user_id: args.createdByUserId,
      lane_slug: args.taskInput.laneSlug,
      title: args.taskInput.title,
      task_type: args.taskInput.taskType,
      requested_output_mode: args.taskInput.requestedOutputMode,
      user_request: args.taskInput.userRequest,
      acceptance_criteria: args.taskInput.acceptanceCriteria,
      risk_level: args.taskInput.riskLevel,
      status: "draft",
      approved_for_execution: false,
      worker_run_status: "idle",
      created_at: now,
      updated_at: now
    })
    .select("id")
    .single();

  handleQueryError(error, "Unable to create the Build Room task.");

  return asString(data?.id);
}

export async function updateBuildRoomTaskRecord(args: {
  supabase: BuildRoomSupabaseClient;
  taskId: string;
  patch: BuildRoomTaskPatch;
}) {
  const now = new Date().toISOString();
  const updateRow: Record<string, unknown> = {
    updated_at: now
  };

  if (args.patch.laneSlug !== undefined) {
    updateRow.lane_slug = args.patch.laneSlug;
  }

  if (args.patch.title !== undefined) {
    updateRow.title = args.patch.title;
  }

  if (args.patch.taskType !== undefined) {
    updateRow.task_type = args.patch.taskType;
  }

  if (args.patch.requestedOutputMode !== undefined) {
    updateRow.requested_output_mode = args.patch.requestedOutputMode;
  }

  if (args.patch.userRequest !== undefined) {
    updateRow.user_request = args.patch.userRequest;
  }

  if (args.patch.acceptanceCriteria !== undefined) {
    updateRow.acceptance_criteria = args.patch.acceptanceCriteria;
  }

  if (args.patch.riskLevel !== undefined) {
    updateRow.risk_level = args.patch.riskLevel;
  }

  if (args.patch.status !== undefined) {
    updateRow.status = args.patch.status;
  }

  if (args.patch.approvedForExecution !== undefined) {
    updateRow.approved_for_execution = args.patch.approvedForExecution;
  }

  if (args.patch.workerRunStatus !== undefined) {
    updateRow.worker_run_status = args.patch.workerRunStatus;
  }

  if (args.patch.codexRequestPayload !== undefined) {
    updateRow.codex_request_payload = args.patch.codexRequestPayload;
  }

  if (args.patch.codexResponsePayload !== undefined) {
    updateRow.codex_response_payload = args.patch.codexResponsePayload;
  }

  const { data, error } = await args.supabase
    .from("build_room_tasks")
    .update(updateRow)
    .eq("id", args.taskId)
    .select("id")
    .maybeSingle();

  handleQueryError(error, "Unable to update the Build Room task.");

  return asNullableString(data?.id);
}

export async function createBuildRoomMessageRecord(args: {
  supabase: BuildRoomSupabaseClient;
  taskId: string;
  ownerId: string;
  authorUserId: string | null;
  role: BuildRoomMessageRole;
  messageKind: string;
  content: string;
  payload?: Record<string, unknown> | null;
}) {
  const { error } = await args.supabase.from("build_room_task_messages").insert({
    task_id: args.taskId,
    owner_id: args.ownerId,
    author_user_id: args.authorUserId,
    role: args.role,
    message_kind: args.messageKind,
    content: args.content,
    payload: args.payload ?? null
  });

  handleQueryError(error, "Unable to append the Build Room task message.");
}

export async function createBuildRoomRunRecord(args: {
  supabase: BuildRoomSupabaseClient;
  taskId: string;
  workspaceId: string;
  projectId: string;
  ownerId: string;
  triggeredByUserId: string | null;
  runType: BuildRoomRunType;
  status: BuildRoomRunStatus;
  provider: string;
  requestPayload?: Record<string, unknown> | null;
  responsePayload?: Record<string, unknown> | null;
  externalJobId?: string | null;
  logExcerpt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}) {
  const now = new Date().toISOString();
  const { data, error } = await args.supabase
    .from("build_room_runs")
    .insert({
      task_id: args.taskId,
      workspace_id: args.workspaceId,
      project_id: args.projectId,
      owner_id: args.ownerId,
      triggered_by_user_id: args.triggeredByUserId,
      run_type: args.runType,
      status: args.status,
      provider: args.provider,
      request_payload: args.requestPayload ?? null,
      response_payload: args.responsePayload ?? null,
      external_job_id: args.externalJobId ?? null,
      log_excerpt: args.logExcerpt ?? null,
      started_at: args.startedAt ?? null,
      completed_at: args.completedAt ?? null,
      created_at: now,
      updated_at: now
    })
    .select("id")
    .single();

  handleQueryError(error, "Unable to create the Build Room run.");

  return asString(data?.id);
}

export async function updateBuildRoomRunRecord(args: {
  supabase: BuildRoomSupabaseClient;
  runId: string;
  status?: BuildRoomRunStatus;
  requestPayload?: Record<string, unknown> | null;
  responsePayload?: Record<string, unknown> | null;
  externalJobId?: string | null;
  logExcerpt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}) {
  const now = new Date().toISOString();
  const updateRow: Record<string, unknown> = {
    updated_at: now
  };

  if (args.status !== undefined) {
    updateRow.status = args.status;
  }

  if (args.requestPayload !== undefined) {
    updateRow.request_payload = args.requestPayload;
  }

  if (args.responsePayload !== undefined) {
    updateRow.response_payload = args.responsePayload;
  }

  if (args.externalJobId !== undefined) {
    updateRow.external_job_id = args.externalJobId;
  }

  if (args.logExcerpt !== undefined) {
    updateRow.log_excerpt = args.logExcerpt;
  }

  if (args.startedAt !== undefined) {
    updateRow.started_at = args.startedAt;
  }

  if (args.completedAt !== undefined) {
    updateRow.completed_at = args.completedAt;
  }

  const { data, error } = await args.supabase
    .from("build_room_runs")
    .update(updateRow)
    .eq("id", args.runId)
    .select("id")
    .maybeSingle();

  handleQueryError(error, "Unable to update the Build Room run.");

  return asNullableString(data?.id);
}

export async function createBuildRoomArtifactRecord(args: {
  supabase: BuildRoomSupabaseClient;
  taskId: string;
  runId?: string | null;
  ownerId: string;
  createdByUserId?: string | null;
  artifactType: BuildRoomArtifactType;
  title: string;
  textContent?: string | null;
  payload?: Record<string, unknown> | null;
}) {
  const { error } = await args.supabase.from("build_room_artifacts").insert({
    task_id: args.taskId,
    run_id: args.runId ?? null,
    owner_id: args.ownerId,
    created_by_user_id: args.createdByUserId ?? null,
    artifact_type: args.artifactType,
    title: args.title,
    text_content: args.textContent ?? null,
    payload: args.payload ?? null
  });

  handleQueryError(error, "Unable to create the Build Room artifact.");
}
