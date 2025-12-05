# Update Epic Workflow

## Purpose

This workflow provides standardized steps for updating individual 524 epic files (`./product/epics/*.md`) to incorporate feedback, additional context, design changes, and new insights while maintaining consistency across all related epics. It consolidates the epic update process from multiple prompts into a single authoritative workflow that ensures cross-epic dependencies, terminology, and design decisions remain coherent throughout the entire epic collection.

## CRITICAL FORMAT REQUIREMENT

**ALL epic files MUST follow the canonical epic format specification.**

**Format Reference**: Use this exact reference in AI prompts:

```markdown
**Epic Format**: Follow the canonical epic format defined in [Epic Format Specification](../formats/epic-format.md)
```

**ENFORCEMENT**: Any epic file that does not comply with the format specification is considered invalid and must be corrected before use.

## Workflow Steps

### 1. Analysis and Planning

**Purpose:**
Analyze the target epic's current state and determine the comprehensive scope of updates needed while enhancing understanding through available project context.

**Input:**

- Target epic file requiring updates
- Requested changes, feedback, or modifications
- Available context files in `ai/context/` directory
- Related epic dependencies and relationships

**Actions:**

1. **Read Target Epic**: Review the specific epic being updated to understand current content structure and details
2. **Identify Update Scope**: Determine sections that need modification based on provided feedback and requirements
3. **Assess Change Type**: Categorize updates (content, dependency, scope, consistency, status/priority) for planning
4. **Document Rationale**: Record why updates are needed and expected impact on epic and related systems
5. **Review Business Logic Context**: Check `ai/context/` for related business logic systems and interactions
6. **Examine User Context**: Review `ai/context/` for user behaviors, relationships, and dependencies
7. **Study Systems Context**: Examine `ai/context/` for technical architectures and implementation patterns
8. **Check Data Context**: Look at `ai/context/` for data flows, dependencies, and constraints
9. **Review UI/UX Context**: Check `ai/context/` for design systems and interactions
10. **Assess Technology Context**: Review `ai/context/` for technical approaches and architectural decisions
11. **Examine Design Context**: Study `ai/context/` for design philosophy, direction, and user experience principles

**Output:**

- Complete understanding of current epic content and structure
- Identified update scope with categorized change types
- Documented rationale for updates with expected impact assessment
- Enhanced understanding from business logic, users, systems, data, UI/UX, technology, and design contexts
- Context-informed perspective on epic relationships and integration requirements
- Comprehensive analysis foundation for subsequent workflow steps

**Validation:**

- [ ] **Epic Analysis**: Current epic content thoroughly reviewed and understood
- [ ] **Scope Identification**: Update scope clearly identified and categorized by change type
- [ ] **Change Documentation**: Rationale for updates properly documented with impact assessment
- [ ] **Context Integration**: All relevant context categories reviewed and insights integrated
- [ ] **Relationship Understanding**: Epic relationships and integration requirements enhanced through context
- [ ] **Analysis Completeness**: Comprehensive analysis foundation established for planning

### 2. Cross-Epic Discovery and Relationship Mapping

**Purpose:**
Map all epic relationships and dependencies that may be affected by the updates to ensure comprehensive planning and maintain system coherence.

**Input:**

- Target epic analysis from Step 1
- Complete epic collection in `./product/epics/`
- Epic dependency chains and cross-references
- System integration requirements

**Actions:**

1. **Identify Direct Dependencies**: Read epics listed in the Dependencies section of target epic
2. **Find Reverse Dependencies**: Search for epics that depend on the target epic or reference it
3. **Discover Related Systems**: Search for epics mentioning similar systems, components, or technical approaches
4. **Map Integration Points**: Identify epics sharing technical or functional boundaries with target epic
5. **Conduct Keyword Searches**: Search for system names, technical terms, and business logic across epics
6. **Perform Semantic Searches**: Search for functional descriptions, user experiences, and technical capabilities
7. **Analyze Dependency Chains**: Trace forward and backward dependency relationships through multiple levels
8. **Study Integration Patterns**: Examine shared components, data flows, and interface patterns between epics

**Output:**

- Complete mapping of direct dependencies from target epic
- Identified reverse dependencies showing epics that depend on target epic
- Related epics sharing systems, components, or technical approaches
- Mapped integration points between target epic and related systems
- Comprehensive search results covering keywords, semantic relationships, and technical patterns
- Traced dependency chains showing multi-level relationships
- Documented integration patterns affecting system boundaries and interfaces

**Validation:**

