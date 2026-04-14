"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import NaruaCore from "@/components/ai/NaruaCore";
import NaruaChat from "@/components/narua/NaruaChat";
import type { VoiceInputState } from "@/components/narua/VoiceInputButton";
import AiAvatar from "@/components/workspace/ai-avatar";
import AiTeammateCards from "@/components/workspace/ai-teammate-cards";
import {
  applyReviewAction,
  applyUserMessage,
  buildWorkspaceName,
  createEmptyAnswers,
  createSynthesisMessage,
  createWelcomeMessage,
  generatePlan,
  getDefaultTeammates,
  getNextQuestion,
  hasEnoughContext,
  type GeneratedPlan,
  type NaruaMessage,
  type NaruaQuestion,
  type NaruaStage,
  type PlanningAnswers,
  type ReviewAction,
  type TeammateRecommendation
} from "@/lib/narua/planning";
import { getLaneById } from "@/lib/workspace/lanes";

type NaruaWorkspaceProps = {
  userEmail?: string | null;
  startWorkspaceAction: (formData: FormData) => void | Promise<void>;
};

type PersistedNaruaWorkspaceState = {
  stage: NaruaStage;
  messages: NaruaMessage[];
  answers: PlanningAnswers;
  currentQuestion: NaruaQuestion | null;
  draft: string;
  generatedPlan: GeneratedPlan | null;
};

const laneSuggestions = [
  {
    title: "SaaS app",
    href: "/start?flow=saas-app",
    prompt: "Route into the SaaS-specific intake flow and turn the product idea into a build plan."
  },
  {
    title: "Mobile App",
    href: "/start?flow=mobile-app",
    prompt:
      "Route into the Mobile App intake flow and turn the app concept into a mobile-specific engine."
  },
  {
    title: "Strategy",
    prompt: "I want help turning an idea into a clear strategy, offer, and first plan."
  },
  {
    title: "Budget",
    prompt: "I need to estimate the startup cost, stack cost, and timing before I commit to the build."
  },
  {
    title: "Launch",
    prompt: "I need a go-live plan, launch motion, and release preparation for the first rollout."
  },
  {
    title: "Operations",
    prompt: "I need help organizing maintenance, automation, updates, and ongoing engine management."
  }
];

function safeParseSnapshot(value: string | null): PersistedNaruaWorkspaceState | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PersistedNaruaWorkspaceState;
  } catch {
    return null;
  }
}

function StageBadge({ active, children }: { active: boolean; children: string }) {
  return (
    <div
      className={`micro-glow rounded-full px-4 py-3 text-sm transition ${
        active
          ? "border border-cyan-300/25 bg-cyan-300/12 text-cyan-700"
          : "border border-slate-200 bg-white/70 text-slate-500"
      }`}
    >
      {children}
    </div>
  );
}

function teammateBadge(status?: TeammateRecommendation["status"]) {
  if (status === "active") {
    return "Active";
  }

  if (status === "recommended") {
    return "Recommended";
  }

  if (status === "standby") {
    return "Standby";
  }

  return "Available";
}

function LaunchWorkspaceButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary" disabled={pending}>
      {pending ? "Opening engine..." : "Open engine"}
    </button>
  );
}

