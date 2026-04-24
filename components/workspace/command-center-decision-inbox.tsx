import { updateCommandCenterDecision } from "@/app/workspace/[workspaceId]/command-center/actions";
import type {
  CommandCenterDecisionInbox,
  CommandCenterDecisionItem
} from "@/lib/workspace/command-center-summary";
import { CommandCenterPanel, CommandCenterSourceBadge } from "@/components/workspace/command-center-ui";

function decisionStatusClasses(status: CommandCenterDecisionItem["status"]) {
  if (status === "resolved") {
    return "border-emerald-300/40 bg-emerald-50/80 text-emerald-700";
  }

  if (status === "awaiting_review") {
    return "border-cyan-300/40 bg-cyan-300/12 text-cyan-700";
  }

  if (status === "deferred") {
    return "border-slate-200 bg-white/82 text-slate-500";
  }

  return "border-amber-300/40 bg-amber-50/80 text-amber-700";
}

function decisionSeverityClasses(severity: CommandCenterDecisionItem["severity"]) {
  if (severity === "critical") {
    return "border-rose-300/40 bg-rose-50/80 text-rose-700";
  }

  if (severity === "important") {
    return "border-amber-300/40 bg-amber-50/80 text-amber-700";
  }

  return "border-slate-200 bg-white/82 text-slate-500";
}

function decisionSourceLabel(sourceType: CommandCenterDecisionItem["sourceType"]) {
  if (sourceType === "execution_precondition") {
    return "Execution precondition";
  }

  if (sourceType === "user_requested_change") {
    return "Requested change";
  }

  if (sourceType === "future_system_placeholder") {
    return "Future system";
  }

  return "Needs clarification";
}

function decisionStatusLabel(status: CommandCenterDecisionItem["status"]) {
  if (status === "awaiting_review") {
    return "Awaiting review";
  }

  if (status === "resolved") {
    return "Resolved";
  }

  if (status === "deferred") {
    return "Deferred";
  }

  return "Unanswered";
}

function DecisionActionButtons({
  item
}: {
  item: CommandCenterDecisionItem;
}) {
  const reopen = item.status !== "unanswered";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        name="nextStatus"
        value="awaiting_review"
        className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 transition hover:bg-cyan-300/18"
      >
        Await review
      </button>
      <button
        type="submit"
        name="nextStatus"
        value="resolved"
        className="rounded-full border border-emerald-300/35 bg-emerald-50/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 transition hover:bg-emerald-100"
      >
        Resolve
      </button>
      <button
        type="submit"
        name="nextStatus"
        value="deferred"
        className="rounded-full border border-slate-200 bg-white/82 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
      >
        Defer
      </button>
      {reopen ? (
        <button
          type="submit"
          name="nextStatus"
          value="unanswered"
          className="rounded-full border border-slate-200 bg-white/82 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
        >
          Reopen
        </button>
      ) : null}
    </div>
  );
}

export function DecisionItemCard({
  workspaceId,
  item,
  canManage
}: {
  workspaceId: string;
  item: CommandCenterDecisionItem;
  canManage: boolean;
}) {
  const returnTo = `/workspace/${workspaceId}/command-center`;

  return (
    <CommandCenterPanel dataState={item.dataState} className="rounded-[30px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${decisionStatusClasses(
                item.status
              )}`}
            >
              {decisionStatusLabel(item.status)}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${decisionSeverityClasses(
                item.severity
              )}`}
            >
              {item.severity}
            </span>
            <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {item.category}
            </span>
            <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {decisionSourceLabel(item.sourceType)}
            </span>
            {item.blocking ? (
              <span className="rounded-full border border-rose-300/35 bg-rose-50/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                Blocking
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-950">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.prompt}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Why Neroa is asking
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{item.rationale}</p>
      </div>

      {item.answerPreview ? (
        <div className="mt-4 rounded-[22px] border border-emerald-200/60 bg-emerald-50/70 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Answer summary
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{item.answerPreview}</p>
        </div>
      ) : null}

      {canManage ? (
        <details className="mt-5 rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4">
          <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Update decision
          </summary>
          <form action={updateCommandCenterDecision} className="mt-4 space-y-4">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="decisionId" value={item.id} />
            <input type="hidden" name="title" value={item.title} />
            <input type="hidden" name="prompt" value={item.prompt} />
            <input type="hidden" name="rationale" value={item.rationale} />
            <input type="hidden" name="category" value={item.category} />
            <input type="hidden" name="severity" value={item.severity} />
            <input type="hidden" name="sourceType" value={item.sourceType} />
            <input type="hidden" name="relatedArea" value={item.relatedArea} />
            <input type="hidden" name="blocking" value={item.blocking ? "true" : "false"} />

            <label className="block space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Response note
              </span>
              <textarea
                name="answerPreview"
                defaultValue={item.answerPreview ?? ""}
                rows={3}
                className="input min-h-[96px] resize-y"
                placeholder="Add a short answer or coordination note..."
              />
            </label>

            <DecisionActionButtons item={item} />
          </form>
        </details>
      ) : (
        <p className="mt-5 text-sm leading-7 text-slate-500">
          Project owners can update decision status and add a response note from this room.
        </p>
      )}
    </CommandCenterPanel>
  );
}

export function CommandCenterDecisionInbox({
  workspaceId,
  decisionInbox,
  canManage,
  detailsOnly = false
}: {
  workspaceId: string;
  decisionInbox: CommandCenterDecisionInbox;
  canManage: boolean;
  detailsOnly?: boolean;
}) {
  if (detailsOnly) {
    return (
      <div id="command-center-decision-inbox" className="space-y-4">
        {decisionInbox.items.length > 0 ? (
          <div className="space-y-4">
            {decisionInbox.items.map((item) => (
              <DecisionItemCard
                key={item.id}
                workspaceId={workspaceId}
                item={item}
                canManage={canManage}
              />
            ))}
          </div>
        ) : (
          <CommandCenterPanel dataState={decisionInbox.dataState}>
            <p className="text-sm leading-7 text-slate-500">{decisionInbox.emptyState}</p>
          </CommandCenterPanel>
        )}
      </div>
    );
  }

  return (
    <div id="command-center-decision-inbox" className="space-y-4">
      <CommandCenterPanel dataState={decisionInbox.dataState}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {decisionInbox.title}
          </p>
          <CommandCenterSourceBadge source={decisionInbox.source} />
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">{decisionInbox.description}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Open decisions
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {decisionInbox.openCount}
            </p>
          </div>
          <div className="rounded-[22px] border border-rose-200/70 bg-rose-50/70 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
              Blocking decisions
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {decisionInbox.blockingOpenCount}
            </p>
          </div>
        </div>
      </CommandCenterPanel>

      {decisionInbox.items.length > 0 ? (
        <div className="space-y-4">
          {decisionInbox.items.map((item) => (
            <DecisionItemCard
              key={item.id}
              workspaceId={workspaceId}
              item={item}
              canManage={canManage}
            />
          ))}
        </div>
      ) : (
        <CommandCenterPanel dataState={decisionInbox.dataState}>
          <p className="text-sm leading-7 text-slate-500">{decisionInbox.emptyState}</p>
        </CommandCenterPanel>
      )}
    </div>
  );
}
