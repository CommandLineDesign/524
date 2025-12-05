# Generate Components Workflow

## Purpose

This workflow defines the step-by-step process for analyzing a single epic and managing all necessary component specifications to realize the epic's vision. This workflow identifies, prioritizes, and determines the appropriate action (create, update, or split) for each component, then executes the corresponding specialized workflow. It ensures comprehensive coverage of epic requirements while maintaining consistency and avoiding duplication across all managed components.

## CRITICAL INPUT REQUIREMENT

**A specific epic MUST be provided to trigger this workflow.**

**FAILURE CONDITION**: If no epic is specified, this workflow MUST fail immediately with the message: "ERROR: No epic specified. Please provide the name or path of the specific epic for which components should be generated (e.g., 'ai-entity-power-systems' or 'product/epics/ai-entity-power-systems.md')."

## CRITICAL FORMAT REQUIREMENT

**ALL component files created by this workflow MUST follow the canonical Component Format specification.**

**Format Reference**: Use this exact reference in AI prompts:

```markdown
**Component Format**: Follow the canonical component format defined in [Component Format Specification](../formats/component-format.md)
```

**ENFORCEMENT**: Any component that does not comply with the format specification is considered invalid and must be corrected before use.

## Workflow Steps

### 1. Epic Analysis and Component Planning

**Purpose:**
Analyze the specified epic to understand its scope, requirements, and identify all components that need detailed specification to guide the component generation process and establish priorities for implementation.

**Input:**

- Specified epic file or epic name (REQUIRED)
- Epic priority and dependencies information
- Existing component specifications (if any)
- Development planning constraints

**Actions:**

1. **Validate Epic Specification**: Confirm epic is properly specified and accessible
2. **Read Source Epic**: Read the source epic file to understand its scope, objectives, and "Key Components" section
3. **Identify Specification Needs**: Identify which key components need detailed specification vs. those already specified
4. **Extract Component Descriptions**: Extract brief component descriptions from epic's "Key Components" section
5. **Identify Missing Components**: Identify missing components implied by epic requirements but not explicitly listed
6. **Assess Component Complexity**: Assess each component's complexity and estimated development effort for prioritization
7. **Determine Component Priority**: Determine component priority based on epic priority and development dependencies
8. **Plan Generation Sequence**: Plan the component generation and specification process sequence
9. **Document Epic Context**: Record epic scope, objectives, and acceptance criteria for component context

**Output:**

- Validated epic specification with confirmed accessibility
- Complete epic scope analysis document
- Extracted list of explicitly mentioned components from epic
- Identified implied components from epic requirements analysis
- Component complexity assessments for all identified components
- Component priority rankings based on epic priority and dependencies
- Component generation plan and sequence
- Documented epic context for component creation

**Validation:**

- [ ] **Epic Validation**: Epic properly specified and accessible for analysis
- [ ] **Epic Understanding**: Complete understanding of epic scope and requirements documented
- [ ] **Component Extraction**: All key components from epic explicitly extracted and listed
- [ ] **Missing Component Identification**: Implied components identified through epic requirements analysis
- [ ] **Complexity Assessment**: Component complexity levels accurately assessed and documented
- [ ] **Priority Ranking**: Components prioritized based on epic priority and dependencies
- [ ] **Process Planning**: Clear generation sequence and process plan established
- [ ] **Context Documentation**: Epic context properly documented for component creation

### 2. Context Enhancement Research

**Purpose:**
Gather comprehensive technical and architectural context from the project's context files to inform all component specifications with detailed technical requirements and architectural patterns that will be applied during component generation.

**Input:**

- Component list and epic analysis from Step 1
- Project context files in `ai/context/` directory
- Epic requirements and technical constraints
- Component technical domains and functionality areas

**Actions:**

1. **Review Business Logic Context**: Review `ai/context/` for detailed business logic and rules affecting components
2. **Check User Models Context**: Check `ai/context/` for user roles and component relationships
3. **Examine System Architectures Context**: Examine `ai/context/` for technical system architectures and component patterns
4. **Analyze Data Models Context**: Look at `ai/context/` for data schemas and flows
5. **Study UI/UX Context**: Review `ai/context/` for design and interface components
6. **Research Technical Patterns Context**: Check `ai/context/` for technical implementation patterns affecting components
7. **Validate Architecture Decisions Context**: Look at `ai/context/` for architecture decisions affecting component design
8. **Apply Design Principles Context**: Check `ai/context/` for design principles guiding component organization
9. **Map Context to Components**: Map relevant context insights to specific components identified in Step 1
10. **Cross-Reference Epic Requirements**: Cross-reference context findings with epic requirements for consistency
11. **Document Context Patterns**: Document technical patterns and architectural constraints applicable to components

