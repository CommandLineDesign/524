# Pre-Deployment Quality Check Workflow

## Purpose

This workflow provides a comprehensive quality assurance process that runs all necessary linting, type checking, and building operations to ensure code quality and prevent deployment failures on platforms like Vercel. It serves as a critical gatekeeper that validates code integrity before any deployment, catching issues that would otherwise fail in CI/CD pipelines.

## CRITICAL FORMAT REQUIREMENT

**ALL workflow files MUST follow the canonical workflow format specification.**

**Format Reference**: Use this exact reference in AI prompts:

```markdown
**Workflow Format**: Follow the canonical workflow format defined in [Workflow Format Specification](../formats/workflow-format.md)
```

**ENFORCEMENT**: Any workflow file that does not comply with the format specification is considered invalid and must be corrected before use.

## Workflow Steps

### 1. Dependency Installation Verification

**Purpose:**
Ensure all project dependencies are properly installed and up-to-date across the monorepo to prevent missing module errors during type checking and building.

**Input:**

- Clean workspace with no uncommitted changes
- Access to package manager (pnpm)
- Valid lockfile (pnpm-lock.yaml)

**Actions:**

1. **Clean Install Dependencies**: Run `pnpm install` to ensure all dependencies are properly installed
2. **Verify Lockfile Integrity**: Check that pnpm-lock.yaml is valid and consistent
3. **Confirm Package Structure**: Verify all workspace packages are properly linked

**Output:**

- All packages installed with correct versions
- Valid dependency tree across all workspaces
- Confirmation of successful dependency resolution

**Validation:**

- [ ] **Installation Success**: pnpm install completes without errors
- [ ] **Lockfile Validity**: pnpm-lock.yaml is present and properly formatted
- [ ] **Workspace Links**: All workspace packages are correctly linked

### 2. Code Formatting Validation

**Purpose:**
Ensure all code follows consistent formatting standards using Biome, preventing formatting-related build failures and maintaining code readability.

**Input:**

- Installed dependencies from Step 1
- Source code files across all packages
- Biome configuration (biome.json)

**Actions:**

1. **Check Formatting**: Run `pnpm run format:check` to validate all files are properly formatted
2. **Review Formatting Errors**: If errors found, run `pnpm run format` to auto-fix formatting issues
3. **Verify Fixes**: Re-run format check to confirm all formatting issues resolved

**Output:**

- All source files properly formatted according to Biome rules
- Consistent code style across the entire codebase
- No formatting-related linting errors

**Validation:**

- [ ] **Format Check Pass**: `pnpm run format:check` completes successfully
- [ ] **No Manual Fixes Needed**: Auto-formatting resolves all formatting issues
- [ ] **Consistent Style**: All files follow the same formatting standards

### 3. Import Organization Validation

**Purpose:**
Ensure all imports are properly organized and sorted according to Biome's import organization rules, preventing import-related errors and maintaining clean code structure.

**Input:**

- Properly formatted code from Step 2
- Biome configuration with import organization settings

**Actions:**

1. **Check Import Organization**: Run `pnpm run check` to validate import organization
2. **Auto-fix Import Issues**: Run `pnpm run check:fix` if import organization errors are found
3. **Verify Import Fixes**: Re-run check command to confirm all import issues resolved

**Output:**

- All imports properly sorted and organized
- Consistent import patterns across all files
- Clean, maintainable import structure

**Validation:**

- [ ] **Import Check Pass**: `pnpm run check` completes without import organization errors
- [ ] **Auto-fix Success**: All import organization issues resolved automatically
- [ ] **Consistent Patterns**: Import organization follows established patterns

### 4. Linting Validation

**Purpose:**
Run comprehensive linting checks using Biome to catch code quality issues, potential bugs, and style violations that could cause runtime errors or deployment failures.

**Input:**

- Properly formatted and organized code from Steps 2-3
- Biome linting configuration

**Actions:**

1. **Run Linting**: Execute `pnpm run lint` to check all source files
2. **Review Linting Errors**: If errors found, run `pnpm run lint:fix` to auto-fix safe issues
3. **Manual Fix Remaining Issues**: Address any remaining linting errors that require manual intervention
4. **Verify Linting Pass**: Re-run lint command to confirm all issues resolved

**Output:**

- All linting rules pass without errors
- Code follows established quality standards
- No potential bugs or style violations remain

**Validation:**

- [ ] **Linting Pass**: `pnpm run lint` completes without errors
- [ ] **Auto-fix Applied**: Safe linting issues resolved automatically
- [ ] **Manual Fixes Complete**: All remaining linting issues addressed
- [ ] **Quality Standards Met**: Code meets all established linting rules

### 5. Type Checking Validation

**Purpose:**
Run TypeScript type checking across all packages to ensure type safety, catch potential runtime errors, and validate that all modules can be properly resolved during compilation.

**Input:**

- Linted code from Step 4
- TypeScript configuration files (tsconfig.json)
- All package dependencies properly installed

**Actions:**

1. **Run Type Checking**: Execute `pnpm run typecheck` to validate all packages
2. **Analyze Type Errors**: Review any type checking failures for root causes
3. **Fix Type Issues**: Address missing dependencies, incorrect imports, or type definition problems
4. **Verify Type Check Pass**: Re-run typecheck command to confirm all issues resolved

**Output:**

- All TypeScript files pass type checking
- No type-related errors or warnings
- All module imports properly resolved
- Type-safe codebase ready for compilation

**Validation:**

- [ ] **Type Check Pass**: `pnpm run typecheck` completes without errors
- [ ] **No Type Errors**: All TypeScript compilation issues resolved
- [ ] **Module Resolution**: All imports and dependencies properly resolved
- [ ] **Type Safety**: Codebase maintains full type safety

