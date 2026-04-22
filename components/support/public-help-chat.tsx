"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { PublicActionLink } from "@/components/site/public-action-link";
import {
  answerPublicHelpQuestion,
  getPublicHelpContext,
  publicSupportLinks,
  type PublicQuickLink
} from "@/lib/data/public-help";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  quickLinks?: PublicQuickLink[];
};

const defaultStarterQuestions = [
  "What is NEROA?",
  "What does Neroa do?",
  "Which plan is right for me?",
  "How do I get started?",
  "Which use case should I start with?",
  "How do I get support?",
  "What should I do next?"
];

function buildId(prefix: "assistant" | "user") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function dedupeQuestions(values: string[]) {
  return Array.from(
    new Map(values.map((value) => [value.toLowerCase(), value])).values()
  );
}

function HelpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 10.2C8 8.4 9.56 7 11.7 7C13.64 7 15 8.24 15 9.92C15 11.14 14.38 11.86 13.26 12.58C12.1 13.34 11.78 13.88 11.78 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11.8" cy="17.5" r="1" fill="currentColor" />
      <path
        d="M12 3.5C7.3 3.5 3.5 7.3 3.5 12C3.5 13.72 4.02 15.32 4.9 16.64L4.3 20.5L8.16 19.9C9.48 20.78 11.08 21.3 12.8 21.3C17.5 21.3 21.3 17.5 21.3 12.8C21.3 8.1 17.5 4.3 12.8 4.3H12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-[18px] w-[18px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 12.25A2.75 2.75 0 0 0 12.75 9.5V5.75A2.75 2.75 0 1 0 7.25 5.75V9.5A2.75 2.75 0 0 0 10 12.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.75 9.75A4.25 4.25 0 0 0 14.25 9.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 12.75V16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.5 16.25H12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 5.5V10H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.26 9.2A5.75 5.75 0 1 0 7.27 4.94"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-[18px] w-[18px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.75 10.2L16.25 4.5L11.4 15.9L9.25 10.95L3.75 10.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildAssistantIntro(pathname: string): ChatMessage {
  const context = getPublicHelpContext(pathname);

  return {
    id: `assistant-${context.id}`,
    role: "assistant",
    content: context.intro,
    quickLinks: context.quickLinks
  };
}

export function PublicHelpChat() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const context = useMemo(() => getPublicHelpContext(pathname), [pathname]);
  const starterQuestions = useMemo(
    () => dedupeQuestions([...defaultStarterQuestions, ...context.suggestions]).slice(0, 7),
    [context.suggestions]
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([buildAssistantIntro(pathname)]);
  const [micHint, setMicHint] = useState(
    "Use this guide for page help, pricing questions, next-step routing, and support."
  );
  const threadRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setMessages([buildAssistantIntro(pathname)]);
    setDraft("");
    setMicHint("Use this guide for page help, pricing questions, next-step routing, and support.");
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get("help") === "open" || params.get("chat") === "open") {
      setOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open || !threadRef.current) {
      return;
    }

    const behavior = prefersReducedMotion ? "auto" : "smooth";
    threadRef.current.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior
    });
  }, [messages, open, prefersReducedMotion]);

  function resetConversation() {
    setMessages([buildAssistantIntro(pathname)]);
    setDraft("");
    setMicHint("Use this guide for page help, pricing questions, next-step routing, and support.");
    window.setTimeout(() => inputRef.current?.focus(), 60);
  }

  function pushQuestion(question: string) {
    const trimmed = question.trim();

    if (!trimmed) {
      return;
    }

    const answer = answerPublicHelpQuestion(trimmed, pathname);

    setMessages((current) => [
      ...current,
      {
        id: buildId("user"),
        role: "user",
        content: trimmed
      },
      {
        id: buildId("assistant"),
        role: "assistant",
        content: answer.message,
        quickLinks: answer.quickLinks
      }
    ]);
    setDraft("");
    setMicHint("Ask a follow-up, choose a quick prompt, or open one of the suggested links.");
  }

  function handleMicClick() {
    setMicHint(
      "Voice input for the public guide is being finalized. For now, type your question here and I'll route you to the right public page."
    );
    inputRef.current?.focus();
  }

  const hasConversation = messages.length > 1;
  const visibleSuggestions = hasConversation ? starterQuestions.slice(0, 4) : starterQuestions;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[110] flex items-center justify-end">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close NEROA site help" : "Open NEROA site help"}
          className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/22 bg-[linear-gradient(135deg,rgba(34,211,238,0.92),rgba(59,130,246,0.92),rgba(139,92,246,0.9))] text-white shadow-[0_24px_60px_rgba(59,130,246,0.25)] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: [1, 1.06, 1]
                  }
            }
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <HelpIcon />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-[111] w-[min(94vw,520px)]"
          >
            <div className="floating-plane relative overflow-hidden rounded-[34px]">
              <div className="floating-wash rounded-[34px]" />

              <div className="relative flex h-[min(76vh,700px)] min-h-[560px] flex-col p-4 sm:p-5">
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/70 pb-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      Ask Neroa
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{context.title}</p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Public-site help for pricing, Neroa, use cases, support, and next steps.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={resetConversation}
                      className="button-quiet inline-flex h-10 w-10 items-center justify-center rounded-full px-0 py-0 text-slate-500"
                      aria-label="Reset help conversation"
                      title="Reset conversation"
                    >
                      <ResetIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="button-quiet px-3 py-2 text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {!hasConversation ? (
                  <div className="mt-4 shrink-0 rounded-[24px] border border-slate-200/70 bg-white/74 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-950">
                      Start with a quick question or choose one of the prompts below.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      I can explain the page you are on, compare plans, point you to the right public route, and help you decide what to do next.
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-[26px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.68))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                  <div
                    ref={threadRef}
                    className="thin-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5"
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[88%] break-words whitespace-pre-wrap rounded-[24px] px-4 py-3.5 text-sm leading-7 ${
                            message.role === "assistant"
                              ? "border border-slate-200/75 bg-white/92 text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                              : "bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(139,92,246,0.14))] text-slate-700 shadow-[0_12px_28px_rgba(59,130,246,0.08)]"
                          }`}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {message.role === "assistant" ? "Neroa guide" : "You"}
                          </p>
                          <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-7 text-inherit">
                            {message.content}
                          </p>

                          {message.quickLinks?.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.quickLinks.map((link) => (
                                <PublicActionLink
                                  key={`${message.id}-${link.href}`}
                                  href={link.href}
                                  label={link.label}
                                  className="rounded-full border border-slate-200/75 bg-slate-50/85 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700 transition hover:border-cyan-300/45 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 shrink-0 rounded-[24px] border border-slate-200/70 bg-white/72 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {hasConversation ? "Quick follow-ups" : "Suggested prompts"}
                    </p>
                    <span className="text-xs text-slate-400">Tap to ask instantly</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {visibleSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => pushQuestion(suggestion)}
                        className="rounded-full border border-slate-200/75 bg-white/88 px-3 py-2 text-sm text-slate-600 transition hover:border-cyan-300/35 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    pushQuestion(draft);
                  }}
                  className="mt-4 shrink-0 rounded-[26px] border border-slate-200/75 bg-white/82 p-3 shadow-[0_12px_36px_rgba(15,23,42,0.06)]"
                >
                  <label htmlFor="public-help-input" className="sr-only">
                    Ask for public-site help
                  </label>

                  <div className="flex items-end gap-3">
                    <textarea
                      ref={inputRef}
                      id="public-help-input"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      className="input min-h-[92px] flex-1 resize-none border-0 bg-transparent px-0 py-0 shadow-none focus:border-0 focus:bg-transparent focus:shadow-none"
                      placeholder="Ask about pricing, Neroa, support, build paths, or what page to visit next."
                    />

                    <div className="flex shrink-0 items-center gap-2 pb-1">
                      <button
                        type="button"
                        onClick={handleMicClick}
                        aria-label="Start voice input"
                        title="Start voice input"
                        className="button-ghost inline-flex h-11 w-11 items-center justify-center rounded-full px-0 py-0 text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45"
                      >
                        <MicIcon />
                      </button>

                      <button
                        type="submit"
                        className="button-primary inline-flex h-11 items-center gap-2 whitespace-nowrap px-4 py-0"
                        disabled={!draft.trim()}
                      >
                        <SendIcon />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-3">
                    <p className="text-sm leading-6 text-slate-500">{micHint}</p>
                    <div className="flex flex-wrap gap-3">
                      {publicSupportLinks.map((link) => (
                        <PublicActionLink
                          key={link.href}
                          href={link.href}
                          label={link.label}
                          className="text-sm font-medium text-cyan-700 transition hover:text-cyan-800"
                        />
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
