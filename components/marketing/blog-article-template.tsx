import Link from "next/link";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { BlogPostCard } from "@/components/marketing/blog-post-card";
import { formatBlogDate, type BlogPost } from "@/lib/blog";
import { resolvePublicLaunchAction } from "@/lib/data/public-launch";

type BlogArticleTemplateProps = {
  post: BlogPost;
  relatedPosts: BlogPost[];
};

export function BlogArticleTemplate({ post, relatedPosts }: BlogArticleTemplateProps) {
  const primaryAction = resolvePublicLaunchAction(post.cta.primaryLabel, post.cta.primaryHref);
  const secondaryAction = resolvePublicLaunchAction(
    post.cta.secondaryLabel,
    post.cta.secondaryHref
  );

  return (
    <MarketingInfoShell ctaHref="/use-cases" ctaLabel="Explore use cases" brandVariant="prominent">
      <article className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/blog" className="premium-pill text-slate-600 transition hover:text-slate-900">
            Back to blog
          </Link>
          <Link href="/" className="premium-pill text-slate-600 transition hover:text-slate-900">
            Home
          </Link>
        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              <span>{post.category}</span>
              <span className="h-1 w-1 rounded-full bg-cyan-500/55" />
              <span>{formatBlogDate(post.publishedAt)}</span>
              <span className="h-1 w-1 rounded-full bg-cyan-500/55" />
              <span>{post.attribution}</span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl xl:text-[4.5rem] xl:leading-[0.96]">
              {post.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">{post.dek}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full border border-slate-200/80 bg-white/72 px-3 py-1.5 text-slate-700">
                By {post.authorName}
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200/70 bg-white/56 px-3 py-1.5"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryAction.href} className="button-primary">
                {primaryAction.label}
              </Link>
              <Link href={secondaryAction.href} className="button-secondary">
                {secondaryAction.label}
              </Link>
            </div>
          </div>

          <div className="floating-plane relative overflow-hidden rounded-[34px] p-6 sm:p-8">
            <div className="floating-wash rounded-[34px]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                {post.heroPanelTitle}
              </p>

              <div className="mt-6 space-y-3">
                {post.heroPanelItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-12">
            <div className="floating-plane rounded-[34px] p-6 sm:p-8">
              <div className="floating-wash rounded-[34px]" />
              <div className="relative space-y-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  Intro
                </p>
                {post.intro.map((paragraph) => (
                  <p key={paragraph} className="text-lg leading-9 text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {post.body.map((section) => (
              <section key={section.id} className="floating-plane rounded-[34px] p-6 sm:p-8">
                <div className="floating-wash rounded-[34px]" />
                <div className="relative">
                  {section.eyebrow ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                      {section.eyebrow}
                    </p>
                  ) : null}
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                    {section.title}
                  </h2>

                  <div className="mt-6 space-y-5">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-base leading-8 text-slate-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {section.bullets?.length ? (
                    <div className="mt-6 grid gap-3">
                      {section.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="rounded-[22px] border border-slate-200/70 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600"
                        >
                          {bullet}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {section.callout ? (
                    <div className="mt-6 rounded-[26px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(139,92,246,0.1))] px-5 py-5">
                      <p className="text-sm font-semibold text-slate-950">{section.callout.title}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {section.callout.content}
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>
            ))}
          </div>

          <aside className="grid gap-6 self-start lg:sticky lg:top-28">
            {post.keyTakeaways?.length ? (
              <div className="floating-plane rounded-[30px] p-5">
                <div className="floating-wash rounded-[30px]" />
                <div className="relative">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Key takeaways
                  </p>
                  <div className="mt-5 grid gap-3">
                    {post.keyTakeaways.map((item) => (
                      <div
                        key={item}
                        className="rounded-[20px] border border-slate-200/70 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="floating-plane rounded-[30px] p-5">
              <div className="floating-wash rounded-[30px]" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  Continue with Neroa
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                  {post.cta.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{post.cta.description}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link href={primaryAction.href} className="button-primary">
                    {primaryAction.label}
                  </Link>
                  <Link href={secondaryAction.href} className="button-secondary">
                    {secondaryAction.label}
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {relatedPosts.length > 0 ? (
          <section className="mt-16">
            <div className="mb-8 max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Related posts
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Continue the Neroa product story
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost.slug} post={relatedPost} compact />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-16">
          <div className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 sm:px-8 sm:py-10">
            <div className="floating-wash rounded-[38px]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                  Next move
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  {post.cta.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600">{post.cta.description}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={primaryAction.href} className="button-primary">
                  {primaryAction.label}
                </Link>
                <Link href="/blog" className="button-secondary">
                  Back to blog
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </MarketingInfoShell>
  );
}
