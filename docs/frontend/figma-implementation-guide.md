# Figma to React Native Implementation Guide - 524

## Overview

This guide provides a systematic approach to translating Figma designs into React Native components for the 524 Beauty Marketplace mobile application.

**CRITICAL REQUIREMENT**: This guide assumes you have **programmatic access to Figma designs via the Figma MCP server**. Screenshots are explicitly prohibited as they are unreliable and lead to inaccurate implementations.

---

## PREREQUISITE: Figma MCP Server Access

**BEFORE STARTING IMPLEMENTATION:**

1. **Verify Figma MCP Access**: Confirm the Figma MCP server is configured and accessible
   ```bash
   # Check if Figma MCP server is available
   list_mcp_resources
   # Should show resources from "project-0-524-figma"
   
   # Test access to design context
   mcp_figma_get_design_context(fileKey, nodeId, clientLanguages="typescript", clientFrameworks="react")
   ```

2. **If MCP is Unavailable**: STOP IMMEDIATELY
   ```markdown
   ❌ CANNOT PROCEED WITHOUT FIGMA MCP ACCESS
   
   **Why**: Screenshots and manual extraction are unreliable and produce inaccurate implementations.
   
   **Required Action**: 
   - Configure and authenticate Figma MCP server before attempting any implementation
   - Do NOT estimate values from visual inspection
   - Do NOT use screenshots for measurements
   ```

**ENFORCEMENT**: Implementations without Figma MCP access are prohibited and will be rejected.

---

## Pre-Implementation Checklist

Before starting implementation, ensure you have:

- [ ] **Figma MCP server access verified** (CRITICAL - exit if unavailable)
- [ ] Figma design URL with file key and node ID
- [ ] Access to Figma design files in inspect mode
- [ ] Understanding of component hierarchy from Figma metadata
- [ ] Clarification on interactive states (pressed, disabled, loading)
- [ ] Responsive behavior specifications

---

## Step-by-Step Implementation Process

### 1. Design Analysis

**STEP 1A: Fetch Design Code from Figma MCP**

Before any manual analysis, retrieve the design programmatically:

```bash
# Use Figma MCP to get design code and metadata
mcp_figma_get_design_context(
  fileKey="kZJo1yyy6T3lCWd1FTX16D",
  nodeId="1:100",
  clientLanguages="typescript",
  clientFrameworks="react"
)

# This provides:
# - React/Tailwind code with exact component structure
# - Precise measurements (padding, spacing, dimensions)
# - Exact color values (hex codes like #19191b)
# - Typography specifications (size, weight, line-height, letter-spacing)
# - Border radius, shadows, and other properties
# - data-node-id attributes for component mapping

# Also get metadata for hierarchy
mcp_figma_get_metadata(
  fileKey="kZJo1yyy6T3lCWd1FTX16D",
  nodeId="1:100"
)
```

**CRITICAL RULES:**
- ✅ **DO**: Extract all values from the code output from `mcp_figma_get_design_context`
- ✅ **DO**: Use Figma inspect mode for verification
- ❌ **DON'T**: Extract values from screenshots
- ❌ **DON'T**: Estimate or guess measurements
- ❌ **DON'T**: Proceed if MCP is unavailable

---

#### Extract Design Tokens

**Colors**
```typescript
// Extract exact color values from Figma MCP code output
// Example from code: className="text-[#19191b]" or className="bg-[#19191b]"
// Map these exact hex values to theme/colors.ts
export const colors = {
  // From Figma: Primary colors
  primary: '#111827',      // Figma: Primary/900
  accent: '#f59e0b',       // Figma: Accent/500
  
  // From Figma: Neutral colors
  background: '#ffffff',   // Figma: Neutral/White
  surface: '#f9fafb',      // Figma: Neutral/50
  border: '#e5e7eb',       // Figma: Neutral/200
  
  // From Figma: Text colors
  text: '#111827',         // Figma: Text/Primary
  textSecondary: '#6b7280', // Figma: Text/Secondary
  subtle: '#4b5563',       // Figma: Text/Subtle
  muted: '#6b7280',        // Figma: Text/Muted
  
  // From Figma: Semantic colors
  success: '#10b981',      // Figma: Success/500
  warning: '#f59e0b',      // Figma: Warning/500
  error: '#ef4444',        // Figma: Error/500
  info: '#3b82f6',         // Figma: Info/500
};
```

