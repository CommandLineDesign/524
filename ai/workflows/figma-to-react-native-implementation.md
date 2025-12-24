# Figma to React Native Implementation Workflow

## Purpose

This workflow provides standardized steps for implementing React Native screens and components from Figma designs using the Figma MCP server. It ensures that all implementations follow the 524 frontend development standards, maintain consistency with existing components, and accurately match the Figma designs.

**When to use this workflow:**
- Implementing new screens from Figma designs
- Creating new components based on Figma specifications
- Rebuilding existing UI to match updated Figma designs
- Ensuring design-to-code accuracy and consistency

## CRITICAL STANDARDS REQUIREMENT

**ALL React Native implementations MUST follow the 524 Frontend Development Standards.**

**Standards References**: Use these exact references in AI prompts:

```markdown
**Frontend Standards**: Follow the comprehensive guide defined in [Frontend Standards](../../docs/frontend/frontend-standards.md)

**Quick Reference**: Use templates and patterns from [Frontend Quick Reference](../../docs/frontend/frontend-quick-reference.md)

**Figma Implementation**: Follow the step-by-step process in [Figma Implementation Guide](../../docs/frontend/figma-implementation-guide.md)

**Quality Assurance**: Validate against [Component Checklist](../../docs/frontend/component-checklist.md)
```

**ENFORCEMENT**: Any implementation that does not comply with the frontend standards is considered invalid and must be corrected before completion.

---

## Workflow Steps

### 1. Figma Design Analysis

**Purpose:**
Extract and analyze the Figma design to understand the screen structure, components, design tokens, and implementation requirements before beginning development.

**Input:**
- Figma URL or file key and node ID
- Screen or component name from product requirements
- Any specific implementation requirements or constraints
- Access to Figma MCP server

**Actions:**

1. **Retrieve Figma Design**: Use the Figma MCP server to fetch the design
   ```
   Use mcp_figma_get_design_context or mcp_figma_get_screenshot with:
   - fileKey: extracted from Figma URL
   - nodeId: extracted from Figma URL (format: "123:456")
   ```

2. **Capture Design Screenshot**: Save a reference screenshot for visual comparison
   ```
   Use mcp_figma_get_screenshot to get visual reference
   Store screenshot reference for validation in step 7
   ```

3. **Extract Design Specifications**: Document the following from Figma:
   - Screen dimensions and layout structure
   - Color values (map to design tokens)
   - Spacing values (map to design tokens)
   - Typography specifications (font sizes, weights, line heights)
   - Border radius values
   - Shadow specifications
   - Component hierarchy and nesting

4. **Identify Interactive Elements**: List all touchable/interactive components:
   - Buttons and their variants
   - Input fields
   - Cards or list items
   - Navigation elements
   - Modal triggers

5. **Document Asset Requirements**: List all required assets:
   - Icons (check if SVG or PNG needed)
   - Images and their required resolutions (@1x, @2x, @3x)
   - Illustrations or graphics

**Output:**
- Figma design context (code and metadata)
- Reference screenshot saved for validation
- Design specifications document with:
  - Layout structure breakdown
  - Design token mappings (colors, spacing, typography)
  - Component hierarchy diagram
  - Interactive elements list
  - Asset requirements list
- Implementation complexity assessment

**Validation:**
- [ ] **Design Retrieved**: Figma design successfully fetched via MCP server
- [ ] **Screenshot Captured**: Reference screenshot saved for final validation
- [ ] **Specifications Complete**: All design specifications documented
- [ ] **Token Mapping**: Design values mapped to existing design tokens
- [ ] **Component Hierarchy**: Clear understanding of component structure
- [ ] **Assets Identified**: All required assets listed with specifications

---

### 2. Component Library Check

**Purpose:**
Verify which components already exist in the component library to maximize reuse and maintain consistency across the application.

**Input:**
- Component hierarchy from Step 1
- Interactive elements list from Step 1
- Component library documentation location: `docs/frontend/component-library.md`

**Actions:**

1. **Read Component Library Documentation**: Check existing components
   ```
   Read file: docs/frontend/component-library.md
   If file doesn't exist, create it in Step 3
   ```

2. **Match Design Components to Library**: For each component in the design:
   - Check if an exact match exists in the library
   - Check if a variant of an existing component can be used
   - Check if an existing component can be extended
   - Identify components that need to be created new

3. **Document Reuse Opportunities**: Create a component reuse plan:
   ```markdown
   ## Component Reuse Plan
   
   ### Existing Components to Use:
   - [Component Name] from `components/common/[file].tsx`
     - Usage: [How it will be used]
     - Props needed: [List required props]
   
   ### Components to Extend:
   - [Component Name] - needs [variant/feature] added
   
   ### New Components to Create:
   - [Component Name] - [Description and purpose]
   ```

