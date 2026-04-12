"use client";

import { getPlanModuleDefinitions } from "@/lib/narua/planning";
import { getLaneById } from "@/lib/workspace/lanes";
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
  const primaryLane = getLaneById(plan.primaryLaneId);
  const supportingLanes = plan.supportingLaneIds.map((laneId) => getLaneById(laneId));
  const modules = getPlanModuleDefinitions(plan);

  return (
    <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,29,0.98),rgba(13,18,34,0.94))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
            Narua Execution Layer
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Primary lane</p>
              <p className="mt-2 text-lg font-semibold text-white">{primaryLane.name}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{primaryLane.description}</p>
            </div>

            <div className="rounded-2xl bg-[#090f1d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Supporting lanes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {supportingLanes.length > 0 ? (
                  supportingLanes.map((lane) => (
                    <span key={lane.id} className="rounded-full bg-white/[0.06] px-3 py-2 text-xs text-slate-200">
                      {lane.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No supporting lanes needed yet.</span>
                )}
              </div>
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Execution phases</p>
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">AI teammates</p>
          <div className="mt-4 space-y-3">
            {plan.teammates.map((teammate) => (
              <div key={teammate.id} className="rounded-2xl bg-[#090f1d] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{teammate.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{teammate.role}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${
                      teammate.status === "active"
                        ? "bg-cyan-400/12 text-cyan-200"
                        : teammate.status === "recommended"
                          ? "bg-emerald-400/12 text-emerald-200"
                          : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {teammate.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{teammate.reason}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 2xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recommended stack</p>
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
