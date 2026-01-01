import React from 'react';
import { Text, TouchableOpacity, type ViewStyle } from 'react-native';

import { formStyles } from '../../theme/formStyles';

export interface SelectionItemProps {
  /** The label text to display */
  label: string;
  /** Whether this item is currently selected */
  selected?: boolean;
  /** Callback when the item is pressed */
  onPress: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label (defaults to label) */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Custom style override */
  style?: ViewStyle;
}

/**
 * SelectionItem - A reusable component for selection lists
 *
 * Provides consistent styling for single and multi-select patterns:
 * - Unselected: 1px border, white background, black text
 * - Selected: 3px border, white background, black text
 *
 * @example
 * ```tsx
 * <SelectionItem
 *   label="헤어 메이크업"
 *   selected={selectedService === 'combo'}
 *   onPress={() => setSelectedService('combo')}
 * />
 * ```
 */
export function SelectionItem({
  label,
  selected = false,
  onPress,
  disabled = false,
  testID,
  accessibilityLabel,
  accessibilityHint,
  style,
}: SelectionItemProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected, disabled }}
      style={[
        formStyles.selectionItem,
        selected && formStyles.selectionItemSelected,
        disabled && formStyles.selectionItemDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
    >
      <Text
        style={[formStyles.selectionItemText, selected && formStyles.selectionItemTextSelected]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
