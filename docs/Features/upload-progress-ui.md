# Feature: Upload Progress Tracking UI

**Status:** Planning
**Owner:** User
**Related ADRs:** ADR-001 (Telegram Cloud Storage)
**Related Features:** device-photos.md

---

## Purpose

Display real-time upload progress to users as they back up photos to Telegram. Provide immediate feedback, show upload status for each photo, and celebrate success when uploads complete. The `useUpload` hook already tracks all progress data—this feature makes it visible to users.

---

## Business Rules

1. **Immediate Feedback:** Show upload start within 400ms (Doherty Threshold)
2. **Per-Photo Progress:** Display individual photo progress (0-100%)
3. **Batch Upload Support:** Handle multiple photos uploading simultaneously
4. **Success Celebration:** Satisfying completion animation (Peak-End Rule)
5. **Error Visibility:** Show which photos failed with clear error messages
6. **Non-Blocking:** User can continue browsing while uploads happen
7. **Persistent During Upload:** Progress persists across screen navigation

---

## Main Flow

### Flow 1: Single Photo Upload

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | User selects 1 photo, taps Upload | Immediately show toast "Uploading 1 photo" |
| 2 | Upload starts | Progress bar animates 0% → 100% |
| 3 | Upload completes | Success toast "1 photo uploaded" with checkmark icon |
| 4 | After 3 seconds | Toast auto-dismisses |

### Flow 2: Batch Upload (3+ photos)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | User selects 5 photos, taps Upload | Toast shows "Uploading 5 photos" |
| 2 | Photos upload sequentially | Progress updates "Uploading 2 of 5 (40%)" |
| 3 | All complete | Success toast "5 photos uploaded ✓" |
| 4 | After 3 seconds | Toast auto-dismisses |

### Flow 3: Upload with Errors

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select 3 photos, 1 fails network error | Progress updates normally for successful ones |
| 2 | Failed photo detected | Error toast "1 of 3 photos failed" with retry button |
| 3 | Tap retry | Re-attempt upload of failed photo |
| 4 | All succeed or max retries | Final toast "2 of 3 uploaded" (if 1 still failed) |

---

## UI Components

### Toast Notification (Primary)

**Position:** Bottom of screen (above nav bar)
**Style:** Material Design 3 snackbar

**States:**

1. **Uploading:**
   - Icon: Animated upload arrow (↑)
   - Text: "Uploading [X] of [Y]"
   - Progress bar: 0-100%
   - Action: Cancel button

2. **Success:**
   - Icon: Green checkmark with scale animation
   - Text: "[X] photos uploaded"
   - Duration: 3 seconds auto-dismiss
   - Action: View in Cloud (optional)

3. **Error:**
   - Icon: Warning triangle
   - Text: "[X] of [Y] photos failed"
   - Action: Retry button or Dismiss

### Progress Bar (Within Toast)

- Thin progress indicator (4dp height)
- Animated with spring physics
- Color: Primary color
- Indeterminate when preparing, determinate during upload

### Optional: Progress Overlay (Alternative to Toast)

For batch uploads (5+ photos), show floating progress card:
- Thumbnail of current uploading photo
- Progress bar
- "[X] of [Y] uploaded"
- Minimize button (collapse to toast)

---

## Design Guidelines Applied

### UX Laws

- **Doherty Threshold:** Feedback within 400ms of upload start
- **Peak-End Rule:** Success celebration at end (checkmark animation)
- **Von Restorff Effect:** Use color to differentiate states (green=success, red=error)
- **Aesthetic-Usability Effect:** Smooth animations make perceived upload faster

### Visual Design

- **Material Design 3:** Use `colors.primary` for progress, `colors.error` for failures
- **Typography:** 14px body text, 12px secondary (count)
- **Animations:**
  - Progress bar: Linear interpolation
  - Success checkmark: Scale 0 → 1.2 → 1.0 with spring
  - Toast slide: Slide up from bottom (300ms)
- **Spacing:** 16dp padding, 8dp between elements

### Accessibility

- Minimum toast height: 48dp
- Clear progress text (not icon-only)
- Success/error states distinguishable without color (icons + text)

---

## Components

### Files

- **NEW:** `components/UploadToast.tsx` — Toast notification component
- **NEW:** `components/UploadProgressBar.tsx` — Reusable progress bar
- **MODIFY:** `app/(tabs)/index.tsx` — Display toast when `isUploading` or `uploadProgress` changes
- **MODIFY:** `hooks/useUpload.ts` — Return aggregated progress stats

### State from useUpload

Already available:
```typescript
const {
  uploadProgress, // Map<photoId, { progress, status, error }>
  isUploading,
  uploadPhotos
} = useUpload();
```

Need to add:
```typescript
const stats = {
  total: uploadProgress.size,
  completed: Array.from(uploadProgress.values()).filter(p => p.status === 'completed').length,
  failed: Array.from(uploadProgress.values()).filter(p => p.status === 'failed').length,
  currentProgress: /* average progress */
};
```

---

## Test Flows

### Positive Flow — Success Toast

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select 1 photo, tap Upload | Toast appears within 400ms |
| 2 | Observe progress | Bar animates 0% → 100% smoothly |
| 3 | Upload completes | Success toast with checkmark appears |
| 4 | Wait 3 seconds | Toast auto-dismisses |

### Positive Flow — Navigation During Upload

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start uploading 5 photos | Toast shows progress |
| 2 | Switch to Settings tab | Toast remains visible |
| 3 | Return to Photos tab | Toast still shows progress |
| 4 | Upload completes | Success toast appears |

### Negative Flow — Network Error

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start upload, disconnect WiFi | Upload fails |
| 2 | Error detected | Error toast with "1 photo failed" |
| 3 | Reconnect WiFi, tap Retry | Upload retries |
| 4 | Upload succeeds | Success toast appears |

### Edge Case — Cancel Upload

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start uploading 10 photos | Toast shows "Uploading 1 of 10" |
| 2 | Tap Cancel in toast | Upload stops immediately |
| 3 | Toast updates | "Upload cancelled" toast, auto-dismiss |

---

## Definition of Done

- [x] Feature doc created and reviewed
- [x] Implementation plan created
- [x] UploadToast component built with 3 states (uploading, success, error)
- [x] UploadProgressBar component built
- [x] useUpload hook returns aggregated stats
- [x] Toast appears on upload start (<400ms)
- [x] Progress updates smoothly during upload
- [x] Success animation implemented (checkmark scale)
- [x] Error state with retry button works
- [x] Toast auto-dismisses after 3 seconds
- [x] Toast persists across tab navigation
- [x] Follows Material Design 3 styling
- [ ] Device tested on Android and iOS

---

## Notes

- Keep toast animations lightweight (avoid jank)
- Consider using react-native-toast-message for toast management
- Success toast could navigate to Cloud tab on tap (optional)
- Future: Add "View Details" to see per-photo upload status
