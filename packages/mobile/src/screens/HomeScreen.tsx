import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuButton } from '../components/MenuButton';
import { NavigationMenu } from '../components/NavigationMenu';
import { Carousel } from '../components/common/Carousel';
import { homeStrings } from '../constants/homeStrings';
import { useUnreadNotificationCount } from '../hooks/useNotifications';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCustomerBookings } from '../query/bookings';
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

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuthStore();
  const { data: bookings } = useCustomerBookings();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const [menuVisible, setMenuVisible] = useState(false);

  const userName = user?.name || 'Guest';

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
    // Navigate to the new multi-step booking flow with celebrity entry path.
    // This starts with location input → celebrity questions → service selection.
    // Note: The 'direct' entry path exists but its use case is TBD - it skips
    // location/celebrity screens and goes straight to service selection.
    navigation.navigate('BookingFlow', { entryPath: 'celebrity' });
  };

  const handleBookingPress = () => {
    if (nextBooking) {
      navigation.navigate('BookingDetail', { bookingId: nextBooking.id });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookService}
            accessibilityRole="button"
            accessibilityLabel={homeStrings.buttons.bookServiceLabel}
          >
            <Text style={styles.bookButtonText}>{homeStrings.buttons.bookService}</Text>
          </TouchableOpacity>

          {/* 
            NOTE: Intentional placeholder UI for initial release.
            Future enhancement: Connect to booking history API to display actual user bookings.
            The Carousel component is designed to handle both empty and populated states.
          */}
          <Carousel
            title={homeStrings.carousels.myBookings}
            data={[]}
            emptyLabels={['2월 10일', '1월 2일', '12월 13일']}
            placeholderCount={3}
          />

          {/* 
            NOTE: Intentional placeholder UI for initial release.
            Future enhancement: Connect to reviews API to display top-rated local reviews.
            The Carousel component is designed to handle both empty and populated states.
          */}
          <Carousel
            title={homeStrings.carousels.bestReviews}
            data={[]}
            emptyLabels={['헤어1', '메이크업1', '헤메1']}
            placeholderCount={3}
          />

          {/* 
            NOTE: Intentional placeholder UI for initial release.
            Future enhancement: Connect to artists API to display top-rated local artists.
            The Carousel component is designed to handle both empty and populated states.
          */}
          <Carousel
            title={homeStrings.carousels.bestArtists}
            data={[]}
            emptyLabels={['아티스트1', '아티스트2', '아티스트3']}
            placeholderCount={3}
          />
        </View>
      </ScrollView>

      <NavigationMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
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
    marginBottom: spacing.xl,
  },
  bookButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
