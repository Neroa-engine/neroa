"use client";

import { useEffect, useState } from "react";
import type { NaruaMessage } from "@/lib/narua/planning";
import type { VoiceInputState } from "@/components/narua/VoiceInputButton";

type UseNaruaThreadArgs = {
  storageKey: string;
  initialMessage: string;
  buildReply: (message: string, messages: NaruaMessage[]) => string;
  idleMessage?: string;
  contextTitle?: string | null;
};

type PersistedNaruaThread = {
  version: 1;
  messages: NaruaMessage[];
  draft: string;
  updatedAt: string;
  contextTitle: string | null;
};

function safeParse(value: string | null): PersistedNaruaThread | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<PersistedNaruaThread> | null;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (
      !Array.isArray(parsed.messages) ||
      typeof parsed.draft !== "string" ||
      ("updatedAt" in parsed && typeof parsed.updatedAt !== "string")
    ) {
      return null;
    }

    return {
      version: 1,
      messages: parsed.messages,
      draft: parsed.draft,
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
      contextTitle:
        "contextTitle" in parsed && typeof parsed.contextTitle === "string"
          ? parsed.contextTitle
          : null
    };
  } catch {
    return null;
  }
}

export function useNaruaThread({
  storageKey,
  initialMessage,
  buildReply,
  idleMessage = "Type or speak to Neroa naturally",
  contextTitle = null
}: UseNaruaThreadArgs) {
  const [messages, setMessages] = useState<NaruaMessage[]>([
    {
      id: "narua-welcome",
      role: "narua",
      content: initialMessage
    }
  ]);
  const [draft, setDraft] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceInputState>("idle");
  const [voiceMessage, setVoiceMessage] = useState(idleMessage);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = safeParse(window.localStorage.getItem(storageKey));

    if (saved) {
      setMessages(saved.messages);
      setDraft(saved.draft);
      setUpdatedAt(saved.updatedAt);
    } else {
      setMessages([
        {
          id: "narua-welcome",
          role: "narua",
          content: initialMessage
        }
      ]);
      setDraft("");
      setUpdatedAt(null);
    }

    setHasLoaded(true);
  }, [initialMessage, storageKey]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    const snapshot: PersistedNaruaThread = {
      version: 1,
      messages,
      draft,
      updatedAt: new Date().toISOString(),
      contextTitle
    };

    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
    setUpdatedAt(snapshot.updatedAt);
  }, [contextTitle, draft, hasLoaded, messages, storageKey]);

  function handleSend(valueOverride?: string) {
    const value = (valueOverride ?? draft).trim();

    if (!value) {
      return;
    }

    const userMessage: NaruaMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: value
    };
    const nextMessagesBase = [...messages, userMessage];
    const replyMessage: NaruaMessage = {
      id: `narua-${Date.now() + 1}`,
      role: "narua",
      content: buildReply(value, nextMessagesBase)
    };

    setMessages([...nextMessagesBase, replyMessage]);
    setDraft("");
  }

  function handleVoiceTranscript(transcript: string) {
    setDraft(transcript);
  }

  function handleVoiceStatusChange(state: VoiceInputState, message: string) {
    setVoiceState(state);
    setVoiceMessage(message);
  }

  const messageCount = messages.length;
  const hasStarted = messageCount > 1 || draft.trim().length > 0;

  return {
    messages,
    draft,
    setDraft,
    handleSend,
    voiceState,
    voiceMessage,
    handleVoiceTranscript,
    handleVoiceStatusChange,
    threadMeta: {
      messageCount,
      hasStarted,
      updatedAt,
      contextTitle
    }
  };
}
