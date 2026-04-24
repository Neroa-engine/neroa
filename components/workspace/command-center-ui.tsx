import type { ReactNode } from "react";
import type {
  CommandCenterDataState,
  CommandCenterListPanel,
  CommandCenterStateBand,
  CommandCenterTruthSource
} from "@/lib/workspace/command-center-summary";

function truthSourceClasses(source: CommandCenterTruthSource) {
  if (source === "real-project-truth") {
    return "border-emerald-300/40 bg-emerald-50/75 text-emerald-700";
  }

  if (source === "preview-control-truth") {
    return "border-violet-300/40 bg-violet-100/70 text-violet-700";
  }

  if (source === "future-system") {
    return "border-amber-300/40 bg-amber-50/80 text-amber-700";
  }

  return "border-cyan-300/35 bg-cyan-300/12 text-cyan-700";
}

function truthSourceLabel(source: CommandCenterTruthSource) {
  if (source === "real-project-truth") {
    return "Confirmed now";
  }

  if (source === "preview-control-truth") {
    return "Preview state";
  }

  if (source === "future-system") {
    return "Ready next";
  }

  return "Current project picture";
}

function dataStateClasses(dataState: CommandCenterDataState) {
  if (dataState === "degraded") {
    return "border-rose-200/70 bg-rose-50/80";
  }

  if (dataState === "partial") {
    return "border-amber-200/70 bg-amber-50/70";
  }

  return "border-slate-200/70 bg-white/76";
}

export function CommandCenterSourceBadge({
  source
}: {
  source: CommandCenterTruthSource;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${truthSourceClasses(
        source
      )}`}
    >
      {truthSourceLabel(source)}
    </span>
  );
}

export function CommandCenterPanel({
  children,
  dataState = "stable",
  className = ""
}: {
  children: ReactNode;
  dataState?: CommandCenterDataState;
  className?: string;
}) {
  return (
    <div className={`floating-plane rounded-[34px] border p-4 xl:p-[1.125rem] ${dataStateClasses(dataState)} ${className}`}>
      {children}
    </div>
  );
}

export function CommandCenterSummaryCard({
  label,
  value,
  detail,
  valueTone = "metric"
}: {
  label: string;
  value: string;
  detail?: string;
  valueTone?: "metric" | "sentence";
}) {
  return (
    <div className="floating-plane rounded-[28px] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-3 font-semibold tracking-tight text-slate-950 ${
          valueTone === "sentence" ? "text-base leading-7" : "text-[1.65rem]"
        }`}
      >
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
      ) : null}
    </div>
  );
}

export function CommandCenterCompactSignal({
  label,
  value,
  detail,
  tone = "neutral"
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "warning" | "danger" | "accent";
}) {
  const toneClasses =
    tone === "danger"
      ? "border-rose-200/70 bg-rose-50/75"
      : tone === "warning"
        ? "border-amber-200/70 bg-amber-50/75"
        : tone === "accent"
          ? "border-cyan-300/35 bg-cyan-300/10"
          : "border-slate-200/70 bg-white/76";

  return (
    <div className={`floating-plane rounded-[24px] border px-4 py-3 ${toneClasses}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          {detail ? (
            <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
          ) : null}
        </div>
        <p className="text-right text-sm font-semibold leading-6 text-slate-950">{value}</p>
      </div>
    </div>
  );
}

export function CommandCenterPopoverBar({
  summary,
  children,
  tone = "light",
  align = "left",
  className = "",
  summaryClassName = "",
  bubbleClassName = ""
}: {
  summary: ReactNode;
  children: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "right";
  className?: string;
  summaryClassName?: string;
  bubbleClassName?: string;
}) {
  const summaryToneClasses =
    tone === "dark"
      ? "border-white/12 bg-white/6 text-white shadow-[0_18px_40px_rgba(2,6,23,0.22)]"
      : "border-slate-200/70 bg-white/88 text-slate-950 shadow-[0_18px_40px_rgba(15,23,42,0.08)]";

  const bubbleToneClasses =
    tone === "dark"
      ? "border-white/12 bg-slate-950/97 text-slate-100 shadow-[0_28px_70px_rgba(2,6,23,0.45)]"
      : "border-slate-200/80 bg-white/98 text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.16)]";

  return (
    <details className={`group relative w-full ${className}`}>
      <summary
        className={`cursor-pointer list-none rounded-[18px] border px-4 py-3 transition [&::-webkit-details-marker]:hidden ${summaryToneClasses} ${summaryClassName}`}
      >
        {summary}
      </summary>

      <div
        className={`pointer-events-none invisible absolute top-[calc(100%+0.6rem)] z-30 w-[min(34rem,calc(100vw-2.5rem))] rounded-[24px] border p-4 opacity-0 transition duration-150 group-open:pointer-events-auto group-open:visible group-open:opacity-100 ${bubbleToneClasses} ${
          align === "right" ? "right-0" : "left-0"
        } ${bubbleClassName}`}
      >
        {children}
      </div>
    </details>
  );
}

export function CommandCenterStateSection({
  band
}: {
  band: CommandCenterStateBand;
}) {
  return (
    <CommandCenterPanel dataState={band.dataState}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {band.title}
        </p>
        <CommandCenterSourceBadge source={band.source} />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{band.label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{band.detail}</p>
    </CommandCenterPanel>
  );
}

export function CommandCenterListSection({
  panel,
  accent = "cyan"
}: {
  panel: CommandCenterListPanel;
  accent?: "cyan" | "rose" | "amber";
}) {
  const dotClass =
    accent === "rose" ? "bg-rose-500" : accent === "amber" ? "bg-amber-500" : "bg-cyan-500";

  return (
    <CommandCenterPanel dataState={panel.dataState}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {panel.title}
        </p>
        <CommandCenterSourceBadge source={panel.source} />
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{panel.description}</p>

      <ul className="mt-4 space-y-3">
        {panel.items.length > 0 ? (
          panel.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
              <span className={`mt-2 h-1.5 w-1.5 rounded-full ${dotClass}`} />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-sm leading-7 text-slate-500">{panel.emptyState}</li>
        )}
      </ul>
    </CommandCenterPanel>
  );
}
