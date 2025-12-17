// Cloud Photos Screen - Shows photos backed up to Telegram
import React, { useState } from 'react';
import {
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from '@/components/Themed';
import { useDatabase } from '@/hooks/useDatabase';
import Colors from '@/constants/Colors';

export default function CloudPhotosScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { settings } = useDatabase();

  const isConfigured = settings?.primaryBotId != null;
  const hasPhotos = false; // TODO: Check from database

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
  if (!hasPhotos) {
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
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Photos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>0 MB</Text>
          <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Storage</Text>
        </View>
      </View>

      {/* Photo grid will go here */}
      <View style={styles.placeholder}>
        <Text style={{ color: colors.onSurfaceVariant }}>
          Cloud photos will appear here
        </Text>
      </View>
    </ScrollView>
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
  placeholder: {
    padding: 32,
    alignItems: 'center',
  },
});
