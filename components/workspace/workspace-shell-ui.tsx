import type { ReactNode } from "react";
import Link from "next/link";
import {
  buildProjectLaneRoute,
  type ProjectLaneRecord,
  type ProjectLaneStatus
} from "@/lib/workspace/project-lanes";
import type { ConnectedServiceState } from "@/lib/workspace/execution-orchestration";

export type LaneProgressSummary = {
  label: string;
  detail: string;
  updatedAt: string | null;
  hasActivity: boolean;
};

export type WorkspaceSnapshotItem = {
  id: string;
  title: string;
  detail: string;
  href?: string;
};

export function statusPill(status: ProjectLaneStatus) {
  if (status === "active") {
    return "border-cyan-300/25 bg-cyan-300/12 text-cyan-700";
  }
  if (status === "recommended") {
    return "border-emerald-300/30 bg-emerald-300/14 text-emerald-700";
  }
  return "border-slate-200 bg-white/75 text-slate-500";
}

export function emptyProgress(status: ProjectLaneStatus): LaneProgressSummary {
  return {
    label: status === "active" ? "Ready" : status === "recommended" ? "Next" : "Later",
    detail:
      status === "active"
        ? "Neroa can move this lane forward now."
        : status === "recommended"
          ? "Open this lane when it sharpens the engine."
          : "Keep this lane parked until it is clearly useful.",
    updatedAt: null,
    hasActivity: false
  };
}

export function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "No recent activity";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No recent activity";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function connectedServiceBadgeClasses(state: ConnectedServiceState) {
  if (state === "core") {
    return "border-cyan-300/28 bg-cyan-50 text-cyan-700";
  }

  if (state === "launch") {
    return "border-violet-300/28 bg-violet-50 text-violet-700";
  }

  if (state === "conditional") {
    return "border-emerald-300/28 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

export function FloatingSection({
  eyebrow,
  title,
  children,
  action
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="floating-plane relative overflow-hidden rounded-[34px] p-6 xl:p-7">
      <div className="floating-wash rounded-[34px]" />
      <div className="relative">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
          </div>
          {action}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export function LaneRow({
  workspaceId,
  projectId,
  lane,
  progress
}: {
  workspaceId: string;
  projectId: string;
  lane: ProjectLaneRecord;
  progress: LaneProgressSummary;
}) {
  return (
    <Link
      href={buildProjectLaneRoute(workspaceId, projectId, lane.slug)}
      className="micro-glow flex items-start justify-between gap-4 border-b border-slate-200/70 py-4 last:border-b-0"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-slate-950">{lane.title}</p>
          <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusPill(lane.status)}`}>
            {progress.label}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{progress.detail}</p>
      </div>
      <span className="text-xs text-slate-400">{formatUpdatedAt(progress.updatedAt)}</span>
    </Link>
  );
}
