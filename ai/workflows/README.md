# AI Development Workflows

This directory contains standardized workflows for the AI-assisted development system. These workflows ensure consistent handling of documentation, content generation, and system maintenance.

## Available Workflows

### Core Workflows

#### [Create Context Workflow](create-context.md)

**Purpose**: Create new context files with proper formatting and tracking integration  
**Use When**: Adding new topic areas or requirements to the context system  
**Outputs**: New context file, updated tracking, cross-references

#### [Create Epic Workflow](create-epic.md)

**Purpose**: Create new epic files with proper formatting, context integration, and tracking  
**Use When**: Adding new epic specifications to the development system  
**Outputs**: New epic file, updated tracking, context updates, cross-references

#### [Update Context Workflow](update-context.md)

**Purpose**: Modify existing context files while maintaining integrity and tracking  
**Use When**: Context files need updates, corrections, or enhancements  
**Outputs**: Updated context file, tracking updates, dependency notifications

#### [Update Epic Workflow](update-epic.md)

**Purpose**: Update existing epic files while maintaining cross-epic consistency and integration  
**Use When**: Epic files need modifications, feedback incorporation, or consistency updates  
**Outputs**: Updated epic file, related epic updates, context file updates, validation report

#### [Split Epic Workflow](split-epic.md)

**Purpose**: Split existing epic files into two separate epics while maintaining system consistency  
**Use When**: Epic scope is too large or contains distinct functional areas that should be separated  
**Outputs**: Modified original epic, new epic file, updated tracking, context updates, validation report

#### [Process Context Workflow](process-context.md)

**Purpose**: Convert context files into actionable epics and user stories  
**Use When**: Context files are ready to be transformed into development items  
**Outputs**: Generated epics, user stories, updated tracking, cross-references

#### [Create Story Workflow](create-story.md)

**Purpose**: Create new user story files with proper formatting, epic integration, and tracking  
**Use When**: Adding new user story specifications to the development system  
**Outputs**: New story file, updated tracking, parent epic updates, context file updates

#### [Create Task Workflow](create-task.md)

**Purpose**: Create new task files with proper formatting, focus area categorization, dependency analysis, and tracking integration  
**Use When**: Adding new workflow coordination tasks to the development system  
**Outputs**: New task file, updated task index, dependency mapping, session continuity support

#### [Update Task Workflow](update-task.md)

**Purpose**: Update existing task files while maintaining format compliance, system consistency, and cross-reference integrity  
**Use When**: Modifying task scope, status, priorities, dependencies, or focus area placement  
**Outputs**: Updated task file, synchronized task index, maintained dependency relationships, preserved session continuity

#### [Complete Task Workflow](complete-task.md)

**Purpose**: Properly complete and close out task files with deliverable validation, dependency resolution, and system tracking updates  
**Use When**: Finishing tasks and ensuring proper closure with downstream task unblocking  
**Outputs**: Completed task file, unblocked downstream tasks, updated metrics, validated system integrity

#### [Process Context Status Workflow](process-context-status.md)

**Purpose**: Monitor and process context files based on their status in contexts.md tracking  
**Use When**: Regular maintenance to process pending, updated, or new context files  
**Outputs**: Updated epics, new epics (if needed), updated context tracking, processing report

### Support Workflows

#### [Cross-Reference Validation Workflow](cross-reference-validation.md)

**Purpose**: Validate and maintain link integrity across all documentation  
**Use When**: Regular maintenance or after significant document changes  
**Outputs**: Validation report, fixed links, updated references

#### [Document Processing Workflow](document-processing.md)

**Purpose**: Unified processing approach for any document type in the system
**Use When**: Processing any AI development system document
**Outputs**: Validated document, related updates, quality report

#### [Commit and Push Workflow](commit-and-push.md)

**Purpose**: Safely commit and push changes with conflict resolution and hook error handling
**Use When**: Committing changes that may have merge conflicts or require pre-commit/pre-push hook fixes
**Outputs**: Synchronized branch, successful commits, pushed changes to remote

## Workflow Categories

### Content Creation

- **Create Context**: New context file creation with proper structure
- **Create Epic**: New epic specification creation with tracking integration
- **Create Story**: New user story specification creation with epic integration
- **Create Task**: New task file creation with focus area categorization and dependency analysis
- **Document Processing**: General document handling and validation

### Content Maintenance

- **Update Context**: Existing context file modification and tracking
- **Update Epic**: Existing epic file modification with cross-epic consistency
- **Update Task**: Existing task file modification with system consistency and dependency management
- **Complete Task**: Task completion with deliverable validation, dependency resolution, and closure
- **Split Epic**: Epic separation into multiple focused units
- **Cross-Reference Validation**: Link integrity and relationship maintenance

### Git Operations

- **Commit and Push**: Safe commit and push with conflict resolution and hook error handling

### Content Transformation

- **Process Context**: Context to epic/story conversion
- **Process Context Status**: Context status monitoring and processing
- **Document Processing**: Format validation and integration

## Workflow Selection Guide

### By Document Type

| Document Type             | Primary Workflow       | Secondary Workflows                         |
| ------------------------- | ---------------------- | ------------------------------------------- |
| New Context               | Create Context         | Document Processing                         |
| New Epic                  | Create Epic            | Document Processing, Create Context         |
| New Story                 | Create Story           | Document Processing, Update Epic            |
| New Task                  | Create Task            | Document Processing                         |
| Existing Task             | Update Task            | Cross-Reference Validation, Update Epic     |
| Completing Task           | Complete Task          | Cross-Reference Validation, Update Epic     |
| Existing Context          | Update Context         | Process Context, Cross-Reference Validation |
| Context Status Processing | Process Context Status | Process Context, Update Epic                |
| Existing Epic             | Update Epic            | Cross-Reference Validation, Update Context  |
| Epic Split                | Split Epic             | Update Epic, Create Epic                    |
| Epic/Story                | Document Processing    | Cross-Reference Validation                  |
| Any Document              | Document Processing    | Cross-Reference Validation                  |

