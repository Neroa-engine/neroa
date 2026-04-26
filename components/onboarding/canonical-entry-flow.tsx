"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  loadArchitectureBlueprint,
  type ArchitectureBlueprint
} from "@/lib/intelligence/architecture";
import type { ConversationSessionState } from "@/lib/intelligence/conversation";
import {
  loadGovernancePolicy,
  type GovernancePolicy
} from "@/lib/intelligence/governance";
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
  choosePreferredPlanningThreadState,
  hasMeaningfulPlanningConversationState,
  normalizePlanningThreadState,
  isPlanningResetCommand,
  isWeakPlanningInput,
  loadPlanningThreadState,
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

type PersistedProjectContext = {
  workspaceId: string;
  projectId: string;
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
  layoutVariant?: "default" | "embedded";
  showProjectFooter?: boolean;
  initialThreadState?: PlanningThreadState | null;
  persistedProjectContext?: PersistedProjectContext | null;
  allowStarterThread?: boolean;
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
  allowStarterThread?: boolean;
}) {
  const clearedMessages = args.allowStarterThread
    ? buildInitialPlanningMessages({
        lane: args.entryPathId,
        initialSummary: args.seedSummaryIntoThread ? args.initialSummary : undefined
      })
    : [];

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
  seedSummaryIntoThread = true,
  layoutVariant = "default",
  showProjectFooter = true,
  initialThreadState = null,
  persistedProjectContext = null,
  allowStarterThread = true
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
  const seededThreadStateCandidate =
    initialThreadState?.lane === initialEntryPathId ? initialThreadState : null;
  const seededThreadState = normalizePlanningThreadState({
    threadState: seededThreadStateCandidate,
    options: {
      suppressStarterPrompts: !allowStarterThread,
      founderNameKnown: Boolean(seededThreadStateCandidate?.conversationState?.founderName),
      productDirectionKnown: Boolean(
        seededThreadStateCandidate?.metadata.perceivedProject?.trim() || initialSummary.trim()
      )
    }
  });
  const [title, setTitle] = useState(
    seededThreadState?.metadata.projectTitle?.trim() || initialTitle
  );
  const [seedSummary, setSeedSummary] = useState(initialSummary);
  const [draft, setDraft] = useState("");
  const [threadId, setThreadId] = useState(
    () => seededThreadState?.threadId ?? createClientId("start-thread")
  );
  const [messages, setMessages] = useState<PlanningMessage[]>(() =>
    seededThreadState?.messages ??
    (allowStarterThread
      ? buildInitialPlanningMessages({
          lane: initialEntryPathId,
          initialSummary: seedSummaryIntoThread ? initialSummary : undefined
        })
      : [])
  );
  const [threadMetadata, setThreadMetadata] = useState<PlanningThreadMetadata | null>(
    seededThreadState?.metadata ?? null
  );
  const [conversationState, setConversationState] = useState<ConversationSessionState | null>(
    hasMeaningfulPlanningConversationState(seededThreadState?.conversationState ?? null)
      ? seededThreadState?.conversationState ?? null
      : null
  );
  const [projectBrief, setProjectBrief] = useState<ProjectBrief | null>(null);
  const [architectureBlueprint, setArchitectureBlueprint] =
    useState<ArchitectureBlueprint | null>(null);
  const [roadmapPlan, setRoadmapPlan] = useState<RoadmapPlan | null>(null);
  const [governancePolicy, setGovernancePolicy] =
    useState<GovernancePolicy | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatNotice, setChatNotice] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const isAuthenticated = Boolean(initialUserEmail);
  const didHydrateRef = useRef(false);
  const threadViewportRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const isEmbedded = layoutVariant === "embedded";
  const composerMinHeight = isEmbedded ? 132 : 220;
  const composerMaxHeight = isEmbedded ? 260 : 420;

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
      const parsed = raw ? (JSON.parse(raw) as Partial<PlanningThreadState> | null) : null;
      const localThreadStateCandidate =
        parsed && parsed.lane === initialEntryPathId ? loadPlanningThreadState(parsed) : null;
      const localThreadState = normalizePlanningThreadState({
        threadState: localThreadStateCandidate,
        options: {
          suppressStarterPrompts: !allowStarterThread,
          founderNameKnown: Boolean(
            seededThreadState?.conversationState?.founderName ??
              localThreadStateCandidate?.conversationState?.founderName
          ),
          productDirectionKnown: Boolean(
            seededThreadState?.metadata.perceivedProject?.trim() ||
              localThreadStateCandidate?.metadata.perceivedProject?.trim() ||
              initialSummary.trim()
          )
        }
      });
      const preferredThreadState = choosePreferredPlanningThreadState({
        persistedThreadState: seededThreadState,
        localThreadState,
        allowSyntheticFallback: allowStarterThread
      });

      if (preferredThreadState) {
        setThreadId(preferredThreadState.threadId);
        setMessages(preferredThreadState.messages);
        setThreadMetadata(preferredThreadState.metadata);
        setConversationState(
          hasMeaningfulPlanningConversationState(preferredThreadState.conversationState ?? null)
            ? preferredThreadState.conversationState ?? null
            : null
        );
        setSeedSummary(initialSummary);
        setTitle(preferredThreadState.metadata.projectTitle?.trim() || initialTitle);
      }

      if (parsed && localThreadState && preferredThreadState === localThreadState) {
        setProjectBrief(loadProjectBrief(parsed.projectBrief));
        setArchitectureBlueprint(loadArchitectureBlueprint(parsed.architectureBlueprint));
        setRoadmapPlan(loadRoadmapPlan(parsed.roadmapPlan));
        setGovernancePolicy(loadGovernancePolicy(parsed.governancePolicy));
      }
    } catch {
      // If local thread state is corrupted, fall back to the seeded server snapshot.
    } finally {
      didHydrateRef.current = true;
    }
  }, [
    allowStarterThread,
    initialEntryPathId,
    initialSummary,
    initialTitle,
    seededThreadState,
    storageKey
  ]);

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
      governancePolicy,
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
    governancePolicy,
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
      Math.max(composerRef.current.scrollHeight, composerMinHeight),
      composerMaxHeight
    )}px`;
  }, [composerMaxHeight, composerMinHeight, draft]);

  function resetPlanningThread(notice?: string) {
    if (!allowStarterThread && seededThreadState) {
      setTitle(seededThreadState.metadata.projectTitle?.trim() || initialTitle);
      setSeedSummary(initialSummary);
      setDraft("");
      setThreadId(seededThreadState.threadId);
      setMessages(seededThreadState.messages);
      setThreadMetadata(seededThreadState.metadata);
      setConversationState(
        hasMeaningfulPlanningConversationState(seededThreadState.conversationState ?? null)
          ? seededThreadState.conversationState ?? null
          : null
      );
      setProjectBrief(null);
      setArchitectureBlueprint(null);
      setRoadmapPlan(null);
      setGovernancePolicy(null);
      setChatError(null);
      setChatNotice(
        notice ??
          "Strategy reset. Neroa reopened the latest saved planning context for this project."
      );

      if (typeof window !== "undefined") {
        const snapshot: PlanningThreadState = {
          threadId: seededThreadState.threadId,
          lane: initialEntryPathId,
          messages: seededThreadState.messages,
          metadata: seededThreadState.metadata,
          conversationState: seededThreadState.conversationState ?? null,
          projectBrief: null,
          architectureBlueprint: null,
          roadmapPlan: null,
          governancePolicy: null,
          updatedAt: new Date().toISOString()
        };

        window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
      }

      return;
    }

    const resetTitle = surfaceMode === "project" ? initialTitle : "";
    const resetSeedSummary = surfaceMode === "project" ? initialSummary : "";
    const clearedThread = buildClearedPlanningThread({
      entryPathId: initialEntryPathId,
      nextStep: strategyRoomCopy.nextStep,
      initialSummary: resetSeedSummary,
      seedSummaryIntoThread,
      preservedTitle: resetTitle,
      preservedSummary: resetSeedSummary,
      allowStarterThread
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
    setGovernancePolicy(null);
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
        governancePolicy: null,
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
          workspaceId: persistedProjectContext?.workspaceId,
          projectId: persistedProjectContext?.projectId,
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

      const normalizedThreadState =
        normalizePlanningThreadState({
          threadState: payload.threadState,
          options: {
            suppressStarterPrompts: !allowStarterThread,
            founderNameKnown: Boolean(payload.threadState.conversationState?.founderName),
            productDirectionKnown: Boolean(
              payload.threadState.metadata.perceivedProject?.trim() ||
                payload.threadState.projectBrief?.productCategory ||
                payload.threadState.projectBrief?.problemStatement ||
                payload.threadState.projectBrief?.outcomePromise ||
                initialSummary.trim()
            )
          }
        }) ?? payload.threadState;

      setThreadId(payload.threadId ?? normalizedThreadState.threadId);
      setMessages(normalizedThreadState.messages);
      setThreadMetadata(normalizedThreadState.metadata);
      setConversationState(normalizedThreadState.conversationState ?? null);
      setProjectBrief(payload.threadState.projectBrief ?? null);
      setArchitectureBlueprint(payload.threadState.architectureBlueprint ?? null);
      setRoadmapPlan(payload.threadState.roadmapPlan ?? null);
      setGovernancePolicy(payload.threadState.governancePolicy ?? null);

      if (!title.trim() && normalizedThreadState.metadata.projectTitle) {
        setTitle(normalizedThreadState.metadata.projectTitle);
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
    <section
      className={
        isEmbedded
          ? "flex h-[clamp(640px,calc(100vh-16rem),920px)] min-h-0 w-full flex-col"
          : "mx-auto flex w-full max-w-[1720px] flex-col gap-8 pb-8 pt-2 sm:gap-10 lg:pb-12 lg:pt-4"
      }
    >
      {!isEmbedded ? (
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
      ) : null}

      {!isEmbedded ? <StrategyResumePanel snapshot={resumeSnapshot} /> : null}

      <section
        className={`floating-plane overflow-hidden ${
          isEmbedded
            ? "h-full min-h-0 rounded-[32px] border border-white/10 bg-slate-950/88"
            : "rounded-[42px]"
        }`}
      >
        <div className={`floating-wash ${isEmbedded ? "rounded-[32px] opacity-80" : "rounded-[42px]"}`} />
        <div
          className={`relative flex flex-col ${
            isEmbedded
              ? "h-full min-h-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] px-4 pb-4 pt-4 text-slate-100 sm:px-5 sm:pb-5 sm:pt-5"
              : "min-h-[calc(100vh-17rem)] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,250,252,0.82))] px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-8"
          }`}
        >
          <div
            className={`mx-auto flex w-full items-center justify-between gap-4 border-b pb-4 ${
              isEmbedded
                ? "max-w-none border-white/10"
                : "max-w-[1320px] border-white/70"
            }`}
          >
            <div>
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${
                  isEmbedded ? "text-cyan-200/80" : "text-slate-500"
                }`}
              >
                {strategyRoomCopy.threadEyebrow}
              </p>
              <p
                className={`mt-2 text-sm leading-7 ${
                  isEmbedded ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {strategyRoomCopy.threadDescription}
              </p>
            </div>
            {hasUserMessages ? (
              <button
                type="button"
                onClick={() => resetPlanningThread()}
                disabled={isSending}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isEmbedded
                    ? "border border-white/12 bg-white/8 text-slate-300 hover:border-cyan-300/40 hover:text-white"
                    : "border border-slate-200/80 bg-white/75 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                Start over
              </button>
            ) : null}
          </div>

          <div
            ref={threadViewportRef}
            className={`flex-1 min-h-0 overflow-y-auto ${
              isEmbedded ? "px-0 pb-6 pt-5 sm:pt-6" : "px-1 pb-8 pt-6 sm:px-2 lg:pt-8"
            }`}
          >
            <div className={`mx-auto w-full ${isEmbedded ? "max-w-none" : "max-w-[1180px]"}`}>
              {hasVisibleMessages ? (
                <div className={isEmbedded ? "space-y-6" : "space-y-8 lg:space-y-10"}>
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
                                ? isEmbedded
                                  ? "text-slate-400"
                                  : "text-slate-400"
                                : isEmbedded
                                  ? "text-cyan-300"
                                  : "text-cyan-700"
                            }`}
                          >
                            {message.role === "assistant" ? "Neroa" : "You"}
                          </p>
                          <div
                            className={`mt-3 whitespace-pre-wrap text-[16px] leading-8 sm:text-[17px] ${
                              message.role === "assistant"
                                ? "max-w-[720px]"
                                : "ml-auto max-w-[720px]"
                            } ${isEmbedded ? "text-slate-100" : "text-slate-900"}`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isSending ? (
                    <div
                      className={`flex items-center gap-3 pt-2 text-xs font-semibold uppercase tracking-[0.22em] ${
                        isEmbedded ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
                      {pendingStatusLabel}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  className={`flex items-center justify-center px-4 py-10 ${
                    isEmbedded ? "min-h-[360px] sm:min-h-[420px]" : "min-h-[460px] sm:min-h-[520px]"
                  }`}
                >
                  <div className="max-w-[760px] text-center">
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${
                        isEmbedded ? "text-cyan-200/80" : "text-slate-500"
                      }`}
                    >
                      {strategyRoomCopy.badge}
                    </p>
                    <h2
                      className={`mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl ${
                        isEmbedded ? "text-white" : "text-slate-950"
                      }`}
                    >
                      {strategyRoomCopy.emptyStateTitle}
                    </h2>
                    <p
                      className={`mt-4 text-base leading-8 ${
                        isEmbedded ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {strategyRoomCopy.emptyStateBody}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={`border-t backdrop-blur-xl ${
              isEmbedded
                ? "sticky bottom-0 border-white/10 bg-slate-950/92 pb-3 pt-4"
                : "border-white/70 bg-white/68 pb-2 pt-4 sm:pb-3 sm:pt-5"
            }`}
          >
            <div className={`mx-auto w-full ${isEmbedded ? "max-w-none" : "max-w-[1180px]"}`}>
              <div
                className={`rounded-[32px] p-4 sm:p-5 ${
                  isEmbedded
                    ? "border border-white/10 bg-white/6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] lg:p-5"
                    : "border border-white/80 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:p-6"
                }`}
              >
                <label className="block space-y-3">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                      isEmbedded ? "text-cyan-200/80" : "text-slate-500"
                    }`}
                  >
                    {strategyRoomCopy.composerLabel}
                  </span>
                  <textarea
                    ref={composerRef}
                    className={`w-full resize-none rounded-[26px] px-5 py-4 text-[16px] leading-8 outline-none transition placeholder:text-slate-400 sm:px-6 sm:text-[17px] ${
                      isEmbedded
                        ? "border border-white/10 bg-slate-950/70 text-white focus:border-cyan-300 focus:bg-slate-950/90 focus:ring-4 focus:ring-cyan-500/20"
                        : "border border-slate-200/80 bg-slate-50/60 text-slate-900 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    }`}
                    style={{
                      minHeight: `${composerMinHeight}px`,
                      maxHeight: `${composerMaxHeight}px`
                    }}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={strategyRoomCopy.placeholder}
                    disabled={isSending}
                  />
                </label>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div
                    className={`text-xs leading-6 ${
                      isEmbedded ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Enter sends. Shift + Enter adds a new line. Type "start over" to clear the thread.
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={!draft.trim() || isSending}
                    className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
                      isEmbedded
                        ? "bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700"
                        : "bg-slate-950 hover:bg-slate-800 disabled:bg-slate-300"
                    }`}
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

                {surfaceMode === "project" && showProjectFooter ? (
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
