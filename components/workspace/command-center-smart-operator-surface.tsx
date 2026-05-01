"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  formatCommandCenterCustomerRequestTypeLabel,
  inferCommandCenterCustomerRequestType,
  type CommandCenterCustomerRequestType,
  type CommandCenterTaskSourceType,
  type CommandCenterTaskStatus
} from "@/lib/workspace/command-center-tasks";

export type CommandCenterWorkflowTabId =
  | "requests"
  | "revisions"
  | "roadmap_updates"
  | "execution_review"
  | "decisions"
  | "qc_evidence";

type WorkflowConfig = {
  label: string;
  title: string;
  helper: string;
  placeholder: string;
  submitLabel: string;
  requestType: CommandCenterCustomerRequestType;
  sourceType: CommandCenterTaskSourceType;
};

export type CommandCenterWorkflowTaskCard = {
  id: string;
  title: string;
  request: string;
  status: CommandCenterTaskStatus;
  sourceType: CommandCenterTaskSourceType;
  bucketLabel: string;
};

type CommandCenterSmartOperatorSurfaceProps = {
  workspaceId: string;
  returnTo: string;
  canManage: boolean;
  createTaskAction: (formData: FormData) => void | Promise<void>;
  tasks?: CommandCenterWorkflowTaskCard[];
  defaultRoadmapArea?: string;
  blockedItemCount?: number;
  decisionCount?: number;
  reviewCount?: number;
  creditSummary?: string | null;
  availableRoadmapAreas?: string[];
  decisionContent?: ReactNode;
  reviewContent?: ReactNode;
  utilityTray?: ReactNode;
  footerControl?: ReactNode;
};

const WORKFLOW_CONFIG: Record<CommandCenterWorkflowTabId, WorkflowConfig> = {
  requests: {
    label: "Requests",
    title: "Start a new request",
    helper: "Use this for new work you want Neroa to pick up next.",
    placeholder: "Describe the change, feature, or fix you want next...",
    submitLabel: "Send request",
    requestType: "new_request",
    sourceType: "customer_request"
  },
  revisions: {
    label: "Revisions",
    title: "Adjust something already in motion",
    helper: "Use this when work already exists and you want it revised, tightened, or reshaped.",
    placeholder: "Describe what should be revised or improved...",
    submitLabel: "Send revision",
    requestType: "revision",
    sourceType: "customer_request"
  },
  roadmap_updates: {
    label: "Roadmap Updates",
    title: "Change what should happen next",
    helper: "Use this when priorities, sequencing, or the current direction need to change.",
    placeholder: "Describe the roadmap update or direction change...",
    submitLabel: "Send roadmap update",
    requestType: "change_direction",
    sourceType: "roadmap_follow_up"
  },
  execution_review: {
    label: "Execution Review",
    title: "Flag review feedback or delivery concerns",
    helper: "Use this for feedback on work that needs another pass, validation, or follow-up.",
    placeholder: "Describe the review note, concern, or follow-up you want handled...",
    submitLabel: "Send review note",
    requestType: "problem_bug",
    sourceType: "change_review_follow_up"
  },
  decisions: {
    label: "Decisions",
    title: "Capture an answer Neroa needs",
    helper: "Use this when a question needs a decision, approval, or short answer before work can move.",
    placeholder: "Add the decision, answer, or approval note...",
    submitLabel: "Send decision",
    requestType: "question_decision",
    sourceType: "decision_follow_up"
  },
  qc_evidence: {
    label: "QC / Evidence",
    title: "Attach proof, findings, or QC notes",
    helper: "Use this for screenshots, recordings, evidence notes, or validation follow-up.",
    placeholder: "Describe the QC result, evidence, or finding you want attached...",
    submitLabel: "Send QC note",
    requestType: "question_decision",
    sourceType: "signal_cleanup"
  }
};

function taskStatusLabel(status: CommandCenterTaskStatus) {
  if (status === "in_review") {
    return "In review";
  }

  if (status === "waiting_on_decision") {
    return "Waiting on answer";
  }

  if (status === "ready") {
    return "Ready";
  }

  if (status === "active") {
    return "In progress";
  }

  if (status === "completed") {
    return "Completed";
  }

  return "Open";
}

