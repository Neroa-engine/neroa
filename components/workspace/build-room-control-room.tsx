"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { BuildRoomRelayMode } from "@/lib/build-room/contracts";
import type { BuildRoomArtifact, BuildRoomRun, BuildRoomTask, BuildRoomTaskDetail } from "@/lib/build-room/types";
import {
  buildExecutionStateSummary,
  getExecutionPacketRelationship,
  getPendingExecutionRelationship,
  type ExecutionState
} from "@/lib/intelligence/execution";
import {
  buildBuildRoomTaskHandoffPackage,
  type BuildRoomHandoffPackage
} from "@/lib/neroa-one";
import {
  buildBillingProtectionSummaryFromState,
  buildTaskBillingProtectionContext,
  type BillingProtectionState
} from "@/lib/intelligence/billing";
import type { GovernancePolicy } from "@/lib/intelligence/governance";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import { buildQAValidationSummary, buildTaskQAValidationContext } from "@/lib/intelligence/qa";
import type { RoadmapPlan } from "@/lib/intelligence/roadmap";
import type { ArchitectureBlueprint } from "@/lib/intelligence/architecture";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";

type BuildRoomControlRoomProps = {
  workspaceId: string;
  project: ProjectRecord;
  accessMode: "owner" | "member";
  initialTasks: BuildRoomTask[];
  initialTaskDetail: BuildRoomTaskDetail | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  executionState: ExecutionState | null;
  billingState: BillingProtectionState | null;
  codexRelayMode: BuildRoomRelayMode;
  workerTriggerMode: BuildRoomRelayMode;
  storageMessage?: string | null;
};

type BuildRoomDetailResponse = {
  ok: true;
  detail: BuildRoomTaskDetail;
};

