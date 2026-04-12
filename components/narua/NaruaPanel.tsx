"use client";

import { useEffect, useMemo, useState } from "react";
import AiAvatar from "@/components/workspace/ai-avatar";
import VoiceInputButton, { type VoiceInputState } from "@/components/narua/VoiceInputButton";
import type { NaruaMessage } from "@/lib/narua/planning";

type NaruaPanelSharedProps = {
  contextLabel: string;
  contextTitle: string;
  contextDescription: string;
  statusText: string;
  recommendedStack: string[];
  suggestedPrompts: string[];
  messages: NaruaMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  voiceState: VoiceInputState;
  voiceMessage: string;
  onVoiceTranscript: (transcript: string) => void;
  onVoiceStatusChange: (state: VoiceInputState, message: string) => void;
};

type ComposerInputState = "idle" | "listening" | "ready_to_send";

function feedbackTone(state: VoiceInputState) {
  if (state === "error") {
    return "text-rose-300";
  }

  if (state === "listening") {
    return "text-cyan-200";
  }

  if (state === "processing") {
    return "text-amber-200";
  }

  if (state === "transcript_ready") {
    return "text-emerald-200";
  }

  return "text-slate-400";
}

function NaruaPanelBody({
  contextLabel,
  contextTitle,
  contextDescription,
  statusText,
  recommendedStack,
  suggestedPrompts,
  messages,
  draft,
  onDraftChange,
  onSend,
  voiceState,
  voiceMessage,
  onVoiceTranscript,
  onVoiceStatusChange
}: NaruaPanelSharedProps) {
  const [stopSignal, setStopSignal] = useState(0);
  const [composerState, setComposerState] = useState<ComposerInputState>("idle");
  const [hintOverride, setHintOverride] = useState<string | null>(null);

  useEffect(() => {
    if (voiceState === "listening") {
      setComposerState("listening");
      setHintOverride(null);
      return;
    }

    if (voiceState === "transcript_ready") {
      setComposerState("ready_to_send");
      return;
    }

    if (voiceState === "processing") {
      return;
    }

    setComposerState("idle");
  }, [voiceState]);

  useEffect(() => {
    if (composerState === "ready_to_send" && !draft.trim()) {
      setComposerState("idle");
      setHintOverride(null);
    }
  }, [composerState, draft]);

  const composerHint = useMemo(() => hintOverride ?? voiceMessage, [hintOverride, voiceMessage]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (voiceState === "processing") {
      return;
    }

    if (composerState === "listening") {
      setHintOverride("Voice stopped. Press Enter again to send.");
      setStopSignal((current) => current + 1);
      return;
    }

    if (!draft.trim()) {
      return;
    }

    setHintOverride(null);
    onSend();
    setComposerState("idle");
  }

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(8,12,24,0.98),rgba(11,16,29,0.96))]">
      <div className="border-b border-white/8 px-6 py-6">
        <div className="flex items-start gap-4">
          <AiAvatar provider="chatgpt" displayName="Narua" avatarSeed="narua-core" />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white">Narua - Your AI Build Partner</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-200/70">{contextLabel}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{statusText}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">{contextTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{contextDescription}</p>
          {recommendedStack.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {recommendedStack.map((item) => (
                <span key={item} className="rounded-full bg-[#090f1d] px-3 py-2 text-[11px] text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-3">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-[24px] px-4 py-4 ${
                message.role === "narua"
                  ? "border border-white/10 bg-white/[0.04]"
                  : "bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(59,130,246,0.16),rgba(139,92,246,0.18))]"
              }`}
            >
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  message.role === "narua" ? "text-cyan-200/75" : "text-white/70"
                }`}
              >
                {message.role === "narua" ? "Narua" : "You"}
              </p>
              <p
                className={`mt-3 text-sm leading-7 ${
                  message.role === "narua" ? "text-slate-100" : "text-white"
                }`}
              >
                {message.content}
              </p>
            </article>
          ))}
        </div>

        {suggestedPrompts.length > 0 ? (
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Suggested prompts
            </p>
            <div className="mt-3 space-y-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onDraftChange(prompt)}
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm leading-6 text-slate-200 transition hover:bg-white/[0.05]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/8 px-6 py-6">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-end gap-3">
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Narua what should happen next..."
              className="input min-h-[84px] flex-1 resize-none"
            />
            <VoiceInputButton
              onTranscript={onVoiceTranscript}
              onStatusChange={onVoiceStatusChange}
              stopSignal={stopSignal}
            />
            <button
              type="button"
              onClick={onSend}
              disabled={!draft.trim() || voiceState === "processing"}
              className="button-primary h-12 px-4 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className={feedbackTone(voiceState)}>{composerHint}</span>
            <span className="text-slate-500">Narua Guidance</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NaruaDesktopPanel(props: NaruaPanelSharedProps) {
  return (
    <aside className="hidden w-[460px] shrink-0 border-l border-white/8 xl:block 2xl:w-[520px]">
      <NaruaPanelBody {...props} />
    </aside>
  );
}

export function NaruaMobileDrawer(props: NaruaPanelSharedProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="xl:hidden">
        <button type="button" onClick={() => setIsOpen(true)} className="button-secondary">
          Narua Guidance
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[8] bg-black/60 xl:hidden">
          <div className="absolute inset-y-0 right-0 w-full max-w-[520px] border-l border-white/10 bg-[#060816] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <p className="text-sm font-semibold text-white">Narua Guidance</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
              >
                Close
              </button>
            </div>
            <div className="h-[calc(100%-65px)]">
              <NaruaPanelBody {...props} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
