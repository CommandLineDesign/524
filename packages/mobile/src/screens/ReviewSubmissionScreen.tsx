import Ionicons from '@expo/vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StarRating } from '../components/StarRating';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSubmitReviewMutation } from '../query/reviews';
import { OfflineReviewDraftService } from '../services/offlineReviewDraftService';
import {
  pickReviewPhotos,
  uploadReviewPhotos,
  validateReviewPhotos,
} from '../services/reviewPhotoUploadService';
import { ReviewUploadQueueService } from '../services/reviewUploadQueueService';
import { colors, overlays } from '../theme/colors';

type ReviewSubmissionNavProp = NativeStackNavigationProp<RootStackParamList, 'ReviewSubmission'>;
type ReviewSubmissionRouteProp = RouteProp<RootStackParamList, 'ReviewSubmission'>;

export function ReviewSubmissionScreen() {
  const navigation = useNavigation<ReviewSubmissionNavProp>();
  const route = useRoute<ReviewSubmissionRouteProp>();
  const { bookingId } = route.params;

  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    failedPhotos: number[];
  } | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  const submitReviewMutation = useSubmitReviewMutation();
  const networkStatus = useNetworkStatus();

  const allRatingsProvided =
    overallRating > 0 && qualityRating > 0 && professionalismRating > 0 && timelinessRating > 0;

  // Load existing draft on mount
  useEffect(() => {
    loadDraft();

    // Start background processing service
    const uploadQueueService = ReviewUploadQueueService.getInstance();
    uploadQueueService.startAutoProcessing();

    return () => {
      // Clean up old drafts when unmounting
      const draftService = OfflineReviewDraftService.getInstance();
      draftService.cleanupOldDrafts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft when form changes
  useEffect(() => {
    if (!isLoadingDraft && allRatingsProvided) {
      saveDraftDebounced();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingDraft, allRatingsProvided]);

  const loadDraft = async () => {
    try {
      const draftService = OfflineReviewDraftService.getInstance();
      const existingDraft = await draftService.getDraftForBooking(bookingId);

      if (existingDraft) {
        setDraftId(existingDraft.id);
        setOverallRating(existingDraft.overallRating);
        setQualityRating(existingDraft.qualityRating);
        setProfessionalismRating(existingDraft.professionalismRating);
        setTimelinessRating(existingDraft.timelinessRating);
        setReviewText(existingDraft.reviewText);

        // Restore photos from draft
        const photos: ImagePicker.ImagePickerAsset[] = existingDraft.photos.map((p) => ({
          uri: p.uri,
          width: 0,
          height: 0,
          fileSize: p.fileSize,
          mimeType: p.mimeType,
        }));
        setSelectedPhotos(photos);
      }
    } catch (error) {
      // Failed to load draft - continue without draft data
    } finally {
      setIsLoadingDraft(false);
    }
  };

  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  const saveDraftDebounced = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveDraft();
    }, 1000); // Save after 1 second of inactivity
  };

  const saveDraft = async () => {
    try {
      const draftService = OfflineReviewDraftService.getInstance();
      const savedDraftId = await draftService.saveDraft({
        bookingId,
        overallRating,
        qualityRating,
        professionalismRating,
        timelinessRating,
        reviewText,
        photos: selectedPhotos,
        draftId: draftId || undefined,
      });
      setDraftId(savedDraftId);
    } catch (error) {
      // Failed to save draft - continue silently
    }
  };

  const handlePickPhotos = async () => {
    try {
      const maxPhotos = 5 - selectedPhotos.length;
      if (maxPhotos <= 0) {
        Alert.alert('사진 제한', '최대 5장까지만 추가할 수 있습니다.');
        return;
      }

      const photos = await pickReviewPhotos(maxPhotos);
      if (photos.length > 0) {
        const allPhotos = [...selectedPhotos, ...photos];
        const validation = validateReviewPhotos(allPhotos);

        if (!validation.valid) {
          Alert.alert('사진 오류', validation.error || '사진 검증에 실패했습니다.');
          return;
        }

        setSelectedPhotos(allPhotos);
      }
    } catch (error) {
      Alert.alert('사진 선택 실패', '사진을 선택하는 중 오류가 발생했습니다.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!allRatingsProvided) {
      Alert.alert('평가 필요', '모든 항목에 별점을 매겨주세요.');
      return;
    }

    // Save draft first
    await saveDraft();

    // Check network connectivity
    if (!networkStatus.isConnected || !networkStatus.isInternetReachable) {
      Alert.alert(
        '오프라인 모드',
        '인터넷 연결이 없습니다. 리뷰가 저장되었으며 연결이 복원되면 자동으로 제출됩니다.',
        [
          {
            text: '확인',
            onPress: () => {
              // Navigate back - the queue processor will handle submission later
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }

    try {
      let reviewImageKeys:
        | Array<{ s3Key: string; fileSize: number; mimeType: string; displayOrder: number }>
        | undefined;

      // Upload photos if any are selected (Phase 1: Upload to S3)
      if (selectedPhotos.length > 0) {
        setUploadProgress({ current: 0, total: selectedPhotos.length, failedPhotos: [] });

        try {
          const uploadedPhotos = await uploadReviewPhotos(
            selectedPhotos,
            bookingId,
            (current, total) => {
              setUploadProgress({ current, total, failedPhotos: [] });
            }
          );

          // Store S3 keys instead of public URLs for the review submission
          reviewImageKeys = uploadedPhotos.map((photo, index) => ({
            s3Key: photo.key,
            fileSize: photo.fileSize,
            mimeType: photo.mimeType,
            displayOrder: index, // Explicit display order based on upload sequence
          }));
          setUploadProgress(null);
        } catch (error) {
          // If upload fails, allow review submission without photos
          setUploadProgress(null);

          // Use a promise to wait for user decision
          await new Promise<void>((resolve) => {
            Alert.alert(
              '사진 업로드 실패',
              '사진 업로드를 실패했지만 리뷰는 사진 없이 제출할 수 있습니다. 계속하시겠습니까?',
              [
                {
                  text: '취소',
                  style: 'cancel',
                  onPress: () => {
                    navigation.goBack();
                    resolve();
                  },
                },
                {
                  text: '사진 없이 제출',
                  onPress: () => {
                    // Continue with review submission without photos
                    reviewImageKeys = undefined;
                    resolve();
                  },
                },
              ]
            );
          });
        }
      }

      // Phase 2: Submit review with S3 keys - backend will create review_images rows only if validation passes
      await submitReviewMutation.mutateAsync({
        bookingId,
        payload: {
          overallRating,
          qualityRating,
          professionalismRating,
          timelinessRating,
          reviewText: reviewText.trim() || undefined,
          reviewImageKeys, // Changed from reviewImages to reviewImageKeys
        },
      });

      // Delete draft on successful submission
      if (draftId) {
        const draftService = OfflineReviewDraftService.getInstance();
        await draftService.deleteDraft(draftId);
      }

      // Navigate to confirmation screen
      navigation.navigate('ReviewConfirmation', { bookingId });
    } catch (error) {
      setUploadProgress(null);
      Alert.alert(
        '제출 실패',
        '리뷰 제출에 실패했습니다. 리뷰가 저장되었으며 나중에 다시 시도할 수 있습니다.',
        [
          {
            text: '나중에',
            onPress: () => navigation.goBack(),
          },
          {
            text: '다시 시도',
            onPress: () => handleSubmit(),
          },
        ]
      );
    }
  };

  if (isLoadingDraft) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>리뷰 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Offline indicator */}
          {!networkStatus.isConnected && (
            <View style={styles.offlineBanner}>
              <Ionicons name="cloud-offline-outline" size={20} color={colors.buttonText} />
              <Text style={styles.offlineBannerText}>
                오프라인 모드 - 연결 복원 시 자동 제출됩니다
              </Text>
            </View>
          )}

          {/* Draft restored indicator */}
          {draftId && (
            <View style={styles.draftBanner}>
              <Ionicons name="save-outline" size={20} color={colors.primary} />
              <Text style={styles.draftBannerText}>저장된 리뷰를 불러왔습니다</Text>
            </View>
          )}

          <Text style={styles.title}>서비스 리뷰</Text>
          <Text style={styles.subtitle}>
            이 서비스는 어떠셨나요? 여러분의 솔직한 평가가 다른 고객들에게 도움이 됩니다.
          </Text>

          <View style={styles.ratingsSection}>
            <StarRating
              rating={overallRating}
              onRatingChange={setOverallRating}
              label="전체 만족도"
              hapticFeedback={true}
            />
            <StarRating
              rating={qualityRating}
              onRatingChange={setQualityRating}
              label="서비스 품질"
              hapticFeedback={true}
            />
            <StarRating
              rating={professionalismRating}
              onRatingChange={setProfessionalismRating}
              label="전문성"
              hapticFeedback={true}
            />
            <StarRating
              rating={timelinessRating}
              onRatingChange={setTimelinessRating}
              label="시간 준수"
              hapticFeedback={true}
            />
          </View>

          <View style={styles.textSection}>
            <Text style={styles.textLabel}>자세한 리뷰 (선택사항)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="서비스에 대한 자세한 의견을 남겨주세요..."
              value={reviewText}
              onChangeText={setReviewText}
              selectionColor={colors.text}
              cursorColor={colors.text}
              multiline
              numberOfLines={4}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{reviewText.length}/1000</Text>
          </View>

          <View style={styles.photoSection}>
            <Text style={styles.textLabel}>사진 추가 (선택사항, 최대 5장)</Text>

            {selectedPhotos.length > 0 && (
              <View style={styles.photoGrid}>
                {selectedPhotos.map((photo, index) => (
                  <View key={photo.uri} style={styles.photoThumbnail}>
                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.buttonText} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {selectedPhotos.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handlePickPhotos}
                disabled={submitReviewMutation.isPending || uploadProgress !== null}
              >
                <Ionicons name="camera-outline" size={24} color={colors.primary} />
                <Text style={styles.addPhotoText}>사진 추가 ({selectedPhotos.length}/5)</Text>
              </TouchableOpacity>
            )}

            {uploadProgress && (
              <View style={styles.uploadProgressContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.uploadProgressText}>
                  사진 업로드 중... {uploadProgress.current}/{uploadProgress.total}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!allRatingsProvided || submitReviewMutation.isPending) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!allRatingsProvided || submitReviewMutation.isPending}
            >
              {submitReviewMutation.isPending ? (
                <ActivityIndicator color={colors.buttonText} />
              ) : (
                <Text style={styles.submitButtonText}>리뷰 제출하기</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={submitReviewMutation.isPending}
            >
              <Text style={styles.cancelButtonText}>나중에 하기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  offlineBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.buttonText,
    fontWeight: '500',
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  draftBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  ratingsSection: {
    marginBottom: 32,
  },
  textSection: {
    marginBottom: 32,
  },
  textLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonSection: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  photoSection: {
    marginBottom: 32,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Show full image within bounds to avoid unexpected cropping
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: overlays.modalBackdropDark,
    borderRadius: 12,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 16,
    color: colors.text,
  },
  uploadProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 12,
  },
  uploadProgressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
