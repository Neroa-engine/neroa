import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import {
  analyzeLiveViewUpdate,
  buildLiveViewSessionSummary,
  createBootstrapRecommendation,
  createEmptyWalkthrough,
  createInitialReport
} from "@/lib/live-view/heuristics";
import {
  createEmptyBrowserRuntimeV2SessionState,
  type BrowserRuntimeV2Action,
  type BrowserRuntimeV2SessionState,
  type BrowserRuntimeV2Target
} from "@/lib/browser-runtime-v2/contracts";
import { resolveBrowserRuntimeV2RuntimeTarget } from "@/lib/browser-runtime-v2/runtime-target";
import {
  type LiveViewActionLog,
  type LiveViewBindPayload,
  type LiveViewConnectionPayload,
  type LiveViewConnectionStatus,
  type LiveViewInspectionMode,
  type LiveViewInspectionResult,
  type LiveViewInspectPayload,
  type LiveViewSession,
  type LiveViewSessionSummary,
  type LiveViewSnapshot
} from "@/lib/live-view/types";

const liveViewRoot = path.join(process.cwd(), ".neroa-live-view");
const liveViewSessionsDir = path.join(liveViewRoot, "sessions");
const liveViewRecordingsDir = path.join(liveViewRoot, "recordings");
const sessionReuseWindowMs = 1000 * 60 * 60 * 4;
const liveViewConnectionFreshWindowMs = 1000 * 60 * 2;
const sessionMutationQueues = new Map<string, Promise<void>>();
let liveViewFilesystemStatus: "unknown" | "available" | "unavailable" = "unknown";
let liveViewFilesystemWarningEmitted = false;

function getLiveViewFilesystemErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return null;
  }

  const code = (error as NodeJS.ErrnoException).code;
  return typeof code === "string" ? code : null;
}

function isLiveViewFilesystemUnavailableError(error: unknown) {
  const code = getLiveViewFilesystemErrorCode(error);
  return code === "EACCES" || code === "ENOENT" || code === "EPERM" || code === "EROFS";
}

function warnLiveViewFilesystemUnavailable(error: unknown) {
  if (liveViewFilesystemWarningEmitted) {
    return;
  }

  liveViewFilesystemWarningEmitted = true;
  console.warn(
    `[live-view] Filesystem-backed session storage is unavailable at ${liveViewRoot}. ` +
      "Command Center will continue without live-view session history in this runtime.",
    error
  );
}

