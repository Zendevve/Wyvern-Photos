// Data Access Object functions for database operations
import { getDatabase } from './index';
import type {
  Photo,
  RemotePhoto,
  Folder,
  Bot,
  Settings,
  UploadQueueItem,
  UploadStatus
} from './schema';

// ============ PHOTOS ============

export async function insertPhoto(photo: Photo): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO photos
     (id, remoteId, fileName, mimeType, fileSize, dateAdded, dateModified,
      isUploaded, uploadedAt, messageId, folderId, ocrText, isEncrypted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      photo.id,
      photo.remoteId,
      photo.fileName,
      photo.mimeType,
      photo.fileSize,
      photo.dateAdded,
      photo.dateModified,
      photo.isUploaded ? 1 : 0,
      photo.uploadedAt,
      photo.messageId,
      photo.folderId,
      photo.ocrText,
      photo.isEncrypted ? 1 : 0
    ]
  );
}

export async function insertPhotos(photos: Photo[]): Promise<void> {
  const db = getDatabase();
  for (const photo of photos) {
    await insertPhoto(photo);
  }
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const db = getDatabase();
  const result = await db.getFirstAsync<Photo>(
    'SELECT * FROM photos WHERE id = ?',
    [id]
  );
  return result ? mapRowToPhoto(result) : null;
}

