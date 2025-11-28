# Document Processing Workflow

## Purpose

This workflow provides a unified approach for processing any type of document within the AI development system, ensuring consistent handling of contexts, epics, stories, and other content types.

## Workflow Steps

### 1. Document Type Classification

**Identify Document Type:**

- **Context File**: Information and requirements gathering
- **Epic File**: High-level feature specifications
- **Story File**: Detailed implementation requirements
- **Format Specification**: Template and standard definitions
- **Prompt File**: AI instruction sets
- **Tracking File**: Status and progress monitoring

### 2. Pre-Processing Analysis

**Document Assessment:**

1. **Content Scope**: Determine breadth and depth of content
2. **Processing Requirements**: Identify what needs to be generated/updated
3. **Impact Analysis**: Assess effects on existing documents
4. **Resource Requirements**: Estimate effort and complexity

### 3. Processing Strategy Selection

**Strategy Options:**

| Document Type | Primary Strategy         | Secondary Actions                       |
| ------------- | ------------------------ | --------------------------------------- |
| Context       | Process to Epics/Stories | Update tracking, cross-references       |
| Epic          | Validate and Integrate   | Update epic tracking, story generation  |
| Story         | Validate and Link        | Update story tracking, epic association |
| Prompt        | Test and Validate        | Update documentation, usage examples    |
| Tracking      | Analyze and Report       | Status updates, progress reporting      |

**Context File Processing Requirements:**

- **New Context Files**: Use [Create Context Workflow](create-context.md) for generation and tracking integration
- **Existing Context Files**: Use [Update Context Workflow](update-context.md) for modifications and dependency updates
- **MANDATORY**: All context files must follow [Context Format Specification](../formats/context-format.md)

### 4. Content Processing Pipeline

**Standard Processing Steps:**

1. **Format Validation**
   - Check compliance with format specifications
   - Validate required sections present
   - Ensure proper metadata structure

2. **Content Analysis**
   - Extract key concepts and requirements
   - Identify relationships and dependencies
   - Assess technical feasibility and value

3. **Integration Planning**
   - Map to existing project elements
   - Plan cross-reference updates
   - Identify affected documents

4. **Generation Execution**
   - **For NEW Context Files**: Apply [Create Context Workflow](create-context.md)
     - Use proper context format specification template
     - Apply correct category classification
     - Establish initial tracking entries
   - **For EXISTING Context Files**: Apply [Update Context Workflow](update-context.md)
     - Maintain format compliance during updates
     - Update tracking system with modification status
     - Assess and update dependent documents
   - **For Other Document Types**: Create/update following respective workflows
   - Establish cross-references using proper markdown format

5. **Validation and Review**
   - Verify format compliance
   - Check content quality and consistency
   - Validate integration completeness

### 5. Context Workflow Integration

**MANDATORY Context Processing Requirements:**

**For NEW Context Files:**

1. **Apply Create Context Workflow**: Use [Create Context Workflow](create-context.md) procedures exactly
2. **Format Specification Compliance**: MUST follow [Context Format Specification](../formats/context-format.md)
3. **Category Classification**: Select appropriate category (design, entities, environment, game-mechanics, resources, systems, technical, technology)
4. **Tracking Integration**: Update `ai/contexts.md` with ⚪ **New** status entry
5. **Template Application**: Use correct template based on source type (Vision/Roadmap-Generated most common)
6. **Validation Checklist**: Complete ALL validation requirements from create-context workflow

**For EXISTING Context Files:**

1. **Apply Update Context Workflow**: Use [Update Context Workflow](update-context.md) procedures exactly
2. **Format Compliance Maintenance**: Preserve exact format specification structure
3. **Pre-Update Validation**: Check current status and identify dependencies
4. **Tracking System Update**: Change status to 🔴 **Updated** in `ai/contexts.md`
5. **Impact Assessment**: Identify and update affected epics/stories
6. **Cross-Reference Maintenance**: Update bidirectional references as needed
7. **Validation Checklist**: Complete ALL validation requirements from update-context workflow

**CRITICAL ENFORCEMENT:**

- Context files that do not follow the designated workflows are considered invalid
- All context files MUST pass workflow-specific validation before acceptance
- Any deviation from workflow procedures requires immediate correction

### 6. Multi-Document Updates

**Coordinated Update Process:**

**Primary Document Updates:**

