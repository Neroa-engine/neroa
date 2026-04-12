import Link from "next/link";
import { buildProjectLaneRoute, type ProjectLaneRecord } from "@/lib/workspace/project-lanes";

type EngineOverviewProps = {
  workspaceId: string;
  projectId: string;
  lane: ProjectLaneRecord;
  siblingLanes: ProjectLaneRecord[];
};

export default function EngineOverview({
  workspaceId,
  projectId,
  lane,
  siblingLanes
}: EngineOverviewProps) {
  const relatedLanes = siblingLanes.filter((item) => item.slug !== lane.slug).slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6 xl:p-8">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              {lane.title} lane
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white xl:text-5xl">
              {lane.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 xl:text-base xl:leading-8">
              {lane.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-cyan-400/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              {lane.status}
            </span>
            <span className="rounded-full bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              {lane.slug}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 2xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Lane metadata
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
            <p><span className="text-slate-500">id:</span> {lane.id}</p>
            <p><span className="text-slate-500">project_id:</span> {lane.projectId}</p>
            <p><span className="text-slate-500">sort_order:</span> {lane.sortOrder}</p>
            <p><span className="text-slate-500">status:</span> {lane.status}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Lane deliverables
          </p>
          <div className="mt-4 space-y-3">
            {lane.deliverables.map((deliverable) => (
              <div key={deliverable} className="rounded-2xl bg-[#090f1d] px-4 py-3 text-sm leading-7 text-slate-200">
                {deliverable}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 2xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Starter prompts
          </p>
          <div className="mt-4 space-y-3">
            {lane.starterPrompts.map((prompt) => (
              <div key={prompt} className="rounded-2xl bg-[#090f1d] px-4 py-3 text-sm leading-7 text-slate-200">
                {prompt}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Related lanes
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedLanes.map((relatedLane) => (
              <Link
                key={relatedLane.id}
                href={buildProjectLaneRoute(workspaceId, projectId, relatedLane.slug)}
                className="rounded-full bg-[#090f1d] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/[0.08]"
              >
                {relatedLane.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
