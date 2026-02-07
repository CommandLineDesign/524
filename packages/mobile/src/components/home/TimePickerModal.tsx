import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { borderRadius, colors, spacing, typography } from '../../theme';
import { CalendarPicker } from '../booking/CalendarPicker';
import { TimeSlotGrid } from '../booking/TimeSlotGrid';

export interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate: string | null;
  initialTimeSlot: string | null;
  onTimeSelect: (date: string, timeSlot: string) => void;
}

export function TimePickerModal({
  visible,
  onClose,
  initialDate,
  initialTimeSlot,
  onTimeSelect,
}: TimePickerModalProps) {
  // Temporary state - only confirmed when user taps "Confirm"
  const [tempDate, setTempDate] = useState<string | null>(initialDate);
  const [tempTimeSlot, setTempTimeSlot] = useState<string | null>(initialTimeSlot);

  // Reset temp values when modal opens (useEffect for cross-platform support)
  useEffect(() => {
    if (visible) {
      setTempDate(initialDate);
      setTempTimeSlot(initialTimeSlot);
    }
  }, [visible, initialDate, initialTimeSlot]);

  const handleDateSelect = useCallback((date: string) => {
    setTempDate(date);
  }, []);

  const handleTimeSelect = useCallback((slot: string) => {
    setTempTimeSlot(slot);
  }, []);

  const handleConfirm = useCallback(() => {
    if (tempDate && tempTimeSlot) {
      onTimeSelect(tempDate, tempTimeSlot);
    }
    onClose();
  }, [tempDate, tempTimeSlot, onTimeSelect, onClose]);

  const handleClose = useCallback(() => {
    // Reset to initial values
    setTempDate(initialDate);
    setTempTimeSlot(initialTimeSlot);
    onClose();
  }, [initialDate, initialTimeSlot, onClose]);

  // Calendar constraints
  const minDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date;
  }, []);

  const canConfirm = tempDate !== null && tempTimeSlot !== null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityLabel="닫기"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>날짜 및 시간 선택</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Calendar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>날짜</Text>
            <CalendarPicker
              selectedDate={tempDate}
              onSelectDate={handleDateSelect}
              minDate={minDate}
              maxDate={maxDate}
            />
          </View>

          {/* Time slots */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시간</Text>
            <TimeSlotGrid selectedSlot={tempTimeSlot} onSelectSlot={handleTimeSelect} />
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.cancelButton}
            accessibilityLabel="취소"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
            disabled={!canConfirm}
            accessibilityLabel="확인"
            accessibilityRole="button"
          >
            <Text
              style={[styles.confirmButtonText, !canConfirm && styles.confirmButtonTextDisabled]}
            >
              확인
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
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
  confirmButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.muted,
  },
  confirmButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.background,
  },
  confirmButtonTextDisabled: {
    color: colors.background,
  },
});
