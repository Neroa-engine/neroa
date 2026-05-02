import Link from "next/link";

const conversationMoments = [
  {
    speaker: "Neroa",
    tone: "assistant",
    line: "Hi, I\u2019m Neroa. What should we build?",
    detail: "Start with a structured plan, not a vague prompt."
  },
  {
    speaker: "Visitor",
    tone: "visitor",
    line: "I want to build a SaaS platform for my business.",
    detail: "A clear product goal gives Neroa the context to shape roadmap, scope, and approvals."
  },
  {
    speaker: "Neroa",
    tone: "assistant",
    line:
      "Great. I\u2019ll help turn that into a structured roadmap, define scope, surface key decisions, and prepare a clean project workspace before execution begins.",
    detail: "Build with roadmap, scope, approvals, and evidence from the start."
  }
] as const;

const valueSections = [
  {
    title: "Roadmap-first planning",
    body: "Shape the work before it becomes code."
  },
  {
    title: "Scope before execution",
    body: "Keep the project bounded, reviewable, and intentional."
  },
  {
    title: "Decisions and approvals",
    body: "Move forward with visible approvals and next steps."
  },
  {
    title: "Evidence and review",
    body: "Keep progress tied to proof, feedback, and review."
  }
] as const;

export function NeroaFrontDoorSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] px-5 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.10),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(226,232,240,0.08),transparent_20%),linear-gradient(180deg,rgba(7,10,15,0.82)_0%,rgba(5,7,11,0.96)_58%,rgba(5,7,11,1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:160px_160px] opacity-16" />
        <div className="absolute inset-x-[26%] top-[6%] h-72 bg-[radial-gradient(ellipse_at_center,rgba(226,232,240,0.12)_0%,rgba(45,212,191,0.05)_26%,transparent_66%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-col gap-10">
        <header className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.38em] text-slate-100">Neroa</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                SaaS done right
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              <Link href="/" className="transition hover:text-slate-200">
                Home
              </Link>
              <Link href="/neroa" className="transition hover:text-slate-200">
                Pricing
              </Link>
              <Link href="/neroa/auth" className="transition hover:text-slate-200">
                Sign in
              </Link>
              <Link
                href="/neroa/auth"
                className="inline-flex items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 px-5 py-2.5 text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
              >
                Start your project
              </Link>
            </nav>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
        </header>

        <section className="grid gap-8 xl:grid-cols-[0.92fr,1.08fr] xl:items-start">
          <div className="space-y-5 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-teal-200">
              Public-facing project intake
            </p>
            <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] text-slate-50 sm:text-6xl xl:text-[5.2rem]">
              SaaS done right.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Start with a structured plan, not a vague prompt.
            </p>
            <p className="max-w-2xl text-[1.02rem] leading-8 text-slate-300">
              Neroa helps shape software ideas into roadmap, scope, decisions, approvals, and a
              clear project path before execution begins.
            </p>
          </div>

          <article className="relative overflow-hidden rounded-[2.1rem] border border-white/8 bg-[linear-gradient(180deg,rgba(10,13,18,0.94),rgba(5,8,12,0.98))] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.42)] md:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.10),transparent_26%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.02)_52%,transparent_100%)]" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
                    Public-facing chat intake box
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                    Tell Neroa what you want to build, and start from a clear project conversation.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Guided intake
                </div>
              </div>

              <div className="space-y-4">
                {conversationMoments.map((moment, index) => (
                  <article
                    key={moment.line}
                    className={
                      moment.tone === "assistant"
                        ? "rounded-[1.6rem] border border-teal-300/16 bg-[linear-gradient(135deg,rgba(45,212,191,0.10)_0%,rgba(255,255,255,0.03)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        : "ml-auto max-w-[88%] rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          {moment.speaker}
                        </p>
                        <h2 className="font-serif text-[1.42rem] leading-tight text-slate-50">
                          {moment.line}
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-slate-300">{moment.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-2xl text-sm leading-7 text-slate-300">
                  Build with roadmap, scope, approvals, and evidence from the start.
                </p>
                <Link
                  href="/neroa/auth"
                  className="inline-flex items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 px-7 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
                >
                  Start your project
                </Link>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          {valueSections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
                {section.title}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{section.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
