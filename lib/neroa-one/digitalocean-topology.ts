export const NEROA_ONE_DIGITALOCEAN_TOPOLOGY_SERVICE_KINDS = [
  "app_api",
  "neroa_one_api",
  "d_analyzer_service",
  "outcome_lane_service",
  "prompt_service",
  "code_execution_worker",
  "worker_output_receiver",
  "output_review_service",
  "repair_queue_service",
  "qc_browser_worker",
  "evidence_service",
  "audit_admin_service",
  "customer_follow_up_service",
  "strategy_escalation_service",
  "integration_onboarding_service",
  "database_migration_worker",
  "health_check_worker",
  "browser_automation_fallback_worker"
] as const;

export const NEROA_ONE_DIGITALOCEAN_TOPOLOGY_RUNTIME_ROLES = [
  "api",
  "worker",
  "scheduler",
  "receiver",
  "observer",
  "verifier",
  "fallback_worker"
] as const;

export const NEROA_ONE_DIGITALOCEAN_TOPOLOGY_DEPLOYMENT_STAGES = [
  "modular_monolith",
  "split_app_and_workers",
  "dedicated_lane_services",
  "horizontal_worker_pools",
  "service_pools_autoscale"
] as const;

export const NEROA_ONE_DIGITALOCEAN_TOPOLOGY_SCALING_TIERS = [
  "one_droplet",
  "two_to_three_droplets",
  "five_droplets",
  "ten_droplets",
  "twenty_plus_droplets"
] as const;

export const NEROA_ONE_DIGITALOCEAN_SHARED_BACKBONE_IDS = [
  "storage_adapters",
  "queue_adapters",
  "artifact_storage",
  "observability",
  "internal_service_auth",
  "health_checks",
  "admin_read_model"
] as const;

export const NEROA_ONE_DIGITALOCEAN_TOPOLOGY_LANE_IDS = [
  "app_api_ingress",
  "neroa_one_api_boundary",
  "d_analyzer_boundary",
  "ready_to_build",
  "needs_customer_answer",
  "roadmap_revision_required",
  "blocked_missing_information",
  "rejected_outside_scope",
  "prompt_room",
  "code_execution_worker",
  "codex_output_box",
  "output_review",
  "repair_queue",
  "qc_station",
  "evidence_linking",
  "audit_room",
  "customer_follow_up",
  "strategy_escalation",
  "integration_onboarding",
  "database_migration",
  "platform_health_checks",
  "browser_automation_fallback"
] as const;

export const NEROA_ONE_DIGITALOCEAN_QUEUE_ADAPTER_IDS = [
  "outcome_lane_queue_adapter",
  "prompt_room_queue_adapter",
  "code_execution_worker_queue_adapter",
  "worker_output_receiver_queue_adapter",
  "output_review_queue_adapter",
  "repair_queue_queue_adapter",
  "qc_browser_worker_queue_adapter",
  "evidence_service_queue_adapter",
  "audit_admin_queue_adapter",
  "customer_follow_up_queue_adapter",
  "strategy_escalation_queue_adapter",
  "integration_onboarding_queue_adapter",
  "database_migration_queue_adapter",
  "health_check_queue_adapter",
  "browser_automation_fallback_queue_adapter"
] as const;

export const NEROA_ONE_DIGITALOCEAN_STORAGE_ADAPTER_IDS = [
  "outcome_lane_storage_adapter",
  "prompt_room_storage_adapter",
  "code_execution_worker_storage_adapter",
  "worker_output_receiver_storage_adapter",
  "output_review_storage_adapter",
  "repair_queue_storage_adapter",
  "qc_browser_worker_storage_adapter",
  "evidence_service_storage_adapter",
  "audit_admin_storage_adapter",
  "customer_follow_up_storage_adapter",
  "strategy_escalation_storage_adapter",
  "integration_onboarding_storage_adapter",
  "database_migration_storage_adapter",
  "health_check_storage_adapter",
  "browser_automation_fallback_storage_adapter"
] as const;

export type NeroaOneDigitalOceanTopologyServiceKind =
  (typeof NEROA_ONE_DIGITALOCEAN_TOPOLOGY_SERVICE_KINDS)[number];
export type NeroaOneDigitalOceanTopologyRuntimeRole =
  (typeof NEROA_ONE_DIGITALOCEAN_TOPOLOGY_RUNTIME_ROLES)[number];
export type NeroaOneDigitalOceanTopologyDeploymentStage =
  (typeof NEROA_ONE_DIGITALOCEAN_TOPOLOGY_DEPLOYMENT_STAGES)[number];
export type NeroaOneDigitalOceanTopologyScalingTier =
  (typeof NEROA_ONE_DIGITALOCEAN_TOPOLOGY_SCALING_TIERS)[number];
export type NeroaOneDigitalOceanSharedBackboneId =
  (typeof NEROA_ONE_DIGITALOCEAN_SHARED_BACKBONE_IDS)[number];
export type NeroaOneDigitalOceanTopologyLaneId =
  (typeof NEROA_ONE_DIGITALOCEAN_TOPOLOGY_LANE_IDS)[number];
export type NeroaOneDigitalOceanQueueAdapterId =
  (typeof NEROA_ONE_DIGITALOCEAN_QUEUE_ADAPTER_IDS)[number];
export type NeroaOneDigitalOceanStorageAdapterId =
  (typeof NEROA_ONE_DIGITALOCEAN_STORAGE_ADAPTER_IDS)[number];

export type NeroaOneDigitalOceanTopologyTargetIsolation =
  | "shared_process"
  | "dedicated_service"
  | "worker_pool"
  | "scheduler_loop"
  | "observer_pipeline";

