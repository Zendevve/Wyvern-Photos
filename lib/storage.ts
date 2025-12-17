// Secure storage for sensitive credentials
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  BOT_TOKEN_PREFIX: 'bot_token_',
  ENCRYPTION_KEY: 'encryption_master_key',
} as const;

/**
 * Store a bot token securely
 */
export async function storeBotToken(botId: string, token: string): Promise<void> {
  await SecureStore.setItemAsync(`${KEYS.BOT_TOKEN_PREFIX}${botId}`, token);
}

/**
 * Retrieve a bot token
 */
export async function getBotToken(botId: string): Promise<string | null> {
  return SecureStore.getItemAsync(`${KEYS.BOT_TOKEN_PREFIX}${botId}`);
}

/**
 * Delete a bot token
 */
export async function deleteBotToken(botId: string): Promise<void> {
  await SecureStore.deleteItemAsync(`${KEYS.BOT_TOKEN_PREFIX}${botId}`);
}

/**
 * Store encryption master key
 */
export async function storeEncryptionKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.ENCRYPTION_KEY, key);
}

/**
 * Retrieve encryption master key
 */
export async function getEncryptionKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.ENCRYPTION_KEY);
}

/**
 * Delete encryption master key
 */
export async function deleteEncryptionKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.ENCRYPTION_KEY);
}

/**
 * Check if secure storage is available on this device
 */
export async function isSecureStorageAvailable(): Promise<boolean> {
  return SecureStore.isAvailableAsync();
}
