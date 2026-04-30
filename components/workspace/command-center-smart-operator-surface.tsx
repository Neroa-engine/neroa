"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  formatCommandCenterCustomerRequestTypeLabel,
  inferCommandCenterCustomerRequestType,
  type CommandCenterCustomerRequestType
} from "@/lib/workspace/command-center-tasks";

type SmartOperatorModeId =
  | "requests"
  | "revisions"
  | "roadmap_updates"
  | "execution_clarifications"
  | "decisions"
  | "review";

type SmartOperatorModeConfig = {
  label: string;
  title: string;
  helper: string;
  placeholder?: string;
  bubbleTitle: string;
  bubbleBody: string;
  submitLabel?: string;
};

const SMART_OPERATOR_MODE_CONFIG: Record<SmartOperatorModeId, SmartOperatorModeConfig> = {
  requests: {
    label: "Requests",
    title: "Ask Neroa to add, change, or fix something",
    helper:
      "Use Requests for new work. Neroa turns the ask into a tracked task and stages prompt support behind it.",
    placeholder: "Describe what you want Neroa to add, change, or fix next...",
    bubbleTitle: "Requests",
    bubbleBody:
      "Use this mode for new work. Neroa treats the request as a fresh operator task and stages the supporting execution path behind it.",
    submitLabel: "Create tracked task"
  },
  revisions: {
    label: "Revisions",
    title: "Revise something already being handled",
    helper:
      "Use Revisions when the work already exists and you want Neroa to tighten, reshape, or adjust it without creating a whole new direction.",
    placeholder: "Describe what needs to be revised, adjusted, or tightened...",
    bubbleTitle: "Revisions",
    bubbleBody:
      "Use this mode to revise work already in motion. Neroa keeps the task chain intact and treats the request as an adjustment to existing operator work.",
    submitLabel: "Create revision task"
  },
  roadmap_updates: {
    label: "Roadmap Updates",
    title: "Change roadmap priorities, sequencing, or phase focus",
    helper:
      "Use Roadmap Updates when the order of work, current section, or next phase needs to change before the operator flow continues.",
    placeholder: "Describe the roadmap shift, priority change, or sequencing update...",
    bubbleTitle: "Roadmap Updates",
    bubbleBody:
      "Use this mode to change what should happen next. Neroa treats the request as a roadmap or sequencing adjustment before deeper execution widens.",
    submitLabel: "Stage roadmap update"
  },
  execution_clarifications: {
    label: "Execution Clarifications",
    title: "Answer questions or remove blockers so work can continue",
    helper:
      "Use Execution Clarifications when Neroa needs sharper direction, missing context, or an answer that lets the current work move forward safely.",
    placeholder: "Add the clarification, answer, or missing context Neroa needs...",
    bubbleTitle: "Execution Clarifications",
    bubbleBody:
      "Use this mode to clear blockers or answer operator questions. Neroa treats the response as execution guidance rather than a brand-new request.",
    submitLabel: "Stage clarification"
  },
  decisions: {
    label: "Decisions",
    title: "Resolve the answers Neroa still needs",
    helper:
      "Use Decisions to review open questions, add response notes, and move the project toward safer execution readiness.",
    bubbleTitle: "Decisions",
    bubbleBody:
      "This mode is for unresolved decisions. Review what Neroa is asking, add the answer or status update, and clear what is still shaping readiness."
  },
  review: {
    label: "Review",
    title: "Review what changed before execution widens",
    helper:
      "Use Review to understand current follow-up pressure, update review notes, and confirm whether execution can safely widen from here.",
    bubbleTitle: "Review",
    bubbleBody:
      "This mode is for change review and follow-up. Neroa shows why the current review matters and what still needs attention before moving deeper into execution."
  }
};

type CommandCenterSmartOperatorSurfaceProps = {
  workspaceId: string;
  returnTo: string;
  canManage: boolean;
  availableRoadmapAreas: string[];
  createTaskAction: (formData: FormData) => void | Promise<void>;
  decisionCount: number;
  reviewCount: number;
  decisionContent: ReactNode;
  reviewContent: ReactNode;
  utilityTray?: ReactNode;
  footerControl?: ReactNode;
};

function inferRequestTypeFromMode(mode: SmartOperatorModeId): CommandCenterCustomerRequestType {
  if (mode === "revisions") {
    return "revision";
  }

  if (mode === "roadmap_updates") {
    return "change_direction";
  }

  if (mode === "execution_clarifications" || mode === "decisions") {
    return "question_decision";
  }

  return "new_request";
}

