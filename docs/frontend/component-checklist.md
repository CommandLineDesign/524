# Component Development Checklist - 524

Use this checklist when creating or reviewing React Native components to ensure they meet all quality standards.

---

## 📋 Pre-Development

- [ ] **Reviewed Figma design** (if applicable)
- [ ] **Identified reusable patterns** that can use existing components
- [ ] **Checked for similar existing components** to avoid duplication
- [ ] **Planned component hierarchy** (parent/child relationships)
- [ ] **Identified required design tokens** (colors, spacing, typography)

---

## 🏗️ Component Structure

### File Organization

- [ ] **Component file created** in appropriate directory
  - Common components → `src/components/common/`
  - Feature components → `src/components/[feature]/`
  - Screen components → `src/screens/`

- [ ] **File naming follows convention**
  - PascalCase for components (e.g., `BookingCard.tsx`)
  - camelCase for hooks (e.g., `useBookings.ts`)
  - camelCase for utils (e.g., `formatters.ts`)

- [ ] **Test file created** alongside component
  - Same name with `.test.tsx` extension
  - Example: `BookingCard.test.tsx`

### Component Definition

- [ ] **Component uses function declaration** (not arrow function for exports)
  ```tsx
  // ✅ Good
  export function MyComponent() { }
  
  // ❌ Bad
  export const MyComponent = () => { }
  ```

- [ ] **Props interface defined** with clear TypeScript types
  ```tsx
  interface MyComponentProps {
    // Required props first
    title: string;
    onPress: () => void;
    
    // Optional props
    description?: string;
    
    // Style overrides
    style?: StyleProp<ViewStyle>;
  }
  ```

- [ ] **Props interface exported** if needed by other components

- [ ] **Default props handled** using parameter defaults
  ```tsx
  export function MyComponent({
    variant = 'primary',
    size = 'medium',
  }: MyComponentProps) { }
  ```

---

## 🎨 Styling

### Design Tokens

- [ ] **All colors use design tokens** from `theme/colors.ts`
  ```tsx
  // ✅ Good
  color: colors.text
  
  // ❌ Bad
  color: '#111827'
  ```

- [ ] **All spacing uses design tokens** from `theme/spacing.ts`
  ```tsx
  // ✅ Good
  padding: spacing.md
  
  // ❌ Bad
  padding: 16
  ```

- [ ] **Typography uses design tokens** from `theme/typography.ts`
  ```tsx
  // ✅ Good
  fontSize: typography.sizes.base,
  fontWeight: typography.weights.semibold
  
  // ❌ Bad
  fontSize: 16,
  fontWeight: '600'
  ```

- [ ] **Border radius uses design tokens** from `theme/borderRadius.ts`

- [ ] **Shadows use design tokens** from `theme/shadows.ts` (if applicable)

### StyleSheet

- [ ] **Styles use `StyleSheet.create()`** (not inline styles)
  ```tsx
  const styles = StyleSheet.create({
    container: {
      // styles
    },
  });
  ```

- [ ] **No inline styles** except for dynamic values
  ```tsx
  // ✅ Acceptable for dynamic values
  <View style={[styles.container, { width: dynamicWidth }]} />
  
  // ❌ Bad
  <View style={{ padding: 16, backgroundColor: '#fff' }} />
  ```

- [ ] **Style composition uses arrays**
  ```tsx
  <View style={[styles.base, variant === 'primary' && styles.primary]} />
  ```

- [ ] **Conditional styles are clean**
  ```tsx
  // ✅ Good
  <View style={[
    styles.button,
    disabled && styles.disabled,
    variant === 'primary' && styles.primary,
  ]} />
  
  // ❌ Bad
  <View style={{
    ...styles.button,
    ...(disabled ? styles.disabled : {}),
  }} />
  ```

### Responsive Design

- [ ] **Component works on small screens** (iPhone SE - 375px)

- [ ] **Component works on large screens** (iPhone Pro Max - 428px)

- [ ] **Platform-specific styles handled** (iOS vs Android)
  ```tsx
  ...Platform.select({
    ios: { /* iOS styles */ },
    android: { /* Android styles */ },
  })
  ```

---

## 📝 TypeScript

### Type Safety

- [ ] **No `any` types used**
  ```tsx
  // ❌ Bad
  function process(data: any) { }
  
  // ✅ Good
  function process(data: MyDataType) { }
  ```

- [ ] **All props properly typed**

- [ ] **Event handlers properly typed**
  ```tsx
  const handlePress = (id: string) => void;
  ```

- [ ] **Children prop typed correctly**
  ```tsx
  children?: React.ReactNode
  ```

- [ ] **Style props use `StyleProp<ViewStyle>` or `StyleProp<TextStyle>`**

### Type Exports

- [ ] **Interfaces exported** if used by other components

- [ ] **Type aliases exported** if reusable

---

## ⚡ Performance

### Optimization

