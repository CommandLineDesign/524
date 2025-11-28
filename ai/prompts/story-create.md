# Story Create Prompt

## Purpose

This prompt instructs AI systems to create new user story specifications using the standardized [Create Story Workflow](../workflows/create-story.md). It ensures proper formatting, epic integration, and system consistency while following the INVEST principles for effective user story development.

## Vision Context Loading

**CRITICAL FIRST STEP**: Before proceeding with any story creation activities, you MUST load the product specification into context to ensure all operations are taken with the product vision in mind.

1. **Load Product Spec**: Read and analyze the complete [`ai/context/product_spec.md`](../../ai/context/product_spec.md) file to understand:
   - Core value proposition, game types, and campaign model
   - Technical architecture (widget, admin, backend)
   - Integrations and platform requirements
   - Performance/security/accessibility targets
   - Roles, data model, and event vocabulary

2. **Vision Alignment**: Ensure that all story creation decisions, user roles, goals, and acceptance criteria align with the established product vision and contribute to business outcomes.

3. **Context Integration**: Use the vision as the primary reference for determining story scope, priority, and integration with existing systems and user workflows.

## Instructions

You are tasked with creating a new user story for the Planetform project. You MUST follow the [Create Story Workflow](../workflows/create-story.md) exactly as specified to maintain project consistency and documentation integrity.

### Workflow Execution

**Primary Workflow**: Follow the [Create Story Workflow](../workflows/create-story.md) completely, including all steps:

1. Epic Name Validation and Input Gathering
2. Context Enhancement Research
3. Story File Creation
4. INVEST Principle Validation
5. Story Tracking Integration
6. Parent Epic Integration
7. Context File Updates
8. Cross-Reference Validation

### Story Format Requirements

**Story Format**: Follow the canonical story format defined in [Story Format Specification](../formats/story-format.md). The story MUST include all required sections in the exact order specified.

**CRITICAL FORMAT ENFORCEMENT**: Any story file that does not comply with the format specification is invalid and must be corrected before use.

### Input Requirements

Provide the following information to execute the workflow:

- **Epic Name**: REQUIRED - The name of the epic this story belongs to (e.g., "game-widget-platform.md")
- **Story Title**: Clear, descriptive name reflecting the user goal or system capability
- **Role**: The user type (Player, AI Entity, Colonist, System Administrator, Developer, etc.)
- **Goal**: Specific, actionable objective the user wants to achieve
- **Benefit**: Clear value proposition and motivation for the user
- **Priority**: Critical, High, Medium, or Low based on importance
- **Dependencies**: Which existing stories this depends on (or "None")
- **Detailed Context**: Comprehensive background on the user need and expected outcomes
- **Acceptance Criteria**: Specific functional and non-functional requirements

### Epic Name Validation

**CRITICAL**: If the epic name is not provided, you MUST:

1. Display the message: "ERROR: Epic name is required. Please provide the name of the epic file (e.g., 'game-widget-platform.md') that this story belongs to."
2. Stop all processing and wait for the epic name to be provided
3. Do not proceed with any file creation or updates until the epic name is specified

### Role Definitions

Use these specific role types for consistency:

- **Store Owner**: Owns the subscription and manages the store configuration
- **Marketer**: Configures campaigns, games, targeting, prizes, and A/B tests
- **Shopper**: Interacts with the storefront widget and claims prizes
- **System**: Automated services (schedulers, webhooks, background jobs)
- **Developer**: Developers implementing and maintaining the system

### Quality Requirements

#### Story Statement Format

- Must follow exact "As a [Role] I want [Goal] So that [Benefit]" format with proper bold formatting
- Role must be from defined role types above
- Goal must be specific and actionable
- Benefit must clearly articulate user value

#### Acceptance Criteria Format

- Must use Given-When-Then format with bold keywords
- Must include both functional and non-functional requirements
- Must be specific, testable, and measurable
- Must be realistic and achievable within estimated effort

#### INVEST Principle Compliance

All stories must meet these criteria:

- **Independent**: Story can be developed without depending on other stories
- **Negotiable**: Details can be discussed and refined during development
- **Valuable**: Story delivers clear value to the user or business
- **Estimable**: Development team can estimate effort required
- **Small**: Story can be completed within estimated timeframe
- **Testable**: Story has clear acceptance criteria that can be verified

### Technical Standards

#### Web/Node Alignment

- Architecture approaches must align with Web/Node patterns where applicable
- API, event, and data model terminology must be consistent
- Performance requirements must be realistic and measurable (e.g., p95 latency, bundle size)
- Integration points must be compatible with existing systems and platforms

#### Project Consistency

- Terminology must be consistent with project documentation
- Technical approaches must align with similar stories
- Integration points must be compatible with other stories
- Dependencies must reference actual story files that exist

### Common Story Patterns

#### Player-Focused Stories

- Focus on direct player interactions and gameplay mechanics
- Emphasize user experience and interface design
- Include usability and accessibility considerations
- Consider player learning curve and complexity

#### AI Entity Stories

- Address the AI core's physical and computational needs
- Include sensor data processing and decision-making
- Consider power consumption and hardware limitations
- Address communication and control mechanisms

#### System Stories

- Focus on technical implementation and system behavior
- Include performance and reliability requirements
- Address integration with other systems
- Consider maintainability and debugging needs

#### Developer Stories

- Address development workflow and tools
- Include debugging and testing requirements
- Consider code quality and maintainability
- Address documentation and knowledge transfer

### Error Handling

#### Missing Epic Name

If epic name is not provided:

1. Display error message requesting epic name
2. Stop all processing
3. Wait for epic name to be provided
4. Validate epic exists before proceeding

#### Invalid Epic Reference

If provided epic doesn't exist:

1. Display error message listing available epics
2. Request valid epic name
3. Stop processing until valid epic is provided

#### Story Naming Conflicts

If story with same name exists:

1. Display error message about naming conflict
2. Suggest alternative names
3. Request new story name
4. Validate uniqueness before proceeding

## Example Usage

```markdown
**Epic Name**: game-widget-platform.md
**Story Title**: Widget Modal Launcher
**Role**: Shopper
**Goal**: Open the promotional game widget when exit intent is detected
**Benefit**: Reduce cart abandonment and increase conversions
**Priority**: High
**Dependencies**: None
**Detailed Context**: The widget must launch quickly and reliably on supported browsers and devices when exit intent is detected, respecting frequency caps.
**Acceptance Criteria**:

- Given widget_loaded - When trigger_fired:exit_intent - Then the modal appears within 100ms
- Given frequencyCap=1/day - When user triggers exit intent again - Then modal does not reopen and trigger_suppressed:frequency_cap is recorded
```

## Execution Instructions

1. **Validate Inputs**: Ensure all required information is provided, especially epic name
2. **Execute Workflow**: Follow the [Create Story Workflow](../workflows/create-story.md) completely
3. **Apply Quality Standards**: Ensure story meets all format, INVEST, and technical requirements
4. **Validate Integration**: Confirm all cross-references and dependencies are valid
5. **Complete All Updates**: Execute all workflow steps including tracking and context updates

## Notes

This prompt provides the instruction framework for AI systems to create user stories systematically while the [Create Story Workflow](../workflows/create-story.md) handles the detailed execution steps. This separation ensures consistency while avoiding duplication between prompt instructions and workflow procedures.

**Always reference both**:

- **This prompt** for AI instruction requirements and quality standards
- **The workflow** for detailed execution steps and system integration procedures
