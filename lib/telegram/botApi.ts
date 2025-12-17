// Telegram Bot API client
import * as FileSystem from 'expo-file-system';
import type {
  TelegramResponse,
  TelegramMessage,
  TelegramFile,
  TelegramChat,
  TelegramUpdate,
  DiscoveredMedia,
} from './types';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';
const TELEGRAM_FILE_BASE = 'https://api.telegram.org/file/bot';

export class TelegramBotApi {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private get baseUrl(): string {
    return `${TELEGRAM_API_BASE}${this.token}`;
  }

  private get fileBaseUrl(): string {
    return `${TELEGRAM_FILE_BASE}${this.token}`;
  }

  /**
   * Make an API request to Telegram
   */
  private async request<T>(
    method: string,
    params?: Record<string, any>
  ): Promise<TelegramResponse<T>> {
    const url = `${this.baseUrl}/${method}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: params ? JSON.stringify(params) : undefined,
      });

      const data = await response.json();
      return data as TelegramResponse<T>;
    } catch (error) {
      console.error(`[TelegramBotApi] ${method} failed:`, error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify bot token is valid
   */
  async getMe(): Promise<TelegramResponse<{ id: number; first_name: string; username?: string }>> {
    return this.request('getMe');
  }

  /**
   * Get chat info to verify channel/group access
   */
  async getChat(chatId: string | number): Promise<TelegramResponse<TelegramChat>> {
    return this.request('getChat', { chat_id: chatId });
  }

  /**
   * Send a text message
   */
  async sendMessage(
    chatId: string | number,
    text: string
  ): Promise<TelegramResponse<TelegramMessage>> {
    return this.request('sendMessage', { chat_id: chatId, text });
  }

  /**
   * Upload a file as document (preserves quality)
   */
  async sendDocument(
    chatId: string | number,
    fileUri: string,
    caption?: string,
    onProgress?: (progress: number) => void
  ): Promise<TelegramResponse<TelegramMessage>> {
    const url = `${this.baseUrl}/sendDocument`;

    try {
      // Read file info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        return { ok: false, description: 'File does not exist' };
      }

      // Get file name from URI
      const fileName = fileUri.split('/').pop() || 'file';

      // Create form data
      const formData = new FormData();
      formData.append('chat_id', String(chatId));

      // Append file - React Native's fetch handles file:// URIs
      formData.append('document', {
        uri: fileUri,
        name: fileName,
        type: 'application/octet-stream',
      } as any);

      if (caption) {
        formData.append('caption', caption);
      }

      // Upload with XMLHttpRequest for progress tracking
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            resolve({ ok: false, description: 'Invalid response' });
          }
        };

        xhr.onerror = () => {
          resolve({ ok: false, description: 'Network error' });
        };

        xhr.open('POST', url);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('[TelegramBotApi] sendDocument failed:', error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Get file info by file_id
   */
  async getFile(fileId: string): Promise<TelegramResponse<TelegramFile>> {
    return this.request('getFile', { file_id: fileId });
  }

  /**
   * Download file by file_path
   */
  async downloadFile(filePath: string, destinationUri: string): Promise<boolean> {
    const url = `${this.fileBaseUrl}/${filePath}`;

    try {
      const download = await FileSystem.downloadAsync(url, destinationUri);
      return download.status === 200;
    } catch (error) {
      console.error('[TelegramBotApi] downloadFile failed:', error);
      return false;
    }
  }

  /**
   * Download file by file_id to a destination
   */
  async downloadFileById(fileId: string, destinationUri: string): Promise<boolean> {
    const fileResponse = await this.getFile(fileId);

    if (!fileResponse.ok || !fileResponse.result?.file_path) {
      console.error('[TelegramBotApi] getFile failed:', fileResponse.description);
      return false;
    }

    return this.downloadFile(fileResponse.result.file_path, destinationUri);
  }

  /**
   * Delete a message (to remove photo from channel)
   */
  async deleteMessage(
    chatId: string | number,
    messageId: number
  ): Promise<TelegramResponse<boolean>> {
    return this.request('deleteMessage', { chat_id: chatId, message_id: messageId });
  }

  /**
   * Get updates (for scanning channel for existing media)
   */
  async getUpdates(
    offset?: number,
    limit = 100,
    timeout = 0
  ): Promise<TelegramResponse<TelegramUpdate[]>> {
    return this.request('getUpdates', { offset, limit, timeout });
  }

  /**
   * Scan a channel for media files
   * Note: Bot API can only see messages sent after bot was added
   * For full history, would need Telegram Client API (not implemented)
   */
  async scanChannelMedia(
    chatId: string | number,
    limit = 100
  ): Promise<DiscoveredMedia[]> {
    const media: DiscoveredMedia[] = [];

    // This only works with getUpdates, which has limitations
    // For a full solution, we'd store message_ids during uploads and query them
    console.warn(
      '[TelegramBotApi] scanChannelMedia: Bot API cannot retrieve historical messages. ' +
      'Only photos uploaded through this app will be tracked.'
    );

    return media;
  }
}

// Singleton instance management
let botInstance: TelegramBotApi | null = null;

export function createBotApi(token: string): TelegramBotApi {
  botInstance = new TelegramBotApi(token);
  return botInstance;
}

export function getBotApi(): TelegramBotApi | null {
  return botInstance;
}

export function clearBotApi(): void {
  botInstance = null;
}
