import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { monthNames, weekdayNames } from '../../constants/bookingOptions';
import { borderRadius, colors, spacing } from '../../theme';

export interface CalendarPickerProps {
  /** Currently selected date (ISO string or Date) */
  selectedDate: string | Date | null;
  /** Callback when a date is selected */
  onSelectDate: (date: string) => void;
  /** Minimum selectable date (default: today) */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Array of unavailable dates (ISO strings) */
  unavailableDates?: string[];
  /** Test ID */
  testID?: string;
}

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  unavailableDates = [],
  testID,
}: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const effectiveMinDate = minDate ?? today;

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const date = typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate;
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const selectedDateStr = useMemo(() => {
    if (!selectedDate) return null;
    const date = typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate;
    return formatDateKey(date);
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentMonth);
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const canGoPrevious = useMemo(() => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastDayOfPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    return lastDayOfPrevMonth >= effectiveMinDate;
  }, [currentMonth, effectiveMinDate]);

  const canGoNext = useMemo(() => {
    if (!maxDate) return true;
    const firstDayOfNextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    return firstDayOfNextMonth <= maxDate;
  }, [currentMonth, maxDate]);

  const isDateSelectable = (date: Date): boolean => {
    if (date < effectiveMinDate) return false;
    if (maxDate && date > maxDate) return false;
    if (unavailableDates.includes(formatDateKey(date))) return false;
    return true;
  };

  const handleDatePress = (date: Date) => {
    if (!isDateSelectable(date)) return;
    onSelectDate(date.toISOString());
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Header with month navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          disabled={!canGoPrevious}
          style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
          accessibilityLabel="Previous month"
          accessibilityRole="button"
        >
          <Text style={[styles.navButtonText, !canGoPrevious && styles.navButtonTextDisabled]}>
            {'<'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.monthLabel}>
          {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
        </Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          disabled={!canGoNext}
          style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
          accessibilityLabel="Next month"
          accessibilityRole="button"
        >
          <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>
            {'>'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {weekdayNames.map((name) => (
          <View key={name} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.daysGrid}>
        {calendarDays.map((day, index) => {
          if (!day) {
            // biome-ignore lint/suspicious/noArrayIndexKey: Empty cells are purely decorative placeholders that maintain static positions in the calendar grid
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dateKey = formatDateKey(day);
          const isSelected = dateKey === selectedDateStr;
          const isSelectable = isDateSelectable(day);
          const isToday = dateKey === formatDateKey(today);

          return (
            <TouchableOpacity
              key={dateKey}
              style={[styles.dayCell, isSelected && styles.dayCellSelected]}
              onPress={() => handleDatePress(day)}
              disabled={!isSelectable}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: !isSelectable }}
              accessibilityLabel={`${day.getMonth() + 1}월 ${day.getDate()}일`}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  !isSelectable && styles.dayTextDisabled,
                  isToday && !isSelected && styles.dayTextToday,
                ]}
              >
                {day.getDate()}
              </Text>
              {isToday && !isSelected && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function generateCalendarDays(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // First day of the month
  const firstDay = new Date(year, monthIndex, 1);
  const firstDayOfWeek = firstDay.getDay();

  // Last day of the month
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days: (Date | null)[] = [];

  // Add empty cells for days before the first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, monthIndex, day));
  }

  return days;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  navButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  navButtonTextDisabled: {
    color: colors.muted,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayCellSelected: {
    backgroundColor: colors.text,
    borderRadius: borderRadius.full,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '400',
  },
  dayTextSelected: {
    color: colors.background,
    fontWeight: '500',
  },
  dayTextDisabled: {
    color: colors.border,
  },
  dayTextToday: {
    fontWeight: '600',
    color: colors.text,
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
