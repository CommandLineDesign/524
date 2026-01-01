import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { BookingLayout, ContinueButton } from '../../../components/booking';
import { celebrityInputStrings, commonStrings } from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { borderRadius, colors, spacing } from '../../../theme';

type CelebrityStep = 1 | 2 | 3;

interface CelebrityInputScreenProps {
  step: CelebrityStep;
  onContinue: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  progress: number;
}

const stepConfig = {
  1: {
    strings: celebrityInputStrings.step1,
    storeKey: 'setCelebrityLookalike' as const,
    valueKey: 'lookalike' as const,
  },
  2: {
    strings: celebrityInputStrings.step2,
    storeKey: 'setCelebritySimilarImage' as const,
    valueKey: 'similarImage' as const,
  },
  3: {
    strings: celebrityInputStrings.step3,
    storeKey: 'setCelebrityAdmire' as const,
    valueKey: 'admire' as const,
  },
};

export function CelebrityInputScreen({
  step,
  onContinue,
  onBack,
  onSkip,
  progress,
}: CelebrityInputScreenProps) {
  const store = useBookingFlowStore();
  const config = stepConfig[step];
  const currentValue = store.celebrities[config.valueKey];
  const [inputValue, setInputValue] = useState(currentValue ?? '');
  const [isFocused, setIsFocused] = useState(false);

  const handleContinue = () => {
    const setter = store[config.storeKey];
    if (inputValue.trim()) {
      setter(inputValue.trim());
    }
    onContinue();
  };

  const handleSkip = () => {
    const setter = store[config.storeKey];
    setter(null);
    if (onSkip) {
      onSkip();
    } else {
      onContinue();
    }
  };

  return (
    <BookingLayout
      title={config.strings.title}
      subtitle={config.strings.subtitle}
      showCloseButton={Boolean(onBack)}
      onClose={onBack}
      footer={
        <View style={styles.footer}>
          <ContinueButton label={commonStrings.continue} onPress={handleContinue} />
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityLabel={config.strings.skip}
            accessibilityRole="button"
          >
            <Text style={styles.skipButtonText}>{config.strings.skip}</Text>
          </TouchableOpacity>
        </View>
      }
      testID={`celebrity-input-step-${step}`}
    >
      <View style={styles.content}>
        {/* Input field */}
        <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={config.strings.placeholder}
            placeholderTextColor={colors.muted}
            selectionColor={colors.text}
            cursorColor={colors.text}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            accessibilityLabel={config.strings.placeholder}
          />
          {inputValue.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setInputValue('')}
              accessibilityLabel="Clear input"
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions (placeholder for future) */}
        {inputValue.length >= 2 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>추천</Text>
            {/* In production, this would show API suggestions */}
            <View style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>{inputValue}</Text>
            </View>
          </View>
        )}
      </View>
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderWidth: 3,
    borderColor: colors.borderDark,
    shadowColor: colors.borderDark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: spacing.inputHeight,
    fontSize: 16,
    color: colors.text,
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
  suggestionsContainer: {
    marginTop: spacing.lg,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    gap: spacing.sm,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
