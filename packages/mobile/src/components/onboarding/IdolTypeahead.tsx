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

import { IDOL_LIST } from '../../constants/idols';
import { borderRadius, colors, spacing } from '../../theme';

interface IdolTypeaheadProps {
  /** Currently selected idol name */
  value: string | null;
  /** Callback when an idol is selected */
  onSelect: (idol: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Test ID for testing */
  testID?: string;
}

const BLUR_DELAY_MS = 150;

export function IdolTypeahead({
  value,
  onSelect,
  placeholder = '이름',
  testID,
}: IdolTypeaheadProps) {
  const [query, setQuery] = useState(value ?? '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInputType>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Filter idols based on query
  const filteredIdols = useMemo(() => {
    if (!query.trim()) {
      return [...IDOL_LIST];
    }
    const lowerQuery = query.toLowerCase();
    return IDOL_LIST.filter((idol) => idol.toLowerCase().includes(lowerQuery));
  }, [query]);

  const handleIdolPress = useCallback(
    (idol: string) => {
      setQuery(idol);
      setIsFocused(false);
      inputRef.current?.blur();
      onSelect(idol);
    },
    [onSelect]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Delay blur to allow tap events on dropdown items to fire first
  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, BLUR_DELAY_MS);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    onSelect('');
  }, [onSelect]);

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const renderIdolItem = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        style={({ pressed }) => [styles.resultItem, pressed && styles.resultItemPressed]}
        onPress={() => handleIdolPress(item)}
        accessibilityRole="menuitem"
        accessibilityLabel={item}
      >
        <Text style={styles.idolName}>{item}</Text>
      </Pressable>
    ),
    [handleIdolPress]
  );

  const keyExtractor = useCallback((item: string) => item, []);

  const showDropdown = isFocused && filteredIdols.length > 0;

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
          accessibilityHint="연예인 이름을 검색하고 목록에서 선택하세요"
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
            data={filteredIdols}
            renderItem={renderIdolItem}
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputContainerFocused: {
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  input: {
    flex: 1,
    fontSize: 16,
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
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  resultItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  resultItemPressed: {
    backgroundColor: colors.surface,
  },
  idolName: {
    fontSize: 16,
    color: colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
