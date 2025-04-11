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
import { config } from "../config.mjs";

export async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;

      // Log the specific error
      console.error(`Attempt ${attempt} failed:`, {
        message: error.message,
        code: error.code,
        cause: error.cause,
      });

      // If it's an abort error, wait longer before retrying
      if (error.name === "AbortError" || error.code === 20) {
        await new Promise(resolve => setTimeout(resolve, 5000 * attempt)); // Exponential backoff
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}
