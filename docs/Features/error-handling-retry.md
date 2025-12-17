# Feature: Error Handling & Retry Logic

**Status:** Planning
**Owner:** User
**Related Features:** device-photos.md, upload-progress-ui.md

---

## Purpose

Make photo uploads reliable and resilient by automatically retrying failed uploads with exponential backoff. Handle network errors, rate limits, and transient failures gracefully. Provide clear feedback to users about what failed and why, with options to retry manually.

---

## Business Rules

1. **Automatic Retry:** Retry failed uploads up to 3 times with exponential backoff
2. **Exponential Backoff:** Wait 2s → 4s → 8s between retries
3. **Rate Limit Handling:** Detect Telegram rate limits (429), pause and retry after delay
4. **Network Error Retry:** Auto-retry on network errors (timeout, connection lost)
5. **Permanent Failures:** Don't retry on 4xx errors (except 429), show clear error
6. **Manual Retry:** User can manually retry all failed uploads from toast
7. **Preserve Queue:** Failed uploads stay in queue until manually dismissed

---

## Error Categories

### Retriable Errors (Auto-retry)
- Network timeout
- Connection lost
- Telegram rate limit (429 Too Many Requests)
- Server errors (5xx)

### Non-Retriable Errors (Manual retry only)
- Invalid bot token (401 Unauthorized)
- File too large (400 Bad Request)
- Channel not found (400 Bad Request)
- Bot not admin in channel (403 Forbidden)

---

## Main Flow

### Flow 1: Transient Network Error

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start upload batch (5 photos) | Upload begins |
| 2 | Photo 3 fails (network timeout) | Toast shows "Uploading 3 of 5 (retrying...)" |
| 3 | Wait 2 seconds | Automatic retry 1 |
| 4 | Retry succeeds | Continue to photo 4 |
| 5 | All complete | Success toast "5 photos uploaded" |

### Flow 2: Rate Limit Hit

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload 10 photos quickly | First 5 succeed |
| 2 | Telegram returns 429 | Detect rate limit |
| 3 | Parse retry-after header | Wait X seconds |
| 4 | Automatic retry after delay | Upload resumes |
| 5 | Complete batch | Success toast |

### Flow 3: Permanent Error

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload with invalid token | 401 Unauthorized |
| 2 | Error categorized as non-retriable | No auto-retry |
| 3 | Toast shows error | "1 of 5 failed: Invalid bot token" |
| 4 | User taps "Retry" | Manual retry attempted |
| 5 | Error persists | Clear error message shown |

### Flow 4: Max Retries Exceeded

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload fails (network error) | Retry 1 (wait 2s) |
| 2 | Retry 1 fails | Retry 2 (wait 4s) |
| 3 | Retry 2 fails | Retry 3 (wait 8s) |
| 4 | Retry 3 fails | Mark as failed, show error |
| 5 | Toast shows | "1 of 5 failed" with Retry button |

---

## UI Components

### Enhanced Error Toast

**States:**

1. **Retrying:**
   - Text: "Uploading X of Y (retrying...)"
   - Progress bar: Indeterminate spinner
   - No action buttons (auto-retry in progress)

2. **Failed (with retry count):**
   - Text: "X of Y photos failed"
   - Details: "Network error (tried 3 times)"
   - Action: "Retry All" button

3. **Permanent Error:**
   - Text: "Upload failed"
   - Details: Specific error message
   - Action: "Fix in Settings" or "Dismiss"

---

## Components

### Files

- **MODIFY:** `hooks/useUpload.ts` — Add retry logic with exponential backoff
- **MODIFY:** `components/UploadToast.tsx` — Show retry state and count
- **NEW:** `lib/utils/retry.ts` — Reusable retry logic with exponential backoff

### Retry Logic

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries) break;

      // Check if error is retriable
      if (!isRetriable(error)) throw error;

      // Exponential backoff: 2s, 4s, 8s
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError!;
}
```

### Error Classification

```typescript
function isRetriable(error: any): boolean {
  // Network errors
  if (error.message?.includes('timeout')) return true;
  if (error.message?.includes('network')) return true;

  // Telegram API errors
  if (error.error_code === 429) return true; // Rate limit
  if (error.error_code >= 500) return true;  // Server error

  // Non-retriable: 4xx (except 429)
  if (error.error_code >= 400 && error.error_code < 500) return false;

  return false;
}
```

---

## Test Flows

### Positive Flow — Auto-retry Success

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate network error on upload | Upload fails |
| 2 | **Expected:** Auto-retry after 2s | Retry 1 starts |
| 3 | Simulate network restored | Retry succeeds |
| 4 | Upload completes | Success toast |

### Positive Flow — Rate Limit Handling

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload 20 photos rapidly | First N succeed |
| 2 | Telegram returns 429 | Detect rate limit |
| 3 | Parse retry-after (e.g., 30s) | Wait 30 seconds |
| 4 | **Expected:** Auto-resume after 30s | Upload continues |

### Negative Flow — Max Retries

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate persistent network error | Upload fails |
| 2 | Retry 1 fails (wait 2s) | Retry 2 starts |
| 3 | Retry 2 fails (wait 4s) | Retry 3 starts |
| 4 | Retry 3 fails (wait 8s) | Mark as failed |
| 5 | Error toast shows | "1 photo failed (tried 3 times)" |

### Negative Flow — Non-Retriable Error

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload with invalid token | 401 Unauthorized |
| 2 | **Expected:** No auto-retry | Error toast shows immediately |
| 3 | Toast message | "Invalid bot token" |
| 4 | Action button | "Fix in Settings" |

---

## Definition of Done

- [x] Feature doc created and reviewed
- [x] Implementation plan created
- [x] Retry utility function created with exponential backoff
- [x] Error classification function (retriable vs non-retriable)
- [x] Retry logic integrated into useUpload hook
- [x] Toast shows retry state with count
- [x] Auto-retry works for network errors
- [x] Rate limit handling (429) with retry-after
- [x] Max retries limit enforced (3 attempts)
- [x] Non-retriable errors don't auto-retry
- [ ] Manual retry button works
- [ ] Device tested with network interruptions

---

## Notes

- Keep retry attempts visible to user (transparency)
- Rate limit: Respect `retry_after` from Telegram API response
- Future: Save failed uploads to database, retry later
- Future: Batch retry optimization (group retries)
- Consider haptic feedback on retry success
