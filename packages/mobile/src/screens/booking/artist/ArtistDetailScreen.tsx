import type { ArtistProfile } from '@524/shared';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getArtistById } from '../../../api/client';
import {
  ArtistDetailHeader,
  ArtistProfileTab,
  ArtistReviewsTab,
} from '../../../components/booking';
import { newHomeStrings } from '../../../constants/newHomeStrings';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import { useArtistProfile, useUpdateArtistProfile } from '../../../query/artist';
import { useAuthStore } from '../../../store/authStore';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { borderRadius, colors, spacing } from '../../../theme';

interface ArtistDetailScreenProps {
  route: {
    params: {
      artistId: string;
      // New params from home screen
      fromHomeScreen?: boolean;
      preselectedLocation?: string;
      preselectedCoordinates?: { lat: number; lng: number };
      preselectedDate?: string;
      preselectedTimeSlot?: string;
      preselectedServiceType?: 'hair' | 'makeup' | 'combo';
    };
  };
  navigation: {
    goBack: () => void;
  };
}

type TabType = 'profile' | 'reviews';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ArtistDetailScreen({ route }: ArtistDetailScreenProps) {
  const {
    artistId,
    fromHomeScreen,
    preselectedLocation,
    preselectedCoordinates,
    preselectedDate,
    preselectedTimeSlot,
    preselectedServiceType,
  } = route.params;

  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<Partial<ArtistProfile> | null>(null);
  const initializeFromHome = useBookingFlowStore((state) => state.initializeFromHome);

  // Get current user to detect if viewing own profile
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;
  const isCurrentUserArtist = Boolean(
    user?.primaryRole === 'artist' || user?.roles?.includes('artist')
  );
  const { data: myProfile } = useArtistProfile(
    currentUserId,
    Boolean(currentUserId && isCurrentUserArtist)
  );

  const {
    data: artist,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => getArtistById(artistId),
  });

  // Check if viewing own profile
  const isOwnProfile = myProfile?.id === artistId;

  // Mutation for updating profile
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateArtistProfile(currentUserId);

  const handleBookWithArtist = useCallback(() => {
    if (
      !preselectedCoordinates ||
      !preselectedDate ||
      !preselectedTimeSlot ||
      !preselectedServiceType
    ) {
      // Fallback: navigate to regular booking flow if data is missing
      navigation.navigate('BookingFlow', { entryPath: 'celebrity' });
      return;
    }

    // Initialize the booking flow store with pre-selected data including service type
    initializeFromHome({
      artistId,
      location: preselectedLocation || '',
      locationCoordinates: preselectedCoordinates,
      selectedDate: preselectedDate,
      selectedTimeSlot: preselectedTimeSlot,
      serviceType: preselectedServiceType,
    });

    // Navigate to booking flow - the store is already initialized
    navigation.navigate('BookingFlow', { entryPath: 'homeEntry' });
  }, [
    artistId,
    preselectedLocation,
    preselectedCoordinates,
    preselectedDate,
    preselectedTimeSlot,
    preselectedServiceType,
    navigation,
    initializeFromHome,
  ]);

  const handleEditPress = useCallback(() => {
    if (!artist) return;
    setEditDraft({
      stageName: artist.stageName,
      bio: artist.bio,
      services: artist.services,
      primaryLocation: artist.primaryLocation,
      serviceRadiusKm: artist.serviceRadiusKm,
      portfolioImages: artist.portfolioImages,
    });
    setIsEditMode(true);
  }, [artist]);

  const handleSave = useCallback(async () => {
    if (!editDraft) return;

    // Validate required fields
    const missingFields: string[] = [];
    if (!editDraft.stageName?.trim()) {
      missingFields.push('Studio Name');
    }
    if (!editDraft.bio?.trim()) {
      missingFields.push('Bio');
    }

    if (missingFields.length > 0) {
      Alert.alert(
        'Required fields missing',
        `Please fill in the following fields: ${missingFields.join(', ')}`
      );
      return;
    }

    try {
      await updateProfile(editDraft);
      // Invalidate the artist query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['artist', artistId] });
      setIsEditMode(false);
      setEditDraft(null);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Save failed', 'Could not save your profile. Please try again.');
    }
  }, [editDraft, updateProfile, queryClient, artistId]);

  const handleCancel = useCallback(() => {
    setIsEditMode(false);
    setEditDraft(null);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>아티스트 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !artist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>아티스트 정보를 불러올 수 없습니다</Text>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : '다시 시도해주세요'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>아티스트 정보</Text>
        {isOwnProfile && !isEditMode && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditPress}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {isEditMode && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
            >
              <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Artist Header */}
      <ArtistDetailHeader
        name={artist.stageName}
        imageUrl={artist.profileImageUrl}
        username={artist.stageName.toLowerCase().replace(/\s+/g, '')}
        specialty={artist.specialties?.[0] || '전문'}
        rating={artist.averageRating}
        reviewCount={artist.totalReviews}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('profile')}
          accessibilityRole="button"
          accessibilityLabel="상세정보 탭"
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            상세정보
          </Text>
          {activeTab === 'profile' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('reviews')}
          accessibilityRole="button"
          accessibilityLabel="리뷰 탭"
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
            리뷰
          </Text>
          {activeTab === 'reviews' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'profile' ? (
          <ArtistProfileTab
            bio={artist.bio}
            specialties={artist.specialties?.map((s) => (typeof s === 'string' ? s : String(s)))}
            services={artist.services}
            portfolioImages={artist.portfolioImages}
            primaryLocation={artist.primaryLocation}
            serviceRadiusKm={artist.serviceRadiusKm}
            stageName={artist.stageName}
            isEditing={isEditMode}
            editDraft={editDraft ?? undefined}
            onEditChange={setEditDraft}
          />
        ) : (
          <ArtistReviewsTab artistId={artistId} />
        )}
      </View>

      {/* Book Button - only show when coming from home screen */}
      {fromHomeScreen && (
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookWithArtist}
            accessibilityRole="button"
            accessibilityLabel={newHomeStrings.artistDetail.bookButton}
          >
            <Text style={styles.bookButtonText}>{newHomeStrings.artistDetail.bookButton}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.text,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.text,
  },
  tabContent: {
    flex: 1,
  },
  bookButtonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
  },
  bookButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
