"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import {
  useAIOnboardingControl,
  type AIOnboardingStep
} from "@/components/onboarding/ai-onboarding-control-provider";
import { GuidedOverlayLayer } from "@/components/naroa-guide/GuidedOverlayLayer";
import { GuidedSectionHighlighter } from "@/components/naroa-guide/GuidedSectionHighlighter";
import { NaroaGuideLauncher } from "@/components/naroa-guide/NaroaGuideLauncher";
import { NaroaGuidePanel } from "@/components/naroa-guide/NaroaGuidePanel";
import {
  calculateGuideDockPosition,
  guideAutoPromptDelayMs,
  guideScrollTriggerRatio,
  homepageGuideStorageKeys,
  homepageGuideSteps
} from "@/lib/marketing/naroa-guide";

type GuidePreference = "unknown" | "declined" | "dismissed" | "accepted" | "completed";

const homepageStepMap: Record<(typeof homepageGuideSteps)[number]["id"], AIOnboardingStep> = {
  "what-neroa-is": "landing-hero",
  "diy-vs-managed": "diy-vs-managed",
  "budget-engine-credits": "budget-engine-credits",
  "build-categories": "build-categories",
  "guided-build-path": "guided-build-path",
  "proof-trust": "proof-trust",
  "final-decision": "final-decision"
};

function getGuideSection(sectionId: string) {
  return document.querySelector<HTMLElement>(`[data-naroa-guide-section="${sectionId}"]`);
}

