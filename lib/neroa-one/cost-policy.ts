import {
  neroaOneCostPolicySchema,
  type NeroaOneCostPolicy,
  type NeroaOneTrigger
} from "./schemas.ts";

const blockedNowPolicies: Partial<Record<NeroaOneTrigger, string>> = {
  page_load: "AI is blocked on room load.",
  navigation: "AI is blocked during navigation.",
  lane_switch: "AI is blocked during lane switching.",
  dashboard_display: "AI is blocked for dashboard display.",
  saved_task_view: "AI is blocked when viewing saved tasks.",
  filtering: "AI is blocked during filtering."
};

export function resolveNeroaOneCostPolicy(trigger: NeroaOneTrigger): NeroaOneCostPolicy {
  const blockedReason = blockedNowPolicies[trigger];

  if (blockedReason) {
    return neroaOneCostPolicySchema.parse({
      trigger,
      currentMode: "deterministic_only",
      aiAllowedNow: false,
      allowedReasoningTierNow: "none",
      futureReasoningTier: "none",
      reason: blockedReason
    });
  }

  if (trigger === "customer_message") {
    return neroaOneCostPolicySchema.parse({
      trigger,
      currentMode: "deterministic_only",
      aiAllowedNow: false,
      allowedReasoningTierNow: "none",
      futureReasoningTier: "cheap_classification",
      reason: "Customer messages use deterministic classification now and may use cheap classification later."
    });
  }

  if (trigger === "revision_analysis" || trigger === "roadmap_impact" || trigger === "task_handoff") {
    return neroaOneCostPolicySchema.parse({
      trigger,
      currentMode: "deterministic_only",
      aiAllowedNow: false,
      allowedReasoningTierNow: "none",
      futureReasoningTier: "standard_reasoning",
      reason: "This path stays deterministic now and is reserved for standard reasoning later."
    });
  }

  return neroaOneCostPolicySchema.parse({
    trigger,
    currentMode: "deterministic_only",
    aiAllowedNow: false,
    allowedReasoningTierNow: "none",
    futureReasoningTier: "high_reasoning",
    reason: "This path stays deterministic now and is reserved for higher-reasoning backend flows later."
  });
}

export function isAiBlockedForTrigger(trigger: NeroaOneTrigger) {
  return resolveNeroaOneCostPolicy(trigger).aiAllowedNow === false;
}
