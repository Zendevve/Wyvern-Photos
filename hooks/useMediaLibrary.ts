// Media library hook for accessing device photos
import { useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import type { Photo } from '../lib/database/schema';

export interface MediaAsset {
  id: string;
  uri: string;
  filename: string;
  mediaType: 'photo' | 'video' | 'audio' | 'unknown';
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  duration: number;
  albumId?: string;
}

export interface UseMediaLibraryResult {
  assets: MediaAsset[];
  albums: MediaLibrary.Album[];
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  totalCount: number;
}

const PAGE_SIZE = 50;

export function useMediaLibrary(): UseMediaLibraryResult {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState(0);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err) {
      console.error('[useMediaLibrary] Permission request failed:', err);
      setError('Failed to request permission');
      return false;
    }
  }, []);

  const loadAssets = useCallback(async (cursor?: string) => {
    if (!hasPermission) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await MediaLibrary.getAssetsAsync({
        first: PAGE_SIZE,
        after: cursor,
        mediaType: [MediaLibrary.MediaType.photo],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const mappedAssets: MediaAsset[] = result.assets.map((asset) => ({
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename,
        mediaType: asset.mediaType as MediaAsset['mediaType'],
        width: asset.width,
        height: asset.height,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        duration: asset.duration,
        albumId: asset.albumId,
      }));

      if (cursor) {
        setAssets((prev) => [...prev, ...mappedAssets]);
      } else {
        setAssets(mappedAssets);
      }

      setHasMore(result.hasNextPage);
      setEndCursor(result.endCursor);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error('[useMediaLibrary] Failed to load assets:', err);
      setError('Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission]);

  const loadAlbums = useCallback(async () => {
    if (!hasPermission) return;

    try {
      const result = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });
      setAlbums(result);
    } catch (err) {
      console.error('[useMediaLibrary] Failed to load albums:', err);
    }
  }, [hasPermission]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !endCursor) return;
    await loadAssets(endCursor);
  }, [hasMore, isLoading, endCursor, loadAssets]);

  const refresh = useCallback(async () => {
    setAssets([]);
    setEndCursor(undefined);
    setHasMore(true);
    await loadAssets();
    await loadAlbums();
  }, [loadAssets, loadAlbums]);

  // Check permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.getPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        await loadAssets();
        await loadAlbums();
      } else {
        setIsLoading(false);
      }
    })();
  }, []);

  // Reload when permission changes
  useEffect(() => {
    if (hasPermission && assets.length === 0) {
      loadAssets();
      loadAlbums();
    }
  }, [hasPermission]);

  return {
    assets,
    albums,
    hasPermission,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    requestPermission,
    totalCount,
  };
}

/**
 * Convert MediaAsset to Photo entity for database
 */
export function mediaAssetToPhoto(asset: MediaAsset): Photo {
  return {
    id: asset.id,
    remoteId: null,
    fileName: asset.filename,
    mimeType: getMimeType(asset.filename),
    fileSize: 0, // Will be populated when needed
    dateAdded: asset.creationTime,
    dateModified: asset.modificationTime,
    isUploaded: false,
    uploadedAt: null,
    messageId: null,
    folderId: asset.albumId || null,
    ocrText: null,
    isEncrypted: false,
  };
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    bmp: 'image/bmp',
  };
  return mimeTypes[ext || ''] || 'image/jpeg';
}