4. **Verify Component Locations**: Confirm file paths for existing components
   ```
   Check: packages/mobile/src/components/common/
   Check: packages/mobile/src/components/[feature]/
   ```

5. **Review Component Props**: For reusable components, document required props:
   - Existing prop interfaces
   - New props that may be needed
   - Style override capabilities

**Output:**
- Component reuse plan document
- List of existing components to use with file paths
- List of components requiring extension/modification
- List of new components to create
- Component library documentation status (exists/needs creation)

**Validation:**
- [ ] **Library Checked**: Component library documentation reviewed
- [ ] **Matches Identified**: All possible component reuses identified
- [ ] **Extensions Documented**: Components needing modification clearly listed
- [ ] **New Components Listed**: All new components identified with justification
- [ ] **File Paths Verified**: All existing component locations confirmed
- [ ] **Props Documented**: Required props for reusable components listed

---

### 3. Component Library Documentation Update

**Purpose:**
Ensure the component library documentation is current and comprehensive before implementation, creating it if it doesn't exist.

**Input:**
- Component library documentation status from Step 2
- Existing components in codebase
- Component reuse plan from Step 2

**Actions:**

1. **Check Documentation Existence**: Verify if `docs/frontend/component-library.md` exists

2. **Create or Update Documentation**: If file doesn't exist, create it; otherwise update it
   ```markdown
   # 524 Mobile Component Library
   
   ## Overview
   This document catalogs all reusable components in the 524 React Native mobile application.
   
   ## Common Components
   Location: `packages/mobile/src/components/common/`
   
   ### Button
   **File**: `Button.tsx`
   **Purpose**: Primary interactive button component
   **Variants**: primary, secondary, outline, ghost
   **Props**:
   - `onPress: () => void` - Press handler
   - `children: React.ReactNode` - Button content
   - `variant?: 'primary' | 'secondary' | 'outline' | 'ghost'` - Visual variant
   - `size?: 'small' | 'medium' | 'large'` - Size variant
   - `disabled?: boolean` - Disabled state
   - `loading?: boolean` - Loading state
   - `style?: StyleProp<ViewStyle>` - Style override
   
   **Usage Example**:
   ```tsx
   <Button variant="primary" onPress={handleSubmit}>
     Submit
   </Button>
   ```
   
   [Continue for each component...]
   ```

3. **Scan Existing Components**: If creating new documentation, scan the codebase:
   ```
   Read directory: packages/mobile/src/components/common/
   Read directory: packages/mobile/src/components/[each-feature]/
   For each component file, extract:
   - Component name
   - File location
   - Props interface
   - Purpose/description
   - Variants (if applicable)
   ```

4. **Document Component Categories**: Organize by category:
   - **Common Components**: Reusable UI primitives
   - **Feature Components**: Domain-specific components
   - **Layout Components**: Screen structure components
   - **Form Components**: Input and form-related components

5. **Include Usage Guidelines**: For each component, add:
   - When to use this component
   - Available variants and their purposes
   - Styling customization options
   - Accessibility considerations
   - Common patterns and examples

**Output:**
- Created or updated `docs/frontend/component-library.md`
- Comprehensive catalog of all existing components
- Component categorization and organization
- Usage examples and guidelines for each component
- Documentation ready for reference in implementation

**Validation:**
- [ ] **Documentation Exists**: `component-library.md` file created or updated
- [ ] **All Components Cataloged**: Every existing component is documented
- [ ] **Props Documented**: All component props interfaces included
- [ ] **Examples Provided**: Usage examples included for each component
- [ ] **Categories Clear**: Components organized by logical categories
- [ ] **Guidelines Included**: When-to-use guidance provided

---

### 4. Design Token Verification and Extension

**Purpose:**
Ensure all design values from Figma are mapped to design tokens, creating new tokens only when necessary to maintain consistency.

**Input:**
- Design specifications from Step 1
- Design token mappings from Step 1
- Existing design token files in `packages/mobile/src/theme/`

**Actions:**

1. **Review Existing Design Tokens**: Read all theme files
   ```
   Read: packages/mobile/src/theme/colors.ts
   Read: packages/mobile/src/theme/spacing.ts
   Read: packages/mobile/src/theme/typography.ts
   Read: packages/mobile/src/theme/borderRadius.ts
   Read: packages/mobile/src/theme/shadows.ts
   ```

2. **Map Figma Values to Tokens**: For each design value:
   - **Colors**: Match hex values to existing color tokens
   - **Spacing**: Match px values to spacing scale
   - **Typography**: Match font sizes, weights, line heights
   - **Border Radius**: Match radius values
   - **Shadows**: Match shadow specifications

