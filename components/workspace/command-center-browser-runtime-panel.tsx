"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LiveViewSession } from "@/lib/live-view/types";
import {
  requestBrowserRuntimeCommand
} from "@/lib/browser-runtime-v2/client";
import type {
  BrowserRuntimeV2Action,
  BrowserRuntimeV2Command,
  BrowserRuntimeV2CommandConnection
} from "@/lib/browser-runtime-v2/contracts";
import { resolveBrowserRuntimeV2RuntimeTarget } from "@/lib/browser-runtime-v2/runtime-target";
import {
  buildBrowserRuntimeErrorSnapshot,
  buildBrowserRuntimeBridgeSnapshot,
  type BrowserRuntimeBridgeSnapshot
} from "@/lib/workspace/browser-runtime-bridge";
import type { CommandCenterBrowserPanel } from "@/lib/workspace/command-center-summary";
import { CommandCenterPanel, CommandCenterSourceBadge } from "@/components/workspace/command-center-ui";
import { CommandCenterPopoverBar } from "@/components/workspace/command-center-popover-bar";

type CommandCenterBrowserRuntimePanelProps = {
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  initialBrowserStatus: CommandCenterBrowserPanel;
  initialLiveViewSession: LiveViewSession | null;
  presentation?: "panel" | "chat";
};

function buildLaunchingState(panel: CommandCenterBrowserPanel): BrowserRuntimeBridgeSnapshot {
  return {
    state: "launching",
    liveSessionId: panel.liveSessionId,
    lastHeartbeatAt: panel.lastHeartbeatAt,
    lastSeenOrigin: panel.lastSeenOrigin,
    statusLabel: "Launching",
    detail:
      "Opening the existing Live View route in a normal browser tab inside the current browser context and attaching the current workspace session now.",
    connectionState: panel.liveSessionId
      ? `Live session ${panel.liveSessionId} is being opened in the browser.`
      : "Creating or attaching the live session now.",
    inspectionState:
      "Command Center will switch from Launching to live session status as soon as the browser route responds.",
    qcState: panel.qcState,
    ctaLabel: "Launching..."
  };
}

function buildPreviewStateDisplay(browserStatus: CommandCenterBrowserPanel) {
  const hasLiveConnection =
    browserStatus.runtimeState === "connected" || browserStatus.runtimeState === "preview_active";

  if (browserStatus.runtimeState === "preview_active") {
    return {
      label: "Active preview",
      value: browserStatus.previewStateLabel,
      detail: browserStatus.previewSessionId
        ? `Session ${browserStatus.previewSessionId}`
        : "The current connected session is driving preview state."
    };
  }

  if (browserStatus.runtimeState === "connected") {
    return {
      label: "Staged preview",
      value:
        browserStatus.previewState === "inactive"
          ? "No preview staged yet"
          : browserStatus.previewStateLabel,
      detail: browserStatus.previewSessionId
        ? `Session ${browserStatus.previewSessionId}`
        : "Live session is connected and ready for preview staging."
    };
  }

  if (browserStatus.previewSessionId) {
    return {
      label: "Previous preview",
      value:
        browserStatus.previewState === "inactive"
          ? "No active preview staged"
          : `Last known: ${browserStatus.previewStateLabel}`,
      detail: hasLiveConnection
        ? `Session ${browserStatus.previewSessionId}`
        : `Last session ${browserStatus.previewSessionId}`
    };
  }

  return {
    label: "Preview state",
    value:
      browserStatus.previewState === "inactive"
        ? "No preview staged yet"
        : browserStatus.previewStateLabel,
    detail: "Browser must connect before preview state becomes current runtime truth."
  };
}