**Spacing**
```typescript
// Extract exact spacing values from Figma MCP code output
// Example from code: className="left-[24px] top-[284px]" or className="px-0 py-[15px]"
// DO NOT estimate from visual inspection - use exact values from code
export const spacing = {
  xs: 4,    // Figma: 4px
  sm: 8,    // Figma: 8px
  md: 16,   // Figma: 16px
  lg: 24,   // Figma: 24px
  xl: 32,   // Figma: 32px
  xxl: 48,  // Figma: 48px
};
```

**Typography**
```typescript
// Extract exact typography values from Figma MCP code output
// Example from code: className="text-[20px]" or className="text-[length:var(--static\/body-large\/size,16px)]"
// Example: className="leading-[22px]" or className="tracking-[-0.408px]"
export const typography = {
  sizes: {
    xs: 12,    // Figma: Caption
    sm: 14,    // Figma: Body Small
    base: 16,  // Figma: Body
    lg: 18,    // Figma: Body Large
    xl: 20,    // Figma: Heading 4
    xxl: 24,   // Figma: Heading 3
    xxxl: 32,  // Figma: Heading 2
  },
  weights: {
    regular: '400',   // Figma: Regular
    medium: '500',    // Figma: Medium
    semibold: '600',  // Figma: Semibold
    bold: '700',      // Figma: Bold
  },
  lineHeights: {
    tight: 1.2,    // Figma: 120%
    normal: 1.5,   // Figma: 150%
    relaxed: 1.75, // Figma: 175%
  },
};
```

**Border Radius**
```typescript
// Extract exact border radius values from Figma MCP code output
// Example from code: className="rounded-[40px]" or className="rounded-[10px]" or className="rounded-[100px]"
export const borderRadius = {
  sm: 4,     // Figma: Small radius
  md: 8,     // Figma: Medium radius
  lg: 12,    // Figma: Large radius
  xl: 16,    // Figma: Extra large radius
  xxl: 24,   // Figma: 2X large radius
  full: 999, // Figma: Full/Pill shape
};
```

**Shadows**
```typescript
// Extract shadow properties from Figma
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // Android
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};
```

### 2. Component Breakdown

#### Identify Component Hierarchy

```
Screen (BookingDetailScreen)
├── Header
│   ├── BackButton
│   └── Title
├── Content
│   ├── BookingCard
│   │   ├── BookingHeader
│   │   │   ├── BookingNumber
│   │   │   └── StatusBadge
│   │   ├── BookingBody
│   │   │   ├── ServiceInfo
│   │   │   ├── ArtistInfo
│   │   │   └── DateTimeInfo
│   │   └── BookingFooter
│   │       └── PriceInfo
│   └── ActionButtons
│       ├── PrimaryButton
│       └── SecondaryButton
└── Footer
```

#### Create Component Mapping

| Figma Component | React Native Component | Location |
|----------------|------------------------|----------|
| Button/Primary | `<Button variant="primary">` | `components/common/Button.tsx` |
| Button/Secondary | `<Button variant="secondary">` | `components/common/Button.tsx` |
| Card/Elevated | `<Card variant="elevated">` | `components/common/Card.tsx` |
| Input/Text | `<Input>` | `components/common/Input.tsx` |
| Badge/Status | `<StatusBadge>` | `components/common/StatusBadge.tsx` |

### 3. Asset Preparation

#### Export Images from Figma

**Icons**
- Export as SVG when possible
- Use `react-native-svg` for custom icons
- Fallback to PNG at @1x, @2x, @3x for raster images

**Images**
- Export at @1x, @2x, @3x resolutions
- Optimize images before adding to project
- Use WebP format when possible for better compression

**Example Export Structure:**
```
assets/
├── icons/
│   ├── back-arrow.svg
│   ├── calendar.svg
│   └── star.svg
└── images/
    ├── placeholder-avatar@1x.png
    ├── placeholder-avatar@2x.png
    └── placeholder-avatar@3x.png
```

### 4. Implementation

#### Step 4.1: Create Base Component

```tsx
// Start with the structure from Figma
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface BookingCardProps {
  bookingNumber: string;
  status: string;
  serviceName: string;
  artistName: string;
  date: string;
  time: string;
  amount: number;
}

export function BookingCard({
  bookingNumber,
  status,
  serviceName,
  artistName,
  date,
  time,
  amount,
}: BookingCardProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.bookingNumber}>{bookingNumber}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      
      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.serviceName}>{serviceName}</Text>
        <Text style={styles.artistName}>{artistName}</Text>
        <Text style={styles.dateTime}>{`${date} ${time}`}</Text>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.label}>총 금액</Text>
        <Text style={styles.amount}>₩{amount.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingNumber: {
    fontSize: typography.sizes.sm,
    color: colors.subtle,
  },
  statusBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  body: {
    gap: spacing.xs,
  },
  serviceName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  artistName: {
    fontSize: typography.sizes.base,
    color: colors.subtle,
  },
  dateTime: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  amount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
});
```

