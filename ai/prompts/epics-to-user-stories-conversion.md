# Epics to User Stories Conversion Prompt

## Objective

Convert development epics into comprehensive, detailed user stories that break down each epic into small, implementable chunks following the Role-Goal-Benefit framework and INVEST principles. This prompt generates detailed user story specifications, maintains a master story list, and creates links between epics and their constituent user stories to provide granular development guidance.

## Vision Context Loading

**CRITICAL FIRST STEP**: Before proceeding with any epic to user stories conversion activities, you MUST load the product specification into context to ensure all operations are taken with the product vision in mind.

1. **Load Product Spec**: Read and analyze the complete [`ai/context/product_spec.md`](../../ai/context/product_spec.md) file to understand:
   - Core value proposition and game types
   - Technical architecture (widget, admin, backend)
   - Integrations (Shopify, WooCommerce, etc.)
   - Performance/security/accessibility requirements
   - Roles, core data model, and event vocabulary

2. **Vision Alignment**: Ensure that all story conversion decisions, user roles, goals, and acceptance criteria align with the established product vision and contribute to business outcomes.

3. **Context Integration**: Use the vision as the primary reference for determining story scope, user workflows, and integration with existing gameplay systems.

## Context

You are tasked with analyzing epic files and creating detailed user story specifications:

- **Epic Files** (`./product/epics/*.md`): Development epics containing high-level "User Stories (Examples)" sections
- **Story Overview** (`./product/stories.md`): Master list tracking all user stories with status and links
- **Individual Story Files** (`./product/stories/*.md`): Detailed specifications for each user story

User stories represent the specific, testable behaviors and capabilities that users (marketers, store owners, shoppers, systems, developers) need from the system. They bridge the gap between epic-level requirements and individual development tasks.

## User Story Definition Standards

### What is a Good User Story?

A good user story follows the Role-Goal-Benefit framework and INVEST principles:

#### Role-Goal-Benefit Framework

- **As a [Role]**: Who is the user? (Player, AI Entity, Colonist, System Administrator)
- **I want to [Goal]**: What does the user want to accomplish?
- **So that [Benefit]**: Why does the user want this? What value does it provide?

#### INVEST Principles

- **Independent**: Story can be developed without depending on other stories
- **Negotiable**: Details can be discussed and refined during development
- **Valuable**: Story delivers clear value to the user or business
- **Estimable**: Development team can estimate effort required
- **Small**: Story can be completed within a single sprint
- **Testable**: Story has clear acceptance criteria that can be verified

### User Story Granularity Guidelines

- **Too Broad**: "As a player, I want to manage my colony" (this is epic-level)
- **Too Narrow**: "As a player, I want a button to click" (this is implementation detail)
- **Just Right**: "As a player, I want to see my colony's current power consumption so that I can identify systems that need more power"

### User Story Categories

- **Functional Stories**: Core gameplay features and system behaviors
- **Non-Functional Stories**: Performance, security, usability, and quality requirements
- **Technical Stories**: Infrastructure, architecture, and development tool requirements
- **User Experience Stories**: Interface, accessibility, and player experience requirements

## Instructions

### 1. Epic Analysis Phase

Analyze existing epics to understand user story extraction needs:

#### Context Enhancement Research

Before analyzing epics, review available context files in the `ai/context/` folder (e.g., `product_spec.md`) to enhance your understanding of:

- Roles and responsibilities (Store Owner, Marketer, Shopper, System, Developer)
- Core data model (Campaign, Game, Prize, TriggerRule, Lead, Event, Integration, ABTest)
- Event vocabulary and non-functional targets
- Integration requirements (Shopify OAuth, ScriptTag, discount APIs, webhooks)
- Performance, security, and accessibility requirements

Use context information to:

- Understand detailed user needs beyond what's expressed in epic examples
- Identify technical constraints and capabilities that affect user story scope
- Validate user story scenarios against actual system capabilities
- Ensure user stories align with established user experience patterns
- Enhance user stories with specific technical and design details from context

### Context File Updates

After converting epics to user stories, update the context system to reflect detailed user interaction patterns:

#### Context Update Requirements

When converting epics to user stories, update relevant context files to capture:

