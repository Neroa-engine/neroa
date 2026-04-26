"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  loadArchitectureBlueprint,
  type ArchitectureBlueprint
} from "@/lib/intelligence/architecture";
import {
  loadConversationSessionState,
  type ConversationSessionState
} from "@/lib/intelligence/conversation";
import {
  loadProjectBrief,
  type ProjectBrief
} from "@/lib/intelligence/project-brief";
import {
  loadRoadmapPlan,
  type RoadmapPlan
} from "@/lib/intelligence/roadmap";
import { APP_ROUTES } from "@/lib/routes";
import {
  analyzePlanningInputs,
  buildInitialPlanningMessages,
  buildPlanningThreadStorageKey,
  isPlanningResetCommand,
  isWeakPlanningInput,
  type PlanningLaneId,
  type PlanningMessage,
  type PlanningThreadMetadata,
  type PlanningThreadState
} from "@/lib/start/planning-thread";

type PlanningChatApiResponse = {
  ok: boolean;
  error?: string;
  threadId?: string;
  threadState?: PlanningThreadState;
};

type StrategyRoomSurfaceMode = "entry" | "project";

type StrategyRoomCopy = {
  badge: string;
  heading: string;
  intro: string;
  threadEyebrow: string;
  threadDescription: string;
  composerLabel: string;
  placeholder: string;
  emptyStateTitle: string;
  emptyStateBody: string;
  nextStep: string;
};

type StrategyResumeSnapshot = {
  eyebrow?: string;
  title: string;
  description: string;
  items: Array<{
    label: string;
    value: string | null;
    placeholder: string;
  }>;
  workspaceHref?: string;
  workspaceLabel?: string;
};

type CanonicalEntryFlowProps = {
  initialUserEmail?: string;
  initialEntryPathId: PlanningLaneId;
  initialTitle?: string;
  initialSummary?: string;
  initialError?: string | null;
  initialNotice?: string | null;
  startEntryWorkspaceAction?: ((formData: FormData) => void | Promise<void>) | null;
  surfaceMode?: StrategyRoomSurfaceMode;
  roomCopy?: Partial<StrategyRoomCopy>;
  resumeSnapshot?: StrategyResumeSnapshot | null;
  projectWorkspaceHref?: string;
  projectWorkspaceLabel?: string;
  storageKeyOverride?: string;
  seedSummaryIntoThread?: boolean;
};

const DEFAULT_STRATEGY_ROOM_COPY: StrategyRoomCopy = {
  badge: "Strategy Room",
  heading: "Tell Neroa what you want to build.",
  intro:
    "Describe your product, workflow, audience, or idea in as much detail as you want. Neroa will turn it into a structured SaaS plan.",
  threadEyebrow: "Neroa conversation",
  threadDescription: "One conversation, one brief, one workspace when you are ready.",
  composerLabel: "Tell Neroa what you want to build",
  placeholder:
    "Describe your product, workflow, audience, or idea in as much detail as you want...",
  emptyStateTitle: "The conversation starts here.",
  emptyStateBody:
    "Start with the product, workflow, audience, or outcome you want Neroa to shape into a real SaaS plan.",
  nextStep:
    "When the brief is ready, Neroa can open the workspace with the planning context attached."
};

function createClientId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function slugifyTitle(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  return normalized;
}

function deriveTitle(title: string, messages: PlanningMessage[]) {
  const cleanTitle = slugifyTitle(title);

  if (cleanTitle) {
    return cleanTitle;
  }

  const planningSignals = analyzePlanningInputs(
    messages.filter((message) => message.role === "user").map((message) => message.content)
  );

  if (!planningSignals.shouldDeriveTitle) {
    return "";
  }

  const firstUserMessage = messages.find(
    (message) => message.role === "user" && !isWeakPlanningInput(message.content)
  )?.content?.trim();

  if (!firstUserMessage) {
    return "";
  }

  return firstUserMessage.slice(0, 72);
}

function buildReturnPath(args: {
  entryPathId: PlanningLaneId;
  title: string;
  summary: string;
}) {
  const params = new URLSearchParams();
  params.set("entry", args.entryPathId);

  if (args.title.trim()) {
    params.set("title", args.title.trim());
  }

  if (args.summary.trim()) {
    params.set("summary", args.summary.trim());
  }

  return `${APP_ROUTES.start}?${params.toString()}`;
}

