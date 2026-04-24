import type { BuildCategoryId, BuildTemplateFeature } from "@/lib/onboarding/guided-build";
import type {
  MobileCompanionChoice,
  MobilePlatformChoice
} from "@/lib/onboarding/mobile-app-intake";

export type ConnectedServiceState = "core" | "conditional" | "launch" | "advisory";

export type ConnectedService = {
  id:
    | "github"
    | "supabase"
    | "nextjs"
    | "domain-provider"
    | "dns-provider"
    | "smtp"
    | "resend"
    | "stripe"
    | "posthog"
    | "auth"
    | "database"
    | "cms"
    | "vercel"
    | "expo"
    | "apple-developer"
    | "google-play";
  label: string;
  statusLabel: string;
  state: ConnectedServiceState;
  description: string;
};

export type OrchestrationRoutingItem = {
  id: "narua" | "github" | "codex" | "claude";
  label: string;
  badge: string;
  description: string;
};

export type BuildReviewLoopItem = {
  step: string;
  title: string;
  owner: string;
  description: string;
};

export type EngineExecutionModelInput = {
  categoryId: BuildCategoryId;
  featureCards?: Array<Pick<BuildTemplateFeature, "id">>;
  systemLabels?: string[] | null;
  mobilePlatformTarget?: MobilePlatformChoice | null;
  companionSurface?: MobileCompanionChoice | null;
  paymentsEnabled?: boolean | null;
  accountsEnabled?: boolean | null;
};

function hasFeature(featureCards: EngineExecutionModelInput["featureCards"], featureId: string) {
  return featureCards?.some((item) => item.id === featureId) ?? false;
}

function normalizeSystemLabel(value: string) {
  return value.trim().toLowerCase();
}

function serviceFromSystemLabel(label: string): ConnectedService | null {
  const value = normalizeSystemLabel(label);

  if (value === "github") {
    return {
      id: "github",
      label: "GitHub",
      statusLabel: "Source of truth",
      state: "core",
      description:
        "Stores the repository, pull requests, review history, and implementation trail for this Engine."
    };
  }

  if (value === "supabase") {
    return {
      id: "supabase",
      label: "Supabase",
      statusLabel: "Core backend",
      state: "core",
      description:
        "Handles auth, data, storage, and backend orchestration for the guided build path."
    };
  }

  if (value === "next.js" || value === "nextjs") {
    return {
      id: "nextjs",
      label: "Next.js",
      statusLabel: "App framework",
      state: "core",
      description:
        "Provides the web application shell, routing model, and UI execution surface for this build."
    };
  }

  if (value === "vercel") {
    return {
      id: "vercel",
      label: "Vercel",
      statusLabel: "Deploy path",
      state: "conditional",
      description:
        "Connects the repository to preview and production deployment for the live app experience."
    };
  }

  if (value === "stripe") {
    return {
      id: "stripe",
      label: "Stripe",
      statusLabel: "Commerce enabled",
      state: "conditional",
      description:
        "Handles subscriptions, payments, deposits, and monetization flows when revenue belongs in the build."
    };
  }

  if (value === "resend") {
    return {
      id: "resend",
      label: "Resend",
      statusLabel: "Transactional email",
      state: "conditional",
      description:
        "Supports transactional email delivery for auth flows, notifications, and customer communication."
    };
  }

  if (value === "posthog") {
    return {
      id: "posthog",
      label: "PostHog",
      statusLabel: "Product analytics",
      state: "conditional",
      description:
        "Adds product analytics, event tracking, and growth instrumentation once the MVP starts learning from usage."
    };
  }

  if (value === "auth system" || value === "auth layer" || value === "auth") {
    return {
      id: "auth",
      label: "Auth system",
      statusLabel: "Access control",
      state: "core",
      description:
        "Controls secure user access, roles, sessions, and guarded product flows."
    };
  }

  if (value === "database layer" || value === "database") {
    return {
      id: "database",
      label: "Database layer",
      statusLabel: "Data model",
      state: "core",
      description:
        "Shapes the underlying data model, records, and entity relationships that support the product workflow."
    };
  }

  if (value === "cms" || value === "cms layer") {
    return {
      id: "cms",
      label: "CMS",
      statusLabel: "Content layer",
      state: "conditional",
      description:
        "Adds structured content editing when the product needs managed publishing or content operations."
    };
  }

  if (value === "expo") {
    return {
      id: "expo",
      label: "Expo",
      statusLabel: "Primary mobile path",
      state: "core",
      description:
        "Supports the disciplined React Native + Expo path for real iOS and Android execution."
    };
  }

  if (value === "apple developer") {
    return {
      id: "apple-developer",
      label: "Apple Developer",
      statusLabel: "iOS launch",
      state: "launch",
      description:
        "Required for TestFlight, App Store submission, and production iPhone release work."
    };
  }

  if (value === "google play console" || value === "google play") {
    return {
      id: "google-play",
      label: "Google Play Console",
      statusLabel: "Android launch",
      state: "launch",
      description:
        "Required for internal testing, Play submission, and Android release management."
    };
  }

  return null;
}

function uniqueServices(services: ConnectedService[]) {
  const seen = new Set<string>();

  return services.filter((service) => {
    if (seen.has(service.id)) {
      return false;
    }

    seen.add(service.id);
    return true;
  });
}

