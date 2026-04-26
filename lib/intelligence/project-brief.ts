import { z } from "zod";
import {
  domainPackIdSchema,
  projectBriefQuestionStageSchema,
  projectBriefReadinessStageSchema,
  projectBriefSlotIdSchema
} from "./domain-contracts.ts";

const trimmedStringSchema = z.string().trim().min(1);

export const projectBriefOpenQuestionSchema = z
  .object({
    slotId: projectBriefSlotIdSchema,
    label: trimmedStringSchema,
    question: trimmedStringSchema,
    stage: projectBriefQuestionStageSchema,
    whyItMatters: trimmedStringSchema
  })
  .strict();

export type ProjectBriefOpenQuestion = z.infer<
  typeof projectBriefOpenQuestionSchema
>;

export const projectBriefReadinessSchema = z
  .object({
    stage: projectBriefReadinessStageSchema,
    canContinueFocusedQuestions: z.boolean(),
    readyForArchitectureGeneration: z.boolean(),
    readyForRoadmapApproval: z.boolean()
  })
  .strict();

export type ProjectBriefReadiness = z.infer<typeof projectBriefReadinessSchema>;

export const projectBriefSchema = z
  .object({
    founderName: trimmedStringSchema.nullable(),
    projectName: trimmedStringSchema.nullable(),
    domainPack: domainPackIdSchema,
    buyerPersonas: z.array(trimmedStringSchema),
    operatorPersonas: z.array(trimmedStringSchema),
    endCustomerPersonas: z.array(trimmedStringSchema),
    adminPersonas: z.array(trimmedStringSchema),
    productCategory: trimmedStringSchema.nullable(),
    problemStatement: trimmedStringSchema.nullable(),
    outcomePromise: trimmedStringSchema.nullable(),
    mustHaveFeatures: z.array(trimmedStringSchema),
    niceToHaveFeatures: z.array(trimmedStringSchema),
    excludedFeatures: z.array(trimmedStringSchema),
    surfaces: z.array(trimmedStringSchema),
    integrations: z.array(trimmedStringSchema),
    dataSources: z.array(trimmedStringSchema),
    constraints: z.array(trimmedStringSchema),
    complianceFlags: z.array(trimmedStringSchema),
    trustRisks: z.array(trimmedStringSchema),
    readinessScore: z.number().int().min(0).max(100),
    readiness: projectBriefReadinessSchema,
    openQuestions: z.array(projectBriefOpenQuestionSchema),
    missingCriticalSlots: z.array(projectBriefSlotIdSchema),
    assumptionsMade: z.array(trimmedStringSchema)
  })
  .strict();

export type ProjectBrief = z.infer<typeof projectBriefSchema>;

export function loadProjectBrief(value: unknown) {
  const result = projectBriefSchema.safeParse(value);
  return result.success ? result.data : null;
}
