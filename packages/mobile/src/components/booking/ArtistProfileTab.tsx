import type {
  ArtistLocation,
  ArtistProfile,
  ArtistServiceOffering,
  PortfolioImage,
} from '@524/shared';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';
import { formStyles } from '../../theme/formStyles';
import { PortfolioImageGrid, ServiceEditor } from '../artist';
import { LocationPicker } from '../location';

export interface ArtistProfileTabProps {
  /** Artist bio/description */
  bio?: string;
  /** List of specialties */
  specialties?: string[];
  /** List of services offered (can be string[] for backward compatibility or full objects) */
  services?: string[] | ArtistServiceOffering[];
  /** Price range [min, max] */
  priceRange?: [number, number];
  /** Portfolio images */
  portfolioImages?: PortfolioImage[];
  /** Primary location */
  primaryLocation?: ArtistLocation;
  /** Service radius in km */
  serviceRadiusKm?: number;
  /** Stage name */
  stageName?: string;
  /** Whether the component is in edit mode */
  isEditing?: boolean;
  /** Draft data for editing */
  editDraft?: Partial<ArtistProfile>;
  /** Callback when edit draft changes */
  onEditChange?: (draft: Partial<ArtistProfile>) => void;
  /** Callback to open availability modal (edit mode only) */
  onOpenAvailabilityModal?: () => void;
  /** Test ID */
  testID?: string;
}

