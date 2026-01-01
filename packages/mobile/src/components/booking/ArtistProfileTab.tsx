import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme';

export interface ArtistProfileTabProps {
  /** Artist bio/description */
  bio?: string;
  /** List of specialties */
  specialties?: string[];
  /** List of services offered */
  services?: string[];
  /** Price range [min, max] */
  priceRange?: [number, number];
  /** Test ID */
  testID?: string;
}

export function ArtistProfileTab({
  bio,
  specialties,
  services,
  priceRange,
  testID,
}: ArtistProfileTabProps) {
  const hasContent =
    bio ||
    (specialties && specialties.length > 0) ||
    (services && services.length > 0) ||
    priceRange;

  if (!hasContent) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText}>프로필 정보가 없습니다</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID={testID}>
      {/* Bio Section */}
      {bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>소개</Text>
          <Text style={styles.bioText}>{bio}</Text>
        </View>
      )}

      {/* Specialties Section */}
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
      {services && services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제공 서비스</Text>
          <View style={styles.servicesList}>
            {services.map((service) => (
              <View key={service} style={styles.serviceItem}>
                <Text style={styles.serviceBullet}>•</Text>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
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
  priceText: {
    fontSize: 14,
    color: '#19191b',
    fontWeight: '500',
  },
});
