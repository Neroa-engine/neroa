"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildFrontDoorPreview,
  createEmptyFrontDoorIntakeDraft,
  explainFrontDoorProductType,
  frontDoorBuildModes,
  loadFrontDoorIntakeDraft,
  normalizeFrontDoorIntakeDraft,
  saveFrontDoorIntakeDraft,
  type FrontDoorBuildMode,
  type FrontDoorIntakeDraft
} from "@/lib/front-door/intake";

type IntakeChatProps = {
  continueHref?: string;
  returnHref?: string;
  returnLabel?: string;
};

type ChatMessage = {
  role: "assistant" | "user";
  body: string;
};

function createMessage(role: ChatMessage["role"], body: string): ChatMessage {
  return {
    role,
    body
  };
}

function normalizeName(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
}

function matchBuildMode(input: string): FrontDoorBuildMode | null {
  const normalized = input.trim().toLowerCase();

  if (normalized.includes("mvp")) {
    return "mvp";
  }

  if (
    normalized.includes("full build") ||
    normalized.includes("full-build") ||
    normalized.includes("fuller build") ||
    normalized.includes("end-to-end") ||
    normalized.includes("full product") ||
    normalized === "full" ||
    normalized.includes("full SaaS")
  ) {
    return "full-build";
  }

  return null;
}

function asksSaasQuestion(input: string) {
  const normalized = input.trim().toLowerCase();
  return normalized.includes("what is saas") || normalized.includes("what do you mean by saas");
}

function asksMvpQuestion(input: string) {
  const normalized = input.trim().toLowerCase();
  return normalized.includes("what is mvp") || normalized.includes("what does mvp");
}

function isCostQuestion(input: string) {
  const normalized = input.trim().toLowerCase();

  return (
    normalized.includes("cost") ||
    normalized.includes("price") ||
    normalized.includes("budget") ||
    normalized.includes("how much") ||
    normalized.includes("lower plan") ||
    normalized.includes("smaller budget") ||
    normalized.includes("cheaper") ||
    normalized.includes("afford")
  );
}

function buildCostGuidance(nextPrompt: "build-mode" | "description") {
  const followUp =
    nextPrompt === "build-mode"
      ? "Tell me whether you want to start with an MVP or a fuller SaaS build, and I can point you toward the right starting fit."
      : "Give me a little detail on what you want the SaaS to do, and I can point you toward the best starting path.";

  return `A smaller SaaS MVP can often start on a lower-cost plan when the first release stays tight around one strong workflow. Fuller products, heavier integrations, billing depth, and more custom logic usually push the work toward a higher starting tier or a managed path. ${followUp}`;
}

function maybeAppendConcern(draft: FrontDoorIntakeDraft, input: string) {
  if (!input.includes("?") && !isCostQuestion(input)) {
    return draft;
  }

  return {
    ...draft,
    concerns: [...draft.concerns, input.trim()].filter(Boolean).slice(-4)
  };
}

function buildMessagesFromDraft(draft: FrontDoorIntakeDraft) {
  const messages: ChatMessage[] = [
    createMessage("assistant", "Hi, I'm NEROA. What's your name?")
  ];

  if (!draft.userName) {
    return messages;
  }

  messages.push(createMessage("user", draft.userName));

  if (!draft.buildMode) {
    messages.push(
      createMessage(
        "assistant",
        `Great to meet you, ${draft.userName}. We build SaaS here, and we shape it mobile-ready from day one. Are you starting with an MVP or planning a fuller SaaS build?`
      )
    );
    return messages;
  }

  const buildModeLabel =
    frontDoorBuildModes.find((mode) => mode.id === draft.buildMode)?.label ??
    (draft.buildMode === "mvp" ? "MVP" : "Full Build");
  messages.push(createMessage("user", buildModeLabel));

  if (!draft.shortProductDescription) {
    messages.push(
      createMessage(
        "assistant",
        "Perfect. Tell me a little about the SaaS you want to build."
      )
    );
    return messages;
  }

  messages.push(createMessage("user", draft.shortProductDescription));

  const preview = buildFrontDoorPreview(draft);
  messages.push(
    createMessage(
      "assistant",
      preview?.recommendationHeadline ??
        `Thanks, ${draft.userName}. I think I've found a practical starting path for you.`
    )
  );

  return messages;
}

function currentPromptText(draft: FrontDoorIntakeDraft) {
  if (!draft.userName) {
    return "What's your name?";
  }

  if (!draft.buildMode) {
    return "MVP or Full Build?";
  }

  if (!draft.shortProductDescription) {
    return "Describe the SaaS you want to build.";
  }

  return "Your recommendation is ready.";
}

