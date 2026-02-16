import type { PortfolioImage, ServiceType } from '@524/shared';
import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { usePortfolioUpload } from '../../hooks/usePortfolioUpload';
import { borderRadius, colors, spacing } from '../../theme';

const GRID_GAP = spacing.sm;
const GRID_PADDING = spacing.lg;
const COLUMNS = 3;

interface PortfolioCategorySectionProps {
  title: string;
  category: ServiceType;
  images: PortfolioImage[];
  onImagesAdded: (images: PortfolioImage[]) => void;
  onImageRemoved: (index: number) => void;
  isUploading?: boolean;
  maxImages?: number;
}

export function PortfolioCategorySection({
  title,
  category,
  images,
  onImagesAdded,
  onImageRemoved,
  isUploading: externalUploading,
  maxImages = 10,
}: PortfolioCategorySectionProps) {
  const { width: screenWidth } = useWindowDimensions();

  const thumbnailSize = (screenWidth - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

  const handleImagesUploaded = useCallback(
    (newImages: PortfolioImage[]) => {
      onImagesAdded(newImages);
    },
    [onImagesAdded]
  );

  const { isUploading, uploadProgress, pickAndUploadImages } = usePortfolioUpload({
    currentCount: images.length,
    maxImages,
    serviceCategory: category,
    onImagesUploaded: handleImagesUploaded,
  });

  const uploading = isUploading || externalUploading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.grid}>
        {images.map((image, index) => (
          <View key={`${image.url}-${index}`} style={styles.thumbnailContainer}>
            <Image
              source={{ uri: image.url }}
              style={[styles.thumbnail, { width: thumbnailSize, height: thumbnailSize }]}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onImageRemoved(index)}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.addButton, uploading && styles.buttonDisabled]}
        onPress={pickAndUploadImages}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel={`Add photos for ${title}`}
      >
        <Text style={styles.addButtonText}>
          {isUploading
            ? `Uploading ${uploadProgress?.current ?? 0}/${uploadProgress?.total ?? 0}...`
            : `+ Add photos (${images.length}/${maxImages})`}
        </Text>
      </TouchableOpacity>

      {images.length === 0 && <Text style={styles.helperText}>At least one image required</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: spacing.md,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    borderRadius: borderRadius.md,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  addButton: {
    height: spacing.inputHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  helperText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.sm,
  },
});
