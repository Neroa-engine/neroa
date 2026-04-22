import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  analyzePlanningInputs,
  type PlanningLaneId,
  type PlanningMessage,
  type PlanningThreadMetadata,
  type PlanningThreadState
} from "@/lib/start/planning-thread";

type PlanningChatRequest = {
  threadId?: string;
  lane?: PlanningLaneId;
  title?: string;
  summary?: string;
  message?: string;
  messages?: PlanningMessage[];
};

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createMessageId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function sanitizeMessages(messages: unknown): PlanningMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  const sanitized: Array<PlanningMessage | null> = messages
    .map((message) => {
      if (!message || typeof message !== "object") {
        return null;
      }

      const record = message as Record<string, unknown>;
      const role = record.role;
      const content = safeString(record.content);

      if ((role !== "assistant" && role !== "user") || !content) {
        return null;
      }

      return {
        id:
          typeof record.id === "string" && record.id.trim()
            ? record.id
            : createMessageId(String(role)),
        role,
        content,
        createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined
      } satisfies PlanningMessage;
    })
    .slice(-20);

  return sanitized.filter((message): message is PlanningMessage => message !== null);
}

function deriveProjectTitle(seedTitle: string, userMessages: PlanningMessage[]) {
  if (seedTitle) {
    return seedTitle;
  }

  const firstMeaningfulMessage = userMessages
    .map((message) => message.content.trim())
    .find((content) => content.length >= 24);

  return firstMeaningfulMessage ? firstMeaningfulMessage.slice(0, 72) : "";
}

function deriveScopeNotes(text: string) {
  return text
    .split(/\n+|[.!?](?:\s+|$)/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 16)
    .slice(0, 3);
}

function buildRecommendedNextStep(signals: ReturnType<typeof analyzePlanningInputs>) {
  if (!signals.hasAudience) {
    return "Clarify who the first user is before opening the planning workspace.";
  }

  if (!signals.hasWorkflow) {
    return "Tighten the first workflow before opening the planning workspace.";
  }

  if (!signals.hasOutcome) {
    return "Define the first visible outcome before the planning workspace opens.";
  }

  if (!signals.hasConstraints) {
    return "Pressure-test constraints, launch risks, and the first release boundary before opening the workspace.";
  }

  return "You have enough signal to open the planning workspace and keep shaping the first release there.";
}

function buildAssistantReply(args: {
  lane: PlanningLaneId;
  signals: ReturnType<typeof analyzePlanningInputs>;
  combinedMeaningfulText: string;
}) {
  if (args.signals.meaningfulTurnCount === 0) {
    return "Start with the product idea, who it is for, and the first outcome that matters. Neroa will shape the first build path from there.";
  }

  if (!args.signals.hasAudience && !args.signals.hasWorkflow) {
    return "Good start. Who is the first customer or user, and what should the first version help them do from end to end?";
  }

  if (!args.signals.hasAudience) {
    return "Who is the first customer or user you want Neroa to optimize the first release for?";
  }

  if (!args.signals.hasWorkflow) {
    return "What is the first workflow or core journey the first version needs to support cleanly?";
  }

  if (!args.signals.hasOutcome) {
    return "What should success look like for the first release once that workflow is live?";
  }

  if (!args.signals.hasConstraints) {
    return args.lane === "managed"
      ? "What constraints, launch risks, or delivery limits should Neroa factor in before the workspace opens?"
      : "What constraints or release boundaries should Neroa keep in mind before the workspace opens?";
  }

  const scopeNotes = deriveScopeNotes(args.combinedMeaningfulText);
  const summaryPreview =
    scopeNotes.length > 0
      ? scopeNotes.map((note) => `- ${note}`).join("\n")
      : `- ${args.combinedMeaningfulText.slice(0, 220)}`;

  return [
    "Here is the product shape Neroa is hearing so far:",
    "",
    summaryPreview,
    "",
    buildRecommendedNextStep(args.signals)
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: "Sign in before using Strategy Room."
      },
      {
        status: 401
      }
    );
  }

  let body: PlanningChatRequest;

  try {
    body = (await request.json()) as PlanningChatRequest;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Strategy Room could not read the message payload."
      },
      {
        status: 400
      }
    );
  }

  const lane: PlanningLaneId = body.lane === "managed" ? "managed" : "diy";
  const message = safeString(body.message);

  if (!message) {
    return NextResponse.json(
      {
        ok: false,
        error: "Add a message before continuing Strategy Room."
      },
      {
        status: 400
      }
    );
  }

  const threadId = safeString(body.threadId) || createMessageId("start-thread");
  const priorMessages = sanitizeMessages(body.messages);
  const userMessage: PlanningMessage = {
    id: createMessageId("user"),
    role: "user",
    content: message,
    createdAt: new Date().toISOString()
  };
  const allMessages = [...priorMessages, userMessage].slice(-20);
  const userMessages = allMessages.filter((entry) => entry.role === "user");
  const signals = analyzePlanningInputs(userMessages.map((entry) => entry.content));
  const combinedMeaningfulText =
    signals.combinedMeaningfulText || userMessages.map((entry) => entry.content).join("\n\n");
  const assistantMessage: PlanningMessage = {
    id: createMessageId("assistant"),
    role: "assistant",
    content: buildAssistantReply({
      lane,
      signals,
      combinedMeaningfulText
    }),
    createdAt: new Date().toISOString()
  };
  const projectTitle = deriveProjectTitle(safeString(body.title), userMessages);
  const metadata: PlanningThreadMetadata = {
    lane,
    projectTitle: signals.shouldRevealSummary ? projectTitle || null : null,
    perceivedProject: signals.shouldRevealSummary ? combinedMeaningfulText.trim() || null : null,
    scopeNotes: signals.shouldRevealSummary ? deriveScopeNotes(combinedMeaningfulText) : [],
    recommendedNextStep: buildRecommendedNextStep(signals)
  };
  const threadState: PlanningThreadState = {
    threadId,
    lane,
    messages: [...allMessages, assistantMessage].slice(-20),
    metadata,
    updatedAt: new Date().toISOString()
  };

  return NextResponse.json({
    ok: true,
    threadId,
    assistantMessage,
    threadState
  });
}
