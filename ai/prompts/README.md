# AI Development Prompts

This directory contains specialized prompts for AI-assisted development of the Planetform project. Each prompt provides specific instructions for content generation, modification, and maintenance tasks.

## Vision Context Loading

**CRITICAL REQUIREMENT**: All prompts in this directory include a mandatory "Vision Context Loading" section that requires loading the project vision ([`product/vision.md`](../../product/vision.md)) into context as one of the first steps. This ensures that all AI operations are taken with the project vision in mind and maintain alignment with the overall game concept, mechanics, and technical architecture.

## Available Prompts

### Content Creation

#### [Epic Create Prompt](epic-create.md)

**Purpose**: Create new comprehensive epic specifications  
**Use When**: Adding new epic specifications to the development system  
**Workflow**: Uses [Create Epic Workflow](../workflows/create-epic.md)  
**Outputs**: New epic file, updated tracking, context integration

#### [Story Create Prompt](story-create.md)

**Purpose**: Create new user story specifications  
**Use When**: Adding new user stories to the development system  
**Outputs**: New story file, updated tracking, parent epic integration

### Content Modification

#### [Epic Update Prompt](epic-update.md)

**Purpose**: Update existing epic files with feedback and changes  
**Use When**: Epic files need modifications or consistency updates  
**Workflow**: Uses [Update Epic Workflow](../workflows/update-epic.md)  
**Outputs**: Updated epic file, related epic updates, context updates

#### [Story Update Prompt](story-update.md)

**Purpose**: Update existing user story files  
**Use When**: Story files need modifications or enhancements  
**Outputs**: Updated story file, parent epic updates, tracking updates

#### [Component Update Prompt](component-update.md)

**Purpose**: Update component specifications and related epics  
**Use When**: Component files need modifications or integration updates  
**Outputs**: Updated component file, related epic updates, cross-references

### Content Transformation

#### [Context Processing Prompt](context-processing.md)

**Purpose**: Process context files to identify epic impacts and integrate insights  
**Use When**: Regular maintenance to process pending, updated, or new context files  
**Workflow**: Uses [Process Context Status Workflow](../workflows/process-context-status.md)  
**Outputs**: Updated epics, new epics (if needed), updated context tracking

#### [Epic Generate Components Prompt](epic-generate-components.md)

**Purpose**: Generate comprehensive component specifications for a specific epic  
**Use When**: A specific epic needs all its components analyzed and specified  
**Workflow**: Uses [Generate Components Workflow](../workflows/generate-components.md)  
**Outputs**: Component files, updated epic, component tracking, cross-references

#### [Epics to Components Conversion Prompt](epics-to-components-conversion.md)

**Purpose**: Convert epic specifications into detailed component specifications  
**Use When**: Epics are ready for detailed technical implementation planning  
**Outputs**: Component files, updated epics, component tracking

#### [Epics to User Stories Conversion Prompt](epics-to-user-stories-conversion.md)

**Purpose**: Convert epic specifications into detailed user stories  
**Use When**: Epics are ready for user story breakdown and implementation planning  
**Outputs**: User story files, updated epics, story tracking

#### [Roadmap to Epics Conversion Prompt](roadmap-to-epics-conversion.md)

**Purpose**: Convert roadmap items into detailed epic specifications  
**Use When**: Roadmap items are ready for detailed development planning  
**Outputs**: Epic files, updated roadmap, epic tracking

### Content Organization

#### [Epic Split Prompt](epic-split.md)

**Purpose**: Split existing epics into multiple focused epics  
**Use When**: Epic scope is too large or contains distinct functional areas  
**Workflow**: Uses [Split Epic Workflow](../workflows/split-epic.md)  
**Outputs**: Modified original epic, new epic file, updated tracking

#### [Story Split Prompt](story-split.md)

**Purpose**: Split existing user stories into multiple focused stories  
**Use When**: Story scope is too large or contains distinct functional areas  
**Outputs**: Modified original story, new story file, updated tracking

### System Maintenance

#### [Vision Roadmap Update Prompt](vision-roadmap-update.md)

**Purpose**: Update project vision and roadmap documents  
**Use When**: Vision or roadmap needs updates based on new insights or feedback  
**Outputs**: Updated vision/roadmap files, consistency validation

#### [Document Processing Prompt](document-processing.md)

**Purpose**: General document processing and validation  
**Use When**: Processing any AI development system document  
**Workflow**: Uses [Document Processing Workflow](../workflows/document-processing.md)  
**Outputs**: Validated document, related updates, quality report

## Prompt Categories

### By Function

- **Creation**: Epic Create, Story Create
- **Modification**: Epic Update, Story Update, Component Update, Vision Roadmap Update
- **Transformation**: Context Processing, Epic Generate Components, Epics to Components, Epics to Stories, Roadmap to Epics
- **Organization**: Epic Split, Story Split
- **Maintenance**: Document Processing

### By Content Type

- **Epics**: Epic Create, Epic Update, Epic Split, Roadmap to Epics
- **Stories**: Story Create, Story Update, Story Split, Epics to Stories
- **Components**: Component Update, Epic Generate Components, Epics to Components
- **Context**: Context Processing
- **System**: Vision Roadmap Update, Document Processing

## Usage Guidelines

### Prompt Selection

1. **Load Vision Context**: ALWAYS start by loading the project vision into context as specified in each prompt
2. **Identify Content Type**: Determine what type of content you're working with
3. **Determine Operation**: Decide whether you need to create, modify, transform, or organize
4. **Check Prerequisites**: Ensure required inputs and dependencies are available
5. **Select Appropriate Prompt**: Choose the prompt that best matches your needs
6. **Follow Workflow**: Use associated workflows for consistent results

### Quality Standards

- All prompts include mandatory vision context loading as the first step
- All prompts follow established format specifications
- Prompts leverage existing workflows to ensure consistency
- Cross-references are maintained throughout all operations
- Processing results support ongoing development planning
- All outputs maintain alignment with the project vision and contribute to the overall game experience

### Integration Patterns

- Prompts compose with workflows for modular operation
- Cross-prompt consistency is maintained through shared workflows
- System integrity is preserved through validation workflows
- Automation support through consistent interfaces

## Related Documentation

- [Workflows](../workflows/README.md) - Standardized operational procedures
- [Format Specifications](../formats/README.md) - Document format requirements
- [Context Tracking](../contexts.md) - Context file processing status
- [Project Documentation](../../product/README.md) - Epic and story tracking

## Automation Integration

These prompts are designed to support:

- **Manual Execution**: Interactive development and content creation
- **Automated Processing**: Regular maintenance and system updates
- **CI/CD Integration**: Build pipeline validation and processing
- **Workflow Composition**: Combining prompts for complex operations

## Notes

Prompts should be selected based on specific development needs and content types. Each prompt is designed to work with established workflows to ensure consistent, high-quality results. Regular use of maintenance prompts helps keep the development system current and well-organized.
