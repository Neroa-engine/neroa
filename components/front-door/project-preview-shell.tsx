"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createProjectFromPreview } from "@/app/project-preview/actions";
import { PreviewAuthGate } from "@/components/front-door/preview-auth-gate";
import { PublicActionLink } from "@/components/site/public-action-link";
import {
  buildFrontDoorPreview,
  loadFrontDoorIntakeDraft,
  type FrontDoorIntakeDraft,
  type FrontDoorPreview
} from "@/lib/front-door/intake";
import { APP_ROUTES } from "@/lib/routes";

type ProjectPreviewShellProps = {
  userEmail?: string | null;
  error?: string;
  notice?: string;
};

function PreviewPlaceholder() {
  return (
    <section className="premium-surface rounded-[32px] p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
        Preview required
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        Start in the guided builder so NEROA can shape your project preview.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
        The preview page only works after the builder or new-project intake captures your product
        direction, build mode, and a short product description.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <PublicActionLink href="/start" label="Start the builder" className="button-primary">
          Start the builder
        </PublicActionLink>
        <Link href={APP_ROUTES.roadmap} className="button-secondary">
          Open new project intake
        </Link>
      </div>
    </section>
  );
}

function PreviewSummaryCard({
  label,
  value,
  summary
}: {
  label: string;
  value: string;
  summary: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/75 bg-white/86 p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{summary}</p>
    </div>
  );
}

export function ProjectPreviewShell({
  userEmail,
  error,
  notice
}: ProjectPreviewShellProps) {
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
          Loading preview
        </p>
        <p className="mt-4 text-base leading-8 text-slate-600">
          NEROA is loading your intake state.
        </p>
      </section>
    );
  }

  if (!draft || !preview) {
    return <PreviewPlaceholder />;
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="premium-surface rounded-[34px] p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Project preview
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
            Here&apos;s what NEROA thinks you&apos;re building.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            This is a preview roadmap, not the full workspace. It is enough to show the likely
            direction, the early cost logic, and the next step before the real project workspace opens.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <PreviewSummaryCard
              label="Product type"
              value={preview.productTypeLabel}
              summary="This is the root category shaping the build path."
            />
            <PreviewSummaryCard
              label="Build direction"
              value={preview.buildModeLabel}
              summary="This tells NEROA whether the first phase should stay lean or plan wider execution."
            />
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
            Likely next step
          </p>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
            {preview.likelyPathLabel}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{preview.likelyPathSummary}</p>

          <div className="mt-5 rounded-[24px] border border-slate-200/75 bg-white/82 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Suggested next step
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{preview.suggestedNextStep}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="premium-pill text-slate-600">{draft.userName}</span>
            {draft.concerns.slice(0, 2).map((concern) => (
              <span key={concern} className="premium-pill text-slate-500">
                Concern captured
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="premium-surface rounded-[32px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Rough roadmap preview
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

      {userEmail ? (
        <section className="premium-surface rounded-[32px] p-6 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Continue to workspace
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            You&apos;re already signed in.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            We&apos;ll save this preview against {userEmail} and open the real project workspace next.
          </p>

          <form action={createProjectFromPreview} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="intakePayload" value={JSON.stringify(draft)} />
            <button className="button-primary" type="submit">
              Continue into workspace
            </button>
            <Link href={APP_ROUTES.roadmap} className="button-secondary">
              Edit project intake
            </Link>
          </form>
        </section>
      ) : (
        <PreviewAuthGate userName={draft.userName} error={error} notice={notice} />
      )}
    </div>
  );
}