function normalizeOrigin(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function limitArray<T>(items: T[], count: number) {
  if (items.length <= count) {
    return items;
  }

  return items.slice(items.length - count);
}

function createSessionToken() {
  return randomBytes(24).toString("hex");
}

function hasRecordedBind(session: LiveViewSession) {
  return Boolean(getVerifiedBoundAt(session));
}

function getSessionOriginRank(session: LiveViewSession, preferredOrigin?: string | null) {
  const normalizedPreferredOrigin = normalizeOrigin(preferredOrigin);

  if (!normalizedPreferredOrigin) {
    return 0;
  }

  const lastSeenOrigin = normalizeOrigin(session.extensionConnection?.lastSeenOrigin);
  if (lastSeenOrigin) {
    return lastSeenOrigin === normalizedPreferredOrigin ? 4 : 0;
  }

  if (normalizeOrigin(session.bridgeOrigin) === normalizedPreferredOrigin) {
    return 3;
  }

  return session.allowedOrigins.includes(normalizedPreferredOrigin) ? 1 : 0;
}

function getSessionActivityTimestamp(session: LiveViewSession) {
  const heartbeatTimestamp = Date.parse(session.extensionConnection?.lastHeartbeatAt ?? "");
  if (!Number.isNaN(heartbeatTimestamp)) {
    return heartbeatTimestamp;
  }

  const updatedTimestamp = Date.parse(session.updatedAt);
  return Number.isNaN(updatedTimestamp) ? 0 : updatedTimestamp;
}

function isSessionReusableForOrigin(session: LiveViewSession, preferredOrigin?: string | null) {
  const normalizedPreferredOrigin = normalizeOrigin(preferredOrigin);

  if (!normalizedPreferredOrigin) {
    return true;
  }

  const lastSeenOrigin = normalizeOrigin(session.extensionConnection?.lastSeenOrigin);
  if (lastSeenOrigin) {
    return lastSeenOrigin === normalizedPreferredOrigin;
  }

  return normalizeOrigin(session.bridgeOrigin) === normalizedPreferredOrigin;
}

function compareLiveViewSessions(
  a: LiveViewSession,
  b: LiveViewSession,
  preferredOrigin?: string | null
) {
  const originRankDiff =
    getSessionOriginRank(b, preferredOrigin) - getSessionOriginRank(a, preferredOrigin);

  if (originRankDiff !== 0) {
    return originRankDiff;
  }

  const connectionDiff =
    Number(resolveConnectionStatus(b) === "connected") -
    Number(resolveConnectionStatus(a) === "connected");
  if (connectionDiff !== 0) {
    return connectionDiff;
  }

  const activityDiff = getSessionActivityTimestamp(b) - getSessionActivityTimestamp(a);
  if (activityDiff !== 0) {
    return activityDiff;
  }

  const boundDiff = Number(hasRecordedBind(b)) - Number(hasRecordedBind(a));
  if (boundDiff !== 0) {
    return boundDiff;
  }

  const explicitDiff =
    Number(Boolean(b.inspectionState?.latestExplicit)) -
    Number(Boolean(a.inspectionState?.latestExplicit));
  if (explicitDiff !== 0) {
    return explicitDiff;
  }

  return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
}

function getVerifiedBoundAt(session: LiveViewSession) {
  const hasBindLog = session.actionLogs.some(
    (action) => action.label === "Extension connected to Live View session"
  );

  return hasBindLog ? session.extensionConnection?.boundAt ?? null : null;
}

function createEmptyInspectionState() {
  return {
    latestObserved: null,
    latestExplicit: null
  };
}

function normalizeRuntimeV2State(session: Partial<LiveViewSession> | null | undefined) {
  const defaults = createEmptyBrowserRuntimeV2SessionState();
  const current = session?.runtimeV2;

  return {
    ...defaults,
    ...current,
    runtimeTarget: current?.runtimeTarget ?? defaults.runtimeTarget,
    currentTarget: current?.currentTarget ?? defaults.currentTarget,
    recording: {
      ...defaults.recording,
      ...current?.recording
    },
    walkthrough: {
      ...defaults.walkthrough,
      ...current?.walkthrough
    },
    sopOutput: {
      ...defaults.sopOutput,
      ...current?.sopOutput
    }
  } satisfies BrowserRuntimeV2SessionState;
}

function applyRuntimeTargetContext(
  session: LiveViewSession,
  requestOrigin?: string | null
) {
  const runtimeTarget = resolveBrowserRuntimeV2RuntimeTarget(
    requestOrigin ?? session.bridgeOrigin
  );

  return {
    ...session,
    bridgeOrigin: runtimeTarget.origin,
    allowedOrigins: runtimeTarget.allowedOrigins,
    runtimeV2: {
      ...normalizeRuntimeV2State(session),
      runtimeTarget
    }
  } satisfies LiveViewSession;
}

type LiveViewRuntimeV2Patch = {
  currentTarget?: BrowserRuntimeV2Target | null;
  lastCommandAt?: string | null;
  lastCommandAction?: BrowserRuntimeV2Action | null;
  lastCommandError?: string | null;
  recording?: Partial<BrowserRuntimeV2SessionState["recording"]>;
  walkthrough?: Partial<BrowserRuntimeV2SessionState["walkthrough"]>;
  sopOutput?: Partial<BrowserRuntimeV2SessionState["sopOutput"]>;
};

function applyRuntimeV2Patch(
  state: BrowserRuntimeV2SessionState,
  patch: LiveViewRuntimeV2Patch
): BrowserRuntimeV2SessionState {
  return {
    ...state,
    currentTarget:
      patch.currentTarget === undefined ? state.currentTarget : patch.currentTarget,
    lastCommandAt:
      patch.lastCommandAt === undefined ? state.lastCommandAt : patch.lastCommandAt,
    lastCommandAction:
      patch.lastCommandAction === undefined
        ? state.lastCommandAction
        : patch.lastCommandAction,
    lastCommandError:
      patch.lastCommandError === undefined
        ? state.lastCommandError
        : patch.lastCommandError,
    recording: patch.recording
      ? {
          ...state.recording,
          ...patch.recording
        }
      : state.recording,
    walkthrough: patch.walkthrough
      ? {
          ...state.walkthrough,
          ...patch.walkthrough
        }
      : state.walkthrough,
    sopOutput: patch.sopOutput
      ? {
          ...state.sopOutput,
          ...patch.sopOutput
        }
      : state.sopOutput
  };
}

function normalizeInspectionState(session: LiveViewSession) {
  return {
    latestObserved: session.inspectionState?.latestObserved ?? null,
    latestExplicit: session.inspectionState?.latestExplicit ?? null
  };
}

function resolveInspectionMode(trigger: string): LiveViewInspectionMode {
  return trigger === "manual-refresh" ? "explicit" : "background";
}

function buildInspectionResult(args: {
  mode: LiveViewInspectionMode;
  snapshot: LiveViewSnapshot;
  summary: string | null;
  recommendations: LiveViewInspectionResult["recommendations"];
  findings: LiveViewInspectionResult["findings"];
  guardrails: LiveViewInspectionResult["guardrails"];
}): LiveViewInspectionResult {
  return {
    mode: args.mode,
    capturedAt: args.snapshot.capturedAt,
    trigger: args.snapshot.trigger,
    pageUrl: args.snapshot.page.url,
    pageTitle: args.snapshot.page.title || null,
    summary: args.summary,
    recommendations: args.recommendations,
    findings: args.findings,
    guardrails: args.guardrails
  };
}

async function withSessionMutationLock<T>(sessionId: string, operation: () => Promise<T>) {
  const previous = sessionMutationQueues.get(sessionId) ?? Promise.resolve();
  let releaseCurrent!: () => void;
  const current = new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  });
  const queued = previous.catch(() => undefined).then(() => current);
  sessionMutationQueues.set(sessionId, queued);
  await previous.catch(() => undefined);

  try {
    return await operation();
  } finally {
    releaseCurrent();
    if (sessionMutationQueues.get(sessionId) === queued) {
      sessionMutationQueues.delete(sessionId);
    }
  }
}