export function FrontDoorIntakeChat({
  continueHref = "/signup",
  returnHref,
  returnLabel
}: IntakeChatProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<FrontDoorIntakeDraft>(() =>
    createEmptyFrontDoorIntakeDraft()
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildMessagesFromDraft(createEmptyFrontDoorIntakeDraft())
  );
  const [inputValue, setInputValue] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedDraft = loadFrontDoorIntakeDraft();
    setDraft(storedDraft);
    setMessages(buildMessagesFromDraft(storedDraft));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!transcriptRef.current) {
      return;
    }

    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages]);

  const preview = buildFrontDoorPreview(draft);

  function persist(nextDraft: FrontDoorIntakeDraft, nextMessages?: ChatMessage[]) {
    const saved = saveFrontDoorIntakeDraft(nextDraft);
    setDraft(saved);

    if (nextMessages) {
      setMessages(nextMessages);
    }
  }

  function appendAssistant(body: string, existingMessages: ChatMessage[]) {
    return [...existingMessages, createMessage("assistant", body)];
  }

  function handleNameStep(input: string, existingMessages: ChatMessage[]) {
    const normalizedName = normalizeName(input);

    if (!normalizedName) {
      setMessages(
        appendAssistant("I can help with the build, but first, what should I call you?", existingMessages)
      );
      return;
    }

    const nextDraft = normalizeFrontDoorIntakeDraft({
      ...draft,
      userName: normalizedName,
      intakeStage: "build-mode",
      completed: false
    });

    persist(
      nextDraft,
      appendAssistant(
        `Great to meet you, ${normalizedName}. We build SaaS here, and we shape it mobile-ready from day one. Are you starting with an MVP or planning a fuller SaaS build?`,
        [...existingMessages, createMessage("user", normalizedName)]
      )
    );
  }

  function handleBuildModeStep(input: string, existingMessages: ChatMessage[]) {
    if (asksSaasQuestion(input)) {
      setMessages(
        appendAssistant(
          `${explainFrontDoorProductType()} Right now the public entry is focused on SaaS. Are you starting with an MVP or planning a fuller SaaS build?`,
          existingMessages
        )
      );
      return;
    }

    if (asksMvpQuestion(input)) {
      setMessages(
        appendAssistant(
          "An MVP is the smallest version worth validating with real users or a real workflow. It should still solve something concrete. Are you starting with an MVP or planning a fuller SaaS build?",
          existingMessages
        )
      );
      return;
    }

    if (isCostQuestion(input)) {
      const nextDraft = maybeAppendConcern(draft, input);
      persist(nextDraft, appendAssistant(buildCostGuidance("build-mode"), existingMessages));
      return;
    }

    const selectedMode = matchBuildMode(input);

    if (!selectedMode) {
      setMessages(
        appendAssistant(
          "Start by choosing the build depth that fits best: MVP or Full Build.",
          existingMessages
        )
      );
      return;
    }

    const buildModeLabel =
      frontDoorBuildModes.find((mode) => mode.id === selectedMode)?.label ??
      (selectedMode === "mvp" ? "MVP" : "Full Build");
    const nextDraft = normalizeFrontDoorIntakeDraft({
      ...draft,
      buildMode: selectedMode,
      intakeStage: "description",
      completed: false
    });

    persist(
      nextDraft,
      appendAssistant(
        "Perfect. Tell me a little about the SaaS you want to build.",
        [...existingMessages, createMessage("user", buildModeLabel)]
      )
    );
  }

  function handleDescriptionStep(input: string, existingMessages: ChatMessage[]) {
    if (asksSaasQuestion(input)) {
      setMessages(
        appendAssistant(
          `${explainFrontDoorProductType()} Tell me a little about the SaaS you want to build, and I'll point you toward the best starting fit.`,
          existingMessages
        )
      );
      return;
    }

    if (isCostQuestion(input)) {
      const nextDraft = maybeAppendConcern(draft, input);
      persist(nextDraft, appendAssistant(buildCostGuidance("description"), existingMessages));
      return;
    }

    if (input.trim().length < 18) {
      setMessages(
        appendAssistant(
          "Give me a little more detail so I can point you in the right direction. One or two practical sentences is enough.",
          existingMessages
        )
      );
      return;
    }

    const nextDraft = normalizeFrontDoorIntakeDraft({
      ...draft,
      shortProductDescription: input.trim(),
      intakeStage: "recommendation",
      completed: true
    });
    const previewDraft = saveFrontDoorIntakeDraft(nextDraft);
    const nextPreview = buildFrontDoorPreview(previewDraft);

    setDraft(previewDraft);
    setMessages(
      appendAssistant(
        nextPreview?.recommendationHeadline ??
          `Thanks, ${previewDraft.userName}. I think I've found the best starting path for you.`,
        [...existingMessages, createMessage("user", input.trim())]
      )
    );
  }

  function handleSubmit(rawValue: string) {
    const trimmed = rawValue.trim();

    if (!trimmed) {
      return;
    }

    const existingMessages = messages;

    if (!draft.userName) {
      handleNameStep(trimmed, existingMessages);
      return;
    }

    if (!draft.buildMode) {
      handleBuildModeStep(trimmed, existingMessages);
      return;
    }

    if (!draft.shortProductDescription) {
      handleDescriptionStep(trimmed, existingMessages);
    }
  }

  function selectQuickOption(value: string) {
    handleSubmit(value);
  }

  function resetIntake() {
    const nextDraft = createEmptyFrontDoorIntakeDraft();
    saveFrontDoorIntakeDraft(nextDraft);
    setDraft(nextDraft);
    setMessages(buildMessagesFromDraft(nextDraft));
    setInputValue("");
  }

  function continueToSignup() {
    router.push(continueHref);
  }

  const quickOptions =
    !draft.userName
      ? []
      : !draft.buildMode
        ? frontDoorBuildModes.map((item) => item.label)
        : [];

  return (
    <section className="premium-surface rounded-[36px] p-5 sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Short intelligent intake
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Tell NEROA what you want this SaaS to do.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            This stays intentionally short. NEROA will answer practical questions, point you toward
            the right starting fit, and only ask for signup after it has given you something useful.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="premium-pill text-slate-600">SaaS focus</span>
          <span className="premium-pill text-slate-600">Mobile-ready</span>
          {draft.buildMode ? (
            <span className="premium-pill text-slate-600">
              {draft.buildMode === "mvp" ? "MVP" : "Full Build"}
            </span>
          ) : null}
        </div>
      </div>

      <div
        ref={transcriptRef}
        className="mt-6 max-h-[28rem] space-y-4 overflow-y-auto rounded-[30px] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.9))] p-4 sm:p-5"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-3xl rounded-[24px] px-4 py-3 text-sm leading-7 shadow-[0_18px_36px_rgba(15,23,42,0.05)] ${
              message.role === "assistant"
                ? "bg-white text-slate-700"
                : "ml-auto bg-slate-950 text-white"
            }`}
          >
            {message.body}
          </div>
        ))}
      </div>

      {quickOptions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {quickOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => selectQuickOption(option)}
              className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-300/60 hover:text-slate-950"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(inputValue);
          setInputValue("");
        }}
      >
        <label className="sr-only" htmlFor="front-door-intake-input">
          {currentPromptText(draft)}
        </label>
        <input
          id="front-door-intake-input"
          className="input flex-1"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={currentPromptText(draft)}
          disabled={draft.completed && Boolean(preview)}
        />
        <button
          className="button-primary shrink-0"
          type="submit"
          disabled={draft.completed && Boolean(preview)}
        >
          Send
        </button>
      </form>

      {draft.completed && preview ? (
        <div className="mt-5 rounded-[28px] border border-cyan-200/70 bg-[linear-gradient(180deg,rgba(236,254,255,0.96),rgba(255,255,255,0.92))] p-5">
          <p className="text-sm font-semibold text-slate-950">Directional recommendation</p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            {preview.recommendationHeadline}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[22px] border border-slate-200/75 bg-white/86 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Product
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{preview.productTypeLabel}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{preview.mobileReadySummary}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200/75 bg-white/86 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Build direction
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{preview.buildModeLabel}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{preview.likelyPathSummary}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200/75 bg-white/86 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Best starting fit
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {preview.recommendedStartingPointLabel}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {preview.recommendedStartingPointSummary}
              </p>
            </div>
            <div className="rounded-[22px] border border-slate-200/75 bg-white/86 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Early guidance
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{preview.pricingRangeLabel}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{preview.timelineLabel}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={continueToSignup} className="button-primary">
              Create your account to unlock your roadmap
            </button>
            <Link href="/pricing" className="button-secondary">
              View pricing
            </Link>
            <button type="button" onClick={resetIntake} className="button-quiet">
              Start over
            </button>
            {returnHref && returnLabel ? (
              <Link href={returnHref} className="button-quiet">
                {returnLabel}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {hydrated ? (
        <div className="mt-4 flex items-center justify-between gap-3 text-xs leading-6 text-slate-500">
          <p>
            NEROA can answer practical side questions, but it will keep bringing the conversation
            back to the intake so you get a recommendation instead of an endless chat loop.
          </p>
          {draft.userName || draft.buildMode || draft.shortProductDescription ? (
            <button
              type="button"
              onClick={resetIntake}
              className="font-medium text-slate-600 transition hover:text-slate-950"
            >
              Reset intake
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
