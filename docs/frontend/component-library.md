# 524 Mobile Component Library

## Overview
This document catalogs all reusable components in the 524 React Native mobile application. Components are organized by category and include usage examples, props documentation, and design references.

**Last Updated**: December 25, 2025

---

## Common Components
Location: `packages/mobile/src/components/common/`

### Carousel
**File**: `Carousel.tsx`
**Purpose**: Image carousel component for displaying multiple images
**Usage**: Product galleries, artist portfolios

### NotificationBanner
**File**: `NotificationBanner.tsx`
**Purpose**: Display notification messages to users
**Usage**: System notifications, alerts, updates

---

## Booking Components
Location: `packages/mobile/src/components/booking/`

### ArtistCard
**File**: `ArtistCard.tsx`
**Purpose**: Display artist information in a card format
**Usage**: Artist list screens, search results

### BookingLayout
**File**: `BookingLayout.tsx`
**Purpose**: Standard layout wrapper for booking flow screens
**Props**:
- `title: string` - Screen title
- `progress: number` - Progress indicator (0-1)
- `showBackButton?: boolean` - Show back button
- `onBackPress?: () => void` - Back button handler
- `footer?: React.ReactNode` - Footer content (usually ContinueButton)
- `children: React.ReactNode` - Screen content
- `testID?: string` - Test identifier

**Usage Example**:
```tsx
<BookingLayout
  title="어디서 서비스를 받으실 건가요?"
  progress={0.1}
  showBackButton={true}
  onBackPress={handleBack}
  footer={<ContinueButton onPress={handleContinue} />}
>
  {/* Screen content */}
</BookingLayout>
```

### CalendarPicker
**File**: `CalendarPicker.tsx`
**Purpose**: Date selection component
**Usage**: Schedule selection screens

### CategoryChips
**File**: `CategoryChips.tsx`
**Purpose**: Horizontal scrollable category chips
**Usage**: Service category selection, filters

### ContinueButton
**File**: `ContinueButton.tsx`
**Purpose**: Primary action button for booking flow
**Props**:
- `label: string` - Button text
- `onPress: () => void` - Press handler
- `disabled?: boolean` - Disabled state

**Usage Example**:
```tsx
<ContinueButton
  label="계속"
  onPress={handleContinue}
  disabled={!isValid}
/>
```

### OptionCard
**File**: `OptionCard.tsx`
**Purpose**: Selectable card for options in booking flow
**Usage**: Service selection, booking method selection

### SortModal
**File**: `SortModal.tsx`
**Purpose**: Bottom sheet modal for sorting options
**Usage**: Artist list sorting

### StyleCard
**File**: `StyleCard.tsx`
**Purpose**: Display style reference images
**Usage**: Style selection screens

### TimeSlotGrid
**File**: `TimeSlotGrid.tsx`
**Purpose**: Grid of selectable time slots
**Usage**: Schedule selection screens

### TreatmentOption
**File**: `TreatmentOption.tsx`
**Purpose**: Display and select treatment options
**Usage**: Treatment selection screens

---

## Bookings Components
Location: `packages/mobile/src/components/bookings/`

### BookingCard
**File**: `BookingCard.tsx`
**Purpose**: Display booking information in a card format
**Usage**: Booking list screens, booking history

### BookingStatusBadge
**File**: `BookingStatusBadge.tsx`
**Purpose**: Display booking status with color coding
**Usage**: Booking cards, booking details

### BookingStatusHistory
**File**: `BookingStatusHistory.tsx`
**Purpose**: Display booking status timeline
**Usage**: Booking detail screens

---

## Messaging Components
Location: `packages/mobile/src/components/messaging/`

### ConversationListItem
**File**: `ConversationListItem.tsx`
**Purpose**: Display conversation preview in list
**Usage**: Messaging inbox screen

---

## Onboarding Components
Location: `packages/mobile/src/components/onboarding/`

### MultiSelectButtons
**File**: `MultiSelectButtons.tsx`
**Purpose**: Multiple selection button group
**Usage**: Onboarding preference selection

