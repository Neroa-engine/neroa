import Link from "next/link";
import {
  buildProjectLibraryRoute,
  buildProjectRoomRoute
} from "@/lib/portal/routes";
import {
  buildProjectContextSnapshot,
  type WorkspacePhaseId
} from "@/lib/workspace/project-context-summary";
import {
  getFirstProjectLane,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

type ProjectWorkspaceV1Props = {
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
};

type WorkspacePhaseDefinition = {
  id: WorkspacePhaseId;
  label: string;
};

const workspacePhases: WorkspacePhaseDefinition[] = [
  { id: "strategy", label: "Strategy" },
  { id: "scope", label: "Scope" },
  { id: "mvp", label: "MVP" },
  { id: "build", label: "Build" }
];

function DetailItem({
  label,
  value,
  placeholder
}: {
  label: string;
  value: string | null;
  placeholder: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white/72 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-3 text-sm leading-7 ${value ? "text-slate-700" : "text-slate-500"}`}>
        {value ?? placeholder}
      </p>
    </div>
  );
}

function PhasePill({
  label,
  active,
  complete
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
        active
          ? "border-cyan-300/35 bg-cyan-300/14 text-cyan-700"
          : complete
            ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-700"
            : "border-slate-200 bg-white/82 text-slate-500"
      }`}
    >
      {label}
    </div>
  );
}

function RoadmapStep({
  step,
  active
}: {
  step: { number: number; title: string };
  active: boolean;
}) {
  return (
    <div
      className={`rounded-[28px] border px-5 py-5 ${
        active
          ? "border-cyan-300/35 bg-cyan-300/10"
          : "border-slate-200/70 bg-white/72"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-slate-200 bg-white/86 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {step.number}
        </span>
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
            active ? "text-cyan-700" : "text-slate-400"
          }`}
        >
          {active ? "Current" : "Coming up"}
        </span>
      </div>
      <p className="mt-4 text-base font-semibold text-slate-950">{step.title}</p>
    </div>
  );
}

export function ProjectWorkspaceV1({
  project,
  projectMetadata
}: ProjectWorkspaceV1Props) {
  const projectContext = buildProjectContextSnapshot({ project, projectMetadata });
  const leadingLane = getFirstProjectLane(project);
  const strategyRoomHref = buildProjectRoomRoute(project.workspaceId, "strategy-room");
  const projectLibraryHref = buildProjectLibraryRoute(project.workspaceId);

  return (
    <section className="surface-main relative overflow-hidden rounded-[42px] p-6 xl:p-8 2xl:p-10">
      <div className="floating-wash rounded-[42px]" />

      <div className="relative space-y-6">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Project Workspace
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-5xl">
            A clear view of what you're building, where it stands, and what happens next.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 xl:text-base">
            This workspace keeps the project direction easy to understand while the roadmap takes
            shape.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_minmax(0,1fr)_0.9fr]">
          <section className="floating-plane rounded-[34px] p-5 xl:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Your Project
            </p>
            <div className="mt-5 space-y-4">
              <DetailItem
                label="Project Name"
                value={projectContext.projectName}
                placeholder="Your project name will appear here once it has been defined."
              />
              <DetailItem
                label="What You're Building"
                value={projectContext.buildingSummary}
                placeholder="Your project summary will appear here as your plan takes shape."
              />
              <DetailItem
                label="Who It's For"
                value={projectContext.audienceSummary}
                placeholder="Your first user group will appear here once it becomes clear."
              />
              <DetailItem
                label="Primary Goal"
                value={projectContext.primaryGoal}
                placeholder="Your first product goal will appear here once the direction is grounded."
              />
            </div>
          </section>

          <section className="floating-plane rounded-[34px] p-5 xl:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Current Phase
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {workspacePhases.map((phase, index) => {
                const activeIndex = workspacePhases.findIndex(
                  (item) => item.id === projectContext.activePhase
                );

                return (
                  <PhasePill
                    key={phase.id}
                    label={phase.label}
                    active={phase.id === projectContext.activePhase}
                    complete={index < activeIndex}
                  />
                );
              })}
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-white/76 p-5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                {projectContext.currentPhaseTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {projectContext.currentPhaseBody}
              </p>

              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current Focus
                </p>
                <ul className="mt-3 space-y-2">
                  {projectContext.currentFocus.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-200/70 bg-white/76 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Conversation Snapshot
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>
                  <span className="font-semibold text-slate-950">Product:</span>{" "}
                  {projectContext.productSnapshot ?? "Still being clarified"}
                </li>
                <li>
                  <span className="font-semibold text-slate-950">Users:</span>{" "}
                  {projectContext.audienceSummary ?? "Still being clarified"}
                </li>
                <li>
                  <span className="font-semibold text-slate-950">Focus:</span>{" "}
                  {projectContext.focusSnapshot ?? "Defining the first product direction"}
                </li>
              </ul>
            </div>
          </section>

          <section className="floating-plane rounded-[34px] p-5 xl:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Next Step
            </p>

            <div className="mt-5 rounded-[28px] border border-cyan-300/28 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(236,254,255,0.82))] p-5 shadow-[0_24px_60px_rgba(34,211,238,0.08)]">
              <p className="text-lg font-semibold text-slate-950">{projectContext.nextStepTitle}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{projectContext.nextStepBody}</p>
              <div className="mt-5 space-y-3">
                <Link href={strategyRoomHref} className="button-primary w-full justify-center">
                  Continue Planning
                </Link>
                <Link
                  href={strategyRoomHref}
                  className="block text-center text-sm font-medium text-slate-500 transition hover:text-slate-700"
                >
                  Refine Your Idea
                </Link>
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-200/70 bg-white/76 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Project Status
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {leadingLane
                  ? `${leadingLane.title} is leading the project right now while the next phase gets defined.`
                  : "The project will show its leading phase here once the first planning step is active."}
              </p>
              <Link href={projectLibraryHref} className="button-secondary mt-4 w-full justify-center">
                Open Project Library
              </Link>
            </div>
          </section>
        </div>

        <section className="floating-plane rounded-[34px] p-5 xl:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Your Project Roadmap (Preview)
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This is the high-level path the project will move through as the plan becomes more
                concrete.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-4">
            {[
              { number: 1, title: "Strategy" },
              { number: 2, title: "Scope Definition" },
              { number: 3, title: "MVP Build Plan" },
              { number: 4, title: "Development" }
            ].map((step, index) => (
              <RoadmapStep
                key={step.number}
                step={step}
                active={workspacePhases[index]?.id === projectContext.activePhase}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
