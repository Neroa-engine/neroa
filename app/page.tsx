import type { Metadata } from "next";
import { FrontDoorHomeHero } from "@/components/front-door/front-door-home-hero";
import {
  JsonLdScript
} from "@/components/marketing/public-page-sections";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { getOptionalUser } from "@/lib/auth";
import { publicLaunchEntryPath } from "@/lib/data/public-launch";

export const metadata: Metadata = {
  metadataBase: new URL("https://neroa.io"),
  title: "Neroa | Turn the idea into a guided product build",
  description:
    "Neroa helps you explain the idea, shape the roadmap, review previews and inspection, and move through approvals in one premium product-building experience.",
  alternates: {
    canonical: "https://neroa.io/"
  },
  openGraph: {
    title: "Neroa | Strategy Room first product building",
    description:
      "Start in Strategy Room, get a guided roadmap, and move through preview, inspection, approvals, and refinements inside one clear Neroa experience.",
    url: "https://neroa.io/",
    siteName: "Neroa",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Neroa | Guided from idea to approval",
    description:
      "Neroa turns the idea into a guided roadmap, a visible build path, and a premium review loop with preview, inspection, revisions, and approvals."
  },
  robots: {
    index: true,
    follow: true
  }
};

const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Neroa",
      url: "https://neroa.io",
      description:
        "Neroa is an AI-powered product planning and building platform that guides founders from idea through roadmap, preview, inspection, approvals, and refinement."
    },
    {
      "@type": "SoftwareApplication",
      name: "Neroa",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://neroa.io",
      description:
        "Use Neroa to explain a product idea, shape a guided roadmap, and move through preview, inspection, approvals, and refinement inside one premium build experience."
    }
  ]
} as const;

export default async function LandingPage() {
  const user = await getOptionalUser();
  const initialAuthenticated = Boolean(user);

  return (
    <MarketingInfoShell
      userEmail={user?.email ?? undefined}
      ctaHref={publicLaunchEntryPath}
      ctaLabel="Open Strategy Room"
      brandVariant="prominent"
      brandScale="landing"
      contentWidth="wide"
      theme="front-door"
      minimalHeader
      showFooter={false}
      showHelpChat={false}
    >
      <JsonLdScript data={homepageSchema} />
      <FrontDoorHomeHero initialAuthenticated={initialAuthenticated} />
    </MarketingInfoShell>
  );
}
