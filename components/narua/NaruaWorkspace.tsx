"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import NaruaChat from "@/components/narua/NaruaChat";
import type { VoiceInputState } from "@/components/narua/VoiceInputButton";
import AiAvatar from "@/components/workspace/ai-avatar";
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
    title: "Business",
    prompt: "I want to build a contract screen printing business."
  },
  {
    title: "Website",
    prompt: "I need help planning a premium website for a new offer."
  },
  {
    title: "SaaS / App",
    prompt: "I want to scope a SaaS product and map the MVP."
  },
  {
    title: "Operations",
    prompt: "I want AI help with ERP work, repetitive tasks, and workflow support."
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
      className={`rounded-2xl border px-4 py-3 text-sm transition ${
        active
          ? "border-cyan-300/18 bg-cyan-300/[0.08] text-white"
          : "border-white/8 bg-white/[0.03] text-slate-500"
      }`}
    >
      {children}
    </div>
  );
}

function LaunchWorkspaceButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary" disabled={pending}>
      {pending ? "Opening workspace..." : "Open workspace"}
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
  const [voiceMessage, setVoiceMessage] = useState("Tap the mic or type to speak with Narua");
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

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.22fr)_400px] 2xl:grid-cols-[minmax(0,1.3fr)_460px] 2xl:gap-10">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StageBadge active={stage === "intake"}>1. Describe the build</StageBadge>
          <StageBadge active={stage === "clarification" || stage === "synthesis"}>
            2. Narua scopes it
          </StageBadge>
          <StageBadge active={stage === "review"}>3. Assemble the AI team</StageBadge>
          <StageBadge active={Boolean(generatedPlan)}>4. Execution workspace</StageBadge>
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
          title="Tell Narua what you want to build"
          description="Start naturally. Narua will ask one useful question at a time, determine the right lanes, and then draft the first execution plan automatically."
          afterPlan={
            generatedPlan ? (
              <form
                action={startWorkspaceAction}
                className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,26,0.98),rgba(12,17,32,0.94))] p-5"
              >
                <input type="hidden" name="title" value={generatedPlan.title || buildWorkspaceName(answers.idea)} />
                <input type="hidden" name="description" value={generatedPlan.overview} />
                <input type="hidden" name="idea" value={answers.idea} />
                <input type="hidden" name="primaryLaneId" value={generatedPlan.primaryLaneId} />
                <input type="hidden" name="supportingLaneIds" value={generatedPlan.supportingLaneIds.join(",")} />

                <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Narua is ready to open the workspace</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Primary lane: {primaryLane?.name}
                      {supportingLanes.length > 0
                        ? ` | Supporting lanes: ${supportingLanes.map((lane) => lane.name).join(", ")}`
                        : ""}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Workspace will open under {userEmail ?? "your authenticated account"}.
                    </p>
                  </div>

                  <LaunchWorkspaceButton />
                </div>
              </form>
            ) : null
          }
        />

        <section className="surface-subtle p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Suggested starting points
            </p>
            <h3 className="mt-3 text-xl font-semibold text-white">Build with Narua, not a blank form</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              If you want a nudge, drop one of these ideas into the conversation and Narua will take it from there.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            {laneSuggestions.map((suggestion) => (
              <button
                key={suggestion.title}
                type="button"
                onClick={() => setDraft(suggestion.prompt)}
                className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-white/16 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-semibold text-white">{suggestion.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{suggestion.prompt}</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="surface-subtle p-5">
          <div className="flex items-start gap-4">
            <AiAvatar provider="chatgpt" displayName="Narua" avatarSeed="narua-intake" />
            <div className="min-w-0">
              <p className="text-xl font-semibold text-white">Narua</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                Powered by ChatGPT
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Narua is the execution backbone of Neroa. Narua listens first, asks only the highest-value questions, and routes the work into the right lanes.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-subtle p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Team activation
          </p>
          <div className="mt-4 space-y-3">
            {team.map((member: TeammateRecommendation) => (
              <div key={member.id} className="rounded-2xl bg-[#090f1d] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{member.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{member.role}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${
                      member.status === "active"
                        ? "bg-cyan-400/12 text-cyan-200"
                        : member.status === "recommended"
                          ? "bg-emerald-400/12 text-emerald-200"
                          : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{member.reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-subtle p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Current direction
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-[#090f1d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Stage
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {stage === "intake"
                  ? "Narua is listening"
                  : stage === "clarification"
                    ? "Narua is clarifying"
                    : stage === "synthesis"
                      ? "Narua is drafting"
                      : "Narua has a draft plan ready"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#090f1d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Lane recommendation
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {primaryLane ? primaryLane.name : "Narua will recommend a primary lane after a few messages."}
              </p>
              {supportingLanes.length > 0 ? (
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Supporting lanes: {supportingLanes.map((lane) => lane.name).join(", ")}
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Supporting lanes will appear once Narua has enough context.
                </p>
              )}
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
