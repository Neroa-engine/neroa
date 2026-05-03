import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NeroaBlogArticleSurface } from "@/components/neroa-portal/neroa-blog-article-surface";
import {
  NEROA_BLOG_INDEX_PATH,
  getBlogPostBySlug,
  getBlogPostRoute,
  getStaticBlogPostSlugs
} from "@/lib/neroa/blog-posts";

type PageParams = {
  slug: string;
};

export const dynamicParams = false;

export function generateStaticParams(): PageParams[] {
  return getStaticBlogPostSlugs().map((slug) => ({ slug }));
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
      title: "The Neroa Build Journal | Neroa",
      description:
        "Read the Neroa Build Journal for roadmap-first thinking about structured software building, Build Credits, approvals, and governed execution.",
      alternates: {
        canonical: NEROA_BLOG_INDEX_PATH
      }
    };
  }

  return {
    title: `${post.title} | Neroa`,
    description: post.summary,
    alternates: {
      canonical: getBlogPostRoute(post.slug)
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: getBlogPostRoute(post.slug),
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary
    }
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
