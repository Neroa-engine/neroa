import type { AgentId } from "@/lib/ai/agents";

export type UseCasePageSummary = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
};

export type UseCaseWorkflowStep = {
  title: string;
  description: string;
  detailSlug?: string;
};

export type UseCaseCapability = {
  title: string;
  description: string;
  detailSlug?: string;
};

export type UseCasePricingStack = {
  heading: string;
  recommendedStack: string;
  monthlyPrice: string;
  bestFor: string;
  included: string[];
  rationale: string;
};

export type UseCaseDetailPage = {
  slug: string;
  aliases?: string[];
  title: string;
  eyebrow: string;
  heroTitle: string;
  intro: string;
  summary: string;
  heroHighlights: string[];
  heroPanelTitle: string;
  heroPanelSummary: string;
  heroPanelItems: string[];
  workflow: UseCaseWorkflowStep[];
  capabilities: UseCaseCapability[];
  collaboration: Array<{
    id: AgentId;
    badge: string;
    description: string;
  }>;
  pricingStack?: UseCasePricingStack;
  deliverablesTitle: string;
  deliverables: string[];
  outcomesTitle: string;
  outcomes: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  finalCtaTitle: string;
  finalCtaSummary: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
};
