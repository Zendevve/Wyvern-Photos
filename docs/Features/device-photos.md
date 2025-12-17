# Feature: Device Photos

**Status:** In Development
**Owner:** User
**Related ADRs:** ADR-001 (Telegram Cloud Storage)

---

## Purpose

Display photos from the device's media library in a grid layout, allowing users to view, select, and upload photos to Telegram cloud storage.

---

## Business Rules

1. **Permission Required:** App must request and obtain media library permission before accessing photos
2. **Photo Access:** Only photos and videos from the device's media library are displayed
3. **Selection Mode:** Users can select multiple photos for batch upload
4. **Upload Tracking:** Photos are marked with a cloud badge after successful upload
5. **Pagination:** Photos load progressively to handle large libraries efficiently

---

## Main Flow

### View Device Photos

1. User opens the app (defaults to Device Photos tab)
2. System checks media library permission
3. If permission granted:
   - Load first batch of photos (30 items)
   - Display in 3-column grid
   - Show total photo count in stats header
4. If permission denied:
   - Show permission request screen
   - User taps "Grant Access"
   - System requests permission
   - On grant, load and display photos

### Select and Upload Photos

1. User long-presses a photo
2. System enters selection mode
3. Selection header appears with count and controls
4. User taps additional photos to select/deselect
5. User can tap "Select All" to select entire library
6. Upload FAB appears showing count
7. User taps Upload button
8. **[TODO]** System uploads selected photos to Telegram
9. **[TODO]** Photos marked with cloud badge on success

---

## Components

### Files

- **Screen:** `app/(tabs)/index.tsx` — Main device photos screen
- **Component:** `components/PhotoGrid.tsx` — Reusable photo grid
- **Hook:** `hooks/useMediaLibrary.ts` — Media library access
- **Database:** `lib/database/schema.ts` — Photo tracking

### Key Data Structures

```typescript
interface MediaAsset {
  id: string;
  uri: string;
  filename: string;
  mediaType: 'photo' | 'video';
  width: number;
  height: number;
  createdTime: number;
  modificationTime: number;
  duration?: number; // For videos
}
```

---

## Test Flows

### Positive Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Launch app with permission granted | Photo grid displays with device photos |
| 2 | Scroll to bottom | Additional photos load automatically |
| 3 | Long-press photo | Selection mode activates, photo selected |
| 4 | Tap 5 more photos | All 6 photos show selected state |
| 5 | Tap Upload button | **[TODO]** Upload begins |

### Negative Flow — No Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Launch app without permission | Permission screen displays |
| 2 | Deny permission | Error state shows |
| 3 | Grant permission via settings | App requests to restart or retry |

### Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Empty photo library | Show "No photos found" message |
| Very large library (10,000+ photos) | Virtualized list handles smoothly |
| Photo deleted from device | Grid updates, photo removed |
| User selects all then cancels | Selection mode exits |

---

## Definition of Done

- [x] Permission handling (request, grant, deny)
- [x] Photo grid with virtualized scrolling
- [x] Selection mode with multi-select
- [x] Upload FAB with count display
- [x] Stats header showing total count
- [ ] Actual upload to Telegram functionality
- [ ] Upload badge display for uploaded photos
- [ ] Integration tests for permission flows
- [ ] Device tests on Android and iOS

---

## Notes

- Grid uses FlatList with `getItemLayout` for performance
- 3-column layout optimized for mobile displays
- Photos load in batches of 20 after initial 30
- Selection state persists during scroll
