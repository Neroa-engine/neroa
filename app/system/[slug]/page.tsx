import { notFound } from "next/navigation";
import { AiDetailTemplate } from "@/components/ai-system/ai-detail-template";
import { getAiSystemPage, getAiSystemStaticParams } from "@/lib/data/ai-system";

type SystemDetailPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAiSystemStaticParams();
}

export default function SystemDetailPage({ params }: SystemDetailPageProps) {
  const page = getAiSystemPage(params.slug);

  if (!page) {
    notFound();
  }

  return <AiDetailTemplate page={page} />;
}
