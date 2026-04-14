import type { NaruaMessage } from "@/lib/narua/planning";
import { buildPricingRecommendation, type PricingRecommendation } from "@/lib/pricing/recommendation";
import type { ProjectLaneRecord, ProjectRecord } from "@/lib/workspace/project-lanes";

export type StrategyLaneField =
  | "concept"
  | "target"
  | "offer"
  | "launch"
  | "budget"
  | "needs";

export type StrategyRoadmapItem = {
  id: string;
  title: string;
  detail: string;
  status: "now" | "next" | "later";
};

export type StrategyBudgetEstimate = {
  title: string;
  rangeLabel: string;
  summary: string;
  lineItems: Array<{
    label: string;
    amountLabel: string;
    note: string;
  }>;
  assumptions: string[];
};

export type StrategyLaneLabels = {
  modelTitle: string;
  targetTitle: string;
  offerTitle: string;
  launchTitle: string;
  budgetTitle: string;
};

export type StrategyLaneAnswers = {
  concept: string;
  target: string;
  offer: string;
  launch: string;
  budget: string;
  needs: string;
};

export type StrategyLaneOutputs = {
  projectSummary: string;
  model: string;
  target: string;
  offer: string;
  launch: string;
  roadmap: StrategyRoadmapItem[];
  budget: StrategyBudgetEstimate;
  recommendedPlan: PricingRecommendation;
  recentActions: string[];
  blockers: string[];
};

export type StrategyLaneSnapshot = {
  version: 1;
  messages: NaruaMessage[];
  draft: string;
  updatedAt: string;
  contextTitle: string | null;
  activeQuestionField: StrategyLaneField | null;
  answers: StrategyLaneAnswers;
  outputs: StrategyLaneOutputs | null;
};

export type StrategyLaneQuestion = {
  field: StrategyLaneField;
  prompt: string;
};

function createMessage(role: NaruaMessage["role"], content: string): NaruaMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content
  };
}