- **Detailed User Patterns**: Specific user interaction patterns derived from user stories
- **Behavioral Workflows**: User workflows and behavioral patterns from story specifications
- **Technical User Requirements**: Technical requirements from user story acceptance criteria
- **Experience Patterns**: User experience patterns and interface requirements
- **Integration Insights**: How user interactions affect system integration

#### Context File Update Process

1. **Review Story Creation**: Analyze what user stories have been created from epics
2. **Extract User Patterns**: Identify user interaction and behavioral patterns from stories
3. **Update Context Files**: Modify context files to include story-derived user insights
4. **Create User Context**: Add new context files for user-specific patterns
5. **Update Cross-References**: Link context files to relevant user stories and epics

#### Context Format for Epic-to-Story Conversion

When updating context files based on epic-to-story conversion, follow the format defined in [Context Format Specification](../formats/context-format.md). Use the **Story-Generated Context Files** section format for the content sections, with additional information about the story conversion process.

#### Context Categories for Epic-to-Story Updates

- **Gameplay**: Detailed user interaction patterns and player experience flows
- **Design**: User experience patterns and interface requirements from stories
- **Systems**: Technical requirements and integration patterns from user stories
- **Entities**: User relationships with entities and behavioral patterns
- **Game Mechanics**: Detailed gameplay mechanics and interaction patterns

#### Epic Discovery and Assessment

- Read epic files in `./product/epics/` to identify those with "User Stories (Examples)" sections
- Assess which epics need user story expansion based on complexity and development readiness
- Check existing `./product/stories.md` to understand current story coverage
- Identify epics that have brief user story examples but lack detailed story specifications

#### User Story Extraction Strategy

For each epic, analyze the "User Stories (Examples)" section and other epic content to:

- Identify user story examples that need detailed specification
- Determine which user roles are involved (Marketer, Store Owner, Shopper, System, Developer)
- Assess story complexity and development priority
- Extract implied user stories from acceptance criteria, key components, and technical requirements

### 2. User Story Identification and Expansion

Transform brief user story examples into detailed specifications:

#### Story Expansion Process

- Take each example user story from the epic
- Expand the Role-Goal-Benefit statement with specific details
- Add comprehensive acceptance criteria using Given-When-Then format
- Include both functional and non-functional requirements
- Identify dependencies and integration points with other stories

#### Cross-Epic Story Analysis

- Search for similar user stories across multiple epics
- Identify shared user roles and common goals
- Plan story reuse and integration strategies
- Resolve naming conflicts and terminology inconsistencies

### 3. Story Specification Creation

Create detailed user story files following this structure:

#### Individual Story File Structure

**Story Format**: Follow the canonical story format defined in [Story Format Specification](../formats/story-format.md)

All user story files must adhere to the exact template structure, section order, and content guidelines specified in the format specification. This ensures consistency across all story files and integration with the broader development workflow.

### 4. Story Organization and Categorization

Organize user stories by category and priority:

#### Story Categories

- **Widget Platform**
- **Admin Panel**
- **Backend Services**
- **Integrations**
- **Analytics & Reporting**
- **Security & Compliance**
- **UX & Accessibility**
- **Non-Functional**

#### Priority Guidelines

- **Critical**: Stories essential for MVP functionality
- **High**: Stories required for core gameplay loops
- **Medium**: Stories that enhance gameplay experience
- **Low**: Stories that provide nice-to-have features

### 5. Master Story List Management

Create and maintain `./product/stories.md` with comprehensive tracking:

#### Story Overview Structure

```markdown
# Planetform User Stories

## Story Categories Overview

This document organizes all user stories extracted from development epics. Stories represent specific, testable behaviors and capabilities that bridge epic-level requirements with individual development tasks.

### Status Legend

- ✅ **Completed**: Story specification has been written and is ready for implementation
- 📝 **Pending**: Story needs detailed specification
- [x] **Checked**: Story file exists and is complete
- [ ] **Unchecked**: Story file does not exist or is incomplete

## Core Gameplay Stories

- [ ] [Story Name 1](./stories/story-name-1.md) 📝
- [x] [Story Name 2](./stories/story-name-2.md) ✅

## System Management Stories

- [ ] [Story Name 3](./stories/story-name-3.md) 📝
- [ ] [Story Name 4](./stories/story-name-4.md) 📝

## Epic-to-Story Mapping

- [Epic Name 1](./epics/epic-name-1.md) → X stories
- [Epic Name 2](./epics/epic-name-2.md) → X stories

## Story Development Priority

### Critical Path Stories

- Story Name 1 (Core gameplay requirement)
- Story Name 2 (System foundation)

### High Priority Stories

- Story Name 3 (Player experience enhancement)
- Story Name 4 (System integration)

## Statistics

- **Total Stories**: X
- **Completed**: X (✅)
- **Pending**: X (📝)
- **Completion Rate**: X%
```

