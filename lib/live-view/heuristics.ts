import { liveViewWalkthroughBlueprint, type LiveViewActionLog, type LiveViewFinding, type LiveViewGuardrail, type LiveViewRecommendation, type LiveViewReport, type LiveViewReportPage, type LiveViewSession, type LiveViewSnapshot, type LiveViewWalkthroughCheckpoint } from "@/lib/live-view/types";

type AnalyzeLiveViewUpdateArgs = {
  session: LiveViewSession;
  snapshot: LiveViewSnapshot;
  actionLogs: LiveViewActionLog[];
};

type AnalyzeLiveViewUpdateResult = {
  currentStep: string | null;
  findings: LiveViewFinding[];
  guardrails: LiveViewGuardrail[];
  recommendations: LiveViewRecommendation[];
  walkthrough: LiveViewWalkthroughCheckpoint[];
  report: LiveViewReport;
};

function uniqueBy<T>(items: T[], keyBuilder: (item: T) => string) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = keyBuilder(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function includesText(values: string[], matcher: RegExp) {
  return values.some((value) => matcher.test(value));
}

function formatControlLabel(snapshot: LiveViewSnapshot, fallback: string) {
  const candidate = snapshot.controls.find((control) => control.text || control.label);
  return candidate?.text || candidate?.label || fallback;
}

function inferCurrentStep(snapshot: LiveViewSnapshot) {
  if (snapshot.currentStep) {
    return snapshot.currentStep;
  }

  const content = [snapshot.page.pathname, ...snapshot.headings, ...snapshot.visibleText].join(" ");

  if (/\/start\b/i.test(snapshot.page.pathname)) {
    if (/product type|what do you want to build/i.test(content)) {
      return "Product type";
    }
    if (/industry|opportunities/i.test(content)) {
      return "Industry";
    }
    if (/framework/i.test(content)) {
      return "Framework";
    }
    if (/summary|recommended path/i.test(content)) {
      return "Summary";
    }
    return "Build intake";
  }

  if (/\/pricing\b/i.test(snapshot.page.pathname)) {
    return "Pricing";
  }

  if (/\/managed-build\b/i.test(snapshot.page.pathname)) {
    return "Managed build";
  }

  if (/\/diy-build\b/i.test(snapshot.page.pathname)) {
    return "DIY build";
  }

  if (/\/dashboard\b|\/workspace\b/i.test(snapshot.page.pathname)) {
    return "Workspace";
  }

  if (/\/auth\b/i.test(snapshot.page.pathname)) {
    return "Sign in";
  }

  if (snapshot.page.pathname === "/") {
    return "Homepage";
  }

  return null;
}

function buildWalkthrough(session: LiveViewSession, snapshot: LiveViewSnapshot, actionLogs: LiveViewActionLog[]) {
  const existing = session.walkthrough.length > 0 ? session.walkthrough : liveViewWalkthroughBlueprint.map((item) => ({
    ...item,
    status: "pending" as const,
    matchedPath: null,
    updatedAt: null,
    notes: null
  }));
  const now = snapshot.capturedAt;
  const controlText = snapshot.controls.map((control) => `${control.text} ${control.label ?? ""}`.trim());
  const uniquePaths = uniqueBy(
    [...session.snapshots.map((item) => item.page.pathname), snapshot.page.pathname].map((pathname) => ({
      pathname
    })),
    (item) => item.pathname
  ).length;

  return existing.map((checkpoint) => {
    let passed = false;
    let notes: string | null = checkpoint.notes;

    switch (checkpoint.id) {
      case "homepage-navigation":
        passed =
          snapshot.page.pathname === "/" &&
          snapshot.controls.filter((control) => control.kind === "link").length >= 3;
        notes = passed ? "Homepage navigation rendered with visible link structure." : notes;
        break;
      case "cta-buttons":
        passed =
          snapshot.page.pathname === "/" &&
          includesText(controlText, /start diy build/i) &&
          includesText(controlText, /managed build|explore managed/i);
        notes = passed ? "Primary CTAs are visible from the homepage." : notes;
        break;
      case "pricing-tier-buttons":
        passed =
          /\/pricing/.test(snapshot.page.pathname) &&
          includesText(controlText, /pricing|start diy build|request managed/i);
        notes = passed ? "Pricing interactions are visible and clickable." : notes;
        break;
      case "signup-login":
        passed =
          /\/auth/.test(snapshot.page.pathname) ||
          includesText(controlText, /sign in|log in|create account|continue with/i);
        notes = passed ? "The auth entry path is reachable." : notes;
        break;
      case "onboarding-flow":
        passed = /\/start/.test(snapshot.page.pathname);
        notes = passed ? `Guided onboarding is active at ${snapshot.page.pathname}.` : notes;
        break;
      case "diy-build-path":
        passed = /\/diy-build|\/pricing\/diy/.test(snapshot.page.pathname);
        notes = passed ? "DIY path surfaced correctly." : notes;
        break;
      case "managed-build-path":
        passed = /\/managed-build|\/pricing\/managed/.test(snapshot.page.pathname);
        notes = passed ? "Managed path surfaced correctly." : notes;
        break;
      case "dashboard-access":
        passed = /\/dashboard|\/workspace/.test(snapshot.page.pathname);
        notes = passed ? "The workspace or dashboard is reachable." : notes;
        break;
      case "form-inputs":
        passed = snapshot.controls.some((control) =>
          control.kind === "input" || control.kind === "select" || control.kind === "textarea"
        );
        notes = passed ? "Input controls are visible in the current page state." : notes;
        break;
      case "page-transitions":
        passed = uniquePaths >= 3 || actionLogs.some((item) => item.type === "navigation");
        notes = passed ? "Route changes are being captured inside the session." : notes;
        break;
      default:
        break;
    }

    if (!passed) {
      return checkpoint;
    }

    return {
      ...checkpoint,
      status: "passed" as const,
      matchedPath: snapshot.page.pathname,
      updatedAt: now,
      notes
    };
  });
}

function buildRuntimeFindings(snapshot: LiveViewSnapshot): LiveViewFinding[] {
  return snapshot.runtimeIssues.map((issue) => ({
    id: `${issue.kind}-${issue.message}-${snapshot.page.pathname}`.toLowerCase(),
    createdAt: snapshot.capturedAt,
    severity:
      issue.kind === "console-warn" ? "warning" : issue.kind === "network-failure" ? "warning" : "critical",
    category: "runtime",
    title:
      issue.kind === "hydration-error"
        ? "Hydration error detected"
        : issue.kind === "route-error"
          ? "Route error detected"
          : issue.kind === "network-failure"
            ? "Failed request detected"
            : issue.kind === "console-warn"
              ? "Console warning surfaced"
              : "Runtime error surfaced",
    detail: issue.message,
    recommendation:
      issue.kind === "network-failure"
        ? "Inspect the failed request and repair the route, API, or environment dependency before continuing the walkthrough."
        : "Resolve the runtime issue before trusting downstream QA results.",
    pageUrl: snapshot.page.url
  }));
}

function buildStructureFindings(snapshot: LiveViewSnapshot): LiveViewFinding[] {
  const findings: LiveViewFinding[] = [];

  snapshot.controls
    .filter(
      (control) =>
        control.kind === "link" &&
        control.visible &&
        (!control.href || control.href === "#" || /^javascript:/i.test(control.href))
    )
    .forEach((control) => {
      findings.push({
        id: `dead-link-${control.id}-${snapshot.page.pathname}`,
        createdAt: snapshot.capturedAt,
        severity: "warning",
        category: "dead-link",
        title: "Dead or missing link destination",
        detail: `${control.text || control.label || "A visible link"} does not point to a real destination.`,
        recommendation: "Give this link a real href or remove it until the destination exists.",
        pageUrl: snapshot.page.url
      });
    });

  snapshot.controls
    .filter(
      (control) =>
        control.kind === "button" &&
        control.visible &&
        control.disabled &&
        /(start|continue|next|submit|launch|request|build)/i.test(`${control.text} ${control.label ?? ""}`)
    )
    .forEach((control) => {
      findings.push({
        id: `dead-button-${control.id}-${snapshot.page.pathname}`,
        createdAt: snapshot.capturedAt,
        severity: "warning",
        category: "dead-button",
        title: "Primary action is blocked",
        detail: `${control.text || control.label || "A primary button"} is disabled in the current state.`,
        recommendation: "Confirm the blocking validation is obvious, or fix the action if it should be available.",
        pageUrl: snapshot.page.url
      });
    });

  if (snapshot.metrics.horizontalOverflow) {
    findings.push({
      id: `overflow-${snapshot.page.pathname}`,
      createdAt: snapshot.capturedAt,
      severity: "warning",
      category: "layout",
      title: "Horizontal overflow detected",
      detail: "The rendered page is wider than the viewport, which often creates clipped or unreachable content.",
      recommendation: "Review responsive sizing, fixed-width elements, and overflow handling on this page.",
      pageUrl: snapshot.page.url
    });
  }

  if (
    snapshot.controls.some((control) => control.kind === "input" || control.kind === "textarea") &&
    !snapshot.controls.some(
      (control) =>
        control.kind === "button" &&
        /(continue|next|submit|save|request|start)/i.test(`${control.text} ${control.label ?? ""}`)
    )
  ) {
    findings.push({
      id: `form-submit-missing-${snapshot.page.pathname}`,
      createdAt: snapshot.capturedAt,
      severity: "warning",
      category: "ux",
      title: "Form inputs do not expose a clear next action",
      detail: "Inputs are visible, but a clear submission or continuation control was not detected.",
      recommendation: "Add an obvious submit or next action so the user does not stall inside the flow.",
      pageUrl: snapshot.page.url
    });
  }

  return findings;
}

function buildGuardrails(snapshot: LiveViewSnapshot): LiveViewGuardrail[] {
  const content = [snapshot.page.title, ...snapshot.headings, ...snapshot.visibleText].join(" ");
  const guardrails: LiveViewGuardrail[] = [];

  if (/marketplace|multi-role|role-based|billing|payments|subscriptions/i.test(content)) {
    guardrails.push({
      id: `guardrail-commercial-${snapshot.page.pathname}`,
      createdAt: snapshot.capturedAt,
      severity: "warning",
      title: "Commercial complexity guardrail",
      detail: "The current flow references billing, subscriptions, or multi-role logic, which usually expands scope quickly.",
      recommendation: "Confirm the project is phased correctly and consider Managed Build if launch speed matters."
    });
  }

  if (/mobile|ios|android|cross-platform/i.test(content) && /marketplace|real-time|automation/i.test(content)) {
    guardrails.push({
      id: `guardrail-mobile-complexity-${snapshot.page.pathname}`,
      createdAt: snapshot.capturedAt,
      severity: "warning",
      title: "Mobile complexity guardrail",
      detail: "This flow combines mobile delivery with advanced product complexity, which raises QA and launch risk.",
      recommendation: "Reduce scope to a phased MVP or move the project into a hybrid or managed path."
    });
  }

  if (/enterprise|erp|industrial|manufacturing|logistics/i.test(content) && /automation|workflow|ops/i.test(content)) {
    guardrails.push({
      id: `guardrail-ops-${snapshot.page.pathname}`,
      createdAt: snapshot.capturedAt,
      severity: "info",
      title: "Operations system guardrail",
      detail: "Operations-heavy systems usually benefit from careful phased rollout and live visibility during QA.",
      recommendation: "Keep the flow inside a constrained MVP and validate the process with live walkthroughs before scaling."
    });
  }

  return guardrails;
}

function buildRecommendations(snapshot: LiveViewSnapshot, findings: LiveViewFinding[], guardrails: LiveViewGuardrail[]): LiveViewRecommendation[] {
  const currentStep = inferCurrentStep(snapshot);

  if (findings.some((finding) => finding.severity === "critical")) {
    return [
      {
        id: `fix-critical-${snapshot.page.pathname}`,
        title: "Repair critical runtime blockers first",
        detail: "This page surfaced a critical error, so the safest next move is to fix the runtime issue before continuing the walkthrough.",
        ctaLabel: null,
        ctaHref: null
      }
    ];
  }

  if (snapshot.page.pathname === "/") {
    return [
      {
        id: "homepage-next-action",
        title: "Choose the next guided path",
        detail: "From the homepage, the clearest next move is to enter the guided build flow or inspect Example Build to watch the system think.",
        ctaLabel: "Start DIY Build",
        ctaHref: "/start"
      }
    ];
  }

  if (/\/pricing/.test(snapshot.page.pathname)) {
    return [
      {
        id: "pricing-next-action",
        title: "Choose the pace that matches the budget",
        detail: "Pricing is healthy when the user can clearly choose between DIY pace, acceleration, or Managed Build without assuming unlimited labor.",
        ctaLabel: "Open DIY Build",
        ctaHref: "/diy-build"
      }
    ];
  }

  if (/\/start/.test(snapshot.page.pathname)) {
    return [
      {
        id: "start-next-action",
        title: "Keep the user in the guided intake",
        detail: currentStep
          ? `The user is currently on ${currentStep}. Keep the next action obvious and avoid jumping them out of the builder.`
          : "Keep the next builder step obvious and avoid dead ends inside intake.",
        ctaLabel: null,
        ctaHref: null
      }
    ];
  }

  if (guardrails.length > 0) {
    return [
      {
        id: `guardrail-next-action-${snapshot.page.pathname}`,
        title: "Review scope guardrails before pushing further",
        detail: "The current page suggests a more complex build. Slow down, confirm the path, and consider a managed or hybrid route if launch speed matters.",
        ctaLabel: "Start Managed Build",
        ctaHref: "/start"
      }
    ];
  }

  return [
    {
      id: `default-next-action-${snapshot.page.pathname}`,
      title: "Continue the guided walkthrough",
      detail: "The current page looks stable enough to keep moving. Watch the next transition and confirm the user stays on the intended path.",
      ctaLabel: null,
      ctaHref: null
    }
  ];
}

function buildReportPages(session: LiveViewSession, snapshot: LiveViewSnapshot) {
  const pages = [...session.report.inspectedPages];
  const existingIndex = pages.findIndex((page) => page.url === snapshot.page.url);
  const runtimeErrors = snapshot.runtimeIssues.filter((issue) => issue.kind !== "console-warn").length;
  const findings = buildRuntimeFindings(snapshot).length + buildStructureFindings(snapshot).length;

  const updatedPage: LiveViewReportPage = {
    url: snapshot.page.url,
    title: snapshot.page.title || "Untitled page",
    visitedAt: snapshot.capturedAt,
    findings,
    runtimeErrors
  };

  if (existingIndex >= 0) {
    pages[existingIndex] = updatedPage;
  } else {
    pages.push(updatedPage);
  }

  return pages;
}

function buildReportSummary(walkthrough: LiveViewWalkthroughCheckpoint[], findings: LiveViewFinding[], guardrails: LiveViewGuardrail[]) {
  const passed = walkthrough.filter((checkpoint) => checkpoint.status === "passed").length;
  const critical = findings.filter((finding) => finding.severity === "critical").length;
  const warnings = findings.filter((finding) => finding.severity === "warning").length;

  return `Neroa inspected ${passed} walkthrough checkpoints, surfaced ${critical} critical issues, ${warnings} warnings, and ${guardrails.length} guardrail signals.`;
}

export function analyzeLiveViewUpdate({
  session,
  snapshot,
  actionLogs
}: AnalyzeLiveViewUpdateArgs): AnalyzeLiveViewUpdateResult {
  const currentStep = inferCurrentStep(snapshot);
  const runtimeFindings = buildRuntimeFindings(snapshot);
  const structureFindings = buildStructureFindings(snapshot);
  const guardrails = buildGuardrails(snapshot);
  const findings = uniqueBy(
    [...session.findings, ...runtimeFindings, ...structureFindings].slice(-240),
    (item) => `${item.category}-${item.title}-${item.pageUrl}`
  );
  const walkthrough = buildWalkthrough(session, snapshot, actionLogs);
  const recommendations = buildRecommendations(snapshot, findings, guardrails);
  const passed = walkthrough
    .filter((checkpoint) => checkpoint.status === "passed")
    .map((checkpoint) => checkpoint.label);
  const failed = findings
    .filter((finding) => finding.severity === "critical")
    .map((finding) => finding.title);
  const confusedFlow = findings
    .filter((finding) => finding.category === "ux" || finding.category === "dead-link")
    .map((finding) => finding.title);
  const recommendedFixes = uniqueBy(
    [...findings.map((finding) => finding.recommendation), ...guardrails.map((guardrail) => guardrail.recommendation)],
    (item) => item
  ).slice(0, 8);

  return {
    currentStep,
    findings,
    guardrails,
    recommendations,
    walkthrough,
    report: {
      startedAt: session.report.startedAt,
      updatedAt: snapshot.capturedAt,
      recordingEnabled: session.recordingEnabled,
      inspectedPages: buildReportPages(session, snapshot),
      passed,
      failed,
      confusedFlow,
      guardrails: guardrails.map((item) => item.title),
      recommendedFixes,
      timeline: [...session.report.timeline, ...actionLogs]
        .map((item) => ({
          timestamp: item.timestamp,
          label: item.label,
          url: item.url
        }))
        .slice(-120),
      summary: buildReportSummary(walkthrough, findings, guardrails)
    }
  };
}

export function createEmptyWalkthrough(): LiveViewWalkthroughCheckpoint[] {
  return liveViewWalkthroughBlueprint.map((item) => ({
    ...item,
    status: "pending",
    matchedPath: null,
    updatedAt: null,
    notes: null
  }));
}

export function createInitialReport(startedAt: string): LiveViewReport {
  return {
    startedAt,
    updatedAt: startedAt,
    recordingEnabled: false,
    inspectedPages: [],
    passed: [],
    failed: [],
    confusedFlow: [],
    guardrails: [],
    recommendedFixes: [],
    timeline: [
      {
        timestamp: startedAt,
        label: "Live View session created",
        url: ""
      }
    ],
    summary: "Neroa is ready to inspect the live app."
  };
}

export function buildLiveViewSessionSummary(session: LiveViewSession) {
  return {
    id: session.id,
    workspaceId: session.workspaceId,
    projectId: session.projectId,
    projectTitle: session.projectTitle,
    status: session.status,
    recordingEnabled: session.recordingEnabled,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    lastPageUrl: session.lastPageUrl,
    lastPageTitle: session.lastPageTitle,
    currentStep: session.currentStep,
    connectionStatus: session.extensionConnection.status,
    lastHeartbeatAt: session.extensionConnection.lastHeartbeatAt,
    findingsCount: session.findings.length,
    guardrailsCount: session.guardrails.length,
    inspectedPagesCount: session.report.inspectedPages.length,
    nextAction: session.recommendations[0] ?? null
  };
}

export function createBootstrapRecommendation(title = "Connect Neroa Live View to the active app"): LiveViewRecommendation {
  return {
    id: "bootstrap-live-view",
    title,
    detail: "Open the Live View page inside the active workspace, then inspect the current runtime target tab to start real-time QA guidance.",
    ctaLabel: null,
    ctaHref: null
  };
}

export function fallbackControlHint(snapshot: LiveViewSnapshot) {
  return formatControlLabel(snapshot, "the next visible control");
}
