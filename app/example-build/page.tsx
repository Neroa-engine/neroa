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
    "Explore an interactive example build in Neroa and see the same five-step builder architecture used by the real DIY flow, with a simulated final build plan.",
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
      ctaLabel="Start a conversation"
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
          title="Step into a guided build simulation that now mirrors the real DIY builder."
          summary="The simulation now follows the same architecture as Neroa's real builder: Build Setup, Business Direction, Project Definition, Framework + Experience Direction, and a final Build Plan Output that stays clearly illustrative."
          primaryAction={{ href: "#example-build-entry", label: "Open the simulation" }}
          secondaryAction={{ href: "/start", label: "Start a conversation", tone: "secondary" }}
          highlights={[
            "The same five-step architecture now powers both the simulation and the real builder",
            "Step 1 is the same structured Product Type + Build Stage setup",
            "The real builder handoff now carries this aligned simulation state forward"
          ]}
          panelTitle="Why this feels real"
          panelSummary="The simulation uses static data for now, but it mirrors the way Neroa turns a rough concept into a structured product plan with visible tradeoffs and next-step choices."
          panelItems={[
            "A guided sequence instead of a passive marketing slideshow",
            "The same state model as the real builder, not a separate example engine",
            "Reference projects and credit ranges clearly marked as illustrative"
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
