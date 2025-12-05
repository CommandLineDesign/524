# Create Story Workflow

## Purpose

This workflow provides standardized steps for creating new user story files within the AI development system. It ensures proper formatting, epic integration, context enhancement, tracking updates, and cross-reference consistency while maintaining the INVEST principles for effective user story development.

## CRITICAL FORMAT REQUIREMENT

**ALL story files MUST follow the canonical story format specification.**

**Format Reference**: Use this exact reference in AI prompts:

```markdown
**Story Format**: Follow the canonical story format defined in [Story Format Specification](../formats/story-format.md)
```

**ENFORCEMENT**: Any story file that does not comply with the format specification is considered invalid and must be corrected before use.

## Workflow Steps

### 1. Epic Name Validation and Input Gathering

**Purpose:**
Validate the parent epic exists and gather all necessary inputs for story creation to ensure proper integration and prevent orphaned stories.

**Input:**

- Epic name (REQUIRED) - The name of the epic this story belongs to
- Story title concept and user role identification
- Initial goal and benefit understanding
- Priority assessment criteria
- Dependency identification requirements

**Actions:**

1. **Validate Epic Name**: CRITICAL - If epic name is not provided, display error: "ERROR: Epic name is required. Please provide the name of the epic file (e.g., '524-core-architecture.md') that this story belongs to."
2. **Confirm Epic Exists**: Verify the referenced epic file exists in `product/epics/` directory
3. **Stop If Invalid**: Do not proceed with any file creation or updates until valid epic name is specified
4. **Gather Story Title**: Collect clear, descriptive name reflecting the user goal or system capability
5. **Define User Role**: Identify the user type (Customer, Artist, Admin, Developer, etc.)
6. **Specify Goal**: Document specific, actionable objective the user wants to achieve
7. **Articulate Benefit**: Define clear value proposition and motivation for the user
8. **Assign Priority**: Determine Critical, High, Medium, or Low based on importance
9. **Identify Dependencies**: Document which existing stories this depends on (or "None")
10. **Gather Context**: Collect comprehensive background on the user need and expected outcomes
11. **Draft Acceptance Criteria**: Initial specific functional and non-functional requirements

**Output:**

- Validated epic name with confirmed file existence
- Complete story input requirements documentation
- Clear user role, goal, and benefit definition
- Priority assignment with justification
- Dependency mapping and validation
- Comprehensive context and acceptance criteria draft

**Validation:**

- [ ] **Epic Validation**: Epic name provided and confirmed to exist in `product/epics/` directory
- [ ] **Input Completeness**: All required input elements collected and documented
- [ ] **Role Definition**: User role clearly defined and appropriate for story context
- [ ] **Goal Clarity**: Goal is specific, actionable, and measurable
- [ ] **Benefit Articulation**: Benefit provides clear value proposition and motivation
- [ ] **Priority Assignment**: Priority level assigned with appropriate justification
- [ ] **Dependency Documentation**: Dependencies identified and documented (or "None" specified)

### 2. Epic and Related Story Analysis

**Purpose:**
Analyze the parent epic and all related stories within the epic to understand contextual relationships, scope boundaries, and integration requirements that will inform the creation of the new story.

**Input:**

- Validated epic name and story input requirements from Step 1
- Parent epic file confirmed to exist
- All other stories belonging to the same parent epic
- Epic scope, objectives, and acceptance criteria

**Actions:**

1. **Read Parent Epic**: Thoroughly read the parent epic file to understand overall scope, objectives, acceptance criteria, and user value proposition
2. **Analyze Epic Context**: Understand how the new story should fit within the epic's broader goals and contribute to epic completion
3. **Review Epic User Stories Section**: Examine all stories currently listed in the epic's "User Stories" section to understand existing coverage
4. **Identify Related Stories**: Find existing stories that share similar functionality, user roles, technical components, or integration points with the planned new story
5. **Deep Analysis of Related Stories**: Read and analyze each related story to understand their acceptance criteria, technical approaches, dependencies, and scope boundaries
6. **Map Story Relationships**: Document how the new story will relate to existing stories (potential dependencies, integration points, shared components)
7. **Identify Coverage Gaps**: Look for functionality gaps in existing stories that the new story should address
8. **Analyze Consistency Requirements**: Determine what terminology, technical approaches, or user experience patterns must be followed to maintain consistency
9. **Assess Epic Contribution**: Evaluate how the new story will contribute to achieving the epic's overall objectives and acceptance criteria
10. **Define Integration Strategy**: Plan how the new story will integrate with existing stories and avoid conflicts or redundancy
11. **Document Scope Boundaries**: Establish clear boundaries for the new story to avoid overlap with existing stories

