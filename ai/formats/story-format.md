# Story Format Specification

## Overview

This document defines the canonical format for all user story files. All prompts that create or modify user stories must follow this exact specification to ensure consistency across the entire story collection.

## Purpose

User stories serve as the primary mechanism for capturing and communicating user requirements in the project, enabling:

- **User-Centered Development**: Focus development efforts on delivering value to specific user types
- **Clear Communication**: Provide unambiguous requirements that both technical and non-technical stakeholders can understand
- **Testable Requirements**: Define acceptance criteria that enable objective validation of implementation
- **Agile Planning**: Support iterative development with appropriately sized, independent work items
- **Traceability**: Maintain clear connections between user needs, epics, and technical implementation

## Template

```markdown
# [Brief descriptive title]

**Epic**: [Link to Source Epic](../epics/epic-name.md)
**Role**: Store Owner | Marketer | Shopper | System | Developer | [Other Role]
**Priority**: Critical | High | Medium | Low
**Status**: ✅ Completed | 📝 In Progress | ⏳ Not Started
**Dependencies**:

- [Story Name 1](./story-name-1.md)
- [Story Name 2](./story-name-2.md)
- None

**Estimated Effort**: XS (1-2 hours) | S (1-2 days) | M (3-5 days) | L (1-2 weeks) | XL (2+ weeks)

## Story Statement

**As a** [Role]  
**I want** to [Goal]  
**So that** [Benefit]

## Detailed Description

Comprehensive description of what the user needs to accomplish, including context, motivation, and expected outcomes. Explain the user's situation and why this capability is important.

## Acceptance Criteria

### Functional Requirements

- **Given** [initial condition] - **When** [action] - **Then** [expected result]
- **Given** [initial condition] - **When** [action] - **Then** [expected result]
- **Given** [initial condition] - **When** [action] - **Then** [expected result]

### Non-Functional Requirements

- **Performance**: [specific performance requirements]
- **Usability**: [specific usability requirements]
- **Security**: [specific security requirements]
- **Reliability**: [specific reliability requirements]

## User Experience Flow

Step-by-step description of how the user will interact with the system:

1. User [action/situation]
2. System [response/state]
3. User [next action]
4. System [final state/outcome]

## Technical Context

- **Epic Integration**: How this story fits within the broader epic
- **System Components**: Which systems or components are involved
- **Data Requirements**: What data is needed or modified
- **Integration Points**: How this story connects to other stories or systems

## Definition of Done

Specific criteria that must be met for the story to be considered complete:

- [ ] Functional requirements implemented and tested
- [ ] Non-functional requirements verified
- [ ] User experience flows tested with real users
- [ ] Integration with related stories validated
- [ ] Documentation updated
- [ ] Code reviewed and approved

## Notes

Additional context, implementation considerations, or special requirements for this story.

---

### Optional Sections

_Include only when they add significant value_

## Technical Implementation

_For completed stories only_
Current implementation status and technical details:

- Implementation approach and architecture decisions
- Key technical components and their interactions
- Performance characteristics and optimization details
- Integration points with other systems

## Functional Requirements

_When acceptance criteria need expansion_
Detailed functional requirements not covered in acceptance criteria:

- Core functionality and behavior specifications
- System interactions and data flow requirements
- Business rules and validation logic

## Non-Functional Requirements

_When acceptance criteria need expansion_
Detailed non-functional requirements beyond acceptance criteria:

- Performance benchmarks and scalability requirements
- Security and compliance requirements
- Usability and accessibility standards
- Reliability and availability requirements

## Testing Requirements

_For complex testing scenarios_
Specific testing approaches and requirements:

- Unit test requirements and coverage goals
- Integration test scenarios and validation
- Performance test criteria and benchmarks
- User acceptance test procedures

## Integration Points

_For significant system integration_
Detailed integration requirements and interfaces:

- System dependencies and data exchange
- API specifications and communication protocols
- Event handling and notification requirements

## Related Stories

_When relationships provide valuable context_
Links to related stories and their relationships:

- [Related Story 1](./related-story-1.md): Description of relationship
- [Related Story 2](./related-story-2.md): Description of relationship
```

## Content Guidelines

### File Naming Convention

- Use kebab-case for file names (e.g., `widget-modal-launcher.md`, `discount-code-creation.md`)
- Story names should be clear and descriptive of the specific functionality or capability
- Names should reflect the user goal or system capability being addressed
- File names should match the story title exactly (converted to kebab-case)

### Story Statement Section

- Follow exact Role-Goal-Benefit format with proper bold formatting
- Use specific, actionable language for goals
- Clearly articulate the user value and motivation
- Ensure roles align with defined role types

### Role Definitions

- **Store Owner**: Owns the subscription and manages the store configuration
- **Marketer**: Configures campaigns, games, targeting, prizes, and A/B tests
- **Shopper**: Interacts with the storefront widget and claims prizes
- **System**: Automated services (schedulers, webhooks, background jobs)
- **Developer**: Developers implementing and maintaining the system

### Priority Definitions

- **Critical**: Essential for MVP functionality and core experience
- **High**: Required for core workflows and user experience
- **Medium**: Enhances experience and system functionality
- **Low**: Nice-to-have features that provide additional value

### Effort Definitions

- **XS (1-2 hours)**: Minor fixes, simple configuration changes
- **S (1-2 days)**: Small features, simple UI changes, basic integrations
- **M (3-5 days)**: Moderate features, complex UI, system integrations
- **L (1-2 weeks)**: Large features, complex systems, major integrations
- **XL (2+ weeks)**: Epic-sized features requiring significant development

