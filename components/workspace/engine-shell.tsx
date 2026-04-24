"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { NaruaDesktopPanel, NaruaMobileDrawer } from "@/components/narua/NaruaPanel";
import {
  LaneWorkspaceEngineProvider,
  useLaneWorkspaceEngine
} from "@/components/workspace/lane-workspace-engine";
import {
  buildLaneConversationStorageKey,
  buildProjectLaneRoute,
  buildProjectRoute,
  getProjectLanePhaseForLane,
  getProjectLanePhaseGroups,
  type ProjectLaneRecord,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";
import { isBudgetLane } from "@/lib/workspace/budget-lane";
import { isStrategyLane } from "@/lib/workspace/strategy-lane";

type EngineShellProps = {
  workspace: {
    id: string;
    name: string;
    description: string | null;
  };
  project: ProjectRecord;
  lane: ProjectLaneRecord;
  naruaEnabled: boolean;
  children: ReactNode;
};

type NaruaEnabledEngineFrameProps = {
  workspace: EngineShellProps["workspace"];
  project: ProjectRecord;
  lane: ProjectLaneRecord;
  children: ReactNode;
};

function StrategyLaneFrame({
  workspace,
  project,
  lane,
  children
}: NaruaEnabledEngineFrameProps) {
  return (
    <div className="grid min-h-[calc(100vh-10rem)] xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
      <LaneNavigator workspaceId={workspace.id} project={project} activeLaneSlug={lane.slug} />

      <div className="thin-scrollbar min-w-0 overflow-y-auto px-6 py-6 xl:px-8 xl:py-8 2xl:px-10 2xl:py-10">
        {children}
      </div>
    </div>
  );
}

function StandardNaruaEnabledEngineFrame({
  workspace,
  project,
  lane,
  children
}: NaruaEnabledEngineFrameProps) {
  return (
    <LaneWorkspaceEngineProvider
      storageKey={buildLaneConversationStorageKey({
        workspaceId: workspace.id,
        projectId: project.id,
        laneSlug: lane.slug
      })}
      project={project}
      lane={lane}
    >
      <StandardNaruaEnabledEngineLayout workspace={workspace} project={project} lane={lane}>
        {children}
      </StandardNaruaEnabledEngineLayout>
    </LaneWorkspaceEngineProvider>
  );
}

function StandardNaruaEnabledEngineLayout({
  workspace,
  project,
  lane,
  children
}: NaruaEnabledEngineFrameProps) {
  const laneWorkspace = useLaneWorkspaceEngine();
  const panelProps = {
    contextLabel: "Neroa Guidance",
    contextTitle: lane.title,
    contextDescription: lane.description,
    statusText: laneWorkspace.statusText,
    recommendedStack: lane.recommendedAIStack,
    suggestedPrompts: laneWorkspace.suggestedPrompts,
    messages: laneWorkspace.messages,
    draft: laneWorkspace.draft,
    onDraftChange: laneWorkspace.setDraft,
    onSend: laneWorkspace.handleSend,
    voiceState: laneWorkspace.voiceState,
    voiceMessage: laneWorkspace.voiceMessage,
    onVoiceTranscript: laneWorkspace.handleVoiceTranscript,
    onVoiceStatusChange: laneWorkspace.handleVoiceStatusChange,
    isProcessing: laneWorkspace.isProcessing,
    collaboration: laneWorkspace.collaboration,
    nextMove: laneWorkspace.nextMove,
    errorText: laneWorkspace.error,
    threadMeta: laneWorkspace.threadMeta
  };

  return (
    <>
      <div className="border-b border-slate-200/70 px-6 py-4 xl:hidden">
        <NaruaMobileDrawer {...panelProps} />
      </div>

      <div className="grid min-h-[calc(100vh-10rem)] xl:grid-cols-[320px_minmax(0,1fr)_460px] 2xl:grid-cols-[340px_minmax(0,1fr)_520px]">
        <LaneNavigator workspaceId={workspace.id} project={project} activeLaneSlug={lane.slug} />

        <div className="thin-scrollbar min-w-0 overflow-y-auto px-6 py-6 xl:px-8 xl:py-8 2xl:px-10 2xl:py-10">
          {children}
        </div>

        <NaruaDesktopPanel {...panelProps} />
      </div>
    </>
  );
}

function lanePill(status: ProjectLaneRecord["status"], active: boolean) {
  if (active) {
    return "border-cyan-300/25 bg-cyan-300/12 text-cyan-700";
  }

  if (status === "active") {
    return "border-emerald-300/30 bg-emerald-300/14 text-emerald-700";
  }

  if (status === "recommended") {
    return "border-slate-200 bg-white/70 text-slate-600";
  }

  return "border-slate-200 bg-white/60 text-slate-400";
}

function LaneLinkCard({
  workspaceId,
  projectId,
  lane,
  active
}: {
  workspaceId: string;
  projectId: string;
  lane: ProjectLaneRecord;
  active: boolean;
}) {
  return (
    <Link
      href={buildProjectLaneRoute(workspaceId, projectId, lane.slug)}
      className={`block rounded-[22px] border px-4 py-3 transition ${
        active
          ? "border-cyan-300/25 bg-cyan-300/12 shadow-[0_20px_50px_rgba(34,211,238,0.12)]"
          : "border-slate-200 bg-white/70 hover:bg-white/85"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">{lane.title}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{lane.description}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${lanePill(
            lane.status,
            active
          )}`}
        >
          {active ? "Open" : lane.status === "active" ? "Ready" : lane.status === "recommended" ? "Next" : "Later"}
        </span>
      </div>
    </Link>
  );
}

function LaneNavigator({
  workspaceId,
  project,
  activeLaneSlug
}: {
  workspaceId: string;
  project: ProjectRecord;
  activeLaneSlug: string;
}) {
  const lanePhases = getProjectLanePhaseGroups(project);

  return (
    <aside className="thin-scrollbar border-b border-slate-200/70 px-5 py-6 xl:overflow-y-auto xl:border-b-0 xl:border-r xl:px-6">
      <div className="floating-plane rounded-[30px] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Execution phases
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Follow the guided sequence from strategy into build, budget, launch, and operations without losing the focused lane context.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {lanePhases.map((phase) => (
          <section key={phase.id} className="floating-plane rounded-[30px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  {phase.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{phase.summary}</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] text-slate-500">
                {phase.lanes.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {phase.lanes.map((item) => (
                <LaneLinkCard
                  key={item.id}
                  workspaceId={workspaceId}
                  projectId={project.id}
                  lane={item}
                  active={item.slug === activeLaneSlug}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function NaruaEnabledEngineFrame({
  workspace,
  project,
  lane,
  children
}: NaruaEnabledEngineFrameProps) {
  const customWorkspaceLane = isStrategyLane(lane) || isBudgetLane(lane);

  if (customWorkspaceLane) {
    return <StrategyLaneFrame workspace={workspace} project={project} lane={lane} children={children} />;
  }

  return <StandardNaruaEnabledEngineFrame workspace={workspace} project={project} lane={lane} children={children} />;
}

export default function EngineShell({
  workspace,
  project,
  lane,
  naruaEnabled,
  children
}: EngineShellProps) {
  const lanePhase = getProjectLanePhaseForLane(lane);

  return (
    <div className="surface-main relative overflow-hidden rounded-[42px]">
      <div className="floating-wash rounded-[42px]" />
      <div className="relative">
        <div className="border-b border-slate-200/70 px-6 py-6 xl:px-8 2xl:px-10">
            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div className="max-w-5xl">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={buildProjectRoute(workspace.id, project.id)}
                    className="button-secondary"
                  >
                    Back to engine overview
                  </Link>
                  <span className="rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Neroa Workspace
                  </span>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-700">
                    {lanePhase.label}
                  </span>
                  {!naruaEnabled ? (
                    <span className="rounded-full border border-amber-300/35 bg-amber-50/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-amber-700">
                      Neroa excluded
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 xl:text-4xl 2xl:text-[2.8rem]">
                  {lane.title}
                </h1>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 xl:text-base xl:leading-8">
                  {lane.description}
                </p>
              </div>

              <div className="floating-plane max-w-sm rounded-[30px] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  What this lane does
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{lanePhase.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {lanePhase.summary} Neroa keeps this lane tied to {project.title} with a dedicated thread, live deliverables, and a clear next move for the engine.
                </p>
              </div>
            </div>
          </div>

          {naruaEnabled ? (
            <NaruaEnabledEngineFrame workspace={workspace} project={project} lane={lane}>
              {children}
            </NaruaEnabledEngineFrame>
          ) : (
            <div className="grid min-h-[calc(100vh-10rem)] xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
              <LaneNavigator
                workspaceId={workspace.id}
                project={project}
                activeLaneSlug={lane.slug}
              />

              <div className="thin-scrollbar min-h-0 overflow-y-auto px-6 py-6 xl:px-8 xl:py-8 2xl:px-10 2xl:py-10">
                {children}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
