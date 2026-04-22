export type CommandCenterPreviewSurfaceTarget =
  | "landing"
  | "auth"
  | "pricing"
  | "strategy"
  | "command_center"
  | "build_room"
  | "all";

export type CommandCenterDensityMode = "comfortable" | "balanced" | "compact";

export type CommandCenterPreviewStateStatus =
  | "inactive"
  | "previewing"
  | "approved_pending_implementation"
  | "implemented"
  | "stale_after_code_change";

export type CommandCenterPreviewApprovalStatus =
  | "not_requested"
  | "approved"
  | "superseded";

export type CommandCenterPreviewSource =
  | "command_center_design_library"
  | "browser_preview_panel"
  | "future_browser_extension"
  | "unknown";

export type CommandCenterApprovedDesignPackageStatus =
  | "draft_preview"
  | "approved_for_implementation"
  | "sent_to_codex"
  | "implemented"
  | "failed"
  | "superseded";

export type CommandCenterPreviewStateMutation =
  | "start_preview"
  | "update_preview"
  | "mark_preview_stale"
  | "reset_preview"
  | "mark_preview_implemented";

export type CommandCenterApprovedDesignPackageMutation =
  | "create_from_preview"
  | "update_package"
  | "mark_approved_for_implementation"
  | "mark_sent_to_codex"
  | "mark_implemented"
  | "mark_failed"
  | "mark_superseded"
  | "clear_package";

export type StoredCommandCenterDesignControls = {
  designMode: string | null;
  colorway: string | null;
  buttonStyle: string | null;
  typographyStyle: string | null;
  densityMode: CommandCenterDensityMode | null;
  layoutPreset: string | null;
  roomPreset: string | null;
  surfaceTargets: CommandCenterPreviewSurfaceTarget[];
};

export type StoredCommandCenterPreviewState = {
  previewSessionId: string | null;
  state: CommandCenterPreviewStateStatus;
  selectedControls: StoredCommandCenterDesignControls;
  source: CommandCenterPreviewSource;
  approvalStatus: CommandCenterPreviewApprovalStatus;
  lastUpdatedAt: string | null;
  notes: string | null;
};

export type StoredCommandCenterApprovedDesignPackage = {
  packageId: string;
  approvedDesignMode: string | null;
  selectedControls: StoredCommandCenterDesignControls;
  affectedSurfaces: CommandCenterPreviewSurfaceTarget[];
  affectedZones: string[];
  approvedAt: string | null;
  implementationIntent: string;
  cautionNotes: string[];
  status: CommandCenterApprovedDesignPackageStatus;
};

export type CommandCenterDesignModeHighlight = {
  id: string;
  label: string;
  summary: string;
};

const previewSurfaceTargets: CommandCenterPreviewSurfaceTarget[] = [
  "landing",
  "auth",
  "pricing",
  "strategy",
  "command_center",
  "build_room",
  "all"
];

const densityModes: CommandCenterDensityMode[] = ["comfortable", "balanced", "compact"];

const previewStateStatuses: CommandCenterPreviewStateStatus[] = [
  "inactive",
  "previewing",
  "approved_pending_implementation",
  "implemented",
  "stale_after_code_change"
];

const previewApprovalStatuses: CommandCenterPreviewApprovalStatus[] = [
  "not_requested",
  "approved",
  "superseded"
];

const previewSources: CommandCenterPreviewSource[] = [
  "command_center_design_library",
  "browser_preview_panel",
  "future_browser_extension",
  "unknown"
];

const approvedDesignPackageStatuses: CommandCenterApprovedDesignPackageStatus[] = [
  "draft_preview",
  "approved_for_implementation",
  "sent_to_codex",
  "implemented",
  "failed",
  "superseded"
];

export const COMMAND_CENTER_DESIGN_LIBRARY_TOTAL_MODES = 12;

export const COMMAND_CENTER_DESIGN_MODE_HIGHLIGHTS: CommandCenterDesignModeHighlight[] = [
  {
    id: "royal_command",
    label: "Royal Command",
    summary: "High-contrast executive control mode for premium operator surfaces."
  },
  {
    id: "executive_slate",
    label: "Executive Slate",
    summary: "Muted dark-neutral operating mode for calm planning and review rooms."
  },
  {
    id: "obsidian_glow",
    label: "Obsidian Glow",
    summary: "Glowing high-contrast mode for cinematic product and launch surfaces."
  },
  {
    id: "terra_signal",
    label: "Terra Signal",
    summary: "Warm grounded system for tactile product storytelling and structured rooms."
  }
];