function getSessionFilePath(sessionId: string) {
  return path.join(liveViewSessionsDir, `${sessionId}.json`);
}

async function ensureLiveViewDirectories() {
  if (liveViewFilesystemStatus === "unavailable") {
    return false;
  }

  try {
    await mkdir(liveViewSessionsDir, { recursive: true });
    await mkdir(liveViewRecordingsDir, { recursive: true });
    liveViewFilesystemStatus = "available";
    return true;
  } catch (error) {
    if (isLiveViewFilesystemUnavailableError(error)) {
      liveViewFilesystemStatus = "unavailable";
      warnLiveViewFilesystemUnavailable(error);
      return false;
    }

    throw error;
  }
}

async function writeSession(session: LiveViewSession) {
  const storageReady = await ensureLiveViewDirectories();
  if (!storageReady) {
    throw new Error(
      "Live View session storage is unavailable in this runtime. Browser runtime state cannot be persisted here."
    );
  }
  await writeFile(getSessionFilePath(session.id), JSON.stringify(session, null, 2), "utf8");
}

function resolveConnectionStatus(session: LiveViewSession): LiveViewConnectionStatus {
  const heartbeat =
    session.extensionConnection?.lastHeartbeatAt ?? session.extensionConnection?.boundAt;
  if (!heartbeat) {
    return "disconnected";
  }

  return Date.now() - Date.parse(heartbeat) <= liveViewConnectionFreshWindowMs
    ? "connected"
    : "disconnected";
}

function withResolvedConnection(session: LiveViewSession): LiveViewSession {
  const existingConnection = session.extensionConnection ?? {
    status: "disconnected" as const,
    boundAt: null,
    lastHeartbeatAt: null,
    lastSeenOrigin: null,
    lastSeenUrl: null,
    lastSeenTitle: null,
    lastEvent: null
  };

  return {
    ...session,
    extensionConnection: {
      ...existingConnection,
      status: resolveConnectionStatus(session)
    },
    inspectionState: normalizeInspectionState(session),
    runtimeV2: normalizeRuntimeV2State(session)
  };
}

