"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  BuildRoomOutputMode,
  BuildRoomRelayMode,
  BuildRoomRiskLevel,
  BuildRoomTaskInput,
  BuildRoomTaskType
} from "@/lib/build-room/contracts";
import type { BuildRoomArtifact, BuildRoomRun, BuildRoomTask, BuildRoomTaskDetail } from "@/lib/build-room/types";
import {
  buildExecutionStateSummary,
  getExecutionPacketRelationship,
  getPendingExecutionRelationship,
  type ExecutionState
} from "@/lib/intelligence/execution";
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
import { buildProjectCommandCenterRoute } from "@/lib/portal/routes";
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

type BuildRoomTasksResponse = {
  ok: true;
  tasks: BuildRoomTask[];
};

type BuildRoomComposerState = {
  taskId: string | null;
  title: string;
  taskType: BuildRoomTaskType;
  requestedOutputMode: BuildRoomOutputMode;
  laneSlug: string | null;
  userRequest: string;
  acceptanceCriteria: string;
  riskLevel: BuildRoomRiskLevel;
};

const buildRoomTaskTypeOptions: Array<{ value: BuildRoomTaskType; label: string; description: string }> = [
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

const buildRoomOutputModeOptions: Array<{
  value: BuildRoomOutputMode;
  label: string;
  description: string;
}> = [
  {
    value: "plan_only",
    label: "Plan only",
    description: "Return scope, sequencing, risks, and next actions."
  },
  {
    value: "patch_proposal",
    label: "Patch proposal",
    description: "Return a plan plus candidate file targets or patch text if the relay can provide it."
  },
  {
    value: "implementation_guidance",
    label: "Guidance",
    description: "Return engineering guidance without an explicit patch proposal."
  }
];

const buildRoomRiskOptions: Array<{ value: BuildRoomRiskLevel; label: string; description: string }> = [
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

function createEmptyComposer(project: ProjectRecord): BuildRoomComposerState {
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

function createComposerFromTask(task: BuildRoomTask): BuildRoomComposerState {
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
  selectedDetail: BuildRoomTaskDetail | null;
  selectedCodexResult: NonNullable<BuildRoomTaskDetail["task"]["codexResponsePayload"]> | null;
  packetRelationship: ReturnType<typeof getExecutionPacketRelationship>;
  pendingRelationship: ReturnType<typeof getPendingExecutionRelationship>;
  qaSummary: ReturnType<typeof buildQAValidationSummary> | null;
}) {
  if (!args.selectedDetail) {
    return [
      {
        label: "Task intent",
        value: "No Build Room task selected",
        note: "Choose a stored task to inspect internal execution planning."
      },
      {
        label: "Prompt package status",
        value: "Placeholder only",
        note: "The current Build Room flow will attach packet and relay details here when a task is available."
      }
    ];
  }

  const promptPackage = buildPromptPackageStatus({
    selectedDetail: args.selectedDetail,
    packetRelationship: args.packetRelationship,
    pendingRelationship: args.pendingRelationship
  });
  const readinessNotes = [
    args.pendingRelationship.isActivePending
      ? "Pending execution hold is still active."
      : "No pending execution hold is active.",
    args.selectedCodexResult?.blockers.length
      ? `${args.selectedCodexResult.blockers.length} Codex blocker${
          args.selectedCodexResult.blockers.length === 1 ? "" : "s"
        } returned.`
      : "No Codex blockers are currently attached.",
    args.qaSummary ? args.qaSummary.releaseLabel : "QA validation has not attached yet."
  ];
  const nextExecutionStep = args.pendingRelationship.isActivePending
    ? "Clear the pending execution hold in the existing governed flow before worker approval."
    : args.selectedDetail.task.status === "codex_complete"
      ? "Review blockers, QA status, and packet detail, then decide whether to approve the worker run."
      : args.selectedDetail.task.status === "worker_complete"
        ? "Review worker output and QA validation before presenting the task as complete."
        : args.selectedDetail.task.status === "needs_revision"
          ? "Tighten the request, acceptance criteria, or risk notes before sending it back through the relay."
          : "Continue through the existing Build Room relay flow until a result or packet is available.";

  return [
    {
      label: "Task intent",
      value: formatStatusLabel(args.selectedDetail.task.taskType),
      note: args.selectedDetail.task.userRequest
    },
    {
      label: "Requested output mode",
      value: formatStatusLabel(args.selectedDetail.task.requestedOutputMode),
      note: args.selectedCodexResult
        ? `Current relay output mode: ${formatStatusLabel(args.selectedCodexResult.outputMode)}.`
        : "No relay result has been recorded yet."
    },
    {
      label: "Risk level",
      value: formatStatusLabel(args.selectedDetail.task.riskLevel),
      note: args.selectedDetail.task.status === "needs_revision"
        ? "This task is currently back in revision."
        : "Risk stays read-only here and follows the existing Build Room task record."
    },
    {
      label: "Acceptance criteria",
      value: args.selectedDetail.task.acceptanceCriteria ? "Provided" : "Not provided",
      note:
        args.selectedDetail.task.acceptanceCriteria ??
        "No acceptance criteria were saved for this task yet."
    },
    {
      label: "Readiness / blockers",
      value:
        args.selectedCodexResult?.blockers.length || args.pendingRelationship.isActivePending
          ? "Attention required"
          : "Ready for internal review",
      note: readinessNotes.join(" ")
    },
    {
      label: "Next execution step",
      value: nextExecutionStep,
      note: "This is a read-only planning cue. Worker approval and execution behavior remain unchanged."
    },
    {
      label: "Prompt package status",
      value: promptPackage.label,
      note: promptPackage.note
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
  const [composer, setComposer] = useState<BuildRoomComposerState>(() =>
    initialTaskDetail ? createComposerFromTask(initialTaskDetail.task) : createEmptyComposer(project)
  );
  const [pendingAction, setPendingAction] = useState<"save" | "send" | "approve" | "refresh" | null>(
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
  const internalExecutionPlanningItems = buildInternalExecutionPlanningItems({
    selectedDetail,
    selectedCodexResult,
    packetRelationship,
    pendingRelationship,
    qaSummary
  });
  const selectedBillingState =
    selectedBillingContext?.billingState ?? billingState ?? null;
  const billingSummary = selectedBillingState
    ? buildBillingProtectionSummaryFromState(selectedBillingState)
    : null;
  const workerBlockedByBlockers = (selectedCodexResult?.blockers.length ?? 0) > 0;
  const workerModeIsMock = workerTriggerMode === "mock";
  const intakeIsReadOnly = true;
  const commandCenterHref = buildProjectCommandCenterRoute(workspaceId);
  const canApproveWorker =
    accessMode === "owner" &&
    selectedDetail?.task.status === "codex_complete" &&
    !workerBlockedByBlockers &&
    !storageMessage;

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

  async function persistComposer(sendToCodex: boolean) {
    if (storageMessage) {
      return;
    }

    setPendingAction(sendToCodex ? "send" : "save");
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const payload: BuildRoomTaskInput = {
        workspaceId,
        projectId: project.id,
        laneSlug: composer.laneSlug,
        title: composer.title.trim(),
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
      const finalDetail = sendToCodex
        ? (
            await requestBuildRoomJson<BuildRoomDetailResponse>(
              `/api/build-room/tasks/${savedDetail.task.id}/submit-codex`,
              {
                method: "POST"
              }
            )
          ).detail
        : savedDetail;

      setSelectedTaskId(finalDetail.task.id);
      setSelectedDetail(finalDetail);
      setTasks((current) => replaceTaskSummary(current, finalDetail.task));
      setComposer(createComposerFromTask(finalDetail.task));
      setNoticeMessage(
        sendToCodex
          ? "Task sent through the Codex relay. Review the structured result before any worker approval."
          : "Draft saved in Build Room."
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save the task.");
    } finally {
      setPendingAction(null);
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

    setPendingAction("save");
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
      setComposer(createComposerFromTask(response.detail.task));
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
    if (selectedDetail) {
      setComposer(createComposerFromTask(selectedDetail.task));
      return;
    }

    setComposer(createEmptyComposer(project));
  }, [project, selectedDetail]);

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
                Build Room Execution Surface
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Review execution state. Approve guarded runs.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Command Center now owns the main request intake. Build Room stays focused on the
                lower-level execution surface: relay status, approval gating, worker history, and
                stored run artifacts.
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  "Command Center creates and submits Build Room tasks through the current backend relay.",
                  "Worker execution never auto-starts after generation.",
                  "Result, logs, artifacts, and approval state stay visible in one room."
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4 text-sm leading-7 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-slate-200/70 bg-white/78 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Codex relay
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {relayModeLabel(codexRelayMode)}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    {relayModeDescription(codexRelayMode)}
                  </p>
                </div>
                <div
                  className={`rounded-[22px] border px-4 py-4 ${
                    workerModeIsMock
                      ? "border-amber-200 bg-amber-50"
                      : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      workerModeIsMock ? "text-amber-700" : "text-emerald-700"
                    }`}
                  >
                    Worker execution
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {workerModeLabel(workerTriggerMode)}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-600">
                    {workerModeDescription(workerTriggerMode)}
                  </p>
                </div>
              </div>
            </div>

            <div className="floating-plane rounded-[34px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Execution Intake Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Command Center owns intake
                  </p>
                  <p className="mt-3 text-sm leading-7 text-cyan-800">
                    New execution requests should be typed and sent from Command Center. Build Room
                    now mirrors the selected task so this page can stay focused on execution detail.
                  </p>
                  <div className="mt-4">
                    <Link href={commandCenterHref} className="button-secondary text-sm">
                      Open Command Center Intake
                    </Link>
                  </div>
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

                <div>
                  <label htmlFor="build-room-title" className="mb-2 block text-sm font-semibold text-slate-950">
                    Task title
                  </label>
                  <input
                    id="build-room-title"
                    value={composer.title}
                    onChange={(event) =>
                      setComposer((current) => ({
                        ...current,
                        title: event.target.value
                      }))
                    }
                    className="input"
                    placeholder="Tighten the auth handoff for the Build Room worker trigger"
                    disabled={intakeIsReadOnly || Boolean(storageMessage)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="build-room-task-type" className="mb-2 block text-sm font-semibold text-slate-950">
                      Task type
                    </label>
                    <select
                      id="build-room-task-type"
                      value={composer.taskType}
                      onChange={(event) =>
                        setComposer((current) => ({
                          ...current,
                          taskType: event.target.value as BuildRoomTaskType
                        }))
                      }
                      className="input"
                      disabled={intakeIsReadOnly || Boolean(storageMessage)}
                    >
                      {buildRoomTaskTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {
                        buildRoomTaskTypeOptions.find((option) => option.value === composer.taskType)
                          ?.description
                      }
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="build-room-output-mode"
                      className="mb-2 block text-sm font-semibold text-slate-950"
                    >
                      Response mode
                    </label>
                    <select
                      id="build-room-output-mode"
                      value={composer.requestedOutputMode}
                      onChange={(event) =>
                        setComposer((current) => ({
                          ...current,
                          requestedOutputMode: event.target.value as BuildRoomOutputMode
                        }))
                      }
                      className="input"
                      disabled={intakeIsReadOnly || Boolean(storageMessage)}
                    >
                      {buildRoomOutputModeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {
                        buildRoomOutputModeOptions.find(
                          (option) => option.value === composer.requestedOutputMode
                        )?.description
                      }
                    </p>
                  </div>
                </div>

                {project.lanes.length > 0 ? (
                  <div>
                    <label
                      htmlFor="build-room-lane"
                      className="mb-2 block text-sm font-semibold text-slate-950"
                    >
                      Lane context
                    </label>
                    <select
                      id="build-room-lane"
                      value={composer.laneSlug ?? ""}
                      onChange={(event) =>
                        setComposer((current) => ({
                          ...current,
                          laneSlug: event.target.value || null
                        }))
                      }
                      className="input"
                      disabled={intakeIsReadOnly || Boolean(storageMessage)}
                    >
                      <option value="">No lane selected</option>
                      {project.lanes.map((lane) => (
                        <option key={lane.slug} value={lane.slug}>
                          {lane.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="build-room-user-request"
                    className="mb-2 block text-sm font-semibold text-slate-950"
                  >
                    Request snapshot from Command Center
                  </label>
                  <textarea
                    id="build-room-user-request"
                    value={composer.userRequest}
                    onChange={(event) =>
                      setComposer((current) => ({
                        ...current,
                        userRequest: event.target.value
                      }))
                    }
                    rows={7}
                    className="input min-h-[180px] resize-y"
                    placeholder="Describe the build task, current problem, constraints, and what success should look like."
                    disabled={intakeIsReadOnly || Boolean(storageMessage)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="build-room-acceptance"
                    className="mb-2 block text-sm font-semibold text-slate-950"
                  >
                    Requested outcome / acceptance criteria
                  </label>
                  <textarea
                    id="build-room-acceptance"
                    value={composer.acceptanceCriteria}
                    onChange={(event) =>
                      setComposer((current) => ({
                        ...current,
                        acceptanceCriteria: event.target.value
                      }))
                    }
                    rows={5}
                    className="input min-h-[140px] resize-y"
                    placeholder="List the conditions that need to be true before you would approve this task."
                    disabled={intakeIsReadOnly || Boolean(storageMessage)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="build-room-risk"
                    className="mb-2 block text-sm font-semibold text-slate-950"
                  >
                    Risk level
                  </label>
                  <select
                    id="build-room-risk"
                    value={composer.riskLevel}
                    onChange={(event) =>
                      setComposer((current) => ({
                        ...current,
                          riskLevel: event.target.value as BuildRoomRiskLevel
                        }))
                      }
                      className="input"
                      disabled={intakeIsReadOnly || Boolean(storageMessage)}
                    >
                      {buildRoomRiskOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    {buildRoomRiskOptions.find((option) => option.value === composer.riskLevel)?.description}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200/70 bg-white/78 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Generation boundary
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Build Room no longer acts as the primary request entry. Command Center creates
                    and sends the task; Build Room keeps the governed packet, result, and approval
                    history in one place.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={commandCenterHref} className="button-primary text-sm">
                    Start or Revise in Command Center
                  </Link>
                  <button
                    type="button"
                    className="button-secondary opacity-70"
                    onClick={() => void persistComposer(true)}
                    disabled
                  >
                    Intake moved to Command Center
                  </button>
                </div>
              </div>
            </div>

            <div className="floating-plane rounded-[34px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Saved Tasks
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Build Room keeps durable tasks for this project so the relay result, approvals,
                    and worker history stay visible.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                  {tasks.length}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {tasks.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-sm leading-7 text-slate-500">
                    No Build Room tasks are stored for this project yet. Start the first execution
                    request from Command Center.
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
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Internal Execution Planning
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            Build Room keeps the internal execution package view here. This does not
                            change worker behavior, relay behavior, or customer-facing intake.
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
                        Response / Status
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
                            label: "Codex relay",
                            value: relayModeLabel(activeCodexRelayMode),
                            note: relayModeDescription(activeCodexRelayMode)
                          },
                          {
                            label: "Worker mode",
                            value: workerModeLabel(workerTriggerMode),
                            note: workerModeDescription(workerTriggerMode)
                          },
                          {
                            label: "Worker gate",
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
                            label: "QA / release",
                            value: qaSummary
                              ? qaSummary.completionLabel
                              : "Awaiting QA validation",
                            note: qaSummary
                              ? `${qaSummary.artifactProgressLabel}. ${qaSummary.criterionProgressLabel}. ${qaSummary.releaseLabel}.`
                              : "Run-complete and accepted are separate states. Shared QA validation decides when this task can be presented as complete."
                          },
                          {
                            label: "Billing / protection",
                            value: billingSummary
                              ? billingSummary.statusLabel
                              : "Awaiting billing classification",
                            note: billingSummary
                              ? `${billingSummary.chargeabilityLabel}. ${billingSummary.retryLabel}. ${billingSummary.guardrailLabel}.`
                              : "Approved, in-scope, release-ready work is the only work that can become billable."
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
                          Execution gate
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
                            QA / acceptance gate
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
                    </div>

                    <div className="floating-plane rounded-[34px] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                            Billing / protection
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
                    </div>

                    <div className="floating-plane rounded-[34px] p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                        Execution log / results
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
                    Result Panel
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
                <div className="floating-plane rounded-[34px] p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Response / Status
                  </p>
                  <div className="mt-5 rounded-[26px] border border-dashed border-slate-200 bg-white/74 px-5 py-6 text-sm leading-7 text-slate-500">
                    Pick a saved task or create a new one to start the Build Room relay flow.
                  </div>
                </div>

                <div className="floating-plane rounded-[34px] p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Internal Execution Planning
                  </p>
                  <div className="mt-5 grid gap-3 lg:grid-cols-2">
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
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
