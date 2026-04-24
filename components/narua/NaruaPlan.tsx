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
      className="rounded-2xl border border-slate-200 bg-white/78 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
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
    <section className="floating-plane rounded-[36px] p-6 shadow-[0_22px_70px_rgba(15,23,42,0.10)]">
      <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Neroa Execution Layer
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{plan.title}</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">{plan.overview}</p>
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
        <div className="floating-plane rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Overview</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{plan.projectSummary}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Primary lane</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{primaryLane.name}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{primaryLane.description}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Supporting lanes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {supportingLanes.length > 0 ? (
                  supportingLanes.map((lane) => (
                    <span key={lane.id} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-600">
                      {lane.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No supporting lanes needed yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Plan anchors</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Target user</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{plan.targetUser}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Main goal</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{plan.mainGoal}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 2xl:grid-cols-[0.95fr_1.05fr]">
        <section className="floating-plane rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">MVP / first phase</p>
          <div className="mt-4 space-y-3">
            {plan.mvpScope.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="floating-plane rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recommended modules</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-950">{module.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 2xl:grid-cols-[1.08fr_0.92fr]">
        <section className="floating-plane rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Execution phases</p>
          <div className="mt-4 space-y-3">
            {plan.phases.map((phase, index) => (
              <div key={phase.title} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    0{index + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-950">{phase.title}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{phase.summary}</p>
                <div className="mt-3 space-y-2">
                  {phase.items.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="floating-plane rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">AI teammates</p>
          <div className="mt-4 space-y-3">
            {plan.teammates.map((teammate) => (
              <div key={teammate.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{teammate.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{teammate.role}</p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${
                      teammate.status === "active"
                        ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-700"
                        : teammate.status === "recommended"
                          ? "border-emerald-300/30 bg-emerald-300/14 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {teammate.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{teammate.reason}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 2xl:grid-cols-[0.9fr_1.1fr]">
        <section className="floating-plane rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recommended stack</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {plan.recommendedStack.map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="floating-plane rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Next steps</p>
          <div className="mt-4 space-y-3">
            {plan.nextSteps.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      {plan.expandedSection ? (
        <section className="floating-plane mt-6 rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {plan.expandedSection.title}
          </p>
          <div className="mt-4 space-y-3">
            {plan.expandedSection.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {plan.tasks.length > 0 ? (
        <section className="floating-plane mt-6 rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Task breakdown</p>
          <div className="mt-4 space-y-3">
            {plan.tasks.map((task) => (
              <div key={task} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-7 text-slate-700">
                {task}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {plan.refinementNotes.length > 0 ? (
        <section className="floating-plane mt-6 rounded-[30px] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Refinement notes</p>
          <div className="mt-4 space-y-3">
            {plan.refinementNotes.map((note) => (
              <div key={note} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-7 text-slate-700">
                {note}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
