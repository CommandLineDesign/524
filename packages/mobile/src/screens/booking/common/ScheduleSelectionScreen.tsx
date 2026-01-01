import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BookingLayout,
  CalendarPicker,
  ContinueButton,
  TimeSlotGrid,
} from '../../../components/booking';
import { commonStrings, scheduleStrings } from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { colors, spacing } from '../../../theme';

interface ScheduleSelectionScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  progress: number;
}

export function ScheduleSelectionScreen({
  onContinue,
  onBack,
  progress,
}: ScheduleSelectionScreenProps) {
  const { selectedDate, selectedTimeSlot, setSelectedDate, setSelectedTimeSlot } =
    useBookingFlowStore();

  // Local state for the form
  const [localDate, setLocalDate] = useState<string | null>(selectedDate);
  const [localTimeSlot, setLocalTimeSlot] = useState<string | null>(selectedTimeSlot);

  const handleDateSelect = (date: string) => {
    setLocalDate(date);
  };

  const handleTimeSlotSelect = (slot: string) => {
    setLocalTimeSlot(slot);
  };

  const handleContinue = () => {
    if (localDate && localTimeSlot) {
      // Combine date and time into ISO string
      const dateObj = new Date(localDate);
      const [hours, minutes] = localTimeSlot.split(':').map(Number);
      dateObj.setHours(hours, minutes, 0, 0);

      setSelectedDate(dateObj.toISOString());
      setSelectedTimeSlot(localTimeSlot);
      onContinue();
    }
  };

  const isValid = Boolean(localDate && localTimeSlot);

  // Calculate min date (today) and max date (3 months from now)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  return (
    <BookingLayout
      title={scheduleStrings.title}
      showCloseButton={Boolean(onBack)}
      onClose={onBack}
      scrollable={false}
      footer={
        <ContinueButton
          label={commonStrings.continue}
          onPress={handleContinue}
          disabled={!isValid}
        />
      }
      testID="schedule-selection-screen"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Calendar Section */}
        <View style={styles.section}>
          <CalendarPicker
            selectedDate={localDate}
            onSelectDate={handleDateSelect}
            minDate={today}
            maxDate={maxDate}
            testID="schedule-calendar"
          />
        </View>

        {/* Time Slots Section */}
        <View style={styles.section}>
          <TimeSlotGrid
            selectedSlot={localTimeSlot}
            onSelectSlot={handleTimeSlotSelect}
            unavailableSlots={[]}
            testIDPrefix="schedule-timeslot"
          />
        </View>
      </ScrollView>
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
});
