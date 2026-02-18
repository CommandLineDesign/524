/**
 * @deprecated TEMPORARILY UNUSED
 *
 * This screen has been disabled in favor of a simplified artist pricing model
 * where artists set fixed prices for hair and makeup services.
 *
 * The treatment selection step is skipped in the booking flow:
 * - Celebrity flow: artistList -> styleSelection (skips treatmentSelection)
 * - Direct flow: artistList -> styleSelection (skips treatmentSelection)
 * - Home entry flow: starts at styleSelection (skips treatmentSelection)
 *
 * This code is retained for potential future restoration of detailed
 * treatment/service selection functionality.
 *
 * See: BookingFlowScreen.tsx, bookingFlowStore.ts for flow configuration
 */
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  BookingLayout,
  CategoryChips,
  ContinueButton,
  TreatmentOption,
} from '../../../components/booking';
import {
  type TreatmentCategory,
  sampleTreatments,
  treatmentCategories,
  treatmentSelectionStrings,
} from '../../../constants/bookingOptions';
import { type SelectedTreatment, useBookingFlowStore } from '../../../store/bookingFlowStore';
import { borderRadius, colors, spacing } from '../../../theme';

interface TreatmentSelectionScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onExit?: () => void;
  showBackButton?: boolean;
  progress: number;
}

export function TreatmentSelectionScreen({
  onContinue,
  onBack,
  onExit,
  showBackButton = false,
  progress,
}: TreatmentSelectionScreenProps) {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedTreatments,
    addTreatment,
    removeTreatment,
    totalAmount,
    estimatedDuration,
  } = useBookingFlowStore();

  // Filter treatments by selected category
  const displayTreatments = React.useMemo(() => {
    if (!selectedCategory) return sampleTreatments;
    return sampleTreatments.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId as TreatmentCategory);
  };

  const handleTreatmentToggle = (treatment: (typeof sampleTreatments)[0]) => {
    const isSelected = selectedTreatments.some((t) => t.id === treatment.id);
    if (isSelected) {
      removeTreatment(treatment.id);
    } else {
      const selectedTreatment: SelectedTreatment = {
        id: treatment.id,
        name: treatment.name,
        price: treatment.price,
        durationMinutes: treatment.durationMinutes,
        category: treatment.category,
      };
      addTreatment(selectedTreatment);
    }
  };

  const handleContinue = () => {
    if (selectedTreatments.length > 0) {
      onContinue();
    }
  };

  const categoryChips = treatmentCategories.map((cat) => ({
    id: cat.id,
    label: cat.label,
  }));

  const hasSelection = selectedTreatments.length > 0;

  return (
    <BookingLayout
      title={treatmentSelectionStrings.title}
      subtitle={treatmentSelectionStrings.subtitle}
      showCloseButton={Boolean(onExit)}
      onClose={onExit}
      onBack={onBack}
      showBackButton={showBackButton}
      scrollable={false}
      footer={
        <View style={styles.footerContent}>
          {/* Summary */}
          {hasSelection && (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {treatmentSelectionStrings.selectedCount(selectedTreatments.length)}
                </Text>
                <Text style={styles.summaryValue}>
                  {treatmentSelectionStrings.totalPrice(totalAmount)}
                </Text>
              </View>
              <Text style={styles.summaryDuration}>
                {treatmentSelectionStrings.estimatedTime(estimatedDuration)}
              </Text>
            </View>
          )}
          <ContinueButton label="다음" onPress={handleContinue} disabled={!hasSelection} />
        </View>
      }
      testID="treatment-selection-screen"
    >
      <View style={styles.content}>
        {/* Category chips */}
        <View style={styles.categorySection}>
          <CategoryChips
            chips={categoryChips}
            selectedId={selectedCategory}
            onSelect={handleCategorySelect}
            testIDPrefix="category"
          />
        </View>

        {/* Treatment list */}
        <FlatList
          data={displayTreatments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TreatmentOption
              name={item.name}
              description={item.description}
              price={item.price}
              durationMinutes={item.durationMinutes}
              selected={selectedTreatments.some((t) => t.id === item.id)}
              onToggle={() => handleTreatmentToggle(item)}
              testID={`treatment-${item.id}`}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>시술 항목이 없습니다</Text>
            </View>
          }
        />
      </View>
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  categorySection: {
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.md,
  },
  separator: {
    height: spacing.sm,
  },
  footerContent: {
    gap: spacing.md,
  },
  summary: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryDuration: {
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
  },
});
