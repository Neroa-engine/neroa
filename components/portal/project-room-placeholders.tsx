import Link from "next/link";

type PlaceholderModule = {
  label: string;
  title: string;
  body: string;
};

export function ProjectRoomPlaceholder({
  eyebrow,
  title,
  description,
  modules,
  primaryAction,
  secondaryAction
}: {
  eyebrow: string;
  title: string;
  description: string;
  modules: PlaceholderModule[];
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
  commandCenterHref,
  workspaceHref
}: {
  commandCenterHref: string;
  workspaceHref: string;
}) {
  return (
    <div className="space-y-6">
      <section className="floating-plane relative overflow-hidden rounded-[38px] border border-slate-200/70 px-6 py-8 xl:px-8">
        <div className="floating-wash rounded-[38px]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
              Build Room
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 xl:text-6xl">
              Protected live execution environment
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              Build Room is where live building, testing, previewing, and protected remote
              workspace operations run. Direct access stays limited while execution is managed
              through a controlled environment.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={commandCenterHref} className="button-primary">
              Open Command Center
            </Link>
            <Link href={workspaceHref} className="button-secondary">
              Return to Project Workspace
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {[
          {
            label: "What happens here",
            title: "Live build and preview work",
            body:
              "Approved roadmap work, protected previews, test environments, and active implementation operations are organized here when direct access opens."
          },
          {
            label: "How it stays organized",
            title: "Rooms stay in sync",
            body:
              "Strategy Room defines what should be built, Project Workspace keeps the approved roadmap visible, and Command Center shows how that plan translates into delivery."
          },
          {
            label: "Access model",
            title: "Restricted by design",
            body:
              "This room remains visible so the product architecture is understandable, but access stays gated until the protected execution environment is ready for direct customer entry."
          }
        ].map((item) => (
          <div key={item.title} className="floating-plane rounded-[30px] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