### OnboardingLayout
**File**: `OnboardingLayout.tsx`
**Purpose**: Standard layout for onboarding screens
**Usage**: All onboarding flow screens

### SelectableCard
**File**: `SelectableCard.tsx`
**Purpose**: Card with selection state
**Usage**: Onboarding option selection

---

## Review Components
Location: `packages/mobile/src/components/reviews/`

### ReviewCard
**File**: `ReviewCard.tsx`
**Purpose**: Display review information
**Usage**: Review lists, artist profiles

### ReviewDisplay
**File**: `ReviewDisplay.tsx`
**Purpose**: Display review content and ratings
**Usage**: Review detail screens

---

## Signup Components
Location: `packages/mobile/src/components/signup/`

### FormField
**File**: `FormField.tsx`
**Purpose**: Form input field with label and validation
**Props**:
- `label: string` - Field label
- `value: string` - Input value
- `onChangeText: (text: string) => void` - Change handler
- `error?: string` - Error message
- `placeholder?: string` - Placeholder text
- Additional TextInput props

**Usage Example**:
```tsx
<FormField
  label="이메일"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  placeholder="email@example.com"
  keyboardType="email-address"
/>
```

### FormRow
**File**: `FormRow.tsx`
**Purpose**: Horizontal layout for form fields
**Usage**: Multi-column form layouts

### SignupForm
**File**: `SignupForm.tsx`
**Purpose**: Complete signup form component
**Usage**: Signup screens

---

## Navigation Components
Location: `packages/mobile/src/components/`

### NavigationMenu
**File**: `NavigationMenu.tsx`
**Purpose**: Bottom navigation menu for customers
**Usage**: Main app navigation

### ArtistNavigationMenu
**File**: `ArtistNavigationMenu.tsx`
**Purpose**: Bottom navigation menu for artists
**Usage**: Artist app navigation

### MenuButton
**File**: `MenuButton.tsx`
**Purpose**: Menu button component
**Usage**: Navigation menus

---

## Utility Components
Location: `packages/mobile/src/components/`

### StarRating
**File**: `StarRating.tsx`
**Purpose**: Display star rating
**Usage**: Reviews, artist ratings

---

## Screens

### ServiceSelectionScreen
**File**: `packages/mobile/src/screens/ServiceSelectionScreen.tsx`
**Purpose**: Service type selection screen for booking flow
**Route**: `ServiceSelection` in main navigation
**Created**: December 2025
**Updated**: December 30, 2025

**Components Used**:
- `SafeAreaView` - Safe area wrapper
- `MenuButton` - Navigation menu trigger
- `NavigationMenu` - Side navigation menu
- `FlatList` - Service options list
- `TouchableOpacity` - Interactive option buttons

**Data Requirements**:
- Store: `bookingStore` - Service type state management

