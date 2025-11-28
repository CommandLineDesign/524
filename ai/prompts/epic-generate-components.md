# Epic Generate Components Prompt

## Purpose

This prompt is used to generate comprehensive component specifications for a specific epic. It leverages the standardized [Generate Components Workflow](../workflows/generate-components.md) to analyze an epic and create all necessary component specifications to realize the epic's vision. The workflow identifies, prioritizes, and determines the appropriate action (create, update, or split) for each component, then executes the corresponding specialized workflow.

## Vision Context Loading

**CRITICAL FIRST STEP**: Before proceeding with any component generation activities, you MUST load the product specification into context to ensure all operations are taken with the product vision in mind.

1. **Load Product Spec**: Read and analyze the complete [`ai/context/product_spec.md`](../../ai/context/product_spec.md) file to understand:
   - Core value proposition, game types, and campaign model
   - Technical architecture (widget, admin, backend)
   - Integrations and platform requirements
   - Performance/security/accessibility targets
   - Roles, data model, and event vocabulary

2. **Vision Alignment**: Ensure that all component generation decisions, technical approaches, and feature definitions align with the established product vision and contribute to business outcomes.

3. **Context Integration**: Use the vision as the primary reference for determining component scope, priority, and integration with existing systems.

## Instructions

You are tasked with generating component specifications for a specific epic in the Planetform project. Follow the [Generate Components Workflow](../workflows/generate-components.md) to ensure proper format compliance, comprehensive coverage, and consistency across all managed components.

### Component Generation Process

Follow the [Generate Components Workflow](../workflows/generate-components.md) which provides standardized steps for:

1. **Epic Analysis and Component Planning**: Analyze the epic and identify all components that need specification
2. **Component Status Assessment**: Determine which components need creation, updating, or splitting
3. **Component Specification Management**: Execute appropriate workflows for each component
4. **Epic Integration and Updates**: Update epic with component references and status
5. **Cross-Reference Validation**: Ensure consistency and proper dependencies
6. **Quality Assurance**: Comprehensive validation and review

### Component Format Requirements

**Component Format**: Follow the canonical component format defined in [Component Format Specification](../formats/component-format.md). The workflow ensures all component specifications comply with the exact format requirements.

### Input Requirements

**CRITICAL REQUIREMENT**: A specific epic MUST be provided to trigger this workflow.

The workflow requires:

- **Epic Specification**: Name or path of the specific epic for which components should be generated (e.g., 'ai-entity-power-systems' or 'product/epics/ai-entity-power-systems.md')

**FAILURE CONDITION**: If no epic is specified, the workflow will fail immediately with an error message requesting the specific epic to process.

### Output Specifications

The workflow will produce:

- **Component Files**: New or updated component specification files following the canonical format
- **Epic Updates**: Updated epic file with component references and implementation status
- **Component Tracking**: Integration with the component tracking system
- **Cross-References**: Proper dependency links and consistency validation
- **Context Integration**: Updates to the context knowledge system

### Usage Examples

**Basic Usage:**

```
Generate components for the 'ai-entity-power-systems' epic
```

**With File Path:**

```
Generate components for epic at 'product/epics/planetary-weather-systems.md'
```

**Priority Focus:**

```
Generate high-priority components for the 'core-terraforming-mechanics' epic
```

## Quality Standards

All generated components must meet:

- **Format Compliance**: Strict adherence to the canonical component format
- **Technical Accuracy**: Proper technical specifications and implementation details
- **Vision Alignment**: Consistency with project vision and architectural requirements
- **Integration Quality**: Proper cross-references and dependency management
- **Documentation Standards**: Clear, comprehensive, and maintainable specifications

## Related Workflows

- [Generate Components Workflow](../workflows/generate-components.md) - Core workflow used by this prompt
- [Create Component Workflow](../workflows/create-component.md) - Used for new component creation
- [Update Component Workflow](../workflows/update-component.md) - Used for component modifications
- [Split Component Workflow](../workflows/split-component.md) - Used for component splitting

## Related Prompts

- [Component Update Prompt](component-update.md) - For updating individual components
- [Epic Update Prompt](epic-update.md) - For updating epic specifications
- [Epics to Components Conversion Prompt](epics-to-components-conversion.md) - For batch epic-to-component conversion
