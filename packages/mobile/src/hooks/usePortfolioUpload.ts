import type { PortfolioImage, ServiceType } from '@524/shared';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { presignProfilePhoto } from '../api/client';

function inferContentType(asset: ImagePicker.ImagePickerAsset) {
  if (asset.mimeType?.includes('/')) {
    return asset.mimeType;
  }
  const ext = asset.uri?.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'image/jpeg';
}

export interface UsePortfolioUploadOptions {
  /** Current images count */
  currentCount: number;
  /** Maximum images allowed */
  maxImages?: number;
  /** Service category to tag uploaded images with */
  serviceCategory?: ServiceType;
  /** Callback when images are successfully uploaded */
  onImagesUploaded: (newImages: PortfolioImage[]) => void;
}

export interface UsePortfolioUploadResult {
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Current upload progress */
  uploadProgress: { current: number; total: number } | null;
  /** Pick and upload images */
  pickAndUploadImages: () => Promise<void>;
}

export function usePortfolioUpload({
  currentCount,
  maxImages = 10,
  serviceCategory,
  onImagesUploaded,
}: UsePortfolioUploadOptions): UsePortfolioUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const pickAndUploadImages = useCallback(async () => {
    const maxToSelect = maxImages - currentCount;

    if (maxToSelect <= 0) {
      Alert.alert('Maximum reached', `You can only upload up to ${maxImages} portfolio images.`);
      return;
    }

    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Permission needed',
        'Please allow photo library access to upload portfolio images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxToSelect,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    try {
      setIsUploading(true);
      const assets = result.assets;
      setUploadProgress({ current: 0, total: assets.length });

      const newImages: PortfolioImage[] = [];
      let failedCount = 0;

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (!asset.uri) continue;

        setUploadProgress({ current: i + 1, total: assets.length });

        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const contentType = inferContentType(asset);

          const presign = await presignProfilePhoto(contentType, blob.size);

          const uploadResponse = await fetch(presign.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': contentType },
            body: blob,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed with status ${uploadResponse.status}`);
          }

          const publicUrl = presign.publicUrl ?? presign.uploadUrl.split('?')[0];
          newImages.push({
            url: publicUrl,
            serviceCategory,
          });
        } catch {
          failedCount++;
        }
      }

      // Save any successfully uploaded images
      if (newImages.length > 0) {
        onImagesUploaded(newImages);
      }

      // Show appropriate message based on results
      if (failedCount === 0 && newImages.length > 0) {
        Alert.alert('Uploaded', `${newImages.length} photo(s) uploaded successfully.`);
      } else if (newImages.length > 0) {
        Alert.alert(
          'Partial upload',
          `${newImages.length} photo(s) uploaded successfully. ${failedCount} failed.`
        );
      } else if (failedCount > 0) {
        Alert.alert('Upload failed', 'Could not upload photos. Please try again.');
      }
    } catch {
      Alert.alert('Upload failed', 'Could not upload photos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [currentCount, maxImages, serviceCategory, onImagesUploaded]);

  return {
    isUploading,
    uploadProgress,
    pickAndUploadImages,
  };
}
