import {
  executionCreditPacks,
  growthLayerScenarios,
  managedEscalationThresholdCredits,
  pricingPlans,
  publicBillingIntervals,
  usageNotificationThresholds,
  type BillingIntervalId,
  type CreditPackMixItem,
  type ExecutionCreditPack,
  type GrowthLayerScenario,
  type PricingAudience,
  type PricingPlanId
} from "@/lib/pricing/config-content";

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function getPricingPlan(planId: PricingPlanId) {
  return pricingPlans.find((plan) => plan.id === planId) ?? null;
}

export function getLaunchPricingPlans(audience?: PricingAudience) {
  return pricingPlans.filter((plan) => plan.launchEnabled && (!audience || plan.audience === audience));
}

export function getBillingInterval(intervalId: BillingIntervalId) {
  return publicBillingIntervals.find((interval) => interval.id === intervalId) ?? publicBillingIntervals[0];
}

export function calculateIntervalPrice(monthlyPrice: number | null, intervalId: BillingIntervalId) {
  const interval = getBillingInterval(intervalId);

  if (monthlyPrice === null) {
    return {
      interval,
      totalPrice: null,
      effectiveMonthlyPrice: null,
      savingsAmount: null
    };
  }

  const baseTotal = monthlyPrice * interval.months;
  const discountedTotal = roundCurrency(baseTotal * (1 - interval.discountRate));

  return {
    interval,
    totalPrice: discountedTotal,
    effectiveMonthlyPrice: roundCurrency(discountedTotal / interval.months),
    savingsAmount: roundCurrency(baseTotal - discountedTotal)
  };
}

export function getExecutionCreditUsageNotifications(usedCredits: number, includedCredits: number | null) {
  if (!includedCredits || includedCredits <= 0) {
    return [];
  }

  const usageRatio = usedCredits / includedCredits;

  return usageNotificationThresholds.filter((item) => usageRatio >= item.threshold);
}

export function getRecommendedExecutionCreditPack(requiredCredits: number) {
  if (requiredCredits <= 0) {
    return null;
  }

  return executionCreditPacks.find((pack) => pack.credits >= requiredCredits) ?? executionCreditPacks[executionCreditPacks.length - 1];
}

export function getGrowthLayerScenario(scenarioId: string) {
  return growthLayerScenarios.find((scenario) => scenario.id === scenarioId) ?? null;
}

export function getExecutionCreditPackUnitPrice(pack: ExecutionCreditPack) {
  return roundCurrency(pack.price / pack.credits);
}

export function calculateScopedBuildMonths(
  totalCredits: number,
  monthlyCredits: number | null,
  purchasedCredits = 0
) {
  if (!monthlyCredits || monthlyCredits <= 0) {
    return null;
  }

  const remaining = Math.max(totalCredits - purchasedCredits, 0);

  if (remaining === 0) {
    return 0;
  }

  return Math.ceil(remaining / monthlyCredits);
}

export function calculateCreditsNeededForTargetMonths(
  totalCredits: number,
  monthlyCredits: number | null,
  targetMonths: number
) {
  if (!monthlyCredits || monthlyCredits <= 0) {
    return totalCredits;
  }

  return Math.max(totalCredits - monthlyCredits * targetMonths, 0);
}

export function getRecommendedCreditPackMix(requiredCredits: number): CreditPackMixItem[] {
  if (requiredCredits <= 0) {
    return [];
  }

  const sortedPacks = [...executionCreditPacks].sort((left, right) => right.credits - left.credits);
  let remaining = requiredCredits;
  const mix: CreditPackMixItem[] = [];

  for (const pack of sortedPacks) {
    if (remaining <= 0) {
      break;
    }

    const quantity = Math.floor(remaining / pack.credits);

    if (quantity > 0) {
      mix.push({ pack, quantity });
      remaining -= pack.credits * quantity;
    }
  }

  if (remaining > 0) {
    const smallestPack = sortedPacks[sortedPacks.length - 1];
    const existingSmallest = mix.find((item) => item.pack.id === smallestPack.id);

    if (existingSmallest) {
      existingSmallest.quantity += Math.ceil(remaining / smallestPack.credits);
    } else {
      mix.push({
        pack: smallestPack,
        quantity: Math.ceil(remaining / smallestPack.credits)
      });
    }
  }

  return mix;
}

export function summarizeCreditPackMix(mix: CreditPackMixItem[]) {
  const totalCredits = mix.reduce((sum, item) => sum + item.pack.credits * item.quantity, 0);
  const totalPrice = mix.reduce((sum, item) => sum + item.pack.price * item.quantity, 0);

  return {
    totalCredits,
    totalPrice: roundCurrency(totalPrice),
    unitPrice: totalCredits > 0 ? roundCurrency(totalPrice / totalCredits) : 0
  };
}

export function shouldEscalateToManagedBuild(totalCredits: number, complexity: GrowthLayerScenario["complexity"]) {
  return complexity === "high" || complexity === "extreme" || totalCredits >= managedEscalationThresholdCredits;
}
