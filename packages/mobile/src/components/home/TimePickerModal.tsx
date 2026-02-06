import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';
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

  // Reset temp values when modal opens
  const handleModalShow = useCallback(() => {
    setTempDate(initialDate);
    setTempTimeSlot(initialTimeSlot);
  }, [initialDate, initialTimeSlot]);

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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onShow={handleModalShow}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="취소"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>취소</Text>
            </TouchableOpacity>

            <Text style={styles.title}>날짜 및 시간 선택</Text>

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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.muted,
  },
  confirmButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  confirmButtonTextDisabled: {
    color: colors.muted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
});
