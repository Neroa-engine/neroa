export const APP_ROUTES = {
  home: "/",
  auth: "/auth",
  start: "/start",
  startDiy: "/start?entry=diy",
  startManaged: "/start?entry=managed",
  dashboard: "/dashboard",
  projects: "/projects",
  projectsNew: "/projects/new",
  profile: "/profile",
  settings: "/settings",
  billing: "/billing",
  usage: "/usage",
  roadmap: "/roadmap",
  pricing: "/pricing",
  pricingDiy: "/pricing/diy",
  pricingManaged: "/pricing/managed",
  system: "/system",
  systemAi: "/system/ai"
} as const;

export function isPricingPath(pathname: string) {
  return pathname === APP_ROUTES.pricing || pathname.startsWith(`${APP_ROUTES.pricing}/`);
}
