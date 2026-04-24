import type { Metadata } from "next";
import { NeroaChatCard } from "@/components/front-door/neroa-chat-card";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { JsonLdScript } from "@/components/marketing/public-page-sections";
import { publicLaunchEntryPath } from "@/lib/data/public-launch";
import { buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";

const landingSignals = [
  "Strategy Room",
  "Guided roadmap",
  "Preview",
  "Inspection",
  "Approvals",
  "Refinement"
] as const;

const landingSupportCopy =
  "Start with the idea. NEROA turns it into a guided roadmap, a visible build path, and a premium review loop with preview, inspection, revisions, and approvals inside one calm product experience.";

export const metadata: Metadata = buildPublicMetadata({
  title: "AI app builder | Guided app planning and execution with Neroa",
  description:
    "Neroa is an AI app builder designed around guided product execution, monthly Engine Credits, and structured software planning for SaaS, internal tools, external apps, and mobile apps.",
  path: "/ai-app-builder",
  keywords: [
    "AI app builder",
    "guided AI software builder",
    "AI app planning",
    "build apps with AI"
  ]
});

export default function AiAppBuilderPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "AI app builder",
        description:
          "Guided app building with AI that connects scope, MVP, budget, build, and launch in one system.",
        path: "/ai-app-builder"
      })
    ]
  } as const;

  return (
    <MarketingInfoShell
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
      <JsonLdScript data={schema} />

      <section className="ai-builder-landing-shell" aria-labelledby="ai-app-builder-title">
        <div className="ai-builder-landing-hero">
          <div className="ai-builder-landing-copy">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Strategy Room First
            </span>
            <h1 id="ai-app-builder-title" className="ai-builder-landing-title">
              <span className="block">Turn the idea into</span>
              <span className="block">a product people</span>
              <span className="block">
                can <span className="ai-builder-landing-title-emphasis">see, shape,</span>
              </span>
              <span className="block ai-builder-landing-title-emphasis">and approve.</span>
            </h1>
            <p className="ai-builder-landing-summary">
              {landingSupportCopy}
            </p>
          </div>

          <div className="ai-builder-landing-visual">
            <div className="ai-builder-landing-chat-shell">
              <NeroaChatCard mode="starter" />
            </div>
          </div>
        </div>

        <div className="ai-builder-landing-signals" aria-label="NEROA landing highlights">
          {landingSignals.map((signal) => (
            <span key={signal} className="ai-builder-landing-signal">
              {signal}
            </span>
          ))}
        </div>

      </section>
    </MarketingInfoShell>
  );
}
