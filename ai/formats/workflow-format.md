# Workflow Format Specification

## Overview

This document defines the canonical format for all Planetform workflow files stored in the `ai/workflows/` directory. All prompts that create or modify workflow files must follow this exact specification to ensure consistency across the entire workflow collection.

## Purpose

Workflow files serve as the standardized operational procedures for the AI development system, enabling:

- **Process Standardization**: Ensure consistent execution of development and maintenance tasks across all team members
- **Quality Assurance**: Provide structured validation and quality control checkpoints for all content creation and modification
- **Knowledge Transfer**: Document institutional knowledge about development processes and best practices
- **System Maintenance**: Define clear procedures for maintaining content integrity and cross-reference consistency
- **Operational Efficiency**: Reduce decision overhead and increase execution speed through pre-defined procedures

## Template

````markdown
# [Workflow Name] Workflow

## Purpose

Clear statement of what this workflow accomplishes and when it should be used.

## CRITICAL FORMAT REQUIREMENT (if applicable)

**ALL [file type] files MUST follow the canonical [format name] specification.**

**Format Reference**: Use this exact reference in AI prompts:

```markdown
**[Format Type] Format**: Follow the canonical [format name] defined in [Format Specification](../formats/format-file.md)
```
````

**ENFORCEMENT**: Any [file type] that does not comply with the format specification is considered invalid and must be corrected before use.

## Workflow Steps

### 1. [Step Name]

