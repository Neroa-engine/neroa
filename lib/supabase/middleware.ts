import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { buildAuthRedirectPath, isProtectedAppPath } from "@/lib/auth/routes";
import {
  ACTIVE_PROJECT_COOKIE,
  ACTIVE_PROJECT_COOKIE_MAX_AGE,
  extractWorkspaceIdFromPathname
} from "@/lib/portal/active-project";
import { getSupabaseEnv } from "@/lib/supabase/env";

function isLiveViewLaunchRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!/^\/workspace\/[^/]+\/project\/[^/]+\/live-view$/.test(pathname)) {
    return false;
  }

  return Boolean(
    request.nextUrl.searchParams.get("sessionId")?.trim() &&
      request.nextUrl.searchParams.get("liveViewToken")?.trim()
  );
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  try {
    const { url, anonKey } = getSupabaseEnv();
    const pathname = request.nextUrl.pathname;

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response.cookies.set({ name, value: "", ...options });
        }
      }
    });

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user && isProtectedAppPath(pathname) && !isLiveViewLaunchRequest(request)) {
      const redirectResponse = NextResponse.redirect(
        new URL(
          buildAuthRedirectPath({
            nextPath: `${request.nextUrl.pathname}${request.nextUrl.search}`
          }),
          request.url
        )
      );
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }

    const workspaceId = extractWorkspaceIdFromPathname(pathname);

    if (workspaceId) {
      response.cookies.set({
        name: ACTIVE_PROJECT_COOKIE,
        value: workspaceId,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: ACTIVE_PROJECT_COOKIE_MAX_AGE
      });
    }
  } catch (error) {
    console.error("SUPABASE_MIDDLEWARE_ERROR", error);
  }

  return response;
}
