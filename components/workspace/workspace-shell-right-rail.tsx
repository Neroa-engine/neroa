import Link from "next/link";
import AiTeammateCards, {
  type AiTeammateCardItem
} from "@/components/workspace/ai-teammate-cards";
import {
  buildProjectLaneRoute,
  getProjectLanePhaseForLane,
  type ProjectLaneRecord
} from "@/lib/workspace/project-lanes";
import {
  getBuildReviewLoop,
  getEngineConnectedServices,
  getExecutionRoutingModel
} from "@/lib/workspace/execution-orchestration";
import {
  connectedServiceBadgeClasses,
  emptyProgress,
  formatUpdatedAt,
  statusPill,
  type LaneProgressSummary
} from "@/components/workspace/workspace-shell-ui";

type WorkspaceShellRightRailProps = {
  workspaceId: string;
  projectId: string;
  aiSystemRoster: AiTeammateCardItem[];
  executionRouting: ReturnType<typeof getExecutionRoutingModel>;
  buildReviewLoop: ReturnType<typeof getBuildReviewLoop>;
  connectedServices: ReturnType<typeof getEngineConnectedServices>;
  userEmail?: string;
  leadingPhase: ReturnType<typeof getProjectLanePhaseForLane> | null;
  strategyLane: ProjectLaneRecord;
  strategyUpdatedAt: string | null;
  orderedLanes: ProjectLaneRecord[];
  progressByLane: Record<string, LaneProgressSummary>;
};

export function WorkspaceShellRightRail({
  workspaceId,
  projectId,
  aiSystemRoster,
  executionRouting,
  buildReviewLoop,
  connectedServices,
  userEmail,
  leadingPhase,
  strategyLane,
  strategyUpdatedAt,
  orderedLanes,
  progressByLane
}: WorkspaceShellRightRailProps) {
  return (
        <aside className="thin-scrollbar border-t border-slate-200/70 px-6 py-6 xl:overflow-y-auto xl:border-l xl:border-t-0 xl:px-7 xl:py-8">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                AI system
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Neroa orchestrates the engine, GitHub stores the work, Codex can implement, Claude can review, and the specialist systems expand only where the lane mix really calls for them.
              </p>
            </div>

            <AiTeammateCards agents={aiSystemRoster} compact className="grid-cols-1" />

            <div className="floating-plane rounded-[32px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Execution routing
              </p>
              <div className="mt-4 space-y-3">
                {executionRouting.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[20px] border border-slate-200/70 bg-white/78 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                      <span className="rounded-full border border-slate-200/70 bg-white/86 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="floating-plane rounded-[32px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Connected services
              </p>
              <div className="mt-4 space-y-3">
                {connectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-[20px] border border-slate-200/70 bg-white/78 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">{service.label}</p>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${connectedServiceBadgeClasses(
                          service.state
                        )}`}
                      >
                        {service.statusLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="floating-plane rounded-[32px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Build / review loop
              </p>
              <div className="mt-4 space-y-3">
                {buildReviewLoop.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-[20px] border border-slate-200/70 bg-white/78 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">
                        {item.step}. {item.title}
                      </p>
                      <span className="rounded-full border border-slate-200/70 bg-white/86 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.owner}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

                <div className="floating-plane rounded-[32px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Engine pulse
              </p>
              <div className="mt-4 space-y-4">
                <div className="border-b border-slate-200/70 pb-4">
                  <p className="text-sm font-semibold text-slate-950">Owner</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{userEmail ?? "Authenticated user"}</p>
                </div>
                <div className="border-b border-slate-200/70 pb-4">
                  <p className="text-sm font-semibold text-slate-950">Leading phase</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {leadingPhase?.label ?? "Execution phase"} via {strategyLane.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Latest lane refresh</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{formatUpdatedAt(strategyUpdatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="floating-plane rounded-[32px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Lane activation
              </p>
              <div className="mt-4 space-y-3">
                {orderedLanes.map((lane) => {
                  const progress = progressByLane[lane.slug] ?? emptyProgress(lane.status);
                  const phase = getProjectLanePhaseForLane(lane);
                  return (
                    <Link
                      key={lane.id}
                      href={buildProjectLaneRoute(workspaceId, projectId, lane.slug)}
                      className="micro-glow flex items-start justify-between gap-4 border-b border-slate-200/70 py-3 last:border-b-0"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">{lane.title}</p>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {phase.id}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{progress.detail}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusPill(lane.status)}`}>
                        {progress.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
  );
}

