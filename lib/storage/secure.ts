// Secure storage wrapper for bot tokens using expo-secure-store
import * as SecureStore from 'expo-secure-store';

const BOT_TOKEN_PREFIX = 'bot_token_';

/**
 * Save a bot token to secure storage
 * @param botId - Unique bot identifier
 * @param token - Bot token from @BotFather
 */
export async function saveBotToken(botId: string, token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(`${BOT_TOKEN_PREFIX}${botId}`, token);
  } catch (error) {
    console.error('[SecureStorage] Failed to save bot token:', error);
    throw new Error('Failed to save bot token securely');
  }
}

/**
 * Retrieve a bot token from secure storage
 * @param botId - Unique bot identifier
 * @returns Bot token or null if not found
 */
export async function getBotToken(botId: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(`${BOT_TOKEN_PREFIX}${botId}`);
  } catch (error) {
    console.error('[SecureStorage] Failed to get bot token:', error);
    return null;
  }
}

/**
 * Delete a bot token from secure storage
 * @param botId - Unique bot identifier
 */
export async function deleteBotToken(botId: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(`${BOT_TOKEN_PREFIX}${botId}`);
  } catch (error) {
    console.error('[SecureStorage] Failed to delete bot token:', error);
    throw new Error('Failed to delete bot token');
  }
}