**Output:**

- Technical context summary for each component area
- Architectural patterns and constraints documentation applicable to all components
- System interaction maps and dependencies relevant to epic components
- Design principles and guidelines summary for component creation
- Technical implementation patterns reference for component specifications
- Context-to-component mapping showing relevance of each context area
- Cross-referenced findings between context files and epic requirements
- Documented technical patterns and architectural constraints

**Validation:**

- [ ] **Context Coverage**: All relevant context files reviewed and documented for component generation
- [ ] **Technical Patterns**: Technical implementation patterns identified and documented for component use
- [ ] **Architecture Alignment**: Component generation requirements align with project architecture
- [ ] **Design Principles**: Design principles applied to component planning and generation
- [ ] **Dependency Mapping**: System dependencies and interactions mapped for all components
- [ ] **Component Mapping**: Context insights properly mapped to specific components
- [ ] **Cross-Reference Validation**: Context findings cross-referenced with epic requirements for consistency
- [ ] **Pattern Documentation**: Technical patterns and constraints properly documented for component creation

### 3. Component Action Assessment and Planning

**Purpose:**
Analyze epic component requirements against existing components to determine what action is needed for each component (create new, update existing, or split complex), then prepare comprehensive requirements for the appropriate specialized workflow execution.

**Input:**

- Component list and priorities from Step 1
- Technical context and patterns from Step 2
- Existing component specifications from the system
- Component Format Specification requirements
- Epic requirements and acceptance criteria

**Actions:**

1. **Expand Component Descriptions**: Transform brief epic component descriptions into detailed specification requirements
2. **Assess Existing Components**: For each epic component requirement, check if corresponding components already exist in the system
3. **Determine Component Actions**: For each component, determine the required action:
   - **Create**: Component doesn't exist and needs to be created
   - **Update**: Component exists but needs modifications to meet epic requirements
   - **Split**: Component exists but has become too complex and should be split into multiple components
4. **Analyze Update Requirements**: For existing components, identify specific changes needed to align with epic requirements
5. **Assess Split Candidates**: Evaluate existing components for complexity, scope, and architectural benefit of splitting
6. **Define Component Boundaries**: Determine component boundaries and interfaces based on functional scope and context
7. **Plan Component Relationships**: Plan component relationships and dependencies within the epic
8. **Apply Naming Standards**: Establish clear, descriptive names with kebab-case file naming for all components
9. **Categorize Components**: Assign appropriate categories (Foundation, Simulation, Interface, Integration, Utility) to all components
10. **Define Integration Points**: Identify integration points and interfaces between components within the epic
11. **Establish Dependencies**: Map dependencies between components and external system requirements
12. **Prepare Action Requirements**: Prepare detailed requirements for each component action (create, update, or split)
13. **Validate Scope Coverage**: Ensure all epic requirements are covered by planned component actions
14. **Document Action Plan**: Document the complete action plan for all components with specific workflow requirements

**Output:**

- Detailed component action assessment for each epic component requirement
- Categorized components by required action: create, update, or split
- Specific update requirements for existing components that need modifications
- Split assessment and requirements for components that should be divided
- Creation requirements for new components that need to be built
- Component boundary and interface definitions for all components
- Component relationship and dependency maps within the epic
- Standardized component names and file paths following naming conventions
- Component categorization assignments for all identified components
- Integration points and interfaces defined between epic components
- Component dependency maps and external system requirements
- Action-specific requirements prepared for specialized workflow execution
- Validated scope coverage ensuring epic requirements are fully addressed
- Complete action plan documenting all component workflow requirements

**Validation:**