export async function getAllPhotos(limit = 100, offset = 0): Promise<Photo[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<Photo>(
    'SELECT * FROM photos ORDER BY dateAdded DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return rows.map(mapRowToPhoto);
}

export async function getNotUploadedPhotos(): Promise<Photo[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<Photo>(
    'SELECT * FROM photos WHERE isUploaded = 0 ORDER BY dateAdded DESC'
  );
  return rows.map(mapRowToPhoto);
}

export async function markPhotoAsUploaded(
  id: string,
  remoteId: string,
  messageId: number
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE photos
     SET isUploaded = 1, remoteId = ?, uploadedAt = ?, messageId = ?
     WHERE id = ?`,
    [remoteId, Date.now(), messageId, id]
  );
}

export async function getPhotoCount(): Promise<number> {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM photos'
  );
  return result?.count ?? 0;
}

export async function getUploadedPhotoCount(): Promise<number> {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM photos WHERE isUploaded = 1'
  );
  return result?.count ?? 0;
}

export async function searchPhotosByOCR(query: string): Promise<Photo[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<Photo>(
    `SELECT photos.* FROM photos_fts
     JOIN photos ON photos_fts.id = photos.id
     WHERE photos_fts MATCH ?
     ORDER BY rank`,
    [query]
  );
  return rows.map(mapRowToPhoto);
}

function mapRowToPhoto(row: any): Photo {
  return {
    ...row,
    isUploaded: Boolean(row.isUploaded),
    isEncrypted: Boolean(row.isEncrypted),
  };
}

// ============ REMOTE PHOTOS ============

export async function insertRemotePhoto(photo: RemotePhoto): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO remote_photos
     (remoteId, fileName, mimeType, fileSize, uploadedAt, messageId, thumbnailCached, folderId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      photo.remoteId,
      photo.fileName,
      photo.mimeType,
      photo.fileSize,
      photo.uploadedAt,
      photo.messageId,
      photo.thumbnailCached ? 1 : 0,
      photo.folderId
    ]
  );
}

export async function getAllRemotePhotos(limit = 100, offset = 0): Promise<RemotePhoto[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<RemotePhoto>(
    'SELECT * FROM remote_photos ORDER BY uploadedAt DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return rows.map(row => ({
    ...row,
    thumbnailCached: Boolean(row.thumbnailCached),
  }));
}

// ============ FOLDERS ============

export async function insertFolder(folder: Folder): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO folders
     (id, name, devicePath, isCloud, enabled, photoCount, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      folder.id,
      folder.name,
      folder.devicePath,
      folder.isCloud ? 1 : 0,
      folder.enabled ? 1 : 0,
      folder.photoCount,
      folder.createdAt
    ]
  );
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<Folder>('SELECT * FROM folders ORDER BY name');
  return rows.map(row => ({
    ...row,
    isCloud: Boolean(row.isCloud),
    enabled: Boolean(row.enabled),
  }));
}

export async function getEnabledFolders(): Promise<Folder[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<Folder>(
    'SELECT * FROM folders WHERE enabled = 1 ORDER BY name'
  );
  return rows.map(row => ({
    ...row,
    isCloud: Boolean(row.isCloud),
    enabled: true,
  }));
}

// ============ BOTS ============

export async function insertBot(bot: Bot): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO bots
     (id, name, token, channelId, isActive, createdAt, lastUsed)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      bot.id,
      bot.name,
      bot.token, // This should be a key reference, actual token in secure store
      bot.channelId,
      bot.isActive ? 1 : 0,
      bot.createdAt,
      bot.lastUsed
    ]
  );
}

export async function getAllBots(): Promise<Bot[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<Bot>('SELECT * FROM bots ORDER BY createdAt');
  return rows.map(row => ({
    ...row,
    isActive: Boolean(row.isActive),
  }));
}

export async function getActiveBots(): Promise<Bot[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<Bot>(
    'SELECT * FROM bots WHERE isActive = 1 ORDER BY createdAt'
  );
  return rows.map(row => ({
    ...row,
    isActive: true,
  }));
}

export async function getBotById(id: string): Promise<Bot | null> {
  const db = getDatabase();
  const result = await db.getFirstAsync<Bot>(
    'SELECT * FROM bots WHERE id = ?',
    [id]
  );
  return result ? { ...result, isActive: Boolean(result.isActive) } : null;
}

// ============ SETTINGS ============

export async function getSettings(): Promise<Settings> {
  const db = getDatabase();
  const result = await db.getFirstAsync<Settings>(
    'SELECT * FROM settings WHERE id = 1'
  );

  if (!result) {
    throw new Error('Settings not found');
  }

  return {
    ...result,
    autoBackupEnabled: Boolean(result.autoBackupEnabled),
    wifiOnly: Boolean(result.wifiOnly),
    encryptionEnabled: Boolean(result.encryptionEnabled),
    onboardingCompleted: Boolean(result.onboardingCompleted),
  };
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const db = getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  const boolFields = ['autoBackupEnabled', 'wifiOnly', 'encryptionEnabled', 'onboardingCompleted'];

  for (const [key, value] of Object.entries(settings)) {
    if (key === 'id') continue;
    updates.push(`${key} = ?`);
    values.push(boolFields.includes(key) ? (value ? 1 : 0) : value);
  }

  if (updates.length > 0) {
    await db.runAsync(
      `UPDATE settings SET ${updates.join(', ')} WHERE id = 1`,
      values
    );
  }
}

// ============ UPLOAD QUEUE ============

export async function addToUploadQueue(item: UploadQueueItem): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO upload_queue
     (id, photoId, botId, priority, status, retryCount, errorMessage, createdAt, startedAt, completedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.photoId,
      item.botId,
      item.priority,
      item.status,
      item.retryCount,
      item.errorMessage,
      item.createdAt,
      item.startedAt,
      item.completedAt
    ]
  );
}

export async function getPendingUploads(limit = 10): Promise<UploadQueueItem[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<UploadQueueItem>(
    `SELECT * FROM upload_queue
     WHERE status = 'pending'
     ORDER BY priority DESC, createdAt ASC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function updateUploadStatus(
  id: string,
  status: UploadStatus,
  errorMessage?: string
): Promise<void> {
  const db = getDatabase();
  const now = Date.now();

  if (status === 'uploading') {
    await db.runAsync(
      'UPDATE upload_queue SET status = ?, startedAt = ? WHERE id = ?',
      [status, now, id]
    );
  } else if (status === 'completed' || status === 'failed') {
    await db.runAsync(
      'UPDATE upload_queue SET status = ?, completedAt = ?, errorMessage = ? WHERE id = ?',
      [status, now, errorMessage ?? null, id]
    );
  } else {
    await db.runAsync(
      'UPDATE upload_queue SET status = ? WHERE id = ?',
      [status, id]
    );
  }
}

export async function clearCompletedUploads(): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM upload_queue WHERE status = ?', ['completed']);
}

export async function getUploadQueueCount(): Promise<{ pending: number; total: number }> {
  const db = getDatabase();
  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM upload_queue'
  );
  const pending = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM upload_queue WHERE status = ?',
    ['pending']
  );
  return {
    pending: pending?.count ?? 0,
    total: total?.count ?? 0,
  };
}
