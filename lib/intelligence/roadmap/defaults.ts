import type { DomainPackId } from "../domain-contracts.ts";
import type { ArchitectureInputId } from "../architecture/types.ts";
import type { NotInScopeReason } from "./types.ts";

export type RoadmapTemplateCriterion = {
  label: string;
  description: string;
};

export type RoadmapTemplateBoundary = {
  label: string;
  reason: string;
  deferredBecause: NotInScopeReason;
};

export type RoadmapPhaseTemplate = {
  phaseId: string;
  name: string;
  laneIds: string[];
  goal: string;
  targetOutcome: string;
  deliverableHints: string[];
  acceptanceCriteria: RoadmapTemplateCriterion[];
  notInScope: RoadmapTemplateBoundary[];
  riskNotes: string[];
  additionalDependsOnPhaseIds?: string[];
  mvpIncluded?: boolean;
};

export type RoadmapDomainDefaults = {
  domainPackId: DomainPackId;
  requiredScopeInputs: ArchitectureInputId[];
  sequencingNotes: string[];
  mvpSummary: string;
  phaseTemplates: RoadmapPhaseTemplate[];
};

export const ROADMAP_DOMAIN_DEFAULTS: Record<DomainPackId, RoadmapDomainDefaults> = {
  generic_saas: {
    domainPackId: "generic_saas",
    requiredScopeInputs: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "integrations",
      "constraints"
    ],
    sequencingNotes: [
      "Finish the foundation lane before workflow-core or integrations work widens.",
      "Keep the first customer-facing product surface downstream of stable workflow contracts.",
      "Treat admin and observability work as hardening lanes after the first usable workflow is defined."
    ],
    mvpSummary:
      "Ship a usable first SaaS workflow with stable identity, workflow logic, and one customer-facing surface before deeper admin and hardening work expands.",
    phaseTemplates: [
      {
        phaseId: "phase_1_foundation",
        name: "Phase 1: Foundation and shared product model",
        laneIds: ["foundation"],
        goal: "Stabilize identity, tenancy, and the shared model before feature work widens.",
        targetOutcome: "Core account and workspace boundaries are ready for downstream product work.",
        deliverableHints: [
          "Settle the shared identity and tenancy contracts.",
          "Define the first stable product model that later workflow work can rely on."
        ],
        acceptanceCriteria: [
          {
            label: "Foundation contracts are stable",
            description:
              "Identity and tenancy boundaries are explicit enough that later feature lanes can build without redefining them."
          },
          {
            label: "Shared product model exists",
            description:
              "The core product record and permissions baseline are settled well enough to support later roadmap phases."
          }
        ],
        notInScope: [
          {
            label: "Customer-facing workflow polish",
            reason: "Customer web experience should not widen before shared product contracts are stable.",
            deferredBecause: "dependency"
          },
          {
            label: "Expanded admin tooling",
            reason: "Admin controls belong after the main workflow boundary is defined.",
            deferredBecause: "later_phase"
          }
        ],
        riskNotes: [
          "Permissions drift here will ripple into every later phase."
        ],
        mvpIncluded: true
      },
      {
        phaseId: "phase_2_core_workflow",
        name: "Phase 2: Core workflow and integrations",
        laneIds: ["workflow_core", "integrations"],
        goal: "Turn the shared model into the first real workflow and connect the minimum outside systems.",
        targetOutcome: "The product can run its core workflow with the minimum viable external-system support.",
        deliverableHints: [
          "Implement the core business workflow.",
          "Land the first integration contract without widening the MVP."
        ],
        acceptanceCriteria: [
          {
            label: "Core workflow is usable",
            description:
              "The main business flow can run end to end for the first target persona using stable contracts."
          },
          {
            label: "First integration is bounded",
            description:
              "The launch integration is connected behind a clear interface and does not leak scope into unrelated modules."
          }
        ],
        notInScope: [
          {
            label: "Broader integration catalog",
            reason: "Only the first launch integration belongs in the initial roadmap sequence.",
            deferredBecause: "mvp_boundary"
          },
          {
            label: "Expanded admin reporting",
            reason: "The roadmap should validate the product workflow before widening back-office features.",
            deferredBecause: "later_phase"
          }
        ],
        riskNotes: [
          "Integration uncertainty can widen this phase if the launch system is not confirmed."
        ],
        mvpIncluded: true
      },
      {
        phaseId: "phase_3_product_surface",
        name: "Phase 3: Customer-facing MVP surface",
        laneIds: ["product_web"],
        goal: "Deliver the first user-facing experience on top of stable workflow and integration contracts.",
        targetOutcome: "The target user can complete the first intended workflow in the product surface.",
        deliverableHints: [
          "Ship the first customer-facing workflow surface.",
          "Expose the minimum search, dashboard, or action flow needed for the MVP."
        ],
        acceptanceCriteria: [
          {
            label: "Primary surface is usable",
            description:
              "The main launch surface supports the core user journey without requiring admin fallback."
          },
          {
            label: "Scope stays tight",
            description:
              "The customer surface is constrained to the must-have workflow and avoids early nice-to-have sprawl."
          }
        ],
        notInScope: [
          {
            label: "Secondary surfaces",
            reason: "Extra customer portals, mobile variants, or side experiences should wait until the core surface proves out.",
            deferredBecause: "mvp_boundary"
          },
          {
            label: "Deep operational tooling",
            reason: "Operational tooling is downstream of the first user-facing MVP experience.",
            deferredBecause: "later_phase"
          }
        ],
        riskNotes: [
          "User-facing polish can drift beyond the MVP if the scope boundary is not held."
        ],
        mvpIncluded: true
      },
      {
        phaseId: "phase_4_admin_and_quality",
        name: "Phase 4: Admin controls and quality hardening",
        laneIds: ["admin_console", "observability_quality"],
        goal: "Harden the product for controlled rollout, visibility, and operational safety.",
        targetOutcome: "Operators can manage the product safely and quality signals exist before wider rollout.",
        deliverableHints: [
          "Add the minimum admin controls needed for launch safety.",
          "Add quality and observability checks around the first release boundary."
        ],
        acceptanceCriteria: [
          {
            label: "Operators can manage the launch safely",
            description:
              "Admins can access the controls they need to support the first release without bypassing the product boundary."
          },
          {
            label: "Quality checks exist",
            description:
              "Monitoring, QA, or release checks cover the core workflow and the most important failure modes."
          }
        ],
        notInScope: [
          {
            label: "Broad internal tooling expansion",
            reason: "Only the controls needed to support the first release belong here.",
            deferredBecause: "mvp_boundary"
          },
          {
            label: "Execution automation",
            reason: "Execution orchestration remains a later step outside this roadmap pass.",
            deferredBecause: "later_phase"
          }
        ],
        riskNotes: [
          "Operational hardening can grow too wide if it stops being anchored to the MVP."
        ],
        mvpIncluded: false
      }
    ]
  },
  crypto_analytics: {
    domainPackId: "crypto_analytics",
    requiredScopeInputs: [
      "productCategory",
      "buyerPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "chainsInScope",
      "walletConnectionMvp",
      "adviceAdjacency",
      "riskSignalSources",
      "integrations",
      "dataSources",
      "constraints"
    ],
    sequencingNotes: [
      "Do not widen investor-facing surfaces until ingestion and scoring contracts are stable enough to trust.",
      "Keep wallet connection out of the critical path unless the MVP explicitly requires it.",
      "Treat admin controls and explainability hardening as downstream of a usable investor MVP."
    ],
    mvpSummary:
      "Ship a web-first crypto analytics MVP that can ingest scoped chain data, compute a transparent risk score, and let investors evaluate projects before admin hardening widens.",
    phaseTemplates: [
      {
        phaseId: "phase_1_foundation",
        name: "Phase 1: Foundation, shared models, and auth",
        laneIds: ["foundation"],
        goal: "Stabilize access, project/token registry, and shared crypto data models first.",
        targetOutcome: "Identity and project coverage contracts are stable enough for ingestion and scoring work.",
        deliverableHints: [
          "Settle the project/token registry and identity boundary.",
          "Define the first stable project coverage model for downstream scoring."
        ],
        acceptanceCriteria: [
          {
            label: "Registry model is stable",
            description:
              "Project/token records and identity boundaries are explicit enough for ingestion and scoring work to depend on them."
          },
          {
            label: "Launch access posture is clear",
            description:
              "The MVP has a clear access boundary for investors and internal analysts without widening into optional wallet flows."
          }
        ],
        notInScope: [
          {
            label: "Investor dashboard delivery",
            reason: "Investor surfaces should wait until scoring and data contracts are trustworthy.",
            deferredBecause: "dependency"
          },
          {
            label: "Admin rule authoring",
            reason: "Rule controls are downstream of the first usable score output.",
            deferredBecause: "later_phase"
          }
        ],
        riskNotes: [
          "Loose project coverage rules here will destabilize chain ingestion and scoring later."
        ],
        mvpIncluded: true
      },
      {
        phaseId: "phase_2_data_and_scoring",
        name: "Phase 2: Data ingestion, normalization, and risk-engine core",
        laneIds: ["data_ingestion", "risk_engine"],
        goal: "Land the minimum ingest-to-score path that can support a trustworthy first investor decision flow.",
        targetOutcome: "Scoped source data can be normalized into a usable risk score with basic explanation output.",
        deliverableHints: [
          "Land the first provider ingestion path and normalization layer.",
          "Compute the core risk score and explanation factors from the scoped signal set."
        ],
        acceptanceCriteria: [
          {
            label: "Scoped data reaches the score",
            description:
              "The selected provider inputs normalize cleanly into the scoring pipeline for in-scope projects."
          },
          {
            label: "Risk score has explainable factors",
            description:
              "The core score output is paired with clear enough reasoning that the investor surface can present it credibly."
          }
        ],
        notInScope: [
          {
            label: "Extra chains beyond the launch scope",
            reason: "Broader chain coverage should stay deferred until the initial signal set and providers are confirmed.",
            deferredBecause: "scope_decision"
          },
          {
            label: "Portfolio or wallet-linked features",
            reason: "Wallet-linked flows should remain off the critical path unless the MVP explicitly requires them.",
            deferredBecause: "scope_decision"
          }
        ],
        riskNotes: [
          "Unknown chain or signal scope can widen this phase dramatically.",
          "Advice-adjacent scoring language can create trust and compliance risk if left fuzzy."
        ],
        mvpIncluded: true
      },
      {
        phaseId: "phase_3_investor_mvp",
        name: "Phase 3: Investor MVP surface",
        laneIds: ["product_web"],
        goal: "Deliver the first investor-facing experience for project discovery and risk review.",
        targetOutcome: "Investors can browse project profiles, compare risk, and track a watchlist inside the MVP surface.",
        deliverableHints: [
          "Ship project profiles, search/filter, and the first watchlist flow.",
          "Present risk score and explanation output inside the investor experience."
        ],
        acceptanceCriteria: [
          {
            label: "Investor workflow is usable",
            description:
              "An investor can move from discovery to project review to a saved watchlist path without internal support."
          },
          {
            label: "Score presentation is understandable",
            description:
              "The score and explanation output are clear enough that the MVP does not rely on hidden operator interpretation."
          }
        ],
        notInScope: [
          {
            label: "Advanced portfolio context",
            reason: "Portfolio overlays and broader personalized analytics should wait until the core investor workflow proves out.",
            deferredBecause: "mvp_boundary"
          },
          {
            label: "Expanded advice-like guidance",
            reason: "Recommendation-style product behavior is out of scope until the analytics boundary is intentionally revisited.",
            deferredBecause: "mvp_boundary"
          }
        ],
        riskNotes: [
          "Investor-facing scope can sprawl into portfolio or alert systems too early."
        ],
        mvpIncluded: true
      },
      {
        phaseId: "phase_4_admin_trust",
        name: "Phase 4: Admin controls, explainability hardening, and trust polish",
        laneIds: ["admin_console", "observability_quality"],
        goal: "Harden rule controls, explainability, and launch trust signals before broader rollout.",
        targetOutcome: "Internal operators can manage rules safely and the product has the quality signals needed for a controlled rollout.",
        deliverableHints: [
          "Add admin rule controls and operator-safe overrides.",
          "Harden explainability, monitoring, and quality checks around the scoring surface."
        ],
        acceptanceCriteria: [
          {
            label: "Admin rule path is safe",
            description:
              "Analyst or operator controls exist for rule management without weakening the launch trust boundary."
          },
          {
            label: "Trust hardening is visible",
            description:
              "Monitoring, audit, or quality checks cover the most important score and ingestion failure modes."
          }
        ],
        notInScope: [
          {
            label: "Broader automation or autonomous recommendations",
            reason: "Autonomous or advice-adjacent expansion is outside this roadmap step and outside the initial product boundary.",
            deferredBecause: "later_phase"
          },
          {
            label: "Full portfolio intelligence suite",
            reason: "The roadmap should harden the core investor MVP before expanding into deeper investor tooling.",
            deferredBecause: "later_phase"
          }
        ],
        riskNotes: [
          "Admin and trust work can drift into a second product if it stops anchoring to the MVP."
        ],
        mvpIncluded: false
      }
    ]
  },
  restaurant_sales: {
    domainPackId: "restaurant_sales",
    requiredScopeInputs: [
      "productCategory",
      "buyerPersonas",
      "operatorPersonas",
      "problemStatement",
      "mustHaveFeatures",
      "surfaces",
      "launchLocationModel",
      "firstPosConnector",
      "analyticsVsStaffWorkflows",
      "launchReports",
      "integrations",
      "dataSources",
      "constraints"
    ],
    sequencingNotes: [
      "Do not widen dashboard work until org/location permissions and the first connector contract are clear.",
      "Keep staff workflows out of the MVP unless the roadmap explicitly confirms them.",
      "Treat admin reporting and multi-location depth as downstream of a usable reporting MVP."
    ],
    mvpSummary:
      "Ship a reporting-first restaurant sales MVP that models the org/location boundary, lands one POS connector, and delivers the first owner/manager reporting surface before deeper admin and multi-location expansion.",
    phaseTemplates: [
      {
        phaseId: "phase_1_foundation",
        name: "Phase 1: Org, location, auth, and permissions foundation",
        laneIds: ["foundation_org_model"],
        goal: "Stabilize the organization, location, and role model before reporting and connector work widens.",
        targetOutcome: "Owner, manager, and location boundaries are clear enough for connector and reporting work.",
        deliverableHints: [
          "Define the organization and location hierarchy.",
          "Lock the initial owner/manager/admin permission model."
        ],
        acceptanceCriteria: [
          {
            label: "Location model is stable",
            description:
              "The roadmap has a clear organization-to-location boundary for the launch reporting model."
          },
          {
            label: "Role access is clear",
            description:
              "Owners, managers, and admins have a stable access baseline for downstream reporting work."
          }
        ],
        notInScope: [
          {
            label: "Dashboard expansion before permissions are stable",
            reason: "Reporting surfaces should not widen before location visibility rules are explicit.",
            deferredBecause: "dependency"
          },
          {
            label: "Operations workflow tooling",
            reason: "The roadmap should validate reporting-first scope before widening into broader staff workflows.",
            deferredBecause: "mvp_boundary"
          }
        ],
        riskNotes: [
          "Weak location permissions will create reporting-trust problems later."
        ],
        mvpIncluded: true
      },
      {
        phaseId: "phase_2_connector_flow",
        name: "Phase 2: First connector and normalized sales data flow",
        laneIds: ["connectors"],
        goal: "Land the first POS connector and normalize the minimum restaurant sales data needed for reporting.",
        targetOutcome: "The first connector can sync scoped sales data into a consistent reporting model.",
        deliverableHints: [
          "Implement the first POS connector path.",
          "Normalize location and menu sales data into the reporting store."
        ],
        acceptanceCriteria: [
          {
            label: "First connector is operational",
            description:
              "The launch connector can sync source sales data into the normalized model without manual fallback."
          },
          {
            label: "Reporting data is normalized",
            description:
              "Location and menu-item sales data are consistent enough that the reporting phase can build on them."
          }
        ],
        notInScope: [
          {
            label: "Multiple connector rollout",
            reason: "Only the first connector belongs in the MVP critical path.",
            deferredBecause: "mvp_boundary"
          },
          {
            label: "Expanded data ingestion breadth",
            reason: "Additional back-office systems should stay out of scope until the reporting MVP is working.",
            deferredBecause: "later_phase"
          }
        ],
        riskNotes: [
          "Connector choice and sync reliability remain the biggest source of roadmap volatility here."
        ],
        mvpIncluded: true
      },
      {
        phaseId: "phase_3_reporting_mvp",
        name: "Phase 3: Reporting MVP, dashboards, and exports",
        laneIds: ["analytics_reporting", "product_web"],
        goal: "Deliver the first owner/manager reporting experience on top of trusted connector data.",
        targetOutcome: "Owners and managers can review launch reports, dashboards, and exports without admin assistance.",
        deliverableHints: [
          "Implement the first reporting engine outputs.",
          "Ship owner and manager dashboards plus the minimum export path."
        ],
        acceptanceCriteria: [
          {
            label: "Launch reports are usable",
            description:
              "The agreed launch report set is available with stable location and menu-item reporting."
          },
          {
            label: "Dashboards support owners and managers",
            description:
              "Both primary personas can see the reporting views they need without relying on admin-only tooling."
          }
        ],
        notInScope: [
          {
            label: "Broader workflow software",
            reason: "Scheduling, approvals, or staffing workflows stay out of scope unless they are explicitly promoted into the MVP.",
            deferredBecause: "scope_decision"
          },
          {
            label: "Benchmarking and extended analytics",
            reason: "Advanced analytics should wait until the launch report set is proven.",
            deferredBecause: "later_phase"
          }
        ],
        riskNotes: [
          "An undefined launch report set can cause reporting sprawl in this phase."
        ],
        mvpIncluded: true
      },
      {
        phaseId: "phase_4_admin_and_multi_location",
        name: "Phase 4: Admin reporting, connector health, and multi-location depth",
        laneIds: ["admin_reporting", "observability_quality"],
        goal: "Harden connector operations, admin reporting controls, and any approved multi-location depth beyond the MVP.",
        targetOutcome: "Operators can manage connector health safely and the product has the support signals needed for controlled rollout.",
        deliverableHints: [
          "Add admin reporting controls and connector health visibility.",
          "Harden observability and the approved multi-location depth after the reporting MVP is stable."
        ],
        acceptanceCriteria: [
          {
            label: "Admin support path is safe",
            description:
              "Operators can inspect connector state and manage reporting support tasks without breaking persona boundaries."
          },
          {
            label: "Rollout visibility exists",
            description:
              "Monitoring and support signals exist for connector failures, data freshness, and launch reporting quality."
          }
        ],
        notInScope: [
          {
            label: "Broad operational back-office suite",
            reason: "The roadmap should only add admin depth that directly supports the reporting MVP.",
            deferredBecause: "later_phase"
          },
          {
            label: "Execution automation",
            reason: "Execution orchestration remains outside this roadmap-only step.",
            deferredBecause: "later_phase"
          }
        ],
        riskNotes: [
          "Multi-location expansion can destabilize the MVP if it is not explicitly bounded."
        ],
        mvpIncluded: false
      }
    ]
  }
};

export function getRoadmapDomainDefaults(domainPackId: DomainPackId) {
  return ROADMAP_DOMAIN_DEFAULTS[domainPackId];
}