export type NeroaOneDigitalOceanTopologyExposure = "ingress_api" | "internal_only";

export type NeroaOneDigitalOceanTopologyServiceGroup =
  | "core_execution_spine"
  | "back_office_platform_ops";

export type NeroaOneDigitalOceanTopologyExtractionMode =
  | "api_first"
  | "queue_first"
  | "observer_first"
  | "scheduler_first"
  | "fallback_only";

export interface NeroaOneDigitalOceanFutureTargetContract {
  topologyTargetId: string;
  isolation: NeroaOneDigitalOceanTopologyTargetIsolation;
  exposure: NeroaOneDigitalOceanTopologyExposure;
  serviceGroup: NeroaOneDigitalOceanTopologyServiceGroup;
  extractionMode: NeroaOneDigitalOceanTopologyExtractionMode;
  backboneDependencies: readonly NeroaOneDigitalOceanSharedBackboneId[];
  notes: readonly string[];
}

export interface NeroaOneDigitalOceanTopologyServiceTarget {
  serviceTargetId: string;
  serviceKind: NeroaOneDigitalOceanTopologyServiceKind;
  runtimeRole: NeroaOneDigitalOceanTopologyRuntimeRole;
  ownedLaneIds: readonly NeroaOneDigitalOceanTopologyLaneId[];
  readsFromLaneIds: readonly NeroaOneDigitalOceanTopologyLaneId[];
  writesToLaneIds: readonly NeroaOneDigitalOceanTopologyLaneId[];
  consumesQueueAdapterIds: readonly NeroaOneDigitalOceanQueueAdapterId[];
  usesStorageAdapterIds: readonly NeroaOneDigitalOceanStorageAdapterId[];
  scalingTier: NeroaOneDigitalOceanTopologyScalingTier;
  deploymentStage: NeroaOneDigitalOceanTopologyDeploymentStage;
  futureDigitalOceanTarget: Readonly<NeroaOneDigitalOceanFutureTargetContract>;
  notes: readonly string[];
}

export interface NeroaOneDigitalOceanSharedBackboneEntry {
  backboneId: NeroaOneDigitalOceanSharedBackboneId;
  summary: string;
  sharedAcrossServiceTargetIds: readonly string[];
  notes: readonly string[];
}

export type NeroaOneDigitalOceanSharedBackbone = Readonly<
  Record<NeroaOneDigitalOceanSharedBackboneId, NeroaOneDigitalOceanSharedBackboneEntry>
>;

export interface NeroaOneDigitalOceanTopologyMap {
  topologyMapId: string;
  version: string;
  deploymentStage: NeroaOneDigitalOceanTopologyDeploymentStage;
  scalingTier: NeroaOneDigitalOceanTopologyScalingTier;
  serviceTargets: readonly Readonly<NeroaOneDigitalOceanTopologyServiceTarget>[];
  sharedBackbone: NeroaOneDigitalOceanSharedBackbone;
  createdAt: string;
}

export interface NeroaOneDigitalOceanTopologyValidationResult {
  valid: boolean;
  errors: readonly string[];
}

export interface NeroaOneDigitalOceanTopologyMapOptions {
  topologyMapId?: string | null;
  version?: string | null;
  createdAt?: string | null;
}

const DEFAULT_TOPOLOGY_VERSION = "neroa-one-digitalocean-topology-v1";
const DEFAULT_CREATED_AT = "2026-05-01T00:00:00.000Z";
const CORE_EXECUTION_SERVICE_TARGET_IDS = [
  "app_api",
  "neroa_one_api",
  "d_analyzer_service",
  "outcome_lane_service",
  "prompt_service",
  "code_execution_worker",
  "worker_output_receiver",
  "output_review_service",
  "repair_queue_service",
  "qc_browser_worker",
  "evidence_service",
  "audit_admin_service",
  "customer_follow_up_service",
  "strategy_escalation_service"
] as const;

const PLATFORM_OPERATIONS_SERVICE_TARGET_IDS = [
  "integration_onboarding_service",
  "database_migration_worker",
  "health_check_worker",
  "browser_automation_fallback_worker"
] as const;

const ALL_SERVICE_TARGET_IDS = [
  ...CORE_EXECUTION_SERVICE_TARGET_IDS,
  ...PLATFORM_OPERATIONS_SERVICE_TARGET_IDS
] as const;

type ServiceTargetBlueprint = Omit<
  NeroaOneDigitalOceanTopologyServiceTarget,
  "scalingTier" | "deploymentStage"
>;

const OUTCOME_LANE_IDS = [
  "ready_to_build",
  "needs_customer_answer",
  "roadmap_revision_required",
  "blocked_missing_information",
  "rejected_outside_scope"
] as const satisfies readonly NeroaOneDigitalOceanTopologyLaneId[];

