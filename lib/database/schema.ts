// Database schema types for Wyvern Photos
// Based on CloudGallery entities but extended for premium features

export interface Photo {
  id: string; // Device content URI or unique ID
  remoteId: string | null; // Telegram file_id after upload
  fileName: string;
  mimeType: string;
  fileSize: number;
  dateAdded: number; // Unix timestamp ms
  dateModified: number;
  isUploaded: boolean;
  uploadedAt: number | null;
  messageId: number | null; // Telegram message ID for deletion
  folderId: string | null; // For folder organization
  ocrText: string | null; // Extracted text for search
  isEncrypted: boolean;
}

export interface RemotePhoto {
  remoteId: string; // Telegram file_id (primary key)
  fileName: string | null;
  mimeType: string;
  fileSize: number | null;
  uploadedAt: number;
  messageId: number | null;
  thumbnailCached: boolean;
  folderId: string | null;
}

export interface Folder {
  id: string;
  name: string;
  devicePath: string | null; // For device folders
  isCloud: boolean; // True for cloud-only folders
  enabled: boolean; // Whether to include in backups
  photoCount: number;
  createdAt: number;
}

export interface Bot {
  id: string;
  name: string;
  token: string; // Encrypted in secure store, this is just the key reference
  channelId: string;
  isActive: boolean;
  createdAt: number;
  lastUsed: number | null;
}

export interface Settings {
  id: number; // Always 1, singleton
  primaryBotId: string | null;
  autoBackupEnabled: boolean;
  wifiOnly: boolean;
  lastBackupTime: number | null;
  dailyLimit: number; // 0 = unlimited
  backupTimeStart: string | null; // "HH:mm" format
  backupTimeEnd: string | null;
  encryptionEnabled: boolean;
  encryptionKeyId: string | null;
  onboardingCompleted: boolean;
}

export interface UploadQueueItem {
  id: string;
  photoId: string;
  botId: string;
  priority: number; // Higher = more urgent
  status: UploadStatus;
  retryCount: number;
  errorMessage: string | null;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
}

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';

// SQL table creation statements
export const CREATE_TABLES_SQL = `
-- Photos table (device photos with upload tracking)
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY NOT NULL,
  remoteId TEXT,
  fileName TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  fileSize INTEGER NOT NULL,
  dateAdded INTEGER NOT NULL,
  dateModified INTEGER NOT NULL,
  isUploaded INTEGER NOT NULL DEFAULT 0,
  uploadedAt INTEGER,
  messageId INTEGER,
  folderId TEXT,
  ocrText TEXT,
  isEncrypted INTEGER NOT NULL DEFAULT 0
);

-- Remote photos table (photos from Telegram channel)
CREATE TABLE IF NOT EXISTS remote_photos (
  remoteId TEXT PRIMARY KEY NOT NULL,
  fileName TEXT,
  mimeType TEXT NOT NULL,
  fileSize INTEGER,
  uploadedAt INTEGER NOT NULL,
  messageId INTEGER,
  thumbnailCached INTEGER NOT NULL DEFAULT 0,
  folderId TEXT
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  devicePath TEXT,
  isCloud INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  photoCount INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL
);

-- Bots table (for multiple bot support)
CREATE TABLE IF NOT EXISTS bots (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  token TEXT NOT NULL,
  channelId TEXT NOT NULL,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt INTEGER NOT NULL,
  lastUsed INTEGER
);

-- Settings table (singleton)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  primaryBotId TEXT,
  autoBackupEnabled INTEGER NOT NULL DEFAULT 0,
  wifiOnly INTEGER NOT NULL DEFAULT 1,
  lastBackupTime INTEGER,
  dailyLimit INTEGER NOT NULL DEFAULT 0,
  backupTimeStart TEXT,
  backupTimeEnd TEXT,
  encryptionEnabled INTEGER NOT NULL DEFAULT 0,
  encryptionKeyId TEXT,
  onboardingCompleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (primaryBotId) REFERENCES bots(id)
);

-- Upload queue table
CREATE TABLE IF NOT EXISTS upload_queue (
  id TEXT PRIMARY KEY NOT NULL,
  photoId TEXT NOT NULL,
  botId TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  retryCount INTEGER NOT NULL DEFAULT 0,
  errorMessage TEXT,
  createdAt INTEGER NOT NULL,
  startedAt INTEGER,
  completedAt INTEGER,
  FOREIGN KEY (photoId) REFERENCES photos(id),
  FOREIGN KEY (botId) REFERENCES bots(id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_photos_uploaded ON photos(isUploaded);
CREATE INDEX IF NOT EXISTS idx_photos_date ON photos(dateAdded DESC);
CREATE INDEX IF NOT EXISTS idx_photos_folder ON photos(folderId);
CREATE INDEX IF NOT EXISTS idx_remote_photos_date ON remote_photos(uploadedAt DESC);
CREATE INDEX IF NOT EXISTS idx_upload_queue_status ON upload_queue(status);
CREATE INDEX IF NOT EXISTS idx_upload_queue_priority ON upload_queue(priority DESC, createdAt ASC);

-- Full-text search for OCR
CREATE VIRTUAL TABLE IF NOT EXISTS photos_fts USING fts5(
  id,
  ocrText,
  content='photos',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS photos_fts_insert AFTER INSERT ON photos BEGIN
  INSERT INTO photos_fts(id, ocrText) VALUES (new.id, new.ocrText);
END;

CREATE TRIGGER IF NOT EXISTS photos_fts_update AFTER UPDATE ON photos BEGIN
  DELETE FROM photos_fts WHERE id = old.id;
  INSERT INTO photos_fts(id, ocrText) VALUES (new.id, new.ocrText);
END;

CREATE TRIGGER IF NOT EXISTS photos_fts_delete AFTER DELETE ON photos BEGIN
  DELETE FROM photos_fts WHERE id = old.id;
END;

-- Initialize settings with default values
INSERT OR IGNORE INTO settings (id) VALUES (1);
`;
