import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { colors } from '../../../theme';

interface ArtistDetailScreenProps {
  route: {
    params: {
      artistId: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

type TabType = 'profile' | 'reviews';

export function ArtistDetailScreen({ route, navigation }: ArtistDetailScreenProps) {
  const { artistId } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const {
    data: artist,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => getArtistById(artistId),
  });

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
      </View>

      {/* Artist Header */}
      <ArtistDetailHeader
        name={artist.stageName}
        imageUrl={artist.profileImageUrl}
        username={artist.stageName.toLowerCase().replace(/\s+/g, '')}
        specialty={artist.specialties?.[0] || '전문'}
        rating={artist.averageRating}
        reviewCount={artist.totalReviews}
        isBookmarked={false}
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
            services={artist.services?.map((s) => s.name)}
          />
        ) : (
          <ArtistReviewsTab artistId={artistId} />
        )}
      </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
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
});