const BASE_SERVICE_TARGET_BLUEPRINTS: readonly ServiceTargetBlueprint[] = [
  {
    serviceTargetId: "app_api",
    serviceKind: "app_api",
    runtimeRole: "api",
    ownedLaneIds: ["app_api_ingress"],
    readsFromLaneIds: [],
    writesToLaneIds: ["neroa_one_api_boundary"],
    consumesQueueAdapterIds: [],
    usesStorageAdapterIds: [],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:app-api-ingress",
      isolation: "dedicated_service",
      exposure: "ingress_api",
      serviceGroup: "core_execution_spine",
      extractionMode: "api_first",
      backboneDependencies: ["internal_service_auth", "observability", "health_checks"],
      notes: [
        "Defines the ingress contract for the app-facing API edge only.",
        "Must remain backend-only and must not take ownership of customer panels or room-level UI behavior."
      ]
    },
    notes: [
      "Owns request ingress and forwarding into the Neroa One backend boundary.",
      "Does not treat Build Room, Command Center, Strategy Room, or Library as execution homes."
    ]
  },
  {
    serviceTargetId: "neroa_one_api",
    serviceKind: "neroa_one_api",
    runtimeRole: "api",
    ownedLaneIds: ["neroa_one_api_boundary"],
    readsFromLaneIds: ["app_api_ingress"],
    writesToLaneIds: ["d_analyzer_boundary", ...OUTCOME_LANE_IDS],
    consumesQueueAdapterIds: ["outcome_lane_queue_adapter"],
    usesStorageAdapterIds: ["outcome_lane_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:neroa-one-api",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "api_first",
      backboneDependencies: [
        "internal_service_auth",
        "observability",
        "queue_adapters",
        "storage_adapters",
        "health_checks"
      ],
      notes: [
        "Acts as the backend-only API boundary for Neroa One request intake, classification handoff, and lane-oriented orchestration contracts.",
        "Keeps lane logic decoupled from ingress concerns so later extraction stays independently replaceable."
      ]
    },
    notes: [
      "Provides the stable service boundary above D-Analyzer and the modular-monolith lanes.",
      "Must remain deployment-map-only with no runtime dispatch, provider client, or secret handling."
    ]
  },
  {
    serviceTargetId: "d_analyzer_service",
    serviceKind: "d_analyzer_service",
    runtimeRole: "verifier",
    ownedLaneIds: ["d_analyzer_boundary"],
    readsFromLaneIds: ["neroa_one_api_boundary"],
    writesToLaneIds: [...OUTCOME_LANE_IDS],
    consumesQueueAdapterIds: [],
    usesStorageAdapterIds: [],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:d-analyzer",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "api_first",
      backboneDependencies: ["internal_service_auth", "observability", "health_checks"],
      notes: [
        "Represents the deterministic D-Analyzer boundary that evaluates requests before outcome lane routing.",
        "Stays verifier-oriented and does not become a runtime worker trigger or UI surface."
      ]
    },
    notes: [
      "Feeds analyzer decisions into the outcome lane service contract.",
      "Keeps roadmap/control analysis detached from customer-facing rooms and runtime execution."
    ]
  },
  {
    serviceTargetId: "outcome_lane_service",
    serviceKind: "outcome_lane_service",
    runtimeRole: "receiver",
    ownedLaneIds: [...OUTCOME_LANE_IDS],
    readsFromLaneIds: ["d_analyzer_boundary"],
    writesToLaneIds: [
      "prompt_room",
      "customer_follow_up",
      "strategy_escalation",
      "audit_room"
    ],
    consumesQueueAdapterIds: ["outcome_lane_queue_adapter"],
    usesStorageAdapterIds: ["outcome_lane_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:outcome-lane-service",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks"
      ],
      notes: [
        "Owns the ready_to_build, needs_customer_answer, roadmap_revision_required, blocked_missing_information, and rejected_outside_scope lane contracts.",
        "Preserves the modular-monolith routing boundary now while remaining extraction-ready for later worker or service splits."
      ]
    },
    notes: [
      "Build Room is not the execution home; it only observes or consumes approved handoffs downstream.",
      "Outcome routing stays backend-only and must not absorb customer UI logic."
    ]
  },
  {
    serviceTargetId: "prompt_service",
    serviceKind: "prompt_service",
    runtimeRole: "api",
    ownedLaneIds: ["prompt_room"],
    readsFromLaneIds: ["ready_to_build"],
    writesToLaneIds: ["code_execution_worker"],
    consumesQueueAdapterIds: ["prompt_room_queue_adapter"],
    usesStorageAdapterIds: ["prompt_room_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:prompt-service",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks"
      ],
      notes: [
        "Owns internal prompt preparation boundaries without taking ownership of model-provider wiring.",
        "Remains contract-only and provider-neutral enough to support later backend swaps."
      ]
    },
    notes: [
      "Maps the Prompt Room lane to a future extractable service boundary.",
      "Does not own Strategy Room behavior, Build Room behavior, or model execution at this stage."
    ]
  },
  {
    serviceTargetId: "code_execution_worker",
    serviceKind: "code_execution_worker",
    runtimeRole: "worker",
    ownedLaneIds: ["code_execution_worker"],
    readsFromLaneIds: ["prompt_room"],
    writesToLaneIds: ["codex_output_box", "audit_room"],
    consumesQueueAdapterIds: ["code_execution_worker_queue_adapter"],
    usesStorageAdapterIds: ["code_execution_worker_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:code-execution-worker",
      isolation: "worker_pool",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks"
      ],
      notes: [
        "Owns the execution boundary for multiple code engines through one engine-agnostic worker target.",
        "The worker target may later fan out to different engines without changing the topology contract."
      ]
    },
    notes: [
      "Build Room is viewport and control context only and must not become the execution home.",
      "Supports multiple engines behind the same worker boundary and avoids pinning the topology to one provider."
    ]
  },
  {
    serviceTargetId: "worker_output_receiver",
    serviceKind: "worker_output_receiver",
    runtimeRole: "receiver",
    ownedLaneIds: ["codex_output_box"],
    readsFromLaneIds: ["code_execution_worker"],
    writesToLaneIds: ["output_review", "audit_room"],
    consumesQueueAdapterIds: ["worker_output_receiver_queue_adapter"],
    usesStorageAdapterIds: ["worker_output_receiver_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:worker-output-receiver",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks"
      ],
      notes: [
        "Receives worker outputs at a backend-only boundary before review routing begins.",
        "Preserves output receipt as a replaceable contract separate from execution engines and UI rooms."
      ]
    },
    notes: [
      "Maps the existing Codex output box lane to a dedicated receiver-oriented service target.",
      "Must not call relays, worker triggers, or runtime dispatch from this topology layer."
    ]
  },
  {
    serviceTargetId: "output_review_service",
    serviceKind: "output_review_service",
    runtimeRole: "verifier",
    ownedLaneIds: ["output_review"],
    readsFromLaneIds: ["codex_output_box"],
    writesToLaneIds: [
      "repair_queue",
      "qc_station",
      "customer_follow_up",
      "strategy_escalation",
      "evidence_linking",
      "audit_room"
    ],
    consumesQueueAdapterIds: ["output_review_queue_adapter"],
    usesStorageAdapterIds: ["output_review_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:output-review-service",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks"
      ],
      notes: [
        "Keeps post-execution verification and routing decisions in one independently replaceable boundary.",
        "Does not absorb QC runtime, customer messaging UI, or strategy-room UI behavior."
      ]
    },
    notes: [
      "Owns review-only contracts and downstream routing decisions after worker output is received.",
      "Stays implementation-free and does not dispatch live repair, QC, or follow-up actions here."
    ]
  },
  {
    serviceTargetId: "repair_queue_service",
    serviceKind: "repair_queue_service",
    runtimeRole: "worker",
    ownedLaneIds: ["repair_queue"],
    readsFromLaneIds: ["output_review"],
    writesToLaneIds: ["prompt_room", "audit_room"],
    consumesQueueAdapterIds: ["repair_queue_queue_adapter"],
    usesStorageAdapterIds: ["repair_queue_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:repair-queue-service",
      isolation: "worker_pool",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks"
      ],
      notes: [
        "Owns the repair queue contract without deciding which runtime engine eventually performs the repair.",
        "Keeps repair routing separate from prompt drafting and output review verification."
      ]
    },
    notes: [
      "Maps repair queue work into a future worker or service boundary without wiring reruns now.",
      "Does not own Build Room release, customer UI, or queue provider behavior."
    ]
  },
  {
    serviceTargetId: "qc_browser_worker",
    serviceKind: "qc_browser_worker",
    runtimeRole: "worker",
    ownedLaneIds: ["qc_station"],
    readsFromLaneIds: ["output_review"],
    writesToLaneIds: ["evidence_linking", "audit_room"],
    consumesQueueAdapterIds: ["qc_browser_worker_queue_adapter"],
    usesStorageAdapterIds: ["qc_browser_worker_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:qc-browser-worker",
      isolation: "worker_pool",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "artifact_storage",
        "observability",
        "internal_service_auth",
        "health_checks"
      ],
      notes: [
        "Owns browser, screenshot, video, walkthrough, and QC report work inside the qc_station boundary only.",
        "Must stay detached from old browser-extension and Live View runtime paths."
      ]
    },
    notes: [
      "QC and browser or video work belongs to this target rather than any legacy extension-owned runtime.",
      "The topology remains backend-only and does not bind sessions, tabs, or browsers today."
    ]
  },
  {
    serviceTargetId: "evidence_service",
    serviceKind: "evidence_service",
    runtimeRole: "receiver",
    ownedLaneIds: ["evidence_linking"],
    readsFromLaneIds: ["qc_station", "output_review", "database_migration"],
    writesToLaneIds: ["audit_room"],
    consumesQueueAdapterIds: ["evidence_service_queue_adapter"],
    usesStorageAdapterIds: ["evidence_service_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:evidence-service",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "artifact_storage",
        "observability",
        "internal_service_auth",
        "health_checks"
      ],
      notes: [
        "Keeps evidence linkage and artifact-pointer contracts centralized behind one backend-only boundary.",
        "Can later link database-migration or platform-ops evidence without contaminating the core spine."
      ]
    },
    notes: [
      "Acts as the evidence linkage target for QC and future platform-ops verification outputs.",
      "Does not own library UI behavior or direct artifact upload implementation in this contract."
    ]
  },
  {
    serviceTargetId: "audit_admin_service",
    serviceKind: "audit_admin_service",
    runtimeRole: "observer",
    ownedLaneIds: ["audit_room"],
    readsFromLaneIds: [
      ...OUTCOME_LANE_IDS,
      "prompt_room",
      "code_execution_worker",
      "codex_output_box",
      "output_review",
      "repair_queue",
      "qc_station",
      "evidence_linking",
      "customer_follow_up",
      "strategy_escalation",
      "integration_onboarding",
      "database_migration",
      "platform_health_checks",
      "browser_automation_fallback"
    ],
    writesToLaneIds: [],
    consumesQueueAdapterIds: ["audit_admin_queue_adapter"],
    usesStorageAdapterIds: ["audit_admin_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:audit-admin-service",
      isolation: "observer_pipeline",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "observer_first",
      backboneDependencies: [
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks",
        "admin_read_model"
      ],
      notes: [
        "Remains observer and governance oriented rather than becoming an execution control plane.",
        "Consumes audit signals and admin-read-model projections without taking ownership of customer runtime behavior."
      ]
    },
    notes: [
      "Audit and Admin stays observer or governance only.",
      "Must not mutate execution ownership, Build Room control, or customer-facing workflows from this contract."
    ]
  },
  {
    serviceTargetId: "customer_follow_up_service",
    serviceKind: "customer_follow_up_service",
    runtimeRole: "receiver",
    ownedLaneIds: ["customer_follow_up"],
    readsFromLaneIds: ["needs_customer_answer", "output_review"],
    writesToLaneIds: ["audit_room"],
    consumesQueueAdapterIds: ["customer_follow_up_queue_adapter"],
    usesStorageAdapterIds: ["customer_follow_up_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:customer-follow-up-service",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks"
      ],
      notes: [
        "Owns follow-up coordination behind a backend contract only.",
        "Keeps answer collection and customer UI behavior out of the lane topology."
      ]
    },
    notes: [
      "Represents the service target for follow-up records and answer reconciliation later on.",
      "Does not own customer-visible panels, copy rendering, or form submission flows."
    ]
  },
  {
    serviceTargetId: "strategy_escalation_service",
    serviceKind: "strategy_escalation_service",
    runtimeRole: "observer",
    ownedLaneIds: ["strategy_escalation"],
    readsFromLaneIds: ["roadmap_revision_required", "output_review"],
    writesToLaneIds: ["audit_room"],
    consumesQueueAdapterIds: ["strategy_escalation_queue_adapter"],
    usesStorageAdapterIds: ["strategy_escalation_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:strategy-escalation-service",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "core_execution_spine",
      extractionMode: "observer_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks",
        "admin_read_model"
      ],
      notes: [
        "Keeps roadmap or strategy escalations outside the worker execution boundary.",
        "Preserves strategy escalation as a governance-oriented backend contract rather than a room-level behavior owner."
      ]
    },
    notes: [
      "Maps roadmap_revision_required and review-driven escalations to a dedicated target.",
      "Does not own Strategy Room UI behavior or direct roadmap mutation."
    ]
  },
  {
    serviceTargetId: "integration_onboarding_service",
    serviceKind: "integration_onboarding_service",
    runtimeRole: "api",
    ownedLaneIds: ["integration_onboarding"],
    readsFromLaneIds: ["app_api_ingress"],
    writesToLaneIds: [
      "database_migration",
      "platform_health_checks",
      "browser_automation_fallback",
      "audit_room"
    ],
    consumesQueueAdapterIds: ["integration_onboarding_queue_adapter"],
    usesStorageAdapterIds: ["integration_onboarding_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:integration-onboarding-service",
      isolation: "dedicated_service",
      exposure: "internal_only",
      serviceGroup: "back_office_platform_ops",
      extractionMode: "api_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks",
        "admin_read_model"
      ],
      notes: [
        "Sits outside the core Neroa One execution spine.",
        "Belongs to Back Office and Platform Operations and should prefer official APIs, CLI, OAuth, and provider integrations first."
      ]
    },
    notes: [
      "This planned target coordinates Invisible Infrastructure Onboarding and Integration Worker contracts outside the core execution spine.",
      "Browser automation under this lane is fallback and verification only."
    ]
  },
  {
    serviceTargetId: "database_migration_worker",
    serviceKind: "database_migration_worker",
    runtimeRole: "worker",
    ownedLaneIds: ["database_migration"],
    readsFromLaneIds: ["integration_onboarding"],
    writesToLaneIds: ["evidence_linking", "audit_room"],
    consumesQueueAdapterIds: ["database_migration_queue_adapter"],
    usesStorageAdapterIds: ["database_migration_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:database-migration-worker",
      isolation: "worker_pool",
      exposure: "internal_only",
      serviceGroup: "back_office_platform_ops",
      extractionMode: "queue_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks",
        "admin_read_model"
      ],
      notes: [
        "May generate SQL migration files, validate them, apply them through an approved Supabase CLI or Postgres worker after authorization, verify database, RLS, and function state, then link evidence and audit results later.",
        "Risky database, payment, or production changes require customer or admin approval before execution."
      ]
    },
    notes: [
      "This worker belongs to Back Office and Platform Operations rather than the core Neroa One execution spine.",
      "The topology is contract-only and does not apply migrations, authorize changes, or verify live databases today."
    ]
  },
  {
    serviceTargetId: "health_check_worker",
    serviceKind: "health_check_worker",
    runtimeRole: "scheduler",
    ownedLaneIds: ["platform_health_checks"],
    readsFromLaneIds: ["integration_onboarding"],
    writesToLaneIds: ["audit_room"],
    consumesQueueAdapterIds: ["health_check_queue_adapter"],
    usesStorageAdapterIds: ["health_check_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:health-check-worker",
      isolation: "scheduler_loop",
      exposure: "internal_only",
      serviceGroup: "back_office_platform_ops",
      extractionMode: "scheduler_first",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "observability",
        "internal_service_auth",
        "health_checks",
        "admin_read_model"
      ],
      notes: [
        "Provides scheduled verification for platform and integration health outside the core execution spine.",
        "Should rely on official provider checks and integration interfaces before any browser-based verification path."
      ]
    },
    notes: [
      "Back Office and Platform Operations target for scheduled health verification.",
      "Does not own customer runtime behavior or execution-spine orchestration."
    ]
  },
  {
    serviceTargetId: "browser_automation_fallback_worker",
    serviceKind: "browser_automation_fallback_worker",
    runtimeRole: "fallback_worker",
    ownedLaneIds: ["browser_automation_fallback"],
    readsFromLaneIds: ["integration_onboarding"],
    writesToLaneIds: ["evidence_linking", "audit_room"],
    consumesQueueAdapterIds: ["browser_automation_fallback_queue_adapter"],
    usesStorageAdapterIds: ["browser_automation_fallback_storage_adapter"],
    futureDigitalOceanTarget: {
      topologyTargetId: "do:browser-automation-fallback-worker",
      isolation: "worker_pool",
      exposure: "internal_only",
      serviceGroup: "back_office_platform_ops",
      extractionMode: "fallback_only",
      backboneDependencies: [
        "queue_adapters",
        "storage_adapters",
        "artifact_storage",
        "observability",
        "internal_service_auth",
        "health_checks",
        "admin_read_model"
      ],
      notes: [
        "Browser automation is fallback and verification only for Invisible Infrastructure Onboarding and Platform Operations work.",
        "Should be used after official APIs, CLI, OAuth, and provider integrations are preferred."
      ]
    },
    notes: [
      "Planned fallback worker for platform onboarding paths that need verification after primary integrations are attempted.",
      "Stays outside the core Neroa One execution spine and does not reuse the old browser-extension or Live View runtime."
    ]
  }
] as const;

