"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import AgentAvatar from "@/components/ai/AgentAvatar";
import GuidedVoiceConfirmField from "@/components/onboarding/guided-voice-confirm-field";
import { Logo } from "@/components/logo";
import {
  calculateIntervalPrice,
  getLaunchPricingPlans,
  planScopedEstimateHeadline,
  planScopedEstimateSupport,
  type BillingIntervalId,
  type PricingPlan,
  type PricingPlanId,
  publicBillingIntervals
} from "@/lib/pricing/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  buildGuidedBuildBlueprint,
  buildSuggestedEngineName,
  getGuidedBuildExperienceLevels,
  getGuidedBuildGoals,
  getGuidedBuildIndustries,
  getGuidedBuildOpportunities,
  getGuidedBuildPreferences,
  getGuidedBuildProductType,
  getGuidedBuildProductTypes,
  getManualModuleChoices,
  inferBuildCategoryFromProductType,
  type BuildEntryMode,
  type BuildExperienceLevelId,
  type BuildGoalId,
  type BuildIndustryId,
  type BuildPreferenceId,
  type GuidedBuildBlueprint
} from "@/lib/onboarding/guided-build";
import { getExecutionRoutingModel } from "@/lib/workspace/execution-orchestration";

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

type GuidedStartFlowProps = {
  initialUserEmail?: string;
  initialSelectedPlanId?: PricingPlanId | null;
  initialBillingInterval?: BillingIntervalId;
  initialStep: WizardStep;
  initialError?: string | null;
  initialNotice?: string | null;
  startGuidedEngineWorkspaceAction: (formData: FormData) => void | Promise<void>;
};

type StepMeta = {
  id: WizardStep;
  label: string;
  title: string;
  description: string;
};

const draftStorageKey = "neroa:start-decision-flow:v1";

const stepMeta: Record<WizardStep, StepMeta> = {
  account: {
    id: "account",
    label: "Account",
    title: "Create your account",
    description: "Keep the plan, system blueprint, and Engine history attached to one secure Neroa account."
  },
  plan: {
    id: "plan",
    label: "Plan",
    title: "Choose your plan",
    description: "Pick the Engine Credits and access level that should support this build."
  },
  entry: {
    id: "entry",
    label: "Entry",
    title: "What do you want to build?",
    description: "Choose whether you already know the industry or want Neroa to guide the opportunity search."
  },
  industry: {
    id: "industry",
    label: "Industry",
    title: "Choose your industry",
    description: "Select the market Neroa should optimize the system architecture around."
  },
  goal: {
    id: "goal",
    label: "Goal",
    title: "Define the business goal",
    description: "Tell Neroa whether speed, scale, or validation should shape the first build."
  },
  opportunity: {
    id: "opportunity",
    label: "Opportunities",
    title: "Review recommended opportunities",
    description: "Neroa suggests strong starting systems based on the commercial outcome you want."
  },
  product: {
    id: "product",
    label: "Product",
    title: "Choose the product type",
    description: "Pick the product Neroa should assemble inside the selected market."
  },
  experience: {
    id: "experience",
    label: "Experience",
    title: "Set your experience level",
    description: "This helps Neroa tune scope, system density, and how much complexity to introduce up front."
  },
  preference: {
    id: "preference",
    label: "Build style",
    title: "Choose the build preference",
    description: "Decide whether Neroa should recommend the module set, let you choose it manually, or bias toward a leaner launch."
  },
  summary: {
    id: "summary",
    label: "Summary",
    title: "Review the recommended system",
    description: "See the framework, module set, pricing fit, and launch path before Neroa creates the Engine."
  }
};

function safeWizardStep(value: string | null | undefined): WizardStep {
  return value === "plan" ||
    value === "entry" ||
    value === "industry" ||
    value === "goal" ||
    value === "opportunity" ||
    value === "product" ||
    value === "experience" ||
    value === "preference" ||
    value === "summary"
    ? value
    : "account";
}

function formatPrice(value: number | null) {
  if (value === null) {
    return "Custom";
  }

  if (value === 0) {
    return "$0";
  }

  return `$${value.toFixed(2)}`;
}

function formatCredits(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Pending";
  }

  return value.toLocaleString("en-US");
}

function normalizePlanId(value: unknown): PricingPlanId | null {
  if (value === "agency") {
    return "command-center";
  }

  return value === "free" ||
    value === "starter" ||
    value === "builder" ||
    value === "pro" ||
    value === "command-center"
    ? value
    : null;
}

function buildStepPath(step: WizardStep) {
  return `/start?step=${step}`;
}

function buildSignupConfirmationRedirect() {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectUrl = new URL("/auth/confirm", origin);
  redirectUrl.searchParams.set("next", "/start?step=plan");
  return redirectUrl.toString();
}

function SubmitSystemButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary w-full sm:w-auto" disabled={pending}>
      {pending ? "Building your system..." : "Build My System"}
    </button>
  );
}

function StepButton({
  meta,
  state,
  onClick
}: {
  meta: StepMeta;
  state: "active" | "completed" | "locked";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "locked"}
      className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
        state === "active"
          ? "border-cyan-300/38 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(129,140,248,0.14))] shadow-[0_22px_50px_-30px_rgba(14,165,233,0.45)]"
          : state === "completed"
            ? "border-emerald-300/30 bg-emerald-50/80 hover:border-emerald-400/45"
            : "border-slate-200/70 bg-white/72 text-slate-400"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">{meta.label}</p>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
          {state === "active" ? "Current" : state === "completed" ? "Ready" : "Locked"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6">{meta.title}</p>
    </button>
  );
}

