"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildConnectedSystems } from "@/lib/workspace/connected-systems";
import {
  buildLaneConversationStorageKey,
  buildProjectLaneRoute,
  getProjectLanesByStatus,
  parseLaneConversationSnapshot,
  type ProjectLaneRecord,
  type ProjectLaneStatus,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";

type WorkspaceShellProps = {
  workspaceId: string;
  project: ProjectRecord;
  userEmail?: string;
};

type LaneThreadState = {
  messageCount: number;
  hasDraft: boolean;
  updatedAt: string | null;
  stateLabel: string;
};

function createEmptyLaneThreadState(): LaneThreadState {
  return {
    messageCount: 0,
    hasDraft: false,
    updatedAt: null,
    stateLabel: "Not started"
  };
}

function createLaneThreadState(
  workspaceId: string,
  projectId: string,
  laneSlug: string
): LaneThreadState {
  const snapshot = parseLaneConversationSnapshot(
    window.localStorage.getItem(
      buildLaneConversationStorageKey({
        workspaceId,
        projectId,
        laneSlug
      })
    )
  );

  if (!snapshot) {
    return createEmptyLaneThreadState();
  }

  const messageCount = snapshot.messages.length;
  const hasDraft = snapshot.draft.trim().length > 0;

  if (messageCount > 1) {
    return {
      messageCount,
      hasDraft,
      updatedAt: snapshot.updatedAt,
      stateLabel: "In progress"
    };
  }

  if (hasDraft) {
    return {
      messageCount,
      hasDraft,
      updatedAt: snapshot.updatedAt,
      stateLabel: "Draft saved"
    };
  }

  return {
    messageCount,
    hasDraft,
    updatedAt: snapshot.updatedAt,
    stateLabel: "Ready"
  };
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "No activity yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No activity yet";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function statusPill(status: ProjectLaneStatus) {
  if (status === "active") {
    return "bg-cyan-400/12 text-cyan-200";
  }

  if (status === "recommended") {
    return "bg-emerald-400/12 text-emerald-200";
  }

  return "bg-white/[0.05] text-slate-400";
}

function sectionHeading(status: ProjectLaneStatus) {
  if (status === "active") {
    return "Active lanes";
  }

  if (status === "recommended") {
    return "Recommended lanes";
  }

  return "Optional lanes";
}

function ProjectLaneCard({
  workspaceId,
  projectId,
  lane,
  selected,
  threadState,
  onSelect
}: {
  workspaceId: string;
  projectId: string;
  lane: ProjectLaneRecord;
  selected: boolean;
  threadState: LaneThreadState;
  onSelect: (laneSlug: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lane.slug)}
      className={`w-full rounded-[24px] border p-4 text-left transition ${
        selected
          ? "border-cyan-300/22 bg-cyan-300/[0.08]"
          : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{lane.title}</p>
          <p className="truncate text-xs text-slate-500">{lane.slug}</p>
        </div>

        <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${statusPill(lane.status)}`}>
          {lane.status}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">{lane.description}</p>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-400">{threadState.stateLabel}</span>
        <span className="text-slate-500">{threadState.messageCount} msgs</span>
      </div>

      <div className="mt-4">
        <Link
          href={buildProjectLaneRoute(workspaceId, projectId, lane.slug)}
          className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 transition hover:bg-white/[0.08]"
        >
          Open lane
        </Link>
      </div>
    </button>
  );
}

function LaneSection({
  title,
  workspaceId,
  projectId,
  lanes,
  selectedLaneSlug,
  threadStateByLane,
  onSelect
}: {
  title: string;
  workspaceId: string;
  projectId: string;
  lanes: ProjectLaneRecord[];
  selectedLaneSlug: string;
  threadStateByLane: Record<string, LaneThreadState>;
  onSelect: (laneSlug: string) => void;
}) {
  if (lanes.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>
        <span className="rounded-full bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-400">
          {lanes.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {lanes.map((lane) => (
          <ProjectLaneCard
            key={lane.id}
            workspaceId={workspaceId}
            projectId={projectId}
            lane={lane}
            selected={selectedLaneSlug === lane.slug}
            threadState={threadStateByLane[lane.slug] ?? createEmptyLaneThreadState()}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default function WorkspaceShell({
  workspaceId,
  project,
  userEmail
}: WorkspaceShellProps) {
  const activeLanes = useMemo(() => getProjectLanesByStatus(project, "active"), [project]);
  const recommendedLanes = useMemo(
    () => getProjectLanesByStatus(project, "recommended"),
    [project]
  );
  const optionalLanes = useMemo(() => getProjectLanesByStatus(project, "optional"), [project]);
  const [selectedLaneSlug, setSelectedLaneSlug] = useState(project.lanes[0]?.slug ?? "");
  const [threadStateByLane, setThreadStateByLane] = useState<Record<string, LaneThreadState>>({});
  const connectedSystems = useMemo(() => buildConnectedSystems(project), [project]);

  useEffect(() => {
    if (project.lanes.some((lane) => lane.slug === selectedLaneSlug)) {
      return;
    }

    setSelectedLaneSlug(project.lanes[0]?.slug ?? "");
  }, [project.lanes, selectedLaneSlug]);

  useEffect(() => {
    const nextState = Object.fromEntries(
      project.lanes.map((lane) => [
        lane.slug,
        createLaneThreadState(workspaceId, project.id, lane.slug)
      ])
    );

    setThreadStateByLane(nextState);
  }, [project.id, project.lanes, workspaceId]);

  const selectedLane =
    project.lanes.find((lane) => lane.slug === selectedLaneSlug) ?? project.lanes[0];
  const selectedLaneThreadState =
    threadStateByLane[selectedLane?.slug ?? ""] ?? createEmptyLaneThreadState();
  const activeLaneCount = Object.values(threadStateByLane).filter(
    (laneState) => laneState.messageCount > 1 || laneState.hasDraft
  ).length;

  if (!selectedLane) {
    return null;
  }

  return (
    <div className="surface-main overflow-hidden">
      <div className="border-b border-white/8 px-6 py-6 xl:px-8 2xl:px-10">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.42fr))]">
          <div className="rounded-[28px] bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Project overview
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white xl:text-4xl">
              {project.title}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400 xl:text-base xl:leading-8">
              {project.description ||
                "Each Neroa project is its own engine workspace with template-driven lanes, isolated lane threads, and Narua at the center of the execution flow."}
            </p>
          </div>

          <div className="rounded-[28px] bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Template
            </p>
            <p className="mt-3 text-lg font-semibold text-white">{project.templateLabel}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Dynamic lane set generated from the project type.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Lane threads
            </p>
            <p className="mt-3 text-lg font-semibold text-white">{activeLaneCount} active</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Every lane keeps its own Narua thread history inside this project only.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Owner
            </p>
            <p className="mt-3 text-sm font-semibold text-white">{userEmail ?? "Authenticated user"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Canonical route: <span className="text-slate-300">/workspace/{workspaceId}/project/{project.id}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-3rem)] xl:grid-cols-[380px_minmax(0,1fr)_460px]">
        <aside className="thin-scrollbar border-b border-white/8 bg-[linear-gradient(180deg,rgba(8,12,24,0.98),rgba(11,16,29,0.95))] px-5 py-6 xl:overflow-y-auto xl:border-b-0 xl:border-r xl:px-6">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Data model
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <p><code>projects</code> {"->"} top-level Narroa Engine / workspace record</p>
              <p><code>project_lanes</code> {"->"} template or custom lanes generated for the project</p>
              <p><code>lane_conversations</code> {"->"} one Narua thread per lane</p>
              <p><code>lane_messages</code> {"->"} messages scoped only to that lane slug</p>
              <p><code>project_artifacts</code> {"->"} outputs produced from each lane thread</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <LaneSection
              title={sectionHeading("active")}
              workspaceId={workspaceId}
              projectId={project.id}
              lanes={activeLanes}
              selectedLaneSlug={selectedLaneSlug}
              threadStateByLane={threadStateByLane}
              onSelect={setSelectedLaneSlug}
            />

            <LaneSection
              title={sectionHeading("recommended")}
              workspaceId={workspaceId}
              projectId={project.id}
              lanes={recommendedLanes}
              selectedLaneSlug={selectedLaneSlug}
              threadStateByLane={threadStateByLane}
              onSelect={setSelectedLaneSlug}
            />

            <LaneSection
              title={sectionHeading("optional")}
              workspaceId={workspaceId}
              projectId={project.id}
              lanes={optionalLanes}
              selectedLaneSlug={selectedLaneSlug}
              threadStateByLane={threadStateByLane}
              onSelect={setSelectedLaneSlug}
            />
          </div>
        </aside>

        <section className="min-w-0 border-b border-white/8 px-6 py-6 xl:border-b-0 xl:px-8 xl:py-8 2xl:px-10 2xl:py-10">
          <div className="space-y-6">
            <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Selected lane
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">{selectedLane.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                    {selectedLane.description}
                  </p>
                </div>

                <Link
                  href={buildProjectLaneRoute(workspaceId, project.id, selectedLane.slug)}
                  className="button-primary"
                >
                  Open {selectedLane.title} thread
                </Link>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[24px] bg-[#090f1d] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Lane metadata
                  </p>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    <p><span className="text-slate-500">id:</span> {selectedLane.id}</p>
                    <p><span className="text-slate-500">project_id:</span> {selectedLane.projectId}</p>
                    <p><span className="text-slate-500">slug:</span> {selectedLane.slug}</p>
                    <p><span className="text-slate-500">sort_order:</span> {selectedLane.sortOrder}</p>
                    <p><span className="text-slate-500">status:</span> {selectedLane.status}</p>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#090f1d] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Thread state
                  </p>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {selectedLaneThreadState.stateLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Last activity: {formatUpdatedAt(selectedLaneThreadState.updatedAt)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Lane messages remain isolated inside <code>{selectedLane.slug}</code>.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/8 bg-white/[0.03] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Lane outputs
              </p>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {selectedLane.deliverables.map((deliverable) => (
                  <div key={deliverable} className="rounded-[22px] bg-[#090f1d] p-4">
                    <p className="text-sm font-semibold text-white">{deliverable}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      This artifact will be shaped inside the {selectedLane.title.toLowerCase()} lane thread and attached back to the parent project.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <aside className="thin-scrollbar min-w-0 overflow-y-auto border-l border-white/8 px-6 py-6 xl:px-8 xl:py-8">
          <div className="space-y-4">
            <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Connected systems
              </p>
              <div className="mt-4 space-y-3">
                {connectedSystems.map((system) => (
                  <div key={system.id} className="rounded-2xl bg-[#090f1d] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{system.name}</p>
                      <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                        {system.architectureMode}
                      </span>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                      {system.statusText}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{system.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Recommended stack
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedLane.recommendedAIStack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#090f1d] px-3 py-2 text-[11px] text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Starter prompts
              </p>
              <div className="mt-4 space-y-3">
                {selectedLane.starterPrompts.map((prompt) => (
                  <div key={prompt} className="rounded-2xl bg-[#090f1d] px-4 py-3 text-sm leading-7 text-slate-200">
                    {prompt}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
