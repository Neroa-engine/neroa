import {
  neroaOneTaskAnalysisRequestSchema,
  neroaOneTaskAnalysisResponseSchema,
  type NeroaOneAnalyzerOutcome,
  type NeroaOneTaskAnalysisRequest,
  type NeroaOneTaskAnalysisRequestInput,
  type NeroaOneTaskAnalysisResponse
} from "./analyzer-contract.ts";
import { type SpaceContextInput } from "./schemas.ts";
import { buildSpaceContext } from "./space-context.ts";

const NEROA_ONE_ANALYZER_VERSION = "neroa_one_task_analyzer_boundary_v1";

type NeroaOneAnalyzerServiceConfig = {
  url: string | null;
  serviceToken: string | null;
};

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function includesAny(text: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function safeParseJson(text: string) {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getNeroaOneAnalyzerServiceConfig(): NeroaOneAnalyzerServiceConfig {
  const url = process.env.NEROA_ONE_ANALYZER_URL?.trim() || null;
  const serviceToken = process.env.NEROA_ONE_SERVICE_TOKEN?.trim() || null;

  return {
    url,
    serviceToken
  };
}

function resolveMockAnalyzerOutcome(request: NeroaOneTaskAnalysisRequest): {
  outcome: NeroaOneAnalyzerOutcome;
  summary: string;
  reasons: string[];
  missingInformation: string[];
  customerQuestions: string[];
} {
  const normalizedRequest =
    normalizeText(request.task.normalizedRequest) ||
    normalizeText(request.task.request).toLowerCase();
  const taskTitle = normalizeText(request.task.title);

  if (
    includesAny(normalizedRequest, [
      /\bbrand new project\b/,
      /\bnew project from scratch\b/,
      /\bseparate product\b/,
      /\bseparate app\b/,
      /\breplace the whole product\b/,
      /\bswitch to a different product\b/
    ])
  ) {
    return {
      outcome: "rejected_outside_scope",
      summary: "The request appears to sit outside the current project scope.",
      reasons: ["The deterministic fallback detected a likely outside-scope request."],
      missingInformation: [],
      customerQuestions: []
    };
  }

  if (
    request.task.requestType === "change_direction" ||
    request.task.workflowLane === "roadmap_updates" ||
    includesAny(normalizedRequest, [/\broadmap\b/, /\btimeline\b/, /\bmilestone\b/, /\bphase\b/])
  ) {
    return {
      outcome: "roadmap_revision_required",
      summary: "The request appears to change roadmap, sequencing, or delivery assumptions.",
      reasons: ["The deterministic fallback detected roadmap-impact signals."],
      missingInformation: [],
      customerQuestions: []
    };
  }

  if (
    request.task.requestType === "question_decision" ||
    request.task.workflowLane === "decisions"
  ) {
    return {
      outcome: "needs_customer_answer",
      summary: "The request appears to require a customer decision before execution can proceed.",
      reasons: ["The deterministic fallback detected a decision-oriented request."],
      missingInformation: [],
      customerQuestions: ["What decision or approval should be confirmed before this moves forward?"]
    };
  }

  if (
    normalizedRequest.length < 24 ||
    includesAny(normalizedRequest, [
      /\bsomething\b/,
      /\banything\b/,
      /\bstuff\b/,
      /\bmake it better\b/,
      /\bimprove this\b/,
      /\bfix this\b/,
      /\bupdate this\b/,
      /\bhelp with this\b/
    ])
  ) {
    return {
      outcome: "blocked_missing_information",
      summary: "The request is still too thin to analyze confidently for execution.",
      reasons: ["The deterministic fallback detected missing or ambiguous task detail."],
      missingInformation: ["A more specific task request or acceptance target is needed."],
      customerQuestions: [
        `What exact change should happen for "${taskTitle || "this request"}"?`
      ]
    };
  }

  return {
    outcome: "ready_to_build",
    summary: "The request is specific enough to continue toward internal execution preparation.",
    reasons: ["The deterministic fallback found no blocking roadmap or ambiguity signals."],
    missingInformation: [],
    customerQuestions: []
  };
}

function buildMockAnalyzerResponse(
  request: NeroaOneTaskAnalysisRequest
): NeroaOneTaskAnalysisResponse {
  const resolved = resolveMockAnalyzerOutcome(request);

  return neroaOneTaskAnalysisResponseSchema.parse({
    requestId: request.requestId,
    analyzedAt: new Date().toISOString(),
    analyzer: {
      source: "mock_fallback",
      version: NEROA_ONE_ANALYZER_VERSION
    },
    outcome: resolved.outcome,
    reasoning: {
      summary: resolved.summary,
      reasons: resolved.reasons,
      missingInformation: resolved.missingInformation,
      customerQuestions: resolved.customerQuestions
    },
    effects: {
      buildRoomReady: resolved.outcome === "ready_to_build",
      requiresRoadmapReview: resolved.outcome === "roadmap_revision_required",
      shouldHoldForCustomerAnswer:
        resolved.outcome === "needs_customer_answer" ||
        resolved.outcome === "blocked_missing_information",
      shouldReject: resolved.outcome === "rejected_outside_scope"
    },
    metadata: {
      preserveCurrentBehavior: request.compatibility.preserveCurrentBehavior,
      caller: request.compatibility.caller
    }
  });
}

async function callDigitalOceanAnalyzer(
  request: NeroaOneTaskAnalysisRequest,
  config: NeroaOneAnalyzerServiceConfig
): Promise<NeroaOneTaskAnalysisResponse> {
  if (!config.url) {
    return buildMockAnalyzerResponse(request);
  }

  const headers: HeadersInit = {
    "content-type": "application/json",
    accept: "application/json"
  };

  if (config.serviceToken) {
    headers.authorization = `Bearer ${config.serviceToken}`;
  }

  // This is the future DigitalOcean service boundary for Neroa One / D-Analyzer.
  const response = await fetch(config.url, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
    cache: "no-store"
  });
  const responseText = await response.text();
  const json = safeParseJson(responseText);

  if (!response.ok) {
    throw new Error(
      `Neroa One analyzer request failed with ${response.status}: ${
        (json &&
        typeof json === "object" &&
        "error" in json &&
        typeof (json as { error?: unknown }).error === "string"
          ? (json as { error: string }).error
          : responseText.trim()) || "Unknown service error."
      }`
    );
  }

  return neroaOneTaskAnalysisResponseSchema.parse(json);
}

export function hasNeroaOneAnalyzerService() {
  return Boolean(getNeroaOneAnalyzerServiceConfig().url);
}

export function getNeroaOneAnalyzerServiceStatus() {
  const config = getNeroaOneAnalyzerServiceConfig();

  return {
    configured: Boolean(config.url),
    url: config.url,
    hasServiceToken: Boolean(config.serviceToken)
  };
}

export function buildNeroaOneTaskAnalysisRequest(
  input: NeroaOneTaskAnalysisRequestInput
): NeroaOneTaskAnalysisRequest {
  return neroaOneTaskAnalysisRequestSchema.parse({
    requestId: normalizeText(input.requestId) || crypto.randomUUID(),
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    source: input.source ?? "command_center",
    task: {
      taskId: normalizeText(input.task.taskId) || crypto.randomUUID(),
      title: input.task.title,
      request: input.task.request,
      normalizedRequest: input.task.normalizedRequest ?? null,
      roadmapArea: input.task.roadmapArea ?? null,
      requestType: input.task.requestType ?? null,
      workflowLane: input.task.workflowLane ?? null,
      sourceType: input.task.sourceType ?? null,
      createdAt: input.task.createdAt ?? null,
      updatedAt: input.task.updatedAt ?? null
    },
    spaceContext: input.spaceContext,
    compatibility: {
      preserveCurrentBehavior: input.compatibility?.preserveCurrentBehavior ?? true,
      caller: input.compatibility?.caller ?? "unknown_backend_caller"
    }
  });
}

export function buildNeroaOneTaskAnalysisRequestFromSpaceContext(args: {
  workspaceId: string;
  projectId?: string | null;
  projectContext: SpaceContextInput;
  task: NeroaOneTaskAnalysisRequestInput["task"];
  requestId?: string | null;
  source?: NeroaOneTaskAnalysisRequest["source"];
  caller?: string | null;
}) {
  return buildNeroaOneTaskAnalysisRequest({
    requestId: args.requestId ?? null,
    workspaceId: args.workspaceId,
    projectId: normalizeText(args.projectId) || args.workspaceId,
    source: args.source ?? "command_center",
    task: args.task,
    spaceContext: buildSpaceContext(args.projectContext),
    compatibility: {
      preserveCurrentBehavior: true,
      caller: normalizeText(args.caller) || "unknown_backend_caller"
    }
  });
}

export async function analyzeTaskWithNeroaOne(
  input: NeroaOneTaskAnalysisRequest
): Promise<NeroaOneTaskAnalysisResponse> {
  const request = neroaOneTaskAnalysisRequestSchema.parse(input);
  const config = getNeroaOneAnalyzerServiceConfig();

  if (!config.url) {
    return buildMockAnalyzerResponse(request);
  }

  return callDigitalOceanAnalyzer(request, config);
}
