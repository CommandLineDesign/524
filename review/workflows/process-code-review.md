# Process Code Review Workflow

## Purpose

Convert a completed code review into actionable work by creating stories for deferred items and executing fixes for actionable issues while maintaining up-to-date status tracking and repository hygiene.

## Workflow Steps

### 1. Collect Review Input

**Purpose:**  
Load the target review and produce a structured issue list with statuses.

**Input:**  
- Path to the review file (e.g., `../reviews/code-review-[n].md`)  
- Allowed statuses from the prompt: `todo`, `in-progress`, `done`, `ignored`, `story`

**Actions:**  
1. Identify the review file to process (explicit input or highest-index review in `../reviews/`).  
2. Parse the `## Prioritized Issues` section; extract severity, status token (`[status:<value>]`), file/line, issue summary, and fix guidance for each bullet.  
3. Build an internal table of issues grouped by status and severity.  
4. Flag any issue whose status is missing or not in the allowed set; normalize missing statuses to `todo`.

**Output:**  
- Structured list of issues with severity, status, file path, summary, and fix notes  
- Confirmation of the review file path used

**Validation:**  
- [ ] Review file exists and is readable  
- [ ] Only allowed statuses are present (or normalized to `todo`)  
- [ ] Every issue has file context, summary, and fix text captured  
- [ ] Severities retained from the review

### 2. Create Stories for `[status:story]` Issues

**Purpose:**  
Move deferred work into the product backlog using the canonical story format.

**Input:**  
- Issues tagged `[status:story]` from Step 1  
- Story format spec: `../formats/story-format.md`  
- Stories directory: `../stories/`

**Actions:**  
1. For each `[status:story]` issue, derive a clear story title from the issue summary; convert to kebab-case for the filename.  
2. Draft the story using the exact template from the Story Format Specification, carrying over relevant context from the issue (problem statement, desired fix/behavior, affected components).  
3. Save the story in `../stories/` with the kebab-case filename matching the title.  
4. Update the review entry to keep status `story` and append a link to the new story file.

**Output:**  
- One new story file per `[status:story]` issue under `../stories/`  
- Review document updated with links for story issues

**Validation:**  
- [ ] Each story follows the story template and validation checklist  
- [ ] Filenames use kebab-case and match story titles  
- [ ] Each story references an epic (placeholder noted if unknown)  
- [ ] Review entries for story items include links to the new files

### 3. Execute Fixes for `[status:todo]` Issues (sequential)

**Purpose:**  
Progress actionable issues to completion while keeping statuses current.

**Input:**  
- Issues tagged `[status:todo]` from Step 1 (defaulted where missing)  
- Codebase context and fix guidance from each issue

**Actions:**  
1. Work one `todo` at a time in listed order.  
2. Before coding, update that issue’s status to `[status:in-progress]`; do not mark any other `todo` in progress simultaneously.  
3. Implement the fix described in the issue’s `Fix` note, inspecting surrounding code to avoid regressions.  
4. Run targeted checks or relevant tests for the affected area when applicable.  
5. After verification, update the same issue to `[status:done]` and note the applied change (brief). If a fix is not applicable, set `[status:ignored]` with rationale.  
6. Proceed to the next `todo` only after finishing the current one.

**Output:**  
- Code changes implementing the required fixes  
- Review document with updated statuses and brief completion notes

**Validation:**  
- [ ] Only one issue is `in-progress` at any time during execution  
- [ ] Each `todo` was advanced to `in-progress` before work and to `done` (or `ignored` with reason) after work  
- [ ] Fixes align with the issue’s requested change  
- [ ] No unresolved `todo` items remain

### 4. Repository Health Checks

**Purpose:**  
Ensure codebase quality after applying fixes and story creation.

**Input:**  
- Project root with package manager and scripts (infer from lockfiles/scripts)

**Actions:**  
1. Detect package manager (prefer pnpm > yarn > npm) and available scripts for lint, format (or format:check), and typecheck.  
2. Run lint, formatting (or formatting check with auto-fix where available), and typecheck; resolve issues iteratively until all pass.  
3. If any check cannot be auto-fixed, document remaining blockers in the review output before completion.

**Output:**  
- Successful lint, formatting, and typecheck runs (or documented blockers)

**Validation:**  
- [ ] Lint passes cleanly  
- [ ] Formatting passes (or was auto-fixed)  
- [ ] Typecheck passes  
- [ ] Any persistent failures are documented with rationale and next steps

## Quality Assurance

- [ ] Follows canonical workflow format structure and section order  
- [ ] References and enforces `../formats/story-format.md` for story creation  
- [ ] Status handling covers `todo`, `in-progress`, `done`, `ignored`, `story` as defined in `../prompts/code-review.md`  
- [ ] Ensures review document is updated to reflect new statuses and story links  
- [ ] Requires lint, format, and typecheck to pass or be explicitly documented

## Success Criteria

- All `[status:story]` issues are converted into properly formatted stories with links in the review  
- All `[status:todo]` issues are driven to `[status:done]` (or `[status:ignored]` with rationale)  
- Review document reflects accurate, final statuses  
- Linting, formatting, and typechecking complete successfully (or documented blockers remain)

## Related Workflows

- [Generate Code Review Workflow](./generate-code-review.md)  
- [Document Processing Workflow](./document-processing.md)  
- [Cross-Reference Validation Workflow](./cross-reference-validation.md)

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference the Format**: Always include this exact statement in prompts:

   ```markdown
   **Workflow Format**: Follow the canonical workflow format defined in [Workflow Format Specification](../formats/workflow-format.md)
   ```

2. **Validate Before Completion**: Run the full validation checklist before considering the workflow finished.  
3. **Use Correct Templates**: Apply the workflow format template for any updates to this file.  
4. **Enforce Section Order**: Maintain exact section order as specified in the format specification.  
5. **Include ALL Required Sections**: Do not omit Purpose, Workflow Steps (with all elements), Quality Assurance, Success Criteria, Related Workflows, and this section.

**FAILURE TO COMPLY**: Workflow updates that do not follow the format specification are invalid and must be corrected.