3. **Identify Missing Tokens**: Document any Figma values without token matches:
   ```markdown
   ## Missing Design Tokens
   
   ### Colors:
   - #[hex] - Used for [purpose] - Suggest adding as `colors.[name]`
   
   ### Spacing:
   - [value]px - Used for [purpose] - Suggest adding as `spacing.[name]`
   ```

4. **Propose New Tokens**: For missing values, propose additions:
   - Justify why a new token is needed
   - Suggest appropriate token name
   - Verify it doesn't duplicate existing tokens
   - Consider if existing token can be used instead

5. **Update Theme Files**: If new tokens are approved, add them:
   ```typescript
   // packages/mobile/src/theme/colors.ts
   export const colors = {
     // ... existing colors
     newColor: '#hex', // Purpose: [description]
   };
   ```

**Output:**
- Complete design token mapping document
- List of all Figma values mapped to existing tokens
- Proposed new tokens (if any) with justification
- Updated theme files (if new tokens added)
- Token usage guide for implementation

**Validation:**
- [ ] **All Tokens Reviewed**: All existing design token files examined
- [ ] **Values Mapped**: All Figma design values mapped to tokens
- [ ] **Missing Tokens Identified**: Any gaps in token coverage documented
- [ ] **Proposals Justified**: New token proposals include clear justification
- [ ] **No Duplication**: Verified new tokens don't duplicate existing ones
- [ ] **Theme Files Updated**: New tokens added to appropriate theme files (if applicable)

---

### 5. Implementation Planning

**Purpose:**
Create a detailed implementation plan that breaks down the work into manageable tasks and ensures all standards are followed.

**Input:**
- Component reuse plan from Step 2
- Design token mappings from Step 4
- Design specifications from Step 1
- Component library documentation from Step 3

**Actions:**

1. **Define Implementation Order**: Determine the sequence of development:
   ```markdown
   ## Implementation Order
   
   1. Create/update design tokens (if needed)
   2. Implement new common components (bottom-up)
   3. Implement feature-specific components
   4. Implement screen layout and composition
   5. Add interactive behaviors and state management
   6. Implement data fetching (if needed)
   7. Add accessibility labels
   8. Write tests
   ```

2. **Break Down Component Tasks**: For each new component:
   ```markdown
   ### [Component Name]
   
   **File**: `packages/mobile/src/components/[location]/[ComponentName].tsx`
   
   **Tasks**:
   - [ ] Create component file with TypeScript interface
   - [ ] Implement component structure following template
   - [ ] Apply design tokens for styling
   - [ ] Add interactive states (pressed, disabled, loading)
   - [ ] Add accessibility labels and roles
   - [ ] Create test file
   - [ ] Write unit tests
   - [ ] Update component library documentation
   
   **Dependencies**: [List components this depends on]
   **Used By**: [List components that will use this]
   ```

3. **Plan Screen Structure**: Define the screen component hierarchy:
   ```markdown
   ## Screen Structure: [ScreenName]
   
   File: `packages/mobile/src/screens/[ScreenName].tsx`
   
   Components:
   - SafeAreaView (wrapper)
     - Header
       - BackButton (existing: common/BackButton)
       - Title (Text)
     - ScrollView/FlatList
       - [Component1] (new)
       - [Component2] (existing: common/Card)
       - [Component3] (new)
     - Footer
       - [ActionButton] (existing: common/Button)
   ```

4. **Identify State Management Needs**: Determine state requirements:
   - Local state (useState)
   - Global state (Zustand)
   - Server state (React Query)
   - Form state (if applicable)

5. **Plan Data Flow**: Document data requirements:
   - API endpoints needed (reference Technical Spec)
   - Query hooks to create/use
   - Data transformations required
   - Loading and error states

6. **Reference Standards Documents**: Link to relevant sections:
   ```markdown
   ## Standards References
   
   - Component Architecture: [Frontend Standards](../../docs/frontend/frontend-standards.md#component-architecture)
   - Styling: [Frontend Standards](../../docs/frontend/frontend-standards.md#styling-standards)
   - TypeScript: [Frontend Standards](../../docs/frontend/frontend-standards.md#typescript-best-practices)
   - Testing: [Frontend Standards](../../docs/frontend/frontend-standards.md#testing-standards)
   - Templates: [Quick Reference](../../docs/frontend/frontend-quick-reference.md)
   ```

**Output:**
- Detailed implementation plan document
- Component task breakdown with dependencies
- Screen structure diagram
- State management plan
- Data flow documentation
- Standards reference checklist
- Estimated implementation order and timeline

**Validation:**
- [ ] **Order Defined**: Clear implementation sequence established
- [ ] **Tasks Broken Down**: Each component has detailed task list
- [ ] **Dependencies Mapped**: Component dependencies clearly identified
- [ ] **Structure Planned**: Screen component hierarchy documented
- [ ] **State Planned**: State management approach defined
- [ ] **Data Flow Documented**: API and data requirements identified
- [ ] **Standards Referenced**: All relevant standards sections linked

