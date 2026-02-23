import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, overlays, spacing } from '../../theme';

export interface StyleCardProps {
  /** Style ID */
  id: string;
  /** Image URL */
  imageUrl: string;
  /** Optional label */
  label?: string;
  /** Whether this style is selected */
  selected?: boolean;
  /** Callback when pressed */
  onPress: () => void;
  /** Whether this is a camera/upload card */
  isUploadCard?: boolean;
  /** Test ID */
  testID?: string;
}

export function StyleCard({
  id,
  imageUrl,
  label,
  selected = false,
  onPress,
  isUploadCard = false,
  testID,
}: StyleCardProps) {
  if (isUploadCard) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Upload image'}
        testID={testID}
      >
        <View style={[styles.imageContainer, styles.uploadContainer]}>
          <CameraIcon />
          {label && <Text style={styles.uploadLabel}>{label}</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label ?? `Style ${id}`}
      testID={testID}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        {selected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkmark}>
              <CheckIcon />
            </View>
          </View>
        )}
      </View>
      {label && (
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function CameraIcon() {
  return (
    <View style={styles.cameraIcon}>
      <View style={styles.cameraBody} />
      <View style={styles.cameraLens} />
    </View>
  );
}

function CheckIcon() {
  return (
    <View style={styles.checkIcon}>
      <View style={styles.checkLine1} />
      <View style={styles.checkLine2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '30%',
    marginBottom: spacing.md,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  uploadLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: overlays.modalBackdropLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  checkLine1: {
    position: 'absolute',
    width: 7,
    height: 2,
    backgroundColor: colors.background,
    transform: [{ rotate: '45deg' }],
    top: 10,
    left: 2,
  },
  checkLine2: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: colors.background,
    transform: [{ rotate: '-45deg' }],
    top: 8,
    left: 5,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  cameraIcon: {
    width: 40,
    height: 32,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBody: {
    width: 36,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  cameraLens: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.surfaceAlt,
    backgroundColor: colors.textSecondary,
  },
});
