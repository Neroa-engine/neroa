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
    | "domain-provider"
    | "dns-provider"
    | "smtp"
    | "stripe"
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
  mobilePlatformTarget?: MobilePlatformChoice | null;
  companionSurface?: MobileCompanionChoice | null;
  paymentsEnabled?: boolean | null;
  accountsEnabled?: boolean | null;
};

function hasFeature(featureCards: EngineExecutionModelInput["featureCards"], featureId: string) {
  return featureCards?.some((item) => item.id === featureId) ?? false;
}

export function getEngineConnectedServices(
  input: EngineExecutionModelInput
): ConnectedService[] {
  const mobile = input.categoryId === "mobile-app";
  const accounts =
    input.accountsEnabled === true || hasFeature(input.featureCards, "auth");
  const payments =
    input.paymentsEnabled === true || hasFeature(input.featureCards, "checkout");
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

  return [
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
  ];
}

export function getExecutionRoutingModel(): OrchestrationRoutingItem[] {
  return [
    {
      id: "narua",
      label: "Naroa",
      badge: "Orchestrator",
      description:
        "Naroa decides which AI system should frame, implement, review, or summarize the work at each stage."
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
      title: "Naroa summary",
      owner: "Naroa",
      description:
        "Naroa reports what changed, what was reviewed, what still needs testing, and the next recommended move."
    }
  ];
}
