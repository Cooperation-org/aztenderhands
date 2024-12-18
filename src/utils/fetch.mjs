/**
 * Configuration options for retry behavior
 * @typedef {Object} RetryConfig
 * @property {number} [maxRetries=3] - Maximum number of retry attempts
 * @property {number} [initialDelay=1000] - Initial delay between retries in milliseconds
 * @property {number} [maxDelay=5000] - Maximum delay between retries in milliseconds
 * @property {number} [backoffFactor=2] - Multiplier for exponential backoff
 * @property {number} [timeout=5000] - Request timeout in milliseconds
 * @property {number[]} [retryOnStatusCodes=[408, 429, 500, 502, 503, 504]] - HTTP status codes that trigger a retry
 * @property {string[]} [retryOnErrors=['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EPIPE']] - Error codes that trigger a retry
 */

/**
 * Performs a fetch request with configurable retry behavior for failed requests
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} [options={}] - Standard fetch options
 * @param {RetryConfig} [retryConfig={}] - Configuration for retry behavior
 *
 * @returns {Promise<Response>} The fetch response if successful
 *
 * @throws {Error} When all retry attempts fail, with details about the last error
 * @throws {Error} When a non-retryable error occurs
 *
 * @example
 * // Basic usage
 * const response = await fetchWithRetry('https://api.example.com/data');
 *
 * @example
 * // Advanced usage with custom options
 * const response = await fetchWithRetry('https://api.example.com/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ key: 'value' }),
 *   headers: { 'Content-Type': 'application/json' }
 * }, {
 *   maxRetries: 5,
 *   timeout: 10000,
 *   initialDelay: 1000,
 *   maxDelay: 10000
 * });
 */
export async function fetchWithRetry(url, options = {}, retryConfig = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 5000,
    backoffFactor = 2,
    timeout = 5000,
    retryOnStatusCodes = [408, 429, 500, 502, 503, 504],
    retryOnErrors = ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EPIPE"],
  } = retryConfig;

  // Add abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      // Clear timeout if request succeeds
      clearTimeout(timeoutId);

      // Check if response status is in retryOnStatusCodes
      if (retryOnStatusCodes.includes(response.status)) {
        throw new Error(`HTTP status ${response.status}`);
      }

      return response;
    } catch (error) {
      // Clear timeout if request fails
      clearTimeout(timeoutId);

      lastError = error;
      const errorCode = error.cause?.code || error.code;

      // Log detailed error information
      console.error(`Attempt ${attempt + 1} failed:`, {
        message: error.message,
        code: errorCode,
        cause: error.cause,
      });

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} retries. Last error: ${error.message}`);
      }

      // Check if error should trigger a retry
      const shouldRetry = retryOnErrors.includes(errorCode);
      if (!shouldRetry) {
        throw error;
      }

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffFactor, maxDelay);

      console.log(`Retrying in ${delay}ms... (Attempt ${attempt + 1} of ${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
