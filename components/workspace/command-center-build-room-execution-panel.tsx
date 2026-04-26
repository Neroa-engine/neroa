"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { captureCommandCenterPendingExecutionRequest } from "@/app/workspace/[workspaceId]/command-center/actions";
import type {
  BuildRoomOutputMode,
  BuildRoomRelayMode,
  BuildRoomRiskLevel,
  BuildRoomTaskInput,
  BuildRoomTaskType
} from "@/lib/build-room/contracts";
import type { BuildRoomArtifact, BuildRoomRun, BuildRoomTask, BuildRoomTaskDetail } from "@/lib/build-room/types";
import { buildProjectRoomRoute, buildProjectWorkspaceRoute } from "@/lib/portal/routes";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import { CommandCenterPanel, CommandCenterSourceBadge } from "@/components/workspace/command-center-ui";

type CommandCenterBuildRoomExecutionPanelProps = {
  workspaceId: string;
  project: ProjectRecord;
  accessMode: "owner" | "member";
  initialTasks: BuildRoomTask[];
  initialTaskDetail: BuildRoomTaskDetail | null;
  codexRelayMode: BuildRoomRelayMode;
  workerTriggerMode: BuildRoomRelayMode;
  storageMessage?: string | null;
  roadmapApprovalRequired: boolean;
  roadmapApprovalLabel: string;
  roadmapApprovalDetail: string;
  roadmapAreaLabel: string;
};

type BuildRoomDetailResponse = {
  ok: true;
  detail: BuildRoomTaskDetail;
};

type CommandCenterExecutionComposerState = {
  taskId: string | null;
  title: string;
  taskType: BuildRoomTaskType;
  requestedOutputMode: BuildRoomOutputMode;
  laneSlug: string | null;
  userRequest: string;
  acceptanceCriteria: string;
  riskLevel: BuildRoomRiskLevel;
};

const buildRoomTaskTypeOptions: Array<{
  value: BuildRoomTaskType;
  label: string;
  description: string;
}> = [
  {
    value: "implementation",
    label: "Implementation",
    description: "Ship a focused feature or governed change."
  },
  {
    value: "bug_fix",
    label: "Bug Fix",
    description: "Fix a scoped defect with clear acceptance checks."
  },
  {
    value: "qa",
    label: "QA / Validation",
    description: "Investigate, reproduce, and verify the current behavior."
  },
  {
    value: "research",
    label: "Research",
    description: "Produce grounded implementation guidance before coding."
  },
  {
    value: "operations",
    label: "Ops",
    description: "Handle build, test, deploy, or runtime coordination."
  }
];

const buildRoomRiskOptions: Array<{
  value: BuildRoomRiskLevel;
  label: string;
  description: string;
}> = [
  {
    value: "low",
    label: "Low",
    description: "Small contained change with limited downside."
  },
  {
    value: "medium",
    label: "Medium",
    description: "Moderate change that still needs review before execution."
  },
  {
    value: "high",
    label: "High",
    description: "High-impact change that should stay tightly governed."
  }
];

function createEmptyComposer(project: ProjectRecord): CommandCenterExecutionComposerState {
  return {
    taskId: null,
    title: "",
    taskType: "implementation",
    requestedOutputMode: "patch_proposal",
    laneSlug: project.lanes[0]?.slug ?? null,
    userRequest: "",
    acceptanceCriteria: "",
    riskLevel: "medium"
  };
}

function createComposerFromTask(task: BuildRoomTask): CommandCenterExecutionComposerState {
  return {
    taskId: task.id,
    title: task.title,
    taskType: task.taskType,
    requestedOutputMode: task.requestedOutputMode,
    laneSlug: task.laneSlug,
    userRequest: task.userRequest,
    acceptanceCriteria: task.acceptanceCriteria ?? "",
    riskLevel: task.riskLevel
  };
}

