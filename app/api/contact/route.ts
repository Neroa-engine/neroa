import {
  isContactDeliveryConfigured,
  sendContactEmail
} from "@/lib/contact/send-contact-email";
import { publicContactEmail } from "@/lib/data/public-contact";
import {
  publicInquiryTypeOptions,
  type PublicInquiryType
} from "@/lib/data/public-help";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ContactRequestPayload = {
  inquiryType?: string;
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  currentRoute?: string;
  workspaceId?: string;
  projectId?: string;
  planTier?: string;
};

function isValidInquiryType(value: string | undefined): value is PublicInquiryType {
  return publicInquiryTypeOptions.some((option) => option.value === value);
}

function cleanOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isValidEmail(value: string | null) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

function extractWorkspaceProjectContext(route: string | null) {
  const pathname = route?.split("?")[0] ?? "";
  const match = pathname.match(/^\/workspace\/([^/]+)(?:\/project\/([^/]+))?/);

  return {
    workspaceId: cleanOptionalString(match?.[1] ?? null),
    projectId: cleanOptionalString(match?.[2] ?? null)
  };
}

function getCurrentRoute(request: Request, submittedRoute: string | null) {
  if (submittedRoute) {
    return submittedRoute;
  }

  const referer = request.headers.get("referer");

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return `${refererUrl.pathname}${refererUrl.search}`;
    } catch {
      // Ignore invalid referrers and fall back to the request URL.
    }
  }

  return new URL(request.url).pathname;
}

function getAuthenticatedPlanTier(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
} | null) {
  if (!user) {
    return null;
  }

  const candidates = [
    user.app_metadata?.plan,
    user.app_metadata?.tier,
    user.app_metadata?.subscription_tier,
    user.app_metadata?.subscriptionTier,
    user.user_metadata?.plan,
    user.user_metadata?.tier,
    user.user_metadata?.subscription_tier,
    user.user_metadata?.subscriptionTier
  ];

  for (const candidate of candidates) {
    const value = cleanOptionalString(
      typeof candidate === "string" ? candidate : String(candidate ?? "")
    );

    if (value) {
      return value;
    }
  }

  return null;
}

function getAuthenticatedDisplayName(user: {
  user_metadata?: Record<string, unknown>;
} | null) {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata;

  return (
    cleanOptionalString(typeof metadata?.full_name === "string" ? metadata.full_name : null) ??
    cleanOptionalString(typeof metadata?.name === "string" ? metadata.name : null) ??
    cleanOptionalString(typeof metadata?.display_name === "string" ? metadata.display_name : null) ??
    null
  );
}

export async function POST(request: Request) {
  let body: ContactRequestPayload;

  try {
    body = (await request.json()) as ContactRequestPayload;
  } catch {
    return Response.json({ error: "Invalid request payload." }, { status: 400 });
  }

  if (!isValidInquiryType(body.inquiryType)) {
    return Response.json({ error: "Please choose a valid inquiry type." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const authenticatedAccountEmail = cleanOptionalString(user?.email ?? null);
  const submittedName = cleanOptionalString(body.name) ?? getAuthenticatedDisplayName(user) ?? null;
  const submittedEmail = cleanOptionalString(body.email);
  const replyEmail = submittedEmail ?? authenticatedAccountEmail;
  const message = cleanOptionalString(body.message);
  const currentRoute = getCurrentRoute(request, cleanOptionalString(body.currentRoute));
  const routeContext = extractWorkspaceProjectContext(currentRoute);
  const workspaceId = cleanOptionalString(body.workspaceId) ?? routeContext.workspaceId;
  const projectId = cleanOptionalString(body.projectId) ?? routeContext.projectId;
  const planTier = cleanOptionalString(body.planTier) ?? getAuthenticatedPlanTier(user);

  if (!user && !submittedName) {
    return Response.json({ error: "Please include your name." }, { status: 400 });
  }

  if (!isValidEmail(replyEmail)) {
    return Response.json({ error: "Please include a valid email address." }, { status: 400 });
  }

  if (!message) {
    return Response.json({ error: "Please include a message." }, { status: 400 });
  }

  const inquiryType = body.inquiryType;
  const safeReplyEmail = replyEmail ?? authenticatedAccountEmail ?? "";

  if (!isContactDeliveryConfigured()) {
    return Response.json(
      {
        error:
          "Contact delivery is not configured yet. Add RESEND_API_KEY to enable sending to admin@neroa.io."
      },
      { status: 503 }
    );
  }

  try {
    const delivery = await sendContactEmail({
      inquiryType,
      name: submittedName ?? "Not provided",
      submittedEmail: safeReplyEmail,
      authenticatedAccountEmail,
      authenticatedUserId: cleanOptionalString(user?.id ?? null),
      company: body.company?.trim(),
      workspaceId,
      projectId,
      currentRoute,
      planTier,
      message
    });

    return Response.json({
      status: "received",
      destinationEmail: publicContactEmail,
      inquiryType,
      submittedAt: new Date().toISOString(),
      delivery
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while sending your message.";

    const publicError = message.includes("domain is not verified")
      ? "Contact delivery is wired, but admin@neroa.io cannot send until neroa.io is verified in Resend. Verify the domain in Resend Domains, then try again."
      : message;

    return Response.json(
      {
        error: publicError
      },
      { status: 502 }
    );
  }
}