function sanitizeStoredMessages(messages: unknown) {
  if (!Array.isArray(messages)) {
    return null;
  }

  const sanitized = messages
    .map((message) => {
      if (!message || typeof message !== "object") {
        return null;
      }

      const record = message as Record<string, unknown>;
      const role = record.role;
      const content = record.content;

      if ((role !== "assistant" && role !== "user") || typeof content !== "string") {
        return null;
      }

      const sanitizedMessage: PlanningMessage = {
        id: typeof record.id === "string" && record.id.trim() ? record.id : createClientId(String(role)),
        role,
        content: content.trim()
      };

      if (typeof record.createdAt === "string") {
        sanitizedMessage.createdAt = record.createdAt;
      }

      return sanitizedMessage;
    })
    .filter((message): message is PlanningMessage => Boolean(message && message.content));

  return sanitized.length > 0 ? sanitized : null;
}

function hasMeaningfulConversationState(value: ConversationSessionState | null) {
  if (!value) {
    return false;
  }

  return Boolean(
    value.founderName ||
      value.productCategory ||
      value.problemStatement ||
      value.outcomePromise ||
      value.monetization ||
      value.audience.buyerPersonas.length > 0 ||
      value.audience.operatorPersonas.length > 0 ||
      value.questionHistory.length > 0 ||
      value.processedUserTurnIds.length > 0
  );
}

function deriveScopePreview(summary: string) {
  return summary
    .split(/\n+|[.!?](?:\s+|$)/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 14)
    .slice(0, 3);
}

function buildDraftMetadata(args: {
  entryPathId: PlanningLaneId;
  title: string;
  summary: string;
  nextStep: string;
  shouldRevealSummary: boolean;
}) {
  return {
    lane: args.entryPathId,
    projectTitle: args.shouldRevealSummary ? args.title.trim() || null : null,
    perceivedProject: args.shouldRevealSummary ? args.summary.trim() || null : null,
    scopeNotes: args.shouldRevealSummary ? deriveScopePreview(args.summary) : [],
    recommendedNextStep: args.shouldRevealSummary
      ? args.nextStep
      : "Keep sharpening the user, workflow, and outcome before the workspace opens."
  } satisfies PlanningThreadMetadata;
}

function SubmitWorkspaceButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary" disabled={pending || disabled}>
      {pending ? "Opening planning workspace..." : "Open planning workspace"}
    </button>
  );
}

