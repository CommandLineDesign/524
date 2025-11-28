# Create Epic Workflow

## Purpose

This workflow provides standardized steps for creating new epic files within the AI development system. It ensures proper formatting, context integration, tracking updates, and cross-reference consistency across all project documentation.

## CRITICAL FORMAT REQUIREMENT

**ALL epic files MUST follow the canonical Epic Format specification.**

**Format Reference**: Use this exact reference in AI prompts:

```markdown
**Epic Format**: Follow the canonical epic format defined in [Epic Format Specification](../formats/epic-format.md)
```

**ENFORCEMENT**: Any epic that does not comply with the format specification is considered invalid and must be corrected before use.

## Workflow Steps

### 1. Epic Planning and Research

**Purpose:**
Establish comprehensive understanding of epic scope, requirements, and context by conducting thorough research and planning to ensure the epic integrates properly with existing systems and documentation.

**Input:**

- Epic name and description concept
- Proposed category assignment (Foundation, Orbital Phase, Surface Establishment, etc.)
- Priority justification reasoning (Critical, High, Medium, Low)
- Key features and deliverables list
- Technical considerations and Unity ECS requirements
- User value proposition statement

**Actions:**

1. **Identify Relevant Context Categories**: Focus on context categories most relevant to the epic's domain in `ai/context/` folder
2. **Extract Key Insights**: Gather information that enhances epic scope, requirements, or technical approach from context files
3. **Validate Consistency**: Ensure epic aligns with established patterns and principles from context
4. **Enhance Details**: Use context information to provide more specific and accurate epic content
5. **Reference Sources**: Note which context files informed key decisions or requirements
6. **Search Existing Code**: Look for related systems, components, and utilities in current codebase
7. **Identify Functional Systems**: Determine what functionality is already operational
8. **Check Integration Points**: Understand how much of the system is already connected
9. **Review Test Coverage**: Verify if existing functionality has test validation

**Output:**

- Comprehensive epic requirements and scope definition
- Context-enhanced technical understanding and approach
- Implementation status assessment of related systems
- Source reference documentation for context-informed decisions
- Integration point analysis and existing system understanding
- Enhanced user value proposition based on research

**Validation:**

- [ ] **Context Research**: All relevant context categories reviewed and insights documented
- [ ] **Consistency Check**: Epic aligns with established patterns and principles from context
- [ ] **Codebase Analysis**: Current implementation status researched and documented
- [ ] **Integration Understanding**: Existing system integration points identified and analyzed
- [ ] **Source Documentation**: Context files that informed decisions are properly referenced
- [ ] **Requirements Enhancement**: Epic scope and requirements enhanced with context insights

### 2. Epic File Creation

**Purpose:**
Create a comprehensive epic specification file following the canonical Epic Format to ensure consistent structure, complete information, and proper technical documentation.

**Input:**

- Enhanced epic requirements and scope from Step 1
- Epic Format Specification template
- Context-informed technical details and approaches
- Implementation status and integration analysis
- User value proposition and acceptance criteria requirements

**Actions:**

1. **Generate Filename**: Create kebab-case filename following naming convention (e.g., `ai-core-system.md`)
2. **Create File Path**: Establish path as `product/epics/[epic-name].md`
3. **Apply Template Structure**: Follow [Epic Format Specification](../formats/epic-format.md) exactly with all required sections
4. **Populate Metadata**: Fill Title, Category, Priority, Status, Dependencies, and Estimated Effort fields
5. **Write Description**: Create detailed explanation of epic scope and user value proposition
6. **Define Key Components**: List major deliverables and systems with brief descriptions
7. **Create Acceptance Criteria**: Write specific, testable requirements using checkbox format
8. **Document Technical Requirements**: Specify Unity ECS architecture requirements and performance considerations
9. **Write User Stories**: Create Role-Goal-Benefit format examples for player and AI entity perspectives
10. **Identify Risks and Assumptions**: Document technical risks, design assumptions, and external dependencies
11. **Add Implementation Notes**: Include additional context and implementation considerations

**Output:**

- Complete epic specification file following canonical format
- All required sections populated with comprehensive information
- Proper metadata fields completed with appropriate values
- Testable acceptance criteria in checkbox format
- Technical requirements aligned with Unity ECS architecture
- User stories covering both player and AI entity perspectives

**Validation:**

- [ ] **Format Compliance**: Epic file follows exact structure from [Epic Format Specification](../formats/epic-format.md)
- [ ] **Section Completeness**: ALL required sections are present and properly filled
- [ ] **Metadata Accuracy**: Category, Priority, Status, Dependencies, Estimated Effort use specified options
- [ ] **Acceptance Criteria Format**: Acceptance criteria use checkbox format and are specific/testable
- [ ] **Technical Alignment**: Technical requirements align with Unity ECS architecture patterns
- [ ] **User Story Format**: User stories follow Role-Goal-Benefit format for both perspectives
- [ ] **Content Quality**: All content is clear, accurate, and comprehensive

