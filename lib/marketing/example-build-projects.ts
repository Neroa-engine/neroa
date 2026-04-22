import {
  exampleBuildTypes,
  exampleIndustries,
  exampleOpportunityAreas,
  formatCreditRange,
  frameworkCreditBias,
  getExampleBuildFramework,
  getExampleBuildType,
  getExampleFrameworksForSelection,
  industryMap,
  opportunityMap,
  productTypeBaseCredits,
  roundToFiveHundred,
  slugifySegment,
  type ExampleBuildPath,
  type ExampleBuildPathId,
  type ExampleBuildProject,
  type ExampleBuildType,
  type ExampleBuildTypeId,
  type ExampleContextProfile,
  type ExampleFramework,
  type ExampleFrameworkId,
  type ExampleIndustry,
  type ExampleIndustryId,
  type ExampleIntentMode,
  type ExampleOpportunityArea,
  type ExampleOpportunityAreaId,
  type ExampleStackRecommendation,
  type ExampleStackSystem
} from "@/lib/marketing/example-build-data-core";

function getProjectContextLabel(args: {
  intentMode: ExampleIntentMode;
  industry?: ExampleIndustry | null;
  opportunityArea?: ExampleOpportunityArea | null;
}) {
  return args.intentMode === "known-industry"
    ? args.industry?.label ?? "Selected industry"
    : args.opportunityArea?.label ?? "Selected opportunity";
}

function getProjectTitles(args: {
  productType: ExampleBuildType;
  intentMode: ExampleIntentMode;
  industry?: ExampleIndustry | null;
  opportunityArea?: ExampleOpportunityArea | null;
  framework: ExampleFramework;
}) {
  const prefix = args.industry?.projectPrefix ?? args.opportunityArea?.projectPrefix ?? "Core";

  if (
    args.productType.id === "internal-software" &&
    args.intentMode === "known-industry" &&
    args.industry?.id === "industrial-manufacturing" &&
    args.framework.id === "workflow-automation-system"
  ) {
    return [
      "Plant operations dashboard",
      "Internal approvals workflow",
      "Maintenance task routing system"
    ];
  }

  if (
    args.productType.id === "saas" &&
    args.intentMode === "exploring-opportunities" &&
    args.opportunityArea?.id === "vertical-saas-opportunities" &&
    args.framework.id === "subscription-platform"
  ) {
    return [
      "Niche reporting SaaS",
      "Team analytics platform",
      "Vertical service management SaaS"
    ];
  }

  switch (args.framework.id) {
    case "dashboard-data-platform":
      if (args.productType.id === "internal-software") {
        return [
          `${prefix} operations dashboard`,
          `${prefix} reporting portal`,
          `${prefix} KPI workspace`
        ];
      }
      if (args.productType.id === "external-app") {
        return [
          `${prefix} customer insights portal`,
          `${prefix} reporting app`,
          `${prefix} analytics access platform`
        ];
      }
      return [
        `${prefix} analytics dashboard`,
        `${prefix} reporting platform`,
        `${prefix} insights workspace`
      ];
    case "workflow-automation-system":
      if (args.productType.id === "internal-software") {
        return [
          `${prefix} operations dashboard`,
          "Internal approvals workflow",
          `${prefix} task routing system`
        ];
      }
      if (args.productType.id === "mobile-app") {
        return [
          `${prefix} mobile workflow app`,
          `${prefix} field task routing app`,
          `${prefix} approvals companion`
        ];
      }
      if (args.productType.id === "external-app") {
        return [
          `${prefix} client workflow portal`,
          `${prefix} service automation app`,
          `${prefix} intake and routing platform`
        ];
      }
      return [
        `${prefix} workflow SaaS`,
        `${prefix} automation hub`,
        `${prefix} approvals management platform`
      ];
    case "marketplace-system":
      if (args.productType.id === "mobile-app") {
        return [
          `${prefix} mobile marketplace`,
          `${prefix} on-demand service app`,
          `${prefix} local network app`
        ];
      }
      if (args.productType.id === "saas") {
        return [
          `${prefix} vendor marketplace SaaS`,
          `${prefix} network platform`,
          `${prefix} transaction hub`
        ];
      }
      return [
        `${prefix} service marketplace`,
        `${prefix} provider matching platform`,
        `${prefix} booking marketplace`
      ];
    case "subscription-platform":
      if (args.productType.id === "mobile-app") {
        return [
          `${prefix} subscription mobile app`,
          `${prefix} premium access app`,
          `${prefix} member mobile platform`
        ];
      }
      if (args.productType.id === "external-app") {
        return [
          `${prefix} client subscription portal`,
          `${prefix} paid access platform`,
          `${prefix} member experience app`
        ];
      }
      return [
        `${prefix} subscription platform`,
        `${prefix} member platform`,
        `${prefix} recurring revenue SaaS`
      ];
    case "internal-operations-system":
      return [
        `${prefix} internal ops system`,
        `${prefix} process control center`,
        `${prefix} team operations hub`
      ];
    case "lead-generation-system":
      if (args.productType.id === "external-app") {
        return [
          `${prefix} quote and lead portal`,
          `${prefix} service inquiry platform`,
          `${prefix} conversion capture app`
        ];
      }
      return [
        `${prefix} lead engine SaaS`,
        `${prefix} pipeline capture platform`,
        `${prefix} inbound revenue system`
      ];
    case "content-community-platform":
      if (args.productType.id === "mobile-app") {
        return [
          `${prefix} mobile community MVP`,
          `${prefix} member mobile platform`,
          `${prefix} creator fan app`
        ];
      }
      if (args.productType.id === "external-app") {
        return [
          `${prefix} community platform`,
          `${prefix} member portal`,
          `${prefix} content and engagement app`
        ];
      }
      return [
        `${prefix} content membership platform`,
        `${prefix} expert community SaaS`,
        `${prefix} creator education hub`
      ];
    case "client-portal-service-platform":
      if (args.productType.id === "internal-software") {
        return [
          `${prefix} partner operations portal`,
          `${prefix} internal service desk`,
          `${prefix} approvals and access portal`
        ];
      }
      if (args.productType.id === "saas") {
        return [
          `${prefix} client portal SaaS`,
          `${prefix} service management portal`,
          `${prefix} customer success workspace`
        ];
      }
      return [
        `${prefix} client access platform`,
        `${prefix} customer booking portal`,
        `${prefix} service delivery portal`
      ];
    default:
      return [
        `${prefix} platform`,
        `${prefix} system`,
        `${prefix} workspace`
      ];
  }
}

