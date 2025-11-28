# Epic Create Prompt

## Purpose

This prompt is used to create new comprehensive epic specifications. It leverages the standardized [Create Epic Workflow](../workflows/create-epic.md) to produce detailed epic files that follow the canonical format specification, update the epic tracking system, and ensure consistency across all project documentation.

## Vision Context Loading

**CRITICAL FIRST STEP**: Before proceeding with any epic creation activities, you MUST load the product specification into context to ensure all operations are taken with the product vision in mind.

1. **Load Product Spec**: Read and analyze the complete [`ai/context/product_spec.md`](../../ai/context/product_spec.md) file to understand:
   - The value proposition and core features (games, campaigns, analytics)
   - Technical architecture (frontend widget, admin panel, backend services)
   - E-commerce integrations (Shopify, WooCommerce, etc.)
   - Performance, security, and accessibility requirements
   - Roles, data model, and event vocabulary

2. **Vision Alignment**: Ensure that all epic creation decisions, technical approaches, and feature definitions align with the established product vision and contribute to business outcomes.

3. **Context Integration**: Use the product spec as the primary reference for determining epic scope, priority, and integration with existing systems.

## Instructions

You are tasked with creating a new epic for the Planetform project. Follow the [Create Epic Workflow](../workflows/create-epic.md) to ensure proper format compliance, context integration, and tracking updates.

### Epic Creation Process

Follow the [Create Epic Workflow](../workflows/create-epic.md) which provides standardized steps for:

1. **Epic Planning and Research**: Context enhancement and implementation status research
2. **Epic File Creation**: Proper format specification compliance
3. **Epic Tracking Integration**: Updates to the epic tracking system
4. **Context File Updates**: Integration with the context knowledge system
5. **Cross-Reference Validation**: Dependency verification and consistency checks
6. **Vision and Roadmap Integration**: Alignment with project documentation
7. **Quality Assurance**: Comprehensive validation and review

### Epic Format Requirements

**Epic Format**: Follow the canonical epic format defined in [Epic Format Specification](../formats/epic-format.md). The workflow ensures all required sections are included in the exact order specified.

### Input Requirements

The workflow requires the following information:

- **Epic Name**: Clear, descriptive name using feature-focused language
- **Epic Description**: High-level description of what the epic encompasses
- **Category Context**: Which development phase or system type this epic belongs to
- **Priority Justification**: Why this epic has the assigned priority level
- **Dependencies**: Which existing epics this depends on (or "None")
- **Key Features**: List of major deliverables and systems to include
- **Technical Considerations**: Web/Node architecture requirements, performance budgets, and integration points
- **User Value**: How this epic provides value to marketers, store owners, and shoppers

### Output Requirements

The [Create Epic Workflow](../workflows/create-epic.md) produces the following deliverables:

1. **Epic File**: New epic file in `product/epics/[epic-name].md` following format specification
2. **Epic Tracking Update**: Modified `product/epics.md` with new entry
3. **Context File Updates**: Enhanced context files reflecting epic information
4. **Vision Integration**: Updated `product/vision.md` if applicable
5. **Roadmap Integration**: Updated `product/roadmap.md` if applicable
6. **Cross-Reference Validation**: Verified dependencies and integration points

### Example Epic Request

To request a new epic using this workflow, provide:

```markdown
**Epic Name**: [Descriptive name of the epic]
**Description**: [2-3 sentence overview of the epic scope and purpose]
**Category**: [Foundation/Widget Platform/Admin Panel/Backend Services/Integrations/Analytics & Reporting/Security & Compliance/UX & Design]
**Priority**: [Critical/High/Medium/Low with justification]
**Key Features**:

- [Feature 1]
- [Feature 2]
- [Feature 3]
  **Dependencies**: [List of epic names or "None"]
  **Technical Focus**: [Web/Node considerations, performance requirements, integrations]
  **User Value**: [How this provides value to marketers, store owners, and shoppers]
```

### Quality Assurance

The workflow includes comprehensive quality assurance checks to ensure:

- **Completeness**: All required sections present and substantive
- **Clarity**: Content is clear and unambiguous for developers
- **Consistency**: Terminology and approaches align with existing epics
- **Feasibility**: Technical requirements are realistic and achievable
- **Value**: Epic provides clear value to the game experience
- **Integration**: Epic integrates logically with existing game systems
- **Context Alignment**: Epic aligns with and enhances the context system

## Notes

- New epics always start with "⏳ Not Started" status per workflow standards
- File names use kebab-case convention (e.g., `new-epic-system.md`)
- Dependencies must reference actual epic files that exist in the project
- Technical requirements must be compatible with Web/Node architecture
- Follow the [Create Epic Workflow](../workflows/create-epic.md) for all implementation details
- All workflow validation steps must be completed before epic finalization