function parseBudgetHint(value: string) {
  const matches = value.replace(/,/g, "").match(/\$?\d+(?:\.\d+)?/g);

  if (!matches || matches.length === 0) {
    return null;
  }

  const numbers = matches
    .map((item) => Number(item.replace(/\$/g, "")))
    .filter((item) => Number.isFinite(item));

  if (numbers.length === 0) {
    return null;
  }

  return Math.max(...numbers);
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

function buildRangeLabel(low: number, high: number) {
  return `${formatMoney(low)} - ${formatMoney(high)}`;
}

function buildBudgetEstimate(project: ProjectRecord, answers: StrategyLaneAnswers): StrategyBudgetEstimate {
  const explicitBudget = parseBudgetHint(answers.budget);
  const templateBase =
    project.templateId === "business-launch"
      ? { low: 2000, high: 9000 }
      : project.templateId === "ecommerce-brand"
        ? { low: 3500, high: 14000 }
        : project.templateId === "saas-build"
          ? { low: 18000, high: 65000 }
          : project.templateId === "mobile-app-build"
            ? { low: 25000, high: 90000 }
          : { low: 12000, high: 45000 };
  const budgetRange = explicitBudget
    ? {
        low: Math.round(explicitBudget * 0.85),
        high: Math.round(explicitBudget * 1.35)
      }
    : templateBase;

  return {
    title:
      project.templateId === "saas-build" ||
      project.templateId === "coding-project" ||
      project.templateId === "mobile-app-build"
        ? "Estimated build budget"
        : "Estimated startup budget",
    rangeLabel: buildRangeLabel(budgetRange.low, budgetRange.high),
    summary: explicitBudget
      ? `Naroa is using the stated budget signal of about ${formatMoney(explicitBudget)} and adding delivery buffer for execution, retries, and supporting systems.`
      : `Naroa estimated a realistic first-phase range based on project type, lane complexity, and the current launch scope.`,
    lineItems: [
      {
        label:
          project.templateId === "saas-build" ||
          project.templateId === "coding-project" ||
          project.templateId === "mobile-app-build"
            ? "Scoping and implementation planning"
            : "Strategy and launch foundation",
        amountLabel: buildRangeLabel(Math.round(budgetRange.low * 0.28), Math.round(budgetRange.high * 0.32)),
        note: "Naroa planning, structure, and first execution framing."
      },
      {
        label:
          project.templateId === "saas-build" ||
          project.templateId === "coding-project" ||
          project.templateId === "mobile-app-build"
            ? "Technical setup and delivery work"
            : "Website, brand, and operating setup",
        amountLabel: buildRangeLabel(Math.round(budgetRange.low * 0.35), Math.round(budgetRange.high * 0.42)),
        note: "Customer-facing build surface plus the supporting systems that keep it usable."
      },
      {
        label:
          project.templateId === "saas-build" ||
          project.templateId === "coding-project" ||
          project.templateId === "mobile-app-build"
            ? "Testing, iterations, and launch buffer"
            : "Marketing, launch, and contingency buffer",
        amountLabel: buildRangeLabel(Math.round(budgetRange.low * 0.18), Math.round(budgetRange.high * 0.26)),
        note: "Buffer for inevitable revisions, retries, and scope correction."
      }
    ],
    assumptions: [
      "Estimate includes orchestration overhead, retries, and supporting execution work rather than raw model cost only.",
      explicitBudget
        ? "Naroa will keep checking this range against the actual scope as the strategy gets sharper."
        : "Provide a firmer budget signal to tighten the estimate.",
      answers.needs.trim()
        ? `Current supporting needs: ${answers.needs.trim()}`
        : "Website, brand, and operations needs are still flexible and may change the range."
    ]
  };
}

function createRoadmap(project: ProjectRecord, answers: StrategyLaneAnswers): StrategyRoadmapItem[] {
  const modelLabel =
    project.templateId === "saas-build"
      ? "Product direction"
      : project.templateId === "mobile-app-build"
        ? "Mobile app direction"
      : project.templateId === "ecommerce-brand"
        ? "Brand and store direction"
        : project.templateId === "coding-project"
          ? "Delivery direction"
          : "Business direction";

  return [
    {
      id: "align-direction",
      title: `Lock the ${modelLabel.toLowerCase()}`,
      detail: `Turn ${answers.concept || "the project concept"} into one sharp direction that Naroa can defend across the rest of the project.`,
      status: "now"
    },
    {
      id: "shape-offer",
      title: "Shape the first offer or outcome",
      detail: `Make ${answers.offer || "the first offer"} concrete enough that launch and budget choices stop drifting.`,
      status: "now"
    },
    {
      id: "build-surface",
      title: "Prepare the first launch surface",
      detail: `Use ${answers.needs || "the current support needs"} to decide what website, brand, operations, or technical setup must happen before launch.`,
      status: "next"
    },
    {
      id: "launch-motion",
      title: "Sequence the first 90 days",
      detail: `Keep the first 90-day push centered on ${answers.launch || "a narrow launch direction"} so the project stays practical.`,
      status: "later"
    }
  ];
}

function getLabels(project: ProjectRecord): StrategyLaneLabels {
  if (project.templateId === "saas-build") {
    return {
      modelTitle: "Product model",
      targetTitle: "Target user",
      offerTitle: "Offer logic",
      launchTitle: "Launch direction",
      budgetTitle: "Estimated build budget"
    };
  }

  if (project.templateId === "mobile-app-build") {
    return {
      modelTitle: "App model",
      targetTitle: "Target mobile user",
      offerTitle: "MVP outcome",
      launchTitle: "Launch direction",
      budgetTitle: "Estimated mobile budget"
    };
  }

  if (project.templateId === "ecommerce-brand") {
    return {
      modelTitle: "Brand model",
      targetTitle: "Target customer",
      offerTitle: "Offer logic",
      launchTitle: "Launch direction",
      budgetTitle: "Estimated launch budget"
    };
  }

  if (project.templateId === "coding-project") {
    return {
      modelTitle: "Delivery model",
      targetTitle: "Primary stakeholder",
      offerTitle: "Execution logic",
      launchTitle: "Delivery direction",
      budgetTitle: "Estimated project budget"
    };
  }

  return {
    modelTitle: "Business model",
    targetTitle: "Target customer",
    offerTitle: "Offer logic",
    launchTitle: "Launch direction",
    budgetTitle: "Estimated startup budget"
  };
}

function getQuestionPrompt(project: ProjectRecord, field: StrategyLaneField, answers: StrategyLaneAnswers) {
  switch (project.templateId) {
    case "saas-build":
      switch (field) {
        case "concept":
          return "What kind of SaaS or product are you building, and what problem should it solve first?";
        case "target":
          return "Who is the first user or buyer you need to win?";
        case "offer":
          return "What is the smallest valuable outcome the product should deliver first?";
        case "launch":
          return "What does the first launch need to prove in the next 90 days?";
        case "budget":
          return "What build budget and delivery window are you planning around?";
        case "needs":
          return "Do you need Naroa to include website, developer brief, and launch planning in the first phase?";
      }
      break;
    case "mobile-app-build":
      switch (field) {
        case "concept":
          return "What mobile app are you building, and what problem should it solve first?";
        case "target":
          return "Who is the first mobile user you need to win?";
        case "offer":
          return "What is the smallest valuable app outcome the MVP should deliver first?";
        case "launch":
          return "What should the first beta or app-store release prove?";
        case "budget":
          return "What budget, platform target, and delivery window are you trying to protect?";
        case "needs":
          return "Do you need accounts, payments, notifications, device features, or a web companion in phase one?";
      }
      break;
    case "ecommerce-brand":
      switch (field) {
        case "concept":
          return "What kind of ecommerce brand are you launching?";
        case "target":
          return "Who is the first customer group you want the brand to serve?";
        case "offer":
          return "What products or offer logic should lead the launch?";
        case "launch":
          return "What should the first launch direction accomplish?";
        case "budget":
          return "What launch budget and timeline are you working with?";
        case "needs":
          return "Do you need Naroa to include branding, domain, storefront, and marketing setup right away?";
      }
      break;
    case "coding-project":
      switch (field) {
        case "concept":
          return "What is the project, system, or code initiative you want Naroa to structure first?";
        case "target":
          return "Who is the primary stakeholder or end user this needs to help first?";
        case "offer":
          return "What should the first deliverable or outcome actually accomplish?";
        case "launch":
          return "What does a successful first delivery cycle look like?";
        case "budget":
          return "What delivery budget or time window are you planning around?";
        case "needs":
          return "Do you need Naroa to include repo planning, implementation workflow, or release coordination now?";
      }
      break;
    default:
      switch (field) {
        case "concept":
          return "What type of business are you trying to build or launch?";
        case "target":
          return "Who is the target customer you want to serve first?";
        case "offer":
          return "What will you offer or sell first?";
        case "launch":
          return "What should the launch direction accomplish in the next 90 days?";
        case "budget":
          return "What budget and timeline are you working with?";
        case "needs":
          return "Do you need website, brand, and operations setup in the first phase?";
      }
  }

  return `Tell Naroa more about ${field}.`;
}

const questionOrder: StrategyLaneField[] = [
  "concept",
  "target",
  "offer",
  "launch",
  "budget",
  "needs"
];

function getNextQuestionField(answers: StrategyLaneAnswers) {
  return questionOrder.find((field) => !answers[field].trim()) ?? null;
}

function createEmptyAnswers(): StrategyLaneAnswers {
  return {
    concept: "",
    target: "",
    offer: "",
    launch: "",
    budget: "",
    needs: ""
  };
}

function createOutputSummary(project: ProjectRecord, answers: StrategyLaneAnswers) {
  if (project.templateId === "saas-build") {
    return `${answers.concept} is being shaped into a focused SaaS plan for ${answers.target}, with the first launch built around ${answers.offer}.`;
  }

  if (project.templateId === "mobile-app-build") {
    return `${answers.concept} is being shaped into a focused mobile app plan for ${answers.target}, with the first release centered on ${answers.offer}.`;
  }

  if (project.templateId === "ecommerce-brand") {
    return `${answers.concept} is being framed as an ecommerce launch for ${answers.target}, with the first commercial push centered on ${answers.offer}.`;
  }

  if (project.templateId === "coding-project") {
    return `${answers.concept} is being structured as a delivery plan for ${answers.target}, with the first execution path focused on ${answers.offer}.`;
  }

  return `${answers.concept} is being framed as a business launch for ${answers.target}, with the first offer centered on ${answers.offer}.`;
}

function createOutputs(project: ProjectRecord, lane: ProjectLaneRecord, answers: StrategyLaneAnswers): StrategyLaneOutputs {
  const labels = getLabels(project);
  const recommendedPlan = buildPricingRecommendation({
    templateId: project.templateId,
    laneCount: project.lanes.length,
    concept: answers.concept,
    target: answers.target,
    offer: answers.offer,
    launch: answers.launch,
    budget: answers.budget,
    needs: answers.needs
  });
  const budget = buildBudgetEstimate(project, answers);

  return {
    projectSummary: createOutputSummary(project, answers),
    model: `${answers.concept} should be organized as a focused ${project.templateLabel.toLowerCase()} workflow with ${lane.title.toLowerCase()} leading the project direction before the other lanes widen execution.`,
    target: `${answers.target} should feel like the first clear audience, not a broad market. Naroa should keep later strategy work anchored to what this group values first.`,
    offer: `${answers.offer} should be the first offer or first deliverable Naroa protects as the project scope tightens. Anything that does not strengthen this first outcome should stay secondary.`,
    launch: `${answers.launch} should guide the first 90-day push. Naroa should keep roadmap decisions, budget tradeoffs, and lane sequencing aligned to that direction.`,
    roadmap: createRoadmap(project, answers),
    budget,
    recommendedPlan,
    recentActions: [
      `Locked the first ${labels.targetTitle.toLowerCase()}.`,
      `Defined the first ${labels.offerTitle.toLowerCase()}.`,
      `Generated the first roadmap, budget, and plan recommendation.`
    ],
    blockers:
      answers.needs.trim().length > 0
        ? []
        : ["Support needs are still open. Clarify whether website, brand, build, or operations setup belongs in the first phase."]
  };
}

function inferRefinementField(message: string): StrategyLaneField | null {
  const normalized = message.toLowerCase();

  if (normalized.includes("customer") || normalized.includes("user") || normalized.includes("audience")) {
    return "target";
  }

  if (normalized.includes("offer") || normalized.includes("service") || normalized.includes("product")) {
    return "offer";
  }

  if (normalized.includes("budget") || normalized.includes("$") || normalized.includes("cost")) {
    return "budget";
  }

  if (normalized.includes("launch") || normalized.includes("timeline") || normalized.includes("roadmap")) {
    return "launch";
  }

  if (normalized.includes("website") || normalized.includes("brand") || normalized.includes("operations") || normalized.includes("need")) {
    return "needs";
  }

  if (normalized.includes("business") || normalized.includes("model") || normalized.includes("strategy")) {
    return "concept";
  }

  return null;
}

function appendUniqueTop(items: string[], item: string, maxItems = 4) {
  return [item, ...items.filter((value) => value !== item)].slice(0, maxItems);
}

export function isStrategyLane(lane: Pick<ProjectLaneRecord, "slug" | "title">) {
  return lane.slug.includes("strategy") || lane.title.toLowerCase().includes("strategy");
}

export function getStrategyLaneLabels(project: ProjectRecord) {
  return getLabels(project);
}

export function createStrategyLaneInitialSnapshot(project: ProjectRecord, lane: ProjectLaneRecord): StrategyLaneSnapshot {
  const intro =
    project.templateId === "saas-build"
      ? `Naroa is active in ${lane.title}. Start with the product direction and I will shape the first strategy summary, roadmap, budget estimate, and plan recommendation.`
      : project.templateId === "mobile-app-build"
        ? `Naroa is active in ${lane.title}. Start with the mobile app direction and I will shape the first app summary, roadmap, budget estimate, and stack recommendation.`
      : project.templateId === "ecommerce-brand"
        ? `Naroa is active in ${lane.title}. Tell me what brand or store you want to build first and I will shape the launch direction, roadmap, budget, and plan recommendation.`
        : project.templateId === "coding-project"
          ? `Naroa is active in ${lane.title}. Tell me what initiative you want to structure and I will turn it into a sharper delivery direction, roadmap, budget estimate, and plan recommendation.`
          : `Naroa is active in ${lane.title}. Tell me what business you want to build and I will turn it into a sharper strategy, roadmap, budget estimate, and plan recommendation.`;

  return {
    version: 1,
    messages: [createMessage("narua", intro)],
    draft: "",
    updatedAt: new Date(0).toISOString(),
    contextTitle: lane.title,
    activeQuestionField: "concept",
    answers: createEmptyAnswers(),
    outputs: null
  };
}

function parseStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isStrategyRoadmapItem(value: unknown): value is StrategyRoadmapItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.detail === "string" &&
    (record.status === "now" || record.status === "next" || record.status === "later")
  );
}