**Output:**

- Complete understanding of parent epic scope, objectives, and acceptance criteria
- Analyzed relationship between planned new story and epic's broader goals
- Comprehensive list of existing related stories with detailed analysis of each
- Mapped potential relationships between new story and existing stories
- Identified functionality gaps that the new story should address
- Documented consistency requirements for terminology, technical approaches, and user experience
- Defined strategy for how new story will contribute to epic objectives
- Planned integration approach to avoid conflicts and ensure complementary functionality
- Established clear scope boundaries for the new story

**Validation:**

- [ ] **Epic Understanding**: Parent epic thoroughly read and understood including scope, objectives, and acceptance criteria
- [ ] **Story-Epic Alignment**: Planned new story's relationship to epic goals clearly analyzed and documented
- [ ] **Related Story Identification**: All existing related stories within the epic properly identified and listed
- [ ] **Deep Story Analysis**: Each related story thoroughly analyzed for acceptance criteria, technical approaches, and scope boundaries
- [ ] **Relationship Planning**: Potential relationships between new story and existing stories clearly mapped
- [ ] **Gap Identification**: Functionality gaps that new story should address properly identified
- [ ] **Consistency Requirements**: Terminology, technical, and UX consistency requirements documented
- [ ] **Epic Contribution**: How new story will contribute to epic objectives clearly defined
- [ ] **Integration Strategy**: Clear integration strategy planned to avoid conflicts and redundancy
- [ ] **Scope Boundaries**: Clear scope boundaries established for new story to prevent overlap

### 3. Context Enhancement Research

**Purpose:**
Review relevant context files to enhance story authenticity, accuracy, and alignment with established system capabilities and user experience patterns.

**Input:**

- Story input requirements from Step 1
- Epic and related story analysis from Step 2
- Project context files in `ai/context/` directory
- User role and goal specifications
- System capabilities and constraints requirements

**Actions:**

1. **Review Business Logic**: Examine `ai/context/` for related business logic systems and user interaction patterns
2. **Check User Behaviors**: Review `ai/context/` for user behaviors, properties, and relationships
3. **Examine System Capabilities**: Check `ai/context/` for technical system capabilities and user interface points
4. **Analyze Data Patterns**: Look at `ai/context/` for data management patterns and user needs
5. **Study UI/UX Interactions**: Review `ai/context/` for design interactions and user experiences
6. **Research Technical Constraints**: Check `ai/context/` for technical capabilities and user interface constraints
7. **Validate User Motivation**: Use context to understand deeper user needs and authentic motivations
8. **Ensure Realistic Goals**: Verify story goals align with actual system capabilities from context
9. **Confirm Accurate Benefits**: Validate that story benefits reflect real value based on context understanding
10. **Verify Technical Feasibility**: Ensure acceptance criteria are technically achievable using context information
11. **Check Experience Consistency**: Confirm story aligns with broader user experience patterns from context
12. **Cross-Reference Epic Analysis**: Validate context findings against epic and related story analysis for consistency

**Output:**

- Context-enhanced understanding of user needs and motivations
- Validated story goals aligned with system capabilities
- Confirmed benefits reflecting real system value
- Technically feasible acceptance criteria
- Consistent user experience alignment
- Context-informed story requirements and constraints
- Cross-validated findings between context files and epic/story analysis

**Validation:**

- [ ] **Context Coverage**: All relevant context categories reviewed and insights documented
- [ ] **User Motivation Enhancement**: Story motivation enhanced with authentic context insights
- [ ] **Goal Realism**: Story goals confirmed to align with actual system capabilities
- [ ] **Benefit Accuracy**: Benefits validated to reflect real value from context understanding
- [ ] **Technical Feasibility**: Acceptance criteria verified as technically achievable
- [ ] **Experience Consistency**: Story confirmed to align with broader user experience patterns
- [ ] **Epic-Context Alignment**: Context findings properly cross-validated with epic and story analysis