function uniqueStrings(values: readonly string[]) {
  return [...new Set(values)];
}

function cloneTarget(
  target: ServiceTargetBlueprint,
  deploymentStage: NeroaOneDigitalOceanTopologyDeploymentStage,
  scalingTier: NeroaOneDigitalOceanTopologyScalingTier
): NeroaOneDigitalOceanTopologyServiceTarget {
  return {
    ...target,
    ownedLaneIds: [...target.ownedLaneIds],
    readsFromLaneIds: [...target.readsFromLaneIds],
    writesToLaneIds: [...target.writesToLaneIds],
    consumesQueueAdapterIds: [...target.consumesQueueAdapterIds],
    usesStorageAdapterIds: [...target.usesStorageAdapterIds],
    deploymentStage,
    scalingTier,
    futureDigitalOceanTarget: {
      ...target.futureDigitalOceanTarget,
      backboneDependencies: [...target.futureDigitalOceanTarget.backboneDependencies],
      notes: [...target.futureDigitalOceanTarget.notes]
    },
    notes: [...target.notes]
  };
}

function buildTopologyMapId(
  deploymentStage: NeroaOneDigitalOceanTopologyDeploymentStage,
  scalingTier: NeroaOneDigitalOceanTopologyScalingTier,
  override?: string | null
) {
  return normalizeText(override) || `neroa-one:${deploymentStage}:${scalingTier}:digitalocean-topology`;
}

