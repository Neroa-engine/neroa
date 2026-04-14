"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NaruaChat from "@/components/narua/NaruaChat";
import AiTeammateCards from "@/components/workspace/ai-teammate-cards";
import type { VoiceInputState } from "@/components/narua/VoiceInputButton";
import { getLaneAiCollaboration } from "@/lib/ai/collaboration";
import {
  buildLaneConversationStorageKey,
  buildProjectRoute,
  type ProjectLaneRecord,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";
import {
  buildStrategyLaneSnapshotStorageValue,
  buildStrategyLaneStateFromMessage,
  createStrategyLaneInitialSnapshot,
  getStrategyLaneLabels,
  getStrategySuggestedPrompts,
  parseStrategyLaneSnapshot,
  type StrategyLaneSnapshot,
  type StrategyRoadmapItem,
  updateStrategyOutputBlock
} from "@/lib/workspace/strategy-lane";

type StrategyLaneWorkspaceProps = {
  workspaceId: string;
  project: ProjectRecord;
  lane: ProjectLaneRecord;
};

type EditableBlockKey = "model" | "target" | "offer" | "launch";

function emptyVoiceMessage() {
  return "Tap the mic and speak naturally. Press Send when ready.";
}

function roadmapStatusClasses(status: StrategyRoadmapItem["status"], active: boolean) {
  if (active) {
    return "border-cyan-300/24 bg-cyan-300/[0.10] shadow-[0_20px_50px_rgba(34,211,238,0.10)]";
  }

  if (status === "now") {
    return "border-emerald-300/30 bg-emerald-300/[0.12]";
  }

  if (status === "next") {
    return "border-slate-200 bg-white/76";
  }

  return "border-slate-200/70 bg-white/60";
}

function roadmapBadge(status: StrategyRoadmapItem["status"]) {
  if (status === "now") {
    return "Now";
  }

  if (status === "next") {
    return "Next";
  }

  return "Later";
}

function StrategyBlockCard({
  title,
  value,
  editing,
  draftValue,
  onEdit,
  onCancel,
  onDraftChange,
  onSave
}: {
  title: string;
  value: string | null;
  editing: boolean;
  draftValue: string;
  onEdit: () => void;
  onCancel: () => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <section className="floating-plane rounded-[30px] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>
        {!editing ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] text-slate-600 transition hover:bg-white"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] text-slate-600 transition hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-full border border-cyan-300/25 bg-cyan-300/12 px-3 py-1 text-[11px] text-cyan-700 transition hover:bg-cyan-300/18"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          value={draftValue}
          onChange={(event) => onDraftChange(event.target.value)}
          className="input mt-4 min-h-[120px] w-full resize-none"
        />
      ) : (
        <p className="mt-4 text-sm leading-7 text-slate-700">
          {value || `Naroa will generate ${title.toLowerCase()} once the strategy intake is complete.`}
        </p>
      )}
    </section>
  );
}

function EmptyStrategyCard({
  title,
  message
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="floating-plane rounded-[30px] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      <div className="mt-4 rounded-[20px] border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm leading-6 text-slate-500">
        {message}
      </div>
    </section>
  );
}

