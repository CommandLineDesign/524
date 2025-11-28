# Planetform AI Development System

## Overview

This directory contains a comprehensive collection of AI workflows and prompts designed to facilitate and streamline the Planetform development process. These tools provide structured guidance for managing the entire product development lifecycle, from high-level vision and roadmap planning down to detailed component specifications.

## Purpose

The AI development system serves as specialized tools for:

- **Knowledge Management**: Processing raw input documents into structured contextual information with status-driven processing
- **Consistency Management**: Ensuring terminology, technical approaches, and design decisions remain coherent across all documentation
- **Systematic Updates**: Providing structured approaches for incorporating feedback and evolving requirements
- **Cross-Reference Maintenance**: Automatically maintaining links and dependencies between related documents
- **Quality Assurance**: Enforcing documentation standards and completeness criteria through format specifications
- **Development Planning**: Converting high-level concepts into actionable development specifications
- **Process Abstraction**: Workflows provide reusable process patterns that prompts can leverage for complex operations
- **Task Coordination**: Managing prioritized workflow tasks to enable session continuity and progress tracking

## Workflow Integration

The prompts leverage reusable workflows to provide a complete product management system:

```
Raw Documents → Knowledge Base → Vision/Roadmap → Epics → Components → User Stories → Implementation
      ↓              ↓               ↓             ↓         ↓            ↓              ↓
   Document     Contextual       Planning      Development  Detailed     Granular     Code
   Processing   Information      Documents      Specs       Specs        Tasks    Implementation
      ↓              ↓               ↓             ↓         ↓            ↓              ↓
    Prompts      Context         Vision/        Epic      Component    Story        Development
  (User Tools)   Management      Roadmap       Management  Management   Management      Work
               (Status-driven)   Updates      (Using       (Updates)   (Using              ↑
                                              Workflows)              Workflows)            ↓
                                                 ↓                                    Task Coordination
                                              Progress Tracking ←――――――――――――――――→    (Session Continuity)
```

The system supports:

- **Status-Driven Processing**: Context files are tracked in contexts.md and processed based on status (🟢🟡🔴⚪)
- **Process Abstraction**: Workflows provide reusable patterns that prompts can leverage for complex operations
- **Cross-Reference Validation**: Automatic maintenance of links and dependencies across all documentation
- **Format Standardization**: Consistent structure enforced through canonical format specifications
- **Task Coordination**: Prioritized workflow tracking for session continuity and progress management

## Available Workflows

**Note**: Workflows are internal process abstractions used by prompts. They are not intended for direct user interaction but provide reusable patterns that prompts leverage for complex operations.

### 🔄 Core Workflows (Used by Prompts)

- **[Create Epic Workflow](./workflows/create-epic.md)**: Process pattern for creating comprehensive epic specifications while maintaining consistency across all project documentation
- **[Update Epic Workflow](./workflows/update-epic.md)**: Process pattern for updating existing epic files while maintaining cross-epic consistency and integration
- **[Split Epic Workflow](./workflows/split-epic.md)**: Process pattern for splitting existing epic files into two separate epics while maintaining system consistency
- **[Create Context Workflow](./workflows/create-context.md)**: Process pattern for creating new context files with proper formatting and tracking integration
- **[Update Context Workflow](./workflows/update-context.md)**: Process pattern for modifying existing context files while maintaining integrity and tracking
- **[Process Context Workflow](./workflows/process-context.md)**: Process pattern for converting context files into actionable epics and user stories
- **[Process Context Status Workflow](./workflows/process-context-status.md)**: Process pattern for monitoring and processing context files based on their status in contexts.md tracking

### 🔧 Support Workflows (Used by Prompts)

- **[Cross-Reference Validation Workflow](./workflows/cross-reference-validation.md)**: Process pattern for validating and maintaining link integrity across all documentation
- **[Document Processing Workflow](./workflows/document-processing.md)**: Process pattern for unified processing approach for any document type in the system

## Available Prompts

