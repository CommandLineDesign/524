# Planetform AI Format Specifications

## Overview

This directory contains canonical format specifications for all Planetform documentation types. These specifications ensure consistency across all AI prompts and manual documentation efforts.

## Format Specifications

### Format Specification Format (Meta-Format)

- **File**: [format-specification-format.md](./format-specification-format.md)
- **Purpose**: Defines the canonical structure and content requirements for format specification files themselves
- **Used By**: Anyone creating or updating format specification files
- **Scope**: Meta-format structure, content guidelines, quality standards, and validation requirements for format specifications

### Epic Format Specification

- **File**: [epic-format.md](./epic-format.md)
- **Purpose**: Defines the exact format, structure, and content requirements for all epic files
- **Used By**: All prompts that create or modify epic files
- **Scope**: Epic file structure, metadata fields, content guidelines, and validation requirements

### Component Format Specification

- **File**: [component-format.md](./component-format.md)
- **Purpose**: Defines the exact format, structure, and content requirements for all component files
- **Used By**: All prompts that create or modify component files
- **Scope**: Component file structure, metadata fields, content guidelines, and validation requirements

### Story Format Specification

- **File**: [story-format.md](./story-format.md)
- **Purpose**: Defines the exact format, structure, and content requirements for all user story files
- **Used By**: All prompts that create or modify user story files
- **Scope**: Story file structure, metadata fields, content guidelines, and validation requirements

### Context Format Specification

- **File**: [context-format.md](./context-format.md)
- **Purpose**: Defines the exact format, structure, and content requirements for all context files
- **Used By**: All prompts that create or modify context files in the ai/context/ directory
- **Scope**: Context file structure, content section variations, status indicators, and cross-referencing requirements

### Task Format Specification

- **File**: [task-format.md](./task-format.md)
- **Purpose**: Defines the exact format, structure, and content requirements for all task files
- **Used By**: All prompts that create or modify task files for progress tracking and workflow coordination
- **Scope**: Task file structure, workflow step organization, session continuity, dependency management, and progress tracking

### Tech Plan Format Specification

- **File**: [tech-plan-format.md](./tech-plan-format.md)
- **Purpose**: Defines the exact format, structure, and content requirements for all technical plan files
- **Used By**: All prompts that create or modify tech plan files in the product/tech-plans/ directory
- **Scope**: Tech plan file structure, implementation step organization, cross-reference standards, and validation requirements

### Workflow Format Specification

- **File**: [workflow-format.md](./workflow-format.md)
- **Purpose**: Defines the exact format, structure, and content requirements for all workflow files
- **Used By**: All prompts that create or modify workflow files in the ai/workflows/ directory
- **Scope**: Workflow file structure, step organization, quality assurance patterns, and process standardization

## Usage Guidelines

### For AI Prompts

All prompts that work with specific document types should reference the appropriate format specification rather than duplicating format requirements inline. This ensures:

- **Consistency**: All prompts use identical format requirements
- **Maintainability**: Format changes only need to be made in one place
- **Quality**: Comprehensive validation requirements are consistently applied

### For Manual Documentation

When manually creating or updating documentation, always reference the appropriate format specification to ensure compliance with project standards.

### Referencing Format Specifications

Use relative links from prompts to format specifications:

```markdown
**Format**: Follow the canonical format defined in [Specification Name](../formats/specification-format.md)
```

## Maintenance

### Adding New Format Specifications

When creating new format specifications:

1. Create the specification file in this directory
2. Update this README to list the new specification
3. Update relevant prompts to reference the new specification
4. Remove any duplicate format requirements from existing prompts

### Updating Existing Specifications

When updating format specifications:

1. Make changes to the specification file
2. Review all prompts that reference the specification
3. Test prompt functionality with updated specifications
4. Update any non-compliant existing documentation

## Directory Structure

```
ai/formats/
├── README.md                              # This file
├── format-specification-format.md         # Meta-format for format specifications
├── epic-format.md                         # Epic file format specification
├── component-format.md                    # Component file format specification
├── story-format.md                        # Story file format specification
├── context-format.md                      # Context format specification
├── task-format.md                         # Task file format specification
├── tech-plan-format.md                    # Tech plan file format specification
├── workflow-format.md                     # Workflow file format specification
└── [future-format.md]                     # Additional format specs as needed
```

## Quality Standards

All format specifications should include:

- **Complete Template**: Exact structure and content requirements
- **Format Rules**: Critical formatting requirements and constraints
- **Content Guidelines**: Detailed guidance for each section
- **Quality Standards**: Technical accuracy and consistency requirements
- **Validation Checklist**: Comprehensive validation requirements
- **Usage Instructions**: How prompts should reference the specification

## Notes

- Format specifications are the single source of truth for document structure
- All prompts must reference specifications rather than duplicating requirements
- Regular validation of existing documentation against specifications is recommended
- Changes to specifications should be coordinated with all dependent prompts
