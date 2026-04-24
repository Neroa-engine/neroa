import type { LiveViewSession } from "@/lib/live-view/types";
import type {
  CommandCenterApprovedDesignPackageStatus,
  CommandCenterPreviewStateStatus
} from "@/lib/workspace/command-center-design-preview";

export type BrowserRuntimeBridgeState =
  | "not_connected"
  | "launching"
  | "awaiting_bind"
  | "connected"
  | "preview_active"
  | "session_stale"
  | "reconnect_needed"
  | "unsupported"
  | "error";

type RoomDataState = "stable" | "partial" | "degraded";

type BrowserRuntimeBridgeArgs = {
  liveSession: LiveViewSession | null;
  previewState: CommandCenterPreviewStateStatus;
  previewSessionId: string | null;
  approvedPackageStatus: CommandCenterApprovedDesignPackageStatus | "none";
  roomDataState: RoomDataState;
  runtimeSupported?: boolean;
  launchRequested?: boolean;
};

export type BrowserRuntimeBridgeSnapshot = {
  state: BrowserRuntimeBridgeState;
  liveSessionId: string | null;
  lastHeartbeatAt: string | null;
  lastSeenOrigin: string | null;
  statusLabel: string;
  detail: string;
  connectionState: string;
  inspectionState: string;
  qcState: string;
  ctaLabel: string;
};

export function isBrowserRuntimeReadyForPreview(state: BrowserRuntimeBridgeState) {
  return state === "connected" || state === "preview_active";
}

type DesignLibraryRuntimeTarget = {
  runtimeTargetLabel: string;
  runtimeTargetDetail: string;
};

function isPreviewActive(previewState: CommandCenterPreviewStateStatus) {
  return (
    previewState === "previewing" ||
    previewState === "approved_pending_implementation"
  );
}

function hasFreshConnection(session: LiveViewSession | null) {
  return (
    session?.extensionConnection.status === "connected" &&
    Boolean(session.extensionConnection.boundAt)
  );
}

function hasExistingBind(session: LiveViewSession | null) {
  return Boolean(session?.extensionConnection.boundAt);
}

function hasExplicitInspection(session: LiveViewSession | null) {
  return Boolean(session?.inspectionState?.latestExplicit);
}

function hasObservedInspection(session: LiveViewSession | null) {
  return Boolean(session?.inspectionState?.latestObserved);
}

const FRESH_LAUNCH_WINDOW_MS = 2 * 60 * 1000;

