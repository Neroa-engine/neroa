import Link from "next/link";
import { NeroaPortalNavigation } from "@/components/neroa-portal/neroa-portal-navigation";

const conversationMoments = [
  {
    speaker: "Neroa",
    tone: "assistant",
    line: "Hi, I\u2019m Neroa. What\u2019s your name?",
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
    line:
      "Neroa helps turn an idea into a structured project roadmap, scope, decisions, next steps, and a clean project workspace before execution begins.",
    detail:
      "The front door stays project-first, with guardrails and control in place before execution begins."
  }
] as const;

const surfaceSignals = [
  {
    label: "Strategy Room Tone",
    value: "Calm framing for idea, scope, and roadmap clarity."
  },
  {
    label: "Command Center Calm",
    value: "Quiet signal accents, visible decisions, and controlled movement."
  },
  {
    label: "Workspace Entry",
    value: "A clean project workspace begins only after the project is understood."
  }
] as const;

const explanationPoints = [
  "Structured roadmap",
  "Clear scope",
  "Visible decisions",
  "Next steps",
  "Clean project workspace"
] as const;

const governancePoints = [
  "Project-first entry before execution pressure",
  "Visible scope, checkpoints, and approvals",
  "Guardrails and control stay in place before execution"
] as const;

const controlPanels = [
  {
    eyebrow: "Idea to Roadmap",
    title: "A private front door for shaping the work before anything executes.",
    body:
      "Neroa helps turn an idea into a structured project roadmap, scope, decisions, next steps, and a clean project workspace before execution begins."
  },
  {
    eyebrow: "Scope and Decisions",
    title: "The first movement is clarity, not pricing pressure or execution theater.",
    body:
      "Pricing and execution options follow after Neroa understands the project scope, so the front door can stay intentional, reviewable, and calm."
  },
  {
    eyebrow: "Guardrails and Control",
    title: "The surface stays placeholder-only while the direction stays premium.",
    body:
      "No forms, fake connected states, or live submission paths are active here, and no live authentication, billing runtime, or project execution wiring is implied."
  }
] as const;