- [ ] **Direct Dependencies**: All epics listed in Dependencies section identified and reviewed
- [ ] **Reverse Dependencies**: Epics depending on target epic properly identified through search
- [ ] **Related Systems**: Epics with similar systems and components accurately mapped
- [ ] **Integration Points**: Technical and functional boundaries between epics clearly identified
- [ ] **Search Completeness**: Keyword and semantic searches comprehensively cover relevant relationships
- [ ] **Dependency Tracing**: Multi-level dependency chains properly traced and documented
- [ ] **Pattern Analysis**: Integration patterns and shared components accurately identified

### 3. Impact Assessment and Update Planning

**Purpose:**
Determine the comprehensive scope of changes required across multiple epics and develop a systematic plan for maintaining consistency throughout the update process.

**Input:**

- Cross-epic relationship mapping from Step 2
- Target epic update requirements from Step 1
- Related epic content and dependencies
- System integration constraints and requirements

**Actions:**

1. **Create Affected Epics List**: Identify all epics requiring updates for consistency with target epic changes
2. **Plan Change Sequencing**: Determine optimal order for making updates across epics to maintain integrity
3. **Define Consistency Requirements**: Establish terminology standards and technical approaches to maintain across updates
4. **Design Integration Planning**: Plan updates that preserve system integration points and boundaries
5. **Establish Verification Criteria**: Define technical soundness requirements for updated functionality
6. **Plan Testing Approaches**: Design validation methods for updated functionality and integration points
7. **Set Consistency Checkpoints**: Establish validation points for maintaining consistency throughout updates
8. **Document Completeness Requirements**: Define documentation standards and completeness criteria for updates

**Output:**

- Complete list of affected epics with specific update requirements for each
- Planned change sequence optimized for maintaining system integrity throughout process
- Defined consistency requirements including terminology standards and technical approaches
- Integration planning preserving system boundaries and interaction points
- Established verification criteria for technical soundness and functionality validation
- Planned testing approaches for validating updated functionality and system integration
- Defined consistency validation checkpoints throughout the update process
- Documented completeness requirements ensuring comprehensive and quality updates

**Validation:**

- [ ] **Epic List Completeness**: All epics requiring updates properly identified with specific requirements
- [ ] **Sequence Planning**: Change order optimized for maintaining integrity throughout update process
- [ ] **Consistency Standards**: Terminology and technical standards clearly defined for consistency
- [ ] **Integration Preservation**: Update planning properly preserves system integration points and boundaries
- [ ] **Verification Planning**: Technical soundness criteria established with appropriate validation methods
- [ ] **Testing Strategy**: Testing approaches designed for functionality and integration validation
- [ ] **Checkpoint Definition**: Consistency validation checkpoints strategically placed throughout process
- [ ] **Completeness Standards**: Documentation standards and completeness criteria properly defined

### 4. Context File Review and Planning

**Purpose:**
Review and plan updates to context files that relate to the epic changes to ensure knowledge base accuracy and support for future development.

**Input:**

- Impact assessment and update planning from Step 3
- Related context files in `ai/context/` directory
- Epic change requirements affecting context information
- Context file cross-references and relationships

**Actions:**

1. **Identify Affected Context Files**: Determine which context files relate to the updated epic and require modification
2. **Assess Context Information Changes**: Evaluate what specific information needs updating in each identified context file
3. **Plan Context File Updates**: Design modifications for existing context files to reflect epic changes
4. **Plan New Context Creation**: Identify needs for new context files covering novel concepts or systems
5. **Plan Business Logic Updates**: Design updates for `ai/context/` files affected by epic changes
6. **Plan Systems Updates**: Design modifications for `ai/context/` files reflecting technical changes
7. **Plan User Updates**: Plan updates for `ai/context/` files reflecting user behavior or relationship changes
8. **Plan Technology Updates**: Design updates for `ai/context/` files reflecting architectural changes
9. **Plan Design Updates**: Plan modifications for `ai/context/` files reflecting design philosophy changes
10. **Plan Technical Updates**: Design updates for `ai/context/` files reflecting implementation changes

**Output:**

- Complete list of affected context files with specific update requirements
- Assessed information changes needed in each context file for accuracy
- Planned modifications for existing context files reflecting epic changes
- Identified requirements for new context files covering novel concepts
- Planned updates for business logic context files affected by epic changes
- Designed modifications for systems context files reflecting technical changes
- Planned updates for user context files reflecting behavior or relationship changes
- Designed updates for technology context files reflecting architectural changes
- Planned modifications for design context files reflecting philosophy changes
- Designed updates for technical context files reflecting implementation changes

