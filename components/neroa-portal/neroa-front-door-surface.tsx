import Link from "next/link";

const conversationMoments = [
  {
    speaker: "Neroa",
    tone: "assistant",
    line: "Hi, I\u2019m Neroa. What should we build?",
    detail: "Start with the outcome you want, and shape it into a structured software project."
  },
  {
    speaker: "Visitor",
    tone: "visitor",
    line: "I want to build a SaaS platform for my business.",
    detail: "A clear goal gives Neroa the context to shape roadmap, scope, and approvals."
  },
  {
    speaker: "Neroa",
    tone: "assistant",
    line:
      "Great. I\u2019ll help turn that into a structured roadmap, define scope, surface key decisions, and prepare a clean project workspace before execution begins.",
    detail: "Build with guardrails, approvals, evidence, and direction from the start."
  }
] as const;

const dashboardCards = [
  {
    label: "Roadmap Progress",
    value: "68%",
    detail: "Structured milestones are already mapped into a clear project path."
  },
  {
    label: "Decisions Pending",
    value: "04",
    detail: "Key product calls stay visible before execution begins."
  },
  {
    label: "Scope Status",
    value: "Aligned",
    detail: "Scope stays bounded, reviewable, and calm from the beginning."
  },
  {
    label: "Project Readiness",
    value: "82%",
    detail: "Roadmap, approvals, and next steps are ready to move forward."
  }
] as const;

const supportCards = [
  {
    eyebrow: "Roadmap-first planning",
    body: "Turn the idea into a structured path before build work begins."
  },
  {
    eyebrow: "Scope before execution",
    body: "Set boundaries early so the work stays clear, reviewable, and grounded."
  },
  {
    eyebrow: "Decisions and approvals",
    body: "Keep product choices visible and aligned before momentum turns into drift."
  },
  {
    eyebrow: "Evidence and review",
    body: "Build toward confidence with a project record that stays easy to understand."
  }
] as const;