function replaceTaskSummary(tasks: BuildRoomTask[], updatedTask: BuildRoomTask) {
  const nextTasks = tasks.some((task) => task.id === updatedTask.id)
    ? tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    : [updatedTask, ...tasks];

  return nextTasks.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatStatusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTaskTypeLabel(taskType: BuildRoomTaskType) {
  return (
    buildRoomTaskTypeOptions.find((option) => option.value === taskType)?.label ??
    formatStatusLabel(taskType)
  );
}

function buildFallbackTitle(request: string, taskType: BuildRoomTaskType) {
  const cleaned = request
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^please\s+/i, "")
    .replace(/^can you\s+/i, "")
    .replace(/^could you\s+/i, "")
    .trim();
  const sentence = cleaned.split(/[.!?]/)[0]?.trim() || cleaned;
  const baseTitle =
    sentence.length > 96 ? `${sentence.slice(0, 93).trimEnd()}...` : sentence;

  if (baseTitle) {
    return baseTitle;
  }

  return `${formatTaskTypeLabel(taskType)} request`;
}

function buildClassification(
  taskType: BuildRoomTaskType,
  riskLevel: BuildRoomRiskLevel,
  roadmapApprovalRequired: boolean
) {
  const family =
    taskType === "research"
      ? "Guidance-oriented request"
      : taskType === "qa"
        ? "Validation-oriented request"
        : "Execution-oriented request";
  const route =
    roadmapApprovalRequired
      ? "Roadmap approval is still required. Command Center will save the Build Room task as a draft, capture the submission as roadmap-tightening / pending execution work, and hold the existing relay until the roadmap is tightened and approved."
      : taskType === "research"
      ? "Codex relay will return governed implementation guidance before any lower-level run work is considered."
      : "Command Center will create a Build Room task behind the scenes, send it through the existing relay, and preserve explicit worker approval gating.";
  const risk =
    riskLevel === "high"
      ? "High-governance review"
      : riskLevel === "medium"
        ? "Standard operator review"
        : "Low-risk review";

  return {
    family,
    risk,
    route
  };
}

