"use client";

import { type KeyboardEvent, useEffect, useMemo, useState } from "react";
import AgentAvatar from "@/components/ai/AgentAvatar";
import NaruaComposerPresence from "@/components/narua/NaruaComposerPresence";
import AiAvatar from "@/components/workspace/ai-avatar";
import VoiceInputButton, { type VoiceInputState } from "@/components/narua/VoiceInputButton";
import type { CollaborationAgent } from "@/lib/ai/collaboration";
import { AGENTS } from "@/lib/ai/agents";
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
  onSend: (valueOverride?: string) => void;
  voiceState: VoiceInputState;
  voiceMessage: string;
  onVoiceTranscript: (transcript: string) => void;
  onVoiceStatusChange: (state: VoiceInputState, message: string) => void;
  isProcessing?: boolean;
  collaboration?: CollaborationAgent[];
  nextMove?: string | null;
  errorText?: string | null;
  threadMeta?: {
    messageCount: number;
    hasStarted: boolean;
    updatedAt: string | null;
    contextTitle: string | null;
  };
};

type ComposerInputState = "idle" | "listening" | "ready_to_send";

function feedbackTone(state: VoiceInputState) {
  if (state === "error") {
    return "text-rose-600";
  }

  if (state === "listening") {
    return "text-cyan-700";
  }

  if (state === "processing") {
    return "text-amber-700";
  }

  if (state === "transcript_ready") {
    return "text-emerald-700";
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
  onVoiceStatusChange,
  isProcessing = false,
  collaboration = [],
  nextMove,
  errorText,
  threadMeta
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

    if (voiceState === "processing" || isProcessing) {
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

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
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
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,249,255,0.9))]">
      <div className="border-b border-slate-200/70 px-6 py-6">
        <div className="flex items-start gap-4">
          <AiAvatar provider="chatgpt" displayName="Naroa" avatarSeed="narua-core" />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-slate-950">Naroa - Your AI Build Partner</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-700">{contextLabel}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{statusText}</p>
          </div>
        </div>

        <div className="floating-plane mt-5 rounded-[26px] p-4">
          <p className="text-sm font-semibold text-slate-950">{contextTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{contextDescription}</p>
          {recommendedStack.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {recommendedStack.map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-[11px] text-slate-600">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="floating-plane mt-4 rounded-[26px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Current focus
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-950">
            {isProcessing
              ? `Naroa is generating the next ${threadMeta?.contextTitle ?? contextTitle} output.`
              : nextMove
                ? "Next recommended move"
                : threadMeta?.hasStarted
                  ? `Latest output in ${threadMeta.contextTitle ?? contextTitle}`
                  : `Ready to generate the first ${threadMeta?.contextTitle ?? contextTitle} output`}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isProcessing
              ? "Naroa is updating the lane thread and center engine right now."
              : nextMove ||
                "Keep this lane narrow until the next decision is clear, then widen into the next lane only when it unblocks execution."}
          </p>
        </div>
      </div>

      <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-3">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-[24px] px-4 py-4 ${
                message.role === "narua"
                  ? "floating-plane"
                  : "bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(96,165,250,0.14),rgba(139,92,246,0.12))] shadow-[0_24px_60px_rgba(56,189,248,0.08)]"
              }`}
            >
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  message.role === "narua" ? "text-cyan-700" : "text-slate-500"
                }`}
              >
                {message.role === "narua" ? "Naroa" : "You"}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{message.content}</p>
            </article>
          ))}
        </div>

        {errorText ? (
          <div className="mt-5 rounded-[22px] border border-rose-300/45 bg-rose-50/85 px-4 py-4 text-sm leading-6 text-rose-700">
            {errorText}
          </div>
        ) : null}

        {collaboration.length > 0 ? (
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Active AI stack
            </p>
            <div className="mt-3 space-y-2">
              {collaboration.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-[22px] border border-slate-200 bg-white/75 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <AgentAvatar id={agent.id} size={54} showLabel={false} active={agent.active} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-950">
                          {AGENTS[agent.id].name}
                        </p>
                        <span className="rounded-full border border-slate-200 bg-white/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                          {agent.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                        {agent.roleLabel}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{agent.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

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
                  onClick={() => onSend(prompt)}
                  className="micro-glow w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left text-sm leading-6 text-slate-600 transition hover:bg-white/85"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200/70 px-6 py-6">
        <NaruaComposerPresence
          title="Naroa"
          subtitle="Guidance active in this lane"
          speaking={voiceState === "listening"}
          className="mb-3"
        />

        <div className="floating-plane rounded-[28px] p-3">
          <div className="flex items-end gap-3">
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Naroa what should happen next..."
              disabled={isProcessing}
              className="input min-h-[84px] flex-1 resize-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <VoiceInputButton
              onTranscript={onVoiceTranscript}
              onStatusChange={onVoiceStatusChange}
              stopSignal={stopSignal}
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={() => onSend()}
              disabled={!draft.trim() || voiceState === "processing" || isProcessing}
              className="button-primary h-12 px-4 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isProcessing ? "Thinking..." : "Send"}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className={feedbackTone(voiceState)}>{composerHint}</span>
            <span className="text-slate-500">Naroa Guidance</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NaruaDesktopPanel(props: NaruaPanelSharedProps) {
  return (
    <aside className="hidden w-[460px] shrink-0 border-l border-slate-200/70 xl:block 2xl:w-[520px]">
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
          Naroa Guidance
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[8] bg-slate-900/18 backdrop-blur-sm xl:hidden">
          <div className="absolute inset-y-0 right-0 w-full max-w-[520px] border-l border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,249,255,0.94))] shadow-[0_32px_120px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
              <p className="text-sm font-semibold text-slate-950">Naroa Guidance</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-600"
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
