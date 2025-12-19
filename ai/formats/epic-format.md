# Epic Format Specification

## Overview

This document defines the canonical format for all epic files. All prompts that create or modify epics must follow this exact specification to ensure consistency across the entire epic collection.

## Purpose

Epics serve as the primary mechanism for organizing and communicating large-scale feature development, enabling:

- **Strategic Planning**: Break down complex game systems into manageable development units
- **Cross-Team Coordination**: Provide clear scope and requirements for distributed development efforts
- **Progress Tracking**: Enable milestone-based tracking of major feature development
- **Architecture Alignment**: Ensure technical consistency across related features and systems
- **Stakeholder Communication**: Provide high-level feature descriptions accessible to both technical and non-technical audiences

## Template

```markdown
# [Epic Name]

**Category**: Foundation | Widget Platform | Admin Panel | Backend Services | Integrations | Analytics & Reporting | Security & Compliance | UX & Design

**Priority**: Critical | High | Medium | Low

**Status**: ✅ Completed | 📝 In Progress | ⏳ Not Started | 📋 Backlog

**Dependencies**:

- [Epic Name 1](./epic-name-1.md)
- [Epic Name 2](./epic-name-2.md)
- None

**Estimated Effort**: Small (1-2 sprints) | Medium (3-5 sprints) | Large (6+ sprints)

## Description

Detailed description of what this epic encompasses, including key features, systems, and deliverables. Explain the user value and how it fits into the overall product vision.

## Key Components

- Component 1: Brief description
- Component 2: Brief description
- Component 3: Brief description

## Acceptance Criteria

- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
- [ ] Specific deliverable 3

## Technical Requirements

- Web/Node architecture requirements
- Performance considerations and budgets
- Integration points with other systems and platforms

## User Stories (Examples)

- As a marketer, I want to configure a spin wheel campaign so that I can capture more leads
- As a shopper, I want to claim my discount code so that I can complete my purchase

## Risks and Assumptions

- Technical risks
- Design assumptions
- Dependencies on external factors

## Notes

Additional context, implementation notes, or considerations for this epic.
```

## Content Guidelines

### File Naming Convention

- Use kebab-case for file names (e.g., `ai-core-system.md`, `basic-building-system.md`)
- Epic names should be clear and descriptive of the main system or feature
- Avoid overly technical jargon in favor of feature-focused naming

### Category Definitions

- **Foundation**: Core architecture and platform capabilities
- **Widget Platform**: Client-side widget SDK, game runtime, theming
- **Admin Panel**: Admin UI, configuration, RBAC, tenant settings
- **Backend Services**: APIs and services for campaigns, prizes, events
- **Integrations**: E-commerce platform adapters (Shopify, WooCommerce, etc.)
- **Analytics & Reporting**: Event ingestion, dashboards, exports
- **Security & Compliance**: Auth, rate limiting, data protection
- **UX & Design**: Usability, accessibility, visual design systems

### Priority Definitions

- **Critical**: Essential for MVP or foundation systems
- **High**: Important for core gameplay loops
- **Medium**: Valuable enhancements to gameplay
- **Low**: Nice-to-have features

### Status Definitions

- **✅ Completed**: Epic specification is complete and ready for implementation
- **📝 In Progress**: Epic is being worked on or partially complete
- **⏳ Not Started**: Epic has not been started
- **📋 Backlog**: Epic is valid but not prioritized for current development cycle

### Effort Definitions

- **Small (1-2 sprints)**: Simple systems with minimal complexity
- **Medium (3-5 sprints)**: Moderate complexity systems with some integration
- **Large (6+ sprints)**: Complex systems with significant integration requirements

### Description Section

- Provide comprehensive overview of epic scope and value
- Explain how the epic fits into the overall game vision
- Include context for why this epic is necessary
- Describe the user value and experience impact

### Key Components Section

- List major deliverables and systems
- Keep descriptions brief but informative
- Focus on user-facing features and technical components
- Organize logically by functional area

### Acceptance Criteria Section

- Use specific, testable requirements
- Write criteria that can be objectively verified
- Include both functional and technical requirements
- Ensure criteria are realistic and achievable

### Technical Requirements Section

- Specify Web/Node architecture requirements
- Include performance considerations and constraints (e.g., p95 latencies, bundle budgets)
- Identify integration points with other systems (e.g., discount APIs, webhooks)
- Note any special technical constraints or requirements

### User Stories Section

- Provide concrete examples of user needs
- Use proper Role-Goal-Benefit format
- Use roles such as Marketer, Store Owner, Shopper, System, Developer
- Focus on value and motivation, not implementation

### Risks and Assumptions Section

- Identify technical risks and mitigation strategies
- Document design assumptions that may need validation
- Note dependencies on external factors or decisions
- Include any known constraints or limitations

