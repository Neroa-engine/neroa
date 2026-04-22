import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getOptionalUser } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL("https://neroa.io"),
  title: "Neroa | Strategy Room, roadmap, preview, and approvals in one flow",
  description:
    "Neroa helps founders move from idea into a guided product plan with Strategy Room, roadmap shaping, preview, inspection, and approvals inside one customer-facing build experience.",
  alternates: {
    canonical: "https://neroa.io/"
  },
  openGraph: {
    title: "Neroa | Guided product planning and building",
    description:
      "Explain the idea, shape the roadmap, review previews and inspection, and move through approvals without carrying the internal complexity yourself.",
    url: "https://neroa.io/",
    siteName: "Neroa",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Neroa | Strategy Room first",
    description:
      "Neroa guides the product from idea to roadmap, preview, inspection, revisions, and approvals in one premium build flow."
  }
};

const strategyRoomSteps = [
  {
    label: "Explain the idea",
    description:
      "Start in Strategy Room by describing what you want to build, who it serves, and what the first outcome needs to be."
  },
  {
    label: "Shape the roadmap",
    description:
      "Turn the product conversation into a guided roadmap that clarifies the first release, the next priorities, and what should wait."
  },
  {
    label: "Review preview and inspection",
    description:
      "Keep progress readable with previews, inspection, and product context before approvals lock in the next move."
  },
  {
    label: "Approve and revise",
    description:
      "Request changes, approve the right next step, and keep the build moving without losing the product thread."
  }
] as const;

const experienceCards = [
  {
    title: "Strategy Room first",
    description:
      "The customer starts with a guided planning conversation instead of a raw tool stack or exposed internal lanes."
  },
  {
    title: "Roadmap with context",
    description:
      "Neroa keeps the roadmap tied to the idea, the customer, and the first release so the build stays focused."
  },
  {
    title: "Preview, progress, and approvals",
    description:
      "Review what is changing, inspect what is ready, and approve the next move from one connected customer-facing flow."
  }
] as const;

export default async function LandingPage() {
  const user = await getOptionalUser();

  return (
    <main className="min-h-screen overflow-hidden bg-[#060816] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_48%)]" />
      <div className="pointer-events-none absolute right-[-10rem] top-[9rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.2),transparent_58%)] blur-3xl" />

      <SiteHeader
        userEmail={user?.email ?? undefined}
        ctaHref="/start"
        ctaLabel="Start planning"
      />

      <div className="shell relative pb-20 pt-6">
        <section className="grid gap-10 py-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:py-18">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.08] px-4 py-2 text-sm text-cyan-100/84">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.82)]" />
              Strategy Room first
            </div>

            <h1 className="mt-7 text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl xl:text-[5.4rem]">
              Turn the idea into a guided product build.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Neroa helps you explain the product, shape the roadmap, review previews and
              inspection, and move through approvals without carrying the internal complexity
              yourself.
            </p>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
              The customer should feel one premium product flow from planning through execution.
              Strategy Room, roadmap, preview, inspection, approvals, and revisions all stay in
              the same Neroa experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="button-primary">
                Start planning
              </Link>
              <Link href="/auth" className="button-secondary">
                Continue in Neroa
              </Link>
            </div>
          </div>

          <div className="surface-main overflow-hidden p-4">
            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,12,24,0.98),rgba(13,18,32,0.94))] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                  Guided product flow
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {strategyRoomSteps.map((step, index) => (
                  <div
                    key={step.label}
                    className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/22 bg-cyan-300/[0.08] text-xs font-semibold text-cyan-100">
                        0{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{step.label}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
              Why this feels different
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Keep the product clear while Neroa handles the complexity.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-400">
              Customers should not feel internal lanes, infrastructure, or operator tooling. Neroa
              keeps the complexity behind the product shell and keeps the build readable from the
              first plan to the next approval.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {experienceCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6"
              >
                <p className="text-lg font-semibold text-white">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-10">
          <div className="surface-main overflow-hidden px-6 py-10 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
                  Continue into Neroa
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Start with the plan, then let Neroa carry the build forward.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  Open Strategy Room, shape the roadmap, and move into previews, inspections,
                  approvals, and revisions from the same customer-facing flow.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/start" className="button-primary">
                  Start planning
                </Link>
                <Link href="/auth" className="button-secondary">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
