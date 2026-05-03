import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NeroaBlogArticleSurface } from "@/components/neroa-portal/neroa-blog-article-surface";
import { blogPosts, getBlogPostBySlug } from "@/lib/neroa/blog-posts";

type PageParams = {
  slug: string;
};

export function generateStaticParams(): PageParams[] {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Neroa | Blog",
      description:
        "Read the Neroa Build Journal for roadmap-first thinking about structured software building, Build Credits, approvals, and governed execution."
    };
  }

  return {
    title: `${post.title} | Neroa`,
    description: post.summary
  };
}

export default async function NeroaBlogArticlePage({
  params
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <NeroaBlogArticleSurface post={post} />;
}