#### Step 4.2: Match Figma Measurements

Use Figma MCP code output and Figma's inspect panel to get exact measurements (NEVER estimate from screenshots):

```tsx
// From Figma MCP code output:
// className="px-0 py-[15px]" → padding vertical: 15px
// className="rounded-[10px]" → border radius: 10px
// className="text-[20px]" → font size: 20px
// className="font-['Pretendard:Bold',sans-serif]" → font weight: bold (700)

const styles = StyleSheet.create({
  card: {
    paddingVertical: 15,  // From MCP code: py-[15px]
    borderRadius: 10,      // From MCP code: rounded-[10px]
  },
  title: {
    fontSize: 20,          // From MCP code: text-[20px]
    fontWeight: '700',     // From MCP code: Pretendard:Bold
  },
});

// Better: Use design tokens for consistency
const styles = StyleSheet.create({
  card: {
    padding: spacing.md,        // 16px
    gap: spacing.sm,            // 8px
    borderRadius: borderRadius.lg, // 12px
  },
  title: {
    fontSize: typography.sizes.lg,      // 18px
    fontWeight: typography.weights.bold, // 700
  },
});
```

#### Step 4.3: Implement Interactive States

```tsx
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

export function Button({ onPress, children }: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.button,
        isPressed && styles.buttonPressed, // Figma: Pressed state
      ]}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  buttonPressed: {
    // Figma shows 90% opacity on press
    opacity: 0.9,
    // Figma shows slight scale down
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: colors.background,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
});
```

### 5. Responsive Considerations

#### Handle Different Screen Sizes

```tsx
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
const BREAKPOINTS = {
  small: 375,   // iPhone SE
  medium: 390,  // iPhone 12/13/14
  large: 428,   // iPhone 14 Pro Max
};

const isSmallDevice = SCREEN_WIDTH < BREAKPOINTS.small;
const isMediumDevice = SCREEN_WIDTH >= BREAKPOINTS.small && SCREEN_WIDTH < BREAKPOINTS.large;
const isLargeDevice = SCREEN_WIDTH >= BREAKPOINTS.large;

const styles = StyleSheet.create({
  container: {
    padding: isSmallDevice ? spacing.sm : spacing.md,
  },
  title: {
    fontSize: isSmallDevice ? typography.sizes.base : typography.sizes.lg,
  },
});
```

#### Platform-Specific Adjustments

```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  card: {
    // iOS and Android may need different shadow approaches
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  text: {
    // Font rendering differs between platforms
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
});
```

### 6. Animation Implementation

#### Figma Prototype Animations → React Native

```tsx
import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

export function FadeInCard({ children }: { children: React.ReactNode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Figma: Ease out, 300ms duration
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
}

// Slide in animation
export function SlideInCard({ children }: { children: React.ReactNode }) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Figma: Spring animation
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}
```

---

## Common Figma → React Native Translations

### Layout

| Figma | React Native |
|-------|--------------|
| Auto Layout (Horizontal) | `flexDirection: 'row'` |
| Auto Layout (Vertical) | `flexDirection: 'column'` |
| Spacing between items | `gap: spacing.md` |
| Padding | `padding: spacing.md` |
| Align Left | `alignItems: 'flex-start'` |
| Align Center | `alignItems: 'center'` |
| Align Right | `alignItems: 'flex-end'` |
| Space Between | `justifyContent: 'space-between'` |
| Hug Contents | `alignSelf: 'flex-start'` |
| Fill Container | `flex: 1` |

### Effects

| Figma | React Native (iOS) | React Native (Android) |
|-------|-------------------|------------------------|
| Drop Shadow | `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` | `elevation` |
| Blur | Use `@react-native-community/blur` | Use `@react-native-community/blur` |
| Opacity | `opacity: 0.5` | `opacity: 0.5` |

### Typography

| Figma | React Native |
|-------|--------------|
| Font Size | `fontSize: 16` |
| Font Weight (Regular) | `fontWeight: '400'` |
| Font Weight (Medium) | `fontWeight: '500'` |
| Font Weight (Semibold) | `fontWeight: '600'` |
| Font Weight (Bold) | `fontWeight: '700'` |
| Line Height | `lineHeight: 24` |
| Letter Spacing | `letterSpacing: 0.5` |
| Text Align | `textAlign: 'center'` |