export const COMMAND_CENTER_DESIGN_CONTROL_AREAS = [
  "Design modes",
  "Colorways",
  "Button styles",
  "Typography systems",
  "Density controls",
  "Layout presets",
  "Room presets",
  "Surface targeting"
] as const;

export const COMMAND_CENTER_PREVIEW_WORKFLOW_STEPS = [
  "Launch a preview session in the browser layer.",
  "Adjust temporary preview controls by room or surface.",
  "Approve the selected preview state.",
  "Create a structured implementation package for Codex.",
  "Implement the package in source code.",
  "Compare preview intent against implemented output later."
] as const;

export const COMMAND_CENTER_PREVIEW_BOUNDARY_RULES = [
  "Preview changes are temporary until approved.",
  "Approved preview packages are still pending until Codex changes source code.",
  "Source code remains the styling truth until implementation succeeds.",
  "Code changes can stale a preview session or approved package.",
  "Preview packages must stay scoped to their target rooms or surfaces."
] as const;

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function toTitleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function nextId(prefix: "preview" | "package", now = new Date()) {
  const date = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return prefix === "preview" ? `PRV-${date}-${suffix}` : `DPKG-${date}-${suffix}`;
}

export function defaultCommandCenterDesignControls(
  surfaceTargets: CommandCenterPreviewSurfaceTarget[] = ["command_center"]
): StoredCommandCenterDesignControls {
  return {
    designMode: null,
    colorway: null,
    buttonStyle: null,
    typographyStyle: null,
    densityMode: null,
    layoutPreset: null,
    roomPreset: null,
    surfaceTargets
  };
}

export function listCommandCenterPreviewSurfaceTargets() {
  return [...previewSurfaceTargets];
}

export function listCommandCenterDensityModes() {
  return [...densityModes];
}

export function listCommandCenterPreviewStateStatuses() {
  return [...previewStateStatuses];
}

export function listCommandCenterApprovedDesignPackageStatuses() {
  return [...approvedDesignPackageStatuses];
}

export function hasMeaningfulCommandCenterDesignSelection(
  controls: StoredCommandCenterDesignControls
) {
  return Boolean(
    controls.designMode ||
      controls.colorway ||
      controls.buttonStyle ||
      controls.typographyStyle ||
      controls.densityMode ||
      controls.layoutPreset ||
      controls.roomPreset
  );
}

export function normalizeCommandCenterPreviewSurfaceTarget(
  value: unknown
): CommandCenterPreviewSurfaceTarget | null {
  return previewSurfaceTargets.includes(value as CommandCenterPreviewSurfaceTarget)
    ? (value as CommandCenterPreviewSurfaceTarget)
    : null;
}

export function formatCommandCenterPreviewSurfaceTarget(
  value: CommandCenterPreviewSurfaceTarget
) {
  switch (value) {
    case "auth":
      return "Auth";
    case "pricing":
      return "Pricing";
    case "strategy":
      return "Strategy Room";
    case "command_center":
      return "Command Center";
    case "build_room":
      return "Build Room";
    case "all":
      return "All surfaces";
    default:
      return "Landing";
  }
}

export function normalizeStoredCommandCenterDesignControls(
  value: unknown,
  fallbackSurfaceTargets: CommandCenterPreviewSurfaceTarget[] = ["command_center"]
): StoredCommandCenterDesignControls {
  if (!value || typeof value !== "object") {
    return defaultCommandCenterDesignControls(fallbackSurfaceTargets);
  }

  const record = value as Record<string, unknown>;
  const normalizedTargets = Array.isArray(record.surfaceTargets)
    ? record.surfaceTargets
        .map((item) => normalizeCommandCenterPreviewSurfaceTarget(item))
        .filter((item): item is CommandCenterPreviewSurfaceTarget => Boolean(item))
    : [];

  return {
    designMode: asNonEmptyString(record.designMode),
    colorway: asNonEmptyString(record.colorway),
    buttonStyle: asNonEmptyString(record.buttonStyle),
    typographyStyle: asNonEmptyString(record.typographyStyle),
    densityMode: densityModes.includes(record.densityMode as CommandCenterDensityMode)
      ? (record.densityMode as CommandCenterDensityMode)
      : null,
    layoutPreset: asNonEmptyString(record.layoutPreset),
    roomPreset: asNonEmptyString(record.roomPreset),
    surfaceTargets: normalizedTargets.length > 0 ? normalizedTargets : fallbackSurfaceTargets
  };
}