export function ArtistProfileTab({
  bio,
  specialties,
  services,
  priceRange,
  portfolioImages,
  primaryLocation,
  serviceRadiusKm,
  stageName,
  isEditing = false,
  editDraft,
  onEditChange,
  onOpenAvailabilityModal,
  testID,
}: ArtistProfileTabProps) {
  const hasContent =
    bio ||
    (specialties && specialties.length > 0) ||
    (services && services.length > 0) ||
    priceRange ||
    (portfolioImages && portfolioImages.length > 0) ||
    isEditing;

  // Type guard for string array services (backward compatibility)
  const isStringArray = (arr: string[] | ArtistServiceOffering[]): arr is string[] =>
    arr.length > 0 && typeof arr[0] === 'string';

  // Convert services to full objects for editing
  const getEditableServices = (): ArtistServiceOffering[] => {
    const svcs = isEditing && editDraft?.services ? editDraft.services : services;
    if (!svcs || svcs.length === 0) return [];
    if (isStringArray(svcs)) {
      return svcs.map((name) => ({ name, price: 0 }));
    }
    return svcs;
  };

  // Helper to get display value from editDraft (when editing) or props
  const getDisplayValue = <K extends keyof ArtistProfile>(
    field: K,
    propValue: ArtistProfile[K] | undefined
  ): ArtistProfile[K] | undefined => {
    if (isEditing && editDraft?.[field] !== undefined) {
      return editDraft[field] as ArtistProfile[K];
    }
    return propValue;
  };

  // Get display values (either from editDraft in edit mode, or from props)
  const displayServices = getDisplayValue(
    'services',
    services as ArtistServiceOffering[] | undefined
  );
  const displayPortfolioImages = getDisplayValue('portfolioImages', portfolioImages);
  const displayStageName = getDisplayValue('stageName', stageName);
  const displayBio = getDisplayValue('bio', bio);
  const displayLocation = getDisplayValue('primaryLocation', primaryLocation);
  const displayRadius = getDisplayValue('serviceRadiusKm', serviceRadiusKm);

  if (!hasContent) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText}>프로필 정보가 없습니다</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID={testID}>
      {/* Stage Name Section - Edit mode only */}
      {isEditing && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>스튜디오 이름</Text>
          <TextInput
            value={displayStageName ?? ''}
            onChangeText={(text) => onEditChange?.({ ...editDraft, stageName: text })}
            placeholder="Your stage or studio name"
            placeholderTextColor={colors.muted}
            style={formStyles.input}
            accessibilityLabel="Stage name"
          />
        </View>
      )}

      {/* Bio Section */}
      {(bio || isEditing) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>소개</Text>
          {isEditing ? (
            <TextInput
              value={displayBio ?? ''}
              onChangeText={(text) => onEditChange?.({ ...editDraft, bio: text })}
              placeholder="Tell clients about yourself"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              style={[formStyles.input, styles.bioInput]}
              accessibilityLabel="Bio"
            />
          ) : (
            <Text style={styles.bioText}>{bio}</Text>
          )}
        </View>
      )}

      {/* Specialties Section - View only, not editable here */}
      {specialties && specialties.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>전문 분야</Text>
          <View style={styles.tagsContainer}>
            {specialties.map((specialty) => (
              <View key={specialty} style={styles.tag}>
                <Text style={styles.tagText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Services Section */}
      {((displayServices && displayServices.length > 0) || isEditing) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제공 서비스</Text>
          {isEditing ? (
            <ServiceEditor
              services={getEditableServices()}
              onChange={(newServices) => onEditChange?.({ ...editDraft, services: newServices })}
            />
          ) : (
            <View style={styles.servicesList}>
              {displayServices?.map((service, index) => {
                const serviceName = typeof service === 'string' ? service : service.name;
                const servicePrice = typeof service === 'string' ? null : service.price;
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Display-only list with stable order
                  <View key={`${serviceName}-${index}`} style={styles.serviceItem}>
                    <Text style={styles.serviceBullet}>•</Text>
                    <Text style={styles.serviceText}>
                      {serviceName}
                      {servicePrice != null && servicePrice > 0 && (
                        <Text style={styles.servicePrice}>
                          {' '}
                          - {servicePrice.toLocaleString()}원
                        </Text>
                      )}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Location Section - Edit mode only */}
      {isEditing && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>서비스 위치</Text>
          <LocationPicker
            location={displayLocation ?? { latitude: 0, longitude: 0, address: '' }}
            onLocationChange={(location) =>
              onEditChange?.({ ...editDraft, primaryLocation: location })
            }
            showRadiusSelector={true}
            radiusKm={displayRadius ?? 0}
            onRadiusChange={(radiusKm) =>
              onEditChange?.({ ...editDraft, serviceRadiusKm: radiusKm })
            }
          />
        </View>
      )}

      {/* Availability Section - Edit mode only */}
      {isEditing && onOpenAvailabilityModal && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>근무 가능 시간</Text>
          <TouchableOpacity
            style={styles.availabilityButton}
            onPress={onOpenAvailabilityModal}
            accessibilityRole="button"
            accessibilityLabel="Set availability"
          >
            <Text style={styles.availabilityButtonText}>근무 시간 설정</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Portfolio Section */}
      {((displayPortfolioImages && displayPortfolioImages.length > 0) || isEditing) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>포트폴리오</Text>
          <PortfolioImageGrid
            images={displayPortfolioImages ?? []}
            isEditing={isEditing}
            onImagesChange={(images) => onEditChange?.({ ...editDraft, portfolioImages: images })}
          />
        </View>
      )}

      {/* Price Range Section */}
      {priceRange && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가격대</Text>
          <Text style={styles.priceText}>
            {priceRange[0].toLocaleString()}원 ~ {priceRange[1].toLocaleString()}원
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#19191b',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#19191b',
    lineHeight: 20,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#efeff0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#19191b',
    fontWeight: '400',
  },
  servicesList: {
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  serviceBullet: {
    fontSize: 14,
    color: '#19191b',
    marginRight: 8,
    lineHeight: 20,
  },
  serviceText: {
    flex: 1,
    fontSize: 14,
    color: '#19191b',
    lineHeight: 20,
  },
  servicePrice: {
    fontWeight: '500',
    color: colors.muted,
  },
  priceText: {
    fontSize: 14,
    color: '#19191b',
    fontWeight: '500',
  },
  availabilityButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  availabilityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
