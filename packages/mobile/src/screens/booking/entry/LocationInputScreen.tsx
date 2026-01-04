import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BookingLayout, ContinueButton } from '../../../components/booking';
import { locationStrings } from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { colors, spacing } from '../../../theme';

interface LocationInputScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onExit?: () => void;
  showBackButton?: boolean;
  progress?: number; // Keep for compatibility but don't use
}

export function LocationInputScreen({
  onContinue,
  onBack,
  onExit,
  showBackButton = false,
}: LocationInputScreenProps) {
  const { location, setLocation } = useBookingFlowStore();
  const [inputValue, setInputValue] = useState(location ?? '');
  const [isFocused, setIsFocused] = useState(false);

  const handleContinue = () => {
    if (inputValue.trim()) {
      setLocation(inputValue.trim());
      onContinue();
    }
  };

  return (
    <BookingLayout
      showCloseButton={Boolean(onExit)}
      onClose={onExit}
      onBack={onBack}
      showBackButton={showBackButton}
      scrollable={false}
      footer={
        <ContinueButton label="계속" onPress={handleContinue} disabled={!inputValue.trim()} />
      }
      testID="location-input-screen"
    >
      <View style={styles.content}>
        <View style={styles.inputWrapper}>
          {/* Label */}
          <Text style={styles.label}>위치</Text>

          {/* Input Container */}
          <View style={styles.inputRow}>
            <View style={styles.searchIconContainer}>
              <SearchIcon />
            </View>
            <TextInput
              style={[styles.input, isFocused && styles.inputFocused]}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={locationStrings.placeholder}
              placeholderTextColor={colors.textSecondary}
              selectionColor={colors.text}
              cursorColor={colors.text}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              accessibilityLabel={locationStrings.placeholder}
              accessibilityRole="search"
            />
          </View>
        </View>
      </View>
    </BookingLayout>
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

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIconContainer: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 8,
    paddingLeft: 48, // Space for the search icon
    paddingRight: spacing.md,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  inputFocused: {
    borderWidth: 3,
    borderColor: colors.borderDark,
    shadowColor: colors.borderDark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
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
    borderColor: colors.text,
    backgroundColor: 'transparent',
  },
  searchHandle: {
    position: 'absolute',
    width: 6,
    height: 2,
    backgroundColor: colors.text,
    bottom: 1,
    right: 1,
    transform: [{ rotate: '45deg' }],
  },
});
