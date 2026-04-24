import type { BranchFamily } from "@/lib/governance";
import type { ExtractionState } from "@/lib/intelligence/extraction";
import { OVERLAY_DEFINITIONS } from "./catalog";
import {
  average,
  clampUnitInterval,
  containsKeyword,
  createBranchRecordId,
  dedupe,
  mergeUnique,
  toUnitIntervalConfidence
} from "./helpers";
import type { BranchTextSignalEntry } from "./helpers";
import type {
  BranchCandidate,
  BranchOverlayActivation,
  BranchOverlayKey,
  BranchSignal
} from "./types";

const OVERLAY_BRANCH_HINTS: Record<
  BranchOverlayKey,
  Partial<Record<BranchFamily, number>>
> = {
  "ai-copilot": {
    "SaaS / Workflow Platform": 0.18,
    "Developer Platform / API / Infrastructure": 0.24,
    "Data / Analytics / Intelligence Platform": 0.28
  },
  "multi-tenant-team-workspace": {
    "SaaS / Workflow Platform": 0.3,
    "Marketplace / Multi-Sided Platform": 0.2,
    "Internal Operations / Backoffice Tool": 0.18
  },
  "approval-workflow-governance": {
    "Internal Operations / Backoffice Tool": 0.24,
    "Marketplace / Multi-Sided Platform": 0.18,
    "Developer Platform / API / Infrastructure": 0.16
  },
  "community-ugc": {
    "Content / Community / Membership": 0.32,
    "Marketplace / Multi-Sided Platform": 0.12
  },
  commerce: {
    "Commerce / Ecommerce": 0.34,
    "Marketplace / Multi-Sided Platform": 0.2,
    "Booking / Scheduling / Service Delivery": 0.12
  },
  "mobile-first-native-experience": {},
  "compliance-security-sensitive-data": {
    "Marketplace / Multi-Sided Platform": 0.16,
    "Developer Platform / API / Infrastructure": 0.22,
    "Data / Analytics / Intelligence Platform": 0.2,
    "SaaS / Workflow Platform": 0.12
  },
  "international-localization": {
    "Commerce / Ecommerce": 0.16,
    "Marketplace / Multi-Sided Platform": 0.14,
    "Content / Community / Membership": 0.12
  }
};

function buildSignal(args: {
  overlayKey: BranchOverlayKey;
  label: string;
  rationale: string;
  matchedKeywords: string[];
  entries: BranchTextSignalEntry[];
  scoreContribution: number;
  kind: BranchSignal["kind"];
}) {
  return {
    signalId: createBranchRecordId(
      "overlay-signal",
      `${args.overlayKey}-${args.label}-${args.matchedKeywords.join("-")}`
    ),
    kind: args.kind,
    label: args.label,
    rationale: args.rationale,
    matchedKeywords: dedupe(args.matchedKeywords),
    branch: null,
    overlayKey: args.overlayKey,
    fieldKeys: dedupe(
      args.entries
        .map((entry) => entry.fieldKey)
        .filter((fieldKey): fieldKey is NonNullable<typeof fieldKey> => fieldKey !== null)
    ),
    categoryKeys: dedupe(args.entries.map((entry) => entry.categoryKey)),
    sourceIds: mergeUnique(...args.entries.map((entry) => entry.sourceIds)),
    evidenceIds: mergeUnique(...args.entries.map((entry) => entry.evidenceIds)),
    scoreContribution: args.scoreContribution,
    confidence: toUnitIntervalConfidence(
      clampUnitInterval(args.scoreContribution / 1.25),
      args.rationale
    )
  } satisfies BranchSignal;
}

function branchContribution(
  overlayKey: BranchOverlayKey,
  branch: BranchCandidate | null,
  multiplier: number
) {
  if (!branch) {
    return 0;
  }

  const base = OVERLAY_BRANCH_HINTS[overlayKey][branch.branch] ?? 0;
  return base * multiplier * branch.confidence.score;
}

function overlayStateFromScore(score: number) {
  if (score >= 1.2) {
    return "high-confidence active" as const;
  }

  if (score >= 0.72) {
    return "active" as const;
  }

  if (score >= 0.34) {
    return "possible" as const;
  }

  return "inactive" as const;
}

function summarizeReason(labels: string[]) {
  if (labels.length === 0) {
    return "No strong overlay signals appear in the current extracted truth.";
  }

  if (labels.length === 1) {
    return `Activated by ${labels[0].toLowerCase()}.`;
  }

  return `Activated by ${labels
    .slice(0, 2)
    .map((label) => label.toLowerCase())
    .join(" and ")}.`;
}

