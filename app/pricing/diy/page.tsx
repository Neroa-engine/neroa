import type { Metadata } from "next";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { JsonLdScript } from "@/components/marketing/public-page-sections";
import { PublicPricingContent } from "@/components/pricing/public-pricing-content";
import { buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";
import {
  executionCreditPacks,
  getLaunchPricingPlans,
  publicBillingIntervals
} from "@/lib/pricing/config";

export const metadata: Metadata = buildPublicMetadata({
  title: "DIY Pricing | Monthly Engine Credits for guided software building",
  description:
    "Compare Neroa DIY pricing plans, monthly Engine Credits, planning-engine limits, build-project limits, and credit packs for guided software building.",
  path: "/pricing/diy",
  keywords: [
    "DIY software build pricing",
    "Engine Credits pricing",
    "build SaaS with AI pricing",
    "AI app builder pricing"
  ]
});

export default function DiyPricingPage() {
  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start DIY Build" brandVariant="prominent">
      <JsonLdScript
        data={buildWebPageSchema({
          name: "Neroa DIY Pricing",
          description:
            "DIY plan pricing for guided software building with monthly Engine Credits.",
          path: "/pricing/diy"
        })}
      />
      <PublicPricingContent
        plans={getLaunchPricingPlans()}
        billingIntervals={publicBillingIntervals}
        topUpBundles={executionCreditPacks}
      />
    </MarketingInfoShell>
  );
}
