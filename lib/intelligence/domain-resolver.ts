import type { HiddenIntelligenceBundle } from "@/lib/intelligence/adapters";
import type { ConversationSessionState } from "@/lib/intelligence/conversation";
import type { GuidedBuildSession } from "@/lib/onboarding/build-session";
import type { MobileAppWorkspaceBlueprint } from "@/lib/onboarding/mobile-app-intake";
import type { SaasWorkspaceBlueprint } from "@/lib/onboarding/saas-intake";
import {
  collectDomainGeneralizationSignals,
  generalizeDomainIntelligence,
  type DomainGeneralizationResult,
  type OverlayResolutionResult
} from "./domain-generalization.ts";
import { getDomainPack, type DomainPack } from "./domain-packs.ts";
import type { DomainPackId } from "./domain-contracts.ts";

export type DomainResolutionInput = {
  projectName?: string | null;
  projectDescription?: string | null;
  conversationState?: ConversationSessionState | null;
  hiddenBundle?: HiddenIntelligenceBundle | null;
  buildSession?: GuidedBuildSession | null;
  saasIntake?: SaasWorkspaceBlueprint | null;
  mobileAppIntake?: MobileAppWorkspaceBlueprint | null;
  explicitDomainPack?: DomainPackId | null;
};

export type DomainResolutionCandidate = OverlayResolutionResult["candidates"][number];

export type DomainResolution = {
  domainPackId: DomainPackId;
  domainPack: DomainPack;
  confidenceScore: number;
  matchedHints: string[];
  candidates: DomainResolutionCandidate[];
  corpus: string;
  generalization: DomainGeneralizationResult;
};

export function collectDomainResolutionText(args: DomainResolutionInput) {
  return collectDomainGeneralizationSignals(args).corpusParts;
}

export function resolveDomainPack(args: DomainResolutionInput): DomainResolution {
  const generalization = generalizeDomainIntelligence(args);
  const domainPack = getDomainPack(generalization.result.primaryDomainPack);

  return {
    domainPackId: domainPack.id,
    domainPack,
    confidenceScore: generalization.result.overlayConfidence,
    matchedHints: generalization.overlayResolution.matchedHints,
    candidates: generalization.overlayResolution.candidates,
    corpus: generalization.signals.corpus,
    generalization: generalization.result
  };
}