- [ ] **Description Expansion**: Brief component descriptions transformed into detailed specification requirements
- [ ] **Existing Component Assessment**: All existing components properly assessed for epic alignment
- [ ] **Action Determination**: Appropriate action (create, update, split) determined for each component
- [ ] **Update Requirements**: Specific update requirements identified for existing components needing changes
- [ ] **Split Assessment**: Components properly assessed for split candidates with architectural justification
- [ ] **Boundary Definition**: Component boundaries are clear, logical, and well-defined
- [ ] **Relationship Planning**: Component relationships and dependencies properly planned within epic
- [ ] **Naming Standards**: Component names follow kebab-case and descriptive standards
- [ ] **Categorization**: Components properly categorized by type and functionality
- [ ] **Integration Definition**: Integration points and interfaces clearly defined between components
- [ ] **Dependency Mapping**: Dependencies between components and external systems properly mapped
- [ ] **Action Preparation**: Requirements properly prepared for appropriate specialized workflow execution
- [ ] **Scope Validation**: All epic requirements confirmed to be covered by planned component actions
- [ ] **Plan Documentation**: Complete action plan properly documented for component workflow execution

### 4. Cross-Epic Component Analysis

**Purpose:**
Ensure consistency and avoid duplication across all epic components by analyzing component relationships with existing components from other epics and consolidating overlapping functionality to maintain system coherence.

**Input:**

- Component specifications planning from Step 3
- Existing component specifications from other epics
- Cross-epic dependency requirements
- System architecture constraints and patterns

**Actions:**

1. **Search for Cross-Epic Overlap**: Search for similar components across multiple epics to identify potential overlap
2. **Identify Shared Functionality**: Identify shared or overlapping functionality that should be consolidated or reused
3. **Plan Integration Strategies**: Plan component reuse and integration strategies across epic boundaries
4. **Resolve Naming Conflicts**: Resolve naming conflicts and terminology inconsistencies with existing components
5. **Map Cross-Epic Dependencies**: Map dependencies between epic components and components from other epics
6. **Identify Component Hierarchies**: Identify component hierarchies and layered architectures across epic boundaries
7. **Document Integration Patterns**: Document integration patterns and communication protocols with existing components
8. **Ensure Interface Compatibility**: Ensure component interfaces are compatible across epic boundaries
9. **Update Component Plans**: Update component creation plans based on cross-epic analysis findings
10. **Validate System Coherence**: Validate that generated components maintain overall system coherence

**Output:**

- Cross-epic component overlap analysis with identified conflicts and synergies
- Consolidated component specifications with merged or reused functionality where appropriate
- Cross-epic integration strategies and patterns for component interfaces
- Resolved naming conflicts and standardized terminology across epics
- Complete component dependency maps including cross-epic dependencies
- Component hierarchy and architecture documentation spanning multiple epics
- Integration patterns and communication protocols with existing system components
- Updated component creation plans incorporating cross-epic analysis findings
- Validated system coherence ensuring components fit within broader architecture

**Validation:**

- [ ] **Overlap Analysis**: All cross-epic component overlaps identified and properly analyzed
- [ ] **Functionality Consolidation**: Shared functionality consolidated or reused appropriately without duplication
- [ ] **Integration Planning**: Cross-epic integration strategies clearly defined and documented
- [ ] **Naming Resolution**: All naming conflicts resolved with consistent terminology across epics
- [ ] **Dependency Mapping**: Cross-epic dependencies properly mapped and documented
- [ ] **Hierarchy Identification**: Component hierarchies and layered architectures properly identified
- [ ] **Interface Compatibility**: Component interfaces confirmed to be compatible across epic boundaries
- [ ] **Plan Updates**: Component creation plans properly updated based on analysis findings
- [ ] **System Coherence**: Generated components validated to maintain overall system coherence

### 5. Component Workflow Execution

**Purpose:**
Execute the appropriate specialized workflow (Create Component, Update Component, or Split Component) for each component based on the action assessment to comprehensively manage all component specifications that fulfill the epic requirements while maintaining consistency and quality.

**Input:**

- Finalized component action plans from Step 4
- Component action requirements categorized by create, update, and split
- Cross-epic analysis results and integration requirements
- Create Component, Update Component, and Split Component workflows for specialized execution

**Actions:**

1. **Prioritize Component Action Order**: Establish execution order based on dependencies, component priorities, and action types
2. **Prepare Component Action Inputs**: Prepare detailed inputs specific to each component action type
3. **Execute Create Component Actions**: For components requiring creation, execute [Create Component Workflow](create-component.md) with:
   - Component name and description
   - Parent epic reference
   - Component priority and category
   - Integration requirements from cross-epic analysis