### 6. Epic Integration Updates

Update epic files to link to their constituent user stories:

**Epic Format**: When updating epics, maintain the format defined in [Epic Format Specification](../formats/epic-format.md)

#### Epic User Stories Section Update

Replace the "User Stories (Examples)" section with:

```markdown
## User Stories

- [Story Name 1](../stories/story-name-1.md): Brief description
- [Story Name 2](../stories/story-name-2.md): Brief description
- [Story Name 3](../stories/story-name-3.md): Brief description

See [User Stories Overview](../stories.md) for complete story tracking and status.
```

Ensure the section maintains its proper position according to the Epic Format Specification.

## User Story Quality Standards

### Critical Format Requirements

**ALL user stories must follow these exact formatting rules:**

1. **Status Format**: Use emoji indicators (✅ Completed, 📝 In Progress, ⏳ Not Started)
2. **Story Statement Format**: Use bold "As a", "I want", "So that" with line breaks
3. **Acceptance Criteria Format**: Use Given-When-Then with bold keywords and dashes
4. **Section Order**: Follow the template order exactly - no deviations allowed
5. **Headers**: Use exact header names and formatting as shown in template
6. **Dependencies**: Either list specific stories or use "None" - never leave blank

### Role Definition Standards

- **Store Owner**: Subscription owner managing store configuration
- **Marketer**: Configures campaigns/games/targeting/prizes
- **Shopper**: Interacts with widget and claims prizes
- **System**: Automated services (schedulers, webhooks, jobs)

### Goal Clarity Standards

- Goals must be specific and actionable
- Goals must be observable and measurable
- Goals must be achievable within the story scope
- Goals must directly serve the user's needs

### Benefit Articulation Standards

- Benefits must be clear and meaningful to the user
- Benefits must justify the development effort
- Benefits must align with the overall game vision
- Benefits must be testable and verifiable

### Acceptance Criteria Standards

- Use Given-When-Then format for functional requirements
- Include specific metrics for non-functional requirements
- Ensure all criteria are testable and objective
- Cover both happy path and edge cases

## Output Requirements

### Primary Deliverables

1. **Updated Story Overview**: `./product/stories.md` with comprehensive story tracking
2. **Individual Story Files**: Detailed specifications for each user story
3. **Epic Updates**: Updated epic files with links to their constituent user stories
4. **Cross-Reference Updates**: Proper linking between stories, epics, and related content

### Documentation Requirements

1. **Story Extraction Report**: Summary of stories extracted from each epic
2. **Priority Assessment**: Justification for story prioritization
3. **Integration Analysis**: How stories connect to each other and to epics
4. **Development Roadmap**: Recommended order for story implementation

## Common User Story Patterns

### Core Gameplay Patterns

- **Resource Management**: "As a player, I want to monitor resource levels so that I can prevent shortages"
- **Colony Development**: "As a player, I want to expand my colony so that I can support more colonists"
- **System Monitoring**: "As an AI entity, I want to monitor my power consumption so that I can avoid shutdown"

### System Integration Patterns

- **Data Access**: "As a system, I want to access colonist data so that I can make informed decisions"
- **Event Handling**: "As a system, I want to respond to resource shortages so that I can prevent colony failure"
- **Communication**: "As a system, I want to notify the player of critical events so that they can take action"

### User Experience Patterns

- **Information Display**: "As a player, I want to see system status so that I can understand current conditions"
- **Interaction Feedback**: "As a player, I want immediate feedback on my actions so that I know they were successful"
- **Error Prevention**: "As a player, I want to be warned about dangerous actions so that I can avoid mistakes"

## Validation and Quality Assurance

### Story Validation Checklist

