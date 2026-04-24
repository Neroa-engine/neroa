import type {
  ExampleBuildProject,
  ExampleBuildTypeId,
  ExampleFrameworkId,
  ExampleIndustryId,
  ExampleOpportunityAreaId
} from "@/lib/marketing/example-build-data";
import type { PricingPlanId } from "@/lib/pricing/config";

export type RealBuilderStepId =
  | "build-setup"
  | "business-direction"
  | "project-definition"
  | "framework-direction"
  | "build-plan";

export type RealBuilderBuildStageId = "mvp" | "partial-build" | "full-build";
export type RealBuilderConceptMode = "clear-concept" | "exploring-opportunities";
export type RealBuilderVentureType = "existing-business" | "new-venture";
export type RealBuilderSurfaceType = "customer-facing" | "internal" | "both";
export type RealBuilderPriorityTradeoff = "speed" | "cost" | "complexity";
export type RealBuilderExperienceStyle =
  | "internal-utility"
  | "balanced"
  | "polished-customer";
export type RealBuilderPlatformStyle = "web-first" | "mobile-ready-web" | "mobile-first";
export type RealBuilderAutomationLevel = "light" | "moderate" | "heavy";
export type RealBuilderComplexityLevel = "lean" | "moderate" | "advanced";
export type RealBuilderExecutionPathId = "diy-slower" | "diy-accelerated" | "managed";

export type RealBuilderBusinessDirection = {
  businessGoal: string;
  conceptMode: RealBuilderConceptMode | null;
  industryId: ExampleIndustryId | null;
  opportunityAreaId: ExampleOpportunityAreaId | null;
  ventureType: RealBuilderVentureType | null;
  surfaceType: RealBuilderSurfaceType | null;
};

export type RealBuilderProjectDefinition = {
  targetUsers: string;
  coreWorkflow: string;
  keyFeatures: string[];
  monetization: string;
  integrationNeeds: string[];
  priorityTradeoff: RealBuilderPriorityTradeoff | null;
};

export type RealBuilderExperienceDirection = {
  frameworkId: ExampleFrameworkId | null;
  experienceStyle: RealBuilderExperienceStyle | null;
  platformStyle: RealBuilderPlatformStyle | null;
  automationLevel: RealBuilderAutomationLevel | null;
  complexityLevel: RealBuilderComplexityLevel | null;
};

export type RealBuilderState = {
  productTypeId: ExampleBuildTypeId | null;
  buildStageId: RealBuilderBuildStageId | null;
  businessDirection: RealBuilderBusinessDirection;
  projectDefinition: RealBuilderProjectDefinition;
  experienceDirection: RealBuilderExperienceDirection;
};

export type RealBuilderPathOption = {
  id: RealBuilderExecutionPathId;
  label: string;
  summary: string;
  timeline: string;
  controlLevel: string;
  supportLevel: string;
  bestFor: string;
  recommended: boolean;
};

export type RealBuilderPlan = {
  title: string;
  userIntent: string;
  productTypeLabel: string;
  buildStageLabel: string;
  businessDirectionLabel: string;
  businessDirectionSummary: string;
  projectDefinitionSummary: string;
  frameworkId: ExampleFrameworkId;
  frameworkLabel: string;
  frameworkSummary: string;
  experienceDirectionSummary: string;
  systemsStack: string[];
  systemCards: Array<{
    label: string;
    role: string;
  }>;
  roadmap: Array<{
    label: string;
    summary: string;
  }>;
  estimateBaselineLabel: string;
  estimateRangeLabel: string;
  timeEstimateLabel: string;
  pricingStartingPointId: PricingPlanId;
  pricingStartingPointLabel: string;
  pricingStartingPointSummary: string;
  referenceProjectTitle: string | null;
  recommendedPathId: RealBuilderExecutionPathId;
  recommendedPathLabel: string;
  recommendedPathSummary: string;
  pathOptions: RealBuilderPathOption[];
};

export type PartialRecord = Record<string, unknown> | null | undefined;

export type PlanComputation = {
  referenceProject: ExampleBuildProject | null;
  baselineCredits: number;
  rangeMinCredits: number;
  rangeMaxCredits: number;
  recommendedPathId: RealBuilderExecutionPathId;
  pricingStartingPointId: PricingPlanId;
  pricingStartingPointLabel: string;
  pathOptions: RealBuilderPathOption[];
};

export const realBuilderSteps: Array<{
  id: RealBuilderStepId;
  label: string;
}> = [
  { id: "build-setup", label: "Build Setup" },
  { id: "business-direction", label: "Business Direction" },
  { id: "project-definition", label: "Project Definition" },
  { id: "framework-direction", label: "Framework + Experience" },
  { id: "build-plan", label: "Build Plan Output" }
];