function parseBudgetEstimate(value: unknown): StrategyBudgetEstimate | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.title !== "string" ||
    typeof record.rangeLabel !== "string" ||
    typeof record.summary !== "string" ||
    !Array.isArray(record.lineItems) ||
    !Array.isArray(record.assumptions)
  ) {
    return null;
  }

  return {
    title: record.title,
    rangeLabel: record.rangeLabel,
    summary: record.summary,
    lineItems: record.lineItems.filter(
      (item): item is StrategyBudgetEstimate["lineItems"][number] =>
        Boolean(item) &&
        typeof item === "object" &&
        "label" in item &&
        typeof item.label === "string" &&
        "amountLabel" in item &&
        typeof item.amountLabel === "string" &&
        "note" in item &&
        typeof item.note === "string"
    ),
    assumptions: parseStringArray(record.assumptions)
  };
}

function parsePricingRecommendation(value: unknown): PricingRecommendation | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.recommendedPlanId !== "string" ||
    !record.recommendedPlan ||
    typeof record.recommendedPlan !== "object" ||
    typeof record.projectedUsageBand !== "string" ||
    (typeof record.projectedMonthlyExecutionCredits !== "number" &&
      typeof record.projectedMonthlyCredits !== "number") ||
    !record.estimatedCostToServeMonthly ||
    typeof record.estimatedCostToServeMonthly !== "object" ||
    !Array.isArray(record.rationale) ||
    !Array.isArray(record.upgradeSignals) ||
    typeof record.usageHeadline !== "string"
  ) {
    return null;
  }

  const estimatedCostToServeMonthly = record.estimatedCostToServeMonthly as Record<string, unknown>;

  if (
    typeof estimatedCostToServeMonthly.low !== "number" ||
    typeof estimatedCostToServeMonthly.high !== "number"
  ) {
    return null;
  }

  return {
    recommendedPlanId: record.recommendedPlanId as PricingRecommendation["recommendedPlanId"],
    recommendedPlan: record.recommendedPlan as PricingRecommendation["recommendedPlan"],
    projectedUsageBand: record.projectedUsageBand as PricingRecommendation["projectedUsageBand"],
    projectedMonthlyExecutionCredits:
      typeof record.projectedMonthlyExecutionCredits === "number"
        ? record.projectedMonthlyExecutionCredits
        : (record.projectedMonthlyCredits as number),
    estimatedCostToServeMonthly: {
      low: estimatedCostToServeMonthly.low,
      high: estimatedCostToServeMonthly.high
    },
    rationale: parseStringArray(record.rationale),
    upgradeSignals: parseStringArray(record.upgradeSignals),
    usageHeadline: record.usageHeadline
  };
}

