// React hook for photo upload functionality
import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Network from 'expo-network';
import { TelegramBotApi } from '../lib/telegram/botApi';
import { getBotToken } from '../lib/storage/secure';
import { getBotById } from '../lib/database/dao';
import { markPhotoAsUploaded, insertRemotePhoto } from '../lib/database/dao';
import { useDatabase } from './useDatabase';
import { retryWithBackoff } from '../lib/utils/retry';
import type { MediaAsset } from './useMediaLibrary';

export interface UploadProgress {
  photoId: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  retryCount?: number;
}

export interface UseUploadResult {
  uploadProgress: Map<string, UploadProgress>;
  uploadStats: {
    total: number;
    completed: number;
    failed: number;
    current: number;
    currentProgress: number;
  };
  isUploading: boolean;
  uploadPhotos: (assets: MediaAsset[]) => Promise<void>;
  cancelUpload: (photoId: string) => void;
}

/**
 * Check if network type allows upload based on WiFi-only setting
 */
async function checkNetworkAllowed(wifiOnly: boolean): Promise<boolean> {
  if (!wifiOnly) return true; // WiFi-only disabled, allow all networks

  try {
    const networkState = await Network.getNetworkStateAsync();

    // Allow WiFi, Ethernet, or Unknown (safer to allow than block)
    if (
      networkState.type === Network.NetworkStateType.WIFI ||
      networkState.type === Network.NetworkStateType.ETHERNET ||
      networkState.type === Network.NetworkStateType.UNKNOWN
    ) {
      return true;
    }

    // Block cellular
    return false;
  } catch (error) {
    // On error, allow upload (safer UX than blocking user)
    console.error('[useUpload] Network check failed:', error);
    return true;
  }
}

export function useUpload(): UseUploadResult {
  const { settings } = useDatabase();
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const cancelUpload = useCallback((photoId: string) => {
    // TODO: Implement cancel logic (requires storing XHR references)
    setUploadProgress((prev) => {
      const next = new Map(prev);
      next.delete(photoId);
      return next;
    });
  }, []);

  const uploadPhotos = useCallback(async (assets: MediaAsset[]) => {
    if (!settings?.primaryBotId) {
      Alert.alert('Error', 'Please configure your Telegram bot in Settings first.');
      return;
    }

    // Check network if WiFi-only enabled
    const networkAllowed = await checkNetworkAllowed(settings?.wifiOnly || false);
    if (!networkAllowed) {
      Alert.alert(
        'WiFi Required',
        'WiFi-only uploads is enabled. Please connect to WiFi and try again.',
        [{ text: 'OK', style: 'default' }]
      );
      return; // Don't proceed with upload
    }

    setIsUploading(true);

    try {
      // Get bot configuration
      const bot = await getBotById(settings.primaryBotId);
      if (!bot) {
        Alert.alert('Error', 'Bot configuration not found.');
        return;
      }

      // Get bot token from secure storage
      const token = await getBotToken(bot.id);
      if (!token) {
        Alert.alert('Error', 'Bot token not found. Please reconfigure your bot.');
        return;
      }

      // Create bot API instance
      const botApi = new TelegramBotApi(token);

      // Initialize progress for all photos
      const initialProgress = new Map<string, UploadProgress>();
      assets.forEach((asset) => {
        initialProgress.set(asset.id, {
          photoId: asset.id,
          progress: 0,
          status: 'pending',
        });
      });
      setUploadProgress(initialProgress);

      // Upload each photo sequentially (avoid rate limits)
      for (const asset of assets) {
        try {
          // Update status to uploading
          setUploadProgress((prev) => {
            const next = new Map(prev);
            next.set(asset.id, {
              ...next.get(asset.id)!,
              status: 'uploading',
              progress: 0,
              retryCount: 0,
            });
            return next;
          });

          // Upload to Telegram with automatic retry
          const response = await retryWithBackoff(
            async () => {
              return await botApi.sendDocument(
                bot.channelId,
                asset.uri,
                asset.filename,
                (progress) => {
                  setUploadProgress((prev) => {
                    const next = new Map(prev);
                    const current = next.get(asset.id);
                    if (current) {
                      next.set(asset.id, { ...current, progress });
                    }
                    return next;
                  });
                }
              );
            },
            3, // max retries
            2000 // 2 second base delay
          );

          if (response.ok && response.result?.document) {
            const { document, message_id } = response.result;

            // Save to database - mark device photo as uploaded
            await markPhotoAsUploaded(asset.id, document.file_id, message_id);

            // Also add to remote_photos table
            await insertRemotePhoto({
              remoteId: document.file_id,
              fileName: asset.filename,
              mimeType: asset.mediaType === 'photo' ? 'image/jpeg' : 'video/mp4',
              fileSize: document.file_size ?? null,
              uploadedAt: Date.now(),
              messageId: message_id,
              thumbnailCached: false,
              folderId: null,
            });

            // Update status to completed
            setUploadProgress((prev) => {
              const next = new Map(prev);
              next.set(asset.id, {
                photoId: asset.id,
                progress: 100,
                status: 'completed',
              });
              return next;
            });
          } else {
            throw new Error(response.description || 'Upload failed');
          }
        } catch (error) {
          console.error('[useUpload] Failed to upload photo after retries:', asset.id, error);
          setUploadProgress((prev) => {
            const next = new Map(prev);
            next.set(asset.id, {
              photoId: asset.id,
              progress: 0,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Upload failed',
              retryCount: 3, // Max retries reached
            });
            return next;
          });
        }
      }

      // Show success message
      const successCount = Array.from(uploadProgress.values()).filter(
        (p) => p.status === 'completed'
      ).length;
      if (successCount > 0) {
        Alert.alert('Success', `${successCount} photo(s) uploaded successfully!`);
      }

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(new Map());
      }, 3000);
    } catch (error) {
      console.error('[useUpload] Upload failed:', error);
      Alert.alert('Error', 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [settings, uploadProgress]);

  // Calculate aggregated stats for UI
  const uploadStats = useMemo(() => {
    const values = Array.from(uploadProgress.values());
    const currentUploading = values.find(p => p.status === 'uploading');

    return {
      total: values.length,
      completed: values.filter(p => p.status === 'completed').length,
      failed: values.filter(p => p.status === 'failed').length,
      current: currentUploading ? values.indexOf(currentUploading) + 1 : 0,
      currentProgress: currentUploading?.progress || 0,
    };
  }, [uploadProgress]);

  return {
    uploadProgress,
    uploadStats,
    isUploading,
    uploadPhotos,
    cancelUpload,
  };
}
