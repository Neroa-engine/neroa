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
  getNextQuestion,
  hasEnoughContext,
  type GeneratedPlan,
  type NaruaMessage,
  type NaruaQuestion,
  type NaruaStage,
  type PlanningAnswers,
  type ReviewAction
} from "@/lib/narua/planning";

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
  const [voiceMessage, setVoiceMessage] = useState("Tap the mic or type to continue in Strategy Room");
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

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.22fr)_400px] 2xl:grid-cols-[minmax(0,1.3fr)_460px] 2xl:gap-10">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StageBadge active={stage === "intake"}>1. Explain the idea</StageBadge>
          <StageBadge active={stage === "clarification" || stage === "synthesis"}>
            2. Shape the roadmap
          </StageBadge>
          <StageBadge active={stage === "review"}>3. Review the plan</StageBadge>
          <StageBadge active={Boolean(generatedPlan)}>4. Open the build</StageBadge>
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
          eyebrow="Strategy Room"
          title="Explain what you want to build"
          description="Start naturally. Neroa will ask one useful question at a time, shape the roadmap, and draft the first build direction without making you manage the machinery behind it."
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
                    <p className="text-sm font-semibold text-white">Your first build direction is ready</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Neroa has enough context to open the workspace with the roadmap, preview
                      path, and first build steps already connected.
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {userEmail
                        ? `Workspace will open under ${userEmail}.`
                        : "Sign in when you are ready to continue the build inside Neroa."}
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
            <h3 className="mt-3 text-xl font-semibold text-white">Start with a real product thread</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              If you want a nudge, drop one of these ideas into the conversation and Neroa will
              turn it into a guided plan instead of another blank form.
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
            <AiAvatar provider="chatgpt" displayName="Neroa" avatarSeed="narua-intake" />
            <div className="min-w-0">
              <p className="text-xl font-semibold text-white">Strategy Room</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                Guided inside Neroa
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Start with the product, the customer, and the first outcome that matters. Neroa
                keeps the roadmap, preview path, and approvals connected behind one calm entry
                experience.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-subtle p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            What Neroa carries forward
          </p>
          <div className="mt-4 space-y-3">
            {[
              [
                "Roadmap clarity",
                "Neroa keeps the first release focused so the plan becomes buildable instead of bloated."
              ],
              [
                "Preview awareness",
                "The product path can move into preview and inspection without making the customer manage raw tools."
              ],
              [
                "Approvals and revisions",
                "Decisions stay attached to the same thread so refinements do not lose momentum."
              ]
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl bg-[#090f1d] p-4">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
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
                  ? "Neroa is listening"
                  : stage === "clarification"
                    ? "Neroa is clarifying"
                    : stage === "synthesis"
                      ? "Neroa is shaping the roadmap"
                      : "Neroa has a draft plan ready"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#090f1d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Current build direction
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {generatedPlan
                  ? generatedPlan.title
                  : "Neroa will shape the first build direction after a few messages."}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {generatedPlan
                  ? generatedPlan.projectSummary
                  : "The product summary will sharpen here once the first roadmap direction is ready."}
              </p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
