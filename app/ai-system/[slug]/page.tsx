import { redirect } from "next/navigation";
import { getAiSystemStaticParams } from "@/lib/data/ai-system";

type AiSystemDetailPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAiSystemStaticParams();
}

export default function AiSystemDetailPage({ params }: AiSystemDetailPageProps) {
  redirect(`/system/${params.slug}`);
}
