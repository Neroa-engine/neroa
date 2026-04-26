import { z } from "zod";

export const domainPackIdSchema = z.enum([
  "generic_saas",
  "crypto_analytics",
  "restaurant_sales"
]);

export type DomainPackId = z.infer<typeof domainPackIdSchema>;

export const projectBriefSlotIdSchema = z.enum([
  "founderName",
  "projectName",
  "buyerPersonas",
  "operatorPersonas",
  "endCustomerPersonas",
  "adminPersonas",
  "productCategory",
  "problemStatement",
  "outcomePromise",
  "mustHaveFeatures",
  "niceToHaveFeatures",
  "excludedFeatures",
  "surfaces",
  "integrations",
  "dataSources",
  "constraints",
  "complianceFlags",
  "chainsInScope",
  "walletConnectionMvp",
  "adviceAdjacency",
  "riskSignalSources",
  "launchLocationModel",
  "firstPosConnector",
  "analyticsVsStaffWorkflows",
  "launchReports"
]);

export type ProjectBriefSlotId = z.infer<typeof projectBriefSlotIdSchema>;

export const projectBriefQuestionStageSchema = z.enum([
  "focused_questions",
  "architecture",
  "roadmap"
]);

export type ProjectBriefQuestionStage = z.infer<
  typeof projectBriefQuestionStageSchema
>;

export const projectBriefReadinessStageSchema = z.enum([
  "needs_more_intake",
  "ready_for_focused_questions",
  "ready_for_architecture_generation",
  "ready_for_roadmap_approval"
]);

export type ProjectBriefReadinessStage = z.infer<
  typeof projectBriefReadinessStageSchema
>;

const trimmedStringSchema = z.string().trim().min(1);

export const domainOpenQuestionTemplateSchema = z
  .object({
    slotId: projectBriefSlotIdSchema,
    label: trimmedStringSchema,
    question: trimmedStringSchema,
    stage: projectBriefQuestionStageSchema,
    whyItMatters: trimmedStringSchema
  })
  .strict();

export type DomainOpenQuestionTemplate = z.infer<
  typeof domainOpenQuestionTemplateSchema
>;