**Validation:**

- [ ] **Context Identification**: All affected context files properly identified with specific update needs
- [ ] **Information Assessment**: Required information changes accurately assessed for each context file
- [ ] **Update Planning**: Context file modifications properly planned to reflect epic changes
- [ ] **New Context Planning**: Requirements for new context files properly identified and planned
- [ ] **Category Coverage**: All relevant context categories (business-logic, systems, users, technology, design, technical) addressed
- [ ] **Change Alignment**: Context updates properly aligned with epic changes and requirements
- [ ] **Cross-Reference Planning**: Context file cross-references and relationships maintained in planning
- [ ] **Knowledge Base Integrity**: Context updates planned to maintain knowledge base accuracy and completeness

### 5. Update Execution

**Purpose:**
Execute the planned updates to the target epic and all affected related epics while maintaining strict format compliance and system consistency.

**Input:**

- Update planning and requirements from Steps 1-4
- Target epic file and affected related epics
- Epic Format Specification requirements
- Consistency standards and terminology requirements

**Actions:**

1. **Update Target Epic Content**: Modify descriptions, components, acceptance criteria, and technical requirements in target epic
2. **Update Target Epic Dependencies**: Add, remove, or modify dependency lists and cross-references in target epic
3. **Adjust Target Epic Scope**: Split or merge features, adjust effort estimates, and move features between epics as needed
4. **Update Target Epic Status**: Modify completion status, priorities, and effort estimates based on changes
5. **Validate Target Epic Format**: Ensure target epic follows Epic Format Specification exactly with proper section order
6. **Update Related Epic Dependencies**: Modify dependency lists in affected epics to reflect target epic changes
7. **Harmonize Epic Terminology**: Standardize language and terminology across related epics for consistency
8. **Align Technical Approaches**: Ensure compatible technical approaches and integration points across related epics
9. **Update Cross-References**: Modify links between epics when names, files, or relationships change
10. **Validate Format Compliance**: Confirm all updated epics follow Epic Format Specification requirements

**Output:**

- Updated target epic with modified content, dependencies, scope, and status reflecting all requirements
- Format-compliant target epic following Epic Format Specification with proper section structure
- Updated related epics with modified dependencies reflecting target epic changes
- Harmonized terminology and language across all affected epics for consistency
- Aligned technical approaches ensuring compatibility and integration across related systems
- Updated cross-references maintaining accurate links between epics after changes
- Format-compliant related epics following Epic Format Specification requirements
- Complete epic update execution maintaining system integrity and consistency

**Validation:**

- [ ] **MANDATORY FORMAT COMPLIANCE**: Target epic MUST follow exact structure from [Epic Format Specification](../formats/epic-format.md)
- [ ] **Content Updates**: All required content modifications completed accurately in target epic
- [ ] **Dependency Updates**: Epic dependencies properly updated reflecting current relationships
- [ ] **Scope Adjustments**: Epic scope modifications implemented accurately with proper effort estimates
- [ ] **Status Updates**: Epic status, priorities, and estimates updated appropriately
- [ ] **Related Epic Updates**: All affected related epics properly updated for consistency
- [ ] **Terminology Consistency**: Language standardized across all affected epics
- [ ] **Technical Alignment**: Technical approaches aligned and compatible across related systems
- [ ] **Cross-Reference Accuracy**: All cross-references updated and functional after changes
- [ ] **Format Validation**: All updated epics comply with Epic Format Specification requirements

### 6. Context File Updates

**Purpose:**
Execute planned context file updates to reflect epic changes and maintain accurate knowledge base supporting future development and epic generation.

**Input:**

- Context file update planning from Step 4
- Updated epics from Step 5
- Context files requiring modification or creation
- Context Format Specification requirements

**Actions:**

1. **Update Existing Context Files**: Modify context files affected by epic changes with accurate current information
2. **Create New Context Files**: Generate new context files for novel concepts or systems introduced in epic updates
3. **Maintain Context Cross-References**: Update links between context files to reflect epic changes and new relationships
4. **Validate Context-Epic Alignment**: Ensure context files accurately align with updated epic content and requirements
5. **Update Business Logic Context**: Modify business logic context files reflecting system changes
6. **Update Systems Context**: Modify systems context files reflecting technical architecture changes
7. **Update User Context**: Modify user context files reflecting behavior or relationship changes
8. **Update Technology Context**: Modify technology context files reflecting architectural or approach changes
9. **Update Design Context**: Modify design context files reflecting philosophy or user experience changes
10. **Update Technical Context**: Modify technical context files reflecting implementation or pattern changes

