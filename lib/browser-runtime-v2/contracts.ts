import type { BrowserRuntimeV2RuntimeTarget } from "@/lib/browser-runtime-v2/runtime-target";

export const browserRuntimeV2ActionValues = [
  "open-browser",
  "inspect.run",
  "record.start",
  "record.stop",
  "ai-walkthrough.start",
  "ai-walkthrough.step",
  "sop-output.generate"
] as const;

export type BrowserRuntimeV2Action = (typeof browserRuntimeV2ActionValues)[number];

export type BrowserRuntimeV2Surface =
  | "command_center"
  | "live_view"
  | "sidepanel"
  | "service_worker"
  | "content_script";

export type BrowserRuntimeV2CommandConnection = {
  sessionId: string;
  token: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  bridgeOrigin: string;
  allowedOrigins: string[];
  runtimeTarget: BrowserRuntimeV2RuntimeTarget;
};

export type BrowserRuntimeV2Target = {
  tabId: number;
  windowId: number | null;
  url: string;
  title: string | null;
  updatedAt: string;
};

export type BrowserRuntimeV2RecordingStatus =
  | "idle"
  | "capturing"
  | "processing"
  | "ready"
  | "failed";

export type BrowserRuntimeV2WalkthroughStatus =
  | "idle"
  | "running"
  | "ready"
  | "failed";

export type BrowserRuntimeV2SopStatus = "idle" | "ready" | "failed";

export type BrowserRuntimeV2RecordingState = {
  status: BrowserRuntimeV2RecordingStatus;
  recordingId: string | null;
  linkedReportId: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  summary: string | null;
  storagePath: string | null;
  durationMs: number | null;
  statusReason: string | null;
};

export type BrowserRuntimeV2WalkthroughState = {
  status: BrowserRuntimeV2WalkthroughStatus;
  outputId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  targetUrl: string | null;
  summary: string | null;
  nextActionLabel: string | null;
  lastExecutionMode: "scan" | "focus-next" | "activate-focused" | null;
  statusReason: string | null;
};

export type BrowserRuntimeV2SopOutputState = {
  status: BrowserRuntimeV2SopStatus;
  outputId: string | null;
  generatedAt: string | null;
  summary: string | null;
  statusReason: string | null;
};

export type BrowserRuntimeV2SessionState = {
  version: 2;
  runtimeTarget: BrowserRuntimeV2RuntimeTarget | null;
  currentTarget: BrowserRuntimeV2Target | null;
  lastCommandAt: string | null;
  lastCommandAction: BrowserRuntimeV2Action | null;
  lastCommandError: string | null;
  recording: BrowserRuntimeV2RecordingState;
  walkthrough: BrowserRuntimeV2WalkthroughState;
  sopOutput: BrowserRuntimeV2SopOutputState;
};

export function createEmptyBrowserRuntimeV2SessionState(): BrowserRuntimeV2SessionState {
  return {
    version: 2,
    runtimeTarget: null,
    currentTarget: null,
    lastCommandAt: null,
    lastCommandAction: null,
    lastCommandError: null,
    recording: {
      status: "idle",
      recordingId: null,
      linkedReportId: null,
      startedAt: null,
      stoppedAt: null,
      summary: null,
      storagePath: null,
      durationMs: null,
      statusReason: null
    },
    walkthrough: {
      status: "idle",
      outputId: null,
      startedAt: null,
      completedAt: null,
      targetUrl: null,
      summary: null,
      nextActionLabel: null,
      lastExecutionMode: null,
      statusReason: null
    },
    sopOutput: {
      status: "idle",
      outputId: null,
      generatedAt: null,
      summary: null,
      statusReason: null
    }
  };
}

export type BrowserRuntimeV2ActionRegistryItem = {
  action: BrowserRuntimeV2Action;
  label: string;
  description: string;
  requiredConnection: boolean;
};

export const browserRuntimeV2ActionRegistry: Record<
  BrowserRuntimeV2Action,
  BrowserRuntimeV2ActionRegistryItem
> = {
  "open-browser": {
    action: "open-browser",
    label: "Open Browser",
    description:
      "Open the tokenized Live View route in the same real browser context for this session.",
    requiredConnection: false
  },
  "inspect.run": {
    action: "inspect.run",
    label: "Run explicit inspection",
      description:
      "Promote a fresh explicit inspection against the current supported runtime target.",
    requiredConnection: true
  },
  "record.start": {
    action: "record.start",
    label: "Start recording",
      description:
      "Start the truthful recording foundation for the current runtime target and attach metadata to the project library.",
    requiredConnection: true
  },
  "record.stop": {
    action: "record.stop",
    label: "Stop recording",
    description:
      "Stop the current recording foundation run and finalize truthful metadata for the project library.",
    requiredConnection: true
  },
  "ai-walkthrough.start": {
    action: "ai-walkthrough.start",
    label: "Run AI walkthrough",
    description:
      "Capture current page understanding and a bounded walkthrough/testing plan without pretending full autonomous execution.",
    requiredConnection: true
  },
  "ai-walkthrough.step": {
    action: "ai-walkthrough.step",
    label: "Advance walkthrough step",
    description:
      "Run one bounded walkthrough step using deterministic focus/activation behavior.",
    requiredConnection: true
  },
  "sop-output.generate": {
    action: "sop-output.generate",
    label: "Generate SOP output",
    description:
      "Write a structured SOP/result artifact from current inspection, recording, and walkthrough truth.",
    requiredConnection: true
  }
};

export type BrowserRuntimeV2CommandPayloadMap = {
  "open-browser": {
    launchAt: string;
  };
  "inspect.run": Record<string, never>;
  "record.start": Record<string, never>;
  "record.stop": Record<string, never>;
  "ai-walkthrough.start": {
    intent?: string | null;
  };
  "ai-walkthrough.step": {
    mode?: "scan" | "focus-next" | "activate-focused";
  };
  "sop-output.generate": {
    source?: "inspection" | "recording" | "walkthrough";
  };
};

export type BrowserRuntimeV2Command<TAction extends BrowserRuntimeV2Action = BrowserRuntimeV2Action> = {
  action: TAction;
  connectionOverride?: BrowserRuntimeV2CommandConnection | null;
  payload?: BrowserRuntimeV2CommandPayloadMap[TAction];
  surface?: BrowserRuntimeV2Surface;
};

export type BrowserRuntimeV2OutputKind =
  | "inspection_result"
  | "recording_result"
  | "ai_walkthrough_result"
  | "sop_result";

export type BrowserRuntimeV2OutputSummary = {
  id: string;
  kind: BrowserRuntimeV2OutputKind;
  title: string;
  summary: string;
  createdAt: string;
  pageUrl: string | null;
  runtimeTargetLabel: string | null;
  runtimeTargetOrigin: string | null;
};

export type BrowserRuntimeV2CommandResponse = {
  ok: boolean;
  action: BrowserRuntimeV2Action;
  error?: string | null;
  target?: BrowserRuntimeV2Target | null;
  state?: BrowserRuntimeV2SessionState | null;
  output?: BrowserRuntimeV2OutputSummary | null;
  notice?: string | null;
};
