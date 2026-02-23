import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

import { useDebounce } from '../../hooks/useDebounce';
import { searchKeyword } from '../../services/kakaoService';
import { borderRadius, colors, spacing } from '../../theme';
import type { KeywordSearchResult } from '../../types/kakao';

interface AddressSearchBarProps {
  /** Callback when a search result is selected */
  onResultSelect: (result: KeywordSearchResult) => void;
  /** Current location for biasing search results (optional) */
  currentLocation?: { latitude: number; longitude: number };
  /** Placeholder text */
  placeholder?: string;
  /** Test ID for testing */
  testID?: string;
}

const DEBOUNCE_DELAY = 300;
const MIN_QUERY_LENGTH = 2;

export function AddressSearchBar({
  onResultSelect,
  currentLocation,
  placeholder = '주소 또는 장소 검색',
  testID,
}: AddressSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KeywordSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInputType>(null);

  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < MIN_QUERY_LENGTH) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const searchResults = await searchKeyword(debouncedQuery, currentLocation);
        setResults(searchResults);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, currentLocation]);

  const handleResultPress = useCallback(
    (result: KeywordSearchResult) => {
      // Show the selected place name in the input
      setQuery(result.placeName);
      // Clear results and unfocus to hide dropdown
      setResults([]);
      setIsFocused(false);
      // Blur the input to dismiss keyboard
      inputRef.current?.blur();
      onResultSelect(result);
    },
    [onResultSelect]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Delay (150ms) blur handling to allow onPress events on dropdown items to fire first
  // before hiding the dropdown. Without this delay, the dropdown would close before the
  // tap event is registered on iOS/Android, preventing result selection.
  const BLUR_DELAY_MS = 150;
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
    }, BLUR_DELAY_MS);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  const renderSearchResult = useCallback(
    ({ item }: { item: KeywordSearchResult }) => (
      <Pressable
        style={({ pressed }) => [styles.resultItem, pressed && styles.resultItemPressed]}
        onPress={() => handleResultPress(item)}
      >
        <View style={styles.resultContent}>
          <Text style={styles.placeName} numberOfLines={1}>
            {item.placeName}
          </Text>
          <Text style={styles.addressName} numberOfLines={1}>
            {item.roadAddressName || item.addressName}
          </Text>
          {item.category && (
            <Text style={styles.category} numberOfLines={1}>
              {item.category}
            </Text>
          )}
        </View>
      </Pressable>
    ),
    [handleResultPress]
  );

  const keyExtractor = useCallback((item: KeywordSearchResult) => item.id, []);

  return (
    <View style={styles.container} testID={testID}>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <SearchIcon />
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            // Remove focus outline on web
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
          ]}
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
        {!isSearching && query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <ClearIcon />
          </TouchableOpacity>
        )}
      </View>

      {isFocused && results.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
}

function SearchIcon() {
  return (
    <View style={styles.searchIcon}>
      <View style={styles.searchCircle} />
      <View style={styles.searchHandle} />
    </View>
  );
}

function ClearIcon() {
  return (
    <View style={styles.clearIcon}>
      <View style={styles.clearLine1} />
      <View style={styles.clearLine2} />
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
    height: 48,
    gap: spacing.sm,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    maxHeight: 250,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  resultItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultItemPressed: {
    backgroundColor: colors.surface,
  },
  resultContent: {
    gap: 2,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  addressName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Search icon styles
  searchIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    backgroundColor: 'transparent',
  },
  searchHandle: {
    position: 'absolute',
    width: 6,
    height: 2,
    backgroundColor: colors.textSecondary,
    bottom: 1,
    right: 1,
    transform: [{ rotate: '45deg' }],
  },
  // Clear icon styles
  clearIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearLine1: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: colors.textSecondary,
    transform: [{ rotate: '45deg' }],
  },
  clearLine2: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: colors.textSecondary,
    transform: [{ rotate: '-45deg' }],
  },
});
