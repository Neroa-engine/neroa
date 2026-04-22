import {
  getExampleFrameworksForSelection,
  isDefined,
  type ExampleBuildProject,
  type ExampleBuildType,
  type ExampleBuildTypeId,
  type ExampleFramework,
  type ExampleFrameworkId,
  type ExampleIndustry,
  type ExampleIndustryId,
  type ExampleIntentMode,
  type ExampleOpportunityArea,
  type ExampleOpportunityAreaId
} from "@/lib/marketing/example-build-data-core";
import { exampleBuildProjects } from "@/lib/marketing/example-build-projects";


const exampleProjectMap = new Map(exampleBuildProjects.map((project) => [project.id, project]));

export function getExampleProjectsForSelection(args: {
  productTypeId?: ExampleBuildTypeId | null;
  intentMode?: ExampleIntentMode | null;
  industryId?: ExampleIndustryId | null;
  opportunityAreaId?: ExampleOpportunityAreaId | null;
  frameworkId?: ExampleFrameworkId | null;
}) {
  return exampleBuildProjects.filter((project) => {
    if (args.productTypeId && project.typeId !== args.productTypeId) {
      return false;
    }

    if (args.intentMode && project.intentMode !== args.intentMode) {
      return false;
    }

    if (args.industryId && project.industryId !== args.industryId) {
      return false;
    }

    if (args.opportunityAreaId && project.opportunityAreaId !== args.opportunityAreaId) {
      return false;
    }

    if (args.frameworkId && project.frameworkId !== args.frameworkId) {
      return false;
    }

    return true;
  });
}

export function getExampleProjectsForType(productTypeId: ExampleBuildTypeId) {
  const defaultFramework =
    getExampleFrameworksForSelection({
      productTypeId,
      intentMode: "known-industry",
      industryId: "healthcare"
    })[0] ?? null;

  if (!defaultFramework) {
    return [];
  }

  return getExampleProjectsForSelection({
    productTypeId,
    intentMode: "known-industry",
    industryId: "healthcare",
    frameworkId: defaultFramework.id
  });
}

export function getExampleBuildProject(projectId: string) {
  return exampleProjectMap.get(projectId) ?? null;
}

export function mapExampleSelectionToStartProductType(args: {
  productTypeId?: ExampleBuildTypeId | null;
  frameworkId?: ExampleFrameworkId | null;
}) {
  if (args.productTypeId === "mobile-app") {
    return "custom-mobile-product";
  }

  switch (args.frameworkId) {
    case "dashboard-data-platform":
      return args.productTypeId === "internal-software"
        ? "custom-internal-dashboard"
        : "custom-analytics-platform";
    case "workflow-automation-system":
      return "custom-workflow-automation";
    case "marketplace-system":
      return "custom-marketplace";
    case "subscription-platform":
      return "custom-subscription-app";
    case "internal-operations-system":
      return "custom-internal-dashboard";
    case "lead-generation-system":
      return "custom-revenue-system";
    case "content-community-platform":
      return "custom-customer-portal";
    case "client-portal-service-platform":
      return "custom-customer-portal";
    default:
      return args.productTypeId === "saas"
        ? "custom-subscription-app"
        : args.productTypeId === "internal-software"
          ? "custom-internal-dashboard"
          : args.productTypeId === "external-app"
            ? "custom-customer-portal"
            : "custom-mobile-product";
  }
}

export function buildExampleSelectionSummary(args: {
  productType?: ExampleBuildType | null;
  intentMode?: ExampleIntentMode | null;
  industry?: ExampleIndustry | null;
  opportunityArea?: ExampleOpportunityArea | null;
  framework?: ExampleFramework | null;
  project?: ExampleBuildProject | null;
}) {
  const lines = [
    args.productType ? `Product type: ${args.productType.label}.` : null,
    args.intentMode === "known-industry" && args.industry
      ? `Industry: ${args.industry.label}.`
      : null,
    args.intentMode === "exploring-opportunities" && args.opportunityArea
      ? `Opportunity area: ${args.opportunityArea.label}.`
      : null,
    args.framework ? `Framework: ${args.framework.label}.` : null,
    args.project ? `Example project: ${args.project.title}.` : null
  ].filter(isDefined);

  return lines.join(" ");
}
