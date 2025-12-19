# Improved Local Agent Story Execution Workflow

## Purpose

This workflow provides standardized steps for local AI agents to select, process, and complete user stories from the product backlog. It mirrors the remote GitHub Actions workflow while ensuring continuous execution from story selection through implementation completion in a single session. The workflow ensures proper git configuration, maintains PR visibility throughout implementation, and enforces quality standards before story completion.

## CRITICAL FORMAT REQUIREMENT

**ALL story files MUST follow the canonical story format specification.**

**Format Reference**: Use this exact reference in AI prompts:

```markdown
**Story Format**: Follow the canonical story format defined in [Story Format Specification](../formats/story-format.md)
```

**ENFORCEMENT**: Any story file that does not comply with the format specification is considered invalid and must be corrected before use.

## Workflow Steps

### 1. Environment Setup and Story Selection

**Purpose:**
Validate the local development environment and select the appropriate story from the queue based on priority and status. This step ensures the agent has proper access and tooling before beginning work.

**Input:**

- Local development environment with Node 20+, pnpm installed
- GitHub CLI authenticated (optional but recommended for automated PR creation)
- Clean workspace that builds successfully
- Access to `product/stories-queue.md` for story selection
- Optional story override via command parameter

**Actions:**

1. **Validate Environment**: Run `pnpm install && pnpm -w -r build` to ensure workspace is functional
2. **Verify Git Configuration**: Check git remotes and GitHub CLI setup according to repository requirements
3. **Select Story**: Auto-select first story with `Status: ⏳ Not Started` (excluding `📋 Backlog` stories) from `product/stories-queue.md`, or use provided override
4. **Load Story Content**: Read the selected story file to understand requirements and acceptance criteria
5. **Validate Story Format**: Ensure the story follows the canonical story format specification

**Output:**

- Validated development environment ready for implementation
- Selected story file with confirmed format compliance
- Story requirements and acceptance criteria loaded into working context
- Environment validation report confirming all prerequisites are met

**Validation:**

- [ ] **Environment Check**: Workspace installs and builds without errors
- [ ] **Git Setup**: Remote configuration points to correct repository (origin -> Dopamotiv/Dopamotiv)
- [ ] **GitHub CLI**: Authenticated and configured with proper default repository
- [ ] **Story Selection**: Valid story selected based on status and priority
- [ ] **Format Compliance**: Story file follows canonical format specification exactly

### 2. Repository Synchronization and Branch Creation

**Purpose:**
Synchronize with the latest main branch and create a properly named feature branch for the story implementation. This ensures the implementation starts from the current codebase state and follows naming conventions.

**Input:**

- Selected story with confirmed format compliance from Step 1
- Validated git configuration from Step 1
- Current working directory in project root
- Story epic and title information for branch naming

**Actions:**

1. **Sync Main Branch**: Fetch latest changes and fast-forward main branch to origin/main
2. **Extract Branch Info**: Parse epic slug from story's `**Epic**:` line and title slug from H1 header
3. **Create Feature Branch**: Generate branch name using pattern `feat/<epic-slug>/<title-slug>` (kebab-case, ~60 chars)
4. **Switch to Feature Branch**: Create and checkout the new feature branch based on latest main
5. **Verify Branch State**: Confirm branch is properly created and tracking is configured

**Output:**

- Current main branch synchronized with origin/main
- New feature branch created with proper naming convention
- Working directory switched to feature branch
- Branch tracking configured for push operations

**Validation:**

- [ ] **Main Sync**: Local main branch matches origin/main exactly
- [ ] **Branch Naming**: Feature branch follows `feat/<epic-slug>/<title-slug>` pattern
- [ ] **Branch Creation**: New branch exists and is checked out
- [ ] **Clean State**: Working directory is clean with no uncommitted changes
- [ ] **Tracking Setup**: Branch is configured to push to origin

### 3. Mark Story In Progress and Update Planning

**Purpose:**
Update the story status to in progress and regenerate planning documentation to reflect the current state. This provides visibility into work that has started and maintains accurate project tracking.

**Input:**

- Selected story file from Step 1
- Feature branch created in Step 2
- Access to planning documentation files (`product/stories.md`, `product/stories-queue.md`)
- Story status update requirements

**Actions:**

1. **Update Story Status**: Change story `**Status**` field from `⏳ Not Started` to `📝 In Progress`
2. **Regenerate Stories Overview**: Update `product/stories.md` to reflect current story statuses
3. **Regenerate Queue**: Update `product/stories-queue.md` with new status ordering
4. **Commit Planning Updates**: Create commit with planning documentation changes
5. **Push Planning Updates**: Push the planning update commit to feature branch. For the initial push to a new remote branch, use `git push --no-verify` to skip pre-push hooks (acceptable since planning commits contain only documentation). For subsequent pushes with code changes, use normal `git push` to ensure quality checks run.