### 4. Story File Creation

**Purpose:**
Create a comprehensive story specification file following the canonical Story Format to ensure consistent structure, complete information, and proper user story documentation.

**Input:**

- Enhanced story requirements from Step 3
- Epic and related story analysis from Step 2
- Story Format Specification template
- Context-informed user needs and technical constraints
- Validated epic integration requirements

**Actions:**

1. **Generate Filename**: Create kebab-case filename matching story title (e.g., `ecs-system-performance.md`)
2. **Create File Path**: Establish path as `product/stories/[story-name].md`
3. **Apply Template Structure**: Follow [Story Format Specification](../formats/story-format.md) exactly with all required sections
4. **Populate Metadata**: Fill Title, Epic link, Role, Priority, Status, Dependencies, and Estimated Effort fields
5. **Write Story Statement**: Create "As a [Role] I want [Goal] So that [Benefit]" format with proper bold formatting
6. **Develop Detailed Description**: Write comprehensive context, motivation, and expected outcomes
7. **Create Acceptance Criteria**: Document Given-When-Then format with functional and non-functional requirements
8. **Design User Experience Flow**: Detail step-by-step user interactions and experience
9. **Document Technical Context**: Specify epic integration, system components, data requirements, integration points
10. **Define Completion Criteria**: Create specific, measurable Definition of Done criteria
11. **Ensure Epic Alignment**: Verify story content aligns with parent epic scope and objectives from Step 2 analysis
12. **Maintain Story Consistency**: Ensure terminology and approach align with related stories identified in Step 2
13. **Add Implementation Notes**: Include additional context and implementation considerations

**Output:**

- Complete story specification file following canonical format
- All required sections populated with comprehensive information
- Proper story statement in Role-Goal-Benefit format
- Detailed acceptance criteria in Given-When-Then format
- Complete user experience flow documentation
- Technical context and integration specifications
- Verified alignment with parent epic scope and objectives
- Maintained consistency with related stories in terminology and approach

**Validation:**

- [ ] **Format Compliance**: Story file follows exact structure from [Story Format Specification](../formats/story-format.md)
- [ ] **Section Completeness**: ALL required sections are present and properly filled
- [ ] **Story Statement Format**: Uses exact "As a [Role] I want [Goal] So that [Benefit]" format with bold keywords
- [ ] **Acceptance Criteria Format**: Uses proper Given-When-Then format with bold keywords
- [ ] **Dependencies Documentation**: Dependencies section not empty (use "None" if no dependencies)
- [ ] **User Experience Flow**: Complete and realistic user interaction flow documented
- [ ] **Technical Context**: Proper integration points and system components specified
- [ ] **Epic Alignment**: Story content properly aligned with parent epic scope and objectives
- [ ] **Story Consistency**: Terminology and approach consistent with related stories

### 5. INVEST Principle Validation

**Purpose:**
Validate the story meets all INVEST principles (Independent, Negotiable, Valuable, Estimable, Small, Testable) to ensure effective user story quality and development feasibility.

**Input:**

- Complete story specification from Step 4
- INVEST principle criteria and standards
- Development team estimation capabilities
- Story scope and complexity assessment

**Actions:**

1. **Validate Independence**: Confirm story can be developed without depending on other stories
2. **Ensure Negotiability**: Verify details can be discussed and refined during development
3. **Confirm Value**: Validate story delivers clear value to the user or business
4. **Check Estimability**: Ensure development team can estimate effort required
5. **Verify Size**: Confirm story can be completed within estimated timeframe
6. **Validate Testability**: Ensure story has clear acceptance criteria that can be verified
7. **Document Validation Results**: Record INVEST principle compliance assessment
8. **Address Violations**: Modify story elements that don't meet INVEST criteria

**Output:**

- INVEST principle compliance validation results
- Documented assessment of story quality against each principle
- Modified story elements to address any principle violations
- Confirmed story readiness for development planning
- Quality assurance documentation for story effectiveness

**Validation:**

