import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { PublicActionLink } from "@/components/site/public-action-link";

export default function EarlyAccessPage() {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
              Get started
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[5.2rem] xl:leading-[0.95]">
              Neroa is live and ready to help you build with coordinated AI.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600 sm:text-xl">
              Start with Neroa, choose the right build path, and move from idea to MVP, budget, validation, build, and launch using the working Neroa system.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PublicActionLink href="/start" label="Start your build" className="button-primary">
                Start your build
              </PublicActionLink>
              <Link href="/use-cases" className="button-secondary">
                Explore use cases
              </Link>
              <Link href="/support" className="button-secondary">
                Get support
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                [
                  "What to build",
                  "Choose between SaaS, internal software, and external apps so the system can shape the right next step."
                ],
                [
                  "How it works",
                  "Neroa frames the work first, then specialist AI systems expand execution only where the build needs them."
                ],
                [
                  "Where to go next",
                  "Use pricing, support, and use cases to understand fit, then start your build when you are ready."
                ]
              ].map(([title, description]) => (
                <div key={title} className="floating-plane rounded-[26px] p-5">
                  <div className="floating-wash rounded-[26px]" />
                  <div className="relative">
                    <p className="text-sm font-semibold text-slate-950">{title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="floating-plane relative overflow-hidden rounded-[36px] p-6 sm:p-8">
            <div className="floating-wash rounded-[36px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
                Live product flow
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                One focused system from build path to engine creation.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Neroa is live as a coordinated AI build system for SaaS, internal software, and external apps. Start with the build path, move into Neroa intake, and let the system open the right engine structure.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  "Start with Neroa as the control layer",
                  "Choose the right build category before execution begins",
                  "Use pricing to understand Engine Credits and plan capacity",
                  "Move into support or contact if you need a human answer"
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[24px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(139,92,246,0.1))] px-5 py-5">
                <p className="text-sm font-semibold text-slate-950">Start path</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Start your build directly, or use Contact and Support first if you want help choosing the right path before you enter the product flow.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <PublicActionLink
                    href="/start"
                    label="Start your build"
                    className="text-sm font-medium text-cyan-700 transition hover:text-cyan-800"
                  >
                    Start your build
                  </PublicActionLink>
                  <Link href="/instructions" className="text-sm font-medium text-cyan-700 transition hover:text-cyan-800">
                    Read instructions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingInfoShell>
  );
}