function normalizeActionLog(action: LiveViewActionLog): LiveViewActionLog {
  return {
    id: action.id || randomUUID(),
    timestamp: action.timestamp || new Date().toISOString(),
    type: action.type || "inspection",
    label: action.label || "Inspection event",
    detail: action.detail ?? null,
    url: action.url || ""
  };
}

function normalizeSnapshot(payload: LiveViewInspectPayload["snapshot"], screenshotPath: string | null): LiveViewSnapshot {
  return {
    id: randomUUID(),
    capturedAt: new Date().toISOString(),
    trigger: payload.trigger || "manual",
    page: {
      url: payload.page.url,
      pathname: payload.page.pathname,
      title: payload.page.title,
      hostname: payload.page.hostname
    },
    currentStep: payload.currentStep ?? null,
    headings: limitArray(payload.headings ?? [], 16),
    visibleText: limitArray(payload.visibleText ?? [], 80),
    controls: limitArray(payload.controls ?? [], 80),
    sections: limitArray(payload.sections ?? [], 24),
    runtimeIssues: limitArray(payload.runtimeIssues ?? [], 40),
    metrics: payload.metrics,
    screenshotPath
  };
}

async function saveRecordingFrame(sessionId: string, snapshotId: string, dataUrl: string) {
  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match) {
    return null;
  }

  const storageReady = await ensureLiveViewDirectories();
  if (!storageReady) {
    return null;
  }

  const sessionDirectory = path.join(liveViewRecordingsDir, sessionId);
  await mkdir(sessionDirectory, { recursive: true });
  const filePath = path.join(sessionDirectory, `${snapshotId}.png`);
  await writeFile(filePath, Buffer.from(match[1], "base64"));
  return filePath;
}

function isLiveViewSessionCandidate(value: unknown): value is LiveViewSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LiveViewSession>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.token === "string" &&
    typeof candidate.workspaceId === "string" &&
    typeof candidate.projectId === "string" &&
    typeof candidate.projectTitle === "string"
  );
}

function recoverLiveViewSessionFromMalformedJson(raw: string) {
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaping = false;
  const recoveredSessions: LiveViewSession[] = [];

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }

      if (character === "\\") {
        escaping = true;
        continue;
      }

      if (character === "\"") {
        inString = false;
      }

      continue;
    }

    if (character === "\"") {
      inString = true;
      continue;
    }

    if (character === "{") {
      if (depth === 0) {
        start = index;
      }

      depth += 1;
      continue;
    }

    if (character === "}" && depth > 0) {
      depth -= 1;

      if (depth === 0 && start >= 0) {
        const candidateRaw = raw.slice(start, index + 1);

        try {
          const parsed = JSON.parse(candidateRaw) as unknown;

          if (isLiveViewSessionCandidate(parsed)) {
            recoveredSessions.push(parsed);
          }
        } catch {
          // Ignore malformed fragments and keep scanning for a full session object.
        }

        start = -1;
      }
    }
  }

  return recoveredSessions.at(-1) ?? null;
}

async function readSessionFile(filePath: string) {
  const raw = await readFile(filePath, "utf8");

  try {
    return withResolvedConnection(JSON.parse(raw) as LiveViewSession);
  } catch (error) {
    const recoveredSession = recoverLiveViewSessionFromMalformedJson(raw);

    if (recoveredSession) {
      console.warn(
        `[live-view] Recovered a valid session object from malformed session file: ${filePath}`
      );
      return withResolvedConnection(recoveredSession);
    }

    throw error;
  }
}

export async function listLiveViewSessionsForProject(args: {
  workspaceId: string;
  projectId: string;
  preferredOrigin?: string | null;
}) {
  const storageReady = await ensureLiveViewDirectories();
  if (!storageReady) {
    return [];
  }
  const files = await readdir(liveViewSessionsDir);
  const sessions = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => {
        const filePath = path.join(liveViewSessionsDir, file);

        try {
          return await readSessionFile(filePath);
        } catch (error) {
          console.warn(
            `[live-view] Skipping unreadable session file: ${filePath}`,
            error
          );
          return null;
        }
      })
  );

    return sessions
      .filter((session): session is LiveViewSession => session !== null)
      .filter(
        (session) =>
          session.workspaceId === args.workspaceId && session.projectId === args.projectId
      )
      .sort((a, b) => compareLiveViewSessions(a, b, args.preferredOrigin));
  }

