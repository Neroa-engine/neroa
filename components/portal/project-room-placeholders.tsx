import Link from "next/link";

type PlaceholderModule = {
  label: string;
  title: string;
  body: string;
};

type PlaceholderNavItem = {
  label: string;
  href: string;
  active?: boolean;
};

export function ProjectRoomPlaceholder({
  eyebrow,
  title,
  description,
  modules,
  navigation,
  primaryAction,
  secondaryAction
}: {
  eyebrow: string;
  title: string;
  description: string;
  modules: PlaceholderModule[];
  navigation?: PlaceholderNavItem[];
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}) {
  return (
    <div className="space-y-6">
      {navigation && navigation.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                item.active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200/75 bg-white/82 text-slate-600 hover:border-cyan-200 hover:bg-cyan-50/70 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}

      <section className="floating-plane relative overflow-hidden rounded-[38px] px-6 py-8 xl:px-8">
        <div className="floating-wash rounded-[38px]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
          </div>

          {primaryAction || secondaryAction ? (
            <div className="flex flex-wrap gap-3">
              {primaryAction ? (
                <Link href={primaryAction.href} className="button-primary">
                  {primaryAction.label}
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link href={secondaryAction.href} className="button-secondary">
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {modules.map((module) => (
          <div key={module.title} className="floating-plane rounded-[30px] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {module.label}
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{module.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{module.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export function BuildRoomRestrictedState({
  navigation,
  commandCenterHref,
  workspaceHref
}: {
  navigation?: PlaceholderNavItem[];
  commandCenterHref: string;
  workspaceHref: string;
}) {
  return (
    <ProjectRoomPlaceholder
      eyebrow="Build Room"
      title="Protected live execution environment"
      description="Build Room is where live execution, preview, and protected implementation work will stay organized. The address is now stable again even though direct customer entry remains restricted."
      navigation={navigation}
      primaryAction={{
        label: "Open Command Center",
        href: commandCenterHref
      }}
      secondaryAction={{
        label: "Return to Project Workspace",
        href: workspaceHref
      }}
      modules={[
        {
          label: "What happens here",
          title: "Live build and preview work",
          body:
            "Approved roadmap work, preview review, and implementation coordination will live here when the deeper protected execution path is ready."
        },
        {
          label: "How it connects",
          title: "Rooms stay aligned",
          body:
            "Strategy Room keeps the product definition clear, Project Workspace keeps the approved scope visible, and Command Center reflects how the work moves forward."
        },
        {
          label: "Access model",
          title: "Restricted by design",
          body:
            "This room is intentionally visible so the project architecture stays understandable, but direct customer entry is still gated while the protected runtime layer is stabilized."
        }
      ]}
    />
  );
}