function getExampleStackRecommendation(args: {
  productType: ExampleBuildType;
  framework: ExampleFramework;
  contextLabel: string;
}) {
  const systems: ExampleStackSystem[] = [
    {
      label: "Next.js",
      role: "Product shell, application routes, and the operational UI layer."
    },
    {
      label: "Supabase",
      role: "Database, auth foundation, and structured backend persistence."
    },
    {
      label: "GitHub",
      role: "Source control, workflow visibility, and implementation handoff."
    },
    {
      label: "Vercel",
      role: "Launch-ready deployment path with preview environments."
    }
  ];

  if (
    args.framework.id === "subscription-platform" ||
    args.framework.id === "marketplace-system"
  ) {
    systems.push({
      label: "Stripe",
      role: "Billing, subscriptions, and payment flows when monetization is part of the build."
    });
  }

  if (args.productType.id === "mobile-app") {
    systems.unshift({
      label: "React Native + Expo",
      role: "Cross-platform mobile shell for iPhone and Android rollout."
    });
  }

  if (
    args.framework.id === "client-portal-service-platform" ||
    args.framework.id === "lead-generation-system" ||
    args.framework.id === "subscription-platform"
  ) {
    systems.push({
      label: "Resend",
      role: "Transactional email, updates, and customer communication handoff."
    });
  }

  if (
    args.framework.id === "dashboard-data-platform" ||
    args.framework.id === "lead-generation-system" ||
    args.framework.id === "marketplace-system"
  ) {
    systems.push({
      label: "PostHog",
      role: "Product analytics, conversion visibility, and decision instrumentation."
    });
  }

  if (args.framework.id === "content-community-platform") {
    systems.push({
      label: "CMS layer",
      role: "Structured content publishing and controlled member-facing updates."
    });
  }

  systems.push({
    label: "Auth layer",
    role: "Role-based access for operators, customers, or members depending on the product system."
  });

  return {
    headline: `${args.framework.label} stack recommendation`,
    summary: `For ${args.contextLabel}, Neroa would likely anchor this example in a ${args.framework.label.toLowerCase()} with a modern web application shell, a durable data layer, and the supporting systems needed for launch clarity.`,
    systems,
    notes: [
      "These are example systems, not a live scoped implementation plan.",
      "The stack recommendation adapts to the product type and framework so the simulation feels closer to a real build."
    ]
  } satisfies ExampleStackRecommendation;
}