export async function getLiveViewSessionById(sessionId: string) {
  const storageReady = await ensureLiveViewDirectories();
  if (!storageReady) {
    return null;
  }
  try {
    return await readSessionFile(getSessionFilePath(sessionId));
  } catch {
    return null;
  }
}

export async function getLiveViewSessionByToken(token: string) {
  const storageReady = await ensureLiveViewDirectories();
  if (!storageReady) {
    return null;
  }

  const files = await readdir(liveViewSessionsDir).catch(() => []);

  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }

    const session = await readSessionFile(path.join(liveViewSessionsDir, file)).catch(() => null);
    if (session?.token === token) {
      return session;
    }
  }

  return null;
}

export async function createLiveViewSession(args: {
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  bridgeOrigin: string;
  createdByUserId?: string | null;
  createdByEmail?: string | null;
}) {
  const createdAt = new Date().toISOString();
  const runtimeTarget = resolveBrowserRuntimeV2RuntimeTarget(args.bridgeOrigin);
  const session: LiveViewSession = {
    id: randomUUID(),
    token: createSessionToken(),
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectTitle: args.projectTitle,
    bridgeOrigin: runtimeTarget.origin,
    allowedOrigins: runtimeTarget.allowedOrigins,
    status: "active",
    recordingEnabled: false,
    createdAt,
    updatedAt: createdAt,
    createdByUserId: args.createdByUserId ?? null,
    createdByEmail: args.createdByEmail ?? null,
    lastPageUrl: null,
    lastPageTitle: null,
    currentStep: null,
    extensionConnection: {
      status: "disconnected",
      boundAt: null,
      lastHeartbeatAt: null,
      lastSeenOrigin: null,
      lastSeenUrl: null,
      lastSeenTitle: null,
      lastEvent: null
    },
    inspectionState: createEmptyInspectionState(),
    runtimeV2: {
      ...createEmptyBrowserRuntimeV2SessionState(),
      runtimeTarget
    },
    walkthrough: createEmptyWalkthrough(),
    recommendations: [createBootstrapRecommendation()],
    guardrails: [],
    findings: [],
    snapshots: [],
    actionLogs: [
      {
        id: randomUUID(),
        timestamp: createdAt,
        type: "inspection",
        label: "Live View session created",
        detail: "Neroa is waiting for the extension to connect.",
        url: args.bridgeOrigin
      }
    ],
    report: createInitialReport(createdAt)
  };

  await writeSession(session);
  return withResolvedConnection(session);
}

export async function getOrCreateProjectLiveViewSession(args: {
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  bridgeOrigin: string;
  preferredOrigin?: string | null;
  createdByUserId?: string | null;
  createdByEmail?: string | null;
}) {
  const sessions = await listLiveViewSessionsForProject({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    preferredOrigin: args.preferredOrigin ?? args.bridgeOrigin
  });
  const latest = sessions[0];
  const preferredOrigin = args.preferredOrigin ?? args.bridgeOrigin;

  if (
    latest &&
    latest.status === "active" &&
    Date.now() - Date.parse(latest.updatedAt) < sessionReuseWindowMs &&
    isSessionReusableForOrigin(latest, preferredOrigin) &&
    (resolveConnectionStatus(latest) === "connected" || !hasRecordedBind(latest))
  ) {
    return latest;
  }

  return createLiveViewSession(args);
}

