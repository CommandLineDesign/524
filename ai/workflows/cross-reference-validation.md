# Cross-Reference Validation Workflow

## Purpose

This workflow provides standardized steps for validating and maintaining cross-references across all AI development system files, ensuring link integrity and relationship consistency.

## Workflow Steps

### 1. Reference Discovery

**Identify All Cross-References:**

1. **Direct Links**: Markdown links between files
2. **Named References**: Mentions of specific epics, stories, or contexts by name
3. **Dependency Declarations**: Formal dependency lists in epic metadata
4. **Category References**: References to categories or groupings

### 2. Link Validation

**Check Link Integrity:**

- [ ] **File Existence**: All referenced files exist at specified paths
- [ ] **Path Accuracy**: Relative paths are correct from source location
- [ ] **Anchor Links**: Section anchors exist if specified
- [ ] **Case Sensitivity**: File names match exactly (important for case-sensitive systems)

**Validation Commands:**

```bash
# Check for broken links
find ai/ -name "*.md" -exec grep -l "\[.*\](" {} \; | xargs -I {} echo "Checking: {}"

# Validate file existence
grep -r "\]\(" ai/ --include="*.md" | grep -v "http" | cut -d']' -f2 | cut -d'(' -f2 | cut -d')' -f1
```

### 3. Bidirectional Reference Check

**Ensure Mutual References:**

- If Epic A depends on Epic B, Epic B should list Epic A as a dependent
- If Context C informs Epic D, Epic D should reference Context C
- Related contexts should reference each other mutually

**Bidirectional Patterns:**

```markdown
# In Epic A

Dependencies: epic-b

# In Epic B (should include)

Dependents: epic-a

# In Context C

Epic Integration: epic-d

# In Epic D (should include)

Context Source: context-c
```

### 4. Dependency Consistency

**Validate Dependency Logic:**

- [ ] **No Circular Dependencies**: Epic A → Epic B → Epic A chains
- [ ] **Logical Sequence**: Dependencies support implementable order
- [ ] **Foundation First**: Core systems are not dependent on advanced features
- [ ] **Category Alignment**: Dependencies within logical category boundaries

### 5. Content Synchronization

**Check Content Alignment:**

- **Epic Dependencies**: Match description in both epics
- **Context References**: Epic content aligns with source context
- **Story Epic Mapping**: User stories map to correct epic components
- **Category Consistency**: Items in same category share common themes

### 6. Status Consistency

**Validate Status Dependencies:**

- Prerequisites completed before dependent items start
- Status progression follows logical sequence
- Blocked items have clear blocking dependencies
- Completed items don't depend on incomplete prerequisites

### 7. Automated Validation

**Validation Scripts:**

```bash
#!/bin/bash
# Link validation script

echo "Validating cross-references..."

# Check for broken internal links
broken_links=()
for file in $(find ai/ -name "*.md"); do
    grep -o '\[.*\]([^)]*\.md[^)]*)' "$file" | while read link; do
        path=$(echo "$link" | sed 's/.*(\([^)]*\)).*/\1/')
        if [[ ! "$path" =~ ^http ]]; then
            full_path=$(dirname "$file")/"$path"
            if [[ ! -f "$full_path" ]]; then
                broken_links+=("$file: $path")
            fi
        fi
    done
done

if [[ ${#broken_links[@]} -gt 0 ]]; then
    echo "Broken links found:"
    printf '%s\n' "${broken_links[@]}"
    exit 1
else
    echo "All internal links valid"
fi
```

### 8. Reference Patterns

**Standard Reference Formats:**

```markdown
# Context to Epic References

## Epic Integration

This context informs the following epics:

- [Epic Name](../../epics/epic-name.md)

# Epic to Context References

## Notes

### Context Sources

- [Context Name](../context/category/context-name.md)

# Epic Dependencies

## Dependencies

- [Prerequisite Epic](prerequisite-epic.md) - Brief reason
- [Foundation Epic](foundation-epic.md) - Brief reason

# Story to Epic References

## Related Epic

This story is part of [Epic Name](../epics/epic-name.md)
```

## Quality Standards

### Reference Quality

- **Accuracy**: All links point to correct files and sections
- **Completeness**: All relationships properly documented
- **Consistency**: Reference formats follow established patterns
- **Bidirectional**: Mutual references exist where appropriate

### Maintenance Quality

- **Currency**: References updated when files are moved or renamed
- **Relevance**: Outdated references removed promptly
- **Clarity**: Reference purpose is clear from context
- **Organization**: References grouped logically within documents

## Validation Checklist

**File-Level Validation:**

- [ ] All outgoing links are valid
- [ ] All incoming references are documented
- [ ] Reference formats are consistent
- [ ] Section anchors exist for deep links

**System-Level Validation:**

- [ ] No circular dependencies
- [ ] Bidirectional references complete
- [ ] Status consistency maintained
- [ ] Category relationships logical

**Content-Level Validation:**

- [ ] Referenced content supports claims
- [ ] Dependencies enable implementation
- [ ] Cross-references add value
- [ ] Related items genuinely related

## Error Resolution

### Common Issues and Solutions

**Broken Links:**

- Update file paths when files are moved
- Fix typos in file names
- Update section anchors when headers change

**Missing Bidirectional References:**

- Add reverse dependencies in target files
- Include backlinks in related contexts
- Update tracking files with cross-references

**Circular Dependencies:**

- Identify dependency loops
- Break loops by removing non-essential dependencies
- Restructure epics to eliminate circles

**Inconsistent References:**

- Standardize reference formats
- Update outdated dependency descriptions
- Align terminology across related files

## Automation Integration

**Git Hooks:**

- Pre-commit validation of references
- Post-commit reference update triggers
- Branch merge reference conflict detection

**CI/CD Integration:**

- Automated reference validation in build pipeline
- Reference report generation
- Broken link notifications

**Maintenance Scripts:**

- Regular reference audits
- Automated bidirectional reference generation
- Orphaned file detection

## Related Workflows

- [Create Context Workflow](create-context.md) - Reference setup during creation
- [Update Context Workflow](update-context.md) - Reference maintenance during updates
- [Process Context Workflow](process-context.md) - Reference creation during processing

## Usage Example

```bash
# Example validation run
Script: validate-references.sh
Scope: All AI development files
Results:
  - Total References: 247
  - Valid References: 245
  - Broken References: 2
  - Missing Bidirectional: 5
Actions Taken:
  - Fixed broken links in epic-a.md
  - Added reverse dependencies in epic-b.md
  - Updated context tracking references
```

This workflow ensures the AI development system maintains reference integrity and supports reliable navigation between related content.