export function NeroaFrontDoorSurface() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] px-6 py-6 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(148,163,184,0.14),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(10,14,20,0.96),rgba(5,7,11,1)_68%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:140px_140px] opacity-25" />
        <div className="absolute inset-y-0 left-[12%] w-px bg-gradient-to-b from-transparent via-white/14 to-transparent" />
        <div className="absolute inset-y-0 right-[10%] w-px bg-gradient-to-b from-transparent via-teal-300/12 to-transparent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-col gap-8">
        <div className="pt-2">
          <NeroaPortalNavigation currentPath="/neroa" tone="dark" className="border-white/6 bg-white/[0.03] shadow-none" />
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <article className="relative overflow-hidden rounded-[2.6rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,14,19,0.94)_0%,rgba(7,10,15,0.98)_56%,rgba(4,6,10,1)_100%)] px-8 py-10 shadow-[0_38px_120px_rgba(0,0,0,0.48)] md:px-10 md:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_30%),radial-gradient(circle_at_86%_16%,rgba(226,232,240,0.08),transparent_22%)]" />
            <div className="relative flex h-full flex-col gap-10">
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
                <span className="text-teal-200/95">Neroa</span>
                <span className="h-px w-16 bg-white/12" />
                <span>Private Front Door</span>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="space-y-7">
                  <div className="space-y-5">
                    <p className="max-w-2xl text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                      Dark luxury Strategy Room + Command Center direction
                    </p>
                    <h1 className="max-w-4xl font-serif text-4xl leading-[1.04] text-slate-50 sm:text-5xl lg:text-[4.4rem]">
                      {"Hi, I\u2019m Neroa. What\u2019s your name?"}
                    </h1>
                    <div className="max-w-3xl space-y-4 text-[1.02rem] leading-8 text-slate-300">
                      <p>
                        Neroa helps turn an idea into a structured project roadmap, scope,
                        decisions, next steps, and a clean project workspace before execution
                        begins.
                      </p>
                      <p className="text-sm text-slate-400">
                        Guardrails and control stay close before execution begins.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {surfaceSignals.map((signal) => (
                      <article
                        key={signal.label}
                        className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-200/90">
                          {signal.label}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{signal.value}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <aside className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(15,23,32,0.12)_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
                      Surface Notes
                    </p>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Preview Only
                    </span>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Material Direction
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        Charcoal command canvas, soft silver system text, subtle teal signal
                        accents, and spacious premium spacing replace the old marketing landing
                        feel.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Front-Door Rule
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        This page moves users toward starting a project, not choosing an execution
                        model.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="flex flex-col gap-4 rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_0%,rgba(45,212,191,0.05)_100%)] px-6 py-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-200">
                    Next Step
                  </p>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300">
                    Use the clean Neroa front door to preview the conversation style and continue
                    into the placeholder auth route without introducing live runtime behavior yet.
                  </p>
                </div>

                <Link
                  href="/neroa/auth"
                  className="inline-flex items-center justify-center rounded-full border border-teal-300/30 bg-teal-300/10 px-7 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-teal-100 transition hover:border-teal-200/70 hover:bg-teal-300/16"
                >
                  {"Let\u2019s begin your project"}
                </Link>
              </div>

              <p className="max-w-2xl text-sm leading-7 text-slate-500">
                Front-door preview only. These routes introduce the clean Neroa entry surfaces and
                do not imply live authentication, pricing checkout, billing runtime, or project
                execution wiring yet.
              </p>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(10,13,18,0.96)_0%,rgba(5,8,12,0.99)_100%)] p-7 shadow-[0_38px_110px_rgba(0,0,0,0.48)] md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.10),transparent_24%)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-200">
                    Conversational Preview
                  </p>
                  <p className="text-sm leading-7 text-slate-400">
                    Quiet confidence, structured movement, and no fake live chat state.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Conversation Rhythm
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {conversationMoments.map((moment, index) => (
                  <article
                    key={moment.line}
                    className={
                      moment.tone === "assistant"
                        ? "rounded-[1.65rem] border border-teal-300/16 bg-[linear-gradient(135deg,rgba(45,212,191,0.12)_0%,rgba(255,255,255,0.03)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "ml-auto max-w-[88%] rounded-[1.65rem] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          {moment.speaker}
                        </p>
                        <h2 className="font-serif text-[1.6rem] leading-tight text-slate-50">
                          {moment.line}
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-slate-300">{moment.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 rounded-[1.9rem] border border-white/8 bg-white/[0.03] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
                    What Happens Next
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Project-First
                  </p>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-8 text-slate-300">
                  <p>
                    Neroa helps turn an idea into a structured project roadmap, scope, decisions,
                    next steps, and a clean project workspace before execution begins.
                  </p>
                  <p className="text-slate-400">
                    Guardrails and control stay visible before execution begins, so the first move
                    is clarity before pricing and execution options appear.
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {explanationPoints.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-white/8 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
          <article className="rounded-[2.4rem] border border-white/8 bg-[linear-gradient(160deg,rgba(8,12,16,0.96)_0%,rgba(5,8,11,0.99)_100%)] p-8 shadow-[0_34px_100px_rgba(0,0,0,0.42)] md:p-9">
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-200">
                  Control Strip
                </p>
                <h2 className="max-w-3xl font-serif text-3xl leading-tight text-slate-50 md:text-[2.45rem]">
                  Spacious premium layout, calm futuristic tone, and no old landing-page energy.
                </h2>
                <p className="max-w-3xl text-sm leading-8 text-slate-300">
                  The front door stays wordmark-first, spacious, and intentionally quiet. No
                  pricing table or execution model choice appears at the front door.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {controlPanels.map((panel) => (
                  <article
                    key={panel.title}
                    className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-200/90">
                      {panel.eyebrow}
                    </p>
                    <h3 className="mt-4 font-serif text-2xl leading-tight text-slate-50">
                      {panel.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{panel.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[2.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(6,10,14,0.94)_100%)] p-8 shadow-[0_34px_100px_rgba(0,0,0,0.42)] md:p-9">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-200">
                  Governance and Control
                </p>
                <h2 className="font-serif text-3xl leading-tight text-slate-50">
                  Visible movement, quiet confidence, and reviewable project starts.
                </h2>
                <p className="text-sm leading-8 text-slate-300">
                  Neroa moves a project forward by organizing scope before execution, making
                  reviewable decisions visible, and keeping approvals close to the roadmap instead
                  of burying them behind disconnected tools.
                </p>
              </div>

              <div className="space-y-3">
                {governancePoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-4 rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-4"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-300/80 shadow-[0_0_18px_rgba(45,212,191,0.45)]" />
                    <p className="text-sm leading-7 text-slate-200">{point}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.7rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                  Scope Notes
                </p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  <p>Pricing and execution options follow after Neroa understands the project scope.</p>
                  <p>No forms, fake connected states, or live submission paths are active here.</p>
                  <p>No pricing table or execution model choice appears at the front door.</p>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
