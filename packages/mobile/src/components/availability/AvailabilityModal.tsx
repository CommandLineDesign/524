import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useArtistAvailability, useUpdateAvailability } from '../../query/availability';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { getCurrentWeekId, getPreviousWeekId } from '../../utils/weekUtils';
import { AvailabilitySelector } from './AvailabilitySelector';

export interface AvailabilityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (weekId: string, slots: string[]) => void;
  initialWeekId?: string;
}

export function AvailabilityModal({
  visible,
  onClose,
  onSave,
  initialWeekId,
}: AvailabilityModalProps) {
  const [currentWeekId, setCurrentWeekId] = useState(initialWeekId || getCurrentWeekId());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current week's availability
  const {
    data: availability,
    isLoading,
    isFetching,
  } = useArtistAvailability(currentWeekId, visible);

  // Fetch previous week's availability for copy feature
  const previousWeekId = getPreviousWeekId(currentWeekId);
  const { data: previousAvailability } = useArtistAvailability(previousWeekId, visible);

  // Update mutation
  const { mutateAsync: updateAvailability, isPending: isSaving } = useUpdateAvailability();

  // Reset state when modal opens or week changes
  useEffect(() => {
    if (visible && availability) {
      setSelectedSlots(new Set(availability.slots));
      setHasChanges(false);
    }
  }, [visible, availability]);

  // Reset to initial week when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentWeekId(initialWeekId || getCurrentWeekId());
    }
  }, [visible, initialWeekId]);

  const handleSlotsChange = useCallback((slots: Set<string>) => {
    setSelectedSlots(slots);
    setHasChanges(true);
  }, []);

  const handleWeekChange = useCallback(
    async (weekId: string) => {
      // If there are unsaved changes, prompt to save first
      if (hasChanges) {
        Alert.alert('Unsaved Changes', 'Do you want to save changes before switching weeks?', [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setHasChanges(false);
              setCurrentWeekId(weekId);
            },
          },
          {
            text: 'Save',
            onPress: async () => {
              try {
                await updateAvailability({
                  weekId: currentWeekId,
                  slots: Array.from(selectedSlots),
                });
                setHasChanges(false);
                setCurrentWeekId(weekId);
              } catch {
                Alert.alert('Save Failed', 'Could not save availability. Please try again.');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
        return;
      }

      setCurrentWeekId(weekId);
    },
    [hasChanges, currentWeekId, selectedSlots, updateAvailability]
  );

  const handleClose = useCallback(() => {
    if (hasChanges) {
      Alert.alert('Unsaved Changes', 'Do you want to discard your changes?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setHasChanges(false);
            onClose();
          },
        },
      ]);
      return;
    }
    onClose();
  }, [hasChanges, onClose]);

  const handleSave = useCallback(async () => {
    try {
      const slotsArray = Array.from(selectedSlots);
      await updateAvailability({
        weekId: currentWeekId,
        slots: slotsArray,
      });

      setHasChanges(false);

      // Call the onSave callback if provided
      onSave?.(currentWeekId, slotsArray);

      Alert.alert('Saved', 'Your availability has been updated.');
    } catch {
      Alert.alert('Save Failed', 'Could not save availability. Please try again.');
    }
  }, [currentWeekId, selectedSlots, updateAvailability, onSave]);

  const previousWeekSlots = previousAvailability ? new Set(previousAvailability.slots) : undefined;

  const isProcessing = isLoading || isFetching || isSaving;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>근무 가능 시간 설정</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <AvailabilitySelector
            weekId={currentWeekId}
            selectedSlots={selectedSlots}
            onSlotsChange={handleSlotsChange}
            onWeekChange={handleWeekChange}
            previousWeekSlots={previousWeekSlots}
            isLoading={isLoading}
            showQuickActions={true}
            showWeekNavigator={true}
            showSummary={true}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.cancelButton}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, isProcessing && styles.saveButtonDisabled]}
            disabled={isProcessing}
            accessibilityLabel="Save"
            accessibilityRole="button"
          >
            <Text style={[styles.saveButtonText, isProcessing && styles.saveButtonTextDisabled]}>
              {isSaving ? '저장 중...' : '저장'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.muted,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.background,
  },
  saveButtonTextDisabled: {
    color: colors.background,
  },
});