### Notes Section

- Additional context and implementation considerations
- Special requirements or constraints
- References to related documentation or resources
- Any other relevant information for implementers

## Quality Standards

### Content Quality

- **Clarity**: All content must be clear and unambiguous
- **Completeness**: All sections must be present and properly filled
- **Accuracy**: Technical information must be correct and feasible
- **Consistency**: Terminology and approach must align with other epics

### Technical Quality

- **Web/Node Alignment**: All technical requirements must align with Web/Node architecture
- **Performance Considerations**: Performance requirements must be realistic and measurable
- **Integration Compatibility**: Integration points must be clearly defined and compatible
- **Dependency Logic**: Dependencies must be logical and implementable

### Cross-Epic Consistency

- **Terminology**: Use consistent terms across all epics
- **Technical Approaches**: Maintain compatible architecture decisions
- **Integration Patterns**: Use consistent integration patterns
- **User Experience**: Maintain consistent user experience approaches

### Format Compliance

- Section order matches template exactly
- Headers use exact naming and formatting
- Metadata fields use specified options only
- Status indicators use correct emoji format
- Dependencies section not empty (use "None" if applicable)

## Validation Checklist

Before finalizing any epic, verify:

- [ ] Epic follows exact template format with all required sections
- [ ] All metadata fields are present and use correct options
- [ ] Status uses correct emoji format (✅ 📝 ⏳)
- [ ] Dependencies section is not empty (use "None" if no dependencies)
- [ ] Acceptance criteria are specific and testable
- [ ] Technical requirements align with Web/Node architecture
- [ ] User stories follow Role-Goal-Benefit format
- [ ] Content is clear, accurate, and complete
- [ ] Terminology is consistent with other epics
- [ ] Integration points are well-defined

## Common Patterns and Examples

### Epic Title Examples

- "Game Widget Platform" - Foundation epic for widget SDK and runtime
- "Campaign Management" - Admin epic for configuring campaigns, games, and targeting
- "Shopify Integration" - Integration epic for install, webhooks, and discount APIs

### Description Examples

- **Foundation Epic**: "This epic establishes the client-side widget platform, including SDK, theming, event bus, and launcher, forming the base for all game experiences on merchant storefronts..."
- **Feature Epic**: "This epic provides marketers with the ability to create and manage promotional campaigns, configure games, define prizes, and preview experiences before publishing..."

### Technical Requirements Examples

- "Widget per-game bundle ≤100KB gzipped; TTI <1s on mid-tier mobile over 4G"
- "p95 API latency <200ms for prize distribution endpoints; prize claim display <300ms"
- "Shopify integration must support OAuth, ScriptTag install, discount code creation, and order webhooks with idempotency keys"

## Usage Instructions for Prompts

### When Creating New Epics

1. **Always reference this specification**: Include the format requirement in your prompt
2. **Use the exact template**: Follow the structure and section order precisely
3. **Validate against checklist**: Ensure all validation criteria are met
4. **Consider dependencies**: Map relationships with existing epics

### When Updating Existing Epics

1. **Preserve existing content**: Maintain valuable content while updating format
2. **Apply template structure**: Ensure section order and formatting match specification
3. **Update metadata**: Use current status indicators and priority levels
4. **Validate consistency**: Check that updates align with related epics

### Format Reference Pattern

Use this exact reference in prompts:

```markdown
**Epic Format**: Follow the canonical epic format defined in [Epic Format Specification](../formats/epic-format.md)
```

### Cross-Reference Requirements

#### Epic-to-Epic References

- Use relative links for all epic references
- Ensure link text matches exact epic names
- Update links when epic names change
- Validate that all referenced epics exist

#### Dependency Management

- List dependencies in logical order
- Ensure dependencies are implementable
- Avoid circular dependencies
- Update reverse dependencies when adding new dependencies

#### Integration Points

- Clearly define how epics integrate with each other
- Specify data flow and communication patterns
- Identify shared components or interfaces
- Ensure integration approaches are compatible

## Cross-References

### Related Formats

- [Story Format Specification](./story-format.md) - Child format derived from epics
- [Component Format Specification](./component-format.md) - Technical implementation details

### Related Documentation

- [Product Roadmap](../../product/roadmap.md) - Strategic context for epics
- [Current Epics](../../product/epics.md) - Collection of all epics
- [Current Stories](../../product/stories.md) - User stories derived from epics

## Notes

- This specification is the single source of truth for epic format
- All prompts must reference this specification rather than duplicating format requirements
- Any changes to epic format must be made here first, then propagated to prompts
- Consistency across all epics is critical for maintainability and usability
- Regular validation of existing epics against this specification is recommended