**Design Reference**: [Figma](https://www.figma.com/design/kZJo1yyy6T3lCWd1FTX16D/524--Copy-?node-id=1-100&m=dev)

**Features**:
- Service type selection (헤어 메이크업, 헤어, 메이크업)
- Emphasized first option with 3px border
- Selection state with visual feedback
- Continue button enabled only when service selected
- Navigation to OccasionSelection on continue

**Accessibility**:
- Button roles for all interactive elements
- Descriptive labels in Korean (e.g., "헤어 메이크업 선택")
- Hints for screen reader users
- Clear focus order from top to bottom
- Disabled state properly communicated

**Implementation Notes**:
- **Title**: 20px bold, line-height 22px, centered, positioned 212px from top
- **Options**: 16px regular (first is medium weight), line-height 24px
- **Option height**: 52px (spacing.inputHeight)
- **Border radius**: 10px (borderRadius.md)
- **First option border**: 3px (emphasized)
- **Other options border**: 1px
- **Gap between options**: 16px (spacing.md)
- **Button**: 52px height, pill shape (borderRadius.pill), black background
- **Button text**: 16px bold, letter-spacing -0.408px
- **Colors**: All from design tokens (colors.text, colors.background, colors.borderDark)
- **Selection state**: Black background with white text
- **Disabled state**: 50% opacity

**State Management**:
- Local state for selected service
- Local state for menu visibility
- Global state update on continue (bookingStore)

### LocationInputScreen
**File**: `packages/mobile/src/screens/booking/entry/LocationInputScreen.tsx`
**Purpose**: Location input screen for booking flow
**Route**: Part of booking flow
**Created**: December 2025

**Components Used**:
- `BookingLayout` - Screen wrapper
- `ContinueButton` - Footer action button
- `TextInput` - Address input field
- Custom `LocationIcon` - Current location icon

**Data Requirements**:
- Store: `bookingFlowStore` - Location state management

**Design Reference**: [Figma](https://www.figma.com/design/kZJo1yyy6T3lCWd1FTX16D/524--Copy-?node-id=1-51&m=dev)

**Features**:
- Text input for address entry
- Clear button when text is entered
- Current location button
- Recent addresses section (placeholder)
- Validation for non-empty input

**Accessibility**:
- Search role for input field
- Button roles for interactive elements
- Descriptive labels and hints in Korean
- Clear focus order

**Implementation Notes**:
- Uses all design tokens (no hardcoded values)
- Typography: base (16px) for input, sm (14px) for labels
- Spacing: Consistent use of spacing tokens
- Colors: Accent color for current location, muted for placeholders
- Border radius: md (10px) for input container
- Input height: 52px (spacing.inputHeight)

---

## Design Token Usage Guidelines

### Colors
Always use color tokens from `theme/colors.ts`:
- `colors.background` - Main background
- `colors.surface` - Card/input backgrounds
- `colors.primary` - Primary brand color
- `colors.accent` - Accent/highlight color
- `colors.text` - Primary text
- `colors.textSecondary` - Secondary text
- `colors.muted` - Disabled/placeholder text
- `colors.border` - Border colors

### Spacing
Always use spacing tokens from `theme/spacing.ts`:
- `spacing.xs` (4px) - Minimal spacing
- `spacing.sm` (8px) - Small spacing
- `spacing.md` (16px) - Medium spacing (most common)
- `spacing.lg` (24px) - Large spacing
- `spacing.xl` (32px) - Extra large spacing
- `spacing.xxl` (48px) - Double extra large spacing
- `spacing.inputHeight` (52px) - Standard input height
- `spacing.labelGap` (10px) - Gap between label and input

### Typography
Always use typography tokens from `theme/typography.ts`:
- Sizes: `xs` (12), `sm` (14), `base` (16), `lg` (18), `xl` (24), `title` (28)
- Weights: `regular` (400), `medium` (500), `semibold` (600), `bold` (700)

### Border Radius
Always use border radius tokens from `theme/borderRadius.ts`:
- `borderRadius.sm` (4px)
- `borderRadius.md` (10px)
- `borderRadius.lg` (12px)
- `borderRadius.xl` (24px)
- `borderRadius.pill` (100px)
- `borderRadius.full` (9999px)

---

## Component Development Standards

When creating new components, follow these standards:

1. **Use design tokens** - Never hardcode colors, spacing, or typography
2. **TypeScript strict mode** - All props properly typed
3. **Accessibility** - Add labels, roles, and hints
4. **Memoization** - Use `memo`, `useCallback`, `useMemo` when appropriate
5. **Testing** - Create test file alongside component
6. **Documentation** - Update this file with new components

---

## Related Documentation

- [Frontend Standards](./frontend-standards.md) - Complete development standards
- [Quick Reference](./frontend-quick-reference.md) - Quick reference guide
- [Component Checklist](./component-checklist.md) - Quality checklist
- [Figma Implementation Guide](./figma-implementation-guide.md) - Figma to code workflow

---

**Document Version**: 1.0  
**Last Updated**: December 25, 2025  
**Maintained By**: 524 Development Team