export function normalizeStoredCommandCenterPreviewState(
  value: unknown
): StoredCommandCenterPreviewState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const state = previewStateStatuses.includes(record.state as CommandCenterPreviewStateStatus)
    ? (record.state as CommandCenterPreviewStateStatus)
    : null;
  const source = previewSources.includes(record.source as CommandCenterPreviewSource)
    ? (record.source as CommandCenterPreviewSource)
    : null;
  const approvalStatus = previewApprovalStatuses.includes(
    record.approvalStatus as CommandCenterPreviewApprovalStatus
  )
    ? (record.approvalStatus as CommandCenterPreviewApprovalStatus)
    : null;

  if (!state || !source || !approvalStatus) {
    return null;
  }

  return {
    previewSessionId: asNonEmptyString(record.previewSessionId),
    state,
    selectedControls: normalizeStoredCommandCenterDesignControls(record.selectedControls),
    source,
    approvalStatus,
    lastUpdatedAt: asNonEmptyString(record.lastUpdatedAt),
    notes: asNonEmptyString(record.notes)
  };
}

export function normalizeStoredCommandCenterApprovedDesignPackage(
  value: unknown
): StoredCommandCenterApprovedDesignPackage | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const packageId = asNonEmptyString(record.packageId);
  const implementationIntent = asNonEmptyString(record.implementationIntent);
  const status = approvedDesignPackageStatuses.includes(
    record.status as CommandCenterApprovedDesignPackageStatus
  )
    ? (record.status as CommandCenterApprovedDesignPackageStatus)
    : null;
  const affectedSurfaces = Array.isArray(record.affectedSurfaces)
    ? record.affectedSurfaces
        .map((item) => normalizeCommandCenterPreviewSurfaceTarget(item))
        .filter((item): item is CommandCenterPreviewSurfaceTarget => Boolean(item))
    : [];

  if (!packageId || !implementationIntent || !status) {
    return null;
  }

  return {
    packageId,
    approvedDesignMode: asNonEmptyString(record.approvedDesignMode),
    selectedControls: normalizeStoredCommandCenterDesignControls(
      record.selectedControls,
      affectedSurfaces.length > 0 ? affectedSurfaces : ["command_center"]
    ),
    affectedSurfaces:
      affectedSurfaces.length > 0 ? affectedSurfaces : ["command_center"],
    affectedZones: normalizeStringArray(record.affectedZones),
    approvedAt: asNonEmptyString(record.approvedAt),
    implementationIntent,
    cautionNotes: normalizeStringArray(record.cautionNotes),
    status
  };
}

export function defaultStoredCommandCenterPreviewState(
  args?: Partial<StoredCommandCenterPreviewState>
): StoredCommandCenterPreviewState {
  return {
    previewSessionId: args?.previewSessionId ?? null,
    state: args?.state ?? "inactive",
    selectedControls:
      args?.selectedControls ?? defaultCommandCenterDesignControls(["command_center"]),
    source: args?.source ?? "command_center_design_library",
    approvalStatus: args?.approvalStatus ?? "not_requested",
    lastUpdatedAt: args?.lastUpdatedAt ?? null,
    notes: args?.notes ?? null
  };
}

function ensureAllowedPreviewTransition(
  current: CommandCenterPreviewStateStatus,
  next: CommandCenterPreviewStateStatus
) {
  const allowedTransitions: Record<
    CommandCenterPreviewStateStatus,
    CommandCenterPreviewStateStatus[]
  > = {
    inactive: ["previewing"],
    previewing: [
      "inactive",
      "approved_pending_implementation",
      "stale_after_code_change",
      "implemented"
    ],
    approved_pending_implementation: [
      "previewing",
      "implemented",
      "stale_after_code_change",
      "inactive"
    ],
    implemented: ["previewing", "stale_after_code_change", "inactive"],
    stale_after_code_change: ["previewing", "inactive"]
  };

  if (!allowedTransitions[current].includes(next)) {
    throw new Error(
      `Preview state cannot move from ${current} to ${next} in the current design-control lifecycle.`
    );
  }
}

