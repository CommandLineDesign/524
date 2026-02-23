import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { borderRadius, colors, spacing } from '../../theme';
import { GradientBackground } from '../common/GradientBackground';

export interface BookingLayoutProps {
  /** Main title for the step */
  title?: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Main content */
  children: React.ReactNode;
  /** Footer content (typically buttons) */
  footer?: React.ReactNode;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Callback for close button press - exits the entire booking flow */
  onClose?: () => void;
  /** Callback for back button press - goes to previous step */
  onBack?: () => void;
  /** Whether to show the back button in footer (default: false) */
  showBackButton?: boolean;
  /** Label for the back button (default: '이전') */
  backButtonLabel?: string;
  /** Whether to wrap content in ScrollView (default: true) */
  scrollable?: boolean;
  /** Whether to use KeyboardAvoidingView (default: true) */
  avoidKeyboard?: boolean;
  /** Custom header content (replaces default close button) */
  headerRight?: React.ReactNode;
  /** Test ID for the layout */
  testID?: string;
}

export function BookingLayout({
  title,
  subtitle,
  children,
  footer,
  showCloseButton = true,
  onClose,
  onBack,
  showBackButton = false,
  backButtonLabel = '이전',
  scrollable = true,
  avoidKeyboard = true,
  headerRight,
  testID,
}: BookingLayoutProps) {
  const content = (
    <>
      {/* Title */}
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Body content */}
      <View style={styles.body}>{children}</View>
    </>
  );

  const wrappedContent = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  ) : (
    <View style={styles.nonScrollContent}>{content}</View>
  );

  const mainContent = (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']} testID={testID}>
      {/* Header with close button */}
      {(showCloseButton || headerRight) && (
        <View style={styles.header}>
          {showCloseButton && onClose ? (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="닫기"
              accessibilityRole="button"
              accessibilityHint="예약 흐름을 종료합니다"
            >
              <CloseIcon />
            </TouchableOpacity>
          ) : (
            <View style={styles.closeButtonPlaceholder} />
          )}

          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}

      {/* Main content */}
      {wrappedContent}

      {/* Footer */}
      {(footer || showBackButton) && (
        <View style={styles.footer}>
          {showBackButton && onBack ? (
            <View style={styles.footerWithBack}>
              <TouchableOpacity
                onPress={onBack}
                style={styles.backButton}
                accessibilityLabel={backButtonLabel}
                accessibilityRole="button"
                accessibilityHint="이전 단계로 돌아갑니다"
              >
                <Text style={styles.backButtonText}>{backButtonLabel}</Text>
              </TouchableOpacity>
              <View style={styles.continueButtonWrapper}>{footer}</View>
            </View>
          ) : (
            footer
          )}
        </View>
      )}
    </SafeAreaView>
  );

  if (avoidKeyboard) {
    return (
      <GradientBackground>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {mainContent}
        </KeyboardAvoidingView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>{mainContent}</View>
    </GradientBackground>
  );
}

// Close (X) icon component
function CloseIcon() {
  return (
    <View style={styles.closeIcon}>
      <View style={styles.closeIconLine1} />
      <View style={styles.closeIconLine2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconLine1: {
    position: 'absolute',
    width: 18,
    height: 2,
    backgroundColor: colors.text,
    transform: [{ rotate: '45deg' }],
  },
  closeIconLine2: {
    position: 'absolute',
    width: 18,
    height: 2,
    backgroundColor: colors.text,
    transform: [{ rotate: '-45deg' }],
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  nonScrollContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtle,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  body: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footerWithBack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  backButton: {
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 22,
    letterSpacing: -0.408,
  },
  continueButtonWrapper: {
    flex: 1,
  },
});
