/* eslint-disable */
// src/lib/safeFetch.ts - Fetch with retries and timeout
interface SafeFetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

async function safeFetch(url: string, options: SafeFetchOptions = {}): Promise<Response> {
  const {
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Don't retry on 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry on 5xx errors (server errors)
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`[safeFetch] Attempt ${attempt + 1}/${retries} failed:`, error);

      // Don't retry on last attempt
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}

export default safeFetch;
