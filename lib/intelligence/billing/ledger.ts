import {
  billingProtectionTotalsSchema,
  loadBillingProtectionState,
  type BillingProtectionState,
  type ChargeEvent
} from "./types.ts";

function uniqueEventKey(event: ChargeEvent) {
  return event.chargeEventId;
}

export function normalizeBillingProtectionState(
  value: unknown
): BillingProtectionState | null {
  return loadBillingProtectionState(value);
}

export function mergeChargeEvents(args: {
  priorEvents?: readonly ChargeEvent[] | null;
  nextEvents?: readonly ChargeEvent[] | null;
}) {
  const merged = new Map<string, ChargeEvent>();

  for (const event of args.priorEvents ?? []) {
    merged.set(uniqueEventKey(event), event);
  }

  for (const event of args.nextEvents ?? []) {
    merged.set(uniqueEventKey(event), event);
  }

  return [...merged.values()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
}

export function buildBillingProtectionTotals(chargeEvents: readonly ChargeEvent[]) {
  const billableEventCount = chargeEvents.filter(
    (event) => event.chargeability === "billable"
  ).length;
  const protectedEventCount = chargeEvents.filter(
    (event) => event.chargeability === "protected_non_billable"
  ).length;
  const deferredEventCount = chargeEvents.filter(
    (event) => event.chargeability === "deferred"
  ).length;
  const reviewRequiredEventCount = chargeEvents.filter(
    (event) => event.chargeability === "review_required"
  ).length;
  const billableUnits = chargeEvents.reduce(
    (sum, event) => sum + event.chargeUnits,
    0
  );
  const protectedUnits = chargeEvents.reduce(
    (sum, event) => sum + event.protectedUnits,
    0
  );
  const retryAttemptCount = chargeEvents.filter(
    (event) => event.retryAttempt !== null
  ).length;
  const blockedRetryCount = chargeEvents.filter(
    (event) => event.eventType === "retry_blocked"
  ).length;

  return billingProtectionTotalsSchema.parse({
    billableEventCount,
    protectedEventCount,
    deferredEventCount,
    reviewRequiredEventCount,
    billableUnits,
    protectedUnits,
    nonBillableWasteUnits: protectedUnits,
    retryAttemptCount,
    blockedRetryCount
  });
}