---

### 6. Component and Screen Implementation

**Purpose:**
Implement the React Native components and screen following the plan, standards, and design specifications to create production-ready code.

**Input:**
- Implementation plan from Step 5
- Design specifications from Step 1
- Design token mappings from Step 4
- Component library documentation from Step 3
- Frontend standards documents

**Actions:**

1. **Set Up Component Files**: For each new component:
   ```bash
   # Create component file
   touch packages/mobile/src/components/[location]/[ComponentName].tsx
   
   # Create test file
   touch packages/mobile/src/components/[location]/[ComponentName].test.tsx
   ```

2. **Implement Components Using Templates**: Follow the component template:
   ```typescript
   // Use template from Quick Reference
   // Reference: docs/frontend/frontend-quick-reference.md#component-template
   
   import React from 'react';
   import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
   import { colors, spacing, typography, borderRadius } from '../../theme';
   
   interface MyComponentProps {
     // Required props first
     title: string;
     onPress: () => void;
     
     // Optional props
     description?: string;
     variant?: 'primary' | 'secondary';
     
     // Style overrides
     style?: StyleProp<ViewStyle>;
     
     // Accessibility
     accessibilityLabel?: string;
   }
   
   export function MyComponent({
     title,
     onPress,
     description,
     variant = 'primary',
     style,
     accessibilityLabel,
   }: MyComponentProps) {
     return (
       <View style={[styles.container, style]}>
         {/* Implementation */}
       </View>
     );
   }
   
   const styles = StyleSheet.create({
     container: {
       backgroundColor: colors.surface,
       padding: spacing.md,
       borderRadius: borderRadius.lg,
       gap: spacing.sm,
     },
     // ... more styles using design tokens
   });
   ```

3. **Apply Design Tokens Consistently**: Ensure all styling uses tokens:
   - Colors from `colors.ts`
   - Spacing from `spacing.ts`
   - Typography from `typography.ts`
   - Border radius from `borderRadius.ts`
   - Shadows from `shadows.ts`

4. **Implement Interactive States**: Add all required states:
   ```typescript
   const [isPressed, setIsPressed] = useState(false);
   
   <TouchableOpacity
     onPressIn={() => setIsPressed(true)}
     onPressOut={() => setIsPressed(false)}
     style={[styles.button, isPressed && styles.buttonPressed]}
   >
     {/* Content */}
   </TouchableOpacity>
   ```

5. **Add Accessibility Labels**: For all interactive elements:
   ```typescript
   <TouchableOpacity
     accessibilityRole="button"
     accessibilityLabel="예약 확인"
     accessibilityHint="예약 상세 정보를 확인합니다"
     onPress={handlePress}
   >
     {/* Content */}
   </TouchableOpacity>
   ```

6. **Implement Screen Component**: Create the screen file:
   ```typescript
   // Use screen template from Quick Reference
   // Reference: docs/frontend/frontend-quick-reference.md#screen-template
   
   import { useNavigation } from '@react-navigation/native';
   import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
   import React from 'react';
   import { StyleSheet, View } from 'react-native';
   import { SafeAreaView } from 'react-native-safe-area-context';
   
   import { LoadingSpinner } from '../components/common/LoadingSpinner';
   import { ErrorMessage } from '../components/common/ErrorMessage';
   import type { RootStackParamList } from '../navigation/AppNavigator';
   import { useMyData } from '../query/myData';
   import { colors, spacing } from '../theme';
   
   type MyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyScreen'>;
   
   export function MyScreen() {
     const navigation = useNavigation<MyScreenNavigationProp>();
     const { data, isLoading, error, refetch } = useMyData();
   
     if (isLoading) {
       return <LoadingSpinner fullScreen />;
     }
   
     if (error) {
       return <ErrorMessage message="데이터를 불러올 수 없습니다" onRetry={refetch} fullScreen />;
     }
   
     return (
       <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
         <View style={styles.content}>
           {/* Screen content using components */}
         </View>
       </SafeAreaView>
     );
   }
   
   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: colors.background,
     },
     content: {
       flex: 1,
       padding: spacing.md,
     },
   });
   ```

7. **Add Data Fetching**: If needed, create React Query hooks:
   ```typescript
   // Use React Query template from Quick Reference
   // Reference: docs/frontend/frontend-quick-reference.md#react-query-hook-template
   ```

8. **Implement State Management**: Add Zustand stores if needed:
   ```typescript
   // Use Zustand template from Quick Reference
   // Reference: docs/frontend/frontend-quick-reference.md#zustand-store-template
   ```

9. **Write Tests**: Create tests for components and screens:
   ```typescript
   // Use testing template from Quick Reference
   // Reference: docs/frontend/frontend-quick-reference.md#testing-quick-reference
   ```