function normalizeText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function findServiceTargetOrThrow(
  serviceTargets: readonly NeroaOneDigitalOceanTopologyServiceTarget[],
  serviceTargetId: string
) {
  const target = serviceTargets.find((item) => item.serviceTargetId === serviceTargetId);

  if (!target) {
    throw new Error(`Missing topology service target ${serviceTargetId}.`);
  }

  return target;
}

function buildSharedBackbone(
  serviceTargets: readonly NeroaOneDigitalOceanTopologyServiceTarget[]
): NeroaOneDigitalOceanSharedBackbone {
  const serviceTargetIds = serviceTargets.map((target) => target.serviceTargetId);
  const storageUsers = serviceTargets
    .filter((target) => target.usesStorageAdapterIds.length > 0)
    .map((target) => target.serviceTargetId);
  const queueConsumers = serviceTargets
    .filter((target) => target.consumesQueueAdapterIds.length > 0)
    .map((target) => target.serviceTargetId);
  const artifactUsers = serviceTargets
    .filter((target) =>
      target.futureDigitalOceanTarget.backboneDependencies.includes("artifact_storage")
    )
    .map((target) => target.serviceTargetId);
  const adminReadModelUsers = serviceTargets
    .filter((target) =>
      target.futureDigitalOceanTarget.backboneDependencies.includes("admin_read_model")
    )
    .map((target) => target.serviceTargetId);

  return {
    storage_adapters: {
      backboneId: "storage_adapters",
      summary: "Typed storage adapter contracts shared across modular-monolith lanes and future extractable services.",
      sharedAcrossServiceTargetIds: uniqueStrings(storageUsers),
      notes: [
        "Keeps persistence contracts backend-only and replaceable without forcing provider lock-in.",
        "Supports the current modular monolith now and later service extraction without schema changes here."
      ]
    },
    queue_adapters: {
      backboneId: "queue_adapters",
      summary: "Typed queue adapter contracts used by lane services and future worker pools.",
      sharedAcrossServiceTargetIds: uniqueStrings(queueConsumers),
      notes: [
        "Defines queue dependencies without wiring any queue provider in this topology module.",
        "Lets services split later without contaminating lane logic or UI surfaces."
      ]
    },
    artifact_storage: {
      backboneId: "artifact_storage",
      summary: "Shared artifact and evidence storage backbone for QC, evidence, and fallback verification outputs.",
      sharedAcrossServiceTargetIds: uniqueStrings(artifactUsers),
      notes: [
        "Reserved for artifact pointer and evidence linkage flows only.",
        "No storage implementation, bucket URL, or provider binding is created here."
      ]
    },
    observability: {
      backboneId: "observability",
      summary: "Cross-service logging, tracing, and operational visibility backbone.",
      sharedAcrossServiceTargetIds: [...serviceTargetIds],
      notes: [
        "Supports extraction-ready visibility across services and worker pools.",
        "Does not prescribe any vendor, endpoint, or deployment detail."
      ]
    },
    internal_service_auth: {
      backboneId: "internal_service_auth",
      summary: "Internal service-to-service trust boundary for future split deployments.",
      sharedAcrossServiceTargetIds: [...serviceTargetIds],
      notes: [
        "Represents trust-layer contracts only and does not introduce credentials or secrets here.",
        "Protects future internal APIs without redefining the current auth implementation."
      ]
    },
    health_checks: {
      backboneId: "health_checks",
      summary: "Shared health and readiness contract backbone for services and workers.",
      sharedAcrossServiceTargetIds: [...serviceTargetIds],
      notes: [
        "Provides a place for health semantics without binding runtime routes or probes.",
        "Supports phased extraction from modular monolith to service pools."
      ]
    },
    admin_read_model: {
      backboneId: "admin_read_model",
      summary: "Governance-oriented admin read model for audit, oversight, and platform operations visibility.",
      sharedAcrossServiceTargetIds: uniqueStrings(adminReadModelUsers),
      notes: [
        "Stays read-model oriented and separate from execution control.",
        "Supports observer-safe audit and operations summaries later on."
      ]
    }
  };
}