### 6. Build Validation

**Purpose:**
Execute full build process for all packages to ensure complete compilation success and validate that the application can be built for production deployment.

**Input:**

- Type-checked code from Step 5
- Build configurations for all packages
- All required build dependencies

**Actions:**

1. **Run Full Build**: Execute `pnpm run build` to build all packages
2. **Monitor Build Process**: Watch for any build failures or warnings
3. **Address Build Issues**: Fix any compilation errors or build configuration problems
4. **Verify Build Success**: Confirm all packages build successfully

**Output:**

- All packages successfully compiled
- Production-ready build artifacts generated
- No build errors or warnings
- Application ready for deployment

**Validation:**

- [ ] **Build Success**: `pnpm run build` completes without errors
- [ ] **All Packages Built**: Every package in the monorepo builds successfully
- [ ] **No Build Warnings**: Build process completes cleanly without warnings
- [ ] **Production Ready**: Generated artifacts are suitable for deployment

## Quality Assurance

**MANDATORY FORMAT VALIDATION:**

- [ ] **Format Compliance**: File MUST follow exact structure from [Workflow Format Specification](../formats/workflow-format.md)
- [ ] **Section Order**: Headers match template exactly in correct order
- [ ] **Required Sections**: ALL required sections are present and properly filled
- [ ] **Status Indicators**: Validation elements use proper checkbox format
- [ ] **Cross-References**: Links use proper markdown format and point to correct targets

**Code Quality Review:**

- [ ] **Comprehensive Coverage**: All critical quality checks (linting, type checking, building) are included
- [ ] **Logical Sequence**: Steps execute in proper dependency order
- [ ] **Error Prevention**: Workflow catches issues that would fail on Vercel/other CI platforms
- [ ] **Automated Fixes**: Safe fixes are applied automatically where possible
- [ ] **Clear Validation**: Each step has specific, testable validation criteria

**Process Review:**

- [ ] **Dependency Management**: Proper handling of workspace dependencies and linking
- [ ] **Error Recovery**: Clear guidance for addressing various types of failures
- [ ] **Performance Optimized**: Checks run efficiently without unnecessary operations
- [ ] **CI/CD Compatible**: Workflow can be integrated into automated deployment pipelines
- [ ] **Documentation Complete**: All steps have clear, actionable instructions

**CRITICAL**: If ANY format validation check fails, the workflow file MUST be corrected before proceeding.

## Success Criteria

**Quality Assurance Completion:**

- All formatting, linting, type checking, and build processes pass successfully
- Codebase meets all established quality standards
- No errors that would cause Vercel or other CI/CD deployment failures
- All packages build successfully for production deployment
- Code is ready for merge and deployment without additional quality checks

**Process Efficiency:**

- Workflow completes within reasonable time limits
- Automated fixes resolve common issues without manual intervention
- Clear error messages guide developers to specific problems
- Process can be integrated into automated CI/CD pipelines
- Minimal false positives or unnecessary blocking

## Related Workflows

- [Local Development Setup Workflow](./local-development-setup.md) - Prerequisites for running this workflow
- [Bug Analysis Workflow](./generate-bug-analysis.md) - For investigating issues found by this workflow
- [Code Review Workflow](./code-review-workflow.md) - For reviewing changes that pass this workflow

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference the Format**: Always include this exact statement in prompts:

   ```markdown
   **Workflow Format**: Follow the canonical workflow format defined in [Workflow Format Specification](../formats/workflow-format.md)
   ```

2. **Validate Before Completion**: Run through the complete validation checklist before considering the workflow complete

3. **Use Correct Templates**: Apply the structured step format with Purpose, Input, Actions, Output, and Validation elements

4. **Enforce Section Order**: Maintain exact section order as specified in the format specification

5. **Include ALL Required Sections**: Never omit required sections - all must be present and properly filled

**FAILURE TO COMPLY**: Workflow files that do not follow the format specification are invalid and will require correction.

## Notes

This workflow serves as the final quality gate before deployment, ensuring that code changes meet all quality standards and will not fail during CI/CD processes. It should be run before every merge to main and as part of automated deployment pipelines.

The workflow is designed to catch issues early and provide clear, actionable feedback for resolution. Common issues addressed include missing dependencies, formatting inconsistencies, linting violations, type errors, and build failures.

For optimal performance, this workflow should be integrated into CI/CD pipelines and run automatically on pull requests to prevent deployment failures.

## Content Guidelines

### File Naming Convention

- Use kebab-case for file names (e.g., `pre-deployment-quality-check.md`)
- Workflow names should clearly describe the process or task being standardized
- Include "workflow" in the filename for clarity
- Keep names concise but descriptive of the specific operational procedure

### Purpose Section

- Clearly state what the workflow accomplishes
- Explain when the workflow should be used
- Describe the value and benefits of following this workflow
- Include context about how this workflow fits into the broader system

### Workflow Steps Structure

Each step must include all five required elements: Purpose, Input, Actions, Output, and Validation

#### Step Organization

- Use numbered steps (1, 2, 3...) for sequential workflow phases
- Use descriptive step names that clearly indicate the phase purpose
- Each step must include all five required elements: Purpose, Input, Actions, Output, and Validation
- Steps should be logically connected with outputs from one step providing inputs to the next

#### Action Items and Checklists

- Use checkbox format `- [ ]` for validation points and quality checkpoints
- Begin each checkbox item with **bold category or action type**
- Provide specific, testable criteria
- Group related checkboxes under descriptive headers

#### Code Blocks and Examples

- Include command examples where appropriate
- Use proper markdown code block formatting with language specification
- Provide realistic examples that can be directly used
- Include both input examples and expected output formats