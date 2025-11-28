# Story Update Prompt

## Purpose

This prompt is used to update existing user story files. It provides instructions for modifying story content, maintaining format compliance, ensuring INVEST principle adherence, and preserving integration with parent epics and related stories while incorporating new requirements or feedback.

## Vision Context Loading

**CRITICAL FIRST STEP**: Before proceeding with any story update activities, you MUST load the product specification into context to ensure all operations are taken with the product vision in mind.

1. **Load Product Spec**: Read and analyze the complete [`ai/context/product_spec.md`](../../ai/context/product_spec.md) file to understand:
   - Core value proposition, game types, and campaign model
   - Technical architecture (widget, admin, backend)
   - Integrations and platform requirements
   - Performance/security/accessibility targets
   - Roles, data model, and event vocabulary

2. **Vision Alignment**: Ensure that all story update decisions, requirement modifications, and acceptance criteria changes align with the established product vision and contribute to business outcomes.

3. **Context Integration**: Use the vision as the primary reference for determining how story updates should be applied and how they integrate with the broader user experience and system workflows.

## Instructions

You are tasked with updating an existing user story for the Planetform project. Your response must include multiple file updates to maintain project consistency and documentation integrity.

### Story Format Requirements

**Story Format**: Follow the canonical story format defined in [Story Format Specification](../formats/story-format.md). The updated story MUST include all required sections in the exact order specified:

1. Title and Metadata (Epic link, Role, Priority, Status, Dependencies, Estimated Effort)
2. Story Statement (As a... I want... So that...)
3. Detailed Description
4. Acceptance Criteria (Functional and Non-Functional Requirements)
5. User Experience Flow
6. Technical Context
7. Definition of Done
8. Optional Sections (if applicable)
9. Notes

### Context Enhancement

Before updating the story, review available context files in the `ai/context/` folder to enhance your understanding:

#### Context Research for Story Updates

- Review `ai/context/product_spec.md` and any related context files for updates to roles, data model, event vocabulary, integrations, and performance/security/accessibility targets

#### Context Integration for Update Quality

- **Updated Understanding**: Use context to validate that updates reflect current system understanding
- **Consistency Maintenance**: Ensure updates maintain alignment with context patterns and principles
- **Technical Accuracy**: Verify that technical changes align with context system capabilities
- **User Experience Coherence**: Ensure updates maintain coherent user experience based on context
- **Integration Validation**: Confirm updates don't conflict with context system integrations

### Context File Updates

After updating the story, maintain the context system to reflect changes in user interaction patterns:

#### Context Update Requirements

When updating stories, update relevant context files to capture:

- **Changed User Patterns**: Updates to user interaction patterns based on story changes
- **Modified Behaviors**: Changes to user behaviors and workflows described in the story
- **Updated Requirements**: Technical pattern changes and requirement modifications
- **Integration Changes**: Updates to how user interactions affect system integration
- **Experience Evolution**: Changes to user experience patterns and design principles

#### Context File Update Process

1. **Review Story Changes**: Analyze what aspects of the story have changed
2. **Identify Context Impact**: Determine which context files are affected by the changes
3. **Update Relevant Files**: Modify context files to reflect story updates
4. **Validate Consistency**: Ensure context updates maintain consistency with existing patterns
5. **Update Cross-References**: Modify links between context files if needed

#### Context Format for Story Updates

When updating context files based on story changes, follow the format defined in [Context Format Specification](../formats/context-format.md). Use the **Story-Generated Context Files** section format for the content sections.

#### Context Categories for Story Updates

- **Gameplay**: Updated user interaction patterns and player experience flows
- **Systems**: Modified technical requirements and integration patterns
- **Design**: Updated user experience patterns and interface requirements
- **Entities**: Changes to user relationships with entities and behavioral patterns
- **Game Mechanics**: Updated gameplay mechanics and interaction patterns

### Input Requirements

Provide the following information:

