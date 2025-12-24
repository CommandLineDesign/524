# React Native Quick Reference Guide - 524

## Quick Links
- [Full Standards Document](./frontend-standards.md)
- [Technical Specification](./524-technical-specification.md)

---

## Design Tokens

```typescript
// Import design tokens
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

// Usage
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});
```

### Available Tokens

**Colors**: `background`, `surface`, `primary`, `accent`, `text`, `textSecondary`, `subtle`, `muted`, `success`, `warning`, `error`, `info`, `border`, `divider`, `overlay`

**Spacing**: `xs` (4), `sm` (8), `md` (16), `lg` (24), `xl` (32), `xxl` (48)

**Typography Sizes**: `xs` (12), `sm` (14), `base` (16), `lg` (18), `xl` (20), `xxl` (24), `xxxl` (32)

**Typography Weights**: `regular` (400), `medium` (500), `semibold` (600), `bold` (700)

**Border Radius**: `sm` (4), `md` (8), `lg` (12), `xl` (16), `xxl` (24), `full` (999)

---

## Component Template

```tsx
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
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
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
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
});
```

---

## Screen Template

```tsx
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
        {/* Screen content */}
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

---

## React Query Hook Template

```typescript
// query/myData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

// Query keys
export const myDataKeys = {
  all: ['myData'] as const,
  lists: () => [...myDataKeys.all, 'list'] as const,
  list: (filters: string) => [...myDataKeys.lists(), { filters }] as const,
  details: () => [...myDataKeys.all, 'detail'] as const,
  detail: (id: string) => [...myDataKeys.details(), id] as const,
};

// Fetch list
export function useMyData(filters?: string) {
  return useQuery({
    queryKey: myDataKeys.list(filters || 'all'),
    queryFn: () => api.get('/my-data', { params: { filters } }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single item
export function useMyDataDetails(id: string) {
  return useQuery({
    queryKey: myDataKeys.detail(id),
    queryFn: () => api.get(`/my-data/${id}`),
    enabled: !!id,
  });
}

// Create mutation
export function useCreateMyData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMyDataInput) => api.post('/my-data', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myDataKeys.lists() });
    },
  });
}

// Update mutation
export function useUpdateMyData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMyDataInput }) =>
      api.put(`/my-data/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: myDataKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: myDataKeys.lists() });
    },
  });
}
```

---

## Zustand Store Template

```typescript
// store/myStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MyState {
  // State
  items: Item[];
  selectedId: string | null;
  
  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string) => void;
  clearSelection: () => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      // Initial state
      items: [],
      selectedId: null,
      
      // Actions
      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      selectItem: (id) => set({ selectedId: id }),
      clearSelection: () => set({ selectedId: null }),
    }),
    {
      name: 'my-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Usage in component
export function MyComponent() {
  const { items, addItem } = useMyStore();
  
  return (
    <View>
      {items.map((item) => (
        <Text key={item.id}>{item.name}</Text>
      ))}
    </View>
  );
}
```

---

## Common Patterns

### FlatList with Optimization

```tsx
const renderItem = useCallback(({ item }: { item: MyItem }) => (
  <MyItemCard item={item} onPress={() => handlePress(item.id)} />
), [handlePress]);

const keyExtractor = useCallback((item: MyItem) => item.id, []);

return (
  <FlatList
    data={items}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    contentContainerStyle={styles.listContent}
    ItemSeparatorComponent={() => <View style={styles.separator} />}
    ListEmptyComponent={<EmptyState />}
    refreshing={isRefreshing}
    onRefresh={refetch}
  />
);
```

### Form with Validation

```tsx
const [formData, setFormData] = useState({ name: '', email: '' });
const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

const validateForm = (): boolean => {
  const newErrors: typeof errors = {};
  
  if (!formData.name.trim()) {
    newErrors.name = '이름을 입력해주세요';
  }
  
  if (!formData.email.includes('@')) {
    newErrors.email = '유효한 이메일을 입력해주세요';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    await submitForm(formData);
  } catch (error) {
    // Handle error
  }
};
```

### Conditional Rendering

```tsx
// Loading state
if (isLoading) {
  return <LoadingSpinner fullScreen />;
}

// Error state
if (error) {
  return <ErrorMessage message="오류가 발생했습니다" onRetry={refetch} />;
}

// Empty state
if (!data || data.length === 0) {
  return <EmptyState message="데이터가 없습니다" />;
}

// Success state
return <DataList data={data} />;
```

### Modal Pattern

```tsx
const [isVisible, setIsVisible] = useState(false);

return (
  <>
    <Button onPress={() => setIsVisible(true)}>Open Modal</Button>
    
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal content */}
          <Button onPress={() => setIsVisible(false)}>Close</Button>
        </View>
      </View>
    </Modal>
  </>
);
```

---

## Accessibility Quick Reference

```tsx
// Button
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="예약 확인"
  accessibilityHint="예약 상세 정보를 확인합니다"
  onPress={handlePress}
>
  <Text>예약 보기</Text>
</TouchableOpacity>

// Image
<Image
  source={{ uri }}
  accessibilityRole="image"
  accessibilityLabel="아티스트 프로필 사진"
/>

// Text Input
<TextInput
  accessibilityLabel="이메일 주소"
  accessibilityHint="이메일 주소를 입력하세요"
  placeholder="email@example.com"
/>

// Alert/Announcement
<View accessible={true} accessibilityRole="alert">
  <Text>예약이 확정되었습니다</Text>
</View>
```

---

## Common Utilities

### Formatters

```typescript
// Currency
export function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

// Date
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Time
export function formatTime(time: string): string {
  return new Date(time).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Phone Number
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}
```

### Validation

```typescript
// Email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Phone Number (Korean)
export function isValidPhoneNumber(phone: string): boolean {
  return /^01[0-9]-?\d{4}-?\d{4}$/.test(phone);
}

// Business Registration Number (Korean)
export function isValidBusinessNumber(number: string): boolean {
  return /^\d{3}-\d{2}-\d{5}$/.test(number);
}
```

---

## Testing Quick Reference

### Component Test

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
  
  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<MyComponent title="Test" onPress={onPress} />);
    
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Test

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyData } from './myData';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useMyData', () => {
  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useMyData(), { wrapper });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

