"use client";

import type { ReactNode } from "react";

export function PromptCard({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200/75 bg-white/84 p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function ChoiceGrid<T extends string>({
  items,
  selectedId,
  onSelect,
  columns = "grid-cols-1 md:grid-cols-2"
}: {
  items: Array<{ id: T; label: string; description: string }>;
  selectedId: T | string | null;
  onSelect: (id: T) => void;
  columns?: string;
}) {
  return (
    <div className={`grid gap-3 ${columns}`}>
      {items.map((item) => {
        const selected = selectedId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`rounded-[22px] border px-4 py-4 text-left transition ${
              selected
                ? "border-cyan-300/60 bg-cyan-50/70 shadow-[0_16px_36px_rgba(34,211,238,0.12)]"
                : "border-slate-200/75 bg-white/84 hover:border-cyan-200/60 hover:bg-cyan-50/30"
            }`}
          >
            <p className="text-sm font-semibold text-slate-950">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </button>
        );
      })}
    </div>
  );
}

export function StepShell({
  stepNumber,
  title,
  summary,
  children
}: {
  stepNumber: number;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <section className="section-stage px-6 py-7 sm:px-8 sm:py-8">
      <div className="floating-wash rounded-[36px]" />
      <div className="relative">
        <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
          Step {stepNumber}
        </span>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{summary}</p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export function GuidedChatLead({
  eyebrow,
  title,
  message,
  bullets
}: {
  eyebrow: string;
  title: string;
  message: string;
  bullets: string[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-slate-950/85 bg-slate-950 px-5 py-5 text-white shadow-[0_20px_44px_rgba(15,23,42,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
          {eyebrow}
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-200">{message}</p>
      </div>
      <div className="rounded-[28px] border border-slate-200/75 bg-white/84 p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
          What this step locks in
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
          {bullets.map((bullet) => (
            <li
              key={bullet}
              className="rounded-[18px] border border-slate-200/70 bg-slate-50/80 px-4 py-3"
            >
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
