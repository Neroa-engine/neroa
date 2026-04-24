import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/signup/:path*",
    "/admin/:path*",
    "/billing/:path*",
    "/dashboard/:path*",
    "/jobs/:path*",
    "/profile/:path*",
    "/projects/:path*",
    "/roadmap/:path*",
    "/settings/:path*",
    "/start/:path*",
    "/usage/:path*",
    "/workspace/:path*"
  ]
};
