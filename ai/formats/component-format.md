# Component Format Specification

## Overview

This document defines the canonical format for all product component files. All prompts that create or modify components must follow this exact specification to ensure consistency across the entire component collection.

## Purpose

Components serve as the detailed technical specifications for implementing features within epics, enabling:

- **Technical Planning**: Break down epic requirements into implementable technical units
- **Development Coordination**: Provide detailed specifications for consistent development across teams
- **Interface Definition**: Define clear APIs and integration points between system components
- **Quality Assurance**: Establish testable requirements and validation criteria for technical implementation
- **Architecture Consistency**: Ensure all technical components align with Web/Node architecture patterns

## Template

```markdown
# Component Name

**Category**: Foundation | Simulation | Interface | Integration | Utility

**Priority**: Critical | High | Medium | Low

**Status**: Not Started | In Progress | Completed

**Source Epic**: [Epic Name](../epics/epic-name.md)

**Dependencies**:

- [Component Name 1](./component-name-1.md)
- [Component Name 2](./component-name-2.md)
- None

**Estimated Effort**: Small (1-2 days) | Medium (3-5 days) | Large (1-2 weeks)

## Purpose

Clear description of what this component does and why it's needed within the context of its source epic.

## Functionality

Detailed description of the specific capabilities and behaviors this component provides:

- Function 1: Description of what it does
- Function 2: Description of what it does
- Function 3: Description of what it does

## Data Structures

Key data types and structures that this component defines or uses:

- **DataType1**: Description and usage
- **DataType2**: Description and usage
- **Interface1**: Description of the interface contract

## System Interfaces

Public APIs and integration points that this component exposes:

- **Method/API 1**: Description of interface and usage
- **Method/API 2**: Description of interface and usage
- **Event/Message Types**: Communication protocols

## Implementation Scope

What developers need to build to implement this component:

- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
- [ ] Specific deliverable 3

## Tech Plans

Technical implementation plans required to build this component:

- [ ] [Tech Plan Name 1](../../product/tech-plans/tech-plan-name-1.md) 📝 🔴
- [x] [Tech Plan Name 2](../../product/tech-plans/tech-plan-name-2.md) ✅ 🟢
- None (if no tech plans are needed)

### Tech Plan Status Legend

- **Documentation Status**: ✅ (Completed) | 📝 (Pending) | ⚠️ (Needs Regeneration)
- **Implementation Status**: 🟢 (Implemented) | 🟡 (Partially Implemented) | 🔄 (In Progress) | 🔴 (Not Started)
- **File Status**: [x] (File exists) | [ ] (File missing)

## Integration Points

How this component connects to other components and systems:

- **Input Dependencies**: What this component needs from other systems
- **Output Interfaces**: What this component provides to other systems
- **Communication Patterns**: How it interacts with related components

## Performance Characteristics

Expected load and optimization requirements:

- **Scalability**: How performance scales with usage
- **Resource Usage**: Memory, CPU, and other resource requirements
- **Optimization Targets**: Key performance goals and constraints

## Configuration Options

Settable parameters and customization capabilities:

- **Parameter 1**: Description and valid values
- **Parameter 2**: Description and valid values
- **Runtime vs. Design-time**: When parameters can be changed

## Technical Requirements

- Web/Node architecture requirements
- Browser performance and bundle size constraints
- Performance optimization needs
- Integration with existing systems and external platforms

## Testing Strategy

How this component should be tested:

- **Unit Tests**: Specific test cases for component functionality
- **Integration Tests**: Testing component interactions
- **Performance Tests**: Validating performance characteristics

## Risks and Assumptions

- Technical risks specific to this component
- Implementation assumptions
- Dependencies on external factors

## Notes

Additional context, implementation notes, or considerations for this component.
```

## Content Guidelines

### File Naming Convention

- Use kebab-case for file names (e.g., `natural-language-chat-interface.md`, `trust-relationship-modeling-system.md`)
- Component names should be clear and descriptive of the specific functionality
- Include system/domain context when helpful for clarity
- File names should match the component title exactly (converted to kebab-case)

### Category Definitions

