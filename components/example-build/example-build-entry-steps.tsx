import type { Dispatch, SetStateAction } from "react";
import {
  ChoiceGrid,
  GuidedChatLead,
  PromptCard,
  StepShell
} from "@/components/onboarding/real-builder-ui";
import {
  getRealBuilderFrameworkRecommendations,
  isBuildSetupComplete,
  isBusinessDirectionComplete,
  isFrameworkDirectionComplete,
  isProjectDefinitionComplete,
  realBuilderAutomationLevelOptions,
  realBuilderBuildStages,
  realBuilderComplexityOptions,
  realBuilderConceptOptions,
  realBuilderExperienceStyleOptions,
  realBuilderIntegrationOptions,
  realBuilderMonetizationOptions,
  realBuilderPlatformStyleOptions,
  realBuilderPriorityOptions,
  realBuilderSurfaceOptions,
  realBuilderVentureOptions,
  type RealBuilderExecutionPathId,
  type RealBuilderPlan,
  type RealBuilderState,
  type RealBuilderStepId
} from "@/lib/onboarding/real-diy-builder";
import {
  exampleBuildTypes,
  exampleIndustries,
  exampleOpportunityAreas,
  getExampleBuildType,
  type ExampleBuildProject,
  type ExampleFramework
} from "@/lib/marketing/example-build-data";
import { ExampleBuildEntryPlanStep } from "@/components/example-build/example-build-entry-plan-step";

type PersistForRouteArgs = {
  href: string;
  selectedPathId?: RealBuilderExecutionPathId | null;
  selectedPathLabel?: string;
};

type ExampleBuildEntryStepsProps = {
  activeStep: RealBuilderStepId;
  state: RealBuilderState;
  setState: Dispatch<SetStateAction<RealBuilderState>>;
  setActiveStep: Dispatch<SetStateAction<RealBuilderStepId>>;
  frameworkRecommendations: ReturnType<typeof getRealBuilderFrameworkRecommendations>;
  plan: RealBuilderPlan | null;
  referenceProject: ExampleBuildProject | null;
  effectivePath: RealBuilderExecutionPathId | null;
  setSelectedExecutionPath: Dispatch<SetStateAction<RealBuilderExecutionPathId | null>>;
  savedNotice: string | null;
  persistForRoute: (args: PersistForRouteArgs) => void;
};

