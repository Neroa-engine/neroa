import { CanonicalEntryFlow } from "@/components/onboarding/canonical-entry-flow";
import { StrategyRoomSavebackPanel } from "@/components/workspace/strategy-room-saveback-panel";
import { buildProjectWorkspaceRoute } from "@/lib/portal/routes";
import {
  buildArchitectureBlueprintSummary,
  type ArchitectureBlueprint
} from "@/lib/intelligence/architecture";
import {
  buildGovernancePolicySummary,
  type GovernancePolicy
} from "@/lib/intelligence/governance";
import {
  buildRoadmapPlanSummary,
  type RoadmapPlan
} from "@/lib/intelligence/roadmap";
import {
  isPlatformApprovalAuthority,
  type PlatformContext
} from "@/lib/intelligence/platform-context";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import type { PlanningLaneId } from "@/lib/start/planning-thread";
import { buildProjectContextSnapshot } from "@/lib/workspace/project-context-summary";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

type ProjectStrategyRoomV1Props = {
  userEmail?: string;
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
  platformContext: PlatformContext;
  initialError?: string | null;
  initialNotice?: string | null;
};

type StatusTone = "error" | "notice";

function StrategyRoomStatus({
  message,
  tone
}: {
  message: string;
  tone: StatusTone;
}) {
  const classes =
    tone === "error"
      ? "border-rose-200 bg-rose-50/90 text-rose-700"
      : "border-cyan-200/70 bg-cyan-50/80 text-cyan-700";

  return (
    <section className={`floating-plane rounded-[24px] border px-5 py-4 ${classes}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
        {tone === "error" ? "Strategy room issue" : "Strategy room notice"}
      </p>
      <p className="mt-2 text-sm leading-7">{message}</p>
    </section>
  );
}

function resolvePlanningPathId(projectMetadata?: StoredProjectMetadata | null): PlanningLaneId {
  const pathId =
    projectMetadata?.buildSession?.path.selectedPathId ??
    projectMetadata?.buildSession?.path.recommendedPathMode ??
    projectMetadata?.guidedEntryContext?.selectedPathId ??
    projectMetadata?.guidedEntryContext?.recommendedPathId;

  return pathId === "managed" ? "managed" : "diy";
}

function RoadmapDraftPanel({
  roadmapPlan
}: {
  roadmapPlan: RoadmapPlan;
}) {
  const roadmapSummary = buildRoadmapPlanSummary(roadmapPlan);

  return (
    <section className="floating-plane rounded-[24px] border border-slate-200/70 bg-white/80 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Roadmap draft
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {roadmapSummary.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {roadmapSummary.statusLabel}
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {roadmapPlan.phases.length} phases / {roadmapPlan.openQuestions.length} open questions
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            MVP definition
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{roadmapSummary.mvpSummary}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Phase order
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {roadmapSummary.phaseNames.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Critical path
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {roadmapSummary.criticalPathLabels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Not in scope now
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {roadmapSummary.notInScopeLabels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function GovernanceDraftPanel({
  governancePolicy
}: {
  governancePolicy: GovernancePolicy;
}) {
  const governanceSummary = buildGovernancePolicySummary(governancePolicy);

  return (
    <section className="floating-plane rounded-[24px] border border-slate-200/70 bg-white/80 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Governance draft
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {governanceSummary.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {governanceSummary.readinessLabel}
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {governancePolicy.currentApprovalState.status.replace(/_/g, " ")}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Approval blockers
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {governanceSummary.blockerLabels.length > 0 ? (
              governanceSummary.blockerLabels.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>No blocking governance items are open right now.</li>
            )}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Checklist
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {governancePolicy.approvalChecklist.slice(0, 4).map((item) => (
              <li key={item.id}>
                {item.label} - {item.status.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Hard guards
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {governanceSummary.guardrailLabels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Revision state
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {governanceSummary.revisionLabel}
          </p>
        </div>
      </div>
    </section>
  );
}

function ArchitectureDraftPanel({
  architectureBlueprint
}: {
  architectureBlueprint: ArchitectureBlueprint;
}) {
  const architectureSummary = buildArchitectureBlueprintSummary(architectureBlueprint);

  return (
    <section className="floating-plane rounded-[24px] border border-slate-200/70 bg-white/80 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Architecture draft
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {architectureSummary.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {architectureBlueprint.modules.length} modules / {architectureBlueprint.lanes.length} lanes / readiness{" "}
            {architectureBlueprint.readinessScore}
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {architectureBlueprint.domainPack.replace(/_/g, " ")}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Modules
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {architectureSummary.moduleNames.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Lane plan
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {architectureSummary.laneSummary}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Remaining questions
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {architectureSummary.openQuestionLabels.length > 0 ? (
              architectureSummary.openQuestionLabels.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>Architecture inputs are currently covered.</li>
            )}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Risks to keep visible
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {architectureSummary.riskTitles.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ProjectStrategyRoomV1({
  project,
  projectMetadata,
  projectBrief,
  architectureBlueprint,
  roadmapPlan,
  governancePolicy,
  platformContext,
  initialError,
  initialNotice
}: ProjectStrategyRoomV1Props) {
  const workspaceHref = buildProjectWorkspaceRoute(project.workspaceId);
  const projectContext = buildProjectContextSnapshot({
    project,
    projectMetadata,
    projectBrief,
    roadmapPlan,
    governancePolicy
  });
  const strategyRoomSurface = platformContext.surfaces.strategyRoom;
  const strategyRoomIsApprovalAuthority = isPlatformApprovalAuthority(
    platformContext,
    "strategy_room"
  );
  const planningPathId = resolvePlanningPathId(projectMetadata);
  const threadSummary = projectContext.buildingSummary ?? project.description ?? project.title;
  const currentPlanningFocus =
    projectContext.currentFocus[0] ??
    projectContext.focusSnapshot ??
    "Sharpening the product direction";

  return (
    <div className="space-y-5">
      {initialError ? <StrategyRoomStatus message={initialError} tone="error" /> : null}
      {initialNotice ? <StrategyRoomStatus message={initialNotice} tone="notice" /> : null}
      {strategyRoomIsApprovalAuthority ? (
        <section className="floating-plane rounded-[24px] border border-cyan-200/70 bg-cyan-50/80 px-5 py-4 text-cyan-800">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
            Approval authority
          </p>
          <p className="mt-2 text-sm leading-7">{strategyRoomSurface.purpose}</p>
        </section>
      ) : null}
      <GovernanceDraftPanel governancePolicy={governancePolicy} />
      <RoadmapDraftPanel roadmapPlan={roadmapPlan} />
      <ArchitectureDraftPanel architectureBlueprint={architectureBlueprint} />
      <StrategyRoomSavebackPanel
        project={project}
        projectMetadata={projectMetadata}
        projectBrief={projectBrief}
        architectureBlueprint={architectureBlueprint}
        roadmapPlan={roadmapPlan}
        governancePolicy={governancePolicy}
      />
      <CanonicalEntryFlow
        initialEntryPathId={planningPathId}
        initialTitle={project.title}
        initialSummary={threadSummary}
        initialError={initialError}
        initialNotice={initialNotice}
        surfaceMode="project"
        seedSummaryIntoThread={false}
        storageKeyOverride={`neroa:project-strategy-thread:${project.workspaceId}:${project.id}`}
        roomCopy={{
          heading: `Resume strategy for ${project.title}.`,
          intro:
            `${strategyRoomSurface.purpose} The conversation stays connected to your active project workspace.`,
          threadEyebrow: "Project planning thread",
          threadDescription:
            "Resume planning for this project without leaving the active project portal.",
          composerLabel: "Continue shaping this project",
          placeholder:
            "Tell Neroa what changed, what still needs to be clarified, or what should happen next...",
          emptyStateTitle: "We'll keep shaping your product from here.",
          emptyStateBody:
            "Use this room to continue clarifying what the product is, who it needs to work for, and what the first version has to deliver.",
          nextStep: projectContext.nextStepBody
        }}
        resumeSnapshot={{
          title: project.title,
          description:
            "This is the planning room for this project. Use it to keep the product direction clear before the roadmap widens.",
          items: [
            {
              label: "What You're Shaping",
              value: projectContext.buildingSummary,
              placeholder:
                "The product summary for this project will appear here once the direction is tighter."
            },
            {
              label: "Who It's For",
              value: projectContext.audienceSummary,
              placeholder: "Your first user group will appear here once it becomes clearer."
            },
            {
              label: "Current Planning Focus",
              value: currentPlanningFocus,
              placeholder:
                "The current planning focus will appear here as the strategy sharpens."
            }
          ],
          workspaceHref,
          workspaceLabel: "Open Project Workspace"
        }}
        projectWorkspaceHref={workspaceHref}
        projectWorkspaceLabel="Back to Project Workspace"
      />
    </div>
  );
}
