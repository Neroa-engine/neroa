"use client";

import { type KeyboardEvent, useEffect, useMemo, useState } from "react";
import NaruaComposerPresence from "@/components/narua/NaruaComposerPresence";
import AiTeammateCards from "@/components/workspace/ai-teammate-cards";
import AiAvatar from "@/components/workspace/ai-avatar";
import VoiceInputButton, { type VoiceInputState } from "@/components/narua/VoiceInputButton";
import { useNaruaThread } from "@/components/narua/useNaruaThread";
import { getLaneAiCollaboration } from "@/lib/ai/collaboration";
import {
  AmbientWorkspaceBackground,
  DarkTable,
  DarkTableHeader,
  DarkTableRow,
  GuidanceRailCard,
  LaneHeroHeader,
  LanePageShell,
  PremiumButton,
  PremiumTabs,
  PrimaryPanel,
  SecondaryPanel,
  SummaryMetricCard
} from "@/components/workspace/premium-lane-ui";
import {
  createBudgetNaruaReply,
  createBudgetNaruaWelcome,
  getBudgetLaneModel,
  type BudgetItemOverride,
  type BudgetScenario
} from "@/lib/workspace/budget-lane";
import {
  buildLaneConversationStorageKey,
  type ProjectLaneRecord,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";

type BudgetLaneWorkspaceProps = {
  workspaceId: string;
  project: ProjectRecord;
  lane: ProjectLaneRecord;
};

type BudgetUiState = {
  version: 1;
  scenario: BudgetScenario;
  overrides: Record<string, BudgetItemOverride>;
};

type ComposerInputState = "idle" | "listening" | "ready_to_send";

function safeParseBudgetUiState(value: string | null): BudgetUiState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<BudgetUiState> | null;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.overrides ||
      typeof parsed.overrides !== "object" ||
      (parsed.scenario !== "lean" && parsed.scenario !== "standard" && parsed.scenario !== "growth")
    ) {
      return null;
    }

    return {
      version: 1,
      scenario: parsed.scenario,
      overrides: parsed.overrides as Record<string, BudgetItemOverride>
    };
  } catch {
    return null;
  }
}

function feedbackTone(state: VoiceInputState) {
  if (state === "error") {
    return "text-rose-600";
  }

  if (state === "listening") {
    return "text-cyan-700";
  }

  if (state === "processing") {
    return "text-amber-700";
  }

  if (state === "transcript_ready") {
    return "text-emerald-700";
  }

  return "text-slate-400";
}

function coverageBadgeClasses(included: boolean) {
  return included
    ? "premium-pill border-emerald-300/30 bg-emerald-300/[0.14] text-emerald-700"
    : "premium-pill border-amber-300/35 bg-amber-300/[0.16] text-amber-700";
}

function comparisonCardClasses(id: string) {
  if (id === "neroa") {
    return "premium-surface border-cyan-300/20 bg-cyan-300/[0.10] p-5";
  }

  if (id === "savings") {
    return "premium-surface border-emerald-300/30 bg-emerald-300/[0.12] p-5";
  }

  return "premium-surface p-5";
}

