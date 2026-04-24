import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

export type WorkspacePhaseId = "strategy" | "scope" | "mvp" | "build";

export type ProjectContextSnapshot = {
  projectName: string;
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

function buildPrimaryGoal(projectMetadata?: StoredProjectMetadata | null) {
  const buildSession = projectMetadata?.buildSession ?? null;
  const saasIntake = projectMetadata?.saasIntake ?? null;
  const mobileAppIntake = projectMetadata?.mobileAppIntake ?? null;

  return clipSentence(
    pickFirstProjectContextText(
      buildSession?.scope.businessGoal,
      buildSession?.scope.problem,
      buildSession?.scope.projectDefinitionSummary,
      buildSession?.scope.mvpSummary,
      mobileAppIntake?.answers.proofOutcome,
      saasIntake?.answers.problem
    )
  );
}

function buildAudienceSummary(projectMetadata?: StoredProjectMetadata | null) {
  const buildSession = projectMetadata?.buildSession ?? null;
  const saasIntake = projectMetadata?.saasIntake ?? null;
  const mobileAppIntake = projectMetadata?.mobileAppIntake ?? null;

  return clipSentence(
    pickFirstProjectContextText(
      buildSession?.scope.targetUsers,
      buildSession?.scope.audience,
      mobileAppIntake?.answers.audience,
      saasIntake?.answers.customer
    ),
    140
  );
}

function buildBuildingSummary(project: ProjectRecord, projectMetadata?: StoredProjectMetadata | null) {
  const buildSession = projectMetadata?.buildSession ?? null;
  const saasIntake = projectMetadata?.saasIntake ?? null;
  const mobileAppIntake = projectMetadata?.mobileAppIntake ?? null;

  return clipSentence(
    pickFirstProjectContextText(
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

function resolveActivePhase(projectMetadata?: StoredProjectMetadata | null): WorkspacePhaseId {
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
}) {
  const phaseCopy = resolvePhaseCopy(args.activePhase);

  if (args.activePhase !== "strategy") {
    return phaseCopy.focus;
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
}) {
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
}): ProjectContextSnapshot {
  const buildingSummary = buildBuildingSummary(args.project, args.projectMetadata);
  const audienceSummary = buildAudienceSummary(args.projectMetadata);
  const primaryGoal = buildPrimaryGoal(args.projectMetadata);
  const activePhase = resolveActivePhase(args.projectMetadata);
  const phaseCopy = resolvePhaseCopy(activePhase);
  const currentFocus = resolveCurrentFocus({
    activePhase,
    buildingSummary,
    audienceSummary,
    primaryGoal
  });
  const nextStep = resolveNextStep({
    activePhase,
    buildingSummary,
    audienceSummary,
    primaryGoal
  });

  return {
    projectName: args.project.title,
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
