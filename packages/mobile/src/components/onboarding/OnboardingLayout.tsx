import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { GradientBackground } from '../common/GradientBackground';

type OnboardingLayoutProps = {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** When true, children fill available space without scrolling */
  fillContent?: boolean;
  /** When false, hides the "Step x of y" text */
  showStepText?: boolean;
};

export function OnboardingLayout({
  title,
  subtitle,
  step,
  totalSteps,
  children,
  footer,
  fillContent = false,
  showStepText = true,
}: OnboardingLayoutProps) {
  const progress = step && totalSteps ? Math.min(Math.max(step / totalSteps, 0), 1) : 1;

  const headerContent = (
    <>
      {showStepText && step && totalSteps ? (
        <Text style={styles.stepLabel}>{`Step ${step} of ${totalSteps}`}</Text>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        {fillContent ? (
          <View style={styles.fillContent}>
            {headerContent}
            <View style={styles.fillBody}>{children}</View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {headerContent}
            <View style={styles.body}>{children}</View>
          </ScrollView>
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  stepLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtle,
    marginBottom: spacing.lg,
  },
  body: {},
  fillContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  fillBody: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    marginTop: spacing.lg,
  },
});
