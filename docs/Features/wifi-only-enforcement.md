# Feature: WiFi-Only Enforcement

**Status:** Planning
**Owner:** User
**Related Features:** device-photos.md, settings.md

---

## Purpose

Respect the user's WiFi-only preference by checking network type before uploading photos. Prevent unwanted cellular data usage and give users control over when uploads happen. The Settings toggle already exists—this feature enforces it.

---

## Business Rules

1. **Only Enforce If Enabled:** Check only when `settings.wifiOnly = true`
2. **Block Cellular Uploads:** Prevent upload start if on cellular and WiFi-only enabled
3. **Allow WiFi/Ethernet:** Allow uploads on WiFi, Ethernet, or unknown (better safe than sorry)
4. **Clear User Feedback:** Show dialog explaining why upload was blocked
5. **Check Once Per Batch:** Check network type at upload start, not per-photo

---

## Main Flow

### Flow 1: WiFi-Only Enabled, User on WiFi

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | WiFi-only enabled in Settings | Toggle shows ON |
| 2 | User on WiFi network | Network type: WIFI |
| 3 | Select photos, tap Upload | Upload starts normally |
| 4 | Photos upload | Progress toast shows |

### Flow 2: WiFi-Only Enabled, User on Cellular

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | WiFi-only enabled in Settings | Toggle shows ON |
| 2 | User on cellular (4G/5G) | Network type: CELLULAR |
| 3 | Select photos, tap Upload | Alert dialog appears |
| 4 | Dialog shows | "WiFi-only enabled. Connect to WiFi to upload." |
| 5 | User taps OK | Return to photo grid, selection maintained |

### Flow 3: WiFi-Only Disabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | WiFi-only disabled in Settings | Toggle shows OFF |
| 2 | User on any network | Network type: CELLULAR/WIFI/UNKNOWN |
| 3 | Select photos, tap Upload | Upload starts (no check) |

---

## UI Components

### Alert Dialog

**Trigger:** Upload attempted on cellular when WiFi-only enabled

**Content:**
- Title: "WiFi Required"
- Message: "WiFi-only uploads is enabled. Please connect to WiFi and try again."
- Icon: WiFi symbol with slash (optional)
- Buttons:
  - **Primary:** "OK" (dismiss, keep selection)
  - **Secondary:** "Turn Off WiFi-Only" (navigate to Settings, optional)

**Design:** Material Design 3 alert dialog

---

## Components

### Files

- **INSTALL:** `expo-network` package for network type detection
- **MODIFY:** `hooks/useUpload.ts` — Add network check before upload
- **MODIFY:** `app/(tabs)/index.tsx` — Handle blocked upload alert (optional, can be in hook)

### Network Check Logic

```typescript
import * as Network from 'expo-network';

async function checkNetworkAllowed(wifiOnly: boolean): Promise<boolean> {
  if (!wifiOnly) return true; // WiFi-only disabled, allow all

  const networkState = await Network.getNetworkStateAsync();

  // Allow WiFi, Ethernet, or Unknown (safer to allow than block)
  if (networkState.type === Network.NetworkStateType.WIFI ||
      networkState.type === Network.NetworkStateType.ETHERNET ||
      networkState.type === Network.NetworkStateType.UNKNOWN) {
    return true;
  }

  // Block cellular
  return false;
}
```

---

## Test Flows

### Positive Flow — WiFi Allowed

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable WiFi-only in Settings | Toggle ON |
| 2 | Connect to WiFi | Network shows WiFi icon |
| 3 | Select 3 photos, tap Upload | Upload starts immediately |
| 4 | Observe | Progress toast shows |

### Negative Flow — Cellular Blocked

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable WiFi-only in Settings | Toggle ON |
| 2 | Disconnect WiFi (use cellular) | Network shows 4G/5G |
| 3 | Select photos, tap Upload | Alert shows "WiFi Required" |
| 4 | Tap OK | Return to photo grid, selection still active |
| 5 | Connect to WiFi | WiFi connects |
| 6 | Tap Upload again | Upload starts successfully |

### Edge Case — WiFi-Only Disabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | WiFi-only disabled in Settings | Toggle OFF |
| 2 | On cellular network | 4G/5G active |
| 3 | Select photos, tap Upload | Upload starts (no check) |
| 4 | Photos upload normally | Uses cellular data |

### Edge Case — Unknown Network

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable WiFi-only | Toggle ON |
| 2 | Network type returns UNKNOWN | Rare edge case |
| 3 | Tap Upload | Upload allowed (safer to allow) |

---

## Definition of Done

- [x] Feature doc created and reviewed
- [x] Implementation plan created
- [x] expo-network installed
- [x] Network check function implemented
- [x] Check integrated into useUpload hook
- [x] Alert dialog shows on cellular block
- [x] WiFi uploads work normally
- [x] Cellular uploads blocked when WiFi-only enabled
- [x] WiFi-only disabled allows all networks
- [ ] Device tested on Android and iOS with WiFi/cellular switching

---

## Notes

- Use `expo-network` for cross-platform network detection
- Safer to allow UNKNOWN type (edge case handling)
- Alert should keep photo selection active (don't clear on cancel)
- Future: Show network status indicator in UI (optional)
- Future: Queue uploads to retry when WiFi connects (P1, separate feature)
