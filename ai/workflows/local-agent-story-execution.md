# Local Agent Story Execution

Defines how a local AI agent (in Cursor) selects, processes, and updates a story to mirror the remote GitHub Actions workflow.

## Overview

- Selection source: `product/stories-queue.md` (Global Order)
- Local entrypoint: `pnpm agent:start-local [<story-file-or-title>]`
- Remote workflow label: `agent:start-remote` (CI only; not used locally)

### Non-stop run contract

- The local agent must complete Steps 1–4 in one session. Do not end your turn after opening a draft PR; continue through implementation, verification, and completion unless truly blocked (see Notes: Blocked definition).
- **Critical**: Push implementation commits regularly during Step 3 to ensure PR reflects current progress and work is backed up. Do not wait until Step 4 to push substantial implementation.

## Preconditions

- Node 20+, pnpm
- GitHub CLI `gh` installed and authenticated (optional; enables automatic draft PR)
- Workspace installs and builds cleanly (`pnpm install && pnpm -w -r build`)
- **Proper git remote configuration** (see Git Setup Requirements below)

## Selection Logic

- Auto-select the first story in Global Order with `Status: ⏳ Not Started`
- If none are Not Started, select the first story in the list
- Override by passing a file or exact title:
  - `pnpm agent:start-local coordinated-build-system.md`
  - `pnpm agent:start-local "Coordinated Build System"`

## Git Setup Requirements

### Repository Configuration

The workflow assumes working directly in the organization repository as an admin member (no personal fork setup).

**Required Git Remote Configuration:**

```bash
# Correct setup:
origin          git@github.com:Dopamotiv/Dopamotiv.git (main org repo)
personal-fork   git@github.com:CommandLineDesign/Dopamotiv.git (fallback remote)

# If your remotes are backwards, fix them:
git remote rename origin personal-fork
git remote rename fork origin
git branch --set-upstream-to=origin/main main
```

### GitHub CLI Configuration

```bash
# Set correct default repository
gh repo set-default Dopamotiv/Dopamotiv

# Refresh authentication with proper scopes
gh auth refresh --scopes repo
```

### Common Issues & Solutions

- **"No commits between repositories"**: Likely using wrong PR syntax
  - ❌ Wrong: `--head CommandLineDesign:branch` (cross-repo)
  - ✅ Correct: `--head branch` (same-repo)
- **Interactive CLI prompts**: Ensure `gh repo set-default` is configured
- **Permission errors**: Verify you're an admin/member of the Dopamotiv organization

## Branch Naming

- `feat/<epic-slug>/<title-slug>`
  - Epic slug from the story's `**Epic**:` line
  - Title slug from the H1 (kebab-cased, ~60 chars)

## Execution Steps (Local)

0. Sync with Main
   - Fetch latest and fast-forward the default branch (main)
   - Base the feature branch on the latest `main` (or merge latest `main` into existing branch)

1. Mark In Progress
   - Update story `**Status**` → `📝 In Progress`
   - Regenerate planning docs: `product/stories.md`, `product/stories-queue.md`
   - Commit and push the planning updates on the feature branch

2. Kickoff PR
   - Create a draft PR (via `gh pr create` when available)
   - Enrich PR body with:
     - Agent Execution Checklist
     - Epic line
     - Story Statement and Acceptance Criteria (quoted)
     - Verification checklist

3. Implement Story Requirements
   - Implement strictly against Acceptance Criteria
   - Prefer small commits that map to criteria
   - **Push commits regularly to keep PR updated and ensure work is backed up**
   - Keep documentation updated as needed (e.g., root `README.md`)
   - Definition of Done (must be met before ending the session):
     - All Acceptance Criteria implemented
     - Unit/integration tests cover the Acceptance Criteria where applicable
     - Documentation updated if applicable
     - PR description updated with criteria-by-criteria verification
     - All checks green locally:
       - `pnpm install`
       - `pnpm -w -r build`
       - `pnpm -w -r lint`
       - `pnpm -w -r typecheck` (if configured)
       - `pnpm -w -r test` (if configured)

4. Completion
   - When Definition of Done is met (even if human review/merge is pending):
     - Update story `**Status**` → `✅ Completed`
     - Regenerate planning docs
     - Commit and push
     - **Open PR for review**: Mark draft PR as ready for review (via `gh pr ready` when available)
     - Recommended command: `pnpm agent:complete-local <story-file-or-title>`

## Commands

- Process next story from the queue:
  - `pnpm agent:start-local` (continues through Steps 1–4 in the same session; do not stop after draft PR unless blocked)
- Process a specific story:
  - `pnpm agent:start-local monorepo-workspace-setup.md`
  - `pnpm agent:start-local "Monorepo Workspace Setup"`
- Complete a story (mark as ✅ Completed and regenerate docs):
  - `pnpm agent:complete-local coordinated-build-system.md`
  - `pnpm agent:complete-local "Coordinated Build System"`

## Notes

- Local vs Remote:
  - Remote CI path uses label `agent:start-remote` in `.github/workflows/agent-start.yml`
  - Local path uses `scripts/agent/start-local.sh` and mirrors the remote behavior
- Selection avoids re-picking stories with `📝 In Progress` or `✅ Completed`
- The queue is dependency-aware and sorted by status → priority → effort
- PR Lifecycle:
  - Step 2: Create draft PR with story details and checklist
  - Step 3: Push implementation commits regularly (don't wait until completion)
  - Step 4: Mark draft PR as ready for review when implementation is complete
  - Human review and merge happen outside the agent workflow
- **Important**: Push commits during implementation to ensure work is visible in PR and backed up. Waiting until completion creates gaps where substantial work appears to be missing.

### Blocked definition

- Blocked means the agent cannot proceed without external input or access, e.g.:
  - Missing secrets/credentials or required third-party keys
  - Missing upstream endpoint or service outside this repo
  - Ambiguous spec after reasonable inference attempts
  - CI/infra failures outside repository control
- When blocked, explicitly state what is needed to proceed; otherwise, continue without pausing.

## Troubleshooting

### GitHub CLI Issues

**Symptom**: `GraphQL: Head sha can't be blank... No commits between repositories`
**Root Cause**: Incorrect PR creation syntax for same-repository workflow
**Solution**:

```bash
# Wrong (cross-repo syntax)
gh pr create --head CommandLineDesign:branch-name

# Correct (same-repo syntax)
gh pr create --head branch-name
```

**Symptom**: Interactive prompts asking "Where should we push the branch?"
**Root Cause**: GitHub CLI doesn't know the default repository  
**Solution**:

```bash
gh repo set-default Dopamotiv/Dopamotiv
```

**Symptom**: "Updates were rejected (non-fast-forward)" when pushing
**Root Cause**: Git remotes pointing to wrong repositories
**Solution**: Follow the Git Setup Requirements section above

### Verification Commands

Check your setup is correct:

```bash
# Verify git remotes
git remote -v
# Should show origin -> Dopamotiv/Dopamotiv

# Verify GitHub CLI default
gh repo view
# Should show "Dopamotiv/Dopamotiv"

# Test PR creation (dry run)
gh pr create --dry-run --title "Test" --body "Test" --head current-branch
```

## References

- Script: `scripts/agent/start-local.sh`
- Remote workflow: `.github/workflows/agent-start.yml`
- Planning artifacts: `product/stories.md`, `product/stories-queue.md`
- General process: `ai/workflows/agent-story-execution.md`
