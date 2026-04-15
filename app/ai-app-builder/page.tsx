import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/seo-landing-template";
import { buildFaqSchema, buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";

const faqItems = [
  {
    question: "Is Neroa just another AI app builder?",
    answer:
      "No. Neroa is designed as a guided product system that moves from idea to scope to MVP to budget to build to launch, rather than acting like a generic prompt box."
  },
  {
    question: "Can I build different types of apps here?",
    answer:
      "Yes. Neroa supports SaaS products, internal software, external apps, and mobile apps through the same structured product logic."
  },
  {
    question: "What makes Neroa different from a template marketplace?",
    answer:
      "Neroa focuses on structured build direction, scoped execution, and budget-aware product decisions. It is not built around selling a pile of generic templates."
  },
  {
    question: "Can I switch from DIY to managed help?",
    answer:
      "Yes. Customers can start with monthly Engine Credits and move into Managed Build later if the app becomes more urgent or more complex."
  }
] as const;

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
      }),
      buildFaqSchema([...faqItems])
    ]
  } as const;

  return (
    <SeoLandingTemplate
      schema={schema}
      hero={{
        eyebrow: "AI app builder",
        title: "Use an AI app builder that actually guides the product, not just the prompt.",
        summary:
          "Neroa helps users move from idea into a structured build path with budget visibility, app-stack logic, and a real route into execution.",
        primaryAction: { href: "/start", label: "Start DIY Build" },
        secondaryAction: { href: "/use-cases", label: "Explore Use Cases", tone: "secondary" },
        highlights: [
          "Guided product flow",
          "App planning with budget clarity",
          "DIY or managed execution lanes"
        ],
        panelTitle: "What makes Neroa different",
        panelSummary:
          "A useful AI app builder should understand scope, sequence, launch risk, and budget pacing. Neroa is designed around those decisions from the start.",
        panelItems: [
          "Start with product logic instead of generic prompts",
          "Keep scope and execution linked in one system",
          "Route into DIY or managed execution when appropriate"
        ]
      }}
      coreSection={{
        eyebrow: "Guided app building",
        title: "The system is built to make software decisions clearer before execution expands.",
        summary:
          "Neroa helps people build serious apps by making scope, complexity, pacing, and next steps visible instead of hiding them behind vague AI output.",
        cards: [
          {
            title: "Understand what the app should do first",
            description:
              "Use Naroa to define the users, workflows, modules, and MVP boundary before the app starts widening."
          },
          {
            title: "Connect the app to budget and build pace",
            description:
              "The system helps customers understand how monthly credits, plan level, and complexity affect how quickly the app can move."
          },
          {
            title: "Choose the right execution lane",
            description:
              "Stay in DIY when pacing is flexible, or move to Managed Build when the app needs faster and more coordinated delivery help."
          }
        ]
      }}
      fitSection={{
        eyebrow: "Best fit",
        title: "Who this kind of AI app builder is for.",
        summary:
          "This route works best for people who want more than idea generation and less chaos than a disconnected build process usually creates.",
        cards: [
          {
            title: "Founders shaping a first product",
            description:
              "A strong option when someone wants to turn an idea into a real app path without guessing their way through scope and budget."
          },
          {
            title: "Operators planning business software",
            description:
              "Useful for teams building internal tools, customer portals, dashboards, and operational systems."
          },
          {
            title: "Businesses comparing DIY vs managed",
            description:
              "Neroa helps clarify whether the app should stay in a monthly self-paced lane or shift into a more supported managed path."
          }
        ]
      }}
      faqSection={{
        eyebrow: "App builder FAQ",
        title: "Questions people ask when they want an AI-native app building system.",
        summary:
          "These answers explain why Neroa is positioned as a guided build system instead of a generic AI app generator.",
        items: [...faqItems]
      }}
      finalCta={{
        eyebrow: "Next step",
        title: "Start with a guided app path that understands budget, scope, and execution weight.",
        summary:
          "Use Neroa when you want an AI app builder that behaves like the beginning of a real product system, not just a clever interface.",
        actions: [
          { href: "/start", label: "Start DIY Build" },
          { href: "/managed-build", label: "Explore Managed Build", tone: "secondary" }
        ]
      }}
    />
  );
}
