import { publicContactEmail } from "@/lib/data/public-contact";
import { publicInquiryTypeOptions } from "@/lib/data/public-help";

export type ContactEmailPayload = {
  inquiryType: string;
  name: string;
  submittedEmail: string;
  authenticatedAccountEmail?: string | null;
  authenticatedUserId?: string | null;
  company?: string;
  workspaceId?: string | null;
  projectId?: string | null;
  currentRoute?: string | null;
  planTier?: string | null;
  message: string;
};

function getInquiryTypeLabel(value: string) {
  return (
    publicInquiryTypeOptions.find((option) => option.value === value)?.label ??
    "General Contact"
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatValue(value?: string | null) {
  return value?.trim() ? value.trim() : "Not provided";
}

function formatWorkspaceProjectId(payload: ContactEmailPayload) {
  const parts = [
    payload.workspaceId?.trim() ? `Workspace: ${payload.workspaceId.trim()}` : null,
    payload.projectId?.trim() ? `Project: ${payload.projectId.trim()}` : null
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : "Not provided";
}

function buildTextBody(payload: ContactEmailPayload) {
  return [
    "New Neroa contact request",
    "",
    `Inquiry type: ${getInquiryTypeLabel(payload.inquiryType)}`,
    `Submitted name: ${formatValue(payload.name)}`,
    `Submitted email: ${formatValue(payload.submittedEmail)}`,
    `Authenticated account email: ${formatValue(payload.authenticatedAccountEmail)}`,
    `Authenticated user ID: ${formatValue(payload.authenticatedUserId)}`,
    `Company or project: ${formatValue(payload.company)}`,
    `Workspace / project ID: ${formatWorkspaceProjectId(payload)}`,
    `Current route: ${formatValue(payload.currentRoute)}`,
    `Plan / tier: ${formatValue(payload.planTier)}`,
    "",
    "Message:",
    payload.message.trim()
  ].join("\n");
}

function buildHtmlBody(payload: ContactEmailPayload) {
  return `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:24px;">
      <div style="max-width:720px;margin:0 auto;background:linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96));border:1px solid rgba(148,163,184,0.18);border-radius:24px;padding:32px;box-shadow:0 24px 70px rgba(15,23,42,0.08);">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0891b2;">Neroa Contact</p>
        <h1 style="margin:0 0 24px;font-size:28px;line-height:1.1;color:#020617;">New public-site inquiry</h1>

        <div style="display:grid;gap:12px;margin-bottom:24px;">
          <div style="padding:16px 18px;border-radius:18px;background:#ffffff;border:1px solid rgba(148,163,184,0.16);">
            <strong>Inquiry type</strong><br />${escapeHtml(getInquiryTypeLabel(payload.inquiryType))}
          </div>
          <div style="padding:16px 18px;border-radius:18px;background:#ffffff;border:1px solid rgba(148,163,184,0.16);">
            <strong>Submitted name</strong><br />${escapeHtml(formatValue(payload.name))}
          </div>
          <div style="padding:16px 18px;border-radius:18px;background:#ffffff;border:1px solid rgba(148,163,184,0.16);">
            <strong>Submitted email</strong><br />${escapeHtml(formatValue(payload.submittedEmail))}
          </div>
          <div style="padding:16px 18px;border-radius:18px;background:#ffffff;border:1px solid rgba(148,163,184,0.16);">
            <strong>Authenticated account email</strong><br />${escapeHtml(formatValue(payload.authenticatedAccountEmail))}
          </div>
          <div style="padding:16px 18px;border-radius:18px;background:#ffffff;border:1px solid rgba(148,163,184,0.16);">
            <strong>Authenticated user ID</strong><br />${escapeHtml(formatValue(payload.authenticatedUserId))}
          </div>
          <div style="padding:16px 18px;border-radius:18px;background:#ffffff;border:1px solid rgba(148,163,184,0.16);">
            <strong>Company or project</strong><br />${escapeHtml(payload.company?.trim() || "Not provided")}
          </div>
          <div style="padding:16px 18px;border-radius:18px;background:#ffffff;border:1px solid rgba(148,163,184,0.16);">
            <strong>Workspace / project ID</strong><br />${escapeHtml(formatWorkspaceProjectId(payload))}
          </div>
          <div style="padding:16px 18px;border-radius:18px;background:#ffffff;border:1px solid rgba(148,163,184,0.16);">
            <strong>Current route</strong><br />${escapeHtml(formatValue(payload.currentRoute))}
          </div>
          <div style="padding:16px 18px;border-radius:18px;background:#ffffff;border:1px solid rgba(148,163,184,0.16);">
            <strong>Plan / tier</strong><br />${escapeHtml(formatValue(payload.planTier))}
          </div>
        </div>

        <div style="padding:20px;border-radius:20px;background:linear-gradient(135deg,rgba(34,211,238,0.08),rgba(139,92,246,0.08));border:1px solid rgba(125,211,252,0.22);">
          <strong style="display:block;margin-bottom:12px;">Message</strong>
          <div style="white-space:pre-wrap;line-height:1.7;color:#334155;">${escapeHtml(payload.message.trim())}</div>
        </div>
      </div>
    </div>
  `;
}

export function isContactDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendContactEmail(payload: ContactEmailPayload) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL || "Neroa <onboarding@resend.dev>";

  if (!resendApiKey) {
    throw new Error("Contact delivery is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [publicContactEmail],
      reply_to: payload.submittedEmail,
      subject: `Neroa ${getInquiryTypeLabel(payload.inquiryType)} inquiry from ${payload.name}`,
      text: buildTextBody(payload),
      html: buildHtmlBody(payload)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Contact delivery failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`
    );
  }

  const data = (await response.json()) as { id?: string };

  return {
    provider: "resend" as const,
    messageId: data.id ?? null,
    to: publicContactEmail
  };
}
