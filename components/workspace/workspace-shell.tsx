"use client";

import { useEffect, useMemo, useState } from "react";
import { useNaruaThread } from "@/components/narua/useNaruaThread";
import { WorkspaceShellCenter } from "@/components/workspace/workspace-shell-center";
import { WorkspaceShellLeftRail } from "@/components/workspace/workspace-shell-left-rail";
import { WorkspaceShellRightRail } from "@/components/workspace/workspace-shell-right-rail";
import { getProjectAiCollaboration } from "@/lib/ai/collaboration";
import {
  createWorkspaceReply,
  createWorkspaceWelcomeMessage,
  type NaruaWorkspaceContext
} from "@/lib/narua/planning";
import {
  buildLaneConversationStorageKey,
  buildProjectLaneRoute,
  getProjectLanePhaseForLane,
  getProjectLanePhaseGroups,
  getProjectLanesByStatus,
  parseLaneConversationSnapshot,
  sortProjectLanes,
  type ProjectLaneRecord,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";
import { parseLaneWorkspaceSnapshot } from "@/lib/workspace/lane-engine";
import {
  getStrategyLaneOverviewSummary,
  isStrategyLane,
  parseStrategyLaneSnapshot
} from "@/lib/workspace/strategy-lane";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import {
  getBuildReviewLoop,
  getEngineConnectedServices,
  getExecutionRoutingModel
} from "@/lib/workspace/execution-orchestration";
import {
  emptyProgress,
  type LaneProgressSummary,
  type WorkspaceSnapshotItem
} from "@/components/workspace/workspace-shell-ui";

type WorkspaceShellProps = {
  workspaceId: string;
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
  userEmail?: string;
};

function laneProgress(workspaceId: string, project: ProjectRecord, lane: ProjectLaneRecord) {
  const storageKey = buildLaneConversationStorageKey({
    workspaceId,
    projectId: project.id,
    laneSlug: lane.slug
  });
  const raw = window.localStorage.getItem(storageKey);

  if (isStrategyLane(lane)) {
    const summary = getStrategyLaneOverviewSummary(parseStrategyLaneSnapshot(raw));
    if (summary) {
      return {
        label: "Drafted",
        detail: summary.projectSummary,
        updatedAt: parseStrategyLaneSnapshot(raw)?.updatedAt ?? null,
        hasActivity: true
      };
    }
  }

  const snapshot = parseLaneConversationSnapshot(raw);
  const laneWorkspaceSnapshot = parseLaneWorkspaceSnapshot(raw);

  if (laneWorkspaceSnapshot?.outputs) {
    return {
      label: "Updated",
      detail: laneWorkspaceSnapshot.outputs.summary,
      updatedAt: laneWorkspaceSnapshot.updatedAt,
      hasActivity: true
    };
  }

  if (!snapshot) {
    return emptyProgress(lane.status);
  }

  if (snapshot.messages.length > 1) {
    return {
      label: "In motion",
      detail: "Neroa already has active context here.",
      updatedAt: snapshot.updatedAt,
      hasActivity: true
    };
  }

  if (snapshot.draft.trim()) {
    return {
      label: "Draft waiting",
      detail: "There is unfinished input inside this lane.",
      updatedAt: snapshot.updatedAt,
      hasActivity: true
    };
  }

  return {
    label: "Ready",
    detail: "Open this lane when it becomes the next useful move.",
    updatedAt: snapshot.updatedAt,
    hasActivity: false
  };
}

export default function WorkspaceShell({
  workspaceId,
  project,
  projectMetadata,
  userEmail
}: WorkspaceShellProps) {
  const orderedLanes = useMemo(() => sortProjectLanes(project.lanes), [project.lanes]);
  const strategyLane = useMemo(
    () => orderedLanes.find((lane) => isStrategyLane(lane)) ?? orderedLanes[0] ?? null,
    [orderedLanes]
  );
  const leadingPhase = useMemo(
    () => (strategyLane ? getProjectLanePhaseForLane(strategyLane) : null),
    [strategyLane]
  );
  const recommendedLanes = useMemo(() => getProjectLanesByStatus(project, "recommended"), [project]);
  const lanePhases = useMemo(() => getProjectLanePhaseGroups(project), [project]);
  const [progressByLane, setProgressByLane] = useState<Record<string, LaneProgressSummary>>({});
  const [strategySummary, setStrategySummary] =
    useState<ReturnType<typeof getStrategyLaneOverviewSummary>>(null);
  const [strategyUpdatedAt, setStrategyUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const next = Object.fromEntries(
      orderedLanes.map((lane) => [lane.slug, laneProgress(workspaceId, project, lane)])
    );
    setProgressByLane(next);

    if (!strategyLane) {
      setStrategySummary(null);
      setStrategyUpdatedAt(null);
      return;
    }

    const key = buildLaneConversationStorageKey({
      workspaceId,
      projectId: project.id,
      laneSlug: strategyLane.slug
    });
    const parsed = parseStrategyLaneSnapshot(window.localStorage.getItem(key));
    setStrategySummary(getStrategyLaneOverviewSummary(parsed));
    setStrategyUpdatedAt(parsed?.updatedAt ?? null);
  }, [orderedLanes, project, project.id, strategyLane, workspaceId]);

  const saasIntake = projectMetadata?.saasIntake ?? null;
  const mobileAppIntake = projectMetadata?.mobileAppIntake ?? null;
  const buildSession = projectMetadata?.buildSession ?? null;
  const buildSessionCategoryLabel =
    buildSession?.scope.productTypeLabel ?? buildSession?.scope.buildTypeLabel ?? "Guided build";
  const buildSessionNextSteps = useMemo(() => {
    if (!buildSession) {
      return [];
    }

    const steps = [
      buildSession.scope.frameworkLabel
        ? `Keep ${buildSession.scope.frameworkLabel} as the execution baseline while the first lane gets underway.`
        : null,
      buildSession.scope.stackSystems && buildSession.scope.stackSystems.length > 0
        ? `Wire the systems layer around ${buildSession.scope.stackSystems.slice(0, 3).join(", ")} before widening the build.`
        : null,
      buildSession.path.selectedPathLabel
        ? `Stay on the ${buildSession.path.selectedPathLabel} path until the scope clearly justifies a change.`
        : buildSession.path.recommendedPathLabel
          ? `Follow the recommended ${buildSession.path.recommendedPathLabel} path as the starting execution lane.`
          : null,
      buildSession.scope.exampleLabel
        ? `Use ${buildSession.scope.exampleLabel} as the working reference while the first delivery lane sharpens the scope.`
        : null
    ].filter((item): item is string => Boolean(item));

    return (
      steps.length > 0
        ? steps
        : ["Neroa has the guided build state in place and can now open the first execution lane."]
    ).slice(0, 4);
  }, [buildSession]);

  const roadmap = strategySummary?.roadmap.slice(0, 4) ?? [];
  const blockers = strategySummary?.blockers ?? [];
  const currentGoal =
    strategySummary?.projectSummary ||
    buildSession?.scope.summary ||
    saasIntake?.projectSummary ||
    mobileAppIntake?.projectSummary ||
    project.description ||
    "Let the leading phase set the direction, then widen the engine only when the next move earns it.";
  const recommendedMove =
    roadmap[0]?.detail ??
    buildSessionNextSteps[0] ??
    saasIntake?.nextStepChecklist[0] ??
    mobileAppIntake?.nextStepChecklist[0] ??
    (recommendedLanes[0]
      ? `Open ${recommendedLanes[0].title} and keep the next decision tight.`
      : "Ask Neroa where the engine should move next.");
  const workspaceContext: NaruaWorkspaceContext | null = strategyLane
    ? {
        workspaceId,
        workspaceName: project.title,
        workspaceDescription: project.description,
        primaryLaneName: strategyLane.title,
        supportingLaneNames: recommendedLanes.map((lane) => lane.title),
        currentGoal,
        recommendedMove,
        activeBlocker: blockers[0] ?? null
      }
    : null;

  const thread = useNaruaThread({
    storageKey: `narua:project-overview:v1:${workspaceId}:${project.id}`,
    initialMessage: buildSession
      ? `Neroa is ready inside this ${buildSessionCategoryLabel.toLowerCase()} engine. I already have the product summary, selected framework, systems layer, and recommended build path from the guided setup. Ask me which lane should move first, let me guide Strategy into the first execution sequence, or use this same thread if you need clarification, get stuck, or want a person to step in.`
      : saasIntake
        ? "Neroa is ready inside this SaaS workspace. I already have the first product summary, MVP feature list, complexity estimate, and next-step checklist. Ask me which lane should move first, let me guide Strategy into the first build sequence, or use this same thread if you need clarification, get stuck, or want a person to step in."
        : mobileAppIntake
          ? "Neroa is ready inside this Mobile App engine. I already have the app summary, screen list, stack recommendation, complexity estimate, and next-step checklist. Ask me which lane should move first, let me guide Strategy into the first mobile build sequence, or use this same thread if you need clarification, get stuck, or want a person to step in."
          : workspaceContext
            ? createWorkspaceWelcomeMessage(workspaceContext)
            : "Neroa is ready to guide this engine.",
    buildReply: (message) =>
      workspaceContext
        ? createWorkspaceReply(workspaceContext, message)
        : `Neroa is holding the workspace context around "${message.trim()}".`,
    idleMessage:
      "Ask Neroa where the engine should focus next, or tell it what feels unclear or blocked.",
    contextTitle: project.title
  });

  const activeCount = Object.values(progressByLane).filter((item) => item.hasActivity).length;
  const generatedOutputsSnapshot = orderedLanes
    .map((lane) => ({
      lane,
      progress: progressByLane[lane.slug] ?? emptyProgress(lane.status)
    }))
    .filter((item) => item.progress.hasActivity)
    .slice(0, 4);
  const onboardingOutputsSnapshot: WorkspaceSnapshotItem[] =
    generatedOutputsSnapshot.length === 0 && buildSession
      ? [
          {
            id: "guided-summary",
            title: buildSession.scope.title ?? buildSession.scope.exampleLabel ?? buildSessionCategoryLabel,
            detail:
              buildSession.scope.summary ??
              "Neroa is holding the structured guided scope for this engine."
          },
          {
            id: "guided-framework",
            title: buildSession.scope.frameworkLabel ?? "Framework direction",
            detail:
              buildSession.path.recommendationReason ??
              buildSession.scope.stackRecommendationSummary ??
              "Neroa has the framework and systems direction ready for execution."
          },
          {
            id: "guided-features",
            title: "Core modules",
            detail:
              buildSession.scope.keyModules && buildSession.scope.keyModules.length > 0
                ? buildSession.scope.keyModules.slice(0, 3).join(", ")
                : "Neroa will sharpen the first feature set inside the engine."
          },
          {
            id: "guided-next-step",
            title: "Next-step checklist",
            detail:
              buildSessionNextSteps[0] ?? "Neroa will sequence the first execution move here."
          }
        ]
      : generatedOutputsSnapshot.length === 0 && saasIntake
        ? [
            {
              id: "saas-mvp",
              title: "MVP feature list",
              detail:
                saasIntake.mvpFeatureList.length > 0
                  ? saasIntake.mvpFeatureList.join(", ")
                  : "Neroa will sharpen the first feature set inside the engine."
            },
            {
              id: "saas-complexity",
              title: "Estimated build complexity",
              detail: `${saasIntake.buildComplexity.label} complexity. ${saasIntake.buildComplexity.summary}`
            },
            {
              id: "saas-budget",
              title: "Startup cost estimate",
              detail: `${saasIntake.startupCostEstimate.rangeLabel}. ${saasIntake.startupCostEstimate.summary}`
            },
            {
              id: "saas-next-step",
              title: "Next-step checklist",
              detail:
                saasIntake.nextStepChecklist[0] ??
                "Neroa will sequence the first execution move here."
            }
          ]
        : generatedOutputsSnapshot.length === 0 && mobileAppIntake
          ? [
              {
                id: "mobile-path",
                title: mobileAppIntake.stackRecommendation.recommendedPathLabel,
                detail: `${mobileAppIntake.stackRecommendation.recommendedPathValue}. ${mobileAppIntake.stackRecommendation.summary}`
              },
              {
                id: "mobile-screens",
                title: "MVP screen list",
                detail:
                  mobileAppIntake.screenList.length > 0
                    ? mobileAppIntake.screenList.join(", ")
                    : "Neroa will sharpen the first mobile screen sequence inside the engine."
              },
              {
                id: "mobile-complexity",
                title: "Estimated build complexity",
                detail: `${mobileAppIntake.buildComplexity.label} complexity. ${mobileAppIntake.buildComplexity.summary}`
              },
              {
                id: "mobile-budget",
                title: "Startup cost estimate",
                detail: `${mobileAppIntake.startupCostEstimate.rangeLabel}. ${mobileAppIntake.startupCostEstimate.summary}`
              }
            ]
          : [];
  const snapshotItems: WorkspaceSnapshotItem[] =
    generatedOutputsSnapshot.length > 0
      ? generatedOutputsSnapshot.map((item) => ({
          id: item.lane.id,
          title: item.lane.title,
          detail: item.progress.detail,
          href: buildProjectLaneRoute(workspaceId, project.id, item.lane.slug)
        }))
      : onboardingOutputsSnapshot;
  const aiSystemRoster = useMemo(
    () =>
      getProjectAiCollaboration(project).map((agent) => ({
        id: agent.id,
        badge: agent.badge,
        active: agent.active,
        description: `${agent.roleLabel} - ${agent.description}`
      })),
    [project]
  );
  const executionRouting = useMemo(() => getExecutionRoutingModel(), []);
  const buildReviewLoop = useMemo(() => getBuildReviewLoop(), []);
  const connectedServices = useMemo(() => {
    if (buildSession) {
      const sessionCategoryId =
        buildSession.scope.productTypeId === "saas" ||
        buildSession.scope.productTypeId === "internal-software" ||
        buildSession.scope.productTypeId === "external-app" ||
        buildSession.scope.productTypeId === "mobile-app"
          ? buildSession.scope.productTypeId
          : buildSession.scope.buildTypeId === "saas" ||
              buildSession.scope.buildTypeId === "internal-software" ||
              buildSession.scope.buildTypeId === "external-app" ||
              buildSession.scope.buildTypeId === "mobile-app"
            ? buildSession.scope.buildTypeId
            : "external-app";

      return getEngineConnectedServices({
        categoryId: sessionCategoryId,
        systemLabels: buildSession.scope.stackSystems ?? []
      });
    }

    if (mobileAppIntake) {
      return getEngineConnectedServices({
        categoryId: "mobile-app",
        mobilePlatformTarget: mobileAppIntake.answers.platformTarget,
        companionSurface: mobileAppIntake.answers.companionSurface,
        paymentsEnabled: mobileAppIntake.answers.needsPayments === "yes",
        accountsEnabled: mobileAppIntake.answers.needsAccounts === "yes"
      });
    }

    if (saasIntake) {
      return getEngineConnectedServices({
        categoryId: "saas",
        paymentsEnabled: saasIntake.answers.takesPayments === "yes",
        accountsEnabled: saasIntake.answers.needsAccounts === "yes"
      });
    }

    return getEngineConnectedServices({
      categoryId: "external-app"
    });
  }, [buildSession, mobileAppIntake, saasIntake]);

  if (!strategyLane) {
    return null;
  }

  return (
    <div className="surface-main relative overflow-hidden rounded-[42px]">
      <div className="floating-wash rounded-[42px]" />

      <div className="relative grid min-h-[calc(100vh-11rem)] xl:grid-cols-[360px_minmax(0,1fr)_360px] 2xl:grid-cols-[390px_minmax(0,1fr)_390px]">
        <WorkspaceShellLeftRail projectTitle={project.title} thread={thread} />
        <WorkspaceShellCenter
          workspaceId={workspaceId}
          project={project}
          strategyLane={strategyLane}
          strategySummary={strategySummary}
          strategyUpdatedAt={strategyUpdatedAt}
          activeCount={activeCount}
          orderedLanes={orderedLanes}
          progressByLane={progressByLane}
          snapshotItems={snapshotItems}
          recommendedMove={recommendedMove}
          thread={thread}
          lanePhases={lanePhases}
          buildSessionCategoryLabel={buildSessionCategoryLabel}
          buildSessionNextSteps={buildSessionNextSteps}
          buildSession={buildSession}
          saasIntake={saasIntake}
          mobileAppIntake={mobileAppIntake}
        />
        <WorkspaceShellRightRail
          workspaceId={workspaceId}
          projectId={project.id}
          aiSystemRoster={aiSystemRoster}
          executionRouting={executionRouting}
          buildReviewLoop={buildReviewLoop}
          connectedServices={connectedServices}
          userEmail={userEmail}
          leadingPhase={leadingPhase}
          strategyLane={strategyLane}
          strategyUpdatedAt={strategyUpdatedAt}
          orderedLanes={orderedLanes}
          progressByLane={progressByLane}
        />
      </div>
    </div>
  );
}