- [ ] **Component memoized** if appropriate
  ```tsx
  export const MyComponent = memo(function MyComponent(props) {
    // Component
  });
  ```

- [ ] **Callbacks memoized** with `useCallback`
  ```tsx
  const handlePress = useCallback(() => {
    // Handler
  }, [dependencies]);
  ```

- [ ] **Expensive calculations memoized** with `useMemo`
  ```tsx
  const sortedData = useMemo(() => {
    return data.sort(/* ... */);
  }, [data]);
  ```

- [ ] **FlatList used for long lists** (not ScrollView)

- [ ] **FlatList optimized** with proper props
  ```tsx
  <FlatList
    data={items}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={10}
  />
  ```

- [ ] **Images use FastImage** for caching (if applicable)

### Re-render Prevention

- [ ] **Dependencies arrays correct** in useEffect, useMemo, useCallback

- [ ] **No unnecessary state updates**

- [ ] **Child components don't cause parent re-renders**

---

## ♿ Accessibility

### Labels and Roles

- [ ] **Interactive elements have `accessibilityRole`**
  ```tsx
  <TouchableOpacity accessibilityRole="button">
  ```

- [ ] **All interactive elements have `accessibilityLabel`**
  ```tsx
  accessibilityLabel="예약 확인"
  ```

- [ ] **Complex interactions have `accessibilityHint`**
  ```tsx
  accessibilityHint="예약 상세 정보를 확인합니다"
  ```

- [ ] **Images have `accessibilityLabel`**
  ```tsx
  <Image
    source={{ uri }}
    accessibilityLabel="아티스트 프로필 사진"
  />
  ```

- [ ] **Decorative images marked appropriately**
  ```tsx
  accessible={false}
  ```

### States

- [ ] **Disabled state communicated**
  ```tsx
  accessibilityState={{ disabled: true }}
  ```

- [ ] **Selected state communicated** (if applicable)
  ```tsx
  accessibilityState={{ selected: true }}
  ```

- [ ] **Loading state communicated** (if applicable)
  ```tsx
  accessibilityState={{ busy: true }}
  ```

### Focus Management

- [ ] **Focus order is logical**

- [ ] **Focus visible on interactive elements**

---

## 🔄 State Management

### Local State

- [ ] **useState used for component-specific state**

- [ ] **State updates are immutable**
  ```tsx
  // ✅ Good
  setItems([...items, newItem])
  
  // ❌ Bad
  items.push(newItem)
  setItems(items)
  ```

### Global State

- [ ] **Zustand used for app-wide state** (if needed)

- [ ] **React Query used for server state** (if needed)

- [ ] **No prop drilling** - use appropriate state solution

---

## 🎭 Interactive States

### Visual Feedback

- [ ] **Pressed state implemented** for touchable elements
  ```tsx
  const [isPressed, setIsPressed] = useState(false);
  
  <TouchableOpacity
    onPressIn={() => setIsPressed(true)}
    onPressOut={() => setIsPressed(false)}
    style={[styles.button, isPressed && styles.pressed]}
  />
  ```

- [ ] **Disabled state styled appropriately**
  ```tsx
  disabled && styles.disabled
  ```

- [ ] **Loading state shows spinner** (if applicable)
  ```tsx
  {loading ? <ActivityIndicator /> : <Text>Submit</Text>}
  ```

- [ ] **Hover state considered** (for web compatibility)

### Error Handling

- [ ] **Error states handled gracefully**

- [ ] **Error messages user-friendly** (Korean language)

- [ ] **Retry mechanism provided** (if applicable)

---

## 🧪 Testing

### Unit Tests

- [ ] **Test file created** (`ComponentName.test.tsx`)

- [ ] **Component renders without crashing**
  ```tsx
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Expected Text')).toBeTruthy();
  });
  ```

- [ ] **Props are respected**
  ```tsx
  it('displays provided title', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
  ```

- [ ] **Event handlers work**
  ```tsx
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<MyComponent onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  ```

- [ ] **Conditional rendering tested**
  ```tsx
  it('shows error message when error prop is provided', () => {
    const { getByText } = render(<MyComponent error="Error message" />);
    expect(getByText('Error message')).toBeTruthy();
  });
  ```

### Coverage

- [ ] **All major code paths tested**

- [ ] **Edge cases covered**

- [ ] **Error scenarios tested**

---

## 📱 Platform Testing

### iOS

- [ ] **Tested on iOS simulator**

- [ ] **Tested on physical iOS device** (if available)

- [ ] **Safe area insets handled** (if needed)
  ```tsx
  <SafeAreaView edges={['top', 'bottom']}>
  ```

### Android

- [ ] **Tested on Android emulator**

- [ ] **Tested on physical Android device** (if available)

- [ ] **Back button behavior correct** (if applicable)

### Both Platforms

- [ ] **Component looks correct on both platforms**

- [ ] **Interactions work on both platforms**

