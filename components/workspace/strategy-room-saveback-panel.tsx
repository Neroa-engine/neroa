import type { ReactNode } from "react";
import {
  approveStrategyScope,
  saveStrategyRevision
} from "@/app/workspace/[workspaceId]/strategy-room/actions";
import type { ArchitectureBlueprint } from "@/lib/intelligence/architecture";
import type { GovernancePolicy } from "@/lib/intelligence/governance";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import type { RoadmapPlan } from "@/lib/intelligence/roadmap";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import { buildStrategyQuestionRows } from "@/lib/workspace/strategy-room-support";

type StrategyRoomSavebackPanelProps = {
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
};

function RevisionSurface({
  title,
  description,
  meta,
  defaultOpen = false,
  children
}: {
  title: string;
  description: string;
  meta?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[22px] border border-white/10 bg-white/4 p-4 shadow-[0_16px_40px_rgba(2,6,23,0.2)]"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-[-0.02em] text-white">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {meta ? (
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium text-slate-300">
              {meta}
            </span>
          ) : null}
          <span className="text-lg text-slate-500 transition group-open:rotate-45 group-open:text-cyan-200">
            +
          </span>
        </div>
      </summary>
      <div className="mt-4 border-t border-white/10 pt-4">{children}</div>
    </details>
  );
}

function CompactStat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/4 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-7 text-slate-100">{value}</p>
    </div>
  );
}

function CompactList({
  items,
  emptyLabel
}: {
  items: readonly string[];
  emptyLabel: string;
}) {
  const visibleItems = items.slice(0, 5);

  return (
    <ul className="space-y-2 text-sm leading-7 text-slate-300">
      {visibleItems.length > 0 ? (
        visibleItems.map((item) => (
          <li key={item} className="rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
            {item}
          </li>
        ))
      ) : (
        <li className="rounded-2xl border border-dashed border-white/8 bg-white/3 px-3 py-2 text-slate-500">
          {emptyLabel}
        </li>
      )}
    </ul>
  );
}

function QuestionCard(args: {
  label: string;
  question: string;
  source: string;
  currentValue?: string;
  currentIndex: number;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-slate-950/52 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-white">{args.label}</p>
        {args.currentIndex === 0 ? (
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100">
            Currently resolving
          </span>
        ) : null}
        <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300">
          {args.source}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-300">{args.question}</p>
      {args.currentValue ? (
        <p className="mt-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/8 px-3 py-2 text-sm leading-7 text-emerald-100">
          Captured signal: {args.currentValue}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Answer this in the main chat and Neroa will save it into the shared project automatically.
        </p>
      )}
    </div>
  );
}

function formatRevisionMateriality(value: string) {
  return value.replace(/_/g, " ");
}

function labelForQuestionSource(value: "project_brief" | "architecture" | "roadmap") {
  if (value === "project_brief") {
    return "Brief";
  }

  if (value === "architecture") {
    return "Architecture";
  }

  return "Roadmap";
}

