import { MarketingInfoShell } from "@/components/layout/page-shells";
import { PublicPricingContent } from "@/components/pricing/public-pricing-content";
import {
  executionCreditPacks,
  getLaunchPricingPlans,
  publicBillingIntervals
} from "@/lib/pricing/config";

export default function DiyPricingPage() {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start DIY Build" brandVariant="prominent">
      <PublicPricingContent
        plans={getLaunchPricingPlans()}
        billingIntervals={publicBillingIntervals}
        topUpBundles={executionCreditPacks}
      />
    </MarketingInfoShell>
  );
}