function createTopologyMap(
  deploymentStage: NeroaOneDigitalOceanTopologyDeploymentStage,
  scalingTier: NeroaOneDigitalOceanTopologyScalingTier,
  options?: NeroaOneDigitalOceanTopologyMapOptions
): NeroaOneDigitalOceanTopologyMap {
  const serviceTargets = BASE_SERVICE_TARGET_BLUEPRINTS.map((target) =>
    cloneTarget(target, deploymentStage, scalingTier)
  );

  return {
    topologyMapId: buildTopologyMapId(deploymentStage, scalingTier, options?.topologyMapId),
    version: normalizeText(options?.version) || DEFAULT_TOPOLOGY_VERSION,
    deploymentStage,
    scalingTier,
    serviceTargets,
    sharedBackbone: buildSharedBackbone(serviceTargets),
    createdAt: normalizeText(options?.createdAt) || DEFAULT_CREATED_AT
  };
}

function collectTargetText(target: NeroaOneDigitalOceanTopologyServiceTarget) {
  return [
    target.serviceTargetId,
    target.serviceKind,
    target.runtimeRole,
    target.ownedLaneIds.join(" "),
    target.readsFromLaneIds.join(" "),
    target.writesToLaneIds.join(" "),
    target.consumesQueueAdapterIds.join(" "),
    target.usesStorageAdapterIds.join(" "),
    target.futureDigitalOceanTarget.topologyTargetId,
    target.futureDigitalOceanTarget.notes.join(" "),
    target.notes.join(" ")
  ].join(" ");
}