4. **Execute Update Component Actions**: For components requiring updates, execute [Update Component Workflow](update-component.md) with:
   - Existing component file path
   - Specific changes needed for epic alignment
   - Updated integration requirements
   - Epic context and related component considerations
5. **Execute Split Component Actions**: For components requiring splitting, execute [Split Component Workflow](split-component.md) with:
   - Existing component file path to be split
   - Split requirements specifying functionality extraction
   - New component specifications and boundaries
   - Integration requirements for both resulting components
6. **Monitor Component Actions**: Monitor each component action execution for quality and consistency across all workflow types
7. **Validate Component Integration**: Ensure each processed component integrates properly with epic and related components
8. **Track Action Progress**: Track progress of all component actions and address any issues across different workflow types
9. **Maintain Component Consistency**: Ensure consistency across all components being created, updated, and split
10. **Document Action Results**: Document results and any modifications made during component workflow execution
11. **Validate Epic Coverage**: Confirm all epic requirements are covered by processed components
12. **Update Component Dependencies**: Update component dependencies based on actual workflow execution results

**Output:**

- Complete component specification files for all epic components following canonical format
- New components created through proper execution of Create Component Workflow
- Existing components updated through proper execution of Update Component Workflow
- Complex components split through proper execution of Split Component Workflow
- Validated component integration with epic and related components across all action types
- Component action progress tracking and issue resolution documentation for all workflow types
- Maintained consistency across all components created, updated, and split
- Documented action results including any modifications or adaptations made during execution
- Confirmed epic coverage with all requirements addressed by processed components
- Updated component dependencies reflecting actual workflow execution results and relationships

**Validation:**

- [ ] **Action Order**: Component execution order properly established based on dependencies, priorities, and action types
- [ ] **Input Preparation**: Component inputs properly prepared for appropriate specialized workflow execution
- [ ] **Create Workflow Execution**: Create Component Workflow properly executed for components requiring creation
- [ ] **Update Workflow Execution**: Update Component Workflow properly executed for components requiring updates
- [ ] **Split Workflow Execution**: Split Component Workflow properly executed for components requiring splitting
- [ ] **Action Monitoring**: Component actions properly monitored for quality and consistency across all workflow types
- [ ] **Integration Validation**: Each processed component properly integrates with epic and related components
- [ ] **Progress Tracking**: Component action progress properly tracked with issues addressed across all workflows
- [ ] **Consistency Maintenance**: Consistency maintained across all components created, updated, and split
- [ ] **Results Documentation**: Action results and modifications properly documented for all workflow types
- [ ] **Epic Coverage**: All epic requirements confirmed to be covered by processed components
- [ ] **Dependency Updates**: Component dependencies updated based on actual workflow execution results

### 6. Epic Integration and Master List Updates

**Purpose:**
Update the source epic and master component list to reflect all processed components (created, updated, and split), ensuring proper traceability, organization, and navigation throughout the development system.

**Input:**

- All processed component specification files from Step 5 (created, updated, and split)
- Source epic file requiring updates
- Master component list (`./product/components.md`)
- Epic-component relationship mappings and traceability requirements

**Actions:**

1. **Update Epic Key Components Section**: Update the source epic's "Key Components" section to link to all processed component specifications
2. **Replace Brief Descriptions**: Replace brief component descriptions with links to the detailed component files (including updated and newly split components)
3. **Update Epic Acceptance Criteria**: Update epic acceptance criteria to reference component deliverables where appropriate
4. **Document Epic-Component Relationships**: Ensure epic-component relationships are clearly documented and bidirectional for all processed components
5. **Update Master Component List**: Update the master component list (`./product/components.md`) to reflect all component changes:
   - Add newly created components
   - Update status and descriptions for modified components
   - Add new components resulting from splits
   - Update original components that were split
6. **Categorize All Components**: Ensure all processed components have appropriate categorization in the master list
7. **Update Status Indicators**: Set appropriate status indicators for all component specifications based on their processing type
8. **Maintain Epic Mappings**: Update epic-to-component mappings with accurate component counts reflecting all changes
9. **Update Development Statistics**: Update component development statistics and completion rates to reflect all component actions
10. **Validate All Links**: Ensure all links and references between epic, components, and master list are functional for all processed components
11. **Organize for Navigation**: Maintain proper organization for effective development navigation across all component changes