- **Story Name**: REQUIRED - The name of the existing story file to update (e.g., "discount-code-creation.md")
- **Update Description**: Clear description of what needs to be changed and why
- **Specific Changes**: Detailed list of modifications needed (content, status, priority, etc.)
- **Impact Assessment**: How these changes affect related stories and the parent epic
- **Validation Requirements**: Any specific consistency checks or cross-references needed

### Story Name Validation

**CRITICAL**: If the story name is not provided, you MUST:

1. Display the message: "ERROR: Story name is required. Please provide the name of the story file (e.g., 'burst-compilation-integration.md') that needs to be updated."
2. Stop all processing and wait for the story name to be provided
3. Do not proceed with any file updates until the story name is specified

### Output Requirements

Your response must include the following file updates:

#### 1. Story File Update

Update the existing story file in `product/stories/[story-name].md` to:

- Maintain the exact format specification without deviation
- Preserve existing content where appropriate while applying requested changes
- Update metadata fields (priority, status, dependencies, effort) as needed
- Modify story statement following Role-Goal-Benefit format if changes are required
- Update detailed description to reflect new context or requirements
- Revise acceptance criteria using Given-When-Then format as needed
- Update user experience flow to reflect changed interactions
- Modify technical context and integration points as required
- Update Definition of Done criteria to reflect new requirements
- Add or modify optional sections only when they add value
- Maintain consistency with existing story terminology and approaches

#### 2. Story Tracking Update

Update `product/stories.md` to:

- Modify the story entry with updated status indicators and checkboxes
- Update statistics if story status has changed (Total Stories, Completed, Pending, Completion Rate)
- Maintain logical ordering within epic categories
- Update story priority categorization if priority has changed
- Ensure consistent formatting with other entries

#### 3. Context File Updates

Update relevant context files in `ai/context/` to:

- Reflect changes in user interaction patterns from the story update
- Update technical requirements and integration patterns based on story changes
- Modify behavioral insights and user experience patterns
- Create new context files for novel patterns introduced by the update
- Update cross-references between context files as needed

#### 4. Parent Epic Integration

Update the parent epic file to:

- Modify the story description in the "User Stories" section if needed
- Update the story link if the story name has changed
- Ensure the story still aligns with epic's overall scope and objectives
- Update any epic acceptance criteria that may be affected by story changes
- Maintain alphabetical or logical ordering within the epic

### Cross-Reference Validation

Before finalizing the story update, perform these validation checks:

#### Story Dependencies

- Verify all referenced stories exist in the `product/stories/` directory
- Ensure dependency relationships remain logical and implementable
- Check for circular dependencies if new dependencies are added
- Validate that dependency chains still support proper development sequencing

#### Epic Integration

- Confirm the parent epic link is still valid and properly referenced
- Verify the updated story scope still fits within the epic's boundaries
- Check that updated story acceptance criteria align with epic objectives
- Ensure updated story priority is consistent with epic priority

#### Cross-Story Consistency

- Check terminology consistency with related stories
- Verify technical approaches align with similar stories
- Ensure updated acceptance criteria don't conflict with existing stories
- Validate integration points remain compatible with other stories

#### INVEST Principle Validation

- **Independent**: Updated story can still be developed without depending on other stories
- **Negotiable**: Updated details can be discussed and refined during development
- **Valuable**: Updated story still delivers clear value to the user or business
- **Estimable**: Development team can still estimate effort required
- **Small**: Updated story can still be completed within estimated timeframe
- **Testable**: Updated story has clear acceptance criteria that can be verified

### Quality Standards

#### Story Statement Requirements

- Must follow exact "As a [Role] I want [Goal] So that [Benefit]" format
- Role must be from defined role types (Player, AI Entity, Colonist, etc.)
- Goal must be specific and actionable
- Benefit must clearly articulate user value

#### Acceptance Criteria Requirements

- Must use Given-When-Then format with bold keywords
- Must include both functional and non-functional requirements
- Must be specific, testable, and measurable
- Must be realistic and achievable within estimated effort

#### Technical Quality

- Web/Node architecture alignment where applicable
- Consistent terminology with project documentation
- Proper integration with existing systems and platforms
- Clear technical requirements and constraints

