"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion
} from "framer-motion";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { PublicActionLink } from "@/components/site/public-action-link";

export type FocusBubbleAction = {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
};

export type FocusBubbleSection = {
  label: string;
  body: string;
};

export type FocusBubbleData = {
  id: string;
  eyebrow?: string;
  title: string;
  summary?: string;
  sections?: FocusBubbleSection[];
  details?: string[];
  footnote?: string;
  actions?: FocusBubbleAction[];
  returnLabel?: string;
};

type FocusBubbleContextValue = {
  activeBubble: FocusBubbleData | null;
  activeBubbleId: string | null;
  openBubble: (bubble: FocusBubbleData) => void;
  closeBubble: () => void;
};

const FocusBubbleContext = createContext<FocusBubbleContextValue | null>(null);

export function useFocusBubbleState() {
  const value = useContext(FocusBubbleContext);

  if (!value) {
    throw new Error("useFocusBubbleState must be used within FocusBubbleProvider.");
  }

  return value;
}

export function ReturnButton({
  label,
  onClick
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="button-secondary">
      {label ?? "Return"}
    </button>
  );
}

export function FocusBubbleOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Return to the page"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="focus-bubble-overlay fixed inset-0 z-[180] h-full w-full border-0 bg-transparent p-0"
    />
  );
}

export function FocusBubbleContent({
  bubble,
  onClose
}: {
  bubble: FocusBubbleData;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          {bubble.eyebrow ? (
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              {bubble.eyebrow}
            </span>
          ) : null}
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {bubble.title}
          </h2>
          {bubble.summary ? (
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{bubble.summary}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close focus bubble"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/75 bg-white/86 text-lg text-slate-500 shadow-[0_18px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:text-slate-950"
        >
          ×
        </button>
      </div>

      {bubble.sections?.length ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {bubble.sections.map((section) => (
            <section
              key={`${bubble.id}:${section.label}`}
              className="rounded-[26px] border border-slate-200/72 bg-white/84 px-5 py-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                {section.label}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>
      ) : null}

      {bubble.details?.length ? (
        <section className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
            In practice
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {bubble.details.map((detail) => (
              <div
                key={`${bubble.id}:${detail}`}
                className="rounded-[22px] border border-slate-200/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.78))] px-4 py-4 text-sm leading-7 text-slate-600 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
              >
                {detail}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {bubble.footnote ? (
        <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.84))] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Why it matters
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{bubble.footnote}</p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ReturnButton label={bubble.returnLabel} onClick={onClose} />

        {bubble.actions?.length ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {bubble.actions.map((action) => (
              <PublicActionLink
                key={`${bubble.id}:${action.href}:${action.label}`}
                href={action.href}
                label={action.label}
                className={action.tone === "secondary" ? "button-secondary" : "button-primary"}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FocusBubbleModal({
  bubble,
  onClose
}: {
  bubble: FocusBubbleData;
  onClose: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, [bubble.id]);

  return (
    <div className="fixed inset-0 z-[181]">
      <FocusBubbleOverlay onClose={onClose} />
      <div className="pointer-events-none fixed inset-0 z-[181] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`focus-bubble-title-${bubble.id}`}
          tabIndex={-1}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 24 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
          transition={{
            duration: prefersReducedMotion ? 0.1 : 0.28,
            ease: [0.16, 1, 0.3, 1]
          }}
          onClick={(event) => event.stopPropagation()}
          className="focus-bubble-panel pointer-events-auto relative w-full max-w-[940px] overflow-hidden rounded-[32px] border border-slate-200/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,250,255,0.88))] px-5 py-5 shadow-[0_38px_130px_rgba(15,23,42,0.28)] backdrop-blur-2xl sm:px-8 sm:py-8 lg:px-10 lg:py-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative">
            <FocusBubbleContent bubble={bubble} onClose={onClose} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function FocusBubbleTrigger({
  bubble,
  onOpen,
  children
}: {
  bubble: FocusBubbleData;
  onOpen?: () => void;
  children: (args: { isActive: boolean; open: () => void }) => ReactNode;
}) {
  const { activeBubbleId, openBubble } = useFocusBubbleState();
  const isActive = activeBubbleId === bubble.id;

  function open() {
    onOpen?.();
    openBubble(bubble);
  }

  return <>{children({ isActive, open })}</>;
}

export function FocusBubbleProvider({ children }: { children: ReactNode }) {
  const [activeBubble, setActiveBubble] = useState<FocusBubbleData | null>(null);

  useEffect(() => {
    if (!activeBubble) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveBubble(null);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeBubble]);

  return (
    <FocusBubbleContext.Provider
      value={{
        activeBubble,
        activeBubbleId: activeBubble?.id ?? null,
        openBubble: (bubble) => setActiveBubble(bubble),
        closeBubble: () => setActiveBubble(null)
      }}
    >
      {children}
      <AnimatePresence>
        {activeBubble ? (
          <FocusBubbleModal bubble={activeBubble} onClose={() => setActiveBubble(null)} />
        ) : null}
      </AnimatePresence>
    </FocusBubbleContext.Provider>
  );
}