export default function StrategyLaneWorkspace({
  workspaceId,
  project,
  lane
}: StrategyLaneWorkspaceProps) {
  const storageKey = useMemo(
    () =>
      buildLaneConversationStorageKey({
        workspaceId,
        projectId: project.id,
        laneSlug: lane.slug
      }),
    [lane.slug, project.id, workspaceId]
  );
  const strategyLabels = useMemo(() => getStrategyLaneLabels(project), [project]);
  const suggestedPrompts = useMemo(() => getStrategySuggestedPrompts(project, lane), [lane, project]);
  const [snapshot, setSnapshot] = useState<StrategyLaneSnapshot>(() =>
    createStrategyLaneInitialSnapshot(project, lane)
  );
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceInputState>("idle");
  const [voiceMessage, setVoiceMessage] = useState(emptyVoiceMessage());
  const [selectedRoadmapItemId, setSelectedRoadmapItemId] = useState<string | null>(null);
  const [isBudgetExpanded, setIsBudgetExpanded] = useState(false);
  const [editingBlock, setEditingBlock] = useState<EditableBlockKey | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [strategyError, setStrategyError] = useState<string | null>(null);

  useEffect(() => {
    const savedSnapshot = parseStrategyLaneSnapshot(window.localStorage.getItem(storageKey));

    if (savedSnapshot) {
      setSnapshot(savedSnapshot);
      setSelectedRoadmapItemId(savedSnapshot.outputs?.roadmap[0]?.id ?? null);
    } else {
      const initialSnapshot = createStrategyLaneInitialSnapshot(project, lane);
      setSnapshot(initialSnapshot);
      setSelectedRoadmapItemId(null);
    }

    setHasLoaded(true);
  }, [lane, project, storageKey]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem(storageKey, buildStrategyLaneSnapshotStorageValue(snapshot));
  }, [hasLoaded, snapshot, storageKey]);

  const selectedRoadmapItem =
    snapshot.outputs?.roadmap.find((item) => item.id === selectedRoadmapItemId) ??
    snapshot.outputs?.roadmap[0] ??
    null;

  function setDraft(value: string) {
    setSnapshot((current) => ({
      ...current,
      draft: value
    }));
  }

  const collaborationAgents = useMemo(
    () =>
      getLaneAiCollaboration(lane).map((agent) => ({
        id: agent.id,
        badge: agent.badge,
        active: agent.active,
        description: `${agent.roleLabel} - ${agent.description}`
      })),
    [lane]
  );

  function handleSend(valueOverride?: string) {
    const value = (valueOverride ?? snapshot.draft).trim();

    if (!value || isProcessing) {
      return;
    }

    setStrategyError(null);
    setSnapshot((current) => ({
      ...current,
      draft: ""
    }));
    setIsProcessing(true);

    window.setTimeout(() => {
      try {
        const nextState = buildStrategyLaneStateFromMessage({
          project,
          lane,
          snapshot: {
            ...snapshot,
            draft: ""
          },
          message: value
        });

        setSnapshot(nextState.snapshot);
        if (!selectedRoadmapItemId && nextState.snapshot.outputs?.roadmap[0]) {
          setSelectedRoadmapItemId(nextState.snapshot.outputs.roadmap[0].id);
        }
      } catch (error) {
        console.error("STRATEGY_LANE_ERROR", error);
        setStrategyError(
          "Naroa hit a strategy update issue, but your conversation is still here. Try the message again and we’ll keep moving."
        );
      } finally {
        setIsProcessing(false);
      }
    }, 360);
  }

  function handleVoiceTranscript(transcript: string) {
    setDraft(transcript);
  }

  function handleVoiceStatusChange(state: VoiceInputState, message: string) {
    setVoiceState(state);
    setVoiceMessage(message);
  }

  function beginEdit(key: EditableBlockKey) {
    setEditingBlock(key);
    setEditingDraft(snapshot.outputs?.[key] ?? "");
  }

  function cancelEdit() {
    setEditingBlock(null);
    setEditingDraft("");
  }

  function saveEdit() {
    if (!editingBlock) {
      return;
    }

    setSnapshot((current) => updateStrategyOutputBlock(current, editingBlock, editingDraft.trim()));
    setEditingBlock(null);
    setEditingDraft("");
  }

  const projectSummary = snapshot.outputs?.projectSummary ?? snapshot.answers.concept;

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_430px]">
      <div className="space-y-6">
        <section className="floating-plane rounded-[34px] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Naroa Strategy Workspace
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 xl:text-4xl">
                {lane.title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 xl:text-base xl:leading-8">
                Naroa is leading the strategy thread for this engine so the roadmap, budget, and plan recommendation stay grounded in a usable direction instead of scattered notes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href={buildProjectRoute(workspaceId, project.id)} className="button-secondary">
                Engine overview
              </Link>
              <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                Powered by Naroa
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200 bg-white/78 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Current objective
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {snapshot.outputs
                  ? "Review the live strategy outputs, tighten scope, and keep Naroa aligned to the next execution move."
                  : "Complete the strategy intake so Naroa can build the first roadmap, budget estimate, and plan recommendation."}
              </p>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white/78 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Working summary
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {projectSummary || "Naroa will summarize the strategy once the first inputs are in."}
              </p>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white/78 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Naroa recommendation
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {snapshot.outputs
                  ? snapshot.outputs.recommendedPlan.usageHeadline
                  : "Naroa will recommend the right plan after the first strategy draft is complete."}
              </p>
            </div>
          </div>

          {strategyError ? (
            <div className="mt-4 rounded-2xl border border-rose-300/50 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
              {strategyError}
            </div>
          ) : null}
        </section>

        <NaruaChat
          messages={snapshot.messages}
          draft={snapshot.draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          generatedPlan={null}
          onPlanAction={() => {}}
          voiceState={voiceState}
          voiceMessage={voiceMessage}
          onVoiceTranscript={handleVoiceTranscript}
          onVoiceStatusChange={handleVoiceStatusChange}
          eyebrow="Naroa Presence"
          title={`Naroa is driving ${lane.title.toLowerCase()}`}
          description="Use the conversation to define direction, narrow scope, estimate budget, and let Naroa recommend the right plan before the engine widens."
          helperText="Text or voice both work here. Naroa will keep the strategy thread structured and persistent."
          composerPlaceholder="Tell Naroa what you want to shape next..."
          isProcessing={isProcessing}
          suggestedPrompts={suggestedPrompts}
          onSuggestedPromptSelect={setDraft}
          autoSendSuggestedPrompts
        />
      </div>

      <aside className="thin-scrollbar min-w-0 space-y-4 overflow-y-auto">
        <section className="floating-plane rounded-[30px] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Active AI stack
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            These systems are shaping the strategy together right now.
          </p>
          <div className="mt-4">
            <AiTeammateCards agents={collaborationAgents} compact className="grid-cols-1" />
          </div>
        </section>

        <StrategyBlockCard
          title={strategyLabels.modelTitle}
          value={snapshot.outputs?.model ?? null}
          editing={editingBlock === "model"}
          draftValue={editingDraft}
          onEdit={() => beginEdit("model")}
          onCancel={cancelEdit}
          onDraftChange={setEditingDraft}
          onSave={saveEdit}
        />
        <StrategyBlockCard
          title={strategyLabels.targetTitle}
          value={snapshot.outputs?.target ?? null}
          editing={editingBlock === "target"}
          draftValue={editingDraft}
          onEdit={() => beginEdit("target")}
          onCancel={cancelEdit}
          onDraftChange={setEditingDraft}
          onSave={saveEdit}
        />
        <StrategyBlockCard
          title={strategyLabels.offerTitle}
          value={snapshot.outputs?.offer ?? null}
          editing={editingBlock === "offer"}
          draftValue={editingDraft}
          onEdit={() => beginEdit("offer")}
          onCancel={cancelEdit}
          onDraftChange={setEditingDraft}
          onSave={saveEdit}
        />
        <StrategyBlockCard
          title={strategyLabels.launchTitle}
          value={snapshot.outputs?.launch ?? null}
          editing={editingBlock === "launch"}
          draftValue={editingDraft}
          onEdit={() => beginEdit("launch")}
          onCancel={cancelEdit}
          onDraftChange={setEditingDraft}
          onSave={saveEdit}
        />

        {snapshot.outputs ? (
          <section className="floating-plane rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Current roadmap
              </p>
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] text-slate-500">
                {snapshot.outputs.roadmap.length} items
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {snapshot.outputs.roadmap.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRoadmapItemId(item.id)}
                  className={`micro-glow w-full rounded-[20px] border px-4 py-3 text-left transition ${roadmapStatusClasses(
                    item.status,
                    item.id === selectedRoadmapItem?.id
                  )}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      {roadmapBadge(item.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </button>
              ))}
            </div>

            {selectedRoadmapItem ? (
              <div className="mt-4 rounded-[20px] border border-slate-200 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-950">{selectedRoadmapItem.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedRoadmapItem.detail}</p>
                <button
                  type="button"
                  onClick={() => setDraft(`Help me execute this roadmap item next: ${selectedRoadmapItem.title}`)}
                  className="mt-4 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 transition hover:bg-slate-50"
                >
                  Ask Naroa to execute this
                </button>
              </div>
            ) : null}
          </section>
        ) : (
          <EmptyStrategyCard
            title="Current roadmap"
            message="Complete the strategy intake to generate the first roadmap."
          />
        )}

        {snapshot.outputs ? (
          <section className="floating-plane rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {strategyLabels.budgetTitle}
              </p>
              <button
                type="button"
                onClick={() => setIsBudgetExpanded((current) => !current)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-slate-300 transition hover:bg-white/[0.08]"
              >
                {isBudgetExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
            <p className="mt-4 text-2xl font-semibold text-slate-950">
              {snapshot.outputs.budget.rangeLabel}
            </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{snapshot.outputs.budget.summary}</p>

            {isBudgetExpanded ? (
              <>
                <div className="mt-4 space-y-3">
                  {snapshot.outputs.budget.lineItems.map((item) => (
                    <div key={item.label} className="rounded-[20px] border border-slate-200 bg-white/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                        <span className="text-sm text-cyan-700">{item.amountLabel}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {snapshot.outputs.budget.assumptions.map((item) => (
                    <p key={item} className="text-sm leading-6 text-slate-600">
                      {item}
                    </p>
                  ))}
                </div>
              </>
            ) : null}
          </section>
        ) : (
          <EmptyStrategyCard
            title={strategyLabels.budgetTitle}
            message="Budget guidance will appear after Naroa shapes the first strategy draft."
          />
        )}

        {snapshot.outputs ? (
          <section className="floating-plane rounded-[30px] border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Recommended Neroa plan
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-slate-950">
                  {snapshot.outputs.recommendedPlan.recommendedPlan.label}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {snapshot.outputs.recommendedPlan.recommendedPlan.priceMonthly === null
                    ? "Custom pricing"
                    : `$${snapshot.outputs.recommendedPlan.recommendedPlan.priceMonthly}/month`}
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] text-slate-500">
                {snapshot.outputs.recommendedPlan.projectedUsageBand}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-700">
              {snapshot.outputs.recommendedPlan.usageHeadline}
            </p>
            <div className="mt-4 space-y-2">
              {snapshot.outputs.recommendedPlan.rationale.map((item) => (
                <p key={item} className="text-sm leading-6 text-slate-600">
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-4 rounded-[20px] border border-slate-200 bg-white/80 p-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-950">Usage included</p>
              <p className="mt-2">
                {snapshot.outputs.recommendedPlan.recommendedPlan.usageIncluded}
              </p>
              <p className="mt-3 font-semibold text-slate-950">Upgrade trigger</p>
              <p className="mt-2">
                {snapshot.outputs.recommendedPlan.recommendedPlan.upgradeTrigger}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setDraft(
                    `Compare ${snapshot.outputs?.recommendedPlan.recommendedPlan.shortLabel} with the next Neroa plan tier for this engine.`
                  )
                }
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-[11px] text-slate-600 transition hover:bg-white"
              >
                Compare plans
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft(
                    `Tell me what would push this engine past ${snapshot.outputs?.recommendedPlan.recommendedPlan.shortLabel} and into an upgrade.`
                  )
                }
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-[11px] text-slate-600 transition hover:bg-white"
              >
                Check upgrade triggers
              </button>
            </div>
          </section>
        ) : (
          <EmptyStrategyCard
            title="Recommended Neroa plan"
            message="Naroa will recommend the right plan after it understands scope, complexity, and projected usage."
          />
        )}

        {snapshot.outputs ? (
          <section className="floating-plane rounded-[30px] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Progress and blockers
            </p>

            <div className="mt-4 space-y-3">
              {snapshot.outputs.recentActions.map((item) => (
                <div key={item} className="rounded-[20px] border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {snapshot.outputs.blockers.length > 0 ? (
                snapshot.outputs.blockers.map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-amber-300/35 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-800"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
                  No active blockers right now. Keep refining the strategy with Naroa to stay ahead of execution risk.
                </div>
              )}
            </div>
          </section>
        ) : (
          <EmptyStrategyCard
            title="Progress and blockers"
            message="Recent actions and blockers will appear once Naroa shapes the first strategy outputs."
          />
        )}
      </aside>
    </div>
  );
}
