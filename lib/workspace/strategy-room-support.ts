import {
  type ArchitectureBlueprint,
  type ArchitectureInputId
} from "@/lib/intelligence/architecture";
import type { ProjectBriefSlotId } from "@/lib/intelligence/domain-contracts";
import type { GovernancePolicy } from "@/lib/intelligence/governance";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import type { RoadmapPlan } from "@/lib/intelligence/roadmap";
import { resolveBlockerIdFromQuestion, type BlockerId } from "@/lib/intent-library";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

export type StrategyRoomSupportIntent = {
  hasHelpIntent: boolean;
  wantsHumanSupport: boolean;
  wantsProcessGuidance: boolean;
  mentionsConfusion: boolean;
  mentionsUncertainty: boolean;
  mentionsFrustration: boolean;
  mentionsBlockage: boolean;
  mentionsNotWorking: boolean;
  mentionsRoadmap: boolean;
  mentionsRecommendation: boolean;
  mentionsBuild: boolean;
  mentionsNextStep: boolean;
  hasConcreteProjectSignal: boolean;
};

export type StrategyQuestionRow = {
  blockerId: BlockerId;
  inputId: ProjectBriefSlotId | ArchitectureInputId;
  label: string;
  question: string;
  value: string;
  source: "project_brief" | "architecture" | "roadmap";
};

export type StrategyRoomChatHelper = {
  eyebrow: string;
  title: string;
  description: string;
};

