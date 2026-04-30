import Link from "next/link";
import type { TaskProofContext } from "@/lib/workspace/task-proof-context";

type TaskProofContextCardProps = {
  context: TaskProofContext | null;
  surface: "browser" | "library";
  className?: string;
};

function badgeTone(kind: "default" | "status" | "warning" | "ready") {
  if (kind === "status") {
    return "border-cyan-300/35 bg-cyan-300/12 text-cyan-700";
  }

  if (kind === "warning") {
    return "border-amber-300/40 bg-amber-300/14 text-amber-700";
  }

  if (kind === "ready") {
    return "border-emerald-300/35 bg-emerald-300/12 text-emerald-700";
  }

  return "border-slate-200 bg-white/82 text-slate-500";
}

function ReferenceLine({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) {
    return null;
  }

  return (
    <p className="break-all text-sm leading-6 text-slate-700">
      {label} <span className="font-mono text-[11px] text-slate-600">{value}</span>
    </p>
  );
}

export function TaskProofContextCard({
  context,
  surface,
  className = ""
}: TaskProofContextCardProps) {
  if (!context) {
    return null;
  }

  const surfaceLabel = surface === "browser" ? "Live Browser" : "Library";
  const focusLabel = surface === "browser" ? "Inspection focus" : "Evidence focus";
  const introCopy =
    surface === "browser"
      ? "This live session is attached to the same customer task and execution references used across Command Center and Build Room."
      : "This Library view is using the same customer task and execution references carried by execution handoff records.";

  return (
    <section
      className={`rounded-[28px] border border-slate-200/70 bg-white/88 p-5 shadow-[0_22px_48px_rgba(15,23,42,0.08)] ${className}`.trim()}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {surfaceLabel} task context
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
            {context.taskLabel}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{introCopy}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {context.requestTypeLabel ? (
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeTone(
                "default"
              )}`}
            >
              {context.requestTypeLabel}
            </span>
          ) : null}
          {context.taskStatusLabel ? (
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeTone(
                "status"
              )}`}
            >
              {context.taskStatusLabel}
            </span>
          ) : null}
          {context.roadmapDeviation ? (
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeTone(
                context.roadmapBlocked ? "warning" : "ready"
              )}`}
            >
              {context.roadmapDeviation.statusLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {focusLabel}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{context.inspectionFocus}</p>
          {context.roadmapArea ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Roadmap area <span className="font-semibold text-slate-900">{context.roadmapArea}</span>
            </p>
          ) : null}
        </div>

        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Execution references
          </p>
          <div className="mt-3 space-y-1">
            <ReferenceLine label="Customer Task" value={context.customerTaskId} />
            <ReferenceLine
              label="Execution Packet"
              value={context.taskLink.executionPacketId}
            />
            <ReferenceLine
              label="Build Room Task"
              value={context.taskLink.buildRoomTaskId}
            />
          </div>
        </div>
      </div>

      {context.roadmapDeviation ? (
        <div className="mt-5 rounded-[22px] border border-slate-200/70 bg-slate-50/80 px-4 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Strategy / roadmap context
              </p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                <p>
                  <span className="font-semibold text-slate-950">
                    Why this task is under review:
                  </span>{" "}
                  {context.roadmapDeviation.reason}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">What changed:</span>{" "}
                  {context.roadmapDeviation.changedSummary}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Risk created:</span>{" "}
                  {context.roadmapDeviation.riskSummary}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Decision needed:</span>{" "}
                  {context.roadmapDeviation.decisionNeeded}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Execution status:</span>{" "}
                  {context.roadmapDeviation.executionAllowed
                    ? "Execution may continue under the current approved roadmap."
                    : "Execution is blocked until the roadmap change is resolved."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {context.roadmapDeviation.latestDecisionLabel ? (
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeTone(
                    context.roadmapBlocked ? "warning" : "ready"
                  )}`}
                >
                  {context.roadmapDeviation.latestDecisionLabel}
                </span>
              ) : null}
              {context.strategyRoomHref ? (
                <Link
                  href={context.strategyRoomHref}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                >
                  Open Strategy Room
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
