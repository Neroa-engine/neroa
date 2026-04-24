"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { VoiceInputState } from "@/components/narua/VoiceInputButton";
import { getLaneAiCollaboration, type CollaborationAgent } from "@/lib/ai/collaboration";
import type { NaruaMessage } from "@/lib/narua/planning";
import {
  buildLaneWorkspaceStorageValue,
  createLaneWorkspaceWelcome,
  getLaneWorkspaceSuggestedPrompts,
  parseLaneWorkspaceSnapshot,
  runLaneWorkspacePrompt,
  type LaneWorkspaceOutputs,
  type LaneWorkspaceSnapshot
} from "@/lib/workspace/lane-engine";
import {
  parseLaneConversationSnapshot,
  type ProjectLaneRecord,
  type ProjectRecord
} from "@/lib/workspace/project-lanes";

type LaneWorkspaceEngineContextValue = {
  lane: ProjectLaneRecord;
  project: ProjectRecord;
  messages: NaruaMessage[];
  draft: string;
  outputs: LaneWorkspaceOutputs | null;
  suggestedPrompts: string[];
  collaboration: CollaborationAgent[];
  isProcessing: boolean;
  error: string | null;
  voiceState: VoiceInputState;
  voiceMessage: string;
  threadMeta: {
    messageCount: number;
    hasStarted: boolean;
    updatedAt: string | null;
    contextTitle: string | null;
  };
  statusText: string;
  nextMove: string | null;
  setDraft: (value: string) => void;
  handleSend: (valueOverride?: string) => void;
  handlePrompt: (prompt: string) => void;
  handleVoiceTranscript: (transcript: string) => void;
  handleVoiceStatusChange: (state: VoiceInputState, message: string) => void;
};

type LaneWorkspaceEngineProviderProps = {
  storageKey: string;
  project: ProjectRecord;
  lane: ProjectLaneRecord;
  children: ReactNode;
};

const LaneWorkspaceEngineContext = createContext<LaneWorkspaceEngineContextValue | null>(null);

function createMessage(role: NaruaMessage["role"], content: string): NaruaMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content
  };
}

function idleVoiceMessage() {
  return "Click a prompt or type the next deliverable you want Neroa to build.";
}

function statusTextForLane(args: {
  lane: ProjectLaneRecord;
  isProcessing: boolean;
  outputs: LaneWorkspaceOutputs | null;
}) {
  if (args.isProcessing) {
    return `Neroa is generating the next ${args.lane.title.toLowerCase()} output now.`;
  }

  if (args.outputs) {
    return args.outputs.summary;
  }

  return `Neroa is ready to build the first ${args.lane.title.toLowerCase()} deliverable for this engine.`;
}

function migrateLegacySnapshot(args: {
  storageKey: string;
  project: ProjectRecord;
  lane: ProjectLaneRecord;
}) {
  const raw = window.localStorage.getItem(args.storageKey);
  const parsed = parseLaneWorkspaceSnapshot(raw);

  if (parsed) {
    return parsed;
  }

  const legacy = parseLaneConversationSnapshot(raw);

  if (!legacy) {
    return createLaneWorkspaceWelcome(args.project, args.lane);
  }

  const fresh = createLaneWorkspaceWelcome(args.project, args.lane);

  return {
    ...fresh,
    messages: legacy.messages.length > 0 ? legacy.messages : fresh.messages,
    draft: legacy.draft,
    updatedAt: legacy.updatedAt
  } satisfies LaneWorkspaceSnapshot;
}

