import { MarketingInfoShell } from "@/components/layout/page-shells";
import { ManagedPricingContent } from "@/components/pricing/managed-pricing-content";

export default function ManagedPricingPage() {
  return (
    <MarketingInfoShell
      ctaHref="/contact?type=managed-build-quote"
      ctaLabel="Request Managed Build Quote"
      brandVariant="prominent"
    >
      <ManagedPricingContent />
    </MarketingInfoShell>
  );
}
