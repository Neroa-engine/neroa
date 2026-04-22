"use client";

import { getPlanModuleDefinitions } from "@/lib/narua/planning";
import type { GeneratedPlan, ReviewAction } from "@/lib/narua/planning";

type NaruaPlanProps = {
  plan: GeneratedPlan;
  onAction: (action: ReviewAction) => void;
};

function ActionButton({
  action,
  children,
  onAction
}: {
  action: ReviewAction;
  children: string;
  onAction: (action: ReviewAction) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onAction(action)}
      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
    >
      {children}
    </button>
  );
}

export default function NaruaPlan({ plan, onAction }: NaruaPlanProps) {
  const modules = getPlanModuleDefinitions(plan);

  return (
    <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,29,0.98),rgba(13,18,34,0.94))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
            Guided build plan
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">{plan.title}</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">{plan.overview}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton action="refine" onAction={onAction}>
            Refine this plan
          </ActionButton>
          <ActionButton action="expand" onAction={onAction}>
            Expand a section
          </ActionButton>
          <ActionButton action="tasks" onAction={onAction}>
            Turn this into tasks
          </ActionButton>
          <ActionButton action="build_app" onAction={onAction}>
            Build this as an app
          </ActionButton>
        </div>
      </div>

      <div className="mt-8 grid gap-4 2xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Overview</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">{plan.projectSummary}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#090f1d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current build direction</p>
              <p className="mt-2 text-lg font-semibold text-white">{plan.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Neroa is shaping the first release around the clearest user outcome, then keeping
                preview, inspection, and approvals attached to the same thread.
              </p>
            </div>

            <div className="rounded-2xl bg-[#090f1d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What stays behind the scenes</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Internal routing, support systems, and execution mechanics stay behind Neroa so
                the customer experience can stay focused on the roadmap and the next approval.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Plan anchors</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-[#090f1d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Target user</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">{plan.targetUser}</p>
            </div>
            <div className="rounded-2xl bg-[#090f1d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Main goal</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">{plan.mainGoal}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 2xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">MVP / first phase</p>
          <div className="mt-4 space-y-3">
            {plan.mvpScope.map((item) => (
              <div key={item} className="rounded-2xl bg-[#090f1d] px-4 py-3 text-sm leading-7 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recommended modules</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module.id} className="rounded-2xl bg-[#090f1d] p-4">
                <p className="text-sm font-semibold text-white">{module.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 2xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Roadmap phases</p>
          <div className="mt-4 space-y-3">
            {plan.phases.map((phase, index) => (
              <div key={phase.title} className="rounded-2xl bg-[#090f1d] p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    0{index + 1}
                  </span>
                  <p className="text-sm font-semibold text-white">{phase.title}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{phase.summary}</p>
                <div className="mt-3 space-y-2">
                  {phase.items.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-200">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Review loop</p>
          <div className="mt-4 space-y-3">
            {[
              {
                title: "Preview stays visible",
                body: "Neroa keeps the visible product state close to the roadmap so review does not lose context."
              },
              {
                title: "Inspection supports the decision",
                body: "Readiness signals stay tied to the current build thread instead of feeling like a detached tool report."
              },
              {
                title: "Approvals keep momentum",
                body: "Refinements and approvals stay attached to the same path so the next move is always clear."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-[#090f1d] p-4">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 2xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Suggested build setup</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {plan.recommendedStack.map((item) => (
              <span key={item} className="rounded-full bg-[#090f1d] px-3 py-2 text-xs font-medium text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Next steps</p>
          <div className="mt-4 space-y-3">
            {plan.nextSteps.map((item) => (
              <div key={item} className="rounded-2xl bg-[#090f1d] px-4 py-3 text-sm leading-7 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      {plan.expandedSection ? (
        <section className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {plan.expandedSection.title}
          </p>
          <div className="mt-4 space-y-3">
            {plan.expandedSection.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-slate-200">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {plan.tasks.length > 0 ? (
        <section className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Task breakdown</p>
          <div className="mt-4 space-y-3">
            {plan.tasks.map((task) => (
              <div key={task} className="rounded-2xl bg-[#090f1d] px-4 py-3 text-sm leading-7 text-slate-200">
                {task}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {plan.refinementNotes.length > 0 ? (
        <section className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Refinement notes</p>
          <div className="mt-4 space-y-3">
            {plan.refinementNotes.map((note) => (
              <div key={note} className="rounded-2xl bg-[#090f1d] px-4 py-3 text-sm leading-7 text-slate-200">
                {note}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
