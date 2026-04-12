"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import NaruaPlan from "@/components/narua/NaruaPlan";
import VoiceInputButton, { type VoiceInputState } from "@/components/narua/VoiceInputButton";
import type {
  GeneratedPlan as PlanOutput,
  NaruaMessage,
  ReviewAction
} from "@/lib/narua/planning";

type NaruaChatProps = {
  messages: NaruaMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  generatedPlan: PlanOutput | null;
  onPlanAction: (action: ReviewAction) => void;
  voiceState: VoiceInputState;
  voiceMessage: string;
  onVoiceTranscript: (transcript: string) => void;
  onVoiceStatusChange: (state: VoiceInputState, message: string) => void;
  afterPlan?: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  helperText?: string;
  composerPlaceholder?: string;
  isProcessing?: boolean;
  suggestedPrompts?: string[];
  onSuggestedPromptSelect?: (value: string) => void;
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

export default function NaruaChat({
  messages,
  draft,
  onDraftChange,
  onSend,
  generatedPlan,
  onPlanAction,
  voiceState,
  voiceMessage,
  onVoiceTranscript,
  onVoiceStatusChange,
  afterPlan,
  eyebrow = "Narua Intake",
  title = "Tell Narua what you want to build",
  description = "Start naturally. Narua will ask only the minimum useful follow-up questions, then assemble the first plan automatically.",
  helperText = "Tap the mic and speak naturally. Press Send when ready.",
  composerPlaceholder = "Describe what you want to build...",
  isProcessing = false,
  suggestedPrompts,
  onSuggestedPromptSelect
}: NaruaChatProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const [stopSignal, setStopSignal] = useState(0);
  const [composerState, setComposerState] = useState<ComposerInputState>("idle");
  const [hintOverride, setHintOverride] = useState<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [generatedPlan, messages]);

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

  const composerHint = useMemo(() => {
    if (hintOverride) {
      return hintOverride;
    }

    return voiceMessage;
  }, [hintOverride, voiceMessage]);

  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (isProcessing || voiceState === "processing") {
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
    <div className="surface-subtle flex min-h-[760px] flex-col overflow-hidden">
      <div className="border-b border-white/8 px-6 py-6 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">{description}</p>

        {suggestedPrompts && suggestedPrompts.length > 0 && onSuggestedPromptSelect ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSuggestedPromptSelect(prompt)}
                disabled={isProcessing}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-4">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`max-w-[60rem] rounded-[28px] px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${
                message.role === "narua"
                  ? "mr-auto border border-white/10 bg-white/[0.04]"
                  : "ml-auto bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(59,130,246,0.16),rgba(139,92,246,0.18))]"
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
                className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${
                  message.role === "narua" ? "text-slate-100" : "text-white"
                }`}
              >
                {message.content}
              </p>
            </article>
          ))}

          {generatedPlan ? <NaruaPlan plan={generatedPlan} onAction={onPlanAction} /> : null}
          {generatedPlan ? afterPlan : null}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-white/8 px-6 py-5 sm:px-8">
        <div className="mx-auto w-full max-w-[88rem]">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,26,0.98),rgba(12,17,32,0.94))] p-4">
            <div className="flex items-end gap-3">
              <div className="flex h-12 w-12 items-center justify-center">
                <VoiceInputButton
                  onTranscript={onVoiceTranscript}
                  onStatusChange={onVoiceStatusChange}
                  stopSignal={stopSignal}
                  disabled={isProcessing}
                />
              </div>

              <textarea
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder={composerPlaceholder}
                disabled={isProcessing}
                className="input min-h-[92px] flex-1 resize-none"
              />

              <button
                type="button"
                onClick={onSend}
                disabled={!draft.trim() || voiceState === "processing" || isProcessing}
                className="button-primary h-12 px-5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isProcessing ? "Thinking..." : "Send"}
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
              <span className={feedbackTone(voiceState)}>{composerHint}</span>
              <span className="text-slate-500">{helperText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