const CONFUSION_PATTERN =
  /\b(?:confus(?:ed|ing)|unclear|don't understand|do not understand|don't get|do not get|not following|doesn't make sense|lost|overwhelmed)\b/i;
const UNCERTAINTY_PATTERN =
  /\b(?:uncertain|unsure|not sure|don't know|do not know|no idea)\b/i;
const FRUSTRATION_PATTERN = /\b(?:frustrat(?:ed|ing)|annoy(?:ed|ing)|problem|issue|wrong)\b/i;
const NOT_WORKING_PATTERN =
  /\b(?:not working|isn't working|doesn't work|won't work|broken|failing|failed)\b/i;
const BLOCKAGE_PATTERN =
  /\b(?:stuck|blocked|can't move|cannot move|can't continue|cannot continue|can't proceed|cannot proceed|can't figure out|cannot figure out|what now|now what|where do i start|where should i start|what should i do next|what do i do next|what's next|next step)\b/i;
const HUMAN_SUPPORT_PATTERN =
  /\b(?:live help|live support|real person|real human|support team)\b/i;
const HUMAN_CONVERSATION_PATTERN =
  /\b(?:talk|speak|connect|chat|reach|contact|call)\b.*\b(?:someone|person|human|support|team)\b|\b(?:someone|person|human|support|team)\b.*\b(?:talk|speak|connect|chat|reach|contact|call)\b/i;
const PROCESS_HELP_PATTERN =
  /\b(?:help|support|guid(?:ance|e)|assist(?:ance)?|advice|direction|clarif(?:y|ication)|explain)\b/i;
const META_REQUEST_PATTERN =
  /\b(?:refine|sharpen|clarify|explain|estimate|recommend|compare|review|walk(?:\s+me)?\s+through|talk(?:\s+me)?\s+through|guide(?:\s+me)?\s+through)\b/i;
const STRATEGY_ARTIFACT_PATTERN =
  /\b(?:strategy|roadmap|plan|recommendation|pricing|budget|complexity|target(?:\s+(?:customer|user|audience))?|offer|launch|scope|workflow|direction|milestone)\b/i;
const ROADMAP_PATTERN =
  /\b(?:roadmap|plan|milestone|sequence|scope|workflow|direction)\b/i;
const RECOMMENDATION_PATTERN =
  /\b(?:recommendation|recommended|recommend|pricing|budget|complexity|tier|plan)\b/i;
const BUILD_PATTERN =
  /\b(?:build|implementation|technical|developer brief|release|launch)\b/i;
const NEXT_STEP_PATTERN =
  /\b(?:next step|what's next|what should i do next|what do i do next|where do i start|where should i start)\b/i;
const PROJECT_SIGNAL_PATTERN =
  /\b(?:saas|app|mobile|website|store|marketplace|crm|dashboard|portal|customer|buyer|seller|agency|clinic|member|catalog|product|billing|payments?|inventory|admin|team|staff|integration|automation|feature)\b/i;

function cleanSupportMessage(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function humanizeList(values: readonly string[]) {
  if (values.length <= 1) {
    return values[0] ?? "";
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function readStrategyQuestionValue(args: {
  inputId: ProjectBriefSlotId | ArchitectureInputId;
  projectBrief: ProjectBrief;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  const answeredInputs = new Map(
    (args.projectMetadata?.strategyState?.overrideState?.answeredInputs ?? []).map((item) => [
      item.inputId,
      item.value
    ])
  );
  const answeredValue = answeredInputs.get(args.inputId as ArchitectureInputId);

  if (answeredValue) {
    return answeredValue;
  }

  switch (args.inputId) {
    case "founderName":
      return cleanText(args.projectBrief.founderName);
    case "projectName":
      return cleanText(args.projectBrief.projectName);
    case "buyerPersonas":
      return humanizeList(args.projectBrief.buyerPersonas);
    case "operatorPersonas":
      return humanizeList(args.projectBrief.operatorPersonas);
    case "endCustomerPersonas":
      return humanizeList(args.projectBrief.endCustomerPersonas);
    case "adminPersonas":
      return humanizeList(args.projectBrief.adminPersonas);
    case "productCategory":
      return cleanText(args.projectBrief.productCategory);
    case "problemStatement":
      return cleanText(args.projectBrief.problemStatement);
    case "outcomePromise":
      return cleanText(args.projectBrief.outcomePromise);
    case "mustHaveFeatures":
      return humanizeList(args.projectBrief.mustHaveFeatures);
    case "niceToHaveFeatures":
      return humanizeList(args.projectBrief.niceToHaveFeatures);
    case "excludedFeatures":
      return humanizeList(args.projectBrief.excludedFeatures);
    case "surfaces":
      return humanizeList(args.projectBrief.surfaces);
    case "integrations":
      return humanizeList(args.projectBrief.integrations);
    case "dataSources":
      return humanizeList(args.projectBrief.dataSources);
    case "constraints":
      return humanizeList(args.projectBrief.constraints);
    case "complianceFlags":
      return humanizeList(args.projectBrief.complianceFlags);
    default:
      return "";
  }
}

export function analyzeStrategyRoomSupportIntent(message: string): StrategyRoomSupportIntent {
  const normalized = cleanSupportMessage(message);

  if (!normalized) {
    return {
      hasHelpIntent: false,
      wantsHumanSupport: false,
      wantsProcessGuidance: false,
      mentionsConfusion: false,
      mentionsUncertainty: false,
      mentionsFrustration: false,
      mentionsBlockage: false,
      mentionsNotWorking: false,
      mentionsRoadmap: false,
      mentionsRecommendation: false,
      mentionsBuild: false,
      mentionsNextStep: false,
      hasConcreteProjectSignal: false
    };
  }

  const mentionsConfusion = CONFUSION_PATTERN.test(normalized);
  const mentionsUncertainty = UNCERTAINTY_PATTERN.test(normalized);
  const mentionsFrustration = FRUSTRATION_PATTERN.test(normalized);
  const mentionsNotWorking = NOT_WORKING_PATTERN.test(normalized);
  const mentionsBlockage = BLOCKAGE_PATTERN.test(normalized);
  const mentionsRoadmap = ROADMAP_PATTERN.test(normalized);
  const mentionsRecommendation = RECOMMENDATION_PATTERN.test(normalized);
  const mentionsBuild = BUILD_PATTERN.test(normalized);
  const mentionsNextStep = NEXT_STEP_PATTERN.test(normalized);
  const hasConcreteProjectSignal = PROJECT_SIGNAL_PATTERN.test(normalized) || /\$\d/.test(normalized);
  const wantsHumanSupport =
    HUMAN_SUPPORT_PATTERN.test(normalized) || HUMAN_CONVERSATION_PATTERN.test(normalized);
  const wantsStrategyArtifactHelp =
    (META_REQUEST_PATTERN.test(normalized) || PROCESS_HELP_PATTERN.test(normalized)) &&
    (STRATEGY_ARTIFACT_PATTERN.test(normalized) || (mentionsBuild && !hasConcreteProjectSignal));
  const wantsProcessGuidance =
    mentionsConfusion ||
    mentionsUncertainty ||
    mentionsFrustration ||
    mentionsNotWorking ||
    mentionsBlockage ||
    wantsStrategyArtifactHelp ||
    ((PROCESS_HELP_PATTERN.test(normalized) || META_REQUEST_PATTERN.test(normalized)) &&
      !hasConcreteProjectSignal);

  return {
    hasHelpIntent: wantsHumanSupport || wantsProcessGuidance,
    wantsHumanSupport,
    wantsProcessGuidance,
    mentionsConfusion,
    mentionsUncertainty,
    mentionsFrustration,
    mentionsBlockage,
    mentionsNotWorking,
    mentionsRoadmap,
    mentionsRecommendation,
    mentionsBuild,
    mentionsNextStep,
    hasConcreteProjectSignal
  };
}

export function shouldLogStrategyRoomBlocker(intent: StrategyRoomSupportIntent) {
  return intent.mentionsBlockage || intent.mentionsFrustration || intent.mentionsNotWorking;
}

export function buildStrategyQuestionRows(args: {
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
}) {
  const seen = new Set<string>();
  const rows: StrategyQuestionRow[] = [];

  const addQuestion = (
    source: StrategyQuestionRow["source"],
    inputId: ProjectBriefSlotId | ArchitectureInputId,
    label: string,
    question: string
  ) => {
    if (!inputId) {
      return;
    }

    const blockerId = resolveBlockerIdFromQuestion({
      inputId,
      label,
      question
    });

    if (!blockerId) {
      return;
    }

    if (seen.has(blockerId)) {
      return;
    }

    seen.add(blockerId);
    rows.push({
      blockerId,
      inputId,
      label,
      question,
      value: readStrategyQuestionValue({
        inputId,
        projectBrief: args.projectBrief,
        projectMetadata: args.projectMetadata
      }),
      source
    });
  };

  for (const question of args.roadmapPlan.openQuestions) {
    addQuestion("roadmap", question.inputId, question.label, question.question);
  }

  for (const question of args.architectureBlueprint.openQuestions) {
    addQuestion("architecture", question.inputId, question.label, question.question);
  }

  for (const question of args.projectBrief.openQuestions) {
    addQuestion("project_brief", question.slotId, question.label, question.question);
  }

  return rows;
}

export function buildStrategyRoomChatHelper(args: {
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
}) {
  const questionRows = buildStrategyQuestionRows(args);
  const primaryQuestion = questionRows[0] ?? null;
  const primaryBlocker = cleanText(args.governancePolicy.approvalReadiness.blockers[0]);

  if (primaryQuestion) {
    return {
      eyebrow: "Current blocker to resolve",
      title: primaryQuestion.label,
      description: `${primaryQuestion.question} Answer here and Neroa will update the shared project plan automatically.`
    } satisfies StrategyRoomChatHelper;
  }

  if (primaryBlocker) {
    return {
      eyebrow: "Current blocker to resolve",
      title: "Approval readiness",
      description: `${primaryBlocker} Answer here and Neroa will update the shared project plan automatically.`
    } satisfies StrategyRoomChatHelper;
  }

  return {
    eyebrow: "Planning stays in chat",
    title: "Keep shaping the plan here",
    description:
      "Continue answering scope or approval questions in the main thread and Neroa will save the updates into the shared project automatically."
  } satisfies StrategyRoomChatHelper;
}