**Output:**

- Updated epic file with all processed component links in "Key Components" section
- Brief component descriptions replaced with detailed component file links for all processed components
- Updated epic acceptance criteria referencing component deliverables where appropriate
- Bidirectional traceability established between epic and all processed components
- Updated master component list reflecting all component changes (created, updated, split) with proper categorization
- Appropriate status indicators set for all processed component specifications based on action type
- Current epic-to-component mappings with accurate component counts reflecting all changes
- Updated development statistics and completion rates reflecting all component processing
- Validated links and functional references throughout the system for all processed components
- Well-organized component navigation structure maintained for development use across all changes

**Validation:**

- [ ] **Epic Updates**: Epic "Key Components" section updated with links to all processed component specifications
- [ ] **Description Replacement**: All brief descriptions replaced with detailed component file links for processed components
- [ ] **Acceptance Criteria**: Epic acceptance criteria updated appropriately to reference component deliverables
- [ ] **Bidirectional Traceability**: Epic-component relationships properly documented in both directions for all processed components
- [ ] **Master List Updates**: Master component list properly updated to reflect all component changes (created, updated, split)
- [ ] **Status Settings**: Appropriate status indicators set for all processed component specifications based on action type
- [ ] **Epic Mappings**: Epic-to-component mappings updated with accurate component counts reflecting all changes
- [ ] **Statistics Updates**: Development statistics and completion rates properly updated to reflect all component processing
- [ ] **Link Validation**: All links and references between epic, components, and master list are functional for processed components
- [ ] **Navigation Organization**: Proper organization maintained for effective development navigation across all component changes

## Quality Assurance

**MANDATORY INPUT VALIDATION:**

- [ ] **Epic Specified**: A specific epic name or path must be provided to proceed
- [ ] **Epic Accessibility**: Epic file must exist and be accessible for analysis
- [ ] **Epic Content**: Epic must contain sufficient content for component identification

**MANDATORY FORMAT VALIDATION:**

- [ ] **Component Format Compliance**: ALL created components MUST follow exact structure from [Component Format Specification](../formats/component-format.md)
- [ ] **Section Order**: All component headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled in every component
- [ ] **Status Indicators**: Component status uses correct format (Not Started, In Progress, Completed)
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets
- [ ] **Dependencies Section**: Dependencies section not empty (use "None" if no dependencies)

**CRITICAL**: If ANY format validation check fails, the affected components MUST be corrected before proceeding.

**Content Review:**

- [ ] **Epic Coverage**: All epic requirements are covered by processed components (created, updated, split)
- [ ] **Implementation Guidance**: All processed components provide clear guidance for implementation
- [ ] **Clear Boundaries**: Component boundaries are clearly defined and logical across all processed components
- [ ] **Well-Defined Interfaces**: Interfaces between components are well-defined and consistent
- [ ] **Accurate Dependencies**: Dependencies are accurately identified and documented for all processed components
- [ ] **Realistic Performance**: Performance requirements are realistic and measurable for all processed components
- [ ] **Architecture Alignment**: All processed components align with System Architecture patterns
- [ ] **Comprehensive Testing**: Testing strategies are comprehensive and practical for all processed components
- [ ] **Implementability**: All processed component specifications are implementable by developers

**Integration Review:**

- [ ] **Epic Integration**: All processed components properly integrated with source epic and requirements
- [ ] **Component Consistency**: Technical approaches consistent across all processed components (created, updated, split)
- [ ] **Cross-Epic Consistency**: Processed components maintain consistency with existing components from other epics
- [ ] **Naming Standards**: All component naming follows project standards and conventions
- [ ] **System Integration**: All processed components integrate properly with broader system architecture
- [ ] **Context Alignment**: All processed component specifications align with project context and patterns

**Component Management Process Review:**

