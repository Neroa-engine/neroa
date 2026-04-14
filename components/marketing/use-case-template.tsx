import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import AiTeammateCards from "@/components/workspace/ai-teammate-cards";
import type { HowItWorksPage } from "@/lib/marketing-pages";
import type { UseCaseDetailPage } from "@/lib/use-cases";
import { resolvePublicLaunchAction } from "@/lib/data/public-launch";

type UseCaseTemplateProps = {
  page: UseCaseDetailPage;
  howItWorksPages: HowItWorksPage[];
};

export function UseCaseTemplate({ page, howItWorksPages }: UseCaseTemplateProps) {
  const primaryAction = resolvePublicLaunchAction(page.primaryCtaLabel, page.primaryCtaHref);
  const secondaryAction = resolvePublicLaunchAction(page.secondaryCtaLabel, page.secondaryCtaHref);

  function getFocusHref(detailSlug?: string) {
    return detailSlug ? `/use-cases/${page.slug}/${detailSlug}` : null;
  }

  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/use-cases" className="premium-pill text-slate-600 transition hover:text-slate-900">
            Back to use cases
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
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl xl:text-[4.5rem] xl:leading-[0.96]">
              {page.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">{page.intro}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500">{page.summary}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {page.heroHighlights.map((item) => (
                <span key={item} className="premium-pill text-slate-600">
                  {item}
                </span>
              ))}
            </div>

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
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                {page.heroPanelTitle}
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">{page.heroPanelSummary}</p>

              <div className="mt-6 space-y-3">
                {page.heroPanelItems.map((item) => (
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
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Execution outline
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Move through the work in a clean operating sequence
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {page.workflow.map((step, index) => {
            const href = getFocusHref(step.detailSlug);

            if (href) {
              return (
                <Link
                  key={step.title}
                  href={href}
                  className="micro-glow floating-plane group rounded-[30px] p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
                >
                  <div className="floating-wash rounded-[30px]" />
                  <div className="relative">
                    <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
                      Step 0{index + 1}
                    </span>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 transition group-hover:gap-3">
                      Explore this step
                      <span aria-hidden="true">-&gt;</span>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <article key={step.title} className="floating-plane rounded-[30px] p-6">
                <div className="floating-wash rounded-[30px]" />
                <div className="relative">
                  <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
                    Step 0{index + 1}
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            What this workflow helps you do
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Capabilities that stay connected to real output
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {page.capabilities.map((capability) => {
            const href = getFocusHref(capability.detailSlug);

            if (href) {
              return (
                <Link
                  key={capability.title}
                  href={href}
                  className="micro-glow floating-plane group rounded-[28px] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
                >
                  <div className="floating-wash rounded-[28px]" />
                  <div className="relative">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                      {capability.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {capability.description}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 transition group-hover:gap-3">
                      Open detail
                      <span aria-hidden="true">-&gt;</span>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <article key={capability.title} className="floating-plane rounded-[28px] p-5">
                <div className="floating-wash rounded-[28px]" />
                <div className="relative">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                    {capability.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{capability.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-6">
          <div className="floating-plane rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                AI collaboration
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                The supporting stack that helps this use case move
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Naroa stays at the center, but the supporting AIs widen the work when the page needs stronger research, build logic, design direction, or execution structure.
              </p>

              <AiTeammateCards
                className="mt-8"
                agents={page.collaboration.map((item) => ({
                  id: item.id,
                  badge: item.badge,
                  description: item.description,
                  active: item.id === "narua"
                }))}
              />
            </div>
          </div>

          {page.pricingStack ? (
            <div className="floating-plane rounded-[34px] p-6 sm:p-8">
              <div className="floating-wash rounded-[34px]" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  {page.pricingStack.heading}
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  Recommended Stack
                </h2>
                <p className="mt-3 text-lg font-medium text-slate-700">
                  {page.pricingStack.recommendedStack}
                </p>

                <div className="mt-6 rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(139,92,246,0.1))] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Neroa Monthly Price
                  </p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                    {page.pricingStack.monthlyPrice}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {page.pricingStack.rationale}
                  </p>
                </div>

                <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/72 p-5">
                  <p className="text-sm font-semibold text-slate-950">What you get in this stack</p>
                  <div className="mt-4 grid gap-3">
                    {page.pricingStack.included.map((item) => (
                      <div
                        key={item}
                        className="rounded-[18px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.62))] px-4 py-3 text-sm leading-6 text-slate-600"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-4">
                  <p className="text-sm font-semibold text-slate-950">Best for</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{page.pricingStack.bestFor}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-6">
          <div className="floating-plane rounded-[34px] p-6">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                {page.deliverablesTitle}
              </p>
              <div className="mt-5 grid gap-3">
                {page.deliverables.map((item) => (
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

          <div className="floating-plane rounded-[34px] p-6">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                {page.outcomesTitle}
              </p>
              <div className="mt-5 grid gap-3">
                {page.outcomes.map((item) => (
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
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Related system flow
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              How Neroa carries the work forward
            </h2>
            <div className="mt-6 grid gap-4">
              {howItWorksPages.map((item) => (
                <Link
                  key={item.slug}
                  href={`/how-it-works/${item.slug}`}
                  className="micro-glow rounded-[24px] border border-slate-200/70 bg-white/72 px-5 py-5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                    {item.index}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Next move
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {page.finalCtaTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                {page.finalCtaSummary}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={primaryAction.href} className="button-primary">
                {primaryAction.label}
              </Link>
              <Link href="/use-cases" className="button-secondary">
                Explore all use cases
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
