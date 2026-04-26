import type {
  BuildRoomArtifactType,
  BuildRoomCodexResult,
  BuildRoomMessageRole,
  BuildRoomOutputMode,
  BuildRoomRelayMode,
  BuildRoomRiskLevel,
  BuildRoomRunStatus,
  BuildRoomRunType,
  BuildRoomTaskPacket,
  BuildRoomTaskStatus,
  BuildRoomTaskType,
  BuildRoomWorkerJobPacket,
  BuildRoomWorkerRunStatus
} from "@/lib/build-room/contracts";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

export type BuildRoomTask = {
  id: string;
  workspaceId: string;
  projectId: string;
  ownerId: string;
  createdByUserId: string;
  laneSlug: string | null;
  title: string;
  taskType: BuildRoomTaskType;
  requestedOutputMode: BuildRoomOutputMode;
  userRequest: string;
  acceptanceCriteria: string | null;
  riskLevel: BuildRoomRiskLevel;
  status: BuildRoomTaskStatus;
  codexRequestPayload: BuildRoomTaskPacket | null;
  codexResponsePayload: BuildRoomCodexResult | null;
  approvedForExecution: boolean;
  workerRunStatus: BuildRoomWorkerRunStatus;
  createdAt: string;
  updatedAt: string;
};

export type BuildRoomTaskMessage = {
  id: string;
  taskId: string;
  ownerId: string;
  authorUserId: string | null;
  role: BuildRoomMessageRole;
  messageKind: string;
  content: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

export type BuildRoomRun = {
  id: string;
  taskId: string;
  workspaceId: string;
  projectId: string;
  ownerId: string;
  triggeredByUserId: string | null;
  runType: BuildRoomRunType;
  status: BuildRoomRunStatus;
  provider: string;
  externalJobId: string | null;
  requestPayload: Record<string, unknown> | null;
  responsePayload: Record<string, unknown> | null;
  logExcerpt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BuildRoomArtifact = {
  id: string;
  taskId: string;
  runId: string | null;
  ownerId: string;
  artifactType: BuildRoomArtifactType;
  title: string;
  textContent: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

export type BuildRoomTaskDetail = {
  task: BuildRoomTask;
  messages: BuildRoomTaskMessage[];
  runs: BuildRoomRun[];
  artifacts: BuildRoomArtifact[];
};

export type BuildRoomProjectContext = {
  workspace: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    accessMode: "owner" | "member";
  };
  project: ProjectRecord;
  projectMetadata: StoredProjectMetadata | null;
  phaseId: string;
  phaseLabel: string;
  phaseSummary: string | null;
};

export type BuildRoomWorkerTriggerResult = {
  triggerMode: BuildRoomRelayMode;
  externalJobId: string;
  runStatus: "queued" | "running" | "complete" | "failed";
  summary: string;
  logs: string[];
  resultPayload: Record<string, unknown> | null;
  textContent: string | null;
};

export type BuildRoomWorkerPacketWithContext = {
  packet: BuildRoomWorkerJobPacket;
  callbackUrl: string | null;
  callbackSecret: string | null;
};
