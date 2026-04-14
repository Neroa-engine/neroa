"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import NaruaCore from "@/components/ai/NaruaCore";
import { useNaruaThread } from "@/components/narua/useNaruaThread";
import AiTeammateCards from "@/components/workspace/ai-teammate-cards";
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
  type ProjectLaneStatus,
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
  getExecutionRoutingModel,
  type ConnectedServiceState
} from "@/lib/workspace/execution-orchestration";

type WorkspaceShellProps = {
  workspaceId: string;
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
  userEmail?: string;
};

type LaneProgressSummary = {
  label: string;
  detail: string;
  updatedAt: string | null;
  hasActivity: boolean;
};

type WorkspaceSnapshotItem = {
  id: string;
  title: string;
  detail: string;
  href?: string;
};

function statusPill(status: ProjectLaneStatus) {
  if (status === "active") {
    return "border-cyan-300/25 bg-cyan-300/12 text-cyan-700";
  }
  if (status === "recommended") {
    return "border-emerald-300/30 bg-emerald-300/14 text-emerald-700";
  }
  return "border-slate-200 bg-white/75 text-slate-500";
}

function emptyProgress(status: ProjectLaneStatus): LaneProgressSummary {
  return {
    label: status === "active" ? "Ready" : status === "recommended" ? "Next" : "Later",
    detail:
      status === "active"
        ? "Naroa can move this lane forward now."
        : status === "recommended"
          ? "Open this lane when it sharpens the engine."
          : "Keep this lane parked until it is clearly useful.",
    updatedAt: null,
    hasActivity: false
  };
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "No recent activity";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No recent activity";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function connectedServiceBadgeClasses(state: ConnectedServiceState) {
  if (state === "core") {
    return "border-cyan-300/28 bg-cyan-50 text-cyan-700";
  }

  if (state === "launch") {
    return "border-violet-300/28 bg-violet-50 text-violet-700";
  }

  if (state === "conditional") {
    return "border-emerald-300/28 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

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
      detail: "Naroa already has active context here.",
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

function FloatingSection({
  eyebrow,
  title,
  children,
  action
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="floating-plane relative overflow-hidden rounded-[34px] p-6 xl:p-7">
      <div className="floating-wash rounded-[34px]" />
      <div className="relative">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
          </div>
          {action}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function LaneRow({
  workspaceId,
  projectId,
  lane,
  progress
}: {
  workspaceId: string;
  projectId: string;
  lane: ProjectLaneRecord;
  progress: LaneProgressSummary;
}) {
  return (
    <Link
      href={buildProjectLaneRoute(workspaceId, projectId, lane.slug)}
      className="micro-glow flex items-start justify-between gap-4 border-b border-slate-200/70 py-4 last:border-b-0"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-slate-950">{lane.title}</p>
          <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusPill(lane.status)}`}>
            {progress.label}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{progress.detail}</p>
      </div>
      <span className="text-xs text-slate-400">{formatUpdatedAt(progress.updatedAt)}</span>
    </Link>
  );
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
  const [strategySummary, setStrategySummary] = useState<ReturnType<typeof getStrategyLaneOverviewSummary>>(null);
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
  const guidedBuildIntake = projectMetadata?.guidedBuildIntake ?? null;
  const workspaceContext: NaruaWorkspaceContext | null = strategyLane
    ? {
        workspaceId,
        workspaceName: project.title,
        workspaceDescription: project.description,
        primaryLaneName: strategyLane.title,
        supportingLaneNames: recommendedLanes.map((lane) => lane.title)
      }
    : null;
  const thread = useNaruaThread({
    storageKey: `narua:project-overview:v1:${workspaceId}:${project.id}`,
    initialMessage: guidedBuildIntake
      ? `Naroa is ready inside this ${guidedBuildIntake.categoryLabel.toLowerCase()} engine. I already have the product summary, recommended framework, core module set, and first execution checklist. Ask me which lane should move first, or let me guide Strategy into the first execution sequence.`
      : saasIntake
      ? `Naroa is ready inside this SaaS workspace. I already have the first product summary, MVP feature list, complexity estimate, and next-step checklist. Ask me which lane should move first, or let me guide Strategy into the first build sequence.`
      : mobileAppIntake
        ? `Naroa is ready inside this Mobile App engine. I already have the app summary, screen list, stack recommendation, complexity estimate, and next-step checklist. Ask me which lane should move first, or let me guide Strategy into the first mobile build sequence.`
        : workspaceContext
        ? createWorkspaceWelcomeMessage(workspaceContext)
        : "Naroa is ready to guide this engine.",
    buildReply: (message) =>
      workspaceContext
        ? createWorkspaceReply(workspaceContext, message)
        : `Naroa is holding the workspace context around "${message.trim()}".`,
    idleMessage: "Ask Naroa where the engine should focus next.",
    contextTitle: project.title
  });

  const roadmap = strategySummary?.roadmap.slice(0, 4) ?? [];
  const budget = strategySummary?.budget ?? null;
  const plan = strategySummary?.recommendedPlan ?? null;
  const recentActions = strategySummary?.recentActions ?? [];
  const blockers = strategySummary?.blockers ?? [];
  const activeCount = Object.values(progressByLane).filter((item) => item.hasActivity).length;
  const generatedOutputsSnapshot = orderedLanes
    .map((lane) => ({
      lane,
      progress: progressByLane[lane.slug] ?? emptyProgress(lane.status)
    }))
    .filter((item) => item.progress.hasActivity)
    .slice(0, 4);
  const onboardingOutputsSnapshot: WorkspaceSnapshotItem[] =
    generatedOutputsSnapshot.length === 0 && guidedBuildIntake
      ? [
          {
            id: "guided-summary",
            title: guidedBuildIntake.templateIdeaLabel,
            detail: guidedBuildIntake.projectSummary
          },
          {
            id: "guided-framework",
            title: guidedBuildIntake.recommendedFrameworkLabel ?? guidedBuildIntake.primaryBuildPathLabel,
            detail: guidedBuildIntake.recommendationReason ?? `${guidedBuildIntake.primaryBuildPathValue}. ${guidedBuildIntake.primaryBuildPathDetail}`
          },
          {
            id: "guided-features",
            title: "Core modules",
            detail:
              (guidedBuildIntake.requiredModuleCards ?? guidedBuildIntake.featureCards).length > 0
                ? (guidedBuildIntake.requiredModuleCards ?? guidedBuildIntake.featureCards)
                    .slice(0, 3)
                    .map((item) => item.label)
                    .join(", ")
                : "Naroa will sharpen the first feature set inside the engine."
          },
          {
            id: "guided-next-step",
            title: "Next-step checklist",
            detail:
              guidedBuildIntake.nextStepChecklist[0] ??
              "Naroa will sequence the first execution move here."
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
                : "Naroa will sharpen the first feature set inside the engine."
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
            detail: saasIntake.nextStepChecklist[0] ?? "Naroa will sequence the first execution move here."
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
                  : "Naroa will sharpen the first mobile screen sequence inside the engine."
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
  const currentGoal =
    strategySummary?.projectSummary ||
    guidedBuildIntake?.projectSummary ||
    saasIntake?.projectSummary ||
    mobileAppIntake?.projectSummary ||
    project.description ||
    "Let the leading phase set the direction, then widen the engine only when the next move earns it.";
  const recommendedMove =
    roadmap[0]?.detail ??
    snapshotItems[0]?.detail ??
    (recommendedLanes[0]
      ? `Open ${recommendedLanes[0].title} and keep the next decision tight.`
      : "Ask Naroa where the engine should move next.");
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
    if (guidedBuildIntake) {
      return getEngineConnectedServices({
        categoryId: guidedBuildIntake.categoryId,
        featureCards: guidedBuildIntake.featureCards
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
  }, [guidedBuildIntake, mobileAppIntake, saasIntake]);

  if (!strategyLane) {
    return null;
  }

  return (
    <div className="surface-main relative overflow-hidden rounded-[42px]">
      <div className="floating-wash rounded-[42px]" />

      <div className="relative grid min-h-[calc(100vh-11rem)] xl:grid-cols-[360px_minmax(0,1fr)_360px] 2xl:grid-cols-[390px_minmax(0,1fr)_390px]">
        <aside className="thin-scrollbar border-b border-slate-200/70 px-6 py-6 xl:overflow-y-auto xl:border-b-0 xl:border-r xl:px-7 xl:py-8">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Naroa control
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {project.title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Ask Naroa what matters next, then widen the engine one lane at a time.
              </p>
            </div>

            <NaruaCore className="w-full" />

            <div className="space-y-3">
              {thread.messages.slice(-4).map((message) => (
                <div
                  key={message.id}
                  className={`rounded-[26px] px-4 py-4 ${
                    message.role === "narua"
                      ? "floating-plane"
                      : "bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(96,165,250,0.14),rgba(139,92,246,0.12))] shadow-[0_24px_60px_rgba(56,189,248,0.08)]"
                  }`}
                >
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${message.role === "narua" ? "text-cyan-700" : "text-slate-500"}`}>
                    {message.role === "narua" ? "Naroa" : "You"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{message.content}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[
                "Give me the next best lane to open.",
                "Summarize the current engine state.",
                "Where is the biggest execution risk right now?",
                "Compare the roadmap with the current budget."
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => thread.setDraft(prompt)}
                  className="micro-glow w-full border-b border-slate-200/70 pb-3 text-left text-sm leading-6 text-slate-600 last:border-b-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="floating-plane rounded-[30px] p-4">
              <textarea
                value={thread.draft}
                onChange={(event) => thread.setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    thread.handleSend();
                  }
                }}
                placeholder="Ask Naroa how the engine should move next..."
                className="input min-h-[110px] w-full resize-none"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Overview guidance updates the command center without changing lane outputs.
                </span>
                <button
                  type="button"
                  onClick={() => thread.handleSend()}
                  disabled={!thread.draft.trim()}
                  className="button-primary disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section className="thin-scrollbar min-w-0 overflow-y-auto px-6 py-6 xl:px-10 xl:py-8 2xl:px-12 2xl:py-10">
          <div className="space-y-8">
            <section className="space-y-5">
              <div className="max-w-5xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">
                  Engine command center
                </p>
                <h2 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
                  Guide the engine through Naroa, then widen only when the work demands it.
                </h2>
                <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 xl:text-lg">
                  {strategySummary?.projectSummary ||
                    project.description ||
                    "Start in Strategy, let Naroa define the first useful direction, then open only the lanes that directly move execution forward."}
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
                    Output snapshots will appear here as Naroa builds lane artifacts.
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
                    Ask Naroa
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
              ) : guidedBuildIntake ? (
                <div className="space-y-4">
                  {guidedBuildIntake.nextStepChecklist.slice(0, 4).map((item, index) => (
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
                            {guidedBuildIntake.categoryLabel}
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
                  Open the leading lane with Naroa to generate the first roadmap and execution focus.
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
                ) : guidedBuildIntake ? (
                  <>
                    <p className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                      {guidedBuildIntake.primaryBuildPathValue}
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                      {guidedBuildIntake.primaryBuildPathDetail}
                    </p>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Template direction</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {guidedBuildIntake.projectSummary}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-700">
                          {guidedBuildIntake.categoryLabel}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Build path</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {guidedBuildIntake.secondaryPathValue
                              ? `${guidedBuildIntake.secondaryPathLabel}: ${guidedBuildIntake.secondaryPathValue}.`
                              : "Naroa will keep this engine on the primary build path until the scope proves otherwise."}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-700">
                          {guidedBuildIntake.primaryBuildPathLabel}
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
                              ? "Naroa will keep guiding the build inside the engine."
                              : "Naroa will focus on roadmap, scope, and first execution planning."}
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
                    Budget guidance will appear here after Naroa has enough strategy context.
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
                    Naroa will recommend the right plan after it understands scope, complexity, and projected usage.
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
                ) : guidedBuildIntake ? (
                  guidedBuildIntake.nextStepChecklist.slice(0, 3).map((item) => (
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
                    Naroa will surface recent movement here after the first strategy pass is complete.
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
                    No active blockers yet. Naroa will flag execution risk here as the engine becomes more defined.
                  </p>
                )}
              </FloatingSection>
            </div>
          </div>
        </section>

        <aside className="thin-scrollbar border-t border-slate-200/70 px-6 py-6 xl:overflow-y-auto xl:border-l xl:border-t-0 xl:px-7 xl:py-8">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                AI system
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Naroa orchestrates the engine, GitHub stores the work, Codex can implement, Claude can review, and the specialist systems expand only where the lane mix really calls for them.
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
                      href={buildProjectLaneRoute(workspaceId, project.id, lane.slug)}
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
      </div>
    </div>
  );
}
