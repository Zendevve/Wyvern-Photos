// Web-only database mock (expo-sqlite doesn't work on web)
import type { Settings } from './schema';

let mockSettings: Settings = {
  id: 1,
  primaryBotId: null,
  autoBackupEnabled: false,
  wifiOnly: true,
  lastBackupTime: null,
  dailyLimit: 0,
  backupTimeStart: null,
  backupTimeEnd: null,
  encryptionEnabled: false,
  encryptionKeyId: null,
  onboardingCompleted: false,
};

export async function initDatabase(): Promise<any> {
  console.log('[Database] Web mock initialized');
  return {};
}

export function getDatabase(): any {
  return {};
}

export async function closeDatabase(): Promise<void> {
  console.log('[Database] Web mock closed');
}

// Re-export types
export * from './schema';

// Mock DAO functions for web
export async function getSettings(): Promise<Settings> {
  return mockSettings;
}

export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  mockSettings = { ...mockSettings, ...updates };
}