export async function inspectLiveViewSession(args: {
  token: string;
  payload: LiveViewInspectPayload;
}) {
  const session = await getLiveViewSessionByToken(args.token);

  if (!session) {
    throw new Error("Live View session not found.");
  }

  return withSessionMutationLock(session.id, async () => {
    const baselineSession = (await getLiveViewSessionById(session.id)) ?? session;
    const snapshotId = randomUUID();
    const screenshotPath =
      args.payload.recordingEnabled && args.payload.screenshotDataUrl
        ? await saveRecordingFrame(session.id, snapshotId, args.payload.screenshotDataUrl)
        : null;
    const snapshot = {
      ...normalizeSnapshot(args.payload.snapshot, screenshotPath)
    };
    snapshot.id = snapshotId;
    const actionLogs = (args.payload.actionLogs ?? []).map(normalizeActionLog);
    const recordingEnabled = args.payload.recordingEnabled ?? baselineSession.recordingEnabled;
    const inspectedOrigin = (() => {
      try {
        return new URL(snapshot.page.url).origin;
      } catch {
        return null;
      }
    })();
    const analyzed = analyzeLiveViewUpdate({
      session: {
        ...baselineSession,
        inspectionState: normalizeInspectionState(baselineSession),
        recordingEnabled,
        actionLogs: limitArray([...baselineSession.actionLogs, ...actionLogs], 400),
        snapshots: limitArray([...baselineSession.snapshots, snapshot], 120)
      },
      snapshot,
      actionLogs
    });
    const inspectionMode = resolveInspectionMode(snapshot.trigger);
    const nextInspectionResult = buildInspectionResult({
      mode: inspectionMode,
      snapshot,
      summary: analyzed.report.summary,
      recommendations: analyzed.recommendations,
      findings: analyzed.findings,
      guardrails: analyzed.guardrails
    });
    const baselineInspectionState = normalizeInspectionState(baselineSession);
    const baselineRuntimeV2 = normalizeRuntimeV2State(baselineSession);
    const updatedAt = snapshot.capturedAt;
    const updatedSession: LiveViewSession = {
      ...baselineSession,
      updatedAt,
      recordingEnabled,
      lastPageUrl: snapshot.page.url,
      lastPageTitle: snapshot.page.title,
      currentStep: analyzed.currentStep,
      extensionConnection: {
        ...baselineSession.extensionConnection,
        status: "connected",
        boundAt: getVerifiedBoundAt(baselineSession),
        lastHeartbeatAt: updatedAt,
        lastSeenOrigin: inspectedOrigin,
        lastSeenUrl: snapshot.page.url,
        lastSeenTitle: snapshot.page.title,
        lastEvent: "inspect"
      },
      inspectionState: {
        latestObserved: nextInspectionResult,
        latestExplicit:
          inspectionMode === "explicit"
            ? nextInspectionResult
            : baselineInspectionState.latestExplicit
      },
      runtimeV2: applyRuntimeV2Patch(baselineRuntimeV2, {
        currentTarget: baselineRuntimeV2.currentTarget
          ? {
              ...baselineRuntimeV2.currentTarget,
              url: snapshot.page.url,
              title: snapshot.page.title || null,
              updatedAt
            }
          : baselineRuntimeV2.currentTarget,
        lastCommandAt: inspectionMode === "explicit" ? updatedAt : baselineRuntimeV2.lastCommandAt,
        lastCommandAction:
          inspectionMode === "explicit" ? "inspect.run" : baselineRuntimeV2.lastCommandAction,
        lastCommandError: inspectionMode === "explicit" ? null : baselineRuntimeV2.lastCommandError
      }),
      walkthrough: analyzed.walkthrough,
      recommendations: analyzed.recommendations,
      guardrails: analyzed.guardrails,
      findings: analyzed.findings,
      snapshots: limitArray([...baselineSession.snapshots, snapshot], 120),
      actionLogs: limitArray(
        [
          ...baselineSession.actionLogs,
          ...actionLogs,
          {
            id: randomUUID(),
            timestamp: updatedAt,
            type: "inspection",
            label: `Inspected ${snapshot.page.pathname || snapshot.page.url}`,
            detail: `Captured ${snapshot.controls.length} controls and ${snapshot.runtimeIssues.length} runtime signals.`,
            url: snapshot.page.url
          }
        ],
        420
      ),
      report: {
        ...analyzed.report,
        recordingEnabled
      }
    };

    await writeSession(updatedSession);

    return {
      session: withResolvedConnection(updatedSession),
      summary: buildLiveViewSessionSummary(withResolvedConnection(updatedSession)),
      snapshot
    };
  });
}

