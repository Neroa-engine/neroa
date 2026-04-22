import { CanonicalEntryFlow } from "@/components/onboarding/canonical-entry-flow";
import { buildProjectWorkspaceRoute } from "@/lib/portal/routes";
import type { PlanningLaneId } from "@/lib/start/planning-thread";
import {
  buildProjectContextSnapshot,
  pickFirstProjectContextText,
  type ProjectContextSnapshot
} from "@/lib/workspace/project-context-summary";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

type ProjectStrategyRoomV1Props = {
  userEmail?: string;
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
  initialError?: string | null;
  initialNotice?: string | null;
};

function resolvePlanningLane(projectMetadata?: StoredProjectMetadata | null): PlanningLaneId {
  const selectedPathId =
    projectMetadata?.buildSession?.path.selectedPathId ??
    projectMetadata?.guidedEntryContext?.selectedPathId ??
    null;

  return selectedPathId === "managed" ? "managed" : "diy";
}

function buildResumeFocus(snapshot: ProjectContextSnapshot) {
  return pickFirstProjectContextText(
    snapshot.focusSnapshot,
    snapshot.primaryGoal,
    snapshot.currentFocus[0]
  );
}

export function ProjectStrategyRoomV1({
  userEmail,
  project,
  projectMetadata,
  initialError,
  initialNotice
}: ProjectStrategyRoomV1Props) {
  const snapshot = buildProjectContextSnapshot({
    project,
    projectMetadata
  });
  const workspaceHref = buildProjectWorkspaceRoute(project.workspaceId);
  const planningLane = resolvePlanningLane(projectMetadata);
  const strategySeedSummary =
    pickFirstProjectContextText(snapshot.buildingSummary, project.description) ?? "";

  return (
    <CanonicalEntryFlow
      initialUserEmail={userEmail}
      initialEntryPathId={planningLane}
      initialTitle={snapshot.projectName}
      initialSummary={strategySeedSummary}
      initialError={initialError}
      initialNotice={initialNotice}
      surfaceMode="project"
      storageKeyOverride={`neroa:project-strategy-thread:${project.workspaceId}`}
      seedSummaryIntoThread={false}
      projectWorkspaceHref={workspaceHref}
      projectWorkspaceLabel="Back to Project Workspace"
      roomCopy={{
        badge: "Strategy Room",
        heading: `Resume strategy for ${snapshot.projectName}.`,
        intro:
          "Keep shaping the product direction for this project from here. The conversation stays connected to your active project workspace.",
        threadEyebrow: "Project planning thread",
        threadDescription:
          "Resume planning for this project without leaving the active project portal.",
        composerLabel: "Continue defining your product",
        placeholder:
          "Keep shaping the product, the first user, or the first experience from here...",
        emptyStateTitle: "We'll keep shaping your product from here.",
        emptyStateBody:
          "Use this room to continue clarifying what the product is, who it needs to work for, and what the first version has to deliver.",
        nextStep:
          "Keep tightening the product, the first user, and the first use case from this strategy room."
      }}
      resumeSnapshot={{
        eyebrow: "Resume where you left off",
        title: snapshot.projectName,
        description:
          "This is the planning room for this project. Use it to keep the product direction clear before the roadmap widens.",
        items: [
          {
            label: "What You're Shaping",
            value: snapshot.buildingSummary,
            placeholder: "We'll keep shaping your product definition from here."
          },
          {
            label: "Who It's For",
            value: snapshot.audienceSummary,
            placeholder: "Your first user group will appear here once it becomes clearer."
          },
          {
            label: "Current Planning Focus",
            value: buildResumeFocus(snapshot),
            placeholder: "We'll keep tightening the first use case and product direction from here."
          }
        ],
        workspaceHref,
        workspaceLabel: "Open Project Workspace"
      }}
    />
  );
}
