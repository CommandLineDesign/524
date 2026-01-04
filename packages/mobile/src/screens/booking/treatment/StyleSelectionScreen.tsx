import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BookingLayout, ContinueButton, StyleCard } from '../../../components/booking';
import { flowConfig, styleSelectionStrings } from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { colors, spacing } from '../../../theme';

interface StyleSelectionScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onExit?: () => void;
  showBackButton?: boolean;
  progress: number;
}

// Mock style options - in production these would come from API
const mockStyles = [
  { id: 'style-1', imageUrl: 'https://placeholder.com/style1.jpg', label: '내추럴' },
  { id: 'style-2', imageUrl: 'https://placeholder.com/style2.jpg', label: '글래머' },
  { id: 'style-3', imageUrl: 'https://placeholder.com/style3.jpg', label: '청순' },
  { id: 'style-4', imageUrl: 'https://placeholder.com/style4.jpg', label: '섹시' },
  { id: 'style-5', imageUrl: 'https://placeholder.com/style5.jpg', label: '러블리' },
  { id: 'style-6', imageUrl: 'https://placeholder.com/style6.jpg', label: '시크' },
];

export function StyleSelectionScreen({
  onContinue,
  onBack,
  onExit,
  showBackButton = false,
  progress,
}: StyleSelectionScreenProps) {
  const { selectedStyles, addStyle, removeStyle, customStyleImage, setCustomStyleImage } =
    useBookingFlowStore();

  const maxSelections = flowConfig.maxStyleSelections;
  const canSelectMore = selectedStyles.length < maxSelections;

  const handleStyleToggle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      removeStyle(styleId);
    } else if (canSelectMore) {
      addStyle(styleId);
    }
  };

  const handleUploadPress = () => {
    // In production, this would open image picker
    // For now, we'll just set a mock image
    if (!customStyleImage) {
      setCustomStyleImage('mock-custom-image-url');
    } else {
      setCustomStyleImage(null);
    }
  };

  const handleContinue = () => {
    // Style selection is optional, so we can always continue
    onContinue();
  };

  const hasAnySelection = selectedStyles.length > 0 || Boolean(customStyleImage);

  return (
    <BookingLayout
      title={styleSelectionStrings.title}
      subtitle={styleSelectionStrings.subtitle}
      showCloseButton={Boolean(onExit)}
      onClose={onExit}
      onBack={onBack}
      showBackButton={showBackButton}
      footer={
        <ContinueButton label={hasAnySelection ? '다음' : '건너뛰기'} onPress={handleContinue} />
      }
      testID="style-selection-screen"
    >
      <View style={styles.content}>
        {/* Selection counter */}
        <Text style={styles.counter}>
          {styleSelectionStrings.selectedCount(selectedStyles.length, maxSelections)}
        </Text>

        {/* Style grid */}
        <View style={styles.grid}>
          {/* Upload card */}
          <StyleCard
            id="upload"
            imageUrl=""
            label={styleSelectionStrings.uploadFromGallery}
            selected={Boolean(customStyleImage)}
            onPress={handleUploadPress}
            isUploadCard
            testID="style-upload"
          />

          {/* Style cards */}
          {mockStyles.map((style) => (
            <StyleCard
              key={style.id}
              id={style.id}
              imageUrl={style.imageUrl}
              label={style.label}
              selected={selectedStyles.includes(style.id)}
              onPress={() => handleStyleToggle(style.id)}
              testID={`style-card-${style.id}`}
            />
          ))}
        </View>

        {/* Max selection notice */}
        {!canSelectMore && (
          <Text style={styles.maxNotice}>{styleSelectionStrings.maxSelection(maxSelections)}</Text>
        )}
      </View>
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  counter: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  maxNotice: {
    fontSize: 13,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
