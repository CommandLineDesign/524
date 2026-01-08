# Commit and Push Workflow

## Purpose

This workflow provides a comprehensive process for safely committing and pushing changes to a remote repository, handling merge conflicts, synchronizing with the main branch, and resolving any issues that arise from pre-commit or pre-push hooks. It ensures that changes are properly integrated with the latest codebase and all quality gates pass before the push succeeds.

## CRITICAL FORMAT REQUIREMENT

**ALL workflow files MUST follow the canonical workflow format specification.**

**Format Reference**: Use this exact reference in AI prompts:

```markdown
**Workflow Format**: Follow the canonical workflow format defined in [Workflow Format Specification](../formats/workflow-format.md)
```

**ENFORCEMENT**: Any workflow file that does not comply with the format specification is considered invalid and must be corrected before use.

## Workflow Steps

### 1. Branch Synchronization Check

**Purpose:**
Verify the current branch status and determine if synchronization with origin/main is required to prevent merge conflicts and ensure the branch is up-to-date before committing changes.

**Input:**

- Current working directory with Git repository
- Access to remote origin repository
- Current branch with uncommitted or staged changes

**Actions:**

1. **Fetch Latest Remote State**: Run `git fetch origin` to retrieve the latest remote branch information
2. **Check Branch Status**: Run `git status` to determine if the current branch is behind origin/main
3. **Identify Merge Requirements**: Compare current branch with origin/main using `git log HEAD..origin/main --oneline` to identify commits that need to be merged
4. **Determine Conflict Potential**: Run `git merge-tree $(git merge-base HEAD origin/main) HEAD origin/main` to preview potential merge conflicts

**Output:**

- Updated remote tracking information
- Assessment of branch synchronization status
- List of commits that would be merged from origin/main
- Identification of potential merge conflicts

**Validation:**

- [ ] **Remote Fetched**: Git fetch completes successfully without network errors
- [ ] **Status Assessed**: Current branch status relative to origin/main is determined
- [ ] **Conflicts Identified**: Any potential merge conflicts are identified before merging

### 2. Merge Origin/Main (If Required)

**Purpose:**
Integrate the latest changes from origin/main into the current branch to ensure compatibility and prevent push rejection due to divergent branches.

**Input:**

- Branch synchronization assessment from Step 1
- List of potential merge conflicts from Step 1
- Current branch with local changes (stashed if necessary)

**Actions:**

1. **Stash Local Changes**: Run `git stash` to temporarily store uncommitted changes if any exist
2. **Merge Origin/Main**: Execute `git merge origin/main` to integrate upstream changes
3. **Resolve Merge Conflicts**: If conflicts occur:
   - Identify conflicted files using `git diff --name-only --diff-filter=U`
   - Review each conflicted file and resolve conflicts manually
   - Mark resolved files using `git add <resolved-file>`
   - Continue merge with `git merge --continue`
4. **Pop Stashed Changes**: Run `git stash pop` to restore local changes
5. **Handle Stash Conflicts**: If stash pop creates conflicts, resolve them and add resolved files

**Output:**

- Current branch merged with latest origin/main changes
- All merge conflicts resolved
- Local changes restored and integrated
- Branch ready for committing new changes

**Validation:**

- [ ] **Merge Success**: git merge completes without errors or with all conflicts resolved
- [ ] **No Conflict Markers**: No remaining conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in any files
- [ ] **Stash Applied**: All stashed changes successfully restored
- [ ] **Branch Clean**: git status shows expected state (staged changes or clean working tree)

### 3. Cleanup and Documentation Validation

**Purpose:**
Identify and remove temporary scripts, unnecessary documentation, and ensure all relevant documentation is updated to reflect the code changes being committed. This prevents repository bloat and keeps documentation accurate.

**Input:**

- Merged and synchronized branch from Step 2
- List of modified, added, and untracked files from `git status`
- Git diff showing all changes to be committed

**Actions:**

1. **Identify Temporary Scripts**: Search for temporary or debug scripts that shouldn't be committed:
   - Check for files matching patterns: `*.tmp`, `*.bak`, `test-*.js`, `debug-*.js`, `temp-*`, `check-*.js`, `fix-*.js`
   - Look for one-off scripts in the root directory (e.g., `check-table.js`, `fix-data.mjs`)
   - Identify migration scripts that were for one-time use
   - Review any scripts with names suggesting temporary purpose (e.g., `apply-migration-*.ts`, `fix-*.ts`)