function StrategyRoomSavebackPanel({
  project,
  projectMetadata,
  projectBrief,
  architectureBlueprint,
  roadmapPlan,
  governancePolicy
}: StrategyRoomSavebackPanelProps) {
  const strategyState = projectMetadata?.strategyState ?? null;
  const currentOverrideState = strategyState?.overrideState ?? null;
  const revisions = strategyState?.revisionRecords ?? [];
  const latestRevision = revisions[revisions.length - 1] ?? null;
  const recentRevisions = revisions.slice(-3).reverse();
  const questionRows = buildStrategyQuestionRows({
    projectMetadata,
    projectBrief,
    architectureBlueprint,
    roadmapPlan
  });
  const unresolvedChecklist = governancePolicy.approvalChecklist.filter(
    (item) => item.status !== "satisfied"
  );
  const answeredInputCount = currentOverrideState?.answeredInputs.length ?? 0;
  const explicitBoundaryCount = currentOverrideState?.roadmap?.explicitNotInScope?.length ?? 0;

  return (
    <section className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/6 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.2)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
            Revisions
          </p>
          <h2 className="mt-2 text-base font-semibold tracking-[-0.03em] text-white">
            Chat-driven save-back
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Resolve blockers in the main planning thread. The right rail stays here to show what is
            open, what changed, and what approval still needs.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium text-slate-300">
          {revisions.length} saved
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <CompactStat
          label="Open questions"
          value={
            questionRows.length > 0
              ? `${questionRows.length} still need chat answers`
              : "No unresolved planning questions right now"
          }
        />
        <CompactStat
          label="Saved from chat"
          value={
            answeredInputCount > 0
              ? `${answeredInputCount} answers stored in the shared plan`
              : "Chat answers will appear here after they are captured"
          }
        />
        <CompactStat
          label="Approval blockers"
          value={
            unresolvedChecklist.length > 0
              ? `${unresolvedChecklist.length} checklist items still unresolved`
              : "Approval checklist is currently clear"
          }
        />
      </div>

      <RevisionSurface
        title="Resolve in chat"
        description="There is only one primary answer path now: reply in the main planning thread and Neroa will write the result back into the shared project automatically."
        meta={questionRows.length > 0 ? `${questionRows.length} active` : "Watching"}
        defaultOpen
      >
        {questionRows.length > 0 ? (
          <div className="grid gap-3">
            {questionRows.map((question, index) => (
              <QuestionCard
                key={question.inputId}
                label={question.label}
                question={question.question}
                source={labelForQuestionSource(question.source)}
                currentValue={question.value}
                currentIndex={index}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-3 text-sm leading-7 text-slate-400">
            No unresolved blocker questions are waiting right now. Keep using the main thread to
            tighten scope, and Neroa will keep the shared project state in sync.
          </p>
        )}
      </RevisionSurface>

      <div className="mt-3 grid gap-3">
        <RevisionSurface
          title="Approval and blocker status"
          description="Blockers and readiness stay visible here, but the answers belong in chat."
          meta={unresolvedChecklist.length > 0 ? `${unresolvedChecklist.length} open` : "Clear"}
          defaultOpen={unresolvedChecklist.length > 0}
        >
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Approval blockers
              </p>
              <CompactList
                items={unresolvedChecklist.map((item) => item.label)}
                emptyLabel="No blocking checklist items are open right now."
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Explicit boundaries
              </p>
              <CompactList
                items={currentOverrideState?.roadmap?.explicitNotInScope ?? []}
                emptyLabel={
                  explicitBoundaryCount > 0
                    ? "Explicit exclusions are saved."
                    : "Explicit MVP exclusions will appear here when they are recorded."
                }
              />
            </div>
            <div className="rounded-[20px] border border-white/8 bg-white/4 px-4 py-3 text-sm leading-7 text-slate-300">
              Answer in chat and Neroa will update the Project Brief, roadmap, governance readiness,
              and revision history from the same shared project spine.
            </div>
          </div>
        </RevisionSurface>

        <RevisionSurface
          title="Latest saved state"
          description="Recent revisions remain part of the shared intelligence spine for both Strategy Room and Command Center."
          meta={recentRevisions.length > 0 ? `${recentRevisions.length} recent` : "Watching"}
          defaultOpen={recentRevisions.length > 0}
        >
          {latestRevision ? (
            <div className="rounded-[20px] border border-white/10 bg-slate-950/52 px-4 py-3 text-sm text-slate-300">
              <p className="font-medium text-white">Latest revision</p>
              <p className="mt-2 leading-7">{latestRevision.summary}</p>
            </div>
          ) : null}

          {recentRevisions.length > 0 ? (
            <div className="mt-3 space-y-3">
              {recentRevisions.map((revision) => (
                <div
                  key={revision.revisionId}
                  className="rounded-[18px] border border-white/8 bg-slate-950/52 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{revision.summary}</p>
                    <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">
                      {formatRevisionMateriality(revision.materiality)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Status: {revision.status.replace(/_/g, " ")}
                    {revision.requiresApprovalReset ? " - approval reset required" : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-3 text-sm leading-7 text-slate-400">
              Saved revisions will appear here automatically after Neroa captures updates from chat
              or a scope review changes the shared plan.
            </p>
          )}
        </RevisionSurface>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-slate-950/56 px-4 py-4">
        <p className="text-sm font-medium text-white">Actions stay in the header</p>
        <p className="mt-1 text-sm leading-7 text-slate-300">
          Save revision and approve roadmap scope stay visible at the top of the room. Core blocker
          answers should happen in chat, not in side inputs.
        </p>
      </div>

      <form id="strategy-saveback-form" action={saveStrategyRevision} className="hidden">
        <input type="hidden" name="workspaceId" value={project.workspaceId} />
        <input
          type="hidden"
          name="returnTo"
          value={`/workspace/${project.workspaceId}/strategy-room`}
        />
        <input type="hidden" name="saveMode" value="chat_checkpoint" />
      </form>

      <form id="strategy-approve-form" action={approveStrategyScope} className="hidden">
        <input type="hidden" name="workspaceId" value={project.workspaceId} />
        <input
          type="hidden"
          name="returnTo"
          value={`/workspace/${project.workspaceId}/strategy-room`}
        />
      </form>
    </section>
  );
}

export { StrategyRoomSavebackPanel };
