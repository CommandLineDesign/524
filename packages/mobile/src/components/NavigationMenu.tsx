import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { colors, primitives } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SimpleRoute = {
  [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined ? K : never;
}[keyof RootStackParamList];

interface NavigationMenuProps {
  visible: boolean;
  onClose: () => void;
}

const menuItems: Array<{ label: string; screen: SimpleRoute }> = [
  { label: 'Home', screen: 'Home' },
  { label: 'My Bookings', screen: 'BookingsList' },
  { label: 'Messages', screen: 'ChatsList' },
];

export function NavigationMenu({ visible, onClose }: NavigationMenuProps) {
  const navigation = useNavigation<NavigationProp>();
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavigate = (screen: SimpleRoute) => {
    navigation.navigate(screen);
    onClose();
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
            {menuItems.map((item) => (
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
            <TouchableOpacity style={styles.menuItem}>
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.muted,
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
    color: colors.muted,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  menuItemArrow: {
    fontSize: 24,
    color: colors.muted,
  },
  logoutButton: {
    backgroundColor: primitives.errorLight,
    borderColor: primitives.errorLight,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: colors.error,
  },
  logoutArrow: {
    color: colors.error,
  },
});