### 3. Epic Tracking Integration

**Purpose:**
Update the master epic tracking system to include the new epic and maintain proper categorization, status tracking, and organizational structure for development oversight.

**Input:**

- Completed epic specification file from Step 2
- Master epic tracking file (`product/epics.md`)
- Epic category and priority information
- Current tracking system organization and format

**Actions:**

1. **Open Tracking File**: Access `product/epics.md` for editing
2. **Locate Category Section**: Find the appropriate category section for the new epic
3. **Add Epic Entry**: Insert new epic entry in appropriate category with proper formatting
4. **Set Initial Status**: Use ⏳ **Not Started** status for new epics
5. **Maintain Organization**: Keep alphabetical ordering within categories
6. **Update Category Summary**: Modify category summary if the new epic affects it
7. **Validate Format Consistency**: Ensure consistent formatting with existing entries
8. **Check Cross-References**: Verify all epic links are properly formatted and functional

**Output:**

- Updated `product/epics.md` with new epic entry
- Proper categorization and alphabetical organization maintained
- Initial status set to ⏳ **Not Started**
- Consistent formatting with existing entries
- Updated category summaries if applicable

**Validation:**

- [ ] **Tracking Update**: New epic entry added to correct category section in `product/epics.md`
- [ ] **Status Setting**: Initial status set to ⏳ **Not Started**
- [ ] **Category Organization**: Epic placed in appropriate category with alphabetical ordering
- [ ] **Format Consistency**: Entry formatting matches existing entries exactly
- [ ] **Link Functionality**: Epic link is properly formatted and points to correct file
- [ ] **Summary Updates**: Category summaries updated appropriately if affected

### 4. Context File Updates

**Purpose:**
Identify context file changes needed for the new epic and execute appropriate context workflows to maintain comprehensive technical and design documentation across the system.

**Input:**

- Completed epic specification from Step 2
- Existing context files in relevant categories
- Epic technical details and design decisions requiring context documentation
- Context categories requiring new files or updates

**Actions:**

1. **Identify Context Impact**: Determine which context categories relate to the epic's domain and require documentation
2. **Review Existing Files**: Check if relevant context files already exist in those categories that need updates
3. **Categorize Context Needs**: Separate requirements into new context file creation vs. existing file updates
4. **Execute Create Context Workflow**: For new context files needed, follow [Create Context Workflow](create-context.md) with epic-sourced information
5. **Execute Update Context Workflow**: For existing context files requiring updates, follow [Update Context Workflow](update-context.md) with epic information
6. **Validate Context Integration**: Ensure all context changes properly integrate with the epic and maintain cross-reference consistency
7. **Document Context Changes**: Record which context files were created or updated and their relationship to the epic

**Output:**

- New context files created through Create Context Workflow for epic-specific information
- Existing context files updated through Update Context Workflow with relevant epic details
- Proper integration between epic and all related context files
- Clear documentation of context changes made in support of the epic
- Enhanced technical and design documentation coverage across relevant categories

**Validation:**

- [ ] **Context Impact Assessment**: All relevant context categories identified and categorized for action
- [ ] **Workflow Execution**: Create Context Workflow properly executed for all new context file requirements
- [ ] **Update Workflow Execution**: Update Context Workflow properly executed for all existing file updates
- [ ] **Context Integration**: All context files properly integrated with epic and maintain cross-reference consistency
- [ ] **Change Documentation**: Context file changes clearly documented with their relationship to the epic
- [ ] **Content Enhancement**: Context files meaningfully enhanced with epic information through proper workflows

### 5. Cross-Reference Validation

**Purpose:**
Validate all dependencies, technical consistency, and terminology alignment to ensure the epic integrates properly with existing documentation and maintains system coherence.

**Input:**

- Completed epic file with dependencies from Step 2
- All referenced epics and documentation
- Technical requirements and architecture specifications
- Terminology standards and naming conventions

**Actions:**

1. **Verify Epic References**: Ensure all referenced epics exist in the `product/epics/` directory
2. **Validate Dependency Logic**: Check that dependency relationships are logical and implementable
3. **Check Circular Dependencies**: Identify and resolve any circular dependency chains
4. **Confirm Prerequisites**: Validate that prerequisite epics provide necessary foundations
5. **Verify Unity ECS Alignment**: Ensure architecture approaches align with existing epics
6. **Check Integration Compatibility**: Verify integration points are compatible with established systems
7. **Validate Performance Requirements**: Check that performance requirements are realistic and measurable
8. **Ensure Technical Consistency**: Confirm technical approaches are consistent across related epics
9. **Align Terminology**: Use consistent terminology across all sections and with related epics
10. **Verify Naming Patterns**: Maintain consistent naming patterns for systems and components