**Output:**

- Updated existing context files accurately reflecting epic changes and current information
- New context files created for novel concepts or systems introduced in epic updates
- Maintained cross-references between context files reflecting updated relationships
- Validated alignment between context files and updated epic content
- Updated business logic context files reflecting current system requirements
- Updated systems context files reflecting current technical architecture
- Updated user context files reflecting current behavior and relationship requirements
- Updated technology context files reflecting current architectural approaches
- Updated design context files reflecting current philosophy and user experience principles
- Updated technical context files reflecting current implementation patterns and approaches

**Validation:**

- [ ] **Context Updates**: Existing context files properly updated to reflect epic changes accurately
- [ ] **New Context Creation**: New context files created as needed for novel concepts or systems
- [ ] **Cross-Reference Maintenance**: Links between context files updated to reflect current relationships
- [ ] **Context-Epic Alignment**: Context files properly aligned with updated epic content and requirements
- [ ] **Category Coverage**: All relevant context categories properly updated reflecting epic changes
- [ ] **Information Accuracy**: Context information is accurate, current, and actionable for development
- [ ] **Format Compliance**: Context files follow proper format specifications and standards
- [ ] **Knowledge Base Integrity**: Context updates maintain knowledge base accuracy and completeness

### 7. Validation and Quality Assurance

**Purpose:**
Conduct comprehensive validation of all updates to ensure quality, consistency, technical soundness, and system integrity before completing the update process.

**Input:**

- Updated target epic from Step 5
- Updated related epics from Step 5
- Updated context files from Step 6
- Epic Format Specification validation requirements
- Quality standards and consistency requirements

**Actions:**

1. **Validate Technical Soundness**: Verify implementability and System Architecture alignment across all updates
2. **Review User Story Quality**: Check that stories and acceptance criteria are realistic, testable, and implementable
3. **Validate Effort Estimates**: Ensure estimates reflect current complexity understanding and implementation requirements
4. **Confirm Format Compliance**: Verify all updated epics comply with Epic Format Specification exactly
5. **Check Terminology Consistency**: Validate that language is standardized across all related epics
6. **Verify Technical Compatibility**: Ensure technical approaches are compatible between updated systems
7. **Validate Dependency Logic**: Confirm dependency chains remain logical, implementable, and properly sequenced
8. **Verify Integration Clarity**: Ensure integration points are clearly defined and consistent across systems
9. **Check Cross-Reference Integrity**: Validate all cross-references are functional with no orphaned or broken links
10. **Validate Context Alignment**: Confirm context files accurately reflect all epic changes and updates

**Output:**

- Validated technical soundness with confirmed implementability and System Architecture alignment
- Quality-reviewed user stories and acceptance criteria confirmed as realistic and testable
- Validated effort estimates reflecting current complexity and implementation understanding
- Format-compliant epic files confirmed to follow Epic Format Specification exactly
- Consistent terminology validated across all related epic documentation
- Compatible technical approaches verified between all updated systems
- Logical dependency chains confirmed as implementable and properly sequenced
- Clear integration points validated as consistent across all related systems
- Functional cross-references confirmed with no broken or orphaned links
- Aligned context files validated to accurately reflect all epic changes

**Validation:**

- [ ] **MANDATORY FORMAT VALIDATION**: All epics MUST follow exact structure from [Epic Format Specification](../formats/epic-format.md)
- [ ] **Technical Soundness**: All updates verified as implementable within System Architecture
- [ ] **User Story Quality**: Stories and acceptance criteria confirmed as realistic and testable
- [ ] **Effort Estimate Accuracy**: Estimates reflect current complexity understanding appropriately
- [ ] **Terminology Consistency**: Language standardized across all related epic documentation
- [ ] **Technical Compatibility**: Technical approaches compatible between all updated systems
- [ ] **Dependency Logic**: Dependency chains logical, implementable, and properly sequenced
- [ ] **Integration Clarity**: Integration points clearly defined and consistent across systems
- [ ] **Cross-Reference Integrity**: All cross-references functional with no broken or orphaned links
- [ ] **Context Alignment**: Context files accurately reflect all epic changes and updates
- [ ] **System Consistency**: Overall system consistency maintained through comprehensive validation
- [ ] **Quality Standards**: All updates meet project quality standards and requirements

