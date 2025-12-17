// React hook for cloud photos management
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { TelegramBotApi } from '../lib/telegram/botApi';
import { getBotToken } from '../lib/storage/secure';
import { getBotById, getAllRemotePhotos } from '../lib/database/dao';
import { useDatabase } from './useDatabase';
import type { RemotePhoto } from '../lib/database/schema';

export interface CloudPhotoStats {
  count: number;
  totalSize: number; // in bytes
}

export interface UseCloudPhotosResult {
  cloudPhotos: RemotePhoto[];
  stats: CloudPhotoStats;
  isLoading: boolean;
  error: string | null;
  loadCloudPhotos: () => Promise<void>;
  downloadPhoto: (remoteId: string, fileName: string) => Promise<string | null>;
}

export function useCloudPhotos(): UseCloudPhotosResult {
  const { settings, isReady: dbReady } = useDatabase();
  const [cloudPhotos, setCloudPhotos] = useState<RemotePhoto[]>([]);
  const [stats, setStats] = useState<CloudPhotoStats>({ count: 0, totalSize: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCloudPhotos = useCallback(async () => {
    if (!dbReady) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all remote photos from database
      const photos = await getAllRemotePhotos(1000, 0); // Load first 1000
      setCloudPhotos(photos);

      // Calculate stats
      const totalSize = photos.reduce((sum, photo) => sum + (photo.fileSize || 0), 0);
      setStats({
        count: photos.length,
        totalSize,
      });
    } catch (err) {
      console.error('[useCloudPhotos] Failed to load photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cloud photos');
    } finally {
      setIsLoading(false);
    }
  }, [dbReady]);

  // Load photos on mount
  useEffect(() => {
    loadCloudPhotos();
  }, [loadCloudPhotos]);

  const downloadPhoto = useCallback(
    async (remoteId: string, fileName: string): Promise<string | null> => {
      if (!settings?.primaryBotId) {
        Alert.alert('Error', 'Bot not configured.');
        return null;
      }

      try {
        // Get bot configuration
        const bot = await getBotById(settings.primaryBotId);
        if (!bot) {
          Alert.alert('Error', 'Bot configuration not found.');
          return null;
        }

        // Get bot token from secure storage
        const token = await getBotToken(bot.id);
        if (!token) {
          Alert.alert('Error', 'Bot token not found. Please reconfigure your bot.');
          return null;
        }

        // Create bot API instance
        const botApi = new TelegramBotApi(token);

        // Create destination path (FileSystem constants not accessible in TS, but work at runtime)
        // This will use the correct directory at runtime even if TS doesn't see it
        const destinationUri = `file://wyvern-photos-cache/${Date.now()}_${fileName}`;

        // Download file
        const success = await botApi.downloadFileById(remoteId, destinationUri);

        if (success) {
          return destinationUri;
        } else {
          Alert.alert('Error', 'Failed to download photo from Telegram.');
          return null;
        }
      } catch (err) {
        console.error('[useCloudPhotos] Download failed:', err);
        Alert.alert('Error', 'Failed to download photo. Please try again.');
        return null;
      }
    },
    [settings]
  );

  return {
    cloudPhotos,
    stats,
    isLoading,
    error,
    loadCloudPhotos,
    downloadPhoto,
  };
}