export function evaluateOverlayActivations(args: {
  state: ExtractionState;
  entries: BranchTextSignalEntry[];
  primaryBranch: BranchCandidate | null;
  secondaryBranches: BranchCandidate[];
}) {
  const overlaySignals: BranchSignal[] = [];

  const overlays = Object.fromEntries(
    Object.entries(OVERLAY_DEFINITIONS).map(([overlayKey, definition]) => {
      const signals: BranchSignal[] = [];
      const matchedEntries = args.entries.filter((entry) =>
        definition.keywords.some((keyword) => containsKeyword(entry.normalizedText, keyword))
      );

      if (matchedEntries.length > 0) {
        const matchedKeywords = dedupe(
          definition.keywords.filter((keyword) =>
            matchedEntries.some((entry) => containsKeyword(entry.normalizedText, keyword))
          )
        );
        const scoreContribution =
          average(matchedEntries.map((entry) => entry.confidenceMultiplier)) *
          Math.min(1.15, 0.55 + matchedKeywords.length * 0.12);

        signals.push(
          buildSignal({
            overlayKey: definition.key,
            label: `${definition.label} keywords`,
            rationale: `Keyword signals for ${definition.label} appeared in extracted truth.`,
            matchedKeywords,
            entries: matchedEntries,
            scoreContribution,
            kind: "keyword"
          })
        );
      }

      for (const governanceOverlayAlias of definition.governanceOverlayAliases) {
        const aliasReference = args.state.overlayActivations[governanceOverlayAlias];

        if (aliasReference && aliasReference.determination === "active") {
          const scoreContribution = 0.45 + aliasReference.confidence.score * 0.45;
          signals.push(
            buildSignal({
              overlayKey: definition.key,
              label: `${definition.label} governance alias`,
              rationale: `Existing governance overlay reference "${governanceOverlayAlias}" is active.`,
              matchedKeywords: [governanceOverlayAlias],
              entries: [],
              scoreContribution,
              kind: "overlay-alias"
            })
          );
        }
      }

      const primaryBranchContribution = branchContribution(
        definition.key,
        args.primaryBranch,
        1
      );

      if (primaryBranchContribution > 0) {
        signals.push(
          buildSignal({
            overlayKey: definition.key,
            label: `${definition.label} primary branch hint`,
            rationale: `${args.primaryBranch?.branch} commonly carries this overlay.`,
            matchedKeywords: [args.primaryBranch?.branch ?? ""],
            entries: [],
            scoreContribution: primaryBranchContribution,
            kind: "structure-pattern"
          })
        );
      }

      const secondaryContribution = args.secondaryBranches.reduce((sum, branch) => {
        return sum + branchContribution(definition.key, branch, 0.7);
      }, 0);

      if (secondaryContribution > 0) {
        signals.push(
          buildSignal({
            overlayKey: definition.key,
            label: `${definition.label} secondary branch hint`,
            rationale: "Secondary branch signals suggest this overlay may be active.",
            matchedKeywords: args.secondaryBranches.map((branch) => branch.branch),
            entries: [],
            scoreContribution: secondaryContribution,
            kind: "structure-pattern"
          })
        );
      }

      const totalScore = signals.reduce((sum, signal) => sum + signal.scoreContribution, 0);
      const state = overlayStateFromScore(totalScore);
      const allFieldKeys = dedupe(signals.flatMap((signal) => signal.fieldKeys));
      const allSourceIds = dedupe(signals.flatMap((signal) => signal.sourceIds));
      const allEvidenceIds = dedupe(signals.flatMap((signal) => signal.evidenceIds));

      overlaySignals.push(...signals);

      return [
        overlayKey,
        {
          overlayKey: definition.key,
          label: definition.label,
          state,
          confidence: toUnitIntervalConfidence(
            clampUnitInterval(totalScore / 1.35),
            summarizeReason(signals.map((signal) => signal.label))
          ),
          reason: summarizeReason(signals.map((signal) => signal.label)),
          signalIds: signals.map((signal) => signal.signalId),
          sourceFieldKeys: allFieldKeys,
          sourceIds: allSourceIds,
          evidenceIds: allEvidenceIds,
          likelyAffectedSystems: [...definition.likelyAffectedSystems],
          governanceOverlayAliases: [...definition.governanceOverlayAliases]
        } satisfies BranchOverlayActivation
      ];
    })
  ) as Record<BranchOverlayKey, BranchOverlayActivation>;

  return {
    overlays,
    signals: overlaySignals
  };
}
