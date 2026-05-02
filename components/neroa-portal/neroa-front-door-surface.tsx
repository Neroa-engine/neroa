import Link from "next/link";

const conversationMoments = [
  {
    speaker: "Neroa",
    tone: "assistant",
    line: "Hi, I\u2019m Neroa. What should we build?",
    detail: "Start with the outcome you want, and shape it into a real software project."
  },
  {
    speaker: "Visitor",
    tone: "visitor",
    line: "I want to build a SaaS platform for my business.",
    detail: "A clear goal gives Neroa the context to shape roadmap, scope, and direction."
  },
  {
    speaker: "Neroa",
    tone: "assistant",
    line:
      "Great. I\u2019ll help turn that into a structured roadmap, define scope, surface key decisions, and prepare a clean project workspace before execution begins.",
    detail: "Build with guardrails, approvals, evidence, and direction from the start."
  }
] as const;

const signalPoints = [
  "Roadmap",
  "Scope",
  "Decisions",
  "Approvals",
  "Evidence"
] as const;

const previewPanels = [
  {
    eyebrow: "Roadmap-first",
    title: "Structured before it is built",
    body:
      "Neroa turns your idea into a roadmap, scope, decisions, and a clear project path before execution begins."
  },
  {
    eyebrow: "Scope-aware",
    title: "Plan with direction, not drift",
    body:
      "Start with a structured plan, not a vague prompt, so the project stays intentional, reviewable, and calm from the beginning."
  },
  {
    eyebrow: "Controlled execution",
    title: "Guardrails stay close",
    body:
      "Neroa helps organize approvals, evidence, and key decisions before build work moves forward."
  }
] as const;

export function NeroaFrontDoorSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] px-6 py-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(45,212,191,0.16),transparent_30%),radial-gradient(circle_at_84%_12%,rgba(226,232,240,0.10),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(10,14,20,0.96),rgba(5,7,11,1)_68%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:160px_160px] opacity-20" />
        <div className="absolute left-[9%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/14 to-transparent" />
        <div className="absolute right-[11%] top-0 h-full w-px bg-gradient-to-b from-transparent via-teal-300/12 to-transparent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[92rem] flex-col gap-8">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-teal-200/95">
              Neroa
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Structured SaaS planning
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            SaaS done right
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
          <article className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(8,12,16,0.95)_0%,rgba(5,8,11,0.99)_100%)] px-8 py-10 shadow-[0_42px_130px_rgba(0,0,0,0.5)] md:px-10 md:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_28%),radial-gradient(circle_at_84%_20%,rgba(226,232,240,0.08),transparent_24%)]" />
            <div className="relative flex h-full flex-col gap-10">
              <div className="space-y-6">
                <p className="max-w-2xl text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                  A better way to plan and build software
                </p>
                <h1 className="max-w-4xl font-serif text-4xl leading-[1.02] text-slate-50 sm:text-5xl lg:text-[4.6rem]">
                  SaaS done right.
                </h1>
                <div className="max-w-3xl space-y-4 text-[1.02rem] leading-8 text-slate-300">
                  <p>
                    Start with a structured plan, not a vague prompt. Tell Neroa what you want to
                    build. We\u2019ll shape it into a real project.
                  </p>
                  <p className="text-sm text-slate-400">
                    Neroa turns your idea into a roadmap, scope, decisions, and a clear project
                    path before execution begins.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {conversationMoments.map((moment, index) => (
                  <article
                    key={moment.line}
                    className={
                      moment.tone === "assistant"
                        ? "rounded-[1.9rem] border border-teal-300/16 bg-[linear-gradient(135deg,rgba(45,212,191,0.11)_0%,rgba(255,255,255,0.03)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        : "ml-auto max-w-[86%] rounded-[1.9rem] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          {moment.speaker}
                        </p>
                        <h2 className="font-serif text-[1.65rem] leading-tight text-slate-50">
                          {moment.line}
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-slate-300">{moment.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex flex-col gap-5 rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_0%,rgba(45,212,191,0.04)_100%)] px-6 py-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
                    Guided project setup
                  </p>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300">
                    Bring the idea, the product shape, or the problem you want solved. Neroa helps
                    turn it into a roadmap-first plan with clear scope and decisions.
                  </p>
                </div>

                <Link
                  href="/neroa/auth"
                  className="inline-flex items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 px-7 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
                >
                  Start your project
                </Link>
              </div>
            </div>
          </article>

          <aside className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(10,13,18,0.96)_0%,rgba(5,8,12,0.99)_100%)] p-7 shadow-[0_40px_120px_rgba(0,0,0,0.48)] md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.11),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(226,232,240,0.08),transparent_22%)]" />
            <div className="relative space-y-6">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
                  Structured SaaS building
                </p>
                <h2 className="font-serif text-3xl leading-tight text-slate-50">
                  Roadmap-first planning with calm control from day one.
                </h2>
                <p className="text-sm leading-8 text-slate-300">
                  Not just open-ended AI chat. Not a vague plan. Not uncontrolled coding.
                </p>
              </div>

              <div className="grid gap-4">
                {previewPanels.map((panel) => (
                  <article
                    key={panel.title}
                    className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-200/90">
                      {panel.eyebrow}
                    </p>
                    <h3 className="mt-4 font-serif text-[1.8rem] leading-tight text-slate-50">
                      {panel.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{panel.body}</p>
                  </article>
                ))}
              </div>

              <div className="rounded-[1.9rem] border border-white/8 bg-black/20 p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
                    What Neroa Shapes
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Spacious premium styling
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {signalPoints.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300"
                    >
                      {point}
                    </span>
                  ))}
                </div>
                <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                  <p>Build with guardrails, approvals, evidence, and direction from the start.</p>
                  <p>A better way to plan and build software begins with a project that is clear, scoped, and reviewable.</p>
                  <p>Neroa is designed for guided project setup before execution begins.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