export function getNeroaOneDigitalOceanTopologyServiceTargetKinds() {
  return [...NEROA_ONE_DIGITALOCEAN_TOPOLOGY_SERVICE_KINDS];
}

export function getNeroaOneDigitalOceanTopologyRuntimeRoles() {
  return [...NEROA_ONE_DIGITALOCEAN_TOPOLOGY_RUNTIME_ROLES];
}

export function getNeroaOneDigitalOceanTopologyDeploymentStages() {
  return [...NEROA_ONE_DIGITALOCEAN_TOPOLOGY_DEPLOYMENT_STAGES];
}

export function getNeroaOneDigitalOceanTopologyScalingTiers() {
  return [...NEROA_ONE_DIGITALOCEAN_TOPOLOGY_SCALING_TIERS];
}

export function getNeroaOneDigitalOceanSharedBackboneIds() {
  return [...NEROA_ONE_DIGITALOCEAN_SHARED_BACKBONE_IDS];
}

export function getNeroaOneDigitalOceanServiceTargetIds() {
  return [...ALL_SERVICE_TARGET_IDS];
}

export function findNeroaOneDigitalOceanServiceTarget(
  topologyMap: NeroaOneDigitalOceanTopologyMap,
  serviceTargetId: string
) {
  return topologyMap.serviceTargets.find((target) => target.serviceTargetId === serviceTargetId) ?? null;
}

export function createDefaultModularMonolithDigitalOceanTopologyMap(
  options?: NeroaOneDigitalOceanTopologyMapOptions
) {
  return createTopologyMap("modular_monolith", "one_droplet", options);
}

export function createTwoToThreeDropletsDigitalOceanTopologyMap(
  options?: NeroaOneDigitalOceanTopologyMapOptions
) {
  return createTopologyMap("split_app_and_workers", "two_to_three_droplets", options);
}

export function createFiveDropletsDigitalOceanTopologyMap(
  options?: NeroaOneDigitalOceanTopologyMapOptions
) {
  return createTopologyMap("dedicated_lane_services", "five_droplets", options);
}

export function createTenDropletsDigitalOceanTopologyMap(
  options?: NeroaOneDigitalOceanTopologyMapOptions
) {
  return createTopologyMap("horizontal_worker_pools", "ten_droplets", options);
}

export function createTwentyPlusDropletsDigitalOceanTopologyMap(
  options?: NeroaOneDigitalOceanTopologyMapOptions
) {
  return createTopologyMap("service_pools_autoscale", "twenty_plus_droplets", options);
}

