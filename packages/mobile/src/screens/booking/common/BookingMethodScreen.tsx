import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BookingLayout, OptionCard } from '../../../components/booking';
import {
  type BookingMethodType,
  bookingMethodOptions2,
  bookingMethodOptions3,
  bookingMethodStrings,
} from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { spacing } from '../../../theme';

interface BookingMethodScreenProps {
  onContinue: (method: BookingMethodType) => void;
  onBack?: () => void;
  progress: number;
  /** Use 3-option variant (for direct flow) */
  variant?: '2-option' | '3-option';
}

export function BookingMethodScreen({
  onContinue,
  onBack,
  progress,
  variant = '2-option',
}: BookingMethodScreenProps) {
  const { bookingMethod, setBookingMethod } = useBookingFlowStore();

  const options = variant === '3-option' ? bookingMethodOptions3 : bookingMethodOptions2;

  const handleSelect = (method: BookingMethodType) => {
    setBookingMethod(method);
    onContinue(method);
  };

  return (
    <BookingLayout
      title={bookingMethodStrings.title}
      subtitle={bookingMethodStrings.subtitle}
      showCloseButton={Boolean(onBack)}
      onClose={onBack}
      scrollable={false}
      testID="booking-method-screen"
    >
      <FlatList
        data={options}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OptionCard
            label={item.label}
            description={item.description}
            selected={bookingMethod === item.id}
            onPress={() => handleSelect(item.id)}
            testID={`booking-method-${item.id}`}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
});
