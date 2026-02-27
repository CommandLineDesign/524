import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, overlays, spacing } from '../../theme';
import { shadows } from '../../theme/shadows';

export type MultiSelectOption = {
  id: string;
  label: string;
  description?: string;
};

type MultiSelectButtonsProps = {
  options: MultiSelectOption[];
  selected: string[];
  onToggle: (id: string) => void;
};

export function MultiSelectButtons({ options, selected, onToggle }: MultiSelectButtonsProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = selected.includes(option.id);
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.button, isActive ? styles.buttonActive : undefined]}
            onPress={() => onToggle(option.id)}
            activeOpacity={0.85}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.label}>{option.label}</Text>
              {option.description ? (
                <Text style={styles.description}>{option.description}</Text>
              ) : null}
            </View>
            <View style={[styles.checkbox, isActive ? styles.checkboxActive : undefined]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  button: {
    height: spacing.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: overlays.frostedGlass,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  buttonActive: {
    borderWidth: 2,
    borderColor: colors.accentAlt,
    backgroundColor: colors.surfaceAlt,
  },
  buttonContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  checkboxActive: {
    borderColor: colors.accentAlt,
    backgroundColor: colors.primary,
  },
});