10. **Run Quality Checks**: Validate implementation:
    ```bash
    # Type checking
    cd packages/mobile && npm run typecheck
    
    # Linting
    npm run lint
    
    # Tests
    npm run test
    ```

**Output:**
- Implemented component files with TypeScript interfaces
- Implemented screen file with proper navigation types
- Test files for all new components and screens
- All styling using design tokens
- All interactive states implemented
- All accessibility labels added
- Data fetching hooks (if needed)
- State management stores (if needed)
- Passing type checks, lints, and tests

**Validation:**
- [ ] **Files Created**: All component and screen files created
- [ ] **Templates Followed**: Code follows standard templates
- [ ] **Design Tokens Used**: All styling uses design tokens, no hardcoded values
- [ ] **TypeScript Strict**: All types properly defined, no `any` types
- [ ] **Interactive States**: Pressed, disabled, loading states implemented
- [ ] **Accessibility Added**: All interactive elements have labels and roles
- [ ] **Tests Written**: Unit tests created for all components
- [ ] **Tests Pass**: All tests passing
- [ ] **Type Check Pass**: TypeScript compilation successful
- [ ] **Lint Pass**: No linting errors
- [ ] **Standards Compliance**: Code follows all frontend standards

---

### 7. Visual Validation Against Figma

**Purpose:**
Verify that the implemented screen matches the Figma design exactly by comparing the running application with the original design.

**Input:**
- Implemented screen and components from Step 6
- Reference screenshot from Step 1
- Original Figma design context from Step 1
- Figma URL for direct comparison

**Actions:**

1. **Run the Application**: Start the development server and navigate to the screen
   ```bash
   cd packages/mobile
   npm start
   # Open on iOS simulator or Android emulator
   ```

2. **Take Implementation Screenshot**: Capture the implemented screen
   - Navigate to the implemented screen in the app
   - Take screenshot at same viewport size as Figma design
   - Save screenshot for comparison

3. **Side-by-Side Comparison**: Compare implementation with Figma design:
   ```markdown
   ## Visual Comparison Checklist
   
   ### Layout & Structure:
   - [ ] Overall screen layout matches Figma
   - [ ] Component positioning matches exactly
   - [ ] Spacing between elements matches design
   - [ ] Component hierarchy matches Figma structure
   
   ### Visual Design:
   - [ ] Colors match Figma specifications exactly
   - [ ] Typography (sizes, weights, line heights) matches
   - [ ] Border radius values match design
   - [ ] Shadows match Figma specifications
   - [ ] Icons match design (size, color, style)
   
   ### Responsive Behavior:
   - [ ] Layout works on small screens (iPhone SE - 375px)
   - [ ] Layout works on large screens (iPhone Pro Max - 428px)
   - [ ] Text wrapping behaves correctly
   - [ ] Images scale appropriately
   
   ### Interactive States:
   - [ ] Pressed states match design
   - [ ] Disabled states match design
   - [ ] Loading states implemented correctly
   - [ ] Error states match design (if applicable)
   
   ### Platform Consistency:
   - [ ] Looks correct on iOS
   - [ ] Looks correct on Android
   - [ ] Platform-specific adjustments applied correctly
   ```

4. **Measure Pixel Accuracy**: Use Figma inspect to verify measurements:
   - Open Figma design in inspect mode
   - Compare padding values
   - Compare margin/gap values
   - Compare font sizes
   - Compare border radius values
   - Verify color hex values

5. **Test Interactive Elements**: Verify all interactions work:
   - Tap all buttons and interactive elements
   - Verify navigation works correctly
   - Test form inputs (if applicable)
   - Verify scroll behavior
   - Test any animations or transitions

6. **Document Discrepancies**: If any differences found:
   ```markdown
   ## Design Discrepancies Found
   
   ### Issue 1: [Description]
   - **Location**: [Component/Screen area]
   - **Expected** (Figma): [Description with values]
   - **Actual** (Implementation): [Description with values]
   - **Fix Required**: [What needs to be changed]
   
   ### Issue 2: [Description]
   ...
   ```

7. **Fix Discrepancies**: If issues found, make corrections:
   - Update component styling
   - Adjust design token usage
   - Fix layout issues
   - Correct color/typography mismatches
   - Re-test after fixes

8. **Final Validation**: Confirm perfect match:
   - Take new screenshot after fixes
   - Compare again with Figma
   - Verify all discrepancies resolved
   - Get confirmation that implementation matches design exactly

**Output:**
- Implementation screenshot
- Visual comparison checklist (all items checked)
- Discrepancy report (if any issues found)
- Fixed implementation (if corrections needed)
- Final confirmation that implementation matches Figma exactly
- Documentation of any intentional deviations with justification

