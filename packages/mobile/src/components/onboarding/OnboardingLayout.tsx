import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme/colors';

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
    backgroundColor: theme.colors.background,
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  stepLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.subtle,
    marginBottom: theme.spacing.lg,
  },
  body: {},
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
});
