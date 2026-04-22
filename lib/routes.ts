export const APP_ROUTES = {
  home: "/",
  auth: "/auth",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  start: "/start",
  startDiy: "/start?entry=diy",
  startManaged: "/start?entry=managed",
  dashboard: "/dashboard",
  projects: "/dashboard",
  profile: "/dashboard",
  settings: "/dashboard",
  billing: "/dashboard",
  usage: "/dashboard",
  roadmap: "/dashboard"
} as const;

export function isPricingPath(pathname: string) {
  return pathname === "/pricing" || pathname.startsWith("/pricing/");
}
