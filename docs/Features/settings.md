# Feature: Settings

**Status:** In Development
**Owner:** User
**Related ADRs:** ADR-001 (Telegram Cloud Storage)

---

## Purpose

Provide users with configuration options for Telegram bot integration, backup preferences, security settings, and data management.

---

## Business Rules

1. **Bot Configuration Required:** Users must configure a Telegram bot before uploading photos
2. **Secure Storage:** Bot tokens stored in expo-secure-store, never in plain text
3. **WiFi-Only Default:** Backup defaults to WiFi-only to save mobile data
4. **Encryption Optional:** Users can enable end-to-end encryption for uploads
5. **Single Settings Instance:** Settings are singleton (database constraint)

---

## Main Flow

### Configure Telegram Bot

1. User navigates to Settings tab
2. User taps "Bot Configuration"
3. Input section expands
4. User enters:
   - Bot Token (from @BotFather)
   - Channel ID (private channel)
5. User taps "Save Configuration"
6. **[TODO]** System validates bot token
7. **[TODO]** System saves to secure store and database
8. Status updates to "Connected"

### Enable Auto Backup

1. User toggles "Auto Backup" switch
2. System updates `settings.autoBackupEnabled` in database
3. **[TODO]** Background task scheduler activates
4. **[TODO]** Photos upload automatically based on schedule

### Configure Backup Preferences

1. User taps "Backup Schedule"
2. **[TODO]** Time picker modal appears
3. User selects start and end times
4. System saves `backupTimeStart` and `backupTimeEnd`
5. Auto-backup only runs within this window

---

## Components

### Files

- **Screen:** `app/(tabs)/settings.tsx` — Settings screen
- **Hook:** `hooks/useDatabase.ts` — Settings CRUD operations
- **Database:** `lib/database/schema.ts` — Settings table
- **Storage:** `expo-secure-store` — Bot token encryption

### Settings Schema

```typescript
interface Settings {
  id: number; // Always 1 (singleton)
  primaryBotId: string | null;
  autoBackupEnabled: boolean;
  wifiOnly: boolean;
  lastBackupTime: number | null;
  dailyLimit: number; // 0 = unlimited
  backupTimeStart: string | null; // "HH:mm"
  backupTimeEnd: string | null;
  encryptionEnabled: boolean;
  encryptionKeyId: string | null;
  onboardingCompleted: boolean;
}
```

---

## Settings Sections

### Telegram

- **Bot Configuration:** Input bot token and channel ID
- **Setup Guide:** Navigate to onboarding/help

### Backup

- **Auto Backup:** Toggle automatic photo uploads
- **WiFi Only:** Restrict uploads to WiFi connection
- **Backup Schedule:** Set time window for auto-backup
- **Folders:** Choose which folders to back up

### Security

- **Encryption:** Toggle E2E encryption for uploads

### Data

- **Export Database:** Backup photo metadata to file
- **Import Database:** Restore from backup

### About

- **Version:** Display app version (1.0.0)
- **Source Code:** Link to GitHub repository

---

## Test Flows

### Positive Flow — Bot Configuration

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap "Bot Configuration" | Input section expands |
| 2 | Enter valid bot token | Token accepts input |
| 3 | Enter valid channel ID | Channel ID accepts input |
| 4 | Tap "Save Configuration" | **[TODO]** Bot validates, status shows "Connected" |

### Positive Flow — Enable Settings

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle "Auto Backup" on | Database updates, toggle shows on state |
| 2 | Toggle "WiFi Only" on | Database updates, toggle shows on state |
| 3 | Toggle "Encryption" on | Database updates, toggle shows on state |

### Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Invalid bot token | Show error, don't save |
| Invalid channel ID format | Show error, don't save |
| Bot without channel access | Show permission error |
| Database export fails | Show error alert |

---

## Definition of Done

- [x] Settings UI with all sections
- [x] Toggle settings (auto-backup, WiFi, encryption)
- [x] Settings persistence in database
- [x] Settings loaded on app start
- [ ] Bot token validation via Telegram API
- [ ] Secure storage of bot token
- [ ] Backup schedule picker
- [ ] Folder selection modal
- [ ] Database export/import functionality
- [ ] Integration tests for settings CRUD

---

## Notes

- Settings are loaded once on app start via `useDatabase` hook
- All boolean settings stored as INTEGER (0/1) in SQLite
- Foreign key constraint ensures `primaryBotId` references valid bot
- Setup guide should link to onboarding flow when implemented
