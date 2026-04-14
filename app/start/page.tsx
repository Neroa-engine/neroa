import { startGuidedEngineWorkspace } from "@/app/start/actions";
import GuidedStartFlow from "@/components/onboarding/guided-start-flow";
import { MarketingInfoShell } from "@/components/layout/page-shells";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { getOptionalUser } from "@/lib/auth";

type StartPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
    step?: string;
  };
};

type WizardStep =
  | "account"
  | "plan"
  | "entry"
  | "industry"
  | "goal"
  | "opportunity"
  | "product"
  | "experience"
  | "preference"
  | "summary";

function isWizardStep(value?: string): value is WizardStep {
  return (
    value === "account" ||
    value === "plan" ||
    value === "entry" ||
    value === "industry" ||
    value === "goal" ||
    value === "opportunity" ||
    value === "product" ||
    value === "experience" ||
    value === "preference" ||
    value === "summary"
  );
}

function resolveInitialStep(args: {
  authenticated: boolean;
  hasSelectedPlan: boolean;
  requestedStep?: string;
}): WizardStep {
  if (!args.authenticated) {
    return "account";
  }

  if (!args.hasSelectedPlan) {
    return "plan";
  }

  if (isWizardStep(args.requestedStep) && args.requestedStep !== "account") {
    return args.requestedStep;
  }

  return "entry";
}

export default async function StartPage({ searchParams }: StartPageProps) {
  const user = await getOptionalUser();
  const access = resolveAccountPlanAccess(user);
  const initialStep = resolveInitialStep({
    authenticated: Boolean(user),
    hasSelectedPlan: access.hasSelectedPlan,
    requestedStep: searchParams?.step
  });

  return (
    <MarketingInfoShell
      userEmail={user?.email ?? undefined}
      ctaHref={user ? "/dashboard" : "/auth?next=/start"}
      ctaLabel={user ? "Engine Board" : "Sign in"}
      brandVariant="prominent"
      contentWidth="wide"
    >
      <section className="relative mx-auto w-full max-w-[1880px] px-2 py-6 lg:px-4 lg:py-10 xl:px-6">
        <div className="mx-auto max-w-[1480px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
            Guided system builder
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl xl:text-[4.4rem] xl:leading-[0.96]">
            Neroa architects the business path before it builds the Engine.
          </h1>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-9 text-slate-600">
            This flow leads with industry, product type, goal, experience level, and build preference so the resulting system feels assembled for the business you want, not copied from a generic template grid.
          </p>
        </div>

        <div className="mt-10">
          <GuidedStartFlow
            initialUserEmail={user?.email ?? undefined}
            initialSelectedPlanId={access.selectedPlanId}
            initialBillingInterval={access.billingInterval}
            initialStep={initialStep}
            initialError={searchParams?.error ?? null}
            initialNotice={searchParams?.notice ?? null}
            startGuidedEngineWorkspaceAction={startGuidedEngineWorkspace}
          />
        </div>
      </section>
    </MarketingInfoShell>
  );
}