export function parseStrategyLaneSnapshot(value: string | null): StrategyLaneSnapshot | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StrategyLaneSnapshot> | null;

    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.messages) || typeof parsed.draft !== "string") {
      return null;
    }

    return {
      version: 1,
      messages: parsed.messages as NaruaMessage[],
      draft: parsed.draft,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
      contextTitle: typeof parsed.contextTitle === "string" ? parsed.contextTitle : null,
      activeQuestionField:
        parsed.activeQuestionField && questionOrder.includes(parsed.activeQuestionField)
          ? parsed.activeQuestionField
          : null,
      answers: {
        concept: typeof parsed.answers?.concept === "string" ? parsed.answers.concept : "",
        target: typeof parsed.answers?.target === "string" ? parsed.answers.target : "",
        offer: typeof parsed.answers?.offer === "string" ? parsed.answers.offer : "",
        launch: typeof parsed.answers?.launch === "string" ? parsed.answers.launch : "",
        budget: typeof parsed.answers?.budget === "string" ? parsed.answers.budget : "",
        needs: typeof parsed.answers?.needs === "string" ? parsed.answers.needs : ""
      },
      outputs:
        parsed.outputs &&
        typeof parsed.outputs.projectSummary === "string" &&
        typeof parsed.outputs.model === "string" &&
        typeof parsed.outputs.target === "string" &&
        typeof parsed.outputs.offer === "string" &&
        typeof parsed.outputs.launch === "string" &&
        Array.isArray(parsed.outputs.roadmap)
          ? (() => {
              const budget = parseBudgetEstimate(parsed.outputs?.budget);
              const recommendedPlan = parsePricingRecommendation(parsed.outputs?.recommendedPlan);

              if (!budget || !recommendedPlan) {
                return null;
              }

              return {
                projectSummary: parsed.outputs?.projectSummary ?? "",
                model: parsed.outputs?.model ?? "",
                target: parsed.outputs?.target ?? "",
                offer: parsed.outputs?.offer ?? "",
                launch: parsed.outputs?.launch ?? "",
                roadmap: parsed.outputs.roadmap.filter(isStrategyRoadmapItem),
                budget,
                recommendedPlan,
                recentActions: parseStringArray(parsed.outputs?.recentActions),
                blockers: parseStringArray(parsed.outputs?.blockers)
              };
            })()
          : null
    };
  } catch {
    return null;
  }
}

