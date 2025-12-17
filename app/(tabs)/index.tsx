// Device Photos Screen - Main tab showing local device photos
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from '@/components/Themed';
import { PhotoGrid } from '@/components/PhotoGrid';
import { UploadToast } from '@/components/UploadToast';
import { FolderDropdown } from '@/components/FolderDropdown';
import { useMediaLibrary, type MediaAsset } from '@/hooks/useMediaLibrary';
import { useDatabase } from '@/hooks/useDatabase';
import { useUpload } from '@/hooks/useUpload';
import Colors from '@/constants/Colors';

export default function DevicePhotosScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const {
    assets,
    albums,
    hasPermission,
    isLoading,
    error,
    hasMore,
    loadMore,
    requestPermission,
    totalCount,
  } = useMediaLibrary();

  const { isReady: dbReady } = useDatabase();
  const { uploadPhotos, isUploading, uploadStats } = useUpload();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Toast state for upload progress
  const [toastState, setToastState] = useState<'uploading' | 'success' | 'error' | null>(null);

  // Update toast state based on upload status
  useEffect(() => {
    if (isUploading) {
      setToastState('uploading');
    } else if (uploadStats.total > 0 && !isUploading) {
      // Upload finished
      if (uploadStats.failed === 0) {
        setToastState('success');
        // Auto-dismiss success toast after 3 seconds
        setTimeout(() => setToastState(null), 3000);
      } else {
        setToastState('error');
      }
    }
  }, [isUploading, uploadStats]);

  // Folder filtering
  const [selectedFolder, setSelectedFolder] = useState<string>('All Folders');

  // Calculate folder statistics from albums
  const folderStats = useMemo(() => {
    const stats = new Map<string, number>();

    assets.forEach((asset) => {
      const album = albums.find((a) => a.id === asset.albumId);
      const folderName = album?.title || 'Uncategorized';
      stats.set(folderName, (stats.get(folderName) || 0) + 1);
    });

    return Array.from(stats.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [assets, albums]);

  // Filter assets by selected folder
  const filteredAssets = useMemo(() => {
    if (selectedFolder === 'All Folders') return assets;

    return assets.filter((asset) => {
      const album = albums.find((a) => a.id === asset.albumId);
      const folderName = album?.title || 'Uncategorized';
      return folderName === selectedFolder;
    });
  }, [assets, albums, selectedFolder]);

  // Mock uploaded IDs - in real app, this comes from database
  const uploadedIds = useMemo(() => new Set<string>(), []);

  const handlePhotoPress = useCallback((asset: MediaAsset, index: number) => {
    if (isSelectionMode) {
      // Toggle selection
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(asset.id)) {
          next.delete(asset.id);
        } else {
          next.add(asset.id);
        }
        // Exit selection mode if no items selected
        if (next.size === 0) {
          setIsSelectionMode(false);
        }
        return next;
      });
    } else {
      // Open photo viewer
      router.push({
        pathname: '/viewer',
        params: {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          id: asset.id
        },
      });
    }
  }, [isSelectionMode]);

  const handlePhotoLongPress = useCallback((asset: MediaAsset) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds(new Set([asset.id]));
    }
  }, [isSelectionMode]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === assets.length) {
      // Deselect all
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } else {
      // Select all
      setSelectedIds(new Set(assets.map((a) => a.id)));
    }
  }, [assets, selectedIds.size]);

  const handleCancelSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  }, []);

  // Permission request screen
  if (!hasPermission && !isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="images-outline" size={64} color={colors.primary} />
        <Text style={styles.title}>Access Your Photos</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Wyvern Photos needs access to your photo library to back up your memories.
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            Grant Access
          </Text>
        </Pressable>
      </View>
    );
  }

  // Loading screen
  if (isLoading && assets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.subtitle, { marginTop: 16 }]}>Loading photos...</Text>
      </View>
    );
  }

  // Error screen
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Selection header */}
      {isSelectionMode && (
        <View style={[styles.selectionHeader, { backgroundColor: colors.surfaceVariant }]}>
          <Pressable onPress={handleCancelSelection} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.selectionCount}>
            {selectedIds.size} selected
          </Text>
          <Pressable onPress={handleSelectAll} style={styles.headerButton}>
            <Ionicons
              name={selectedIds.size === assets.length ? 'checkbox' : 'checkbox-outline'}
              size={24}
              color={colors.primary}
            />
          </Pressable>
        </View>
      )}

      {/* Stats header */}
      {!isSelectionMode && (
        <View style={styles.statsHeader}>
          <Text style={[styles.statsText, { color: colors.onSurfaceVariant }]}>
            {totalCount.toLocaleString()} photos on device
          </Text>
        </View>
      )}

      {/* Folder dropdown */}
      {!isSelectionMode && hasPermission && (
        <FolderDropdown
          currentFolder={selectedFolder}
          photoCount={filteredAssets.length}
          folders={folderStats}
          onSelectFolder={setSelectedFolder}
        />
      )}

      {/* Photo grid */}
      <PhotoGrid
        assets={filteredAssets}
        selectedIds={selectedIds}
        uploadedIds={uploadedIds}
        onPhotoPress={handlePhotoPress}
        onPhotoLongPress={handlePhotoLongPress}
        onEndReached={hasMore ? loadMore : undefined}
        isLoading={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={48} color={colors.outline} />
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
              No photos found
            </Text>
          </View>
        }
      />

      {/* FAB for upload */}
      {isSelectionMode && selectedIds.size > 0 && (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={async () => {
            // Get selected assets
            const selectedAssets = assets.filter((asset) => selectedIds.has(asset.id));

            // Upload photos
            await uploadPhotos(selectedAssets);

            // Clear selection after upload
            setSelectedIds(new Set());
            setIsSelectionMode(false);
          }}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={24} color={colors.onPrimary} />
              <Text style={[styles.fabText, { color: colors.onPrimary }]}>
                Upload {selectedIds.size}
              </Text>
            </>
          )}
        </Pressable>
      )}

      {/* Upload progress toast */}
      <UploadToast
        visible={toastState !== null}
        state={toastState || 'uploading'}
        current={uploadStats.current}
        total={uploadStats.total}
        progress={uploadStats.currentProgress}
        failed={uploadStats.failed}
        onCancel={() => {
          // TODO: Implement cancel logic
          setToastState(null);
        }}
        onRetry={() => {
          // TODO: Implement retry logic
          setToastState(null);
        }}
        onDismiss={() => setToastState(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerButton: {
    padding: 8,
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