**Validation:**
- [ ] **Application Running**: Development server started and screen accessible
- [ ] **Screenshots Taken**: Both Figma and implementation screenshots captured
- [ ] **Comparison Complete**: All checklist items reviewed
- [ ] **Measurements Verified**: Pixel-perfect accuracy confirmed
- [ ] **Interactions Tested**: All interactive elements working correctly
- [ ] **Discrepancies Documented**: Any differences clearly documented
- [ ] **Fixes Applied**: All discrepancies corrected
- [ ] **Final Match Confirmed**: Implementation matches Figma design exactly
- [ ] **Platform Testing**: Verified on both iOS and Android

**CRITICAL**: Do not proceed to Step 8 until implementation matches Figma design exactly. All discrepancies must be resolved.

---

### 8. Component Library Documentation Update

**Purpose:**
Update the component library documentation with all newly created components to maintain an accurate catalog for future development.

**Input:**
- Validated implementation from Step 7
- List of new components created in Step 6
- Existing component library documentation from Step 3

**Actions:**

1. **Document New Components**: For each new component created, add to `docs/frontend/component-library.md`:
   ```markdown
   ### [ComponentName]
   **File**: `packages/mobile/src/components/[location]/[ComponentName].tsx`
   **Purpose**: [Clear description of component purpose]
   **Created**: [Date] - [Screen/Feature it was created for]
   
   **Props**:
   - `propName: PropType` - [Description]
   - `optionalProp?: PropType` - [Description]
   - `style?: StyleProp<ViewStyle>` - Style override
   
   **Variants** (if applicable):
   - `variant="primary"` - [Description]
   - `variant="secondary"` - [Description]
   
   **Usage Example**:
   ```tsx
   <ComponentName
     propName="value"
     optionalProp="value"
     onPress={handlePress}
   >
     Content
   </ComponentName>
   ```
   
   **Design Reference**: [Figma URL]
   
   **Notes**:
   - [Any special considerations]
   - [When to use vs similar components]
   - [Accessibility features]
   ```

2. **Update Component Categories**: Ensure proper categorization:
   - Add to appropriate category (Common, Feature, Layout, Form)
   - Create new category if needed
   - Maintain alphabetical order within categories

3. **Cross-Reference Related Components**: Link to similar components:
   ```markdown
   **Related Components**:
   - [SimilarComponent] - Use when [scenario]
   - [AlternativeComponent] - Alternative for [use case]
   ```

4. **Add Usage Guidelines**: Document when to use each component:
   ```markdown
   **When to Use**:
   - [Scenario 1]
   - [Scenario 2]
   
   **When NOT to Use**:
   - [Scenario where different component is better]
   ```

5. **Document Component Composition**: If component uses other components:
   ```markdown
   **Composed Of**:
   - [ChildComponent1] from `components/common/`
   - [ChildComponent2] from `components/common/`
   ```

6. **Update Screen Documentation**: Add new screen to documentation:
   ```markdown
   ## Screens
   
   ### [ScreenName]
   **File**: `packages/mobile/src/screens/[ScreenName].tsx`
   **Purpose**: [Screen purpose and user flow]
   **Route**: `[RouteName]` in navigation
   **Created**: [Date]
   
   **Components Used**:
   - [Component1] - [Purpose in screen]
   - [Component2] - [Purpose in screen]
   
   **Data Requirements**:
   - API: [Endpoint used]
   - Query: [Query hook name]
   
   **Design Reference**: [Figma URL]
   ```

7. **Add Implementation Notes**: Document any special patterns:
   ```markdown
   **Implementation Notes**:
   - [Special pattern or technique used]
   - [Performance optimization applied]
   - [Platform-specific consideration]
   ```

**Output:**
- Updated `docs/frontend/component-library.md` with all new components
- Proper categorization and organization maintained
- Usage examples and guidelines for each new component
- Cross-references to related components
- Screen documentation updated
- Implementation notes captured

**Validation:**
- [ ] **All Components Documented**: Every new component added to documentation
- [ ] **Props Complete**: All prop interfaces documented with descriptions
- [ ] **Examples Provided**: Usage examples included for each component
- [ ] **Categories Updated**: Components properly categorized
- [ ] **Cross-References Added**: Related components linked
- [ ] **Guidelines Included**: When-to-use guidance provided
- [ ] **Screen Documented**: New screen added to documentation
- [ ] **Figma Links**: Design references included
- [ ] **Notes Captured**: Special considerations documented

---

### 9. Quality Assurance and Testing

**Purpose:**
Perform comprehensive quality assurance to ensure the implementation meets all standards, works correctly, and is production-ready.

**Input:**
- Completed implementation from Step 6
- Visual validation from Step 7
- Updated documentation from Step 8
- Component checklist from frontend standards

**Actions:**

