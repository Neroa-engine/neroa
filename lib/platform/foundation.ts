export type {
  AccessibleWorkspaceRecord,
  PlatformEventSeverity,
  PlatformQueryError,
  PlatformUser,
  RecommendationSummaryPayload,
  ServerSupabaseClient
} from "./foundation-shared";

export { isMissingPlatformTableError } from "./foundation-shared";

export {
  ensurePlatformAccountState,
  ensureWorkspaceTenancyRecords
} from "./foundation-account";

export {
  recordOnboardingDecisionAndBuildSession,
  recordPlatformEvent
} from "./foundation-events";

export {
  getAccessibleWorkspace,
  getCustomerFacingWorkspacePortfolio,
  getAdminOperationsOverview,
  listAccessibleWorkspaces
} from "./foundation-access";