**Purpose:**
[Clear statement of what this step accomplishes and why it's necessary in the workflow]

**Input:**

- [Required input 1]: [Description of what's needed]
- [Required input 2]: [Description of what's needed]
- [Prerequisites or dependencies]

**Actions:**

1. **[Action 1]**: [Specific action to be taken with detailed instructions]
2. **[Action 2]**: [Specific action to be taken with detailed instructions]
3. **[Action 3]**: [Specific action to be taken with detailed instructions]

**Output:**

- [Output deliverable 1]: [Description of what's produced]
- [Output deliverable 2]: [Description of what's produced]
- [State changes or updates made]

**Validation:**

- [ ] **[Validation criterion 1]**: [How to verify this aspect was completed correctly]
- [ ] **[Validation criterion 2]**: [How to verify this aspect was completed correctly]
- [ ] **[Validation criterion 3]**: [How to verify this aspect was completed correctly]

### 2. [Next Step Name]

**Purpose:**
[Clear statement of what this step accomplishes and why it's necessary in the workflow]

**Input:**

- [Required input from previous step or external source]
- [Dependencies that must be satisfied before starting]

**Actions:**

1. **[Action 1]**: [Specific action to be taken with detailed instructions]
2. **[Action 2]**: [Specific action to be taken with detailed instructions]

**Output:**

- [Output deliverable]: [Description of what's produced]
- [Changes or updates made]

**Validation:**

- [ ] **[Validation criterion 1]**: [How to verify completion]
- [ ] **[Validation criterion 2]**: [How to verify quality]

### 3. [Additional Steps]

[Continue pattern for all workflow steps...]

## Quality Assurance

**MANDATORY FORMAT VALIDATION (if applicable):**

- [ ] **Format Compliance**: File MUST follow exact structure from [Format Specification](../formats/format-file.md)
- [ ] **Section Order**: Headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Status Indicators**: [Type-specific format requirements]
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets

**[Review Category]:**

- [ ] [Quality checkpoint 1]
- [ ] [Quality checkpoint 2]
- [ ] [Quality checkpoint 3]

**[Validation Category]:**

- [ ] [Validation checkpoint 1]
- [ ] [Validation checkpoint 2]
- [ ] [Validation checkpoint 3]

**CRITICAL (if applicable)**: If ANY format validation check fails, the [file type] MUST be corrected before proceeding.

## Success Criteria

**[Completion Category]:**

- [Success criterion 1]
- [Success criterion 2]
- [Success criterion 3]

## Related Workflows

- [Related Workflow 1](./related-workflow-1.md) - [Description of relationship]
- [Related Workflow 2](./related-workflow-2.md) - [Description of relationship]

## Format Enforcement Instructions for AI (if applicable)

When using this workflow, AI systems MUST:

1. **Reference the Format**: Always include this exact statement in prompts:

   ```markdown
   **[Format Type] Format**: Follow the canonical [format name] defined in [Format Specification](../formats/format-file.md)
   ```

2. **Validate Before Completion**: Run through the complete validation checklist before considering the [file type] complete

3. **Use Correct Templates**: Apply the appropriate template based on source type

4. **Enforce Section Order**: Maintain exact section order as specified in the format specification

5. **Include ALL Required Sections**: Never omit required sections - all must be present and properly filled

**FAILURE TO COMPLY**: [File type] files that do not follow the format specification are invalid and will require correction.

## Notes

Additional context, special considerations, or implementation details for this workflow.

## Content Guidelines

### File Naming Convention

- Use kebab-case for file names (e.g., `cross-reference-validation.md`, `document-processing.md`)
- Workflow names should clearly describe the process or task being standardized
- Include "workflow" in the filename for clarity (e.g., `create-context.md` not `context-creation-workflow.md`)
- Keep names concise but descriptive of the specific operational procedure

### Purpose Section

- Clearly state what the workflow accomplishes
- Explain when the workflow should be used
- Describe the value and benefits of following this workflow
- Include context about how this workflow fits into the broader system

### Workflow Steps Structure

#### Step Organization

- Use numbered steps (1, 2, 3...) for sequential workflow phases
- Use descriptive step names that clearly indicate the phase purpose
- Each step must include all five required elements: Purpose, Input, Actions, Output, and Validation
- Steps should be logically connected with outputs from one step providing inputs to the next

#### Step Element Specifications

##### Purpose Element

- Clearly state what the step accomplishes within the overall workflow
- Explain why this step is necessary and how it contributes to the workflow goal
- Connect the step to the broader workflow objectives
- Keep purpose statements concise but comprehensive

##### Input Element

- List all required inputs needed to begin the step
- Specify dependencies on previous steps or external resources
- Include prerequisites that must be satisfied before starting
- Reference specific deliverables from previous steps when applicable
- Note any required tools, access permissions, or environmental conditions

##### Actions Element

- Use numbered actions (1., 2., 3...) for sequential activities within the step
- Begin each action with a **bold action verb** (e.g., **Create**, **Validate**, **Update**)
- Provide specific, executable instructions that can be followed without interpretation
- Include concrete examples, commands, or templates where helpful
- Break complex actions into smaller, manageable sub-actions

##### Output Element

- List all deliverables, artifacts, or changes produced by the step
- Specify the format, location, or characteristics of each output
- Include both tangible outputs (files, documents) and intangible ones (decisions, approvals)
- Reference how outputs will be used in subsequent steps
- Note any state changes or system updates that result from the step

##### Validation Element

- Use checkbox format `- [ ]` for validation criteria
- Begin each validation item with **bold validation type** (e.g., **Content Check**, **Format Validation**)
- Provide specific, testable criteria that can be objectively verified
- Include both completion validation (step was done) and quality validation (step was done correctly)
- Reference external standards or specifications where applicable

#### Action Items and Checklists

- Use checkbox format `- [ ]` for validation points and quality checkpoints
- Begin each checkbox item with **bold category or action type**
- Provide specific, testable criteria
- Group related checkboxes under descriptive headers

#### Code Blocks and Examples

- Include command examples, file templates, or code snippets where appropriate
- Use proper markdown code block formatting with language specification
- Provide realistic examples that can be directly used
- Include both input examples and expected output formats

### Content Organization Patterns

#### Input/Output Specifications

- Each step must clearly define required inputs in the **Input** element
- Specify dependencies on previous steps by referencing their specific outputs
- Document external inputs, prerequisites, and environmental requirements
- Each step must clearly define produced outputs in the **Output** element
- Specify the format, location, and characteristics of all deliverables
- Include both tangible outputs (files, artifacts) and intangible ones (decisions, state changes)
- Ensure step outputs align with inputs required by subsequent steps

#### Process Flow

- Organize steps in logical execution order with clear input/output dependencies
- Use the **Purpose** element to explain how each step contributes to workflow objectives
- Structure **Actions** elements to provide executable, sequential instructions
- Include decision points and branching logic within **Actions** where applicable
- Use **Validation** elements to verify step completion before proceeding to next step
- Indicate parallel vs. sequential execution requirements in step descriptions

#### Validation and Quality Control

- Include validation checkpoints throughout the workflow
- Specify quality criteria and acceptance standards
- Provide troubleshooting guidance for common issues
- Include rollback or error recovery procedures

### Quality Assurance Section

- **Content Review**: Validation of content accuracy and completeness
- **Format Review**: Compliance with specifications and standards
- **Integration Review**: Cross-reference and dependency validation
- **Functional Review**: Testing of workflow outputs and deliverables

### Success Criteria Section

- **Completion Indicators**: Clear measures of successful workflow execution
- **Quality Standards**: Minimum quality thresholds that must be met
- **Integration Requirements**: How outputs integrate with broader system
- **Deliverable Specifications**: What artifacts should exist after completion

### Related Workflows Section

- Link to workflows that are prerequisites for this workflow
- Reference workflows that commonly follow this workflow
- Include workflows that address related or overlapping concerns
- Specify the nature of relationships (prerequisite, follow-up, alternative, etc.)

### Notes Section

- Special considerations or edge cases
- Implementation tips and best practices
- Common pitfalls and how to avoid them
- References to external tools or resources

## Quality Standards

### Content Quality

- **Clarity**: All instructions must be clear and unambiguous
- **Completeness**: All steps necessary for successful execution must be included
- **Accuracy**: All information must be correct and current
- **Actionability**: Every step must provide specific, executable actions

### Process Quality

- **Logical Flow**: Steps must follow a logical sequence with clear input/output dependencies that leads to successful completion
- **Step Structure**: Each step must include all five required elements (Purpose, Input, Actions, Output, Validation) with complete and accurate information
- **Validation Points**: Appropriate validation criteria must be included in each step to ensure quality and completion
- **Error Handling**: Common failure modes and recovery procedures must be addressed in Actions or Validation elements
- **Scalability**: Workflow must work effectively for both simple and complex scenarios through well-defined inputs and outputs

### Integration Quality

- **System Compatibility**: Workflow must integrate properly with existing development system
- **Cross-Reference Accuracy**: All links to other workflows and resources must be functional
- **Consistency**: Terminology and approaches must align with other workflows
- **Standards Compliance**: Must follow all relevant format specifications and guidelines

### Format Compliance

- Section order matches template exactly
- Headers use exact naming and formatting conventions
- Checkbox format used consistently for all validation points
- Code blocks properly formatted with appropriate language specification
- Cross-references use proper markdown link format

## Validation Checklist

Before finalizing any workflow, verify:

- [ ] Workflow follows exact template format with all required sections
- [ ] Purpose clearly states what the workflow accomplishes and when to use it
- [ ] Format enforcement sections included if workflow creates/modifies format-specified files
- [ ] All workflow steps are numbered and include descriptive names
- [ ] Each step includes all five required elements: Purpose, Input, Actions, Output, and Validation
- [ ] **Purpose elements** clearly state what each step accomplishes and why it's necessary
- [ ] **Input elements** specify all required inputs, dependencies, and prerequisites
- [ ] **Actions elements** provide specific, executable instructions with clear action verbs
- [ ] **Output elements** define all deliverables and changes produced by each step
- [ ] **Validation elements** include testable criteria for verifying step completion and quality
- [ ] Steps are logically connected with outputs feeding into subsequent step inputs
- [ ] Quality assurance section includes comprehensive validation checkpoints
- [ ] Mandatory format validation included as highest priority (if applicable)
- [ ] Success criteria clearly define completion standards
- [ ] Related workflows are properly linked with relationship descriptions
- [ ] AI enforcement instructions included for format-specified files (if applicable)
- [ ] All cross-references are functional and accurate
- [ ] Content is clear, complete, and actionable
- [ ] Workflow integrates properly with existing development system
- [ ] No broken links or missing dependencies
- [ ] Terminology is consistent with other workflows

## Common Patterns and Examples

### Workflow Title Examples

- "Cross-Reference Validation Workflow" - System maintenance procedure
- "Document Processing Workflow" - Content handling procedure
- "Create Context Workflow" - Content creation procedure

### Purpose Statement Examples

- **Creation Workflow**: "This workflow provides standardized steps for creating new context files within the AI development system..."
- **Maintenance Workflow**: "This workflow provides standardized steps for validating and maintaining cross-references across all AI development system files..."
- **Processing Workflow**: "This workflow provides a unified approach for processing any type of document within the AI development system..."

### Step Structure Examples

```markdown
### 1. Document Type Classification

**Purpose:**
Identify the type and scope of the document being processed to determine the appropriate processing approach and validation requirements.

**Input:**

- Document file or content to be processed
- Document location or path reference
- Any existing metadata or context about the document

**Actions:**

1. **Analyze Document Structure**: Examine file extension, header format, and section organization
2. **Identify Content Type**: Determine if document is context, epic, story, or other format
3. **Assess Processing Scope**: Evaluate complexity and determine processing requirements
4. **Document Classification**: Record document type and processing approach in workflow log

**Output:**

- Document type classification (Context/Epic/Story/Other)
- Processing complexity assessment (Simple/Moderate/Complex)
- Recommended processing approach and validation requirements
- Updated workflow log with classification details

**Validation:**

- [ ] **Type Identification**: Document type is correctly identified based on structure and content
- [ ] **Scope Assessment**: Processing requirements accurately reflect document complexity
- [ ] **Classification Logging**: All classification details are properly documented
- [ ] **Approach Selection**: Recommended processing approach aligns with document type

### 2. Pre-Processing Analysis

**Purpose:**
Conduct detailed analysis of document content and structure to prepare for processing and identify any special requirements or constraints.

**Input:**

- Document type classification from Step 1
- Processing complexity assessment from Step 1
- Original document content and structure
- Related documents or dependencies (if any)

**Actions:**

1. **Content Scope Analysis**: Determine breadth and depth of content requiring processing
2. **Dependency Mapping**: Identify cross-references and relationships to other documents
3. **Processing Requirements**: Define specific processing steps needed for this document type
4. **Impact Assessment**: Evaluate effects on existing documents and system integration

**Output:**

- Detailed content analysis report
- Dependency map showing related documents and cross-references
- Specific processing plan tailored to document type and complexity
- Impact assessment identifying affected system components

**Validation:**

- [ ] **Content Analysis**: All content sections and requirements are identified and documented
- [ ] **Dependency Accuracy**: All cross-references and relationships are correctly mapped
- [ ] **Processing Plan**: Plan includes all necessary steps for successful processing
- [ ] **Impact Assessment**: All affected components and documents are identified
```

### Quality Assurance Examples

```markdown
## Quality Assurance

**Content Review:**

- [ ] Follows format specification exactly
- [ ] Content is comprehensive and well-structured
- [ ] Category assignment is appropriate

**Integration Review:**

- [ ] Cross-references are functional and accurate
- [ ] Terminology is consistent with other workflows
- [ ] Workflow integrates properly with existing system
```

## Usage Instructions for Prompts

### When Creating New Workflows

1. **Always reference this specification**: Include the format requirement in your prompt
2. **Use the exact template**: Follow the structure and section order precisely
3. **Validate against checklist**: Ensure all validation criteria are met
4. **Test workflow steps**: Verify that workflow steps are executable and complete

### When Updating Existing Workflows

1. **Preserve existing content**: Maintain valuable content while updating format
2. **Apply template structure**: Ensure section order and formatting match specification
3. **Update cross-references**: Verify all links remain functional
4. **Validate completeness**: Check that all necessary steps are included

### Format Reference Pattern

Use this exact reference in prompts:

```markdown
**Workflow Format**: Follow the canonical workflow format defined in [Workflow Format Specification](../formats/workflow-format.md)
```

### Workflow Categories

- **Creation Workflows**: Procedures for creating new content (contexts, epics, stories)
- **Maintenance Workflows**: Procedures for maintaining existing content and system integrity
- **Processing Workflows**: Procedures for transforming or validating content
- **Integration Workflows**: Procedures for coordinating between different system components

**Note**: All workflow types must use the structured step format with Purpose, Input, Actions, Output, and Validation elements for each step.

## Cross-References

### Related Formats

- [Context Format Specification](./context-format.md) - Format for context files referenced in workflows
- [Epic Format Specification](./epic-format.md) - Format for epic files created/updated by workflows
- [Story Format Specification](./story-format.md) - Format for story files created/updated by workflows

### Related Documentation

- [Workflow Directory README](../workflows/README.md) - Overview of available workflows
- [AI Development System Documentation](../README.md) - Context for workflow usage

## Notes

- Workflows serve as the operational backbone of the AI development system
- Each workflow step must include all five structured elements: Purpose, Input, Actions, Output, and Validation
- Each workflow should be self-contained and executable by following the documented steps
- Step outputs must logically connect to subsequent step inputs to ensure workflow continuity
- Regular validation of existing workflows against this specification is recommended
- Changes to this specification should be coordinated with all dependent workflows
- Workflow effectiveness should be monitored and workflows updated based on usage experience

## Format Enforcement for Workflows

When workflows involve creating or modifying files that must follow specific format specifications (such as context files, epics, or stories), the workflow MUST include comprehensive format enforcement sections.

### Required Format Enforcement Sections

#### 1. Critical Format Requirement Section

Place at the beginning of the workflow, immediately after Purpose:

````markdown
## CRITICAL FORMAT REQUIREMENT

**ALL [file type] files MUST follow the canonical [format name] specification.**

**Format Reference**: Use this exact reference in AI prompts:

```markdown
**[Format Type] Format**: Follow the canonical [format name] defined in [Format Specification](../formats/format-file.md)
```
````

**ENFORCEMENT**: Any [file type] that does not comply with the format specification is considered invalid and must be corrected before use.

````

#### 2. Enhanced Validation Checklists
Include mandatory format validation as the first priority in quality assurance:

```markdown
**MANDATORY FORMAT VALIDATION:**
- [ ] **Format Compliance**: File MUST follow exact structure from [Format Specification](../formats/format-file.md)
- [ ] **Section Order**: Headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Status Indicators**: [Type-specific format requirements]
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets
- [ ] **[Type-specific requirements]**: [Additional format requirements]

**CRITICAL**: If ANY format validation check fails, the [file type] MUST be corrected before proceeding.
````

#### 3. AI Enforcement Instructions Section

Add near the end of the workflow:

````markdown
## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference the Format**: Always include this exact statement in prompts:
   ```markdown
   **[Format Type] Format**: Follow the canonical [format name] defined in [Format Specification](../formats/format-file.md)
   ```
````

2. **Validate Before Completion**: Run through the complete validation checklist before considering the [file type] complete

3. **Use Correct Templates**: Apply the appropriate template based on source type

4. **Enforce Section Order**: Maintain exact section order as specified in the format specification

5. **Include ALL Required Sections**: Never omit required sections - all must be present and properly filled

**FAILURE TO COMPLY**: [File type] files that do not follow the format specification are invalid and will require correction.

```

### Format Enforcement Examples

#### Context File Workflows
For workflows that create or modify context files, include enforcement for [Context Format Specification](./context-format.md).

#### Epic File Workflows
For workflows that create or modify epic files, include enforcement for [Epic Format Specification](./epic-format.md).

#### Story File Workflows
For workflows that create or modify story files, include enforcement for [Story Format Specification](./story-format.md).

### Integration with Existing Workflows

**Mandatory Updates**: All existing workflows that create or modify format-specified files must be updated to include these enforcement sections.

**Quality Standards**: Format compliance must be the highest priority validation criterion in all relevant workflows.
```