1. **Run Component Checklist**: Validate against [Component Checklist](../../docs/frontend/component-checklist.md):
   ```markdown
   Go through complete checklist for each new component:
   - [ ] Pre-development planning completed
   - [ ] Component structure follows standards
   - [ ] Styling uses design tokens
   - [ ] TypeScript types are strict
   - [ ] Performance optimized
   - [ ] Accessibility complete
   - [ ] Tests written and passing
   - [ ] Platform testing done
   - [ ] i18n implemented
   - [ ] Code quality verified
   ```

2. **Verify Frontend Standards Compliance**: Check against [Frontend Standards](../../docs/frontend/frontend-standards.md):
   - Component architecture patterns followed
   - Styling standards met
   - TypeScript best practices applied
   - State management correct
   - Performance optimized
   - Accessibility guidelines followed
   - Testing standards met

3. **Run Automated Tests**: Execute all test suites:
   ```bash
   # Unit tests
   cd packages/mobile
   npm run test
   
   # Type checking
   npm run typecheck
   
   # Linting
   npm run lint
   
   # Format checking
   npm run format:check
   ```

4. **Manual Testing**: Test on actual devices:
   ```markdown
   ## Manual Testing Checklist
   
   ### iOS Testing:
   - [ ] Tested on iOS simulator
   - [ ] Tested on physical iPhone (if available)
   - [ ] Safe area insets working correctly
   - [ ] Navigation working
   - [ ] All interactions functional
   
   ### Android Testing:
   - [ ] Tested on Android emulator
   - [ ] Tested on physical Android device (if available)
   - [ ] Back button behavior correct
   - [ ] Navigation working
   - [ ] All interactions functional
   
   ### Accessibility Testing:
   - [ ] VoiceOver tested (iOS)
   - [ ] TalkBack tested (Android)
   - [ ] All elements accessible
   - [ ] Labels are descriptive
   - [ ] Focus order is logical
   
   ### Performance Testing:
   - [ ] Screen loads quickly
   - [ ] Animations smooth (60fps)
   - [ ] No memory leaks
   - [ ] Scroll performance good
   ```

5. **Code Review Preparation**: Prepare for code review:
   ```markdown
   ## Code Review Checklist
   
   - [ ] All files follow naming conventions
   - [ ] Code is well-commented where needed
   - [ ] No console.log statements
   - [ ] No commented-out code
   - [ ] No unused imports
   - [ ] Git commit messages are clear
   - [ ] PR description is comprehensive
   ```

6. **Documentation Review**: Verify all documentation is complete:
   - Component library documentation updated
   - Implementation notes captured
   - Any decisions documented
   - README updates (if needed)

7. **Final Validation**: Complete final checks:
   ```markdown
   ## Final Validation
   
   - [ ] Implementation matches Figma exactly
   - [ ] All tests passing
   - [ ] No linting errors
   - [ ] No TypeScript errors
   - [ ] Component library documentation updated
   - [ ] All standards followed
   - [ ] Ready for code review
   - [ ] Ready for production
   ```

**Output:**
- Completed component checklist for all components
- All automated tests passing
- Manual testing completed on iOS and Android
- Accessibility testing completed
- Code review checklist completed
- Documentation verified complete
- Final validation checklist completed
- Implementation ready for code review and production

**Validation:**
- [ ] **Component Checklist Complete**: All checklist items verified
- [ ] **Standards Compliance**: All frontend standards followed
- [ ] **Tests Passing**: All automated tests successful
- [ ] **Manual Testing Done**: Tested on both platforms
- [ ] **Accessibility Verified**: Screen reader testing completed
- [ ] **Performance Good**: No performance issues identified
- [ ] **Code Review Ready**: All preparation completed
- [ ] **Documentation Complete**: All docs updated and verified
- [ ] **Production Ready**: Implementation meets all quality standards

---

## Quality Assurance

**MANDATORY FORMAT VALIDATION:**
- [ ] **Frontend Standards**: Implementation follows [Frontend Standards](../../docs/frontend/frontend-standards.md)
- [ ] **Component Checklist**: All items in [Component Checklist](../../docs/frontend/component-checklist.md) completed
- [ ] **Figma Match**: Implementation matches Figma design exactly (verified in Step 7)
- [ ] **Design Tokens**: All styling uses design tokens, no hardcoded values
- [ ] **TypeScript Strict**: No `any` types, all interfaces properly defined
- [ ] **Accessibility**: All interactive elements have labels and roles
- [ ] **Tests**: All components have tests and tests are passing

**Implementation Quality:**
- [ ] Component reuse maximized (checked in Step 2)
- [ ] New components justified and documented
- [ ] Code follows templates from Quick Reference
- [ ] State management appropriate for use case
- [ ] Data fetching implemented correctly (if needed)
- [ ] Error handling comprehensive
- [ ] Loading states implemented