function ensureAllowedPackageTransition(
  current: CommandCenterApprovedDesignPackageStatus,
  next: CommandCenterApprovedDesignPackageStatus
) {
  const allowedTransitions: Record<
    CommandCenterApprovedDesignPackageStatus,
    CommandCenterApprovedDesignPackageStatus[]
  > = {
    draft_preview: ["approved_for_implementation", "superseded", "failed"],
    approved_for_implementation: ["sent_to_codex", "implemented", "failed", "superseded"],
    sent_to_codex: ["implemented", "failed", "superseded"],
    implemented: ["superseded"],
    failed: ["approved_for_implementation", "superseded"],
    superseded: []
  };

  if (!allowedTransitions[current].includes(next)) {
    throw new Error(
      `Design package status cannot move from ${current} to ${next} in the current lifecycle.`
    );
  }
}

export function applyCommandCenterPreviewStateMutation(args: {
  existing: StoredCommandCenterPreviewState | null;
  mutation: CommandCenterPreviewStateMutation;
  selectedControls?: StoredCommandCenterDesignControls;
  notes?: string | null;
  source?: CommandCenterPreviewSource;
  previewSessionId?: string | null;
  now?: string;
}): StoredCommandCenterPreviewState | null {
  const now = args.now ?? new Date().toISOString();
  const current = args.existing ?? defaultStoredCommandCenterPreviewState();

  if (args.mutation === "reset_preview") {
    return null;
  }

  if (args.mutation === "mark_preview_stale") {
    ensureAllowedPreviewTransition(current.state, "stale_after_code_change");
    return {
      ...current,
      state: "stale_after_code_change",
      lastUpdatedAt: now
    };
  }

  if (args.mutation === "mark_preview_implemented") {
    ensureAllowedPreviewTransition(current.state, "implemented");
    return {
      ...current,
      state: "implemented",
      approvalStatus: "approved",
      lastUpdatedAt: now
    };
  }

  const nextControls =
    args.selectedControls ?? current.selectedControls ?? defaultCommandCenterDesignControls();
  const nextNotes = args.notes === undefined ? current.notes : args.notes;
  const nextSource = args.source ?? current.source;
  const nextState = "previewing" as const;

  if (current.state !== nextState) {
    ensureAllowedPreviewTransition(current.state, nextState);
  }

  return {
    previewSessionId:
      args.previewSessionId ?? current.previewSessionId ?? nextId("preview", new Date(now)),
    state: nextState,
    selectedControls: normalizeStoredCommandCenterDesignControls(nextControls),
    source: nextSource,
    approvalStatus: "not_requested",
    lastUpdatedAt: now,
    notes: nextNotes
  };
}

export function createCommandCenterApprovedDesignPackageFromPreview(args: {
  previewState: StoredCommandCenterPreviewState | null;
  existingPackage: StoredCommandCenterApprovedDesignPackage | null;
  implementationIntent?: string | null;
  cautionNotes?: string[];
  affectedZones?: string[];
  now?: string;
}): {
  previewState: StoredCommandCenterPreviewState;
  approvedPackage: StoredCommandCenterApprovedDesignPackage;
} {
  const now = args.now ?? new Date().toISOString();
  const previewState = args.previewState;

  if (!previewState || previewState.state === "inactive") {
    throw new Error("Start or update a preview session before creating an approved design package.");
  }

  if (!hasMeaningfulCommandCenterDesignSelection(previewState.selectedControls)) {
    throw new Error(
      "A preview package needs a meaningful staged design selection before it can be approved."
    );
  }

  if (
    args.existingPackage &&
    args.existingPackage.status !== "superseded" &&
    args.existingPackage.status !== "failed" &&
    args.existingPackage.status !== "implemented"
  ) {
    throw new Error(
      "Supersede or finish the current design package before creating a new approved package."
    );
  }

  const nextPreviewState: StoredCommandCenterPreviewState = {
    ...previewState,
    state: "approved_pending_implementation",
    approvalStatus: "approved",
    lastUpdatedAt: now
  };

  return {
    previewState: nextPreviewState,
    approvedPackage: {
      packageId: nextId("package", new Date(now)),
      approvedDesignMode:
        previewState.selectedControls.designMode ?? previewState.selectedControls.roomPreset,
      selectedControls: normalizeStoredCommandCenterDesignControls(
        previewState.selectedControls
      ),
      affectedSurfaces: previewState.selectedControls.surfaceTargets,
      affectedZones: Array.from(new Set((args.affectedZones ?? []).filter(Boolean))),
      approvedAt: now,
      implementationIntent:
        args.implementationIntent?.trim() ||
        "Implement the approved preview state in source code without treating browser preview as the styling truth.",
      cautionNotes: Array.from(new Set((args.cautionNotes ?? []).filter(Boolean))),
      status: "approved_for_implementation"
    }
  };
}

