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
    <div className="rounded-[24px] border border-[rgba(118,179,232,0.18)] bg-[linear-gradient(180deg,rgba(9,16,28,0.94),rgba(6,11,20,0.9))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-[rgba(248,250,255,0.98)]">{value}</p>
      {detail ? (
        <p className="mt-2 text-sm leading-7 text-[rgba(205,218,236,0.78)]">{detail}</p>
      ) : null}
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
    <div className="rounded-[28px] border border-[rgba(118,179,232,0.18)] bg-[linear-gradient(180deg,rgba(9,16,28,0.96),rgba(6,11,20,0.92))] px-5 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.24)] sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
        {title}
      </p>
      {detail ? (
        <p className="mt-2 text-sm leading-7 text-[rgba(205,218,236,0.78)]">{detail}</p>
      ) : null}
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
    emphasis === "slate" ? "text-[rgba(248,250,255,0.98)]" : "text-cyan-700";

  if (variant === "stack") {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-[rgba(118,179,232,0.14)] py-4 last:border-b-0 last:pb-0 first:pt-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[rgba(248,250,255,0.98)]">{label}</p>
          <p className="mt-1 text-sm leading-7 text-[rgba(180,196,218,0.72)]">{detail}</p>
        </div>
        <p className={`shrink-0 text-sm font-semibold ${valueClassName}`}>{value}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-[24px] border border-[rgba(118,179,232,0.16)] bg-[linear-gradient(180deg,rgba(9,16,28,0.94),rgba(6,11,20,0.9))] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.2)] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_auto] sm:items-center sm:px-5">
      <p className="text-sm font-semibold text-[rgba(248,250,255,0.98)]">{label}</p>
      <p className="text-sm leading-7 text-[rgba(180,196,218,0.72)] sm:pr-4">{detail}</p>
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
      className="block rounded-[20px] border border-[rgba(118,179,232,0.16)] bg-[rgba(8,15,27,0.88)] px-5 py-4 transition hover:border-[rgba(150,229,255,0.24)] hover:bg-[rgba(10,19,33,0.94)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[rgba(248,250,255,0.98)]">{title}</p>
          <p className="mt-1 text-sm leading-7 text-[rgba(205,218,236,0.78)]">{detail}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-cyan-700">{actionLabel}</span>
      </div>
    </Link>
  );
}