export function LaneWorkspaceEngineProvider({
  storageKey,
  project,
  lane,
  children
}: LaneWorkspaceEngineProviderProps) {
  const initialSnapshot = useMemo(() => createLaneWorkspaceWelcome(project, lane), [lane, project]);
  const [snapshot, setSnapshot] = useState<LaneWorkspaceSnapshot>(initialSnapshot);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceInputState>("idle");
  const [voiceMessage, setVoiceMessage] = useState(idleVoiceMessage());

  useEffect(() => {
    const nextSnapshot = migrateLegacySnapshot({
      storageKey,
      project,
      lane
    });

    setSnapshot(nextSnapshot);
    setError(null);
    setIsProcessing(false);
    setVoiceState("idle");
    setVoiceMessage(idleVoiceMessage());
    setHasLoaded(true);
  }, [initialSnapshot, lane, project, storageKey]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem(storageKey, buildLaneWorkspaceStorageValue(snapshot));
  }, [hasLoaded, snapshot, storageKey]);

  const collaboration = useMemo(
    () => snapshot.outputs?.collaboration ?? getLaneAiCollaboration(lane),
    [lane, snapshot.outputs]
  );
  const suggestedPrompts = useMemo(() => getLaneWorkspaceSuggestedPrompts(lane), [lane]);

  const setDraft = useCallback((value: string) => {
    setSnapshot((current) => ({
      ...current,
      draft: value
    }));
  }, []);

  const handleSend = useCallback(
    (valueOverride?: string) => {
      const rawValue = valueOverride ?? snapshot.draft;
      const value = rawValue.trim();

      if (!value || isProcessing) {
        return;
      }

      const result = runLaneWorkspacePrompt({
        project,
        lane,
        snapshot,
        prompt: value
      });

      setError(null);
      setIsProcessing(true);
      setSnapshot((current) => ({
        ...current,
        draft: "",
        updatedAt: new Date().toISOString(),
        lastPrompt: value,
        messages: [
          ...current.messages,
          createMessage("user", value),
          createMessage("narua", result.acknowledgement)
        ]
      }));

      window.setTimeout(() => {
        try {
          setSnapshot((current) => ({
            ...current,
            updatedAt: new Date().toISOString(),
            contextTitle: lane.title,
            outputs: result.outputs,
            lastPrompt: value,
            messages: [...current.messages, createMessage("narua", result.reply)]
          }));
        } catch (processingError) {
          console.error("LANE_WORKSPACE_ENGINE_ERROR", processingError);
          setError(
            `Neroa hit an issue while updating ${lane.title}. Your thread is still preserved, so try the prompt again.`
          );
        } finally {
          setIsProcessing(false);
        }
      }, 480);
    },
    [isProcessing, lane, project, snapshot]
  );

  const handlePrompt = useCallback(
    (prompt: string) => {
      handleSend(prompt);
    },
    [handleSend]
  );

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setDraft(transcript);
  }, [setDraft]);

  const handleVoiceStatusChange = useCallback((state: VoiceInputState, message: string) => {
    setVoiceState(state);
    setVoiceMessage(message);
  }, []);

  const messageCount = snapshot.messages.length;
  const hasStarted = Boolean(snapshot.outputs) || messageCount > 1 || snapshot.draft.trim().length > 0;

  const contextValue = useMemo(
    () => ({
      lane,
      project,
      messages: snapshot.messages,
      draft: snapshot.draft,
      outputs: snapshot.outputs,
      suggestedPrompts,
      collaboration,
      isProcessing,
      error,
      voiceState,
      voiceMessage,
      threadMeta: {
        messageCount,
        hasStarted,
        updatedAt: snapshot.updatedAt,
        contextTitle: snapshot.contextTitle
      },
      statusText: statusTextForLane({
        lane,
        isProcessing,
        outputs: snapshot.outputs
      }),
      nextMove: snapshot.outputs?.nextMove ?? null,
      setDraft,
      handleSend,
      handlePrompt,
      handleVoiceTranscript,
      handleVoiceStatusChange
    } satisfies LaneWorkspaceEngineContextValue),
    [
      collaboration,
      error,
      handlePrompt,
      handleSend,
      handleVoiceStatusChange,
      handleVoiceTranscript,
      hasStarted,
      isProcessing,
      lane,
      messageCount,
      project,
      setDraft,
      snapshot.draft,
      snapshot.messages,
      snapshot.outputs,
      snapshot.updatedAt,
      snapshot.contextTitle,
      suggestedPrompts,
      voiceMessage,
      voiceState
    ]
  );

  return (
    <LaneWorkspaceEngineContext.Provider value={contextValue}>
      {children}
    </LaneWorkspaceEngineContext.Provider>
  );
}

export function useLaneWorkspaceEngine() {
  const context = useContext(LaneWorkspaceEngineContext);

  if (!context) {
    throw new Error("useLaneWorkspaceEngine must be used inside LaneWorkspaceEngineProvider.");
  }

  return context;
}
