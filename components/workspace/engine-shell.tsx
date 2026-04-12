"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { NaruaDesktopPanel, NaruaMobileDrawer } from "@/components/narua/NaruaPanel";
import { useNaruaThread } from "@/components/narua/useNaruaThread";
import {
  createEngineReply,
  createEngineWelcomeMessage,
  type NaruaEngineContext
} from "@/lib/narua/planning";
import {
  buildLaneConversationStorageKey,
  buildProjectLaneRoute,
  buildProjectRoute,
  type ProjectLaneRecord
} from "@/lib/workspace/project-lanes";

type EngineShellProps = {
  workspace: {
    id: string;
    name: string;
    description: string | null;
  };
  project: {
    id: string;
    title: string;
    templateLabel: string;
  };
  lane: ProjectLaneRecord;
  naruaEnabled: boolean;
  children: ReactNode;
};

type NaruaEnabledEngineFrameProps = {
  workspace: EngineShellProps["workspace"];
  project: EngineShellProps["project"];
  lane: ProjectLaneRecord;
  children: ReactNode;
};

function NaruaEnabledEngineFrame({
  workspace,
  project,
  lane,
  children
}: NaruaEnabledEngineFrameProps) {
  const naruaContext: NaruaEngineContext = {
    workspaceId: workspace.id,
    workspaceName: project.title,
    workspaceDescription: workspace.description,
    engineSlug: lane.slug,
    engineTitle: lane.title,
    engineDescription: lane.description,
    recommendedAIStack: lane.recommendedAIStack
  };
  const thread = useNaruaThread({
    storageKey: buildLaneConversationStorageKey({
      workspaceId: workspace.id,
      projectId: project.id,
      laneSlug: lane.slug
    }),
    initialMessage: createEngineWelcomeMessage(naruaContext),
    buildReply: (message) => createEngineReply(naruaContext, message),
    idleMessage: "Type or speak to Narua inside this lane thread"
  });
  const panelProps = {
    contextLabel: "Lane Thread",
    contextTitle: lane.title,
    contextDescription: lane.description,
    statusText:
      "Narua is active in this lane thread and will keep the conversation scoped to this project lane only.",
    recommendedStack: lane.recommendedAIStack,
    suggestedPrompts: lane.starterPrompts,
    messages: thread.messages,
    draft: thread.draft,
    onDraftChange: thread.setDraft,
    onSend: thread.handleSend,
    voiceState: thread.voiceState,
    voiceMessage: thread.voiceMessage,
    onVoiceTranscript: thread.handleVoiceTranscript,
    onVoiceStatusChange: thread.handleVoiceStatusChange
  };

  return (
    <>
      <div className="border-b border-white/8 px-6 py-4 xl:hidden">
        <NaruaMobileDrawer {...panelProps} />
      </div>

      <div className="flex min-h-[calc(100vh-10rem)] flex-col xl:flex-row">
        <div className="thin-scrollbar min-w-0 flex-1 overflow-y-auto px-6 py-6 xl:px-8 xl:py-8 2xl:px-10 2xl:py-10">
          {children}
        </div>

        <NaruaDesktopPanel {...panelProps} />
      </div>
    </>
  );
}

export default function EngineShell({
  workspace,
  project,
  lane,
  naruaEnabled,
  children
}: EngineShellProps) {
  return (
    <main className="min-h-screen bg-[#060816] py-6 text-white">
      <div className="mx-auto w-full max-w-[1840px] px-4 sm:px-6 xl:px-8">
        <div className="surface-main overflow-hidden">
          <div className="border-b border-white/8 px-6 py-6 xl:px-8 2xl:px-10">
            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div className="max-w-5xl">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={buildProjectRoute(workspace.id, project.id)}
                    className="button-secondary"
                  >
                    Back to project overview
                  </Link>
                  <span className="rounded-full bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                    {lane.title} lane
                  </span>
                  <span className="rounded-full bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                    {project.templateLabel}
                  </span>
                  {!naruaEnabled ? (
                    <span className="rounded-full bg-amber-400/12 px-4 py-2 text-xs uppercase tracking-[0.18em] text-amber-200">
                      Narua excluded
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white xl:text-4xl 2xl:text-[2.8rem]">
                  {project.title}
                </h1>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400 xl:text-base xl:leading-8">
                  {workspace.description ||
                    "Dynamic project workspace powered by Neroa lane threads."}
                </p>
              </div>

              <div>
                <Link
                  href={buildProjectLaneRoute(workspace.id, project.id, lane.slug)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-200"
                >
                  {lane.slug}
                </Link>
              </div>
            </div>
          </div>

          {naruaEnabled ? (
            <NaruaEnabledEngineFrame workspace={workspace} project={project} lane={lane}>
              {children}
            </NaruaEnabledEngineFrame>
          ) : (
            <div className="thin-scrollbar min-h-[calc(100vh-10rem)] overflow-y-auto px-6 py-6 xl:px-8 xl:py-8 2xl:px-10 2xl:py-10">
              {children}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
