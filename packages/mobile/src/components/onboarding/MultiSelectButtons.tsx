import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../theme';
import { spacing } from '../../theme';

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
              <Text style={[styles.label, isActive ? styles.labelActive : undefined]}>
                {option.label}
              </Text>
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
  container: {},
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  buttonActive: {
    borderColor: colors.accent,
    backgroundColor: '#fff8ed',
  },
  buttonContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  labelActive: {
    color: colors.accent,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  checkboxActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
});