**Output:**

- Story file updated with `📝 In Progress` status
- Planning documentation regenerated with current status
- Commit created containing all planning updates
- Planning updates pushed to remote feature branch

**Validation:**

- [ ] **Status Update**: Story status correctly changed to `📝 In Progress`
- [ ] **Stories Overview**: `product/stories.md` reflects updated status
- [ ] **Queue Update**: `product/stories-queue.md` shows correct ordering
- [ ] **Commit Created**: Planning updates committed with descriptive message
- [ ] **Remote Sync**: Planning updates pushed successfully to feature branch

### 4. Create Draft Pull Request

**Purpose:**
Create a draft pull request with comprehensive story details and implementation checklist. This provides early visibility into the work and establishes a tracking mechanism for the implementation progress.

**Input:**

- Feature branch with planning updates from Step 3
- Story content with epic, statement, and acceptance criteria
- GitHub CLI configured for PR creation
- PR template requirements for agent execution

**Actions:**

1. **Prepare PR Content**: Extract epic line, story statement, and acceptance criteria from story file
2. **Generate PR Body**: Create comprehensive PR description including agent execution checklist
3. **Create Draft PR**: Use GitHub CLI to create draft PR with proper base and head configuration
4. **Validate PR Creation**: Confirm PR was created successfully and is accessible
5. **Update PR Tracking**: Record PR URL and number for subsequent operations

**Output:**

- Draft pull request created with comprehensive description
- PR body containing story details and execution checklist
- PR URL and number recorded for tracking
- Early visibility established for implementation work

**Validation:**

- [ ] **PR Creation**: Draft PR successfully created via GitHub CLI
- [ ] **Content Quality**: PR description includes epic, statement, and acceptance criteria
- [ ] **Checklist Included**: Agent execution checklist present in PR body
- [ ] **Draft Status**: PR is marked as draft, not ready for review
- [ ] **Tracking Info**: PR URL and number properly recorded

### 5. Implement Story Requirements

**Purpose:**
Implement all acceptance criteria through iterative development with regular commits and pushes. This is the core implementation phase that must complete all requirements while maintaining PR visibility and code backup.

**Input:**

- Draft PR created in Step 4
- Story acceptance criteria from story file
- Feature branch ready for implementation
- Definition of done requirements

**Actions:**

1. **Analyze Acceptance Criteria**: Break down each criterion into implementable tasks
2. **Implement Iteratively**: Code against each acceptance criterion with focused commits
3. **Push Regularly**: Push commits frequently to maintain PR visibility and backup work
4. **Update Documentation**: Modify relevant documentation as implementation progresses
5. **Run Quality Checks**: Execute local checks (`lint`, `typecheck`, `test`) throughout implementation
6. **Validate Completeness**: Ensure all acceptance criteria are fully implemented

**Output:**

- All acceptance criteria implemented with working code
- Series of commits mapping to specific criteria implementation
- Updated documentation reflecting implementation changes
- All local quality checks passing
- Feature branch with complete implementation pushed to origin

**Validation:**

- [ ] **Criteria Coverage**: Every acceptance criterion has corresponding implementation
- [ ] **Commit Quality**: Commits are focused and map to specific criteria
- [ ] **Regular Pushes**: Implementation commits pushed regularly during development
- [ ] **Documentation Updated**: Relevant docs updated to reflect implementation
- [ ] **Quality Checks**: All local checks (lint, typecheck, test) pass
- [ ] **Functional Validation**: Implementation meets stated acceptance criteria

### 6. Verification and Completion

**Purpose:**
Verify that all definition of done criteria are met and complete the story by updating status and preparing the PR for review. This final step ensures quality standards before marking work complete.

**Input:**

- Complete implementation from Step 5
- All acceptance criteria implemented and tested
- Draft PR with implementation commits
- Definition of done checklist

**Actions:**

1. **Run Complete Validation**: Execute full test suite (`pnpm install && pnpm -w -r build && pnpm -w -r lint && pnpm -w -r typecheck && pnpm -w -r test`)
2. **Update PR Description**: Add criteria-by-criteria verification to PR body
3. **Mark Story Complete**: Update story `**Status**` to `✅ Completed`
4. **Regenerate Planning Docs**: Update planning documentation with completion status
5. **Commit Final Updates**: Create commit with story completion and planning updates
6. **Mark PR Ready**: Convert draft PR to ready for review status

**Output:**

- Story marked as `✅ Completed` with all criteria verified
- Planning documentation updated with completion status
- PR marked as ready for review with complete implementation
- All quality gates passed and verified
- Implementation ready for human review and merge

**Validation:**

