import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";

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

export default function UseCasesOverviewPage() {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <section className="mx-auto max-w-5xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
          Use Cases
        </p>
        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5.2rem]">
          Build SaaS, internal software, external apps, and mobile apps with coordinated AI.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">
          Choose what you want to build. Neroa helps you shape the MVP, understand the budget, validate demand, and move into execution.
        </p>
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
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 sm:text-base">
              {workflowSteps.map((step, index) => (
                <span key={step} className="inline-flex items-center gap-3">
                  <span className="premium-pill text-slate-700">{step}</span>
                  {index < workflowSteps.length - 1 ? (
                    <span className="text-cyan-600/70" aria-hidden="true">&rarr;</span>
                  ) : null}
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
                Start your build
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Choose a category and let Neroa generate your first plan.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="button-primary">
                Start your build
              </Link>
              <Link href="/pricing" className="button-secondary">
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