---

## Performance Checklist

- [ ] Use `StyleSheet.create()` instead of inline styles
- [ ] Memoize components with `memo` when appropriate
- [ ] Use `useCallback` for event handlers passed to children
- [ ] Use `useMemo` for expensive calculations
- [ ] Use `FlatList` for long lists (not `ScrollView`)
- [ ] Implement `getItemLayout` for `FlatList` when possible
- [ ] Use `FastImage` for images with caching
- [ ] Lazy load heavy components
- [ ] Optimize images before upload
- [ ] Use React Query for data caching

---

## Common Mistakes to Avoid

❌ **Don't**: Use inline styles
```tsx
<View style={{ padding: 16, backgroundColor: '#fff' }} />
```

✅ **Do**: Use StyleSheet and design tokens
```tsx
const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
});
<View style={styles.container} />
```

---

❌ **Don't**: Hardcode strings
```tsx
<Text>예약하기</Text>
```

✅ **Do**: Use i18n
```tsx
<Text>{t('booking.submit')}</Text>
```

---

❌ **Don't**: Use `any` type
```tsx
function processData(data: any) { }
```

✅ **Do**: Use proper types
```tsx
function processData(data: MyDataType) { }
```

---

❌ **Don't**: Forget accessibility
```tsx
<TouchableOpacity onPress={handlePress}>
  <Text>Click me</Text>
</TouchableOpacity>
```

✅ **Do**: Add accessibility labels
```tsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="예약 확인"
  onPress={handlePress}
>
  <Text>Click me</Text>
</TouchableOpacity>
```

---

## File Structure Example

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   └── bookings/
│       ├── BookingCard.tsx
│       ├── BookingStatusBadge.tsx
│       └── BookingsList.tsx
├── screens/
│   ├── BookingsListScreen.tsx
│   └── BookingDetailScreen.tsx
├── query/
│   └── bookings.ts
├── store/
│   └── authStore.ts
├── theme/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── borderRadius.ts
│   ├── shadows.ts
│   └── index.ts
└── utils/
    ├── formatters.ts
    └── validators.ts
```

---

**Quick Reference Version**: 1.0  
**Last Updated**: December 2024

