# Generate Bug Analysis Workflow

## Purpose

Standardize how to execute the `../prompts/find-bugs.md` prompt and persist each result as a versioned bug analysis document under `../reviews/` for traceability and reuse. This workflow focuses specifically on automated bug detection and security analysis.

## Workflow Steps

### 1. Prepare Analysis Scope

**Purpose:**
Ensure the repository is up to date and the diff scope matches the requested analysis.

**Input:**

- Current Branch and base branch (`origin/main`)
- Local repository path with git access
- Any reviewer notes or scope constraints from the request

**Actions:**

1. **Fetch Latest Refs**: Run `git fetch origin` to sync remote branches.
2. **Confirm Branches**: Ensure both base and feature branches exist locally (e.g., `git show origin/develop`, `git show origin/feature/x`).
3. **List Modified Files**: Run `git diff --name-only --diff-filter=M <base>...<feature>` to identify files with modifications.
4. **Verify Actual Diffs**: For each file from step 3, run `git diff --quiet <base>...<feature> -- <file>` and keep only files with real diff hunks.

**Output:**

- Up-to-date local refs for the target branches
- Filtered list of files that contain actual diffs to analyze

**Validation:**

- [ ] **Synced Branches**: `git fetch` completed and branches are present locally
- [ ] **Scoped File List**: Files without diff hunks are excluded
- [ ] **Clear Base/Feature**: Base and feature refs used in commands are explicitly recorded

### 2. Execute Bug Analysis Prompt

**Purpose:**
Apply the standardized bug detection and security analysis criteria from `../prompts/find-bugs.md`.

**Input:**

- Filtered file list with real diff hunks from Step 1
- Base and feature refs used for the diff
- Full prompt content from `../prompts/find-bugs.md`

**Actions:**

1. **Load Prompt**: Open and follow `../prompts/find-bugs.md` verbatim as the governing instructions.
2. **Analyze Changed Files**: For each file/hunk, analyze for bugs, security vulnerabilities, and logic errors using `git diff <base>...<feature> -- <file>`.
3. **Capture Findings**: Draft the analysis output in the exact structure the prompt requires:
   - High-Level Summary (risk assessment + analysis scope)
   - Prioritized Issues grouped by severity (Critical, Major, Minor, Enhancement) with status-tagged bullets starting with `[status:<todo|in-progress|done|ignored|story>]` and nested `File` / `Issue` / `Fix`
   - Highlights of positive defensive coding patterns
4. **Scope Discipline**: Only analyze files with actual diff hunks; ignore unchanged files.

**Output:**

- Completed analysis content following the prompt's sections and formatting

**Validation:**

- [ ] **Prompt Fidelity**: All prompt sections are present (High-Level Summary, Prioritized Issues by severity, Highlights)
- [ ] **Issue Formatting**: Status-tagged bullets start with `[status:<value>]` (`todo`, `in-progress`, `done`, `ignored`, `story`) and include nested `File`, `Issue`, and `Fix` per the prompt
- [ ] **Default Status**: New issues use `[status:todo]` unless a different status is explicitly warranted
- [ ] **Scope Accuracy**: No analysis of files without diff hunks
- [ ] **Bug Focus**: Analysis focuses on bugs and security issues, not style or preferences

### 3. Save Bug Analysis Artifact

**Purpose:**
Persist the analysis result in `../reviews/` with an incremented, collision-free filename.

**Input:**

- Completed analysis content from Step 2
- `../reviews/` directory path

**Actions:**

1. **Determine Next Index**: List existing `../reviews/bug-analysis-*` files, extract the highest numeric suffix, and set `index = highest + 1` (use `1` if none exist). Do not reuse indices.
2. **Name the File**: Use `bug-analysis-[index].md` (e.g., `bug-analysis-1.md`, `bug-analysis-2.md`).
3. **Create Document**: Write the analysis content into the new file. Include contextual metadata (date, base ref, feature ref) at the top if available.
4. **Verify Save**: Confirm the file exists and is readable in `../reviews/`.

**Output:**

- New markdown file in `../reviews/` named `bug-analysis-[index].md` containing the analysis content
- Recorded base/feature refs and date (if provided)

**Validation:**

- [ ] **Unique Name**: Filename follows `bug-analysis-[index].md` and increments the highest existing index
- [ ] **Content Present**: Analysis content matches the prompt-required structure
- [ ] **Location Correct**: File resides under `../reviews/`
- [ ] **Metadata Included**: Base/feature refs and date captured when available

## Quality Assurance

**Content Review:**

- [ ] Follows the canonical workflow format structure and section order
- [ ] Instructions explicitly reference and enforce `../prompts/find-bugs.md`
- [ ] Naming convention for analysis artifacts is clear and collision-free

**Process Review:**

- [ ] Each step includes Purpose, Input, Actions, Output, and Validation
- [ ] Diff scope uses explicit base/feature refs
- [ ] Validation checklists cover prompt fidelity, formatting, and storage

## Success Criteria

- Bug analysis executed strictly per `../prompts/find-bugs.md`
- Analysis output saved to `../reviews/bug-analysis-[index].md` with the next available index
- Validation checklists completed without unresolved items

## Related Workflows

- [Generate Code Review Workflow](./generate-code-review.md) - General code review workflow
- [Document Processing Workflow](./document-processing.md) - Additional guidance for handling markdown artifacts
- [Cross-Reference Validation Workflow](./cross-reference-validation.md) - Optional follow-up to ensure links remain accurate

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

## Notes

- If the requester supplies different base/feature refs, substitute them consistently in all commands and metadata.
- Preserve chronological indexing even if earlier analyses are deleted; never overwrite an existing analysis file.
- This workflow focuses exclusively on bug detection and security analysis, complementing the general code review workflow.
