import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BookingLayout, ContinueButton } from '../../../components/booking';
import { celebrityInputStrings, commonStrings } from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { borderRadius, colors, spacing } from '../../../theme';

interface CelebrityResultScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onRetry?: () => void;
  progress: number;
}

export function CelebrityResultScreen({
  onContinue,
  onBack,
  onRetry,
  progress,
}: CelebrityResultScreenProps) {
  const { celebrities, resultCelebrity, setResultCelebrity } = useBookingFlowStore();

  // Determine the result celebrity based on inputs
  // In a real app, this would be an AI/algorithm result
  const displayCelebrity = useMemo(() => {
    if (resultCelebrity) return resultCelebrity;

    // Priority: lookalike > similarImage > admire
    const celebrity = celebrities.lookalike || celebrities.similarImage || celebrities.admire;

    if (celebrity) {
      setResultCelebrity(celebrity);
      return celebrity;
    }

    return '아이유'; // Default fallback
  }, [celebrities, resultCelebrity, setResultCelebrity]);

  const handleRetry = () => {
    setResultCelebrity(null);
    if (onRetry) {
      onRetry();
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <BookingLayout
      title=""
      showCloseButton={Boolean(onBack)}
      onClose={onBack}
      footer={
        <View style={styles.footer}>
          <ContinueButton label={celebrityInputStrings.result.continue} onPress={onContinue} />
          <ContinueButton
            label={celebrityInputStrings.result.retry}
            onPress={handleRetry}
            variant="secondary"
          />
        </View>
      }
      testID="celebrity-result-screen"
    >
      <View style={styles.content}>
        {/* Result card */}
        <View style={styles.resultCard}>
          {/* Celebrity image placeholder */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>{displayCelebrity.charAt(0)}</Text>
          </View>

          {/* Result text */}
          <Text style={styles.resultTitle}>
            {celebrityInputStrings.result.title(displayCelebrity)}
          </Text>
          <Text style={styles.resultSubtitle}>{celebrityInputStrings.result.subtitle}</Text>
        </View>

        {/* Input summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>입력한 정보</Text>
          {celebrities.lookalike && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>닮은꼴</Text>
              <Text style={styles.summaryValue}>{celebrities.lookalike}</Text>
            </View>
          )}
          {celebrities.similarImage && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>원하는 이미지</Text>
              <Text style={styles.summaryValue}>{celebrities.similarImage}</Text>
            </View>
          )}
          {celebrities.admire && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>예쁘다고 생각하는</Text>
              <Text style={styles.summaryValue}>{celebrities.admire}</Text>
            </View>
          )}
          {!celebrities.lookalike && !celebrities.similarImage && !celebrities.admire && (
            <Text style={styles.summaryEmpty}>입력한 정보가 없습니다</Text>
          )}
        </View>
      </View>
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  resultCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imagePlaceholderText: {
    fontSize: 48,
    fontWeight: '600',
    color: colors.muted,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resultSubtitle: {
    fontSize: 16,
    color: colors.subtle,
    textAlign: 'center',
  },
  summarySection: {
    width: '100%',
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.subtle,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  summaryEmpty: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  footer: {
    gap: spacing.sm,
  },
});
