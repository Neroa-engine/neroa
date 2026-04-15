import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UseCaseTemplate } from "@/components/marketing/use-case-template";
import { buildPublicMetadata } from "@/lib/marketing/seo";
import { getUseCasePage, getUseCaseStaticParams } from "@/lib/use-cases";
import { howItWorksPages } from "@/lib/marketing-pages";

type UseCaseDetailPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getUseCaseStaticParams();
}

export function generateMetadata({ params }: UseCaseDetailPageProps): Metadata {
  const page = getUseCasePage(params.slug);

  if (!page) {
    return {};
  }

  return buildPublicMetadata({
    title: `${page.title} | Guided AI build path with Neroa`,
    description: page.summary,
    path: `/use-cases/${page.slug}`,
    keywords: [
      `${page.title} with AI`,
      `${page.title.toLowerCase()} build path`,
      "guided software builder",
      "AI-powered product development"
    ]
  });
}

export default function UseCaseDetailPage({ params }: UseCaseDetailPageProps) {
  const page = getUseCasePage(params.slug);

  if (!page) {
    notFound();
  }

  return <UseCaseTemplate page={page} howItWorksPages={howItWorksPages} />;
}