export function NeroaFrontDoorSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070c] px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_26%),radial-gradient(circle_at_82%_10%,rgba(226,232,240,0.10),transparent_22%),linear-gradient(180deg,rgba(7,10,15,0.86)_0%,rgba(4,7,12,0.98)_58%,rgba(3,5,9,1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:150px_150px] opacity-20" />
        <div className="absolute inset-x-[24%] top-[8%] h-[44rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(226,232,240,0.16)_0%,rgba(148,163,184,0.04)_30%,transparent_58%)] blur-3xl" />
        <div className="absolute right-[7%] top-[8%] h-[24rem] w-[24rem] rounded-full border border-white/10 bg-[radial-gradient(circle_at_42%_38%,rgba(226,232,240,0.34)_0%,rgba(125,211,252,0.14)_18%,rgba(11,15,21,0.12)_36%,rgba(4,7,12,0.96)_58%,transparent_72%)] shadow-[0_0_140px_rgba(226,232,240,0.08)]" />
        <div className="absolute right-[2%] top-[24%] h-[22rem] w-[36rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.10)_0%,rgba(45,212,191,0.05)_24%,transparent_66%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-[20%] h-px bg-gradient-to-r from-transparent via-teal-200/35 to-transparent" />
        <div className="absolute inset-x-[18%] bottom-[18%] h-40 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.16)_0%,rgba(45,212,191,0.08)_22%,transparent_68%)] blur-3xl" />
        <div className="absolute left-[5%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[96rem] flex-col gap-6">
        <header className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.38em] text-slate-100">Neroa</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                Structured SaaS planning
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Strategy Room + Command Center
              </span>
              <Link
                href="/neroa/auth"
                className="inline-flex items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
              >
                Start your project
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.04fr,0.96fr]">
          <article className="relative overflow-hidden rounded-[2.7rem] border border-white/8 bg-[linear-gradient(160deg,rgba(9,12,17,0.94)_0%,rgba(4,7,12,0.98)_100%)] p-6 shadow-[0_42px_130px_rgba(0,0,0,0.52)] md:p-8">
            <div className="absolute inset-y-0 left-0 w-[5.25rem] border-r border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
            <div className="pointer-events-none absolute left-[2.6rem] top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-teal-200/18 to-transparent" />

            <div className="relative grid gap-8 lg:grid-cols-[5.25rem,1fr]">
              <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-4">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-teal-200 shadow-[0_0_24px_rgba(153,246,228,0.9)]" />
                <span className="h-2 w-2 rounded-full bg-white/25" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
              </div>

              <div className="space-y-8">
                <div className="space-y-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
                    A better way to plan and build software
                  </p>
                  <h1 className="max-w-3xl font-serif text-5xl leading-[0.96] text-slate-50 sm:text-6xl xl:text-[5.4rem]">
                    SaaS done right.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-300">
                    Start with a structured plan, not a vague prompt.
                  </p>
                  <p className="max-w-2xl text-[1.02rem] leading-8 text-slate-300">
                    Neroa turns your idea into roadmap, scope, decisions, approvals, and a clear
                    project path before execution begins.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/neroa/auth"
                    className="inline-flex items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 px-7 py-3 text-xs font-semibold uppercase tracking-[0.26em] text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
                  >
                    Start your project
                  </Link>
                  <p className="max-w-xl text-sm leading-7 text-slate-400">
                    Build with guardrails, approvals, evidence, and direction from the start.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-teal-200">
                      Roadmap-first
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      Shape the work before it becomes code.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-teal-200">
                      Scope-aware
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      Keep the project bounded, reviewable, and intentional.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-teal-200">
                      Decision-driven
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      Move forward with visible approvals and next steps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside className="relative overflow-hidden rounded-[2.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(10,13,18,0.94)_0%,rgba(5,8,12,0.99)_100%)] p-6 shadow-[0_42px_130px_rgba(0,0,0,0.56)] md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(226,232,240,0.20)_0%,rgba(125,211,252,0.10)_16%,rgba(9,12,18,0.08)_34%,transparent_52%),radial-gradient(circle_at_74%_20%,rgba(4,7,12,0.98)_0%,rgba(4,7,12,0.94)_24%,transparent_42%),radial-gradient(ellipse_at_72%_78%,rgba(45,212,191,0.18)_0%,rgba(45,212,191,0.08)_24%,transparent_64%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[linear-gradient(180deg,rgba(226,232,240,0.04)_0%,transparent_100%)]" />

            <div className="relative flex h-full flex-col gap-6">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-200">
                  Strategy Room + Command Center
                </p>
                <h2 className="max-w-xl font-serif text-3xl leading-tight text-slate-50 sm:text-[2.4rem]">
                  A moonlit command-center view of roadmap, scope, and project readiness.
                </h2>
                <p className="max-w-xl text-sm leading-8 text-slate-300">
                  Premium dashboard cards keep progress, decisions, and approvals visible before
                  execution begins.
                </p>
                <p className="max-w-xl text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Premium, spacious, and calm.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {dashboardCards.map((card, index) => (
                  <article
                    key={card.label}
                    className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          {card.label}
                        </p>
                        <p className="mt-4 font-serif text-[2rem] leading-none text-slate-50">
                          {card.value}
                        </p>
                      </div>
                      <div className="relative h-14 w-14 rounded-full border border-teal-300/18 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.24),rgba(45,212,191,0.04)_48%,transparent_68%)]">
                        <div className="absolute inset-2 rounded-full border border-white/8" />
                        <div
                          className="absolute inset-1 rounded-full border-2 border-transparent border-t-teal-200 border-r-teal-300/60"
                          style={{ transform: `rotate(${index * 38 + 18}deg)` }}
                        />
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-slate-300">{card.detail}</p>
                  </article>
                ))}
              </div>

              <div className="rounded-[2rem] border border-white/8 bg-black/25 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
                    Dashboard signal
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Charcoal shell • Soft silver framing • Subtle teal
                  </p>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      <span>Roadmap alignment</span>
                      <span>86%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/6">
                      <div className="h-2 w-[86%] rounded-full bg-[linear-gradient(90deg,rgba(45,212,191,0.95),rgba(125,211,252,0.55))]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      <span>Approval clarity</span>
                      <span>72%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/6">
                      <div className="h-2 w-[72%] rounded-full bg-[linear-gradient(90deg,rgba(45,212,191,0.85),rgba(226,232,240,0.48))]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.12fr,0.88fr]">
          <article className="relative overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(9,12,18,0.94),rgba(5,8,12,0.98))] p-6 shadow-[0_38px_120px_rgba(0,0,0,0.48)] md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(45,212,191,0.12),transparent_28%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.02)_48%,transparent_100%)]" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-200">
                    Premium intake panel
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    A guided project opening shaped like a premium product workflow, not a generic
                    chat box.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Guided project setup
                </div>
              </div>

              <div className="space-y-4">
                {conversationMoments.map((moment, index) => (
                  <article
                    key={moment.line}
                    className={
                      moment.tone === "assistant"
                        ? "rounded-[1.8rem] border border-teal-300/18 bg-[linear-gradient(135deg,rgba(45,212,191,0.10)_0%,rgba(255,255,255,0.03)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        : "ml-auto max-w-[88%] rounded-[1.8rem] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
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
                        <h3 className="font-serif text-[1.5rem] leading-tight text-slate-50">
                          {moment.line}
                        </h3>
                        <p className="max-w-2xl text-sm leading-7 text-slate-300">{moment.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </article>

          <aside className="rounded-[2.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(11,15,20,0.94),rgba(5,8,12,0.98))] p-6 shadow-[0_34px_100px_rgba(0,0,0,0.44)] md:p-8">
            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-200">
                Project path
              </p>
              <div className="space-y-4">
                <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Roadmap
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    A clear structure for milestones, priorities, and what comes next.
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Scope
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Defined boundaries so progress feels controlled instead of open-ended.
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Approvals
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Visible decision points that keep the work aligned before execution.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          {supportCards.map((card) => (
            <article
              key={card.eyebrow}
              className="rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.26)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
                {card.eyebrow}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{card.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