- Update the source document if needed
- Apply format corrections
- Enhance content based on processing insights

**Secondary Document Updates:**

- Create or update related epics/stories
- Update tracking files with new status
- Add cross-references to related documents

**System-Level Updates:**

- Update index and navigation files
- Refresh category summaries
- Update progress metrics

### 7. Quality Assurance Pipeline

**MANDATORY FORMAT VALIDATION (for format-specified files):**

**For Context Files** - Apply [Create Context Workflow](create-context.md) and [Update Context Workflow](update-context.md) validation requirements:

- [ ] **Context Format Compliance**: Files MUST follow exact structure from [Context Format Specification](../formats/context-format.md)
- [ ] **Section Order**: Headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Status Indicators**: Implementation status uses correct format and emoji (🟢🟡🔴🔄)
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets
- [ ] **Vision Origins**: Source attribution is complete and accurate (if applicable)
- [ ] **Last Updated**: Today's date (retrieved via `date +%Y-%m-%d`) and reason are documented

**For Other Format-Specified Files:**

- [ ] **Format Compliance**: Files MUST follow exact structure from their respective format specifications
- [ ] **Section Order**: Headers match templates exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Status Indicators**: Use correct format and emoji for status fields
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets
- [ ] **Template Compliance**: Content structure matches format specification requirements

**Content Quality Checks:**

- [ ] **Completeness**: All required sections present and substantive
- [ ] **Clarity**: Content is clear and unambiguous
- [ ] **Consistency**: Terminology and formatting align with standards
- [ ] **Accuracy**: Technical details are correct and feasible

**Integration Quality Checks:**

- [ ] **Cross-References**: All links functional and bidirectional
- [ ] **Dependencies**: Logical and implementable relationships
- [ ] **Status**: Tracking information accurate and up-to-date
- [ ] **Navigation**: Easy to find and access related content

**CRITICAL**: If ANY format validation check fails, the files MUST be corrected before proceeding.

### 8. Processing Automation

**Automated Processing Triggers:**

```bash
# File change detection
inotifywait -m -r ai/ -e modify,create,delete --format '%w%f %e' |
while read file event; do
    if [[ "$file" =~ \.md$ ]]; then
        echo "Processing: $file ($event)"
        ./scripts/process-document.sh "$file" "$event"
    fi
done
```

**Processing Scripts:**

```bash
#!/bin/bash
# process-document.sh

file="$1"
event="$2"

case "$file" in
    */context/*)
        echo "Processing context file: $file"
        if [[ "$event" == "CREATE" ]]; then
            echo "Applying Create Context Workflow"
            ./workflows/create-context.sh "$file"
        else
            echo "Applying Update Context Workflow"
            ./workflows/update-context.sh "$file"
        fi
        ./workflows/process-context.sh "$file"
        ;;
    */epics/*)
        echo "Processing epic file: $file"
        ./workflows/validate-epic.sh "$file"
        ;;
    */stories/*)
        echo "Processing story file: $file"
        ./workflows/validate-story.sh "$file"
        ;;
    *)
        echo "Processing general document: $file"
        ./workflows/validate-format.sh "$file"
        ;;
esac
```

### 9. Error Handling and Recovery

**Common Processing Errors:**

| Error Type            | Cause                      | Resolution                       |
| --------------------- | -------------------------- | -------------------------------- |
| Format Violation      | Incorrect template usage   | Apply format corrections         |
| Broken References     | File moves/renames         | Update cross-reference links     |
| Circular Dependencies | Logic errors               | Restructure dependency chains    |
| Content Gaps          | Incomplete information     | Request additional detail        |
| Integration Conflicts | Contradictory requirements | Resolve conflicts through review |

**Recovery Procedures:**

1. **Error Detection**: Automated validation identifies issues
2. **Impact Assessment**: Determine scope of resolution needed
3. **Resolution Planning**: Develop fix strategy
4. **Implementation**: Apply fixes systematically
5. **Validation**: Verify resolution completeness

### 10. Processing Metrics

**Track Processing Performance:**

- Processing time per document type
- Error rates and types
- Quality score trends
- Cross-reference health

**Reporting Dashboard:**

