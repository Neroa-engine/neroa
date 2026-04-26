import { getBlockerDefinition } from "./blockers.ts";
import { getBlockerSchemaDefinition } from "./schemas.ts";
import {
  nextQuestionPlanSchema,
  runtimeQuestionContextSchema,
  type BlockerClarificationPlan,
  type BlockerQueueEntry,
  type NextQuestionPlan,
  type RuntimeQuestionContext
} from "./runtime-types.ts";

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function describeExpectedShape(blockerId: BlockerQueueEntry["blockerId"]) {
  const definition = getBlockerDefinition(blockerId);
  const schema = definition ? getBlockerSchemaDefinition(definition.schemaId) : null;

  if (!definition || !schema) {
    return "One short planning answer";
  }

  if (schema.fields.length === 1) {
    return schema.fields[0].label;
  }

  return schema.fields.map((field) => field.label).join(", ");
}

function buildQuestionHelperText(args: {
  entry: BlockerQueueEntry;
  clarificationPlan?: BlockerClarificationPlan | null;
}) {
  if (args.clarificationPlan) {
    return args.clarificationPlan.helperText;
  }

  if (args.entry.requiredForApproval) {
    return "This blocks roadmap approval. Answer in chat and Neroa will update the shared project plan automatically.";
  }

  if (args.entry.requiredForArchitecture) {
    return "This shapes the architecture draft. Answer in chat and Neroa will tighten the shared project plan automatically.";
  }

  if (args.entry.requiredForRoadmap) {
    return "This tightens the roadmap scope. Answer in chat and Neroa will save the result into the shared project automatically.";
  }

  return "Answer in chat and Neroa will update the shared project plan automatically.";
}

export function buildRuntimeQuestionContext(args: {
  entry: BlockerQueueEntry;
  clarificationPlan?: BlockerClarificationPlan | null;
}): RuntimeQuestionContext {
  const definition = getBlockerDefinition(args.entry.blockerId)!;
  const schema = getBlockerSchemaDefinition(definition.schemaId)!;
  const questionText =
    cleanText(args.clarificationPlan?.prompt) || args.entry.currentQuestionText || definition.questionText;

  return runtimeQuestionContextSchema.parse({
    blockerId: args.entry.blockerId,
    label: args.entry.label,
    questionText,
    helperText: buildQuestionHelperText(args),
    sourceLayer: args.entry.sourceLayer,
    answerMode: definition.answerMode,
    expectedShape: describeExpectedShape(args.entry.blockerId),
    examples: definition.validExampleAnswers.slice(0, 3),
    allowedSchemaId: schema.id,
    allowedWriteTargets: [...definition.allowedWriteTargets],
    completionCriteriaSummary:
      args.entry.completionCriteriaSummary || definition.completionCriteria[0] || definition.description
  });
}

export function buildNextQuestionPlan(args: {
  entry: BlockerQueueEntry;
  clarificationPlan?: BlockerClarificationPlan | null;
}): NextQuestionPlan {
  const context = buildRuntimeQuestionContext(args);

  return nextQuestionPlanSchema.parse({
    blockerId: context.blockerId,
    questionText: context.questionText,
    helperText: context.helperText,
    reason: args.clarificationPlan?.reason ?? args.entry.reason,
    sourceLayer: context.sourceLayer,
    answerMode: context.answerMode,
    expectedShape: context.expectedShape,
    examples: context.examples,
    clarificationOfBlockerId: args.clarificationPlan ? args.entry.blockerId : null
  });
}

export function buildRuntimeThreadPrompt(questionPlan: NextQuestionPlan | null) {
  if (!questionPlan) {
    return null;
  }

  const examples =
    questionPlan.examples.length > 0
      ? `\n\nExamples: ${questionPlan.examples.slice(0, 2).join(" or ")}.`
      : "";

  return `${questionPlan.questionText}${examples}`;
}