export async function bindLiveViewSession(args: {
  token: string;
  payload: LiveViewBindPayload;
}) {
  const session = await getLiveViewSessionByToken(args.token);

  if (!session) {
    throw new Error("Live View session not found.");
  }

  return withSessionMutationLock(session.id, async () => {
    const baselineSession = (await getLiveViewSessionById(session.id)) ?? session;
    const baselineRuntimeV2 = normalizeRuntimeV2State(baselineSession);
    const timestamp = new Date().toISOString();
    const updatedSession: LiveViewSession = {
      ...baselineSession,
      updatedAt: timestamp,
      lastPageUrl: args.payload.tabUrl,
      lastPageTitle: args.payload.pageTitle,
      extensionConnection: {
        status: "connected",
        boundAt:
          args.payload.source === "inspection"
            ? baselineSession.extensionConnection.boundAt
            : timestamp,
        lastHeartbeatAt: timestamp,
        lastSeenOrigin: args.payload.origin,
        lastSeenUrl: args.payload.tabUrl,
        lastSeenTitle: args.payload.pageTitle,
        lastEvent: args.payload.source === "inspection" ? "inspect" : "bind"
      },
      runtimeV2: applyRuntimeV2Patch(baselineRuntimeV2, {
        lastCommandError: null,
        currentTarget:
          args.payload.source === "inspection"
            ? baselineRuntimeV2.currentTarget
            : {
                tabId: baselineRuntimeV2.currentTarget?.tabId ?? -1,
                windowId: baselineRuntimeV2.currentTarget?.windowId ?? null,
                url: args.payload.tabUrl,
                title: args.payload.pageTitle,
                updatedAt: timestamp
              }
      }),
      actionLogs: limitArray(
        [
          ...baselineSession.actionLogs,
          {
            id: randomUUID(),
            timestamp,
            type: "inspection",
            label:
              args.payload.source === "inspection"
                ? "Extension inspection heartbeat"
                : "Extension connected to Live View session",
            detail: args.payload.pageTitle ?? args.payload.tabUrl,
            url: args.payload.tabUrl
          }
        ],
        420
      )
    };

    await writeSession(updatedSession);

    return {
      session: withResolvedConnection(updatedSession),
      summary: buildLiveViewSessionSummary(withResolvedConnection(updatedSession))
    };
  });
}

export async function completeLiveViewSession(sessionId: string) {
  const session = await getLiveViewSessionById(sessionId);

  if (!session) {
    return null;
  }

  const updatedSession = {
    ...session,
    status: "complete" as const,
    updatedAt: new Date().toISOString()
  };
  await writeSession(updatedSession);
  return updatedSession;
}

export async function patchLiveViewRuntimeV2State(args: {
  token: string;
  patch: LiveViewRuntimeV2Patch;
}) {
  const session = await getLiveViewSessionByToken(args.token);

  if (!session) {
    throw new Error("Live View session not found.");
  }

  return withSessionMutationLock(session.id, async () => {
    const baselineSession = (await getLiveViewSessionById(session.id)) ?? session;
    const updatedAt =
      args.patch.lastCommandAt ??
      args.patch.recording?.stoppedAt ??
      args.patch.recording?.startedAt ??
      args.patch.walkthrough?.completedAt ??
      args.patch.walkthrough?.startedAt ??
      args.patch.sopOutput?.generatedAt ??
      new Date().toISOString();
    const updatedSession: LiveViewSession = {
      ...baselineSession,
      updatedAt,
      runtimeV2: applyRuntimeV2Patch(normalizeRuntimeV2State(baselineSession), args.patch)
    };

    await writeSession(updatedSession);

    return {
      session: withResolvedConnection(updatedSession),
      summary: buildLiveViewSessionSummary(withResolvedConnection(updatedSession))
    };
  });
}

export function buildLiveViewConnectionPayload(session: LiveViewSession): LiveViewConnectionPayload {
  const runtimeTarget =
    session.runtimeV2.runtimeTarget ??
    resolveBrowserRuntimeV2RuntimeTarget(session.bridgeOrigin);

  return {
    sessionId: session.id,
    token: session.token,
    workspaceId: session.workspaceId,
    projectId: session.projectId,
    projectTitle: session.projectTitle,
    bridgeOrigin: runtimeTarget.origin,
    allowedOrigins: runtimeTarget.allowedOrigins,
    runtimeTarget
  };
}

export function mapLiveViewSessionSummaries(sessions: LiveViewSession[]): LiveViewSessionSummary[] {
  return sessions.map((session) => buildLiveViewSessionSummary(session));
}

export function mapLiveViewSessionToRuntimeTarget(
  session: LiveViewSession,
  requestOrigin?: string | null
) {
  return applyRuntimeTargetContext(session, requestOrigin);
}
