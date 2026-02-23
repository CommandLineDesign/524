import type { PortfolioImage, ServiceType } from '@524/shared';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';

import { usePortfolioUpload } from '../../hooks/usePortfolioUpload';
import { borderRadius, colors, overlays, spacing } from '../../theme';

const GRID_GAP = spacing.sm;
const GRID_PADDING = spacing.lg;
const COLUMNS = 3;

export interface PortfolioImageGridProps {
  images: PortfolioImage[];
  isEditing?: boolean;
  onImagesChange?: (images: PortfolioImage[]) => void;
  maxImages?: number;
  groupByCategory?: boolean;
}

function getCategoryLabel(category: ServiceType | string): string {
  switch (category) {
    case 'hair':
      return 'Hair Styling';
    case 'makeup':
      return 'Makeup';
    case 'combo':
      return 'Combo';
    default:
      return 'Other';
  }
}

function groupImagesByCategory(images: PortfolioImage[]): Record<string, PortfolioImage[]> {
  const grouped: Record<string, PortfolioImage[]> = {};

  for (const image of images) {
    const category = image.serviceCategory || 'other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(image);
  }

  return grouped;
}

export function PortfolioImageGrid({
  images,
  isEditing = false,
  onImagesChange,
  maxImages = 10,
  groupByCategory = false,
}: PortfolioImageGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollViewType>(null);

  // Compute responsive thumbnail size based on current screen width
  const thumbnailSize = useMemo(
    () => (screenWidth - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS,
    [screenWidth]
  );

  // Use shared upload hook
  const handleImagesUploaded = useCallback(
    (newImages: PortfolioImage[]) => {
      if (onImagesChange) {
        onImagesChange([...images, ...newImages]);
      }
    },
    [images, onImagesChange]
  );

  const { isUploading, uploadProgress, pickAndUploadImages } = usePortfolioUpload({
    currentCount: images.length,
    maxImages,
    onImagesUploaded: handleImagesUploaded,
  });

  // Scroll to selected image when index changes (for arrow navigation)
  useEffect(() => {
    if (selectedImageIndex !== null && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: selectedImageIndex * screenWidth,
        animated: true,
      });
    }
  }, [selectedImageIndex, screenWidth]);

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleRemove = (index: number) => {
    if (onImagesChange) {
      onImagesChange(images.filter((_, i) => i !== index));
    }
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const goToPreviousImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  if (images.length === 0 && !isEditing) {
    return null;
  }

  // Render grouped by category
  if (groupByCategory) {
    const grouped = groupImagesByCategory(images);
    const categories = Object.keys(grouped);

    if (categories.length === 0) {
      return null;
    }

    return (
      <View style={styles.container}>
        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{getCategoryLabel(category)}</Text>
            <View style={styles.grid}>
              {grouped[category].map((image, index) => {
                // Find the global index for image removal
                const globalIndex = images.findIndex((img) => img.url === image.url);
                return (
                  <TouchableOpacity
                    key={image.url}
                    style={styles.thumbnailContainer}
                    onPress={() => handleImagePress(globalIndex)}
                    accessibilityRole="button"
                    accessibilityLabel={`Portfolio image ${index + 1} in ${category}`}
                  >
                    <Image
                      source={{ uri: image.url }}
                      style={[styles.thumbnail, { width: thumbnailSize, height: thumbnailSize }]}
                      resizeMode="cover"
                    />
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemove(globalIndex)}
                        accessibilityRole="button"
                        accessibilityLabel="Remove photo"
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {isEditing && images.length < maxImages && (
          <TouchableOpacity
            style={[styles.addButton, isUploading && styles.buttonDisabled]}
            onPress={pickAndUploadImages}
            disabled={isUploading}
            accessibilityRole="button"
            accessibilityLabel="Add portfolio photos"
          >
            <Text style={styles.addButtonText}>
              {isUploading
                ? `Uploading ${uploadProgress?.current ?? 0}/${uploadProgress?.total ?? 0}...`
                : `+ Add photos (${images.length}/${maxImages})`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Full-screen image modal */}
        <Modal
          visible={selectedImageIndex !== null}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            {selectedImageIndex !== null && (
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
              >
                {images.map((image) => (
                  <View key={image.url} style={[styles.fullImageContainer, { width: screenWidth }]}>
                    <Image
                      source={{ uri: image.url }}
                      style={[styles.fullImage, { width: screenWidth, height: screenWidth }]}
                      resizeMode="contain"
                    />
                    {image.caption && <Text style={styles.caption}>{image.caption}</Text>}
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Navigation arrows */}
            {selectedImageIndex !== null && selectedImageIndex > 0 && (
              <TouchableOpacity style={styles.navButtonLeft} onPress={goToPreviousImage}>
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
            )}
            {selectedImageIndex !== null && selectedImageIndex < images.length - 1 && (
              <TouchableOpacity style={styles.navButtonRight} onPress={goToNextImage}>
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            )}

            {/* Image counter */}
            {selectedImageIndex !== null && (
              <View style={styles.counterContainer}>
                <Text style={styles.counterText}>
                  {selectedImageIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>
        </Modal>
      </View>
    );
  }

  // Default ungrouped view
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {images.map((image, index) => (
          <TouchableOpacity
            key={image.url}
            style={styles.thumbnailContainer}
            onPress={() => handleImagePress(index)}
            accessibilityRole="button"
            accessibilityLabel={`Portfolio image ${index + 1}`}
          >
            <Image
              source={{ uri: image.url }}
              style={[styles.thumbnail, { width: thumbnailSize, height: thumbnailSize }]}
              resizeMode="cover"
            />
            {isEditing && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(index)}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {isEditing && images.length < maxImages && (
        <TouchableOpacity
          style={[styles.addButton, isUploading && styles.buttonDisabled]}
          onPress={pickAndUploadImages}
          disabled={isUploading}
          accessibilityRole="button"
          accessibilityLabel="Add portfolio photos"
        >
          <Text style={styles.addButtonText}>
            {isUploading
              ? `Uploading ${uploadProgress?.current ?? 0}/${uploadProgress?.total ?? 0}...`
              : `+ Add photos (${images.length}/${maxImages})`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Full-screen image modal */}
      <Modal
        visible={selectedImageIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          {selectedImageIndex !== null && (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
            >
              {images.map((image) => (
                <View key={image.url} style={[styles.fullImageContainer, { width: screenWidth }]}>
                  <Image
                    source={{ uri: image.url }}
                    style={[styles.fullImage, { width: screenWidth, height: screenWidth }]}
                    resizeMode="contain"
                  />
                  {image.caption && <Text style={styles.caption}>{image.caption}</Text>}
                </View>
              ))}
            </ScrollView>
          )}

          {/* Navigation arrows */}
          {selectedImageIndex !== null && selectedImageIndex > 0 && (
            <TouchableOpacity style={styles.navButtonLeft} onPress={goToPreviousImage}>
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
          )}
          {selectedImageIndex !== null && selectedImageIndex < images.length - 1 && (
            <TouchableOpacity style={styles.navButtonRight} onPress={goToNextImage}>
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          )}

          {/* Image counter */}
          {selectedImageIndex !== null && (
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                {selectedImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
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
    backgroundColor: overlays.modalBackdropDark,
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
  modalContainer: {
    flex: 1,
    backgroundColor: overlays.modalBackdropHeavy,
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: overlays.lightOverlaySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.background,
    fontSize: 28,
    fontWeight: '300',
  },
  imageScroll: {
    flex: 1,
  },
  fullImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {},
  caption: {
    color: colors.background,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  navButtonLeft: {
    position: 'absolute',
    left: 10,
    top: '50%',
    marginTop: -25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonRight: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: colors.background,
    fontSize: 48,
    fontWeight: '300',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counterText: {
    color: colors.background,
    fontSize: 16,
  },
});
