# Neroa MVP

Neroa is a clean SaaS MVP built with Next.js, Supabase, and Tailwind CSS. It includes:

- A marketing landing page
- Supabase email authentication
- A protected dashboard
- Workspace creation and detail pages
- A persisted workspace chat interface

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and add your Supabase project values:

   ```bash
   cp .env.example .env.local
   ```

3. Run the SQL in [supabase/schema.sql](./supabase/schema.sql) inside the Supabase SQL editor.

4. Start the app:

   ```bash
   npm run dev
   ```

## Notes

- The dashboard and workspace routes are protected on the server and use Supabase cookies.
- The chat UI stores user messages only for the MVP. It is ready for a follow-up step where assistant responses are generated and saved.
- If Supabase email confirmation is enabled, sign-up returns to the auth page with a notice to check email.
