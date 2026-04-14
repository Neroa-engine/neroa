"use client";

import type { ReactNode } from "react";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AmbientWorkspaceBackground({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClasses("workspace-ambient", className)}>{children}</div>;
}

export function LanePageShell({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClasses("space-y-6", className)}>{children}</div>;
}

export function LaneHeroHeader({
  eyebrow,
  title,
  description,
  badge,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 xl:text-4xl 2xl:text-[2.8rem]">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 xl:text-base xl:leading-8">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {actions}
        {badge}
      </div>
    </div>
  );
}

export function SummaryMetricCard({
  title,
  value,
  detail,
  emphasized = false
}: {
  title: string;
  value: string;
  detail: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={joinClasses(
        emphasized ? "premium-surface-strong" : "premium-surface-soft",
        "p-5"
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <p className="mt-4 text-2xl font-semibold text-slate-950 xl:text-[2rem]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

export function PrimaryPanel({
  title,
  subtitle,
  action,
  children,
  className
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={joinClasses("premium-surface-strong p-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {title}
          </p>
          {subtitle ? <h2 className="mt-3 text-2xl font-semibold text-slate-950">{subtitle}</h2> : null}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function SecondaryPanel({
  title,
  children,
  className
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={joinClasses("premium-surface p-5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function GuidanceRailCard({
  title,
  children,
  accent = "default",
  className
}: {
  title: string;
  children: ReactNode;
  accent?: "default" | "cyan";
  className?: string;
}) {
  return (
    <section
      className={joinClasses(
        accent === "cyan"
          ? "premium-surface border-cyan-300/16 bg-cyan-300/[0.05]"
          : "premium-surface",
        "p-5",
        className
      )}
    >
      <p
        className={joinClasses(
          "text-[11px] font-semibold uppercase tracking-[0.22em]",
          accent === "cyan" ? "text-cyan-700" : "text-slate-500"
        )}
      >
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PremiumTabs<T extends string>({
  tabs,
  activeValue,
  onChange
}: {
  tabs: Array<{
    value: T;
    label: string;
    detail?: string;
  }>;
  activeValue: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-3">
      {tabs.map((tab) => {
        const active = tab.value === activeValue;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={joinClasses(
              "rounded-[24px] border p-4 text-left transition",
              active
                ? "border-cyan-300/24 bg-cyan-300/[0.10] text-slate-950 shadow-[0_20px_50px_rgba(34,211,238,0.10)]"
                : "border-slate-200 bg-white/72 text-slate-600 hover:bg-white/88"
            )}
          >
            <p className="text-sm font-semibold">{tab.label}</p>
            {tab.detail ? <p className="mt-3 text-sm leading-6 text-slate-500">{tab.detail}</p> : null}
          </button>
        );
      })}
    </div>
  );
}

export function DarkTable({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={joinClasses("overflow-hidden rounded-[24px] border border-slate-200 bg-white/72 backdrop-blur-xl", className)}>
      {children}
    </div>
  );
}

export function DarkTableHeader({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={joinClasses("border-b border-slate-200 bg-white/78 px-4 py-3", className)}>
      {children}
    </div>
  );
}

export function DarkTableRow({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={joinClasses("border-b border-slate-200/80 px-4 py-4 last:border-b-0", className)}>
      {children}
    </div>
  );
}

export function PremiumButton({
  children,
  variant = "cta",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "cta" | "ghost" | "quiet";
}) {
  return (
    <button
      {...props}
      className={joinClasses(
        variant === "cta"
          ? "button-cta"
          : variant === "ghost"
            ? "button-ghost"
            : "button-quiet",
        "disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
    >
      {children}
    </button>
  );
}
