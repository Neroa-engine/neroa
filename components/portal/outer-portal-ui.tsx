import Link from "next/link";

type PortalRowTone = "cyan" | "slate";
type PortalSummaryRowVariant = "band" | "stack";

export function PortalMetricTile({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white/82 px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-7 text-slate-600">{detail}</p> : null}
    </div>
  );
}

export function PortalSectionBand({
  title,
  detail
}: {
  title: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(140deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))] px-5 py-4 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
        {title}
      </p>
      {detail ? <p className="mt-2 text-sm leading-7 text-slate-600">{detail}</p> : null}
    </div>
  );
}

export function PortalSummaryRow({
  label,
  detail,
  value,
  emphasis = "cyan",
  variant = "band"
}: {
  label: string;
  detail: string;
  value: string;
  emphasis?: PortalRowTone;
  variant?: PortalSummaryRowVariant;
}) {
  const valueClassName =
    emphasis === "slate" ? "text-slate-950" : "text-cyan-700";

  if (variant === "stack") {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 py-4 last:border-b-0 last:pb-0 first:pt-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{label}</p>
          <p className="mt-1 text-sm leading-7 text-slate-500">{detail}</p>
        </div>
        <p className={`shrink-0 text-sm font-semibold ${valueClassName}`}>{value}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/75 bg-white/84 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.04)] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_auto] sm:items-center sm:px-5">
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <p className="text-sm leading-7 text-slate-500 sm:pr-4">{detail}</p>
      <p className={`text-sm font-semibold sm:text-right ${valueClassName}`}>{value}</p>
    </div>
  );
}

export function PortalActionRow({
  title,
  detail,
  href,
  actionLabel
}: {
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-[20px] border border-slate-200/70 bg-white/82 px-5 py-4 transition hover:border-cyan-200 hover:bg-cyan-50/65"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-7 text-slate-600">{detail}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-cyan-700">{actionLabel}</span>
      </div>
    </Link>
  );
}