function StrategyResumePanel({
  snapshot
}: {
  snapshot?: StrategyResumeSnapshot | null;
}) {
  if (!snapshot || snapshot.items.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-[1240px] px-4">
      <div className="floating-plane rounded-[34px] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
              {snapshot.eyebrow ?? "Resume where you left off"}
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
              {snapshot.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              {snapshot.description}
            </p>
          </div>

          {snapshot.workspaceHref ? (
            <Link href={snapshot.workspaceHref} className="button-secondary">
              {snapshot.workspaceLabel ?? "Back to Project Workspace"}
            </Link>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {snapshot.items.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-slate-200/70 bg-white/72 px-4 py-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {item.label}
              </p>
              <p
                className={`mt-3 text-sm leading-7 ${
                  item.value ? "text-slate-700" : "text-slate-500"
                }`}
              >
                {item.value ?? item.placeholder}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function buildClearedPlanningThread(args: {
  entryPathId: PlanningLaneId;
  nextStep: string;
  initialSummary?: string;
  seedSummaryIntoThread?: boolean;
  preservedTitle?: string;
  preservedSummary?: string;
}) {
  const clearedMessages = buildInitialPlanningMessages({
    lane: args.entryPathId,
    initialSummary: args.seedSummaryIntoThread ? args.initialSummary : undefined
  });

  return {
    threadId: createClientId("start-thread"),
    messages: clearedMessages,
    metadata: buildDraftMetadata({
      entryPathId: args.entryPathId,
      title: args.preservedTitle ?? "",
      summary: args.preservedSummary ?? "",
      nextStep: args.nextStep,
      shouldRevealSummary: false
    })
  };
}

export function CanonicalEntryFlow({
  initialUserEmail,
  initialEntryPathId,
  initialTitle = "",
  initialSummary = "",
  initialError,
  initialNotice,
  startEntryWorkspaceAction,
  surfaceMode = "entry",
  roomCopy,
  resumeSnapshot,
  projectWorkspaceHref,
  projectWorkspaceLabel,
  storageKeyOverride,
  seedSummaryIntoThread = true
}: CanonicalEntryFlowProps) {
  const strategyRoomCopy = useMemo(
    () => ({
      ...DEFAULT_STRATEGY_ROOM_COPY,
      ...roomCopy
    }),
    [roomCopy]
  );
  const storageKey = useMemo(
    () =>
      storageKeyOverride ||
      buildPlanningThreadStorageKey({
        userEmail: initialUserEmail,
        lane: initialEntryPathId,
        title: initialTitle,
        summary: initialSummary
      }),
    [initialEntryPathId, initialSummary, initialTitle, initialUserEmail, storageKeyOverride]
  );
  const [title, setTitle] = useState(initialTitle);
  const [seedSummary, setSeedSummary] = useState(initialSummary);
  const [draft, setDraft] = useState("");
  const [threadId, setThreadId] = useState(() => createClientId("start-thread"));
  const [messages, setMessages] = useState<PlanningMessage[]>(() =>
    buildInitialPlanningMessages({
      lane: initialEntryPathId,
      initialSummary: seedSummaryIntoThread ? initialSummary : undefined
    })
  );
  const [threadMetadata, setThreadMetadata] = useState<PlanningThreadMetadata | null>(null);
  const [conversationState, setConversationState] =
    useState<ConversationSessionState | null>(null);
  const [projectBrief, setProjectBrief] = useState<ProjectBrief | null>(null);
  const [architectureBlueprint, setArchitectureBlueprint] =
    useState<ArchitectureBlueprint | null>(null);
  const [roadmapPlan, setRoadmapPlan] = useState<RoadmapPlan | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatNotice, setChatNotice] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const isAuthenticated = Boolean(initialUserEmail);
  const didHydrateRef = useRef(false);
  const threadViewportRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const compiledTitle = useMemo(() => deriveTitle(title, messages), [messages, title]);
  const compiledSummary = useMemo(
    () =>
      messages
        .filter((message) => message.role === "user")
        .map((message) => message.content.trim())
        .filter(Boolean)
        .join("\n\n"),
    [messages]
  );
  const planningSignals = useMemo(
    () =>
      analyzePlanningInputs(
        messages
          .filter((message) => message.role === "user")
          .map((message) => message.content)
      ),
    [messages]
  );
  const effectiveSummary = compiledSummary || seedSummary.trim();
  const derivedMetadata = useMemo(
    () =>
      buildDraftMetadata({
        entryPathId: initialEntryPathId,
        title: compiledTitle,
        summary: effectiveSummary,
        nextStep: strategyRoomCopy.nextStep,
        shouldRevealSummary: planningSignals.shouldRevealSummary
      }),
    [
      compiledTitle,
      effectiveSummary,
      initialEntryPathId,
      planningSignals.shouldRevealSummary,
      strategyRoomCopy.nextStep
    ]
  );
  const planningMetadata = threadMetadata ?? derivedMetadata;
  const visiblePlanningMetadata = planningSignals.shouldRevealSummary ? planningMetadata : null;
  const nextPath = useMemo(
    () =>
      buildReturnPath({
        entryPathId: initialEntryPathId,
        title: compiledTitle,
        summary: effectiveSummary
      }),
    [compiledTitle, effectiveSummary, initialEntryPathId]
  );
  const authHref = `${APP_ROUTES.auth}?next=${encodeURIComponent(nextPath)}`;
  const signupHref = `/signup?next=${encodeURIComponent(nextPath)}`;
  const hasUserMessages = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages]
  );
  const pendingStatusLabel = useMemo(() => {
    if (!hasUserMessages) {
      return "Analyzing...";
    }

    if (planningSignals.meaningfulTurnCount <= 1) {
      return "Reviewing your project...";
    }

    return "Shaping your brief...";
  }, [hasUserMessages, planningSignals.meaningfulTurnCount]);
  const visibleMessages = useMemo(
    () => messages.filter((message) => message.id !== "assistant-intro"),
    [messages]
  );
  const hasVisibleMessages = visibleMessages.length > 0;
  const showWorkspaceCreationFooter =
    surfaceMode === "entry" && typeof startEntryWorkspaceAction === "function";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) {
        didHydrateRef.current = true;
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PlanningThreadState> | null;
      const storedMessages = sanitizeStoredMessages(parsed?.messages);

      if (
        parsed &&
        typeof parsed.threadId === "string" &&
        parsed.threadId.trim() &&
        parsed.lane === initialEntryPathId &&
        storedMessages
      ) {
        setThreadId(parsed.threadId);
        setMessages(storedMessages);
        setSeedSummary(initialSummary);
        setTitle(initialTitle);
        const hydratedConversationState = hasMeaningfulConversationState(
          loadConversationSessionState(parsed.conversationState)
        )
          ? loadConversationSessionState(parsed.conversationState)
          : null;
        const hydratedProjectBrief = loadProjectBrief(parsed.projectBrief);
        const hydratedArchitectureBlueprint = loadArchitectureBlueprint(
          parsed.architectureBlueprint
        );
        const hydratedRoadmapPlan = loadRoadmapPlan(parsed.roadmapPlan);

        setConversationState(hydratedConversationState);
        setProjectBrief(hydratedProjectBrief);
        setArchitectureBlueprint(hydratedArchitectureBlueprint);
        setRoadmapPlan(hydratedRoadmapPlan);

        if (parsed.metadata && typeof parsed.metadata === "object") {
          const metadata = parsed.metadata as Record<string, unknown>;

          setThreadMetadata({
            lane: initialEntryPathId,
            projectTitle:
              typeof metadata.projectTitle === "string" ? metadata.projectTitle : null,
            perceivedProject:
              typeof metadata.perceivedProject === "string" ? metadata.perceivedProject : null,
            scopeNotes: Array.isArray(metadata.scopeNotes)
              ? metadata.scopeNotes.filter(
                  (note): note is string => typeof note === "string" && note.trim().length > 0
                )
              : [],
            recommendedNextStep:
              typeof metadata.recommendedNextStep === "string"
                ? metadata.recommendedNextStep
                : strategyRoomCopy.nextStep
          });

          if (typeof metadata.projectTitle === "string" && metadata.projectTitle.trim()) {
            setTitle(metadata.projectTitle);
          }
        }
      }
    } catch {
      // If local thread state is corrupted, fall back to the seeded thread.
    } finally {
      didHydrateRef.current = true;
    }
  }, [initialEntryPathId, initialSummary, initialTitle, storageKey, strategyRoomCopy.nextStep]);

  useEffect(() => {
    if (!didHydrateRef.current || typeof window === "undefined") {
      return;
    }

    const snapshot: PlanningThreadState = {
      threadId,
      lane: initialEntryPathId,
      messages,
      metadata: planningMetadata,
      conversationState,
      projectBrief,
      architectureBlueprint,
      roadmapPlan,
      updatedAt: new Date().toISOString()
    };

    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  }, [
    conversationState,
    architectureBlueprint,
    initialEntryPathId,
    messages,
    planningMetadata,
    projectBrief,
    roadmapPlan,
    storageKey,
    threadId
  ]);

  useEffect(() => {
    if (!threadViewportRef.current) {
      return;
    }

    threadViewportRef.current.scrollTo({
      top: threadViewportRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [isSending, visibleMessages]);

  useEffect(() => {
    if (!composerRef.current) {
      return;
    }

    composerRef.current.style.height = "0px";
    composerRef.current.style.height = `${Math.min(
      Math.max(composerRef.current.scrollHeight, 220),
      420
    )}px`;
  }, [draft]);

  function resetPlanningThread(notice?: string) {
    const resetTitle = surfaceMode === "project" ? initialTitle : "";
    const resetSeedSummary = surfaceMode === "project" ? initialSummary : "";
    const clearedThread = buildClearedPlanningThread({
      entryPathId: initialEntryPathId,
      nextStep: strategyRoomCopy.nextStep,
      initialSummary: resetSeedSummary,
      seedSummaryIntoThread,
      preservedTitle: resetTitle,
      preservedSummary: resetSeedSummary
    });

    setTitle(resetTitle);
    setSeedSummary(resetSeedSummary);
    setDraft("");
    setThreadId(clearedThread.threadId);
    setMessages(clearedThread.messages);
    setThreadMetadata(null);
    setConversationState(null);
    setProjectBrief(null);
    setArchitectureBlueprint(null);
    setRoadmapPlan(null);
    setChatError(null);
    setChatNotice(
      notice ??
        (surfaceMode === "project"
          ? "Strategy reset. Keep shaping the product from this project room."
          : "Planning thread cleared. Start again with the product, user, and outcome.")
    );

    if (typeof window !== "undefined") {
      const snapshot: PlanningThreadState = {
        threadId: clearedThread.threadId,
        lane: initialEntryPathId,
        messages: clearedThread.messages,
        metadata: clearedThread.metadata,
        conversationState: null,
        projectBrief: null,
        architectureBlueprint: null,
        roadmapPlan: null,
        updatedAt: new Date().toISOString()
      };

      window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
    }
  }

  async function handleSend() {
    const cleanDraft = draft.trim();

    if (!cleanDraft || isSending) {
      return;
    }

    if (isPlanningResetCommand(cleanDraft)) {
      resetPlanningThread();
      return;
    }

    const previousMessages = messages;
    const optimisticUserMessage: PlanningMessage = {
      id: createClientId("user"),
      role: "user",
      content: cleanDraft,
      createdAt: new Date().toISOString()
    };

    setDraft("");
    setChatError(null);
    setChatNotice(null);
    setIsSending(true);
    setMessages([...previousMessages, optimisticUserMessage].slice(-20));

    try {
      const response = await fetch("/api/start/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          threadId,
          lane: initialEntryPathId,
          title: title.trim(),
          summary: effectiveSummary || seedSummary,
          message: cleanDraft,
          conversationState,
          messages: previousMessages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt
          }))
        })
      });
      const payload = (await response.json()) as PlanningChatApiResponse;

      if (!response.ok || !payload.ok || !payload.threadState) {
        throw new Error(payload.error || "Unable to send the planning message to Neroa.");
      }

      setThreadId(payload.threadId ?? payload.threadState.threadId);
      setMessages(payload.threadState.messages);
      setThreadMetadata(payload.threadState.metadata);
      setConversationState(payload.threadState.conversationState ?? null);
      setProjectBrief(payload.threadState.projectBrief ?? null);
      setArchitectureBlueprint(payload.threadState.architectureBlueprint ?? null);
      setRoadmapPlan(payload.threadState.roadmapPlan ?? null);

      if (!title.trim() && payload.threadState.metadata.projectTitle) {
        setTitle(payload.threadState.metadata.projectTitle);
      }
    } catch (error) {
      setMessages(previousMessages);
      setDraft(cleanDraft);
      setChatError(
        error instanceof Error
          ? error.message
          : "Unable to continue the planning thread right now."
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-[1720px] flex-col gap-8 pb-8 pt-2 sm:gap-10 lg:pb-12 lg:pt-4">
      <header className="mx-auto w-full max-w-[980px] px-4 text-center">
        <div className="inline-flex items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
          {strategyRoomCopy.badge}
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.02]">
          {strategyRoomCopy.heading}
        </h1>
        <p className="mx-auto mt-5 max-w-[860px] text-base leading-8 text-slate-600 sm:text-lg">
          {strategyRoomCopy.intro}
        </p>
      </header>

      <StrategyResumePanel snapshot={resumeSnapshot} />

      <section className="floating-plane overflow-hidden rounded-[42px]">
        <div className="floating-wash rounded-[42px]" />
        <div className="relative flex min-h-[calc(100vh-17rem)] flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,250,252,0.82))] px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-4 border-b border-white/70 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {strategyRoomCopy.threadEyebrow}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                {strategyRoomCopy.threadDescription}
              </p>
            </div>
            {hasUserMessages ? (
              <button
                type="button"
                onClick={() => resetPlanningThread()}
                disabled={isSending}
                className="rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Start over
              </button>
            ) : null}
          </div>

          <div ref={threadViewportRef} className="flex-1 overflow-y-auto px-1 pb-8 pt-6 sm:px-2 lg:pt-8">
            <div className="mx-auto w-full max-w-[1180px]">
              {hasVisibleMessages ? (
                <div className="space-y-8 lg:space-y-10">
                  {visibleMessages.map((message) => (
                    <div key={message.id} className="w-full">
                      <div
                        className={`flex w-full ${
                          message.role === "assistant"
                            ? "justify-start pr-10 sm:pr-16 lg:pr-24"
                            : "justify-end pl-10 sm:pl-16 lg:pl-24"
                        }`}
                      >
                        <div
                          className={`w-full max-w-[860px] ${
                            message.role === "assistant" ? "text-left" : "text-right"
                          }`}
                        >
                          <p
                            className={`text-[11px] font-semibold uppercase tracking-[0.26em] ${
                              message.role === "assistant"
                                ? "text-slate-400"
                                : "text-cyan-700"
                            }`}
                          >
                            {message.role === "assistant" ? "Neroa" : "You"}
                          </p>
                          <div
                            className={`mt-3 whitespace-pre-wrap text-[16px] leading-8 text-slate-900 sm:text-[17px] ${
                              message.role === "assistant"
                                ? "max-w-[720px]"
                                : "ml-auto max-w-[720px]"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isSending ? (
                    <div className="flex items-center gap-3 pt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
                      {pendingStatusLabel}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[460px] items-center justify-center px-4 py-10 sm:min-h-[520px]">
                  <div className="max-w-[760px] text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      {strategyRoomCopy.badge}
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
                      {strategyRoomCopy.emptyStateTitle}
                    </h2>
                    <p className="mt-4 text-base leading-8 text-slate-500">
                      {strategyRoomCopy.emptyStateBody}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/70 bg-white/68 pb-2 pt-4 backdrop-blur-xl sm:pb-3 sm:pt-5">
            <div className="mx-auto w-full max-w-[1180px]">
              <div className="rounded-[32px] border border-white/80 bg-white/90 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-5 lg:p-6">
                <label className="block space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {strategyRoomCopy.composerLabel}
                  </span>
                  <textarea
                    ref={composerRef}
                    className="max-h-[420px] min-h-[220px] w-full resize-none rounded-[26px] border border-slate-200/80 bg-slate-50/60 px-5 py-5 text-[16px] leading-8 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100 sm:px-6 sm:py-6 sm:text-[17px]"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={strategyRoomCopy.placeholder}
                    disabled={isSending}
                  />
                </label>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs leading-6 text-slate-500">
                    Enter sends. Shift + Enter adds a new line. Type "start over" to clear the thread.
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={!draft.trim() || isSending}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>

                {chatNotice ? (
                  <div className="mt-4 rounded-[20px] border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">
                    {chatNotice}
                  </div>
                ) : null}
                {chatError ? (
                  <div className="mt-4 rounded-[20px] border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {chatError}
                  </div>
                ) : null}
                {initialError ? (
                  <div className="mt-4 rounded-[20px] border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {initialError}
                  </div>
                ) : null}
                {initialNotice ? (
                  <div className="mt-4 rounded-[20px] border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {initialNotice}
                  </div>
                ) : null}

                {hasUserMessages && showWorkspaceCreationFooter ? (
                  <form
                    action={startEntryWorkspaceAction!}
                    className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-5"
                  >
                    <input type="hidden" name="selectedPathId" value={initialEntryPathId} />
                    <input type="hidden" name="title" value={compiledTitle} />
                    <input type="hidden" name="description" value={effectiveSummary} />
                    <input
                      type="hidden"
                      name="conversationState"
                      value={conversationState ? JSON.stringify(conversationState) : ""}
                    />

                    <div className="max-w-[760px]">
                      <p className="text-sm font-semibold text-slate-950">
                        Continue from this Strategy Room thread
                      </p>
                      <p className="mt-1 text-sm leading-7 text-slate-600">
                        {visiblePlanningMetadata?.recommendedNextStep || strategyRoomCopy.nextStep}
                      </p>
                    </div>
                    {isAuthenticated ? (
                      <SubmitWorkspaceButton disabled={!hasUserMessages || isSending} />
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <Link href={authHref} className="button-primary">
                          Sign in to continue
                        </Link>
                        <Link href={signupHref} className="button-secondary">
                          Create account
                        </Link>
                      </div>
                    )}
                  </form>
                ) : null}

                {surfaceMode === "project" ? (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 pt-5">
                    <div className="max-w-[760px]">
                      <p className="text-sm font-semibold text-slate-950">
                        This strategy conversation stays attached to this project
                      </p>
                      <p className="mt-1 text-sm leading-7 text-slate-600">
                        {visiblePlanningMetadata?.recommendedNextStep ||
                          "Keep tightening the product, the first user, and the first use case from here."}
                      </p>
                    </div>
                    {projectWorkspaceHref ? (
                      <Link href={projectWorkspaceHref} className="button-secondary">
                        {projectWorkspaceLabel ?? "Back to Project Workspace"}
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
