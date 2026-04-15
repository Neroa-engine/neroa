import type { Metadata } from "next";
import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { buildPublicMetadata } from "@/lib/marketing/seo";

const useCaseCards = [
  {
    title: "SaaS",
    description:
      "Build subscription software, AI tools, dashboards, portals, and digital products with a guided MVP-to-launch workflow.",
    cta: "Explore SaaS",
    href: "/use-cases/saas"
  },
  {
    title: "Internal Software",
    description:
      "Create CRMs, admin dashboards, workflow systems, operations tools, reporting portals, and custom internal platforms.",
    cta: "Explore Internal Software",
    href: "/use-cases/internal-software"
  },
  {
    title: "External Apps",
    description:
      "Plan and build customer-facing websites, portals, booking systems, and branded digital experiences.",
    cta: "Explore External Apps",
    href: "/use-cases/external-apps"
  },
  {
    title: "Mobile Apps",
    description:
      "Plan iPhone apps, Android apps, and cross-platform mobile products with a guided path through scope, budget, testing, build, and launch.",
    cta: "Explore Mobile Apps",
    href: "/use-cases/mobile-apps"
  }
] as const;

const workflowSteps = [
  "Strategy",
  "Scope",
  "MVP",
  "Budget",
  "Test",
  "Build",
  "Launch",
  "Operate"
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Use Cases | SaaS, internal software, external apps, and mobile apps with Neroa",
  description:
    "Explore the main Neroa use cases for SaaS, internal software, external apps, and mobile apps, then choose between DIY Build and Managed Build.",
  path: "/use-cases",
  keywords: [
    "build SaaS with AI",
    "build internal software with AI",
    "build external apps with AI",
    "build mobile apps with AI"
  ]
});

export default function UseCasesOverviewPage() {
  return (
    <MarketingInfoShell
      ctaHref="/start"
      ctaLabel="Start DIY Build"
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
              Choose the product category Neroa should help you build.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-600">
              These pages explain what Neroa helps build in each category, why AI-guided product
              logic matters, and when to stay in DIY Build versus move into Managed Build.
            </p>

            <div className="hero-highlight-grid mt-8">
              <div className="hero-highlight-card">
                <span>SaaS, internal software, external apps, and mobile products in one guided system.</span>
              </div>
              <div className="hero-highlight-card">
                <span>Choose the lane that matches your budget, urgency, and execution support needs.</span>
              </div>
              <div className="hero-highlight-card">
                <span>Move from use-case understanding into live scope, MVP, budget, build, and launch work.</span>
              </div>
            </div>
          </div>

          <div className="hero-signal-panel fade-up-soft-delay">
            <div className="signal-orbit" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="premium-pill border-slate-200/80 bg-white/80 text-slate-700">
                  Guided category selection
                </span>
                <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
                  Use-case overview
                </span>
              </div>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Each category page is built to help the customer understand what gets built, how the
                workflow differs, and which lane makes the most sense before serious execution begins.
              </p>

              <div className="signal-grid mt-6">
                <div className="signal-item">
                  <span className="signal-item-title">Signal 01</span>
                  <span className="signal-item-body">See what Neroa helps build in that category.</span>
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

      <section className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {useCaseCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="micro-glow floating-plane rounded-[30px] p-6"
          >
            <div className="floating-wash rounded-[30px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Build category
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
          </Link>
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

      <section className="mt-16 grid gap-4 lg:grid-cols-2">
        <div className="floating-plane rounded-[30px] p-6">
          <div className="floating-wash rounded-[30px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              DIY Build
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Use monthly Engine Credits when you want to build at your own pace.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              DIY is best when you want budget flexibility, structured scope, and a real path into
              software without starting with a full managed engagement.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/diy-build" className="button-primary">
                Explore DIY Build
              </Link>
              <Link href="/pricing/diy" className="button-secondary">
                View DIY Pricing
              </Link>
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[30px] p-6">
          <div className="floating-wash rounded-[30px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Managed Build
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Move into managed execution when the build needs more help.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Managed is best when speed, complexity, launch pressure, or business impact make a
              more supported path the better fit.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/managed-build" className="button-primary">
                Explore Managed Build
              </Link>
              <Link href="/pricing/managed" className="button-secondary">
                View Managed Pricing
              </Link>
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
                Choose the category, understand the path, then move into the live build system.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Neroa helps customers decide whether they should stay in a self-paced build lane or
                move into a managed execution path before the product gets harder to coordinate.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="button-primary">
                Start DIY Build
              </Link>
              <Link href="/pricing" className="button-secondary">
                Compare build paths
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