Use the [Story Format Specification](../formats/story-format.md) validation checklist to ensure all stories meet quality standards:

- [ ] Story follows exact template format with all required sections
- [ ] Story follows Role-Goal-Benefit format correctly with proper bold formatting
- [ ] Story meets all INVEST criteria
- [ ] Status uses correct emoji format (✅ 📝 ⏳)
- [ ] Acceptance criteria use proper Given-When-Then format with bold keywords
- [ ] All sections are present and in correct order
- [ ] Dependencies section is not empty (use "None" if no dependencies)
- [ ] Acceptance criteria are comprehensive and testable
- [ ] Story is properly categorized and prioritized
- [ ] Story integrates properly with related stories and epics
- [ ] Story is implementable within estimated effort

### Epic Integration Validation

- [ ] All epic user story examples have been expanded
- [ ] Epic links to all constituent user stories
- [ ] Story priorities align with epic priorities
- [ ] Story dependencies match epic dependencies
- [ ] Stories collectively fulfill epic acceptance criteria

### Cross-Story Consistency

- [ ] Similar user roles are defined consistently
- [ ] Related goals use consistent terminology
- [ ] Integration points between stories are well-defined
- [ ] Story dependencies are logical and implementable

## Success Metrics

The resulting user story specifications should enable the development team to:

1. Understand specific user needs and motivations clearly
2. Implement features that deliver real value to users
3. Test user stories independently and in integration scenarios
4. Estimate development effort accurately for sprint planning
5. Maintain consistent user experience across all features
6. Track progress at a granular level throughout development
7. Validate that epic-level requirements are being met
8. Adapt to changing requirements while maintaining user focus

## Usage Instructions

### For Fresh Story Generation

1. **Epic Analysis**: Read all epic files to identify user story examples
2. **Story Planning**: Plan story expansion and categorization
3. **Specification Creation**: Create detailed story specifications
4. **Epic Integration**: Update epics to link to their constituent stories
5. **Master List Creation**: Create comprehensive story overview with status tracking

### For Incremental Updates

1. **Status Assessment**: Review existing story list to understand current coverage
2. **Gap Analysis**: Identify epics that need user story expansion
3. **Priority Planning**: Focus on high-priority stories for immediate development needs
4. **Specification Updates**: Create new story specifications and update existing ones
5. **Cross-Reference Updates**: Ensure all epic-story links remain valid

### For Story Refinement

1. **Format Consistency**: Review existing stories for adherence to canonical template
2. **Section Completeness**: Ensure all required sections are present and properly formatted
3. **Status Updates**: Update status indicators to use correct emoji format
4. **Acceptance Criteria**: Standardize Given-When-Then format across all stories
5. **Missing Sections**: Add User Experience Flow and Definition of Done where missing
6. **Feedback Integration**: Incorporate user feedback and testing insights
7. **Priority Adjustments**: Adjust story priorities based on development constraints
8. **Integration Updates**: Update story relationships and dependencies

### For Existing Story Format Updates

When updating existing user stories to match the canonical format:

1. **Review Current Format**: Check each story against the canonical template
2. **Identify Gaps**: Note missing sections, incorrect formatting, or inconsistent structure
3. **Apply Template**: Update stories to match exact template format and section order
4. **Preserve Content**: Maintain existing content while reformatting structure
5. **Validate Consistency**: Ensure all stories follow identical format standards
6. **Update Links**: Verify all cross-references remain valid after formatting changes

## Notes

- **Format Consistency**: ALL user stories must follow the exact canonical template format with no deviations
- **Section Order**: The order of sections must match the template exactly - this is critical for maintainability
- **Status Indicators**: Always use emoji format (✅ Completed, 📝 In Progress, ⏳ Not Started)
- **Acceptance Criteria**: Must use Given-When-Then format with bold keywords and proper formatting
- User stories should be written from the user's perspective, not the system's perspective
- Stories should focus on user value and motivation, not technical implementation
- Acceptance criteria should be testable and objective, not subjective
- Story dependencies should be minimal to maintain independence
- Stories should be estimated based on development effort, not user value
- Story specifications should evolve as implementation progresses and reveals new requirements
- The story list serves as a development backlog at the most granular level
- User stories should be validated with actual users when possible to ensure they address real needs
