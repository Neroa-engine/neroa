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
  liveViewAllowedOrigins,
  type LiveViewActionLog,
  type LiveViewBindPayload,
  type LiveViewConnectionPayload,
  type LiveViewConnectionStatus,
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

function limitArray<T>(items: T[], count: number) {
  if (items.length <= count) {
    return items;
  }

  return items.slice(items.length - count);
}

function createSessionToken() {
  return randomBytes(24).toString("hex");
}

function getSessionFilePath(sessionId: string) {
  return path.join(liveViewSessionsDir, `${sessionId}.json`);
}

async function ensureLiveViewDirectories() {
  await mkdir(liveViewSessionsDir, { recursive: true });
  await mkdir(liveViewRecordingsDir, { recursive: true });
}

async function writeSession(session: LiveViewSession) {
  await ensureLiveViewDirectories();
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
    }
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

  const sessionDirectory = path.join(liveViewRecordingsDir, sessionId);
  await mkdir(sessionDirectory, { recursive: true });
  const filePath = path.join(sessionDirectory, `${snapshotId}.png`);
  await writeFile(filePath, Buffer.from(match[1], "base64"));
  return filePath;
}

async function readSessionFile(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  return withResolvedConnection(JSON.parse(raw) as LiveViewSession);
}

export async function listLiveViewSessionsForProject(args: {
  workspaceId: string;
  projectId: string;
}) {
  await ensureLiveViewDirectories();
  const files = await readdir(liveViewSessionsDir);
  const sessions = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map((file) => readSessionFile(path.join(liveViewSessionsDir, file)))
  );

  return sessions
    .filter(
      (session) =>
        session.workspaceId === args.workspaceId && session.projectId === args.projectId
    )
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function getLiveViewSessionById(sessionId: string) {
  await ensureLiveViewDirectories();
  try {
    return await readSessionFile(getSessionFilePath(sessionId));
  } catch {
    return null;
  }
}

export async function getLiveViewSessionByToken(token: string) {
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
  const session: LiveViewSession = {
    id: randomUUID(),
    token: createSessionToken(),
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectTitle: args.projectTitle,
    bridgeOrigin: args.bridgeOrigin,
    allowedOrigins: [...liveViewAllowedOrigins],
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
        detail: "Naroa is waiting for the extension to connect.",
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
  createdByUserId?: string | null;
  createdByEmail?: string | null;
}) {
  const sessions = await listLiveViewSessionsForProject({
    workspaceId: args.workspaceId,
    projectId: args.projectId
  });
  const latest = sessions[0];

  if (
    latest &&
    latest.status === "active" &&
    Date.now() - Date.parse(latest.updatedAt) < sessionReuseWindowMs
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
  const recordingEnabled = args.payload.recordingEnabled ?? session.recordingEnabled;
  const inspectedOrigin = (() => {
    try {
      return new URL(snapshot.page.url).origin;
    } catch {
      return null;
    }
  })();
  const analyzed = analyzeLiveViewUpdate({
    session: {
      ...session,
      recordingEnabled,
      actionLogs: limitArray([...session.actionLogs, ...actionLogs], 400),
      snapshots: limitArray([...session.snapshots, snapshot], 120)
    },
    snapshot,
    actionLogs
  });
  const updatedAt = snapshot.capturedAt;
  const updatedSession: LiveViewSession = {
    ...session,
    updatedAt,
    recordingEnabled,
    lastPageUrl: snapshot.page.url,
    lastPageTitle: snapshot.page.title,
    currentStep: analyzed.currentStep,
    extensionConnection: {
      ...session.extensionConnection,
      status: "connected",
      boundAt: session.extensionConnection.boundAt ?? updatedAt,
      lastHeartbeatAt: updatedAt,
      lastSeenOrigin: inspectedOrigin,
      lastSeenUrl: snapshot.page.url,
      lastSeenTitle: snapshot.page.title,
      lastEvent: "inspect"
    },
    walkthrough: analyzed.walkthrough,
    recommendations: analyzed.recommendations,
    guardrails: analyzed.guardrails,
    findings: analyzed.findings,
    snapshots: limitArray([...session.snapshots, snapshot], 120),
    actionLogs: limitArray(
      [
        ...session.actionLogs,
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
    summary: buildLiveViewSessionSummary(withResolvedConnection(updatedSession))
  };
}

export async function bindLiveViewSession(args: {
  token: string;
  payload: LiveViewBindPayload;
}) {
  const session = await getLiveViewSessionByToken(args.token);

  if (!session) {
    throw new Error("Live View session not found.");
  }

  const timestamp = new Date().toISOString();
  const updatedSession: LiveViewSession = {
    ...session,
    updatedAt: timestamp,
    extensionConnection: {
      status: "connected",
      boundAt: session.extensionConnection.boundAt ?? timestamp,
      lastHeartbeatAt: timestamp,
      lastSeenOrigin: args.payload.origin,
      lastSeenUrl: args.payload.tabUrl,
      lastSeenTitle: args.payload.pageTitle,
      lastEvent: args.payload.source === "inspection" ? "inspect" : "bind"
    },
    actionLogs: limitArray(
      [
        ...session.actionLogs,
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

export function buildLiveViewConnectionPayload(session: LiveViewSession): LiveViewConnectionPayload {
  return {
    sessionId: session.id,
    token: session.token,
    workspaceId: session.workspaceId,
    projectId: session.projectId,
    projectTitle: session.projectTitle,
    bridgeOrigin: session.bridgeOrigin,
    allowedOrigins: session.allowedOrigins
  };
}

export function mapLiveViewSessionSummaries(sessions: LiveViewSession[]): LiveViewSessionSummary[] {
  return sessions.map((session) => buildLiveViewSessionSummary(session));
}
