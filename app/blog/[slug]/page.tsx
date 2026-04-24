import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticleTemplate } from "@/components/marketing/blog-article-template";
import {
  getBlogStaticParams,
  getPublishedBlogPostBySlug,
  getRelatedBlogPosts
} from "@/lib/blog";

type BlogArticlePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getBlogStaticParams();
}

export function generateMetadata({ params }: BlogArticlePageProps): Metadata {
  const post = getPublishedBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Blog | NEROA"
    };
  }

  return {
    title: `${post.title} | NEROA`,
    description: post.socialDescription,
    alternates: {
      canonical: post.canonicalUrl
    },
    openGraph: {
      title: post.socialTitle,
      description: post.socialDescription,
      type: "article",
      url: post.canonicalUrl,
      publishedTime: post.publishedAt
    },
    twitter: {
      card: "summary_large_image",
      title: post.socialTitle,
      description: post.socialDescription
    }
  };
}

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  const post = getPublishedBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogArticleTemplate post={post} relatedPosts={getRelatedBlogPosts(post)} />;
}