function buildScopedFeatureList(args: {
  framework: ExampleFramework;
  contextLabel: string;
}) {
  switch (args.framework.id) {
    case "dashboard-data-platform":
      return {
        coreFeatures: [
          "Role-based dashboard views",
          `Filtered reporting built around ${args.contextLabel.toLowerCase()}`,
          "Saved views and shareable insight surfaces",
          "Search, filters, and export-ready decision support"
        ],
        keyModules: [
          "Dashboard shell",
          "Data ingestion layer",
          "Filters and saved views",
          "Permissions and reporting controls"
        ],
        firstBuild: [
          "Launch one dashboard with the core reporting views that users need weekly",
          "Add filtering, drill-down, and one shared export path",
          "Prove the reporting loop before expanding into broader analytics"
        ],
        mvpIncluded: [
          "Primary dashboard",
          "Authenticated access",
          "Filtered core data views",
          "One export or reporting share flow"
        ]
      };
    case "workflow-automation-system":
      return {
        coreFeatures: [
          "Task routing and status ownership",
          "Approval checkpoints",
          `Workflow views tailored to ${args.contextLabel.toLowerCase()}`,
          "Automated follow-up and audit visibility"
        ],
        keyModules: [
          "Workflow engine",
          "Approval queue",
          "Notifications and reminders",
          "Internal reporting layer"
        ],
        firstBuild: [
          "Choose one high-friction workflow",
          "Map states, ownership, and approvals",
          "Launch the dashboard and routing logic that prove the new process is faster"
        ],
        mvpIncluded: [
          "Single workflow orchestration",
          "Task inbox",
          "Approval routing",
          "Status dashboard"
        ]
      };
    case "marketplace-system":
      return {
        coreFeatures: [
          "Multi-role accounts",
          "Listings or provider discovery",
          "Matching or booking flow",
          "Transaction or service fulfillment visibility"
        ],
        keyModules: [
          "Buyer and provider profiles",
          "Discovery and search",
          "Booking or transaction engine",
          "Admin oversight layer"
        ],
        firstBuild: [
          "Keep the first release to one core transaction path",
          "Launch provider discovery and one trust-building profile layer",
          "Prove matching and fulfillment before widening the network"
        ],
        mvpIncluded: [
          "Account roles",
          "Discovery flow",
          "One booking or transaction path",
          "Basic admin oversight"
        ]
      };
    case "subscription-platform":
      return {
        coreFeatures: [
          "Account access and permissions",
          "Plan-based or member-based product access",
          "Billing and retention surfaces",
          "Core workflow that makes the subscription feel valuable"
        ],
        keyModules: [
          "Auth and billing layer",
          "Plan management",
          "Member dashboard",
          "Usage or value-delivery surface"
        ],
        firstBuild: [
          "Launch one core value path",
          "Connect subscriptions to account access cleanly",
          "Keep the first release focused on retention, not breadth"
        ],
        mvpIncluded: [
          "Billing and account access",
          "Primary product workflow",
          "Member dashboard",
          "Support for one clear recurring use case"
        ]
      };
    case "internal-operations-system":
      return {
        coreFeatures: [
          "Operational visibility",
          "Team ownership and accountability",
          "Status reporting",
          "Permissions around internal decision-making"
        ],
        keyModules: [
          "Internal dashboard",
          "Permissions model",
          "Ops reporting",
          "Shared activity log"
        ],
        firstBuild: [
          "Replace the most painful spreadsheet or manual status loop",
          "Give operators one reliable control surface",
          "Expand only after the team trusts the new system"
        ],
        mvpIncluded: [
          "Ops dashboard",
          "Internal roles",
          "Status and activity log",
          "Weekly reporting view"
        ]
      };
    case "lead-generation-system":
      return {
        coreFeatures: [
          "Inbound capture flow",
          "Qualification logic",
          "Assignment or follow-up routing",
          "Pipeline visibility"
        ],
        keyModules: [
          "Landing and intake flow",
          "Lead routing engine",
          "Qualification tracking",
          "Revenue dashboard"
        ],
        firstBuild: [
          "Launch the intake path first",
          "Connect lead qualification to immediate routing",
          "Track what moves into revenue instead of just collecting form fills"
        ],
        mvpIncluded: [
          "Primary intake flow",
          "Lead routing",
          "Qualification tags",
          "Pipeline visibility"
        ]
      };
    case "content-community-platform":
      return {
        coreFeatures: [
          "Member access and profiles",
          "Structured content delivery",
          "Community or engagement layer",
          "Retention-focused value loop"
        ],
        keyModules: [
          "Membership access",
          "Content publishing",
          "Community surfaces",
          "Engagement reporting"
        ],
        firstBuild: [
          "Launch the paid access layer and one core content flow",
          "Keep community tight and intentional",
          "Prove retention before expanding content breadth"
        ],
        mvpIncluded: [
          "Member access",
          "Core content delivery",
          "Profile and participation basics",
          "One retention loop"
        ]
      };
    case "client-portal-service-platform":
      return {
        coreFeatures: [
          "Client or customer access",
          "Service request or booking flow",
          "Status visibility",
          "Communication and delivery checkpoints"
        ],
        keyModules: [
          "Portal shell",
          "Requests or bookings",
          "Status tracking",
          "Team response workflow"
        ],
        firstBuild: [
          "Launch one clear service path",
          "Make status visible to the customer and the team",
          "Prove the experience is smoother before adding secondary modules"
        ],
        mvpIncluded: [
          "Customer or client login",
          "Primary request path",
          "Status view",
          "Team coordination basics"
        ]
      };
    default:
      return {
        coreFeatures: ["Core workflow", "Account access", "Visibility layer", "Launch-ready path"],
        keyModules: ["App shell", "Data layer", "Access control", "Reporting"],
        firstBuild: ["Start small", "Validate the workflow", "Expand after traction"],
        mvpIncluded: ["Core feature path", "Access", "One reporting loop", "Launch setup"]
      };
  }
}

