# React Native Frontend Standards - 524 Beauty Marketplace

## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Component Architecture](#component-architecture)
4. [Styling Standards](#styling-standards)
5. [TypeScript Best Practices](#typescript-best-practices)
6. [State Management](#state-management)
7. [Performance Optimization](#performance-optimization)
8. [Accessibility](#accessibility)
9. [Testing Standards](#testing-standards)
10. [Code Quality](#code-quality)
11. [Component Library](#component-library)

---

## Overview

This document establishes frontend development standards for the 524 Beauty Marketplace React Native mobile application. Our goal is to create a maintainable, performant, and accessible application that provides an excellent user experience for both customers and beauty artists in the Korean market.

### Core Principles
- **Consistency**: Uniform patterns across the codebase
- **Performance**: Optimized for smooth 60fps animations and fast load times
- **Maintainability**: Easy to understand, modify, and extend
- **Accessibility**: Usable by everyone, including users with disabilities
- **Type Safety**: Comprehensive TypeScript coverage
- **Testability**: Easy to test at all levels

---

## Project Structure

### Directory Organization

```
packages/mobile/src/
├── api/                    # API client and request functions
├── components/             # Reusable UI components
│   ├── common/            # Generic components (Button, Input, Card, etc.)
│   ├── bookings/          # Booking-specific components
│   ├── messaging/         # Chat/messaging components
│   ├── reviews/           # Review components
│   └── [feature]/         # Feature-specific components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── navigation/            # Navigation configuration
├── query/                 # React Query hooks and configurations
├── screens/               # Screen components
├── services/              # Business logic and utilities
├── store/                 # Zustand stores
├── theme/                 # Design tokens (colors, spacing, typography)
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions and utilities
```

### File Naming Conventions

- **Components**: PascalCase with `.tsx` extension
  - `BookingCard.tsx`, `StarRating.tsx`, `NavigationMenu.tsx`
- **Hooks**: camelCase starting with `use` and `.ts` extension
  - `useNetworkStatus.ts`, `useOfflineQueueProcessor.ts`
- **Utilities**: camelCase with `.ts` extension
  - `bookingUtils.ts`, `imageCompression.ts`
- **Types**: PascalCase with `.types.ts` extension
  - `Booking.types.ts`, `User.types.ts`
- **Tests**: Same name as file with `.test.ts` or `.test.tsx`
  - `BookingCard.test.tsx`, `offlineMessageQueue.test.ts`

---

## Component Architecture

### Component Types

#### 1. Screen Components
- Located in `src/screens/`
- One per screen/route
- Handle navigation and screen-level logic
- Compose smaller components
- Use React Query for data fetching

```tsx
// ✅ Good: Screen component example
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingCard } from '../components/bookings/BookingCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useBookings } from '../query/bookings';
import { colors } from '../theme/colors';

export function BookingsListScreen() {
  const navigation = useNavigation();
  const { data: bookings, isLoading } = useBookings();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {bookings?.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onPress={() => navigation.navigate('BookingDetail', { id: booking.id })}
          />
        ))}
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
    padding: 16,
    gap: 12,
  },
});
```

#### 2. Presentational Components
- Located in `src/components/`
- Pure, reusable UI components
- Receive data via props
- No direct API calls or global state access
- Fully typed props interface

```tsx
// ✅ Good: Presentational component example
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const statusConfig = {
    pending: { label: '대기중', color: colors.warning },
    confirmed: { label: '확정', color: colors.success },
    completed: { label: '완료', color: colors.muted },
    cancelled: { label: '취소됨', color: colors.error },
  };

  const config = statusConfig[status];
  const badgeSize = size === 'small' ? styles.badgeSmall : styles.badgeMedium;

  return (
    <View style={[styles.badge, badgeSize, { backgroundColor: config.color }]}>
      <Text style={styles.badgeText}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
});
```

#### 3. Container Components
- Wrap presentational components
- Handle data fetching and state management
- Pass processed data to presentational components

```tsx
// ✅ Good: Container component pattern
import React from 'react';

import { BookingCard } from './BookingCard';
import { useBookingDetails } from '../../query/bookings';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface BookingCardContainerProps {
  bookingId: string;
  onPress?: () => void;
}

export function BookingCardContainer({ bookingId, onPress }: BookingCardContainerProps) {
  const { data: booking, isLoading, error } = useBookingDetails(bookingId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="예약 정보를 불러올 수 없습니다" />;
  if (!booking) return null;

  return <BookingCard booking={booking} onPress={onPress} />;
}
```

### Component Composition

**Prefer composition over inheritance:**

```tsx
// ✅ Good: Composition
export function Card({ children, ...props }: CardProps) {
  return <View style={styles.card} {...props}>{children}</View>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <View style={styles.cardHeader}>{children}</View>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <View style={styles.cardBody}>{children}</View>;
}

// Usage
<Card>
  <CardHeader>
    <Text>Title</Text>
  </CardHeader>
  <CardBody>
    <Text>Content</Text>
  </CardBody>
</Card>
```

### Props Interface Standards

```tsx
// ✅ Good: Well-defined props interface
interface ButtonProps {
  // Required props first
  onPress: () => void;
  children: React.ReactNode;
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  
  // Style overrides
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  // Implementation
}
```

---

## Styling Standards

### Use React Native StyleSheet API

**Always use `StyleSheet.create()` for performance optimization:**

```tsx
// ✅ Good: StyleSheet.create
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 16,
    color: colors.text,
  },
});

// ❌ Bad: Inline styles
<View style={{ flex: 1, backgroundColor: '#ffffff' }}>
  <Text style={{ fontSize: 16, color: '#000000' }}>Hello</Text>
</View>
```

### Design Tokens System

**Use centralized design tokens from `theme/` directory:**

```typescript
// theme/colors.ts
export const colors = {
  // Base colors
  background: '#ffffff',
  surface: '#f9fafb',
  
  // Brand colors
  primary: '#111827',
  accent: '#f59e0b',
  
  // Text colors
  text: '#111827',
  textSecondary: '#6b7280',
  subtle: '#4b5563',
  muted: '#6b7280',
  
  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // UI elements
  border: '#e5e7eb',
  divider: '#e5e7eb',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// theme/typography.ts
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// theme/borderRadius.ts
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 999,
};

// theme/shadows.ts
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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

// theme/index.ts
export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';
export { borderRadius } from './borderRadius';
export { shadows } from './shadows';
```

### Using Design Tokens

```tsx
// ✅ Good: Using design tokens
import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    lineHeight: typography.sizes.lg * typography.lineHeights.tight,
  },
  description: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
});

// ❌ Bad: Hardcoded values
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
});
```

### Responsive Styling

```tsx
import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

const styles = StyleSheet.create({
  container: {
    padding: isSmallDevice ? spacing.sm : spacing.md,
  },
  text: {
    fontSize: isSmallDevice ? typography.sizes.sm : typography.sizes.base,
    // Platform-specific styles
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

### Style Composition

```tsx
// ✅ Good: Composing styles
<View style={[styles.card, styles.cardElevated, containerStyle]} />

// ✅ Good: Conditional styles
<View style={[
  styles.button,
  disabled && styles.buttonDisabled,
  variant === 'primary' && styles.buttonPrimary,
]} />

// ❌ Bad: Complex inline conditionals
<View style={{
  ...styles.button,
  ...(disabled ? styles.buttonDisabled : {}),
  ...(variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary),
}} />
```

### Layout Patterns

```tsx
// Flexbox layouts
const styles = StyleSheet.create({
  // Vertical stack
  vStack: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  
  // Horizontal stack
  hStack: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  
  // Centered content
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Space between
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Full width
  fullWidth: {
    width: '100%',
  },
});
```

---

## TypeScript Best Practices

### Strict Type Safety

```typescript
// tsconfig.json should have strict mode enabled
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Type Definitions

```typescript
// ✅ Good: Explicit types for all exports
export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  artistId: string;
  serviceType: 'hair' | 'makeup' | 'combo';
  status: BookingStatus;
  scheduledDate: string;
  scheduledStartTime: string;
  totalAmount: number;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'paid' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

// ✅ Good: Discriminated unions for variants
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ✅ Good: Generic types for reusable patterns
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### Type Guards

```typescript
// ✅ Good: Type guards for runtime checks
export function isBooking(value: unknown): value is Booking {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'bookingNumber' in value &&
    'status' in value
  );
}

// Usage
if (isBooking(data)) {
  // TypeScript knows data is Booking here
  console.log(data.bookingNumber);
}
```

### Avoid `any`

```typescript
// ❌ Bad: Using any
function processData(data: any) {
  return data.map((item: any) => item.name);
}

// ✅ Good: Proper typing
interface DataItem {
  id: string;
  name: string;
}

function processData(data: DataItem[]): string[] {
  return data.map((item) => item.name);
}

// ✅ Good: Use unknown for truly unknown types
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Component Props Types

```typescript
// ✅ Good: Explicit prop types
interface CardProps {
  title: string;
  description?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ title, description, onPress, children, style }: CardProps) {
  // Implementation
}

// ✅ Good: Extending native component props
import { TouchableOpacityProps } from 'react-native';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export function Button({ variant = 'primary', style, ...props }: ButtonProps) {
  return <TouchableOpacity style={[styles.button, style]} {...props} />;
}
```

---

## State Management

### Local State (useState)

Use for component-specific state that doesn't need to be shared:

```tsx
// ✅ Good: Local state for UI interactions
export function BookingCard({ booking }: BookingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
      {/* Card content */}
    </TouchableOpacity>
  );
}
```

### Global State (Zustand)

Use for application-wide state:

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'artist';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Usage in components
export function ProfileScreen() {
  const { user, logout } = useAuthStore();
  
  return (
    <View>
      <Text>{user?.name}</Text>
      <Button onPress={logout}>Logout</Button>
    </View>
  );
}
```

### Server State (React Query)

Use for data fetching and caching:

```typescript
// query/bookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: string) => [...bookingKeys.lists(), { filters }] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

// Fetch bookings list
export function useBookings(status?: string) {
  return useQuery({
    queryKey: bookingKeys.list(status || 'all'),
    queryFn: () => api.get('/bookings', { params: { status } }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single booking
export function useBookingDetails(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => api.get(`/bookings/${id}`),
    enabled: !!id,
  });
}

// Create booking mutation
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBookingData) => api.post('/bookings', data),
    onSuccess: () => {
      // Invalidate and refetch bookings list
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

// Usage in component
export function BookingsListScreen() {
  const { data: bookings, isLoading, error } = useBookings('confirmed');
  const createBooking = useCreateBooking();
  
  const handleCreateBooking = async (data: CreateBookingData) => {
    try {
      await createBooking.mutateAsync(data);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  
  return (
    <View>
      {bookings?.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </View>
  );
}
```

### Form State (Local State + Validation)

```typescript
// ✅ Good: Form state management
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export function SignupForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = '유효한 이메일을 입력해주세요';
    }
    
    if (formData.phone.length < 10) {
      newErrors.phone = '유효한 전화번호를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/signup', formData);
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View>
      <TextInput
        value={formData.name}
        onChangeText={(name) => setFormData({ ...formData, name })}
        placeholder="이름"
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}
      
      <Button onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? '처리중...' : '가입하기'}
      </Button>
    </View>
  );
}
```

---

## Performance Optimization

### Memoization

```tsx
import React, { memo, useMemo, useCallback } from 'react';

// ✅ Good: Memoize expensive components
export const BookingCard = memo(function BookingCard({ booking, onPress }: BookingCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* Component content */}
    </TouchableOpacity>
  );
});

// ✅ Good: Memoize expensive calculations
export function BookingsList({ bookings }: BookingsListProps) {
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  }, [bookings]);
  
  const handlePress = useCallback((id: string) => {
    navigation.navigate('BookingDetail', { id });
  }, [navigation]);
  
  return (
    <FlatList
      data={sortedBookings}
      renderItem={({ item }) => (
        <BookingCard booking={item} onPress={() => handlePress(item.id)} />
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### FlatList Optimization

```tsx
// ✅ Good: Optimized FlatList
export function BookingsList({ bookings }: BookingsListProps) {
  const renderItem = useCallback(({ item }: { item: Booking }) => (
    <BookingCard booking={item} />
  ), []);
  
  const keyExtractor = useCallback((item: Booking) => item.id, []);
  
  const getItemLayout = useCallback(
    (data: Booking[] | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );
  
  return (
    <FlatList
      data={bookings}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
    />
  );
}
```

### Image Optimization

```tsx
import FastImage from 'react-native-fast-image';

// ✅ Good: Using FastImage with caching
export function ArtistAvatar({ uri, size = 48 }: AvatarProps) {
  return (
    <FastImage
      style={{ width: size, height: size, borderRadius: size / 2 }}
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
}
```

### Lazy Loading

```tsx
import React, { Suspense, lazy } from 'react';

// ✅ Good: Lazy load heavy components
const ChatScreen = lazy(() => import('./screens/ChatScreen'));
const BookingDetailScreen = lazy(() => import('./screens/BookingDetailScreen'));

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat">
          {() => (
            <Suspense fallback={<LoadingSpinner />}>
              <ChatScreen />
            </Suspense>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## Accessibility

### Accessibility Labels

```tsx
// ✅ Good: Proper accessibility labels
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="예약 상세 보기"
  accessibilityHint="예약 정보를 확인하려면 두 번 탭하세요"
  onPress={handlePress}
>
  <Text>예약 보기</Text>
</TouchableOpacity>

// ✅ Good: Image accessibility
<Image
  source={{ uri: artistPhoto }}
  accessibilityLabel={`${artistName} 프로필 사진`}
  accessibilityRole="image"
/>

// ✅ Good: Form input accessibility
<TextInput
  accessibilityLabel="이메일 주소"
  accessibilityHint="이메일 주소를 입력하세요"
  placeholder="email@example.com"
  autoComplete="email"
  keyboardType="email-address"
/>
```

### Screen Reader Support

```tsx
import { AccessibilityInfo } from 'react-native';

// ✅ Good: Announce important changes
export function BookingConfirmation() {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility('예약이 확정되었습니다');
  }, []);
  
  return (
    <View accessible={true} accessibilityRole="alert">
      <Text>예약이 확정되었습니다</Text>
    </View>
  );
}
```

### Focus Management

```tsx
import { useRef, useEffect } from 'react';
import { TextInput, findNodeHandle, AccessibilityInfo } from 'react-native';

export function LoginForm() {
  const emailInputRef = useRef<TextInput>(null);
  
  useEffect(() => {
    // Focus first input on mount
    const reactTag = findNodeHandle(emailInputRef.current);
    if (reactTag) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }, []);
  
  return (
    <TextInput
      ref={emailInputRef}
      accessibilityLabel="이메일"
      placeholder="이메일을 입력하세요"
    />
  );
}
```

---

## Testing Standards

### Unit Tests

```typescript
// components/BookingCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { BookingCard } from './BookingCard';

describe('BookingCard', () => {
  const mockBooking = {
    id: '1',
    bookingNumber: 'BK-001',
    artistName: '김민지',
    services: [{ name: '메이크업', price: 50000 }],
    scheduledDate: '2025-01-15',
    scheduledStartTime: '14:00',
    totalAmount: 50000,
    status: 'confirmed' as const,
  };
  
  it('renders booking information correctly', () => {
    const { getByText } = render(<BookingCard booking={mockBooking} />);
    
    expect(getByText('BK-001')).toBeTruthy();
    expect(getByText('김민지')).toBeTruthy();
    expect(getByText('₩50,000')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <BookingCard booking={mockBooking} onPress={onPress} />
    );
    
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  
  it('displays correct status badge', () => {
    const { getByText } = render(<BookingCard booking={mockBooking} />);
    expect(getByText('확정')).toBeTruthy();
  });
});
```

### Integration Tests

```typescript
// screens/BookingsListScreen.test.tsx
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingsListScreen } from './BookingsListScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('BookingsListScreen', () => {
  it('displays bookings after loading', async () => {
    const { getByText, queryByTestId } = render(<BookingsListScreen />, { wrapper });
    
    // Loading state
    expect(queryByTestId('loading-spinner')).toBeTruthy();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('BK-001')).toBeTruthy();
    });
  });
});
```

### Snapshot Tests

```typescript
// Use sparingly, only for stable components
import { render } from '@testing-library/react-native';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('matches snapshot for confirmed status', () => {
    const { toJSON } = render(<StatusBadge status="confirmed" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
```

---

## Code Quality

### ESLint / Biome Configuration

```json
// biome.json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExtraBooleanCast": "error",
        "noMultipleSpacesInRegularExpressionLiterals": "error",
        "noUselessCatch": "error",
        "noUselessConstructor": "error",
        "noUselessEmptyExport": "error",
        "noUselessFragments": "error",
        "noUselessLabel": "error",
        "noUselessRename": "error",
        "noUselessSwitchCase": "error",
        "noVoid": "error",
        "noWith": "error",
        "useFlatMap": "error",
        "useOptionalChain": "error",
        "useSimplifiedLogicExpression": "error"
      },
      "correctness": {
        "noConstAssign": "error",
        "noConstantCondition": "error",
        "noEmptyPattern": "error",
        "noGlobalObjectCalls": "error",
        "noInvalidConstructorSuper": "error",
        "noNewSymbol": "error",
        "noSelfAssign": "error",
        "noUndeclaredVariables": "error",
        "noUnreachable": "error",
        "noUnreachableSuper": "error",
        "noUnsafeFinally": "error",
        "noUnusedLabels": "error",
        "noUnusedVariables": "error",
        "useValidForDirection": "error"
      }
    }
  }
}
```

### Code Review Checklist

- [ ] Component has proper TypeScript types
- [ ] Styles use design tokens (colors, spacing, etc.)
- [ ] No hardcoded strings (use i18n)
- [ ] Accessibility labels are present
- [ ] Component is properly memoized if needed
- [ ] Tests cover main functionality
- [ ] No console.log statements
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Component follows naming conventions

---

## Component Library

### Common Components

Create reusable components in `src/components/common/`:

#### Button Component

```tsx
// components/common/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const variantStyles = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    outline: styles.variantOutline,
    ghost: styles.variantGhost,
  };
  
  const sizeStyles = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  };
  
  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };
  
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: disabled || loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.background : colors.primary} />
      ) : (
        <Text style={[styles.text, textSizeStyles[size], textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  variantPrimary: {
    backgroundColor: colors.primary,
  },
  variantSecondary: {
    backgroundColor: colors.accent,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  variantGhost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  sizeSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sizeMedium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sizeLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  
  // Text
  text: {
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  textSmall: {
    fontSize: typography.sizes.sm,
  },
  textMedium: {
    fontSize: typography.sizes.base,
  },
  textLarge: {
    fontSize: typography.sizes.lg,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});
```

#### Input Component

```tsx
// components/common/Input.tsx
import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  function Input(
    {
      label,
      error,
      helperText,
      containerStyle,
      leftIcon,
      rightIcon,
      style,
      ...props
    },
    ref
  ) {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        
        <View style={[styles.inputContainer, error && styles.inputError]}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.muted}
            {...props}
          />
          
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
```

#### Card Component

```tsx
// components/common/Card.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof spacing;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
}: CardProps) {
  const variantStyles = {
    elevated: [styles.card, shadows.md],
    outlined: [styles.card, styles.outlined],
    flat: styles.card,
  };
  
  return (
    <View
      style={[
        variantStyles[variant],
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <View style={styles.body}>{children}</View>;
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    marginBottom: spacing.md,
  },
  body: {
    gap: spacing.sm,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
```

#### Loading Components

```tsx
// components/common/LoadingSpinner.tsx
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = colors.primary,
  fullScreen = false,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }
  
  return <ActivityIndicator size={size} color={color} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
```

#### Error Components

```tsx
// components/common/ErrorMessage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorMessage({
  message = '오류가 발생했습니다',
  onRetry,
  fullScreen = false,
}: ErrorMessageProps) {
  const containerStyle = fullScreen ? styles.fullScreen : styles.inline;
  
  return (
    <View style={containerStyle}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button onPress={onRetry} variant="outline" size="small">
          다시 시도
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  inline: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.error,
    textAlign: 'center',
  },
});
```

---

## Best Practices Summary

### DO ✅

1. **Use TypeScript strictly** - No `any`, proper types for all props
2. **Use design tokens** - Colors, spacing, typography from theme
3. **Use StyleSheet.create()** - For performance optimization
4. **Memoize components** - Use `memo`, `useMemo`, `useCallback` appropriately
5. **Handle loading and error states** - Always provide feedback
6. **Add accessibility labels** - Make app usable for everyone
7. **Write tests** - Unit tests for components, integration tests for flows
8. **Use React Query** - For server state management
9. **Use FlatList** - For long lists with proper optimization
10. **Follow naming conventions** - Consistent file and component names

### DON'T ❌

1. **Don't use inline styles** - Use StyleSheet.create()
2. **Don't hardcode colors/spacing** - Use design tokens
3. **Don't use `any` type** - Use proper TypeScript types
4. **Don't forget accessibility** - Add labels and roles
5. **Don't skip error handling** - Always handle errors gracefully
6. **Don't use ScrollView for long lists** - Use FlatList instead
7. **Don't mutate state directly** - Use setState or Zustand actions
8. **Don't forget loading states** - Show spinners during async operations
9. **Don't use console.log in production** - Remove debug statements
10. **Don't skip tests** - Write tests for critical functionality

---

## Korean Market Specific Considerations

### Localization (i18n)

```typescript
// Always use Korean as primary language
// Use i18n for all user-facing strings
import { useTranslation } from 'react-i18next';

export function BookingScreen() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('booking.title')}</Text>
      <Button>{t('booking.confirm')}</Button>
    </View>
  );
}
```

### Korean Typography

```typescript
// theme/typography.ts
export const typography = {
  // Korean fonts need slightly larger sizes for readability
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,  // Minimum for Korean body text
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  // Korean text benefits from increased line height
  lineHeights: {
    tight: 1.3,
    normal: 1.6,  // Better for Korean characters
    relaxed: 1.8,
  },
};
```

### Date and Currency Formatting

```typescript
// utils/formatters.ts
export function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(time: string): string {
  return new Date(time).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

---

## Conclusion

This document provides comprehensive standards for React Native development in the 524 Beauty Marketplace project. Following these guidelines will ensure:

- **Consistent code quality** across the team
- **Better performance** through optimization best practices
- **Improved maintainability** with clear patterns and structure
- **Enhanced accessibility** for all users
- **Type safety** with comprehensive TypeScript usage
- **Reusable components** through a well-organized component library

Remember: These are living standards. As the project evolves and new patterns emerge, update this document to reflect best practices.

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: 524 Development Team

