import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/marketing/seo-landing-template";
import { buildFaqSchema, buildPublicMetadata, buildWebPageSchema } from "@/lib/marketing/seo";

const faqItems = [
  {
    question: "How is Neroa different from a normal managed software shop?",
    answer:
      "Neroa frames Managed Build around structured scope, approval checkpoints, guided visibility, and educational transparency rather than a black-box handoff model."
  },
  {
    question: "Can I understand the software while it is being built?",
    answer:
      "Yes. Managed Build is designed so the customer can see progress, understand the product logic, and review meaningful checkpoints along the way."
  },
  {
    question: "What kinds of software can Managed Build support?",
    answer:
      "Managed Build can support SaaS products, internal software, external customer apps, mobile apps, and more complex business systems once the scope is defined."
  },
  {
    question: "Can I begin in DIY and switch later?",
    answer:
      "Yes. Customers can start in DIY and move into a managed software build service when the scope, urgency, or business importance increases."
  }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Managed software build service | Structured execution with Neroa",
  description:
    "Use Neroa as a managed software build service for structured execution, staged approvals, launch coordination, QA visibility, and a clearer alternative to black-box outsourcing.",
  path: "/managed-software-build-service",
  keywords: [
    "managed software build service",
    "AI-guided software build service",
    "done-for-you software development alternative",
    "software build service with visibility"
  ]
});

export default function ManagedSoftwareBuildServicePage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        name: "Managed software build service",
        description:
          "Structured managed software execution with approval checkpoints and guided visibility.",
        path: "/managed-software-build-service"
      }),
      buildFaqSchema([...faqItems])
    ]
  } as const;

  return (
    <SeoLandingTemplate
      ctaHref="/contact?type=managed-build-quote"
      ctaLabel="Request Managed Build Quote"
      schema={schema}
      hero={{
        eyebrow: "Managed software build service",
        title: "Use Neroa when you want structured software execution, not black-box delivery.",
        summary:
          "Managed Build is Neroa's structured path for customers who want more support carrying the build, QA, launch, and operating work without losing visibility into the product.",
        primaryAction: {
          href: "/contact?type=managed-build-quote",
          label: "Request Managed Build Quote"
        },
        secondaryAction: { href: "/pricing/managed", label: "View Managed Pricing", tone: "secondary" },
        highlights: [
          "Phased execution",
          "Approval checkpoints",
          "Customer visibility during build"
        ],
        panelTitle: "What this service is designed to solve",
        panelSummary:
          "Many customers want more than DIY pacing, but they also do not want the product to disappear into an opaque outsourced process. Neroa is designed to sit between those extremes.",
        panelItems: [
          "Scope and stage the build before real delivery pressure begins",
          "Keep the customer involved at meaningful checkpoints",
          "Support launch and operating follow-through after execution"
        ]
      }}
      coreSection={{
        eyebrow: "Why this managed model works",
        title: "The build stays understandable while it moves forward.",
        summary:
          "A credible managed software service should help the customer understand the software, not just wait for it. Neroa is built around that belief.",
        cards: [
          {
            title: "Phased progress instead of one long mystery cycle",
            description:
              "The project moves through clear stages so the customer knows what is happening and what is next."
          },
          {
            title: "Review checkpoints that protect alignment",
            description:
              "Major continuation points are reviewed before the build moves deeper, which helps reduce drift and avoid late surprises."
          },
          {
            title: "A path from planning into launch support",
            description:
              "Neroa helps connect scope, execution, QA visibility, and launch coordination instead of treating them as separate vendor problems."
          }
        ]
      }}
      fitSection={{
        eyebrow: "Best fit",
        title: "Who should consider the managed path.",
        summary:
          "This route is strongest for people who want serious execution help without losing strategic visibility into the product.",
        cards: [
          {
            title: "Founders who want to move faster",
            description:
              "A strong fit when the project is becoming too important or too time-sensitive for a slower DIY path."
          },
          {
            title: "Businesses replacing important operational systems",
            description:
              "Useful when the software is becoming central to revenue, operations, delivery, or customer experience."
          },
          {
            title: "DIY customers who want a stronger support layer",
            description:
              "Neroa makes it easier to transition from guided self-serve into a more supported managed build path."
          }
        ]
      }}
      faqSection={{
        eyebrow: "Managed service FAQ",
        title: "Questions people ask before requesting a managed software build path.",
        summary:
          "These answers clarify how Neroa approaches managed support and why it is designed to feel more visible than a normal outsourced build.",
        items: [...faqItems]
      }}
      finalCta={{
        eyebrow: "Next step",
        title: "Open the managed path when the product needs more support than DIY pacing can comfortably provide.",
        summary:
          "Request a managed quote when the software needs execution help, stronger oversight, and more structured movement toward launch.",
        actions: [
          { href: "/contact?type=managed-build-quote", label: "Request Managed Build Quote" },
          { href: "/diy-build", label: "Compare with DIY", tone: "secondary" }
        ]
      }}
    />
  );
}
