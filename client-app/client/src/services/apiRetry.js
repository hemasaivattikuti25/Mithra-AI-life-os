import { apiFetch } from './firebaseClient';

/**
 * Fetch with automatic retry on network failure or server error.
 * Retries up to maxRetries times with exponential backoff.
 */
export async function apiFetchWithRetry(path, options = {}, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiFetch(path, options);
    } catch (err) {
      lastError = err;
      const isRetryable = !err.status || err.status >= 500 || err.name === 'AbortError';
      const isMutation = options.method && options.method !== 'GET';

      // Don't retry mutations (POST/PUT/DELETE) — risk of double-write
      if (!isRetryable || isMutation) break;

      const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
