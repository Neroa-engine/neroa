import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/seo-landing-template";
import { buildFaqSchema, buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";

const faqItems = [
  {
    question: "Can Neroa replace hiring developers entirely?",
    answer:
      "Not always. Neroa reduces the need to start with a traditional dev team by giving customers guided scope, planning, pacing, and build structure. Some projects still benefit from managed support or developer handoff later."
  },
  {
    question: "Why is this financially compelling?",
    answer:
      "Because customers can start with the budget they have now, move through monthly Engine Credits, and avoid funding a full traditional custom build before the product direction is clear."
  },
  {
    question: "What happens if the software becomes larger than expected?",
    answer:
      "Neroa can show when the current plan is too small for the scope and recommend more credits, an upgrade, phased reduction, or a managed path."
  },
  {
    question: "What types of software does this apply to?",
    answer:
      "It applies to SaaS products, internal software, external customer apps, and mobile apps where structured planning and execution guidance matter."
  }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Build software without hiring developers | Neroa",
  description:
    "See how Neroa helps people build software without starting with a full traditional developer stack by using guided AI planning, scoped execution, and monthly Engine Credits.",
  path: "/build-software-without-hiring-developers",
  keywords: [
    "build software without hiring developers",
    "software development alternative",
    "build apps on a budget",
    "AI software planning"
  ]
});

export default function BuildSoftwareWithoutHiringDevelopersPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "Build software without hiring developers",
        description:
          "Use Neroa to scope and build software with guided AI support before committing to a full traditional dev team.",
        path: "/build-software-without-hiring-developers"
      }),
      buildFaqSchema([...faqItems])
    ]
  } as const;

  return (
    <SeoLandingTemplate
      schema={schema}
      hero={{
        eyebrow: "Build software without hiring developers",
        title: "Start the software build before you are forced into a full traditional team.",
        summary:
          "Neroa gives founders, operators, and teams a guided path into real software without requiring a full agency or dev-team budget on day one.",
    primaryAction: { href: "/diy-build", label: "Start a conversation" },
        secondaryAction: { href: "/start", label: "Start Managed Build", tone: "secondary" },
        highlights: [
          "Lower capital barrier",
          "Structured scope before spend",
          "DIY pace with managed backup"
        ],
        panelTitle: "Why customers choose this route",
        panelSummary:
          "Most teams do not fail because software is impossible. They fail because the path into the build is expensive, fragmented, and unclear too early.",
        panelItems: [
          "Use monthly credits to move before large budgets exist",
          "Keep software structure, budget, and build path visible",
          "Switch to managed support later if the build needs more speed"
        ]
      }}
      coreSection={{
        eyebrow: "What changes with Neroa",
        title: "The product lowers the coordination burden as much as the capital burden.",
        summary:
          "Neroa is not just cheaper chat. It is a guided software system that helps people understand scope, pace, and tradeoffs before they disappear into expensive delivery chaos.",
        cards: [
          {
            title: "Define the build before hiring pressure takes over",
            description:
              "Get scope, MVP, budget, and launch thinking in place before expensive build commitments start driving the product."
          },
          {
            title: "Use credits to buy time and clarity",
            description:
              "Monthly Engine Credits let the work move even when the customer does not have a full upfront build budget."
          },
          {
            title: "Keep a path into managed execution",
            description:
              "If the product grows into something faster or more critical, Neroa can help move it into a structured managed lane."
          }
        ]
      }}
      fitSection={{
        eyebrow: "Best fit",
        title: "Who benefits most from this model.",
        summary:
          "This route is strongest for people who know software could help the business, but do not want to begin with a traditional hiring or agency commitment.",
        cards: [
          {
            title: "Bootstrapped founders",
            description:
              "Useful when the goal is to move a product idea forward before raising or spending heavily."
          },
          {
            title: "Business owners replacing manual work",
            description:
              "A strong fit for operators who need internal software or customer-facing tools but want to stage the spend."
          },
          {
            title: "Teams validating first, scaling later",
            description:
              "Neroa works well when the business wants to learn the product before deciding how much human build support it really needs."
          }
        ]
      }}
      faqSection={{
        eyebrow: "Alternative-build FAQ",
        title: "Questions people ask when they want to avoid a traditional dev-team start.",
        summary:
          "These answers clarify where Neroa helps directly and where managed or human support may still matter later.",
        items: [...faqItems]
      }}
      finalCta={{
        eyebrow: "Next step",
        title: "Use Neroa when you want to start the product before the full hiring burden arrives.",
        summary:
          "Start in DIY if you want budget control, or move into Managed Build if the project needs more execution support than you want to coordinate yourself.",
        actions: [
          { href: "/diy-build", label: "Start a conversation" },
          { href: "/pricing", label: "See Pricing Paths", tone: "secondary" }
        ]
      }}
    />
  );
}