export function ExampleBuildEntrySteps({
  activeStep,
  state,
  setState,
  setActiveStep,
  frameworkRecommendations,
  plan,
  referenceProject,
  effectivePath,
  setSelectedExecutionPath,
  savedNotice,
  persistForRoute
}: ExampleBuildEntryStepsProps) {
  return (
    <>
            {activeStep === "build-setup" ? (
              <StepShell
                stepNumber={1}
                title="Tell Neroa what you want to simulate"
                summary="The simulation now opens the same way the real builder does: Product Type plus Build Stage, with no chat in Step 1."
              >
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <PromptCard
                      eyebrow="Product type"
                      title="Choose the software lane"
                      description="This is the same root choice used by the real builder. It shapes the later business questions, framework recommendations, and final simulated plan."
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        {exampleBuildTypes.map((type) => {
                          const selected = state.productTypeId === type.id;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() =>
                                setState((current) => ({
                                  ...current,
                                  productTypeId: type.id,
                                  experienceDirection: {
                                    ...current.experienceDirection,
                                    frameworkId: null
                                  }
                                }))
                              }
                              className={`rounded-[24px] border p-5 text-left transition ${
                                selected
                                  ? "border-cyan-300/60 bg-cyan-50/70 shadow-[0_16px_36px_rgba(34,211,238,0.12)]"
                                  : "border-slate-200/75 bg-white/84"
                              }`}
                            >
                              <p className="text-lg font-semibold text-slate-950">{type.label}</p>
                              <p className="mt-3 text-sm leading-7 text-slate-600">
                                {type.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </PromptCard>

                    <PromptCard
                      eyebrow="Build stage"
                      title="Choose the first build depth"
                      description="The simulation uses the same build-depth decision the real builder now uses before chat begins."
                    >
                      <ChoiceGrid
                        items={realBuilderBuildStages}
                        selectedId={state.buildStageId}
                        onSelect={(id) => setState((current) => ({ ...current, buildStageId: id }))}
                      />
                    </PromptCard>
                  </div>

                  <div className="rounded-[28px] border border-slate-200/75 bg-white/84 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                      Simulation setup
                    </p>
                    <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-950">Product Type:</span>{" "}
                        {getExampleBuildType(state.productTypeId ?? "")?.label ?? "Choose one"}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-950">Build Stage:</span>{" "}
                        {realBuilderBuildStages.find((stage) => stage.id === state.buildStageId)?.label ??
                          "Choose one"}
                      </p>
                      <p>
                        Step 1 stays fast and structured so the simulation starts the same way the
                        real builder now does.
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="button-primary"
                        disabled={!isBuildSetupComplete(state)}
                        onClick={() => setActiveStep("business-direction")}
                      >
                        Continue to business direction
                      </button>
                    </div>
                  </div>
                </div>
              </StepShell>
            ) : null}

            {activeStep === "business-direction" ? (
              <StepShell
                stepNumber={2}
                title="Business Direction"
                summary="The simulation now uses the same business-direction stage as the real builder, with Neroa guidance starting here instead of at the front door."
              >
                <div className="space-y-5">
                  <GuidedChatLead
                    eyebrow="Simulated Neroa guidance"
                    title="First, anchor the business direction."
                    message="This mirrors the real builder. The simulation uses the same questions to understand the commercial context before product definition gets narrower."
                    bullets={[
                      "What you are trying to create in practical terms",
                      "Whether the idea is already clear or still opportunity-led",
                      "Which industry or opportunity area should shape the plan",
                      "Whether the first release serves an existing business, a new venture, internal users, customers, or both"
                    ]}
                  />
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="What are you trying to create?"
                    description="Give one or two practical sentences so the simulation can anchor the product direction before it builds a reference plan."
                  >
                    <textarea
                      className="input min-h-[120px]"
                      value={state.businessDirection.businessGoal}
                      onChange={(event) =>
                        setState((current) => ({
                          ...current,
                          businessDirection: {
                            ...current.businessDirection,
                            businessGoal: event.target.value
                          }
                        }))
                      }
                      placeholder="Describe the product or business outcome Neroa should simulate."
                    />
                  </PromptCard>
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="Do you already have a clear concept?"
                    description="The simulation uses the same industry-versus-opportunity logic the real builder now uses."
                  >
                    <ChoiceGrid
                      items={realBuilderConceptOptions}
                      selectedId={state.businessDirection.conceptMode}
                      onSelect={(id) =>
                        setState((current) => ({
                          ...current,
                          businessDirection: {
                            ...current.businessDirection,
                            conceptMode: id,
                            industryId: id === "clear-concept" ? current.businessDirection.industryId : null,
                            opportunityAreaId:
                              id === "exploring-opportunities"
                                ? current.businessDirection.opportunityAreaId
                                : null
                          }
                        }))
                      }
                    />
                  </PromptCard>
                  {state.businessDirection.conceptMode === "clear-concept" ? (
                    <PromptCard
                      eyebrow="Neroa asks"
                      title="Which industry fits this build?"
                      description="Choose the market context the simulation should use when it matches a reference example and framework."
                    >
                      <ChoiceGrid
                        items={exampleIndustries.map((industry) => ({
                          id: industry.id,
                          label: industry.label,
                          description: industry.description
                        }))}
                        selectedId={state.businessDirection.industryId}
                        onSelect={(id) =>
                          setState((current) => ({
                            ...current,
                            businessDirection: {
                              ...current.businessDirection,
                              industryId: id,
                              opportunityAreaId: null
                            }
                          }))
                        }
                      />
                    </PromptCard>
                  ) : null}
                  {state.businessDirection.conceptMode === "exploring-opportunities" ? (
                    <PromptCard
                      eyebrow="Neroa asks"
                      title="Which opportunity area is closest?"
                      description="This gives the simulation enough context to recommend the right system shape later."
                    >
                      <ChoiceGrid
                        items={exampleOpportunityAreas.map((opportunity) => ({
                          id: opportunity.id,
                          label: opportunity.label,
                          description: opportunity.description
                        }))}
                        selectedId={state.businessDirection.opportunityAreaId}
                        onSelect={(id) =>
                          setState((current) => ({
                            ...current,
                            businessDirection: {
                              ...current.businessDirection,
                              opportunityAreaId: id,
                              industryId: null
                            }
                          }))
                        }
                      />
                    </PromptCard>
                  ) : null}
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="Is this for an existing business or a new venture?"
                    description="The simulation uses the same urgency and scope lens as the real builder here."
                  >
                    <ChoiceGrid
                      items={realBuilderVentureOptions}
                      selectedId={state.businessDirection.ventureType}
                      onSelect={(id) =>
                        setState((current) => ({
                          ...current,
                          businessDirection: { ...current.businessDirection, ventureType: id }
                        }))
                      }
                    />
                  </PromptCard>
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="Is the first release customer-facing, internal, or both?"
                    description="This helps the simulation frame the experience direction before framework and path logic appear."
                  >
                    <ChoiceGrid
                      items={realBuilderSurfaceOptions}
                      selectedId={state.businessDirection.surfaceType}
                      onSelect={(id) =>
                        setState((current) => ({
                          ...current,
                          businessDirection: { ...current.businessDirection, surfaceType: id }
                        }))
                      }
                    />
                  </PromptCard>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => setActiveStep("build-setup")}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="button-primary"
                      disabled={!isBusinessDirectionComplete(state)}
                      onClick={() => setActiveStep("project-definition")}
                    >
                      Continue to project definition
                    </button>
                  </div>
                </div>
              </StepShell>
            ) : null}

            {activeStep === "project-definition" ? (
              <StepShell
                stepNumber={3}
                title="Project Definition"
                summary="This uses the same narrowing stage as the real builder so the simulation can shape a serious reference plan instead of a generic example."
              >
                <div className="space-y-5">
                  <GuidedChatLead
                    eyebrow="Simulated Neroa guidance"
                    title="Now narrow the product itself."
                    message="This matches the real builder's second guided stage. Neroa uses these answers to frame the workflow, feature boundary, value model, and likely implementation weight."
                    bullets={[
                      "Who the first release should serve best",
                      "Which workflow must work well from end to end",
                      "Which features belong inside the first build boundary",
                      "How value is created, where integrations matter, and which tradeoff should lead the plan"
                    ]}
                  />
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="Who are the primary users?"
                    description="Name the main people the simulated first release should optimize around."
                  >
                    <textarea
                      className="input min-h-[96px]"
                      value={state.projectDefinition.targetUsers}
                      onChange={(event) =>
                        setState((current) => ({
                          ...current,
                          projectDefinition: {
                            ...current.projectDefinition,
                            targetUsers: event.target.value
                          }
                        }))
                      }
                      placeholder="Founders, operators, managers, customers, members..."
                    />
                  </PromptCard>
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="What is the core workflow?"
                    description="Describe the main workflow the simulated first build needs to handle well."
                  >
                    <textarea
                      className="input min-h-[110px]"
                      value={state.projectDefinition.coreWorkflow}
                      onChange={(event) =>
                        setState((current) => ({
                          ...current,
                          projectDefinition: {
                            ...current.projectDefinition,
                            coreWorkflow: event.target.value
                          }
                        }))
                      }
                      placeholder="What should happen from start to finish for the main user?"
                    />
                  </PromptCard>
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="Which key features belong in the first version?"
                    description="Separate them with commas or new lines so the simulated plan can keep the first-build boundary clear."
                  >
                    <textarea
                      className="input min-h-[110px]"
                      value={state.projectDefinition.keyFeatures.join(", ")}
                      onChange={(event) =>
                        setState((current) => ({
                          ...current,
                          projectDefinition: {
                            ...current.projectDefinition,
                            keyFeatures: event.target.value
                              .split(/[\n,]/)
                              .map((item) => item.trim())
                              .filter(Boolean)
                          }
                        }))
                      }
                      placeholder="Accounts, approvals, reporting, booking flow, admin dashboard..."
                    />
                  </PromptCard>
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="How does this make money or create operational value?"
                    description="Choose the value model the simulated plan should keep in mind."
                  >
                    <ChoiceGrid
                      items={realBuilderMonetizationOptions.map((item) => ({
                        id: item,
                        label: item,
                        description:
                          "Use this if it best matches the first commercial or operational value path."
                      }))}
                      selectedId={state.projectDefinition.monetization}
                      onSelect={(id) =>
                        setState((current) => ({
                          ...current,
                          projectDefinition: { ...current.projectDefinition, monetization: id }
                        }))
                      }
                    />
                  </PromptCard>
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="Which integrations or automations already matter?"
                    description="Select the systems that should influence the simulated scope."
                  >
                    <div className="flex flex-wrap gap-2">
                      {realBuilderIntegrationOptions.map((item) => {
                        const selected = state.projectDefinition.integrationNeeds.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() =>
                              setState((current) => {
                                const includes = current.projectDefinition.integrationNeeds.includes(item);
                                const integrationNeeds =
                                  item === "No major integrations yet"
                                    ? ["No major integrations yet"]
                                    : includes
                                      ? current.projectDefinition.integrationNeeds.filter(
                                          (value) => value !== item
                                        )
                                      : [
                                          ...current.projectDefinition.integrationNeeds.filter(
                                            (value) => value !== "No major integrations yet"
                                          ),
                                          item
                                        ];
                                return {
                                  ...current,
                                  projectDefinition: {
                                    ...current.projectDefinition,
                                    integrationNeeds
                                  }
                                };
                              })
                            }
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                              selected
                                ? "border-cyan-300/55 bg-cyan-50 text-cyan-700"
                                : "border-slate-200/80 bg-white text-slate-600"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </PromptCard>
                  <PromptCard
                    eyebrow="Neroa asks"
                    title="Which tradeoff matters most right now?"
                    description="This helps the simulated plan decide whether to bias speed, budget control, or product depth."
                  >
                    <ChoiceGrid
                      items={realBuilderPriorityOptions}
                      selectedId={state.projectDefinition.priorityTradeoff}
                      onSelect={(id) =>
                        setState((current) => ({
                          ...current,
                          projectDefinition: {
                            ...current.projectDefinition,
                            priorityTradeoff: id
                          }
                        }))
                      }
                    />
                  </PromptCard>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => setActiveStep("business-direction")}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="button-primary"
                      disabled={!isProjectDefinitionComplete(state)}
                      onClick={() => setActiveStep("framework-direction")}
                    >
                      Continue to framework direction
                    </button>
                  </div>
                </div>
              </StepShell>
            ) : null}

            {activeStep === "framework-direction" ? (
              <StepShell
                stepNumber={4}
                title="Framework + Experience Direction"
                summary="This is the same hybrid recommendation step the real builder now uses after business direction and project definition are already clear."
              >
                <div className="space-y-5">
                  <GuidedChatLead
                    eyebrow="Hybrid guidance"
                    title="Turn the definition into a system shape."
                    message="The simulation now uses the same framework and experience stage as the real builder. Neroa recommends the system shape after the earlier answers are already grounded."
                    bullets={[
                      "Recommended framework based on the product and business context",
                      "Experience direction for operational depth versus customer polish",
                      "Platform posture, automation expectations, and likely complexity level"
                    ]}
                  />
                  <PromptCard
                    eyebrow="Recommended frameworks"
                    title="Select the system framework"
                    description="This mirrors the real builder. Framework belongs here, after business direction and project definition are already clear."
                  >
                    <div className="grid gap-3 lg:grid-cols-2">
                      {frameworkRecommendations.frameworks.map((framework) => {
                        const selected = state.experienceDirection.frameworkId === framework.id;
                        const recommended = frameworkRecommendations.recommendedSet.has(framework.id);
                        return (
                          <button
                            key={framework.id}
                            type="button"
                            onClick={() =>
                              setState((current) => ({
                                ...current,
                                experienceDirection: {
                                  ...current.experienceDirection,
                                  frameworkId: framework.id
                                }
                              }))
                            }
                            className={`rounded-[24px] border p-5 text-left transition ${
                              selected
                                ? "border-cyan-300/60 bg-cyan-50/70 shadow-[0_16px_36px_rgba(34,211,238,0.12)]"
                                : "border-slate-200/75 bg-white/84"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-lg font-semibold text-slate-950">{framework.label}</p>
                              {recommended ? (
                                <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                                  Recommended
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                              {framework.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </PromptCard>
                  <PromptCard
                    eyebrow="Experience"
                    title="Choose the experience direction"
                    description="This matches the same experience-direction logic the real builder uses."
                  >
                    <ChoiceGrid
                      items={realBuilderExperienceStyleOptions}
                      selectedId={state.experienceDirection.experienceStyle}
                      onSelect={(id) =>
                        setState((current) => ({
                          ...current,
                          experienceDirection: {
                            ...current.experienceDirection,
                            experienceStyle: id
                          }
                        }))
                      }
                    />
                  </PromptCard>
                  <div className="grid gap-5 lg:grid-cols-3">
                    <PromptCard
                      eyebrow="Platform"
                      title="Platform style"
                      description="Choose the platform posture for the simulated first release."
                    >
                      <ChoiceGrid
                        items={realBuilderPlatformStyleOptions}
                        selectedId={state.experienceDirection.platformStyle}
                        onSelect={(id) =>
                          setState((current) => ({
                            ...current,
                            experienceDirection: {
                              ...current.experienceDirection,
                              platformStyle: id
                            }
                          }))
                        }
                        columns="grid-cols-1"
                      />
                    </PromptCard>
                    <PromptCard
                      eyebrow="Automation"
                      title="Automation needs"
                      description="How strongly should automation shape the simulated plan?"
                    >
                      <ChoiceGrid
                        items={realBuilderAutomationLevelOptions}
                        selectedId={state.experienceDirection.automationLevel}
                        onSelect={(id) =>
                          setState((current) => ({
                            ...current,
                            experienceDirection: {
                              ...current.experienceDirection,
                              automationLevel: id
                            }
                          }))
                        }
                        columns="grid-cols-1"
                      />
                    </PromptCard>
                    <PromptCard
                      eyebrow="Complexity"
                      title="Feature complexity"
                      description="How deep should the simulated first scope already look?"
                    >
                      <ChoiceGrid
                        items={realBuilderComplexityOptions}
                        selectedId={state.experienceDirection.complexityLevel}
                        onSelect={(id) =>
                          setState((current) => ({
                            ...current,
                            experienceDirection: {
                              ...current.experienceDirection,
                              complexityLevel: id
                            }
                          }))
                        }
                        columns="grid-cols-1"
                      />
                    </PromptCard>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => setActiveStep("project-definition")}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="button-primary"
                      disabled={!isFrameworkDirectionComplete(state)}
                      onClick={() => setActiveStep("build-plan")}
                    >
                      Generate simulated build plan
                    </button>
                  </div>
                </div>
              </StepShell>
            ) : null}
            <ExampleBuildEntryPlanStep
              activeStep={activeStep}
              plan={plan}
              referenceProject={referenceProject}
              effectivePath={effectivePath}
              setSelectedExecutionPath={setSelectedExecutionPath}
              savedNotice={savedNotice}
              persistForRoute={persistForRoute}
            />
    </>
  );
}