- **Foundation**: Core architecture, data structures, base systems
- **Simulation**: Game logic, entity behavior, world simulation
- **Interface**: UI elements, input handling, user feedback systems
- **Integration**: APIs, communication layers, data exchange systems
- **Utility**: Helper systems, tools, shared functionality

### Priority Definitions

- **Critical**: Must be implemented for basic functionality
- **High**: Important for core features and user experience
- **Medium**: Valuable features that enhance the system
- **Low**: Nice-to-have features that can be deferred

### Status Definitions

- **Not Started**: Component specification is complete but implementation hasn't begun
- **In Progress**: Component is currently being implemented
- **Completed**: Component has been implemented and tested

### Effort Definitions

- **Small (1-2 days)**: Simple components with minimal complexity
- **Medium (3-5 days)**: Moderate complexity components with some integration
- **Large (1-2 weeks)**: Complex components with significant integration requirements

### Purpose Section

- Clearly state what the component does and why it's needed
- Explain how it fits within the context of its source epic
- Describe the user value and system benefits it provides
- Keep focused on the specific component's role

### Functionality Section

- List specific capabilities and behaviors the component provides
- Use bullet points for clarity and organization
- Include both user-facing and system-facing functions
- Be specific about what the component does, not how it does it

### Data Structures Section

- Define key data types and structures the component uses
- Use **bold** formatting for data type names
- Include brief descriptions of purpose and usage
- Focus on public interfaces and important internal structures

### System Interfaces Section

- Document public APIs and integration points
- Use **bold** formatting for method/API names
- Include brief descriptions of interface purpose and usage
- Cover both synchronous and asynchronous interfaces

### Implementation Scope Section

- Break down what developers need to build
- Use checkbox format for tracking implementation progress
- Be specific about deliverables and artifacts
- Include both code and non-code deliverables

### Tech Plans Section

- List all technical implementation plans required for the component
- Use relative links to tech plan files in the `../../product/tech-plans/` directory
- Include status indicators for each tech plan using the format: `[x/] [Plan Name](link) [Doc Status] [Impl Status]`
- Use checkbox format: `[x]` for existing files, `[ ]` for missing files
- Include documentation status: ✅ (Completed), 📝 (Pending), ⚠️ (Needs Regeneration)
- Include implementation status: 🟢 (Implemented), 🟡 (Partially Implemented), 🔄 (In Progress), 🔴 (Not Started)
- Use "None" if no tech plans are needed for the component
- Mark tech plans as ⚠️ when the component is modified and plans need updates
- Ensure tech plans are created and properly linked

### Integration Points Section

- Clearly define how the component connects to other systems
- Separate input dependencies from output interfaces
- Describe communication patterns and protocols
- Identify potential integration challenges

### Performance Characteristics Section

- Specify expected load and optimization requirements
- Include scalability, resource usage, and optimization targets
- Be realistic about performance expectations
- Consider both current and future performance needs

### Configuration Options Section

- Document settable parameters and customization capabilities
- Distinguish between runtime and design-time configuration
- Include default values and valid ranges where appropriate
- Consider both developer and user configuration needs

### Technical Requirements Section

- Align with Web/Node architecture requirements
- Specify performance optimization requirements (latency, throughput, bundle size)
- Document integration requirements with existing systems and external platforms

### Testing Strategy Section

- Define how the component should be tested
- Include unit, integration, and performance testing approaches
- Specify key test scenarios and success criteria
- Consider both automated and manual testing needs

### Risks and Assumptions Section

- Identify technical risks specific to the component
- Document implementation assumptions that need validation
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
- **Consistency**: Terminology and approach must align with other components

### Technical Quality

- **Web/Node Alignment**: All technical requirements must align with Web/Node architecture
- **Performance Considerations**: Performance requirements must be realistic and measurable
- **Integration Compatibility**: Integration points must be clearly defined and compatible
- **Dependency Logic**: Dependencies must be logical and implementable

### Cross-Component Consistency

- **Terminology**: Use consistent terms across all components
- **Technical Approaches**: Maintain compatible architecture decisions
- **Integration Patterns**: Use consistent integration patterns
- **Interface Standards**: Use consistent interface design patterns