function isLiveViewRoute(url: string | null | undefined) {
  return typeof url === "string" && /\/workspace\/[^/]+\/project\/[^/]+\/live-view(?:[/?#]|$)/.test(url);
}

function isRecentTimestamp(value: string | null | undefined, windowMs = FRESH_LAUNCH_WINDOW_MS) {
  if (!value) {
    return false;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= windowMs;
}

function isCurrentLaunchAttempt(
  session: LiveViewSession | null,
  launchRequested = false
) {
  if (!session || hasExistingBind(session)) {
    return false;
  }

  if (launchRequested) {
    return true;
  }

  const liveViewSeen =
    isLiveViewRoute(session.lastPageUrl) ||
    isLiveViewRoute(session.extensionConnection.lastSeenUrl);

  if (liveViewSeen) {
    return (
      isRecentTimestamp(session.updatedAt) ||
      isRecentTimestamp(session.extensionConnection.lastHeartbeatAt) ||
      isRecentTimestamp(session.createdAt)
    );
  }

  return (
    session.extensionConnection.lastEvent === null &&
    (isRecentTimestamp(session.createdAt) || isRecentTimestamp(session.updatedAt))
  );
}

function withRoomStateNote(detail: string, roomDataState: RoomDataState) {
  if (roomDataState === "degraded") {
    return `${detail} Project truth is still incomplete, so treat browser guidance as provisional until the room stabilizes.`;
  }

  if (roomDataState === "partial") {
    return `${detail} The project picture is still sharpening, so keep preview and runtime decisions deliberately staged.`;
  }

  return detail;
}

export function buildBrowserRuntimeBridgeSnapshot(
  args: BrowserRuntimeBridgeArgs
): BrowserRuntimeBridgeSnapshot {
  const {
    liveSession,
    previewState,
    previewSessionId,
    approvedPackageStatus,
    roomDataState,
    runtimeSupported = true,
    launchRequested = false
  } = args;
  const liveSessionId = liveSession?.id ?? previewSessionId ?? null;
  const lastHeartbeatAt = liveSession?.extensionConnection.lastHeartbeatAt ?? null;
  const lastSeenOrigin = liveSession?.extensionConnection.lastSeenOrigin ?? null;

  if (!runtimeSupported) {
    return {
      state: "unsupported",
      liveSessionId,
      lastHeartbeatAt,
      lastSeenOrigin,
      statusLabel: "Localhost Only",
      detail: withRoomStateNote(
        "Browser Runtime, Live View session persistence, Browser Runtime V2 output, and local QC storage are disabled in this deployed environment. Use localhost or another persistent runtime when you need real browser-session tooling.",
        roomDataState
      ),
      connectionState:
        "No local browser session can be created here. Command Center is showing planning truth only until you move this workflow onto localhost or another persistent runtime.",
      inspectionState:
        "Explicit inspection, Record, Walkthrough, and SOP output stay unavailable here because Neroa does not write local browser-runtime session data on Vercel/serverless deployments.",
      qcState:
        "QC reports, recordings, and browser-runtime output storage stay disabled in this deployment. Use localhost when you need browser-backed review artifacts.",
      ctaLabel: "Localhost only"
    };
  }

  const connectionIsLive = hasFreshConnection(liveSession);
  const previewUsesLiveSession =
    Boolean(liveSession) &&
    Boolean(previewSessionId) &&
    liveSession?.id === previewSessionId;
  const previewIsActive = isPreviewActive(previewState);
  const previewIsStale = previewState === "stale_after_code_change";
  const sessionWasBound = hasExistingBind(liveSession);
  const explicitInspectionIsCurrent = hasExplicitInspection(liveSession);
  const observedInspectionExists = hasObservedInspection(liveSession);
  const currentLaunchAttempt = isCurrentLaunchAttempt(liveSession, launchRequested);

  let state: BrowserRuntimeBridgeState;

  if (!liveSession && !previewSessionId) {
    state = "not_connected";
  } else if (connectionIsLive && previewIsStale) {
    state = "session_stale";
  } else if (connectionIsLive && previewUsesLiveSession && previewIsActive) {
    state = "preview_active";
  } else if (connectionIsLive) {
    state = "connected";
  } else if (currentLaunchAttempt) {
    state = "awaiting_bind";
  } else if (previewIsStale || liveSession?.status === "complete") {
    state = "session_stale";
  } else if (sessionWasBound) {
    state = "reconnect_needed";
  } else {
    state = "not_connected";
  }

  switch (state) {
    case "awaiting_bind":
      return {
        state,
        liveSessionId,
        lastHeartbeatAt,
        lastSeenOrigin,
        statusLabel: "Awaiting Bind",
        detail: withRoomStateNote(
          "A real Live View session is active for this project. Open Browser keeps Command Center in place while the existing extension stack binds from the current runtime target.",
          roomDataState
        ),
        connectionState: liveSessionId
          ? `Live session ${liveSessionId} is ready and waiting for the extension to bind.`
          : "A live session is ready and waiting for the extension to bind.",
        inspectionState:
          "Waiting for the first real bind. Inspect traffic from older tabs or prior session context should not be treated as this Live View session being ready yet.",
        qcState:
          approvedPackageStatus === "approved_for_implementation" ||
          approvedPackageStatus === "sent_to_codex"
            ? "Approved packages remain staged here, but Review, QC, and Record stay pending until the fresh bind is real."
            : "Inspection is the only live browser signal right now. Review, QC, and Record remain pending tools until the first real bind lands.",
        ctaLabel: "Open Browser"
      };
    case "connected":
      return {
        state,
        liveSessionId,
        lastHeartbeatAt,
        lastSeenOrigin,
        statusLabel: "Connected",
        detail: withRoomStateNote(
          "Command Center is now reflecting honest Live View session truth from the existing browser runtime path.",
          roomDataState
        ),
        connectionState: lastSeenOrigin
          ? `Live session ${liveSessionId} is connected from ${lastSeenOrigin}.`
          : liveSessionId
            ? `Live session ${liveSessionId} is connected.`
            : "A live session is connected.",
        inspectionState: explicitInspectionIsCurrent
          ? "An explicit inspection result is current on this connected session. Background observation stays secondary unless another supported inspection run is triggered."
          : observedInspectionExists
            ? "The session is connected and background observation is arriving, but no explicit inspection result has been promoted as the current step yet."
            : "The session is connected. Inspection remains a separate layer and will only become current after a supported inspection trigger.",
        qcState:
          approvedPackageStatus === "implemented"
            ? "Rendered output can be compared against the implemented package here, but Review, QC, and Record still stay secondary until their producer paths are promoted."
            : "Design Library can use this same session for staged preview work, but Review, QC, and Record are still pending runtime tools rather than active operator actions.",
        ctaLabel: "Open Browser"
      };
    case "preview_active":
      return {
        state,
        liveSessionId,
        lastHeartbeatAt,
        lastSeenOrigin,
        statusLabel: "Preview Active",
        detail: withRoomStateNote(
          "The Design Library is staging preview/package work against the same connected Live View session the browser bridge is using.",
          roomDataState
        ),
        connectionState: lastSeenOrigin
          ? `Live session ${liveSessionId} is connected from ${lastSeenOrigin} and is the active preview target.`
          : liveSessionId
            ? `Live session ${liveSessionId} is connected and is the active preview target.`
            : "The active preview is attached to the current connected live session.",
        inspectionState: explicitInspectionIsCurrent
          ? "Preview and the latest explicit inspection share this connected session, but QC and recording still remain separate pending tools."
          : observedInspectionExists
            ? "Preview shares the live session, but current inspection is still background observation only until an explicit inspection run is promoted."
            : "Preview shares the live session, but inspection remains a separate layer until a supported inspection run occurs.",
        qcState:
          approvedPackageStatus === "approved_for_implementation" ||
          approvedPackageStatus === "sent_to_codex"
            ? "The approved package remains staged for implementation after this preview session is reviewed, while QC and recording stay pending."
            : "Preview is live on this session, but Review, QC, and Record still stay in the pending-tool lane until their producer paths are real.",
        ctaLabel: "Open Browser"
      };
    case "session_stale":
      return {
        state,
        liveSessionId,
        lastHeartbeatAt,
        lastSeenOrigin,
        statusLabel: "Session Stale",
        detail: withRoomStateNote(
          "The last preview or browser session no longer reflects current runtime/code truth. Re-open Browser and refresh the live session before trusting staged preview state.",
          roomDataState
        ),
        connectionState: liveSessionId
          ? `Session ${liveSessionId} exists, but the active preview/runtime picture is stale.`
          : "The last preview/runtime picture is stale.",
        inspectionState:
          "Stale preview or inspect context should not be treated as current browser truth.",
        qcState:
          "Refresh the live session before treating Design Library, Review, QC, or Record as trustworthy browser-side tools.",
        ctaLabel: "Reconnect Browser"
      };
    case "reconnect_needed":
      return {
        state,
        liveSessionId,
        lastHeartbeatAt,
        lastSeenOrigin,
        statusLabel: "Previously Bound / Currently Disconnected",
        detail: withRoomStateNote(
          "The current browser session is not live right now. Command Center is holding onto prior session context, but preview and review should not be treated as active until Browser reconnects.",
          roomDataState
        ),
        connectionState: lastSeenOrigin
          ? `Live session ${liveSessionId} was previously connected from ${lastSeenOrigin}, but there is no fresh extension heartbeat now.`
          : liveSessionId
            ? `Live session ${liveSessionId} was previously bound, but it is not currently connected.`
            : "The last live session is not currently connected.",
        inspectionState:
          "Current inspection is paused. Prior preview or inspect context below is historical until the extension reconnects with a fresh bind.",
        qcState:
          approvedPackageStatus === "implemented"
            ? "Reconnect Browser before trusting implementation-versus-preview review against current runtime truth."
            : "Design Library stays blocked, and Review, QC, and Record remain secondary pending tools until Browser reconnects with a fresh live heartbeat.",
        ctaLabel: "Reconnect Browser"
      };
    default:
      return {
        state: "not_connected",
        liveSessionId,
        lastHeartbeatAt,
        lastSeenOrigin,
        statusLabel: "Not Connected",
        detail: withRoomStateNote(
          liveSessionId
            ? "Browser has not been opened in this interaction yet. Previous session context is still available below, but it should not be treated as an active launch or bind attempt."
            : "No live browser session is attached yet. Open Browser will launch the existing Live View path in a separate window and create or attach the real session for this project.",
          roomDataState
        ),
        connectionState: liveSessionId
          ? lastSeenOrigin
            ? `No live browser session is active right now. Previous session ${liveSessionId} last reported from ${lastSeenOrigin}.`
            : `No live browser session is active right now. Previous session ${liveSessionId} is historical context only.`
          : "No active live session is connected yet. Command Center is waiting to launch the existing browser runtime path.",
        inspectionState: liveSessionId
          ? sessionWasBound
            ? "Previous bind and preview context is visible below, but Browser has not been opened in this interaction."
            : "Inspect-only traffic from a previous session exists, but Browser has not been opened in this interaction."
          : "Live inspection will appear here once the session binds for real.",
        qcState:
          approvedPackageStatus === "approved_for_implementation" ||
          approvedPackageStatus === "sent_to_codex"
            ? "An approved package already exists, but Browser still needs to reconnect so preview review uses live session truth."
            : "Design Library, Review, QC, and Record all stay staged until a real live session exists.",
        ctaLabel: "Open Browser"
      };
  }
}

export function buildBrowserRuntimeErrorSnapshot(
  args: BrowserRuntimeBridgeArgs & {
    errorMessage: string;
  }
): BrowserRuntimeBridgeSnapshot {
  const baseline = buildBrowserRuntimeBridgeSnapshot(args);

  if (baseline.state === "unsupported") {
    return baseline;
  }

  return {
    ...baseline,
    state: "error",
    statusLabel: "Error",
    detail: withRoomStateNote(args.errorMessage, args.roomDataState),
    inspectionState:
      "Browser inspection is paused until the Live View session can be refreshed or reopened cleanly.",
    qcState:
      "Preview and QC controls stay unavailable until the active browser session reconnects successfully.",
    ctaLabel: baseline.liveSessionId ? "Retry Browser" : "Open Browser"
  };
}

export function buildDesignLibraryRuntimeTarget(
  args: BrowserRuntimeBridgeArgs
): DesignLibraryRuntimeTarget {
  const {
    liveSession,
    previewState,
    previewSessionId,
    runtimeSupported = true,
    launchRequested = false
  } = args;
  const liveSessionId = liveSession?.id ?? previewSessionId ?? null;
  const connectionIsLive = hasFreshConnection(liveSession);
  const previewUsesLiveSession =
    Boolean(liveSession) &&
    Boolean(previewSessionId) &&
    liveSession?.id === previewSessionId;
  const sessionWasBound = hasExistingBind(liveSession);
  const currentLaunchAttempt = isCurrentLaunchAttempt(liveSession, launchRequested);

  if (!runtimeSupported) {
    return {
      runtimeTargetLabel: "Local browser runtime unavailable",
      runtimeTargetDetail:
        "Design Library preview and package staging only run against a real local live session. This deployed environment keeps that local runtime storage disabled."
    };
  }

  if (!previewSessionId && !liveSession) {
    return {
      runtimeTargetLabel: "Live session not attached yet",
      runtimeTargetDetail:
        "Start preview or open Browser to create or attach the real Live View session this library should target."
    };
  }

  if (previewUsesLiveSession && connectionIsLive) {
    return {
      runtimeTargetLabel: `Attached to live session ${liveSessionId}`,
      runtimeTargetDetail:
        "Design Library preview and package updates are now targeting the same connected Live View session the browser bridge is using."
    };
  }

  if ((previewUsesLiveSession || liveSessionId) && previewState === "stale_after_code_change") {
    return {
      runtimeTargetLabel: `Live session ${liveSessionId} marked stale`,
      runtimeTargetDetail:
        "The preview is still attached to the same live session, but the session/package picture should be refreshed before it is trusted again."
    };
  }

  if (previewUsesLiveSession && sessionWasBound) {
    return {
      runtimeTargetLabel: `Previously attached to session ${liveSessionId}`,
      runtimeTargetDetail:
        "The Design Library still remembers this prior live session, but the extension is currently disconnected. Reconnect Browser before using preview or package actions."
    };
  }

  if (previewUsesLiveSession && currentLaunchAttempt) {
    return {
      runtimeTargetLabel: `Waiting on live session ${liveSessionId}`,
      runtimeTargetDetail:
        "Preview changes are attached to the real Live View session already, and Command Center is waiting for the extension heartbeat to make that session fully active."
    };
  }

  if (previewUsesLiveSession) {
    return {
      runtimeTargetLabel: `Previous live session ${liveSessionId}`,
      runtimeTargetDetail:
        "The Design Library still remembers this earlier session, but Browser has not been opened in the current interaction. Open Browser before treating preview state as live-ready."
    };
  }

  if (previewSessionId && !liveSession) {
    return {
      runtimeTargetLabel: `Previous live session ${previewSessionId}`,
      runtimeTargetDetail:
        "The Design Library has historical preview context for this session, but no current live session is attached. Open Browser to reconnect it to fresh runtime truth."
    };
  }

  return {
    runtimeTargetLabel: liveSessionId ? `Missing live session ${liveSessionId}` : "Live session missing",
    runtimeTargetDetail:
      "Preview state references a runtime session that is not currently available. Re-open Browser to attach the design library back to a real live session."
  };
}