function getProjectComplexityScore(args: {
  productTypeId: ExampleBuildTypeId;
  frameworkId: ExampleFrameworkId;
  contextProfile: ExampleContextProfile | null;
}) {
  const productScore =
    args.productTypeId === "internal-software"
      ? 2
      : args.productTypeId === "saas"
        ? 3
        : args.productTypeId === "external-app"
          ? 4
          : 5;
  const frameworkScore =
    args.frameworkId === "marketplace-system"
      ? 4
      : args.frameworkId === "subscription-platform" ||
          args.frameworkId === "client-portal-service-platform"
        ? 3
        : args.frameworkId === "content-community-platform"
          ? 2
          : 1;

  return productScore + frameworkScore + (args.contextProfile?.complexityBias ?? 0);
}

function getExampleCreditRange(args: {
  productTypeId: ExampleBuildTypeId;
  frameworkId: ExampleFrameworkId;
  contextProfile: ExampleContextProfile | null;
}) {
  const base =
    productTypeBaseCredits[args.productTypeId] +
    frameworkCreditBias[args.frameworkId] +
    (args.contextProfile?.complexityBias ?? 0) * 750;
  const min = roundToFiveHundred(base * 0.88);
  const max = roundToFiveHundred(base * 1.16);

  return { min, max };
}

function getTimelineStrings(maxCredits: number) {
  const monthlySlow = Math.max(2, Math.ceil(maxCredits / 2500));
  const monthlyFast = Math.max(1, Math.ceil(maxCredits / 9000));
  const managedWeeks =
    maxCredits >= 22000 ? "8-12 weeks" : maxCredits >= 16000 ? "6-8 weeks" : "4-6 weeks";

  return {
    slow: `Approximately ${monthlySlow} months on monthly credits`,
    fast: `Approximately ${monthlyFast} months with added credits`,
    managed: managedWeeks
  };
}