**Note**: Prompts are the user-facing tools in this system. They leverage internal workflows to provide structured guidance for complex operations.

### 🎯 Strategic Planning

- **[Vision and Roadmap Update](./prompts/vision-roadmap-update.md)**: Update foundational vision and roadmap documents while maintaining strategic alignment and consistency

### 📋 Epic Management

- **[Epic Create](./prompts/epic-create.md)**: Create new comprehensive epic specifications (uses Create Epic Workflow)
- **[Roadmap to Epics Conversion](./prompts/roadmap-to-epics-conversion.md)**: Convert roadmap items into detailed, implementable epic specifications
- **[Epic Update](./prompts/epic-update.md)**: Update individual epic files while maintaining consistency across related epics and dependencies (uses Update Epic Workflow)
- **[Epic Split](./prompts/epic-split.md)**: Split an existing epic into two separate epics while maintaining consistency across all project documentation (uses Split Epic Workflow)

### 🔧 Component Management

- **[Epics to Components Conversion](./prompts/epics-to-components-conversion.md)**: Extract and expand component specifications from epic "Key Components" sections
- **[Component Update](./prompts/component-update.md)**: Update individual component files while maintaining consistency across related components and epics

### 📝 User Story Management

- **[Story Create](./prompts/story-create.md)**: Create new user story specifications following INVEST principles and canonical format
- **[Story Update](./prompts/story-update.md)**: Update existing user story specifications while maintaining consistency across all project documentation
- **[Story Split](./prompts/story-split.md)**: Split an existing user story into two separate stories while maintaining consistency across all project documentation
- **[Epics to User Stories Conversion](./prompts/epics-to-user-stories-conversion.md)**: Extract and expand detailed user stories from epic "User Stories" sections following INVEST principles

### 📚 Knowledge Management

- **[Context Processing](./prompts/context-processing.md)**: Process context files to identify epic impacts and integrate insights (uses Process Context Status Workflow)
- **[Document Processing](./prompts/document-processing.md)**: Process raw input documents into categorized contextual information for enhanced epic and story creation (uses Document Processing Workflow)

## Format Specifications

### 📐 Content Standards

- **[Format Specification Format](./formats/format-specification-format.md)**: Meta-format defining the structure and content requirements for format specification files themselves
- **[Epic Format Specification](./formats/epic-format.md)**: Canonical format for all epic files used by all epic-related prompts and workflows
- **[Component Format Specification](./formats/component-format.md)**: Canonical format for all component files used by all component-related prompts
- **[Story Format Specification](./formats/story-format.md)**: Canonical format for all user story files used by all story-related prompts
- **[Context Format Specification](./formats/context-format.md)**: Canonical format for all context files in the ai/context/ directory
- **[Task Format Specification](./formats/task-format.md)**: Canonical format for all task files for workflow coordination and session continuity
- **[Workflow Format Specification](./formats/workflow-format.md)**: Canonical format for all workflow files in the ai/workflows/ directory

These specifications ensure consistency across all documentation and are referenced by multiple prompts and workflows to maintain format alignment.

### 📁 Folder Structure

The AI system uses the following folder structure for knowledge management:

