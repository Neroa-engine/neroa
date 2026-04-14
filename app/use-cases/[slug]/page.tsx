import { notFound } from "next/navigation";
import { UseCaseTemplate } from "@/components/marketing/use-case-template";
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

export default function UseCaseDetailPage({ params }: UseCaseDetailPageProps) {
  const page = getUseCasePage(params.slug);

  if (!page) {
    notFound();
  }

  return <UseCaseTemplate page={page} howItWorksPages={howItWorksPages} />;
}
