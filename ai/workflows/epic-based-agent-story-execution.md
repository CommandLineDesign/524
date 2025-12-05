# Epic-Based Agent Story Execution (Local)

Defines how a local AI agent (in Cursor) is manually prompted to pick a story within a specific epic and complete it end-to-end. This mirrors our local flow and avoids remote CI triggers.

## Overview

- Triggered manually inside Cursor; no remote GitHub Actions path.
- Selection source: stories listed in `product/stories.md`, filtered by epic.
- Local entrypoint: `pnpm agent:start-local` with prompt context that names the epic.
- Remote labels like `agent:start-remote` are not used here.

### How to prompt for an epic

- In your execution prompt to the agent, state the epic name or slug clearly, e.g.:
  - “Execute a story from epic: Coordinated Build System”
  - “Epic: platform-performance; pick the next not-started story.”
- Optional: provide a specific story override (file path or exact title) to bypass selection.


## Selection Logic (Epic-Scoped)

- Filter stories to the epic named in the prompt.
- Pick the first story in that epic with `Status: ⏳ Not Started`.
- If none are Not Started, pick the first story in that epic (avoid `✅ Completed` unless nothing else exists).
- If the epic has no candidates, fall back to the global list (Not Started first).
- Override by passing a story file or exact title:
  - `pnpm agent:start-local product/stories/monorepo-workspace-setup.md`
  - `pnpm agent:start-local "Monorepo Workspace Setup"`

## Branch Naming

- `feat/<epic-slug>/<title-slug>`
  - Epic slug from the story's `**Epic**:` line
  - Title slug from the H1 (kebab-cased, ~60 chars)

## Execution Steps (Local, Epic-Scoped)

0. Sync with Main
   - Fetch latest and fast-forward `main`.
   - Base the feature branch on latest `main` (or merge `main` into existing branch).

1. Mark In Progress
   - Update story `**Status**` → `📝 In Progress`.
   - Regenerate planning docs: `product/stories.md`.
   - Commit and push the planning updates on the feature branch.

2. Kickoff PR
   - Create a draft PR (via `gh pr create` when available).
   - Enrich PR body with:
     - Agent Execution Checklist
     - Epic line
     - Story Statement and Acceptance Criteria (quoted)
     - Verification checklist

3. Implement Story Requirements
   - Implement strictly against Acceptance Criteria.
   - Prefer small commits that map to criteria.
   - Push commits regularly to keep PR updated and ensure work is backed up.
   - Keep documentation updated as needed (e.g., root `README.md`).
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
     - Open PR for review: Mark draft PR as ready for review (`gh pr ready` when available)
     - Recommended command: `pnpm agent:complete-local <story-file-or-title>`

## Commands

- Process next story from a specific epic (via prompt context):
  - Start Cursor agent with prompt that names the epic, then run `pnpm agent:start-local`.
- Process a specific story:
  - `pnpm agent:start-local product/stories/monorepo-workspace-setup.md`
  - `pnpm agent:start-local "Monorepo Workspace Setup"`
- Complete a story (mark as ✅ Completed and regenerate docs):
  - `pnpm agent:complete-local coordinated-build-system.md`
  - `pnpm agent:complete-local "Coordinated Build System"`

## Notes

- Selection avoids re-picking stories with `📝 In Progress` or `✅ Completed` when other options exist.
- PR Lifecycle:
  - Step 2: Create draft PR with story details and checklist
  - Step 3: Push implementation commits regularly (don't wait until completion)
  - Step 4: Mark draft PR as ready for review when implementation is complete
  - Human review and merge happen outside the agent workflow
- Important: push commits during implementation to keep the PR reflective of progress.

### Blocked definition

- Blocked means the agent cannot proceed without external input or access, e.g.:
  - Missing secrets/credentials or required third-party keys
  - Missing upstream endpoint or service outside this repo
  - Ambiguous spec after reasonable inference attempts
  - CI/infra failures outside repository control
- When blocked, explicitly state what is needed to proceed; otherwise, continue without pausing.

## Troubleshooting

### Verification Commands

## References

- Planning artifacts: `product/stories.md`, `product/stories-queue.md`
