import type {
  BuildCategoryId,
  BuildTemplateFeature,
  GuidedBuildBlueprint
} from "@/lib/onboarding/guided-build";
import type {
  MobileAppWorkspaceBlueprint
} from "@/lib/onboarding/mobile-app-intake";
import type { SaasWorkspaceBlueprint } from "@/lib/onboarding/saas-intake";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";
import {
  getBuildReviewLoop,
  getEngineConnectedServices,
  getExecutionRoutingModel,
  type BuildReviewLoopItem,
  type ConnectedService,
  type OrchestrationRoutingItem
} from "@/lib/workspace/execution-orchestration";

export type BuildOrchestrationStage =
  | "blueprint"
  | "execution_setup"
  | "build"
  | "review"
  | "launch";

export type BuildSessionStatus =
  | "draft"
  | "queued"
  | "in_progress"
  | "review"
  | "blocked"
  | "completed"
  | "cancelled";

export type BuildModuleSelection = {
  id: string;
  label: string;
  stage: "required" | "expansion" | "optional";
  description: string;
  reason: string;
};

export type BuildConfiguration = {
  workspaceId: string;
  workspaceName: string;
  sourceFlow: "decision-engine" | "saas-intake" | "mobile-app-intake" | "generic";
  templateId: string | null;
  categoryId: BuildCategoryId | "general";
  frameworkId: string | null;
  frameworkLabel: string | null;
  blueprintSummary: string;
  buildPathLabel: string | null;
  buildPathValue: string | null;
  buildPathDetail: string | null;
  laneStructure: string[];
  modules: {
    required: BuildModuleSelection[];
    expansion: BuildModuleSelection[];
    optional: BuildModuleSelection[];
  };
  connectedServices: ConnectedService[];
  orchestrationRouting: OrchestrationRoutingItem[];
  reviewLoop: BuildReviewLoopItem[];
  recommendedTierId: string | null;
  recommendedTierLabel: string | null;
  complexityScore: number | null;
  complexityLabel: string | null;
  executionIntensity: string | null;
  variationSeed: string | null;
  variationLayoutId: string | null;
  variationNavigationId: string | null;
};

export type InitialBuildSessionState = {
  status: BuildSessionStatus;
  stage: BuildOrchestrationStage;
  buildConfiguration: BuildConfiguration;
  progressSnapshot: {
    currentStep: string;
    nextStep: string;
    summary: string;
    moduleCount: number;
    requiredModuleCount: number;
    connectedServicesReady: number;
    connectedServicesTotal: number;
  };
};

function normalizeFeatureCard(
  feature: Pick<BuildTemplateFeature, "id" | "label" | "whatItDoes" | "whyIncluded">,
  stage: BuildModuleSelection["stage"]
): BuildModuleSelection {
  return {
    id: feature.id,
    label: feature.label,
    stage,
    description: feature.whatItDoes,
    reason: feature.whyIncluded
  };
}

function uniqueModules(modules: BuildModuleSelection[]) {
  const seen = new Set<string>();

  return modules.filter((module) => {
    if (seen.has(module.id)) {
      return false;
    }

    seen.add(module.id);
    return true;
  });
}