export function NaroaHomepageGuide() {
  const prefersReducedMotion = useReducedMotion();
  const {
    guidedMode,
    setGuidedMode,
    setOnboardingStep,
    setUserIntent,
    setNaroaContext
  } = useAIOnboardingControl();
  const [mounted, setMounted] = useState(false);
  const [preference, setPreference] = useState<GuidePreference>("unknown");
  const [launcherVisible, setLauncherVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [guideActive, setGuideActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeRect, setActiveRect] = useState<DOMRect | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1440, height: 900 });
  const [bubbleSize, setBubbleSize] = useState({ width: 360, height: 380 });

  const currentStep = homepageGuideSteps[stepIndex] ?? homepageGuideSteps[0];
  const guidePosition = useMemo(
    () =>
      calculateGuideDockPosition({
        rect: guideActive ? activeRect : null,
        viewportWidth: viewportSize.width,
        viewportHeight: viewportSize.height,
        bubbleWidth: bubbleSize.width,
        bubbleHeight: bubbleSize.height
      }),
    [activeRect, bubbleSize.height, bubbleSize.width, guideActive, viewportSize.height, viewportSize.width]
  );

  function persistPreference(next: GuidePreference) {
    setPreference(next);
    try {
      window.localStorage.setItem(homepageGuideStorageKeys.preference, next);
    } catch {}
  }

  useEffect(() => {
    setMounted(true);

    try {
      const storedPreference =
        window.localStorage.getItem(homepageGuideStorageKeys.preference) as GuidePreference | null;
      const storedVoice = window.localStorage.getItem(homepageGuideStorageKeys.voiceEnabled);

      if (storedPreference) {
        setPreference(storedPreference);
      }

      if (storedVoice) {
        setVoiceEnabled(storedVoice === "true");
      }
    } catch {}

    setVoiceSupported(
      typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window
    );
    setViewportSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", updateViewportSize);
    updateViewportSize();

    return () => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    let revealed = false;

    const revealGuide = () => {
      if (revealed) {
        return;
      }

      revealed = true;
      setLauncherVisible(true);

      if (preference === "unknown") {
        setPanelOpen(true);
      }
    };

    const delayTimer = window.setTimeout(revealGuide, guideAutoPromptDelayMs);

    function handleScroll() {
      if (revealed) {
        return;
      }

      const documentHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const ratio = window.scrollY / documentHeight;

      if (ratio >= guideScrollTriggerRatio || window.scrollY >= 560) {
        revealGuide();
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.clearTimeout(delayTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted, preference]);

  useEffect(() => {
    if (!guideActive) {
      return;
    }

    setOnboardingStep(homepageStepMap[currentStep.id]);
  }, [currentStep.id, guideActive, setOnboardingStep]);

  useEffect(() => {
    if (!guideActive || !guidedMode) {
      return;
    }

    setNaroaContext(currentStep.summary);
  }, [currentStep.summary, guideActive, guidedMode, setNaroaContext]);

  useEffect(() => {
    if (!guideActive) {
      document
        .querySelectorAll("[data-naroa-guide-section][data-naroa-guide-active='true']")
        .forEach((node) => node.removeAttribute("data-naroa-guide-active"));
      setActiveRect(null);
      return;
    }

    const section = getGuideSection(currentStep.id);

    if (!section) {
      setActiveRect(null);
      return;
    }

    document
      .querySelectorAll("[data-naroa-guide-section][data-naroa-guide-active='true']")
      .forEach((node) => node.removeAttribute("data-naroa-guide-active"));
    section.setAttribute("data-naroa-guide-active", "true");

    const updateRect = () => {
      setActiveRect(section.getBoundingClientRect());
    };

    const scrollTarget = Math.max(
      section.getBoundingClientRect().top + window.scrollY - (window.innerWidth < 768 ? 92 : 118),
      0
    );

    const scrollTimer = window.setTimeout(() => {
      window.scrollTo({
        top: scrollTarget,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
      updateRect();
    }, 60);

    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(section);
    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("resize", updateRect);
    updateRect();

    return () => {
      window.clearTimeout(scrollTimer);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
      section.removeAttribute("data-naroa-guide-active");
    };
  }, [currentStep.id, guideActive, prefersReducedMotion]);

  useEffect(() => {
    if (!voiceEnabled || !panelOpen || !voiceSupported || typeof window === "undefined") {
      return;
    }

    const text = guideActive
      ? `${currentStep.title}. ${currentStep.summary}`
      : "I'm Neroa, your build orchestrator. Want me to guide you through how to build with Neroa?";

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.01;
    utterance.pitch = 1;

    const timer = window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 120);

    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [currentStep.id, currentStep.summary, currentStep.title, guideActive, panelOpen, voiceEnabled, voiceSupported]);

  const spotlightLabel = useMemo(
    () => `${currentStep.eyebrow} - ${currentStep.sectionLabel}`,
    [currentStep.eyebrow, currentStep.sectionLabel]
  );
  const launcherLabel = guideActive ? currentStep.sectionLabel : panelOpen ? "Guide open" : "Neroa guide";

  const handleMeasurePanel = useCallback((size: { width: number; height: number }) => {
    setBubbleSize((current) => {
      if (Math.abs(current.width - size.width) < 2 && Math.abs(current.height - size.height) < 2) {
        return current;
      }

      return size;
    });
  }, []);

  function handleOpenGuide() {
    setLauncherVisible(true);
    setPanelOpen(true);
  }

  function handleDismiss() {
    if (guideActive && stepIndex === homepageGuideSteps.length - 1) {
      persistPreference("completed");
    } else if (guideActive || preference === "unknown") {
      persistPreference("dismissed");
    }

    setGuideActive(false);
    setPanelOpen(false);
    setPrompt("");
    setActiveRect(null);
  }

  function handleDeclineGuide() {
    persistPreference("declined");
    setGuidedMode(false);
    setUserIntent("Self-guided homepage exploration");
    setNaroaContext(null);
    setGuideActive(false);
    setPanelOpen(false);
    setPrompt("");
    setActiveRect(null);
  }

  function handleStartGuide() {
    persistPreference("accepted");
    setGuidedMode(true);
    setOnboardingStep(homepageStepMap["what-neroa-is"]);
    setUserIntent("Guided homepage walkthrough");
    setNaroaContext(homepageGuideSteps[0]?.summary ?? null);
    setGuideActive(true);
    setPanelOpen(true);
    setStepIndex(0);
  }

  function handleToggleVoice(next: boolean) {
    setVoiceEnabled(next);
    try {
      window.localStorage.setItem(homepageGuideStorageKeys.voiceEnabled, String(next));
    } catch {}

    if (!next && voiceSupported && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
  }

  return (
    <>
      <NaroaGuideLauncher
        visible={mounted && launcherVisible}
        active={panelOpen || guideActive}
        onClick={handleOpenGuide}
        position={guidePosition}
        label={launcherLabel}
      />

      <AnimatePresence>
        {guideActive ? <GuidedOverlayLayer /> : null}
      </AnimatePresence>

      <AnimatePresence>
        {guideActive ? (
          <GuidedSectionHighlighter rect={activeRect} label={spotlightLabel} />
        ) : null}
      </AnimatePresence>

      <NaroaGuidePanel
        open={mounted && panelOpen}
        guidedMode={guidedMode}
        guideActive={guideActive}
        currentStep={currentStep}
        currentStepIndex={stepIndex}
        totalSteps={homepageGuideSteps.length}
        voiceEnabled={voiceEnabled}
        voiceSupported={voiceSupported}
        prompt={prompt}
        onPromptChange={setPrompt}
        onUseSuggestion={setPrompt}
        onToggleGuidedMode={(next) => {
          setGuidedMode(next);

          if (!next) {
            setGuideActive(false);
            setNaroaContext(null);
            return;
          }

          setGuideActive(true);
          setPanelOpen(true);
          setOnboardingStep(homepageStepMap[currentStep.id]);
          setNaroaContext(currentStep.summary);
        }}
        onStartGuide={handleStartGuide}
        onDeclineGuide={handleDeclineGuide}
        onDismiss={handleDismiss}
        onBack={() => setStepIndex((current) => Math.max(current - 1, 0))}
        onNext={() =>
          setStepIndex((current) => Math.min(current + 1, homepageGuideSteps.length - 1))
        }
        onSkip={() => setStepIndex(homepageGuideSteps.length - 1)}
        onToggleVoice={handleToggleVoice}
        position={guidePosition}
        onMeasure={handleMeasurePanel}
      />
    </>
  );
}