function getBuildPaths(args: {
  productType: ExampleBuildType;
  framework: ExampleFramework;
  contextLabel: string;
  maxCredits: number;
}) {
  const timelines = getTimelineStrings(args.maxCredits);
  const complexityScore = getProjectComplexityScore({
    productTypeId: args.productType.id,
    frameworkId: args.framework.id,
    contextProfile: null
  });

  let recommended: ExampleBuildPathId = "diy-accelerated";

  if (
    args.productType.id === "internal-software" &&
    (args.framework.id === "workflow-automation-system" ||
      args.framework.id === "internal-operations-system")
  ) {
    recommended = "diy-slower";
  } else if (
    args.productType.id === "mobile-app" ||
    args.framework.id === "marketplace-system" ||
    complexityScore >= 8
  ) {
    recommended = "managed";
  }

  return [
    {
      id: "diy-slower",
      label: "DIY Build at slower monthly pace",
      summary: `Best when you want to pace ${args.contextLabel.toLowerCase()} more conservatively and stay inside the monthly credit rhythm.`,
      timeline: timelines.slow,
      controlLevel: "Highest",
      supportLevel: "Guided by Neroa, self-driven execution",
      bestFor: "Budget-aware builders who want to keep decisions close and move at a measured pace.",
      recommended: recommended === "diy-slower"
    },
    {
      id: "diy-accelerated",
      label: "DIY Build accelerated with added credits",
      summary: `Best when you want to keep control but compress the launch pace for this ${args.framework.label.toLowerCase()}.`,
      timeline: timelines.fast,
      controlLevel: "High",
      supportLevel: "Guided by Neroa with faster execution capacity",
      bestFor: "Founders who want the DIY path but do not want the timeline stretched across too many months.",
      recommended: recommended === "diy-accelerated"
    },
    {
      id: "managed",
      label: "Managed Build",
      summary: `Best when the product needs tighter coordination, faster execution, or more hands-on help across build and launch.`,
      timeline: timelines.managed,
      controlLevel: "Shared",
      supportLevel: "Highest with staged Neroa involvement",
      bestFor: "Higher-complexity builds, urgent launches, or teams that want structured execution support.",
      recommended: recommended === "managed"
    }
  ] satisfies ExampleBuildPath[];
}

function buildProjectCopy(args: {
  title: string;
  productType: ExampleBuildType;
  framework: ExampleFramework;
  contextLabel: string;
  contextProfile: ExampleContextProfile | null;
  creditEstimate: string;
}) {
  const featureSet = buildScopedFeatureList({
    framework: args.framework,
    contextLabel: args.contextLabel
  });

  return {
    summary: `${args.title} shows how Neroa could turn ${args.contextLabel.toLowerCase()} into a ${args.framework.label.toLowerCase()} with a first build that is structured, realistic, and launchable.`,
    problem: `${args.contextProfile?.marketFocus ?? `${args.contextLabel} teams`} often rely on scattered tools, fragmented updates, and delayed visibility around the workflow this product is meant to solve.`,
    audience: `${args.contextProfile?.audienceLabel ?? `${args.contextLabel} operators`} who need a more reliable system than spreadsheets, disconnected apps, or a hand-built workaround.`,
    coreFeatures: featureSet.coreFeatures,
    keyModules: featureSet.keyModules,
    firstBuild: featureSet.firstBuild,
    mvpSummary: `For ${args.title}, the MVP stays focused on the smallest version of the ${args.framework.label.toLowerCase()} that can prove value without pretending the full platform is already built.`,
    mvpIncluded: featureSet.mvpIncluded,
    estimateNote: `Example estimate only. Neroa would still scope ${args.title.toLowerCase()} in the real build flow before final credits, timeline, and execution pacing are locked. Current illustrative range: ${args.creditEstimate}.`
  };
}

