import Link from "next/link";
import {
  buildProjectLaneRoute,
  getProjectLanePhaseForLane,
  getProjectLanePhaseGroups,
  type ProjectLaneRecord,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";
import { getStrategyLaneOverviewSummary } from "@/lib/workspace/strategy-lane";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import {
  FloatingSection,
  LaneRow,
  emptyProgress,
  formatUpdatedAt,
  statusPill,
  type LaneProgressSummary,
  type WorkspaceSnapshotItem
} from "@/components/workspace/workspace-shell-ui";

type WorkspaceShellCenterProps = {
  workspaceId: string;
  project: ProjectRecord;
  strategyLane: ProjectLaneRecord;
  strategySummary: ReturnType<typeof getStrategyLaneOverviewSummary>;
  strategyUpdatedAt: string | null;
  activeCount: number;
  orderedLanes: ProjectLaneRecord[];
  progressByLane: Record<string, LaneProgressSummary>;
  snapshotItems: WorkspaceSnapshotItem[];
  recommendedMove: string;
  thread: { setDraft: (value: string) => void };
  lanePhases: ReturnType<typeof getProjectLanePhaseGroups>;
  buildSessionCategoryLabel: string;
  buildSessionNextSteps: string[];
  buildSession: StoredProjectMetadata["buildSession"] | null;
  saasIntake: StoredProjectMetadata["saasIntake"] | null;
  mobileAppIntake: StoredProjectMetadata["mobileAppIntake"] | null;
};

export function WorkspaceShellCenter({
  workspaceId,
  project,
  strategyLane,
  strategySummary,
  strategyUpdatedAt,
  activeCount,
  orderedLanes,
  progressByLane,
  snapshotItems,
  recommendedMove,
  thread,
  lanePhases,
  buildSessionCategoryLabel,
  buildSessionNextSteps,
  buildSession,
  saasIntake,
  mobileAppIntake
}: WorkspaceShellCenterProps) {
  const roadmap = strategySummary?.roadmap.slice(0, 4) ?? [];
  const budget = strategySummary?.budget ?? null;
  const plan = strategySummary?.recommendedPlan ?? null;
  const recentActions = strategySummary?.recentActions ?? [];
  const blockers = strategySummary?.blockers ?? [];
  const currentGoal =
    strategySummary?.projectSummary ||
    buildSession?.scope.summary ||
    saasIntake?.projectSummary ||
    mobileAppIntake?.projectSummary ||
    project.description ||
    "Let the leading phase set the direction, then widen the engine only when the next move earns it.";

  return (
        <section className="thin-scrollbar min-w-0 overflow-y-auto px-6 py-6 xl:px-10 xl:py-8 2xl:px-12 2xl:py-10">
          <div className="space-y-8">
            <section className="space-y-5">
              <div className="max-w-5xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">
                  Engine command center
                </p>
                <h2 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                  Guide the engine through Neroa, then widen only when the work demands it.
                </h2>
                <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 xl:text-lg">
                  {strategySummary?.projectSummary ||
                    project.description ||
                    "Start in Strategy, let Neroa define the first useful direction, then open only the lanes that directly move execution forward."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-cyan-300/24 bg-cyan-300/12 px-4 py-2 text-sm text-cyan-700">
                    {strategyLane.title} is leading this engine
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-sm text-slate-600">
                    Guided sequence: Strategy {"\u2192"} Scope {"\u2192"} MVP {"\u2192"} Budget {"\u2192"} Test {"\u2192"} Build {"\u2192"} Launch {"\u2192"} Operate
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-sm text-slate-600">
                    {activeCount} lanes have momentum
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-sm text-slate-600">
                    {strategyLane.title} refreshed {formatUpdatedAt(strategyUpdatedAt)}
                  </span>
              </div>
            </section>

            <section className="overflow-x-auto">
              <div className="flex min-w-max gap-3">
                {orderedLanes.map((lane) => {
                  const progress = progressByLane[lane.slug] ?? emptyProgress(lane.status);
                  const phase = getProjectLanePhaseForLane(lane);
                  return (
                    <Link
                      key={lane.id}
                      href={buildProjectLaneRoute(workspaceId, project.id, lane.slug)}
                      className="micro-glow rounded-full border border-slate-200 bg-white/70 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-950">{lane.title}</span>
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                          {phase.id}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusPill(lane.status)}`}>
                          {progress.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <FloatingSection eyebrow="Current goal" title="What the engine is trying to do">
                <p className="text-sm leading-7 text-slate-700">{currentGoal}</p>
              </FloatingSection>

              <FloatingSection eyebrow="Generated outputs" title="Snapshot">
                {snapshotItems.length > 0 ? (
                  <div className="space-y-3">
                    {snapshotItems.map((item) =>
                      item.href ? (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="micro-glow block border-b border-slate-200/70 py-3 last:border-b-0"
                        >
                          <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                        </Link>
                      ) : (
                        <div
                          key={item.id}
                          className="border-b border-slate-200/70 py-3 last:border-b-0"
                        >
                          <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-slate-500">
                    Output snapshots will appear here as Neroa builds lane artifacts.
                  </p>
                )}
              </FloatingSection>

              <FloatingSection eyebrow="Next best move" title="Recommended move">
                <p className="text-sm leading-7 text-slate-700">{recommendedMove}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={buildProjectLaneRoute(workspaceId, project.id, strategyLane.slug)}
                    className="button-secondary"
                  >
                    Open leading lane
                  </Link>
                  <button
                    type="button"
                    onClick={() => thread.setDraft("Give me the next best move for this engine.")}
                    className="button-secondary"
                  >
                    Ask Neroa
                  </button>
                </div>
              </FloatingSection>
            </div>

            <FloatingSection
              eyebrow="System output"
              title="Roadmap snapshot"
              action={
                <Link
                  href={buildProjectLaneRoute(workspaceId, project.id, strategyLane.slug)}
                  className="button-secondary"
                >
                  Open leading lane
                </Link>
              }
            >
              {roadmap.length > 0 ? (
                <div className="space-y-4">
                  {roadmap.map((item, index) => (
                    <Link
                      key={item.id}
                      href={buildProjectLaneRoute(workspaceId, project.id, strategyLane.slug)}
                      className="micro-glow flex items-start gap-4 border-b border-slate-200/70 py-4 last:border-b-0"
                    >
                      <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        0{index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-semibold text-slate-950">{item.title}</p>
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-700">
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : buildSession ? (
                <div className="space-y-4">
                  {buildSessionNextSteps.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-4 border-b border-slate-200/70 py-4 last:border-b-0"
                    >
                      <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        0{index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-semibold text-slate-950">Next step</p>
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-700">
                            {buildSessionCategoryLabel}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : saasIntake ? (
                <div className="space-y-4">
                  {saasIntake.nextStepChecklist.slice(0, 4).map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-4 border-b border-slate-200/70 py-4 last:border-b-0"
                    >
                      <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        0{index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-semibold text-slate-950">Next step</p>
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-700">
                            SaaS intake
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : mobileAppIntake ? (
                <div className="space-y-4">
                  {mobileAppIntake.nextStepChecklist.slice(0, 4).map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-4 border-b border-slate-200/70 py-4 last:border-b-0"
                    >
                      <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        0{index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-semibold text-slate-950">Next step</p>
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-700">
                            Mobile intake
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Open the leading lane with Neroa to generate the first roadmap and execution focus.
                </p>
              )}
            </FloatingSection>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
              <FloatingSection eyebrow="Budget signal" title={budget?.title ?? "Budget snapshot"}>
                {budget ? (
                  <>
                    <p className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                      {budget.rangeLabel}
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{budget.summary}</p>
                    <div className="mt-5 space-y-3">
                      {budget.lineItems.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-start justify-between gap-4 border-b border-slate-200/70 py-3 last:border-b-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">{item.note}</p>
                          </div>
                          <span className="text-sm font-semibold text-cyan-700">{item.amountLabel}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : buildSession ? (
                  <>
                    <p className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                      {buildSession.credits.estimateLabel ?? buildSession.path.selectedPathLabel ?? buildSession.path.recommendedPathLabel ?? "Guided build path"}
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                      {buildSession.credits.note ??
                        buildSession.scope.summary ??
                        "Neroa captured the structured guided scope and is ready to move into execution."}
                    </p>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Framework direction</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {buildSession.scope.frameworkLabel ?? "Framework becomes visible after the guided setup is complete."}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-700">
                          {buildSessionCategoryLabel}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Systems layer</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {buildSession.scope.stackSystems && buildSession.scope.stackSystems.length > 0
                              ? buildSession.scope.stackSystems.join(", ")
                              : "Neroa will surface the systems layer once the engine starts execution planning."}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-700">
                          {buildSession.path.selectedPathLabel ?? buildSession.path.recommendedPathLabel ?? "Path pending"}
                        </span>
                      </div>
                    </div>
                  </>
                ) : saasIntake ? (
                  <>
                    <p className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                      {saasIntake.startupCostEstimate.rangeLabel}
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                      {saasIntake.startupCostEstimate.summary}
                    </p>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Estimated build complexity</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {saasIntake.buildComplexity.summary}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-700">
                          {saasIntake.buildComplexity.label}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Roadmap mode</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {saasIntake.answers.guidanceMode === "guide-build"
                              ? "Neroa will keep guiding the build inside the engine."
                              : "Neroa will focus on roadmap, scope, and first execution planning."}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-700">
                          {saasIntake.answers.guidanceMode === "guide-build" ? "Guide build" : "Roadmap"}
                        </span>
                      </div>
                    </div>
                  </>
                ) : mobileAppIntake ? (
                  <>
                    <p className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                      {mobileAppIntake.startupCostEstimate.rangeLabel}
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                      {mobileAppIntake.startupCostEstimate.summary}
                    </p>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {mobileAppIntake.stackRecommendation.recommendedPathLabel}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {mobileAppIntake.stackRecommendation.summary}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-700">
                          {mobileAppIntake.stackRecommendation.recommendedPathValue}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Estimated build complexity</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {mobileAppIntake.buildComplexity.summary}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-700">
                          {mobileAppIntake.buildComplexity.label}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-7 text-slate-500">
                    Budget guidance will appear here after Neroa has enough strategy context.
                  </p>
                )}
              </FloatingSection>

              <FloatingSection eyebrow="Plan recommendation" title={plan?.recommendedPlan.label ?? "Recommended Neroa plan"}>
                {plan ? (
                  <>
                    <p className="text-sm text-slate-500">
                      {plan.recommendedPlan.priceMonthly === null
                        ? "Custom pricing"
                        : `$${plan.recommendedPlan.priceMonthly}/month`}
                    </p>
                    <p className="mt-4 text-base leading-7 text-slate-700">{plan.usageHeadline}</p>
                    <div className="mt-5 space-y-3">
                      {plan.rationale.map((item) => (
                        <p key={item} className="text-sm leading-7 text-slate-600">
                          {item}
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-7 text-slate-500">
                    Neroa will recommend the right plan after it understands scope, complexity, and projected usage.
                  </p>
                )}
              </FloatingSection>
            </div>

            <FloatingSection eyebrow="Execution flow" title="Strategy to operations">
              <div className="space-y-5">
                {lanePhases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className={index === lanePhases.length - 1 ? "" : "border-b border-slate-200/70 pb-5"}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                          {phase.label}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{phase.summary}</p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] text-slate-500">
                        {phase.lanes.length} lane{phase.lanes.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="mt-4">
                      {phase.lanes.map((lane) => (
                        <LaneRow
                          key={lane.id}
                          workspaceId={workspaceId}
                          projectId={project.id}
                          lane={lane}
                          progress={progressByLane[lane.slug] ?? emptyProgress(lane.status)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FloatingSection>

            <div className="grid gap-6 xl:grid-cols-2">
              <FloatingSection eyebrow="Recent momentum" title="Progress">
                {recentActions.length > 0 ? (
                  recentActions.map((item) => (
                    <div key={item} className="border-b border-slate-200/70 py-3 text-sm leading-7 text-slate-700 last:border-b-0">
                      {item}
                    </div>
                  ))
                ) : buildSession ? (
                  buildSessionNextSteps.slice(0, 3).map((item) => (
                    <div key={item} className="border-b border-slate-200/70 py-3 text-sm leading-7 text-slate-700 last:border-b-0">
                      {item}
                    </div>
                  ))
                ) : saasIntake ? (
                  saasIntake.nextStepChecklist.slice(0, 3).map((item) => (
                    <div key={item} className="border-b border-slate-200/70 py-3 text-sm leading-7 text-slate-700 last:border-b-0">
                      {item}
                    </div>
                  ))
                ) : mobileAppIntake ? (
                  mobileAppIntake.nextStepChecklist.slice(0, 3).map((item) => (
                    <div key={item} className="border-b border-slate-200/70 py-3 text-sm leading-7 text-slate-700 last:border-b-0">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-slate-500">
                    Neroa will surface recent movement here after the first strategy pass is complete.
                  </p>
                )}
              </FloatingSection>

              <FloatingSection eyebrow="Risk view" title="Blockers and dependencies">
                {blockers.length > 0 ? (
                  <div className="space-y-3">
                    {blockers.map((item) => (
                      <div
                        key={item}
                        className="rounded-[22px] border border-amber-300/35 bg-amber-50/70 px-4 py-4 text-sm leading-7 text-amber-800"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-slate-500">
                    No active blockers yet. Neroa will flag execution risk here as the engine becomes more defined.
                  </p>
                )}
              </FloatingSection>
            </div>
          </div>
        </section>
  );
}

