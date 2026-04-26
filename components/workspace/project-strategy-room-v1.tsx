import { CanonicalEntryFlow } from "@/components/onboarding/canonical-entry-flow";
import { buildProjectWorkspaceRoute } from "@/lib/portal/routes";
import {
  isPlatformApprovalAuthority,
  type PlatformContext
} from "@/lib/intelligence/platform-context";
import type { PlanningLaneId } from "@/lib/start/planning-thread";
import { buildProjectContextSnapshot } from "@/lib/workspace/project-context-summary";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

type ProjectStrategyRoomV1Props = {
  userEmail?: string;
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
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

export function ProjectStrategyRoomV1({
  project,
  projectMetadata,
  platformContext,
  initialError,
  initialNotice
}: ProjectStrategyRoomV1Props) {
  const workspaceHref = buildProjectWorkspaceRoute(project.workspaceId);
  const projectContext = buildProjectContextSnapshot({ project, projectMetadata });
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
