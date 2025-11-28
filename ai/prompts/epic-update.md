# Planetform Epic Update Prompt

## Objective

Update individual epic files (`./product/epics/*.md`) to incorporate feedback, additional context, design changes, and new insights while maintaining consistency across all related epics. This prompt leverages the standardized [Update Epic Workflow](../workflows/update-epic.md) to ensure comprehensive analysis, systematic updates, and proper integration across all affected documentation.

## Vision Context Loading

**CRITICAL FIRST STEP**: Before proceeding with any epic update activities, you MUST load the product specification into context to ensure all operations are taken with the product vision in mind.

1. **Load Product Spec**: Read and analyze the complete [`ai/context/product_spec.md`](../../ai/context/product_spec.md) file to understand:
   - Core value proposition, game types, and campaign model
   - Technical architecture (widget, admin, backend)
   - Integrations and platform requirements
   - Performance/security/accessibility targets
   - Roles, data model, and event vocabulary

2. **Vision Alignment**: Ensure that all epic update decisions, modifications, and enhancements align with the established product vision and contribute to business outcomes.

3. **Context Integration**: Use the vision as the primary reference for determining how updates should be applied and how they integrate with existing systems and the broader project goals.

## Context

You are tasked with updating epic files that define detailed development units for the Planetform project. Follow the [Update Epic Workflow](../workflows/update-epic.md) to ensure proper analysis, cross-epic consistency, context integration, and comprehensive validation of all changes.

## Input Requirements

Provide the following information to execute this prompt effectively:

1. **Target Epic**: Name of the epic file to be updated
2. **Update Requirements**: Specific changes, feedback, or modifications needed
3. **Context Information**: Additional context, design changes, or new insights to incorporate

## Output Requirements

1. **Updated Epic File**: Modified `product/epics/[epic-name].md` with requested changes
2. **Related Epic Updates**: Consistency updates across affected epics
3. **Context File Updates**: Modified context files reflecting epic changes
4. **Validation Report**: Summary of changes and consistency verification

## Process

Follow the [Update Epic Workflow](../workflows/update-epic.md) which provides comprehensive steps for:

1. **Analysis and Planning**: Target epic analysis and context enhancement research
2. **Cross-Epic Discovery**: Relationship mapping and dependency analysis
3. **Impact Assessment**: Planning updates across multiple affected epics
4. **Context File Review**: Planning context file updates and modifications
5. **Update Execution**: Systematic application of changes with format compliance
6. **Context File Updates**: Maintaining context system consistency
7. **Validation and Quality Assurance**: Comprehensive verification of all changes

## Format Requirements

**Epic Format Compliance**: All epic updates must maintain the format defined in [Epic Format Specification](../formats/epic-format.md)

## Quality Standards

- **Technical Accuracy**: All changes must be technically sound and implementable
- **Format Compliance**: Updates must follow Epic Format Specification exactly
- **Cross-Epic Consistency**: Terminology and approaches must align across related epics
- **Context Integration**: Context files must accurately reflect epic changes
- **Dependency Integrity**: All dependency relationships must remain logical and valid