- [ ] **Independent**: Story can be developed without depending on other stories
- [ ] **Negotiable**: Details can be discussed and refined during development
- [ ] **Valuable**: Story delivers clear value to the user or business
- [ ] **Estimable**: Development team can estimate effort required
- [ ] **Small**: Story can be completed within estimated timeframe
- [ ] **Testable**: Story has clear acceptance criteria that can be verified
- [ ] **Compliance Documentation**: INVEST validation results properly documented

### 6. Story Tracking Integration

**Purpose:**
Update the master story tracking system to include the new story and maintain proper organization, status tracking, and statistical accuracy for development oversight.

**Input:**

- Complete validated story file from Step 5
- Master story tracking file (`product/stories.md`)
- Epic categorization and organization requirements
- Current tracking statistics and format

**Actions:**

1. **Open Tracking File**: Access `product/stories.md` for editing
2. **Locate Epic Section**: Find the appropriate epic section for the new story
3. **Add Story Entry**: Insert new story entry with proper formatting and brief description
4. **Set Initial Status**: Use ⏳ **Not Started** status for new stories
5. **Maintain Organization**: Keep logical ordering within epic categories
6. **Update Epic-to-Story Mapping**: Increment story count for parent epic
7. **Update Statistics**: Modify Total Stories, Pending counts, and completion rate
8. **Validate Format Consistency**: Ensure consistent formatting with existing entries

**Output:**

- Updated `product/stories.md` with new story entry
- Proper categorization under correct epic section
- Initial status set to ⏳ **Not Started**
- Updated epic-to-story mapping counts
- Current statistics reflecting new story addition
- Consistent formatting with existing tracking entries

**Validation:**

- [ ] **Tracking Update**: New story entry added to correct epic section in `product/stories.md`
- [ ] **Status Setting**: Initial status set to ⏳ **Not Started**
- [ ] **Epic Organization**: Story placed under appropriate epic with logical ordering
- [ ] **Format Consistency**: Entry formatting matches existing entries exactly
- [ ] **Story Count Updates**: Epic-to-story mapping counts properly incremented
- [ ] **Statistics Accuracy**: Total Stories, Pending counts, and completion rate updated correctly

### 7. Parent Epic Integration

**Purpose:**
Update the parent epic file to include the new story and maintain bidirectional traceability between epics and stories for comprehensive development planning.

**Input:**

- Complete story file from Step 4
- Parent epic file requiring updates
- Epic-story integration requirements
- Story organizational and formatting standards

**Actions:**

1. **Access Parent Epic**: Open the parent epic file for editing following [Update Epic Workflow](update-epic.md)
2. **Locate User Stories Section**: Find the "User Stories" section within the epic
3. **Add Story Reference**: Include story using format `[Story Title](../stories/story-name.md): Brief description`
4. **Maintain Organization**: Keep alphabetical or logical ordering within epic
5. **Update Acceptance Criteria**: Modify epic acceptance criteria if affected by new story
6. **Verify Scope Alignment**: Ensure story aligns with epic's overall scope and objectives
7. **Validate Integration**: Confirm proper bidirectional linking between epic and story

**Output:**

- Updated parent epic file with new story reference
- Proper story listing in epic's "User Stories" section
- Maintained organizational structure within epic
- Updated epic acceptance criteria if affected
- Confirmed scope alignment between story and epic
- Established bidirectional traceability

**Validation:**

- [ ] **Epic Update**: Parent epic updated with story reference in "User Stories" section
- [ ] **Link Format**: Story link uses proper format with correct path and description
- [ ] **Organization Maintenance**: Alphabetical or logical ordering maintained within epic
- [ ] **Acceptance Criteria**: Epic acceptance criteria updated appropriately if affected
- [ ] **Scope Alignment**: Story confirmed to align with epic's overall scope and objectives
- [ ] **Bidirectional Links**: Proper bidirectional linking established between epic and story

### 8. Context File Updates

**Purpose:**
Create or update relevant context files to incorporate user interaction patterns and insights from the new story, maintaining comprehensive user experience documentation.

**Input:**

- Complete story specification from Step 4
- Existing context files in relevant categories
- User interaction patterns and behavioral insights from story
- Context Format Specification for story-derived updates

**Actions:**

