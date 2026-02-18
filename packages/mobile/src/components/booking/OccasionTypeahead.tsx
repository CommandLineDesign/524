import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { TextInput as TextInputType } from 'react-native';

import { occasionCategories } from '../../constants/bookingOptions';
import { borderRadius, colors, spacing } from '../../theme';

// Flatten all occasions from categories into a single list
const OCCASION_OPTIONS = occasionCategories.flatMap((cat) => cat.occasions);

export interface OccasionTypeaheadProps {
  /** Currently selected occasion */
  value: string | null;
  /** Callback when an occasion is selected or custom text entered */
  onSelect: (occasion: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Test ID for testing */
  testID?: string;
}

const BLUR_DELAY_MS = 150;

export function OccasionTypeahead({
  value,
  onSelect,
  placeholder = '일정을 선택하거나 입력해주세요',
  testID,
}: OccasionTypeaheadProps) {
  const [query, setQuery] = useState(value ?? '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInputType>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with external value changes (intentionally excluding query to avoid loops)
  // biome-ignore lint/correctness/useExhaustiveDependencies: query is compared but not a dependency to avoid infinite loops
  useEffect(() => {
    if (value !== null && value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Cleanup timeout on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Filter occasions based on query
  const filteredOccasions = useMemo(() => {
    if (!query.trim()) {
      return [...OCCASION_OPTIONS];
    }
    const lowerQuery = query.toLowerCase();
    return OCCASION_OPTIONS.filter((occasion) => occasion.toLowerCase().includes(lowerQuery));
  }, [query]);

  const handleOccasionPress = useCallback(
    (occasion: string) => {
      setQuery(occasion);
      setIsFocused(false);
      inputRef.current?.blur();
      onSelect(occasion);
    },
    [onSelect]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Delay blur to allow tap events on dropdown items to fire first
  // Also save custom text if user typed something not in the list
  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      // If there's text and it's different from current value, save it
      const trimmedQuery = query.trim();
      if (trimmedQuery && trimmedQuery !== value) {
        onSelect(trimmedQuery);
      }
    }, BLUR_DELAY_MS);
  }, [query, value, onSelect]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSelect('');
  }, [onSelect]);

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const renderOccasionItem = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        style={({ pressed }) => [styles.resultItem, pressed && styles.resultItemPressed]}
        onPress={() => handleOccasionPress(item)}
        accessibilityRole="menuitem"
        accessibilityLabel={item}
      >
        <Text style={styles.occasionName}>{item}</Text>
      </Pressable>
    ),
    [handleOccasionPress]
  );

  const keyExtractor = useCallback((item: string, index: number) => `${item}-${index}`, []);

  const showDropdown = isFocused && filteredOccasions.length > 0;

  return (
    <View style={styles.container} testID={testID}>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
          value={query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel={placeholder}
          accessibilityHint="일정을 검색하고 목록에서 선택하거나 직접 입력하세요"
          accessibilityRole="combobox"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            data={filteredOccasions}
            renderItem={renderOccasionItem}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            initialNumToRender={10}
            maxToRenderPerBatch={15}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputContainerFocused: {
    borderColor: colors.borderDark,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 20,
    color: colors.muted,
  },
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  resultItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  resultItemPressed: {
    backgroundColor: colors.surface,
  },
  occasionName: {
    fontSize: 15,
    color: colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
