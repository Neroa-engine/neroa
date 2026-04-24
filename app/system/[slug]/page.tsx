import { notFound, redirect } from "next/navigation";
import { AiDetailTemplate } from "@/components/ai-system/ai-detail-template";
import {
  getAiSystemPage,
  getAiSystemStaticParams,
  normalizeAiSystemSlug
} from "@/lib/data/ai-system";

type SystemDetailPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAiSystemStaticParams();
}

export default function SystemDetailPage({ params }: SystemDetailPageProps) {
  const canonicalSlug = normalizeAiSystemSlug(params.slug);

  if (canonicalSlug !== params.slug) {
    redirect(`/system/${canonicalSlug}`);
  }

  const page = getAiSystemPage(canonicalSlug);

  if (!page) {
    notFound();
  }

  return <AiDetailTemplate page={page} />;
}