1. **Review Story Domain**: Determine which context categories relate to the story's domain and user patterns
2. **Extract User Patterns**: Identify user interaction and behavioral patterns from the story
3. **Assess Context Impact**: Determine whether to update existing files or create new ones
4. **Update Existing Files**: Modify relevant context files to include story-derived insights
5. **Create New Context**: Add new context files for novel user patterns introduced by the story
6. **Maintain Cross-References**: Link new context information to related concepts in other categories
7. **Document Story Source**: Clearly attribute context updates to the source story
8. **Validate Integration**: Ensure context updates integrate properly with existing information

**Output:**

- Updated existing context files with story-derived insights
- New context files for novel user patterns introduced
- Enhanced user interaction and behavioral pattern documentation
- Proper cross-references between context files
- Clear attribution to source story in all updates
- Integrated context information supporting user experience consistency

**Validation:**

- [ ] **Domain Assessment**: Story domain and relevant context categories properly identified
- [ ] **Pattern Extraction**: User interaction and behavioral patterns accurately extracted from story
- [ ] **Context Strategy**: Appropriate decisions made for updating existing vs. creating new context files
- [ ] **File Updates**: Existing context files meaningfully enhanced with story insights
- [ ] **New File Creation**: New context files created for novel patterns with proper formatting
- [ ] **Cross-Reference Integration**: Context files properly linked to related concepts
- [ ] **Story Attribution**: Source story clearly documented in all context updates

### 9. Cross-Reference Validation

**Purpose:**
Validate all dependencies, epic integration, and cross-story consistency to ensure the story integrates properly with existing documentation and maintains system coherence.

**Input:**

- Complete story file with dependencies from Step 4
- All referenced stories and epics
- Parent epic integration from Step 7
- Cross-story consistency requirements

**Actions:**

1. **Verify Referenced Stories**: Ensure all dependency stories exist in `product/stories/` directory
2. **Check Logical Relationships**: Validate dependency relationships are logical and implementable
3. **Identify Circular Dependencies**: Check for and resolve circular dependencies between stories
4. **Validate Sequencing**: Ensure dependency chains support proper development sequencing
5. **Confirm Epic Integration**: Verify parent epic exists and is properly referenced
6. **Validate Scope Fit**: Check that story scope fits within epic's boundaries
7. **Align Acceptance Criteria**: Ensure story acceptance criteria align with epic objectives
8. **Check Priority Consistency**: Verify story priority is consistent with epic priority
9. **Align Terminology**: Check terminology consistency across related stories
10. **Verify Technical Approach**: Confirm technical approaches align with similar stories
11. **Validate Integration Points**: Ensure integration points are compatible with other stories

**Output:**

- Validated story dependencies with confirmed existence and logic
- Resolved circular dependencies and proper sequencing
- Confirmed epic integration and scope alignment
- Aligned acceptance criteria with epic objectives
- Consistent terminology and technical approaches
- Compatible integration points across related stories

**Validation:**

- [ ] **Dependency Verification**: All referenced stories exist and dependency logic is sound
- [ ] **Circular Dependency Check**: No circular dependencies identified or all resolved
- [ ] **Sequencing Validation**: Dependency chains support proper development sequencing
- [ ] **Epic Integration**: Parent epic exists and is properly referenced with scope alignment
- [ ] **Priority Consistency**: Story priority is consistent with parent epic priority
- [ ] **Terminology Alignment**: Consistent terminology used across related stories
- [ ] **Technical Consistency**: Technical approaches align with similar stories
- [ ] **Integration Compatibility**: Integration points compatible with other stories

## Quality Assurance

**MANDATORY FORMAT VALIDATION:**

- [ ] **Story Format Compliance**: File MUST follow exact structure from [Story Format Specification](../formats/story-format.md)
- [ ] **Section Order**: Headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Story Statement Format**: Uses exact "As a [Role] I want [Goal] So that [Benefit]" format with bold keywords
- [ ] **Status Indicators**: Story status uses correct emoji format (✅ 📝 ⏳)
- [ ] **Acceptance Criteria Format**: Uses proper Given-When-Then format with bold keywords
- [ ] **Dependencies Section**: Not empty (use "None" if no dependencies)
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets

**CRITICAL**: If ANY format validation check fails, the story MUST be corrected before proceeding.

**INVEST Principle Validation:**