2. **Remove Temporary Files**: Delete identified temporary scripts:
   - Run `rm <temporary-file>` for each identified file
   - Or add to `.gitignore` if the pattern should be permanently ignored
   - Ensure no temporary files remain in the staging area
3. **Check for Unnecessary Documentation**: Identify documentation that shouldn't be added:
   - Look for auto-generated README files that duplicate existing documentation
   - Check for markdown files that repeat information already documented elsewhere
   - Identify documentation files created for debugging or personal notes
   - Review any new `.md` files to ensure they provide unique, necessary value
4. **Remove or Consolidate Redundant Documentation**: Handle unnecessary docs:
   - Delete documentation files that duplicate existing content
   - Merge relevant information into existing documentation rather than creating new files
   - Remove personal notes or debug documentation not intended for the repository
5. **Analyze Code Changes for Documentation Impact**: Review the diff to identify documentation needs:
   - Run `git diff` to see all code changes
   - Identify which features, APIs, or configurations have changed
   - List documentation files that may need updates based on changed code
   - Check for new public APIs, changed function signatures, or modified configurations
6. **Update Relevant Documentation**: Ensure documentation reflects code changes:
   - Update README files if setup or usage instructions have changed
   - Update API documentation if endpoints or parameters have changed
   - Update configuration documentation if environment variables or settings have changed
   - Update inline code comments if complex logic has been modified
   - Ensure examples in documentation still work with the new code
7. **Prevent Documentation Bloat**: Review documentation changes for quality:
   - Ensure new documentation doesn't repeat existing content
   - Consolidate related documentation into existing files rather than creating new ones
   - Remove outdated sections that no longer apply
   - Keep documentation concise and focused on essential information

**Output:**

- All temporary scripts removed from working directory
- Unnecessary documentation files removed or consolidated
- Relevant documentation updated to reflect code changes
- Clean set of files ready for staging
- Documentation that is accurate, concise, and non-redundant

**Validation:**

- [ ] **No Temporary Scripts**: No temporary, debug, or one-off scripts are present in staging
- [ ] **No Redundant Docs**: No documentation files that duplicate existing content
- [ ] **Documentation Updated**: All documentation affected by code changes has been updated
- [ ] **No Stale Docs**: No documentation references outdated code, APIs, or configurations
- [ ] **Concise Documentation**: Documentation is focused and doesn't contain unnecessary repetition
- [ ] **Examples Valid**: Any code examples in documentation work with the current codebase

### 4. Stage and Analyze Changes

**Purpose:**
Stage all intended changes and analyze the diff to generate a meaningful, descriptive commit message that accurately represents the modifications being committed.

**Input:**

- Cleaned working directory from Step 3
- Validated documentation from Step 3
- Unstaged or staged changes to be committed
- Git repository history for commit message style reference

**Actions:**

1. **Review Current Status**: Run `git status` to see all modified, added, and deleted files
2. **Verify Cleanup Complete**: Confirm no temporary files or redundant documentation remain
3. **Stage Changes**: Run `git add <files>` or `git add -A` to stage intended changes
4. **Analyze Staged Diff**: Execute `git diff --staged` to review all changes being committed
5. **Review Commit History**: Run `git log --oneline -10` to understand existing commit message conventions
6. **Generate Commit Message**: Based on the diff analysis:
   - Identify the type of change (feat, fix, refactor, docs, chore, etc.)
   - Summarize the primary purpose of the changes
   - Note any breaking changes or important details
   - Format message following repository conventions

**Output:**

- All intended changes staged for commit
- Comprehensive understanding of changes being committed
- Draft commit message that accurately describes the changes
- Awareness of commit message conventions used in repository

**Validation:**

- [ ] **Changes Staged**: All intended files are staged (verify with git status)
- [ ] **No Unintended Files**: No files are staged that shouldn't be committed
- [ ] **No Temporary Files**: Staging area contains no temporary scripts or debug files
- [ ] **Documentation Validated**: All documentation changes are appropriate and non-redundant
- [ ] **Diff Reviewed**: All staged changes have been reviewed and understood
- [ ] **Message Prepared**: Commit message accurately summarizes all changes

### 5. Cross-Package Type Validation and Build Simulation