- [ ] **Create Workflow Usage**: Create Component Workflow properly used for components requiring creation
- [ ] **Update Workflow Usage**: Update Component Workflow properly used for components requiring updates
- [ ] **Split Workflow Usage**: Split Component Workflow properly used for components requiring splitting
- [ ] **Action Assessment**: Component action assessment properly conducted to determine appropriate workflow
- [ ] **Quality Consistency**: Consistent quality maintained across all processed components regardless of action type
- [ ] **Dependencies Resolution**: All component dependencies properly resolved and documented across all actions
- [ ] **Integration Validation**: All processed components validated for proper integration with each other

## Success Criteria

**Component Management:**

- All components identified from epic analysis are successfully processed (created, updated, or split) with comprehensive specifications
- Component specifications enable clear understanding of implementation requirements for all epic components
- All dependencies and integration points are accurately identified and documented across processed components
- Development effort can be estimated and implementation sequences planned for all processed components
- Component interfaces are designed to work together effectively within the epic
- All processed components integrate seamlessly with the overall system architecture and source epic
- Components can be tested independently and in integration scenarios
- Clear navigation exists between all processed components and their source epic
- Consistent architecture patterns are maintained across all processed components

**System Integration:**

- Source epic properly updated to reference all processed component specifications
- Master component list accurately reflects all processed components (created, updated, split) with proper categorization
- Epic-to-component traceability is maintained and functional for all processed components
- Component processing supports effective development planning and implementation
- Cross-epic consistency is maintained with existing components from other epics
- All processed components contribute meaningfully to epic objectives and acceptance criteria

## Related Workflows

- [Create Component Workflow](./create-component.md) - Used in Step 5 for creating new individual components
- [Update Component Workflow](./update-component.md) - Used in Step 5 for updating existing components
- [Split Component Workflow](./split-component.md) - Used in Step 5 for splitting complex components
- [Update Epic Workflow](./update-epic.md) - Used in Step 6 for updating source epic with component links
- [Cross-Reference Validation Workflow](./cross-reference-validation.md) - Used for validating component links and references
- [Create Context Workflow](./create-context.md) - For creating context files related to component insights
- [Update Context Workflow](./update-context.md) - For updating context files with component information

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Validate Input First**: Always check that an epic is specified and accessible before proceeding with any other steps

2. **Reference the Format**: Always include this exact statement in prompts when calling Create Component Workflow:

   ```markdown
   **Component Format**: Follow the canonical component format defined in [Component Format Specification](../formats/component-format.md)
   ```

3. **Use Appropriate Component Workflows**: MUST use the appropriate specialized workflow for each component action:
   - [Create Component Workflow](create-component.md) for new component creation
   - [Update Component Workflow](update-component.md) for existing component updates
   - [Split Component Workflow](split-component.md) for component splitting
   - Never create, update, or split components directly in this workflow

4. **Validate Each Component**: Run through the complete validation checklist for each component processed

5. **Maintain Consistency**: Ensure all processed components maintain consistency with each other and with existing system components

6. **Enforce Section Order**: Maintain exact section order as specified in the format specification for all components

7. **Include ALL Required Sections**: Never omit required sections - all must be present and properly filled in every component

**FAILURE TO COMPLY**: Component files that do not follow the format specification are invalid and will require correction.

## Notes

Additional context, special considerations, or implementation details for this workflow:

- This workflow focuses on comprehensive component management from a single epic by intelligently determining and executing appropriate actions (create, update, split)
- Epic analysis and context research provide foundation for consistent component management across the epic
- Cross-epic analysis ensures processed components maintain system coherence and avoid duplication
- Each component action uses the appropriate specialized workflow (Create, Update, or Split Component) to ensure quality and consistency
- The workflow bridges epic-level planning with detailed component specifications for implementation
- Component specifications should be detailed enough to guide development but not so detailed as to become implementation documentation
- Processed components should evolve as implementation progresses and reveals new requirements
- Format compliance is mandatory and takes priority over all other considerations
- **Input Validation is Critical**: The workflow must fail immediately if no epic is specified
- **Workflow Delegation is Essential**: Always use appropriate specialized workflows (Create, Update, Split Component) for component actions
- **Action Assessment is Crucial**: Proper assessment of component requirements determines the most appropriate workflow to use
- **Consistency Maintenance**: Ensuring consistency across all processed components is crucial for system coherence
- **Epic Integration**: Proper integration with source epic ensures traceability and planning alignment
- **Comprehensive Management**: This workflow handles the full lifecycle of component management for an epic
