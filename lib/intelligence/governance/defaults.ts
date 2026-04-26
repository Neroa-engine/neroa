import type { DomainPackId } from "../domain-contracts.ts";
import type { ArchitectureInputId } from "../architecture/types.ts";
import type {
  ApprovalChecklistBlockerLevel,
  GovernanceChecklistScopeArea,
  GovernanceRisk
} from "./types.ts";

export type GovernanceChecklistRequirement = {
  inputId: ArchitectureInputId;
  label: string;
  relatedScopeArea: GovernanceChecklistScopeArea;
  blockerLevel: ApprovalChecklistBlockerLevel;
  condition?: "always" | "if_multi_location_positioned";
};

export type GovernanceDomainDefaults = {
  domainPackId: DomainPackId;
  inputRequirements: GovernanceChecklistRequirement[];
  hardGuardNotes: string[];
  roadmapExpansionSignals: string[];
  architectureExpansionSignals: string[];
  governanceConflictSignals: string[];
  riskTemplates: GovernanceRisk[];
  deltaNextActions: {
    withinScope: string;
    preApproval: string;
    scopeExpansion: string;
    architectureExpansion: string;
    governanceConflict: string;
  };
};

const GENERIC_GOVERNANCE_CONFLICT_SIGNALS = [
  "skip approval",
  "without approval",
  "ignore roadmap",
  "bypass strategy room",
  "execute anyway",
  "ship it anyway",
  "same branch for all lanes",
  "single worktree for every lane",
  "merge everything together",
  "ignore qa",
  "skip qa"
];

export const GOVERNANCE_DOMAIN_DEFAULTS: Record<
  DomainPackId,
  GovernanceDomainDefaults
