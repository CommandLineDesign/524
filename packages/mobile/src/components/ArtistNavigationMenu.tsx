import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useArtistProfile } from '../query/artist';
import { useAuthStore } from '../store/authStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SimpleRoute = {
  [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined ? K : never;
}[keyof RootStackParamList];

interface ArtistNavigationMenuProps {
  visible: boolean;
  onClose: () => void;
}

const artistMenuItems: Array<{ label: string; screen: SimpleRoute }> = [
  { label: 'My Bookings', screen: 'ArtistBookingsList' },
  { label: 'My Reviews', screen: 'ArtistReviews' },
  { label: 'Messages', screen: 'ChatsList' },
];

export function ArtistNavigationMenu({ visible, onClose }: ArtistNavigationMenuProps) {
  const navigation = useNavigation<NavigationProp>();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Only fetch profile if user is an artist
  const isCurrentUserArtist = Boolean(
    user?.primaryRole === 'artist' || user?.roles?.includes('artist')
  );
  const { data: myProfile } = useArtistProfile(user?.id, Boolean(user?.id && isCurrentUserArtist));

  const handleNavigate = (screen: SimpleRoute) => {
    navigation.navigate(screen);
    onClose();
  };

  const handleMyProfile = () => {
    if (myProfile?.id) {
      navigation.navigate('ArtistDetail', { artistId: myProfile.id });
      onClose();
    } else {
      Alert.alert('프로필을 찾을 수 없습니다', '아티스트 프로필을 불러올 수 없습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('로그아웃 실패', '다시 시도해 주세요.');
    } finally {
      setIsLoggingOut(false);
      onClose();
    }
  };

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>524</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Navigation</Text>
            {artistMenuItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.screen)}
              >
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.menuItem} onPress={handleMyProfile}>
              <Text style={styles.menuItemText}>My Profile</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Settings</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Help & Support</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.menuItem,
                styles.logoutButton,
                isLoggingOut && styles.logoutButtonDisabled,
              ]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <Text style={[styles.menuItemText, styles.logoutText]}>
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </Text>
              <Text style={[styles.menuItemArrow, styles.logoutArrow]}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: '#b91c1c',
  },
  logoutArrow: {
    color: '#fca5a5',
  },
});