### By Activity Type

| Activity                    | Recommended Workflow       | Alternative Options          |
| --------------------------- | -------------------------- | ---------------------------- |
| Creating new context        | Create Context             | Document Processing          |
| Creating new epic           | Create Epic                | Document Processing          |
| Creating new story          | Create Story               | Document Processing          |
| Creating new task           | Create Task                | Document Processing          |
| Modifying existing task     | Update Task                | Document Processing          |
| Completing existing task    | Complete Task              | Document Processing          |
| Modifying existing context  | Update Context             | Document Processing          |
| Modifying existing epic     | Update Epic                | Document Processing          |
| Splitting existing epic     | Split Epic                 | Update Epic, Create Epic     |
| Converting context to epics | Process Context            | Document Processing          |
| Processing context status   | Process Context Status     | Process Context, Update Epic |
| Validating system integrity | Cross-Reference Validation | Document Processing          |
| General document handling   | Document Processing        | Specific type workflows      |
| Committing and pushing code | Commit and Push            | Pre-Deployment Quality Check |

## Workflow Integration

### Automated Triggers

- **File System Events**: New/modified files trigger appropriate workflows
- **Git Hooks**: Commit/merge events validate references and format
- **CI/CD Integration**: Build pipeline includes workflow validation

### Manual Execution

- **Development Workflow**: Developers run workflows as part of content creation
- **Maintenance Tasks**: Regular workflow execution for system health
- **Quality Assurance**: Workflow validation before major releases

## Quality Standards

All workflows maintain these quality standards:

- **Format Compliance**: Output follows established format specifications
- **Date Accuracy**: All date fields use CLI date retrieval (`date +%Y-%m-%d`) for accurate timestamps
- **Cross-Reference Integrity**: All links and references are valid and bidirectional
- **Content Quality**: Output is complete, accurate, and valuable
- **Integration Consistency**: Proper integration with tracking and navigation systems
- **Traceability**: Clear audit trail of all changes and relationships

## Best Practices

### Workflow Execution

1. **Read Workflow Documentation**: Understand requirements and outputs before starting
2. **Check Prerequisites**: Ensure all required inputs and dependencies are available
3. **Use Accurate Dates**: CRITICAL - Always use `$(date +%Y-%m-%d)` for date fields, never hardcode dates
4. **Follow Steps Sequentially**: Complete each workflow step before proceeding
5. **Validate Outputs**: Verify all deliverables meet quality standards
6. **Update Tracking**: Ensure all tracking systems reflect current status

### Error Handling

1. **Early Detection**: Validate inputs before processing
2. **Graceful Degradation**: Handle errors without corrupting existing content
3. **Clear Reporting**: Provide specific error messages and resolution guidance
4. **Recovery Procedures**: Include steps for correcting errors and resuming work

### Integration Patterns

1. **Consistent Interfaces**: All workflows follow similar input/output patterns
2. **Composable Design**: Workflows can be combined for complex operations
3. **Automation Ready**: Workflows support both manual and automated execution
4. **Extensible Framework**: New workflows can be added following established patterns

## Related Documentation

- [Format Specifications](../formats/README.md) - Document format requirements
- [AI Prompts](../prompts/README.md) - AI instruction sets for content generation
- [Context Tracking](../contexts.md) - Status tracking for all context files
- [Project Documentation](../../product/README.md) - Epic and story tracking systems

## Usage Examples

### Basic Context Creation

```bash
# Create new context about advanced AI systems
Workflow: create-context.md
Input: Topic="Advanced AI Decision Making", Category="systems"
Output: ai/context/systems/advanced-ai-decision-making.md
```

### Basic Story Creation

```bash
# Create new user story for AI sensor management
Workflow: create-story.md
Input: Epic="ai-core-systems.md", Role="AI Entity", Goal="Monitor sensor data", Benefit="Maintain environmental awareness"
Output: product/stories/ai-sensor-monitoring.md
```

### Context Processing Pipeline

```bash
# Full pipeline from context creation to epic generation
1. create-context.md → New context file
2. process-context.md → Generated epics and stories
3. cross-reference-validation.md → Validated all links
```

### Maintenance Workflow

```bash
# Regular system maintenance
1. cross-reference-validation.md → Check link integrity
2. document-processing.md → Validate format compliance
3. Update tracking files with current status
```

## Automation Integration

### Git Hooks

```bash
# Pre-commit hook example
#!/bin/bash
./ai/workflows/cross-reference-validation.md
./ai/workflows/document-processing.md --validate-only
```

### CI/CD Pipeline

```yaml
# GitHub Actions example
- name: Validate AI Development System
  run: |
    ./ai/workflows/cross-reference-validation.md --ci-mode
    ./ai/workflows/document-processing.md --batch-validate
```

### File System Monitoring

```bash
# Automated processing trigger
inotifywait -m ai/context/ -e create,modify |
while read path event file; do
    ./ai/workflows/document-processing.md "$path$file"
done
```

---

These workflows provide a comprehensive framework for maintaining the AI development system while ensuring quality, consistency, and proper integration across all documentation and tracking systems.