> = {
  generic_saas: {
    domainPackId: "generic_saas",
    inputRequirements: [
      {
        inputId: "productCategory",
        label: "Product category is explicit",
        relatedScopeArea: "product_scope",
        blockerLevel: "important"
      },
      {
        inputId: "buyerPersonas",
        label: "Primary buyer is explicit",
        relatedScopeArea: "product_scope",
        blockerLevel: "important"
      },
      {
        inputId: "problemStatement",
        label: "Problem statement is explicit",
        relatedScopeArea: "product_scope",
        blockerLevel: "important"
      },
      {
        inputId: "mustHaveFeatures",
        label: "Must-have MVP features are explicit",
        relatedScopeArea: "roadmap",
        blockerLevel: "blocking"
      },
      {
        inputId: "integrations",
        label: "Launch integrations are explicit",
        relatedScopeArea: "integrations",
        blockerLevel: "important"
      },
      {
        inputId: "constraints",
        label: "Constraints and compliance notes are explicit",
        relatedScopeArea: "compliance",
        blockerLevel: "important"
      }
    ],
    hardGuardNotes: [
      "No execution is allowed before Strategy Room confirms roadmap and scope readiness.",
      "Do not widen the MVP by silently adding second surfaces, secondary integrations, or admin depth.",
      "Cross-lane delivery still requires per-lane worktree discipline and review."
    ],
    roadmapExpansionSignals: [
      "add to mvp",
      "include in mvp",
      "second integration",
      "mobile app",
      "native app",
      "second portal",
      "extra admin console"
    ],
    architectureExpansionSignals: [
      "public api",
      "auth rewrite",
      "billing system",
      "new connector layer",
      "new data pipeline"
    ],
    governanceConflictSignals: [...GENERIC_GOVERNANCE_CONFLICT_SIGNALS],
    riskTemplates: [
      {
        id: "generic_scope_drift",
        title: "Generic SaaS MVP can drift before approval",
        severity: "medium",
        area: "scope control",
        description:
          "SaaS products widen quickly if the MVP boundary, integrations, and admin depth are not held explicitly.",
        mitigation:
          "Keep must-have features, launch integrations, and not-in-scope boundaries explicit before approval.",
        relatedPhaseIds: [
          "phase_1_foundation",
          "phase_2_core_workflow",
          "phase_3_product_surface"
        ],
        relatedModuleIds: ["workflow_core", "integration_hub", "product_web"],
        relatedInputIds: ["mustHaveFeatures", "integrations", "constraints"]
      }
    ],
    deltaNextActions: {
      withinScope:
        "Keep the request inside the approved lanes, then pass it through the existing execution gate.",
      preApproval:
        "Save the request as pending execution and tighten roadmap approval blockers in Strategy Room first.",
      scopeExpansion:
        "Open a roadmap revision in Strategy Room before widening the MVP boundary.",
      architectureExpansion:
        "Refresh architecture and roadmap together before treating the request as executable work.",
      governanceConflict:
        "Resolve the governance conflict before the request can be treated as roadmap or execution work."
    }
  },
  crypto_analytics: {
    domainPackId: "crypto_analytics",
    inputRequirements: [
      {
        inputId: "chainsInScope",
        label: "Supported chains are explicitly approved",
        relatedScopeArea: "integrations",
        blockerLevel: "blocking"
      },
      {
        inputId: "walletConnectionMvp",
        label: "Wallet connection boundary is explicitly approved",
        relatedScopeArea: "product_scope",
        blockerLevel: "blocking"
      },
      {
        inputId: "adviceAdjacency",
        label: "Analytics-only vs advice-adjacent posture is explicit",
        relatedScopeArea: "compliance",
        blockerLevel: "blocking"
      },
      {
        inputId: "riskSignalSources",
        label: "Scoring inputs and vendor sources are explicitly approved",
        relatedScopeArea: "integrations",
        blockerLevel: "blocking"
      }
    ],
    hardGuardNotes: [
      "No crypto execution work is allowed before Strategy Room approves score scope, chains, and posture.",
      "Wallet connection cannot silently enter the MVP while the wallet boundary is still unresolved.",
      "Advice-adjacent or recommendation-like behavior must be explicitly promoted before approval readiness can become true."
    ],
    roadmapExpansionSignals: [
      "trading signals",
      "buy sell recommendation",
      "investment recommendation",
      "portfolio tracking",
      "portfolio alerts",
      "price alerts"
    ],
    architectureExpansionSignals: [
      "wallet portfolio import",
      "portfolio import",
      "connect wallet",
      "wallet connection",
      "additional chain",
      "new chain",
      "new scoring vendor",
      "new data provider"
    ],
    governanceConflictSignals: [
      ...GENERIC_GOVERNANCE_CONFLICT_SIGNALS,
      "treat it as advice",
      "financial advice",
      "skip disclosures"
    ],
    riskTemplates: [
      {
        id: "crypto_scope_wallet_boundary",
        title: "Wallet-linked scope is still governance-sensitive",
        severity: "high",
        area: "scope control",
        description:
          "Wallet-linked product additions change the auth, trust, and MVP boundary far more than a cosmetic web change.",
        mitigation:
          "Keep wallet support outside the approved MVP until Strategy Room explicitly promotes it and the architecture is refreshed if needed.",
        relatedPhaseIds: ["phase_2_data_and_scoring", "phase_3_investor_mvp"],
        relatedModuleIds: ["auth_identity", "watchlist", "investor_dashboard"],
        relatedInputIds: ["walletConnectionMvp"]
      },
      {
        id: "crypto_advice_boundary",
        title: "Advice posture remains an approval blocker",
        severity: "high",
        area: "trust and compliance",
        description:
          "If the product drifts from analytics into recommendations without explicit approval, the trust and compliance posture changes immediately.",
        mitigation:
          "Keep analytics-only vs advice-adjacent posture explicit in governance, not implied through copy or score presentation.",
        relatedPhaseIds: ["phase_2_data_and_scoring", "phase_4_admin_trust"],
        relatedModuleIds: ["risk_engine", "score_explanation", "admin_rules_console"],
        relatedInputIds: ["adviceAdjacency", "riskSignalSources"]
      }
    ],
    deltaNextActions: {
      withinScope:
        "Keep the request inside the approved investor/admin lanes, then route it through the existing execution gate.",
      preApproval:
        "Save the request as pending execution and clear the remaining scope blockers in Strategy Room first.",
      scopeExpansion:
        "Open a roadmap revision before widening crypto MVP scope beyond the approved analytics boundary.",
      architectureExpansion:
        "Refresh architecture and roadmap before adding wallet-linked or new-ingestion scope to the MVP.",
      governanceConflict:
        "Resolve the approval or trust conflict before the request can be considered executable."
    }
  },
  restaurant_sales: {
    domainPackId: "restaurant_sales",
    inputRequirements: [
      {
        inputId: "firstPosConnector",
        label: "First POS connector is explicitly chosen",
        relatedScopeArea: "integrations",
        blockerLevel: "blocking"
      },
      {
        inputId: "launchLocationModel",
        label: "Launch multi-location depth is explicit",
        relatedScopeArea: "roadmap",
        blockerLevel: "blocking",
        condition: "if_multi_location_positioned"
      },
      {
        inputId: "analyticsVsStaffWorkflows",
        label: "Analytics-only vs staff-workflow expansion is explicit",
        relatedScopeArea: "product_scope",
        blockerLevel: "blocking"
      },
      {
        inputId: "launchReports",
        label: "Launch report set is explicitly approved",
        relatedScopeArea: "roadmap",
        blockerLevel: "blocking"
      }
    ],
    hardGuardNotes: [
      "No restaurant execution work is allowed before Strategy Room approves the connector, report set, and launch scope.",
      "A second POS connector cannot silently enter the MVP while the first connector boundary is still tightening.",
      "If the product positions itself as multi-location, the launch depth must be explicit before approval readiness can become true."
    ],
    roadmapExpansionSignals: [
      "second pos connector",
      "second connector",
      "multiple connectors",
      "staff scheduling",
      "payroll",
      "inventory management",
      "labor management"
    ],
    architectureExpansionSignals: [
      "kitchen display system",
      "erp integration",
      "warehouse integration",
      "delivery marketplace integration"
    ],
    governanceConflictSignals: [
      ...GENERIC_GOVERNANCE_CONFLICT_SIGNALS,
      "ignore connector health",
      "skip location permissions"
    ],
    riskTemplates: [
      {
        id: "restaurant_connector_scope",
        title: "Connector expansion is a roadmap change, not a casual add-on",
        severity: "high",
        area: "connector governance",
        description:
          "Connector additions change sync contracts, test load, and reporting trust well beyond a routine dashboard tweak.",
        mitigation:
          "Treat additional connector requests as roadmap revisions and keep the first connector explicit before approval.",
        relatedPhaseIds: ["phase_2_connector_flow", "phase_4_admin_and_multi_location"],
        relatedModuleIds: [
          "pos_connector_layer",
          "normalized_sales_store",
          "connector_health"
        ],
        relatedInputIds: ["firstPosConnector", "launchReports"]
      },
      {
        id: "restaurant_multi_location_boundary",
        title: "Multi-location depth can invalidate prior approval",
        severity: "high",
        area: "scope control",
        description:
          "Multi-location positioning changes permissions, report rollups, and dashboard obligations across the product.",
        mitigation:
          "Keep launch location depth explicit in governance and reset approval when a revision widens that boundary.",
        relatedPhaseIds: [
          "phase_1_foundation",
          "phase_3_reporting_mvp",
          "phase_4_admin_and_multi_location"
        ],
        relatedModuleIds: [
          "org_location_hierarchy",
          "role_access_control",
          "owner_manager_dashboards"
        ],
        relatedInputIds: ["launchLocationModel", "analyticsVsStaffWorkflows"]
      }
    ],
    deltaNextActions: {
      withinScope:
        "Keep the request inside the approved reporting lanes, then route it through the existing execution gate.",
      preApproval:
        "Save the request as pending execution and tighten approval blockers in Strategy Room first.",
      scopeExpansion:
        "Open a roadmap revision before widening the restaurant MVP beyond the approved connector and reporting scope.",
      architectureExpansion:
        "Refresh architecture and roadmap before introducing a new operational system beyond the reporting stack.",
      governanceConflict:
        "Resolve the governance or permissions conflict before the request can move forward."
    }
  }
};

export function getGovernanceDomainDefaults(domainPackId: DomainPackId) {
  return GOVERNANCE_DOMAIN_DEFAULTS[domainPackId];
}
