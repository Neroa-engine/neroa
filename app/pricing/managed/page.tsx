import type { Metadata } from "next";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { JsonLdScript } from "@/components/marketing/public-page-sections";
import { ManagedPricingContent } from "@/components/pricing/managed-pricing-content";
import { buildBillingIntentPath } from "@/lib/billing/catalog";
import { getOptionalUser } from "@/lib/auth";
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

export default async function ManagedPricingPage() {
  const user = await getOptionalUser();
  const ctaHref = user
    ? buildBillingIntentPath({
        kind: "addon",
        addOnId: "done-for-you-support"
      })
    : "/start";

  return (
    <MarketingInfoShell
      userEmail={user?.email ?? undefined}
      ctaHref={ctaHref}
      ctaLabel={user ? "Open billing" : "Start Managed Build"}
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
      <ManagedPricingContent initialAuthenticated={Boolean(user)} />
    </MarketingInfoShell>
  );
}
