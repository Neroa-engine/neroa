import {
  buildWorkspaceProjectIntelligence
} from "@/lib/intelligence/project-brief-generator";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import type { RoadmapPlan } from "@/lib/intelligence/roadmap";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

export type WorkspacePhaseId = "strategy" | "scope" | "mvp" | "build";

export type ProjectContextSnapshot = {
  projectName: string;
  projectBrief: ProjectBrief;
  domainPack: ProjectBrief["domainPack"];
  briefReadinessScore: number;
  briefReadinessStage: ProjectBrief["readiness"]["stage"];
  missingCriticalSlots: ProjectBrief["missingCriticalSlots"];
  buildingSummary: string | null;
  audienceSummary: string | null;
  primaryGoal: string | null;
  productSnapshot: string | null;
  focusSnapshot: string | null;
  activePhase: WorkspacePhaseId;
  currentPhaseTitle: string;
  currentPhaseBody: string;
  currentFocus: string[];
  nextStepTitle: string;
  nextStepBody: string;
};

export function pickFirstProjectContextText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function normalizeSentence(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  return value.replace(/\s+/g, " ").trim();
}

function clipSentence(value: string | null | undefined, maxLength = 180) {
  const normalized = normalizeSentence(value);

  if (!normalized) {
    return null;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clipped = normalized.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return clipped ? `${clipped}...` : normalized;
}

function joinPersonaSummary(values: readonly string[]) {
  if (values.length === 0) {
    return null;
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function buildProjectBriefSummary(projectBrief: ProjectBrief) {
  const category = projectBrief.productCategory ?? projectBrief.projectName;
  const problem = projectBrief.problemStatement ?? projectBrief.outcomePromise;

  if (category && problem) {
    return `${category} focused on ${problem.replace(/[.!?]+$/g, "")}.`;
  }

  return category ?? problem ?? null;
}

function buildPrimaryGoal(
  projectMetadata?: StoredProjectMetadata | null,
  projectBrief?: ProjectBrief | null
) {
  const buildSession = projectMetadata?.buildSession ?? null;
  const saasIntake = projectMetadata?.saasIntake ?? null;
  const mobileAppIntake = projectMetadata?.mobileAppIntake ?? null;

  return clipSentence(
    pickFirstProjectContextText(
      projectBrief?.outcomePromise,
      projectBrief?.problemStatement,
      buildSession?.scope.businessGoal,
      buildSession?.scope.problem,
      buildSession?.scope.projectDefinitionSummary,
      buildSession?.scope.mvpSummary,
      mobileAppIntake?.answers.proofOutcome,
      saasIntake?.answers.problem
    )
  );
}

function buildAudienceSummary(
  projectMetadata?: StoredProjectMetadata | null,
  projectBrief?: ProjectBrief | null
) {
  const buildSession = projectMetadata?.buildSession ?? null;
  const saasIntake = projectMetadata?.saasIntake ?? null;
  const mobileAppIntake = projectMetadata?.mobileAppIntake ?? null;
  const projectBriefAudience = joinPersonaSummary([
    ...(projectBrief?.buyerPersonas ?? []),
    ...(projectBrief?.operatorPersonas ?? [])
  ]);

  return clipSentence(
    pickFirstProjectContextText(
      projectBriefAudience,
      buildSession?.scope.targetUsers,
      buildSession?.scope.audience,
      mobileAppIntake?.answers.audience,
      saasIntake?.answers.customer
    ),
    140
  );
}

function buildBuildingSummary(
  project: ProjectRecord,
  projectMetadata?: StoredProjectMetadata | null,
  projectBrief?: ProjectBrief | null
) {
  const buildSession = projectMetadata?.buildSession ?? null;
  const saasIntake = projectMetadata?.saasIntake ?? null;
  const mobileAppIntake = projectMetadata?.mobileAppIntake ?? null;

  return clipSentence(
    pickFirstProjectContextText(
      projectBrief ? buildProjectBriefSummary(projectBrief) : null,
      buildSession?.scope.projectDefinitionSummary,
      buildSession?.scope.summary,
      buildSession?.scope.businessDirectionSummary,
      saasIntake?.projectSummary,
      mobileAppIntake?.projectSummary,
      project.description
    ),
    220
  );
}

function resolveActivePhase(args: {
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
}): WorkspacePhaseId {
  const projectMetadata = args.projectMetadata;
  const buildSession = projectMetadata?.buildSession ?? null;

  if (
    buildSession?.scope.firstBuild?.length ||
    buildSession?.scope.mvpSummary ||
    (buildSession?.scope.frameworkLabel && buildSession?.scope.keyModules?.length)
  ) {
    return "mvp";
  }

  if (
    projectMetadata?.saasIntake ||
    projectMetadata?.mobileAppIntake ||
    buildSession?.scope.coreFeatures?.length ||
    buildSession?.scope.keyFeatures?.length ||
    buildSession?.scope.integrationNeeds?.length ||
    buildSession?.scope.frameworkLabel
  ) {
    return "scope";
  }

  if (args.projectBrief.readiness.readyForArchitectureGeneration) {
    return "scope";
  }

  return "strategy";
}

function resolvePhaseCopy(phase: WorkspacePhaseId) {
  if (phase === "scope") {
    return {
      title: "Defining Your MVP Scope",
      body:
        "We have enough direction to start narrowing version one so the plan stays focused and practical.",
      focus: [
        "Locking what belongs in version one",
        "Choosing the first product surface",
        "Protecting the scope from early sprawl"
      ]
    };
  }

  if (phase === "mvp") {
    return {
      title: "Preparing Your MVP Build Plan",
      body:
        "The product direction is clear enough to turn into a tighter first build plan without widening too early.",
      focus: [
        "Sequencing the first experience",
        "Confirming the key systems and data needs",
        "Keeping the first build lean"
      ]
    };
  }

  if (phase === "build") {
    return {
      title: "Preparing for Development",
      body:
        "The project is ready to translate into a build plan, with the first delivery steps staying clear and controlled.",
      focus: [
        "Locking the first delivery sequence",
        "Protecting the initial release scope",
        "Preparing the handoff into development"
      ]
    };
  }

  return {
    title: "Defining Your Product Direction",
    body: "We're shaping the core of your product so we can define exactly what needs to be built.",
    focus: [
      "Clarifying product type",
      "Identifying the first user",
      "Defining the first use case"
    ]
  };
}

function resolveCurrentFocus(args: {
  activePhase: WorkspacePhaseId;
  buildingSummary: string | null;
  audienceSummary: string | null;
  primaryGoal: string | null;
  projectBrief: ProjectBrief;
  roadmapPlan?: RoadmapPlan | null;
}) {
  const phaseCopy = resolvePhaseCopy(args.activePhase);

  if (args.activePhase !== "strategy" && args.roadmapPlan?.openQuestions.length) {
    return args.roadmapPlan.openQuestions.slice(0, 3).map((question) => question.label);
  }

  if (args.activePhase !== "strategy" && args.roadmapPlan?.phases.length) {
    return args.roadmapPlan.phases.slice(0, 3).map((phase) => phase.name);
  }

  if (args.activePhase !== "strategy") {
    return phaseCopy.focus;
  }

  if (args.projectBrief.openQuestions.length > 0) {
    return args.projectBrief.openQuestions.slice(0, 3).map((question) => question.label);
  }

  return [
    args.buildingSummary ? "Sharpening the product direction" : "Clarifying product type",
    args.audienceSummary ? "Confirming the first user" : "Identifying the first user",
    args.primaryGoal ? "Protecting the first use case" : "Defining the first use case"
  ];
}

function resolveNextStep(args: {
  activePhase: WorkspacePhaseId;
  buildingSummary: string | null;
  audienceSummary: string | null;
  primaryGoal: string | null;
  projectBrief: ProjectBrief;
  roadmapPlan?: RoadmapPlan | null;
}) {
  if (args.roadmapPlan?.openQuestions.length) {
    const nextRoadmapQuestion = args.roadmapPlan.openQuestions[0];

    return {
      title: nextRoadmapQuestion.label,
      body: nextRoadmapQuestion.question
    };
  }

  if (args.roadmapPlan && args.roadmapPlan.status !== "draft") {
    return {
      title: "Review MVP And Phase Boundaries",
      body:
        "Tighten the MVP definition, the critical path, and the phase boundaries before widening execution."
    };
  }

  if (args.activePhase === "strategy" && args.projectBrief.openQuestions.length > 0) {
    const nextQuestion = args.projectBrief.openQuestions[0];

    return {
      title: nextQuestion.label,
      body: nextQuestion.question
    };
  }

  if (!args.buildingSummary) {
    return {
      title: "Define What You're Building",
      body:
        "Start by giving the product a crisp description so the rest of the plan has something stable to build around."
    };
  }

  if (!args.audienceSummary) {
    return {
      title: "Identify Your First User",
      body:
        "Decide who this needs to work for first so the roadmap stays grounded in a real audience."
    };
  }

  if (!args.primaryGoal) {
    return {
      title: "Define Your First Use Case",
      body:
        "Clarify the first outcome this product needs to deliver before we widen into deeper planning."
    };
  }

  if (args.activePhase === "scope") {
    return {
      title: "Lock Your Version-One Scope",
      body:
        "Decide what absolutely belongs in the first release so the build plan can stay lean."
    };
  }

  if (args.activePhase === "mvp" || args.activePhase === "build") {
    return {
      title: "Define Your First User Experience",
      body:
        "What should someone be able to do the moment they land on your product?"
    };
  }

  return {
    title: "Define Your First User Experience",
    body: "What should someone be able to do the moment they land on your product?"
  };
}

export function buildProjectContextSnapshot(args: {
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief?: ProjectBrief | null;
  roadmapPlan?: RoadmapPlan | null;
}): ProjectContextSnapshot {
  const derivedProjectIntelligence =
    args.projectBrief && args.roadmapPlan
      ? null
      : buildWorkspaceProjectIntelligence({
          projectTitle: args.project.title,
          projectDescription: args.project.description,
          projectMetadata: args.projectMetadata
        });
  const projectBrief = args.projectBrief ?? derivedProjectIntelligence?.projectBrief;
  const roadmapPlan = args.roadmapPlan ?? derivedProjectIntelligence?.roadmapPlan ?? null;

  if (!projectBrief) {
    throw new Error("ProjectBrief is required to build the project context snapshot.");
  }
  const buildingSummary = buildBuildingSummary(args.project, args.projectMetadata, projectBrief);
  const audienceSummary = buildAudienceSummary(args.projectMetadata, projectBrief);
  const primaryGoal = buildPrimaryGoal(args.projectMetadata, projectBrief);
  const activePhase = resolveActivePhase({
    projectMetadata: args.projectMetadata,
    projectBrief
  });
  const phaseCopy = resolvePhaseCopy(activePhase);
  const currentFocus = resolveCurrentFocus({
    activePhase,
    buildingSummary,
    audienceSummary,
    primaryGoal,
    projectBrief,
    roadmapPlan
  });
  const nextStep = resolveNextStep({
    activePhase,
    buildingSummary,
    audienceSummary,
    primaryGoal,
    projectBrief,
    roadmapPlan
  });

  return {
    projectName: args.project.title,
    projectBrief,
    domainPack: projectBrief.domainPack,
    briefReadinessScore: projectBrief.readinessScore,
    briefReadinessStage: projectBrief.readiness.stage,
    missingCriticalSlots: projectBrief.missingCriticalSlots,
    buildingSummary,
    audienceSummary,
    primaryGoal,
    productSnapshot: clipSentence(
      pickFirstProjectContextText(args.project.title, buildingSummary),
      80
    ),
    focusSnapshot: clipSentence(
      pickFirstProjectContextText(
        args.projectMetadata?.buildSession?.scope.coreWorkflow,
        args.projectMetadata?.buildSession?.scope.mvpSummary,
        args.projectMetadata?.mobileAppIntake?.answers.proofOutcome,
        primaryGoal
      ),
      90
    ),
    activePhase,
    currentPhaseTitle: phaseCopy.title,
    currentPhaseBody: phaseCopy.body,
    currentFocus,
    nextStepTitle: nextStep.title,
    nextStepBody: nextStep.body
  };
}
