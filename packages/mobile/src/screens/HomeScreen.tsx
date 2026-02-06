import type { LocationDataWithAddress } from '@524/shared';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuButton } from '../components/MenuButton';
import { NavigationMenu } from '../components/NavigationMenu';
import {
  ArtistCarousel,
  LocationPickerModal,
  LocationSelectorButton,
  TimePickerModal,
  TimeSelectorButton,
} from '../components/home';
import { homeStrings } from '../constants/homeStrings';
import { newHomeStrings } from '../constants/newHomeStrings';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useHomeArtistSearch } from '../hooks/useHomeArtistSearch';
import { useUnreadNotificationCount } from '../hooks/useNotifications';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCustomerBookings } from '../query/bookings';
import { reverseGeocodeLocation } from '../services/kakaoService';
import { useAuthStore } from '../store/authStore';
import { borderRadius } from '../theme/borderRadius';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get tomorrow's date at 7pm as the default time
 */
function getDefaultDateTime(): { date: string; timeSlot: string } {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);
  return {
    date: tomorrow.toISOString(),
    timeSlot: '19:00',
  };
}

/**
 * Build ISO datetime string from date and time slot
 */
function buildDateTime(date: string, timeSlot: string): string {
  const dateObj = new Date(date);
  const [hours, minutes] = timeSlot.split(':').map(Number);
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj.toISOString();
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuthStore();
  const { data: bookings } = useCustomerBookings();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { getCurrentLocation } = useCurrentLocation();

  // UI state
  const [menuVisible, setMenuVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Location state
  const [selectedLocation, setSelectedLocation] = useState<{
    coordinates: { lat: number; lng: number } | null;
    address: string | null;
  }>({
    coordinates: null,
    address: null,
  });

  // Time state - default to tomorrow at 7pm
  const [selectedDateTime, setSelectedDateTime] = useState(() => getDefaultDateTime());

  const userName = user?.name || 'Guest';

  // Initialize location on mount
  useEffect(() => {
    const initLocation = async () => {
      setIsLocationLoading(true);
      try {
        const gpsLocation = await getCurrentLocation();
        if (gpsLocation) {
          // Reverse geocode to get address
          const result = await reverseGeocodeLocation(gpsLocation.latitude, gpsLocation.longitude);
          setSelectedLocation({
            coordinates: { lat: gpsLocation.latitude, lng: gpsLocation.longitude },
            address:
              result?.roadAddress ||
              result?.address ||
              newHomeStrings.selectors.location.currentLocation,
          });
        }
      } catch {
        // If GPS fails, leave location unset - user can select manually
      } finally {
        setIsLocationLoading(false);
      }
    };

    initLocation();
  }, [getCurrentLocation]);

  // Compute the datetime for API calls
  const searchDateTime = useMemo(() => {
    if (!selectedDateTime.date || !selectedDateTime.timeSlot) return null;
    return buildDateTime(selectedDateTime.date, selectedDateTime.timeSlot);
  }, [selectedDateTime.date, selectedDateTime.timeSlot]);

  // Fetch filtered artists
  const { comboArtists, hairArtists, makeupArtists } = useHomeArtistSearch({
    latitude: selectedLocation.coordinates?.lat ?? null,
    longitude: selectedLocation.coordinates?.lng ?? null,
    dateTime: searchDateTime,
  });

  const nextBooking = useMemo(() => {
    if (!bookings || bookings.length === 0) return null;

    const now = new Date();
    const upcomingBookings = bookings
      .filter((b) => {
        if (!b.scheduledStartTime && !b.scheduledDate) return false;
        const bookingDate = new Date(b.scheduledStartTime || b.scheduledDate);
        return bookingDate > now && (b.status === 'confirmed' || b.status === 'pending');
      })
      .sort((a, b) => {
        const dateA = new Date(a.scheduledStartTime || a.scheduledDate).getTime();
        const dateB = new Date(b.scheduledStartTime || b.scheduledDate).getTime();
        return dateA - dateB;
      });

    return upcomingBookings[0] || null;
  }, [bookings]);

  const daysUntilBooking = nextBooking
    ? getDaysUntil(nextBooking.scheduledStartTime || nextBooking.scheduledDate)
    : null;

  const handleBellPress = () => {
    navigation.navigate('NotificationInbox');
  };

  const handleBookService = () => {
    navigation.navigate('BookingFlow', { entryPath: 'celebrity' });
  };

  const handleBookingPress = () => {
    if (nextBooking) {
      navigation.navigate('BookingDetail', { bookingId: nextBooking.id });
    }
  };

  const handleLocationSelect = useCallback((location: LocationDataWithAddress) => {
    setSelectedLocation({
      coordinates: { lat: location.latitude, lng: location.longitude },
      address: location.address,
    });
  }, []);

  const handleTimeSelect = useCallback((date: string, timeSlot: string) => {
    setSelectedDateTime({ date, timeSlot });
  }, []);

  const handleArtistPress = useCallback(
    (artistId: string) => {
      // Navigate to artist detail with booking context
      navigation.navigate('ArtistDetail', {
        artistId,
        fromHomeScreen: true,
        preselectedLocation: selectedLocation.address ?? undefined,
        preselectedCoordinates: selectedLocation.coordinates ?? undefined,
        preselectedDate: selectedDateTime.date,
        preselectedTimeSlot: selectedDateTime.timeSlot,
      });
    },
    [navigation, selectedLocation, selectedDateTime]
  );

  // Empty message based on location state
  const emptyMessage = selectedLocation.coordinates
    ? newHomeStrings.carousels.empty.noArtists
    : newHomeStrings.carousels.empty.selectLocation;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header - unchanged */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <MenuButton onPress={() => setMenuVisible(true)} />
            <View style={styles.headerSpacer} />
            <TouchableOpacity
              style={styles.bellButton}
              onPress={handleBellPress}
              accessibilityRole="button"
              accessibilityLabel={homeStrings.notifications.label}
              accessibilityHint={homeStrings.notifications.hint}
            >
              <View>
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                {unreadCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.headerContent}
            onPress={handleBookingPress}
            disabled={!nextBooking}
            accessibilityRole={nextBooking ? 'button' : 'text'}
            accessibilityLabel={
              nextBooking && daysUntilBooking !== null
                ? homeStrings.bookingLabel.withBooking(userName, daysUntilBooking)
                : homeStrings.bookingLabel.withoutBooking(userName)
            }
          >
            {nextBooking && daysUntilBooking !== null ? (
              <>
                <Text style={styles.mainMessage}>
                  <Text style={styles.boldText}>{userName}님</Text>
                  <Text style={styles.regularText}>의 예약이</Text>
                </Text>
                <Text style={styles.mainMessage}>
                  <Text style={styles.boldText}>{daysUntilBooking}일</Text>
                  <Text style={styles.regularText}> 남았어요</Text>
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.mainMessage}>
                  <Text style={styles.boldText}>{userName}님</Text>
                  <Text style={styles.regularText}>,</Text>
                </Text>
                <Text style={styles.mainMessage}>
                  <Text style={styles.regularText}>예약이 없습니다</Text>
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Content - new lower section */}
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookService}
            accessibilityRole="button"
            accessibilityLabel={homeStrings.buttons.bookServiceLabel}
          >
            <Text style={styles.bookButtonText}>{homeStrings.buttons.bookService}</Text>
          </TouchableOpacity>

          {/* Location and Time Selectors */}
          <LocationSelectorButton
            location={selectedLocation.coordinates}
            address={selectedLocation.address}
            onPress={() => setLocationModalVisible(true)}
            isLoading={isLocationLoading}
          />

          <TimeSelectorButton
            date={selectedDateTime.date}
            timeSlot={selectedDateTime.timeSlot}
            onPress={() => setTimeModalVisible(true)}
          />

          {/* Artist Carousels */}
          <ArtistCarousel
            title={newHomeStrings.carousels.hairAndMakeup}
            artists={comboArtists.data}
            isLoading={comboArtists.isLoading}
            onArtistPress={handleArtistPress}
            emptyMessage={emptyMessage}
          />

          <ArtistCarousel
            title={newHomeStrings.carousels.hair}
            artists={hairArtists.data}
            isLoading={hairArtists.isLoading}
            onArtistPress={handleArtistPress}
            emptyMessage={emptyMessage}
          />

          <ArtistCarousel
            title={newHomeStrings.carousels.makeup}
            artists={makeupArtists.data}
            isLoading={makeupArtists.isLoading}
            onArtistPress={handleArtistPress}
            emptyMessage={emptyMessage}
          />
        </View>
      </ScrollView>

      <NavigationMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* Modals */}
      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        initialLocation={
          selectedLocation.coordinates
            ? {
                latitude: selectedLocation.coordinates.lat,
                longitude: selectedLocation.coordinates.lng,
                address: selectedLocation.address ?? undefined,
              }
            : null
        }
        onLocationSelect={handleLocationSelect}
      />

      <TimePickerModal
        visible={timeModalVisible}
        onClose={() => setTimeModalVisible(false)}
        initialDate={selectedDateTime.date}
        initialTimeSlot={selectedDateTime.timeSlot}
        onTimeSelect={handleTimeSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.surfaceAlt,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerSpacer: {
    flex: 1,
  },
  bellButton: {
    padding: spacing.xs,
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  mainMessage: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },
  regularText: {
    fontWeight: '400',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  bookButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