export function getEngineConnectedServices(
  input: EngineExecutionModelInput
): ConnectedService[] {
  const explicitServices =
    input.systemLabels
      ?.map((label) => serviceFromSystemLabel(label))
      .filter((service): service is ConnectedService => Boolean(service)) ?? [];
  const mobile = input.categoryId === "mobile-app";
  const accounts =
    input.accountsEnabled === true ||
    hasFeature(input.featureCards, "auth") ||
    explicitServices.some((service) => service.id === "auth" || service.id === "supabase");
  const payments =
    input.paymentsEnabled === true ||
    hasFeature(input.featureCards, "checkout") ||
    explicitServices.some((service) => service.id === "stripe");
  const hasWebCompanion =
    input.companionSurface === "admin-dashboard" ||
    input.companionSurface === "web-companion" ||
    input.companionSurface === "both" ||
    input.categoryId !== "mobile-app";
  const iosLaunch = mobile && (input.mobilePlatformTarget === "iphone" || input.mobilePlatformTarget === "both" || input.mobilePlatformTarget == null);
  const androidLaunch =
    mobile &&
    (input.mobilePlatformTarget === "android" ||
      input.mobilePlatformTarget === "both" ||
      input.mobilePlatformTarget == null);

  return uniqueServices([
    ...explicitServices,
    {
      id: "github",
      label: "GitHub",
      statusLabel: "Source of truth",
      state: "core",
      description:
        "Stores the repository, branches, commits, pull requests, and review history for the Engine."
    },
    {
      id: "supabase",
      label: "Supabase",
      statusLabel: "Core backend",
      state: "core",
      description:
        "Handles auth, data, storage, and backend structure for the guided build path."
    },
    {
      id: "domain-provider",
      label: "GoDaddy / domain provider",
      statusLabel: mobile ? "When launch needs it" : "Launch setup",
      state: mobile ? "conditional" : "launch",
      description:
        "Owns the live domain when the Engine needs a public site, branded URLs, or email-backed flows."
    },
    {
      id: "dns-provider",
      label: "DNS provider",
      statusLabel: mobile ? "When launch needs it" : "Launch setup",
      state: mobile ? "conditional" : "launch",
      description:
        "Connects domains, deployment records, email authentication, and service routing when the build goes live."
    },
    {
      id: "smtp",
      label: "SMTP / email provider",
      statusLabel: accounts ? "Recommended" : "When accounts or email matter",
      state: accounts ? "conditional" : "advisory",
      description:
        "Supports auth emails, transactional messages, and launch communication without relying on generic platform branding."
    },
    {
      id: "stripe",
      label: "Stripe",
      statusLabel: payments ? "Commerce enabled" : "When payments are needed",
      state: payments ? "conditional" : "advisory",
      description:
        "Handles subscriptions, payments, deposits, and monetization flows when revenue belongs in the build."
    },
    {
      id: "vercel",
      label: "Vercel",
      statusLabel: hasWebCompanion ? "Deploy path" : "Optional web companion",
      state: hasWebCompanion ? "conditional" : "advisory",
      description:
        "Connects the repo to web deployment for product surfaces, dashboards, or companion apps."
    },
    {
      id: "expo",
      label: "Expo",
      statusLabel: mobile ? "Primary mobile path" : "Mobile path only",
      state: mobile ? "core" : "advisory",
      description:
        "Supports the disciplined React Native + Expo build path for real iOS and Android execution."
    },
    {
      id: "apple-developer",
      label: "Apple Developer",
      statusLabel: iosLaunch ? "iOS launch" : "Only for iPhone launch",
      state: iosLaunch ? "launch" : "advisory",
      description:
        "Required for TestFlight, iOS distribution, App Store submission, and production mobile release work."
    },
    {
      id: "google-play",
      label: "Google Play Console",
      statusLabel: androidLaunch ? "Android launch" : "Only for Android launch",
      state: androidLaunch ? "launch" : "advisory",
      description:
        "Required for internal testing, beta rollout, Play submission, and Android release management."
    }
  ]);
}

export function getExecutionRoutingModel(): OrchestrationRoutingItem[] {
  return [
    {
      id: "narua",
      label: "Neroa",
      badge: "Orchestrator",
      description:
        "Neroa decides which AI system should frame, implement, review, or summarize the work at each stage."
    },
    {
      id: "github",
      label: "GitHub",
      badge: "Source of truth",
      description:
        "GitHub holds the repository, branches, commits, pull requests, and deployment-linked code history."
    },
    {
      id: "codex",
      label: "Codex",
      badge: "Build pass",
      description:
        "Codex handles implementation, repo edits, bug fixes, test writing, and PR-style build work."
    },
    {
      id: "claude",
      label: "Anthropic / Claude",
      badge: "Review pass",
      description:
        "Claude handles architecture review, long-context reasoning, UX critique, requirements review, and second-pass code review."
    }
  ];
}

export function getBuildReviewLoop(): BuildReviewLoopItem[] {
  return [
    {
      step: "01",
      title: "Build pass",
      owner: "Codex",
      description:
        "One implementation AI moves the feature forward in GitHub with real repo edits, branch work, and code changes."
    },
    {
      step: "02",
      title: "Review pass",
      owner: "Anthropic / Claude",
      description:
        "A second AI reviews the work for bugs, missing requirements, architecture issues, and product risk."
    },
    {
      step: "03",
      title: "Fix pass",
      owner: "Codex",
      description:
        "The implementation AI fixes review findings, tightens the code, and closes the gap between spec and shipped behavior."
    },
    {
      step: "04",
      title: "Neroa summary",
      owner: "Neroa",
      description:
        "Neroa reports what changed, what was reviewed, what still needs testing, and the next recommended move."
    }
  ];
}