- **ai/input/**: Raw documents to be processed
- **ai/context/**: Categorized contextual information (10 categories)
- **ai/tasks/**: Individual task files for workflow coordination
- **ai/tasks.md**: Priority index and task tracking for session continuity
- **ai/archive/**: Processed documents with timestamps
- **ai/archives.md**: Processing log and statistics
- **ai/contexts.md**: Context file status tracking for processing workflows

## How to Use These Tools

### 1. Choose the Right Prompt

Select the prompt that matches your needs:

- **Strategic changes**: Use Vision/Roadmap Update prompt
- **Epic-level planning**: Use Epic Create, Epic Update, or Epic Split prompts, or Roadmap to Epics Conversion prompt
- **Component-level detail**: Use Component Conversion or Component Update prompts
- **User story creation**: Use Story Create prompt for individual stories
- **User story updates**: Use Story Update prompt for existing stories
- **User story splitting**: Use Story Split prompt for managing story scope
- **User story breakdown**: Use Epics to User Stories Conversion prompt
- **Context processing**: Use Context Processing prompt for status-driven processing
- **Knowledge extraction**: Use Document Processing prompt for raw input documents
- **Task creation**: Use Create Task workflow for new workflow coordination tasks
- **Task updates**: Use Update Task workflow for modifying existing tasks
- **Task completion**: Use Complete Task workflow for properly closing out finished tasks
- **Task coordination**: Use tasks.md for prioritized workflow tracking and session continuity

### 2. Provide Context

When using a prompt, include:

- **Specific changes needed**: What exactly needs to be updated and why
- **Feedback or insights**: New information that should be incorporated
- **Scope of impact**: Whether changes should be isolated or system-wide
- **Priority level**: How urgent the changes are for development
- **Source material**: For document processing, ensure raw materials are in ai/input/ folder

### 3. Review and Validate

After running a prompt:

- **Check cross-references**: Ensure all links and dependencies are functional
- **Validate consistency**: Verify terminology and technical approaches align
- **Review impact**: Assess how changes affect related documents
- **Test implementability**: Ensure specifications are actionable for developers
- **Update tracking**: Verify that contexts.md and other tracking files are properly updated

## Tool Categories

### Prompt Level (User Tools)

**Purpose**: Provide specific instructions for content generation and modification tasks
**Usage**: When you need assistance for particular content creation or modification needs
**Output**: Targeted content updates with format compliance and integration

The prompts include:

- **Epic Create**: Creates new comprehensive epic specifications (leverages Create Epic Workflow)
- **Epic Update**: Updates individual epic files while maintaining consistency across related epics and dependencies (leverages Update Epic Workflow)
- **Epic Split**: Splits existing epics into two separate epics while maintaining consistency across all project documentation (leverages Split Epic Workflow)
- **Story Create**: Creates new user story specifications following INVEST principles and canonical format
- **Story Update**: Updates existing user story specifications while maintaining consistency across all project documentation
- **Story Split**: Splits existing user stories into two separate stories while maintaining consistency
- **Component Update**: Updates individual component files while maintaining consistency across related components and epics
- **Context Processing**: Processes context files to identify epic impacts and integrate insights (leverages Process Context Status Workflow)
- **Document Processing**: Processes raw input documents into categorized contextual information for enhanced understanding (leverages Document Processing Workflow)
- **Vision/Roadmap Update**: Updates foundational vision and roadmap documents while maintaining strategic alignment
- **Roadmap to Epics Conversion**: Converts roadmap items into detailed, implementable epic specifications
- **Epics to Components Conversion**: Extracts and expands component specifications from epic "Key Components" sections
- **Epics to User Stories Conversion**: Extracts and expands detailed user stories from epic "User Stories" sections

### Workflow Level (Internal Process Abstractions)

**Purpose**: Provide systematic, step-by-step process patterns for complex operations
**Usage**: Used internally by prompts to ensure consistent, quality operations with validation and cross-reference maintenance
**Output**: Reusable process patterns that prompts can leverage for comprehensive operations

**Note**: Workflows are not intended for direct user interaction. They serve as internal abstractions that prompts use to provide consistent, high-quality results.

## Best Practices

### Before Using Prompts

1. **Identify the scope**: Determine which documents need updating
2. **Gather context**: Collect all relevant feedback, insights, or requirements
3. **Set expectations**: Define what success looks like for the update
4. **Check dependencies**: Understand how changes might affect related documents

### During Prompt Execution

1. **Provide complete context**: Include all relevant information in your request
2. **Be specific**: Clearly articulate what changes are needed and why
3. **Indicate relationships**: Point out any known dependencies or integration points
4. **Request validation**: Ask for consistency checks and cross-reference updates

### After Prompt Completion

1. **Review all outputs**: Check every file that was created or modified
2. **Validate links**: Ensure all cross-references and dependencies are functional
3. **Test clarity**: Verify that updated specifications are clear and actionable
4. **Coordinate updates**: Share changes with relevant team members

## Quality Standards

### Consistency Requirements

- **Terminology**: Consistent use of terms across all related documents
- **Technical Standards**: Aligned Unity ECS architecture approaches
- **Integration Patterns**: Consistent interface and data exchange patterns
- **Documentation Format**: Standardized structure and formatting

### Completeness Criteria

- **Cross-References**: All links and dependencies are functional and up-to-date
- **Technical Specifications**: Complete technical requirements for implementation
- **Acceptance Criteria**: Clear, testable requirements for all features
- **Integration Points**: Well-defined interfaces between components and systems

### Validation Approach

- **Consistency Checks**: Automated verification of terminology and pattern usage
- **Dependency Validation**: Confirmation that all dependency chains are logical
- **Implementation Readiness**: Verification that specifications are actionable
- **Quality Assurance**: Comprehensive review of all updated content

## Common Use Cases

### 1. Incorporating Feedback

**Scenario**: Player feedback or stakeholder input requires design changes
**Approach**: Use Vision/Roadmap Update to incorporate high-level changes, then cascade to epics and components
**Result**: Consistent updates across all documentation levels

### 2. Technical Discovery

**Scenario**: Development reveals new technical requirements or constraints
**Approach**: Use Component Update to refine technical specifications, then update related epics
**Result**: Aligned technical specifications ready for implementation

### 3. Scope Adjustment

**Scenario**: Timeline or budget changes require feature prioritization
**Approach**: Use Epic Update to adjust scope and priorities, then update affected components
**Result**: Realistic development plan with clear priorities

### 4. New Feature Addition

**Scenario**: New gameplay mechanics or systems need to be documented
**Approach**: Use Epic Create prompt to generate new epic specifications from concept descriptions, then Component Conversion for detailed specs, followed by User Stories Conversion for implementation tasks
**Result**: Complete documentation hierarchy from epic to user story ready for development

Alternative: Use Roadmap to Epics Conversion if the feature is already defined in the roadmap, then proceed with Component and User Stories conversion

### 5. Standalone Epic Development

**Scenario**: A specific game system or feature needs comprehensive documentation
**Approach**: Use Epic Create prompt to produce the complete epic specification along with all necessary project integration updates
**Result**: Fully integrated epic specification with updated tracking, validated dependencies, and consistent project documentation

### 6. Epic Scope Management

**Scenario**: An existing epic has grown too large or contains multiple distinct functional areas that can be developed independently
**Approach**: Use Epic Split to divide the epic into two focused epics, updating dependencies and cross-references
**Result**: Two manageable epics with clear boundaries, improved development planning, and maintained consistency across all project documentation

### 7. Individual Story Creation

**Scenario**: Development team needs specific user stories for sprint planning or backlog management
**Approach**: Use Story Create to generate detailed user story specifications from identified needs, ensuring proper epic integration
**Result**: Well-defined user stories following INVEST principles with comprehensive acceptance criteria and proper epic integration

### 8. Story Maintenance and Updates

**Scenario**: Existing user stories need updates due to requirement changes, status progression, or format standardization
**Approach**: Use Story Update to modify existing stories while maintaining format compliance and cross-reference consistency
**Result**: Updated user stories that maintain quality standards and integration with all project documentation

### 9. Story Scope Management

**Scenario**: An existing user story has grown too large or contains multiple distinct user goals that can be developed independently
**Approach**: Use Story Split to divide the story into two focused stories, updating dependencies and parent epic integration
**Result**: Two manageable stories with clear user goals, improved development planning, and maintained consistency across all project documentation

### 10. Knowledge Base Development

**Scenario**: Raw design documents, research notes, or concept materials need to be processed into structured contextual information
**Approach**: Use Document Processing to extract and categorize concepts into the ai/context/ knowledge base
**Result**: Comprehensive contextual information that enhances understanding of game concepts and improves epic and story creation quality

### 11. Context Status Management

**Scenario**: Context files need systematic processing based on their current status (new, pending, updated)
**Approach**: Use Context Processing prompt to systematically process context files based on their status in contexts.md
**Result**: Updated epics with integrated context insights, new epics created if needed, and properly maintained context tracking system

### 12. Context File Creation and Maintenance

**Scenario**: New context areas need to be documented or existing context files need updates
**Approach**: Context files are managed internally through prompts that leverage Create Context and Update Context workflows for proper tracking integration
**Result**: Well-structured context files with proper categorization, cross-references, and status tracking integration

## Integration with Development Process

### Planning Phase

- Use Document Processing prompt to build contextual knowledge base from raw input materials
- Use Context Processing prompt to systematically process context files
- Use Vision/Roadmap Update prompt to establish strategic direction
- Use Epic Create prompt to document new game systems and features from concept descriptions
- Use Roadmap to Epics Conversion prompt to create development specifications from existing roadmap items
- Use Epic Split prompt to manage epic scope and improve development planning
- Use Component Conversion prompt to generate detailed implementation guidance
- Use Story Create prompt to generate specific user stories for development planning
- Use Story Update prompt to refine existing stories for accurate sprint planning
- Use Story Split prompt to manage story scope and improve development planning
- Use User Stories Conversion prompt to create development backlog items

### Development Phase

- Use Document Processing prompt to incorporate new design documents and research findings
- Use Context Processing prompt to integrate new context insights into existing epics
- Context files are managed internally through prompts to maintain contextual knowledge base
- Use Epic Update prompt to refine requirements based on implementation discoveries
- Use Component Update prompt to adjust technical specifications
- Use Story Create prompt to generate additional user stories as needs are discovered
- Use Story Update prompt to modify existing stories based on development feedback
- Use Story Split prompt to manage story scope during development
- Use User Stories as the primary development backlog for sprint planning
- Use cross-referencing to maintain consistency during iterative development

### Review Phase

- Use prompts to incorporate feedback and testing insights
- Use Story Update prompt to apply testing results and user feedback to existing stories
- Use Context Processing prompt to integrate lessons learned into the knowledge base
- Use validation features to ensure documentation quality
- Use consistency checks to maintain system integrity

## Troubleshooting

### Common Issues

- **Broken Links**: Use cross-reference validation features in prompts
- **Inconsistent Terminology**: Run consistency checks across related documents
- **Circular Dependencies**: Use dependency validation to identify and resolve conflicts
- **Outdated Specifications**: Use systematic update approaches through prompts to maintain current documentation

### Resolution Strategies

- **Incremental Updates**: Make small, focused changes rather than large overhauls using targeted prompts
- **Validation Steps**: Always validate changes before considering them complete
- **Cross-Document Coordination**: Ensure changes are propagated to all affected documents through prompt workflows
- **Quality Assurance**: Use built-in quality checks in each prompt

## Support and Maintenance

### Regular Maintenance

- **Weekly Reviews**: Check for broken links or outdated references
- **Monthly Audits**: Validate consistency across all documentation
- **Quarterly Updates**: Refresh prompts based on usage patterns and feedback
- **Annual Overhaul**: Comprehensive review and update of the entire system

### Continuous Improvement

- **Usage Analytics**: Track which prompts are most/least effective
- **Feedback Integration**: Incorporate user feedback into prompt improvements
- **Pattern Recognition**: Identify common update patterns and optimize prompts accordingly
- **Quality Metrics**: Measure documentation quality and consistency over time

This comprehensive AI development system ensures that Planetform's development documentation remains consistent, current, and actionable throughout the entire development lifecycle. The prompts provide user-facing tools that leverage internal workflow abstractions to deliver both systematic process management and focused content assistance, while the status-driven context processing and format specifications maintain quality and consistency across all documentation.