function buildInspectionTruthDisplay(
  browserStatus: CommandCenterBrowserPanel,
  liveSession: LiveViewSession | null
) {
  if (liveSession?.inspectionState.latestExplicit) {
    if (
      browserStatus.runtimeState === "connected" ||
      browserStatus.runtimeState === "preview_active"
    ) {
      return {
        label: "Inspection truth",
        value: "Explicit inspection ready",
        detail:
          "The current session already has an explicit inspection result. Background observation stays secondary until another supported inspection run is triggered."
      };
    }

    return {
      label: "Inspection truth",
      value: "Explicit inspection ready",
      detail:
        "An explicit inspection result was captured for this session. Browser connection is still staged here, so current findings are real while the rest of the browser toolset remains gated by live runtime truth."
    };
  }

  switch (browserStatus.runtimeState) {
    case "connected":
      return {
        label: "Inspection truth",
        value: "Live inspection is current",
        detail: browserStatus.inspectionState
      };
    case "preview_active":
      return {
        label: "Inspection truth",
        value: "Live inspection shares the preview session",
        detail: browserStatus.inspectionState
      };
    case "awaiting_bind":
      return {
        label: "Inspection truth",
        value: "Waiting for the first real bind",
        detail: browserStatus.inspectionState
      };
    case "reconnect_needed":
      return {
        label: "Inspection truth",
        value: "Historical session context only",
        detail: browserStatus.inspectionState
      };
    case "session_stale":
      return {
        label: "Inspection truth",
        value: "Stale runtime context",
        detail: browserStatus.inspectionState
      };
    case "error":
      return {
        label: "Inspection truth",
        value: "Inspection paused",
        detail: browserStatus.inspectionState
      };
    default:
      return {
        label: "Inspection truth",
        value: "No live inspection yet",
        detail: browserStatus.inspectionState
      };
  }
}

function buildPendingToolDisplay(browserStatus: CommandCenterBrowserPanel) {
  if (
    browserStatus.runtimeState === "connected" ||
    browserStatus.runtimeState === "preview_active"
  ) {
    return {
      label: "Browser runtime actions",
      value: "Inspect, Record, Walkthrough, and SOP are available",
      detail:
        "The current live session now supports explicit inspection, truthful recording foundation, bounded walkthrough/testing, and SOP output. Review and QC remain staged until their producer paths are fully live."
    };
  }

  if (browserStatus.runtimeState === "awaiting_bind") {
    return {
      label: "Browser runtime actions",
      value: "Waiting for the first real bind",
      detail:
        "The browser session still needs its first real bind. Inspect traffic alone should not promote the Browser Runtime V2 actions into active operator controls."
    };
  }

  if (browserStatus.runtimeState === "reconnect_needed") {
    return {
      label: "Browser runtime actions",
      value: "Reconnect before using browser-side tools",
      detail:
        "Inspect, Record, Walkthrough, and SOP stay blocked until Browser reconnects with fresh runtime truth."
    };
  }

  if (browserStatus.runtimeState === "session_stale") {
    return {
      label: "Browser runtime actions",
      value: "Refresh the stale session first",
      detail:
        "Preview/package context exists, but Browser Runtime V2 actions should stay staged until the current live session is refreshed."
    };
  }

  if (browserStatus.runtimeState === "error") {
    return {
      label: "Browser runtime actions",
      value: "Paused by runtime error",
      detail:
        "Inspect, Record, Walkthrough, and SOP remain secondary until the current session reconnects cleanly."
    };
  }

  return {
    label: "Browser runtime actions",
    value: "Waiting for a real browser session",
    detail:
      "Open Browser first. Inspect, Record, Walkthrough, and SOP unlock after live runtime truth exists. Review and QC remain staged."
  };
}

