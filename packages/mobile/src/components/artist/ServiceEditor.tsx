import type { ArtistServiceOffering } from '@524/shared';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';
import { formStyles } from '../../theme/formStyles';

export interface ServiceEditorProps {
  services: ArtistServiceOffering[];
  onChange: (services: ArtistServiceOffering[]) => void;
}

export function ServiceEditor({ services, onChange }: ServiceEditorProps) {
  const handleAddService = () => {
    onChange([...services, { name: '', description: '', price: 0 }]);
  };

  const handleRemoveService = (index: number) => {
    onChange(services.filter((_, i) => i !== index));
  };

  const handleUpdateService = (
    index: number,
    field: keyof ArtistServiceOffering,
    value: string
  ) => {
    const updated = [...services];
    if (field === 'price') {
      const numValue = Number.parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
      updated[index] = { ...updated[index], price: numValue };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange(updated);
  };

  const formatPrice = (price: number): string => {
    if (price === 0) return '';
    return price.toLocaleString();
  };

  return (
    <View style={styles.container}>
      {services.map((service, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Items are edited in place, not reordered; index is stable
        <View key={`service-${index}`} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceNumber}>Service {index + 1}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveService(index)}
              style={styles.removeServiceButton}
              accessibilityRole="button"
              accessibilityLabel={`Remove service ${index + 1}`}
            >
              <Text style={styles.removeServiceText}>Remove</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={formStyles.label}>Name</Text>
            <TextInput
              value={service.name}
              onChangeText={(text) => handleUpdateService(index, 'name', text)}
              placeholder="e.g., Bridal Makeup"
              placeholderTextColor={colors.muted}
              style={formStyles.input}
              accessibilityLabel={`Service ${index + 1} name`}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={formStyles.label}>Description (optional)</Text>
            <TextInput
              value={service.description ?? ''}
              onChangeText={(text) => handleUpdateService(index, 'description', text)}
              placeholder="Brief description of the service"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={2}
              style={[formStyles.input, styles.descriptionInput]}
              accessibilityLabel={`Service ${index + 1} description`}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={formStyles.label}>Price (₩)</Text>
            <TextInput
              value={formatPrice(service.price)}
              onChangeText={(text) => handleUpdateService(index, 'price', text)}
              placeholder="50,000"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              style={formStyles.input}
              accessibilityLabel={`Service ${index + 1} price`}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddService}
        accessibilityRole="button"
        accessibilityLabel="Add new service"
      >
        <Text style={styles.addButtonText}>+ Add Service</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  serviceNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  removeServiceButton: {
    padding: spacing.xs,
  },
  removeServiceText: {
    fontSize: 14,
    color: colors.error,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  descriptionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  addButton: {
    height: spacing.inputHeight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
