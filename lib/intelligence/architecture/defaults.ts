import type { DomainPackId } from "../domain-contracts.ts";
import type {
  ArchitectureInputId,
  ArchitectureRisk,
  ArchitectureSystemType,
  DataEntity,
  IntegrationRequirement,
  Lane,
  SystemModule,
  TenancyModel
} from "./types.ts";

export type ArchitectureLaneTemplate = Omit<Lane, "ownedModuleIds">;

export type ArchitectureDomainDefaults = {
  domainPackId: DomainPackId;
  systemType: ArchitectureSystemType;
  tenancyModel: TenancyModel;
  surfaceDefaults: string[];
  requiredArchitectureInputs: ArchitectureInputId[];
  moduleTemplates: SystemModule[];
  dataEntityTemplates: DataEntity[];
  integrationTemplates: IntegrationRequirement[];
  laneTemplates: ArchitectureLaneTemplate[];
  riskTemplates: ArchitectureRisk[];
};

export const ARCHITECTURE_DOMAIN_DEFAULTS: Record<
  DomainPackId,
  ArchitectureDomainDefaults
> = {
  generic_saas: {
    domainPackId: "generic_saas",
    systemType: "generic_saas_platform",
    tenancyModel: "multi_tenant_saas",
    surfaceDefaults: ["customer web app", "admin console"],
    requiredArchitectureInputs: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations"
    ],
    moduleTemplates: [
      {
        id: "auth_identity",
        name: "Auth & identity",
        kind: "foundation",
        purpose: "Handle sign-in, user identity, and baseline account access.",
        ownedSurface: null,
        dependsOn: [],
        laneId: "foundation",
        riskLevel: "medium"
      },
      {
        id: "tenant_workspace",
        name: "Tenant workspace core",
        kind: "foundation",
        purpose: "Model tenant/workspace boundaries and shared product settings.",
        ownedSurface: null,
        dependsOn: ["auth_identity"],
        laneId: "foundation",
        riskLevel: "medium"
      },
      {
        id: "workflow_core",
        name: "Workflow core",
        kind: "domain_service",
        purpose: "Own the main product workflow and the first version-one business logic.",
        ownedSurface: null,
        dependsOn: ["tenant_workspace"],
        laneId: "workflow_core",
        riskLevel: "medium"
      },
      {
        id: "integration_hub",
        name: "Integration hub",
        kind: "domain_service",
        purpose: "Broker external systems, import contracts, and source synchronization.",
        ownedSurface: null,
        dependsOn: ["tenant_workspace"],
        laneId: "integrations",
        riskLevel: "medium"
      },
      {
        id: "product_web",
        name: "Product web app",
        kind: "experience",
        purpose: "Deliver the main customer-facing workflow and search/filter experience.",
        ownedSurface: "customer web app",
        dependsOn: ["auth_identity", "workflow_core"],
        laneId: "product_web",
        riskLevel: "medium"
      },
      {
        id: "admin_controls",
        name: "Admin controls",
        kind: "admin",
        purpose: "Support product administration, permissions, and operational settings.",
        ownedSurface: "admin console",
        dependsOn: ["auth_identity", "tenant_workspace", "workflow_core"],
        laneId: "admin_console",
        riskLevel: "medium"
      },
      {
        id: "observability_quality",
        name: "Observability & quality",
        kind: "observability",
        purpose: "Add health checks, logs, monitoring, and release-quality safeguards.",
        ownedSurface: null,
        dependsOn: ["workflow_core", "product_web", "admin_controls"],
        laneId: "observability_quality",
        riskLevel: "low"
      }
    ],
    dataEntityTemplates: [
      {
        id: "tenant",
        name: "Tenant",
        category: "identity",
        description: "Represents a customer account or workspace boundary.",
        ownerModuleId: "tenant_workspace",
        containsSensitiveData: true,
        sourceIntegrationIds: []
      },
      {
        id: "user",
        name: "User",
        category: "identity",
        description: "Represents a human with access to the product.",
        ownerModuleId: "auth_identity",
        containsSensitiveData: true,
        sourceIntegrationIds: []
      },
      {
        id: "role",
        name: "Role",
        category: "configuration",
        description: "Defines access levels and admin permissions.",
        ownerModuleId: "admin_controls",
        containsSensitiveData: false,
        sourceIntegrationIds: []
      },
      {
        id: "workflow_record",
        name: "Workflow record",
        category: "domain",
        description: "Stores the core product object that powers the main workflow.",
        ownerModuleId: "workflow_core",
        containsSensitiveData: true,
        sourceIntegrationIds: []
      },
      {
        id: "search_index",
        name: "Search index",
        category: "analytics",
        description: "Supports search, filtering, and product findability.",
        ownerModuleId: "product_web",
        containsSensitiveData: false,
        sourceIntegrationIds: []
      },
      {
        id: "integration_sync",
        name: "Integration sync",
        category: "integration",
        description: "Tracks import runs and connector state.",
        ownerModuleId: "integration_hub",
        containsSensitiveData: false,
        sourceIntegrationIds: ["auth_provider"]
      }
    ],
    integrationTemplates: [
      {
        id: "auth_provider",
        name: "Auth provider",
        category: "auth",
        purpose: "Support baseline identity flows without embedding auth state into product modules.",
        requiredForMvp: true,
        moduleIds: ["auth_identity"],
        dataEntityIds: ["user"],
        notes: "Provider choice can stay open until execution planning."
      }
    ],
    laneTemplates: [
      {
        id: "foundation",
        name: "Foundation",
        purpose: "Stabilize identity, tenancy, and shared product plumbing first.",
        dependsOnLaneIds: [],
        protectedPaths: [
          "lib/core/auth/**",
          "lib/core/tenancy/**",
          "lib/entities/user/**"
        ],
        mergePolicy: "foundation_first"
      },
      {
        id: "workflow_core",
        name: "Workflow core",
        purpose: "Build the main domain logic and keep workflow boundaries clean.",
        dependsOnLaneIds: ["foundation"],
        protectedPaths: [
          "lib/modules/workflow/**",
          "lib/entities/workflow-record/**"
        ],
        mergePolicy: "dependency_ordered"
      },
      {
        id: "integrations",
        name: "Integrations",
        purpose: "Own external-system contracts and synchronization boundaries.",
        dependsOnLaneIds: ["foundation"],
        protectedPaths: [
          "lib/integrations/**",
          "lib/modules/integration-hub/**"
        ],
        mergePolicy: "dependency_ordered"
      },
      {
        id: "product_web",
        name: "Product web",
        purpose: "Deliver the customer-facing experience on top of stable domain APIs.",
        dependsOnLaneIds: ["foundation", "workflow_core"],
        protectedPaths: [
          "app/(product)/**",
          "components/product/**"
        ],
        mergePolicy: "review_required"
      },
      {
        id: "admin_console",
        name: "Admin console",
        purpose: "Handle admin controls without widening the product-web lane.",
        dependsOnLaneIds: ["foundation", "workflow_core"],
        protectedPaths: [
          "app/(admin)/**",
          "components/admin/**"
        ],
        mergePolicy: "review_required"
      },
      {
        id: "observability_quality",
        name: "Observability / quality",
        purpose: "Protect reliability, QA, and release readiness across the stack.",
        dependsOnLaneIds: [
          "foundation",
          "workflow_core",
          "product_web",
          "admin_console"
        ],
        protectedPaths: [
          "tests/**",
          "lib/observability/**",
          "app/api/health/**"
        ],
        mergePolicy: "review_required"
      }
    ],
    riskTemplates: [
      {
        id: "generic_permissions_boundary",
        title: "Permissions boundary still needs tightening",
        severity: "medium",
        area: "access control",
        description:
          "Generic SaaS products can drift into unclear tenant and admin boundaries if permissions stay implicit.",
        mitigation:
          "Confirm the first admin/operator roles before roadmap approval and keep access policy isolated in the foundation/admin lanes.",
        relatedModuleIds: ["auth_identity", "tenant_workspace", "admin_controls"],
        relatedInputIds: ["buyerPersonas", "surfaces"]
      },
      {
        id: "generic_integration_contract",
        title: "Integration contract is still open",
        severity: "medium",
        area: "integration planning",
        description:
          "External systems remain underspecified, which can widen the first build unexpectedly.",
        mitigation:
          "Lock the first launch integration and keep connector scope inside the integrations lane.",
        relatedModuleIds: ["integration_hub"],
        relatedInputIds: ["integrations", "dataSources"]
      }
    ]
  },
  crypto_analytics: {
    domainPackId: "crypto_analytics",
    systemType: "intelligence_platform",
    tenancyModel: "multi_tenant_saas",
    surfaceDefaults: ["public web", "investor dashboard", "admin/rules console"],
    requiredArchitectureInputs: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "chainsInScope",
      "walletConnectionMvp",
      "adviceAdjacency",
      "riskSignalSources"
    ],
    moduleTemplates: [
      {
        id: "auth_identity",
        name: "Auth & identity",
        kind: "foundation",
        purpose: "Handle user access, trust boundaries, and any optional account linkage.",
        ownedSurface: null,
        dependsOn: [],
        laneId: "foundation",
        riskLevel: "medium"
      },
      {
        id: "project_registry",
        name: "Project/token registry",
        kind: "domain_service",
        purpose: "Store project, token, and coverage metadata for the analytics product.",
        ownedSurface: null,
        dependsOn: ["auth_identity"],
        laneId: "foundation",
        riskLevel: "medium"
      },
      {
        id: "data_ingestion_pipeline",
        name: "Data ingestion",
        kind: "data_pipeline",
        purpose: "Ingest on-chain and market/provider data into the product data flow.",
        ownedSurface: null,
        dependsOn: ["project_registry"],
        laneId: "data_ingestion",
        riskLevel: "high"
      },
      {
        id: "source_normalization",
        name: "Chain/source normalization",
        kind: "data_pipeline",
        purpose: "Normalize chain, token, and provider records into a scoring-ready schema.",
        ownedSurface: null,
        dependsOn: ["data_ingestion_pipeline"],
        laneId: "data_ingestion",
        riskLevel: "high"
      },
      {
        id: "risk_engine",
        name: "Risk engine",
        kind: "domain_service",
        purpose: "Calculate the risk score and related decision signals.",
        ownedSurface: null,
        dependsOn: ["project_registry", "source_normalization"],
        laneId: "risk_engine",
        riskLevel: "high"
      },
      {
        id: "score_explanation",
        name: "Score explanation",
        kind: "domain_service",
        purpose: "Translate scoring factors into transparent investor-facing reasoning.",
        ownedSurface: "investor dashboard",
        dependsOn: ["risk_engine"],
        laneId: "risk_engine",
        riskLevel: "high"
      },
      {
        id: "search_filter",
        name: "Search & filter",
        kind: "experience",
        purpose: "Let investors search, compare, and filter project profiles quickly.",
        ownedSurface: "public web",
        dependsOn: ["project_registry", "risk_engine"],
        laneId: "product_web",
        riskLevel: "medium"
      },
      {
        id: "watchlist",
        name: "Watchlist",
        kind: "experience",
        purpose: "Support saved project monitoring and investor follow-through.",
        ownedSurface: "investor dashboard",
        dependsOn: ["auth_identity", "project_registry", "risk_engine"],
        laneId: "product_web",
        riskLevel: "medium"
      },
      {
        id: "investor_dashboard",
        name: "Investor dashboard",
        kind: "experience",
        purpose: "Present project profiles, risk scores, and investor decision context.",
        ownedSurface: "investor dashboard",
        dependsOn: ["search_filter", "watchlist", "score_explanation"],
        laneId: "product_web",
        riskLevel: "medium"
      },
      {
        id: "admin_rules_console",
        name: "Admin/rules controls",
        kind: "admin",
        purpose: "Manage score rules, data exceptions, and internal analyst controls.",
        ownedSurface: "admin/rules console",
        dependsOn: ["auth_identity", "project_registry", "risk_engine"],
        laneId: "admin_console",
        riskLevel: "high"
      },
      {
        id: "observability_quality",
        name: "Observability & quality",
        kind: "observability",
        purpose: "Protect scoring trust with monitoring, audit trails, and release checks.",
        ownedSurface: null,
        dependsOn: [
          "data_ingestion_pipeline",
          "risk_engine",
          "investor_dashboard",
          "admin_rules_console"
        ],
        laneId: "observability_quality",
        riskLevel: "medium"
      }
    ],
    dataEntityTemplates: [
      {
        id: "user",
        name: "User",
        category: "identity",
        description: "Represents an investor or analyst using the platform.",
        ownerModuleId: "auth_identity",
        containsSensitiveData: true,
        sourceIntegrationIds: []
      },
      {
        id: "project_token",
        name: "Project/token",
        category: "domain",
        description: "Represents a tracked project, token, or pre-sale asset.",
        ownerModuleId: "project_registry",
        containsSensitiveData: false,
        sourceIntegrationIds: ["on_chain_data_provider", "market_data_provider"]
      },
      {
        id: "chain_source",
        name: "Chain/source",
        category: "integration",
        description: "Represents chain coverage and external provider provenance.",
        ownerModuleId: "source_normalization",
        containsSensitiveData: false,
        sourceIntegrationIds: ["on_chain_data_provider", "market_data_provider"]
      },
      {
        id: "risk_score",
        name: "Risk score",
        category: "analytics",
        description: "Stores the current score and supporting state for a project/token.",
        ownerModuleId: "risk_engine",
        containsSensitiveData: false,
        sourceIntegrationIds: ["on_chain_data_provider", "market_data_provider"]
      },
      {
        id: "score_factor",
        name: "Score factor / explanation",
        category: "analytics",
        description: "Captures the factors and reasoning that explain a score.",
        ownerModuleId: "score_explanation",
        containsSensitiveData: false,
        sourceIntegrationIds: ["on_chain_data_provider", "market_data_provider"]
      },
      {
        id: "watchlist_item",
        name: "Watchlist item",
        category: "domain",
        description: "Represents a user-saved tracked asset or project.",
        ownerModuleId: "watchlist",
        containsSensitiveData: true,
        sourceIntegrationIds: []
      },
      {
        id: "admin_rule",
        name: "Admin rule",
        category: "configuration",
        description: "Stores analyst-defined rules, overrides, or scoring controls.",
        ownerModuleId: "admin_rules_console",
        containsSensitiveData: false,
        sourceIntegrationIds: []
      }
    ],
    integrationTemplates: [
      {
        id: "on_chain_data_provider",
        name: "On-chain data provider",
        category: "data_provider",
        purpose: "Provide chain activity and token-level source data.",
        requiredForMvp: true,
        moduleIds: ["data_ingestion_pipeline", "source_normalization"],
        dataEntityIds: ["project_token", "chain_source", "risk_score", "score_factor"],
        notes: "Provider choice depends on supported chains and coverage depth."
      },
      {
        id: "market_data_provider",
        name: "Market data provider",
        category: "data_provider",
        purpose: "Provide pricing, liquidity, and broader market signal inputs.",
        requiredForMvp: true,
        moduleIds: ["data_ingestion_pipeline", "risk_engine"],
        dataEntityIds: ["project_token", "risk_score", "score_factor"],
        notes: "Market data quality affects scoring trust."
      },
      {
        id: "wallet_provider",
        name: "Wallet provider",
        category: "wallet",
        purpose: "Enable optional wallet-linked watchlists or user verification if included later.",
        requiredForMvp: false,
        moduleIds: ["auth_identity", "watchlist"],
        dataEntityIds: ["user", "watchlist_item"],
        notes: "Keep optional until wallet connection is confirmed for the MVP."
      }
    ],
    laneTemplates: [
      {
        id: "foundation",
        name: "Foundation",
        purpose: "Establish identity, registry, and shared project metadata first.",
        dependsOnLaneIds: [],
        protectedPaths: [
          "lib/core/auth/**",
          "lib/modules/project-registry/**",
          "lib/entities/project-token/**"
        ],
        mergePolicy: "foundation_first"
      },
      {
        id: "data_ingestion",
        name: "Data ingestion",
        purpose: "Own provider ingestion and normalization without contaminating product-web work.",
        dependsOnLaneIds: ["foundation"],
        protectedPaths: [
          "lib/integrations/on-chain/**",
          "lib/modules/data-ingestion/**",
          "lib/modules/source-normalization/**"
        ],
        mergePolicy: "dependency_ordered"
      },
      {
        id: "risk_engine",
        name: "Risk engine",
        purpose: "Own scoring logic, score reasoning, and decision transparency.",
        dependsOnLaneIds: ["foundation", "data_ingestion"],
        protectedPaths: [
          "lib/modules/risk-engine/**",
          "lib/modules/score-explanation/**"
        ],
        mergePolicy: "dependency_ordered"
      },
      {
        id: "product_web",
        name: "Product web",
        purpose: "Ship the public web and investor dashboard experiences on stable domain APIs.",
        dependsOnLaneIds: ["foundation", "risk_engine"],
        protectedPaths: [
          "app/(public)/**",
          "app/(dashboard)/**",
          "components/investor/**"
        ],
        mergePolicy: "review_required"
      },
      {
        id: "admin_console",
        name: "Admin console",
        purpose: "Keep internal controls and rule management isolated from investor surfaces.",
        dependsOnLaneIds: ["foundation", "risk_engine"],
        protectedPaths: [
          "app/(admin)/**",
          "components/admin/**"
        ],
        mergePolicy: "review_required"
      },
      {
        id: "observability_quality",
        name: "Observability / quality",
        purpose: "Guard scoring trust, ingestion health, and release quality.",
        dependsOnLaneIds: [
          "foundation",
          "data_ingestion",
          "risk_engine",
          "product_web",
          "admin_console"
        ],
        protectedPaths: [
          "tests/**",
          "lib/observability/**",
          "app/api/health/**"
        ],
        mergePolicy: "review_required"
      }
    ],
    riskTemplates: [
      {
        id: "crypto_scoring_transparency",
        title: "Scoring transparency boundary is high-risk",
        severity: "high",
        area: "risk logic",
        description:
          "Investors will not trust a score if explanation depth and advice boundaries stay fuzzy.",
        mitigation:
          "Keep score factors explicit, preserve explanation output as a first-class module, and confirm the analytics-only posture before roadmap generation.",
        relatedModuleIds: ["risk_engine", "score_explanation", "investor_dashboard"],
        relatedInputIds: ["adviceAdjacency", "riskSignalSources"]
      },
      {
        id: "crypto_data_provenance",
        title: "Data provenance can distort the score",
        severity: "high",
        area: "data ingestion",
        description:
          "Unknown chain coverage or provider provenance can make scoring incomplete or misleading.",
        mitigation:
          "Lock chain scope and provider contracts before deeper implementation sequencing.",
        relatedModuleIds: ["data_ingestion_pipeline", "source_normalization"],
        relatedInputIds: ["chainsInScope", "riskSignalSources"]
      },
      {
        id: "crypto_wallet_boundary",
        title: "Wallet connection boundary is still open",
        severity: "medium",
        area: "identity and trust",
        description:
          "Wallet support changes identity, user trust, and security expectations, even if the first release stays analytics-only.",
        mitigation:
          "Treat wallet linkage as a distinct integration decision and keep it outside the MVP until confirmed.",
        relatedModuleIds: ["auth_identity", "watchlist"],
        relatedInputIds: ["walletConnectionMvp"]
      }
    ]
  },
  restaurant_sales: {
    domainPackId: "restaurant_sales",
    systemType: "ops_reporting_platform",
    tenancyModel: "multi_location_hierarchy",
    surfaceDefaults: [
      "owner dashboard",
      "manager dashboard",
      "admin/reporting console"
    ],
    requiredArchitectureInputs: [
      "productCategory",
      "buyerPersonas",
      "operatorPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "launchLocationModel",
      "firstPosConnector",
      "analyticsVsStaffWorkflows",
      "launchReports"
    ],
    moduleTemplates: [
      {
        id: "auth_identity",
        name: "Auth & identity",
        kind: "foundation",
        purpose: "Handle secure sign-in and baseline location-aware access.",
        ownedSurface: null,
        dependsOn: [],
        laneId: "foundation_org_model",
        riskLevel: "medium"
      },
      {
        id: "org_location_hierarchy",
        name: "Org/location hierarchy",
        kind: "foundation",
        purpose: "Model organizations, locations, and ownership boundaries.",
        ownedSurface: null,
        dependsOn: ["auth_identity"],
        laneId: "foundation_org_model",
        riskLevel: "high"
      },
      {
        id: "role_access_control",
        name: "Role-based access",
        kind: "foundation",
        purpose: "Apply owner, manager, and admin permissions to reporting surfaces.",
        ownedSurface: null,
        dependsOn: ["auth_identity", "org_location_hierarchy"],
        laneId: "foundation_org_model",
        riskLevel: "high"
      },
      {
        id: "pos_connector_layer",
        name: "POS connector layer",
        kind: "data_pipeline",
        purpose: "Handle POS imports, connector contracts, and sync orchestration.",
        ownedSurface: null,
        dependsOn: ["org_location_hierarchy"],
        laneId: "connectors",
        riskLevel: "high"
      },
      {
        id: "normalized_sales_store",
        name: "Normalized sales store",
        kind: "data_pipeline",
        purpose: "Store location and menu sales data in a consistent reporting schema.",
        ownedSurface: null,
        dependsOn: ["pos_connector_layer", "org_location_hierarchy"],
        laneId: "connectors",
        riskLevel: "high"
      },
      {
        id: "reporting_engine",
        name: "Reporting engine",
        kind: "domain_service",
        purpose: "Generate dashboards, rollups, and trusted launch reports.",
        ownedSurface: null,
        dependsOn: ["normalized_sales_store", "role_access_control"],
        laneId: "analytics_reporting",
        riskLevel: "high"
      },
      {
        id: "exports_service",
        name: "Exports",
        kind: "domain_service",
        purpose: "Generate exportable reports and snapshots for operators.",
        ownedSurface: "admin/reporting console",
        dependsOn: ["reporting_engine"],
        laneId: "analytics_reporting",
        riskLevel: "medium"
      },
      {
        id: "owner_manager_dashboards",
        name: "Owner/manager dashboards",
        kind: "experience",
        purpose: "Deliver dashboard views for owners and managers across locations.",
        ownedSurface: "owner dashboard",
        dependsOn: ["auth_identity", "reporting_engine"],
        laneId: "product_web",
        riskLevel: "medium"
      },
      {
        id: "admin_reporting_console",
        name: "Admin/reporting console",
        kind: "admin",
        purpose: "Let admins manage connector state, report access, and reporting controls.",
        ownedSurface: "admin/reporting console",
        dependsOn: ["auth_identity", "pos_connector_layer", "reporting_engine"],
        laneId: "admin_reporting",
        riskLevel: "medium"
      },
      {
        id: "connector_health",
        name: "Connector health & controls",
        kind: "admin",
        purpose: "Track connector health, retries, and operator-visible sync controls.",
        ownedSurface: "admin/reporting console",
        dependsOn: ["pos_connector_layer"],
        laneId: "admin_reporting",
        riskLevel: "high"
      },
      {
        id: "observability_quality",
        name: "Observability & quality",
        kind: "observability",
        purpose: "Monitor connector reliability, report quality, and release health.",
        ownedSurface: null,
        dependsOn: [
          "pos_connector_layer",
          "reporting_engine",
          "owner_manager_dashboards",
          "admin_reporting_console"
        ],
        laneId: "observability_quality",
        riskLevel: "medium"
      }
    ],
    dataEntityTemplates: [
      {
        id: "organization",
        name: "Organization",
        category: "identity",
        description: "Represents the restaurant group or owner account.",
        ownerModuleId: "org_location_hierarchy",
        containsSensitiveData: true,
        sourceIntegrationIds: []
      },
      {
        id: "location",
        name: "Location",
        category: "domain",
        description: "Represents a restaurant location in the reporting hierarchy.",
        ownerModuleId: "org_location_hierarchy",
        containsSensitiveData: false,
        sourceIntegrationIds: []
      },
      {
        id: "user",
        name: "User",
        category: "identity",
        description: "Represents an owner, manager, or admin using the platform.",
        ownerModuleId: "auth_identity",
        containsSensitiveData: true,
        sourceIntegrationIds: []
      },
      {
        id: "role",
        name: "Role",
        category: "configuration",
        description: "Represents owner, manager, and admin permissions.",
        ownerModuleId: "role_access_control",
        containsSensitiveData: false,
        sourceIntegrationIds: []
      },
      {
        id: "sales_event",
        name: "Sales event",
        category: "domain",
        description: "Represents normalized POS sales activity.",
        ownerModuleId: "normalized_sales_store",
        containsSensitiveData: false,
        sourceIntegrationIds: ["pos_connector"]
      },
      {
        id: "menu_item",
        name: "Menu item",
        category: "domain",
        description: "Represents a normalized sellable menu item for reporting.",
        ownerModuleId: "normalized_sales_store",
        containsSensitiveData: false,
        sourceIntegrationIds: ["pos_connector"]
      },
      {
        id: "report_snapshot",
        name: "Report snapshot",
        category: "analytics",
        description: "Represents a generated dashboard or export-ready report view.",
        ownerModuleId: "reporting_engine",
        containsSensitiveData: false,
        sourceIntegrationIds: ["pos_connector"]
      },
      {
        id: "connector_sync",
        name: "Connector sync",
        category: "integration",
        description: "Tracks sync state, connector health, and import timing.",
        ownerModuleId: "connector_health",
        containsSensitiveData: false,
        sourceIntegrationIds: ["pos_connector"]
      }
    ],
    integrationTemplates: [
      {
        id: "pos_connector",
        name: "POS connector",
        category: "pos",
        purpose: "Bring in source sales data from the chosen POS provider.",
        requiredForMvp: true,
        moduleIds: ["pos_connector_layer", "normalized_sales_store", "connector_health"],
        dataEntityIds: ["sales_event", "menu_item", "connector_sync", "report_snapshot"],
        notes: "Provider choice stays open until the first connector is confirmed."
      }
    ],
    laneTemplates: [
      {
        id: "foundation_org_model",
        name: "Foundation / org model",
        purpose: "Stabilize org, location, and role boundaries before reporting widens.",
        dependsOnLaneIds: [],
        protectedPaths: [
          "lib/core/auth/**",
          "lib/modules/org-model/**",
          "lib/modules/rbac/**"
        ],
        mergePolicy: "foundation_first"
      },
      {
        id: "connectors",
        name: "Connectors",
        purpose: "Own POS ingestion, normalization, and sync boundaries.",
        dependsOnLaneIds: ["foundation_org_model"],
        protectedPaths: [
          "lib/integrations/pos/**",
          "lib/modules/connector-health/**",
          "lib/modules/sales-store/**"
        ],
        mergePolicy: "dependency_ordered"
      },
      {
        id: "analytics_reporting",
        name: "Analytics / reporting",
        purpose: "Own reporting logic, exports, and launch report definitions.",
        dependsOnLaneIds: ["foundation_org_model", "connectors"],
        protectedPaths: [
          "lib/modules/reporting/**",
          "lib/modules/exports/**",
          "lib/entities/report-snapshot/**"
        ],
        mergePolicy: "dependency_ordered"
      },
      {
        id: "product_web",
        name: "Product web",
        purpose: "Deliver owner and manager dashboards on top of stable report APIs.",
        dependsOnLaneIds: ["foundation_org_model", "analytics_reporting"],
        protectedPaths: [
          "app/(owner)/**",
          "app/(manager)/**",
          "components/dashboard/**"
        ],
        mergePolicy: "review_required"
      },
      {
        id: "admin_reporting",
        name: "Admin reporting",
        purpose: "Keep reporting controls and connector operations isolated from dashboard delivery.",
        dependsOnLaneIds: ["foundation_org_model", "connectors", "analytics_reporting"],
        protectedPaths: [
          "app/(admin)/**",
          "components/admin/**"
        ],
        mergePolicy: "review_required"
      },
      {
        id: "observability_quality",
        name: "Observability / quality",
        purpose: "Protect connector health, report trust, and release quality.",
        dependsOnLaneIds: [
          "foundation_org_model",
          "connectors",
          "analytics_reporting",
          "product_web",
          "admin_reporting"
        ],
        protectedPaths: [
          "tests/**",
          "lib/observability/**",
          "app/api/health/**"
        ],
        mergePolicy: "review_required"
      }
    ],
    riskTemplates: [
      {
        id: "restaurant_connector_reliability",
        title: "Connector reliability is a launch-critical risk",
        severity: "high",
        area: "connector health",
        description:
          "Reporting trust breaks quickly if the first POS connector or sync model is still fuzzy.",
        mitigation:
          "Confirm the first connector, isolate sync logic in the connectors lane, and keep health state visible in admin reporting.",
        relatedModuleIds: [
          "pos_connector_layer",
          "normalized_sales_store",
          "connector_health"
        ],
        relatedInputIds: ["firstPosConnector", "launchReports"]
      },
      {
        id: "restaurant_location_permissions",
        title: "Location permissions need early clarity",
        severity: "high",
        area: "access control",
        description:
          "Owners and managers need different visibility, especially if multi-location reporting lands early.",
        mitigation:
          "Lock the launch location model and keep role/location rules inside the foundation org-model lane.",
        relatedModuleIds: [
          "org_location_hierarchy",
          "role_access_control",
          "owner_manager_dashboards"
        ],
        relatedInputIds: ["launchLocationModel", "analyticsVsStaffWorkflows"]
      },
      {
        id: "restaurant_reporting_trust",
        title: "Report trust depends on the launch report set",
        severity: "medium",
        area: "analytics",
        description:
          "If launch reports stay vague, the reporting engine can sprawl and produce untrusted exports.",
        mitigation:
          "Confirm the must-have launch reports before roadmap generation and keep extra reporting outside the first lane set.",
        relatedModuleIds: ["reporting_engine", "exports_service"],
        relatedInputIds: ["launchReports"]
      }
    ]
  }
};

export function getArchitectureDomainDefaults(domainPackId: DomainPackId) {
  return ARCHITECTURE_DOMAIN_DEFAULTS[domainPackId];
}
