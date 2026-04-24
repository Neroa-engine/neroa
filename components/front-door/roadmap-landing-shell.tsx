"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createProjectFromRoadmap } from "@/app/roadmap/actions";
import { PublicActionLink } from "@/components/site/public-action-link";
import {
  buildFrontDoorPreview,
  loadFrontDoorIntakeDraft,
  type FrontDoorIntakeDraft,
  type FrontDoorPreview
} from "@/lib/front-door/intake";

type RoadmapLandingShellProps = {
  userEmail?: string | null;
  error?: string;
  notice?: string;
};

export function RoadmapLandingShell({
  userEmail,
  error,
  notice
}: RoadmapLandingShellProps) {
  const [draft, setDraft] = useState<FrontDoorIntakeDraft | null>(null);
  const [preview, setPreview] = useState<FrontDoorPreview | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const nextDraft = loadFrontDoorIntakeDraft();
    setDraft(nextDraft);
    setPreview(buildFrontDoorPreview(nextDraft));
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <section className="premium-surface rounded-[32px] p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
          Loading roadmap
        </p>
        <p className="mt-4 text-base leading-8 text-slate-600">
          NEROA is loading your roadmap draft.
        </p>
      </section>
    );
  }

  if (!draft || !preview) {
    return (
      <section className="premium-surface rounded-[32px] p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
          Resume required
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          There is no active roadmap draft in this browser yet.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          If you confirmed your email in a different window or device, return to the browser session
          where you started the builder, or run the guided builder again to rebuild the
          roadmap cleanly.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PublicActionLink
            href="/start"
            label="Return to guided builder"
            className="button-primary"
          >
            Return to guided builder
          </PublicActionLink>
          <Link href="/projects" className="button-secondary">
            Open projects
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="premium-surface rounded-[34px] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Roadmap landing
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
            Your SaaS roadmap starting point is ready.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            This is the first protected roadmap surface after signup. It keeps the recommendation,
            the early budget logic, and the first roadmap direction in one place before the workspace
            opens.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200/75 bg-white/86 p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Recommendation
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{preview.recommendationHeadline}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{preview.likelyPathSummary}</p>
            </div>
            <div className="rounded-[24px] border border-slate-200/75 bg-white/86 p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Starting point
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">
                {preview.recommendedStartingPointLabel}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {preview.recommendedStartingPointSummary}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,250,255,0.88))] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Project summary
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{preview.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {preview.shortProductDescription}
            </p>
          </div>
        </div>

        <aside className="premium-surface rounded-[34px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Account context
          </p>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
            {userEmail ?? "Signed-in account"}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The roadmap is now attached to your signed-in account. Continue when you are ready to
            open the real workspace.
          </p>

          <div className="mt-5 rounded-[24px] border border-slate-200/75 bg-white/82 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Mobile-ready positioning
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{preview.mobileReadySummary}</p>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200/75 bg-white/82 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Early price and pace
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-950">{preview.pricingRangeLabel}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{preview.timelineLabel}</p>
          </div>
        </aside>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="premium-surface rounded-[32px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Rough roadmap
          </p>
          <div className="mt-5 grid gap-3">
            {preview.roadmap.map((step, index) => (
              <div
                key={step.label}
                className="rounded-[24px] border border-slate-200/75 bg-white/84 px-4 py-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  0{index + 1} - {step.label}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="premium-surface rounded-[32px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Rough pricing logic
            </p>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              {preview.pricingRangeLabel}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{preview.pricingSummary}</p>
          </div>

          <div className="premium-surface rounded-[32px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Rough timeline logic
            </p>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              {preview.timelineLabel}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{preview.timelineSummary}</p>
          </div>
        </div>
      </section>

      <section className="premium-surface rounded-[32px] p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
          Continue
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Open the real workspace when you are ready.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          The roadmap is the bridge. The workspace is where the deeper build flow, saved project
          state, and execution surfaces open next.
        </p>

        <form action={createProjectFromRoadmap} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="intakePayload" value={JSON.stringify(draft)} />
          <button className="button-primary" type="submit">
            Continue into workspace
          </button>
          <PublicActionLink href="/start" label="Revisit builder" className="button-secondary">
            Revisit builder
          </PublicActionLink>
          <Link href="/pricing" className="button-quiet">
            Review pricing
          </Link>
        </form>
      </section>
    </div>
  );
}