function statusBadgeClasses(status: string) {
  if (status.toLowerCase().includes("pending roadmap")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status.includes("failed")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (status.includes("complete")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status.includes("running") || status.includes("queued") || status.includes("approved")) {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  if (status.includes("revision")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-white/82 text-slate-600";
}

function relayModeLabel(mode: BuildRoomRelayMode) {
  return mode === "real" ? "Real relay" : "Mock relay";
}

function workerModeLabel(mode: BuildRoomRelayMode) {
  return mode === "real" ? "Real worker" : "Mock worker";
}

function latestWorkerRun(runs: BuildRoomRun[]) {
  return runs.find((run) => run.runType === "worker") ?? null;
}

function artifactPreview(artifacts: BuildRoomArtifact[]) {
  return artifacts.filter(
    (artifact) => artifact.artifactType === "worker_result" || artifact.artifactType === "worker_log"
  );
}

function resolveExecutionStatusLabel(
  task: BuildRoomTask,
  workerMode: BuildRoomRelayMode,
  roadmapApprovalRequired: boolean
) {
  if (task.status === "draft" && roadmapApprovalRequired) {
    return "Pending Roadmap Approval";
  }

  if (task.status === "queued_for_codex") {
    return "Queued";
  }

  if (task.status === "codex_running") {
    return "Running";
  }

  if (task.status === "codex_complete") {
    return "Codex Complete";
  }

  if (task.status === "approved_for_worker") {
    return "Approved for Worker";
  }

  if (task.status === "worker_running") {
    return workerMode === "mock" ? "Worker Mock Running" : "Worker Running";
  }

  if (task.status === "worker_complete") {
    return workerMode === "mock" ? "Worker Mock Complete" : "Worker Complete";
  }

  if (task.status === "worker_failed") {
    return "Worker Failed";
  }

  if (task.status === "needs_revision") {
    return "Needs Revision";
  }

  return "Draft";
}

async function requestBuildRoomJson<T>(input: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers
  });
  const json = (await response.json()) as { ok?: boolean; error?: string };

  if (!response.ok || json.ok === false) {
    throw new Error(json.error ?? "Build Room request failed.");
  }

  return json as T;
}

export function CommandCenterBuildRoomExecutionPanel({
  workspaceId,
  project,
  accessMode,
  initialTasks,
  initialTaskDetail,
  codexRelayMode,
  workerTriggerMode,
  storageMessage = null,
  roadmapApprovalRequired,
  roadmapApprovalLabel,
  roadmapApprovalDetail,
  roadmapAreaLabel
}: CommandCenterBuildRoomExecutionPanelProps) {
  const router = useRouter();
  const buildRoomHref = buildProjectRoomRoute(workspaceId, "build-room");
  const projectWorkspaceHref = buildProjectWorkspaceRoute(workspaceId);
  const strategyRoomHref = buildProjectRoomRoute(workspaceId, "strategy-room");
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialTaskDetail?.task.id ?? initialTasks[0]?.id ?? null
  );
  const [selectedDetail, setSelectedDetail] = useState<BuildRoomTaskDetail | null>(initialTaskDetail);
  const [composer, setComposer] = useState<CommandCenterExecutionComposerState>(() =>
    createEmptyComposer(project)
  );
  const [pendingAction, setPendingAction] = useState<"send" | "approve" | "refresh" | "revise" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(
    storageMessage
      ? `${storageMessage} Apply the latest schema before using the Command Center execution intake.`
      : null
  );

  const selectedTask = selectedDetail?.task ?? null;
  const selectedCodexResult = selectedTask?.codexResponsePayload ?? null;
  const selectedWorkerRun = selectedDetail ? latestWorkerRun(selectedDetail.runs) : null;
  const selectedWorkerArtifacts = selectedDetail ? artifactPreview(selectedDetail.artifacts) : [];
  const workerBlockedByBlockers = (selectedCodexResult?.blockers.length ?? 0) > 0;
  const canApproveWorker =
    accessMode === "owner" &&
    selectedTask?.status === "codex_complete" &&
    !workerBlockedByBlockers &&
    !storageMessage &&
    !roadmapApprovalRequired;
  const classification = buildClassification(
    composer.taskType,
    composer.riskLevel,
    roadmapApprovalRequired
  );

  async function refreshTask(taskId: string, quiet = false) {
    if (!quiet) {
      setPendingAction("refresh");
      setErrorMessage(null);
    }

    try {
      const response = await requestBuildRoomJson<BuildRoomDetailResponse>(
        `/api/build-room/tasks/${taskId}`
      );
      setSelectedTaskId(response.detail.task.id);
      setSelectedDetail(response.detail);
      setTasks((current) => replaceTaskSummary(current, response.detail.task));
    } catch (error) {
      if (!quiet) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to refresh the execution task.");
      }
    } finally {
      if (!quiet) {
        setPendingAction(null);
      }
    }
  }

  async function handleSendToExecution() {
    if (storageMessage) {
      return;
    }

    setPendingAction("send");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const normalizedTitle =
        composer.title.trim() || buildFallbackTitle(composer.userRequest, composer.taskType);
      const payload: BuildRoomTaskInput = {
        workspaceId,
        projectId: project.id,
        laneSlug: composer.laneSlug,
        title: normalizedTitle,
        taskType: composer.taskType,
        requestedOutputMode: composer.requestedOutputMode,
        userRequest: composer.userRequest.trim(),
        acceptanceCriteria: composer.acceptanceCriteria.trim() || null,
        riskLevel: composer.riskLevel
      };
      const savedDetail = composer.taskId
        ? (
            await requestBuildRoomJson<BuildRoomDetailResponse>(
              `/api/build-room/tasks/${composer.taskId}`,
              {
                method: "PATCH",
                body: JSON.stringify({
                  laneSlug: payload.laneSlug,
                  title: payload.title,
                  taskType: payload.taskType,
                  requestedOutputMode: payload.requestedOutputMode,
                  userRequest: payload.userRequest,
                  acceptanceCriteria: payload.acceptanceCriteria,
                  riskLevel: payload.riskLevel
                })
              }
            )
          ).detail
        : (
            await requestBuildRoomJson<BuildRoomDetailResponse>("/api/build-room/tasks", {
              method: "POST",
              body: JSON.stringify(payload)
            })
          ).detail;
      setSelectedTaskId(savedDetail.task.id);
      setSelectedDetail(savedDetail);
      setTasks((current) => replaceTaskSummary(current, savedDetail.task));
      setComposer(createComposerFromTask(savedDetail.task));

      if (roadmapApprovalRequired) {
        await captureCommandCenterPendingExecutionRequest({
          workspaceId,
          title: normalizedTitle,
          request: payload.userRequest,
          roadmapArea: roadmapAreaLabel
        });
        setNoticeMessage(
          "Roadmap approval is still required. Command Center saved the Build Room task as a draft and captured the request as pending execution so the roadmap can be tightened before the relay runs."
        );
        router.refresh();
        return;
      }

      const finalDetail = (
        await requestBuildRoomJson<BuildRoomDetailResponse>(
          `/api/build-room/tasks/${savedDetail.task.id}/submit-codex`,
          {
            method: "POST"
          }
        )
      ).detail;

      setSelectedTaskId(finalDetail.task.id);
      setSelectedDetail(finalDetail);
      setTasks((current) => replaceTaskSummary(current, finalDetail.task));
      setComposer(createComposerFromTask(finalDetail.task));
      setNoticeMessage(
        "Command Center classified the request, created the Build Room task, and submitted it through the existing relay."
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send the execution request.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleApproveWorker() {
    if (!selectedTask || !canApproveWorker) {
      return;
    }

    setPendingAction("approve");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const response = await requestBuildRoomJson<BuildRoomDetailResponse>(
        `/api/build-room/tasks/${selectedTask.id}/approve-worker`,
        {
          method: "POST"
        }
      );

      setSelectedTaskId(response.detail.task.id);
      setSelectedDetail(response.detail);
      setTasks((current) => replaceTaskSummary(current, response.detail.task));
      setNoticeMessage(
        response.detail.task.status === "worker_complete" && workerTriggerMode === "mock"
          ? "Worker mock flow completed. Command Center kept the Build Room approval gate intact and recorded the dry run."
          : response.detail.task.status === "worker_complete"
            ? "Worker execution completed and the Build Room result was recorded."
            : "Worker approval recorded. Build Room is now handling the lower-level run state."
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to approve the worker run.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRejectAndRevise() {
    if (!selectedTask || storageMessage) {
      return;
    }

    setPendingAction("revise");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const response = await requestBuildRoomJson<BuildRoomDetailResponse>(
        `/api/build-room/tasks/${selectedTask.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "needs_revision",
            approvedForExecution: false,
            revisionNotes:
              "Returned to revision from Command Center. Tighten the request, acceptance criteria, or risks before resubmitting."
          })
        }
      );

      setSelectedTaskId(response.detail.task.id);
      setSelectedDetail(response.detail);
      setTasks((current) => replaceTaskSummary(current, response.detail.task));
      setComposer(createComposerFromTask(response.detail.task));
      setNoticeMessage(
        "Task moved back to revision and loaded into the Command Center intake so it can be updated before the next relay pass."
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to move the task back into revision.");
    } finally {
      setPendingAction(null);
    }
  }

  useEffect(() => {
    if (!selectedDetail) {
      return;
    }

    const shouldPoll =
      selectedDetail.task.status === "queued_for_codex" ||
      selectedDetail.task.status === "codex_running" ||
      selectedDetail.task.status === "approved_for_worker" ||
      selectedDetail.task.status === "worker_running" ||
      selectedDetail.task.workerRunStatus === "queued";

    if (!shouldPoll) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshTask(selectedDetail.task.id, true);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [selectedDetail]);

  return (
    <CommandCenterPanel className="p-5 xl:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Execution Intake
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Start Build Room work from Command Center
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            New execution requests now start here. When roadmap approval is in place, Command Center
            classifies the request, creates the existing Build Room task behind the scenes, and sends
            it through the current relay. When roadmap approval is still pending, Command Center
            captures the request here and keeps the Build Room relay on hold.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CommandCenterSourceBadge source="real-project-truth" />
          <Link href={buildRoomHref} className="button-secondary text-sm">
            Open Build Room Detail
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {noticeMessage ? (
        <div className="mt-4 rounded-[22px] border border-cyan-200 bg-cyan-50 px-4 py-4 text-sm text-cyan-700">
          {noticeMessage}
        </div>
      ) : null}

      {roadmapApprovalRequired ? (
        <div className="mt-4 rounded-[26px] border border-amber-200 bg-amber-50/90 px-5 py-5 shadow-[0_18px_38px_rgba(180,83,9,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                Roadmap Approval Required
              </p>
              <p className="mt-3 text-base font-semibold text-slate-950">{roadmapApprovalLabel}</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{roadmapApprovalDetail}</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                You can still submit the request here. Command Center will capture it as a
                roadmap-tightening / pending-execution request, keep the Build Room task in draft,
                and wait for roadmap approval before the existing relay is allowed to run.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={projectWorkspaceHref} className="button-primary text-sm">
                Open Project Workspace
              </Link>
              <Link href={strategyRoomHref} className="button-secondary text-sm">
                Tighten in Strategy Room
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="space-y-4">
          <div className="rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Command Center to Build Room
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  Classified as {classification.family}
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {classification.risk}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{classification.route}</p>
          </div>

          <div className="rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Execution request
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Use the current Build Room backend pipeline without rebuilding it. The form below
                  keeps the intake on Command Center while the task/run details continue to live in
                  Build Room.
                </p>
              </div>
              <button
                type="button"
                className="button-quiet rounded-full border border-slate-200 bg-white/82 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                onClick={() => {
                  setComposer(createEmptyComposer(project));
                  setNoticeMessage("Command Center intake reset for a new execution request.");
                  setErrorMessage(null);
                }}
                disabled={pendingAction !== null}
              >
                New Request
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Task title (optional)
                </span>
                <input
                  value={composer.title}
                  onChange={(event) =>
                    setComposer((current) => ({
                      ...current,
                      title: event.target.value
                    }))
                  }
                  className="input"
                  placeholder="Optional. Neroa will generate one if you leave this blank."
                  disabled={Boolean(storageMessage) || pendingAction !== null}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Task type
                </span>
                <select
                  value={composer.taskType}
                  onChange={(event) =>
                    setComposer((current) => ({
                      ...current,
                      taskType: event.target.value as BuildRoomTaskType
                    }))
                  }
                  className="input"
                  disabled={Boolean(storageMessage) || pendingAction !== null}
                >
                  {buildRoomTaskTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-6 text-slate-500">
                  {
                    buildRoomTaskTypeOptions.find((option) => option.value === composer.taskType)
                      ?.description
                  }
                </p>
              </label>
            </div>

            <div className="mt-4">
              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Request text
                </span>
                <textarea
                  value={composer.userRequest}
                  onChange={(event) =>
                    setComposer((current) => ({
                      ...current,
                      userRequest: event.target.value
                    }))
                  }
                  rows={7}
                  className="input min-h-[180px] resize-y"
                  placeholder="Describe the change, problem, and desired result. Command Center will turn this into the existing Build Room task pipeline."
                  disabled={Boolean(storageMessage) || pendingAction !== null}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Acceptance criteria
                </span>
                <textarea
                  value={composer.acceptanceCriteria}
                  onChange={(event) =>
                    setComposer((current) => ({
                      ...current,
                      acceptanceCriteria: event.target.value
                    }))
                  }
                  rows={5}
                  className="input min-h-[144px] resize-y"
                  placeholder="List the conditions that must be true before you would approve this request."
                  disabled={Boolean(storageMessage) || pendingAction !== null}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Risk level
                </span>
                <select
                  value={composer.riskLevel}
                  onChange={(event) =>
                    setComposer((current) => ({
                      ...current,
                      riskLevel: event.target.value as BuildRoomRiskLevel
                    }))
                  }
                  className="input"
                  disabled={Boolean(storageMessage) || pendingAction !== null}
                >
                  {buildRoomRiskOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-6 text-slate-500">
                  {
                    buildRoomRiskOptions.find((option) => option.value === composer.riskLevel)
                      ?.description
                  }
                </p>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-4">
              <p className="text-xs leading-6 text-slate-600">
                {roadmapApprovalRequired
                  ? "Submitting now captures the request as pending execution. Command Center keeps the Build Room task in draft and preserves the current execution gate until roadmap approval lands."
                  : "Sending to execution creates or updates the existing Build Room task, sends it through the current relay, and keeps worker approval as a separate governed step."}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {selectedTask ? (
                  <button
                    type="button"
                    className="button-quiet rounded-full border border-slate-200 bg-white/82 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                    onClick={() => {
                      setComposer(createComposerFromTask(selectedTask));
                      setNoticeMessage("Selected Build Room task loaded into Command Center intake.");
                      setErrorMessage(null);
                    }}
                    disabled={pendingAction !== null}
                  >
                    Load Selected Task
                  </button>
                ) : null}
                <button
                  type="button"
                  className="button-primary text-sm"
                  onClick={() => void handleSendToExecution()}
                  disabled={
                    pendingAction !== null ||
                    Boolean(storageMessage) ||
                    !composer.userRequest.trim()
                  }
                >
                  {pendingAction === "send"
                    ? roadmapApprovalRequired
                      ? "Capturing..."
                      : "Sending..."
                    : roadmapApprovalRequired
                      ? composer.taskId
                        ? "Update Pending Execution"
                        : "Capture Pending Execution"
                      : composer.taskId
                        ? "Resend to Execution"
                        : "Send to Execution"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Recent Build Room tasks
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Command Center shows the current execution backlog, but Build Room remains the
                  detailed run surface for packets, logs, and stored artifacts.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {tasks.length}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {tasks.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm leading-7 text-slate-500">
                  No Build Room tasks are stored yet. Use the intake above to create the first one
                  from Command Center.
                </div>
              ) : (
                tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => void refreshTask(task.id)}
                    className={`rounded-[22px] border px-4 py-4 text-left transition ${
                      selectedTaskId === task.id
                        ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_38px_rgba(15,23,42,0.16)]"
                        : "border-slate-200/70 bg-white/80 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/65"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{task.title}</p>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          selectedTaskId === task.id
                            ? "border-white/20 bg-white/10 text-white"
                            : statusBadgeClasses(
                                resolveExecutionStatusLabel(
                                  task,
                                  workerTriggerMode,
                                  roadmapApprovalRequired
                                )
                              )
                        }`}
                      >
                        {resolveExecutionStatusLabel(
                          task,
                          workerTriggerMode,
                          roadmapApprovalRequired
                        )}
                      </span>
                    </div>
                    <p
                      className={`mt-3 text-sm leading-7 ${
                        selectedTaskId === task.id ? "text-slate-200" : "text-slate-500"
                      }`}
                    >
                      {task.userRequest.length > 150
                        ? `${task.userRequest.slice(0, 150).trim()}...`
                        : task.userRequest}
                    </p>
                    <div
                      className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${
                        selectedTaskId === task.id ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      <span>{formatTaskTypeLabel(task.taskType)}</span>
                      <span>&middot;</span>
                      <span>{formatTimestamp(task.updatedAt)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Execution status
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {selectedTask
                    ? resolveExecutionStatusLabel(
                        selectedTask,
                        workerTriggerMode,
                        roadmapApprovalRequired
                      )
                    : "No execution request selected"}
                </p>
              </div>
              {selectedTask ? (
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusBadgeClasses(
                    resolveExecutionStatusLabel(
                      selectedTask,
                      workerTriggerMode,
                      roadmapApprovalRequired
                    )
                  )}`}
                >
                  {resolveExecutionStatusLabel(
                    selectedTask,
                    workerTriggerMode,
                    roadmapApprovalRequired
                  )}
                </span>
              ) : null}
            </div>

            {selectedTask ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Relay mode
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {relayModeLabel(selectedCodexResult?.relayMode ?? codexRelayMode)}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Worker mode
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {workerModeLabel(workerTriggerMode)}
                    </p>
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Current result
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {roadmapApprovalRequired && selectedTask.status === "draft"
                      ? "This request has been captured as pending execution. Build Room is holding it in draft until the roadmap is tightened and approved."
                      : selectedWorkerRun?.logExcerpt ??
                        selectedCodexResult?.summary ??
                        "This task has been created, but Build Room has not recorded a relay result yet."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Last updated
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {formatTimestamp(selectedTask.updatedAt)}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Worker job id
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-slate-950">
                      {selectedWorkerRun?.externalJobId ?? "Not recorded yet"}
                    </p>
                  </div>
                </div>

                {selectedCodexResult ? (
                  <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Codex summary
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {selectedCodexResult.summary}
                    </p>
                  </div>
                ) : null}

                <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Approval gate
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Command Center can advance the request to worker approval, but the existing Build
                    Room approval gate still remains explicit and separate from relay generation.
                  </p>
                  {accessMode !== "owner" ? (
                    <p className="mt-3 text-xs leading-6 text-amber-700">
                      Only the workspace owner can approve a worker run.
                    </p>
                  ) : null}
                  {roadmapApprovalRequired ? (
                    <p className="mt-3 text-xs leading-6 text-amber-700">
                      Roadmap approval is still required before this request can move into worker
                      execution.
                    </p>
                  ) : null}
                  {workerBlockedByBlockers ? (
                    <p className="mt-3 text-xs leading-6 text-amber-700">
                      Codex returned blockers. Revise the request before approving execution.
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="button-primary text-sm"
                      onClick={() => void handleApproveWorker()}
                      disabled={!canApproveWorker || pendingAction !== null}
                    >
                      {pendingAction === "approve" ? "Approving..." : "Approve for Worker"}
                    </button>
                    <button
                      type="button"
                      className="button-secondary text-sm"
                      onClick={() => void handleRejectAndRevise()}
                      disabled={!selectedCodexResult || pendingAction !== null || Boolean(storageMessage)}
                    >
                      {pendingAction === "revise" ? "Moving..." : "Reject / Revise"}
                    </button>
                    <button
                      type="button"
                      className="button-quiet rounded-full border border-slate-200 bg-white/82 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                      onClick={() => {
                        if (selectedTask) {
                          void refreshTask(selectedTask.id);
                        }
                      }}
                      disabled={!selectedTask || pendingAction !== null}
                    >
                      {pendingAction === "refresh" ? "Refreshing..." : "Refresh Status"}
                    </button>
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Build Room detail surface
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Use Build Room for the stored packet, full run history, worker artifacts, and
                        lower-level execution detail.
                      </p>
                    </div>
                    <Link href={buildRoomHref} className="button-secondary text-sm">
                      Open Detail Surface
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm leading-7 text-slate-500">
                Select an execution task or send a new request from Command Center to see relay and
                worker status here.
              </div>
            )}
          </div>

          {selectedWorkerArtifacts.length > 0 ? (
            <div className="rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Recent worker artifacts
              </p>
              <div className="mt-4 grid gap-3">
                {selectedWorkerArtifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-slate-950">{artifact.title}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatStatusLabel(artifact.artifactType)} &middot;{" "}
                      {formatTimestamp(artifact.createdAt)}
                    </p>
                    {artifact.textContent ? (
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-600">
                        {artifact.textContent}
                      </pre>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </CommandCenterPanel>
  );
}
