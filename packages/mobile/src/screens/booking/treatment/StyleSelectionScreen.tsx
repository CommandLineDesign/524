import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BookingLayout, ContinueButton, StyleCard } from '../../../components/booking';
import {
  defaultStyleOptions,
  flowConfig,
  styleSelectionStrings,
} from '../../../constants/bookingOptions';
import {
  pickBookingReferencePhoto,
  uploadBookingReferencePhoto,
} from '../../../services/bookingReferencePhotoUploadService';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { colors, spacing } from '../../../theme';

interface StyleSelectionScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onExit?: () => void;
  showBackButton?: boolean;
  progress: number;
}

export function StyleSelectionScreen({
  onContinue,
  onBack,
  onExit,
  showBackButton = false,
  progress,
}: StyleSelectionScreenProps) {
  const { selectedStyles, addStyle, removeStyle, customStyleImage, setCustomStyleImage } =
    useBookingFlowStore();

  const [isUploading, setIsUploading] = useState(false);

  const maxSelections = flowConfig.maxStyleSelections;
  const canSelectMore = selectedStyles.length < maxSelections;

  const handleStyleToggle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      removeStyle(styleId);
    } else if (canSelectMore) {
      addStyle(styleId);
    }
  };

  const handleUploadPress = async () => {
    // If image already selected, allow removal
    if (customStyleImage) {
      Alert.alert('이미지 삭제', '업로드한 스타일 이미지를 삭제하시겠어요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => setCustomStyleImage(null),
        },
      ]);
      return;
    }

    try {
      // Pick image from gallery
      const asset = await pickBookingReferencePhoto();
      if (!asset) return; // User cancelled

      setIsUploading(true);

      // Upload to S3
      const result = await uploadBookingReferencePhoto(asset.uri);

      // Store the public URL
      setCustomStyleImage(result.publicUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '이미지 업로드에 실패했습니다. 다시 시도해주세요.';
      Alert.alert('업로드 실패', message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = () => {
    // Style selection is optional, so we can always continue
    onContinue();
  };

  const hasAnySelection = selectedStyles.length > 0 || Boolean(customStyleImage);

  // Determine upload card state
  const hasUploadedImage = Boolean(customStyleImage);
  const uploadLabel = isUploading
    ? '업로드 중...'
    : hasUploadedImage
      ? '내 이미지'
      : styleSelectionStrings.uploadFromGallery;

  return (
    <BookingLayout
      title={styleSelectionStrings.title}
      subtitle={styleSelectionStrings.subtitle}
      showCloseButton={Boolean(onExit)}
      onClose={onExit}
      onBack={onBack}
      showBackButton={showBackButton}
      footer={
        <ContinueButton
          label={hasAnySelection ? '다음' : '건너뛰기'}
          onPress={handleContinue}
          disabled={isUploading}
        />
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
          {/* Upload card - shows uploaded image or upload prompt */}
          <StyleCard
            id="upload"
            imageUrl={customStyleImage || ''}
            label={uploadLabel}
            selected={hasUploadedImage}
            onPress={handleUploadPress}
            isUploadCard={!hasUploadedImage}
            disabled={isUploading}
            testID="style-upload"
          />

          {/* Style cards */}
          {defaultStyleOptions.map((style) => (
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
