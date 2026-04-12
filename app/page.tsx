import Link from "next/link";
import NeroaLogo from "@/components/brand/neroa-logo";
import { howItWorksPages, useCasePages } from "@/lib/marketing-pages";
import { getVisibleLanes } from "@/lib/workspace/lanes";

export const dynamic = "force-static";

export default function LandingPage() {
  const lanes = getVisibleLanes();

  return (
    <main className="min-h-screen overflow-hidden bg-[#060816] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_54%)]" />
      <div className="pointer-events-none absolute right-[-12rem] top-[10rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18),transparent_58%)] blur-3xl" />

      <div className="shell relative pb-20 pt-6">
        <header className="panel flex items-center justify-between px-5 py-4 sm:px-7">
          <div className="flex items-center gap-4">
            <NeroaLogo className="h-14 w-auto sm:h-16" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white/90">Neroa</p>
              <p className="mt-1 text-sm text-slate-400">
                Lane-based workspaces for building and execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth" className="button-secondary">
              Sign in
            </Link>
            <Link href="/auth" className="button-primary">
              Open Neroa
            </Link>
          </div>
        </header>

        <section className="grid gap-10 py-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.08] px-4 py-2 text-sm text-cyan-100/84">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.82)]" />
              Structured execution for serious work
            </div>

            <h1 className="mt-7 text-5xl font-semibold leading-[0.92] tracking-[-0.045em] text-white sm:text-6xl xl:text-[5.3rem]">
              Build with multiple AIs in one workspace
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              Neroa is a premium workspace that helps teams turn ideas into execution by routing work into the right lanes for planning, websites, SaaS, marketing, operations, and more.
            </p>

            <p className="mt-4 max-w-lg text-base leading-7 text-slate-400">
              Move from idea to action without a giant form or a cluttered UI by using one shared shell with focused execution lanes.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth" className="button-primary">
                Open Neroa
              </Link>
              <Link href="/how-it-works" className="button-secondary">
                See how it works
              </Link>
            </div>
          </div>

          <div className="surface-main overflow-hidden p-4">
            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,12,24,0.98),rgba(13,18,32,0.94))] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                  Neroa lanes
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="rounded-[24px] bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Guided routing
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-slate-200">
                      Describe the work and Neroa will route it into the right workspace lanes.
                    </div>
                    <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(59,130,246,0.16),rgba(139,92,246,0.18))] px-4 py-4 text-sm leading-7 text-white">
                      I want to start a contract screen printing business and figure out the website, marketing, and operations.
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Workspace lanes
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {lanes.map((lane) => (
                        <div key={lane.id} className="rounded-2xl border border-white/8 bg-[#090f1d] p-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-xs font-semibold text-white">
                              {lane.icon}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">{lane.name}</p>
                              <p className="text-xs text-slate-500">{lane.layoutType}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[22px] bg-white/[0.03] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Step 1
                      </p>
                      <p className="mt-3 text-sm font-semibold text-white">Describe the build</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">Start with the work itself.</p>
                    </div>
                    <div className="rounded-[22px] bg-white/[0.03] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Step 2
                      </p>
                      <p className="mt-3 text-sm font-semibold text-white">Neroa scopes it</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">The system routes work into the right lanes.</p>
                    </div>
                    <div className="rounded-[22px] bg-white/[0.03] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Step 3
                      </p>
                      <p className="mt-3 text-sm font-semibold text-white">Workspace begins</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">Execution starts inside the right lanes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
                Lane architecture
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                One shared shell, multiple focused lanes
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-400">
                Neroa keeps the product simple by using one workspace shell and a reusable lane system. The platform changes focus without becoming a completely different app.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lanes.map((lane) => (
                <div key={lane.id} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-xs font-semibold text-white">
                      {lane.icon}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-white">{lane.name}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{lane.layoutType}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{lane.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
                Use cases
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                From business planning to ongoing operations, Neroa stays focused on execution
              </h2>
            </div>
            <Link href="/auth" className="button-secondary">
              Open Neroa
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {useCasePages.map((page) => (
              <Link
                key={page.slug}
                href={`/use-cases/${page.slug}`}
                className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 transition hover:border-white/16 hover:bg-white/[0.05]"
              >
                <p className="text-xl font-semibold text-white">{page.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{page.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
                How it works
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Start with the work, move into lanes, then execute in one shared shell
              </h2>
            </div>
            <Link href="/how-it-works" className="button-secondary">
              View the full outline
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {howItWorksPages.map((item) => (
              <Link
                key={item.slug}
                href={`/how-it-works/${item.slug}`}
                className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 transition hover:border-white/16 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                  {item.index}
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-12">
          <div className="surface-main overflow-hidden px-6 py-10 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
                  Open Neroa
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Get the structure right before the work gets messy
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  Neroa gives you a cleaner path: describe the work, route it into the right execution lanes, then build inside a workspace designed for real NeuroEngines.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/auth" className="button-primary">
                  Open Neroa
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