### Colors

| Figma | React Native |
|-------|--------------|
| Fill | `backgroundColor: colors.primary` |
| Stroke | `borderColor: colors.border` |
| Text Color | `color: colors.text` |
| Opacity | `opacity: 0.5` or use rgba |

---

## Quality Checklist

After implementing a design, verify:

- [ ] **Visual Accuracy**: Component matches Figma design pixel-perfect
- [ ] **Spacing**: All padding, margins, and gaps match design tokens
- [ ] **Typography**: Font sizes, weights, and line heights are correct
- [ ] **Colors**: All colors use design tokens, no hardcoded values
- [ ] **Interactive States**: Pressed, disabled, loading states implemented
- [ ] **Accessibility**: Labels, roles, and hints are present
- [ ] **Responsive**: Works on different screen sizes
- [ ] **Platform**: Looks correct on both iOS and Android
- [ ] **Performance**: No unnecessary re-renders, optimized FlatLists
- [ ] **Type Safety**: All props properly typed with TypeScript
- [ ] **Testing**: Component has unit tests

---

## Troubleshooting Common Issues

### Issue: Shadows not showing on Android

**Problem**: iOS shadows don't work on Android

**Solution**: Use elevation for Android
```tsx
const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

### Issue: Text looks different from Figma

**Problem**: Font rendering differs between platforms

**Solution**: Adjust line height and letter spacing
```tsx
const styles = StyleSheet.create({
  text: {
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
    letterSpacing: 0.3, // Fine-tune for platform
  },
});
```

### Issue: Layout doesn't match Figma exactly

**Problem**: Flexbox behavior differs from Figma's Auto Layout

**Solution**: Use explicit dimensions and flex properties
```tsx
// Figma: Fixed width 100px
width: 100,

// Figma: Hug contents
alignSelf: 'flex-start',

// Figma: Fill container
flex: 1,

// Figma: Space between
justifyContent: 'space-between',
```

### Issue: Colors look different on device

**Problem**: Color values may appear different on physical devices

**Solution**: Test on actual devices, adjust if needed
```tsx
// Use exact hex values from Figma
const colors = {
  primary: '#111827', // Copy directly from Figma
};
```

---

## Best Practices

### DO ✅

1. **Extract design tokens first** before implementing components
2. **Create reusable components** for repeated UI patterns
3. **Use design tokens** instead of hardcoded values
4. **Test on multiple devices** and screen sizes
5. **Implement all interactive states** (pressed, disabled, loading)
6. **Add accessibility labels** for all interactive elements
7. **Optimize images** before adding to project
8. **Use TypeScript** for all component props
9. **Write tests** for complex components
10. **Document component usage** with examples

### DON'T ❌

1. **Don't hardcode values** - use design tokens
2. **Don't skip accessibility** - add labels and roles
3. **Don't forget platform differences** - test on iOS and Android
4. **Don't use inline styles** - use StyleSheet.create()
5. **Don't ignore responsive design** - handle different screen sizes
6. **Don't skip error states** - implement error handling
7. **Don't forget loading states** - show spinners during async operations
8. **Don't use large unoptimized images** - compress and resize
9. **Don't skip testing** - write tests for critical components
10. **Don't ignore performance** - optimize lists and animations

---

## Example: Complete Implementation Flow

### 1. Analyze Figma Design

**Component**: Booking Card
- **Dimensions**: 343px wide (full width - 32px padding)
- **Padding**: 16px all sides
- **Border Radius**: 12px
- **Background**: #F9FAFB (surface color)
- **Shadow**: 0px 2px 4px rgba(0, 0, 0, 0.1)

### 2. Extract Design Tokens

```typescript
// Already in theme/colors.ts
surface: '#f9fafb',

// Already in theme/spacing.ts
md: 16,

// Already in theme/borderRadius.ts
lg: 12,

// Already in theme/shadows.ts
md: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
},
```

### 3. Implement Component

```tsx
// components/bookings/BookingCard.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface BookingCardProps {
  bookingNumber: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  serviceName: string;
  artistName: string;
  date: string;
  time: string;
  amount: number;
  onPress?: () => void;
}

