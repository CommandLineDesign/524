import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BookingLayout, ContinueButton } from '../../../components/booking';
import { IdolTypeahead } from '../../../components/onboarding/IdolTypeahead';
import { VennDiagram } from '../../../components/onboarding/VennDiagram';
import { idolInputStrings } from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { colors, spacing } from '../../../theme';

type IdolStep = 1 | 2 | 3;

interface IdolQuestionScreenProps {
  step: IdolStep;
  onContinue: () => void;
}

const stepConfig = {
  1: {
    strings: idolInputStrings.step1,
    storeKey: 'setCelebrityLookalike' as const,
    valueKey: 'lookalike' as const,
  },
  2: {
    strings: idolInputStrings.step2,
    storeKey: 'setCelebritySimilarImage' as const,
    valueKey: 'similarImage' as const,
  },
  3: {
    strings: idolInputStrings.step3,
    storeKey: 'setCelebrityAdmire' as const,
    valueKey: 'admire' as const,
  },
};

export function IdolQuestionScreen({ step, onContinue }: IdolQuestionScreenProps) {
  const store = useBookingFlowStore();
  const config = stepConfig[step];
  const currentValue = store.celebrities[config.valueKey];
  const [selectedIdol, setSelectedIdol] = useState<string | null>(currentValue);

  const handleIdolSelect = (idol: string) => {
    setSelectedIdol(idol || null);
  };

  const handleContinue = () => {
    if (selectedIdol) {
      const setter = store[config.storeKey];
      setter(selectedIdol);
      onContinue();
    }
  };

  const isButtonDisabled = !selectedIdol;

  return (
    <BookingLayout
      showCloseButton={false}
      scrollable={false}
      footer={<ContinueButton label="다음" onPress={handleContinue} disabled={isButtonDisabled} />}
      testID={`idol-question-step-${step}`}
    >
      <View style={styles.content}>
        {/* Venn diagram illustration */}
        <View style={styles.diagramContainer}>
          <VennDiagram size={156} step={step} />
        </View>

        {/* Question label */}
        <Text style={styles.label}>{config.strings.label}</Text>

        {/* Idol typeahead dropdown */}
        <IdolTypeahead
          value={selectedIdol}
          onSelect={handleIdolSelect}
          placeholder={config.strings.placeholder}
          testID={`idol-typeahead-step-${step}`}
        />
      </View>
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  diagramContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
});
