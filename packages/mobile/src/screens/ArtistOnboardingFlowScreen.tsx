import { ArtistProfile } from '@524/shared';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { presignProfilePhoto } from '../api/client';
import { MultiSelectButtons } from '../components/onboarding/MultiSelectButtons';
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useUpdateArtistProfile } from '../query/artist';
import { theme } from '../theme/colors';

type StepKey = 'basic' | 'specialties' | 'service_area' | 'photo';

const SPECIALTY_OPTIONS = [
  { id: 'hair', label: 'Hair styling' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'combo', label: 'Hair + Makeup' },
];

type DraftProfile = Pick<
  ArtistProfile,
  'stageName' | 'bio' | 'specialties' | 'yearsExperience' | 'primaryLocation' | 'serviceRadiusKm'
> & { profileImageUrl?: string };

const EMPTY_PROFILE: DraftProfile = {
  stageName: '',
  bio: '',
  specialties: [],
  yearsExperience: 0,
  primaryLocation: { latitude: 0, longitude: 0, address: '' },
  serviceRadiusKm: 0,
  profileImageUrl: undefined,
};

export function ArtistOnboardingFlowScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<DraftProfile>(EMPTY_PROFILE);
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: saveProfile, isPending } = useUpdateArtistProfile();

  const steps: StepKey[] = useMemo(() => ['basic', 'specialties', 'service_area', 'photo'], []);
  const currentStep = steps[stepIndex];

  const goNext = async () => {
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

    await saveProfile({
      stageName: draft.stageName.trim(),
      bio: draft.bio.trim(),
      specialties: draft.specialties,
      yearsExperience: draft.yearsExperience,
      primaryLocation: draft.primaryLocation,
      serviceRadiusKm: draft.serviceRadiusKm,
      profileImageUrl: draft.profileImageUrl,
      verificationStatus: 'pending_review',
    });

    navigation.reset({
      index: 0,
      routes: [{ name: 'ArtistPending' }],
    });
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
      const contentType = asset.type === 'video' ? 'image/jpeg' : (asset.type ?? 'image/jpeg');
      const presign = await presignProfilePhoto(contentType);

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      });

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

  const renderFooter = (ctaLabel: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }}>
      <TouchableOpacity
        onPress={goBack}
        disabled={stepIndex === 0 || isPending || uploading}
        style={{
          flex: 1,
          padding: theme.spacing.md,
          backgroundColor: stepIndex === 0 ? theme.colors.border : '#fff',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text style={{ textAlign: 'center', color: theme.colors.text, fontWeight: '600' }}>
          Back
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={goNext}
        disabled={isPending || uploading}
        style={{
          flex: 1,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.accent,
          borderRadius: 12,
        }}
      >
        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700' }}>
          {isPending || uploading ? 'Saving...' : ctaLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (currentStep === 'basic') {
    return (
      <OnboardingLayout
        title="Tell us about your brand"
        subtitle="Share your stage name and a short bio."
        step={stepIndex + 1}
        totalSteps={steps.length}
        footer={renderFooter('Next')}
      >
        <ScrollView contentContainerStyle={{ gap: theme.spacing.md }}>
          <View>
            <Text style={{ fontWeight: '700', marginBottom: 6, color: theme.colors.text }}>
              Stage name
            </Text>
            <TextInput
              value={draft.stageName}
              onChangeText={(text) => updateField({ stageName: text })}
              placeholder="e.g., Glow Studio"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.md,
                borderRadius: 10,
              }}
            />
          </View>
          <View>
            <Text style={{ fontWeight: '700', marginBottom: 6, color: theme.colors.text }}>
              Bio
            </Text>
            <TextInput
              value={draft.bio}
              onChangeText={(text) => updateField({ bio: text })}
              multiline
              numberOfLines={4}
              placeholder="Highlight your style and experience."
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.md,
                borderRadius: 10,
                minHeight: 120,
                textAlignVertical: 'top',
              }}
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
        footer={renderFooter('Next')}
      >
        <View style={{ gap: theme.spacing.md }}>
          <MultiSelectButtons
            options={SPECIALTY_OPTIONS}
            selected={draft.specialties as string[]}
            onToggle={(id) => {
              const next = draft.specialties.includes(id)
                ? draft.specialties.filter((x) => x !== id)
                : [...draft.specialties, id];
              updateField({ specialties: next });
            }}
          />
          <View>
            <Text style={{ fontWeight: '700', marginBottom: 6, color: theme.colors.text }}>
              Years of experience
            </Text>
            <TextInput
              value={draft.yearsExperience?.toString() ?? ''}
              onChangeText={(text) => updateField({ yearsExperience: Number(text) || 0 })}
              placeholder="e.g., 5"
              keyboardType="number-pad"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.md,
                borderRadius: 10,
              }}
            />
          </View>
        </View>
      </OnboardingLayout>
    );
  }

  if (currentStep === 'service_area') {
    return (
      <OnboardingLayout
        title="Where do you serve?"
        subtitle="Set your primary location and travel radius."
        step={stepIndex + 1}
        totalSteps={steps.length}
        footer={renderFooter('Next')}
      >
        <View style={{ gap: theme.spacing.md }}>
          <View>
            <Text style={{ fontWeight: '700', marginBottom: 6, color: theme.colors.text }}>
              Address / neighborhood
            </Text>
            <TextInput
              value={draft.primaryLocation.address ?? ''}
              onChangeText={(text) =>
                updateField({ primaryLocation: { ...draft.primaryLocation, address: text } })
              }
              placeholder="e.g., Gangnam, Seoul"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.md,
                borderRadius: 10,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', marginBottom: 6, color: theme.colors.text }}>
                Latitude
              </Text>
              <TextInput
                value={draft.primaryLocation.latitude?.toString() ?? ''}
                onChangeText={(text) =>
                  updateField({
                    primaryLocation: {
                      ...draft.primaryLocation,
                      latitude: Number(text) || 0,
                    },
                  })
                }
                placeholder="37.4979"
                keyboardType="decimal-pad"
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  padding: theme.spacing.md,
                  borderRadius: 10,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', marginBottom: 6, color: theme.colors.text }}>
                Longitude
              </Text>
              <TextInput
                value={draft.primaryLocation.longitude?.toString() ?? ''}
                onChangeText={(text) =>
                  updateField({
                    primaryLocation: {
                      ...draft.primaryLocation,
                      longitude: Number(text) || 0,
                    },
                  })
                }
                placeholder="127.0276"
                keyboardType="decimal-pad"
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  padding: theme.spacing.md,
                  borderRadius: 10,
                }}
              />
            </View>
          </View>
          <View>
            <Text style={{ fontWeight: '700', marginBottom: 6, color: theme.colors.text }}>
              Service radius (km)
            </Text>
            <TextInput
              value={draft.serviceRadiusKm?.toString() ?? ''}
              onChangeText={(text) => updateField({ serviceRadiusKm: Number(text) || 0 })}
              placeholder="e.g., 10"
              keyboardType="decimal-pad"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.md,
                borderRadius: 10,
              }}
            />
          </View>
        </View>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      title="Add a profile photo"
      subtitle="Upload a photo clients will see on your profile."
      step={stepIndex + 1}
      totalSteps={steps.length}
      footer={renderFooter('Submit')}
    >
      <View style={{ gap: theme.spacing.md, alignItems: 'center' }}>
        {draft.profileImageUrl ? (
          <Image
            source={{ uri: draft.profileImageUrl }}
            style={{ width: 200, height: 200, borderRadius: 16 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fafafa',
            }}
          >
            <Text style={{ color: theme.colors.textMuted }}>No photo selected</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={pickImage}
          disabled={uploading || isPending}
          style={{
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            backgroundColor: theme.colors.accent,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {uploading ? 'Uploading...' : 'Choose photo'}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
          We store your photo securely in S3 using a time-limited upload link.
        </Text>
      </View>
    </OnboardingLayout>
  );
}