### Format Compliance

- Section order matches template exactly
- Headers use exact naming and formatting
- Metadata fields use specified options only
- Status indicators use correct format
- Dependencies section not empty (use "None" if applicable)

## Validation Checklist

Before finalizing any component, verify:

- [ ] Component follows exact template format with all required sections
- [ ] All metadata fields are present and use correct options
- [ ] Status uses correct format (Not Started, In Progress, Completed)
- [ ] Dependencies section is not empty (use "None" if no dependencies)
- [ ] Implementation scope uses checkbox format for trackable deliverables
- [ ] Tech plans section is present with proper status indicators (use "None" if no tech plans needed)
- [ ] Tech plan status indicators use correct format: [x/] [Name](link) [Doc Status] [Impl Status]
- [ ] Technical requirements align with Web/Node architecture
- [ ] Integration points are clearly defined and compatible
- [ ] Performance characteristics are realistic and measurable
- [ ] Content is clear, accurate, and complete
- [ ] Terminology is consistent with other components
- [ ] Testing strategy is comprehensive and practical

## Common Patterns and Examples

### Component Title Examples

- "Widget SDK Launcher" - Interface component for rendering and opening the game widget
- "Prize Distribution Service" - Backend service component for allocating prizes
- "Shopify Discount Code Adapter" - Integration component for discount API operations

### Data Structure Examples

- **Campaign**: TypeScript interface defining campaign fields (id, name, status, startAt, endAt, rules)
- **Prize**: Interface for prize definition (id, type, value, probability, inventory)
- **Event**: Interface for analytics event (id, type, timestamp, payload, idempotencyKey)

### System Interface Examples

- **POST /api/prizes/allocate**: Returns prize allocation for a session and campaign
- **POST /api/discounts**: Creates a single-use discount code with constraints
- **widget.open({ campaignId })**: SDK method to programmatically open the widget

## Usage Instructions for Prompts

### When Creating New Components

1. **Always reference this specification**: Include the format requirement in your prompt
2. **Use the exact template**: Follow the structure and section order precisely
3. **Validate against checklist**: Ensure all validation criteria are met
4. **Map to source epic**: Ensure component derives from and supports epic requirements

### When Updating Existing Components

1. **Preserve existing content**: Maintain valuable content while updating format
2. **Apply template structure**: Ensure section order and formatting match specification
3. **Update metadata**: Use current status indicators and priority levels
4. **Validate consistency**: Check that updates align with related components and epics

### Format Reference Pattern

Use this exact reference in prompts:

```markdown
**Component Format**: Follow the canonical component format defined in [Component Format Specification](../formats/component-format.md)
```

### Cross-Reference Requirements

#### Component-to-Component References

- Use relative links for all component references
- Ensure link text matches exact component names
- Update links when component names change
- Validate that all referenced components exist

#### Component-to-Epic References

- Link to source epic using relative path
- Ensure epic links are valid and up-to-date
- Maintain consistency with epic naming and structure
- Update links when epic structure changes

#### Dependency Management

- List dependencies in logical order
- Ensure dependencies are implementable
- Avoid circular dependencies
- Update reverse dependencies when adding new dependencies

#### Integration Points

- Clearly define how components integrate with each other
- Specify data flow and communication patterns
- Identify shared interfaces or data structures
- Ensure integration approaches are compatible

## Cross-References

### Related Formats

- [Epic Format Specification](./epic-format.md) - Parent format for components
- [Story Format Specification](./story-format.md) - User requirements that components implement

### Related Documentation

- [Product Components](../../product/components.md) - Collection of all components
- [Current Epics](../../product/epics.md) - Source epics for components
- [Technical Architecture](../../Documentation/PlanetFormSystems.md) - System architecture context

## Notes

- This specification is the single source of truth for component format
- All prompts must reference this specification rather than duplicating format requirements
- Component format should align with epic format for consistency
- Regular validation of existing components against this specification is recommended
- Changes to this specification should be coordinated with all dependent prompts
