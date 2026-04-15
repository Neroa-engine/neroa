export const liveViewAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002"
] as const;

export type LiveViewStatus = "active" | "complete";
export type LiveViewMode = "guided" | "self";
export type LiveViewSeverity = "critical" | "warning" | "info";
export type LiveViewConnectionStatus = "disconnected" | "connected";
export type LiveViewRuntimeIssueKind =
  | "console-error"
  | "console-warn"
  | "window-error"
  | "unhandled-rejection"
  | "network-failure"
  | "route-error"
  | "hydration-error";

export type LiveViewControlKind =
  | "button"
  | "link"
  | "input"
  | "select"
  | "textarea"
  | "menu"
  | "modal"
  | "section"
  | "other";

export type LiveViewControl = {
  id: string;
  kind: LiveViewControlKind;
  tagName: string;
  text: string;
  label: string | null;
  href: string | null;
  role: string | null;
  type: string | null;
  visible: boolean;
  disabled: boolean;
};

export type LiveViewSection = {
  id: string;
  label: string;
  heading: string | null;
  description: string | null;
};

export type LiveViewRuntimeIssue = {
  id: string;
  kind: LiveViewRuntimeIssueKind;
  message: string;
  source: string | null;
  statusCode: number | null;
  url: string | null;
  createdAt: string;
};

export type LiveViewSnapshot = {
  id: string;
  capturedAt: string;
  trigger: string;
  page: {
    url: string;
    pathname: string;
    title: string;
    hostname: string;
  };
  currentStep: string | null;
  headings: string[];
  visibleText: string[];
  controls: LiveViewControl[];
  sections: LiveViewSection[];
  runtimeIssues: LiveViewRuntimeIssue[];
  metrics: {
    viewportWidth: number;
    viewportHeight: number;
    scrollWidth: number;
    scrollHeight: number;
    horizontalOverflow: boolean;
    modalOpen: boolean;
  };
  screenshotPath: string | null;
};

export type LiveViewActionLog = {
  id: string;
  timestamp: string;
  type: "page-load" | "navigation" | "click" | "submit" | "recording" | "inspection";
  label: string;
  detail: string | null;
  url: string;
};

export type LiveViewFinding = {
  id: string;
  createdAt: string;
  severity: LiveViewSeverity;
  category:
    | "dead-link"
    | "dead-button"
    | "runtime"
    | "layout"
    | "ux"
    | "guardrail"
    | "walkthrough";
  title: string;
  detail: string;
  recommendation: string;
  pageUrl: string;
};

export type LiveViewGuardrail = {
  id: string;
  createdAt: string;
  severity: LiveViewSeverity;
  title: string;
  detail: string;
  recommendation: string;
};

export type LiveViewWalkthroughCheckpoint = {
  id: string;
  label: string;
  description: string;
  status: "pending" | "passed" | "failed";
  matchedPath: string | null;
  updatedAt: string | null;
  notes: string | null;
};

export type LiveViewRecommendation = {
  id: string;
  title: string;
  detail: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type LiveViewReportPage = {
  url: string;
  title: string;
  visitedAt: string;
  findings: number;
  runtimeErrors: number;
};

export type LiveViewReport = {
  startedAt: string;
  updatedAt: string;
  recordingEnabled: boolean;
  inspectedPages: LiveViewReportPage[];
  passed: string[];
  failed: string[];
  confusedFlow: string[];
  guardrails: string[];
  recommendedFixes: string[];
  timeline: Array<{
    timestamp: string;
    label: string;
    url: string;
  }>;
  summary: string;
};

export type LiveViewExtensionConnection = {
  status: LiveViewConnectionStatus;
  boundAt: string | null;
  lastHeartbeatAt: string | null;
  lastSeenOrigin: string | null;
  lastSeenUrl: string | null;
  lastSeenTitle: string | null;
  lastEvent: "bind" | "inspect" | null;
};

export type LiveViewSession = {
  id: string;
  token: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  bridgeOrigin: string;
  allowedOrigins: string[];
  status: LiveViewStatus;
  recordingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  createdByEmail: string | null;
  lastPageUrl: string | null;
  lastPageTitle: string | null;
  currentStep: string | null;
  extensionConnection: LiveViewExtensionConnection;
  walkthrough: LiveViewWalkthroughCheckpoint[];
  recommendations: LiveViewRecommendation[];
  guardrails: LiveViewGuardrail[];
  findings: LiveViewFinding[];
  snapshots: LiveViewSnapshot[];
  actionLogs: LiveViewActionLog[];
  report: LiveViewReport;
};

export type LiveViewInspectPayload = {
  snapshot: Omit<LiveViewSnapshot, "id" | "capturedAt" | "screenshotPath">;
  actionLogs?: LiveViewActionLog[];
  recordingEnabled?: boolean;
  screenshotDataUrl?: string | null;
};

export type LiveViewSessionSummary = Pick<
  LiveViewSession,
  | "id"
  | "workspaceId"
  | "projectId"
  | "projectTitle"
  | "status"
  | "recordingEnabled"
  | "createdAt"
  | "updatedAt"
  | "lastPageUrl"
  | "lastPageTitle"
  | "currentStep"
> & {
  connectionStatus: LiveViewConnectionStatus;
  lastHeartbeatAt: string | null;
  findingsCount: number;
  guardrailsCount: number;
  inspectedPagesCount: number;
  nextAction: LiveViewRecommendation | null;
};

export type LiveViewConnectionPayload = {
  sessionId: string;
  token: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  bridgeOrigin: string;
  allowedOrigins: string[];
};

export type LiveViewBindPayload = {
  tabUrl: string;
  pageTitle: string | null;
  origin: string;
  source: "workspace-page" | "extension-panel" | "inspection";
};

export const liveViewWalkthroughBlueprint: Array<
  Pick<LiveViewWalkthroughCheckpoint, "id" | "label" | "description">
> = [
  {
    id: "homepage-navigation",
    label: "Homepage navigation",
    description: "Start from the homepage and verify the primary navigation and hero flow."
  },
  {
    id: "cta-buttons",
    label: "CTA buttons",
    description: "Confirm primary CTA buttons move into the intended guided paths."
  },
  {
    id: "pricing-tier-buttons",
    label: "Pricing tier buttons",
    description: "Inspect pricing lane buttons and confirm there are no dead pricing actions."
  },
  {
    id: "signup-login",
    label: "Signup / login path",
    description: "Verify sign-in or account entry does not strand the user."
  },
  {
    id: "onboarding-flow",
    label: "Onboarding flow",
    description: "Walk through the guided start flow and confirm the next step is always clear."
  },
  {
    id: "diy-build-path",
    label: "DIY build path",
    description: "Inspect the lower-cost guided build path from landing through build entry."
  },
  {
    id: "managed-build-path",
    label: "Managed build path",
    description: "Inspect the managed path and verify quote/contact actions are clear."
  },
  {
    id: "dashboard-access",
    label: "Dashboard access",
    description: "Confirm the user can reach the dashboard or workspace without dead ends."
  },
  {
    id: "form-inputs",
    label: "Form inputs",
    description: "Check forms, inputs, and submission controls for obvious blockers."
  },
  {
    id: "page-transitions",
    label: "Page transitions",
    description: "Watch route changes and make sure the walkthrough does not get stuck."
  }
];