export default function NaruaWorkspace({
  userEmail,
  startWorkspaceAction
}: NaruaWorkspaceProps) {
  const storageKey = useMemo(() => `narua:start:${userEmail ?? "anonymous"}`, [userEmail]);
  const [stage, setStage] = useState<NaruaStage>("intake");
  const [messages, setMessages] = useState<NaruaMessage[]>([
    {
      id: "narua-welcome",
      role: "narua",
      content: createWelcomeMessage()
    }
  ]);
  const [answers, setAnswers] = useState<PlanningAnswers>(createEmptyAnswers());
  const [currentQuestion, setCurrentQuestion] = useState<NaruaQuestion | null>(null);
  const [draft, setDraft] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceInputState>("idle");
  const [voiceMessage, setVoiceMessage] = useState("Tap the mic or type to speak with Naroa");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const snapshot = safeParseSnapshot(window.localStorage.getItem(storageKey));

    if (snapshot) {
      setStage(snapshot.stage);
      setMessages(snapshot.messages);
      setAnswers(snapshot.answers);
      setCurrentQuestion(snapshot.currentQuestion);
      setDraft(snapshot.draft);
      setGeneratedPlan(snapshot.generatedPlan);
    }

    setHasLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    const snapshot: PersistedNaruaWorkspaceState = {
      stage,
      messages,
      answers,
      currentQuestion,
      draft,
      generatedPlan
    };

    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  }, [answers, currentQuestion, draft, generatedPlan, hasLoaded, messages, stage, storageKey]);

  function appendMessage(role: NaruaMessage["role"], content: string) {
    setMessages((current) => [
      ...current,
      {
        id: `${role}-${Date.now()}-${current.length}`,
        role,
        content
      }
    ]);
  }

  function handleSend() {
    const value = draft.trim();

    if (!value) {
      return;
    }

    appendMessage("user", value);

    const nextAnswers = applyUserMessage(answers, value, currentQuestion);
    setAnswers(nextAnswers);
    setDraft("");

    if (hasEnoughContext(nextAnswers)) {
      setStage("synthesis");
      const nextPlan = generatePlan(nextAnswers);
      setGeneratedPlan(nextPlan);
      setCurrentQuestion(null);
      appendMessage("narua", createSynthesisMessage(nextPlan));
      setStage("review");
      return;
    }

    const nextQuestion = getNextQuestion(nextAnswers);
    setCurrentQuestion(nextQuestion);
    setStage("clarification");

    if (nextQuestion) {
      appendMessage("narua", nextQuestion.prompt);
      return;
    }

    const nextPlan = generatePlan(nextAnswers);
    setGeneratedPlan(nextPlan);
    appendMessage("narua", createSynthesisMessage(nextPlan));
    setStage("review");
  }

  function handlePlanAction(action: ReviewAction) {
    if (!generatedPlan) {
      return;
    }

    const result = applyReviewAction(action, generatedPlan, answers);
    setGeneratedPlan(result.plan);
    appendMessage("narua", result.reply);
    setStage("review");
  }

  function handleVoiceTranscript(transcript: string) {
    setDraft(transcript);
  }

  function handleVoiceStatusChange(nextState: VoiceInputState, message: string) {
    setVoiceState(nextState);
    setVoiceMessage(message);
  }

  const team = generatedPlan?.teammates ?? getDefaultTeammates();
  const primaryLane = generatedPlan ? getLaneById(generatedPlan.primaryLaneId) : null;
  const supportingLanes =
    generatedPlan?.supportingLaneIds.map((laneId) => getLaneById(laneId)) ?? [];
  const teammateById = useMemo(
    () => Object.fromEntries(team.map((member) => [member.id, member])),
    [team]
  );
  const hasWebsiteWork =
    generatedPlan?.primaryLaneId === "website" || generatedPlan?.supportingLaneIds.includes("website");
  const hasMarketingWork =
    generatedPlan?.primaryLaneId === "marketing" || generatedPlan?.supportingLaneIds.includes("marketing");
  const hasOperationsWork =
    generatedPlan?.primaryLaneId === "operations" ||
    generatedPlan?.supportingLaneIds.includes("operations") ||
    generatedPlan?.primaryLaneId === "automation-ai-systems" ||
    generatedPlan?.supportingLaneIds.includes("automation-ai-systems");
  const aiSystemRoster = useMemo(
    () => [
      {
        id: "narua" as const,
        badge: teammateBadge(teammateById.narua?.status),
        active: true,
        description:
          teammateById.narua?.reason ??
          "Naroa anchors the engine, listens first, and turns the brief into a usable execution direction."
      },
      {
        id: "atlas" as const,
        badge: teammateBadge(teammateById.atlas?.status),
        active: teammateById.atlas?.status === "active" || teammateById.atlas?.status === "recommended",
        description:
          teammateById.atlas?.reason ??
          "Atlas strengthens deeper analysis and strategy when the engine needs longer-context thinking."
      },
      {
        id: "forge" as const,
        badge: teammateBadge(teammateById.forge?.status),
        active: teammateById.forge?.status === "active" || teammateById.forge?.status === "recommended",
        description:
          teammateById.forge?.reason ??
          "Forge activates when the work moves into product build, coding, systems, or technical execution."
      },
      {
        id: "repolink" as const,
        badge: teammateBadge(teammateById.repolink?.status),
        active:
          teammateById.repolink?.status === "active" || teammateById.repolink?.status === "recommended",
        description:
          teammateById.repolink?.reason ??
          "RepoLink connects repository and systems context when the engine needs source-grounded execution."
      },
      {
        id: "nova" as const,
        badge: hasWebsiteWork ? "Activated" : "Available",
        active: Boolean(hasWebsiteWork),
        description:
          "Nova shapes brand, design, and polished interface direction when website or presentation work turns on."
      },
      {
        id: "pulse" as const,
        badge: hasMarketingWork ? "Activated" : "Available",
        active: Boolean(hasMarketingWork),
        description:
          "Pulse takes over campaign, messaging, and growth support when the engine widens into marketing."
      },
      {
        id: "ops" as const,
        badge: hasOperationsWork ? "Activated" : "Available",
        active: Boolean(hasOperationsWork),
        description:
          "Ops keeps execution disciplined once operations, automation, or recurring workflows come into scope."
      }
    ],
    [hasMarketingWork, hasOperationsWork, hasWebsiteWork, teammateById]
  );

  return (
    <div className="grid min-h-[calc(100vh-12rem)] gap-10 xl:grid-cols-[240px_minmax(0,1fr)_360px] 2xl:grid-cols-[260px_minmax(0,1fr)_400px]">
      <aside className="space-y-6">
        <div className="floating-plane rounded-[30px] p-5">
          <div className="floating-wash rounded-[30px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Guided intake
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Build with Naroa
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Naroa handles the first engine conversation, narrows the scope, and opens the
              engine only after the direction is usable for SaaS, internal software, external
              apps, or mobile apps.
            </p>
          </div>
        </div>

        <div className="floating-plane rounded-[30px] p-5">
          <div className="floating-wash rounded-[30px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Flow
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <StageBadge active={stage === "intake"}>1. Describe the build</StageBadge>
              <StageBadge active={stage === "clarification" || stage === "synthesis"}>
                2. Naroa scopes it
              </StageBadge>
              <StageBadge active={stage === "review"}>3. Assemble the AI system</StageBadge>
              <StageBadge active={Boolean(generatedPlan)}>4. Open the engine</StageBadge>
            </div>
          </div>
        </div>

        <div className="floating-plane rounded-[30px] p-5">
          <div className="floating-wash rounded-[30px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Start with a prompt
            </p>
            <div className="mt-5 space-y-4">
              {laneSuggestions.map((suggestion) => (
                suggestion.href ? (
                  <Link
                    key={suggestion.title}
                    href={suggestion.href}
                    className="micro-glow block w-full border-b border-slate-200/70 pb-4 text-left last:border-b-0"
                  >
                    <p className="text-sm font-semibold text-slate-900">{suggestion.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{suggestion.prompt}</p>
                  </Link>
                ) : (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => setDraft(suggestion.prompt)}
                    className="micro-glow w-full border-b border-slate-200/70 pb-4 text-left last:border-b-0"
                  >
                    <p className="text-sm font-semibold text-slate-900">{suggestion.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{suggestion.prompt}</p>
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Start naturally", "Use plain language. Naroa will structure the engine from there."],
            ["See the first draft", "A usable execution plan appears before you commit to the engine."],
            ["Open cleanly", "Primary and supporting lanes arrive already framed around the brief."]
          ].map(([title, description]) => (
            <div key={title} className="floating-plane rounded-[24px] p-4">
              <div className="floating-wash rounded-[24px]" />
              <div className="relative">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <NaruaChat
          messages={messages}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          generatedPlan={generatedPlan}
          onPlanAction={handlePlanAction}
          voiceState={voiceState}
          voiceMessage={voiceMessage}
          onVoiceTranscript={handleVoiceTranscript}
          onVoiceStatusChange={handleVoiceStatusChange}
          title="Guide the build with Naroa"
          description="Start naturally. Naroa asks the next useful question, clarifies the path, and turns the intake into a clean execution draft."
          afterPlan={
            generatedPlan ? (
              <form action={startWorkspaceAction} className="floating-plane rounded-[32px] p-5">
                <input
                  type="hidden"
                  name="title"
                  value={generatedPlan.title || buildWorkspaceName(answers.idea)}
                />
                <input type="hidden" name="description" value={generatedPlan.overview} />
                <input type="hidden" name="idea" value={answers.idea} />
                <input
                  type="hidden"
                  name="projectTemplateId"
                  value={generatedPlan.projectTemplateId}
                />
                <input type="hidden" name="customLanes" value="" />
                <input type="hidden" name="primaryLaneId" value={generatedPlan.primaryLaneId} />
                <input
                  type="hidden"
                  name="supportingLaneIds"
                  value={generatedPlan.supportingLaneIds.join(",")}
                />

                <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Naroa is ready to open the engine
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Primary lane: {primaryLane?.name}
                      {supportingLanes.length > 0
                        ? ` | Supporting lanes: ${supportingLanes
                            .map((lane) => lane.name)
                            .join(", ")}`
                        : ""}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Engine will open under {userEmail ?? "your authenticated account"}.
                    </p>
                  </div>

                  <LaunchWorkspaceButton />
                </div>
              </form>
            ) : null
          }
        />
      </div>

      <aside className="space-y-6">
        <NaruaCore className="mx-auto w-full max-w-[420px]" />

        <div className="floating-plane rounded-[34px] p-5">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
              AI system
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Naroa leads the flow, then the rest of the system activates only when the brief actually needs it.
            </p>
            <AiTeammateCards agents={aiSystemRoster} compact className="mt-5 grid-cols-1" />
          </div>
        </div>

        <div className="floating-plane rounded-[34px] p-5">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative space-y-5">
            <div className="flex items-start gap-3">
              <AiAvatar provider="chatgpt" displayName="Naroa" avatarSeed="narua-intake" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Current stage
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {stage === "intake"
                    ? "Naroa is gathering the initial intent."
                    : stage === "clarification"
                      ? "Naroa is tightening the direction with one or two focused questions."
                      : stage === "synthesis"
                        ? "Naroa is assembling the first execution draft."
                        : "Naroa has a usable plan ready to launch into the engine."}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200/70 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Recommended lane
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {primaryLane
                  ? primaryLane.name
                  : "Naroa will recommend the primary lane once the brief is clear."}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {supportingLanes.length > 0
                  ? `Supporting lanes: ${supportingLanes.map((lane) => lane.name).join(", ")}`
                  : "Supporting lanes appear only when they sharpen execution."}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
