// Settings Screen - App configuration and preferences
import React, { useState } from 'react';
import {
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from '@/components/Themed';
import { useDatabase } from '@/hooks/useDatabase';
import Colors from '@/constants/Colors';
import { TelegramBotApi } from '@/lib/telegram/botApi';
import { saveBotToken } from '@/lib/storage/secure';
import { insertBot } from '@/lib/database/dao';

interface SettingRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  value?: React.ReactNode;
  onPress?: () => void;
  colors: typeof Colors.dark;
}

function SettingRow({ icon, title, subtitle, value, onPress, colors }: SettingRowProps) {
  return (
    <Pressable
      style={[styles.settingRow, { borderBottomColor: colors.outlineVariant }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {value}
      {onPress && !value && (
        <Ionicons name="chevron-forward" size={20} color={colors.outline} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { settings, updateSettings, refreshSettings } = useDatabase();

  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAutoBackupToggle = async (value: boolean) => {
    try {
      await updateSettings({ autoBackupEnabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleWifiOnlyToggle = async (value: boolean) => {
    try {
      await updateSettings({ wifiOnly: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleEncryptionToggle = async (value: boolean) => {
    try {
      await updateSettings({ encryptionEnabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Telegram Section */}
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        TELEGRAM
      </Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="send-outline"
          title="Bot Configuration"
          subtitle={settings?.primaryBotId ? 'Connected' : 'Not configured'}
          onPress={() => setShowTokenInput(!showTokenInput)}
          colors={colors}
        />

        {showTokenInput && (
          <View style={styles.inputSection}>
            <TextInput
              style={[styles.input, {
                color: colors.onSurface,
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.outline,
              }]}
              placeholder="Bot Token"
              placeholderTextColor={colors.outline}
              value={botToken}
              onChangeText={setBotToken}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={[styles.input, {
                color: colors.onSurface,
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.outline,
              }]}
              placeholder="Channel ID (e.g., -100123456789)"
              placeholderTextColor={colors.outline}
              value={channelId}
              onChangeText={setChannelId}
              keyboardType="numbers-and-punctuation"
            />
            <Pressable
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={async () => {
                if (!botToken.trim() || !channelId.trim()) {
                  Alert.alert('Error', 'Please enter both bot token and channel ID.');
                  return;
                }

                setIsSaving(true);

                try {
                  // Step 1: Validate bot token
                  const botApi = new TelegramBotApi(botToken.trim());
                  const meResponse = await botApi.getMe();

                  if (!meResponse.ok) {
                    Alert.alert('Invalid Token', 'The bot token is invalid. Please check and try again.');
                    setIsSaving(false);
                    return;
                  }

                  // Step 2: Verify channel access
                  const chatResponse = await botApi.getChat(channelId.trim());

                  if (!chatResponse.ok) {
                    Alert.alert(
                      'Channel Access Error',
                      'Cannot access the channel. Make sure:\n' +
                      '1. The bot is added to the channel\n' +
                      '2. The bot has admin permissions\n' +
                      '3. The channel ID is correct'
                    );
                    setIsSaving(false);
                    return;
                  }

                  // Step 3: Generate unique bot ID
                  const botId = Crypto.randomUUID();

                  // Step 4: Save token to secure store
                  await saveBotToken(botId, botToken.trim());

                  // Step 5: Save bot to database (token field = botId reference)
                  await insertBot({
                    id: botId,
                    name: meResponse.result?.first_name || 'My Bot',
                    token: botId, // Store reference, not actual token
                    channelId: channelId.trim(),
                    isActive: true,
                    createdAt: Date.now(),
                    lastUsed: null,
                  });

                  // Step 6: Update settings with primary bot
                  await updateSettings({ primaryBotId: botId });
                  await refreshSettings();

                  // Success!
                  Alert.alert('Success', 'Bot configured successfully!');
                  setBotToken('');
                  setChannelId('');
                  setShowTokenInput(false);
                } catch (error) {
                  console.error('[Settings] Bot config failed:', error);
                  Alert.alert('Error', 'Failed to save bot configuration. Please try again.');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>
                  Save Configuration
                </Text>
              )}
            </Pressable>
          </View>
        )}

        <SettingRow
          icon="help-circle-outline"
          title="Setup Guide"
          subtitle="How to create a Telegram bot"
          onPress={() => {
            // TODO: Navigate to setup guide
            console.log('Open setup guide');
          }}
          colors={colors}
        />
      </View>

      {/* Backup Section */}
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        BACKUP
      </Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="sync-outline"
          title="Auto Backup"
          subtitle="Automatically back up new photos"
          value={
            <Switch
              value={settings?.autoBackupEnabled ?? false}
              onValueChange={handleAutoBackupToggle}
              trackColor={{ true: colors.primary }}
            />
          }
          colors={colors}
        />
        <SettingRow
          icon="wifi-outline"
          title="WiFi Only"
          subtitle="Only upload when connected to WiFi"
          value={
            <Switch
              value={settings?.wifiOnly ?? true}
              onValueChange={handleWifiOnlyToggle}
              trackColor={{ true: colors.primary }}
            />
          }
          colors={colors}
        />
        <SettingRow
          icon="time-outline"
          title="Backup Schedule"
          subtitle="Configure backup time window"
          onPress={() => {
            // TODO: Open schedule picker
            console.log('Open schedule picker');
          }}
          colors={colors}
        />
        <SettingRow
          icon="folder-outline"
          title="Folders"
          subtitle="Choose which folders to back up"
          onPress={() => {
            // TODO: Open folder picker
            console.log('Open folder picker');
          }}
          colors={colors}
        />
      </View>

      {/* Security Section */}
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        SECURITY
      </Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="lock-closed-outline"
          title="Encryption"
          subtitle="Encrypt photos before uploading"
          value={
            <Switch
              value={settings?.encryptionEnabled ?? false}
              onValueChange={handleEncryptionToggle}
              trackColor={{ true: colors.primary }}
            />
          }
          colors={colors}
        />
      </View>

      {/* Data Section */}
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        DATA
      </Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="download-outline"
          title="Export Database"
          subtitle="Backup your photo metadata"
          onPress={() => {
            // TODO: Export database
            console.log('Export database');
          }}
          colors={colors}
        />
        <SettingRow
          icon="push-outline"
          title="Import Database"
          subtitle="Restore from a backup"
          onPress={() => {
            // TODO: Import database
            console.log('Import database');
          }}
          colors={colors}
        />
      </View>

      {/* About Section */}
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        ABOUT
      </Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingRow
          icon="information-circle-outline"
          title="Version"
          subtitle="1.0.0"
          colors={colors}
        />
        <SettingRow
          icon="code-slash-outline"
          title="Source Code"
          subtitle="View on GitHub"
          onPress={() => {
            // TODO: Open GitHub
            console.log('Open GitHub');
          }}
          colors={colors}
        />
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  inputSection: {
    padding: 16,
    gap: 12,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  saveButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
