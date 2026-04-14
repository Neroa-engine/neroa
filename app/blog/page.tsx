import { MarketingInfoShell } from "@/components/layout/page-shells";
import { BlogPostCard } from "@/components/marketing/blog-post-card";
import { getPublishedBlogPosts } from "@/lib/blog";

export default function BlogPage() {
  const posts = getPublishedBlogPosts();

  return (
    <MarketingInfoShell ctaHref="/use-cases" ctaLabel="Explore use cases" brandVariant="prominent">
      <section className="mx-auto max-w-5xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
          Blog
        </p>
        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[4.9rem]">
          Product thinking, AI build systems, and launch strategy from Neroa.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">
          Read how coordinated AI can help plan, validate, budget, and build SaaS products, internal software, and external apps.
        </p>
      </section>

      <section className="mt-16 grid gap-4 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </section>
    </MarketingInfoShell>
  );
}
