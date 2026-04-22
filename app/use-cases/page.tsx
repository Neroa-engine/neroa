import type { Metadata } from "next";
import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { PublicActionLink } from "@/components/site/public-action-link";
import { buildPublicMetadata } from "@/lib/marketing/seo";

const guideCards = [
  {
    title: "What NEROA helps build",
    description:
      "Use NEROA for serious SaaS products with dashboards, portals, recurring workflows, customer access, and mobile-ready planning from the start.",
    cta: "Learn what SaaS can include",
    href: "/what-is-saas"
  },
  {
    title: "When DIY fits best",
    description:
      "Choose DIY when you want guided structure, visible tradeoffs, and a budget-aware pace you can control month by month.",
    cta: "Explore DIY Build",
    href: "/diy-build"
  },
  {
    title: "When Managed fits best",
    description:
      "Choose Managed when the build needs more direct execution support, tighter coordination, QA visibility, or stronger launch help.",
    cta: "Start Managed Build",
    href: "/start"
  }
] as const;

const workflowSteps = [
  "Strategy",
  "Scope",
  "Budget",
  "Build Definition",
  "Build",
  "Test",
  "Launch",
  "Operate"
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Use Cases | What NEROA helps build and which path fits best",
  description:
    "See what NEROA helps build, how the guided path works, and whether DIY Build or Managed Build is the better fit before you start.",
  path: "/use-cases",
  keywords: ["build SaaS with AI", "guided SaaS build path", "DIY vs managed build"]
});

export default function UseCasesOverviewPage() {
  return (
    <MarketingInfoShell
      ctaHref="/pricing"
      ctaLabel="Compare Build Paths"
      brandVariant="prominent"
      contentWidth="wide"
    >
      <section className="mx-auto max-w-6xl">
        <div className="hero-shell">
          <div className="fade-up-soft max-w-3xl">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Use Cases
            </span>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5.2rem] xl:leading-[0.96]">
              See what NEROA helps build, then choose the lane that fits.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-600">
              This page is here to make the front door clearer: what the product is built for, how
              the guided path works, and whether DIY or Managed is the better next move.
            </p>

            <div className="hero-highlight-grid mt-8">
              <div className="hero-highlight-card">
                <span>Understand what kind of SaaS system NEROA helps shape before you enter the builder.</span>
              </div>
              <div className="hero-highlight-card">
                <span>Choose between DIY pacing and Managed execution without losing the same product logic.</span>
              </div>
              <div className="hero-highlight-card">
                <span>Move into pricing or the builder only after the lane and next step feel clear.</span>
              </div>
            </div>
          </div>

          <div className="hero-signal-panel fade-up-soft-delay">
            <div className="signal-orbit" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="premium-pill border-slate-200/80 bg-white/80 text-slate-700">
                  Guided entry logic
                </span>
                <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
                  Use-case overview
                </span>
              </div>
              <p className="mt-4 text-base leading-8 text-slate-600">
                The goal is not to send you through more categories. It is to make the product path
                easier to understand before serious execution begins.
              </p>

              <div className="signal-grid mt-6">
                <div className="signal-item">
                  <span className="signal-item-title">Signal 01</span>
                  <span className="signal-item-body">See what NEROA helps build and how the product is framed.</span>
                </div>
                <div className="signal-item">
                  <span className="signal-item-title">Signal 02</span>
                  <span className="signal-item-body">Understand whether DIY or Managed fits the work better.</span>
                </div>
                <div className="signal-item">
                  <span className="signal-item-title">Signal 03</span>
                  <span className="signal-item-body">Move into the guided build system with more confidence and less guesswork.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {guideCards.map((card) => (
          <PublicActionLink
            key={card.title}
            href={card.href}
            label={card.cta}
            className="micro-glow floating-plane rounded-[30px] p-6"
          >
            <div className="floating-wash rounded-[30px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Guide
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700">
                {card.cta}
                <span aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </PublicActionLink>
        ))}
      </section>

      <section className="mt-16">
        <div className="floating-plane rounded-[34px] p-6 sm:p-8">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Workflow
            </p>
            <div className="flow-ribbon mt-5">
              {workflowSteps.map((step, index) => (
                <span key={step} className="flow-ribbon-item">
                  <span className="flow-ribbon-index">{index + 1}</span>
                  <span>{step}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 pb-4">
        <div className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="floating-wash rounded-[38px]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Next step
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Compare the build lanes once the product path is clearer.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Use pricing to decide whether this should stay in DIY or move into Managed before
                the product gets harder to coordinate.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing" className="button-primary">
                Compare build paths
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