export function CommandCenterSmartOperatorSurface({
  workspaceId,
  returnTo,
  canManage,
  availableRoadmapAreas,
  createTaskAction,
  decisionCount,
  reviewCount,
  decisionContent,
  reviewContent,
  utilityTray,
  footerControl
}: CommandCenterSmartOperatorSurfaceProps) {
  const [activeMode, setActiveMode] = useState<SmartOperatorModeId>("requests");
  const [openBubbleMode, setOpenBubbleMode] = useState<SmartOperatorModeId | null>(null);
  const [requestValue, setRequestValue] = useState("");
  const [manualRequestType, setManualRequestType] =
    useState<CommandCenterCustomerRequestType | null>(null);

  const activeConfig = useMemo(
    () => SMART_OPERATOR_MODE_CONFIG[activeMode],
    [activeMode]
  );
  const inferredRequestType = useMemo(() => {
    if (requestValue.trim()) {
      return inferCommandCenterCustomerRequestType(requestValue);
    }

    return inferRequestTypeFromMode(activeMode);
  }, [activeMode, requestValue]);
  const effectiveRequestType = manualRequestType ?? inferredRequestType;
  const requestTypeSource =
    manualRequestType !== null ? "manual" : requestValue.trim() ? "inferred" : "system";
  const canSubmitRequest = requestValue.trim().length > 0;

  function selectMode(mode: SmartOperatorModeId) {
    setActiveMode(mode);
    setOpenBubbleMode(mode);
    setManualRequestType(inferRequestTypeFromMode(mode));
  }

  return (
    <div className="rounded-[24px] border border-white/12 bg-[#081222]/94 px-4 py-4 shadow-[0_28px_80px_rgba(2,6,23,0.3)]">
      <div className="relative">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SMART_OPERATOR_MODE_CONFIG) as SmartOperatorModeId[]).map((mode) => {
            const config = SMART_OPERATOR_MODE_CONFIG[mode];
            const active = mode === activeMode;
            const countLabel =
              mode === "decisions"
                ? `${decisionCount} open`
                : mode === "review"
                  ? `${reviewCount} active`
                  : null;

            return (
              <button
                key={mode}
                type="button"
                aria-pressed={active}
                onClick={() => selectMode(mode)}
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                  active
                    ? "border-[rgba(167,136,250,0.65)] bg-[linear-gradient(135deg,#8f7cff,#a788fa_56%,#c19cff)] text-white shadow-[0_14px_32px_rgba(148,122,255,0.28)]"
                    : "border-white/14 bg-[#111c2f] text-slate-200 hover:border-white/24 hover:bg-[#16233a]"
                }`}
              >
                <span>{config.label}</span>
                {countLabel ? <span className="ml-2 text-slate-300/90">{countLabel}</span> : null}
              </button>
            );
          })}
        </div>

        {openBubbleMode ? (
          <div className="mt-3 max-w-[30rem] rounded-[20px] border border-white/14 bg-[#0f1a2c] px-4 py-4 shadow-[0_24px_64px_rgba(15,23,42,0.32)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  {SMART_OPERATOR_MODE_CONFIG[openBubbleMode].bubbleTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {SMART_OPERATOR_MODE_CONFIG[openBubbleMode].bubbleBody}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenBubbleMode(null)}
                className="rounded-full border border-white/14 bg-[#15233a] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-100 transition hover:bg-[#1a2b45]"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-[22px] border border-white/14 bg-[#0d182a]/94 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
              {activeConfig.label}
            </p>
            <p className="mt-2 text-base font-semibold text-white">{activeConfig.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{activeConfig.helper}</p>
          </div>
          <span className="rounded-full border border-white/16 bg-[#15233a] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-100">
            {activeConfig.label} mode
          </span>
          <span className="rounded-full border border-white/16 bg-[#15233a] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-100">
            {formatCommandCenterCustomerRequestTypeLabel(effectiveRequestType)}
          </span>
        </div>

        <div className={utilityTray ? "mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]" : ""}>
          <div className="min-w-0">
            {activeMode === "decisions" ? (
              <div>{decisionContent}</div>
            ) : activeMode === "review" ? (
              <div>{reviewContent}</div>
            ) : canManage ? (
              <form action={createTaskAction} className="space-y-3">
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <input type="hidden" name="mutation" value="create_task" />
                <input type="hidden" name="sourceType" value="customer_request" />
                <input type="hidden" name="requestType" value={effectiveRequestType} />
                <input type="hidden" name="requestTypeSource" value={requestTypeSource} />
                <textarea
                  name="request"
                  rows={6}
                  value={requestValue}
                  onChange={(event) => setRequestValue(event.target.value)}
                  required
                  className="input min-h-[168px] resize-y border-white/18 bg-[#101b2d] text-white placeholder:text-slate-400"
                  placeholder={activeConfig.placeholder}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <label className="block w-full max-w-sm space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                      Roadmap section
                    </span>
                    <select name="roadmapArea" className="input border-white/18 bg-[#101b2d] text-white">
                      {availableRoadmapAreas.map((area) => (
                        <option key={area} value={area} className="text-slate-950">
                          {area}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="max-w-xl text-xs leading-5 text-slate-300 sm:flex-1">
                    Request type: {formatCommandCenterCustomerRequestTypeLabel(effectiveRequestType)}.
                    {" "}
                    This stays on the task metadata so Command Center can keep planning,
                    decision, and bug context attached without adding any portal routing logic.
                  </p>
                  <button
                    type="submit"
                    disabled={!canSubmitRequest}
                    className="rounded-full border border-[rgba(167,136,250,0.68)] bg-[linear-gradient(135deg,#8f7cff,#a788fa_56%,#c19cff)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_40px_rgba(148,122,255,0.3)] transition hover:brightness-[1.06] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {activeConfig.submitLabel}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-[20px] border border-white/14 bg-[#101b2d] px-4 py-4">
                <p className="text-sm leading-6 text-slate-200">
                  Project owners can use {activeConfig.label.toLowerCase()} mode to turn this context
                  into tracked operator work from the same Smart Operator surface.
                </p>
              </div>
            )}

            {footerControl ? <div className="mt-4 flex justify-end">{footerControl}</div> : null}
          </div>

          {utilityTray ? (
            <div className="grid content-start gap-3 xl:self-start">{utilityTray}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