export function validateTopologyServiceTargetsDoNotOwnUiBehavior(
  topologyMap: NeroaOneDigitalOceanTopologyMap
): NeroaOneDigitalOceanTopologyValidationResult {
  const errors = topologyMap.serviceTargets.flatMap((target) => {
    const lowerText = collectTargetText(target).toLowerCase();
    const ownsUiLane = target.ownedLaneIds.some((laneId) =>
      ["build_room", "command_center", "strategy_room", "library", "live_view"].includes(laneId)
    );
    const claimsUiOwnership = /owns ui|ui owner|customer-facing panel|command center panel|build room panel/.test(
      lowerText
    );

    if (ownsUiLane || claimsUiOwnership) {
      return [`Service target ${target.serviceTargetId} must remain backend-only and UI-decoupled.`];
    }

    return [];
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateBuildRoomIsNotExecutionHome(
  topologyMap: NeroaOneDigitalOceanTopologyMap
): NeroaOneDigitalOceanTopologyValidationResult {
  const errors = topologyMap.serviceTargets.flatMap((target) => {
    const lowerText = collectTargetText(target).toLowerCase();
    if (target.ownedLaneIds.includes("app_api_ingress") || target.serviceTargetId === "code_execution_worker") {
      if (lowerText.includes("build room is viewport and control context only")) {
        return [];
      }
    }

    if (/build room execution home|build room owns execution|build room is execution home/.test(lowerText)) {
      return [`Service target ${target.serviceTargetId} must not treat Build Room as the execution home.`];
    }

    return [];
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateCodeExecutionWorkerTargetIsEngineAgnostic(
  topologyMap: NeroaOneDigitalOceanTopologyMap
): NeroaOneDigitalOceanTopologyValidationResult {
  const target = findServiceTargetOrThrow(topologyMap.serviceTargets, "code_execution_worker");
  const lowerText = collectTargetText(target).toLowerCase();
  const errors: string[] = [];

  if (!lowerText.includes("engine-agnostic")) {
    errors.push("Code execution worker target must explicitly remain engine-agnostic.");
  }

  if (!lowerText.includes("multiple code engines")) {
    errors.push("Code execution worker target must support multiple engines behind one worker boundary.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateQcBrowserWorkBelongsToQcBrowserWorker(
  topologyMap: NeroaOneDigitalOceanTopologyMap
): NeroaOneDigitalOceanTopologyValidationResult {
  const target = findServiceTargetOrThrow(topologyMap.serviceTargets, "qc_browser_worker");
  const lowerText = collectTargetText(target).toLowerCase();
  const errors: string[] = [];

  if (!target.ownedLaneIds.includes("qc_station")) {
    errors.push("qc_browser_worker must own the qc_station lane boundary.");
  }

  if (!lowerText.includes("old browser-extension") && !lowerText.includes("live view")) {
    errors.push("qc_browser_worker must explicitly stay detached from the old browser-extension or Live View runtime.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateAuditAdminRemainsObserverGovernanceTarget(
  topologyMap: NeroaOneDigitalOceanTopologyMap
): NeroaOneDigitalOceanTopologyValidationResult {
  const target = findServiceTargetOrThrow(topologyMap.serviceTargets, "audit_admin_service");
  const lowerText = collectTargetText(target).toLowerCase();
  const errors: string[] = [];

  if (target.runtimeRole !== "observer") {
    errors.push("audit_admin_service must keep the observer runtime role.");
  }

  if (!lowerText.includes("observer") || !lowerText.includes("governance")) {
    errors.push("audit_admin_service must remain observer and governance oriented.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateIntegrationOnboardingOutsideCoreExecutionSpine(
  topologyMap: NeroaOneDigitalOceanTopologyMap
): NeroaOneDigitalOceanTopologyValidationResult {
  const target = findServiceTargetOrThrow(topologyMap.serviceTargets, "integration_onboarding_service");
  const lowerText = collectTargetText(target).toLowerCase();
  const errors: string[] = [];

  if (target.futureDigitalOceanTarget.serviceGroup !== "back_office_platform_ops") {
    errors.push("integration_onboarding_service must belong to Back Office and Platform Operations.");
  }

  if (!lowerText.includes("outside the core neroa one execution spine")) {
    errors.push("integration_onboarding_service must stay outside the core Neroa One execution spine.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateNoHardcodedRuntimeInfrastructure(
  topologyMap: NeroaOneDigitalOceanTopologyMap
): NeroaOneDigitalOceanTopologyValidationResult {
  const forbiddenPatterns = [
    /https?:\/\//i,
    /\b\d{1,3}(?:\.\d{1,3}){3}\b/,
    /\b(?:token|secret|password|passwd|api[_-]?key)\s*[:=]/i,
    /\bdroplet(?:[-_ ]?id)?\s*[:=]\s*[^\s,]+/i,
    /\/api\/[^\s"'`]*callback/i,
    /\bdispatchMode\s*:\s*["']live["']/i
  ];

  const errors = topologyMap.serviceTargets.flatMap((target) => {
    const text = collectTargetText(target);
    const matched = forbiddenPatterns.find((pattern) => pattern.test(text));

    return matched
      ? [`Service target ${target.serviceTargetId} contains forbidden hardcoded infrastructure detail: ${matched}.`]
      : [];
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateNeroaOneDigitalOceanTopologyMap(
  topologyMap: NeroaOneDigitalOceanTopologyMap
): NeroaOneDigitalOceanTopologyValidationResult {
  const requiredTargets = new Set(ALL_SERVICE_TARGET_IDS);
  const presentTargets = new Set(topologyMap.serviceTargets.map((target) => target.serviceTargetId));
  const errors: string[] = [];

  for (const targetId of requiredTargets) {
    if (!presentTargets.has(targetId)) {
      errors.push(`Missing topology service target ${targetId}.`);
    }
  }

  const validators = [
    validateTopologyServiceTargetsDoNotOwnUiBehavior(topologyMap),
    validateBuildRoomIsNotExecutionHome(topologyMap),
    validateCodeExecutionWorkerTargetIsEngineAgnostic(topologyMap),
    validateQcBrowserWorkBelongsToQcBrowserWorker(topologyMap),
    validateAuditAdminRemainsObserverGovernanceTarget(topologyMap),
    validateIntegrationOnboardingOutsideCoreExecutionSpine(topologyMap),
    validateNoHardcodedRuntimeInfrastructure(topologyMap)
  ];

  return {
    valid: errors.length === 0 && validators.every((result) => result.valid),
    errors: [...errors, ...validators.flatMap((result) => result.errors)]
  };
}
