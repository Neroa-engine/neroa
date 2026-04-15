import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import {
  InfoCardGrid,
  FaqSection,
  JsonLdScript,
  SectionHeader,
  StepGrid
} from "@/components/marketing/public-page-sections";
import AiTeammateCards from "@/components/workspace/ai-teammate-cards";
import { buildFaqSchema, buildWebPageSchema } from "@/lib/marketing/seo";
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
    <MarketingInfoShell
      ctaHref="/start"
      ctaLabel="Start DIY Build"
      brandVariant="prominent"
      contentWidth="wide"
    >
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@graph": [
            buildWebPageSchema({
              name: `${page.title} | Neroa use case`,
              description: page.summary,
              path: `/use-cases/${page.slug}`
            }),
            ...(page.faq ? [buildFaqSchema(page.faq)] : [])
          ]
        }}
      />

      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/use-cases" className="premium-pill text-slate-600 transition hover:text-slate-900">
            Back to use cases
          </Link>
          <Link href="/" className="premium-pill text-slate-600 transition hover:text-slate-900">
            Home
          </Link>
        </div>

        <div className="hero-shell mt-10">
          <div className="fade-up-soft max-w-3xl">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              {page.eyebrow}
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl xl:text-[4.5rem] xl:leading-[0.96]">
              {page.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">{page.intro}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500">{page.summary}</p>

            <div className="hero-highlight-grid mt-8">
              {page.heroHighlights.map((item) => (
                <div key={item} className="hero-highlight-card">
                  <span>{item}</span>
                </div>
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

          <div className="hero-signal-panel fade-up-soft-delay">
            <div className="signal-orbit" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="premium-pill border-slate-200/80 bg-white/80 text-slate-700">
                  {page.heroPanelTitle}
                </span>
                <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
                  {page.title} lane
                </span>
              </div>
              <p className="mt-4 text-base leading-8 text-slate-600">{page.heroPanelSummary}</p>

              <div className="signal-grid mt-6">
                {page.heroPanelItems.map((item, index) => (
                  <div
                    key={item}
                    className="signal-item"
                  >
                    <span className="signal-item-title">Signal 0{index + 1}</span>
                    <span className="signal-item-body">{item}</span>
                  </div>
                ))}
              </div>

              <div className="comparison-band mt-6">
                <div className="comparison-metric">
                  <span className="comparison-label">DIY lane</span>
                  <span className="comparison-value">Use monthly Engine Credits to scope and pace this build over time.</span>
                </div>
                <div className="comparison-metric">
                  <span className="comparison-label">Managed lane</span>
                  <span className="comparison-value">Bring Neroa in when this use case needs more structured execution support.</span>
                </div>
                <div className="comparison-metric">
                  <span className="comparison-label">Best first move</span>
                  <span className="comparison-value">{primaryAction.label}</span>
                </div>
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

        <StepGrid
          steps={page.workflow.map((step, index) => ({
            title: step.title,
            description: step.description,
            eyebrow: `Step 0${index + 1}`,
            href: getFocusHref(step.detailSlug) ?? undefined,
            ctaLabel: "Explore this step"
          }))}
          guideContext={{ onboardingStep: "public-use-case", intentPrefix: `Explore ${page.title} workflow` }}
        />
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

        <InfoCardGrid
          items={page.capabilities.map((capability) => ({
            title: capability.title,
            description: capability.description,
            href: getFocusHref(capability.detailSlug) ?? undefined,
            ctaLabel: capability.detailSlug ? "Open detail" : undefined
          }))}
          columns="four"
          guideContext={{ onboardingStep: "public-use-case", intentPrefix: `Explore ${page.title} capability` }}
        />
      </section>

      <section className="mt-16">
        <SectionHeader
          eyebrow="Choose the path"
          title={`Use ${page.title} inside the lane that fits your budget, speed, and support needs.`}
          summary="Every use case can begin as a guided DIY build with monthly Engine Credits or move into a managed path when execution support, launch help, or tighter coordination matters more."
        />

        <div className="mt-8">
          <InfoCardGrid
            items={[
              {
                eyebrow: "DIY Build",
                title: "Start this use case inside the guided build platform.",
                description:
                  "Use DIY when you want to shape the scope, pace the work with monthly Engine Credits, and keep control over how quickly the build moves.",
                href: "/diy-build",
                ctaLabel: "Explore DIY Build",
                details: ["View DIY pricing to compare pacing and monthly credits."]
              },
              {
                eyebrow: "Managed Build",
                title: "Move this use case into a managed execution path when the build needs more help.",
                description:
                  "Use Managed Build when the software needs faster execution, staged approvals, QA visibility, launch coordination, or more support than a self-paced lane can comfortably provide.",
                href: "/managed-build",
                ctaLabel: "Explore Managed Build",
                details: ["View managed pricing when the project needs more direct execution support."]
              }
            ]}
            columns="two"
            guideContext={{ onboardingStep: "public-use-case", intentPrefix: `Choose ${page.title} path` }}
          />
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

                <div className="mt-6">
                  <InfoCardGrid
                    items={page.pricingStack.included.map((item) => ({
                      title: item,
                      description: `Included in the recommended ${page.title.toLowerCase()} stack so the first release stays structured and launchable.`
                    }))}
                    columns="two"
                    guideContext={{ onboardingStep: "public-use-case", intentPrefix: `Review ${page.title} stack inclusion` }}
                  />
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
              <div className="mt-5">
                <InfoCardGrid
                  items={page.deliverables.map((item) => ({
                    title: item,
                    description: `Neroa uses this deliverable to keep the ${page.title.toLowerCase()} workflow concrete and reviewable.`
                  }))}
                  columns="one"
                  guideContext={{ onboardingStep: "public-use-case", intentPrefix: `Review ${page.title} deliverable` }}
                />
              </div>
            </div>
          </div>

          <div className="floating-plane rounded-[34px] p-6">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                {page.outcomesTitle}
              </p>
              <div className="mt-5">
                <InfoCardGrid
                  items={page.outcomes.map((item) => ({
                    title: item,
                    description: `This is one of the real outcomes Neroa is trying to create through the ${page.title.toLowerCase()} lane.`
                  }))}
                  columns="one"
                  guideContext={{ onboardingStep: "public-use-case", intentPrefix: `Review ${page.title} outcome` }}
                />
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
            <div className="mt-6">
              <InfoCardGrid
                items={howItWorksPages.map((item) => ({
                  eyebrow: item.index,
                  title: item.title,
                  description: item.summary,
                  href: `/how-it-works/${item.slug}`,
                  ctaLabel: "Open how it works"
                }))}
                columns="one"
                guideContext={{ onboardingStep: "public-use-case", intentPrefix: `Explore ${page.title} handoff flow` }}
              />
            </div>
          </div>
        </div>

        <div className="section-stage px-6 py-8 sm:px-8 sm:py-10">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                Next move
              </span>
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

      {page.faq?.length ? (
        <FaqSection
          eyebrow={`${page.title} FAQ`}
          title={`Questions people ask before opening the ${page.title} lane.`}
          summary={`These answers help explain how Neroa handles ${page.title.toLowerCase()} planning, execution, and the choice between DIY Build and Managed Build.`}
          items={page.faq}
          guideContext={{ onboardingStep: "public-use-case", intentPrefix: `Review ${page.title} question` }}
        />
      ) : null}
    </MarketingInfoShell>
  );
}