**Output:**

- Validated epic dependencies with confirmed existence and logic
- Resolved circular dependencies and prerequisite issues
- Confirmed technical consistency with existing architecture
- Aligned terminology and naming patterns across documentation
- Verified integration compatibility with established systems

**Validation:**

- [ ] **Dependency Verification**: All referenced epics exist and dependency logic is sound
- [ ] **Circular Dependency Check**: No circular dependencies identified or all resolved
- [ ] **Prerequisites Validation**: Prerequisite epics provide necessary foundations
- [ ] **Technical Consistency**: Architecture approaches align with existing epics
- [ ] **Integration Compatibility**: Integration points compatible with established systems
- [ ] **Performance Realism**: Performance requirements are realistic and measurable
- [ ] **Terminology Alignment**: Consistent terminology used across all sections
- [ ] **Naming Pattern Consistency**: Naming patterns consistent with project standards

### 6. Vision and Roadmap Integration

**Purpose:**
Integrate the epic with broader project vision and roadmap documentation to maintain strategic alignment and proper development sequencing.

**Input:**

- Completed epic specification from Step 2
- Current project vision document (`product/vision.md`)
- Current roadmap document (`product/roadmap.md`)
- Epic's impact on strategic direction and development timeline

**Actions:**

1. **Assess Vision Impact**: Determine if the epic introduces concepts that enhance the game vision
2. **Update Vision Document**: Integrate new concepts seamlessly into existing vision narrative if applicable
3. **Maintain Vision Consistency**: Preserve consistent tone, writing style, and structure
4. **Align Technical Details**: Ensure technical details align with established game mechanics in vision
5. **Evaluate Roadmap Impact**: Determine if the epic affects development sequencing or timelines
6. **Update Roadmap Items**: Add or update relevant roadmap items if sequencing is affected
7. **Maintain Phase Organization**: Ensure proper sequencing and dependencies in roadmap
8. **Adjust Timelines**: Modify development timelines if significantly impacted by the epic

**Output:**

- Updated vision document with integrated epic concepts (if applicable)
- Updated roadmap with revised sequencing and dependencies (if applicable)
- Maintained consistency in tone, style, and technical alignment
- Preserved strategic coherence across all documentation

**Validation:**

- [ ] **Vision Impact Assessment**: Epic's impact on game vision properly evaluated
- [ ] **Vision Integration**: New concepts integrated seamlessly if vision updates needed
- [ ] **Vision Consistency**: Tone, style, and structure preserved in vision updates
- [ ] **Technical Alignment**: Technical details align with established game mechanics
- [ ] **Roadmap Impact Assessment**: Epic's effect on development sequencing evaluated
- [ ] **Roadmap Updates**: Relevant roadmap items updated with proper sequencing
  - [ ] **Timeline Accuracy**: Development timelines adjusted appropriately if needed

### 7. Quality Assurance and Final Validation

**Purpose:**
Conduct comprehensive quality review to ensure the epic meets all format requirements, content standards, and integration requirements before completion.

**Input:**

- Complete epic file from Step 2
- Updated tracking system from Step 3
- Enhanced context files from Step 4
- Validated cross-references from Step 5
- Integrated vision and roadmap from Step 6

**Actions:**

1. **Run Format Validation**: Verify complete compliance with Epic Format Specification
2. **Content Quality Review**: Assess comprehensiveness, clarity, and accuracy of all sections
3. **Integration Verification**: Confirm proper tracking, context, and cross-reference integration
4. **Technical Accuracy Check**: Validate technical requirements and Unity ECS alignment
5. **Dependency Validation**: Ensure all dependencies are logical and properly documented
6. **User Story Quality**: Verify user stories follow proper format and cover required perspectives
7. **Final Cross-Reference Check**: Validate all links and references are functional

**Output:**

- Format-compliant epic file ready for development use
- Validated content quality and technical accuracy
- Confirmed integration with all system documentation
- Quality assurance checklist completion
- Final approval for epic use in development planning

**Validation:**