- [ ] **All Checks Green**: Complete validation suite passes without errors
- [ ] **PR Verification**: PR description includes criteria-by-criteria verification
- [ ] **Status Complete**: Story status updated to `✅ Completed`
- [ ] **Planning Updated**: All planning docs reflect completion status
- [ ] **PR Ready**: Draft PR converted to ready for review
- [ ] **Quality Assured**: Implementation meets all definition of done criteria

## Quality Assurance

**MANDATORY FORMAT VALIDATION:**

- [ ] **Format Compliance**: Story file MUST follow exact structure from [Story Format Specification](../formats/story-format.md)
- [ ] **Section Order**: Headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Status Indicators**: Status field uses exact emoji and text format
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets

**CRITICAL**: If ANY format validation check fails, the story file MUST be corrected before proceeding.

**Environment Review:**

- [ ] **Git Configuration**: Remotes point to correct repositories
- [ ] **GitHub CLI Setup**: Authenticated with proper repository default
- [ ] **Workspace Validation**: Clean install and build before starting
- [ ] **Branch Naming**: Feature branch follows naming convention

**Implementation Review:**

- [ ] **Acceptance Criteria**: All criteria implemented and verified
- [ ] **Code Quality**: Implementation passes all quality checks
- [ ] **Documentation**: Relevant docs updated appropriately
- [ ] **Commit Quality**: Commits are focused and descriptive

**Process Review:**

- [ ] **Continuous Execution**: Workflow completed in single session
- [ ] **Regular Pushes**: Implementation commits pushed throughout development
- [ ] **Planning Updates**: Story status and planning docs kept current
- [ ] **PR Management**: Draft created early, marked ready when complete

## Success Criteria

**Implementation Completion:**

- All acceptance criteria from story file are fully implemented
- Implementation passes all local quality checks (lint, typecheck, test, build)
- Code is committed and pushed to feature branch
- Documentation is updated to reflect implementation changes

**Process Completion:**

- Story status updated from `⏳ Not Started` through `📝 In Progress` to `✅ Completed`
- Planning documentation regenerated at each status change
- Draft PR created with story details and marked ready for review when complete
- All workflow steps completed in single session without interruption

**Quality Assurance:**

- Story file maintains format compliance throughout workflow
- Feature branch properly named and based on latest main
- Implementation commits provide clear mapping to acceptance criteria
- PR provides comprehensive tracking of implementation progress

## Related Workflows

- [Agent Story Execution](./agent-story-execution.md) - Remote GitHub Actions version of this workflow
- [Create Story](./create-story.md) - Workflow for creating new story files
- [Update Story](./update-story.md) - Workflow for modifying existing story files

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference the Format**: Always include this exact statement in prompts:

   ```markdown
   **Story Format**: Follow the canonical story format defined in [Story Format Specification](../formats/story-format.md)
   ```

2. **Validate Before Completion**: Run through the complete validation checklist before considering the story complete

3. **Use Correct Templates**: Apply the appropriate story template based on source type

4. **Enforce Section Order**: Maintain exact section order as specified in the format specification

5. **Include ALL Required Sections**: Never omit required sections - all must be present and properly filled

**FAILURE TO COMPLY**: Story files that do not follow the format specification are invalid and will require correction.

## Notes

### Execution Contract

- **Non-stop Execution**: The workflow MUST be completed in a single session from story selection through completion
- **Regular Commits**: Push implementation commits frequently during Step 5 to maintain PR visibility and work backup
- **Quality Gates**: All local quality checks must pass before marking story complete
- **Format Compliance**: Story files must maintain format compliance throughout the workflow

### Git Configuration Requirements

The workflow assumes direct work in the organization repository:

```bash
# Required remote configuration
origin          git@github.com:Dopamotiv/Dopamotiv.git (main org repo)
personal-fork   git@github.com:CommandLineDesign/Dopamotiv.git (fallback)

# GitHub CLI configuration
gh repo set-default Dopamotiv/Dopamotiv
gh auth refresh --scopes repo
```

### Common Issues and Solutions

- **"No commits between repositories"**: Use `--head branch-name` syntax, not `--head user:branch-name`
- **Interactive CLI prompts**: Ensure `gh repo set-default` is configured
- **Permission errors**: Verify admin/member status in Dopamotiv organization
- **Non-fast-forward errors**: Fix git remote configuration per requirements

### Commands

```bash
# Process next story from queue
pnpm agent:start-local

# Process specific story
pnpm agent:start-local story-file.md
pnpm agent:start-local "Story Title"

# Complete story (status update only)
pnpm agent:complete-local story-file.md
```

### Blocked Conditions

The agent should only pause execution when truly blocked:

- Missing credentials or third-party keys
- Missing upstream services outside this repository
- Ambiguous specifications after reasonable inference attempts
- CI/infrastructure failures outside repository control

When blocked, explicitly state requirements to proceed; otherwise continue execution.