**Purpose:**
Run both the typecheck (matching GitHub Actions CI) and build simulation (matching Vercel deployment) to catch all errors before pushing. This two-step validation ensures compatibility with both CI pipelines:
1. `pnpm typecheck` - matches GitHub Actions CI typecheck job
2. Sequential package builds - matches Vercel's `vercel-build` process

The build step catches additional errors like missing dependencies that typecheck alone might miss due to pnpm hoisting.

**Input:**

- Staged changes from Step 4
- All package source files in the monorepo
- TypeScript configurations for each package
- Package.json files with dependency declarations

**Actions:**

1. **Install Dependencies**: Ensure all dependencies are installed with `pnpm install`
2. **Run Monorepo Typecheck**: Execute `pnpm typecheck` to run TypeScript validation across all packages (matches GitHub Actions CI)
3. **Clean Previous Builds** (Optional): Run `rm -rf packages/*/dist` to ensure clean build state
4. **Run Vercel Build Simulation**: Execute the exact build command Vercel uses:
   ```bash
   pnpm --filter @524/shared build && \
   pnpm --filter @524/database build && \
   pnpm --filter @524/notifications build && \
   pnpm --filter @524/api build
   ```
   This mirrors the `vercel-build` script's build sequence.
5. **Analyze Errors**: If typecheck or build fails, analyze the error output:
   - **Module Not Found Errors** (e.g., `Cannot find module 'firebase-admin'`): The dependency is missing from the package's `package.json` - add it to `dependencies`
   - **Implicit Any Errors** (e.g., `Parameter 'x' implicitly has an 'any' type`): Add explicit type annotations
   - **Type Mismatch Errors**: Fix the type incompatibility in source code
   - **Missing Export Errors**: Ensure shared packages export required types/modules
   - **Cross-Package Import Errors**: Verify workspace linking (`"@524/shared": "workspace:*"`)
6. **Fix Dependency Errors**: For missing module errors:
   - Add the missing dependency to the package's `package.json` (not relying on hoisting)
   - Run `pnpm install` to update the lockfile
   - Example: If `@524/api` imports `firebase-admin` directly, it must be in api's dependencies
7. **Fix Type Errors**: Address TypeScript compilation issues:
   - Add explicit type annotations where implicit any is not allowed
   - Fix type mismatches in source files
   - Add missing type exports to shared packages
   - Update type definitions where needed
8. **Re-stage Fixed Files**: If fixes were made, run `git add <fixed-files>` to include them
9. **Verify Both Pass**: Re-run both `pnpm typecheck` and build simulation to confirm all errors are resolved
10. **Iterate Until Success**: Continue fixing and re-running until both pass

**Output:**

- All packages pass TypeScript type checking (`pnpm typecheck`)
- All packages build successfully (tsc with emit)
- Cross-package imports are validated
- Module resolution errors are resolved
- All dependencies are properly declared
- Any fixes are staged for commit

**Validation:**

- [ ] **Typecheck Success**: `pnpm typecheck` completes without errors (matches GitHub Actions)
- [ ] **Build Success**: Sequential package builds complete without errors (matches Vercel)
- [ ] **All Packages Pass**: `@524/shared`, `@524/database`, `@524/notifications`, `@524/api` all typecheck and build
- [ ] **Dependencies Declared**: All imported modules are in the package's own `package.json`
- [ ] **No Type Errors**: No TypeScript compilation errors in any package
- [ ] **No Implicit Any**: All parameters and variables have explicit types where required
- [ ] **Module Resolution**: All cross-package imports resolve correctly (e.g., `@524/shared`)
- [ ] **Fixes Staged**: Any type/build-related fixes are staged for commit

**Why Both Typecheck AND Build Simulation:**

GitHub Actions CI runs `pnpm typecheck` which uses `tsc --noEmit`:
- Validates types without generating output
- Runs packages in parallel
- Catches type errors quickly

Vercel runs `tsc --project tsconfig.json` (with emit) sequentially:
- Requires all dependencies to be explicitly declared in each package
- May catch missing dependencies that typecheck misses due to pnpm hoisting
- Runs sequentially: shared → database → notifications → api
- Validates the full compilation including output generation

Running both ensures your code passes both GitHub Actions CI AND Vercel deployment.

### 6. Commit Changes with Pre-Commit Hook Handling

**Purpose:**
Create the commit and handle any failures from pre-commit hooks by fixing issues and retrying until the commit succeeds.