- [ ] **MANDATORY FORMAT VALIDATION**: Epic MUST follow exact structure from [Epic Format Specification](../formats/epic-format.md)
- [ ] **Section Completeness**: All required sections present and substantive
- [ ] **Metadata Accuracy**: Category, Priority, Status, Dependencies, Estimated Effort properly completed
- [ ] **Acceptance Criteria Quality**: Criteria are specific, testable, and use checkbox format
- [ ] **Technical Requirements**: Requirements align with Unity ECS architecture patterns
- [ ] **User Story Format**: Stories follow Role-Goal-Benefit format for both perspectives
- [ ] **Integration Completeness**: All system integrations completed and validated
- [ ] **Cross-Reference Functionality**: All links and references are functional and accurate

**CRITICAL**: If ANY validation check fails, the epic file MUST be corrected before proceeding.

## Quality Assurance

**MANDATORY FORMAT VALIDATION:**

- [ ] **Epic Format Compliance**: File MUST follow exact structure from [Epic Format Specification](../formats/epic-format.md)
- [ ] **Section Order**: Headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Status Indicators**: Epic status uses correct format and emoji (⏳ for new epics)
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets
- [ ] **Metadata Fields**: Category, Priority, Status, Dependencies, Estimated Effort use specified options
- [ ] **Content Structure**: Acceptance criteria use checkbox format, user stories follow Role-Goal-Benefit format

**CRITICAL**: If ANY format validation check fails, the epic MUST be corrected before proceeding.

**Content Review:**

- [ ] **Section Quality**: All required sections present and substantive
- [ ] **Category Assignment**: Category assignment is appropriate for epic scope
- [ ] **Priority Justification**: Priority justification is clear and well-reasoned
- [ ] **Dependencies Documentation**: Dependencies section not empty (use "None" if no dependencies)
- [ ] **Acceptance Criteria**: Criteria are specific, testable, and comprehensive
- [ ] **Technical Requirements**: Requirements align with Unity ECS architecture patterns
- [ ] **User Story Quality**: Stories follow Role-Goal-Benefit format for both perspectives
- [ ] **Content Clarity**: All content is clear, accurate, and complete

**Integration Review:**

- [ ] **Tracking Integration**: Epic tracking in `epics.md` updated correctly
- [ ] **Context Integration**: Context files updated with new information appropriately
- [ ] **Vision Alignment**: Vision and roadmap updated if applicable and properly aligned
- [ ] **Cross-Reference Validation**: All cross-references validated and functional
- [ ] **Terminology Consistency**: Terminology consistent with other epics and documentation
- [ ] **Technical Alignment**: Technical approaches align across related epics
- [ ] **Dependency Logic**: No circular dependencies identified and logic is sound
- [ ] **Integration Points**: Integration points are well-defined and implementable

## Success Criteria

**Epic Completeness:**

- Epic file created with all required sections populated following canonical format
- Content is comprehensive and provides clear development guidance
- Technical requirements are specific, implementable, and aligned with Unity ECS architecture
- User value is clearly articulated and measurable through acceptance criteria

**System Integration:**

- Epic tracking system updated with new entry and proper categorization
- Context files enhanced with epic information and cross-references established
- Vision and roadmap aligned with epic scope and requirements if applicable
- All cross-references validated and functional across documentation

**Quality Standards:**

- Format specification compliance verified through mandatory validation
- Content quality meets project standards for clarity and completeness
- Technical accuracy ensured through architecture alignment validation
- Consistency maintained across all documentation and terminology

## Related Workflows

- [Update Epic Workflow](../prompts/epic-update.md) - For modifying existing epics
- [Epic Split Workflow](../prompts/epic-split.md) - For splitting large epics
- [Create Context Workflow](create-context.md) - For creating context files referenced in epics
- [Update Context Workflow](update-context.md) - For updating context files with epic information

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference the Format**: Always include this exact statement in prompts:

   ```markdown
   **Epic Format**: Follow the canonical epic format defined in [Epic Format Specification](../formats/epic-format.md)
   ```

2. **Validate Before Completion**: Run through the complete validation checklist before considering the epic file complete

3. **Use Correct Templates**: Apply the appropriate template based on epic category and type

4. **Enforce Section Order**: Maintain exact section order as specified in the format specification

5. **Include ALL Required Sections**: Never omit required sections - all must be present and properly filled

**FAILURE TO COMPLY**: Epic files that do not follow the format specification are invalid and will require correction.

## Notes

Additional context, special considerations, or implementation details for this workflow:

- New epics always start with "⏳ Not Started" status for consistent tracking
- File names must use kebab-case convention for system compatibility
- Dependencies must reference actual epic files that exist in the system
- Technical requirements must be compatible with Unity ECS architecture patterns
- User stories should cover both player and AI entity perspectives where relevant
- Always validate cross-references before finalizing any epic to maintain system integrity
- Context files should be updated to reflect new information from the epic
- Cross-reference impact should be considered for related epics, components, and user stories
- Format compliance is mandatory and takes priority over all other considerations
