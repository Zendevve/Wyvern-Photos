// Retry utility with exponential backoff for handling transient errors

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retriable (network errors, rate limits, server errors)
 */
export function isRetriableError(error: any): boolean {
  // Network errors
  if (error.message?.toLowerCase().includes('timeout')) return true;
  if (error.message?.toLowerCase().includes('network')) return true;
  if (error.message?.toLowerCase().includes('fetch failed')) return true;

  // Telegram API errors from response
  const errorCode = error.error_code || error.code;

  if (errorCode === 429) return true; // Rate limit - always retriable
  if (errorCode >= 500 && errorCode < 600) return true; // Server errors

  // Non-retriable: 4xx client errors (except 429)
  if (errorCode >= 400 && errorCode < 500) return false;

  // Default: retry unknown errors (safer)
  return true;
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @param baseDelay Base delay in milliseconds (default: 2000ms = 2s)
 * @returns Result of successful function call
 * @throws Last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retriable
      if (!isRetriableError(error)) {
        throw error; // Don't retry non-retriable errors
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`[retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError;
}