function ChoiceCard({
  eyebrow,
  title,
  description,
  selected,
  badge,
  onClick,
  footer
}: {
  eyebrow?: string;
  title: string;
  description: string;
  selected?: boolean;
  badge?: string;
  onClick: () => void;
  footer?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`premium-surface group h-full rounded-[28px] border p-5 text-left transition ${
        selected
          ? "border-cyan-300/38 bg-[linear-gradient(135deg,rgba(236,254,255,0.88),rgba(238,242,255,0.94))] shadow-[0_28px_70px_-42px_rgba(14,165,233,0.52)]"
          : "hover:-translate-y-1 hover:border-cyan-300/26"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
        </div>
        {badge ? (
          <span className="premium-pill border-slate-200/70 bg-white/86 text-slate-600">{badge}</span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </button>
  );
}

function PlanCard({
  plan,
  billingInterval,
  selected,
  onSelect
}: {
  plan: PricingPlan;
  billingInterval: BillingIntervalId;
  selected: boolean;
  onSelect: () => void;
}) {
  const pricing = calculateIntervalPrice(plan.priceMonthly, billingInterval);
  const effectiveMonthly =
    billingInterval === "annual" ? pricing.effectiveMonthlyPrice : plan.priceMonthly;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-[28px] border p-5 text-left transition ${
        selected
          ? "premium-surface-strong border-cyan-300/34"
          : "premium-surface hover:-translate-y-1 hover:border-cyan-300/28"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-cyan-700">{plan.shortLabel}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {plan.usageBandLabel}
          </p>
        </div>
        {selected ? (
          <span className="premium-pill border-cyan-300/28 bg-cyan-50 text-cyan-700">Selected</span>
        ) : null}
      </div>
      <div className="mt-5">
        <div className="flex items-end gap-2">
          <p className="text-3xl font-semibold tracking-tight text-slate-950">
            {plan.priceMonthly === 0 ? "Free" : formatPrice(effectiveMonthly)}
          </p>
          <p className="pb-1 text-sm text-slate-500">
            {plan.priceMonthly === 0
              ? "forever"
              : billingInterval === "annual"
                ? "/month effective"
                : "/month"}
          </p>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-600">{plan.bestFor}</p>
        <div className="mt-4 rounded-[18px] border border-cyan-200/70 bg-cyan-50/85 px-4 py-4">
          <p className="text-sm font-semibold text-slate-950">{planScopedEstimateHeadline}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{planScopedEstimateSupport}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="min-w-[180px] flex-1 rounded-[18px] border border-slate-200/70 bg-white/78 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Engine Credits
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {plan.capacity.includedExecutionCreditsMonthly?.toLocaleString("en-US") ?? "Custom"} / mo
          </p>
        </div>
        <div className="min-w-[180px] flex-1 rounded-[18px] border border-slate-200/70 bg-white/78 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Active planning engines
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {plan.capacity.activePlanningEngines === null ? "Custom" : plan.capacity.activePlanningEngines}
          </p>
        </div>
      </div>
    </button>
  );
}

function SidebarMetric({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200/70 bg-white/82 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function InfoList({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white/84 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-500" />
            <p className="text-sm leading-7 text-slate-600">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DecisionStartFlow({
  initialUserEmail,
  initialSelectedPlanId,
  initialBillingInterval = "monthly",
  initialStep,
  initialError,
  initialNotice,
  startGuidedEngineWorkspaceAction
}: GuidedStartFlowProps) {
  const router = useRouter();
  const plans = useMemo(() => getLaunchPricingPlans(), []);
  const industries = useMemo(() => getGuidedBuildIndustries(), []);
  const goals = useMemo(() => getGuidedBuildGoals(), []);
  const experienceLevels = useMemo(() => getGuidedBuildExperienceLevels(), []);
  const preferences = useMemo(() => getGuidedBuildPreferences(), []);
  const executionRouting = useMemo(() => getExecutionRoutingModel(), []);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [userEmail, setUserEmail] = useState(initialUserEmail ?? "");
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialUserEmail));
  const [selectedPlanId, setSelectedPlanId] = useState<PricingPlanId | null>(
    initialSelectedPlanId ?? null
  );
  const [billingInterval, setBillingInterval] = useState<BillingIntervalId>(initialBillingInterval);
  const [step, setStep] = useState<WizardStep>(
    safeWizardStep(!initialUserEmail ? "account" : initialSelectedPlanId ? initialStep : "plan")
  );

  const [entryMode, setEntryMode] = useState<BuildEntryMode | null>(null);
  const [industryId, setIndustryId] = useState<BuildIndustryId | null>(null);
  const [customIndustry, setCustomIndustry] = useState("");
  const [goalId, setGoalId] = useState<BuildGoalId | null>(null);
  const [productTypeId, setProductTypeId] = useState<string | null>(null);
  const [experienceLevelId, setExperienceLevelId] = useState<BuildExperienceLevelId | null>(null);
  const [buildPreferenceId, setBuildPreferenceId] = useState<BuildPreferenceId | null>(null);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

  const [workingIdeaName, setWorkingIdeaName] = useState("");
  const [workingIdeaDirty, setWorkingIdeaDirty] = useState(false);
  const [engineName, setEngineName] = useState("");
  const [engineNameDirty, setEngineNameDirty] = useState(false);
  const [projectSummary, setProjectSummary] = useState("");
  const [projectSummaryDirty, setProjectSummaryDirty] = useState(false);

  const [accountEmail, setAccountEmail] = useState(initialUserEmail ?? "");
  const [password, setPassword] = useState("");
  const [accountPending, setAccountPending] = useState(false);
  const [planPending, setPlanPending] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [creationError, setCreationError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(initialNotice ?? null);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );
  const selectedIndustry = useMemo(
    () => industries.find((industry) => industry.id === industryId) ?? null,
    [industries, industryId]
  );
  const selectedIndustryLabel =
    industryId === "custom" ? customIndustry.trim() || "Custom industry" : selectedIndustry?.label ?? "";
  const selectedIndustryDescription =
    industryId === "custom"
      ? "Neroa will use your exact industry wording while shaping a flexible product and framework path."
      : selectedIndustry?.description ?? "";
  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === goalId) ?? null,
    [goals, goalId]
  );
  const selectedExperienceLevel = useMemo(
    () => experienceLevels.find((item) => item.id === experienceLevelId) ?? null,
    [experienceLevels, experienceLevelId]
  );
  const selectedBuildPreference = useMemo(
    () => preferences.find((item) => item.id === buildPreferenceId) ?? null,
    [preferences, buildPreferenceId]
  );
  const opportunities = useMemo(() => getGuidedBuildOpportunities(goalId), [goalId]);
  const productTypes = useMemo(() => getGuidedBuildProductTypes(industryId), [industryId]);
  const selectedProductType = useMemo(
    () => getGuidedBuildProductType(productTypeId),
    [productTypeId]
  );
  const manualModuleChoices = useMemo(
    () => getManualModuleChoices(productTypeId),
    [productTypeId]
  );

  const flowSteps = useMemo(() => {
    if (entryMode === "exploring") {
      return [
        "account",
        "plan",
        "entry",
        "goal",
        "opportunity",
        "product",
        "experience",
        "preference",
        "summary"
      ] as WizardStep[];
    }

    return [
      "account",
      "plan",
      "entry",
      "industry",
      "product",
      "goal",
      "experience",
      "preference",
      "summary"
    ] as WizardStep[];
  }, [entryMode]);

  const activeStepIndex = Math.max(flowSteps.indexOf(step), 0);
  const previewBlueprint = useMemo<GuidedBuildBlueprint | null>(() => {
    if (
      !entryMode ||
      !industryId ||
      !goalId ||
      !productTypeId ||
      !experienceLevelId ||
      !buildPreferenceId
    ) {
      return null;
    }

    try {
      return buildGuidedBuildBlueprint({
        entryMode,
        industryId,
        customIndustry,
        goalId,
        productTypeId,
        experienceLevelId,
        buildPreferenceId,
        selectedPlanId,
        selectedModuleIds,
        engineName,
        workingIdeaName,
        projectSummary
      });
    } catch {
      return null;
    }
  }, [
    buildPreferenceId,
    engineName,
    entryMode,
    experienceLevelId,
    goalId,
    industryId,
    customIndustry,
    productTypeId,
    projectSummary,
    selectedModuleIds,
    selectedPlanId,
    workingIdeaName
  ]);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active || !user) {
        return;
      }

      setIsAuthenticated(true);
      setUserEmail(user.email ?? "");
      setAccountEmail((current) => current || user.email || "");
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? "";
      setIsAuthenticated(Boolean(session?.user));
      setUserEmail(email);
      setAccountEmail((current) => current || email);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(draftStorageKey);

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<{
        entryMode: BuildEntryMode;
        industryId: BuildIndustryId;
        customIndustry: string;
        goalId: BuildGoalId;
        productTypeId: string;
        experienceLevelId: BuildExperienceLevelId;
        buildPreferenceId: BuildPreferenceId;
        selectedModuleIds: string[];
        workingIdeaName: string;
        engineName: string;
        projectSummary: string;
      }> | null;

      if (!parsed) {
        return;
      }

      setEntryMode((current) => current ?? parsed.entryMode ?? null);
      setIndustryId((current) => current ?? parsed.industryId ?? null);
      setCustomIndustry((current) => current || parsed.customIndustry || "");
      setGoalId((current) => current ?? parsed.goalId ?? null);
      setProductTypeId((current) => current ?? parsed.productTypeId ?? null);
      setExperienceLevelId((current) => current ?? parsed.experienceLevelId ?? null);
      setBuildPreferenceId((current) => current ?? parsed.buildPreferenceId ?? null);
      setSelectedModuleIds((current) =>
        current.length > 0 ? current : Array.isArray(parsed.selectedModuleIds) ? parsed.selectedModuleIds : []
      );
      setWorkingIdeaName((current) => current || parsed.workingIdeaName || "");
      setEngineName((current) => current || parsed.engineName || "");
      setProjectSummary((current) => current || parsed.projectSummary || "");
    } catch {
      // Ignore corrupted local drafts.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        entryMode,
        industryId,
        customIndustry,
        goalId,
        productTypeId,
        experienceLevelId,
        buildPreferenceId,
        selectedModuleIds,
        workingIdeaName,
        engineName,
        projectSummary
      })
    );
  }, [
    buildPreferenceId,
    engineName,
    entryMode,
    experienceLevelId,
    goalId,
    industryId,
    customIndustry,
    projectSummary,
    productTypeId,
    selectedModuleIds,
    workingIdeaName
  ]);

  useEffect(() => {
    if (!selectedProductType) {
      return;
    }

    const suggestedIdea = selectedProductType.label;
    const suggestedSummary = `${selectedProductType.description} Neroa will shape the first system around the most direct commercial value path before widening the architecture.`;
    const buildCategory = inferBuildCategoryFromProductType(selectedProductType.id);
    const categoryLabel =
      previewBlueprint?.categoryLabel ??
      (buildCategory === "internal-app"
        ? "Internal App"
        : buildCategory === "external-app"
          ? "External App"
          : buildCategory === "mobile-app"
            ? "Mobile App"
            : "SaaS");

    if (!workingIdeaDirty) {
      setWorkingIdeaName(suggestedIdea);
    }

    if (!projectSummaryDirty) {
      setProjectSummary(suggestedSummary);
    }

    if (!engineNameDirty) {
      setEngineName(
        buildSuggestedEngineName(workingIdeaDirty ? workingIdeaName : suggestedIdea, categoryLabel)
      );
    }
  }, [
    engineNameDirty,
    previewBlueprint?.categoryLabel,
    projectSummaryDirty,
    selectedProductType,
    workingIdeaDirty,
    workingIdeaName
  ]);

  useEffect(() => {
    if (engineNameDirty || !selectedProductType) {
      return;
    }

    const buildCategory = inferBuildCategoryFromProductType(selectedProductType.id);
    const categoryLabel =
      previewBlueprint?.categoryLabel ??
      (buildCategory === "internal-app"
        ? "Internal App"
        : buildCategory === "external-app"
          ? "External App"
          : buildCategory === "mobile-app"
            ? "Mobile App"
            : "SaaS");
    setEngineName(buildSuggestedEngineName(workingIdeaName || selectedProductType.label, categoryLabel));
  }, [engineNameDirty, previewBlueprint?.categoryLabel, selectedProductType, workingIdeaName]);

  function updateStep(nextStep: WizardStep) {
    setStep(nextStep);
    setCreationError(null);
    router.replace(buildStepPath(nextStep), { scroll: false });
  }

  function isStepUnlocked(target: WizardStep) {
    switch (target) {
      case "account":
        return true;
      case "plan":
        return isAuthenticated;
      case "entry":
        return isAuthenticated && Boolean(selectedPlanId);
      case "industry":
        return isAuthenticated && Boolean(selectedPlanId) && entryMode === "known-industry";
      case "goal":
        return entryMode === "exploring"
          ? isAuthenticated && Boolean(selectedPlanId) && Boolean(entryMode)
          : Boolean(productTypeId);
      case "opportunity":
        return entryMode === "exploring" && Boolean(goalId);
      case "product":
        return entryMode === "known-industry"
          ? Boolean(industryId && (industryId !== "custom" || customIndustry.trim()))
          : Boolean(industryId && goalId);
      case "experience":
        return Boolean(productTypeId && goalId);
      case "preference":
        return Boolean(experienceLevelId && productTypeId);
      case "summary":
        return Boolean(previewBlueprint && buildPreferenceId);
      default:
        return false;
    }
  }

  function handleStepClick(target: WizardStep) {
    if (!isStepUnlocked(target)) {
      setNotice("Complete the current step first.");
      return;
    }

    updateStep(target);
    setNotice(stepMeta[target].description);
  }

  function primeProduct(productId: string, ideaName?: string) {
    const nextProductType = getGuidedBuildProductType(productId);

    if (!nextProductType) {
      return;
    }

    setProductTypeId(nextProductType.id);
    setWorkingIdeaDirty(false);
    setProjectSummaryDirty(false);
    setEngineNameDirty(false);
    setSelectedModuleIds([]);
    setWorkingIdeaName(ideaName || nextProductType.label);
    setProjectSummary(
      `${nextProductType.description} Neroa will shape the first system around the most direct commercial value path before widening the architecture.`
    );
    const buildCategory = inferBuildCategoryFromProductType(nextProductType.id);
    const categoryLabel =
      buildCategory === "internal-app"
        ? "Internal App"
        : buildCategory === "external-app"
          ? "External App"
          : buildCategory === "mobile-app"
            ? "Mobile App"
            : "SaaS";
    setEngineName(buildSuggestedEngineName(ideaName || nextProductType.label, categoryLabel));
  }

  function chooseEntryMode(mode: BuildEntryMode) {
    setEntryMode(mode);
    setIndustryId(null);
    setCustomIndustry("");
    setGoalId(null);
    setProductTypeId(null);
    setExperienceLevelId(null);
    setBuildPreferenceId(null);
    setSelectedModuleIds([]);

    if (mode === "known-industry") {
      updateStep("industry");
      return;
    }

    updateStep("goal");
  }

  function chooseIndustry(nextIndustryId: BuildIndustryId) {
    setIndustryId(nextIndustryId);
    if (nextIndustryId !== "custom") {
      setCustomIndustry("");
    }
    setProductTypeId(null);
    setExperienceLevelId(null);
    setBuildPreferenceId(null);
    setSelectedModuleIds([]);
    updateStep("product");
  }

  function confirmCustomIndustry() {
    const trimmedIndustry = customIndustry.trim();

    if (!trimmedIndustry) {
      setNotice("Enter the exact industry first so Neroa can save the custom market path.");
      return;
    }

    setIndustryId("custom");
    setProductTypeId(null);
    setExperienceLevelId(null);
    setBuildPreferenceId(null);
    setSelectedModuleIds([]);
    setNotice(`${trimmedIndustry} is saved as the custom industry for this build.`);
    updateStep("product");
  }

  function chooseGoal(nextGoalId: BuildGoalId) {
    setGoalId(nextGoalId);

    if (entryMode === "exploring") {
      updateStep("opportunity");
      return;
    }

    updateStep("experience");
  }

  function chooseOpportunity(opportunityId: string) {
    const selectedOpportunity = opportunities.find((item) => item.id === opportunityId);

    if (!selectedOpportunity) {
      return;
    }

    setIndustryId(selectedOpportunity.industryId);
    setCustomIndustry("");
    primeProduct(selectedOpportunity.productTypeId, selectedOpportunity.label);
    setNotice(`${selectedOpportunity.label} is preloaded as the strongest starting direction for this goal.`);
    updateStep("product");
  }

  function chooseProduct(nextProductTypeId: string) {
    primeProduct(nextProductTypeId);
    updateStep(entryMode === "known-industry" ? "goal" : "experience");
  }

  function chooseExperience(nextExperienceLevelId: BuildExperienceLevelId) {
    setExperienceLevelId(nextExperienceLevelId);
    updateStep("preference");
  }

  function choosePreference(nextPreferenceId: BuildPreferenceId) {
    setBuildPreferenceId(nextPreferenceId);

    if (nextPreferenceId !== "manual-modules") {
      setSelectedModuleIds([]);
    }

    updateStep("summary");
  }

  function toggleModule(moduleId: string) {
    setSelectedModuleIds((current) =>
      current.includes(moduleId)
        ? current.filter((item) => item !== moduleId)
        : [...current, moduleId]
    );
  }

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccountPending(true);
    setAccountError(null);
    setNotice(null);

    const trimmedEmail = accountEmail.trim().toLowerCase();

    if (!trimmedEmail || !password.trim()) {
      setAccountPending(false);
      setAccountError("Enter an email and password before continuing.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: buildSignupConfirmationRedirect(),
        data: {
          signup_source: "guided-start"
        }
      }
    });

    setAccountPending(false);

    if (error) {
      setAccountError(error.message || "Neroa could not create the account right now.");
      return;
    }

    const authenticatedEmail = data.user?.email ?? trimmedEmail;
    setIsAuthenticated(Boolean(data.session || data.user));
    setUserEmail(authenticatedEmail);
    setAccountEmail(authenticatedEmail);

    if (!data.session) {
      setNotice("Account created. Confirm your email, then Neroa will bring you back to plan selection.");
      return;
    }

    setNotice("Account created. Choose the plan that should support this build.");
    updateStep("plan");
  }

  async function handleSavePlanSelection() {
    setPlanError(null);
    setNotice(null);

    if (!selectedPlanId) {
      setPlanError("Choose a plan before continuing.");
      return;
    }

    setPlanPending(true);

    try {
      const response = await fetch("/api/account/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          billingInterval
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | { planId?: unknown; message?: unknown }
        | null;

      if (!response.ok) {
        throw new Error(
          typeof payload?.message === "string"
            ? payload.message
            : "Unable to save the selected plan right now."
        );
      }

      const normalizedPlanId = normalizePlanId(payload?.planId) ?? selectedPlanId;
      setSelectedPlanId(normalizedPlanId);
      setNotice(
        typeof payload?.message === "string"
          ? payload.message
          : "Plan saved. Continue into the guided system builder."
      );
      updateStep("entry");
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "Unable to save the selected plan.");
    } finally {
      setPlanPending(false);
    }
  }

  const stepPreparationCopy: Record<WizardStep, string> = {
    account: "Secure account setup and the first saved workspace identity.",
    plan: "Engine Credits, usage guardrails, and the commercial lane for this build.",
    entry: "The right decision path based on whether you know the market or want opportunity guidance.",
    industry: "The industry-specific framework library or a custom market path with the right product recommendations.",
    goal: "A launch path tuned for speed, scale, or validation.",
    opportunity: "Recommended products with monetization logic, difficulty signals, and the best starting framework.",
    product: "The framework, module set, UI density, and pricing gate for the selected product type.",
    experience: "The right scope and interface density for your sophistication level.",
    preference: "How much Neroa should recommend versus how much you want to shape manually.",
    summary: "The final system blueprint, architecture logic, recommended modules, and launch path."
  };

  const nextActionByStep: Record<WizardStep, string> = {
    account: isAuthenticated
      ? "Continue into plan selection."
      : "Create the account so the build can stay attached to one workspace history.",
    plan: "Choose the plan that should support this build.",
    entry: "Tell Neroa whether you already know the market or want opportunities first.",
    industry: "Pick the market this product belongs to or enter a custom industry.",
    goal: "Tell Neroa whether speed, scale, or validation matters most.",
    opportunity: "Choose the most attractive opportunity or use it as a shortcut into product selection.",
    product: "Pick the product system Neroa should assemble.",
    experience: "Choose how guided or advanced the architecture should feel.",
    preference: "Decide whether Neroa should recommend the module set or let you shape it.",
    summary: "Review the system and build the Engine."
  };

  const sidebarPlanValue = selectedPlan
    ? `${selectedPlan.label} (${selectedPlan.capacity.includedExecutionCreditsMonthly?.toLocaleString("en-US") ?? "Custom"} credits)`
    : "Plan not chosen yet";

  return (
    <div className="mx-auto w-full max-w-[1880px]">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_minmax(0,1.9fr)_minmax(360px,1fr)] xl:items-start">
        <aside className="premium-surface rounded-[30px] border border-white/65 p-5 xl:sticky xl:top-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700">
            Guided build
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Decision flow
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Neroa guides this build from market choice to framework, modules, and pricing fit before the Engine is created.
          </p>
          <div className="mt-6 space-y-3">
            {flowSteps.map((item, index) => {
              const meta = stepMeta[item];
              const state =
                step === item
                  ? "active"
                  : index < activeStepIndex && isStepUnlocked(item)
                    ? "completed"
                    : "locked";

              return <StepButton key={item} meta={meta} state={state} onClick={() => handleStepClick(item)} />;
            })}
          </div>
        </aside>

        <main className="space-y-6">
          <section className="premium-surface rounded-[34px] border border-white/70 px-6 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">
                  {stepMeta[step].label}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.4rem]">
                  {stepMeta[step].title}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  {stepMeta[step].description}
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-[28px] border border-slate-200/70 bg-white/82 px-5 py-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] border border-cyan-200/70 bg-[linear-gradient(135deg,rgba(236,254,255,0.95),rgba(238,242,255,0.95))]">
                  <AgentAvatar id="narua" size={36} showLabel={false} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Naroa active
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Building the right system before the wrong scope gets expensive.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {creationError ? (
            <div className="rounded-[24px] border border-rose-200/80 bg-rose-50/90 px-5 py-4 text-sm leading-7 text-rose-700">
              {creationError}
            </div>
          ) : null}
          {notice ? (
            <div className="rounded-[24px] border border-cyan-200/70 bg-cyan-50/90 px-5 py-4 text-sm leading-7 text-cyan-800">
              {notice}
            </div>
          ) : null}

          {step === "account" ? (
            <section className="premium-surface rounded-[34px] border border-white/70 px-6 py-7 sm:px-8 sm:py-9">
              {isAuthenticated ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                  <div className="rounded-[28px] border border-slate-200/70 bg-white/86 p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-200/70 bg-white">
                        <div className="scale-[0.72]">
                          <Logo />
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                          Connected account
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                          {userEmail}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-slate-600">
                      Your account is already ready. Neroa will keep the plan, blueprint, and resulting Engine attached to this workspace history.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="button-primary"
                        onClick={() => updateStep(selectedPlanId ? "entry" : "plan")}
                      >
                        Continue setup
                      </button>
                      <Link href="/auth" className="button-secondary">
                        Account access
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200/70 bg-white/86 p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      What happens next
                    </p>
                    <div className="mt-4 space-y-4">
                      <SidebarMetric label="Current plan" value={selectedPlan?.label ?? "Choose a plan next"} />
                      <SidebarMetric label="Next step" value={selectedPlanId ? "Decision flow" : "Plan selection"} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
                  <form
                    onSubmit={handleCreateAccount}
                    className="rounded-[30px] border border-slate-200/70 bg-white/86 p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-200/70 bg-[linear-gradient(135deg,rgba(236,254,255,0.95),rgba(238,242,255,0.95))]">
                        <div className="scale-[0.72]">
                          <Logo />
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                          New Neroa account
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          Create the account first so the plan, blueprint, and future Engine stay attached to one secure workspace.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-900">Email</span>
                        <input
                          type="email"
                          value={accountEmail}
                          onChange={(event) => setAccountEmail(event.target.value)}
                          className="h-12 rounded-[18px] border border-slate-200/80 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-300"
                          placeholder="you@company.com"
                          autoComplete="email"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-900">Password</span>
                        <input
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="h-12 rounded-[18px] border border-slate-200/80 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-300"
                          placeholder="Create a password"
                          autoComplete="new-password"
                        />
                      </label>
                    </div>
                    {accountError ? (
                      <p className="mt-4 rounded-[18px] border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-700">
                        {accountError}
                      </p>
                    ) : null}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button type="submit" className="button-primary" disabled={accountPending}>
                        {accountPending ? "Creating account..." : "Create account"}
                      </button>
                      <Link href="/auth" className="button-secondary">
                        Sign in to existing account
                      </Link>
                    </div>
                  </form>

                  <div className="rounded-[30px] border border-slate-200/70 bg-white/84 p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Why Neroa starts here
                    </p>
                    <div className="mt-5 space-y-4">
                      <SidebarMetric label="What Neroa just did" value="Reserved the first workspace identity for this build." />
                      <SidebarMetric label="What you decide now" value="Create the account that will own the plan and system blueprint." />
                      <SidebarMetric label="What happens next" value="After account creation, Neroa moves into plan selection instead of an empty dashboard." />
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : null}

          {step === "plan" ? (
            <section className="space-y-6">
              <div className="premium-surface rounded-[34px] border border-white/70 px-6 py-7 sm:px-8 sm:py-9">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-sm leading-7 text-slate-600">
                      Every plan includes Engine Credits. Free activates immediately. Paid plans save locally as the selected commercial path and can connect to billing before launch.
                    </p>
                  </div>
                  <div className="inline-flex rounded-full border border-slate-200/70 bg-white/84 p-1">
                    {publicBillingIntervals.map((interval) => (
                      <button
                        key={interval.id}
                        type="button"
                        onClick={() => setBillingInterval(interval.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          billingInterval === interval.id
                            ? "bg-[linear-gradient(135deg,#0ea5e9,#6366f1)] text-white shadow-[0_14px_30px_-18px_rgba(99,102,241,0.6)]"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {interval.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    billingInterval={billingInterval}
                    selected={selectedPlanId === plan.id}
                    onSelect={() => {
                      setSelectedPlanId(plan.id);
                      setPlanError(null);
                    }}
                  />
                ))}
              </div>

              <div className="premium-surface rounded-[30px] border border-white/70 px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Current selection
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {selectedPlan
                        ? `${selectedPlan.label} ${selectedPlan.id === "free" ? "activates immediately." : "is saved so the system can recommend the right build depth."}`
                        : "Choose a plan to continue."}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {selectedPlan?.id === "free"
                        ? "Free stays hard-capped with one active Engine and a lean usage envelope."
                        : "Stripe can connect later. For now Neroa keeps the paid path visible without blocking local onboarding."}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      {planScopedEstimateSupport}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => updateStep("account")}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="button-primary"
                      onClick={handleSavePlanSelection}
                      disabled={!selectedPlanId || planPending}
                    >
                      {planPending ? "Saving plan..." : "Continue into decision flow"}
                    </button>
                  </div>
                </div>
                {planError ? (
                  <p className="mt-4 rounded-[18px] border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-700">
                    {planError}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          {step === "entry" ? (
            <section className="grid gap-5 lg:grid-cols-2">
              <ChoiceCard
                title="I know my industry"
                description="Start with the market you already understand, then let Neroa shape the strongest product inside it."
                selected={entryMode === "known-industry"}
                badge="Direct path"
                onClick={() => chooseEntryMode("known-industry")}
                footer={
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Fastest if you already know the arena.
                  </p>
                }
              />
              <ChoiceCard
                title="I'm exploring opportunities"
                description="Start from the commercial outcome, then let Neroa recommend attractive industries and product directions."
                selected={entryMode === "exploring"}
                badge="Guided path"
                onClick={() => chooseEntryMode("exploring")}
                footer={
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Best when Neroa should lead the product strategy.
                  </p>
                }
              />
            </section>
          ) : null}

          {step === "industry" ? (
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {industries.map((industry) => (
                  <ChoiceCard
                    key={industry.id}
                    eyebrow="Industry"
                    title={industry.label}
                    description={industry.description}
                    selected={industryId === industry.id}
                    onClick={() => chooseIndustry(industry.id)}
                  />
                ))}
                <ChoiceCard
                  eyebrow="Custom path"
                  title="Not seeing your industry? Enter it manually."
                  description="Save the exact market wording you use, then let Neroa keep shaping the build around the right product type and framework path."
                  selected={industryId === "custom"}
                  badge="Manual"
                  onClick={() => {
                    setIndustryId("custom");
                    setProductTypeId(null);
                    setExperienceLevelId(null);
                    setBuildPreferenceId(null);
                    setSelectedModuleIds([]);
                    setNotice("Tell Neroa your exact industry, then confirm it to continue.");
                  }}
                  footer={
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Best when your market is niche or doesn&apos;t fit the visible list cleanly.
                    </p>
                  }
                />
              </div>

              {industryId === "custom" ? (
                <div className="premium-surface rounded-[30px] border border-white/70 px-6 py-7 sm:px-8">
                  <div className="max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                      Custom industry
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                      Tell Neroa your exact industry
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Use your exact market wording here. Neroa will save it as the custom industry, keep the industry group marked as Custom, and carry it into the blueprint.
                    </p>
                  </div>
                  <div className="mt-6">
                    <GuidedVoiceConfirmField
                      label="Custom industry"
                      value={customIndustry}
                      onChange={setCustomIndustry}
                      onConfirm={confirmCustomIndustry}
                      placeholder="Tell Neroa your exact industry..."
                      helperText="Type it, speak it, or combine both. Confirming saves custom_industry, industry_group, and industry_detail."
                      confirmLabel="Confirm custom industry"
                      required
                    />
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {step === "goal" ? (
            <section className="grid gap-4 lg:grid-cols-3">
              {goals.map((goal) => (
                <ChoiceCard
                  key={goal.id}
                  eyebrow="Business goal"
                  title={goal.label}
                  description={goal.description}
                  selected={goalId === goal.id}
                  onClick={() => chooseGoal(goal.id)}
                />
              ))}
            </section>
          ) : null}

          {step === "opportunity" ? (
            <section className="space-y-6">
              <div className="premium-surface rounded-[28px] border border-white/70 px-6 py-6">
                <p className="text-sm leading-7 text-slate-600">
                  Neroa is recommending the strongest opportunity paths for the goal you chose. Each direction already includes an industry, a monetization shape, and a suggested starting system.
                </p>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {opportunities.map((opportunity) => (
                  <ChoiceCard
                    key={opportunity.id}
                    eyebrow={opportunity.industryId.replace("-", " ")}
                    title={opportunity.label}
                    description={opportunity.whyAttractive}
                    badge={opportunity.difficultyLevel}
                    onClick={() => chooseOpportunity(opportunity.id)}
                    footer={
                      <div className="space-y-2 text-sm leading-6 text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-900">Monetization:</span>{" "}
                          {opportunity.monetizationModel}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Recommended start:</span>{" "}
                          {opportunity.recommendedStartingSystem}
                        </p>
                      </div>
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          {step === "product" ? (
            <section className="space-y-6">
              {selectedIndustryLabel ? (
                <div className="premium-surface rounded-[28px] border border-white/70 px-6 py-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Selected market
                  </p>
                  <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                        {selectedIndustryLabel}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {selectedIndustryDescription}
                      </p>
                    </div>
                    {entryMode === "known-industry" ? (
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => updateStep("industry")}
                      >
                        Change industry
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {productTypes.map((productType) => (
                  <ChoiceCard
                    key={productType.id}
                    eyebrow={productType.buildCategory.replace("-", " ")}
                    title={productType.label}
                    description={productType.description}
                    selected={productTypeId === productType.id}
                    badge="Framework ready"
                    onClick={() => chooseProduct(productType.id)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {step === "experience" ? (
            <section className="grid gap-4 lg:grid-cols-3">
              {experienceLevels.map((experience) => (
                <ChoiceCard
                  key={experience.id}
                  eyebrow="Experience level"
                  title={experience.label}
                  description={experience.description}
                  selected={experienceLevelId === experience.id}
                  onClick={() => chooseExperience(experience.id)}
                />
              ))}
            </section>
          ) : null}

          {step === "preference" ? (
            <section className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                {preferences.map((preference) => (
                  <ChoiceCard
                    key={preference.id}
                    eyebrow="Build preference"
                    title={preference.label}
                    description={preference.description}
                    selected={buildPreferenceId === preference.id}
                    onClick={() => choosePreference(preference.id)}
                  />
                ))}
              </div>

              {buildPreferenceId === "manual-modules" ? (
                <div className="premium-surface rounded-[30px] border border-white/70 px-6 py-7 sm:px-8">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                        Manual module shaping
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                        Choose the modules that belong in the first system
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Neroa still recommends the framework, but you can widen the system manually before the summary is assembled.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="button-primary"
                      onClick={() => updateStep("summary")}
                      disabled={!buildPreferenceId}
                    >
                      Continue to summary
                    </button>
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Recommended expansion modules
                      </p>
                      {manualModuleChoices.expansion.map((module) => {
                        const selected = selectedModuleIds.includes(module.id);
                        return (
                          <button
                            key={module.id}
                            type="button"
                            onClick={() => toggleModule(module.id)}
                            className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                              selected
                                ? "border-cyan-300/34 bg-cyan-50/90"
                                : "border-slate-200/70 bg-white/84 hover:border-cyan-200/60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-semibold text-slate-950">{module.label}</p>
                              <span className="premium-pill border-slate-200/70 bg-white/88 text-slate-600">
                                {selected ? "Included" : "Optional"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{module.whyIncluded}</p>
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Advanced optional modules
                      </p>
                      {manualModuleChoices.optional.map((module) => {
                        const selected = selectedModuleIds.includes(module.id);
                        return (
                          <button
                            key={module.id}
                            type="button"
                            onClick={() => toggleModule(module.id)}
                            className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                              selected
                                ? "border-indigo-300/34 bg-indigo-50/90"
                                : "border-slate-200/70 bg-white/84 hover:border-indigo-200/60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-semibold text-slate-950">{module.label}</p>
                              <span className="premium-pill border-slate-200/70 bg-white/88 text-slate-600">
                                {selected ? "Included" : "Optional"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{module.whatItDoes}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {step === "summary" ? (
            previewBlueprint ? (
              <form action={startGuidedEngineWorkspaceAction} className="space-y-6">
                <input type="hidden" name="entryMode" value={previewBlueprint.entryMode ?? entryMode ?? ""} />
                <input type="hidden" name="industryId" value={previewBlueprint.industryId ?? industryId ?? ""} />
                <input
                  type="hidden"
                  name="customIndustry"
                  value={previewBlueprint.customIndustry ?? customIndustry}
                />
                <input
                  type="hidden"
                  name="custom_industry"
                  value={previewBlueprint.customIndustry ?? customIndustry}
                />
                <input
                  type="hidden"
                  name="industry_group"
                  value={previewBlueprint.industryGroup ?? ""}
                />
                <input
                  type="hidden"
                  name="industry_detail"
                  value={previewBlueprint.industryDetail ?? previewBlueprint.industryLabel ?? ""}
                />
                <input type="hidden" name="goalId" value={previewBlueprint.goalId ?? goalId ?? ""} />
                <input type="hidden" name="productTypeId" value={previewBlueprint.templateIdeaId} />
                <input
                  type="hidden"
                  name="experienceLevelId"
                  value={previewBlueprint.experienceLevelId ?? experienceLevelId ?? ""}
                />
                <input
                  type="hidden"
                  name="buildPreferenceId"
                  value={previewBlueprint.buildPreferenceId ?? buildPreferenceId ?? ""}
                />
                <input type="hidden" name="selectedModuleIds" value={selectedModuleIds.join(",")} />
                <input type="hidden" name="selectedPlanId" value={selectedPlanId ?? ""} />
                <input type="hidden" name="billingInterval" value={billingInterval} />

                <section className="premium-surface rounded-[34px] border border-white/70 px-6 py-7 sm:px-8 sm:py-9">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-4xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                        Mission control summary
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                        {previewBlueprint.selectedTemplateName}
                      </h3>
                      <p className="mt-4 text-base leading-8 text-slate-600">
                        {previewBlueprint.recommendationReason}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white/84 px-5 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Recommended tier
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">
                        {previewBlueprint.recommendedTierLabel}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {previewBlueprint.pricingGateNotice ??
                          "This system fits comfortably inside the currently selected plan."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SidebarMetric label="Industry" value={previewBlueprint.industryLabel ?? "Unknown"} />
                    <SidebarMetric label="Product type" value={selectedProductType?.label ?? previewBlueprint.selectedTemplateName} />
                    <SidebarMetric label="Complexity" value={`${previewBlueprint.complexityLabel ?? "Moderate"} · ${previewBlueprint.executionIntensity ?? "Balanced"}`} />
                    <SidebarMetric label="Variation profile" value={`${previewBlueprint.variationLayoutLabel ?? "Mission control"} / ${previewBlueprint.variationNavigationId ?? "hybrid"}`} />
                  </div>
                </section>

                <section className="premium-surface rounded-[30px] border border-white/70 px-6 py-7 sm:px-8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-4xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                        Scoped execution estimate
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                        Review the plan fit before Neroa creates the Engine
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {previewBlueprint.scopeExecutionNote ?? planScopedEstimateSupport}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white/84 px-5 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Selected plan
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">
                        {previewBlueprint.selectedPlanLabel ?? selectedPlan?.label ?? "Pending"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {previewBlueprint.includedMonthlyEngineCredits
                          ? `${formatCredits(previewBlueprint.includedMonthlyEngineCredits)} Engine Credits each month.`
                          : "Choose a plan to set the monthly Engine Credit pool."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SidebarMetric
                      label="Included monthly Engine Credits"
                      value={
                        previewBlueprint.includedMonthlyEngineCredits
                          ? `${formatCredits(previewBlueprint.includedMonthlyEngineCredits)} credits`
                          : "Pending"
                      }
                    />
                    <SidebarMetric
                      label="Estimated total credits required"
                      value={`${formatCredits(previewBlueprint.estimatedTotalCreditsRequired)} credits`}
                    />
                    <SidebarMetric
                      label="Estimated overage"
                      value={
                        previewBlueprint.estimatedCreditOverage && previewBlueprint.estimatedCreditOverage > 0
                          ? `${formatCredits(previewBlueprint.estimatedCreditOverage)} credits`
                          : "Covered by current monthly pool"
                      }
                    />
                    <SidebarMetric
                      label="Estimated timeline"
                      value={previewBlueprint.estimatedTimeline ?? "Pending"}
                    />
                    <SidebarMetric
                      label="Complexity rating"
                      value={`${previewBlueprint.complexityLabel ?? "Moderate"} / ${previewBlueprint.executionIntensity ?? "Balanced"}`}
                    />
                    <SidebarMetric
                      label="Recommended plan"
                      value={previewBlueprint.recommendedTierLabel ?? "Pending"}
                    />
                    <SidebarMetric
                      label="Recommended credit pack"
                      value={previewBlueprint.recommendedCreditPackLabel ?? "Not needed at this scope"}
                    />
                    <SidebarMetric
                      label="Managed build"
                      value={
                        previewBlueprint.managedBuildRecommendation
                          ? "Available if you want Neroa and the team to accelerate execution."
                          : "Not needed for this scope"
                      }
                    />
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-5 py-4">
                      <p className="text-sm font-semibold text-slate-950">Execution pacing</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {previewBlueprint.estimatedTimelineDetail ??
                          "Neroa will pace the work against the current scope and available monthly credits."}
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/70 bg-white/82 px-5 py-4">
                      <p className="text-sm font-semibold text-slate-950">Acceleration path</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {previewBlueprint.recommendedCreditPackDetail ??
                          "This scope is comfortably paced by the current monthly Engine Credit pool."}
                      </p>
                    </div>
                  </div>

                  {previewBlueprint.creditPoolWarning ? (
                    <p className="mt-6 rounded-[18px] border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800">
                      {previewBlueprint.creditPoolWarning}
                    </p>
                  ) : null}

                  {previewBlueprint.managedBuildRecommendation ? (
                    <div className="mt-6 rounded-[22px] border border-indigo-200/75 bg-[linear-gradient(135deg,rgba(238,242,255,0.94),rgba(224,231,255,0.8))] px-5 py-4">
                      <p className="text-sm font-semibold text-slate-950">Managed Build recommendation</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {previewBlueprint.managedBuildRecommendation}
                      </p>
                    </div>
                  ) : null}
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
                  <div className="space-y-6">
                    <div className="premium-surface rounded-[30px] border border-white/70 px-6 py-7 sm:px-8">
                      <div className="grid gap-5 lg:grid-cols-2">
                        <GuidedVoiceConfirmField
                          name="workingIdeaName"
                          label="Working idea name"
                          value={workingIdeaName}
                          onChange={(nextValue) => {
                            setWorkingIdeaDirty(true);
                            setWorkingIdeaName(nextValue);
                          }}
                          onConfirm={(nextValue) => {
                            setWorkingIdeaDirty(true);
                            setWorkingIdeaName(nextValue);
                          }}
                          placeholder="What should Neroa call this product?"
                          helperText="Use the mic, type, or combine both. Confirming locks the current working idea into the blueprint draft."
                          confirmLabel="Confirm working idea name"
                        />
                        <GuidedVoiceConfirmField
                          name="engineName"
                          label="Engine name"
                          value={engineName}
                          onChange={(nextValue) => {
                            setEngineNameDirty(true);
                            setEngineName(nextValue);
                          }}
                          onConfirm={(nextValue) => {
                            setEngineNameDirty(true);
                            setEngineName(nextValue);
                          }}
                          placeholder="Name the Engine that should be created"
                          helperText="This is the user-facing Engine name that will appear on the Engine Board and inside the workspace."
                          confirmLabel="Confirm engine name"
                          required
                        />
                      </div>
                      <div className="mt-5">
                        <GuidedVoiceConfirmField
                          name="projectSummary"
                          label="System summary"
                          value={projectSummary}
                          onChange={(nextValue) => {
                            setProjectSummaryDirty(true);
                            setProjectSummary(nextValue);
                          }}
                          onConfirm={(nextValue) => {
                            setProjectSummaryDirty(true);
                            setProjectSummary(nextValue);
                          }}
                          placeholder="Give Neroa more context about the system you want built."
                          helperText="Neroa will append spoken context to the existing summary so you can refine the blueprint without losing what is already there."
                          confirmLabel="Confirm system summary"
                          multiline
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <InfoList
                        title="Required modules"
                        items={(previewBlueprint.requiredModuleCards ?? previewBlueprint.featureCards).map(
                          (item) => `${item.label} — ${item.whatItDoes}`
                        )}
                      />
                      <InfoList
                        title="Expansion modules"
                        items={(previewBlueprint.expansionModuleCards ?? []).map(
                          (item) => `${item.label} — ${item.whyIncluded}`
                        )}
                      />
                      <InfoList
                        title="Optional advanced modules"
                        items={(previewBlueprint.optionalModuleCards ?? []).map(
                          (item) => `${item.label} — ${item.whyIncluded}`
                        )}
                      />
                      <InfoList title="Launch path" items={previewBlueprint.buildRoadmap} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="premium-surface rounded-[30px] border border-white/70 px-6 py-7">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                        Framework
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                        {previewBlueprint.recommendedFrameworkLabel}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {previewBlueprint.projectSummary}
                      </p>
                      <div className="mt-6 rounded-[22px] border border-slate-200/70 bg-white/84 px-5 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Recommended app stack
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-950">
                          {previewBlueprint.primaryBuildPathValue}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {previewBlueprint.primaryBuildPathDetail}
                        </p>
                      </div>
                    </div>

                    <div className="premium-surface rounded-[30px] border border-white/70 px-6 py-7">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                        Why this route
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {previewBlueprint.naroaRecommendation}
                      </p>
                      {previewBlueprint.pricingGateNotice ? (
                        <p className="mt-4 rounded-[18px] border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800">
                          {previewBlueprint.pricingGateNotice}
                        </p>
                      ) : null}
                      <div className="mt-6 space-y-4">
                        <SidebarMetric label="Goal" value={previewBlueprint.goalLabel ?? selectedGoal?.label ?? "Unknown"} />
                        <SidebarMetric label="Experience level" value={previewBlueprint.experienceLevelLabel ?? selectedExperienceLevel?.label ?? "Unknown"} />
                        <SidebarMetric label="Build preference" value={previewBlueprint.buildPreferenceLabel ?? selectedBuildPreference?.label ?? "Unknown"} />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="premium-surface rounded-[30px] border border-white/70 px-6 py-6 sm:px-8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Ready to assemble the system?
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Neroa will create the Engine, attach the blueprint metadata, and send you straight into the workspace instead of an empty board.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => updateStep("preference")}
                      >
                        Adjust My Setup
                      </button>
                      <SubmitSystemButton />
                    </div>
                  </div>
                </section>
              </form>
            ) : (
              <div className="premium-surface rounded-[30px] border border-white/70 px-6 py-7 text-sm leading-7 text-slate-600">
                Complete the decision flow first so Neroa can assemble the recommended system.
              </div>
            )
          ) : null}
        </main>

        <aside className="space-y-6 xl:sticky xl:top-28">
          <section className="premium-surface rounded-[30px] border border-white/70 px-6 py-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Guided status
            </p>
            <div className="mt-4 space-y-4">
              <SidebarMetric label="Current step" value={stepMeta[step].title} />
              <SidebarMetric label="What Neroa is preparing" value={stepPreparationCopy[step]} />
              <SidebarMetric label="Next action" value={nextActionByStep[step]} />
              <SidebarMetric label="Current plan" value={sidebarPlanValue} />
              {previewBlueprint ? (
                <>
                  <SidebarMetric
                    label="Recommended framework"
                    value={previewBlueprint.recommendedFrameworkLabel ?? "Pending"}
                  />
                  <SidebarMetric
                    label="Complexity"
                    value={`${previewBlueprint.complexityLabel ?? "Moderate"} · ${previewBlueprint.executionIntensity ?? "Balanced"}`}
                  />
                  <SidebarMetric
                    label="Monthly credits"
                    value={
                      previewBlueprint.includedMonthlyEngineCredits
                        ? `${formatCredits(previewBlueprint.includedMonthlyEngineCredits)} included`
                        : "Pending"
                    }
                  />
                  <SidebarMetric
                    label="Estimated build load"
                    value={`${formatCredits(previewBlueprint.estimatedTotalCreditsRequired)} credits`}
                  />
                  <SidebarMetric
                    label="Overage"
                    value={
                      previewBlueprint.estimatedCreditOverage && previewBlueprint.estimatedCreditOverage > 0
                        ? `${formatCredits(previewBlueprint.estimatedCreditOverage)} credits`
                        : "Covered"
                    }
                  />
                </>
              ) : null}
            </div>
          </section>

          <section className="premium-surface rounded-[30px] border border-white/70 px-6 py-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
              AI coordination
            </p>
            <div className="mt-4 space-y-3">
              {executionRouting.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-slate-200/70 bg-white/84 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                    <span className="premium-pill border-slate-200/70 bg-white/88 text-slate-600">
                      {item.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="premium-surface rounded-[30px] border border-white/70 px-6 py-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
              First-run rules
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <p>Neroa does not drop a new user into a blank Engine Board.</p>
              <p>The account comes first, then plan, then product decisions, then the system summary.</p>
              <p>Once the system is approved, Neroa creates the Engine and moves directly into the workspace.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
