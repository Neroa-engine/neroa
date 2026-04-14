"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { publicContactEmail } from "@/lib/data/public-contact";
import {
  publicInquiryTypeOptions,
  type PublicInquiryType
} from "@/lib/data/public-help";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PublicContactFormProps = {
  initialInquiryType?: PublicInquiryType;
  currentRoute?: string;
  workspaceId?: string | null;
  projectId?: string | null;
  planTier?: string | null;
};

type FormState = {
  inquiryType: PublicInquiryType;
  name: string;
  email: string;
  company: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type AuthContext = {
  isAuthenticated: boolean;
  accountEmail: string | null;
  userId: string | null;
  suggestedName: string | null;
  planTier: string | null;
};

function buildInitialState(initialInquiryType: PublicInquiryType): FormState {
  return {
    inquiryType: initialInquiryType,
    name: "",
    email: "",
    company: "",
    message: ""
  };
}

function cleanOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getUserDisplayName(user: User | null) {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata;

  return (
    cleanOptionalString(metadata?.full_name) ??
    cleanOptionalString(metadata?.name) ??
    cleanOptionalString(metadata?.display_name) ??
    null
  );
}

function getUserPlanTier(user: User | null) {
  if (!user) {
    return null;
  }

  const metadataCandidates = [
    user.app_metadata?.plan,
    user.app_metadata?.tier,
    user.app_metadata?.subscription_tier,
    user.app_metadata?.subscriptionTier,
    user.user_metadata?.plan,
    user.user_metadata?.tier,
    user.user_metadata?.subscription_tier,
    user.user_metadata?.subscriptionTier
  ];

  for (const candidate of metadataCandidates) {
    const value = cleanOptionalString(
      typeof candidate === "string" ? candidate : String(candidate ?? "")
    );

    if (value) {
      return value;
    }
  }

  return null;
}

function buildCurrentRoute(pathname: string, searchParams: ReturnType<typeof useSearchParams>) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function extractRouteContext(route: string | null) {
  const pathname = route?.split("?")[0] ?? "";
  const match = pathname.match(/^\/workspace\/([^/]+)(?:\/project\/([^/]+))?/);

  return {
    workspaceId: cleanOptionalString(match?.[1] ?? null),
    projectId: cleanOptionalString(match?.[2] ?? null)
  };
}

export function PublicContactForm({
  initialInquiryType = "other",
  currentRoute: currentRouteOverride,
  workspaceId: workspaceIdOverride,
  projectId: projectIdOverride,
  planTier: planTierOverride
}: PublicContactFormProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(buildInitialState(initialInquiryType));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [authContext, setAuthContext] = useState<AuthContext>({
    isAuthenticated: false,
    accountEmail: null,
    userId: null,
    suggestedName: null,
    planTier: null
  });

  const currentRoute = useMemo(
    () => currentRouteOverride ?? buildCurrentRoute(pathname, searchParams),
    [currentRouteOverride, pathname, searchParams]
  );
  const routeContext = useMemo(() => extractRouteContext(currentRoute), [currentRoute]);
  const effectiveWorkspaceId = workspaceIdOverride ?? routeContext.workspaceId;
  const effectiveProjectId = projectIdOverride ?? routeContext.projectId;
  const effectivePlanTier = planTierOverride ?? authContext.planTier;

  const selectedInquiryLabel = useMemo(
    () =>
      publicInquiryTypeOptions.find((option) => option.value === form.inquiryType)?.label ??
      "Inquiry",
    [form.inquiryType]
  );

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    function applyUser(user: User | null) {
      if (!active) {
        return;
      }

      const nextAuthContext: AuthContext = {
        isAuthenticated: Boolean(user),
        accountEmail: cleanOptionalString(user?.email ?? null),
        userId: cleanOptionalString(user?.id ?? null),
        suggestedName: getUserDisplayName(user),
        planTier: getUserPlanTier(user)
      };

      setAuthContext(nextAuthContext);
      setForm((current) => {
        const nextEmail = current.email.trim() || nextAuthContext.accountEmail || "";
        const nextName = current.name.trim() || nextAuthContext.suggestedName || "";

        if (current.email === nextEmail && current.name === nextName) {
          return current;
        }

        return {
          ...current,
          email: nextEmail,
          name: nextName
        };
      });
    }

    async function loadUser() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      applyUser(user);
    }

    void loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  function updateField<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(nextForm: FormState) {
    const nextErrors: FormErrors = {};
    const effectiveEmail = nextForm.email.trim() || authContext.accountEmail || "";

    if (!authContext.isAuthenticated && !nextForm.name.trim()) {
      nextErrors.name = "Please add your name.";
    }

    if (!effectiveEmail) {
      nextErrors.email = "Please add your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(effectiveEmail)) {
      nextErrors.email = "Please use a valid email address.";
    }

    if (!nextForm.message.trim()) {
      nextErrors.message = "Please add a short message so the team knows how to help.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError(null);

    const nextErrors = validate(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          email: form.email.trim() || authContext.accountEmail || "",
          currentRoute,
          workspaceId: effectiveWorkspaceId,
          projectId: effectiveProjectId,
          planTier: effectivePlanTier
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong while sending the request.");
      }

      setSubmitted(true);
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[30px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(139,92,246,0.1))] p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Request received
        </p>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
          Thanks. The Neroa team has your {selectedInquiryLabel.toLowerCase()} request.
        </h3>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          We will follow up through the email you submitted. If you need to send anything directly in the meantime, use{" "}
          <span className="font-medium text-slate-700">{publicContactEmail}</span>. You can also keep exploring the public pages, pricing, and support guidance without leaving the public-site flow.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {authContext.isAuthenticated ? (
        <div className="rounded-[22px] border border-cyan-200/80 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(139,92,246,0.08))] px-4 py-4 text-sm leading-7 text-slate-600">
          Signed in as{" "}
          <span className="font-medium text-slate-950">
            {authContext.accountEmail ?? "your authenticated account"}
          </span>
          . Neroa will attach your account email, user ID, and page context separately with this request.
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-950" htmlFor="inquiryType">
          Inquiry type
        </label>
        <select
          id="inquiryType"
          value={form.inquiryType}
          onChange={(event) =>
            updateField("inquiryType", event.target.value as PublicInquiryType)
          }
          className="input"
        >
          {publicInquiryTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-950" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="input"
            placeholder={authContext.suggestedName ?? "Your name"}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="mt-2 text-sm text-rose-600">{errors.name}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-950" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="input"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
          />
          {authContext.isAuthenticated ? (
            <p className="mt-2 text-xs leading-6 text-slate-500">
              You can edit this reply email if needed. Neroa will still attach the authenticated account email separately for support context.
            </p>
          ) : null}
          {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-950" htmlFor="company">
          Company or project name
        </label>
        <input
          id="company"
          type="text"
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
          className="input"
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-950" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          className="input min-h-[180px] resize-y"
          placeholder="Tell the Neroa team what you need, what page you were on, or what kind of help would be most useful."
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message ? <p className="mt-2 text-sm text-rose-600">{errors.message}</p> : null}
      </div>

      {submissionError ? (
        <div className="rounded-[20px] border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm text-rose-700">
          {submissionError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-7 text-slate-500">
          The form stays inside the public Neroa flow. Neroa also attaches route and workspace context automatically whenever it is available.
        </p>

        <button type="submit" disabled={submitting} className="button-primary whitespace-nowrap">
          {submitting ? "Sending..." : "Send request"}
        </button>
      </div>
    </form>
  );
}
