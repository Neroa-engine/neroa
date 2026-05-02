import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";

const conversationMoments = [
  {
    speaker: "Neroa",
    tone: "assistant",
    line: "Hi, I’m Neroa. What’s your name?",
    detail:
      "A calm front-door prompt that opens the project conversation without pretending live chat is already active."
  },
  {
    speaker: "Visitor",
    tone: "visitor",
    line: "My name is Tom.",
    detail: "A simple example response that shows how the entry flow begins."
  },
  {
    speaker: "Neroa",
    tone: "assistant",
    line: "Tell me what you want to build, and I’ll help shape the path.",
    detail:
      "From the first exchange, the goal is to move toward a structured roadmap, visible scope, and clear next steps."
  }
] as const;

const capabilityCards = [
  {
    eyebrow: "What Neroa Does",
    title: "Turns an opening conversation into a structured project roadmap.",
    body:
      "Neroa helps turn an idea into a structured project roadmap, clear scope, decision points, and the next steps that matter before execution begins."
  },
  {
    eyebrow: "How Projects Move",
    title: "Moves from conversation to project clarity without tool sprawl.",
    body:
      "After the first exchange, Neroa organizes roadmap direction, scope, decisions, and a clean workspace path so the project can move forward intentionally."
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

const explanationPoints = [
  "Structured roadmap",
  "Clear scope",
  "Visible decisions",
  "Next steps",
  "Clean project workspace"
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
                  Hi, I’m Neroa. What’s your name?
                </h1>
                <p className="max-w-3xl text-base leading-8 text-slate-300">
                  Neroa helps turn an idea into a structured project roadmap, scope, decisions,
                  next steps, and a clean project workspace before execution begins.
                </p>
              </div>

              <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-200">
                    Conversational Preview
                  </p>
                  <span className="rounded-full border border-slate-300/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Preview Only
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  <article className="ml-0 max-w-2xl rounded-[1.4rem] border border-teal-300/15 bg-teal-300/10 px-5 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-100">
                      Neroa
                    </p>
                    <p className="mt-2 text-base leading-8 text-slate-50">
                      Hi, I’m Neroa. What’s your name?
                    </p>
                  </article>

                  <article className="ml-auto max-w-xl rounded-[1.4rem] border border-white/10 bg-white/6 px-5 py-4 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Visitor Example
                    </p>
                    <p className="mt-2 text-base leading-8 text-slate-100">My name is Tom.</p>
                  </article>

                  <article className="max-w-3xl rounded-[1.4rem] border border-white/8 bg-white/5 px-5 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-100">
                      What Happens Next
                    </p>
                    <p className="mt-3 text-sm leading-8 text-slate-300">
                      Start with the product you want to build. Neroa turns that opening
                      conversation into a structured roadmap, clearer scope, visible decisions, and
                      the next steps that lead into a clean project workspace built around
                      strategy, command, evidence, and approvals.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {explanationPoints.map((point) => (
                        <span
                          key={point}
                          className="rounded-full border border-white/8 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </article>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/neroa/auth"
                  className="rounded-full border border-teal-300/30 bg-teal-300/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
                >
                  Let’s begin your project
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
                Conversation Rhythm
              </p>
              <div className="mt-5 space-y-3">
                {conversationMoments.map((moment, index) => (
                  <article
                    key={moment.line}
                    className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={
                          moment.tone === "assistant"
                            ? "mt-0.5 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-100"
                            : "mt-0.5 rounded-full border border-slate-300/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300"
                        }
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          {moment.speaker}
                        </p>
                        <h2 className="font-serif text-xl text-slate-50">{moment.line}</h2>
                        <p className="text-sm leading-7 text-slate-300">{moment.detail}</p>
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
                  Use the clean Neroa front door to preview the conversation style, understand how
                  Neroa frames scope before execution, and move toward the account and project
                  shells without introducing live runtime behavior yet.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/neroa/auth"
                className="rounded-full border border-teal-300/30 bg-teal-300/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
              >
                Let’s begin your project
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
