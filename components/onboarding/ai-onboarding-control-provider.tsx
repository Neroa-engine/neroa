"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  clearSavedSession,
  loadSavedSession,
  normalizeBuildSession,
  saveSession,
  type GuidedBuildSession,
} from "@/lib/onboarding/build-session";
import {
  normalizeGuidedBuildHandoff,
  type GuidedBuildHandoff
} from "@/lib/onboarding/guided-handoff";

export type AIOnboardingStep =
  | "landing-hero"
  | "public-home"
  | "public-diy"
  | "public-managed"
  | "public-pricing"
  | "public-use-case"
  | "public-seo-landing"
  | "diy-vs-managed"
  | "budget-engine-credits"
  | "build-categories"
  | "guided-build-path"
  | "proof-trust"
  | "final-decision"
  | "start-account"
  | "start-plan"
  | "start-entry"
  | "start-industry"
  | "start-goal"
  | "start-opportunity"
  | "start-product"
  | "start-experience"
  | "start-preference"
  | "start-summary"
  | "example-build-type"
  | "example-build-intent"
  | "example-build-framework"
  | "example-build-project"
  | "example-build-breakdown";

type SyncCardInteractionInput = {
  onboardingStep: AIOnboardingStep;
  userIntent: string;
  assistMessage: string;
};

type AIOnboardingControlValue = {
  guidedMode: boolean;
  onboardingStep: AIOnboardingStep;
  userIntent: string;
  naroaContext: string | null;
  guidedBuildHandoff: GuidedBuildHandoff | null;
  buildSession: GuidedBuildSession | null;
  setGuidedMode: (next: boolean) => void;
  toggleGuidedMode: () => void;
  setOnboardingStep: (step: AIOnboardingStep) => void;
  setUserIntent: (intent: string) => void;
  setNaroaContext: (message: string | null) => void;
  setGuidedBuildHandoff: (handoff: Omit<GuidedBuildHandoff, "updatedAt"> & { updatedAt?: string }) => void;
  clearGuidedBuildHandoff: () => void;
  setBuildSession: (session: GuidedBuildSession | null) => void;
  clearBuildSession: () => void;
  syncCardInteraction: (input: SyncCardInteractionInput) => void;
};

const STORAGE_KEY = "neroa:ai-onboarding-control";

const AIOnboardingControlContext = createContext<AIOnboardingControlValue | null>(null);

export function AIOnboardingControlProvider({
  children
}: {
  children: ReactNode;
}) {
  const [guidedMode, setGuidedModeState] = useState(false);
  const [onboardingStep, setOnboardingStepState] = useState<AIOnboardingStep>("landing-hero");
  const [userIntent, setUserIntentState] = useState("");
  const [naroaContext, setNaroaContextState] = useState<string | null>(null);
  const [guidedBuildHandoff, setGuidedBuildHandoffState] = useState<GuidedBuildHandoff | null>(null);
  const [buildSession, setBuildSessionState] = useState<GuidedBuildSession | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        guidedMode?: boolean;
        onboardingStep?: AIOnboardingStep;
        userIntent?: string;
        guidedBuildHandoff?: GuidedBuildHandoff | null;
      };

      if (typeof parsed.guidedMode === "boolean") {
        setGuidedModeState(parsed.guidedMode);
      }

      if (parsed.onboardingStep) {
        setOnboardingStepState(parsed.onboardingStep);
      }

      if (typeof parsed.userIntent === "string") {
        setUserIntentState(parsed.userIntent);
      }

      if (parsed.guidedBuildHandoff) {
        setGuidedBuildHandoffState(normalizeGuidedBuildHandoff(parsed.guidedBuildHandoff));
      }

      const savedSession = loadSavedSession();

      if (savedSession) {
        setBuildSessionState(savedSession);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          guidedMode,
          onboardingStep,
          userIntent,
          guidedBuildHandoff
        })
      );
    } catch {}
  }, [guidedBuildHandoff, guidedMode, onboardingStep, userIntent]);

  useEffect(() => {
    if (!buildSession) {
      clearSavedSession();
      return;
    }

    saveSession(buildSession);
  }, [buildSession]);

  function setGuidedMode(next: boolean) {
    setGuidedModeState(next);

    if (!next) {
      setNaroaContextState(null);
    }
  }

  function setOnboardingStep(step: AIOnboardingStep) {
    setOnboardingStepState(step);
  }

  function setUserIntent(intent: string) {
    setUserIntentState(intent);
  }

  function setNaroaContext(message: string | null) {
    setNaroaContextState(message);
  }

  function setGuidedBuildHandoff(
    handoff: Omit<GuidedBuildHandoff, "updatedAt"> & { updatedAt?: string }
  ) {
    setGuidedBuildHandoffState({
      ...handoff,
      updatedAt: handoff.updatedAt ?? new Date().toISOString()
    });
  }

  function clearGuidedBuildHandoff() {
    setGuidedBuildHandoffState(null);
  }

  function setBuildSession(session: GuidedBuildSession | null) {
    if (!session) {
      setBuildSessionState(null);
      return;
    }

    setBuildSessionState(normalizeBuildSession(session));
  }

  function clearBuildSession() {
    setBuildSessionState(null);
  }

  function syncCardInteraction({
    onboardingStep: nextStep,
    userIntent: nextIntent,
    assistMessage
  }: SyncCardInteractionInput) {
    setOnboardingStepState(nextStep);
    setUserIntentState(nextIntent);

    if (guidedMode) {
      setNaroaContextState(assistMessage);
    }
  }

  const value = useMemo<AIOnboardingControlValue>(
    () => ({
      guidedMode,
      onboardingStep,
      userIntent,
      naroaContext,
      guidedBuildHandoff,
      buildSession,
      setGuidedMode,
      toggleGuidedMode: () => setGuidedMode(!guidedMode),
      setOnboardingStep,
      setUserIntent,
      setNaroaContext,
      setGuidedBuildHandoff,
      clearGuidedBuildHandoff,
      setBuildSession,
      clearBuildSession,
      syncCardInteraction
    }),
    [buildSession, guidedBuildHandoff, guidedMode, naroaContext, onboardingStep, userIntent]
  );

  return (
    <AIOnboardingControlContext.Provider value={value}>
      {children}
    </AIOnboardingControlContext.Provider>
  );
}

export function useAIOnboardingControl() {
  const context = useContext(AIOnboardingControlContext);

  if (!context) {
    throw new Error("useAIOnboardingControl must be used inside AIOnboardingControlProvider");
  }

  return context;
}
