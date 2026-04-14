# Supabase Auth Email Branding For Naroa

This repo now sends new signups back through [C:\Users\Administrator\Documents\GitHub\neroa\app\auth\confirm\route.ts](C:\Users\Administrator\Documents\GitHub\neroa\app\auth\confirm\route.ts) and expects the public site origin from `NEXT_PUBLIC_SITE_URL`.

That solves the Naroa-side redirect path, but the sender identity and branded confirmation template still must be configured in the Supabase dashboard.

## Required sender

- From name: `Naroa`
- From email: `admin@neroa.io`
- Subject: `Confirm your Naroa account`

## Required email copy

- Headline: `Confirm your Naroa account`
- Body: `Welcome to Naroa. Confirm your email to finish creating your account and continue setting up your first Engine.`
- Button: `Confirm your email`
- Footer: `You are receiving this email because an account was created for Naroa.`

## Supabase dashboard changes

1. Open Supabase Dashboard -> Authentication -> SMTP Settings.
2. Enable custom SMTP instead of the default Supabase sender.
3. Set the sender name to `Naroa`.
4. Set the sender address to `admin@neroa.io`.
5. Use a real SMTP provider account for `admin@neroa.io` and verify the required SPF, DKIM, and DMARC records for `neroa.io`.

## Supabase template changes

1. Open Supabase Dashboard -> Authentication -> Email Templates.
2. Update the signup confirmation template.
3. Replace generic Supabase wording such as:
   - `Confirm your signup`
   - `Confirm your mail`
   - `powered by Supabase`
4. Set the subject to `Confirm your Naroa account`.
5. Replace the body with Naroa-branded copy using the text above.
6. Keep the confirmation button linked to Supabase's confirmation URL placeholder so the email still resolves through the auth confirmation flow.

## Redirect configuration

1. Set the site URL to your live Naroa origin.
2. Add this redirect URL to Supabase auth allowed redirects:
   - `/auth/confirm`
3. Make sure confirmation redirects are allowed to return to:
   - `/start?step=plan`
4. In local development, set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

## Current repo behavior

- New signup starts on [C:\Users\Administrator\Documents\GitHub\neroa\components\onboarding\guided-start-flow.tsx](C:\Users\Administrator\Documents\GitHub\neroa\components\onboarding\guided-start-flow.tsx)
- Signup confirmation now redirects through [C:\Users\Administrator\Documents\GitHub\neroa\app\auth\confirm\route.ts](C:\Users\Administrator\Documents\GitHub\neroa\app\auth\confirm\route.ts)
- After a successful confirmation, the user is sent back to `/start?step=plan`

## Important limitation

The sender identity cannot be fully fixed in code alone while Supabase is still using the default mail service. If custom SMTP and the Supabase email template are not updated in the dashboard, users will continue to see generic Supabase branding even though the Naroa redirect flow is already wired.