function taskStatusClasses(status: CommandCenterTaskStatus) {
  if (status === "active") {
    return "border-cyan-300/35 bg-cyan-300/12 text-cyan-700";
  }

  if (status === "in_review") {
    return "border-amber-300/35 bg-amber-50/80 text-amber-700";
  }

  if (status === "waiting_on_decision") {
    return "border-rose-300/35 bg-rose-50/80 text-rose-700";
  }

  if (status === "ready") {
    return "border-emerald-300/35 bg-emerald-50/80 text-emerald-700";
  }

  if (status === "completed") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-slate-200 bg-white/82 text-slate-500";
}

function sourceTypeForTab(tab: CommandCenterWorkflowTabId): CommandCenterTaskSourceType {
  return WORKFLOW_CONFIG[tab].sourceType;
}

function requestTypeForTab(tab: CommandCenterWorkflowTabId) {
  return WORKFLOW_CONFIG[tab].requestType;
}

function taskCategoryLabel(tab: CommandCenterWorkflowTabId) {
  return WORKFLOW_CONFIG[tab].label;
}

function isQcEvidenceRequest(request: string) {
  const normalized = request.toLowerCase();

  return [
    "qc",
    "evidence",
    "recording",
    "screenshot",
    "screen capture",
    "video",
    "proof",
    "test result",
    "qa note"
  ].some((candidate) => normalized.includes(candidate));
}

function resolveTaskTab(task: CommandCenterWorkflowTaskCard): CommandCenterWorkflowTabId {
  if (task.sourceType === "roadmap_follow_up") {
    return "roadmap_updates";
  }

  if (task.sourceType === "change_review_follow_up") {
    return "execution_review";
  }

  if (task.sourceType === "decision_follow_up") {
    return "decisions";
  }

  if (task.sourceType === "signal_cleanup") {
    return "qc_evidence";
  }

  const inferredType = inferCommandCenterCustomerRequestType(task.request);

  if (inferredType === "revision") {
    return "revisions";
  }

  if (inferredType === "change_direction") {
    return "roadmap_updates";
  }

  if (inferredType === "question_decision") {
    return "decisions";
  }

  if (inferredType === "problem_bug") {
    return "execution_review";
  }

  if (isQcEvidenceRequest(task.request)) {
    return "qc_evidence";
  }

  return "requests";
}