### Update Categories

#### Content Updates

- Modify story description or context
- Update acceptance criteria or requirements
- Revise user experience flow
- Update technical context or integration points

#### Status Updates

- Change story status (Not Started → In Progress → Completed)
- Update priority level (Critical, High, Medium, Low)
- Modify estimated effort (XS, S, M, L, XL)
- Update dependencies or remove dependencies

#### Format Updates

- Apply current format specification to existing stories
- Update section structure and ordering
- Standardize formatting and terminology
- Add missing required sections

#### Integration Updates

- Update epic links or references
- Modify cross-story dependencies
- Update technical integration points
- Align with updated project standards

### Validation Checklist

Before finalizing the story update, ensure:

- [ ] Story name is provided and valid
- [ ] Updated story follows exact format specification
- [ ] Story statement maintains proper Role-Goal-Benefit format with bold keywords
- [ ] Updated story meets all INVEST criteria
- [ ] Status uses correct emoji format (✅ 📝 ⏳)
- [ ] Acceptance criteria use proper Given-When-Then format
- [ ] All required sections are present and in correct order
- [ ] Dependencies section is not empty (use "None" if no dependencies)
- [ ] Story is properly linked to parent epic
- [ ] Parent epic is updated if story changes affect it
- [ ] Story tracking reflects updated status and statistics
- [ ] Context files have been updated to reflect story changes
- [ ] Content is clear, accurate, and complete
- [ ] Terminology is consistent across stories and documentation
- [ ] Technical requirements are realistic and implementable
- [ ] Integration points are well-defined
- [ ] Story can be completed within estimated effort
- [ ] Cross-references are functional and up-to-date

### Common Update Scenarios

#### Status Progression Updates

- **Not Started → In Progress**: Update status when development begins
- **In Progress → Completed**: Update status when story is finished
- **Completed → In Progress**: Reopen story if additional work is needed

#### Priority Adjustments

- **Critical/High → Medium/Low**: Reduce priority based on changing requirements
- **Medium/Low → Critical/High**: Increase priority based on technical discoveries

#### Scope Changes

- **Expand scope**: Add new acceptance criteria or requirements
- **Reduce scope**: Remove acceptance criteria or split into separate stories
- **Refine scope**: Clarify existing requirements without changing overall scope

#### Technical Updates

- **Architecture changes**: Update technical context for Web/Node changes
- **Integration updates**: Modify integration points with other systems
- **Performance updates**: Add or update performance requirements

### Error Handling

#### Missing Story Name

If story name is not provided:

1. Display error message requesting story name
2. Stop all processing
3. Wait for story name to be provided
4. Validate story exists before proceeding

#### Invalid Story Reference

If provided story doesn't exist:

1. Display error message with available stories
2. Request valid story name
3. Stop processing until valid story is provided

#### Format Violations

If existing story doesn't follow format:

1. Apply format specification during update
2. Preserve existing content while restructuring
3. Add missing required sections
4. Maintain content quality during format updates

### Integration with Development Process

#### Sprint Planning

- Update story status as work progresses
- Adjust priority based on sprint goals
- Modify effort estimates based on actual development

#### Requirements Changes

- Update acceptance criteria based on stakeholder feedback
- Modify user experience flow based on testing results
- Update technical context based on implementation discoveries

#### Cross-Story Dependencies

- Update dependencies as story relationships change
- Ensure dependency changes don't break development sequencing
- Validate that updated dependencies are implementable

### Example Usage

```markdown
**Story Name**: burst-compilation-integration.md
**Update Description**: Update status from In Progress to Completed and add performance benchmarks
**Specific Changes**:

- Change status from 📝 In Progress to ✅ Completed
- Add performance benchmark criteria to acceptance criteria
- Update Definition of Done to include performance validation
  **Impact Assessment**: No impact on dependent stories, may enhance related performance stories
  **Validation Requirements**: Check consistency with other performance-related stories
```

This prompt ensures that user story updates are performed systematically while maintaining the integrity and consistency of all project documentation and following the INVEST principles for effective user story management.
