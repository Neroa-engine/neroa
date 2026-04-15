import type { Metadata } from "next";
import { ExampleBuildEntry } from "@/components/example-build/ExampleBuildEntry";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import {
  JsonLdScript,
  PublicPageHero
} from "@/components/marketing/public-page-sections";
import {
  exampleBuildTypes,
  exampleFrameworks,
  exampleIndustries,
  exampleOpportunityAreas
} from "@/lib/marketing/example-build-data";
import { buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "See an Example Build | Interactive guided product walkthrough with Neroa",
  description:
    "Explore an interactive example build in Neroa and see how a product moves through strategy, scope, MVP, budget, build paths, and launch logic.",
  path: "/example-build",
  keywords: [
    "interactive AI software build demo",
    "guided example software build",
    "AI product planning example",
    "see how Neroa works"
  ]
});

export default function ExampleBuildPage() {
  return (
    <MarketingInfoShell
      ctaHref="/start"
      ctaLabel="Start DIY Build"
      brandVariant="prominent"
      contentWidth="wide"
    >
      <JsonLdScript
        data={buildWebPageSchema({
          name: "Neroa Example Build",
          description:
            "An interactive guided example showing how Neroa structures a software build from strategy to launch.",
          path: "/example-build"
        })}
      />

      <section className="mx-auto max-w-6xl">
        <PublicPageHero
          eyebrow="Interactive Example Build"
          title="Step into a guided AI build simulation before you start your own."
          summary="This walkthrough now mirrors Neroa's structured build-entry logic. Start with product type, choose an industry or hot opportunity area, select a system framework, review filtered example projects, and then watch the guided breakdown unfold."
          primaryAction={{ href: "#example-build-entry", label: "Open the simulation" }}
          secondaryAction={{ href: "/start", label: "Start DIY Build", tone: "secondary" }}
          highlights={[
            "Product type comes first, not a generic example list",
            "Framework logic shapes the example before the breakdown opens",
            "The real build handoff carries the simulation state forward"
          ]}
          panelTitle="Why this feels real"
          panelSummary="The simulation uses static data for now, but it mirrors the way Neroa turns a rough concept into a structured product plan with visible tradeoffs and next-step choices."
          panelItems={[
            "A guided sequence instead of a passive marketing slideshow",
            "Industry or opportunity context before framework selection",
            "Example credit ranges clearly marked as illustrative"
          ]}
          panelBadge="Guided AI build simulation"
          supportingNote="The goal is to make the system feel trustworthy before signup. Later, this same shell can connect to live scoped build data."
          metrics={[
            { label: "Build lanes", value: `${exampleBuildTypes.length} simulated product types` },
            {
              label: "Market contexts",
              value: `${exampleIndustries.length + exampleOpportunityAreas.length} industries and opportunity areas`
            },
            { label: "Frameworks", value: `${exampleFrameworks.length} system frameworks` }
          ]}
        />
      </section>

      <ExampleBuildEntry />
    </MarketingInfoShell>
  );
}
