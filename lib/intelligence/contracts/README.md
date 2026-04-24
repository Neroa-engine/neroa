# Hidden Intelligence Contract Alignment v1

This namespace aligns Neroa's hidden intelligence contracts to the approved Strategy Extraction Framework v1.

What it does:

- maps the hidden extraction state to the approved required truths
- separates universal required truths, conditional required truths, optional enrichments, and derived required truths
- provides internal readiness/data-gate helpers for perceived-project, roadmap, build-definition, lane, and workspace-handoff decisions
- defines hidden output object contracts that future visible replacement passes can rely on

What it does not do:

- it does not change visible `/start` behavior
- it does not replace the live question-selection path
- it does not redesign Strategy Room UI
- it does not wire browser/runtime behavior

How future passes should use it:

1. keep shadow integration read-only and use these contracts as the trusted internal model
2. compare visible `/start` behavior against these aligned hidden gates and outputs first
3. only attempt visible strategist replacement after runtime comparison confirms the hidden model is stable enough