function featureModulesFromLabels(
  labels: string[],
  stage: BuildModuleSelection["stage"]
) {
  return labels.map((label, index) => ({
    id: `${stage}-${index}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label,
    stage,
    description: `${label} is part of the current guided build scope.`,
    reason: "This module was included by the intake flow and can be tightened later inside the Engine."
  }));
}

function buildGuidedConfiguration(
  workspaceId: string,
  workspaceName: string,
  guidedBuildIntake: GuidedBuildBlueprint
): BuildConfiguration {
  const requiredModules = uniqueModules(
    (guidedBuildIntake.requiredModuleCards ?? guidedBuildIntake.featureCards).map((feature) =>
      normalizeFeatureCard(feature, "required")
    )
  );
  const expansionModules = uniqueModules(
    (guidedBuildIntake.expansionModuleCards ?? []).map((feature) =>
      normalizeFeatureCard(feature, "expansion")
    )
  );
  const optionalModules = uniqueModules(
    (guidedBuildIntake.optionalModuleCards ?? []).map((feature) =>
      normalizeFeatureCard(feature, "optional")
    )
  );

  return {
    workspaceId,
    workspaceName,
    sourceFlow: "decision-engine",
    templateId: guidedBuildIntake.templateId,
    categoryId: guidedBuildIntake.categoryId,
    frameworkId: guidedBuildIntake.recommendedFrameworkId ?? guidedBuildIntake.selectedTemplateId,
    frameworkLabel:
      guidedBuildIntake.recommendedFrameworkLabel ?? guidedBuildIntake.selectedTemplateName,
    blueprintSummary: guidedBuildIntake.projectSummary,
    buildPathLabel: guidedBuildIntake.primaryBuildPathLabel,
    buildPathValue: guidedBuildIntake.primaryBuildPathValue,
    buildPathDetail: guidedBuildIntake.primaryBuildPathDetail,
    laneStructure: guidedBuildIntake.laneStructure,
    modules: {
      required: requiredModules,
      expansion: expansionModules,
      optional: optionalModules
    },
    connectedServices: getEngineConnectedServices({
      categoryId: guidedBuildIntake.categoryId,
      featureCards: guidedBuildIntake.featureCards
    }),
    orchestrationRouting: getExecutionRoutingModel(),
    reviewLoop: getBuildReviewLoop(),
    recommendedTierId: guidedBuildIntake.recommendedTierId ?? null,
    recommendedTierLabel: guidedBuildIntake.recommendedTierLabel ?? null,
    complexityScore: guidedBuildIntake.complexityScore ?? null,
    complexityLabel: guidedBuildIntake.complexityLabel ?? null,
    executionIntensity: guidedBuildIntake.executionIntensity ?? null,
    variationSeed: guidedBuildIntake.variationSeed ?? null,
    variationLayoutId: guidedBuildIntake.variationLayoutId ?? null,
    variationNavigationId: guidedBuildIntake.variationNavigationId ?? null
  };
}

function buildSaasConfiguration(
  workspaceId: string,
  workspaceName: string,
  saasIntake: SaasWorkspaceBlueprint
): BuildConfiguration {
  return {
    workspaceId,
    workspaceName,
    sourceFlow: "saas-intake",
    templateId: "saas-build",
    categoryId: "saas",
    frameworkId: "saas-build-system",
    frameworkLabel: "SaaS build system",
    blueprintSummary: saasIntake.projectSummary,
    buildPathLabel: "Recommended App Stack",
    buildPathValue: "Next.js + Supabase" + (saasIntake.answers.takesPayments === "yes" ? " + Stripe" : ""),
    buildPathDetail:
      "Keep the first SaaS release centered on one clear workflow, then widen the system after the commercial loop is proven.",
    laneStructure: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build", "Launch", "Operate"],
    modules: {
      required: featureModulesFromLabels(saasIntake.mvpFeatureList, "required"),
      expansion: [],
      optional: []
    },
    connectedServices: getEngineConnectedServices({
      categoryId: "saas",
      paymentsEnabled: saasIntake.answers.takesPayments === "yes",
      accountsEnabled: saasIntake.answers.needsAccounts === "yes"
    }),
    orchestrationRouting: getExecutionRoutingModel(),
    reviewLoop: getBuildReviewLoop(),
    recommendedTierId: null,
    recommendedTierLabel: null,
    complexityScore: null,
    complexityLabel: saasIntake.buildComplexity.label,
    executionIntensity: saasIntake.buildComplexity.label === "Advanced" ? "High" : "Moderate",
    variationSeed: null,
    variationLayoutId: null,
    variationNavigationId: null
  };
}

function buildMobileConfiguration(
  workspaceId: string,
  workspaceName: string,
  mobileAppIntake: MobileAppWorkspaceBlueprint
): BuildConfiguration {
  return {
    workspaceId,
    workspaceName,
    sourceFlow: "mobile-app-intake",
    templateId: "mobile-app-build",
    categoryId: "mobile-app",
    frameworkId: "react-native-expo",
    frameworkLabel: "React Native + Expo",
    blueprintSummary: mobileAppIntake.projectSummary,
    buildPathLabel: "Recommended App Stack",
    buildPathValue: mobileAppIntake.stackRecommendation.recommendedPathValue,
    buildPathDetail: mobileAppIntake.stackRecommendation.summary,
    laneStructure: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build", "Launch", "Operate"],
    modules: {
      required: featureModulesFromLabels(mobileAppIntake.featureList, "required"),
      expansion: [],
      optional: featureModulesFromLabels(mobileAppIntake.screenList, "optional")
    },
    connectedServices: getEngineConnectedServices({
      categoryId: "mobile-app",
      mobilePlatformTarget: mobileAppIntake.answers.platformTarget,
      companionSurface: mobileAppIntake.answers.companionSurface,
      paymentsEnabled: mobileAppIntake.answers.needsPayments === "yes",
      accountsEnabled: mobileAppIntake.answers.needsAccounts === "yes"
    }),
    orchestrationRouting: getExecutionRoutingModel(),
    reviewLoop: getBuildReviewLoop(),
    recommendedTierId: null,
    recommendedTierLabel: null,
    complexityScore: null,
    complexityLabel: mobileAppIntake.buildComplexity.label,
    executionIntensity: mobileAppIntake.buildComplexity.label === "Advanced" ? "High" : "Moderate",
    variationSeed: null,
    variationLayoutId: null,
    variationNavigationId: null
  };
}

function buildGenericConfiguration(
  workspaceId: string,
  workspaceName: string,
  visibleDescription: string | null,
  templateId: string | null
): BuildConfiguration {
  return {
    workspaceId,
    workspaceName,
    sourceFlow: "generic",
    templateId,
    categoryId: "general",
    frameworkId: null,
    frameworkLabel: null,
    blueprintSummary:
      visibleDescription ??
      "This Engine has been created without a structured blueprint yet. Neroa can still turn it into a guided build path from inside the workspace.",
    buildPathLabel: null,
    buildPathValue: null,
    buildPathDetail: null,
    laneStructure: ["Strategy", "Scope", "MVP", "Budget", "Test", "Build", "Launch", "Operate"],
    modules: {
      required: [],
      expansion: [],
      optional: []
    },
    connectedServices: getEngineConnectedServices({
      categoryId: "external-app"
    }),
    orchestrationRouting: getExecutionRoutingModel(),
    reviewLoop: getBuildReviewLoop(),
    recommendedTierId: null,
    recommendedTierLabel: null,
    complexityScore: null,
    complexityLabel: null,
    executionIntensity: null,
    variationSeed: null,
    variationLayoutId: null,
    variationNavigationId: null
  };
}

export function buildInitialBuildSessionState(args: {
  workspaceId: string;
  workspaceName: string;
  visibleDescription?: string | null;
  projectMetadata?: StoredProjectMetadata | null;
}): InitialBuildSessionState {
  const metadata = args.projectMetadata ?? null;
  const guidedBuildIntake = metadata?.guidedBuildIntake ?? null;
  const saasIntake = metadata?.saasIntake ?? null;
  const mobileAppIntake = metadata?.mobileAppIntake ?? null;

  const buildConfiguration = guidedBuildIntake
    ? buildGuidedConfiguration(args.workspaceId, args.workspaceName, guidedBuildIntake)
    : saasIntake
      ? buildSaasConfiguration(args.workspaceId, args.workspaceName, saasIntake)
      : mobileAppIntake
        ? buildMobileConfiguration(args.workspaceId, args.workspaceName, mobileAppIntake)
        : buildGenericConfiguration(
            args.workspaceId,
            args.workspaceName,
            args.visibleDescription ?? null,
            metadata?.templateId ?? null
          );
  const requiredModuleCount = buildConfiguration.modules.required.length;
  const moduleCount =
    requiredModuleCount +
    buildConfiguration.modules.expansion.length +
    buildConfiguration.modules.optional.length;
  const connectedServicesReady = buildConfiguration.connectedServices.filter(
    (service) => service.state === "core"
  ).length;

  return {
    status: "queued",
    stage: "execution_setup",
    buildConfiguration,
    progressSnapshot: {
      currentStep: "Blueprint confirmed",
      nextStep: "Prepare the execution setup and connect the services that this Engine really needs.",
      summary:
        buildConfiguration.sourceFlow === "generic"
          ? "Neroa has the Engine in place and can now turn it into a structured execution system."
          : "Neroa has the build blueprint in place and is ready to translate it into execution setup and tracked delivery work.",
      moduleCount,
      requiredModuleCount,
      connectedServicesReady,
      connectedServicesTotal: buildConfiguration.connectedServices.length
    }
  };
}
