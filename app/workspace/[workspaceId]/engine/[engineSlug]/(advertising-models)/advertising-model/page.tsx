type AdvertisingModelPageProps = {
  params: {
    workspaceId: string;
    engineSlug: string;
  };
};

export default function AdvertisingModelPage({ params }: AdvertisingModelPageProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6 xl:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/70">
          Advertising model view
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Advertising model page
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 xl:text-base xl:leading-8">
          This route intentionally excludes Narua so advertising-only modeling can run as a focused surface without the persistent build guidance layer in view.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Route context</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Workspace ID: {params.workspaceId}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-200">
            Engine slug: {params.engineSlug}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Why Narua is excluded here</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Advertising-model routes use a separate layout so the broader execution layer does not intrude on narrow ad modeling work.
          </p>
        </div>
      </section>
    </div>
  );
}