function replaceTaskSummary(tasks: BuildRoomTask[], updatedTask: BuildRoomTask) {
  const nextTasks = tasks.some((task) => task.id === updatedTask.id)
    ? tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    : [updatedTask, ...tasks];

  return nextTasks.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function formatStatusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function statusBadgeClasses(status: string) {
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

function buildPromptPackageStatus(args: {
  selectedDetail: BuildRoomTaskDetail | null;
  packetRelationship: ReturnType<typeof getExecutionPacketRelationship>;
  pendingRelationship: ReturnType<typeof getPendingExecutionRelationship>;
}) {
  if (!args.selectedDetail) {
    return {
      label: "Not prepared",
      note: "Pick a saved Build Room task to review the internal execution package placeholder."
    };
  }

  if (args.pendingRelationship.isActivePending) {
    return {
      label: "Pending release",
      note:
        args.pendingRelationship.pendingItem?.latestReason ??
        "The task is still held as pending execution, so no released prompt package is attached yet."
    };
  }

  if (args.packetRelationship.packetSummary) {
    return {
      label: formatStatusLabel(args.packetRelationship.packetSummary.status),
      note: `Execution packet ${args.packetRelationship.packetSummary.packetId} is the current internal package reference.`
    };
  }

  return {
    label: "Placeholder only",
    note: "No released execution packet is linked yet. This section stays read-only until the existing packet flow produces one."
  };
}

function buildInternalExecutionPlanningItems(args: {
  neroaOneHandoff: BuildRoomHandoffPackage | null;
  promptPackageStatus: ReturnType<typeof buildPromptPackageStatus>;
  nextExecutionStep: string;
}) {
  if (!args.neroaOneHandoff) {
    return [
      {
        label: "Neroa One handoff",
        value: "No Neroa One handoff package yet.",
        note: "Build Room will show the typed handoff contract here after a customer workflow reaches execution."
      },
      {
        label: "Prompt package status",
        value: args.promptPackageStatus.label,
        note: args.promptPackageStatus.note
      }
    ];
  }

  return [
    {
      label: "Neroa One handoff",
      value: args.neroaOneHandoff.packageId,
      note: args.neroaOneHandoff.taskSummary
    },
    {
      label: "Customer intent type",
      value: formatStatusLabel(args.neroaOneHandoff.customerIntentType),
      note: "Preserved from the deterministic Neroa One handoff contract."
    },
    {
      label: "Command Center lane",
      value: formatStatusLabel(args.neroaOneHandoff.commandCenterLane),
      note: "This keeps the originating workflow lane attached to the execution handoff."
    },
    {
      label: "Normalized request",
      value: "Preserved",
      note: args.neroaOneHandoff.normalizedRequest
    },
    {
      label: "Execution task type",
      value: args.neroaOneHandoff.executionTaskType
        ? formatStatusLabel(args.neroaOneHandoff.executionTaskType)
        : "Not provided",
      note: args.neroaOneHandoff.taskTitle
    },
    {
      label: "Requested output mode",
      value: args.neroaOneHandoff.requestedOutputMode
        ? formatStatusLabel(args.neroaOneHandoff.requestedOutputMode)
        : "Not provided",
      note: "This stays read-only and follows the handed-off Build Room task record."
    },
    {
      label: "Risk level",
      value: args.neroaOneHandoff.riskLevel
        ? formatStatusLabel(args.neroaOneHandoff.riskLevel)
        : "Not provided",
      note: "Risk stays read-only here and follows the existing Build Room task record."
    },
    {
      label: "Acceptance criteria",
      value: args.neroaOneHandoff.acceptanceCriteria ? "Provided" : "Not provided",
      note:
        args.neroaOneHandoff.acceptanceCriteria ??
        "No acceptance criteria were saved for this handoff yet."
    },
    {
      label: "Readiness / blockers",
      value: formatStatusLabel(args.neroaOneHandoff.readinessStatus),
      note:
        args.neroaOneHandoff.blockers.length > 0
          ? args.neroaOneHandoff.blockers.join(" ")
          : args.neroaOneHandoff.decisionGate.reason
    },
    {
      label: "Next execution step",
      value: args.nextExecutionStep,
      note: "This is a read-only planning cue. Worker approval and execution behavior remain unchanged."
    },
    {
      label: "Prompt package status",
      value: args.promptPackageStatus.label,
      note: args.promptPackageStatus.note
    }
  ];
}

function billingStatusBadgeClasses(status: string) {
  if (/billable/i.test(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (/review/i.test(status) || /block auto retry/i.test(status)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (/retry/i.test(status) || /deferred/i.test(status)) {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  return "border-slate-200 bg-white text-slate-600";
}

function relayModeLabel(mode: BuildRoomRelayMode) {
  return mode === "real" ? "Real relay" : "Mock relay";
}

function relayModeDescription(mode: BuildRoomRelayMode) {
  return mode === "real"
    ? "OPENAI_API_KEY is available, so Build Room can use the live Codex cloud relay."
    : "OPENAI_API_KEY is missing or relay mode is forced to mock, so Build Room is using a safe fallback.";
}

function workerModeLabel(mode: BuildRoomRelayMode) {
  return mode === "real" ? "Real worker" : "Mock dry run";
}

function workerModeDescription(mode: BuildRoomRelayMode) {
  return mode === "real"
    ? "Approved tasks can reach the configured worker endpoint."
    : "Approval records the packet, logs, and result flow without contacting the Droplet.";
}

function artifactPreview(artifacts: BuildRoomArtifact[]) {
  return artifacts.filter(
    (artifact) => artifact.artifactType === "worker_result" || artifact.artifactType === "worker_log"
  );
}

type BuildRoomZoneProps = {
  title: string;
  description: string;
  children: ReactNode;
  badge?: string;
};

function BuildRoomZone({ title, description, children, badge }: BuildRoomZoneProps) {
  return (
    <section className="floating-plane rounded-[34px] p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            {title}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
        </div>
        {badge ? (
          <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function latestWorkerRun(runs: BuildRoomRun[]) {
  return runs.find((run) => run.runType === "worker") ?? null;
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

export function BuildRoomControlRoom({
  workspaceId,
  project,
  accessMode,
  initialTasks,
  initialTaskDetail,
  projectBrief,
  architectureBlueprint,
  roadmapPlan,
  governancePolicy,
  executionState,
  billingState,
  codexRelayMode,
  workerTriggerMode,
  storageMessage = null
}: BuildRoomControlRoomProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialTaskDetail?.task.id ?? initialTasks[0]?.id ?? null
  );
  const [selectedDetail, setSelectedDetail] = useState<BuildRoomTaskDetail | null>(initialTaskDetail);
  const [pendingAction, setPendingAction] = useState<"approve" | "refresh" | "revise" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(
    storageMessage
      ? `${storageMessage} Apply the latest schema before using the live Build Room flow.`
      : null
  );

  const selectedCodexResult = selectedDetail?.task.codexResponsePayload ?? null;
  const activeCodexRelayMode = selectedCodexResult?.relayMode ?? codexRelayMode;
  const selectedWorkerRun = selectedDetail ? latestWorkerRun(selectedDetail.runs) : null;
  const executionArtifacts = selectedDetail ? artifactPreview(selectedDetail.artifacts) : [];
  const executionSummary = buildExecutionStateSummary(executionState);
  const packetRelationship = getExecutionPacketRelationship({
    executionState,
    buildRoomTaskId: selectedDetail?.task.id ?? null
  });
  const pendingRelationship = getPendingExecutionRelationship({
    executionState,
    buildRoomTaskId: selectedDetail?.task.id ?? null
  });
  const selectedBillingContext = selectedDetail
    ? buildTaskBillingProtectionContext({
        workspaceId,
        projectId: project.id,
        projectName: project.title,
        executionState,
        billingState,
        taskDetail: selectedDetail,
        projectBrief,
        architectureBlueprint,
        roadmapPlan,
        governancePolicy
      })
    : null;
  const selectedQaContext = selectedDetail
    ? buildTaskQAValidationContext({
        workspaceId,
        projectId: project.id,
        projectName: project.title,
        executionState,
        taskDetail: selectedDetail,
        projectBrief,
        architectureBlueprint,
        roadmapPlan,
        governancePolicy
      })
    : null;
  const selectedQaValidation = selectedQaContext?.qaValidation ?? null;
  const qaSummary = selectedQaContext
    ? buildQAValidationSummary(selectedQaContext.qaValidation)
    : null;
  const promptPackageStatus = buildPromptPackageStatus({
    selectedDetail,
    packetRelationship,
    pendingRelationship
  });
  const neroaOneHandoff = buildBuildRoomTaskHandoffPackage({
    workspaceId,
    projectId: project.id,
    projectTitle: project.title,
    taskDetail: selectedDetail,
    isPendingExecution: pendingRelationship.isActivePending,
    pendingReason: pendingRelationship.pendingItem?.latestReason ?? null
  });
  const selectedBillingState =
    selectedBillingContext?.billingState ?? billingState ?? null;
  const billingSummary = selectedBillingState
    ? buildBillingProtectionSummaryFromState(selectedBillingState)
    : null;
  const workerBlockedByBlockers = (selectedCodexResult?.blockers.length ?? 0) > 0;
  const workerModeIsMock = workerTriggerMode === "mock";
  const canApproveWorker =
    accessMode === "owner" &&
    selectedDetail?.task.status === "codex_complete" &&
    !workerBlockedByBlockers &&
    !storageMessage;
  const nextExecutionStep = !selectedDetail
    ? "No approved build handoff yet. Start from Command Center."
    : selectedDetail.task.status === "needs_revision"
      ? "Revise the request in Command Center, then resend it through the current relay."
      : canApproveWorker
        ? "Review the guarded output and approve the worker only when the packet is ready."
        : workerBlockedByBlockers
          ? "Resolve the Codex blockers before any worker approval is allowed."
          : selectedDetail.task.status === "approved_for_worker" ||
              selectedDetail.task.status === "worker_running"
            ? "Wait for the worker result, then review QA and evidence."
            : selectedDetail.task.status === "worker_complete"
              ? "Review the recorded evidence, QA, and billing protections before closing out the task."
              : "Refresh the governed task state and keep the packet aligned before the next step.";
  const internalExecutionPlanningItems = buildInternalExecutionPlanningItems({
    neroaOneHandoff,
    promptPackageStatus,
    nextExecutionStep
  });
  const qaPlaceholderItems = [
    "Future browser inspection",
    "Future visual inspector",
    "Future QC inspector",
    "Future video recorder"
  ];
  const usagePlaceholderItems = [
    "Future credits",
    "Future model level",
    "Future run limits"
  ];

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
        setErrorMessage(error instanceof Error ? error.message : "Unable to refresh the task.");
      }
    } finally {
      if (!quiet) {
        setPendingAction(null);
      }
    }
  }

  async function handleApproveWorker() {
    if (!selectedDetail || !canApproveWorker) {
      return;
    }

    setPendingAction("approve");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const response = await requestBuildRoomJson<BuildRoomDetailResponse>(
        `/api/build-room/tasks/${selectedDetail.task.id}/approve-worker`,
        {
          method: "POST"
        }
      );

      setSelectedDetail(response.detail);
      setTasks((current) => replaceTaskSummary(current, response.detail.task));
      setNoticeMessage(
        response.detail.task.status === "worker_complete" && workerModeIsMock
          ? "Mock worker dry run completed. The approval, packet, and result flow were recorded without remote execution."
          : response.detail.task.status === "worker_complete"
            ? "Worker flow completed and the execution result was recorded."
          : "Worker approval recorded. Build Room is now waiting on the worker result."
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to approve the worker run.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRejectAndRevise() {
    if (!selectedDetail || storageMessage) {
      return;
    }

    setPendingAction("revise");
    setErrorMessage(null);

    try {
      const response = await requestBuildRoomJson<BuildRoomDetailResponse>(
        `/api/build-room/tasks/${selectedDetail.task.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "needs_revision",
            approvedForExecution: false,
            revisionNotes:
              "Returned to revision. Tighten the request, acceptance criteria, or risks before resubmitting."
          })
        }
      );

      setSelectedDetail(response.detail);
      setSelectedTaskId(response.detail.task.id);
      setTasks((current) => replaceTaskSummary(current, response.detail.task));
      setNoticeMessage(
        "The task is back in revision mode. Use Command Center to update the request before the next relay pass."
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to move the task into revision.");
    } finally {
      setPendingAction(null);
    }
  }

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    setSelectedDetail(initialTaskDetail);
    setSelectedTaskId(initialTaskDetail?.task.id ?? initialTasks[0]?.id ?? null);
  }, [initialTaskDetail, initialTasks]);

  useEffect(() => {
    if (!selectedTaskId || storageMessage) {
      return;
    }

    if (!selectedDetail || selectedDetail.task.id !== selectedTaskId) {
      void refreshTask(selectedTaskId, true);
    }
  }, [selectedDetail, selectedTaskId, storageMessage]);

  useEffect(() => {
    if (!selectedDetail) {
      return;
    }

    const shouldPoll =
      selectedDetail.task.status === "codex_running" ||
      selectedDetail.task.status === "worker_running" ||
      selectedDetail.task.status === "approved_for_worker" ||
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
    <section className="surface-main relative overflow-visible rounded-[42px] p-5 xl:p-6 2xl:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[42px]">
        <div className="floating-wash rounded-[42px]" />
      </div>

      <div className="relative space-y-4">
        <section className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="floating-plane rounded-[34px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Build Room Internal Surface
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Organize governed execution work in one internal room.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Command Center owns the customer workflow. Build Room stays focused on internal
                planning, guarded execution, QA, evidence, and usage controls.
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  "Execution Planning keeps the task brief, requested outcome, blockers, and prompt package readiness together.",
                  "Build Execution keeps the relay state, worker state, approval gate, and next step together.",
                  "QA, evidence, and usage controls stay visible without changing relay or worker behavior."
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4 text-sm leading-7 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="floating-plane rounded-[34px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Build Handoff Summary
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Command Center owns request entry
                  </p>
                  <p className="mt-3 text-sm leading-7 text-cyan-800">
                    Build Room shows the handed-off execution work only. New requests, revisions,
                    roadmap updates, decisions, and review notes stay in Command Center.
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200/70 bg-white/78 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Shared execution state
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {executionSummary.pendingCount > 0
                      ? `${executionSummary.pendingCount} pending execution request${
                          executionSummary.pendingCount === 1 ? "" : "s"
                        } are still waiting on approval or revision clearance.`
                      : "No pending execution requests are waiting right now."}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Build Room reads the same execution packet and pending-release state that
                    Command Center uses for governed intake decisions.
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200/70 bg-white/78 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Internal-only boundary
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Build Room no longer acts as the primary request entry. Command Center creates
                    and sends the task; Build Room keeps the governed packet, result, approval, and
                    evidence history in one place.
                  </p>
                </div>
              </div>
            </div>

            <div className="floating-plane rounded-[34px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Build Handoffs
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Build Room keeps the handed-off execution work for this project so planning,
                    approvals, and evidence stay visible in one internal room.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                  {tasks.length}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {tasks.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-sm leading-7 text-slate-500">
                    No approved build handoff yet. Start from Command Center.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        if (!selectedDetail || selectedDetail.task.id !== task.id) {
                          void refreshTask(task.id, true);
                        }
                      }}
                      className={`rounded-[24px] border px-4 py-4 text-left transition ${
                        selectedTaskId === task.id
                          ? "border-slate-950 bg-slate-950 text-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]"
                          : "border-slate-200/70 bg-white/80 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/65"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{task.title}</p>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                            selectedTaskId === task.id
                              ? "border-white/20 bg-white/10 text-white"
                              : statusBadgeClasses(task.status)
                          }`}
                        >
                          {formatStatusLabel(task.status)}
                        </span>
                      </div>
                      <p
                        className={`mt-3 text-sm leading-7 ${
                          selectedTaskId === task.id ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {task.userRequest.length > 140
                          ? `${task.userRequest.slice(0, 140).trim()}...`
                          : task.userRequest}
                      </p>
                      <div
                        className={`mt-4 flex flex-wrap items-center gap-2 text-xs ${
                          selectedTaskId === task.id ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        <span>{formatStatusLabel(task.taskType)}</span>
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
            {errorMessage ? (
              <div className="rounded-[26px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            {noticeMessage ? (
              <div className="rounded-[26px] border border-cyan-200 bg-cyan-50 px-4 py-4 text-sm text-cyan-700">
                {noticeMessage}
              </div>
            ) : null}

            {selectedDetail ? (
              <>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="floating-plane rounded-[34px] p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {formatStatusLabel(selectedDetail.task.taskType)}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusBadgeClasses(
                          selectedDetail.task.status
                        )}`}
                      >
                        {formatStatusLabel(selectedDetail.task.status)}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Risk {formatStatusLabel(selectedDetail.task.riskLevel)}
                      </span>
                    </div>

                    <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
                      {selectedDetail.task.title}
                    </h2>
                    <p className="mt-4 text-sm leading-8 text-slate-600">
                      {selectedDetail.task.userRequest}
                    </p>

                    {selectedDetail.task.acceptanceCriteria ? (
                      <div className="mt-6 rounded-[26px] border border-slate-200/70 bg-white/74 px-5 py-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Requested Outcome
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {selectedDetail.task.acceptanceCriteria}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-6 rounded-[26px] border border-slate-200/70 bg-white/74 px-5 py-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                            Execution Planning
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            Build Room keeps the internal execution package view here so the task
                            intent, requested outcome, blockers, and prompt package status stay in
                            one place.
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            This does not change worker behavior, relay behavior, or
                            customer-facing intake. This is a read-only planning cue. Worker
                            approval and execution behavior remain unchanged.
                          </p>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Internal only
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 lg:grid-cols-2">
                        {internalExecutionPlanningItems.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[22px] border border-slate-200/70 bg-white/82 px-4 py-4"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-3 text-sm font-semibold text-slate-950">{item.value}</p>
                            <p className="mt-2 text-xs leading-6 text-slate-500">{item.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="floating-plane rounded-[34px] p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                        Build Execution
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Relay state, worker state, guarded approvals, and the next execution step
                        stay together here.
                      </p>
                      <div className="mt-5 grid gap-3">
                        {[
                          {
                            label: "Run status",
                            value: formatStatusLabel(selectedDetail.task.status)
                          },
                          {
                            label: "Requested mode",
                            value: formatStatusLabel(selectedDetail.task.requestedOutputMode)
                          },
                          {
                            label: "Codex relay state",
                            value: relayModeLabel(activeCodexRelayMode),
                            note: relayModeDescription(activeCodexRelayMode)
                          },
                          {
                            label: "Worker state",
                            value: workerModeLabel(workerTriggerMode),
                            note: workerModeDescription(workerTriggerMode)
                          },
                          {
                            label: "Approval gate",
                            value: selectedDetail.task.approvedForExecution ? "Approved" : "Awaiting approval"
                          },
                          {
                            label: "Worker run",
                            value: formatStatusLabel(selectedDetail.task.workerRunStatus)
                          },
                          {
                            label: "Execution packet",
                            value: pendingRelationship.isActivePending
                              ? "Pending execution"
                              : packetRelationship.packetSummary
                                ? formatStatusLabel(packetRelationship.packetSummary.status)
                                : "No packet linked yet",
                            note: pendingRelationship.isActivePending
                              ? pendingRelationship.pendingItem?.latestReason ??
                                "This request is still saved as pending execution."
                              : packetRelationship.packetSummary
                                ? `Scope ${formatStatusLabel(packetRelationship.packetSummary.scopeOutcome)} across ${packetRelationship.packetSummary.laneIds.join(", ") || "shared lanes"}.`
                                : "The task exists in Build Room, but no released execution packet is linked yet."
                          },
                          {
                            label: "Next execution step",
                            value: nextExecutionStep
                          }
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-3 text-sm font-semibold text-slate-950">{item.value}</p>
                            {"note" in item && item.note ? (
                              <p className="mt-2 text-xs leading-6 text-slate-500">{item.note}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 border-t border-slate-200/70 pt-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Approval gate
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          Codex output never triggers the worker on its own. Approval is a separate
                          governed action.
                        </p>
                        {workerModeIsMock ? (
                          <p className="mt-3 text-xs leading-6 text-amber-700">
                            Worker mode is currently mock. Approving this task records a governed
                            dry run only and does not contact the Droplet.
                          </p>
                        ) : null}
                        <div className="mt-5 flex flex-col gap-3">
                          <button
                            type="button"
                            className="button-primary"
                            onClick={() => void handleApproveWorker()}
                            disabled={!canApproveWorker || pendingAction !== null}
                          >
                            {pendingAction === "approve" ? "Approving..." : "Approve for Worker Run"}
                          </button>
                          <button
                            type="button"
                            className="button-secondary"
                            onClick={() => void handleRejectAndRevise()}
                            disabled={!selectedCodexResult || pendingAction !== null || Boolean(storageMessage)}
                          >
                            Reject / Revise
                          </button>
                          <button
                            type="button"
                            className="button-quiet justify-center rounded-full border border-slate-200 bg-white/82 px-4 py-3 text-sm font-medium text-slate-600 transition hover:text-slate-950"
                            onClick={() => {
                              if (selectedDetail) {
                                void refreshTask(selectedDetail.task.id);
                              }
                            }}
                            disabled={pendingAction !== null}
                          >
                            {pendingAction === "refresh" ? "Refreshing..." : "Refresh Status"}
                          </button>
                        </div>
                        {accessMode !== "owner" ? (
                          <p className="mt-4 text-xs leading-6 text-amber-700">
                            Only the workspace owner can approve a worker run.
                          </p>
                        ) : null}
                        {workerBlockedByBlockers ? (
                          <p className="mt-4 text-xs leading-6 text-amber-700">
                            Codex returned blockers. Move the task back to revision before you approve
                            execution.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="floating-plane rounded-[34px] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                            QA / QC
                          </p>
                          <p className="mt-3 text-lg font-semibold text-slate-950">
                            {qaSummary?.headline ?? "QA validation will appear after packet generation."}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            {selectedQaContext
                              ? selectedQaContext.qaValidation.completionReadiness.reason
                              : "Build Room now keeps run state separate from acceptance state. A finished run is not treated as accepted until the shared QA gate says it is release-ready."}
                          </p>
                        </div>
                        {qaSummary ? (
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                              qaSummary.canPresentAsComplete
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : qaSummary.status === "awaiting_review"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : qaSummary.status === "awaiting_artifacts"
                                    ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                                    : "border-slate-200 bg-white/82 text-slate-600"
                            }`}
                          >
                            {qaSummary.completionLabel}
                          </span>
                        ) : null}
                      </div>
                      {qaSummary && selectedQaValidation ? (
                        <>
                          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            <span className="rounded-full border border-slate-200 bg-white/82 px-2.5 py-1">
                              {qaSummary.artifactProgressLabel}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white/82 px-2.5 py-1">
                              {qaSummary.criterionProgressLabel}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white/82 px-2.5 py-1">
                              {qaSummary.releaseLabel}
                            </span>
                            {qaSummary.needsHumanReview ? (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">
                                Human review required
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Blocking now
                              </p>
                              <ul className="mt-3 space-y-1 text-sm leading-7 text-slate-600">
                                {selectedQaValidation.blockers.length > 0 ? (
                                  selectedQaValidation.blockers.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))
                                ) : (
                                  <li>No QA blockers are open right now.</li>
                                )}
                              </ul>
                            </div>

                            <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Artifact requirements
                              </p>
                              <ul className="mt-3 space-y-1 text-sm leading-7 text-slate-600">
                                {selectedQaValidation.artifactRequirements.map((requirement) => {
                                  const satisfied = selectedQaValidation.artifacts.some(
                                    (artifact) => artifact.kind === requirement.kind
                                  );

                                  return (
                                    <li key={requirement.id}>
                                      {requirement.label}: {satisfied ? "Attached" : "Missing"}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </>
                      ) : null}

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {qaPlaceholderItems.map((item) => (
                          <div
                            key={item}
                            className="rounded-[22px] border border-dashed border-slate-200 bg-white/78 px-4 py-4"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Placeholder
                            </p>
                            <p className="mt-3 text-sm font-semibold text-slate-950">{item}</p>
                            <p className="mt-2 text-xs leading-6 text-slate-500">
                              Reserved for a later internal-only browser or QC wiring phase.
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="floating-plane rounded-[34px] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                            Usage / Controls
                          </p>
                          <p className="mt-3 text-lg font-semibold text-slate-950">
                            {billingSummary?.headline ??
                              "Billing protection will appear after the governed execution state is classified."}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            {selectedBillingState
                              ? selectedBillingState.latestChargeabilityDecision.reason
                              : "Run completion and chargeability are separate decisions. Neroa protects blocked, retried, and unaccepted work from becoming billable."}
                          </p>
                        </div>
                        {billingSummary ? (
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${billingStatusBadgeClasses(
                              billingSummary.statusLabel
                            )}`}
                          >
                            {billingSummary.statusLabel}
                          </span>
                        ) : null}
                      </div>
                      {selectedBillingState && billingSummary ? (
                        <>
                          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            <span className="rounded-full border border-slate-200 bg-white/82 px-2.5 py-1">
                              {billingSummary.chargeabilityLabel}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white/82 px-2.5 py-1">
                              {billingSummary.retryLabel}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white/82 px-2.5 py-1">
                              {billingSummary.guardrailLabel}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white/82 px-2.5 py-1">
                              {billingSummary.totalsLabel}
                            </span>
                          </div>

                          <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Blocking now
                              </p>
                              <ul className="mt-3 space-y-1 text-sm leading-7 text-slate-600">
                                {billingSummary.blockerLabels.length > 0 ? (
                                  billingSummary.blockerLabels.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))
                                ) : (
                                  <li>No billing-protection blockers are open right now.</li>
                                )}
                              </ul>
                            </div>

                            <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Current ledger state
                              </p>
                              <ul className="mt-3 space-y-1 text-sm leading-7 text-slate-600">
                                <li>
                                  Latest classification:{" "}
                                  {formatStatusLabel(
                                    selectedBillingState.latestChargeabilityDecision.classification
                                  )}
                                </li>
                                <li>
                                  Latest failure class:{" "}
                                  {selectedBillingState.latestFailureClassification
                                    ? formatStatusLabel(
                                        selectedBillingState.latestFailureClassification.class
                                      )
                                    : "None"}
                                </li>
                                <li>
                                  Recorded charge events:{" "}
                                  {selectedBillingState.chargeEvents.length}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </>
                      ) : null}

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {usagePlaceholderItems.map((item) => (
                          <div
                            key={item}
                            className="rounded-[22px] border border-dashed border-slate-200 bg-white/78 px-4 py-4"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Placeholder
                            </p>
                            <p className="mt-3 text-sm font-semibold text-slate-950">{item}</p>
                            <p className="mt-2 text-xs leading-6 text-slate-500">
                              Reserved for a later internal-only control pass.
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="floating-plane rounded-[34px] p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                        Evidence Snapshot
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Keep the latest run summary and recorded identifiers close to the detailed
                        evidence below.
                      </p>
                      <div className="mt-5 grid gap-3">
                        <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Last updated
                          </p>
                          <p className="mt-3 text-sm font-semibold text-slate-950">
                            {formatTimestamp(selectedDetail.task.updatedAt)}
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Worker job id
                          </p>
                          <p className="mt-3 break-all text-sm font-semibold text-slate-950">
                            {selectedWorkerRun?.externalJobId ?? "No worker job recorded yet"}
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Last run outcome
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            {selectedWorkerRun?.logExcerpt ??
                              selectedCodexResult?.summary ??
                              "Build Room has not recorded a relay or worker result yet."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="floating-plane rounded-[34px] p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Evidence / Results
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Generated output, logs, history, and stored artifacts stay grouped here for
                    internal review.
                  </p>
                  {selectedCodexResult ? (
                    <div className="mt-5 grid gap-4">
                      <div className="rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5">
                        <p className="text-sm font-semibold text-slate-950">Summary</p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {selectedCodexResult.summary}
                        </p>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5">
                          <p className="text-sm font-semibold text-slate-950">Implementation plan</p>
                          <div className="mt-4 grid gap-3">
                            {selectedCodexResult.implementationPlan.length > 0 ? (
                              selectedCodexResult.implementationPlan.map((item, index) => (
                                <div
                                  key={`${index}-${item}`}
                                  className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-4 text-sm leading-7 text-slate-600"
                                >
                                  <span className="mr-2 font-semibold text-slate-950">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                  {item}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm leading-7 text-slate-500">
                                No implementation plan items were returned.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <div className="rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5">
                            <p className="text-sm font-semibold text-slate-950">Suggested file targets</p>
                            <div className="mt-4 grid gap-3">
                              {selectedCodexResult.suggestedFileTargets.length > 0 ? (
                                selectedCodexResult.suggestedFileTargets.map((item) => (
                                  <div
                                    key={`${item.path}-${item.reason}`}
                                    className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-4"
                                  >
                                    <p className="text-sm font-semibold text-slate-950">{item.path}</p>
                                    <p className="mt-2 text-xs leading-6 text-slate-500">{item.reason}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm leading-7 text-slate-500">
                                  No concrete file targets were returned for this pass.
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-[26px] border border-slate-200/70 bg-white/78 px-5 py-5">
                            <p className="text-sm font-semibold text-slate-950">Warnings / blockers</p>
                            <div className="mt-4 grid gap-3">
                              {selectedCodexResult.warnings.map((item) => (
                                <div
                                  key={`warning-${item}`}
                                  className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-700"
                                >
                                  {item}
                                </div>
                              ))}
                              {selectedCodexResult.blockers.map((item) => (
                                <div
                                  key={`blocker-${item}`}
                                  className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-7 text-rose-700"
                                >
                                  {item}
                                </div>
                              ))}
                              {selectedCodexResult.warnings.length === 0 &&
                              selectedCodexResult.blockers.length === 0 ? (
                                <p className="text-sm leading-7 text-slate-500">
                                  No warnings or blockers were returned.
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedCodexResult.patchText ? (
                        <div className="rounded-[26px] border border-slate-200/70 bg-slate-950 px-5 py-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                            Patch / Diff Text
                          </p>
                          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-slate-100">
                            {selectedCodexResult.patchText}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[26px] border border-dashed border-slate-200 bg-white/74 px-5 py-6 text-sm leading-7 text-slate-500">
                      Send a saved task to Codex to populate the result panel with summary, plan,
                      file-target hints, and any warnings or blockers.
                    </div>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="floating-plane rounded-[34px] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                      Conversation Log
                    </p>
                    <div className="mt-5 grid gap-3">
                      {selectedDetail.messages.length > 0 ? (
                        selectedDetail.messages.map((message) => (
                          <div
                            key={message.id}
                            className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-950">
                                {formatStatusLabel(message.role)}
                              </p>
                              <span className="text-xs text-slate-500">
                                {formatTimestamp(message.createdAt)}
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{message.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-7 text-slate-500">
                          No task messages have been recorded yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="floating-plane rounded-[34px] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                      Execution History
                    </p>
                    <div className="mt-5 grid gap-3">
                      {selectedDetail.runs.length > 0 ? (
                        selectedDetail.runs.map((run) => (
                          <details
                            key={run.id}
                            className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4"
                          >
                            <summary className="cursor-pointer list-none">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-slate-950">
                                    {formatStatusLabel(run.runType)} run
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">{run.provider}</p>
                                </div>
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusBadgeClasses(
                                    run.status
                                  )}`}
                                >
                                  {formatStatusLabel(run.status)}
                                </span>
                              </div>
                            </summary>
                            <div className="mt-4 space-y-3 border-t border-slate-200/70 pt-4 text-sm leading-7 text-slate-600">
                              <p>
                                <span className="font-semibold text-slate-950">Started:</span>{" "}
                                {formatTimestamp(run.startedAt ?? run.createdAt)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-950">Completed:</span>{" "}
                                {formatTimestamp(run.completedAt)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-950">External job id:</span>{" "}
                                {run.externalJobId ?? "Not attached"}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-950">Excerpt:</span>{" "}
                                {run.logExcerpt ?? "No excerpt recorded"}
                              </p>
                            </div>
                          </details>
                        ))
                      ) : (
                        <p className="text-sm leading-7 text-slate-500">
                          No Build Room runs have been recorded yet.
                        </p>
                      )}
                    </div>

                    <details className="mt-5 rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
                        Stored worker artifacts
                      </summary>
                      <div className="mt-4 grid gap-3">
                        {executionArtifacts.length > 0 ? (
                          executionArtifacts.map((artifact) => (
                            <div
                              key={artifact.id}
                              className="rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-4"
                            >
                              <p className="text-sm font-semibold text-slate-950">{artifact.title}</p>
                              <p className="mt-2 text-xs text-slate-500">
                                {formatStatusLabel(artifact.artifactType)} &middot; {formatTimestamp(artifact.createdAt)}
                              </p>
                              {artifact.textContent ? (
                                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-600">
                                  {artifact.textContent}
                                </pre>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm leading-7 text-slate-500">
                            {workerModeIsMock
                              ? "Worker dry-run metadata will appear here after approval."
                              : "Worker result metadata will appear here after approval and execution."}
                          </p>
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid gap-4">
                <BuildRoomZone
                  title="Execution Planning"
                  description="Pick a saved task to load the internal execution brief, requested outcome, blockers, and prompt package readiness."
                  badge="Internal only"
                >
                  <div className="grid gap-3 lg:grid-cols-2">
                    {internalExecutionPlanningItems.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[22px] border border-dashed border-slate-200 bg-white/74 px-4 py-4"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-slate-950">{item.value}</p>
                        <p className="mt-2 text-xs leading-6 text-slate-500">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </BuildRoomZone>

                <div className="grid gap-4 xl:grid-cols-2">
                  <BuildRoomZone
                    title="Build Execution"
                    description="Pick a saved task to inspect relay state, worker state, and the next governed step."
                  >
                    <div className="rounded-[26px] border border-dashed border-slate-200 bg-white/74 px-5 py-6 text-sm leading-7 text-slate-500">
                      No approved build handoff yet. Start from Command Center.
                    </div>
                  </BuildRoomZone>

                  <BuildRoomZone
                    title="QA / QC"
                    description="Acceptance, artifact readiness, and future inspection placeholders will appear here after a task is selected."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {qaPlaceholderItems.map((item) => (
                        <div
                          key={item}
                          className="rounded-[22px] border border-dashed border-slate-200 bg-white/74 px-4 py-4"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Placeholder
                          </p>
                          <p className="mt-3 text-sm font-semibold text-slate-950">{item}</p>
                        </div>
                      ))}
                    </div>
                  </BuildRoomZone>
                </div>

                <BuildRoomZone
                  title="Evidence / Results"
                  description="Generated output, logs, execution history, and stored artifacts will appear together here once a task is selected."
                >
                  <div className="rounded-[26px] border border-dashed border-slate-200 bg-white/74 px-5 py-6 text-sm leading-7 text-slate-500">
                    No approved build handoff yet. Start from Command Center.
                  </div>
                </BuildRoomZone>

                <BuildRoomZone
                  title="Usage / Controls"
                  description="Billing protection lives here, with future placeholders for credits, model level, and run limits."
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    {usagePlaceholderItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-[22px] border border-dashed border-slate-200 bg-white/74 px-4 py-4"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Placeholder
                        </p>
                        <p className="mt-3 text-sm font-semibold text-slate-950">{item}</p>
                      </div>
                    ))}
                  </div>
                </BuildRoomZone>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
