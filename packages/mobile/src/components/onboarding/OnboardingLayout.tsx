import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme';
import { spacing } from '../../theme';

type OnboardingLayoutProps = {
  title: string;
  subtitle?: string;
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function OnboardingLayout({
  title,
  subtitle,
  step,
  totalSteps,
  children,
  footer,
}: OnboardingLayoutProps) {
  const progress = Math.min(Math.max(step / totalSteps, 0), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>{`Step ${step} of ${totalSteps}`}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.accent,
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
