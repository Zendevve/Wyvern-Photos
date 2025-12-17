# Feature: Photo Viewer

**Status:** In Development
**Owner:** User
**Related ADRs:** N/A

---

## Purpose

Display individual photos in full-screen mode with pinch-to-zoom, pan, and double-tap gestures for detailed viewing.

---

## Business Rules

1. **Full-Screen Display:** Photo fills screen while maintaining aspect ratio
2. **Zoom on Double-Tap:** Double-tap zooms to 2x, second double-tap resets
3. **Pinch to Zoom:** Pinch gesture allows freeform zoom from 1x to unlimited
4. **Pan When Zoomed:** Pan only works when zoom level > 1x
5. **Auto-Reset:** Zoom resets to 1x when zooming below 1x

---

## Main Flow

### View Single Photo

1. User taps photo in grid
2. System navigates to `/viewer` route with photo URI and dimensions
3. Photo displays full-screen with black background
4. Photo centered and scaled to fit screen

### Zoom In

1. User double-taps photo
2. Photo animates to 2x zoom at center
3. User can pan to view different parts
4. User double-taps again
5. Photo resets to 1x zoom

### Pinch Zoom

1. User pinches out on photo
2. Photo scales based on pinch gesture
3. User pans while zoomed
4. User pinches in below 1x
5. Photo resets to 1x automatically

---

## Components

### Files

- **Screen:** `app/viewer.tsx` — Full-screen photo viewer
- **Component:** `components/ZoomableImage.tsx` — Zoomable image with gestures
- **Dependencies:** react-native-gesture-handler, react-native-reanimated

### Gesture Handling

- **Double Tap:** Toggles between 1x and 2x zoom
- **Pinch:** Scales image based on pinch amount
- **Pan:** Translates image when zoomed
- **Simultaneous:** All gestures work simultaneously

---

## Test Flows

### Positive Flow — View and Zoom

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap photo in grid | Photo opens full-screen |
| 2 | Double-tap photo | Photo zooms to 2x smoothly |
| 3 | Pan in any direction | Photo moves, stays within bounds |
| 4 | Double-tap again | Photo resets to 1x |

### Positive Flow — Pinch Zoom

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Pinch out on photo | Photo scales larger than 2x |
| 2 | Pan around | Photo translates smoothly |
| 3 | Pinch in to less than 1x | Photo resets to 1x |

### Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Very wide photo (panorama) | Scales to fit width, black bars on top/bottom |
| Very tall photo (portrait) | Scales to fit height, black bars on sides |
| Rapid zoom gestures | Animations don't conflict, smooth transitions |
| Pan beyond image bounds | Image snaps back to boundary |

---

## Definition of Done

- [x] Full-screen photo display
- [x] Double-tap to zoom (1x ↔ 2x)
- [x] Pinch to zoom (freeform)
- [x] Pan when zoomed
- [x] Auto-reset on zoom < 1x
- [x] Smooth animations with reanimated
- [ ] Swipe to navigate between photos
- [ ] Photo metadata display (optional)
- [ ] Share button
- [ ] Delete button
- [ ] Device tests for gesture responsiveness

---

## Notes

- Uses `react-native-reanimated` for 60fps animations
- Gestures run on UI thread (worklets)
- Image dimensions passed via route params for aspect ratio calculation
- Black background provides contrast for any photo type
- No bounds checking on pan currently (feature enhancement needed)