**Visual Quality:**
- [ ] Pixel-perfect match with Figma design
- [ ] Colors match exactly
- [ ] Typography matches exactly
- [ ] Spacing matches exactly
- [ ] Interactive states match design
- [ ] Responsive on all screen sizes
- [ ] Works correctly on iOS and Android

**Documentation Quality:**
- [ ] Component library documentation updated
- [ ] All new components documented with examples
- [ ] Usage guidelines provided
- [ ] Design references included
- [ ] Implementation notes captured

**CRITICAL**: If ANY validation check fails, the implementation MUST be corrected before considering the workflow complete.

---

## Success Criteria

**Implementation Complete:**
- All components and screen implemented following standards
- Implementation matches Figma design exactly (no discrepancies)
- All automated tests passing
- Manual testing completed on both platforms
- Accessibility testing completed

**Documentation Complete:**
- Component library documentation updated with all new components
- Usage examples and guidelines provided
- Design references linked
- Implementation notes captured

**Quality Standards Met:**
- All frontend standards followed
- Component checklist completed for all components
- No linting or TypeScript errors
- Performance is good (60fps animations, fast loads)
- Accessibility guidelines met

**Production Ready:**
- Code review checklist completed
- Ready for PR submission
- Ready for QA testing
- Ready for production deployment

---

## Related Workflows

- [Create Epic](./create-epic.md) - For planning features that require Figma implementation
- [Create Story](./create-story.md) - For breaking down Figma screens into user stories
- [Local Agent Story Execution](./improved-local-agent-story-execution.md) - For executing implementation stories

---

## Format Enforcement Instructions for AI

When using this workflow, AI systems MUST:

1. **Reference All Standards**: Always include these exact statements in prompts:
   ```markdown
   **Frontend Standards**: Follow the comprehensive guide defined in [Frontend Standards](../../docs/frontend/frontend-standards.md)
   **Quick Reference**: Use templates and patterns from [Frontend Quick Reference](../../docs/frontend/frontend-quick-reference.md)
   **Figma Implementation**: Follow the step-by-step process in [Figma Implementation Guide](../../docs/frontend/figma-implementation-guide.md)
   **Quality Assurance**: Validate against [Component Checklist](../../docs/frontend/component-checklist.md)
   ```

2. **Use Figma MCP Server**: Always fetch designs using the Figma MCP tools:
   - `mcp_figma_get_design_context` for code and metadata
   - `mcp_figma_get_screenshot` for visual reference

3. **Check Component Library**: Always check `docs/frontend/component-library.md` before creating new components

4. **Maintain Documentation**: Always update component library documentation with new components

5. **Validate Visually**: Never complete without visual validation in Step 7 - implementation MUST match Figma exactly

6. **Follow Templates**: Always use templates from Quick Reference for consistency

7. **Use Design Tokens**: Never hardcode colors, spacing, typography - always use design tokens

8. **Complete Checklist**: Run through complete Component Checklist before considering work done

**FAILURE TO COMPLY**: Implementations that do not follow these standards are invalid and will require correction.

---

## Notes

### Figma MCP Server Usage

The Figma MCP server provides these key tools:
- `mcp_figma_get_design_context` - Gets code and metadata for a node
- `mcp_figma_get_screenshot` - Gets visual screenshot for comparison
- `mcp_figma_get_metadata` - Gets structure overview in XML format

Extract `fileKey` and `nodeId` from Figma URLs:
- URL format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
- `fileKey` is the segment after `/design/`
- `nodeId` is the value after `node-id=` (convert `-` to `:`, e.g., `1-2` → `1:2`)

### Component Library Maintenance

The component library documentation (`docs/frontend/component-library.md`) is critical for:
- Preventing duplicate components
- Maximizing code reuse
- Maintaining consistency
- Onboarding new developers
- Planning future implementations

Keep it updated with every implementation.

### Visual Validation Importance

Step 7 (Visual Validation) is CRITICAL. Do not skip or rush this step. The implementation must match Figma exactly:
- Colors must match hex values
- Spacing must match pixel values
- Typography must match size/weight/line-height
- Interactive states must match design
- Layout must be pixel-perfect

Take the time to get it right - fixing visual issues later is more expensive than getting it right the first time.

### Platform Considerations

Always test on both iOS and Android:
- Shadows render differently (use elevation for Android)
- Safe areas work differently
- Font rendering differs
- Touch targets may need platform-specific adjustments

### Performance Considerations

- Use `memo` for components that render frequently
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive calculations
- Use `FlatList` for long lists, never `ScrollView`
- Optimize images before adding to project

### Accessibility Priority

Accessibility is not optional:
- Every interactive element needs `accessibilityRole`
- Every interactive element needs `accessibilityLabel`
- Complex interactions need `accessibilityHint`
- Test with VoiceOver (iOS) and TalkBack (Android)
- Ensure focus order is logical