export const realBuilderBuildStages: Array<{
  id: RealBuilderBuildStageId;
  label: string;
  description: string;
}> = [
  {
    id: "mvp",
    label: "MVP",
    description: "The smallest valuable version to validate and launch."
  },
  {
    id: "partial-build",
    label: "Partial Build",
    description: "A major portion or functional phase of the product."
  },
  {
    id: "full-build",
    label: "Full Build",
    description: "The full intended product scope based on current requirements."
  }
];

export const realBuilderConceptOptions: Array<{
  id: RealBuilderConceptMode;
  label: string;
  description: string;
}> = [
  {
    id: "clear-concept",
    label: "Clear concept",
    description: "You already know the product direction and want Neroa to shape it."
  },
  {
    id: "exploring-opportunities",
    label: "Exploring opportunities",
    description: "You want Neroa to help narrow the strongest opportunity area first."
  }
];

export const realBuilderVentureOptions: Array<{
  id: RealBuilderVentureType;
  label: string;
  description: string;
}> = [
  {
    id: "existing-business",
    label: "Existing business",
    description: "The product supports or expands something you already operate."
  },
  {
    id: "new-venture",
    label: "New venture",
    description: "The product is part of a new business or new commercial offer."
  }
];

export const realBuilderSurfaceOptions: Array<{
  id: RealBuilderSurfaceType;
  label: string;
  description: string;
}> = [
  {
    id: "customer-facing",
    label: "Customer-facing",
    description: "The first release is mainly for customers, clients, or members."
  },
  {
    id: "internal",
    label: "Internal",
    description: "The first release is mainly for operators, staff, or internal teams."
  },
  {
    id: "both",
    label: "Both",
    description: "The product needs an outside experience plus an internal control layer."
  }
];

export const realBuilderMonetizationOptions = [
  "Subscription or paid access",
  "Service or booking revenue",
  "Lead generation or pipeline value",
  "Internal efficiency or cost savings",
  "Marketplace or transaction fees",
  "Not sure yet"
] as const;

export const realBuilderIntegrationOptions = [
  "Auth / user accounts",
  "Payments / billing",
  "Email / notifications",
  "Analytics / reporting",
  "CRM / pipeline sync",
  "Calendar / scheduling",
  "AI / automation",
  "No major integrations yet"
] as const;

export const realBuilderPriorityOptions: Array<{
  id: RealBuilderPriorityTradeoff;
  label: string;
  description: string;
}> = [
  {
    id: "speed",
    label: "Speed",
    description: "Get to a serious first release quickly, even if the first scope stays tighter."
  },
  {
    id: "cost",
    label: "Cost",
    description: "Keep the first build practical and avoid widening too early."
  },
  {
    id: "complexity",
    label: "Depth",
    description: "Protect the product logic even if the first version takes more coordination."
  }
];

export const realBuilderExperienceStyleOptions: Array<{
  id: RealBuilderExperienceStyle;
  label: string;
  description: string;
}> = [
  {
    id: "internal-utility",
    label: "Internal utility",
    description: "Fast, clear, and operational rather than polished for public customers."
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Structured enough for operators while still feeling polished for outside users."
  },
  {
    id: "polished-customer",
    label: "Polished customer-facing",
    description: "More product design weight for trust, retention, and customer experience."
  }
];

export const realBuilderPlatformStyleOptions: Array<{
  id: RealBuilderPlatformStyle;
  label: string;
  description: string;
}> = [
  {
    id: "web-first",
    label: "Web-first",
    description: "Best when the first build mainly lives in desktop or browser workflows."
  },
  {
    id: "mobile-ready-web",
    label: "Mobile-ready web",
    description: "Build the web product correctly now so strong mobile use comes later without rework."
  },
  {
    id: "mobile-first",
    label: "Mobile-first",
    description: "The first experience needs to feel native to phones or field use immediately."
  }
];

export const realBuilderAutomationLevelOptions: Array<{
  id: RealBuilderAutomationLevel;
  label: string;
  description: string;
}> = [
  {
    id: "light",
    label: "Light automation",
    description: "Some smart triggers and workflow relief, but not a heavily automated system yet."
  },
  {
    id: "moderate",
    label: "Moderate automation",
    description: "Automation matters in the first release and should shape the system design now."
  },
  {
    id: "heavy",
    label: "Heavy automation",
    description: "Automation is central to the product value and likely affects the build path."
  }
];

export const realBuilderComplexityOptions: Array<{
  id: RealBuilderComplexityLevel;
  label: string;
  description: string;
}> = [
  {
    id: "lean",
    label: "Lean",
    description: "Keep the first version disciplined and narrow."
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "The first build needs real modules and integration depth, but still controlled."
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "The first scope already pushes into heavier execution or coordination."
  }
];

