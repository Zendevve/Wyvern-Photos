// Cloud Photos Screen - Shows photos backed up to Telegram
import React, { useState } from 'react';
import {
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from '@/components/Themed';
import { PhotoGrid } from '@/components/PhotoGrid';
import { useDatabase } from '@/hooks/useDatabase';
import { useCloudPhotos } from '@/hooks/useCloudPhotos';
import Colors from '@/constants/Colors';
import type { MediaAsset } from '@/hooks/useMediaLibrary';

export default function CloudPhotosScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { settings } = useDatabase();
  const { cloudPhotos, stats, isLoading, downloadPhoto } = useCloudPhotos();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const isConfigured = settings?.primaryBotId != null;

  // Not configured - show setup prompt
  if (!isConfigured) {
    return (
      <View style={styles.centerContainer}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="cloud-outline" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Connect to Telegram</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Set up your Telegram bot to start backing up photos to unlimited cloud storage.
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => {
            // TODO: Navigate to onboarding/setup
            console.log('Navigate to Telegram setup');
          }}
        >
          <Ionicons name="rocket-outline" size={20} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            Get Started
          </Text>
        </Pressable>
      </View>
    );
  }

  // Configured but no photos
  if (!isLoading && cloudPhotos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-done-outline" size={64} color={colors.outline} />
        <Text style={styles.title}>No Cloud Photos Yet</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Go to the Photos tab and upload some photos to see them here.
        </Text>
      </View>
    );
  }

  // Has photos - show grid
  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {stats.count}
          </Text>
          <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
            Photos
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {(stats.totalSize / (1024 * 1024)).toFixed(1)} MB
          </Text>
          <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
            Storage
          </Text>
        </View>
      </View>

      {/* Loading state */}
      {isLoading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.subtitle, { marginTop: 16 }]}>Loading photos...</Text>
        </View>
      )}

      {/* Photo grid */}
      {!isLoading && cloudPhotos.length > 0 && (
        <PhotoGrid
          assets={cloudPhotos.map((photo) => ({
            id: photo.remoteId,
            uri: '', // Cloud photos don't have local URIs
            filename: photo.fileName || 'Unknown',
            mediaType: 'photo' as const,
            width: 800,
            height: 600,
            createdTime: photo.uploadedAt,
            modificationTime: photo.uploadedAt,
            creationTime: photo.uploadedAt, // Added for MediaAsset compatibility
            duration: 0, // Added for MediaAsset compatibility
          }))}
          selectedIds={new Set()}
          uploadedIds={new Set()} // All cloud photos are already uploaded
          onPhotoPress={async (asset) => {
            // Download and view photo
            setDownloadingId(asset.id);
            const localUri = await downloadPhoto(asset.id, asset.filename);
            setDownloadingId(null);

            if (localUri) {
              router.push({
                pathname: '/viewer',
                params: {
                  uri: localUri,
                  width: 800,
                  height: 600,
                  id: asset.id,
                },
              });
            }
          }}
          onPhotoLongPress={() => { }} // No selection mode for cloud photos yet
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="cloud-done-outline" size={64} color={colors.outline} />
              <Text style={styles.title}>No Cloud Photos Yet</Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Go to the Photos tab and upload some photos to see them here.
              </Text>
            </View>
          }
        />
      )}

      {/* Downloading overlay */}
      {downloadingId && (
        <View style={styles.downloadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.subtitle, { color: colors.onSurface, marginTop: 16 }]}>
            Downloading...
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 64,
  },
  downloadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
