import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { borderRadius, colors, overlays, spacing } from '../../theme';

export interface CancellationReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting: boolean;
}

export function CancellationReasonModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}: CancellationReasonModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('취소 사유를 입력해 주세요');
      return;
    }
    if (reason.length > 500) {
      setError('취소 사유는 500자 이내로 입력해 주세요');
      return;
    }
    setError(null);
    onSubmit(reason.trim());
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const isValid = reason.trim().length > 0 && reason.length <= 500;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.title}>예약 취소</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close"
              accessibilityRole="button"
              disabled={isSubmitting}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              확정된 예약을 취소하려면 고객에게 전달할 취소 사유를 입력해 주세요.
            </Text>

            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="취소 사유를 입력해 주세요"
              placeholderTextColor={colors.muted}
              value={reason}
              onChangeText={(text) => {
                setReason(text);
                if (error) setError(null);
              }}
              multiline
              numberOfLines={4}
              maxLength={500}
              editable={!isSubmitting}
              textAlignVertical="top"
            />

            <View style={styles.inputFooter}>
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <View style={styles.placeholder} />
              )}
              <Text style={styles.charCount}>{reason.length}/500</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  (!isValid || isSubmitting) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>예약 취소하기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: overlays.modalBackdrop,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.muted,
    lineHeight: 24,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    minHeight: 120,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  placeholder: {
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },
  charCount: {
    fontSize: 13,
    color: colors.muted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.error,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
