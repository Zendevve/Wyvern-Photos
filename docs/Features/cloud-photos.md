# Feature: Cloud Photos

**Status:** Placeholder
**Owner:** User
**Related ADRs:** ADR-001 (Telegram Cloud Storage)

---

## Purpose

Display photos backed up to Telegram cloud storage, providing users access to their cloud-stored photo library and storage statistics.

---

## Business Rules

1. **Bot Configuration Required:** Cloud tab requires configured Telegram bot
2. **Remote Photo Sync:** Photos displayed from `remote_photos` database table
3. **Statistics Display:** Show count of cloud photos and total storage used
4. **Download on Demand:** Photos download from Telegram when viewed
5. **Read-Only Initially:** Phase 1 is view-only, delete comes later

---

## Main Flow

### First-Time User (No Bot Configured)

1. User taps Cloud tab
2. System checks `settings.primaryBotId`
3. If null, show "Connect to Telegram" screen
4. User taps "Get Started"
5. **[TODO]** Navigate to onboarding flow
6. User completes bot setup
7. Return to Cloud tab, show photos

### View Cloud Photos

1. User opens Cloud tab (bot configured)
2. System queries `remote_photos` table
3. If no photos:
   - Show "No Cloud Photos Yet" empty state
   - Prompt user to upload from Photos tab
4. If photos exist:
   - Display stats (count, storage)
   - Show photo grid
   - User taps photo to view full-screen
   - **[TODO]** Photo downloads from Telegram via file_id

---

## Components

### Files

- **Screen:** `app/(tabs)/cloud.tsx` — Cloud photos screen
- **Component:** `components/PhotoGrid.tsx` — Reusable grid (shared with device photos)
- **Database:** `lib/database/schema.ts` — remote_photos table
- **API:** `lib/telegram/botApi.ts` — Download photos by file_id

### RemotePhoto Schema

```typescript
interface RemotePhoto {
  remoteId: string; // Telegram file_id
  fileName: string | null;
  mimeType: string;
  fileSize: number | null;
  uploadedAt: number;
  messageId: number | null;
  thumbnailCached: boolean;
  folderId: string | null;
}
```

---

## UI States

### State 1: Not Configured

- Large cloud icon
- "Connect to Telegram" heading
- Description of unlimited storage
- "Get Started" button

### State 2: Configured, No Photos

- Cloud-done icon
- "No Cloud Photos Yet" heading
- Prompt to upload from Photos tab

### State 3: Has Photos

- Stats row (photo count, storage used)
- Photo grid (same component as device photos)
- Tap to view full-screen

---

## Test Flows

### Positive Flow — First Time

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Cloud tab (no bot) | "Connect to Telegram" screen |
| 2 | Tap "Get Started" | **[TODO]** Navigate to onboarding |
| 3 | Complete bot setup | Return to Cloud tab |
| 4 | Cloud tab now shows photos or empty state | Database has primaryBotId |

### Positive Flow — View Photos

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload photo from Device tab | Photo saved to Telegram |
| 2 | Open Cloud tab | Photo appears in grid |
| 3 | Tap cloud photo | **[TODO]** Photo downloads and displays |

### Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Bot configured but invalid | Show error, prompt reconfiguration |
| Telegram API down | Show friendly error message |
| Photo deleted from channel | Remove from grid, mark in database |
| Very large photo library | Paginated loading |

---

## Definition of Done

- [x] Empty state UI for not configured
- [x] Empty state UI for no photos
- [x] Stats display (count, storage)
- [ ] Fetch remote photos from database
- [ ] Display cloud photos in grid
- [ ] Download photo on tap via Telegram API
- [ ] Cache thumbnails for performance
- [ ] Sync remote photos from Telegram channel
- [ ] Delete cloud photo functionality
- [ ] Integration tests for photo sync

---

## Notes

- Cloud tab is read-only in MVP (view and download only)
- Delete functionality comes in Phase 2
- Thumbnail caching improves grid performance
- Remote photo sync should run on app start and manually via refresh
