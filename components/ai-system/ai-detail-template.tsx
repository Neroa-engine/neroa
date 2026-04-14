import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import AgentAvatar from "@/components/ai/AgentAvatar";
import { AiCard } from "@/components/ai-system/ai-card";
import { AGENTS } from "@/lib/ai/agents";
import type { AiSystemPage } from "@/lib/data/ai-system";
import { aiSystemDeepContent } from "@/lib/data/ai-system-deep-content";
import { resolvePublicLaunchAction } from "@/lib/data/public-launch";

type AiDetailTemplateProps = {
  page: AiSystemPage;
};

export function AiDetailTemplate({ page }: AiDetailTemplateProps) {
  const agent = AGENTS[page.id];
  const deepContent = aiSystemDeepContent[page.id];
  const primaryAction = resolvePublicLaunchAction(page.primaryCtaLabel, page.primaryCtaHref);
  const secondaryAction = resolvePublicLaunchAction(
    page.secondaryCtaLabel,
    page.secondaryCtaHref
  );

  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/system/ai"
            className="premium-pill text-slate-600 transition hover:text-slate-900"
          >
            Back to AI System
          </Link>
          <Link href="/" className="premium-pill text-slate-600 transition hover:text-slate-900">
            Home
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl xl:text-[4.6rem] xl:leading-[0.96]">
              {page.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">
              {page.description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryAction.href} className="button-primary">
                {primaryAction.label}
              </Link>
              <Link href={secondaryAction.href} className="button-secondary">
                {secondaryAction.label}
              </Link>
            </div>
          </div>

          <div className="floating-plane relative overflow-hidden rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    {agent.role}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{agent.name}</p>
                </div>

                <AgentAvatar id={page.id} active size={140} showLabel={false} />
              </div>

              <div className="mt-8 rounded-[26px] border border-slate-200/70 bg-white/72 p-5">
                <p className="text-sm font-semibold text-slate-950">{page.summaryPanelTitle}</p>
                <div className="mt-4 space-y-3">
                  {page.summaryPanelItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.62))] px-4 py-3 text-sm leading-6 text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Why this AI matters
            </p>
            <div className="mt-6 space-y-4">
              {deepContent.story.map((paragraph) => (
                <p key={paragraph} className="text-base leading-8 text-slate-600">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Best fit
            </p>
            <div className="mt-6 grid gap-3">
              {deepContent.bestFor.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              What this AI does
            </p>
            <div className="mt-6 grid gap-4">
              {page.capabilities.map((capability) => (
                <div
                  key={capability.title}
                  className="rounded-[24px] border border-slate-200/70 bg-white/72 p-5"
                >
                  <p className="text-lg font-semibold text-slate-950">{capability.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              When it activates
            </p>
            <div className="mt-6 space-y-3">
              {page.activatesWhen.map((item, index) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-300/12 text-xs font-semibold text-cyan-700">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-7 text-slate-600">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-sm leading-7 text-slate-700">
              Naroa remains the control layer across the full system. This AI activates to sharpen a specific kind of work, then feeds the result back into the broader project flow.
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              How it works inside Neroa
            </p>
            <div className="mt-6 grid gap-4">
              {deepContent.workflow.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-slate-200/70 bg-white/72 p-5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                    Step 0{index + 1}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              What users walk away with
            </p>
            <div className="mt-6 grid gap-4">
              {deepContent.value.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-slate-200/70 bg-white/72 p-5"
                >
                  <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              How it works with the rest of Neroa
            </p>
            <div className="mt-6 grid gap-4">
              {page.collaboration.map((item) => (
                <AiCard
                  key={item.id}
                  id={item.id}
                  href={`/system/${item.id}`}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Outputs and user value
            </p>
            <div className="mt-6 grid gap-3">
              {page.outputs.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Next move
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {page.finalCtaTitle}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">{page.finalCtaSummary}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={primaryAction.href} className="button-primary">
                {primaryAction.label}
              </Link>
              <Link href="/use-cases" className="button-secondary">
                Explore use cases
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