export function buildStrategyLaneSnapshotStorageValue(snapshot: StrategyLaneSnapshot) {
  return JSON.stringify(snapshot);
}

export function getStrategyLaneQuestion(
  project: ProjectRecord,
  answers: StrategyLaneAnswers,
  field: StrategyLaneField | null
): StrategyLaneQuestion | null {
  const nextField = field ?? getNextQuestionField(answers);

  if (!nextField) {
    return null;
  }

  return {
    field: nextField,
    prompt: getQuestionPrompt(project, nextField, answers)
  };
}

export function getStrategySuggestedPrompts(project: ProjectRecord, lane: ProjectLaneRecord) {
  const common = [
    "Help me sharpen the strategy.",
    "Estimate the budget and complexity.",
    "Recommend the right Neroa plan."
  ];

  return Array.from(new Set([...lane.starterPrompts, ...common])).slice(0, 6);
}

export function createStrategyNarration(project: ProjectRecord, outputs: StrategyLaneOutputs) {
  return `Naroa has shaped the first ${project.templateLabel.toLowerCase()} direction, refreshed the roadmap and budget, and recommended the strongest plan for the current scope.`;
}

export function appendStrategyUserMessage(
  snapshot: StrategyLaneSnapshot,
  content: string
) {
  return {
    ...snapshot,
    messages: [...snapshot.messages, createMessage("user", content)]
  };
}