**CRITICAL**: If ANY format validation check fails, the epic files MUST be corrected before proceeding.

## Quality Assurance

**MANDATORY FORMAT VALIDATION:**

- [ ] **Epic Format Compliance**: All epic files MUST follow exact structure from [Epic Format Specification](../formats/epic-format.md)
- [ ] **Section Order**: Headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Status Indicators**: Epic status uses correct format and emoji
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets
- [ ] **Metadata Fields**: Category, Priority, Status, Dependencies, Estimated Effort use specified options

**CRITICAL**: If ANY format validation check fails, the epic files MUST be corrected before proceeding.

**Content Review:**

- [ ] **Technical Accuracy**: All sections are comprehensive and technically accurate
- [ ] **User Story Quality**: User stories and acceptance criteria are realistic and testable
- [ ] **Architecture Alignment**: Technical requirements align with System Architecture
- [ ] **Risk Assessment**: Risk assessments and assumptions are current and valid
- [ ] **Effort Estimates**: Estimates reflect current complexity understanding and implementation requirements

**Integration Review:**

- [ ] **Epic Consistency**: All affected epics have been updated for consistency
- [ ] **Context Alignment**: Context files accurately reflect epic changes
- [ ] **Cross-Reference Integrity**: Cross-references between epics are functional and helpful
- [ ] **Terminology Consistency**: Terminology is consistent across all related documentation
- [ ] **System Integration**: Integration points are clearly defined and consistent across systems

**Consistency Review:**

- [ ] **Dependency Logic**: Dependencies are logical, up-to-date, and properly sequenced
- [ ] **Technical Compatibility**: Technical approaches are compatible across related systems
- [ ] **Integration Clarity**: Integration points are clearly defined and consistent
- [ ] **Circular Dependencies**: No circular dependencies or logical conflicts exist
- [ ] **Cross-Epic Alignment**: Cross-epic terminology and technical approaches are consistent

## Success Criteria

**Update Completion:**

- Target epic incorporates all requested changes with proper format compliance and quality standards
- All related epics maintain consistency and valid cross-references with harmonized terminology
- Context files accurately reflect the updated epic structure and content with proper alignment
- Dependency chains remain logical, implementable, and properly sequenced without conflicts

**Quality Standards:**

- Content is technically accurate and implementable within System Architecture
- User stories and acceptance criteria are realistic, testable, and provide clear implementation guidance
- Integration points between systems are clearly defined, functional, and consistently documented
- Effort estimates reflect current understanding of implementation complexity and requirements

**System Integration:**

- Cross-epic terminology and technical approaches are consistent and harmonized across documentation
- Context files provide accurate information for epic and story generation with maintained knowledge base integrity
- All cross-references and dependency links are functional and helpful for navigation and planning
- Updates enable clear development planning and implementation guidance throughout the development process

## Related Workflows

- [Create Epic Workflow](./create-epic.md) - For creating new epics that may relate to updated epics
- [Update Context Workflow](./update-context.md) - For modifying context files affected by epic updates
- [Cross-Reference Validation Workflow](./cross-reference-validation.md) - For validating links after epic updates
- [Process Context Workflow](./process-context.md) - For converting updated contexts to epics/stories

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference the Format**: Always include this exact statement in prompts:

   ```markdown
   **Epic Format**: Follow the canonical epic format defined in [Epic Format Specification](../formats/epic-format.md)
   ```

2. **Maintain Format Compliance**: ALL updates must preserve exact format specification compliance

3. **Validate After Changes**: Run through the complete validation checklist after any modification

4. **Preserve Required Sections**: Never remove required sections during updates

5. **Update Required Fields**: Always update metadata and status as appropriate

**FAILURE TO COMPLY**: Epic file updates that break format compliance are invalid and will require correction.

## Notes

Additional context, special considerations, or implementation details for this workflow:

- Epic updates often have cascading effects requiring systematic validation across multiple files and dependencies
- The workflow emphasizes consistency maintenance and cross-epic integration as critical success factors for system coherence
- Always validate that technical approaches remain compatible across related systems and maintain System Architecture alignment
- Dependency relationships must reflect logical implementation sequences and avoid circular dependencies or conflicts
- Context file updates are essential for maintaining the knowledge base that supports epic and story generation throughout development
- Cross-reference integrity is critical for maintaining navigation and system understanding across the documentation
- Terminology consistency across epics ensures clear communication and reduces confusion during development
- Format compliance cannot be compromised and takes priority over all other considerations during updates