export default function BudgetLaneWorkspace({
  workspaceId,
  project,
  lane
}: BudgetLaneWorkspaceProps) {
  const uiStorageKey = useMemo(
    () => `narua:budget-ui:v1:${workspaceId}:${project.id}:${lane.slug}`,
    [lane.slug, project.id, workspaceId]
  );
  const threadStorageKey = useMemo(
    () =>
      buildLaneConversationStorageKey({
        workspaceId,
        projectId: project.id,
        laneSlug: lane.slug
      }),
    [lane.slug, project.id, workspaceId]
  );
  const [scenario, setScenario] = useState<BudgetScenario>("standard");
  const [overrides, setOverrides] = useState<Record<string, BudgetItemOverride>>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [stopSignal, setStopSignal] = useState(0);
  const [composerState, setComposerState] = useState<ComposerInputState>("idle");
  const [hintOverride, setHintOverride] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const baseBudgetModel = useMemo(
    () => getBudgetLaneModel({ project, scenario: "standard", overrides: {} }),
    [project]
  );

  useEffect(() => {
    const savedState = safeParseBudgetUiState(window.localStorage.getItem(uiStorageKey));

    if (savedState) {
      setScenario(savedState.scenario);
      setOverrides(savedState.overrides);
    }

    setHasLoaded(true);
  }, [uiStorageKey]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    const snapshot: BudgetUiState = {
      version: 1,
      scenario,
      overrides
    };

    window.localStorage.setItem(uiStorageKey, JSON.stringify(snapshot));
  }, [hasLoaded, overrides, scenario, uiStorageKey]);

  const scenarioModels = useMemo(
    () => ({
      lean: getBudgetLaneModel({ project, scenario: "lean", overrides }),
      standard: getBudgetLaneModel({ project, scenario: "standard", overrides }),
      growth: getBudgetLaneModel({ project, scenario: "growth", overrides })
    }),
    [overrides, project]
  );
  const model = scenarioModels[scenario];
  const initialNaruaMessage = useMemo(
    () => createBudgetNaruaWelcome(baseBudgetModel, "standard"),
    [baseBudgetModel]
  );
  const suggestedPrompts = useMemo(
    () => [
      `Compare the ${scenario} budget path with the next launch scenario.`,
      `Tell me whether ${model.currentPlan.label} is enough for this lane.`,
      "Show me where Neroa replaces outside consultant or agency work.",
      "Help me reduce the startup budget without weakening the launch."
    ],
    [model.currentPlan.label, scenario]
  );
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
  const thread = useNaruaThread({
    storageKey: threadStorageKey,
    initialMessage: initialNaruaMessage,
    buildReply: (message) => createBudgetNaruaReply(model, scenario, message),
    idleMessage: "Ask Naroa about plan coverage, savings, or how to reduce the budget.",
    contextTitle: lane.title
  });

  useEffect(() => {
    if (thread.voiceState === "listening") {
      setComposerState("listening");
      setHintOverride(null);
      return;
    }

    if (thread.voiceState === "transcript_ready") {
      setComposerState("ready_to_send");
      return;
    }

    if (thread.voiceState === "processing") {
      return;
    }

    setComposerState("idle");
  }, [thread.voiceState]);

  useEffect(() => {
    if (composerState === "ready_to_send" && !thread.draft.trim()) {
      setComposerState("idle");
      setHintOverride(null);
    }
  }, [composerState, thread.draft]);

  function updateOverride(
    itemId: string,
    field: keyof BudgetItemOverride,
    value: number | boolean
  ) {
    const multiplier = scenario === "lean" ? 0.82 : scenario === "growth" ? 1.45 : 1;

    setOverrides((current) => {
      const next = {
        ...current,
        [itemId]: {
          ...current[itemId]
        }
      };

      if (field === "required" && typeof value === "boolean") {
        next[itemId].required = value;
      }

      if ((field === "oneTimeCost" || field === "monthlyCost") && typeof value === "number") {
        next[itemId][field] = Math.max(Math.round(value / multiplier), 0);
      }

      return next;
    });
  }

  function handleBudgetSend(valueOverride?: string) {
    const value = (valueOverride ?? thread.draft).trim();

    if (!value || isThinking) {
      return;
    }

    setHintOverride(null);
    setIsThinking(true);

    window.setTimeout(() => {
      thread.handleSend(value);
      setIsThinking(false);
    }, 320);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (thread.voiceState === "processing" || isThinking) {
      return;
    }

    if (composerState === "listening") {
      setHintOverride("Voice stopped. Press Enter again to send.");
      setStopSignal((current) => current + 1);
      return;
    }

    if (!thread.draft.trim()) {
      return;
    }

    setHintOverride(null);
    handleBudgetSend();
    setComposerState("idle");
  }

  const planStatusLabel = model.upgradeRequired
    ? `Upgrade recommended: ${model.recommendedPlan.label}`
    : `Included in ${model.currentPlan.label}`;
  const composerHint = hintOverride ?? thread.voiceMessage;

  return (
    <LanePageShell>
      <AmbientWorkspaceBackground className="p-6 xl:p-8">
        <LaneHeroHeader
          eyebrow="Budget Intelligence"
          title="Budget"
          description="See what this engine costs inside Neroa and what it may cost to launch in the real world."
          badge={
            <span className={coverageBadgeClasses(!model.upgradeRequired)}>{planStatusLabel}</span>
          }
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          <SummaryMetricCard
            title="Neroa Cost"
            value={model.neroaCostLabel}
            detail="Current plan and upgrade path"
            emphasized
          />
          <SummaryMetricCard
            title="Startup Budget"
            value={model.startupBudgetLabel}
            detail="Required one-time launch spend"
          />
          <SummaryMetricCard
            title="Monthly Operating Cost"
            value={model.monthlyOperatingCostLabel}
            detail="Ongoing monthly run rate"
          />
          <SummaryMetricCard
            title="Estimated Savings"
            value={model.estimatedSavingsLabel}
            detail="Compared with blended outside help"
          />
        </div>
      </AmbientWorkspaceBackground>

      <div className="grid gap-6 2xl:grid-cols-[1.18fr_0.92fr_0.82fr]">
        <PrimaryPanel
          title="Startup Budget"
          subtitle="Editable budget breakdown"
          action={
            <span className="premium-pill text-slate-300">
              {model.visibleItems.length} items
            </span>
          }
        >
          <DarkTable>
            <DarkTableHeader className="hidden xl:block">
              <div className="grid grid-cols-[minmax(0,1.2fr)_120px_140px_140px_minmax(0,0.9fr)] gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span>Line item</span>
                <span>Required</span>
                <span>One-time</span>
                <span>Monthly</span>
                <span>Neroa impact</span>
              </div>
            </DarkTableHeader>

            {model.visibleItems.map((item) => (
              <DarkTableRow key={item.id}>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_120px_140px_140px_minmax(0,0.9fr)]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                      <span className="premium-pill px-3 py-1 text-[10px] tracking-[0.14em] text-slate-300">
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.notes}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="premium-pill px-3 py-1 text-[10px] tracking-[0.14em] text-slate-200">
                        {item.currentPlanIncluded
                          ? "Included in your current tier"
                          : `Needs ${item.minimumPlan.shortLabel}`}
                      </span>
                      <span className="premium-pill px-3 py-1 text-[10px] tracking-[0.14em] text-slate-200">
                        {item.coveredByNeroa
                          ? "No outside spend required for this step"
                          : "Outside spend may still apply"}
                      </span>
                    </div>
                  </div>

                  <label className="premium-surface-soft flex items-start gap-2 px-3 py-3 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={item.computedRequired}
                      onChange={(event) => updateOverride(item.id, "required", event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-white/15 bg-transparent"
                    />
                    <span>{item.computedRequired ? "Required" : "Optional"}</span>
                  </label>

                  <label className="premium-surface-soft px-3 py-3">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      One-time
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={item.computedOneTimeCost}
                      onChange={(event) =>
                        updateOverride(item.id, "oneTimeCost", Number(event.target.value || 0))
                      }
                      className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
                    />
                  </label>

                  <label className="premium-surface-soft px-3 py-3">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      Monthly
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={item.computedMonthlyCost}
                      onChange={(event) =>
                        updateOverride(item.id, "monthlyCost", Number(event.target.value || 0))
                      }
                      className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
                    />
                  </label>

                  <div className="premium-surface-soft px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      Neroa impact
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {item.coveredByNeroa ? "Covered in Neroa" : "Neroa reduces planning cost"}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {item.recommendationCopy}
                    </p>
                  </div>
                </div>
              </DarkTableRow>
            ))}
          </DarkTable>
        </PrimaryPanel>

        <div className="space-y-6">
          <PrimaryPanel title="Launch scenarios" subtitle="Choose the launch path">
            <PremiumTabs
              activeValue={scenario}
              onChange={setScenario}
              tabs={(Object.keys(scenarioModels) as BudgetScenario[]).map((scenarioId) => {
                const scenarioModel = scenarioModels[scenarioId];
                const scenarioCard = scenarioModel.scenarioCards.find((item) => item.id === scenarioId);

                return {
                  value: scenarioId,
                  label: scenarioCard?.label ?? scenarioId,
                  detail: scenarioCard?.headline
                };
              })}
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SummaryMetricCard
                title="Startup budget"
                value={scenarioModels[scenario].startupBudgetLabel}
                detail="Visible total for this launch path"
              />
              <SummaryMetricCard
                title="Monthly cost"
                value={scenarioModels[scenario].monthlyOperatingCostLabel}
                detail="Ongoing operating estimate"
              />
            </div>
          </PrimaryPanel>

          <SecondaryPanel title="Scenario summary">
            <div className="space-y-3">
              <div className="premium-surface-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {scenarioModels[scenario].scenarioCards.find((item) => item.id === scenario)?.label}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  {scenarioModels[scenario].scenarioCards.find((item) => item.id === scenario)?.headline}
                </p>
              </div>

              {scenarioModels[scenario].scenarioCards
                .find((item) => item.id === scenario)
                ?.assumptions.map((item) => (
                  <div key={item} className="premium-surface-soft px-4 py-3 text-sm leading-6 text-slate-300">
                    {item}
                  </div>
                ))}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="premium-surface-soft p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Neroa coverage
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {model.laneIncludedInCurrentPlan
                      ? "Included in your current tier"
                      : `Not fully covered by ${model.currentPlan.shortLabel}`}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {model.executionImpact}
                  </p>
                </div>

                <div className="premium-surface-soft p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Launch path
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {scenario === "lean"
                      ? `Lean launch path estimated at ${model.startupBudgetLabel}`
                      : scenario === "standard"
                        ? `Standard launch path estimated at ${model.startupBudgetLabel}`
                        : `Growth launch path estimated at ${model.startupBudgetLabel}`}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {model.outsideSpendMessage}
                  </p>
                </div>
              </div>
            </div>
          </SecondaryPanel>
        </div>

        <div className="space-y-6">
          <GuidanceRailCard title="Naroa Guidance">
            <div className="flex items-start gap-4">
              <AiAvatar provider="chatgpt" displayName="Naroa" avatarSeed="narua-budget" />
              <div>
                <p className="text-lg font-semibold text-slate-950">Naroa Guidance</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Naroa is separating product cost from real-world launch cost so the budget stays practical.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {thread.messages.slice(-3).map((message) => (
                <article
                  key={message.id}
                  className={`rounded-[20px] px-4 py-3 ${
                    message.role === "narua"
                      ? "premium-surface-soft"
                      : "bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(96,165,250,0.14),rgba(139,92,246,0.12))] shadow-[0_24px_60px_rgba(56,189,248,0.08)]"
                  }`}
                >
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      message.role === "narua" ? "text-cyan-700" : "text-slate-500"
                    }`}
                  >
                    {message.role === "narua" ? "Naroa" : "You"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{message.content}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleBudgetSend(prompt)}
                  className="micro-glow w-full rounded-[18px] border border-slate-200 bg-white/72 px-4 py-3 text-left text-sm leading-6 text-slate-600 transition hover:bg-white/88"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="premium-surface-soft mt-5 p-3">
              <NaruaComposerPresence
                title="Naroa"
                subtitle="Budget guidance active in this lane"
                speaking={thread.voiceState === "listening"}
                className="mb-3"
              />

              <div className="flex items-end gap-3">
                <textarea
                  value={thread.draft}
                  onChange={(event) => thread.setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Ask Naroa about plan coverage, savings, or outside spend..."
                  disabled={isThinking}
                  className="input min-h-[84px] flex-1 resize-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <VoiceInputButton
                  onTranscript={thread.handleVoiceTranscript}
                  onStatusChange={thread.handleVoiceStatusChange}
                  stopSignal={stopSignal}
                  disabled={isThinking}
                />
                <PremiumButton
                  variant="cta"
                  onClick={() => {
                    setHintOverride(null);
                    handleBudgetSend();
                  }}
                  disabled={!thread.draft.trim() || thread.voiceState === "processing" || isThinking}
                  className="h-12 px-4"
                >
                  {isThinking ? "Thinking..." : "Send"}
                </PremiumButton>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                <span className={feedbackTone(thread.voiceState)}>
                  {isThinking ? "Naroa is comparing the budget paths now." : composerHint}
                </span>
                <span className="text-slate-500">Budget lane thread</span>
              </div>
            </div>
          </GuidanceRailCard>

          <GuidanceRailCard title="Active AI stack">
            <p className="text-sm leading-6 text-slate-600">
              These systems are working together inside the budget lane.
            </p>
            <div className="mt-4">
              <AiTeammateCards agents={collaborationAgents} compact className="grid-cols-1" />
            </div>
          </GuidanceRailCard>

          <GuidanceRailCard title="Plan coverage">
            <p className="text-sm font-semibold text-slate-950">Current plan: {model.currentPlan.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {model.laneIncludedInCurrentPlan
                ? "Included in your current tier."
                : `This lane is better supported in ${model.laneMinimumPlan.label} or higher.`}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-950">
              {model.upgradeRequired ? "Upgrade recommended" : "No upgrade required right now"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{model.executionImpact}</p>
            <p className="mt-4 text-sm font-semibold text-slate-950">
              {model.outsideSpendRequired ? "Outside spend likely" : "Neroa-only planning step"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{model.outsideSpendMessage}</p>
          </GuidanceRailCard>

          <GuidanceRailCard title="Savings guidance" accent="cyan">
            <p className="text-sm leading-6 text-slate-700">{model.savingsGuidance}</p>
            <p className="mt-4 text-sm font-semibold text-slate-950">{model.recommendedAction}</p>
            <PremiumButton
              variant="cta"
              onClick={() =>
                thread.setDraft(`Help me take the next best budget action for the ${scenario} scenario.`)
              }
              className="mt-4 w-full"
            >
              Ask Naroa for the next best action
            </PremiumButton>
          </GuidanceRailCard>
        </div>
      </div>

      <PrimaryPanel title="What Neroa Replaces" subtitle="Outside-market comparison">
        <div className="grid gap-4 xl:grid-cols-5">
          {model.comparisonCards.map((card) => (
            <div key={card.id} className={comparisonCardClasses(card.id)}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {card.title}
              </p>
              <p className="mt-4 text-2xl font-semibold text-slate-950">{card.amountLabel}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
            </div>
          ))}
        </div>
      </PrimaryPanel>
    </LanePageShell>
  );
}