- [ ] **No platform-specific bugs**

---

## 🌐 Internationalization (i18n)

### Text Content

- [ ] **No hardcoded strings** (use i18n)
  ```tsx
  // ❌ Bad
  <Text>예약하기</Text>
  
  // ✅ Good
  <Text>{t('booking.submit')}</Text>
  ```

- [ ] **All user-facing text uses translation keys**

- [ ] **Translation keys are descriptive**
  ```tsx
  // ✅ Good
  t('booking.confirmButton')
  
  // ❌ Bad
  t('btn1')
  ```

### Formatting

- [ ] **Dates formatted with Korean locale**
  ```tsx
  formatDate(date, 'ko-KR')
  ```

- [ ] **Currency formatted with Korean Won**
  ```tsx
  formatCurrency(amount) // ₩50,000
  ```

- [ ] **Phone numbers formatted for Korea**
  ```tsx
  formatPhoneNumber(phone) // 010-1234-5678
  ```

---

## 🎯 Component Composition

### Reusability

- [ ] **Component is reusable** (not overly specific)

- [ ] **Props are flexible** (not hardcoded behavior)

- [ ] **Style overrides allowed** via `style` prop

### Composition

- [ ] **Uses composition over inheritance**
  ```tsx
  // ✅ Good
  <Card>
    <CardHeader>...</CardHeader>
    <CardBody>...</CardBody>
  </Card>
  ```

- [ ] **Children prop used appropriately**

- [ ] **Render props used when needed** (for flexibility)

### Form Components

- [ ] **FormRow used for input + button layouts**
  ```tsx
  // For input fields with adjacent buttons (verify, search, etc.)
  <FormRow label="이메일 주소" rightAccessory={<Button />}>
    <FormField label="" {...props} containerStyle={{ marginBottom: 0 }} />
  </FormRow>
  ```

- [ ] **FormField label conditionally rendered** (empty string = no label element)

---

## 📚 Documentation

### Code Comments

- [ ] **Complex logic has comments**

- [ ] **Non-obvious decisions explained**

- [ ] **TODO comments removed** (or tracked in issues)

### Props Documentation

- [ ] **Props interface has JSDoc comments** (for complex components)
  ```tsx
  interface MyComponentProps {
    /** The title displayed at the top of the card */
    title: string;
    
    /** Callback fired when the card is pressed */
    onPress?: () => void;
  }
  ```

### Usage Examples

- [ ] **Usage example in component file** (as comment) or separate docs

---

## 🔍 Code Quality

### Linting

- [ ] **No linter errors**

- [ ] **No linter warnings** (or justified)

- [ ] **Biome/ESLint rules followed**

### Best Practices

- [ ] **No console.log statements**

- [ ] **No commented-out code**

- [ ] **No unused imports**

- [ ] **No unused variables**

- [ ] **Consistent code formatting**

### Naming

- [ ] **Component name is descriptive**

- [ ] **Variable names are clear**

- [ ] **Function names describe action**
  ```tsx
  // ✅ Good
  handleBookingPress
  formatCurrency
  
  // ❌ Bad
  handle
  format
  ```

- [ ] **Boolean variables start with is/has/should**
  ```tsx
  isLoading
  hasError
  shouldShow
  ```

---

## 🚀 Final Checks

### Functionality

- [ ] **Component works as expected**

- [ ] **All features implemented**

- [ ] **No regressions introduced**

### Visual

- [ ] **Matches Figma design** (if applicable)

- [ ] **Spacing is correct**

- [ ] **Colors are correct**

- [ ] **Typography is correct**

- [ ] **Animations smooth** (if applicable)

### Performance

- [ ] **No performance issues**

- [ ] **Renders quickly**

- [ ] **No memory leaks**

### Accessibility

- [ ] **Screen reader tested** (VoiceOver/TalkBack)

- [ ] **All interactive elements accessible**

- [ ] **Focus order is logical**

### Testing

- [ ] **All tests pass**

- [ ] **Coverage is adequate**

- [ ] **Manual testing completed**

---

## ✅ Review Checklist

Before submitting for review:

- [ ] **All checklist items completed**
- [ ] **Tests written and passing**
- [ ] **No linter errors**
- [ ] **Tested on both iOS and Android**
- [ ] **Accessibility verified**
- [ ] **Performance verified**
- [ ] **Documentation updated** (if needed)
- [ ] **Ready for code review**

---

## 📝 Notes

Use this section to track any deviations from the checklist or special considerations:

```
Example:
- Skipped memoization because component is only used once
- Platform-specific shadow implementation needed for Android
- Accessibility label intentionally verbose for screen reader clarity
```

---

## 🔗 Related Resources

- [Frontend Standards](./frontend-standards.md)
- [Quick Reference](./frontend-quick-reference.md)
- [Figma Implementation Guide](./figma-implementation-guide.md)

---

**Checklist Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: 524 Development Team

