import { ArtistProfile, PortfolioImage } from '@524/shared';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { presignProfilePhoto, updateArtistAvailability } from '../api/client';
import { AvailabilitySelector } from '../components/availability';
import { ContinueButton } from '../components/booking/ContinueButton';
import { LocationPicker } from '../components/location';
import { MultiSelectButtons } from '../components/onboarding/MultiSelectButtons';
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import { usePortfolioUpload } from '../hooks/usePortfolioUpload';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useUpdateArtistProfile } from '../query/artist';
import { useAuthStore } from '../store/authStore';
import { borderRadius, colors, spacing } from '../theme';
import { formStyles } from '../theme/formStyles';
import { getCurrentWeekId } from '../utils/weekUtils';

type StepKey = 'basic' | 'specialties' | 'availability' | 'service_area' | 'photo' | 'portfolio';

const SPECIALTY_OPTIONS = [
  { id: 'hair', label: 'Hair styling' },
  { id: 'makeup', label: 'Makeup' },
];

type DraftProfile = Pick<
  ArtistProfile,
  'stageName' | 'bio' | 'specialties' | 'yearsExperience' | 'primaryLocation' | 'serviceRadiusKm'
> & { profileImageUrl?: string; portfolioImages?: PortfolioImage[] };

const EMPTY_PROFILE: DraftProfile = {
  stageName: '',
  bio: '',
  specialties: [],
  yearsExperience: 0,
  primaryLocation: { latitude: 0, longitude: 0, address: '' },
  serviceRadiusKm: 0,
  profileImageUrl: undefined,
  portfolioImages: [],
};

function inferContentType(asset: ImagePicker.ImagePickerAsset) {
  if (asset.mimeType?.includes('/')) {
    return asset.mimeType;
  }

  const ext = asset.uri?.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';

  return 'image/jpeg';
}

export function ArtistOnboardingFlowScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<DraftProfile>(EMPTY_PROFILE);
  const [uploading, setUploading] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);
  const { mutateAsync: saveProfile, isPending } = useUpdateArtistProfile(userId);

  // Use shared portfolio upload hook
  const handlePortfolioImagesUploaded = useCallback((newImages: PortfolioImage[]) => {
    setDraft((prev) => ({
      ...prev,
      portfolioImages: [...(prev.portfolioImages ?? []), ...newImages],
    }));
  }, []);

  const {
    isUploading: portfolioUploading,
    uploadProgress: portfolioUploadProgress,
    pickAndUploadImages: pickPortfolioImages,
  } = usePortfolioUpload({
    currentCount: draft.portfolioImages?.length ?? 0,
    maxImages: 10,
    onImagesUploaded: handlePortfolioImagesUploaded,
  });

  // Availability state (stored separately since it's saved per-week via API)
  const [availabilityWeekId, setAvailabilityWeekId] = useState(getCurrentWeekId());
  const [availabilitySlots, setAvailabilitySlots] = useState<Set<string>>(new Set());

  const steps: StepKey[] = useMemo(
    () => ['basic', 'specialties', 'availability', 'service_area', 'photo', 'portfolio'],
    []
  );
  const currentStep = steps[stepIndex];

  const goNext = async () => {
    // Save availability when leaving the availability step (if any slots selected)
    if (currentStep === 'availability' && availabilitySlots.size > 0) {
      try {
        await updateArtistAvailability(availabilityWeekId, Array.from(availabilitySlots));
      } catch (error) {
        console.error('Failed to save availability:', error);
        // Continue anyway - availability is optional
      }
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    await handleSubmit();
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((prev) => prev - 1);
  };

  const updateField = (partial: Partial<DraftProfile>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const handleSubmit = async () => {
    if (!draft.stageName.trim()) {
      Alert.alert('Add a stage name', 'Please provide your stage or brand name.');
      setStepIndex(0);
      return;
    }

    try {
      await saveProfile({
        stageName: draft.stageName.trim(),
        bio: draft.bio.trim(),
        specialties: draft.specialties,
        yearsExperience: draft.yearsExperience,
        primaryLocation: draft.primaryLocation,
        serviceRadiusKm: draft.serviceRadiusKm,
        profileImageUrl: draft.profileImageUrl,
        portfolioImages: draft.portfolioImages,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'ArtistPending' }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Save failed',
        'Could not save your profile. Please check your connection and try again.'
      );
    }
  };

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Permission needed',
        'Please allow photo library access to upload a profile image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.uri) return;

    try {
      setUploading(true);
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const contentType = inferContentType(asset);
      console.debug('[upload-debug] inferred content type', contentType, { uri: asset.uri });
      console.debug('[upload-debug] picked image blob', {
        size: blob.size,
        type: blob.type,
        uri: asset.uri,
      });

      const presign = await presignProfilePhoto(contentType, blob.size);
      console.debug('[upload-debug] presign response', {
        uploadUrl: presign.uploadUrl,
        bucket: presign.bucket,
        publicUrl: presign.publicUrl,
      });

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        const errorBody = await uploadResponse.text().catch(() => '<unreadable body>');
        console.error('[upload-debug] upload failed', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          headers: Object.fromEntries(uploadResponse.headers.entries()),
          body: errorBody?.slice(0, 500),
        });
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      const publicUrl = presign.publicUrl ?? presign.uploadUrl.split('?')[0];
      updateField({ profileImageUrl: publicUrl });
      Alert.alert('Uploaded', 'Profile photo uploaded successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Upload failed', 'Could not upload profile photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePortfolioImage = (index: number) => {
    updateField({
      portfolioImages: draft.portfolioImages?.filter((_, i) => i !== index) ?? [],
    });
  };

  const isUploading = uploading || portfolioUploading;

  const renderFooter = (ctaLabel: string) => (
    <View style={styles.footerRow}>
      <TouchableOpacity
        onPress={goBack}
        disabled={stepIndex === 0 || isPending || isUploading}
        style={[styles.backButton, stepIndex === 0 && styles.backButtonDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Back"
        accessibilityHint="Go to previous step"
      >
        <Text style={[styles.backButtonText, stepIndex === 0 && styles.backButtonTextDisabled]}>
          Back
        </Text>
      </TouchableOpacity>
      <View style={styles.continueButtonWrapper}>
        <ContinueButton
          label={isPending || isUploading ? 'Saving...' : ctaLabel}
          onPress={goNext}
          disabled={isPending || isUploading}
        />
      </View>
    </View>
  );

  if (currentStep === 'basic') {
    return (
      <OnboardingLayout
        title="Tell us about your brand"
        subtitle="Share your stage name and a short bio."
        step={stepIndex + 1}
        totalSteps={steps.length}
        showStepText={false}
        footer={renderFooter('Next')}
      >
        <ScrollView contentContainerStyle={styles.formContent}>
          <View>
            <Text style={formStyles.label}>Stage name</Text>
            <TextInput
              value={draft.stageName}
              onChangeText={(text) => updateField({ stageName: text })}
              placeholder="e.g., Glow Studio"
              placeholderTextColor={colors.muted}
              selectionColor={colors.text}
              cursorColor={colors.text}
              style={formStyles.input}
              accessibilityLabel="Stage name"
            />
          </View>
          <View>
            <Text style={formStyles.label}>Bio</Text>
            <TextInput
              value={draft.bio}
              onChangeText={(text) => updateField({ bio: text })}
              multiline
              numberOfLines={4}
              placeholder="Highlight your style and experience."
              placeholderTextColor={colors.muted}
              selectionColor={colors.text}
              cursorColor={colors.text}
              style={[formStyles.input, styles.textArea]}
              accessibilityLabel="Bio"
            />
          </View>
        </ScrollView>
      </OnboardingLayout>
    );
  }

  if (currentStep === 'specialties') {
    return (
      <OnboardingLayout
        title="Your specialties"
        subtitle="Pick the services you provide and your experience."
        step={stepIndex + 1}
        totalSteps={steps.length}
        showStepText={false}
        footer={renderFooter('Next')}
      >
        <View style={styles.formContent}>
          <MultiSelectButtons
            options={SPECIALTY_OPTIONS}
            selected={draft.specialties as string[]}
            onToggle={(id) => {
              const serviceId = id as 'hair' | 'makeup';
              const next = draft.specialties.includes(serviceId)
                ? draft.specialties.filter((x) => x !== serviceId)
                : [...draft.specialties, serviceId];
              updateField({ specialties: next });
            }}
          />
          <View>
            <Text style={formStyles.label}>Years of experience</Text>
            <TextInput
              value={draft.yearsExperience?.toString() ?? ''}
              onChangeText={(text) => updateField({ yearsExperience: Number(text) || 0 })}
              placeholder="e.g., 5"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              selectionColor={colors.text}
              cursorColor={colors.text}
              style={formStyles.input}
              accessibilityLabel="Years of experience"
            />
          </View>
        </View>
      </OnboardingLayout>
    );
  }

  if (currentStep === 'availability') {
    return (
      <OnboardingLayout
        title="When are you available?"
        subtitle="Set your typical working schedule. You can skip this and set it later."
        step={stepIndex + 1}
        totalSteps={steps.length}
        showStepText={false}
        footer={renderFooter('Next')}
        fillContent
      >
        <AvailabilitySelector
          weekId={availabilityWeekId}
          selectedSlots={availabilitySlots}
          onSlotsChange={setAvailabilitySlots}
          onWeekChange={setAvailabilityWeekId}
          showQuickActions={true}
          showWeekNavigator={true}
          showSummary={true}
        />
      </OnboardingLayout>
    );
  }

  if (currentStep === 'service_area') {
    return (
      <OnboardingLayout
        title="Where do you serve?"
        subtitle="Set your location and how far you'll travel."
        step={stepIndex + 1}
        totalSteps={steps.length}
        showStepText={false}
        footer={renderFooter('Next')}
        fillContent
      >
        <LocationPicker
          location={draft.primaryLocation}
          onLocationChange={(location) => updateField({ primaryLocation: location })}
          showRadiusSelector={true}
          radiusKm={draft.serviceRadiusKm}
          onRadiusChange={(radiusKm) => updateField({ serviceRadiusKm: radiusKm })}
        />
      </OnboardingLayout>
    );
  }

  if (currentStep === 'photo') {
    return (
      <OnboardingLayout
        title="Add a profile photo"
        subtitle="Upload a photo clients will see on your profile."
        step={stepIndex + 1}
        totalSteps={steps.length}
        showStepText={false}
        footer={renderFooter('Next')}
      >
        <View style={styles.photoSection}>
          {draft.profileImageUrl ? (
            <Image
              source={{ uri: draft.profileImageUrl }}
              style={styles.profileImage}
              resizeMode="cover"
              accessibilityLabel="Profile photo preview"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>No photo selected</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={pickImage}
            disabled={uploading || isPending}
            style={[styles.choosePhotoButton, (uploading || isPending) && styles.buttonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Choose photo"
            accessibilityHint="Opens image picker"
          >
            <Text style={styles.choosePhotoButtonText}>
              {uploading ? 'Uploading...' : 'Choose photo'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>
            We store your photo securely in S3 using a time-limited upload link.
          </Text>
        </View>
      </OnboardingLayout>
    );
  }

  // Portfolio step
  return (
    <OnboardingLayout
      title="Showcase your work"
      subtitle="Add photos of your best work to attract clients."
      step={stepIndex + 1}
      totalSteps={steps.length}
      showStepText={false}
      footer={renderFooter('Submit')}
    >
      <View style={styles.portfolioSection}>
        {(draft.portfolioImages?.length ?? 0) > 0 && (
          <View style={styles.portfolioGrid}>
            {draft.portfolioImages?.map((image, index) => (
              <View key={image.url} style={styles.portfolioThumbnailContainer}>
                <Image
                  source={{ uri: image.url }}
                  style={styles.portfolioThumbnail}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePortfolioImage(index)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {(draft.portfolioImages?.length ?? 0) < 10 && (
          <TouchableOpacity
            onPress={pickPortfolioImages}
            disabled={portfolioUploading || isPending}
            style={[
              styles.choosePhotoButton,
              (portfolioUploading || isPending) && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add portfolio photos"
          >
            <Text style={styles.choosePhotoButtonText}>
              {portfolioUploading
                ? `Uploading ${portfolioUploadProgress?.current ?? 0}/${portfolioUploadProgress?.total ?? 0}...`
                : `Add photos (${draft.portfolioImages?.length ?? 0}/10)`}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.helperText}>
          You can skip this step and add portfolio images later.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  formContent: {
    gap: spacing.md,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    height: spacing.inputHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonDisabled: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  backButtonTextDisabled: {
    color: colors.muted,
  },
  continueButtonWrapper: {
    flex: 1,
  },
  photoSection: {
    gap: spacing.md,
    alignItems: 'center',
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.xl,
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  photoPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  choosePhotoButton: {
    height: spacing.inputHeight,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choosePhotoButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  helperText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  portfolioSection: {
    gap: spacing.md,
    alignItems: 'center',
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  portfolioThumbnailContainer: {
    position: 'relative',
  },
  portfolioThumbnail: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
});
