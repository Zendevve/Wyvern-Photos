# Feature: Folder Organization

**Status:** Planning
**Owner:** User
**Related Features:** device-photos.md, cloud-photos.md

---

## Purpose

Organize photos by folders/albums to help users find and manage their photos more easily. Group photos from the same folder together in the UI, allow filtering by folder, and show folder names for better context.

---

## Business Rules

1. **Auto-detect Folders:** Extract folder/album name from device photo metadata
2. **Show Folder Name:** Display folder name in photo grid (e.g., "Camera", "Screenshots")
3. **Filter by Folder:** Allow users to view photos from specific folder only
4. **All Photos Default:** Default view shows all photos across all folders
5. **Preserve Folder on Upload:** Store folder info when uploading to Telegram
6. **Cloud Photos:** Group cloud photos by original folder name

---

## Main Flow

### Flow 1: View Photos by Folder

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Device Photos screen | All photos shown |
| 2 | Tap "All Folders" dropdown | Folder list appears |
| 3 | See folders | "Camera (45)", "Screenshots (12)", "All Folders (57)" |
| 4 | Tap "Screenshots" | Only screenshots shown |
| 5 | Grid updates | Shows 12 photos from Screenshots |

### Flow 2: Upload with Folder Info

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select 3 photos from "Camera" | Selection made |
| 2 | Tap Upload | Upload starts |
| 3 | Photos uploaded | Folder name "Camera" saved to database |
| 4 | View Cloud Photos | Can filter by "Camera" folder |

---

## UI Components

### Folder Dropdown (Device Photos)

**Position:** Top of screen, below title

**Design:**
- Dropdown button: "All Folders (57)" with down arrow icon
- Shows current folder name and photo count
- Tapping opens bottom sheet with folder list

### Folder List Bottom Sheet

**Content:**
- "All Folders (57)" — Default, shows all
- "Camera (45)" — Photos from Camera folder
- "Screenshots (12)" — Photos from Screenshots folder
- "Downloads (8)" — etc.

**Sorting:** By photo count (descending)

**Style:** Material Design 3 bottom sheet

---

## Components

### Files

- **MODIFY:** `hooks/useMediaLibrary.ts` — Extract folder name from asset
- **MODIFY:** `app/(tabs)/index.tsx` — Add folder dropdown and filter
- **MODIFY:** `lib/database/dao.ts` — Add `getFolderStats()` query
- **MODIFY:** `lib/database/schema.ts` — Ensure `folderId` in photos table (already exists!)

### Folder Detection

```typescript
// Extract folder name from MediaAsset
function getFolderName(asset: MediaAsset): string | null {
  // expo-media-library provides albumId
  // Can query album name via getAlbumAsync
  return asset.albumId || null;
}
```

### Database Query

```typescript
// Get folder statistics
export function getFolderStats(db: SQLiteDatabase): FolderStat[] {
  const query = `
    SELECT
      f.id,
      f.name,
      COUNT(p.id) as photoCount
    FROM folders f
    LEFT JOIN photos p ON p.folderId = f.id
    GROUP BY f.id
    ORDER BY photoCount DESC
  `;
  return db.getAllSync(query);
}
```

---

## Test Flows

### Positive Flow — Filter by Folder

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Device has photos in multiple folders | Camera, Screenshots, etc. |
| 2 | Open app | All photos shown |
| 3 | Tap "All Folders" dropdown | List shows folders with counts |
| 4 | Tap "Camera" | Grid filters to Camera photos only |
| 5 | Upload button | Still works, uploads selected Camera photos |

### Positive Flow — Cloud Photos by Folder

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload photos from different folders | Mixed upload |
| 2 | Go to Cloud Photos | All uploaded photos shown |
| 3 | Tap folder dropdown | See folders from uploaded photos |
| 4 | Filter by "Screenshots" | Only screenshots shown |

### Edge Case — No Folder

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Photo has no folder metadata | `folderId = null` |
| 2 | View in folder list | Shows as "Uncategorized" |

---

## Definition of Done

- [x] Feature doc created and reviewed
- [x] Implementation plan created
- [x] Folder extraction from MediaAsset working
- [x] Folder dropdown UI added to Device Photos
- [x] Bottom sheet shows folder list with counts
- [x] Filter by folder works
- [x] "All Folders" shows all photos
- [ ] Folder info saved on upload
- [ ] Cloud Photos can filter by folder
- [x] Material Design 3 styling
- [ ] Device tested on Android and iOS

---

## Notes

- Use `expo-media-library` album APIs for folder detection
- Future: Allow creating custom folders/albums
- Future: Move photos between folders
- Future: Folder-based auto-upload rules