function compactMetricTone(value: number) {
  if (value > 0) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function CommandCenterSmartOperatorSurface({
  workspaceId,
  returnTo,
  canManage,
  createTaskAction,
  tasks = [],
  defaultRoadmapArea,
  blockedItemCount = 0,
  decisionCount = 0,
  reviewCount = 0,
  creditSummary = null,
  availableRoadmapAreas = [],
  footerControl
}: CommandCenterSmartOperatorSurfaceProps) {
  const [activeTab, setActiveTab] = useState<CommandCenterWorkflowTabId>("requests");
  const [requestValue, setRequestValue] = useState("");
  const [manualRequestType, setManualRequestType] =
    useState<CommandCenterCustomerRequestType | null>(requestTypeForTab("requests"));

  const activeConfig = WORKFLOW_CONFIG[activeTab];
  const inferredRequestType = useMemo(() => {
    if (requestValue.trim()) {
      return inferCommandCenterCustomerRequestType(requestValue);
    }

    return requestTypeForTab(activeTab);
  }, [activeTab, requestValue]);
  const effectiveRequestType = manualRequestType ?? inferredRequestType;
  const requestTypeSource =
    manualRequestType !== null ? "manual" : requestValue.trim() ? "inferred" : "system";
  const canSubmitRequest = canManage && requestValue.trim().length > 0;
  const resolvedRoadmapArea =
    defaultRoadmapArea ?? availableRoadmapAreas[0] ?? "General coordination";
  const tabCounts = useMemo(() => {
    const counts: Record<CommandCenterWorkflowTabId, number> = {
      requests: 0,
      revisions: 0,
      roadmap_updates: 0,
      execution_review: 0,
      decisions: 0,
      qc_evidence: 0
    };

    for (const task of tasks) {
      counts[resolveTaskTab(task)] += 1;
    }

    return counts;
  }, [tasks]);
  const filteredTasks = useMemo(
    () => tasks.filter((task) => resolveTaskTab(task) === activeTab),
    [activeTab, tasks]
  );
  const groupedTasks = useMemo(() => {
    const groups = new Map<string, CommandCenterWorkflowTaskCard[]>();

    for (const task of filteredTasks) {
      const existing = groups.get(task.bucketLabel) ?? [];
      existing.push(task);
      groups.set(task.bucketLabel, existing);
    }

    return Array.from(groups.entries());
  }, [filteredTasks]);

  function selectTab(tab: CommandCenterWorkflowTabId) {
    setActiveTab(tab);
    setManualRequestType(requestTypeForTab(tab));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-[20px] border border-slate-200 bg-white/82 px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Open decisions
          </p>
          <span
            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${compactMetricTone(
              decisionCount
            )}`}
          >
            {decisionCount}
          </span>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white/82 px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Active reviews
          </p>
          <span
            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${compactMetricTone(
              reviewCount
            )}`}
          >
            {reviewCount}
          </span>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white/82 px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Blocked items
          </p>
          <span
            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${compactMetricTone(
              blockedItemCount
            )}`}
          >
            {blockedItemCount}
          </span>
        </div>
        {creditSummary ? (
          <div className="rounded-[20px] border border-slate-200 bg-white/82 px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Credits
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-950">{creditSummary}</p>
          </div>
        ) : null}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white/88 px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(WORKFLOW_CONFIG) as CommandCenterWorkflowTabId[]).map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                aria-pressed={active}
                onClick={() => selectTab(tab)}
                className={`rounded-full border px-3 py-2 text-[11px] font-semibold tracking-[0.02em] transition ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {WORKFLOW_CONFIG[tab].label}
                <span className={`ml-2 ${active ? "text-slate-200" : "text-slate-400"}`}>
                  {tabCounts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-950 px-5 py-5 text-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {activeConfig.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-white">{activeConfig.title}</p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                {activeConfig.helper}
              </p>
            </div>
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
              One shared composer
            </span>
          </div>

          <form action={createTaskAction} className="mt-5 space-y-3">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="mutation" value="create_task" />
            <input type="hidden" name="sourceType" value={sourceTypeForTab(activeTab)} />
            <input type="hidden" name="requestType" value={effectiveRequestType} />
            <input type="hidden" name="requestTypeSource" value={requestTypeSource} />
            <input type="hidden" name="roadmapArea" value={resolvedRoadmapArea} />
            <textarea
              name="request"
              rows={6}
              value={requestValue}
              onChange={(event) => setRequestValue(event.target.value)}
              disabled={!canManage}
              className="input min-h-[168px] resize-y border-white/18 bg-[#101b2d] text-white placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder={activeConfig.placeholder}
            />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-xs leading-5 text-slate-300">
                  This entry will be tagged as {taskCategoryLabel(activeTab).toLowerCase()} and
                  added to the customer task queue.
                </p>
                <p className="text-xs leading-5 text-slate-400">
                  Request type: {formatCommandCenterCustomerRequestTypeLabel(effectiveRequestType)}.
                </p>
                {!canManage ? (
                  <p className="text-xs leading-5 text-slate-400">
                    Project owners can send new workflow items from this room.
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={!canSubmitRequest}
                className="rounded-full border border-[rgba(167,136,250,0.68)] bg-[linear-gradient(135deg,#8f7cff,#a788fa_56%,#c19cff)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_40px_rgba(148,122,255,0.3)] transition hover:brightness-[1.06] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
              >
                {activeConfig.submitLabel}
              </button>
            </div>
          </form>

          {footerControl ? <div className="mt-4 flex justify-end">{footerControl}</div> : null}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white/88 px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Customer tasks
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track what is open, waiting, and recently cleared from one simple queue.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            {filteredTasks.length} shown
          </span>
        </div>

        {groupedTasks.length > 0 ? (
          <div className="mt-4 space-y-4">
            {groupedTasks.map(([bucketLabel, bucketTasks]) => (
              <section key={bucketLabel} className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {bucketLabel}
                </p>
                <div className="grid gap-3">
                  {bucketTasks.map((task) => {
                    const taskTab = resolveTaskTab(task);

                    return (
                      <article
                        key={task.id}
                        className="rounded-[22px] border border-slate-200 bg-slate-50/90 px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${taskStatusClasses(
                                  task.status
                                )}`}
                              >
                                {taskStatusLabel(task.status)}
                              </span>
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                {taskCategoryLabel(taskTab)}
                              </span>
                            </div>
                            <p className="mt-3 text-base font-semibold text-slate-950">
                              {task.title}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{task.request}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6">
            <p className="text-sm leading-6 text-slate-500">
              No customer tasks are in {activeConfig.label.toLowerCase()} right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
