import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/seo-landing-template";
import { buildFaqSchema, buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";

const faqItems = [
  {
    question: "Can Neroa help build a real SaaS product with AI?",
    answer:
      "Yes. Neroa helps turn a SaaS idea into scope, MVP, budget, build planning, and launch preparation with a guided system instead of disconnected AI chats."
  },
  {
    question: "Do I need a full dev team before I start?",
    answer:
      "No. Many customers start by scoping the SaaS, pacing the work with monthly Engine Credits, and deciding later whether to stay DIY or move into managed support."
  },
  {
    question: "Can I build the SaaS gradually over time?",
    answer:
      "Yes. That is one of the core advantages of Neroa. The product can move over multiple months based on available credits, budget, and scope."
  },
  {
    question: "What if the SaaS becomes more complex?",
    answer:
      "Neroa can show when the scope is pushing beyond the current plan and recommend added credits, a higher plan, a phased MVP reduction, or a managed build path."
  }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Build SaaS with AI | Guided SaaS planning and execution with Neroa",
  description:
    "Use Neroa to build SaaS with AI through guided scope, MVP planning, budgeting, and launch structure without relying on disconnected prompts or a full dev team upfront.",
  path: "/build-saas-with-ai",
  keywords: [
    "build SaaS with AI",
    "AI SaaS builder",
    "guided SaaS planning",
    "build SaaS on a budget"
  ]
});

export default function BuildSaasWithAiPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "Build SaaS with AI",
        description:
          "Guided SaaS planning, MVP scope, budget logic, and launch structure with Neroa.",
        path: "/build-saas-with-ai"
      }),
      buildFaqSchema([...faqItems])
    ]
  } as const;

  return (
    <SeoLandingTemplate
      schema={schema}
      hero={{
        eyebrow: "Build SaaS with AI",
        title: "Turn a SaaS idea into a structured product path with Neroa.",
        summary:
          "Neroa helps founders move from idea to scope to MVP to budget to launch with a guided AI system built for real SaaS products, not generic prompt output.",
    primaryAction: { href: "/start", label: "Start a conversation" },
        secondaryAction: { href: "/use-cases/saas", label: "Explore SaaS Use Case", tone: "secondary" },
        highlights: [
          "Scope before stack",
          "Budget-aware SaaS planning",
          "DIY pace or managed execution"
        ],
        panelTitle: "Why this route matters",
        panelSummary:
          "SaaS products often fail before build because nobody clearly defined the MVP, customer, cost, or launch path. Neroa makes those decisions visible first.",
        panelItems: [
          "Clarify the customer and the first valuable release",
          "Estimate effort before the build grows messy",
          "Move into DIY or managed execution with more confidence"
        ]
      }}
      coreSection={{
        eyebrow: "How Neroa helps",
        title: "The system is designed for real SaaS builds, not template cloning.",
        summary:
          "Neroa keeps the product definition, MVP cut line, pricing logic, budget, and launch path connected so the SaaS can move toward a real release.",
        cards: [
          {
            title: "Scope the MVP before the build widens",
            description:
              "Use Neroa to decide what belongs in the first release, what should wait, and what will increase cost too early."
          },
          {
            title: "Build on the budget you have now",
            description:
              "DIY lets the product move through monthly Engine Credits, while Managed Build is there when the SaaS needs faster support."
          },
          {
            title: "Keep launch logic tied to the product",
            description:
              "The build path stays connected to budget, validation, and launch planning instead of splitting across separate tools and people."
          }
        ]
      }}
      fitSection={{
        eyebrow: "Best fit",
        title: "Who this page is really for.",
        summary:
          "This route is strongest for people who want a more realistic path into SaaS than hiring a full traditional team upfront or hoping an AI chat somehow turns into a product.",
        cards: [
          {
            title: "Founders validating a SaaS idea",
            description:
              "A strong fit when someone wants to test the product and understand the real path before committing large capital."
          },
          {
            title: "Operators turning expertise into software",
            description:
              "Useful when an expert or business operator wants to convert a workflow or niche insight into a subscription product."
          },
          {
            title: "Teams choosing between DIY and managed execution",
            description:
              "Neroa helps customers understand whether this SaaS should move slowly inside credits or shift into a managed path."
          }
        ]
      }}
      faqSection={{
        eyebrow: "SaaS FAQ",
        title: "Common questions about building SaaS with AI.",
        summary:
          "These answers help explain why Neroa is built for structured product execution instead of generic AI ideation.",
        items: [...faqItems]
      }}
      finalCta={{
        eyebrow: "Next step",
        title: "Open the SaaS path with scope, pace, and budget clarity from the start.",
        summary:
          "Use Neroa when you want SaaS planning that connects directly to build decisions instead of stopping at ideas.",
        actions: [
          { href: "/start", label: "Start a conversation" },
          { href: "/pricing/diy", label: "View DIY Pricing", tone: "secondary" }
        ]
      }}
    />
  );
}
