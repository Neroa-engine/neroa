import { MarketingInfoShell } from "@/components/layout/page-shells";
import { BlogPostCard } from "@/components/marketing/blog-post-card";
import { getPublishedBlogPosts } from "@/lib/blog";

export default function BlogPage() {
  const posts = getPublishedBlogPosts();

  return (
    <MarketingInfoShell ctaHref="/start" ctaLabel="Start planning" brandVariant="prominent">
      <section className="mx-auto max-w-5xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-700">
          Blog
        </p>
        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-[4.9rem]">
          SaaS planning, build-path thinking, and product notes from NEROA.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-slate-600">
          Read the public-facing product notes that explain SaaS planning, Neroa-guided entry,
          cleaner scope, and how the build path should be chosen before execution widens.
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