export function BookingCard({
  bookingNumber,
  status,
  serviceName,
  artistName,
  date,
  time,
  amount,
  onPress,
}: BookingCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  
  return (
    <Wrapper
      style={styles.card}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${serviceName} 예약, ${artistName}, ${date} ${time}`}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.bookingNumber}>{bookingNumber}</Text>
        <StatusBadge status={status} />
      </View>
      
      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.serviceName}>{serviceName}</Text>
        <Text style={styles.artistName}>{artistName}</Text>
        <Text style={styles.dateTime}>{`${date} ${time}`}</Text>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.label}>총 금액</Text>
        <Text style={styles.amount}>₩{amount.toLocaleString('ko-KR')}</Text>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingNumber: {
    fontSize: typography.sizes.sm,
    color: colors.subtle,
  },
  body: {
    gap: spacing.xs,
  },
  serviceName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  artistName: {
    fontSize: typography.sizes.base,
    color: colors.subtle,
  },
  dateTime: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  amount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
});
```

### 4. Test Component

```tsx
// components/bookings/BookingCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { BookingCard } from './BookingCard';

describe('BookingCard', () => {
  const mockProps = {
    bookingNumber: 'BK-001',
    status: 'confirmed' as const,
    serviceName: '메이크업',
    artistName: '김민지',
    date: '2025-01-15',
    time: '14:00',
    amount: 50000,
  };
  
  it('renders all information correctly', () => {
    const { getByText } = render(<BookingCard {...mockProps} />);
    
    expect(getByText('BK-001')).toBeTruthy();
    expect(getByText('메이크업')).toBeTruthy();
    expect(getByText('김민지')).toBeTruthy();
    expect(getByText('₩50,000')).toBeTruthy();
  });
  
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<BookingCard {...mockProps} onPress={onPress} />);
    
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### 5. Document Usage

```tsx
// Example usage in a screen
import { BookingCard } from '../components/bookings/BookingCard';

export function BookingsListScreen() {
  const { data: bookings } = useBookings();
  const navigation = useNavigation();
  
  return (
    <FlatList
      data={bookings}
      renderItem={({ item }) => (
        <BookingCard
          bookingNumber={item.bookingNumber}
          status={item.status}
          serviceName={item.serviceName}
          artistName={item.artistName}
          date={item.date}
          time={item.time}
          amount={item.amount}
          onPress={() => navigation.navigate('BookingDetail', { id: item.id })}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
    />
  );
}
```

---

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Figma Developer Resources](https://www.figma.com/developers)
- [React Native Styling Cheat Sheet](https://github.com/vhpoet/react-native-styling-cheat-sheet)
- [React Native Design Patterns](https://reactnativeexample.com/)

---

## Appendix: Why Figma MCP is Required

### The Problem with Screenshots

Screenshots are fundamentally unreliable for implementation because:

1. **No Precise Measurements**: You cannot extract exact pixel values from a screenshot
2. **Color Inaccuracy**: Screen rendering, compression, and color profiles affect color accuracy
3. **No Structure Information**: Screenshots don't reveal component hierarchy or nesting
4. **No Design Tokens**: Cannot identify which design system values are being used
5. **Estimation Errors**: Manual measurement leads to inconsistent implementations
6. **No Code Context**: Cannot see how components relate or what properties they have

### Why Figma MCP is Superior

The Figma MCP server provides:

1. **Exact Values**: Precise measurements in code format (e.g., `padding: 15px`, `color: #19191b`)
2. **Component Structure**: Complete hierarchy with `data-node-id` attributes
3. **Design Tokens**: References to design system variables and styles
4. **Code Output**: React/Tailwind code that can be directly translated to React Native
5. **Metadata**: XML structure showing component organization
6. **Consistency**: Same values every time, no human error

### Example Comparison

**Screenshot-based (WRONG)**:
```typescript
// Estimated from visual inspection
const styles = StyleSheet.create({
  button: {
    padding: 16,  // Looks like about 16px?
    borderRadius: 12,  // Seems rounded, maybe 12px?
    backgroundColor: '#1a1a1a',  // Dark color, close enough?
  },
});
```

**MCP-based (CORRECT)**:
```typescript
// From mcp_figma_get_design_context output:
// className="px-0 py-[15px] rounded-[100px] bg-[#19191b]"
const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,  // Exact value from code
    paddingHorizontal: 0,  // Exact value from code
    borderRadius: 100,  // Exact value from code (pill shape)
    backgroundColor: '#19191b',  // Exact hex from code
  },
});
```

The MCP-based approach ensures pixel-perfect accuracy and consistency.

---

**Guide Version**: 1.1  
**Last Updated**: December 2024  
**Maintained By**: 524 Development Team