### Detailed Description Section

- Provide comprehensive context for the user need
- Explain the user's situation and circumstances
- Describe why this capability is important
- Include expected outcomes and success criteria

### Acceptance Criteria Section

- Use Given-When-Then format with bold keywords
- Write specific, testable requirements
- Include both functional and non-functional criteria
- Ensure criteria are objective and measurable

### User Experience Flow Section

- Describe step-by-step user interactions
- Include both user actions and system responses
- Focus on the complete user journey
- Highlight key decision points and outcomes

### Technical Context Section

- Explain how the story fits within the epic
- Identify involved systems and components
- Describe data requirements and modifications
- Map integration points with other stories

### Definition of Done Section

- List specific, measurable completion criteria
- Include both functional and quality requirements
- Ensure criteria are testable and objective
- Cover implementation, testing, and documentation

### Optional Sections Guidelines

- **Technical Implementation**: Only for completed stories with significant technical details
- **Functional/Non-Functional Requirements**: Only when acceptance criteria need expansion
- **Testing Requirements**: Only for stories with complex testing needs
- **Integration Points**: Only for stories with significant system integration
- **Related Stories**: Only when relationships provide valuable context

## Quality Standards

### INVEST Principle Compliance

- **Independent**: Story can be developed without depending on other stories
- **Negotiable**: Details can be discussed and refined during development
- **Valuable**: Story delivers clear value to the user or business
- **Estimable**: Development team can estimate effort required
- **Small**: Story can be completed within estimated timeframe
- **Testable**: Story has clear acceptance criteria that can be verified

### Role-Goal-Benefit Framework

- **Role**: Clear identification of the user type and perspective
- **Goal**: Specific, actionable objective the user wants to achieve
- **Benefit**: Clear value proposition and motivation for the user

### Technical Accuracy

- Web/Node architecture alignment where applicable
- Consistent terminology with other project documentation
- Accurate technical requirements and constraints
- Proper integration with existing systems

### Content Quality

- Clear, concise writing free of ambiguity
- Specific, actionable requirements
- Appropriate level of detail for target audience
- Consistent terminology and formatting

### Format Compliance

- Section order matches template exactly
- Headers use exact naming and formatting
- Metadata fields use specified options only
- Status indicators use correct emoji format
- Optional sections included only when valuable

## Validation Checklist

Before finalizing any story, verify:

- [ ] Story follows exact template format with all required sections
- [ ] Story follows Role-Goal-Benefit format correctly with proper bold formatting
- [ ] Story meets all INVEST criteria
- [ ] Status uses correct emoji format (✅ 📝 ⏳)
- [ ] Acceptance criteria use proper Given-When-Then format with bold keywords
- [ ] All required sections are present and in correct order
- [ ] Dependencies section is not empty (use "None" if no dependencies)
- [ ] Acceptance criteria are comprehensive and testable
- [ ] Story is properly categorized and prioritized
- [ ] Story integrates properly with related stories and epics
- [ ] Story is implementable within estimated effort
- [ ] Optional sections are only included when they add value
- [ ] Content is clear, accurate, and complete
- [ ] Terminology is consistent with other stories and project documentation

## Common Patterns and Examples

### Story Statement Examples

- **Marketer Role**: "As a marketer, I want to configure a spin wheel campaign so that I can capture more qualified leads"
- **Shopper Role**: "As a shopper, I want to claim a discount easily so that I can complete my purchase"
- **Developer Role**: "As a developer, I want a typed SDK for the widget so that integrations are reliable and fast to implement"

### Acceptance Criteria Examples

- **Given** widget_loaded - **When** trigger_fired:exit_intent - **Then** the game modal displays within 100ms
- **Given** prize_revealed(10OFF) - **When** prize_claimed - **Then** a single-use discount code is created and shown within 300ms

### User Experience Flow Examples

1. Shopper triggers exit intent on cart page
2. System launches widget modal with configured game
3. Shopper plays and receives prize
4. System displays discount code and tracks analytics event

## Usage Instructions for Prompts

### When Creating New Stories

1. **Always reference this specification**: Include the format requirement in your prompt
2. **Use the exact template**: Follow the structure and section order precisely
3. **Validate against checklist**: Ensure all validation criteria are met
4. **Check optional sections**: Only include optional sections when they provide value

### When Updating Existing Stories

1. **Preserve existing content**: Maintain valuable content while updating format
2. **Apply template structure**: Ensure section order and formatting match specification
3. **Update metadata**: Use current status indicators and priority levels
4. **Validate consistency**: Check that updates align with related stories and epics

### Format Reference Pattern

Use this exact reference in prompts:

```markdown
**Story Format**: Follow the canonical story format defined in [Story Format Specification](../formats/story-format.md)
```

## Cross-References

### Related Formats

- [Epic Format Specification](./epic-format.md) - Parent format for user stories
- [Component Format Specification](./component-format.md) - Technical implementation details

### Related Documentation

- [Product Roadmap](../../product/roadmap.md) - Strategic context for stories
- [Current Stories](../../product/stories.md) - Collection of all user stories
- [Current Epics](../../product/epics.md) - Parent epics for stories

## Notes

- This specification is the single source of truth for all user story formatting
- All prompts must reference this specification rather than duplicating format requirements
- Regular validation of existing stories against this specification is recommended
- Changes to this specification should be coordinated with all dependent prompts
- Story format should evolve based on development team feedback and usage patterns