- [ ] **Independent**: Story can be developed without depending on other stories
- [ ] **Negotiable**: Details can be discussed and refined during development
- [ ] **Valuable**: Story delivers clear value to the user or business
- [ ] **Estimable**: Development team can estimate effort required
- [ ] **Small**: Story can be completed within estimated timeframe
- [ ] **Testable**: Story has clear acceptance criteria that can be verified

**Content Review:**

- [ ] **Section Quality**: All required sections present and substantive
- [ ] **Story Statement**: Story statement follows Role-Goal-Benefit format correctly
- [ ] **Acceptance Criteria**: Criteria are specific, testable, and measurable
- [ ] **User Experience Flow**: Flow is complete, realistic, and well-documented
- [ ] **Technical Context**: Proper integration points and system components identified
- [ ] **Definition of Done**: Criteria are objective, achievable, and comprehensive
- [ ] **Content Clarity**: All content is clear, accurate, and complete

**Integration Review:**

- [ ] **Story Tracking**: Story tracking in `stories.md` updated correctly
- [ ] **Epic Integration**: Parent epic updated with story link and proper integration
- [ ] **Context Updates**: Context files updated with story information appropriately
- [ ] **Cross-Reference Validation**: All cross-references validated and functional
- [ ] **Terminology Consistency**: Terminology consistent with other stories and documentation
- [ ] **Technical Alignment**: Technical requirements align with existing stories
- [ ] **Dependency Logic**: No circular dependencies identified and logic is sound
- [ ] **Integration Compatibility**: Story integrates properly with related stories and epics

## Success Criteria

**Story Completeness:**

- Story file created with all required sections populated following exact format specification
- Content is comprehensive and provides clear development guidance for the user story
- Acceptance criteria are specific, testable, and achievable with Given-When-Then format
- User value is clearly articulated and measurable through Role-Goal-Benefit structure
- Story meets all INVEST principle requirements for effective development

**System Integration:**

- Story tracking system updated with new entry and proper epic categorization
- Parent epic updated with story reference and bidirectional traceability established
- Context files enhanced with story information and user interaction patterns
- All cross-references established, validated, and functional across documentation
- Dependencies properly mapped, validated, and free of circular references

**Quality Standards:**

- Format specification compliance verified through mandatory validation
- Content quality meets project standards for clarity, completeness, and accuracy
- INVEST principles validated and confirmed for development effectiveness
- Technical accuracy ensured through context integration and system alignment
- Consistency maintained across all documentation and terminology standards

## Related Workflows

- [Update Epic Workflow](update-epic.md) - For updating parent epic with story reference
- [Create Context Workflow](create-context.md) - For creating context files referenced in stories
- [Update Context Workflow](update-context.md) - For updating context files with story information
- [Cross-Reference Validation Workflow](cross-reference-validation.md) - For validating story dependencies and references
- [Document Processing Workflow](document-processing.md) - For general story document validation

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference the Format**: Always include this exact statement in prompts:

   ```markdown
   **Story Format**: Follow the canonical story format defined in [Story Format Specification](../formats/story-format.md)
   ```

2. **Validate Before Completion**: Run through the complete validation checklist before considering the story file complete

3. **Use Correct Templates**: Apply the appropriate story template based on role and epic type

4. **Enforce Section Order**: Maintain exact section order as specified in the format specification

5. **Include ALL Required Sections**: Never omit required sections - all must be present and properly filled

6. **Validate INVEST Principles**: Ensure every story meets Independent, Negotiable, Valuable, Estimable, Small, and Testable criteria

**FAILURE TO COMPLY**: Story files that do not follow the format specification are invalid and will require correction.

## Notes

Additional context, special considerations, or implementation details for this workflow:

- New stories always start with "⏳ Not Started" status for consistent tracking
- File names must use kebab-case convention matching story title for system compatibility
- Dependencies must reference actual story files that exist in the system
- Epic name validation is mandatory and blocks all processing until valid epic provided
- Stories should provide clear user value and motivation through Role-Goal-Benefit format
- Acceptance criteria must be specific, testable, and measurable using Given-When-Then format
- User experience flows should be complete, realistic, and properly documented
- Context files should be used to enhance story authenticity and accuracy
- Context files should be updated with story-derived user interaction patterns
- INVEST principles are mandatory and must be validated for every story
- Cross-reference validation is critical for maintaining system integrity
- Format compliance is mandatory and takes priority over all other considerations