export function applyCommandCenterApprovedDesignPackageMutation(args: {
  existing: StoredCommandCenterApprovedDesignPackage | null;
  mutation: CommandCenterApprovedDesignPackageMutation;
  implementationIntent?: string | null;
  cautionNotes?: string[];
  affectedZones?: string[];
  now?: string;
}): StoredCommandCenterApprovedDesignPackage | null {
  const now = args.now ?? new Date().toISOString();

  if (args.mutation === "clear_package") {
    return null;
  }

  if (!args.existing) {
    throw new Error("No design package is available for that update.");
  }

  const nextImplementationIntent =
    args.implementationIntent === undefined
      ? args.existing.implementationIntent
      : args.implementationIntent?.trim() ||
        "Implement the approved preview state in source code without treating browser preview as the styling truth.";
  const nextCautionNotes =
    args.cautionNotes === undefined
      ? args.existing.cautionNotes
      : Array.from(new Set(args.cautionNotes.filter(Boolean)));
  const nextAffectedZones =
    args.affectedZones === undefined
      ? args.existing.affectedZones
      : Array.from(new Set(args.affectedZones.filter(Boolean)));

  if (args.mutation === "update_package") {
    return {
      ...args.existing,
      implementationIntent: nextImplementationIntent,
      cautionNotes: nextCautionNotes,
      affectedZones: nextAffectedZones
    };
  }

  const nextStatus =
    args.mutation === "mark_approved_for_implementation"
      ? "approved_for_implementation"
      : args.mutation === "mark_sent_to_codex"
        ? "sent_to_codex"
        : args.mutation === "mark_implemented"
          ? "implemented"
          : args.mutation === "mark_failed"
            ? "failed"
            : "superseded";

  ensureAllowedPackageTransition(args.existing.status, nextStatus);

  return {
    ...args.existing,
    implementationIntent: nextImplementationIntent,
    cautionNotes: nextCautionNotes,
    affectedZones: nextAffectedZones,
    approvedAt: args.existing.approvedAt ?? now,
    status: nextStatus
  };
}

export function formatCommandCenterPreviewStateLabel(
  value: CommandCenterPreviewStateStatus
) {
  switch (value) {
    case "previewing":
      return "Previewing";
    case "approved_pending_implementation":
      return "Approved pending implementation";
    case "implemented":
      return "Implemented";
    case "stale_after_code_change":
      return "Stale after code change";
    default:
      return "Inactive";
  }
}

export function formatCommandCenterPreviewApprovalStatusLabel(
  value: CommandCenterPreviewApprovalStatus
) {
  switch (value) {
    case "approved":
      return "Approved";
    case "superseded":
      return "Superseded";
    default:
      return "Not requested";
  }
}

export function formatCommandCenterApprovedDesignPackageStatusLabel(
  value: CommandCenterApprovedDesignPackageStatus
) {
  switch (value) {
    case "approved_for_implementation":
      return "Approved for implementation";
    case "sent_to_codex":
      return "Sent to Codex";
    case "implemented":
      return "Implemented";
    case "failed":
      return "Failed";
    case "superseded":
      return "Superseded";
    default:
      return "Draft preview";
  }
}

export function formatCommandCenterPreviewSourceLabel(value: CommandCenterPreviewSource) {
  switch (value) {
    case "browser_preview_panel":
      return "Browser preview panel";
    case "future_browser_extension":
      return "Future browser extension";
    case "unknown":
      return "Unknown preview source";
    default:
      return "Command Center design library";
  }
}

export function formatCommandCenterDesignModeLabel(value: string | null | undefined) {
  if (!value) {
    return "Current source code styling";
  }

  const highlighted = COMMAND_CENTER_DESIGN_MODE_HIGHLIGHTS.find((item) => item.id === value);
  return highlighted?.label ?? toTitleCase(value);
}
