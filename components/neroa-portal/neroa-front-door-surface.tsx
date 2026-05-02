import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";

const flowSteps = [
  {
    step: "01",
    title: "Tell us what you want to build.",
    detail:
      "Start with the product, workflow, or customer outcome you want Neroa to shape."
  },
  {
    step: "02",
    title: "Neroa turns it into a structured project plan.",
    detail:
      "The front door organizes the request into roadmap-ready scope, dependencies, and decision areas."
  },
  {
    step: "03",
    title: "Review the roadmap, scope, and next steps.",
    detail:
      "See what matters before execution begins so the project stays calm, reviewable, and controlled."
  },
  {
    step: "04",
    title: "Move into your project workspace.",
    detail:
      "Continue into a clean workspace shaped around strategy, command, evidence, and approvals."
  }
] as const;

const capabilityCards = [
  {
    eyebrow: "What Neroa Does",
    title: "Turns a starting idea into a structured project roadmap.",
    body:
      "Start with the product you want to build. Neroa turns your idea into a structured project roadmap with scope, sequencing, and visible decision points."
  },
  {
    eyebrow: "How Projects Move",
    title: "Keeps the next move legible before work expands.",
    body:
      "Review scope, decisions, and next steps before execution begins, then move forward with a project workspace designed for clarity instead of tool sprawl."
  },
  {
    eyebrow: "Governance And Control",
    title: "Builds around review, evidence, and approvals.",
    body:
      "Neroa is designed to keep strategy, command, evidence, and approvals in view so project movement stays intentional rather than opaque."
  }
] as const;

const governancePoints = [
  "Project-first entry before execution pressure",
  "Visible scope, checkpoints, and approvals",
  "Customer-safe movement instead of hidden operator mechanics"
] as const;

export function NeroaFrontDoorSurface() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#27303a_0%,#11161d_38%,#07090d_100%)] px-6 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <NeroaPortalNavigation currentPath="/neroa" tone="dark" />

        <section className="overflow-hidden rounded-[2.4rem] border border-slate-300/10 bg-[linear-gradient(145deg,rgba(17,24,39,0.96)_0%,rgba(7,10,14,0.98)_100%)] shadow-[0_45px_140px_rgba(0,0,0,0.46)]">
          <div className="grid gap-8 border-b border-white/8 px-8 py-10 lg:grid-cols-[1.5fr,0.95fr] lg:px-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-teal-200/90">
                  Neroa
                </p>
                <p className="max-w-xl text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Front Door
                </p>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl font-serif text-4xl leading-tight text-slate-50 lg:text-6xl">
                  Start with the product you want to build.
                </h1>
                <p className="max-w-3xl text-base leading-8 text-slate-300">
                  Neroa turns your idea into a structured project roadmap. Review scope,
                  decisions, and next steps before execution begins, then move into a clean
                  project workspace designed around strategy, command, evidence, and approvals.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/neroa/auth"
                  className="rounded-full border border-teal-300/30 bg-teal-300/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
                >
                  Start your project
                </Link>
                <Link
                  href="/neroa/account"
                  className="rounded-full border border-slate-400/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 transition hover:border-slate-200/40 hover:text-white"
                >
                  View Account Portal
                </Link>
                <Link
                  href="/neroa/project"
                  className="rounded-full border border-slate-400/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 transition hover:border-slate-200/40 hover:text-white"
                >
                  View Project Portal
                </Link>
              </div>

              <p className="max-w-2xl text-sm leading-7 text-slate-400">
                Front-door preview only. These routes introduce the clean Neroa entry surfaces and
                do not imply live authentication, pricing checkout, billing runtime, or project
                execution wiring yet.
              </p>
            </div>

            <aside className="rounded-[1.9rem] border border-teal-200/15 bg-[linear-gradient(180deg,rgba(148,163,184,0.12)_0%,rgba(20,184,166,0.07)_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-200">
                Project Start Flow
              </p>
              <div className="mt-5 space-y-3">
                {flowSteps.map((step) => (
                  <article
                    key={step.step}
                    className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4"
                  >
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-100">
                        {step.step}
                      </span>
                      <div className="space-y-2">
                        <h2 className="font-serif text-xl text-slate-50">{step.title}</h2>
                        <p className="text-sm leading-7 text-slate-300">{step.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </div>

          <div className="grid gap-4 px-8 py-8 lg:grid-cols-3 lg:px-10">
            {capabilityCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[1.7rem] border border-slate-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(148,163,184,0.04)_100%)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/80">
                  {card.eyebrow}
                </p>
                <h2 className="mt-3 font-serif text-2xl text-slate-50">{card.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <article className="rounded-[2rem] border border-slate-400/20 bg-[linear-gradient(160deg,rgba(12,17,24,0.98)_0%,rgba(7,10,14,0.98)_100%)] px-8 py-8 shadow-[0_32px_100px_rgba(0,0,0,0.34)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
              Governance And Control
            </p>
            <h2 className="mt-3 font-serif text-3xl text-slate-50">
              Calm entry, visible decisions, and controlled project movement.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
              Neroa moves a project forward by organizing scope before execution, making reviewable
              decisions visible, and keeping approvals close to the roadmap instead of burying them
              behind disconnected tools.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {governancePoints.map((point) => (
                <div
                  key={point}
                  className="rounded-[1.35rem] border border-white/8 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200"
                >
                  {point}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-300/15 bg-white/5 px-8 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Scope Notes
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <p>Pricing and execution options follow after Neroa understands the project scope.</p>
              <p>No forms, fake connected states, or live submission paths are active here.</p>
              <p>The front door stays wordmark-first, spacious, and intentionally quiet.</p>
            </div>
          </article>
        </section>

        <section className="rounded-[2rem] border border-slate-300/10 bg-[linear-gradient(135deg,rgba(20,26,34,0.95)_0%,rgba(9,12,16,0.98)_100%)] px-8 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
                Next Step
              </p>
              <div className="space-y-3">
                <h2 className="max-w-3xl font-serif text-3xl text-slate-50 lg:text-4xl">
                  Move from idea to a clean project start.
                </h2>
                <p className="max-w-3xl text-sm leading-8 text-slate-300">
                  Use the clean Neroa front door to begin the project conversation, preview the
                  account and project shells, and keep future runtime work isolated until it is
                  intentionally introduced.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/neroa/auth"
                className="rounded-full border border-teal-300/30 bg-teal-300/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
              >
                Start your project
              </Link>
              <Link
                href="/neroa/account"
                className="rounded-full border border-slate-400/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 transition hover:border-slate-200/40 hover:text-white"
              >
                View Account Portal
              </Link>
              <Link
                href="/neroa/project"
                className="rounded-full border border-slate-400/20 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 transition hover:border-slate-200/40 hover:text-white"
              >
                View Project Portal
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
