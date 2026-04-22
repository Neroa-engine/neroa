"use client";

import { requestBrowserRuntimeCommand } from "@/lib/browser-runtime-v2/client";
import type { BrowserRuntimeV2RuntimeTarget } from "@/lib/browser-runtime-v2/runtime-target";

export type LiveViewCommandResponse = {
  ok: boolean;
  error?: string | null;
  target?: {
    tabId: number;
    url: string;
    title: string | null;
    updatedAt: string;
  } | null;
};

export type LiveViewCommandConnectionOverride = {
  sessionId: string;
  token: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  bridgeOrigin: string;
  allowedOrigins: string[];
  runtimeTarget: BrowserRuntimeV2RuntimeTarget;
};

export function requestLiveViewCommand(command: {
  type: "run-explicit-inspection";
  connectionOverride?: LiveViewCommandConnectionOverride | null;
}) {
  return requestBrowserRuntimeCommand({
    action: "inspect.run",
    surface: "live_view",
    connectionOverride: command.connectionOverride ?? null
  }).then((result) => ({
    ok: result.ok,
    error: result.error ?? null,
    target: result.target ?? null
  }));
}
