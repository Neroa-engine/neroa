import Link from "next/link";
import type { ReactNode } from "react";
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
import {
  buildStrategyRoomInitialThreadState,
  hasMeaningfulProjectPlanningState,
  type PlanningLaneId
} from "@/lib/start/planning-thread";
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
type BadgeTone = "cyan" | "emerald" | "amber" | "rose" | "slate";

function StrategyRoomStatus({
  message,
  tone
}: {
  message: string;
  tone: StatusTone;
}) {
  const classes =
    tone === "error"
      ? "border-rose-500/30 bg-rose-500/12 text-rose-100"
      : "border-cyan-400/30 bg-cyan-400/12 text-cyan-100";

  return (
    <section className={`rounded-[24px] border px-5 py-4 shadow-[0_28px_80px_rgba(2,6,23,0.35)] ${classes}`}>
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

function formatLabel(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function hasSavedPlanningArtifacts(
  project: ProjectRecord,
  projectMetadata?: StoredProjectMetadata | null
) {
  return Boolean(
    project.description?.trim() ||
      projectMetadata?.buildSession ||
      projectMetadata?.saasIntake ||
      projectMetadata?.mobileAppIntake
  );
}

function toneClasses(tone: BadgeTone) {
  if (tone === "emerald") {
    return "border-emerald-400/25 bg-emerald-400/12 text-emerald-100";
  }

  if (tone === "amber") {
    return "border-amber-400/30 bg-amber-400/12 text-amber-100";
  }

  if (tone === "rose") {
    return "border-rose-400/30 bg-rose-400/12 text-rose-100";
  }

  if (tone === "cyan") {
    return "border-cyan-400/30 bg-cyan-400/12 text-cyan-100";
  }

  return "border-white/10 bg-white/6 text-slate-200";
}

function StatusBadge({
  label,
  tone = "slate"
}: {
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClasses(
        tone
      )}`}
    >
      {label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4 shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-base font-semibold tracking-[-0.02em] text-white">{value}</p>
      <p className="mt-2 text-sm leading-7 text-slate-300">{detail}</p>
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

function IntelligenceSurface({
  eyebrow,
  title,
  description,
  meta,
  defaultOpen = false,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.2)]"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-base font-semibold tracking-[-0.03em] text-white">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {meta ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">
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

function buildApprovalLabel(governancePolicy: GovernancePolicy) {
  if (governancePolicy.currentApprovalState.roadmapScopeApproved) {
    return "Approved";
  }

  if (governancePolicy.approvalReadiness.approvalAllowed) {
    return "Ready for approval";
  }

  if (governancePolicy.currentApprovalState.status === "revision_required") {
    return "Needs re-review";
  }

  return "Not ready";
}

function buildApprovalTone(governancePolicy: GovernancePolicy): BadgeTone {
  if (governancePolicy.currentApprovalState.roadmapScopeApproved) {
    return "emerald";
  }

  if (governancePolicy.approvalReadiness.approvalAllowed) {
    return "cyan";
  }

  if (governancePolicy.currentApprovalState.status === "revision_required") {
    return "amber";
  }

  return "rose";
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
  const blockerCount = governancePolicy.approvalReadiness.blockers.length;
  const approvalLabel = buildApprovalLabel(governancePolicy);
  const approvalTone = buildApprovalTone(governancePolicy);
  const architectureSummary = buildArchitectureBlueprintSummary(architectureBlueprint);
  const roadmapSummary = buildRoadmapPlanSummary(roadmapPlan);
  const governanceSummary = buildGovernancePolicySummary(governancePolicy);
  const primaryOverlay = formatLabel(projectBrief.primaryDomainPack ?? projectBrief.domainPack);
  const systemArchetype = formatLabel(projectBrief.systemArchetype) ?? "Generic SaaS fallback";
  const capabilityPreview = projectBrief.capabilityProfile.primaryCapabilities
    .slice(0, 4)
    .map((capability) => formatLabel(capability) ?? capability);
  const initialThreadState = buildStrategyRoomInitialThreadState({
    lane: planningPathId,
    planningThreadState: projectMetadata?.strategyState?.planningThreadState ?? null,
    conversationState: projectMetadata?.conversationState ?? null,
    projectBrief,
    hasStrategyOverrides: Boolean(projectMetadata?.strategyState?.overrideState),
    hasRevisionHistory: (projectMetadata?.strategyState?.revisionRecords?.length ?? 0) > 0,
    hasSavedPlanningArtifacts: hasSavedPlanningArtifacts(project, projectMetadata),
    projectTitle: project.title,
    projectSummary: threadSummary,
    currentFocus: currentPlanningFocus,
    blockers: governancePolicy.approvalReadiness.blockers,
    nextStep: projectContext.nextStepBody,
    fallbackThreadId: `project-strategy-${project.id}`
  });
  const starterThreadAllowed = !hasMeaningfulProjectPlanningState({
    planningThreadState: projectMetadata?.strategyState?.planningThreadState ?? null,
    conversationState: projectMetadata?.conversationState ?? null,
    projectBrief,
    hasStrategyOverrides: Boolean(projectMetadata?.strategyState?.overrideState),
    hasRevisionHistory: (projectMetadata?.strategyState?.revisionRecords?.length ?? 0) > 0,
    hasSavedPlanningArtifacts: hasSavedPlanningArtifacts(project, projectMetadata),
    projectTitle: project.title,
    projectSummary: threadSummary,
    currentFocus: currentPlanningFocus,
    blockers: governancePolicy.approvalReadiness.blockers,
    nextStep: projectContext.nextStepBody
  });

  return (
    <div className="space-y-4 text-slate-100">
      {initialError ? <StrategyRoomStatus message={initialError} tone="error" /> : null}
      {initialNotice ? <StrategyRoomStatus message={initialNotice} tone="notice" /> : null}

      <section className="floating-plane overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/88 shadow-[0_34px_120px_rgba(2,6,23,0.38)]">
        <div className="relative overflow-hidden px-5 py-5 sm:px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_32%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label="Strategy Room" tone="cyan" />
                  {strategyRoomIsApprovalAuthority ? (
                    <StatusBadge label="Approval authority" tone="slate" />
                  ) : null}
                  <StatusBadge label={approvalLabel} tone={approvalTone} />
                  <StatusBadge
                    label={`${blockerCount} blocker${blockerCount === 1 ? "" : "s"}`}
                    tone={blockerCount > 0 ? "amber" : "emerald"}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.35rem]">
                    {project.title}
                  </h1>
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-slate-200">
                    {systemArchetype}
                  </span>
                  {primaryOverlay ? (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                      {primaryOverlay}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  {projectContext.buildingSummary ??
                    project.description ??
                    strategyRoomSurface.purpose}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span>{strategyRoomSurface.purpose}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span>{projectContext.currentPhaseTitle}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <Link href={workspaceHref} className="text-cyan-300 transition hover:text-cyan-200">
                    Open project workspace
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  form="strategy-saveback-form"
                  className="rounded-full border border-white/10 bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-white/12"
                >
                  Save revision
                </button>
                <button
                  type="submit"
                  form="strategy-approve-form"
                  disabled={!governancePolicy.approvalReadiness.approvalAllowed}
                  className="rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Approve roadmap scope
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Current focus"
                value={currentPlanningFocus}
                detail={projectContext.currentPhaseBody}
              />
              <MetricCard
                label="Approval state"
                value={approvalLabel}
                detail={governanceSummary.readinessLabel}
              />
              <MetricCard
                label="Blockers"
                value={
                  blockerCount > 0
                    ? `${blockerCount} still needs resolution`
                    : "No blocking items are open"
                }
                detail={
                  governancePolicy.approvalReadiness.blockers[0] ??
                  "The approval path is currently clear."
                }
              />
              <MetricCard
                label="Next move"
                value={projectContext.nextStepTitle}
                detail={projectContext.nextStepBody}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_420px] 2xl:grid-cols-[minmax(0,1.55fr)_460px]">
        <div className="min-h-0">
          <CanonicalEntryFlow
            initialEntryPathId={planningPathId}
            initialTitle={project.title}
            initialSummary={threadSummary}
            initialError={null}
            initialNotice={null}
            initialThreadState={initialThreadState}
            persistedProjectContext={{
              workspaceId: project.workspaceId,
              projectId: project.id
            }}
            surfaceMode="project"
            seedSummaryIntoThread={false}
            storageKeyOverride={`neroa:project-strategy-thread:${project.workspaceId}:${project.id}`}
            layoutVariant="embedded"
            showProjectFooter={false}
            allowStarterThread={starterThreadAllowed}
            roomCopy={{
              badge: "Planning room",
              heading: `Resume strategy for ${project.title}.`,
              intro:
                `${strategyRoomSurface.purpose} The conversation stays connected to your active project workspace.`,
              threadEyebrow: "Live planning thread",
              threadDescription:
                "Shape scope, unblock approval, and keep the project plan moving without leaving this room.",
              composerLabel: "Continue shaping this project",
              placeholder:
                "Tell Neroa what changed, what still needs to be clarified, or what should happen next...",
              emptyStateTitle: "The planning conversation lives here.",
              emptyStateBody:
                "Use this room to keep the product direction, approval blockers, and version-one scope aligned in one thread.",
              nextStep: projectContext.nextStepBody
            }}
            resumeSnapshot={null}
            projectWorkspaceHref={workspaceHref}
            projectWorkspaceLabel="Back to Project Workspace"
          />
        </div>

        <aside className="min-h-0">
          <section className="floating-plane h-[clamp(640px,calc(100vh-16rem),920px)] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/88 shadow-[0_34px_120px_rgba(2,6,23,0.38)]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
                  Planning intelligence
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                  Secondary room surfaces
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  The shared brief, architecture, roadmap, governance, and revision controls stay
                  available here without taking over the room.
                </p>
              </div>

              <div className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-4">
                <IntelligenceSurface
                  eyebrow="Brief"
                  title={projectBrief.productCategory ?? "Product brief"}
                  description={
                    projectBrief.problemStatement ??
                    projectBrief.outcomePromise ??
                    "Project definition is still being sharpened."
                  }
                  meta={`${projectBrief.openQuestions.length} open`}
                  defaultOpen
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Capability profile
                      </p>
                      <CompactList
                        items={capabilityPreview}
                        emptyLabel="Capability signals will appear once the brief sharpens."
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Audience and goal
                      </p>
                      <div className="space-y-2 text-sm leading-7 text-slate-300">
                        <p>{projectContext.audienceSummary ?? "Audience is still being clarified."}</p>
                        <p>{projectContext.primaryGoal ?? "Primary product outcome is still being clarified."}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Domain specifics still unresolved
                      </p>
                      <CompactList
                        items={projectBrief.unresolvedDomainSpecifics}
                        emptyLabel="No extra domain-specific unknowns are open right now."
                      />
                    </div>
                  </div>
                </IntelligenceSurface>

                <IntelligenceSurface
                  eyebrow="Architecture"
                  title={architectureSummary.headline}
                  description={architectureSummary.laneSummary}
                  meta={`${architectureBlueprint.modules.length} modules`}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Modules
                      </p>
                      <CompactList
                        items={architectureSummary.moduleNames}
                        emptyLabel="Module planning will appear once the architecture tightens."
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Open questions
                      </p>
                      <CompactList
                        items={architectureSummary.openQuestionLabels}
                        emptyLabel="Architecture inputs are currently covered."
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Risks
                      </p>
                      <CompactList
                        items={architectureSummary.riskTitles}
                        emptyLabel="No architecture risks are elevated right now."
                      />
                    </div>
                  </div>
                </IntelligenceSurface>

                <IntelligenceSurface
                  eyebrow="Roadmap"
                  title={roadmapSummary.headline}
                  description={roadmapSummary.statusLabel}
                  meta={`${roadmapPlan.phases.length} phases`}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        MVP definition
                      </p>
                      <p className="text-sm leading-7 text-slate-300">{roadmapSummary.mvpSummary}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Phase order
                      </p>
                      <CompactList
                        items={roadmapSummary.phaseNames}
                        emptyLabel="Phase order appears once roadmap sequencing is ready."
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Not in scope now
                      </p>
                      <CompactList
                        items={roadmapSummary.notInScopeLabels}
                        emptyLabel="Explicit exclusions have not been recorded yet."
                      />
                    </div>
                  </div>
                </IntelligenceSurface>

                <IntelligenceSurface
                  eyebrow="Governance"
                  title={governanceSummary.headline}
                  description={governanceSummary.readinessLabel}
                  meta={approvalLabel}
                  defaultOpen={blockerCount > 0}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Approval blockers
                      </p>
                      <CompactList
                        items={governanceSummary.blockerLabels}
                        emptyLabel="No blocking governance items are open right now."
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Hard guards
                      </p>
                      <CompactList
                        items={governanceSummary.guardrailLabels}
                        emptyLabel="Governance guardrails are already satisfied."
                      />
                    </div>
                    <div className="rounded-[20px] border border-white/8 bg-white/4 px-4 py-3 text-sm leading-7 text-slate-300">
                      {governanceSummary.revisionLabel}
                    </div>
                  </div>
                </IntelligenceSurface>

                <StrategyRoomSavebackPanel
                  project={project}
                  projectMetadata={projectMetadata}
                  projectBrief={projectBrief}
                  architectureBlueprint={architectureBlueprint}
                  roadmapPlan={roadmapPlan}
                  governancePolicy={governancePolicy}
                />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