function buildExampleProject(args: {
  title: string;
  index: number;
  productType: ExampleBuildType;
  intentMode: ExampleIntentMode;
  industry?: ExampleIndustry | null;
  opportunityArea?: ExampleOpportunityArea | null;
  framework: ExampleFramework;
}) {
  const contextProfile = (args.industry ?? args.opportunityArea ?? null) as ExampleContextProfile | null;
  const contextLabel = getProjectContextLabel({
    intentMode: args.intentMode,
    industry: args.industry,
    opportunityArea: args.opportunityArea
  });
  const credits = getExampleCreditRange({
    productTypeId: args.productType.id,
    frameworkId: args.framework.id,
    contextProfile
  });
  const creditEstimate = formatCreditRange(credits.min, credits.max);
  const projectCopy = buildProjectCopy({
    title: args.title,
    productType: args.productType,
    framework: args.framework,
    contextLabel,
    contextProfile,
    creditEstimate
  });
  const stackRecommendation = getExampleStackRecommendation({
    productType: args.productType,
    framework: args.framework,
    contextLabel
  });
  const buildPaths = getBuildPaths({
    productType: args.productType,
    framework: args.framework,
    contextLabel,
    maxCredits: credits.max
  });

  return {
    id: [
      args.productType.id,
      args.intentMode,
      args.industry?.id ?? args.opportunityArea?.id ?? "general",
      args.framework.id,
      slugifySegment(args.title),
      String(args.index + 1)
    ].join(":"),
    typeId: args.productType.id,
    typeLabel: args.productType.label,
    intentMode: args.intentMode,
    industryId: args.industry?.id,
    industryLabel: args.industry?.label,
    opportunityAreaId: args.opportunityArea?.id,
    opportunityAreaLabel: args.opportunityArea?.label,
    frameworkId: args.framework.id,
    frameworkLabel: args.framework.label,
    title: args.title,
    summary: projectCopy.summary,
    problem: projectCopy.problem,
    audience: projectCopy.audience,
    coreFeatures: projectCopy.coreFeatures,
    keyModules: projectCopy.keyModules,
    firstBuild: projectCopy.firstBuild,
    mvpSummary: projectCopy.mvpSummary,
    mvpIncluded: projectCopy.mvpIncluded,
    creditEstimate,
    estimateNote: projectCopy.estimateNote,
    stackRecommendation,
    buildPaths
  } satisfies ExampleBuildProject;
}

function buildProjectsForSelection(args: {
  productTypeId: ExampleBuildTypeId;
  intentMode: ExampleIntentMode;
  industryId?: ExampleIndustryId | null;
  opportunityAreaId?: ExampleOpportunityAreaId | null;
  frameworkId: ExampleFrameworkId;
}) {
  const productType = getExampleBuildType(args.productTypeId);
  const framework = getExampleBuildFramework(args.frameworkId);
  const industry = args.industryId ? industryMap.get(args.industryId) ?? null : null;
  const opportunityArea = args.opportunityAreaId ? opportunityMap.get(args.opportunityAreaId) ?? null : null;

  if (!productType || !framework) {
    return [];
  }

  if (args.intentMode === "known-industry" && !industry) {
    return [];
  }

  if (args.intentMode === "exploring-opportunities" && !opportunityArea) {
    return [];
  }

  return getProjectTitles({
    productType,
    intentMode: args.intentMode,
    industry,
    opportunityArea,
    framework
  }).map((title, index) =>
    buildExampleProject({
      title,
      index,
      productType,
      intentMode: args.intentMode,
      industry,
      opportunityArea,
      framework
    })
  );
}

function buildAllExampleProjects() {
  const projects: ExampleBuildProject[] = [];

  for (const productType of exampleBuildTypes) {
    for (const industry of exampleIndustries) {
      for (const framework of getExampleFrameworksForSelection({
        productTypeId: productType.id,
        intentMode: "known-industry",
        industryId: industry.id
      })) {
        projects.push(
          ...buildProjectsForSelection({
            productTypeId: productType.id,
            intentMode: "known-industry",
            industryId: industry.id,
            frameworkId: framework.id
          })
        );
      }
    }

    for (const opportunityArea of exampleOpportunityAreas) {
      for (const framework of getExampleFrameworksForSelection({
        productTypeId: productType.id,
        intentMode: "exploring-opportunities",
        opportunityAreaId: opportunityArea.id
      })) {
        projects.push(
          ...buildProjectsForSelection({
            productTypeId: productType.id,
            intentMode: "exploring-opportunities",
            opportunityAreaId: opportunityArea.id,
            frameworkId: framework.id
          })
        );
      }
    }
  }

  return projects;
}

export const exampleBuildProjects = buildAllExampleProjects();
