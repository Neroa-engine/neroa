import Link from "next/link";
import { formatBlogDate, type BlogPost } from "@/lib/blog";

type BlogPostCardProps = {
  post: BlogPost;
  compact?: boolean;
};

export function BlogPostCard({ post, compact = false }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`micro-glow floating-plane group block rounded-[30px] ${
        compact ? "p-5" : "p-6"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45`}
    >
      <div className="floating-wash rounded-[30px]" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
          <span>{post.category}</span>
          <span className="h-1 w-1 rounded-full bg-cyan-500/55" />
          <span>{formatBlogDate(post.publishedAt)}</span>
        </div>

        <h2
          className={`mt-4 font-semibold tracking-tight text-slate-950 transition group-hover:text-slate-900 ${
            compact ? "text-xl" : "text-2xl"
          }`}
        >
          {post.title}
        </h2>

        <p className={`mt-4 text-slate-600 ${compact ? "text-sm leading-7" : "text-sm leading-8"}`}>
          {post.excerpt}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 transition group-hover:gap-3">
          Read article
          <span aria-hidden="true">-&gt;</span>
        </div>
      </div>
    </Link>
  );
}