**Input:**

- Staged changes from Step 4
- Type-validated codebase from Step 5
- Generated commit message from Step 4
- Pre-commit hook configuration (if present)

**Actions:**

1. **Attempt Commit**: Run `git commit -m "<commit-message>"` with the prepared message
2. **Monitor Pre-Commit Hooks**: Observe output from any pre-commit hooks (linting, formatting, type checking, build verification)
3. **Handle Hook Failures**: If pre-commit hooks fail:
   - Review hook output to identify specific issues
   - Fix identified issues (formatting, linting errors, type errors)
   - Re-stage any files modified by hook auto-fixes using `git add <files>`
   - Retry commit with `git commit -m "<commit-message>"`
4. **Iterate Until Success**: Continue fixing issues and retrying until commit succeeds
5. **Verify Commit Created**: Confirm commit was created using `git log -1`

**Output:**

- Successful commit created with meaningful message
- All pre-commit hook checks passed
- Any auto-fixed changes included in commit
- Commit hash recorded for reference

**Validation:**

- [ ] **Commit Success**: git commit completes without errors
- [ ] **Hooks Passed**: All pre-commit hooks pass (linting, formatting, type checking)
- [ ] **Commit Verified**: git log -1 shows new commit with correct message
- [ ] **No Remaining Issues**: All hook-identified issues have been resolved

### 7. Push Changes with Pre-Push Hook Handling

**Purpose:**
Push the committed changes to the remote repository and handle any failures from pre-push hooks by fixing issues and retrying until the push succeeds.

**Input:**

- Successful commit from Step 6
- Remote repository access
- Pre-push hook configuration (if present)

**Actions:**

1. **Attempt Push**: Run `git push origin <branch-name>` to push changes to remote
2. **Monitor Pre-Push Hooks**: Observe output from any pre-push hooks (tests, build verification)
3. **Handle Hook Failures**: If pre-push hooks fail:
   - Review hook output to identify specific failures (test failures, build errors)
   - Fix identified issues in the codebase
   - Stage fixes with `git add <files>`
   - Create fix commit with `git commit -m "fix: resolve pre-push hook failures"`
   - Retry push with `git push origin <branch-name>`
4. **Handle Push Rejection**: If push is rejected due to remote changes:
   - Fetch latest changes with `git fetch origin`
   - Rebase or merge as appropriate
   - Resolve any conflicts
   - Force push only if appropriate and safe (not on protected branches)
5. **Iterate Until Success**: Continue fixing issues and retrying until push succeeds
6. **Verify Push Success**: Confirm changes are on remote using `git log origin/<branch-name> -1`

**Output:**

- All commits successfully pushed to remote repository
- All pre-push hook checks passed
- Remote branch updated with latest changes
- Any additional fix commits also pushed

**Validation:**

- [ ] **Push Success**: git push completes without errors
- [ ] **Hooks Passed**: All pre-push hooks pass (tests, builds, type checks)
- [ ] **Remote Updated**: git log origin/<branch> shows pushed commits
- [ ] **Branch Synchronized**: Local and remote branches are in sync

### 8. Final Verification

**Purpose:**
Confirm the complete workflow executed successfully and the repository is in a clean, synchronized state.

**Input:**

- Successful push from Step 7
- Remote repository state

**Actions:**

1. **Verify Local Status**: Run `git status` to confirm clean working tree
2. **Verify Remote Sync**: Run `git log --oneline HEAD..origin/<branch> && git log --oneline origin/<branch>..HEAD` to confirm sync
3. **Review Push Results**: Confirm all intended changes are reflected on remote
4. **Document Completion**: Note the final commit hash and any issues encountered

**Output:**

- Verified clean repository state
- Confirmed local-remote synchronization
- Documentation of completed workflow
- Any notes on issues encountered and resolutions

**Validation:**

- [ ] **Clean State**: git status shows nothing to commit, working tree clean
- [ ] **Synchronized**: Local branch is up-to-date with remote tracking branch
- [ ] **Changes Live**: All intended changes are visible on remote repository
- [ ] **No Pending Issues**: No unresolved errors or warnings from any step

## Quality Assurance

**MANDATORY FORMAT VALIDATION:**

- [ ] **Format Compliance**: File MUST follow exact structure from [Workflow Format Specification](../formats/workflow-format.md)
- [ ] **Section Order**: Headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Status Indicators**: Validation elements use proper checkbox format
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets

**Process Quality Review:**

- [ ] **Error Handling**: All potential failure scenarios are addressed with recovery steps
- [ ] **Iterative Resolution**: Workflow supports retry loops for hook failures
- [ ] **Conflict Resolution**: Clear guidance for resolving both merge and stash conflicts
- [ ] **Safety Measures**: Appropriate warnings about destructive operations (force push)
- [ ] **Complete Coverage**: All stages from sync to push are thoroughly documented

**Cleanup and Documentation Review:**

- [ ] **Temporary Files Removed**: No debug scripts, temp files, or one-off utilities included
- [ ] **Documentation Current**: All documentation reflects the actual code changes
- [ ] **No Redundant Docs**: No duplicate or overlapping documentation created
- [ ] **Documentation Concise**: Documentation is focused and avoids unnecessary verbosity
- [ ] **Examples Validated**: Code examples in documentation are accurate and functional

**Type Validation Review:**

- [ ] **Monorepo Typecheck**: `pnpm typecheck` passes for all packages
- [ ] **Cross-Package Imports**: All workspace package imports resolve correctly
- [ ] **Module Exports**: Shared packages export all required types and modules
- [ ] **Dependency Resolution**: All workspace dependencies are properly linked
- [ ] **CI Compatibility**: Typecheck passes in the same way it would in CI/CD

**Git Operations Review:**

- [ ] **Branch Safety**: No destructive operations on protected branches without explicit warnings
- [ ] **Commit Quality**: Meaningful commit messages based on actual changes
- [ ] **History Integrity**: No operations that would corrupt git history
- [ ] **Remote Sync**: Proper handling of divergent branches and push rejection
- [ ] **Clean Commits**: Commits contain only intentional, production-ready changes

**CRITICAL**: If ANY format validation check fails, the workflow file MUST be corrected before proceeding.

## Success Criteria

**Workflow Completion:**

- All changes are successfully committed with meaningful, descriptive commit messages
- All pre-commit hooks pass without manual bypassing
- All pre-push hooks pass without manual bypassing
- Changes are pushed to remote repository
- Local and remote branches are fully synchronized
- No merge conflicts remain unresolved

**Cleanup and Documentation Quality:**

- No temporary scripts, debug files, or one-off utilities are committed
- All documentation accurately reflects the current state of the code
- No redundant or duplicate documentation has been added
- Existing documentation has been updated where code changes require it
- Documentation is concise and avoids unnecessary repetition

**Type Safety:**

- `pnpm typecheck` passes across all packages before commit
- All cross-package imports (e.g., `@524/shared`) resolve correctly
- No module resolution errors that would fail in CI/CD
- TypeScript compilation succeeds for all packages in the monorepo

**Process Efficiency:**

- Workflow handles common failure scenarios without manual intervention patterns
- Clear error messages guide developers to specific problems
- Iterative retry approach minimizes workflow restarts
- Hook failures are resolved systematically rather than bypassed

## Related Workflows

- [Pre-Deployment Quality Check Workflow](./pre-deployment-quality-check.md) - For comprehensive quality validation before deployment
- [Cross-Reference Validation Workflow](./cross-reference-validation.md) - For validating documentation links after changes
- [Code Review Workflow](./code-review-workflow.md) - For reviewing changes before committing

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference the Format**: Always include this exact statement in prompts:

   ```markdown
   **Workflow Format**: Follow the canonical workflow format defined in [Workflow Format Specification](../formats/workflow-format.md)
   ```

2. **Validate Before Completion**: Run through the complete validation checklist before considering the workflow complete

3. **Use Correct Templates**: Apply the structured step format with Purpose, Input, Actions, Output, and Validation elements

4. **Enforce Section Order**: Maintain exact section order as specified in the format specification

5. **Include ALL Required Sections**: Never omit required sections - all must be present and properly filled

**FAILURE TO COMPLY**: Workflow files that do not follow the format specification are invalid and will require correction.

## Notes

This workflow is designed to handle the complete git commit-push cycle with robust error handling for common issues:

- **Merge Conflicts**: The workflow prioritizes merging origin/main before committing to reduce integration issues
- **Pre-Commit Hooks**: Common hooks include linting (ESLint, Biome), formatting (Prettier), type checking (TypeScript), and build verification
- **Pre-Push Hooks**: Common hooks include test suites, build verification, and additional type checking
- **Dedicated Typecheck**: A separate `pnpm typecheck` step runs independently of hooks to catch cross-package type errors before commit
- **Iterative Resolution**: The workflow explicitly supports multiple retry attempts rather than bypassing hooks
- **Cleanup**: The workflow ensures temporary files and debug scripts don't pollute the repository
- **Documentation Integrity**: The workflow validates that documentation stays in sync with code changes

**Important Considerations:**

- Never use `--no-verify` to bypass hooks unless explicitly instructed and understood
- Be cautious with force push operations - only use on feature branches, never on main/master
- When resolving conflicts, always review the resolution to ensure both sets of changes are properly integrated
- Keep commit messages focused and descriptive - they should explain "why" not just "what"

**Temporary File Patterns to Watch For:**

- `*.tmp`, `*.bak`, `*.log` - Temporary and backup files
- `check-*.js`, `fix-*.js`, `debug-*.js` - One-off debug/fix scripts
- `temp-*`, `test-*` (in root) - Temporary test files
- `apply-migration-*.ts`, `fix-*.ts` - One-time migration/fix scripts
- Scripts in root directory that aren't part of the project structure

**Documentation Anti-Patterns to Avoid:**

1. **Duplication**: Creating new docs that repeat existing content
2. **Stale Examples**: Code examples that don't match current implementation
3. **Orphaned Docs**: Documentation for removed features
4. **Over-Documentation**: Documenting obvious code or internal implementation details
5. **Personal Notes**: Debug notes or personal reminders left in documentation

**Documentation Update Triggers:**

- API endpoint changes require API documentation updates
- Configuration changes require setup/config documentation updates
- New features require feature documentation or README updates
- Changed function signatures may require inline comment updates
- Removed features require documentation cleanup

**Common Hook Failure Patterns:**

1. **Linting Errors**: Fix code style issues, often auto-fixable with `--fix` flags
2. **Type Errors**: Address TypeScript compilation issues in source files
3. **Test Failures**: Fix failing tests or update tests for new behavior
4. **Build Failures**: Resolve compilation or bundling errors
5. **Format Issues**: Apply auto-formatting or manual formatting corrections

**Cross-Package Type and Build Error Resolution:**

The dedicated typecheck and build simulation step (Step 5) catches errors that pre-commit hooks may miss, particularly in monorepo setups:

1. **Module Resolution Errors** (`Cannot find module '@524/shared'`):
   - Verify the package is in `dependencies` in the consuming package's `package.json`
   - Ensure the shared package's `package.json` has correct `main`, `types`, and `exports` fields
   - Check workspace linking: should be `"@524/shared": "workspace:*"`
   - Run `pnpm install` to refresh workspace links

2. **Missing External Dependencies** (`Cannot find module 'firebase-admin'`):
   - This occurs when a package imports an external module but doesn't declare it in its own `package.json`
   - Locally, pnpm hoisting may make the dependency available from another package
   - On Vercel/CI with `--frozen-lockfile`, this fails because dependencies must be explicitly declared
   - **Fix**: Add the missing dependency to the package's own `package.json`

3. **Missing Type Exports**:
   - Ensure types are exported from the shared package's `src/index.ts`
   - Verify `tsconfig.json` includes the source files
   - Check that `declaration: true` is set in the shared package's TypeScript config

4. **Path Resolution Issues**:
   - Verify `baseUrl` and `paths` in `tsconfig.json` are correct
   - Ensure package `name` in `package.json` matches the import path
   - Check for circular dependencies between packages

5. **Build Order Dependencies**:
   - Some packages may need to be built before others can typecheck
   - Use `pnpm build` on shared packages first if needed
   - Consider adding `references` to `tsconfig.json` for proper build order

**Why Both Typecheck AND Build Simulation:**

Pre-commit hooks and `pnpm typecheck` may not catch all errors that occur in CI/CD:
- `pnpm typecheck` uses `--noEmit` which may miss dependency resolution issues
- Vercel runs actual builds (`tsc --project tsconfig.json`) sequentially
- Missing external dependencies may work locally due to pnpm hoisting but fail on Vercel

Running both `pnpm typecheck` (matches GitHub Actions) and the sequential build simulation (matches Vercel) ensures complete validation before push.