function parseTimestamp(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function resolveSessionPollIntervalMs(args: {
  runtimeState: CommandCenterBrowserPanel["runtimeState"];
  runtimeActionBusy: boolean;
  isLaunching: boolean;
}) {
  if (args.isLaunching || args.runtimeActionBusy) {
    return 5000;
  }

  switch (args.runtimeState) {
    case "connected":
    case "preview_active":
      return 15000;
    case "awaiting_bind":
      return 8000;
    case "reconnect_needed":
    case "session_stale":
    case "error":
      return 10000;
    default:
      return 12000;
  }
}

export function CommandCenterBrowserRuntimePanel({
  workspaceId,
  projectId,
  projectTitle,
  initialBrowserStatus,
  initialLiveViewSession,
  presentation = "panel"
}: CommandCenterBrowserRuntimePanelProps) {
  const [activeSession, setActiveSession] = useState<LiveViewSession | null>(initialLiveViewSession);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchIntentSessionId, setLaunchIntentSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [runtimeActionBusy, setRuntimeActionBusy] = useState<BrowserRuntimeV2Action | null>(null);
  const [runtimeActionNotice, setRuntimeActionNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setActiveSession(initialLiveViewSession);
  }, [initialLiveViewSession]);

  useEffect(() => {
    if (!activeSession?.id) {
      setLaunchIntentSessionId(null);
      return;
    }

    if (activeSession.extensionConnection.boundAt || activeSession.status === "complete") {
      setLaunchIntentSessionId((current) => (current === activeSession.id ? null : current));
    }
  }, [
    activeSession?.extensionConnection.boundAt,
    activeSession?.id,
    activeSession?.status
  ]);

  const resolvedBridgeState = useMemo(() => {
    if (isLaunching) {
      return buildLaunchingState(initialBrowserStatus);
    }

    if (errorMessage) {
      return buildBrowserRuntimeErrorSnapshot({
        liveSession: activeSession,
        previewState: initialBrowserStatus.previewState,
        previewSessionId: initialBrowserStatus.previewSessionId,
        approvedPackageStatus: initialBrowserStatus.approvedPackageStatus,
        roomDataState: initialBrowserStatus.dataState,
        launchRequested:
          Boolean(launchIntentSessionId) &&
          launchIntentSessionId === (activeSession?.id ?? initialBrowserStatus.liveSessionId),
        errorMessage
      });
    }

    return buildBrowserRuntimeBridgeSnapshot({
      liveSession: activeSession,
      previewState: initialBrowserStatus.previewState,
      previewSessionId: initialBrowserStatus.previewSessionId,
      approvedPackageStatus: initialBrowserStatus.approvedPackageStatus,
      roomDataState: initialBrowserStatus.dataState,
      launchRequested:
        Boolean(launchIntentSessionId) &&
        launchIntentSessionId === (activeSession?.id ?? initialBrowserStatus.liveSessionId)
    });
  }, [
    activeSession,
    errorMessage,
    initialBrowserStatus,
    isLaunching,
    launchIntentSessionId
  ]);

  const browserStatus = useMemo<CommandCenterBrowserPanel>(
    () => ({
      ...initialBrowserStatus,
      runtimeState: resolvedBridgeState.state,
      liveSessionId: resolvedBridgeState.liveSessionId,
      lastHeartbeatAt: resolvedBridgeState.lastHeartbeatAt,
      lastSeenOrigin: resolvedBridgeState.lastSeenOrigin,
      statusLabel: resolvedBridgeState.statusLabel,
      detail: resolvedBridgeState.detail,
      connectionState: resolvedBridgeState.connectionState,
      inspectionState: resolvedBridgeState.inspectionState,
      qcState: resolvedBridgeState.qcState,
      ctaLabel: resolvedBridgeState.ctaLabel
    }),
    [initialBrowserStatus, resolvedBridgeState]
  );

  const trackedSessionId = activeSession?.id ?? browserStatus.liveSessionId;
  const previewDisplay = useMemo(
    () => buildPreviewStateDisplay(browserStatus),
    [browserStatus]
  );
  const inspectionTruthDisplay = useMemo(
    () => buildInspectionTruthDisplay(browserStatus, activeSession),
    [activeSession, browserStatus]
  );
  const pendingToolDisplay = useMemo(
    () => buildPendingToolDisplay(browserStatus),
    [browserStatus]
  );
  const showingHistoricalSessionContext =
    trackedSessionId !== null &&
    (browserStatus.runtimeState === "not_connected" ||
      browserStatus.runtimeState === "reconnect_needed" ||
      browserStatus.runtimeState === "session_stale" ||
      (browserStatus.runtimeState === "error" &&
        launchIntentSessionId !== trackedSessionId &&
        !isLaunching));
  const sessionContextLine =
    trackedSessionId && showingHistoricalSessionContext
      ? `Previous session ${trackedSessionId}`
      : trackedSessionId
        ? `Session ${trackedSessionId}`
        : browserStatus.previewStateLabel;

  const refreshSession = useCallback(async () => {
    if (!trackedSessionId) {
      return null;
    }

    const response = await fetch(
      `/api/live-view/session?workspaceId=${encodeURIComponent(
        workspaceId
      )}&projectId=${encodeURIComponent(projectId)}&sessionId=${encodeURIComponent(
        trackedSessionId
      )}`,
      {
        cache: "no-store"
      }
    );

    const json = (await response.json()) as {
      session?: LiveViewSession | null;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(json.error || "Unable to refresh the live browser session.");
    }

    return json.session ?? null;
  }, [projectId, trackedSessionId, workspaceId]);

  const sessionPollIntervalMs = useMemo(() => {
    if (!trackedSessionId) {
      return null;
    }

    return resolveSessionPollIntervalMs({
      runtimeState: browserStatus.runtimeState,
      runtimeActionBusy: runtimeActionBusy !== null,
      isLaunching
    });
  }, [browserStatus.runtimeState, isLaunching, runtimeActionBusy, trackedSessionId]);

  useEffect(() => {
    if (!trackedSessionId || sessionPollIntervalMs === null) {
      return;
    }

    const pollIntervalMs = sessionPollIntervalMs;
    let alive = true;
    let timeoutId: number | null = null;
    let inFlight = false;

    function clearScheduledPoll() {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    }

    function scheduleNextPoll(delay = pollIntervalMs) {
      if (!alive) {
        return;
      }

      clearScheduledPoll();
      timeoutId = window.setTimeout(() => {
        void pollSession();
      }, delay);
    }

    async function pollSession(force = false) {
      if (!alive || inFlight) {
        return;
      }

      if (!force && document.visibilityState !== "visible") {
        scheduleNextPoll();
        return;
      }

      inFlight = true;

      try {
        const session = await refreshSession();

        if (!alive) {
          return;
        }

        setActiveSession(session);
        setErrorMessage(null);
      } catch (error) {
        if (!alive) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to refresh the live browser session."
        );
      } finally {
        inFlight = false;
        scheduleNextPoll();
      }
    }

    void pollSession(true);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        clearScheduledPoll();
        void pollSession(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      alive = false;
      clearScheduledPoll();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshSession, sessionPollIntervalMs, trackedSessionId]);

  const extensionConnected = activeSession?.extensionConnection.status === "connected";
  const hasRealBind = Boolean(activeSession?.extensionConnection.boundAt);
  const bindTimestamp = parseTimestamp(activeSession?.extensionConnection.boundAt);
  const latestObservedTimestamp = parseTimestamp(activeSession?.inspectionState.latestObserved?.capturedAt);
  const latestExplicitTimestamp = parseTimestamp(activeSession?.inspectionState.latestExplicit?.capturedAt);
  const hasInspectablePageContext = Boolean(activeSession?.report.inspectedPages.length);
  const hasCurrentInspectionContext = Boolean(
    hasInspectablePageContext ||
      latestObservedTimestamp !== null ||
      latestExplicitTimestamp !== null
  );
  const canRunExplicitInspection =
    Boolean(trackedSessionId) && extensionConnected && hasCurrentInspectionContext;
  const runtimeConnectionOverride = useMemo<BrowserRuntimeV2CommandConnection | null>(() => {
    if (!activeSession) {
      return null;
    }

    return {
      sessionId: activeSession.id,
      token: activeSession.token,
      workspaceId: activeSession.workspaceId,
      projectId: activeSession.projectId,
      projectTitle: activeSession.projectTitle,
      bridgeOrigin: activeSession.bridgeOrigin,
      allowedOrigins: activeSession.allowedOrigins,
      runtimeTarget:
        activeSession.runtimeV2.runtimeTarget ??
        resolveBrowserRuntimeV2RuntimeTarget(activeSession.bridgeOrigin)
    };
  }, [activeSession]);
  const inspectionActionLabel =
    activeSession?.inspectionState.latestExplicit ? "Run another explicit inspection" : "Run explicit inspection";
  const recordingActive =
    activeSession?.runtimeV2.recording.status === "capturing" || activeSession?.recordingEnabled;
  const canRunRecordAction =
    Boolean(trackedSessionId) &&
    extensionConnected &&
    Boolean(activeSession?.runtimeV2.currentTarget?.url || hasCurrentInspectionContext);
  const canRunWalkthrough =
    Boolean(trackedSessionId) &&
    extensionConnected &&
    Boolean(activeSession?.runtimeV2.currentTarget?.url || hasCurrentInspectionContext);
  const canGenerateSop =
    Boolean(trackedSessionId) &&
    Boolean(
      latestExplicitTimestamp !== null ||
        activeSession?.runtimeV2.walkthrough.outputId ||
        activeSession?.runtimeV2.recording.recordingId ||
        activeSession?.runtimeV2.sopOutput.outputId
    );
  const inspectionActionHelper = !trackedSessionId
    ? "Open Browser first so Neroa can attach a live session for this project."
    : !extensionConnected
      ? "Reconnect the Neroa Live View extension first. Explicit inspection only runs once the session is actively connected."
      : canRunExplicitInspection
        ? hasRealBind
          ? `Runs an explicit inspection against the latest supported ${activeSession?.runtimeV2.runtimeTarget?.label.toLowerCase() ?? "runtime target"} Neroa observed for this session.`
          : "The current browser page is already being observed. Neroa can run an explicit inspection now while Live View bind catches up."
        : !hasRealBind
          ? "Open a supported runtime target page first so Neroa has current page context while the first bind is still catching up."
          : "Open a supported runtime target page first so Neroa has a current app tab to inspect when you request an explicit inspection.";

  const runRuntimeAction = useCallback(
    async <TAction extends BrowserRuntimeV2Action>(
      command: BrowserRuntimeV2Command<TAction>,
      buildSuccessMessage: (result: Awaited<ReturnType<typeof requestBrowserRuntimeCommand>>) => string
    ) => {
      setRuntimeActionBusy(command.action);
      setRuntimeActionNotice(null);

      try {
        const result = await requestBrowserRuntimeCommand({
          surface: "command_center",
          connectionOverride: command.connectionOverride ?? runtimeConnectionOverride,
          ...command
        });

        if (!result.ok) {
          throw new Error(result.error ?? "Unable to complete the browser runtime action.");
        }

        setRuntimeActionNotice({
          tone: "success",
          message: buildSuccessMessage(result)
        });

        window.setTimeout(() => {
          void refreshSession()
            .then((session) => {
              setActiveSession(session);
              setErrorMessage(null);
            })
            .catch((error) => {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Unable to refresh the live browser session."
              );
            });
        }, 900);
      } catch (error) {
        setRuntimeActionNotice({
          tone: "error",
          message:
            error instanceof Error ? error.message : "Unable to complete the browser runtime action."
        });
      } finally {
        setRuntimeActionBusy(null);
      }
    },
    [refreshSession, runtimeConnectionOverride]
  );

  const handleExplicitInspection = useCallback(async () => {
    await runRuntimeAction(
      {
        action: "inspect.run"
      },
      (result) =>
        result.target?.url
          ? `Inspection requested for ${result.target.url}. Neroa will promote the current inspection result as soon as the active page responds.`
          : "Inspection requested. Neroa will promote the current inspection result as soon as the active page responds."
    );
  }, [runRuntimeAction]);

  const handleRecordingToggle = useCallback(async () => {
    await runRuntimeAction(
      {
        action: recordingActive ? "record.stop" : "record.start"
      },
      (result) =>
        result.notice ??
        (recordingActive
          ? "Recording foundation stopped for the current browser target."
          : "Recording foundation started for the current browser target.")
    );
  }, [recordingActive, runRuntimeAction]);

  const handleWalkthrough = useCallback(async () => {
    await runRuntimeAction(
      {
        action: "ai-walkthrough.start",
        payload: {
          intent: "Command Center browser runtime walkthrough"
        }
      },
      (result) =>
        result.notice ??
        "AI walkthrough foundation completed for the current browser target."
    );
  }, [runRuntimeAction]);

  const handleSopOutput = useCallback(async () => {
    await runRuntimeAction(
      {
        action: "sop-output.generate",
        payload: {
          source: "inspection"
        }
      },
      (result) =>
        result.notice ?? "SOP / result output generated for the current browser session."
    );
  }, [runRuntimeAction]);

  async function handleOpenBrowser() {
    setIsLaunching(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/live-view/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workspaceId,
          projectId,
          projectTitle,
          reuseExisting: true
        })
      });

      const json = (await response.json()) as {
        session?: LiveViewSession;
        error?: string;
      };

      if (!response.ok || !json.session) {
        throw new Error(json.error || "Unable to create or attach the live browser session.");
      }

      const nextSession = json.session;
      setLaunchIntentSessionId(nextSession.id);
      setActiveSession(nextSession);

      const launchResult = await requestBrowserRuntimeCommand({
        action: "open-browser",
        surface: "command_center",
        connectionOverride: {
          sessionId: nextSession.id,
          token: nextSession.token,
          workspaceId: nextSession.workspaceId,
          projectId: nextSession.projectId,
          projectTitle: nextSession.projectTitle,
          bridgeOrigin: nextSession.bridgeOrigin,
          allowedOrigins: nextSession.allowedOrigins,
          runtimeTarget:
            nextSession.runtimeV2.runtimeTarget ??
            resolveBrowserRuntimeV2RuntimeTarget(nextSession.bridgeOrigin)
        },
        payload: {
          launchAt: new Date().toISOString()
        }
      });

      if (!launchResult.ok) {
        throw new Error(
          launchResult.error || "Unable to launch the live browser session."
        );
      }

      window.setTimeout(() => {
        void fetch(
          `/api/live-view/session?workspaceId=${encodeURIComponent(
            workspaceId
          )}&projectId=${encodeURIComponent(projectId)}&sessionId=${encodeURIComponent(
            nextSession.id
          )}`,
          { cache: "no-store" }
        )
          .then((pollResponse) => pollResponse.json())
          .then((pollJson: { session?: LiveViewSession | null }) => {
            setActiveSession(pollJson.session ?? nextSession);
          })
          .catch(() => {
            setActiveSession(nextSession);
          });
      }, 900);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to launch the live browser session."
      );
    } finally {
      setIsLaunching(false);
    }
  }

  const cardClasses =
    presentation === "chat"
      ? "rounded-[18px] border border-white/14 bg-[#101a2c]/92 px-4 py-4 shadow-[0_18px_36px_rgba(2,6,23,0.24)]"
      : "rounded-[20px] border border-slate-200/70 bg-white/76 px-4 py-3.5";
  const labelClasses =
    presentation === "chat"
      ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
      : "text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500";
  const bodyClasses =
    presentation === "chat"
      ? "mt-2 text-sm leading-6 text-slate-100"
      : "mt-2 text-sm leading-6 text-slate-700";
  const inspectionClasses =
    presentation === "chat"
      ? "mt-3 text-xs uppercase tracking-[0.14em] text-slate-300"
      : "mt-3 text-xs uppercase tracking-[0.14em] text-slate-400";
  const buttonClasses =
    presentation === "chat"
      ? "rounded-full border border-sky-300/70 bg-[linear-gradient(135deg,#38bdf8,#4f46e5)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_40px_rgba(59,130,246,0.34)] transition hover:brightness-[1.06] disabled:cursor-wait disabled:border-white/10 disabled:bg-white/10 disabled:text-slate-400 disabled:shadow-none"
      : "rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500";
  const inspectionButtonClasses =
    presentation === "chat"
      ? "inline-flex rounded-full border border-cyan-300/60 bg-cyan-400/14 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/80 hover:bg-cyan-400/22 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/6 disabled:text-slate-500"
      : "inline-flex rounded-full border border-cyan-300 bg-cyan-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-800 transition hover:border-cyan-400 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400";
  const errorClasses =
    presentation === "chat"
      ? "mt-4 rounded-[18px] border border-rose-300/35 bg-rose-500/14 px-4 py-3 text-sm leading-6 text-rose-100"
      : "mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700";
  const inspectionHelperClasses =
    presentation === "chat"
      ? "text-xs leading-6 text-slate-400"
      : "text-xs leading-6 text-slate-500";
  const inspectionNoticeClasses = (tone: "success" | "error") =>
    presentation === "chat"
      ? tone === "success"
        ? "rounded-[16px] border border-emerald-300/35 bg-emerald-500/14 px-3 py-2 text-xs leading-6 text-emerald-100"
        : "rounded-[16px] border border-rose-300/35 bg-rose-500/14 px-3 py-2 text-xs leading-6 text-rose-100"
      : tone === "success"
        ? "rounded-[16px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-6 text-emerald-700"
        : "rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-6 text-rose-700";
  const utilityButtonClasses =
    presentation === "chat"
      ? "inline-flex rounded-full border border-white/14 bg-white/8 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-100 transition hover:border-cyan-200/50 hover:bg-cyan-400/14 disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-white/4 disabled:text-slate-500"
      : "inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400";

  const content = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={labelClasses}>{browserStatus.title}</p>
        <CommandCenterSourceBadge source={browserStatus.source} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={
              presentation === "chat"
                ? "text-lg font-semibold text-white"
                : "text-lg font-semibold text-slate-950"
            }
          >
            {browserStatus.statusLabel}
          </p>
          <p
            className={
              presentation === "chat"
                ? "mt-2 text-sm leading-6 text-slate-300"
                : "mt-2 text-sm leading-6 text-slate-600"
            }
          >
            {browserStatus.detail}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void handleOpenBrowser();
          }}
          disabled={isLaunching}
          className={buttonClasses}
        >
          {browserStatus.ctaLabel}
        </button>
      </div>

      {errorMessage ? <div className={errorClasses}>{errorMessage}</div> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className={cardClasses}>
          <p className={labelClasses}>Connection</p>
          <p className={bodyClasses}>{browserStatus.connectionState}</p>
        </div>
        <div className={cardClasses}>
          <p className={labelClasses}>{previewDisplay.label}</p>
          <p className={bodyClasses}>{previewDisplay.value}</p>
          {previewDisplay.detail ? (
            <p
              className={
                presentation === "chat"
                  ? "mt-2 text-xs uppercase tracking-[0.14em] text-slate-400"
                  : "mt-2 text-xs uppercase tracking-[0.14em] text-slate-400"
              }
            >
              {previewDisplay.detail}
            </p>
          ) : null}
        </div>
        <div className={cardClasses}>
          <p className={labelClasses}>Approved package</p>
          <p className={bodyClasses}>{browserStatus.approvedPackageLabel}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className={cardClasses}>
          <p className={labelClasses}>{inspectionTruthDisplay.label}</p>
          <p className={bodyClasses}>{inspectionTruthDisplay.value}</p>
          <p className={inspectionClasses}>{inspectionTruthDisplay.detail}</p>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => {
                void handleExplicitInspection();
              }}
              disabled={!canRunExplicitInspection || runtimeActionBusy !== null}
              className={inspectionButtonClasses}
            >
              {runtimeActionBusy === "inspect.run" ? "Running inspection..." : inspectionActionLabel}
            </button>
            <p className={inspectionHelperClasses}>{inspectionActionHelper}</p>
            {runtimeActionNotice ? (
              <p className={inspectionNoticeClasses(runtimeActionNotice.tone)}>
                {runtimeActionNotice.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className={cardClasses}>
          <p className={labelClasses}>{pendingToolDisplay.label}</p>
          <p className={bodyClasses}>{pendingToolDisplay.value}</p>
          <p className={inspectionClasses}>{pendingToolDisplay.detail}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void handleRecordingToggle();
              }}
              disabled={!canRunRecordAction || runtimeActionBusy !== null}
              className={utilityButtonClasses}
            >
              {runtimeActionBusy === (recordingActive ? "record.stop" : "record.start")
                ? recordingActive
                  ? "Stopping..."
                  : "Starting..."
                : recordingActive
                  ? "Stop Record"
                  : "Start Record"}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleWalkthrough();
              }}
              disabled={!canRunWalkthrough || runtimeActionBusy !== null}
              className={utilityButtonClasses}
            >
              {runtimeActionBusy === "ai-walkthrough.start" ? "Running..." : "AI Walkthrough"}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSopOutput();
              }}
              disabled={!canGenerateSop || runtimeActionBusy !== null}
              className={utilityButtonClasses}
            >
              {runtimeActionBusy === "sop-output.generate" ? "Generating..." : "Generate SOP"}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  if (presentation === "chat") {
    return (
      <CommandCenterPopoverBar
        tone="dark"
        className="!w-auto"
        align="right"
        summaryClassName="!w-auto rounded-[16px] border-white/18 bg-[#13213a] px-4 py-3 text-left shadow-[0_20px_44px_rgba(2,6,23,0.28)]"
        bubbleClassName="w-[min(40rem,calc(100vw-2.5rem))] max-h-[min(78vh,52rem)] overflow-y-auto"
        summaryAction={
          <button
            type="button"
            onClick={() => {
              void handleExplicitInspection();
            }}
            disabled={!canRunExplicitInspection || runtimeActionBusy !== null}
            className={`rounded-[14px] border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
              canRunExplicitInspection && runtimeActionBusy === null
                ? "border-cyan-300/60 bg-cyan-400/16 text-cyan-100 hover:border-cyan-200/80 hover:bg-cyan-400/24"
                : "cursor-not-allowed border-white/10 bg-white/6 text-slate-500"
            }`}
          >
            {runtimeActionBusy === "inspect.run"
              ? "Inspecting..."
              : activeSession?.inspectionState.latestExplicit
                ? "Run Again"
                : "Inspect"}
          </button>
        }
        summary={
          <div className="min-w-[13.5rem]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                Browser Runtime
              </p>
              <span className="rounded-full border border-sky-300/40 bg-sky-400/16 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-100">
                Open
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">{browserStatus.ctaLabel}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {browserStatus.statusLabel} - {sessionContextLine}
            </p>
          </div>
        }
      >
        <div className="space-y-4">{content}</div>
      </CommandCenterPopoverBar>
    );
  }

  return <CommandCenterPanel dataState={browserStatus.dataState}>{content}</CommandCenterPanel>;
}