export function buildStrategyLaneStateFromMessage(args: {
  project: ProjectRecord;
  lane: ProjectLaneRecord;
  snapshot: StrategyLaneSnapshot;
  message: string;
}) {
  const value = args.message.trim();

  if (!value) {
    return {
      snapshot: args.snapshot,
      naruaReply: ""
    };
  }

  const nextSnapshot = appendStrategyUserMessage(args.snapshot, value);

  if (!nextSnapshot.outputs) {
    const currentField = nextSnapshot.activeQuestionField ?? getNextQuestionField(nextSnapshot.answers);
    const nextAnswers = {
      ...nextSnapshot.answers,
      ...(currentField ? { [currentField]: value } : {})
    } as StrategyLaneAnswers;
    const nextQuestionField = getNextQuestionField(nextAnswers);

    if (!nextQuestionField) {
      const outputs = createOutputs(args.project, args.lane, nextAnswers);
      const naruaReply = createStrategyNarration(args.project, outputs);

      return {
        snapshot: {
          ...nextSnapshot,
          answers: nextAnswers,
          activeQuestionField: null,
          outputs,
          messages: [...nextSnapshot.messages, createMessage("narua", naruaReply)],
          updatedAt: new Date().toISOString()
        },
        naruaReply
      };
    }

    const question = getStrategyLaneQuestion(args.project, nextAnswers, nextQuestionField);
    const naruaReply = question?.prompt ?? "Tell Naroa a little more so I can sharpen the strategy.";

    return {
      snapshot: {
        ...nextSnapshot,
        answers: nextAnswers,
        activeQuestionField: nextQuestionField,
        messages: [...nextSnapshot.messages, createMessage("narua", naruaReply)],
        updatedAt: new Date().toISOString()
      },
      naruaReply
    };
  }

  const refinementField = inferRefinementField(value);
  const nextAnswers = refinementField
    ? {
        ...nextSnapshot.answers,
        [refinementField]: value
      }
    : nextSnapshot.answers;
  const nextOutputs = createOutputs(args.project, args.lane, nextAnswers);
  const blockers = value.toLowerCase().includes("blocked") || value.toLowerCase().includes("stuck")
    ? appendUniqueTop(nextOutputs.blockers, value)
    : nextOutputs.blockers;
  const recentActions = appendUniqueTop(nextOutputs.recentActions, `Updated strategy direction: ${value}`);
  const naruaReply = refinementField
    ? `Naroa updated the ${getLabels(args.project)[
        refinementField === "concept"
          ? "modelTitle"
          : refinementField === "target"
            ? "targetTitle"
            : refinementField === "offer"
              ? "offerTitle"
              : refinementField === "launch"
                ? "launchTitle"
                : refinementField === "budget"
                  ? "budgetTitle"
                  : "launchTitle"
      ].toLowerCase()} and refreshed the roadmap, budget, and plan recommendation.`
    : "Naroa captured that refinement and refreshed the strategy outputs so the project stays aligned.";

  return {
    snapshot: {
      ...nextSnapshot,
      answers: nextAnswers,
      outputs: {
        ...nextOutputs,
        blockers,
        recentActions
      },
      messages: [...nextSnapshot.messages, createMessage("narua", naruaReply)],
      updatedAt: new Date().toISOString()
    },
    naruaReply
  };
}

export function updateStrategyOutputBlock(
  snapshot: StrategyLaneSnapshot,
  key: "model" | "target" | "offer" | "launch",
  value: string
) {
  if (!snapshot.outputs) {
    return snapshot;
  }

  return {
    ...snapshot,
    outputs: {
      ...snapshot.outputs,
      [key]: value,
      recentActions: appendUniqueTop(snapshot.outputs.recentActions, `Edited ${key} block`)
    },
    updatedAt: new Date().toISOString()
  };
}

export function getStrategyLaneOverviewSummary(snapshot: StrategyLaneSnapshot | null) {
  if (!snapshot?.outputs) {
    return null;
  }

  return {
    projectSummary: snapshot.outputs.projectSummary,
    roadmap: snapshot.outputs.roadmap,
    budget: snapshot.outputs.budget,
    recommendedPlan: snapshot.outputs.recommendedPlan,
    recentActions: snapshot.outputs.recentActions,
    blockers: snapshot.outputs.blockers
  };
}
