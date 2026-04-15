import type { Metadata } from "next";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { JsonLdScript } from "@/components/marketing/public-page-sections";
import { ManagedPricingContent } from "@/components/pricing/managed-pricing-content";
import { buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Managed Pricing | Scoped execution and management support from Neroa",
  description:
    "See Neroa Managed Build pricing ranges for scoped software execution, launch support, QA visibility, and post-launch management.",
  path: "/pricing/managed",
  keywords: [
    "managed software build pricing",
    "managed software build service pricing",
    "software execution support pricing",
    "done-for-you software pricing"
  ]
});

export default function ManagedPricingPage() {
  return (
    <MarketingInfoShell
      ctaHref="/contact?type=managed-build-quote"
      ctaLabel="Request Managed Build Quote"
      brandVariant="prominent"
    >
      <JsonLdScript
        data={buildWebPageSchema({
          name: "Neroa Managed Pricing",
          description:
            "Managed Build pricing ranges for scoped software execution and management support.",
          path: "/pricing/managed"
        })}
      />
      <ManagedPricingContent />
    </MarketingInfoShell>
  );
}
