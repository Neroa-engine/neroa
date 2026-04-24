import type { NaruaQuestion, PlanningAnswers } from "./planning-types";

const questionOrder: NaruaQuestion[] = [
  {
    field: "targetUser",
    prompt: "Who is this for first? Tell me the primary customer, user, or buyer."
  },
  {
    field: "mainGoal",
    prompt: "What is the main outcome this should produce for you, the team, or the business?"
  },
  {
    field: "mvp",
    prompt: "What should the MVP do first? Give me the smallest valuable first version."
  },
  {
    field: "integrations",
    prompt: "What systems matter right away, like GitHub, ERP, docs, payments, browser workflows, or automations?"
  }
];

export function createEmptyAnswers(): PlanningAnswers {
  return {
    idea: "",
    projectType: "",
    targetUser: "",
    mainGoal: "",
    mvp: "",
    integrations: ""
  };
}

export function createWelcomeMessage() {
  return "Hi, I'm Neroa. Tell me what you want to build and I'll shape it into a real execution plan.";
}

export function buildWorkspaceName(idea: string) {
  const cleaned = idea.trim().replace(/[.!?]+$/, "");

  if (!cleaned) {
    return "New Neroa Workspace";
  }

  return cleaned
    .split(/\s+/)
    .slice(0, 8)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function inferProjectType(idea: string) {
  const normalized = idea.toLowerCase();

  if (normalized.includes("screen print") || normalized.includes("agency") || normalized.includes("service")) {
    return "Service business";
  }

  if (normalized.includes("website") || normalized.includes("landing page")) {
    return "Website build";
  }

  if (normalized.includes("saas") || normalized.includes("app") || normalized.includes("platform")) {
    return "SaaS product";
  }

  if (normalized.includes("erp") || normalized.includes("ops") || normalized.includes("operations")) {
    return "Operations system";
  }

  if (normalized.includes("crypto") || normalized.includes("blockchain") || normalized.includes("token")) {
    return "Crypto project";
  }

  return "Business initiative";
}

export function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function countUsefulAnswers(answers: PlanningAnswers) {
  return [
    answers.idea,
    answers.targetUser,
    answers.mainGoal,
    answers.mvp,
    answers.integrations
  ].filter((value) => value.trim().length > 0).length;
}

export function getNextQuestion(answers: PlanningAnswers) {
  for (const question of questionOrder) {
    if (!answers[question.field].trim()) {
      return question;
    }
  }

  return null;
}

export function hasEnoughContext(answers: PlanningAnswers) {
  const usefulAnswerCount = countUsefulAnswers(answers);

  if (answers.idea.trim() && answers.targetUser.trim() && answers.mainGoal.trim() && answers.mvp.trim()) {
    return true;
  }

  return usefulAnswerCount >= 4;
}

export function applyUserMessage(
  answers: PlanningAnswers,
  message: string,
  currentQuestion: NaruaQuestion | null
) {
  const nextAnswers = { ...answers };
  const value = message.trim();

  if (!value) {
    return nextAnswers;
  }

  if (!nextAnswers.idea.trim()) {
    nextAnswers.idea = value;
    nextAnswers.projectType = inferProjectType(value);
    return nextAnswers;
  }

  if (currentQuestion) {
    nextAnswers[currentQuestion.field] = value;
  }

  return nextAnswers;
}
