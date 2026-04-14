import { MarketingInfoShell } from "@/components/layout/page-shells";
import { PublicPricingContent } from "@/components/pricing/public-pricing-content";
import {
  executionCreditPacks,
  getLaunchPricingPlans,
  publicBillingIntervals
} from "@/lib/pricing/config";

export default function PricingPage() {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start your build" brandVariant="prominent">
      <PublicPricingContent
        plans={getLaunchPricingPlans()}
        billingIntervals={publicBillingIntervals}
        topUpBundles={executionCreditPacks}
      />
    </MarketingInfoShell>
  );
}
