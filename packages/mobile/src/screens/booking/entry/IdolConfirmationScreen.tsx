import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BookingLayout, ContinueButton } from '../../../components/booking';
import { VennDiagram } from '../../../components/onboarding/VennDiagram';
import { DEFAULT_IDOL, idolInputStrings } from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { colors, spacing } from '../../../theme';

interface IdolConfirmationScreenProps {
  onContinue: () => void;
}

export function IdolConfirmationScreen({ onContinue }: IdolConfirmationScreenProps) {
  const { celebrities, resultCelebrity, setResultCelebrity } = useBookingFlowStore();

  // Determine the result idol based on inputs (priority: lookalike > similarImage > admire)
  const displayIdol = useMemo(() => {
    if (resultCelebrity) return resultCelebrity;
    return celebrities.lookalike || celebrities.similarImage || celebrities.admire || DEFAULT_IDOL;
  }, [celebrities, resultCelebrity]);

  // Sync derived idol to store (side effect must be in useEffect, not useMemo)
  useEffect(() => {
    if (!resultCelebrity && displayIdol !== DEFAULT_IDOL) {
      setResultCelebrity(displayIdol);
    }
  }, [displayIdol, resultCelebrity, setResultCelebrity]);

  return (
    <BookingLayout
      showCloseButton={false}
      scrollable={false}
      footer={
        <ContinueButton label={idolInputStrings.result.continueButton} onPress={onContinue} />
      }
      testID="idol-confirmation-screen"
    >
      <View style={styles.content}>
        {/* Venn diagram illustration */}
        <View style={styles.diagramContainer}>
          <VennDiagram size={156} step="center" />
        </View>

        {/* Result text */}
        <Text style={styles.prefix}>{idolInputStrings.result.prefix}</Text>
        <Text style={styles.idolName}>{displayIdol}</Text>
      </View>
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagramContainer: {
    marginBottom: spacing.xl * 2,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  idolName: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