```markdown
## Document Processing Report

### Processing Summary

- Total Documents Processed: 156
- Context Files: 45 (🟢 42, 🟡 3, 🔴 0)
- Epic Files: 67 (🟢 65, 🟡 2, 🔴 0)
- Story Files: 44 (🟢 44, 🟡 0, 🔴 0)

### Quality Metrics

- Format Compliance: 98.7%
- Cross-Reference Health: 96.2%
- Processing Error Rate: 1.3%

### Recent Activity

- Last 24h: 12 documents processed
- Average Processing Time: 3.2 minutes
- Most Common Issues: Missing cross-references (4)
```

## Output Standards

**Processing Deliverables:**

1. **Validated Source Document**: Format-compliant and content-complete
2. **Generated Related Documents**: Epics, stories, or other derived content
3. **Updated Tracking**: Current status in all relevant tracking files
4. **Established Cross-References**: Bidirectional links between related content
5. **Quality Report**: Processing results and any issues identified

## Quality Standards

- **Thoroughness**: All document content properly processed
- **Consistency**: Processing follows established patterns
- **Integration**: Proper relationships established with existing content
- **Maintenance**: Tracking and status information accurately updated
- **Quality**: Output meets all established quality standards

## Related Workflows

**Context Processing:**

- [Create Context Workflow](create-context.md) - Creating new context files with proper format and tracking
- [Update Context Workflow](update-context.md) - Updating existing context files while maintaining integrity
- [Process Context Workflow](process-context.md) - Converting contexts to epics/stories

**Quality Assurance:**

- [Cross-Reference Validation](cross-reference-validation.md) - Reference integrity validation

**Content Development:**

- [Create Epic Workflow](create-epic.md) - Epic-specific processing
- [Update Epic Workflow](update-epic.md) - Epic modification and validation
- [Create Story Workflow](create-story.md) - Story creation from contexts and epics

## Usage Example

```bash
# Example document processing
Document: ai/context/systems/new-physics-system.md
Type: Context File (NEW)
Strategy: Apply Create Context Workflow → Process to Epics/Stories
Workflow Applied: Create Context Workflow
Generated:
  - Context file formatted per Context Format Specification
  - epics/physics-engine-core.md
  - epics/physics-performance-optimization.md
  - 8 user stories across both epics
Updated:
  - ai/contexts.md (status: ⚪ New, then 🟢 Processed)
  - product/epics.md (2 new entries)
  - Cross-references established
Quality Score: 97.5%
Processing Time: 4.2 minutes

# Example context update processing
Document: ai/context/systems/existing-system.md
Type: Context File (UPDATE)
Strategy: Apply Update Context Workflow → Validate Dependencies
Workflow Applied: Update Context Workflow
Actions:
  - Format compliance maintained
  - Tracking status updated to 🔴 Updated
  - Dependent epics reviewed and updated
  - Cross-references validated
Quality Score: 98.1%
Processing Time: 2.8 minutes
```

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference the Formats**: Always include the appropriate format reference statements in prompts based on file type:

   ```markdown
   **Context Format**: Follow the canonical context format defined in [Context Format Specification](../formats/context-format.md)
   **Epic Format**: Follow the canonical epic format defined in [Epic Format Specification](../formats/epic-format.md)
   **Story Format**: Follow the canonical story format defined in [Story Format Specification](../formats/story-format.md)
   ```

2. **Use CLI Date Retrieval**: CRITICAL - All date fields must use `$(date +%Y-%m-%d)` to retrieve today's actual date. Never use hardcoded dates or placeholders.

3. **Apply Appropriate Workflows**: Use the correct workflow for context file operations:
   - **NEW Context Files**: Apply [Create Context Workflow](create-context.md) procedures
   - **EXISTING Context Files**: Apply [Update Context Workflow](update-context.md) procedures
   - **Other Document Types**: Follow their respective processing workflows

4. **Validate Before Completion**: Run through the complete validation checklist before considering any format-specified files complete

5. **Use Correct Templates**: Apply the appropriate templates based on file types being processed

6. **Enforce Section Order**: Maintain exact section order as specified in the relevant format specifications

7. **Include ALL Required Sections**: Never omit required sections - all must be present and properly filled

8. **Update Tracking Systems**: Ensure proper integration with tracking files using workflow-specific procedures

**FAILURE TO COMPLY**: Files that do not follow their respective format specifications are invalid and will require correction.

This workflow provides a comprehensive framework for processing any document type within the AI development system while maintaining quality and consistency standards.
