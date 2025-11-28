# Agent Story Execution Workflow

This workflow defines the consistent, semi-automated process for assigning a story to an AI agent, validating preconditions, and ensuring compliance with the story specification.

## Goals

- Prevent duplicate/obsolete work before the agent starts
- Update `Status` consistently across GitHub issue and `product/stories/*.md`
- Ensure the agent implements against the spec and acceptance criteria
- Keep planning artifacts (`stories.md`, `stories-queue.md`) current

## Preconditions

- Each story in `product/stories/*.md` contains:
  - `Epic`, `Priority`, `Status`, `Estimated Effort`
  - Optional `Dependencies`
- Issues are synced from stories (see `scripts/story-sync/sync-stories.js`)

## Trigger

- Add label `agent:start` to a synced story issue in GitHub

## Steps

1. Preflight checks (automation)
   - Abort if issue is closed or labeled as completed
   - Parse story path from issue body `Source:` link
   - Optional: verify dependencies are not open Critical/High (warn if so)

2. Mark In Progress (automation)
   - Update story file `**Status**:` to `📝 In Progress`
   - Regenerate `product/stories.md` and `product/stories-queue.md`
   - Commit changes to the branch

3. Agent kickoff (automation)
   - Post a comment with a checklist containing:
     - Linked Story spec and Epic spec
     - Story Statement
     - Acceptance Criteria (quoted)
     - Definition of Done checklist
     - Instruction to reference these in the PR description and verify compliance

4. Completion (future automation)
   - When the PR that closes the issue is merged, set `Status` to `✅ Completed`, regenerate docs, and commit

## Notes

- The issue body includes Story Statement and Acceptance Criteria (parsed by the sync script) for agent context.
- Queue respects dependencies → priority → status → effort; starting work will reorder the queue accordingly.
